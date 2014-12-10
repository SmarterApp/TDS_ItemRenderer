(function(Util) {

    // A generic event manager where you can fire/subscribe to events that might not exist.
    // NOTE: Uses YUI event provider internally.
    function EM(context) {
        this._context = context || null; // global context
        this._events = new YAHOO.util.EventProvider();
    };

    EM.prototype.subscribe = function (name, func, overrideContext) {

        if (!YAHOO.lang.isString(name)) {
            return false;
        }
        if (!YAHOO.lang.isFunction(func)) {
            return false;
        }

        // lazily create the actual event if it does not exist
        if (!this._events.hasEvent(name)) {
            // set a default context to event if it exists
            if (this._context) {
                this._events.createEvent(name, {
                    scope: this._context
                });
            } else {
                this._events.createEvent(name);
            }
        }

        // YUI event will fire with an array of args
        function yuiFunc(args /*array*/) {
            // map array of args as function arguments instead of an array
            // WARNING: If event subscriber returns false from here then it cancels all other subscribers
            var ret;
            if (args) {
                ret = func.apply(this, args);
            } else {
                ret = func.call(this);
            }

            // if this event is cancellable then return the callback value
            return ret;
        };

        // subscribe to event
        this._events.subscribe(name, yuiFunc, null, overrideContext || this._context);
        return true;
    };

    EM.prototype.on = EM.prototype.subscribe;

    EM.prototype.unsubscribe = function (name, func) {
        return this._events.unsubscribe(name, func);
    }

    // fire event using array
    EM.prototype.fireArgs = function (name, args /*array*/) {
        return this._events.fireEvent(name, args);
    };

    // fire event using arguments
    EM.prototype.fire = function (name /* ... */) {
        var args = Array.prototype.slice.call(arguments, 1);
        return this.fireArgs(name, args);
    };
    
    Util.EventManager = EM;

})(Util);

