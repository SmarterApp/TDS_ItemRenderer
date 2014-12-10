// used for sending responses to the server

TestShell.ResponseManager = {};

TestShell.ResponseManager.Error =
{
    None: 0,
    Timeout: 1, // transaction aborted (timed out)
    Network: 2, // network failure, dropped or corrupted data
    Xml: 3, // invalid returned XML when tried to parse it
    HTTP: 4, // unknown HTTP or server error occured
    Server: 5, // unknown HTTP or server error occured
    ReturnStatus: 6 
};

TestShell.ResponseManager._transaction = null; // the current YUI transaction object for the outgoing XHR request (NOTE: I don't use this right now for anything)
TestShell.ResponseManager._sending = false; // are we currently sending some responses?
TestShell.ResponseManager._timeout = (90 * 1000); // how long do we wait for responses to be sent?
TestShell.ResponseManager._attemptTotal = 0; // how many times total have we attempted to send responses
TestShell.ResponseManager._attemptCount = 0; // how many times currently have we attempted to send responses
TestShell.ResponseManager._maxRetries = 2; // how many retry attempts until considered an error

TestShell.ResponseManager._lastError = TestShell.ResponseManager.Error.None;
TestShell.ResponseManager._lastStatusCode = 0;
TestShell.ResponseManager._lastStatusText = null;

// data
TestShell.ResponseManager._pingResponses = false; // ping sends empty packet which might trigger prefetch if available
TestShell.ResponseManager._pendingResponses = []; // responses waiting to go to the server
TestShell.ResponseManager._outgoingResponses = [];  // responses sent to the server and waiting

TestShell.ResponseManager._timerDelay = null;

TestShell.ResponseManager.createEvent = function(name)
{
    return new YAHOO.util.CustomEvent(name, this, true, YAHOO.util.CustomEvent.FLAT);
};

TestShell.ResponseManager.Events =
{
    onQueue: TestShell.ResponseManager.createEvent('onQueue'),
    onSend: TestShell.ResponseManager.createEvent('onSend'),

    onFailure: TestShell.ResponseManager.createEvent('onFailure'),
    onSuccess: TestShell.ResponseManager.createEvent('onSuccess'),
    onGroups: TestShell.ResponseManager.createEvent('onGroups'),
    onFinished: TestShell.ResponseManager.createEvent('onFinished')
};

TestShell.ResponseManager.fireEvent = function(name, obj) { this.Events[name].fire(obj); };

TestShell.ResponseManager.getLastError = function() { return this._lastError; };
TestShell.ResponseManager.getLastStatusCode = function() { return this._lastStatusCode; };
TestShell.ResponseManager.getLastStatusText = function() { return this._lastStatusText; };

TestShell.ResponseManager._setLastError = function(error, message) { this._lastError = error; };

TestShell.ResponseManager._setLastStatus = function(statusCode, statusText)
{
    this._lastStatusCode = statusCode;
    this._lastStatusText = statusText; 
};

TestShell.ResponseManager.getPendingResponses = function() { return this._pendingResponses; };
TestShell.ResponseManager.getOutgoingResponses = function() { return this._outgoingResponses; };

// reset send count 
// NOTE: call this when you successfully processed a request
TestShell.ResponseManager.resetQueue = function()
{
    this._setLastError(TestShell.ResponseManager.Error.None);
    this._attemptCount = 0;
};

// clear all outgoing and pending responses 
// NOTE: call this when you want to stop processing due to an error
TestShell.ResponseManager.clearQueue = function()
{
    this._pingResponses = false;
    this._pendingResponses = [];
    this._outgoingResponses = [];
    this.resetQueue();
};

TestShell.ResponseManager.ping = function()
{
    // call send outgoing directly with no responses
    this._pingResponses = true;
    this.processQueue();
};

TestShell.ResponseManager.isSending = function() { return this._sending; };

