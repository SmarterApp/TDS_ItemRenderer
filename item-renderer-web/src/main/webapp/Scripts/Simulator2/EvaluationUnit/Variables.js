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
 * @class Variable
 * @superclass ParserItem
 * @param none
 * @return - instance of Variable
 *
 *******************************************************************************
 */
SimParser.Variable = function() {

    // Inherit instance variables
    SimParser.ParserItem.call(this);

    // Instance variables
    var name;
    var type;
    var objectName;
    var value = new Number();

    // setters and getters
    this.getName = function () {
        return name;
    }

    this.setName = function (n) {
        name = n;
        return this;
    }

    this.getType = function () {
        return type;
    }

    this.setType = function (t) {
        type = t;
        return this;
    }

    this.getValue = function () {
        return value;
    }

    this.setValue = function (v) {
        value = v;
        return this;
    }

    this.getObjectName = function () {
        return objectName;
    }

    this.setObjectName = function (o) {
        objectName = o;
        return this;
    }

    // function for setting variable attributes
    SimParser.Variable.prototype.setAttributes = function (attr, node) {
        if (attr.name !== undefined) {
            this.setName(attr.name);
        }
        if (attr.type !== undefined) {
            this.setType(attr.type);
        }
        if (attr.value !== undefined) {
            this.setValue(attr.value);
        }
        if (attr.object !== undefined) {
            this.setObjectName(attr.object);
        }
    }

    this.setEname('BaseVariable');
}

//Inherit methods and class variables
SimParser.Variable.prototype = new SimParser.ParserItem();
SimParser.Variable.prototype.constructor = SimParser.Variable;