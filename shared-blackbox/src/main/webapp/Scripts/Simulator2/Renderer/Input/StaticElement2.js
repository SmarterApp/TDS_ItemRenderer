//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
/** **************************************************************************
* @class StaticElement
* @superclass SimElement
* @param none
* @return StaticElement instance
* Creates a new StaticElement Abstract class.
*****************************************************************************
*/
Simulator.Input.StaticElement = function (sim) {

    Simulator.SimElement.call(this, sim); // Inherit Instance variables
    
    var panel = null;
    var section = null;
    
    // Instance methods
    this.getPanel = function() {  
        return panel;
    };
    
    this.setPanel = function(newPanel) {
        panel = newPanel;
        return this;
    };
    
    this.setSection = function(theSection) {
        section = theSection;
    };
    
    this.saveState = function(indent, preface, nameStr, valStr, suffix) {
        return indent + preface + nameStr + this.getName() + valStr + checkedItems + suffix; 
    };
};

//Inherit methods and class variables
Simulator.Input.StaticElement.prototype = new Simulator.SimElement();
Simulator.Input.StaticElement.parent = Simulator.SimElement;
Simulator.Input.StaticElement.prototype.constructor = Simulator.Input.StaticElement; // Reset the prototype to point to the superclass
