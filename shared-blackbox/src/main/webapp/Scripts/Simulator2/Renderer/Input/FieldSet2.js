
/**
 * *****************************************************************************
 * @class FieldSet 
 * @superclass InputElement
 * @param sim - The Simulator instance
 * @return - instance of a FieldSet which is only used as an abstract class
 * Note - This is an abstract class
 *******************************************************************************
 */
Simulator.Input.FieldSet = function(sim) {

    Simulator.Input.InputElement.call(this, sim); // Inherit Instance variables
    
    var dbg = function() { return sim.getDebug(); };    
    var persistentVarDB = function() { return sim.getPersistentVariableDataBase(); };
    var simDocument = function() { return sim.getSimDocument(); };
    var transDictionary = function () { return sim.getTranslationDictionary(); };

    var defaultValue = 0; 
    var minValue = 0;
    var increment = 0;
    var unitsTag = ''; 
    var data = '';
    var valueModifier = null;
    var valueChanged = false;
    var selectedValue = -1;   // indicates no element selected    
    var valueModifierOp = 'add';
    var maxValue = 0; 


    this.getMinValue = function() {
        return minValue;
    };

    this.setMinValue = function(newMinValue) {
        minValue = newMinValue;
        return this;
    };

    this.getMaxValue = function() {
        return maxValue;
    };

    this.setMaxValue = function(newMaxValue) {
        maxValue = newMaxValue;
        return this;
    };

    this.getDefaultValue = function() {
        this.setData(defaultValue);
        return defaultValue;
    };

    this.setDefaultValue = function(newDefaultValue) {
        defaultValue = newDefaultValue;
        selectedValue = newDefaultValue;
        this.setPrevValue(newDefaultValue);
        return this;
    };
    
    this.recordKeyboardSelection = function(elementID, itemID, itemIndex) {
        var element = null;
        var item = null;
        if(itemID) {
            item = simDocument().getElementById(itemID);
            if(!item) {
                element = simDocument().getElementById(elementID);
                if(element) item = element.getElementsByClassName(itemID)[0];
            }
            if(item) {
                item.isSelected = true;
                this.setSelectStateViaKeyboard(elementID, itemID);
                this.onChange(elementID);
            }
        }
    };
    
    this.setSelectStateViaKeyboard = function(elementID, itemID) {
        if(itemID == 'goingUp') incrementValue(elementID, this.getMaxValue(), this.getIncrement());
        else if(itemID == 'goingDown') decrementValue(elementID, this.getMaxValue(), this.getIncrement());
    };


    this.getIncrement = function() {
        return increment;
    };

    this.setIncrement = function(newIncrement) {
        increment = newIncrement;
        return this;
    };

    this.getUnits = function () {
        // retrieve translated units text
        return transDictionary().translate(unitsTag);
    };

    this.setUnits = function(newUnits) {
        unitsTag = newUnits;
        return this;
    };    
    
    this.setData = function(newData) {
        data = newData;
    };
    
    this.getData = function() {
        var dataArray = [];
        dataArray[0] = data;
        return dataArray;
    };
        
    this.saveState = function(indent, preface, nameStr, valStr, suffix) {
        if(selectedValue != '') return indent + preface + nameStr + this.getName() + valStr + this.getData() + suffix;
        else return '';
    };

    this.setElementSelectState = function(state, contents) {
        var value = parseFloat(contents);
        if(value >= this.getMinValue() && value <= this.getMaxValue() && value % this.getIncrement() == 0) {
            this.setData(contents);
            selectedValue = contents;
            setHTMLValue(this.getNodeID(), this.getData());
            this.recordInput(this, true);
        }
    };
    
    this.setValueModifier = function(element) {
        valueModifier = element;
    };
    
    this.getValueModifier = function() {
        return valueModifier;
    };
    
    this.setValueModifierOp = function(op) {
        valueModifierOp = op;
    };
    
    this.getValueModifierOp = function() {
        return valueModifierOp;
    };
    
    var doModifierOp = function(element, value) {
        var modifier = element.getValueModifier();
        if(isNaN(modifier)) modifier = persistentVarDB().getElementValue(element.getValueModifier());   // If it is not a number it must be the name of a persistent variable
        if(value == undefined || value == null) logError('ValueModifier ' + modifier + ' for ' + element.getName() + ' is not a number nor in persistentVarDB');
        else {
            var op = element.getValueModifierOp();
            switch(op) {
            case 'add': value += modifier;
                break;
            case 'multiply': value *= modifier;
                break;
            case 'subtract': value -= modifier;
                break;
            case 'divide': value /= modifier;
                break;
            default: dbg().logError(source, 'Value modifer operation "' + op + '" is not defined');
                break;
            }
        }
        return value;
    };
    
    this.getModifiedValue = function(value) {
        if(this.getValueModifier() != null) {
            value = doModifierOp(this, value);
        }
        return value;
    };
        
    this.setAttributes = function(attr, node) {
        Simulator.Input.FieldSet.prototype.setAttributes.call(this, attr);
        for (var i in attr) {
            switch (i) {
            case 'minValue':
                this.setMinValue(attr[i]);
                break;
            case 'maxValue':
                this.setMaxValue(attr[i]);
                break;
            case 'defaultValue':
                this.setDefaultValue(attr[i]);
                break;
            case 'increment':
                this.setIncrement(attr[i]);
                break;
            case 'units':
                this.setUnits(attr[i]);
                break;
            }
        }
    };

    var setHTMLValue = function(id, value) {
        //var element = GetJSObjFromHTML(id);
        var htmlElement = simDocument().getElementById(id);
        //if(!htmlElement) htmlElement = element.getHTMLElement(id);  // the element uses a diferent mapping scheme
        if (!htmlElement) htmlElement = simDocument().getElementById(id + 'slider-value'); // for textfield in sliders
        if (htmlElement) htmlElement.value = value;    
    };

    this.setValueChanged = function(newValueChanged) {
        valueChanged = newValueChanged == 'true' || newValueChanged == 'yes' ? true : false;
    };

    this.getValueChanged = function() {
        return valueChanged;
    };

    this.incrementValue = function(id, maxValue, increment) {
        // var element = GetJSObjFromHTML(id);
        var htmlElement = simDocument().getElementById(id);
        currentValue = parseFloat(htmlElement.value);

        currentValue = Math.min(currentValue + parseFloat(increment), maxValue);
        htmlElement.value = currentValue;
        currentValue = this.getModifiedValue(currentValue);
        currentValue = currentValue.toString();
        this.setData(currentValue);
        valueChanged = true;
        if(this.getSaveOnChange()) this.onChange(this.getNodeID());
    };

    this.decrementValue = function(id, minValue, decrement) {
        // var element = GetJSObjFromHTML(id);
        var htmlElement = simDocument().getElementById(id);
        currentValue = parseFloat(htmlElement.value);

        currentValue = Math.max(currentValue - parseFloat(decrement), minValue);
        htmlElement.value = currentValue;  // set the counter value with the incrementd, unmodified value
        currentValue = this.getModifiedValue(currentValue);
        currentValue = currentValue.toString();
        this.setData(currentValue);
        valueChanged = true;
        if(this.getSaveOnChange()) this.onChange(this.getNodeID());
    };


    this.inspect = function(embedded, forced) {
        var buff = [];
        var sep = '\n\n';
        if (!embedded) {
            buff.push('Inspecting ');
            buff.push(this.getName());
            buff.push(sep);
        }
        for ( var i in this) {
            if (i.substr(0, 3) == 'get') {
                buff.push(i);
                buff.push(' = ');
                buff.push(eval('this.' + i + '()'));
                buff.push(sep);
            }
        }
        if (!embedded) forced === true ? dbg().debugf(buff.join('')) : dbg().debug(buff.join(''));
        else return buff.join('');
    };

    
    // Convenience function for the most frequently used Debug methods
    function debug(str1, str2, trace) {
        dbg().debug(source, str1, str2, trace);
    }
    
    function debugf(str1, str2, trace) {
        dbg().debugf(source, str1, str2, trace);
    }

};

// Inherit methods and class variables
Simulator.Input.FieldSet.prototype = new Simulator.Input.InputElement();
Simulator.Input.FieldSet.prototype.constructor = Simulator.Input.FieldSet; // Reset the prototype to point to the current class