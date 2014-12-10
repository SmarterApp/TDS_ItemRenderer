/**
 * *****************************************************************************
 * @class ImplicitVariable 
 * @superclass Variable
 * @param none
 * @return - instance of ImplicitVariable
 * 
 *******************************************************************************
 */
SimParser.ImplicitVariable = function () {

    // Inherit instance variables
    SimParser.Variable.call(this);
    
    // Instance variables
    var allValues;
    var range;
    
    this.getValues = function () {
        
        if (allValues) {
            return allValues;
        }
        else {
            if (range) {
                allValues = range.getValues();
            }
            else {
                allValues = [];
            }
            return allValues;
        }
    }

    this.bindRange = function (newRange) {
        range = newRange;
    }
    
    // function for setting variable attributes
    SimParser.ImplicitVariable.prototype.setAttributes = function (attr, node) {
        
        // call inherited method
        SimParser.Variable.prototype.setAttributes.call(this, attr, node);
        
        if (attr.range !== undefined) {
            this.bindRange(attr.sirRange);
        }
        if (attr.defaultValue !== undefined) {
            this.setValue(attr.defaultValue);
        }
    }

    this.setEname('ImplicitVariable');
    

};

SimParser.ImplicitVariable.prototype = new SimParser.ImplicitVariable();
SimParser.ImplicitVariable.prototype.constructor = SimParser.Variable;