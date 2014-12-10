/** **************************************************************************
* @class Stack
* @superclass none
* @param none
* @return Stack instance
* Creates a new Stack data structure. Last In First Out.
*****************************************************************************
*/

Simulator.Utils.Stack = function (sim) {
    var source = 'Stack';  // variable used in debug

    // Create an empty array of cards.
    this.store = []; // store array inside stack object

    
    var dbg = function () {return sim.getDebug();};

    this.push = function (data) {
        this.store.push(data);
    };

    this.pop = function () {
        if (this.store.length > 0) return this.store.pop();
        else return null;
    };

    this.peek = function () {
        return this.store[this.store.length - 1];
    };

    this.inspect = function (embedded, forced) {
        var buff = [];
        buff.push('\nInspecting Stack:');
        buff.push('Stack contains ' + this.store.length + (this.store.length == 1 ? ' element' : ' elements'));
        var last = this.store.length - 1;
        for (var i = last; i >= 0; i--) {
            if (typeof (this.store[i]) == 'object') {
                if (this.store[i].inspect != undefined) buff.push(this.store[i].inspect(true, true));
            }
            else buff.push('stack nonobject element: ' + this.store[i]);
        }
        buff.push('End inspecting Stack\n');
        if (embedded) return buff.join('\n');
        else forced == null ? debug(buff.join('\n')) : debugf(buff.join('\n'));
    };

    this.elementAt = function (num) {
        if (num < this.store.length && num >= 0) return this.store[num];
    };

    this.insertAt = function (obj, index) {
        if (index >= 0 && index < this.store.length) this.store.splice(index, 0, obj);
        else if (index == this.store.length) this.store.push(obj);
    };

    this.numElements = function () {
        return this.store.length;
    };

    this.clear = function () {
        var item = this.pop();
        while (item != null) {
            item = this.pop();
        }
    };

    this.entriesAsString = function () {
        var buff = [];
        for (var i = this.store.length - 1; i > -1; i--) {
            buff.push(this.store[i]);
        }
        return buff.join(',');
    };

    // Convenience functions for debugging
    function debug(str1, str2, trace) {
        dbg().debug(source, str1, str2, trace);
    }

    function debugf(str1, str2, trace) {
        dbg().debugf(source, str1, str2, trace);
    }
};