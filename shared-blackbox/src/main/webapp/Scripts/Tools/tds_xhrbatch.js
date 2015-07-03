//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
/*
    Used to batch JSON commands to the server.
    C#: Requires TDS.Shared.WebApi (JsonBatchCommand)
    JS: Requires jquery and Q.js

    NOTES:
    - Requests object represents a collection of requests to send out. 
*/

window.tds = window.tds || {};

tds.XhrBatch = (function () {

    function Request(action, data, deferred) {
        this.action = action;
        this.data = data;
        this.deferred = deferred;
    }

    Request.prototype.dispose = function () {
        this.action = undefined;
        this.data = undefined;
        if (this.deferred) {
            if (this.deferred.promise.isPending()) {
                this.deferred.reject();
            }
            this.deferred = undefined;
        }
    };

    /************************************/

    function Requests() {
        this._list = [];
        this._locked = false;
    }

    Requests.prototype.lock = function () {
        this._locked = true;
    };

    Requests.prototype.unlock = function () {
        this._locked = false;
    };

    Object.defineProperty(Requests.prototype, 'locked', {
        get: function () {
            return this._locked;
        }
    });

    Object.defineProperty(Requests.prototype, 'empty', {
        get: function () {
            return this._list.length == 0;
        }
    });

    // add a new request
    Requests.prototype.add = function (action, data) {
        if (this._locked) {
            throw new Error('Requests collection is locked');
        }
        var deferred = Util.Promise.defer();
        this._list.push(new Request(action, data, deferred));
        return deferred.promise;
    };

    Requests.prototype.list = function() {
        return this._list;
    };

    Requests.prototype.resolveAll = function () {
        this._list.forEach(function(request) {
            request.deferred.resolve();
        });
    };

    Requests.prototype.rejectAll = function () {
        this._list.forEach(function(request) {
            request.deferred.reject();
        });
    };

    Requests.prototype.reset = function () {
        this._locked = false;
        this._list.forEach(function (request) {
            request.dispose();
        });
        this._list = [];
    };

    // serialize the requests that are ready to be sent to the server
    Requests.prototype.toJSON = function () {
        var json = {
            requests: this._list.map(function (request) {
                return {
                    action: request.action,
                    data: request.data
                }
            })
        };
        return JSON.stringify(json);
    };

    Requests.prototype.getAPI = function() {
        return {
            add: this.add.bind(this)
        }
    };

    /************************************/

    // xhr api accepts url/json and returns a promise 
    var xhrJquery = {
        // send xhr and return a promise
        send: function (url, json, timeout) {
            return Q($.ajax({
                type: 'POST',
                url: url,
                contentType: 'application/json; charset=utf-8',
                dataType: 'json',
                data: json,
                timeout: timeout
            }));
        }
    }

    function XhrBatch(batchUrl, timeout, xhrInterface) {
        this._url = batchUrl;
        this._xhrTimeout = timeout;
        this._xhrInterface = xhrInterface || xhrJquery;
    }
    
    XhrBatch.prototype.send = function (requests) {

        // if there are no requests then just return resolved promise
        if (requests.empty) {
            return Util.Promise.when([]);
        }

        // get json and send using xhr interface
        var json = requests.toJSON();
        var xhrPromise = this._xhrInterface.send(this._url, json, this._timeout);

        // create internal promise
        var sendDeferred = Util.Promise.defer();

        // wait for xhr to return
        xhrPromise.then(
            this._onSuccess.bind(this, requests, sendDeferred),
            this._onError.bind(this, requests, sendDeferred));

        return sendDeferred.promise;
    };

    // process xhr json batch response
    XhrBatch.prototype._onSuccess = function (requests, sendDeferred, json) {

        var responses = json.responses;

        // if no responses were returned then we got the wrong data
        if (typeof responses != 'object') {
            this._onError(requests, sendDeferred, null);
            return;
        }

        // map the responses to orginal requests
        var groups = requests.list().map(function (request, idx) {
            var response = responses[idx];
            return {
                request: request,
                response: response
            }
        });

        // process the xhr responses
        this._processResponses(groups);

        // create simplified public data
        var publicGroups = groups.map(function(group) {
            var request = group.request;
            var response = group.response;
            return {
                action: request.action,
                request: request.data,
                response: response ? response.data : undefined,
                error: response ? response.error : false
            }
        });

        sendDeferred.resolve(publicGroups);
    };

    // process error for the entire xhr request
    XhrBatch.prototype._onError = function (requests, sendDeferred, jqXhr) {
        requests.rejectAll();
        sendDeferred.reject(jqXhr);
    };

    XhrBatch.prototype._processResponses = function (groups) {
        groups.forEach(function (group) {
            var request = group.request;
            var response = group.response;
            var data = response ? response.data : undefined;
            if (response && response.error) {
                request.deferred.reject(data);
            } else {
                request.deferred.resolve(data);
            }
        }.bind(this));
    };
    
    XhrBatch.Requests = Requests;

    return XhrBatch;

})();