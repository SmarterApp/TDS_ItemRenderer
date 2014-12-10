TestShell.XhrManager = function () {

    var timeout = (120 * 1000); // 2 min timeout
    TestShell.XhrManager.superclass.constructor.call(this, timeout, 1, TestShell);

    // current action
    this._action = null;

    this.Events.subscribe('onShowProgress', function() {
        TestShell.UI.showLoading('');
    });

    this.Events.subscribe('onHideProgress', function() {
        TestShell.UI.hideLoading();
    });

    this.Events.subscribe('onError', TestShell.XhrManager.onError);
};

YAHOO.extend(TestShell.XhrManager, TDS.XhrManager);

// create the xhr url
TestShell.XhrManager.prototype.getUrl = function(action) {

    var urlBuilder = [];
    urlBuilder.push(TDS.baseUrl);
    urlBuilder.push('Pages/API/TestShell.axd/');
    urlBuilder.push(action);

    var currentPage = TestShell.PageManager.getCurrent();
    var currentPageNum = currentPage ? currentPage.pageNum : 0;
    urlBuilder.push('?currentPage=');
    urlBuilder.push(currentPageNum);

    return urlBuilder.join('');
};

// handler for errors
TestShell.XhrManager.onError = function(request, errorMessage, retriable, logout) {

    if (retriable) {
        errorMessage += ' ' + Messages.getAlt('Messages.Label.XHRError', 'Select Yes to try again or No to logout.');

        TDS.Dialog.showPrompt(errorMessage,
            function () { // yes (resubmit xhr)
                TestShell.xhrManager.sendRequest(request);
            },
            function () { // no (back to login page)
                if (logout) {
                    TestShell.redirectLogin();
                }
            });
    } else {
        TDS.Dialog.showWarning(errorMessage, function() {
            // ok (back to login page)
            if (logout) {
                TestShell.redirectLogin();
            }
        });
    }
};

/****************************************************************************************/

// call this function if you need to queue an XHR request until responses are done being sent
// NOTE: Used for pausing and reviewing test only right now
TestShell.XhrManager.prototype.queueAction = function (action, parameters, callback) {

    // show loading screen
    TestShell.UI.showLoading('');

    // create a temp function so we can wait to process this action
    this._action = Util.Function.bind(this[action], this, parameters, callback);

    // check if any responses are being sent out
    TestShell.ResponseManager.processQueue();
};

// check if there is a queued action
TestShell.XhrManager.prototype.hasAction = function() {
    return (this._action != null);
};

// process queued action
TestShell.XhrManager.prototype.processAction = function() {
    // check if there is an action
    if (!this.hasAction()) {
        return false;
    }

    // execute action
    this._action();
    return true;
};

/****************************************************************************************/

TestShell.XhrManager.prototype.pause = function (parameters, callback) {
    TestShell.Audit.Poller.cancel();
    var data = TestShell.Audit.serializeToJSON(TestShell.Audit.recordsToReport());
    return this.sendAction('pauseTest', data, callback, null, parameters);
};

TestShell.XhrManager.prototype.complete = function (parameters, callback) {
    TestShell.Audit.Poller.cancel();
    var data = TestShell.Audit.serializeToJSON(TestShell.Audit.recordsToReport());
    return this.sendAction('completeTest', data, callback, null, parameters);
};

// submit a request to wait for segment approval
TestShell.XhrManager.prototype.waitForSegmentApproval = function(data, callback) {
    // data: {position: 1, approval: entry/exit}
    return this.sendAction('waitForSegmentApproval', data, callback, { showProgress: false });
};

// submit a request to check if the segment has been approved
TestShell.XhrManager.prototype.checkForSegmentApproval = function(callback) {
    return this.sendAction('checkForSegmentApproval', null, callback, { showProgress: false });
};

// submit a fire and forget that we exited the segment
TestShell.XhrManager.prototype.exitSegment = function(data, callback) {
    // data: {position: 1}
    var config = {
        showProgress: false,
        showDialog: false,
        showError: true,
        allowRetry: false,
        forceLogout: true
    };
    return this.sendAction('exitSegment', data, callback, config);
};

// submit a item level comment ( data = { position: #, comment: '' } )
TestShell.XhrManager.prototype.recordItemComment = function(data, callback) {
    return this.sendAction('recordItemComment', data, callback, {
        allowRetry: true,
        forceLogout: false,
        showProgress: false
    });
};

// submit a test level comment ( data = { comment: '' } )
TestShell.XhrManager.prototype.recordOppComment = function(data, callback) {
    return this.sendAction('recordOppComment', data, callback, {
        allowRetry: true,
        forceLogout: false,
        showProgress: false
    });
};

// get a test level comment
TestShell.XhrManager.prototype.getOppComment = function(callback) {
    return this.sendAction('getOppComment', null, callback, {
        allowRetry: true,
        forceLogout: false,
        showProgress: false
    });
};

// mark an item for review ( data = { position: #, mark: true } )
TestShell.XhrManager.prototype.markForReview = function(data, callback) {
    return this.sendAction('markForReview', data, callback, {
        allowRetry: true,
        forceLogout: false,
        showProgress: true
    });
};

// remove an item response ( data = { position: #, itemID: I-100, dateCreated: 199837382 } )
TestShell.XhrManager.prototype.removeResponse = function(data, callback) {
    return this.sendAction('removeResponse', data, callback, {
        allowRetry: true,
        forceLogout: false,
        showProgress: true
    });
};

// this is called when block pausing is enabled and we are checking the servers opp status
TestShell.XhrManager.prototype.getPauseStatus = function(callback) {
    return this.sendAction('getStatus', null, callback, {
        allowRetry: true,
        forceLogout: true,
        showProgress: true
    });
};

// this is called when block pausing is enabled and we are checking the servers opp status
TestShell.XhrManager.prototype.logAuditTrail = function (data) {
    return this.sendPromise('logAuditTrail', data, null, {
        allowRetry: false,
        forceLogout: false,
        showProgress: false,
        showDialog: false,
        showError: false,
    });
};

