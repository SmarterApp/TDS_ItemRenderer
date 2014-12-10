// Object utilities

(function (Util) {

    var O = (Object.create) ? function(obj) {
        // We currently wrap the native Object.create instead of simply aliasing it
        // to ensure consistency with our fallback shim, which currently doesn't
        // support Object.create()'s second argument (properties). Once we have a
        // safe fallback for the properties arg, we can stop wrapping
        // Object.create().
        return Object.create(obj);
    } : (function() {
        // Reusable constructor function for the Object.create() shim.
        function F() {}

        // The actual shim.
        return function(obj) {
            F.prototype = obj;
            return new F();
        };
    }());

    // return all the keys that belong to the instance of this object
    O.keys = function (object) {
        if (Object.keys) {
            return Object.keys(object);
        } else {
            var keys = [];
            for (var key in object) {
                if (object.hasOwnProperty(key)) {
                    keys.push(key);
                }
            }
            return keys;
        }
    };

    O.getKeys = O.keys;

    // return all this objects values
    O.values = function (object) {
        var values = [];
        for (var key in object) {
            if (object.hasOwnProperty(key)) {
                values.push(object[key]);
            }
        }
        return values;
    };

    O.getValues = O.values;

    // check if object has no keys
    O.isEmpty = function (object) {
        for (var key in object) {
            if (object.hasOwnProperty(key)) {
                return false;
            }
        }
        return true;
    };

    // Removes a key-value pair based on the key.
    O.remove = function (obj, key) {
        var rv;
        if ((rv = key in obj)) {
            delete obj[key];
        }
        return rv;
    };

    O.clear = function(obj) {
        Object.keys(obj).forEach(function(key) {
            delete obj[key];
        });
    };

    // Safe way to clone native objects.
    // NOTE: Something like http://stackoverflow.com/a/12593036 DOES NOT WORK in ipad/fx
    // NOTE: Check out implementing: https://github.com/bestiejs/lodash/blob/master/lodash.js#L959
    // NOTE: You can also use JSON.parse(JSON.stringify(obj)) for cloning.
    O.clone = function (obj) {

        if (obj == null || typeof (obj) != 'object') {
            return obj;
        }
        var newObj = {};

        for (var prop in obj) {

            (function (prop) {

                if (typeof obj[prop] == 'function') {
                    // must call native function directly or FX throws WrappedNative error
                    newObj[prop] = function () {
                        obj[prop]();
                    };
                } else {
                    // set value
                    newObj[prop] = obj[prop];
                }

            })(prop);
        }

        return newObj;
    };

    // The Object.isFrozen() determines if an object is frozen.
    O.isFrozen = function(obj) {
        return (Object.isFrozen) ? Object.isFrozen(obj) : false;
    };

    /*
    The Object.freeze() method freezes an object: that is, prevents new properties from being added to it; 
    prevents existing properties from being removed; and prevents existing properties, or their enumerability, 
    configurability, or writability, from being changed. In essence the object is made effectively immutable. 
    */
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/freeze
    O.freeze = (Object.freeze) ? function(obj) {
        return Object.freeze(obj);
    } : function(obj) {
        return obj;
    };

    // To make obj fully immutable, freeze each object in obj.
    O.deepFreeze = (Object.freeze) ? function(obj) {
        var prop, propKey;
        Object.freeze(obj); // First freeze the object.
        for (propKey in obj) {
            prop = obj[propKey];
            if (obj.hasOwnProperty(propKey) && prop instanceof Object && !O.isFrozen(prop)) {
                // If the object is on the prototype, not an object, or is already frozen, 
                // skip it. Note that this might leave an unfrozen reference somewhere in the
                // object if there is an already frozen object containing an unfrozen object.
                O.deepFreeze(prop); // Recursively call deepFreeze.
            }
        }
        return obj;
    } : function(obj) {
        return obj;
    };

    Util.Object = O;

})(Util);

