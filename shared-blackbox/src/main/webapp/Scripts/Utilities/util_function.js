// fix missing bind
if (!Function.prototype.bind) {
    Function.prototype.bind = function(oThis) {
        if (typeof this !== "function") {
            // closest thing possible to the ECMAScript 5 internal IsCallable function
            throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
        }

        var aArgs = Array.prototype.slice.call(arguments, 1),
            fToBind = this,
            fNOP = function() {
            },
            fBound = function() {
                return fToBind.apply(this instanceof fNOP && oThis
                    ? this
                    : oThis,
                    aArgs.concat(Array.prototype.slice.call(arguments)));
            };

        fNOP.prototype = this.prototype;
        fBound.prototype = new fNOP();

        return fBound;
    };
}

Util.Function = {};

// What is bind? http://www.sophomoredev.com/2009/09/exploring-yui-3-what-is-y-bind/
// And.. http://ejohn.org/blog/partial-functions-in-javascript/
Util.Function.bind = function(func, scope /* ... */) {

    function closure() {
        var cl_args = args.slice();

        for (var i = 0, i_max = arguments.length; i < i_max; i++) {
            cl_args.push(arguments[i]);
        }

        if (scope === null) {
			return func.apply(this, cl_args);
		} else {
			return func.apply(scope, cl_args);
		}
    }

    var args = [];
    scope = YAHOO.lang.isValue(scope) ? scope : null;

    for (var i = 2, i_max = arguments.length; i < i_max; i++) {
        args.push(arguments[i]);
    }

    return closure;
};

// alias becuase i don't know who is using this..
Util.bind = Util.Function.bind;