// queue response to be sent to the server
TestShell.ResponseManager.sendResponse = function(response) { this.sendResponses([response]); };

// queue responses to be sent to the server
TestShell.ResponseManager.sendResponses = function(responses)
{
    for (var i = 0; i < responses.length; i++)
    {
        var response = responses[i];

        // check if this response is already queued
        if (this._pendingResponses.indexOf(response) == -1)
        {
            this.fireEvent('onQueue', response);
            this._pendingResponses.push(response);
        }
    }

    this.processQueue();
};

TestShell.ResponseManager.hasReachedMaxRetries = function()
{
    return this._attemptCount > this._maxRetries; 
};

// check if the last error allows us to retry
TestShell.ResponseManager.hasFatalLastError = function()
{
    // fatal errors are HTTP, Server or ReturnStatus
    return (this.getLastError() >= TestShell.ResponseManager.Error.HTTP);
};

// move any responses in the queue to outgoing and send
TestShell.ResponseManager.processQueue = function()
{
    // stop current timer for processing queue
    if (this._timerDelay) this._timerDelay.cancel();

    // check to make sure we are not waiting on the server
    if (this._sending) return false;

    // check if we are allowed to retry
    if (this.hasReachedMaxRetries() || this.hasFatalLastError())
    {
        this.fireEvent('onFailure', this.getLastError());
        return false;
    }

    // shift all the elements in one queue to another
    var shiftQueues = function(fromArr, toArr)
    {
        var fromObj = null;
        
        // pop all objects in the 'from' queue
        while ((fromObj = fromArr.pop()) != null)
        {
            // only add the object in the 'to' queue if it doesn't already exist
            if (toArr.indexOf(fromObj) == -1) toArr.push(fromObj);
        }
    };

    // get responses in queue and move them to outgoing
    shiftQueues(this._pendingResponses, this._outgoingResponses);

    // check if there is pending work
    if (this._pingResponses || this._outgoingResponses.length > 0)
    {
        // delay execution of sending in case someone has more work to do
        this._timerDelay = YAHOO.lang.later(1, this, this._sendOutgoing);
        return true;
    }
    // send out action if one
    else if (TestShell.xhrManager.hasAction())
    {
        TestShell.xhrManager.processAction();
    }

    return false;
};

// create the xhr url
TestShell.ResponseManager._createUrl = function()
{
    var urlBuilder = [];
    urlBuilder.push(TDS.baseUrl);
    urlBuilder.push('Pages/API/TestShell.axd/updateResponses');
    return urlBuilder.join('');
};

// create the xhr xml
TestShell.ResponseManager._createRequest = function() {

    var lastGroup = TestShell.PageManager.getLastGroup();

    var data = {
        id: this._attemptTotal,
        timestamp: new Date().getTime(),
        lastPage: (lastGroup ? lastGroup.pageNum : 0),
        prefetch: TestShell.Config.prefetch,
        accommodations: TDS.Student.Storage.serializeAccs(),
        responses: this._outgoingResponses
    };

    return TestShell.Xml.createRequest(data);
};

// send outgoing responses
TestShell.ResponseManager._sendOutgoing = function()
{
    this._sending = true;

    // up the send count
    this._attemptCount++;
    this._attemptTotal++;

    // create xhr callback
    var callback = {};
    callback.success = this._sendSuccess;
    callback.failure = this._sendFailure;
    callback.timeout = this._timeout;
    callback.scope = this;

    // up response sequence
    Util.Array.each(this._outgoingResponses, function(outgoingResponse)
    {
        outgoingResponse.sequence++;
    });
    
    try {
        TestShell.ResponseManager._auditOutgoing();
    } catch (ex) {
        // This is just auditing so we can ignore..
    }

    // send xhr
    var url = this._createUrl();
    var content = this._createRequest();
    
    YUC.setDefaultPostHeader(false); // allow custom 'Content-Type'
    YUC.initHeader('Content-Type', 'application/xml; charset=UTF-8');
    this._transaction = YUC.asyncRequest('POST', url, callback, content);
    YUC.setDefaultPostHeader(true);

    // fire event
    this.fireEvent('onSend', this._outgoingResponses);
};

