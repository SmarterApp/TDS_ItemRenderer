/*
*   Client side latency collector.  
*   
*   1. Latencies are collected on page loads and page navigation (for views) and periodically reported to server by a poller
*   2. Collections are done in 3 piles
*       2a. In Progress collection : These are records that are incomplete and still waiting on events to complete them. Once an event triggers their completion, the migrate to the next pile
*       2b. Completed collection: These are records that are complete and ready for reporting. When they are picked for reporting, they migrate to the next pile
*       2c. Reporting collection: These are records that are in the process of being reported. Once they are reported, they are deleted 
*   2. Records migrate from inprogress to completed through events, they migrate from collected to reported (and further) by the poller
*   3. Records can be aggregated (records of the same type that can be merged together into 1) as they wait in the completed pile
* 
*   For a session, we expect a record per page that tracks the load time for that page, multiple records per page that track the visit times by page
*
*/

TestShell.Audit = {
    
    _inProgressRecords: {},  // These are incomplete records that raw events are still updating. These are indexed by pageId
    _completedRecords: [],   // These are completed records that are ready for reporting        
    _reportingRecords: [],   // These are records that are in process of being reported to the backend
    
    _aggregateRecord: function (newRecord, existingRecords) {
        var existingRecord = Util.Array.find(existingRecords, function (record, index, list) {
            return (record.pageId == newRecord.pageId && record.recordType == newRecord.recordType);
        });
        if (existingRecord != null) {
            existingRecord.aggregate(newRecord);
        } else {
            existingRecords.push(newRecord);
        }
    },
        
    // All events are reported here. 
    logAuditEvent: function (event) {

        if (this._inProgressRecords[event.pageId] == null) {
            this._inProgressRecords[event.pageId] = [];
        }
        
        // look for events that trigger the creation of records
        if (event.eventType == 'content-init') {            
            this._inProgressRecords[event.pageId].push(new TestShell.Audit.PageLoadRecord(event.pageId));
        } else if (event.eventType == 'page-requested') {
            this._inProgressRecords[event.pageId].push(new TestShell.Audit.PageVisitRecord(event.pageId));
        }
        
        // iterate the array backwards to have the "records" process the event. We do this backwards because we want the latest records to respond to the events first
        var records = this._inProgressRecords[event.pageId];
        for (var i = records.length-1; i >= 0; i--) {
            if (!records[i].process(event)) {               
                break;  // returning false breaks out of the loop    
            }
        }
        
        // iterate the transient records and move the completed ones to the _completedRecords array
        var index = this._inProgressRecords[event.pageId].length;
        while (index--) {
            var record = this._inProgressRecords[event.pageId][index];
            if (record.isComplete) {                
                this._inProgressRecords[event.pageId].splice(index, 1);
                this.logAuditRecord(record);
            }
        }                                    
    },

    // These are completed audit Records. Some may need to aggregate with other unreported records
    logAuditRecord: function (auditRecord) {
        if (!(auditRecord instanceof TestShell.Audit.Record))
            throw new TypeError("argument passed in is not of type TestShell.Audit.Record");
        
        if (!auditRecord.isComplete)
            throw new TypeError("Audit record is not complete");

        if (auditRecord._performAggregation) {
            this._aggregateRecord(auditRecord, this._completedRecords);
        } else {
            this._completedRecords.push(auditRecord);    
        }                
    },   

    // Records that need to be sent to the server and this clears the pending latency records.
    recordsToReport: function() {        
        // Move all the completed records over to the ready for reporting pile
        var records = this._completedRecords.splice(0, this._completedRecords.length);
        
        Util.Array.each(records, function (record, index, array){
            if (record._performAggregation) {
                this._aggregateRecord(record, this._reportingRecords);
            } else {
                this._reportingRecords.push(record);
            }
        }, this);

        return this._reportingRecords;
    },
    
    markAsReported: function () {
        // Design Note: We splice here instead of using a "isReported" marker on the record and retaining all records so that we dont run into a memory leak 
        this._reportingRecords.splice(0, this._reportingRecords.length);
    },
    
    serializeToJSON: function (records) {
        // make sure the pageNum is included for each record because without it, this record cannot be posted to the DB       
        Util.Array.each(records, function(record) {
            if (!record.pageNum) {
                var testShellPage = TestShell.PageManager.get(record.pageId);
                record.pageNum =  testShellPage != null ? testShellPage.pageNum : -1;
            }
        });

        // split the records into page loads and page visits
        var obj = {
            pageLoads: Util.Array.filter(records, function(record) { return record instanceof TestShell.Audit.PageLoadRecord; }),
            pageVisits: Util.Array.filter(records, function(record) { return record instanceof TestShell.Audit.PageVisitRecord; })
        };               

        //custom JSON converter mainly to deal with dates and members that should be skipped
        var converter = function(key, value) {            
            if (value instanceof Date)
                return '\/Date(' + value.toJSON() + ')\/';
            if (typeof(key) == 'string') {
                if (key.indexOf('_') == 0) return undefined; // exclude private attributes from serialization
                if (Util.String.endsWith(key, 'Date') && Util.String.endsWith(value, 'Z'))  // This is kind of hack. Dates within the object are converted to strings before this converter is invoked
                    return '\/Date(' + Date.parse(value) + ')\/';
            }
            return value;
        };

        // Hack for FF3.6 browsers. JSON.Stringify will not use the replacement values provided through the converter. So here, we hard replace the values in the object going into the stringify
        //https://bugzilla.mozilla.org/show_bug.cgi?id=543507
        var jsonConverterHack = function (object) {            
            // process pageLoads
            for (var i = 0; object.pageLoads && i < object.pageLoads.length; i++) {
                var pageLoad = object.pageLoads[i];
                for (var prop in pageLoad) {
                    pageLoad[prop] = (pageLoad[prop] instanceof Date) ? converter(prop, pageLoad[prop].toJSON()): converter(prop, pageLoad[prop]);                    
                }
            }
            // process pageVisits
            for (var i = 0; object.pageVisits && i < object.pageVisits.length; i++) {
                var pageVisit = object.pageVisits[i];
                for (var prop in pageVisit) {
                    pageVisit[prop] = (pageVisit[prop] instanceof Date) ? converter(prop, pageVisit[prop].toJSON()) : converter(prop, pageVisit[prop]);
                }
            }

            return object;
        };
        
        return Util.Browser.isFirefox() && Util.Browser.getFirefoxVersion() < 4.0 ? JSON.stringify(jsonConverterHack(obj)) : JSON.stringify(obj, converter);
    },
    
    _teardown: function() {
        this._inProgressRecords = {}; 
        this._completedRecords = []; 
        this._reportingRecords = [];
    }
};

