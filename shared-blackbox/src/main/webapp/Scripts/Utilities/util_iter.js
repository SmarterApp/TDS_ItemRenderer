// REQUIRES: util.js, util_array.js

(function(Util) {

    // Advanced array iteration.
    // NOTE: This code was ported to YUI
    // Help: http://mootools.net/forge/p/array_iterator
    // Original Source: https://github.com/cainrus/mootools-array-iterator/tree/de9488ab0ebe668f5341af1dd573dad9eb89c912
    // Latest Source: https://github.com/cainrus/mootools-array-iterator/blob/master/Source/Array.iterator.js
    function Iterator(ref, options) {

        // lazy create
        if (!(this instanceof Iterator)) {
            return new Iterator(ref, options);
        }

        this.options = {

            // Force null-exit from iteration after last or before first index.
            pit: false,

            // Force limit iterator movement after last or before first index.
            limits: false,

            // Allow ability to chain method calls of movement
            chains: false
        };

        if (YAHOO.lang.isObject(options)) {
            YAHOO.lang.augmentObject(this.options, options, true);
        }

        // Link to same instance of array.
        this._ref = ref;

        this.ref = function() {
            return this._ref;
        };

        this._key = null;

        this.setKey = function (key) {
            return this._key = key;
        };

        // Position Setter
        this.jump = function (key) {
            // check key & move pointer
            key = this.setKey(this.valid(key));
            return (this.options.chains) ? this : this.current(key);
        };

        // Position Getter
        this.key = function () {
            var key = this.valid(this._key);
            return this.setKey(key);
        };

        // Prepare ranges
        var min, max;
        with (this.options) {
            min = Util.Array.pick([this.options.min, 0]);
            max = Util.Array.pick([this.options.max, ref.length - 1]);
        }
    };

    // jump to an object in the iterator
    Iterator.prototype.jumpTo = function (obj) {
        var idx = this.ref().indexOf(obj);
        if (idx >= 0) {
            return this.jump(idx);
        }
        return null;
    };

    // key validator
    Iterator.prototype.valid = function () {

        // base checks
        var length = this.ref().length;
        var key = (arguments.length > 0) ? Util.Number.from(arguments[0]) : this.key();

        // empty array or key checks
        if (key === null || length === 0) {
            return null;
        }

        // Negative to positive
        if (key < 0) {
            key = this.ref().length + key;
        }

        // limits checks
        if (key < 0 || key > length - 1) {
            return null;
        }

        // complex range checks
        var range = function (side) {
            return (typeof side !== 'number') ? null : Util.Number.limit(side, 0, length);
        }; //var min = range(this.options.min), max = range(this.options.max);
        //if ((min && key < min)||(max && key > max)) return null;

        return key;
    };

    // move cursor to minimal allowed position
    Iterator.prototype.reset = function () {
        var range = this.range(1), key = (range.length) ? range[0] : null;
        return this.jump(key);
    },

    // Move cursor out, to null
    Iterator.prototype.rewind = function () {
        return this.jump(null);
    };

    // Move cursor to maximum allowed position
    Iterator.prototype.end = function () {
        var range = this.range(1), key = (range.length) ? range.pop() : null;
        return this.jump(key), this.current(key);
    };

    // Move cursor next
    Iterator.prototype.next = function () {
        return this.slide(1);
    };

    // Move cursor back
    Iterator.prototype.prev = function () {
        return this.slide(-1);
    };

    // Return selected array value
    Iterator.prototype.current = function (key) {
        key = (key === void 0) ? this.key() : this.valid(key);
        return (key === null) ? null : this.ref()[key];
    };

    // Move with offset back or forward [,from index]
    Iterator.prototype.slide = function (offset, from) {

        offset = parseInt(offset);
        var range = this.range(1);
        var key = Util.Array.pick([Util.Number.from(from), this.key()]);
        var limit = this.options.limits, pit = this.options.pit;

        // Exit with null result if: range or offset is invalid, no way to move pointer.
        if (!range.length || offset === null || (limit && key === null && offset < 0)) {
            return this.jump(null);
        }

        if (offset === 0) {
            return this.current();
        }

        if (pit) {
            range.unshift(null);
        }

        var max = range.length - 1;

        // Move cursor from not existing index (null)
        if (key === null) {
            key = (pit) ? 1 : 0;
            if (limit) {
                offset--, key = (pit) ? 1 : 0;
            } else if (offset < 0) {
                offset++, key = max;
            } else {
                offset--;
            }
        } else {
            key = range.indexOf(key);
        }

        // Reduce offset
        if (!pit && !limit && Math.abs(offset) >= range.length) {
            offset = offset % range.length;
        }

        // Move key
        key = key + offset;

        // if key is out of range
        var more = key > max, less = key < 0;

        if (more || less) {
            if (pit && limit) {
                key = null;
            } else if (more) {
                key = (limit) ? max : key - max - 1;
            } else if (less) {
                key = (limit) ? 0 : key + max + 1;
            }
        }

        return this.jump(range[key]);
    };

    // Return range
    Iterator.prototype.range = function () {

        var array = this.ref(), length = array.length - 1, keys = Util.Object.keys(array), pub = !arguments[0];

        if (length < 0) {
            return [];
        } // empty array ~ empty range

        if (pub) {
            return array;
        } else {
            var range = Util.Array.map(keys, function (item) {
                return parseInt(item);
            });
            return range;
        }
    };

    Util.Iterator = Iterator;

})(Util);

