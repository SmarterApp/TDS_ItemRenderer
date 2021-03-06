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
 * @class ConstantVariable 
 * @superclass Variable
 * @param none
 * @return - instance of an ConstantVariable which is only used as an abstract class
 * 
 *******************************************************************************
 */
SimParser.ConstantVariable = function () {

    // Inherit instance variables
    SimParser.Variable.call(this);
    
    // Instance variables
    var allValues;

    // setters and getters
    this.getAllValues = function () {
        return [value];
    }

    // function for setting variable attributes
    SimParser.ConstantVariable.prototype.setAttributes = function (attr, node) {

        // call inherited method
        SimParser.Variable.prototype.setAttributes.call(this, attr, node);

        if (attr.object !== undefined) {
            this.setObjectName(attr.object);
        }
    }

    this.setEname('ConstantVariable');
    
};

SimParser.ConstantVariable.prototype = new SimParser.ConstantVariable();
SimParser.ConstantVariable.prototype.constructor = SimParser.Variable;