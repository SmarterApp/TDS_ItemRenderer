// REQUIRES: util_event.js, util_array.js, util_structs.js

// A manager for dealing with YUI connection (XHR)
Util.XhrManager = function(opt_timeoutInterval, opt_maxRetries, opt_scope)
{
    // Timeout (in ms) before aborting an attempt (Default: NULL).
    this._timeoutInterval = opt_timeoutInterval; // null means no timeout

    // Maximum number of retries for a given request
    this._maxRetries = YAHOO.lang.isNumber(opt_maxRetries) ? Math.max(0, opt_maxRetries) : 0;

    // Map of ID's to requests.
    this._requests = new Util.Structs.Map();

    // optional default scope
    this._scope = opt_scope;

    // EVENTS: 
    // * onRequest - xhr requested
    // * onSent - xhr was sent out
    // * onComplete - xhr completed (success or failure)
    // * onSuccess - xhr was successful
    // * onFailure - xhr failed (but might be retried)
    // * onAbort - xhr manually stopped
    this.Events = new Util.EventManager(this);
};

Util.XhrManager.prototype.inProgress = function(id)
{
    return this._requests.containsKey(id);
};

// Returns the number of requests in flight
Util.XhrManager.prototype.getOutstandingCount = function()
{
    return this._requests.getCount();
};

// sends an XHR request with a specific ID
Util.XhrManager.prototype.createRequest = function(id, url, opt_method, opt_content, opt_callback, opt_scope, opt_timeout, opt_maxRetries)
{
    // Make the Request object.
    var request = new Util.XhrManager.Request(
        id,
        url,
        opt_method,
        opt_content,
        opt_callback,
        opt_scope || this._scope,
        (YAHOO.lang.isNumber(opt_timeout) ? opt_timeout : this._timeoutInterval),
        (YAHOO.lang.isNumber(opt_maxRetries) ? opt_maxRetries : this._maxRetries));

    return request;
};

// sends an XHR request with a specific ID
Util.XhrManager.prototype.send = function(id, url, opt_method, opt_content, opt_callback, opt_scope, opt_timeout, opt_maxRetries)
{
    // create the request object
    var request = this.createRequest(id, url, opt_method, opt_content, opt_callback, opt_scope, opt_timeout, opt_maxRetries);

    // send request object
    this.sendRequest(request);

    return request;
};

// sends a previous request XHR
Util.XhrManager.prototype.sendRequest = function(request)
{
    // get request id
    var id = request.getId();

    if (this.inProgress(id)) throw Error("XhrManager ID in use");

    // reset request 
    request.resetAttemptCount();
    request.setCompleted(false);
    request.setAborted(false);

    // fire request event
    this.Events.fire('onRequest', request);

    this._requests.set(id, request);
    this._retry(id);
};

// this function is used to trigger XHR request
Util.XhrManager.prototype._retry = function(id)
{
    // get request
    var request = this._requests.get(id);
    if (!request) return false;

    // check if request is completed
    if (request.isCompleted() || request.hasReachedMaxRetries())
    {
        this._complete(id);
        return false;
    }

    var xhr = this;

    // callback for when YUI has a success/failure for XHR
    var processResponse = function(xhrObj, success)
    {
        request.setResponse(xhrObj);

        // even if response was success make sure it didn't get dropped
        if (success) success = (xhrObj.getAllResponseHeaders != '');
        request.setSuccess(success);

        // fire event
        if (success) xhr.Events.fire('onSuccess', request);
        else xhr.Events.fire('onFailure', request);

        // if this request failed check if we can retry it
        if (!success && request.allowRetry())
        {
            // retry request
            xhr._retry(id);
        }
        else
        {
            // request is completed (could be success or failure)
            xhr._complete(id);
        }
    };

    // callback required for YUI
    var callbackYUI =
    {
        success: function(xhrObj) { processResponse(xhrObj, true); },
        failure: function(xhrObj) { processResponse(xhrObj, false); }
    };

    // add timeout if defined
    if (request.getTimeout()) callbackYUI.timeout = request.getTimeout();

    // make YUI xhr request
    var transaction = YAHOO.util.Connect.asyncRequest(request.getMethod(), request.getUrl(), callbackYUI, request.getContent());
    request.setTransaction(transaction);
    request.increaseAttemptCount();

    // fire request event
    this.Events.fire('onSent', request);
    
    return true;
};

