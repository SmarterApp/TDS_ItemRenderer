//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************

/**
 * **************************************
 * @class EventDB
 * @superclass none
 * @param none
 * @return Event instance
 ****************************************
 */
Simulator.EventDB = function(sim, theName) {

    // Instance variables
    var source = 'EventDB';  // variable used in debug
    var DB = [];
    var currentIndex = 0;
    var name = theName;

    // Get required services
    var dbg = function() {return sim.getDebug();};
    
    // Instance Methods
    this.getName = function() {
        return name;
    };
    
    this.addEvent = function(event) {
        DB.push(event);
    };

    this.removeEvent = function(event) {
        var index = this.isInDB(event, true);
        if(index > -1) DB.splice(index, 1);
    };
        
    this.isInDB = function(event, fullMatch) {
        for(var i = 0; i < DB.length; i++) {
            var theEvent = DB[i];
            if(theEvent.type == event.type && theEvent.context == event.context) {
                if (fullMatch) {
                    if(theEvent.src == event.src) return i;
                } else return i;
            }
        }
        return -1;
    };
    
    this.getAllMatchingEvents = function(event) {
        var matches = [];
        var k = 0;
        for ( var i = 0; i < DB.length; i++) {
            var theEvent = DB[i];
            if(theEvent.type == event.type && (theEvent.context == event.context || theEvent.context == '*'|| event.context == '*')) {
                if(event.data) theEvent.data = event.data;
                theEvent.completeWithoutOutput = event.completeWithoutOutput;
                theEvent.originatorName = event.originatorName;
                matches[k++] = theEvent;
            }
        }
        return matches;
    };
    
    this.nextEvent = function(reset) {
        if(reset) currentIndex = 0;
        if(currentIndex < DB.length) return DB[currentIndex++];
        else return null;
    };
    
    this.inspect = function(embedded, forced) {
        var buff = [];
        var sep = '\n';
        buff.push('Inspecting EventDB ' + name + sep);
        buff.push('There are ' + DB.length + ' events in ' + name + sep);
        for(var i = 0; i < DB.length; i++) {
            (forced) ? buff.push(debugf(DB[i].inspect(embedded, true))) : buff.push(debug(DB[i].inspect(embedded, true)));
            buff.push(sep);
        };
        buff.push('End of EventDB ' + name + ' Inspection' + sep + sep);
        if(!embedded) (forced) ? debugf(buff.join('')) : debug(buff.join(''));
        else return buff.join('');
    };

    // Convenience function for the most frequently used Debug methods
    function debug(str1, str2, trace) {
        dbg().debug(source, str1, str2, trace);
    }
    
    function debugf(str1, str2, trace) {
        dbg().debugf(source, str1, str2, trace);
    }
    
};

