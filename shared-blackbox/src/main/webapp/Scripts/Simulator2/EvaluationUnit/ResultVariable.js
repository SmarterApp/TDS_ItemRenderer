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
 * @class ResultVariable 
 * @superclass Variable
 * @param none
 * @return - instance of ResultVariable
 * 
 *******************************************************************************
 */
SimParser.ResultVariable = function () {

    // Inherit instance variables
    SimParser.Variable.call(this);
    
    // function for setting variable attributes
    SimParser.ResultVariable.prototype.setAttributes = function (attr, node) {
        
        // call inherited method
        SimParser.Variable.prototype.setAttributes.call(this, attr, node);
    }

    this.setEname('ResultVariable');

};

SimParser.ResultVariable.prototype = new SimParser.ResultVariable();
SimParser.ResultVariable.prototype.constructor = SimParser.Variable;