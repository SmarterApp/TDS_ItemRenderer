// binary file loader
// http://miskun.com/javascript/binary-file-loading-in-javascript/
ResourceLoader.Binary = function(url, timeoutInterval, retriesMax)
{
    ResourceLoader.Binary.superclass.constructor.call(this);

    this._url = url;

    // Whether XMLHttpRequest is active.  A request is active from the time send()
    // is called until onReadyStateChange() is complete, or error() or abort() is called.
    this._active = false;

    // Used to make sure we don't fire the complete event from inside a send call.
    this._inSend = false;

    // Used in determining if a call to _onReadyStateChange is from within a call to _xhr.open().
    this._inOpen = false;

    // Used in determining if a call to _onReadyStateChange is from within a call to _xhr.abort().
    this._inAbort = false;

    this._timeoutInterval = timeoutInterval || 0;
    this._timeoutObj = null;

    this._retriesMax = retriesMax || 0; // max # retries allowed
    this._retries = 0; // # of retries 

    this._xhr = null; // native XMLHttpRequest object
    this._response = null; // XMLHttpRequest response
};

ResourceLoader.extend(ResourceLoader.Binary);

ResourceLoader.Binary.prototype.getResponse = function() { return this._response; };

ResourceLoader.Binary.prototype.load = function()
{
    this._send();
    this.setStatus(ResourceLoader.Status.LOADING);
    return true;
};

// The ActiveX PROG ID string to use to create xhr's in IE. Lazily initialized.
ResourceLoader.Binary.prototype._ieProgId = null;

// Initialize the private state used by other functions.
// Returns: The ActiveX PROG ID string to use to create xhr's in IE.
ResourceLoader.Binary.prototype._getProgId = function()
{
    // The following blog post describes what PROG IDs to use to create the
    // XMLHTTP object in Internet Explorer:
    // http://blogs.msdn.com/xmlteam/archive/2006/10/23/using-the-right-version-of-msxml-in-internet-explorer.aspx
    // However we do not (yet) fully trust that this will be OK for old versions
    // of IE on Win9x so we therefore keep the last 2.
    if (!this._ieProgId && typeof XMLHttpRequest == 'undefined' && typeof ActiveXObject != 'undefined')
    {
        // Candidate Active X types.
        var ACTIVE_X_IDENTS = ['MSXML2.XMLHTTP.6.0', 'MSXML2.XMLHTTP.3.0', 'MSXML2.XMLHTTP', 'Microsoft.XMLHTTP'];
        
        for (var i = 0; i < ACTIVE_X_IDENTS.length; i++)
        {
            var candidate = ACTIVE_X_IDENTS[i];
            /** @preserveTry */
            try
            {
                new ActiveXObject(candidate);
                // NOTE(user): cannot assign progid and return candidate in one line
                // because JSCompiler complaings: BUG 658126
                this._ieProgId = candidate;
                return candidate;
            } 
            catch (e)
            {
                // do nothing; try next choice
            }
        }

        // couldn't find any matches
        throw Error('Could not create ActiveXObject. ActiveX might be disabled, or MSXML might not be installed');
    }

    return this._ieProgId;
};

ResourceLoader.Binary.prototype._createInstance = function()
{
    var progId = this._getProgId();
    
    if (progId)
    {
        return new ActiveXObject(progId);
    } 
    else
    {
        return new XMLHttpRequest();
    }
};

// send out xhr request
ResourceLoader.Binary.prototype._send = function()
{
    if (this._xhr) throw Error('Xhr Object is active with another request');

    this._active = true;
    this._xhr = this._createInstance();

    // set up the onreadystatechange callback
    this._xhr.onreadystatechange = Util.bind(this._onReadyStateChange, this);

    // try to open the XMLHttpRequest (always async)
    this._inOpen = true;
    this._xhr.open('GET', this._url, true);
    this._inOpen = false;

    this._xhr.setRequestHeader('X-TDS-Loader', 'binary');
    
    // cancel existing timeout
    if (this._timeoutObj) this._timeoutObj.cancel();
    
    // start new timeout
    if (this._timeoutInterval > 0)
    {
        this._timeoutObj = YAHOO.lang.later(this._timeoutInterval, this, this._timeout);
    }

    // try to send the request
    this._inSend = true;
    this._xhr.send(null);
    this._inSend = false;
};

// called when xhr times out
ResourceLoader.Binary.prototype._timeout = function()
{
    if (this._xhr)
    {
        var allowRetry = (this._retries < this._retriesMax);
        this._abort(allowRetry);
        
        if (allowRetry)
        {
            this._retries++;
            this._send();
        }
    }
};

// abort the xhr request (pass in true if you want to prevent firing event)
ResourceLoader.Binary.prototype._abort = function(preventEvent)
{
    if (this._xhr && this._active)
    {
        this._active = false;
        this._inAbort = true;
        this._xhr.abort();
        this._inAbort = false;

        // check if suppress event (which if we are retrying we would want)
        if (!preventEvent) this.setStatus(ResourceLoader.Status.ABORT);

        this._cleanUpXhr();
    }
};

ResourceLoader.Binary.prototype._onReadyStateChange = function()
{
    // can get called inside abort call
    if (!this._active) return;

    // check if completed
    if (this._xhr.readyState != 4) return;

    // In IE when the response has been cached we sometimes get the callback
    // from inside the send call and this usually breaks code that assumes that
    // XhrIo is asynchronous.  If that is the case we delay the callback
    // using a timer.
    if (this._inSend)
    {
        YAHOO.lang.later(0, this._onReadyStateChange, this);
        return;
    }
    
    this._active = false;

    // get response info
    var httpStatus = this._xhr.status;
    var httpHeaders = this._xhr.getAllResponseHeaders();

    // check if status was success and there are headers (no headers means dropped connection)
    if (((httpStatus >= 200 && httpStatus < 300) || httpStatus === 1223) && httpHeaders != '')
    {
        var response = {};
        this._response = response;

        response.status = httpStatus;
        response.contentLength = this._xhr.getResponseHeader('Content-Length');
        response.contentType = this._xhr.getResponseHeader('Content-Type');

        response.content = (typeof this._xhr.responseBody == 'unknown') ?
			this._xhr.responseBody :
			this._xhr.responseText;

        this.setStatus(ResourceLoader.Status.COMPLETE);
    }
    else
    {
        this.setStatus(ResourceLoader.Status.ERROR);
    }

    this._cleanUpXhr();
};

ResourceLoader.Binary.prototype._cleanUpXhr = function()
{
    if (this._xhr)
    {
        // destroy xhr
        var xhr = this._xhr;
        this._xhr = null;

        // clear timer
        if (this._timeoutObj)
        {
            this._timeoutObj.cancel();
            this._timeoutObj = null;
        }

        try
        {
            // prevent leaks
            xhr.onreadystatechange = function () {};
        } 
        catch (e) {}
    }
};
