/**
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