// this function is called when a request has completed its lifecycle
Util.XhrManager.prototype._complete = function(id)
{
    var request = this._requests.get(id);
    if (request == null) return;

    this._requests.remove(id);
    request.setCompleted(true);

    // fire completed event
    var ret = this.Events.fire('onComplete', request);

    // if someone returned false from complete event then cancel executing callback
    if (ret === false) return;

    var callback = request.getCallback();
    var scope = request.getScope();

    if (YAHOO.lang.isFunction(callback))
    {
        if (YAHOO.lang.isObject(scope))
        {
            callback.apply(scope, [request]);
        }
        else
        {
            callback(request);
        }
    }
};

// call this to abort a request
Util.XhrManager.prototype.abort = function(id)
{
    // check if there is a request with this ID
    var request = this._requests.get(id);
    if (!request) return false;

    // remove object
    request.setAborted(true);
    this._requests.remove(id);

    // stop actual browser xhr request
    var transaction = request.getTransaction();

    if (transaction)
    {
        YAHOO.util.Connect.abort(transaction);
    }

    this.Events.fire('onAbort', request);

    return true;
};

Util.XhrManager.prototype.abortAll = function()
{
    var requestIds = this._requests.getKeys();

    Util.Array.each(requestIds, function(id)
    {
        this.abort(id);
    });
};

/****************************************************************************************************************/

// An encapsulation of everything needed to make a xhr request.
Util.XhrManager.Request = function(id, url, opt_method, opt_content, opt_callback, opt_scope, opt_timeout, opt_maxRetries, opt_args)
{
    this._id = id;
    this._url = url;
    this._method = YAHOO.lang.isString(opt_method) ? opt_method : 'GET';
    this._content = opt_content || null;
    this._callback = YAHOO.lang.isFunction(opt_callback) ? opt_callback : null;
    this._scope = YAHOO.lang.isObject(opt_scope) ? opt_scope : null;
    this._timeout = YAHOO.lang.isNumber(opt_timeout) ? opt_timeout : null;
    this._maxRetries = YAHOO.lang.isNumber(opt_maxRetries) ? opt_maxRetries : 0;
    this._args = opt_args;

    this._attemptCount = 0;
    this._completed = false;
    this._succeeded = false;
    this._aborted = false;
    this._transaction = null; // YUI transaction object
    this._response = null; // YUI xhr object
};

// Gets the request id.
Util.XhrManager.Request.prototype.getId = function() { return this._id; };

// Gets the uri.
Util.XhrManager.Request.prototype.getUrl = function() { return this._url; };
Util.XhrManager.Request.prototype.setUrl = function(url) { this._url = url; };

// Gets the send method.
Util.XhrManager.Request.prototype.getMethod = function() { return this._method; };
Util.XhrManager.Request.prototype.setMethod = function(method) { this._method = method; };

// Gets the post data.
Util.XhrManager.Request.prototype.getContent = function() { return this._content; };
Util.XhrManager.Request.prototype.setContent = function(content) { this._content = content; };

// Gets the callback for when the request is complete.
Util.XhrManager.Request.prototype.getCallback = function() { return this._callback; };
Util.XhrManager.Request.prototype.setCallback = function(callback) { this._callback = callback; };

Util.XhrManager.Request.prototype.getScope = function() { return this._scope; };
Util.XhrManager.Request.prototype.setScope = function(scope) { this._scope = scope; };

Util.XhrManager.Request.prototype.getTimeout = function() { return this._timeout; };
Util.XhrManager.Request.prototype.setTimeout = function(timeout) { this._timeout = timeout; };
Util.XhrManager.Request.prototype.clearTimeout = function() { this._timeout = null; };

// Gets the maximum number of times the request should be retried.
Util.XhrManager.Request.prototype.getMaxRetries = function() { return this._maxRetries; };
Util.XhrManager.Request.prototype.setMaxRetries = function(retries) { this._maxRetries = retries; };

Util.XhrManager.Request.prototype.getArgs = function() { return this._args; };
Util.XhrManager.Request.prototype.setArgs = function(args) { this._args = args; };