/**************************************** Events ****************************************/

TestShell.Audit.Event = function (pageId, eventType, contentPage) {
    this.pageId = pageId;
    this.eventType = eventType;
    this.contentPage = contentPage;
};

TestShell.Audit.ToolUsageEvent = function (pageId, contentPage, accType, accCode) {
    // Chain the constructors
    this.constructor.superclass.constructor.call(this, pageId, 'toolUsage', contentPage);
    this.accType = accType;
    this.accCode = accCode;
};
YAHOO.lang.extend(TestShell.Audit.ToolUsageEvent, TestShell.Audit.Event);

/**************************************** Events ****************************************/

/**************************************** Latency Records ****************************************/

TestShell.Audit.Record = function(type, pageId) {
    this.recordType = type;
    this.pageId = pageId;
    this.numItems = -1;
    this.isComplete = false;
    this._performAggregation = false; // This flag turns on whether records of the same pageId should be aggregated or not
    this.process = function (event) { // This function performs any updates to this record based on events that are recorded for this page         
        return true;
    };
    this.aggregate = function (record) {// This function performs the aggregation if a record of the same type is being added to a completed collection        
    };
};
    
TestShell.Audit.PageLoadRecord = function (pageId) {    
    this.constructor.superclass.constructor.call(this, 'PageLoad', pageId);  // Chain the constructors
    this.loadTime = 0;
    this.requestDate = new Date();
    this._requestTimeStamp = TestShell.Audit.SynthClock.timeStamp();
    this.loadDate = null;
    this._loadTimeStamp = TestShell.Audit.SynthClock.timeStamp();
    this.loadAttempts = 1;
    this._performAggregation = true;
    this.process = function (event) {
        var synthClock = TestShell.Audit.SynthClock;
        if (event.eventType == 'content-loaded') {
            this.loadDate = new Date();           
            this.loadTime = Math.abs(this.loadDate - this.requestDate);
            if (this.loadTime > synthClock.RESOLUTION) {                
                this.loadTime = Math.abs(this._loadTimeStamp - this._requestTimeStamp);
            }
            this.numItems = event.contentPage.getItems().length;
            this.isComplete = true;
            return false;
        }
//        if (event.eventType == 'content-failed') {  // TODO: figure out how to get this info
//            this.loadAttempts++;
//            return false;
//        }
        return true;
    };
    this.aggregate = function(record) {  // we have 2 page loads records for the same page
        this.requestDate = record.requestDate;         
        this.loadDate = record.loadDate;
        this.loadTime = Math.round((this.loadTime * this.loadAttempts + record.loadTime) / this.loadAttempts + 1);  // average the load times       
        this.loadAttempts++;
    };

};
YAHOO.lang.extend(TestShell.Audit.PageLoadRecord, TestShell.Audit.Record);


