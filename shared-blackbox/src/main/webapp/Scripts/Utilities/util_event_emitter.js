(function(UE) {

    function augment(obj) {

        var events = new Emitter(obj);

        obj.on = function (name, fn) {
            return events.on(name, fn);
        }

        obj.once = function (name, fn) {
            return events.once(name, fn);
        }

        obj.fire = function (name) {
            var args = Array.prototype.slice.call(arguments, 0);
            return events.fire.apply(events, args);
        }

        obj.fireArgs = function (name, args) {
            return events.fire.apply(events, name, args);
        }

        obj.removeListener = function (name, fn) {
            return events.removeListener(name, fn);
        }

        obj.removeAllListeners = function () {
            return events.removeAllListeners();
        }

        return events;

    }

    /**
     * EventProvider is designed to be used with YAHOO.augment to wrap
     * CustomEvents in an interface that allows events to be subscribed to
     * and fired by name.  This makes it possible for implementing code to
     * subscribe to an event that either has not been created yet, or will
     * not be created at all.
     *
     * @Class EventProvider
     */
    function Emitter(context) {

        if (!(this instanceof Emitter)) {
            return augment(context);
        }

        this.scope = context || window;
        this._events = {};
        this._subscribers = {};
    };

    /**
    * Subscribe to a CustomEvent by event type
    *
    * @method subscribe
    * @param p_type     {string}   the type, or name of the event
    * @param p_fn       {function} the function to exectute when the event fires
    * @param overrideContext {boolean}  If true, the obj passed in becomes the
    *                              execution scope of the listener
    */
    Emitter.prototype.addListener = function(p_type, p_fn, overrideContext, fireOnce) {

        overrideContext = overrideContext || this.scope;
        var ce = this._events[p_type];

        // check if event was created
        if (ce) {
            ce.subscribe(p_fn, overrideContext, fireOnce);
        } else {
            // since the event was not created let's wait until it is
            var subs = this._subscribers;
            if (!subs[p_type]) {
                subs[p_type] = [];
            }
            subs[p_type].push({
                fn: p_fn,
                overrideContext: overrideContext,
                fireOnce: fireOnce
            });
        }
    };

    Emitter.prototype.on = Emitter.prototype.addListener;

    Emitter.prototype.once = function(p_type, p_fn, overrideContext) {
        this.addListener(p_type, p_fn, overrideContext, true);
    }

    /**
    * Unsubscribes one or more listeners the from the specified event
    * @method removeListener
    * @param p_type {string}   The type, or name of the event.  If the type
    *                          is not specified, it will attempt to remove
    *                          the listener from all hosted events.
    * @param p_fn   {Function} The subscribed function to unsubscribe, if not
    *                          supplied, all subscribers will be removed.
    * @return {boolean} true if the subscriber was found and detached.
    */
    Emitter.prototype.removeListener = function (p_type, p_fn) {
        if (!p_type) return false;
        var ce = this._events[p_type];
        if (ce) {
            return ce.unsubscribe(p_fn);
        } else {
            var arr = this._subscribers[p_type];
            if (arr) {
                delete this._subscribers[p_type];
                return true;
            }
        }
        return false;
    }

    /**
    * Removes all listeners from the specified event.  If the event type
    * is not specified, all listeners from all hosted custom events will
    * be removed.
    * @method unsubscribeAll
    * @param p_type {string}   The type, or name of the event
    */
    Emitter.prototype.removeAllListeners = function (p_type, p_fn) {
        var evts = this._events;
        var subs = this._subscribers;

        if (p_type) {
            return this.removeListener(p_type, p_fn);
        }

        var ret = false;

        // remove all events
        for (p_type in evts) {
            if (YAHOO.lang.hasOwnProperty(evts, p_type)) {
                if (evts[p_type].unsubscribe(p_fn)) {
                    ret = true;
                }
            }
        }

        // if no events were found then remove all subscribers in the queue
        if (!ret) {
            for (p_type in subs) {
                if (YAHOO.lang.hasOwnProperty(subs, p_type)) {
                    if (p_fn) {
                        // TODO: Delete only matching functions in the queue
                        var qs = subs[p_type]; // <-- queue
                    } else {
                        delete subs[p_type];
                    }
                }
            }
        }

        return ret;
    };
    
    /**
    * Creates a new custom event of the specified type.  If a custom event
    * by that name already exists, it will not be re-created.  In either
    * case the custom event is returned.
    *
    * @method create
    *
    * @param p_type {string} the type, or name of the event
    * @param p_config {object} optional config params.  Valid properties are:
    *
    *  <ul>
    *    <li>
    *      scope: defines the default execution scope.  If not defined
    *      the default scope will be this instance.
    *    </li>
    *    <li>
    *      fireOnce: if true, the custom event will only notify subscribers
    *      once regardless of the number of times the event is fired.  In
    *      addition, new subscribers will be executed immediately if the
    *      event has already fired.
    *      This is false by default.
    *    </li>
    *    <li>
    *      onSubscribeCallback: specifies a callback to execute when the
    *      event has a new subscriber.  This will fire immediately for
    *      each queued subscriber if any exist prior to the creation of
    *      the event.
    *    </li>
    *  </ul>
    *
    *  @return {CustomEvent} the custom event
    *
    */
    Emitter.prototype.create = function(p_type, p_config) {

        var opts = p_config || {},
            events = this._events;

        var ce = events[p_type];

        if (!ce) {

            ce = new UE.Custom(opts.scope || this.scope, opts.fireOnce);
            events[p_type] = ce;

            var qs = this._subscribers[p_type];
            if (qs) {
                for (var i = 0; i < qs.length; ++i) {
                    ce.subscribe(qs[i].fn, qs[i].overrideContext, qs[i].fireOnce);
                }
            }
        }

        return ce;
    };

    /**
    * Fire a custom event by name.  The callback functions will be executed
    * from the scope specified when the event was created, and with the
    * following parameters:
    *   <ul>
    *   <li>The first argument fire() was executed with</li>
    *   <li>The custom object (if any) that was passed into the subscribe()
    *       method</li>
    *   </ul>
    * @method fire
    * @param p_type    {string}  the type, or name of the event
    * @param arguments {Object*} an arbitrary set of parameters to pass to
    *                            the handler.
    * @return {boolean} the return value from CustomEvent.fire
    *
    */
    Emitter.prototype.fire = function(p_type) {
        var ce = this._events[p_type];
        if (!ce) {
            ce = this.create(p_type);
        }
        var args = Array.prototype.slice.call(arguments, 1);
        return ce.fire.apply(ce, args);
    };

    Emitter.prototype.fireArgs = function (p_type, args) {
        var ce = this._events[p_type];
        if (!ce) {
            ce = this.create(p_type);
        }
        return ce.fire.apply(ce, args);
    };

    /**
    * Returns true if the custom event of the provided type has been created
    * with create().
    * @method has
    * @param type {string} the type, or name of the event
    */
    Emitter.prototype.has = function(type) {
        if (this._events[type]) {
            return true;
        }
        return false;
    };
    
    UE.Emitter = Emitter;

})(Util.Event);