// Gets the number of attempts so far.
Util.XhrManager.Request.prototype.getAttemptCount = function() { return this._attemptCount; };

// Increases the number of attempts so far.
Util.XhrManager.Request.prototype.increaseAttemptCount = function() { this._attemptCount++; };

Util.XhrManager.Request.prototype.resetAttemptCount = function() { this._attemptCount = 0; };

// Returns whether the request has reached the maximum number of retries.
Util.XhrManager.Request.prototype.hasReachedMaxRetries = function() { return this._attemptCount > this._maxRetries; };

// Sets the completed status.
Util.XhrManager.Request.prototype.setCompleted = function(complete) { this._completed = complete; };

// Gets the completed status.
Util.XhrManager.Request.prototype.isCompleted = function() { return this._completed; };

// Sets the aborted status.
Util.XhrManager.Request.prototype.setAborted = function(abort) { this._aborted = abort; };

// Gets the aborted status.
Util.XhrManager.Request.prototype.isAborted = function() { return this._aborted; };

Util.XhrManager.Request.prototype.setTransaction = function(tid) { this._transaction = tid; };
Util.XhrManager.Request.prototype.getTransaction = function() { return this._transaction; };

Util.XhrManager.Request.prototype.setResponse = function(xhrObj) { this._response = xhrObj; };
Util.XhrManager.Request.prototype.getResponse = function() { return this._response; };

Util.XhrManager.Request.prototype.setSuccess = function(success) { this._succeeded = success; };
Util.XhrManager.Request.prototype.isSuccess = function() { return this._succeeded; };

Util.XhrManager.Request.prototype.getContentType = function()
{
    var contentType = null;
    var xhrObj = this.getResponse();

    if (xhrObj && xhrObj.getResponseHeader)
    {
        contentType = xhrObj.getResponseHeader['Content-Type'];
    }

    return (YAHOO.lang.isString(contentType)) ? contentType : '';
};

Util.XhrManager.Request.prototype.getResponseText = function()
{
    if (this.isCompleted())
    {
        var response = this.getResponse();
        if (response) return response.responseText || null;
    }

    return null;
};

// xhrObj.getResponseHeader['Content-Type']
Util.XhrManager.Request.prototype.getResponseJson = function()
{
    var contentType = this.getContentType();
    var text = this.getResponseText();

    if (text != null && text.length > 0 && contentType.indexOf('application/json') != -1)
    {
        return Util.XhrManager.parseJson(text);
    }

    return null;
};

Util.XhrManager.Request.prototype.getResponseXml = function()
{
    var contentType = this.getContentType();
    var response = this.getResponse();

    if (this.isCompleted() && contentType.indexOf('text/xml') != -1)
    {
        if (response) return response.responseXML || null;
    }

    return null;
};

// check a request to see if the response from the server allows for a retry
Util.XhrManager.Request.prototype.allowRetry = function()
{
    var response = this.getResponse();

    // if there was a response check if it allows for retrying
    if (response)
    {
        // missing headers means the response was dropped
        if (response.getAllResponseHeaders == '') return true;

        // if there was a "communication failure" (dropped connection) or "transaction aborted" (timeout) then retry
        return (response.status == 0 || response.status == -1);
    }

    return false;
};

/****************************************************************************************************************/

// parses JSON using YUI and adds reviver for dates

Util.XhrManager.parseJson = function(text)
{
    var reISO = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/;
    var reMsAjax = /^\/Date\((d|-|.*)\)[\/|\\]$/;
    // original var reMsAjax = /^\/Date\((d|-|.*)\)\/$/;
    
    // here is how we force wcf to parse as UTC and give correct local time serverside
    // var date = '\/Date(' + new Date().getTime() + '-0000)\/';
    var parseDatesReviver = function(key, value)
    {
        if (typeof value === 'string')
        {
            // WCF date
            var a = reISO.exec(value);
            if (a) return new Date(Date.UTC(+a[1], +a[2] - 1, +a[3], +a[4], +a[5], +a[6]));

            // MS AJAX date
            a = reMsAjax.exec(value);

            if (a)
            {
                var b = a[1].split(/[-+,.]/);
                return new Date(b[0] ? +b[0] : 0 - +b[1]);
            }
        }

        return value;
    };

    return YAHOO.lang.JSON.parse(text, parseDatesReviver);
};