TestShell.Audit.PageVisitRecord = function (pageId) {
    this.constructor.superclass.constructor.call(this, 'PageVisit', pageId); // Chain the constructors
    this._performAggregation = true;
    this._requestDate = new Date();
    this._requestTimeStamp = TestShell.Audit.SynthClock.timeStamp();
    this.lastViewDate = null;
    this._lastViewTimeStamp = null;
    this._dateHidden = null;
    this._dateHiddenTimeStamp = null;
    this.visitCount = 1;
    this.visitTime = 0;
    this.requestTime = 0;
    this.toolsUsed = [];

    this.process = function (event) {
        var synthClock = TestShell.Audit.SynthClock;
        if (event.eventType == 'page-show') {   
            this.lastViewDate = new Date();
            this._lastViewTimeStamp = synthClock.timeStamp();
            this.requestTime = Math.abs(this.lastViewDate - this._requestDate);
            
            // If the "real" clock diff is less than the resolution of our synthetic clock, 
            // we can safely use it and not worry about huge time differences getting reported.       
            if (this.requestTime > synthClock.RESOLUTION) {          
                this.requestTime = Math.abs(this._lastViewTimeStamp - this._requestTimeStamp);
            }
            this.numItems = event.contentPage.getItems().length;
            return false; 
        }
        if (event.eventType == 'page-hide') {
            this._dateHidden = new Date();
            this._dateHiddenTimeStamp = synthClock.timeStamp();
            this.visitTime = Math.abs(this._dateHidden - this.lastViewDate);
            if (this.visitTime > synthClock.RESOLUTION) {                
                this.visitTime = Math.abs(this._dateHiddenTimeStamp - this._lastViewTimeStamp);
            }
            this.isComplete = true;
            return false;
        }
        if (event.eventType == 'toolUsage') {
            var existingEntry = Util.Array.find(this.toolsUsed, function (element, index, array) { return element.accType === event.accType && element.accCode === event.accCode; });
            if (existingEntry != null) {
                existingEntry.count++;
            } else {
                this.toolsUsed.push({
                    accType: event.accType,
                    accCode: event.accCode,
                    count: 1
                });
            }
            return true; // allow this event to propagate to the other records
        }

        return true;
    };

    this.aggregate = function(pageVisitRecord) {        
        this.visitTime += pageVisitRecord.visitTime;
        this.requestTime = Math.round((this.requestTime * this.visitCount + pageVisitRecord.requestTime) / this.visitCount + 1);  // take the average request time
        this.visitCount++;
        
        // aggregate tool usages
        Util.Array.each(pageVisitRecord.toolsUsed, function(newToolUsage) {
            var existingToolUsage = Util.Array.find(this.toolsUsed, function (tool) { return tool.accType === newToolUsage.accType && tool.accCode === newToolUsage.accCode; });
            if (existingToolUsage != null) {
                existingToolUsage.count += newToolUsage.count;
            } else {
                this.toolsUsed.push({
                    accType: newToolUsage.accType,
                    accCode: newToolUsage.accCode,
                    count: 1
                });
            }
        }, this);
    };
};
YAHOO.lang.extend(TestShell.Audit.PageVisitRecord, TestShell.Audit.Record);

/**************************************** Latency Records ****************************************/