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
 * @class LookupVariable 
 * @superclass Variable
 * @param none
 * @return - instance of LookupVariable
 * 
 *******************************************************************************
 */
SimParser.LookupVariable = function () {

    // Inherit instance variables
    SimParser.Variable.call(this);
    
    // setters and getters
    this.getAllValues = function () {
        return [value];
    }

    // function for setting variable attributes
    SimParser.LookupVariable.prototype.setAttributes = function (attr, node) {
        
        // call inherited method
        SimParser.Variable.prototype.setAttributes.call(this, attr, node);
        
        if (attr.value !== undefined) {
            this.setValue(attr.value);
        }
        if (attr.defaultValue !== undefined) {
            this.setValue(attr.defaultValue);
        }
    }

    this.setEname('LookupVariable');
    
    
};

SimParser.LookupVariable.prototype = new SimParser.LookupVariable();
SimParser.LookupVariable.prototype.constructor = SimParser.Variable;