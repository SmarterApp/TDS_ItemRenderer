//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
/** **************************************************************************
* @class DataDisplayElement
* @superclass SimElement
* @param sim
* @return DataDisplayElement instance
* Abstract Base Class for DataTable. Only Accessors and Mutators. POCO
*****************************************************************************
*/
Simulator.Display.DataDisplayElement = function  (sim) {

    Simulator.SimElement.call(this, sim);

    var visible = 'true';
    var displayVector = [];
    var waitOn = null;
    var fixedDigits = 2;

    this.getVisible = function() {
        return visible;
    };
    
    this.setVisible = function(newVisible) {
    	visible = newVisible;
        return this;
    };

    this.getDisplayVector = function() {
        return displayVector;
    };
    
    this.setDisplayVector = function(newDisplayVector) {
    	displayVector = newDisplayVector;
        return this;
    };
    
    this.getWaitOn = function() {
        return waitOn;
    };
    
    this.setWaitOn = function(newWaitOn) {
    	waitOn = newWaitOn;
        return this;
    };

    this.getFixedDigits = function() {
        return fixedDigits;
    };
    
    this.setFixedDigits = function(newFixedDigits) {
        fixedDigits = newFixedDigits;
        return this;
    };

    this.onChange = function (id) {
        //this.recordInput(this); //TODO:Verify if this is needed.
        this.postOnChangeEvents();
    };

    this.setAttributes = function (attr, node) {
        Simulator.Display.DataDisplayElement.prototype.setAttributes.call(this, attr, node);
        for (var i in attr) {
            switch (i) {
                case 'visible':
                    this.setVisible(attr[i]);
                    break;
                case 'fixedDigits':
                    this.setFixedDigits(attr[i]);
                    break;
                case 'waitOn':
                    this.setWaitOn(attr[i]);
                    break;
            }
        }
    };
};

//Inherit methods and class variables
Simulator.Display.DataDisplayElement.prototype = new Simulator.SimElement();
Simulator.Display.DataDisplayElement.parent = Simulator.SimElement;
Simulator.Display.DataDisplayElement.prototype.constructor = Simulator.Display.DataDisplayElement;  // Reset the prototype to point to the current class
