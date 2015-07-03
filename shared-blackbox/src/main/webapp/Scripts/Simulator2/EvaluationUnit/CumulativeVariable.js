//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
﻿
/**
 * *****************************************************************************
 * @class CumulativeVariable 
 * @superclass Variable
 * @param none
 * @return - instance of CumulativeVariable
 * 
 *******************************************************************************
 */
SimParser.CumulativeVariable = function () {

    // Inherit instance variables
    SimParser.Variable.call(this);
    
    // used to identify the name of the stored variable
    var store;
    
    // used to identify the type of mathematical operations to apply to the cumulative variable
    var cumOp;
    
    // setters and getters
    this.getStore = function () {
        return store;
    }
    
    this.setStore = function (s) {
        store = s;
        return this;
    }
    
    this.getCumOp = function () {
        return cumOp;
    }
    
    this.setCumOp = function (c) {
        cumOp = c;
        return this;
    }
    
    // function for setting variable attributes
    SimParser.CumulativeVariable.prototype.setAttributes = function (attr, node) {
        
        // call inherited method
        SimParser.Variable.prototype.setAttributes.call(this, attr, node);

        // set the 'store' attribute
        if (attr.store !== undefined) {
            this.setStore(attr.store);
        }
        // set the 'cumOp' attribute
        if (attr.cumOp !== undefined) {
            this.setCumOp(attr.cumOp);
        }
    }

    this.setEname('CumulativeVariable');
    
};

SimParser.CumulativeVariable.prototype = new SimParser.CumulativeVariable();
SimParser.CumulativeVariable.prototype.constructor = SimParser.Variable;