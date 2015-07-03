//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
﻿/** **************************************************************************
* @class IterationRange
* @superclass Range
* @param none
* @return - an instance of IterationRange
*
*****************************************************************************
*/
SimParser.IterationRange = function() {

    // Inherit instance variables
    SimParser.Range.call(this);
    
    // class variables
    var startValue = new Number();
    var numIterations = new Number();
    var currentValue = new Number();
    var values; // array of all possible values

    // run the next iteration with the next range value in the range
    this.runNext = function (callback, params) {
        if (currentValue <= numIterations) {
            callback(params);
            currentValue++;
        }
    }
    
    // run multiple iterations with all values within the range
    this.runAll = function (callback, params) {
        for (var i = 1; i <= numIterations; i++) {
            callback(params);
            currentValue = i;
        }
    }
    
    // reset the current value to 1
    this.reset = function () {
        currentValue = 1;
    }

    // return all possible values within the range
    this.getValues = function () {
        return values;
    }

    // getters and setters
    this.getStartValue = function () {
        return startValue;
    }

    this.setStartValue = function (newStartValue) {
        startValue = newStartValue;
    }

    this.setValues = function () {
        values = [];
        if (typeof (startValue) === 'undefined' || typeof (numIterations) === 'undefined') {
            EU.debug('startValue or numIterations is not defined in ' + name);
        }

        for (var i = startValue; i < numIterations; i++) {
            values.push(i);
        }
    }

    this.getNumIterations = function () {
        return numIterations;
    }

    this.setNumIterations = function (iterations) {
        numIterations = iterations;
    }

    // set the attributes for the range object
    SimParser.IterationRange.prototype.setAttributes = function (attr) {
        
        // call super class functions first
        SimParser.Range.prototype.setAttributes.call(this, attr);
        
        // set additional attributes
        if (attr.numIteration !== undefined) {
            numIterations = parseInt(attr.numIteration);
        }
        else {
            numIterations = 10; // default value
        }

        if (attr.startValue !== undefined) {
            startValue = parseInt(attr.startValue);
        }
        else {
            startValue = 1; // default
        }

        if (attr.type !== undefined) {
            this.type = attr.type;
        }

        this.setValues();
    }

}

SimParser.IterationRange.prototype = new SimParser.Range();
SimParser.IterationRange.prototype.constructor = SimParser.IterationRange;