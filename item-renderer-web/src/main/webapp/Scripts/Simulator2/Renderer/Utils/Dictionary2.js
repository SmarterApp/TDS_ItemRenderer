//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
/** **************************************************************************
* @class Dictionary
* @superclass none
* @param none
* @return Dictionary instance
* Creates a new Dictionary data structure.
*****************************************************************************
*/

Simulator.Utils.Dictionary = function (sim) {

    var source = 'Dictionary';  // variable used in debug

    var elements = []; // Use an Associative Array    

    var dbg = function () {return sim.getDebug();};

    this.getElements = function () {
        return elements;
    }

    this.exists = function (key) {
        return (elements[key] == undefined);
    };

    this.keyExists = function (key) {
        return (key in elements);
    };

    this.setValue = function (key, value) {
        this.addKey(key);
        elements[key] = value;
    };

    this.addKey = function (key, value) {
        if (!this.keyExists(key)) {
            elements[key] = '';
        }
    };

    this.remove = function (key) {
        delete elements[key];
    };

    this.lookup = function (key) {
        return elements[key];
    };

    this.keys = function () {
        var keys = [];
        for (var key in elements) {
            if (key != undefined && key != null) keys.push(key);
        }
        return keys;
    };

    this.size = function () {
        var i = 0;
        for (key in elements) {
            i++;
        }
        return i;
    };

    this.toString = function () {
        var buff = new Simulator.Utils.StringBuffer();
        var str;
        for (key in elements) {
            if (key != undefined && key != null) {
                if (elements[key] instanceof Array) {
                    str = (elements[key]).join('  ');
                } else str = elements[key];
                buff.append('key = ').append(key).append(', value = ').append(str).append('\n');
            }
        }
        return buff.toString();
    };
    
    this.toAssociativeArray = function() {
        dbg().inspectArray(source, 'elements', elements);
        return elements;
    };

    this.inspect = function (embedded, forced) {
        buff = [];
        var sep = '\n\n';
        buff.push('Inspecting Dictionary'); buff.push(sep);
        buff.push(this.toString()); buff.push(sep);
        if (!embedded) (forced) ? debugf(buff.join('')) : debug(buff.join(''));
        return buff.join('');
    };

    // Convenience functions for debugging
    function debug(str1, str2, trace) {
        dbg().debug(source, str1, str2, trace);
    }

    function debugf(str1, str2, trace) {
        dbg().debugf(source, str1, str2, trace);
    }
};



/** **************************************************************************
* @class StringBuffer
* @superclass none
* @param none
* @return StringBuffer instance
* Creates a new StringBuffer data structure.
*****************************************************************************
*/
Simulator.Utils.StringBuffer = function () {
    this.buffer = [];

    this.append = function (string) {
        this.buffer.push(string);
        return this;
    };

    this.toString = function () {
        return this.buffer.join('');
    };
};