// YUI 3 functions
// \yui3\src\yui\js\yui-core.js
// \yui3\src\yui\js\yui-object.js
(function(O) {

    var OP = Object.prototype;
    var hasOwn = OP.hasOwnProperty;
    
    function owns (obj, key) {
        return !!obj && hasOwn.call(obj, key);
    }

    O.each = function(obj, fn, thisObj, proto) {
        var key;
        for (key in obj) {
            if (proto || owns(obj, key)) {
                fn.call(thisObj || window, obj[key], key, obj);
            }
        }
    };

    /*
    YUI2 comparison: https://yuilibrary.com/yui/docs/yui/yui-mix.html

    Much like augment
    mix works in similar fashion to augment. In fact, augment uses mix under the hood. 
    However, rather than adding functionality to class definitions (i.e. function prototypes), 
    mix can work with any object, including object literals and class instances.

    See augment and extend for other techniques to help manage your code structure.

    */

    /**
    Mixes _supplier_'s properties into _receiver_.

    Properties on _receiver_ or _receiver_'s prototype will not be overwritten or
    shadowed unless the _overwrite_ parameter is `true`, and will not be merged
    unless the _merge_ parameter is `true`.

    In the default mode (0), only properties the supplier owns are copied (prototype
    properties are not copied). The following copying modes are available:

      * `0`: _Default_. Object to object.
      * `1`: Prototype to prototype.
      * `2`: Prototype to prototype and object to object.
      * `3`: Prototype to object.
      * `4`: Object to prototype.

    @method mix
    @param {Function|Object} receiver The object or function to receive the mixed
      properties.
    @param {Function|Object} supplier The object or function supplying the
      properties to be mixed.
    @param {Boolean} [overwrite=false] If `true`, properties that already exist
      on the receiver will be overwritten with properties from the supplier.
    @param {String[]} [whitelist] An array of property names to copy. If
      specified, only the whitelisted properties will be copied, and all others
      will be ignored.
    @param {Number} [mode=0] Mix mode to use. See above for available modes.
    @param {Boolean} [merge=false] If `true`, objects and arrays that already
      exist on the receiver will have the corresponding object/array from the
      supplier merged into them, rather than being skipped or overwritten. When
      both _overwrite_ and _merge_ are `true`, _merge_ takes precedence.
    @return {Function|Object|YUI} The receiver, or the YUI instance if the
      specified receiver is falsy.
    **/
    O.mix = function (receiver, supplier, overwrite, whitelist, mode, merge) {

        var alwaysOverwrite, exists, from, i, key, len, to;

        // If no supplier is given, we return the receiver. If no receiver is given,
        // we return Y. Returning Y doesn't make much sense to me, but it's
        // grandfathered in for backcompat reasons.
        if (!receiver || !supplier) {
            return receiver || {};
        }

        if (mode) {
            // In mode 2 (prototype to prototype and object to object), we recurse
            // once to do the proto to proto mix. The object to object mix will be
            // handled later on.
            if (mode === 2) {
                O.mix(receiver.prototype, supplier.prototype, overwrite, whitelist, 0, merge);
            }

            // Depending on which mode is specified, we may be copying from or to
            // the prototypes of the supplier and receiver.
            from = mode === 1 || mode === 3 ? supplier.prototype : supplier;
            to = mode === 1 || mode === 4 ? receiver.prototype : receiver;

            // If either the supplier or receiver doesn't actually have a
            // prototype property, then we could end up with an undefined `from`
            // or `to`. If that happens, we abort and return the receiver.
            if (!from || !to) {
                return receiver;
            }
        } else {
            from = supplier;
            to = receiver;
        }

        // If `overwrite` is truthy and `merge` is falsy, then we can skip a
        // property existence check on each iteration and save some time.
        alwaysOverwrite = overwrite && !merge;

        if (whitelist) {
            for (i = 0, len = whitelist.length; i < len; ++i) {
                key = whitelist[i];

                // We call `Object.prototype.hasOwnProperty` instead of calling
                // `hasOwnProperty` on the object itself, since the object's
                // `hasOwnProperty` method may have been overridden or removed.
                // Also, some native objects don't implement a `hasOwnProperty`
                // method.
                if (!hasOwn.call(from, key)) {
                    continue;
                }

                // The `key in to` check here is (sadly) intentional for backwards
                // compatibility reasons. It prevents undesired shadowing of
                // prototype members on `to`.
                exists = alwaysOverwrite ? false : key in to;

                if (merge && exists && isObject(to[key], true)
                        && isObject(from[key], true)) {
                    // If we're in merge mode, and the key is present on both
                    // objects, and the value on both objects is either an object or
                    // an array (but not a function), then we recurse to merge the
                    // `from` value into the `to` value instead of overwriting it.
                    //
                    // Note: It's intentional that the whitelist isn't passed to the
                    // recursive call here. This is legacy behavior that lots of
                    // code still depends on.
                    O.mix(to[key], from[key], overwrite, null, 0, merge);
                } else if (overwrite || !exists) {
                    // We're not in merge mode, so we'll only copy the `from` value
                    // to the `to` value if we're in overwrite mode or if the
                    // current key doesn't exist on the `to` object.
                    to[key] = from[key];
                }
            }
        } else {
            for (key in from) {
                // The code duplication here is for runtime performance reasons.
                // Combining whitelist and non-whitelist operations into a single
                // loop or breaking the shared logic out into a function both result
                // in worse performance, and Y.mix is critical enough that the byte
                // tradeoff is worth it.
                if (!hasOwn.call(from, key)) {
                    continue;
                }

                // The `key in to` check here is (sadly) intentional for backwards
                // compatibility reasons. It prevents undesired shadowing of
                // prototype members on `to`.
                exists = alwaysOverwrite ? false : key in to;

                if (merge && exists && isObject(to[key], true)
                        && isObject(from[key], true)) {
                    O.mix(to[key], from[key], overwrite, null, 0, merge);
                } else if (overwrite || !exists) {
                    to[key] = from[key];
                }
            }
        }

        return receiver;
    };
    
})(Util.Object);

// Add JSON object if it does not exist
(function (JSON) {
    if (typeof JSON != 'object' &&
        typeof YAHOO == 'object') {
        JSON = {};
        JSON.stringify = YAHOO.lang.JSON.stringify;
        JSON.parse = YAHOO.lang.JSON.parse;
    }
})(window.JSON, window.YAHOO);
