//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
﻿if (typeof TDS != 'object') TDS = {};

TDS.XhrManager = (function(Util) {

    // A XHR base class for TDS.
    // Events: onRequest, onShowProgress, onHideProgress, onComplete, onError
    function TDSXhr(opt_timeoutInterval, opt_maxRetries, opt_scope) {

        TDSXhr.superclass.constructor.call(this, opt_timeoutInterval, opt_maxRetries, opt_scope);

        // events for showing/hiding progress screen
        this.Events.subscribe('onRequest', function (request) {
            var config = request.getArgs();
            if (config && config.showProgress) {
                this.Events.fire('onShowProgress');
            }
        });

        this.Events.subscribe('onComplete', function (request) {
            var config = request.getArgs();
            if (config && config.showProgress) {
                this.Events.fire('onHideProgress');
            }
        });

        // event for error checking
        this.Events.subscribe('onComplete', checkIfValid);
    };

    YAHOO.extend(TDSXhr, Util.XhrManager);

    TDSXhr.defaultErrorMessage = Messages.get('Messages.Label.XHRDefaultError') || 'There was a problem with your request.';
    
    TDSXhr.JsonReply = {
        OK: 0,
        Error: 1,
        Denied: 2,
        ReturnStatus: 3
    };

    TDSXhr.prototype.getUrl = function (action, data) {
        return null;
    };

    // send a XHR action
    // @data: form post
    // @callback: function to call when xhr is complete
    // @customConfig: object of options for xhr
    // @parameters: object of querystring
    TDSXhr.prototype.createAction = function (action, data, callback, customConfig, parameters) {

        var url = this.getUrl(action, data);

        // get parameters and add timestamp
        parameters = parameters || {};
        parameters.timestamp = Util.Date.now();

        // convert parameters into querystring and add to url
        var querystring = Util.QueryString.stringify(parameters);
        url += ((url.indexOf('?') == -1) ? '?' : '&') + querystring; // "timestamp=" + new Date().valueOf().toString();

        var method = 'POST';
        var content = null;

        if (YAHOO.lang.isString(data)) {
            // use raw form values
            content = data;
        }
        else if (YAHOO.lang.isObject(data)) {
            // convert object into form values
            content = Util.QueryString.stringify(data);
        }

        // create a function for receiving the callback
        var receiveActionCallback = function (request) {
            var json = request.getResponseJson();
            if (YAHOO.lang.isObject(json) && YAHOO.lang.isFunction(callback)) {
                callback(json.data, json);
            }
        };

        var request = this.createRequest(action, url, method, content, receiveActionCallback);

        // default config:
        var config = {
            showProgress: true, // show progress dialog
            showDialog: true, // show error dialog
            showError: false, // show returned error message if true, otherwise show generic
            allowRetry: true, // if the error is retriable then show retry button
            forceLogout: true // if retry is not allowed then once the error shows will get logged out
        };

        // custom config:
        if (YAHOO.lang.isObject(customConfig)) {
            config = YAHOO.lang.merge(config, customConfig);
        }

        request.setArgs(config); // set empty object as args

        return request;
    };

    // send a XHR action
    TDSXhr.prototype.sendAction = function (action, data, callback, customConfig, parameters) {
        var request = this.createAction(action, data, callback, customConfig, parameters);
        try {
            this.sendRequest(request);
        } catch (ex) {
            TDS.Diagnostics.report(ex);
        }
    };
    
    TDSXhr.prototype.sendPromise = function (action, postData, queryData, customConfig) {

        var url = this.getUrl(action, postData);

        // get parameters and add timestamp
        queryData = queryData || {};
        queryData.timestamp = Util.Date.now();

        // convert parameters into querystring and add to url
        var qs = Util.QueryString.stringify(queryData);
        url += ((url.indexOf('?') == -1) ? '?' : '&') + qs;

        // default config:
        var config = {
            showProgress: true, // show progress dialog
            showDialog: true, // show error dialog
            showError: false, // show returned error message if true, otherwise show generic
            allowRetry: true, // if the error is retriable then show retry button
            forceLogout: true, // if retry is not allowed then once the error shows will get logged out
            plainJson: false // regular json in and out
        };

        // custom config:
        if (YAHOO.lang.isObject(customConfig)) {
            config = YAHOO.lang.merge(config, customConfig);
        }

        var content = null;
        if (config.plainJson && YAHOO.lang.isObject(postData)) {
            // serialize json object
            config = JSON.stringify(postData);
        } else if (YAHOO.lang.isString(postData)) {
            // use raw string (form-urlencoded or json stringified)
            content = postData;
        } else if (YAHOO.lang.isObject(postData)) {
            // convert object into form values
            content = Util.QueryString.stringify(postData);
        }

        var defered = Util.Promise.defer();

        // this callback is used for the request and then calls the promise
        var callback = function (request) {
            var json = request.getResponseJson();
            if (request.isSuccess() && YAHOO.lang.isObject(json)) {
                if (config.plainJson) {
                    // plain json
                    defered.resolve(json);
                } else {
                    // custom JsonReply.cs
                    defered.resolve(json.data);
                }
            } else {
                defered.reject(request);
            }
        };

        var request = this.createRequest(action, url, 'POST', content, callback);
        request.setArgs(config); // set empty object as args

        this.sendRequest(request);

        return defered.promise;
    };

    // check a xhr response for errors (returning false from this function cancels)
    function checkIfValid(request) {

        // if the xhr was a success then we do not need to check for errors
        if (request.isSuccess()) return true;

        // get request config
        var config = request.getArgs();

        // if we are not showing errors then don't need to check
        if (config && !config.showDialog) return true;

        // check if server was able to respond with json error code and if so use that text for the error message
        var json = request.getResponseJson();

        // get error message
        var errorMessage;
        if (json && json.replyText) {
            errorMessage = json.replyText;
        } else {
            errorMessage = TDSXhr.defaultErrorMessage;
        }

        // check if we allow for retries
        var retriable = ((config && config.allowRetry) && request.allowRetry());

        // if the request cannot be retried check if we should logout
        var logout = (config && config.forceLogout);

        this.Events.fire('onError', request, errorMessage, retriable, logout);

        return false;
    }

    return TDSXhr;

})(window.Util);

