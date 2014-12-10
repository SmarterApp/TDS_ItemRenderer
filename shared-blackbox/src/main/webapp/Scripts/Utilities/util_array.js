// REQUIRES: none

(function(Util) {

    var A = {};
    var Native = Array.prototype;
    
    // The isArray() method returns true if an object is an array, false if it is not.
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/isArray
    A.isArray = function (arg) {
        if (Array.isArray) {
            return Array.isArray(arg);
        } else {
            return Object.prototype.toString.call(arg) === '[object Array]';
        }
    }

    // The each() method executes a provided function once per array element.
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach
    A.each = function(a, f, o) {
        Native.forEach.call(a || [], f, o);
    };

    // The map() method creates a new array with the results of calling a provided function on every element in this array.
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map
    A.map = function(a, f, o) {
        return Native.map.call(a, f, o);
    };

    // The filter() method creates a new array with all elements that pass the test implemented by the provided function.
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter
    A.filter = function (a, f, o) {
        return Native.filter.call(a, f, o);
    }

    // The inverse of filter.
    A.reject = function (a, f, o) {
        return A.filter(a, function (item, i, a) {
            return !f.call(o, item, i, a);
        });
    }

    // The reduce() method applies a function against an accumulator and each value of the array (from left-to-right) has to reduce it to a single value.
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce
    A.reduce = function(a, init, f, o) {
        return Native.reduce.call(a, function (init, item, i, a) {
            return f.call(o, init, item, i, a);
        }, init);
    }

    // The every() method tests whether all elements in the array pass the test implemented by the provided function.
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/every
    A.every = function (a, f, o) {
        return Native.every.call(a, f, o);
    }

    // The some() method tests whether some element in the array passes the test implemented by the provided function.
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/some
    A.some = function(a, f, o) {
        return Native.some.call(a, f, o);
    }

    // The find() method returns a value in the array, if an 
    // element in the array satisfies the provided testing function. 
    // Otherwise undefined is returned.
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/find
    A.find = function (list, predicate, thisArg) {
        if (list == null) {
            throw new TypeError('array is null or undefined');
        }
        if (typeof predicate !== 'function') {
            throw new TypeError('predicate must be a function');
        }
        if (list.find) {
            return list.find(predicate, thisArg);
        }
        var len = list.length;
        for (var i = 0; i < len; i++) {
            if (predicate.call(thisArg, list[i], i, list)) {
                return list[i];
            }
        }
        return undefined;
    };

    // The findWhere() method returns a value found in the array object. 
    // Otherwise undefined is returned.
    A.findWhere = function(list, predicate, thisArg) {
        if (list == null) {
            throw new TypeError('array is null or undefined');
        }
        if (typeof predicate !== 'function') {
            throw new TypeError('predicate must be a function');
        }
        var len = list.length;
        for (var i = 0; i < len; i++) {
            var value = predicate.call(thisArg, list[i], i, list);
            if (value) {
                return value;
            }
        }
        return undefined;
    }

    // The findIndex() method returns an index in the array, if an 
    // element in the array satisfies the provided testing function. 
    // Otherwise -1 is returned.
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/findIndex
    A.findIndex = function (list, predicate, thisArg) {
        if (list == null) {
            throw new TypeError('array is null or undefined');
        }
        if (typeof predicate !== 'function') {
            throw new TypeError('predicate must be a function');
        }
        if (list.findIndex) {
            return list.findIndex(predicate, thisArg);
        }
        var len = list.length;
        for (var i = 0; i < len; i++) {
            if (predicate.call(thisArg, list[i], i, list)) {
                return i;
            }
        }
        return -1;
    };

    // The concat() method returns a new array comprised of this array joined with other array(s) and/or value(s).
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/concat
    A.concat = function (var_args) {
        return Native.concat.apply(Native, arguments);
    };

    // The splice() method changes the content of an array, adding new elements while removing old elements.
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/splice
    A.splice = function (arr, index, howMany, var_args) {
        Util.Asserts.assert(arr.length != null);
        return Native.splice.apply(arr, A.slice(arguments, 1));
    };

    // The slice() method returns a shallow copy of a portion of an array into a new array object.
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/slice
    A.slice = function (arr, start, opt_end) {
        Util.Asserts.assert(arr.length != null);

        // passing 1 arg to slice is not the same as passing 2 where the second is
        // null or undefined (in that case the second argument is treated as 0).
        // we could use slice on the arguments object and then use apply instead of
        // testing the length
        if (arguments.length <= 2) {
            return Native.slice.call(arr, start);
        } else {
            return Native.slice.call(arr, start, opt_end);
        }
    };

    // Check if an object is found in an array.
    A.contains = function (arr, obj) {
        return arr.indexOf(obj) >= 0;
    };

    // Clone an array
    A.clone = function(arr) {
        return arr.slice(0);
    }

    // Removes the array item in the given position.
    A.removeAt = function (arr, i) {
        // use generic form of splice
        // splice returns the removed items and if successful the length of that
        // will be 1
        return Array.prototype.splice.call(arr, i, 1).length == 1;
    };

    // Removes the array item matching the given value.
    A.remove = function (arr, obj) {
        var i = arr.indexOf(obj);
        var rv;
        if ((rv = i >= 0)) {
            A.removeAt(arr, i);
        }
        return rv;
    };

    A.clear = function (arr) {
        // For non real arrays we don't have the magic length so we delete the indices.
        if (!A.isArray(arr)) {
            for (var i = arr.length - 1; i >= 0; i--) {
                delete arr[i];
            }
        }

        arr.length = 0;
    };

    // Whether the array is empty.
    A.isEmpty = function (arr) {
        return arr.length == 0;
    };

    /**
     * Inserts an object at the given index of the array.
     * @param {goog.array.ArrayLike} arr The array to modify.
     * @param {*} obj The object to insert.
     * @param {number=} opt_i The index at which to insert the object. If omitted,
     *      treated as 0. A negative index is counted from the end of the array.
     */
    A.insertAt = function (arr, obj, opt_i) {
        A.splice(arr, opt_i, 0, obj);
    };

    // insert the target before the obj
    A.insertBefore = function (arr, obj, target) {
        var idx = arr.indexOf(obj);
        if (idx == -1) {
            return false;
        } else {
            if (idx == 0) {
                arr.unshift(target);
            } else {
                A.insertAt(arr, target, idx);
            }
            return true;
        }
    };

    // insert the target after the obj
    A.insertAfter = function (arr, obj, target) {
        var idx = arr.indexOf(obj);
        if (idx == -1) {
            return false;
        } else {
            if (idx == arr.length - 1) {
                arr.push(target);
            } else {
                A.insertAt(arr, target, idx + 1);
            }
            return true;
        }
    };
    
    /**
    Partitions an array into two new arrays, one with the items for which the
    supplied function returns `true`, and one with the items for which the function
    returns `false`.

    @method partition
    @param {Array} a Array to iterate over.
    @param {Function} f Function to execute for each item in the array. It will
      receive the following arguments:
        @param {Any} f.item Current item.
        @param {Number} f.index Index of the current item.
        @param {Array} f.array The array being iterated.
    @param {Object} [o] Optional execution context.
    @return {Object} An object with two properties: `matches` and `rejects`. Each is
      an array containing the items that were selected or rejected by the test
      function (or an empty array if none).
    @static
    */
    A.partition = function (a, f, o) {
        var results = {
            matches: [],
            rejects: []
        };

        A.each(a, function (item, index) {
            var set = f.call(o, item, index, a) ? results.matches : results.rejects;
            set.push(item);
        });

        return results;
    };

    /**
    Creates an array of arrays by pairing the corresponding elements of two arrays
    together into a new array.
    
    @method zip
    @param {Array} a Array to iterate over.
    @param {Array} a2 Another array whose values will be paired with values of the
      first array.
    @return {Array} An array of arrays formed by pairing each element of the first
      array with an item in the second array having the corresponding index.
    @static
    */
    A.zip = function (a, a2) {
        var results = [];
        A.each(a, function (item, index) {
            results.push([item, a2[index]]);
        });
        return results;
    };

    /**
     * Returns a copy of the array with the duplicate entries removed
     * @method Array.unique
     * @static
     * @param a {Array} the array to find the subset of uniques for
     * @param sort {bool} flag to denote if the array is sorted or not. Defaults to false, the more general operation
     * @return {Array} a copy of the array with duplicate entries removed
     */
    A.unique = function(a, sort) {
        // NOTE: This code comes from YUI3. Can we find something better?
        sort = sort ? sort : false;
        var uniqueList = a.slice(), i = 0, n = -1, item = null;
        if (sort) {
            while (i < uniqueList.length) {
                if (uniqueList[i] === item) {
                    n = (n == -1 ? i : n);
                    i += 1;
                } else if (n !== -1) {
                    uniqueList.splice(n, i - n);
                    i = n;
                    n = -1;
                } else {
                    item = uniqueList[i];
                    i += 1;
                }
            }
            return uniqueList;
        } else {
            while (i < uniqueList.length) {
                item = uniqueList[i];
                while ((n = uniqueList.lastIndexOf(item)) !== i) {
                    uniqueList.splice(n, 1);
                }
                i += 1;
            }
            return uniqueList;
        }
    };
    
    // get unique strings in an array fast
    A.uniqueStrings = function (list) {

        // create variables
        var bucket = {}, i, l = list.length, uniqueList = [];

        // create hash bucket of unique values
        for (i = 0; i < l; i++) {
            if (list[i] == null ||
                list[i].length == 0) {
                continue; // skip empty
            }
            bucket[list[i]] = null;
        }

        // add hash keys to unique list array
        for (key in bucket) {
            uniqueList.push(key);
        }

        return uniqueList;
    };

    // get the first element or default value
    A.first = function (arr, defaultValue) {
        var value = arr && arr[0];
        return (value != null) ? value :
               (defaultValue !== undefined) ? defaultValue : null;
    };

    // get the last element or default value
    A.last = function (arr, defaultValue) {
        var value = arr && arr[arr.length - 1];
        return (value != null) ? value :
               (defaultValue !== undefined) ? defaultValue : null;
    };

    // Returns the first defined value of the array passed in, or null.
    A.pick = function (values) {
        for (var i = 0, l = values.length; i < l; i++) {
            if (values[i] != null) {
                return values[i];
            }
        }
        return null;
    };

    /**
     * Returns the last element in an array without removing it.
     * @param {goog.array.ArrayLike} array The array.
     * @return {*} Last item in array.
     */
    A.peek = function (array) {
        return array[array.length - 1];
    };

    /**
    Flattens an array of nested arrays at any abitrary depth into a single, flat
    array.

    @method flatten
    @param {Array} a Array with nested arrays to flatten.
    @return {Array} An array whose nested arrays have been flattened.
    @static
    @since 3.7.0
    **/
    A.flatten = function (a) {
        var result = [],
            i, len, val;

        // Always return an array.
        if (!a) {
            return result;
        }

        for (i = 0, len = a.length; i < len; ++i) {
            val = a[i];

            if (A.isArray(val)) {
                // Recusively flattens any nested arrays.
                result.push.apply(result, A.flatten(val));
            } else {
                result.push(val);
            }
        }

        return result;
    };

    // Same as map() except the results are flattened. 
    A.mapFlatten = function (a, f, o) {
        return A.flatten(A.map(a, f, o));
    };

    /**
     * Compares its two arguments for order, using the built in < and >
     * operators.
     * @param {*} a The first object to be compared.
     * @param {*} b The second object to be compared.
     * @return {number} A negative number, zero, or a positive number as the first
     *     argument is less than, equal to, or greater than the second.
     */
    A.defaultCompare = function (a, b) {
        return a > b ? 1 : a < b ? -1 : 0;
    };

    // Numeric sort convenience function.
    A.numericSort = function (a, b) {
        return (a - b);
    };

    /**
     * Sorts the specified array into ascending order.  If no opt_compareFn is
     * specified, elements are compared using
     * <code>UA.defaultCompare</code>, which compares the elements using
     * the built in < and > operators.  This will produce the expected behavior
     * for homogeneous arrays of String(s) and Number(s), unlike the native sort,
     * but will give unpredictable results for heterogenous lists of strings and
     * numbers with different numbers of digits.
     *
     * This sort is not guaranteed to be stable.
     *
     * Runtime: Same as <code>Array.prototype.sort</code>
     *
     * @param {Array} arr The array to be sorted.
     * @param {Function=} opt_compareFn Optional comparison function by which the
     *     array is to be ordered. Should take 2 arguments to compare, and return a
     *     negative number, zero, or a positive number depending on whether the
     *     first argument is less than, equal to, or greater than the second.
     */
    A.sort = function (arr, opt_compareFn) {
        if (arr.length == null) {
            return;
        }
        Array.prototype.sort.call(arr, opt_compareFn || A.defaultCompare);
    };

    // The Fisher-Yates (aka Knuth) shuffle
    // https://github.com/coolaj86/knuth-shuffle
    A.shuffle = function (arr) {

        var currentIndex = arr.length,
            temporaryValue,
            randomIndex;

        // While there remain elements to shuffle...
        while (0 !== currentIndex) {

            // Pick a remaining element...
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;

            // And swap it with the current element.
            temporaryValue = arr[currentIndex];
            arr[currentIndex] = arr[randomIndex];
            arr[randomIndex] = temporaryValue;
        }

        return arr;
    };

    // The opposite of reduce. This method transforms an array to a new 
    // accumulator array which is the result of running the array values 
    // through a callback, with each callback execution potentially 
    // mutating the accumulator array.
    A.transform = function(arr, fn, accumulator) {
        accumulator = accumulator || [];
        if (fn) {
            arr.forEach(fn.bind(this, accumulator));
        }
        return accumulator;
    }

    Util.Array = A;

})(Util);