// XHR callback for when responses fail to be sent to the server
TestShell.ResponseManager._sendFailure = function(xhrObj)
{
    this._sending = false;
    Util.log('TestShell.ResponseManager xhr failure: ' + xhrObj.statusText);

    this._setLastStatus(xhrObj.status, xhrObj.statusText);

    if (xhrObj.status == -1) // timeout: 'transaction aborted'
    {
        this._setLastError(TestShell.ResponseManager.Error.Timeout);
    }
    else if (xhrObj.status == 0) // network down: 'communication failure'
    {
        this._setLastError(TestShell.ResponseManager.Error.Network);
    }
    else if (xhrObj.status == 403) // return status: SP error
    {
        this._setLastError(TestShell.ResponseManager.Error.ReturnStatus);
    }
    else if (xhrObj.status == 500) // return status: SP error
    {
        this._setLastError(TestShell.ResponseManager.Error.Server);
    }
    else // server error (probably a 500 error code "Internal Error")
    {
        this._setLastError(TestShell.ResponseManager.Error.HTTP);
    }

    this.processQueue();
};

// XHR callback for when responses are successfully sent to the server
TestShell.ResponseManager._sendSuccess = function(xhrObj)
{
    this._sending = false;

    this._setLastStatus(xhrObj.status, xhrObj.statusText);

    // if the response headers and text are empty, there was a drop of the network connection
    if (xhrObj.getAllResponseHeaders == '' && xhrObj.responseText == '')
    {
        this._setLastError(TestShell.ResponseManager.Error.Network);
        this.processQueue();
        return;
    }

    // get XmlDocument
    var xmlDoc = xhrObj.responseXML;

    // make sure results got back were valid
    if (!TestShell.Xml.validResults(xmlDoc))
    {
        this._setLastError(TestShell.ResponseManager.Error.Xml);
        this.processQueue();
        return;
    }

    /* parse the XML */

    // get result
    var results = TestShell.Xml.parseResults(xmlDoc);

    // check if any response updates were made
    if (results.updates)
    {
        // reduce response submission array to just those that did not get updated (should always be empty, unless strange error)
        Util.Array.each(results.updates, function(responseUpdate)
        {
            // check if response update matches anything that was in outgoing
            var responseSent = Util.Array.find(TestShell.ResponseManager.getOutgoingResponses(), function(responseOutgoing)
            {
                return (responseUpdate.position == responseOutgoing.position);
            });

            // remove outgoing as it was sent successfully
            if (responseSent)
            {
                Util.Array.remove(TestShell.ResponseManager.getOutgoingResponses(), responseSent);
            }
        });
    }

    // TODO: send this to the error log
    if (TestShell.ResponseManager.getOutgoingResponses().length > 0)
    {
        Util.log('ResponseManager possible problem: Outgoing responses were not all sent');
    }

    // update test shell properties (TODO: move this out of here)
    TestShell.testLengthMet = results.summary.testLengthMet;

    // check for when test is completed
    if (!TestShell.testFinished && results.summary.testFinished) {
        TestShell.testFinished = results.summary.testFinished;
        this.fireEvent('onFinished');
    }

    // go to the review page if the test is completed and there are no groups to show 
    if (TestShell.PageManager.getGroups().length == 0 && results.groups.length == 0 && TestShell.testLengthMet)
    {
        TestShell.redirectReview();
        return;
    }

    // if content was provided then cache it
    if (results.contents) {
        TestShell.ContentLoader.addContents(results.contents);
    }

    // fire event for groups if any
    if (results.groups && results.groups.length > 0)
    {
        // NOTE: content gets requested here
        this.fireEvent('onGroups', results.groups);
    }

    // fire success event
    this.fireEvent('onSuccess', results);

    // since this request was success we are not longer pinging
    this._pingResponses = false;

    // reset count and check queue
    this.resetQueue();
    this.processQueue();
};

