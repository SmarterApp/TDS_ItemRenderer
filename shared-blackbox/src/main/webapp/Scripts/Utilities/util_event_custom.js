Util = window.Util || {};
Util.Event = Util.Event || {};

(function (UE) {

    /**
     * Stores the subscriber information to be used when the event fires.
     * @param {Function} fn       The function to execute
     * @param {Object}   obj      An object to be passed along when the event fires
     * @param {boolean}  overrideContext If true, the obj passed in becomes the execution
     *                            context of the listener
     * @class Subscriber
     * @constructor
     */
    function Subscriber(fn, overrideContext, fireOnce) {
        
        /**
         * The callback that will be execute when the event fires
         * @property fn
         * @type function
         */
        this.fn = fn;

        /**
         * The default execution context for the event listener is defined when the
         * event is created (usually the object which contains the event).
         * By setting overrideContext to true, the execution context becomes the custom
         * object passed in by the subscriber.  If overrideContext is an object, that
         * object becomes the context.
         * @property overrideContext
         * @type boolean|object
         */
        this.overrideContext = overrideContext;

        // if this is true the subscriber will be unsubscribed once this is fired
        this.fireOnce = fireOnce;

    };

    /**
     * Returns the execution context for this listener. 
     * If overrideContext is an object, that is the
     * context, otherwise the default context will be used.
     * @method getScope
     * @param {Object} defaultScope the context to use if this listener does not
     *                              override it.
     */
    Subscriber.prototype.getScope = function (defaultScope) {
        if (this.overrideContext) {
            return this.overrideContext;
        }
        return defaultScope;
    };

    /**
     * Returns true if the fn and obj match this objects properties.
     * Used by the unsubscribe method to match the right subscriber.
     *
     * @method contains
     * @param {Function} fn the function to execute
     * @return {boolean} true if the supplied arguments match this
     *                   subscriber's signature.
     */
    Subscriber.prototype.contains = function (fn) {
        return (this.fn == fn);
    };

    ///////////////////////////////////////////////////////////////////////////////////

    /**
     * The CustomEvent class lets you define events for your application
     * that can be subscribed to by one or more independent component.
     *
     * @param {String}  type The type of event, which is passed to the callback
     *                  when the event fires
     * @param {Object}  context The context the event will fire from.  "this" will
     *                  refer to this object in the callback.  Default value:
     *                  the window object.  The listener can override this.
     * @param fireOnce {boolean} If configured to fire once, the custom event
     * will only notify subscribers a single time regardless of how many times
     * the event is fired.  In addition, new subscribers will be notified
     * immediately if the event has already been fired.
     * @namespace YAHOO.util
     * @class CustomEvent
     * @constructor
     */
    function CE(context, fireOnce) {

        /**
         * The context the event will fire from by default. Defaults to the window obj.
         * @property scope
         * @type object
         */
        this.scope = context || window;

        /**
         * If configured to fire once, the custom event will only notify subscribers
         * a single time regardless of how many times the event is fired.  In addition,
         * new subscribers will be notified immediately if the event has already been
         * fired.
         * @property fireOnce
         * @type boolean
         * @default false
         */
        this.fireOnce = fireOnce;

        /**
         * Indicates whether or not this event has ever been fired.
         * @property fired
         * @type boolean
         * @default false
         */
        this.fired = false;

        /**
         * For fireOnce events the arguments the event was fired with are stored
         * so that new subscribers get the proper payload.
         * @property firedWith
         * @type Array
         */
        this.firedWith = null;

        /**
         * The subscribers to this event
         * @property subscribers
         * @type Subscriber[]
         */
        this.subscribers = [];

        /**
         * In order to make it possible to execute the rest of the subscriber
         * stack when one thows an exception, the subscribers exceptions are
         * caught.  The most recent exception is stored in this property
         * @property lastError
         * @type Error
         */
        this.lastError = null;
    };
    
    /**
     * Subscribes the caller to this event
     * @method subscribe
     * @param {Function} fn        The function to execute
     * @param {boolean|Object} overrideContext If true, the obj passed in
     * becomes the execution.
     * context of the listener. If an object, that object becomes the execution
     * context.
     */
    CE.prototype.subscribe = function(fn, overrideContext, fireOnce) {

        if (!fn) {
            throw new Error("Invalid callback for subscriber");
        }

        var sub = new Subscriber(fn, overrideContext, fireOnce);

        if (this.fireOnce && this.fired) {
            this.notify(sub, this.firedWith);
        } else {
            this.subscribers.push(sub);
        }
    };

    /**
    * Unsubscribes subscribers.
    * @method unsubscribe
    * @param {Function} fn  The subscribed function to remove, if not supplied
    *                       all will be removed
    * @return {boolean} True if the subscriber was found and detached.
    */
    CE.prototype.unsubscribe = function(fn) {

        if (!fn) {
            return false;
        }

        var found = false;
        for (var i = 0, len = this.subscribers.length; i < len; ++i) {
            var sub = this.subscribers[i];
            if (sub && sub.contains(fn)) {
                this._delete(i);
                found = true;
            }
        }

        return found;
    };

    /**
    * Notifies the subscribers.  The callback functions will be executed
    * from the context specified when the event was created, and with the
    * following parameters:
    *   <ul>
    *   <li>The type of event</li>
    *   <li>All of the arguments fire() was executed with as an array</li>
    *   <li>The custom object (if any) that was passed into the subscribe()
    *       method</li>
    *   </ul>
    * @method fire
    * @param {Object*} arguments an arbitrary set of parameters to pass to
    *                            the handler.
    * @return {boolean} false if one of the subscribers returned false,
    *                   true otherwise
    */
    CE.prototype.fire = function() {

        this.lastError = null;
        var len = this.subscribers.length;
        var args = [].slice.call(arguments, 0), ret = true, i;

        if (this.fireOnce) {
            if (this.fired) {
                return true;
            } else {
                this.firedWith = args;
            }
        }

        this.fired = true;

        if (!len) {
            return true;
        }

        // make a copy of the subscribers so that there are
        // no index problems if one subscriber removes another.
        var subs = this.subscribers.slice();

        for (i = 0; i < len; ++i) {
            var sub = subs[i];
            if (sub && sub.fn) {
                ret = this.notify(sub, args);
                if (sub.fireOnce) {
                    this.unsubscribe(sub.fn);
                }
                if (false === ret) {
                    break;
                }
            }
        }

        return (ret !== false);
    };

    /**
    * Notifies the subscribers.  The callback functions will be executed
    * from the context specified when the event was created, and with the
    * following parameters:
    *   <ul>
    *   <li>The type of event</li>
    *   <li>All of the arguments fire() was executed with as an array</li>
    *   <li>The custom object (if any) that was passed into the subscribe()
    *       method</li>
    *   </ul>
    * @method fire
    * @param {Object*} arguments an arbitrary set of parameters to pass to
    *                            the handler.
    * @return {boolean} false if one of the subscribers returned false,
    *                   true otherwise
    */
    CE.prototype.notify = function (sub, args) {
        var scope = sub.getScope(this.scope);
        var ret = sub.fn.apply(scope, args);
        return ret;
    };

    /**
    * Removes all listeners
    * @method unsubscribeAll
    * @return {int} The number of listeners unsubscribed
    */
    CE.prototype.unsubscribeAll = function() {
        var l = this.subscribers.length, i;
        for (i = l - 1; i > -1; i--) {
            this._delete(i);
        }
        this.subscribers = [];
        return l;
    };

    /**
    * @method _delete
    * @private
    */
    CE.prototype._delete = function (index) {
        // get subscriber
        var sub = this.subscribers[index];
        // remove callback
        if (sub) {
            /*
            This is intended to prevent a callback later in the subscriber list from being invoked when you 
            are in the middle of firing and calls unsubscribe. The current behavior here was taken from YUI 
            and allows one subscriber to stop a later subscriber which could be considered helpful (or hacky).
            */
            delete sub.fn;
        }
        // remove subscriber from list
        this.subscribers.splice(index, 1);
    };

    // YAHOO.util.CustomEvent = CE;
    UE.Custom = CE;

})(Util.Event);
