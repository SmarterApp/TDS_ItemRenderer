//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
/** **************************************************************************
* @class DataDictionary
* @superclass SimItem
* @param none
* @return DataDictionary instance
* Creates a new DataDictionary class.
*****************************************************************************
*/
Simulator.DataDictionary = function (sim) {
    Simulator.SimItem.call(this, sim);
    
    var source = 'DataDictionary';  // variable used in debug

    var dataDB = [];

    var dbg = function () { return sim.getDebug(); };
    
    this.createEntry = function(key) {
        if(!dataDB.keyExists(key)) dataDB.addKey(key, '');
    };
    
    this.setEntryValue = function(key, value) {
        dataDB.setValue(key, value);
    };
    
    this.getEntryValue = function(key) {
        return dataDB.lookup(key);
    };
    
    this.contents = function() {
        var buff = [];
        buff.push('<Table>\n');
        buff.push('<tr>');
        var keys = dataDB.keys();
        for(var i = 0; i < keys.length; i++) {
            buff.push('<th id = "' + keys[i] + '">' + keys[i] + '</th>');			
        }
        return buff.join('');
    };
    
    // Convenience functions for debugging
    function debug(str1, str2, trace) {
        dbg().debug(source, str1, str2, trace);
    }

    function debugf(str1, str2, trace) {
        dbg().debugf(source, str1, str2, trace);
    };

};

//Inherit methods and class variables
Simulator.DataDictionary.prototype = new Simulator.SimItem();
Simulator.DataDictionary.parent = Simulator.SimItem;
Simulator.DataDictionary.prototype.constructor = Simulator.DataDictionary;  // Reset the prototype to point to the current class

