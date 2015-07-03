//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
﻿// the ResponsRecovery class helps track the state of recoverable responses:
//  * tracks saved responses
//  * retrieves previous sessions' historical responses
//  * manages configuration information

TestShell.ResponseRecovery = function (responseManager, xhrManager, storage, enabledFormats) {
    this._responseManager = responseManager;
    this._xhrManager = xhrManager;
    this._storage = storage;

    this._waiters = {};

    this._enabledFormats = enabledFormats;

    this._initialize();
};

TestShell.ResponseRecovery.prototype = {
    getCurrentSessionId: function () {
        return this._storage.getOppInfo().browserKey;
    },

    _initialize: function () {
        this._itemResponseManager = new TestShell.ResponseRecovery.Manager(this);

        var manager = this._itemResponseManager,
            browserKey = this.getCurrentSessionId(),
            self = this;

        this._responseManager.Events.onSend.subscribe(function (outgoingResponses) {
            outgoingResponses.forEach(function (response) {
                try {
                    // filter uninteresting responses
                    if (!self.isEnabledFor(response.getContentItem())) {
                        return;
                    }

                    manager.addResponse({
                        browserKey: browserKey,
                        position: response.position,
                        response: response.value,
                        sequence: response.sequence,
                        value: response.value,
                        time: new Date()
                    });
                } catch (error) {
                }
            });
        });

        this._responseManager.Events.onSuccess.subscribe(function (results) {
            results.updates.forEach(function (update) {
                try {
                    // filter uninteresting responses
                    var page = TestShell.PageManager.getCurrent().getContentPage(),
                        item = page.getItem(update.position),
                        waiter;

                    if (!self.isEnabledFor(item)) {
                        return;
                    }

                    // if anyone was waiting for this item to save, notify them
                    if (waiter = self._getWaiter(update.position, false)) {
                        // resolve the waiting saves
                        if (!waiter.resolve(update.sequence)) {
                            // no more saves are waiting, so we can discard this waiter
                            delete self._waiters[update.position];
                        }
                    }

                    var version = manager.getHistory(update.position)
                                         .getSession(browserKey)
                                         .getVersion(update.sequence);

                    // TODO: flag version as saved?
                } catch (error) {
                }
            });
        });

        this._responseManager.Events.onFailure.subscribe(function () {
            // when onFailure fires, one of 3 things will happen:
            // * we'll be logged out because of a fatal error
            // * the student chose to rety the save
            // * we'll be logged out because the student declined to retry

            // therefore, it is not necessary to handle save failure
        });
    },

    _createLoadPromise: function () {
        var manager = this._itemResponseManager,
            testProperties = this._storage.getTestProperties(),
            self = this;

        // TODO: move enum Sections.TestSelection.Status out of section_TestSelection to shared location
        //       then we can use Sections.TestSelection.resume instead of hardcoding 3
        if (testProperties.status !== 3) {
            // we are not resuming a test; there will be no responses in the database
            manager.loadHistory([]);

            var deferred = Util.Promise.defer();
            deferred.resolve(manager.getFacade());
            return deferred.promise;
        }

        return this._xhrManager.listResponses().then(function (items) {
            manager.loadHistory(items);
            return manager.getFacade();
        }).fail(function () {
            // a failed XHR would prevent the user from ever requesting the response history
            // to cope with random failures, we don't want to keep a rejected promise
            self._loadReset();

            return manager.getFacade();
        });
    },

    getResponse: function (pageKey, itemId, position, sequence) {
        return this._xhrManager.getResponse(pageKey, itemId, position, sequence);
    },

    load: function () {
        if (!this._load) {
            this._load = this._createLoadPromise();
        }

        return this._load;
    },

    _loadReset: function () {
        this._load = null;
    },

    isEnabledFor: function (contentItem) {
        // TODO: switch to response type or interaction type
        var formatEnabled = this._enabledFormats.indexOf(contentItem.format) !== -1;
        return formatEnabled;
    },

    _getWaiter: function (position, create) {
        var waiter = this._waiters[position];

        if (!waiter && create) {
            this._waiters[position] = waiter = {
                _instances: [],

                add: function (sequence) {
                    var deferred = Util.Promise.defer();

                    this._instances.push({
                        sequence: sequence,
                        deferred: deferred
                    });

                    this._instances.sort(function (a, b) {
                        return a.sequence > b.sequence;
                    });

                    return deferred;
                },

                resolve: function (sequence) {
                    for (var i = this._instances.length - 1; i >= 0; --i) {
                        var instance = this._instances[i];
                        if (instance.sequence <= sequence) {
                            // this is the sequence, or it is older than the sequence and would have been superceded
                            // resolve it and remove the instance
                            instance.deferred.resolve();
                            this._instances.splice(i, 1);
                        }
                    }

                    return this._instances.length > 0;
                }
            };
        }

        return waiter;
    },

    // TODO: refactor ResponseManager or TestShell to support wait-able saving
    save: function (item, showProgressDialog) {
        var deferred;

        if (arguments.length < 2) {
            // if not specified, default to true
            showProgressDialog = true;
        }

        if (!this.isEnabledFor(item.getContentItem())) {
            deferred = Util.Promise.defer();
            deferred.reject('ResponseRecovery is not enabled for items of this type');
        } else {
            // try to save the item
            TestShell.save(TestShell.SaveRequest.Force, [item]);

            // check that it got queued for saving
            var queued = this._responseManager.getOutgoingResponses().indexOf(item) !== -1 ||
                         this._responseManager.getPendingResponses().indexOf(item) !== -1;

            if (queued) {
                // the save is queued, create a record of it that we can resolve later
                var waiter = this._getWaiter(item.position, true);
                deferred = waiter.add(item.sequence);

                if (showProgressDialog) {
                    // show the progress dialog
                    var instance = TestShell.UI.showLoading(TestShell.ResponseRecovery.messages.saveMessage);

                    var hideLoading = function () {
                        TestShell.UI.hideLoading(instance);
                    };

                    // hide the progress dialog when the save completes (either success or failure)
                    deferred.promise.then(hideLoading, hideLoading);
                }
            } else {
                // the item didn't need to be saved, so we will let the caller proceed immediately
                deferred = Util.Promise.defer();
                deferred.resolve();
            }
        }

        return deferred.promise;
    }
};
