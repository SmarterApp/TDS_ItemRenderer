//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
/****************************************
 * EventManager Class Specification
 * Superclass: None
 *****************************************/
Simulator.EventManager = function(sim) {
    // Private variables
    var source = 'EventManager';
    var inputQueue = new Simulator.Utils.Queue(sim);
    var subscriberDB = null;
    var timer = null;

    // Get required services
    var dbg = function() {return sim.getDebug();};
    var utils = function() {return sim.getUtils();};

    var getSubscriberDB = function() {
        if(!subscriberDB) subscriberDB = new Simulator.EventDB(sim, 'subscriberDB');
        return subscriberDB;
    };

    // Instance methods    
    this.registerEvent = function(event) {
        getSubscriberDB().addEvent(event);
        //debug('Registered ' + event.type + ' event with context "' + event.context + '" from ' + getEventSrcName(event));
        
    };
    
    this.deRegisterEvent = function(event) {
        getSubscriberDB().remove(event);
    };
    
    this.postEvent = function(event) {
        //debug('Added to event input queue: "' + event.type + '" event with context "' + event.context);
        //inputQueue.inspect(false, true);
        inputQueue.add(event);
    
    };    
    
    this.startEventProcessing = function() {
        var closure = bind(processEvents);
        timer = setInterval (closure, 500 ); // Set up periodic processing of event input queue    
    };

    
    this.getSourceName = function(obj) {
        return utils().getJSObjName(obj);
    };
    
    this.stopEventProcessing = function() {
        clearTimeout(timer);
    };
    
    // Private functions
    function processEvents() {
        while(!inputQueue.isEmpty()) {
            var matches = [];
            var event = inputQueue.remove();
            //debug('Obtained from event input queue: "' + event.type + '" event with context "' + event.context + '" for matching');
            matches = getSubscriberDB().getAllMatchingEvents(event);
            for ( var i = 0; i < matches.length; i++) {
                if((matches[i]).src.handleEvent != undefined) {
                    //debug('Sending ' + matches[i].type + ' with context "' + matches[i].context + '" to ' + getEventSrcName(event));
                    (matches[i]).src.handleEvent(event);
                }
                else if(typeof (matches[i]).src != 'object') {
                    //debug('Sending ' + matches[i].type + ' with context "' + matches[i].context + '" to ' + getEventSrcName(event));
                    (matches[i]).src.prototype.handleEvent(event);
                }
            }
        }
    }
    
    function bind(method) {
        var _this = this;
        return(function() {
            return(method.apply(_this.arguments));
        });
    }
    
    function getEventSrcName(event) {
        if (event.src.getSourceName === undefined) return 'object';
        else return event.src.getSourceName();
    } 

    // Convenience function for the most frequently used Debug methods
    function debug(str1, str2, trace) {
        dbg().debug(source, str1, str2, trace);
    }
    
    function debugf(str1, str2, trace) {
        dbg().debugf(source, str1, str2, trace);
    }

};