/*************************************************************************************************/
// Response manager events:

/*
TestShell.ResponseManager.Events.onQueue.subscribe(function(response)
{
    Util.log('ResponseManager queued: ' + response);
});

TestShell.ResponseManager.Events.onSend.subscribe(function(responses)
{
    Util.log('ResponseManager sending: ' + getResponseIDs(responses));
});

TestShell.ResponseManager.Events.onSuccess.subscribe(function(results)
{
    Util.log('ResponseManager received:');
    Util.dir(results);
});
*/

// update test shell UI buttons
TestShell.ResponseManager.Events.onQueue.subscribe(function(response)
{
    // TODO: We might be able to remove this (needed for mark for review which is seperate now)
    TestShell.UI.updateControls();
});

TestShell.ResponseManager.Events.onSuccess.subscribe(function(response)
{
    // BUG #24178: Missing test completed message
    TestShell.UI.updateControls();
});

// show message on notification bar when we receive response from the server we are finished with the test
TestShell.ResponseManager.Events.onFinished.subscribe(function () {
    // check if we are showing item scores
    if (TDS.showItemScores) {
        TDS.Shell.Notification.add(Messages.get('TestItemScores'));
    } else if (TestShell.testFinished) {
        TDS.Shell.Notification.add(Messages.get('TestCompleted'));
    }
});

// on XHR failure
TestShell.ResponseManager.Events.onFailure.subscribe(function(error)
{
    TestShell.UI.hideLoading();

    var logout = function()
    {
        // clear responses in queue
        TestShell.ResponseManager.clearQueue();

        // redirect to login
        TestShell.redirectLogin();
    };

    // check if we can retry from this error
    if (TestShell.ResponseManager.hasFatalLastError())
    {
        var message = Messages.getAlt('TestShell.Label.ErrorLoggedOut', 'Error you will be logged out');

        if (this.getLastError() == TestShell.ResponseManager.Error.ReturnStatus)
        {
            message = this.getLastStatusText();
        }

        TestShell.UI.showWarning(message, logout);
    }
    else
    {
        // show retry submitting responses dialog
        TestShell.UI.showErrorPrompt('ResponseError',
        {
            yes: function() // [Yes] try again
            {
                TestShell.ResponseManager.resetQueue();
                TestShell.ResponseManager.processQueue();
                // TestShell.UI.showLoading();
            },
            no: logout
        });
    }

});

// audit code
(function(RM) {

    var positions = {};

    function processResponse(response) {

        // get the sequence #'s for this position
        var sequences = positions[response.position];
        if (!sequences) {
            // create sequence array since we have never used it
            positions[response.position] = sequences = [];
        }

        // find any duplicate sequences in previous array
        var duplicate = Util.Array.find(sequences, function (obj) {
            return response.sequence == obj.sequence;
        });

        // add out current sequence
        sequences.push({
            sequence: response.sequence,
            timestamp: new Date()
        });

        // write out error log
        if (duplicate) {

            // create error message
            var error = YAHOO.lang.substitute('Duplicate item sequence: pos={position} seq={sequence}', response);
            var details = new Util.StringBuilder();

            // get last 20 sequences and add them to details
            sequences.slice(-20).forEach(function (obj) {
                details.appendSub('Seq={sequence} Time={timestamp}', obj);
                details.appendLine();
            });

            // add loggers
            details.appendLine();
            TDS.Diagnostics.appendDivider(details);
            TDS.Diagnostics.appendLoggers(details);

            // send error message
            TDS.Diagnostics.logServerError(error, details);
        }
    }

    RM._auditOutgoing = function () {
        this._outgoingResponses.forEach(processResponse);
    }

})(TestShell.ResponseManager);