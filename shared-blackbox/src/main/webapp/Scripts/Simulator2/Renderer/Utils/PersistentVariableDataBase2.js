/** **************************************************************************
* @class PersistentVariableDataBase
* @superclass none
* @param none
* @return PersistentVariableDataBase instance
* Creates a new PersistentVariableDataBase data structure.
*****************************************************************************
*/

Simulator.Utils.PersistentVariableDataBase = function (sim) {

    var source = 'PersistentVariableDB';  // variable used in debug

    var store = [];

    var dbg = function () {return sim.getDebug();};

    this.updateElement = function (element, value, operation) {
        if (element in store) {
            if (!isNaN(value)) {  // it is a number so do the operation
                currentValue = store[element];
                if (!operation) currentValue += parseFloat(value);
                else switch (operation) {
                    case '+':
                        currentValue += parseFloat(value);
                        break;
                    case '*':
                        currentValue *= parseFloat(value);
                        break;
                    case '/':
                        currentValue /= parseFloat(value);
                        break;
                    case '-':
                        currentValue -= parseFloat(value);
                        break;
                    case 'overwrite':
                        currentValue = value;
                        break;
                    default:
                        dbg().logWarning(source, 'Invalid operator ' + operator + ' passed to PersistentVariableDataBase.updateElement. No update occurred');
                        break;
                }
                store[element] = currentValue;
            } else store[element] = value;  // it is not a number, replace the current value.

        }
        else {
            if (!isNaN(value)) store[element] = parseFloat(value);
            else store[element] = value;
        }
        return this.getElementValue(element);
    };

    this.setElementTo = function (element, num) {
        store[element] = num;
    };

    this.getElementValue = function (element) {
        if (element in store) return store[element];
        else return null;
    };

    this.getContents = function () {
        return store;
    };

    this.inspect = function (embedded, force) {
        var buff = [];
        buff.push('Inspecting ' + source);
        for (var p in store) {
            buff.push('   ' + source + '[' + p + '] = ' + store[p]);
        }
        if (embedded) return buff.join('\n');
        else force == true ? debugf(buff.join('\n')) : debug(buff.join('\n'));
    };

    // Convenience functions for debugging
    function debug(str1, str2, trace) {
        dbg().debug(source, str1, str2, trace);
    }

    function debugf(str1, str2, trace) {
        dbg().debugf(source, str1, str2, trace);
    }
};