//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
﻿/**
 * *****************************************************************************
 * @class RangeManager 
 * @superclass none
 * @param none
 * @return - instance of RangeManager
 * 
 *******************************************************************************
 */
SimParser.RangeManager = function() {

    // class variables
    var ranges = []; // new Dictionary();
    var that = this;

    // retrieve the list of range objects
    this.getRanges = function () {
        return ranges;
    }
    
    // retrieve the list of range objects from xml
    this.setRanges = function (root) {
        
        ranges = [];// new Dictionary();
        
        var r = root.getElementsByTagName('ranges').item(0);
        if (r !== null && r.hasChildNodes()) {
            for (var i = 0; i < r.childNodes.length; i++) {
                var attr = {};
                if (r.childNodes[i].nodeName[0] === '#') {
                	continue; // skip #text node
                }
                for (var j = 0; j < r.childNodes[i].attributes.length; j++) {
                    attr[r.childNodes[i].attributes[j].name] = r.childNodes[i].attributes[j].nodeValue;
                }
                switch (attr.type) {
                    case 'range':
                        var rn = new SimParser.MinMaxRange();
                        break;
                    case 'iterator':
                        var rn = new SimParser.IterationRange();
                        break;
                }
                rn.setAttributes(attr, r);
                ranges.push(rn);
            }
        }
    }

    // retrieve the range by its name
    this.getRangeByName = function (name) {
        for (var i = 0; i < ranges.length; i++) {
            if (ranges[i].getName() === name) {
                return ranges[i];
            }
        }
    }

}