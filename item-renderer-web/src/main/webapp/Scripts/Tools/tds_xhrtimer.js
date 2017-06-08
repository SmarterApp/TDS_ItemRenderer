//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
/*
    Timer for aggregating data and sending it out on a timer.
    JS: Requires tds.XhrBatch and tds.PromiseTimer.
*/

window.tds = window.tds || {};

tds.XhrTimer = (function () {

    /**
     * A registered entry into the timer. We use this to look up folks who want to send data.
     * @param {number} maxTicks The # of ticks to wait until considered ready.
     * @param {requestCallback} callback Call this function with requests object when ready. 
     * @constructor
     */
    function Entry(maxTicks, callback) {
        this._ticks = 0;
        this._maxTicks = maxTicks;
        this._callback = callback;
    }

    Object.defineProperty(Entry.prototype, 'ready', {
        get: function () {
            return this._ticks >= this._maxTicks;
        }
    });

    Entry.prototype.tick = function () {
        return ++this._ticks;
    };

    Entry.prototype.reset = function () {
        this._ticks = 0;
    };

    Entry.prototype.check = function (api) {
        this._callback(api, false);
    };

    Entry.prototype.dispose = function () {
        this._callback = null;
    };

    /**
     * Used to coordinate calling xhrbatch api on a timer.
     * @param {object} xhrBatch tds.XhrBatch instance. 
     * @param {object} promiseTimer tds.PromiseTimer instance. 
     * @constructor
     */
    function XhrTimer(xhrBatch, promiseTimer) {
        this._xhrBatch = xhrBatch;
        this._timer = promiseTimer;
        this._entries = [];
        this._xhrPromise = null; // last send promise
    }

    // register a function that we can call when we need data
    XhrTimer.prototype.register = function (maxTicks, callback) {
        this._entries.push(new Entry(maxTicks, callback));
    };

    XhrTimer.prototype.start = function () {
        return this._timer.start(this._onTick.bind(this, false));
    };

    XhrTimer.prototype.stop = function () {
        return this._timer.stop();
    };

    XhrTimer.prototype.clear = function () {
        this._entries.forEach(function (entry) {
            entry.dispose();
        });
        this._entries = [];
    };

    /**
     * Call this to check all entries for data to put in the batch api.
     * @param {boolean} manual If this is true then we force all entries to be checked regardless if they are ready.
     * @param {requestCallback} callback Optional function to call with the batch api to collect more data.
     * @param {object} api A custom Requests collection.
     */
    XhrTimer.prototype._getRequests = function (manual, callback) {

        var requests = new tds.XhrBatch.Requests();

        // check all registered entries
        this._entries.forEach(function (entry) {
            entry.tick();
            if (manual || entry.ready) {
                entry.reset();
                try {
                    entry.check(requests);
                } catch (ex) {
                    // TODO: We don't want to stop everyone else from being called. But what do we do here?
                    console.warn('Error processing xhr timer entry. ', entry, ex);
                }
            }
        });

        // check manual callback
        if (typeof callback == 'function') {
            try {
                callback(requests);
            } catch (ex) {
                // TODO: Someone messed up adding data
                console.warn('XhrTimer: Send callback failed', ex);
            }
        }

        return requests;
    };

    /**
     * Helper function for sending the batch xhr and save promise.
     * @param {object} requests The requests object.
     * @returns {object} A promise for when the xhr is completed. 
     */
    XhrTimer.prototype._sendXhr = function (requests) {
        this._xhrPromise = this._xhrBatch.send(requests);
        return this._xhrPromise;
    };

    /**
     * This is called when the timer interval occurs.
     * @returns {object} A promise for when the xhr is completed. 
     */
    XhrTimer.prototype._onTick = function () {
        var requests = this._getRequests(false, null);
        return this._sendXhr(requests);
    };

    /**
     * A helper function for waiting until xhr is completed.
     * @param {requestCallback} callback Call this function when xhr promise is completed.
     * @returns {object} A promise for when the xhr is completed. 
     */
    XhrTimer.prototype._wait = function (callback) {
        return Util.Promise.when(this._xhrPromise).finally(callback);
    };

    /**
     * Wait for any existing xhr to finish and then manually get requests and them to the server.
     * @param {requestCallback} callback Optional function to call with the batch api to collect more data.
     * @param {boolean} stopTimer If this is true the timer will be stopped. 
     * @returns {object} Promise 
     */
    XhrTimer.prototype.send = function (callback, stopTimer) {

        var self = this;
        
        // wait for current xhr to finish
        return this._wait(function () {

            // stop timer while we work
            var paused = self.stop();

            // collect up all the requests
            var requests = self._getRequests(true, callback);

            // send xhr
            return self._sendXhr(requests).finally(function () {
                // clear requests
                requests.reset();
                // restart timer if it was stopped
                if (paused && !stopTimer) {
                    self.start();
                }
            });
        });

    };

    /**
     * Wait for any existing xhr to finish and then manually get requests and return json.
     * This json can be used in another ajax library (e.x., TDS.XhrManager).
     * @param {} callback Optional function to call with the batch api to collect more data.
     * @param {} stopTimer If this is true the timer will be stopped. 
     * @returns {} 
     */
    XhrTimer.prototype.requestJSON = function (callback, stopTimer) {

        // create a new promise for returning the json
        var deferred = Util.Promise.defer();

        // wait for current xhr to finish
        this._wait(function () {
            try {
                // stop timer while we work
                var paused = self.stop();
                // collect up all the requests
                var requests = this._getRequests(true, callback);
                // restart timer if it was stopped
                if (paused && !stopTimer) {
                    self.start();
                }
                // get json from the requests
                var json = requests.toJSON();
                // clear requests
                requests.reset();
                // resolve promise with json
                deferred.resolve(json);
            } catch (ex) {
                // reject promise
                deferred.reject(ex);
            }
        }.bind(this));

        return deferred.promise;
    };

    // factory function
    XhrTimer.create = function (xhrUrl, xhrTimeout, timerInterval, timerTimeout) {

        if (typeof xhrUrl != 'string') {
            throw new Error('Must provide timer url');
        }

        if (!(xhrTimeout > 0)) {
            throw new Error('Must provide valid xhr timeout');
        }

        if (!(timerInterval > 0)) {
            throw new Error('Must provide valid timer interval');
        }

        if (timerInterval > 0 && xhrTimeout > timerTimeout) {
            throw new Error('Timer timeout cannot be less than or the same as xhr timeout');
        }

        var xhrBatch = new tds.XhrBatch(xhrUrl, xhrTimeout);
        var promiseTimer = new tds.PromiseTimer(timerInterval, timerTimeout);
        return new XhrTimer(xhrBatch, promiseTimer);
    }

    return XhrTimer;

})();
