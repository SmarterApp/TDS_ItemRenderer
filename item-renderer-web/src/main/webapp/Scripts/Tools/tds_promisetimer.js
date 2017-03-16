//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
/*
    Timer for executing a promise on an interval.
*/

window.tds = window.tds || {};

tds.PromiseTimer = (function () {

    var debug = false;

    function log(msg) {
        if (debug) {
            console.log('Timer: %s', msg);
        }
    }

    // on a delay call a function that returns a promise
    function Timer(interval, timeout) {
        this._interval = interval || 0; // interval to call the timer
        this._timeout = timeout || 0; // how long to wait for promise
        this._promiseFactory = null; // function to run when timer is triggered
        this._enabled = false; // is the timer enabled?
        this._waiting = false; // are we waiting for timer?
        this._running = false; // are we waiting for promise?
        this._id = null; // the current setTimeout id
    }

    // is the timer enabled
    Timer.prototype.isEnabled = function() {
        return this._enabled;
    };

    // are we waiting for the timer
    Timer.prototype.isWaiting = function () {
        return this._waiting;
    };

    // is the promise running
    Timer.prototype.isRunning = function () {
        return this._running;
    };

    Timer.prototype._setTimeout = function() {
        // stop current timer
        this._clearTimeout();
        // check if ping is enabled and we aren't currently waiting on the promise
        if (this._enabled && !this._running) {
            // start timer for ping
            log('timer start');
            this._waiting = true;
            this._id = setTimeout(this._onTick.bind(this), this._interval);
        }
    };

    Timer.prototype._clearTimeout = function () {
        if (this._id) {
            log('timer stop');
            clearTimeout(this._id);
            this._id = null;
        }
    };

    // this is called when timer is triggered
    Timer.prototype._onTick = function () {
        log('timer ready');
        this._waiting = false;
        this._exec();
    };

    // execute the function that returns a promise
    Timer.prototype._exec = function() {

        // stop current timer
        this._clearTimeout();

        // if we are already waiting on promise then ignore
        if (this._running) {
            return false;
        }

        // mark as busy
        log('promise start');
        this._running = true;

        // execute function and wait for promise
        var promise = null;

        try {
            promise = this._promiseFactory();
        } catch (ex) {
            // TODO: What do we do?
            console.warn('Error calling promise factory. ', ex);
        }
        
        // make sure promise
        promise = Util.Promise.when(promise);

        // set timeout
        if (this._timeout > 0) {
            // NOTE: this doesn't stop the promise from the factory from completing, however we will ignore it when it does
            promise = promise.timeout(this._timeout);
        }

        // wait for done
        promise.finally(this._execDone.bind(this));
        
        return true;
    };

    Timer.prototype._execDone = function() {
        log('promise done');
        this._running = false;
        this._setTimeout();
    };

    Timer.prototype.start = function (promiseFactory) {

        if (typeof promiseFactory != 'function') {
            throw new Error('Timer must be started with a promise factory function.');
        }

        this._promiseFactory = promiseFactory;

        // if the timer is already enabled or nobody set proper timeout then leave
        if (this._enabled || this._interval == 0) {
            return false;
        }

        // start timer
        this._enabled = true;
        this._setTimeout();

        return true;
    };

    Timer.prototype.stop = function () {

        // if timer is already disabled then leave
        if (!this._enabled) {
            return false;
        }

        this._promiseFactory = null;

        // stop timer
        this._enabled = false;
        this._clearTimeout();

        return true;
    };

    Object.defineProperty(Timer, 'debug', {
        get: function() {
            return debug;
        },
        set: function (value) {
            debug = typeof value == 'boolean' ? value : false;
        }
    });
    
    return Timer;

})();