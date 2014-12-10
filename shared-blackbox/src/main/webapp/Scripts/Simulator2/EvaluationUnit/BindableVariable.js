/**
 * *****************************************************************************
 * @class BindableVariable 
 * @superclass Variable
 * @param none
 * @return - instance of BindableVariable
 * 
 *******************************************************************************
 */
SimParser.BindableVariable = function () {

    // Inherit instance variables
    SimParser.Variable.call(this);
    
    // Instance variables
    var allValues;
    
    // setters and getters
    this.getValues = function () {
        return allValues;
    }

    this.setValues = function (v) {
        allValues = v;
        return this;
    }
    
    // function for setting variable attributes
    SimParser.BindableVariable.prototype.setAttributes = function (attr, node) {
        
        // call inherited method
        SimParser.Variable.prototype.setAttributes.call(this, attr, node);

        if (attr.allValues !== undefined) {
            this.setValues(attr.allValues);
        }
        if (attr.defaultValue !== undefined) {
            this.setValue(attr.defaultValue);
        }
    }

    this.setEname('BindableVariable');
    
};

SimParser.BindableVariable.prototype = new SimParser.BindableVariable();
SimParser.BindableVariable.prototype.constructor = SimParser.Variable;