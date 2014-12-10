/** **************************************************************************
* @class MinMaxRange
* @superclass Range
* @param none
* @return - an instance of MinMaxRange
*
*****************************************************************************
*/
SimParser.MinMaxRange = function() {

    // Inherit instance variables
    SimParser.Range.call(this);
    
    // class variables
    var minValue = new Number();
    var maxValue = new Number();
    var increment = new Number();
    var values; // array of all possible values
    var currentValue = new Number();

    // run the next iteration with the next range value in the range
    this.runNext = function (callback, params) {
        if (currentValue <= maxValue) {
            callback(params);
            currentValue++;
        }
    }
    
    // run multiple iterations with all values within the range
    this.runAll = function (callback, params) {
        for (var i = minValue; i <= maxValue; i += increment) {
            callback(params);
            currentValue = i;
        }
    }

    // check if a value is within the range
    this.IsValueinRange = function (val) {
        return (value >= minValue && value <= maxValue);

    }
    
    // reset the current value to the minimum value of the range
    this.reset = function () {
        currentValue = minValue;
    }

    // return all possible values within the range
    this.getValues = function () {
     return values;
    }

    // set all possible values within the range
    this.setValues = function () {
        values = [];
        if (typeof (minValue) === 'undefined' || typeof (maxValue) === 'undefined' || typeof (incrementValue) === 'undefined') {
            EU.debug('minValue/maxValue/increment is not defined in ' + name);
        }
        var curValue = minValue;
        while (curValue <= maxValue) {
            values.push(curValue);
            curValue = curValue + increment;
        }
    }

    // set the attributes for the range object
    SimParser.MinMaxRange.prototype.setAttributes = function (attr) {
        
        // call super class function first
        SimParser.Range.prototype.setAttributes.call(this, attr);
        
        // set additional attributes
        if (attr.minValue !== undefined) {
            minValue = parseInt(attr.minValue);
        }
        else {
            minValue = 1; // default
        }

        if (attr.maxValue !== undefined) {
            maxValue = parseInt(attr.maxValue);
        }
        else {
            maxValue = 10; // default
        }

        if (attr.increment !== undefined)  {
            increment = parseFloat(attr.increment);
        }
        else {
            increment = 1; // default value
        }

        this.setValues();
    }

}

SimParser.MinMaxRange.prototype = new SimParser.Range();
SimParser.MinMaxRange.prototype.constructor = SimParser.MinMaxRange;