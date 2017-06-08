//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
﻿/** **************************************************************************
* @class Range
* @superclass none
* @param none
* @return - an instance of Range
*
*****************************************************************************
*/
SimParser.Range = function() {

    // Inherit instance variables
    SimParser.ParserItem.call(this);
    
    // class variables
    var name;
    var type;
    
    // setters and getters
    this.getName = function () {
        return name;
    }
    this.setName = function (newName) {
        name = newName;
    }

    this.getType = function () {
        return type;
    }
    this.setType = function (newType) {
        type = newType;
    }

    SimParser.Range.prototype.setAttributes = function (attr) {
        if (attr.name !== undefined) {
            this.setName(attr.name);
        }
        if (attr.type !== undefined) {
            this.setType(attr.type);
        }
    }

}

SimParser.Range.prototype = new SimParser.ParserItem();
SimParser.Range.prototype.constructor = SimParser.Range;