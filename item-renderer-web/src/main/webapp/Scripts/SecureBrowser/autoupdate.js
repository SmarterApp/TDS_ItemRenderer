//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
﻿TDS = window.TDS || {};
TDS.SecureBrowser = TDS.SecureBrowser || {};

(function (SB) {

    function AU() {
        // Enforce singleton design pattern
        if (arguments.callee._singletonInstance) {
            return arguments.callee._singletonInstance;
        }
        arguments.callee._singletonInstance = this;
        this.curState = this.State.NOT_INITIALIZED;
    }

    AU.prototype =
    {
        State: {
            NOT_INITIALIZED: 0, // Not Initialized (either hasn't been or cannot be inited [because browser does not support AutoUpdate])
            IDLE: 1, // Idle
            CHECK_FOR_UPDATE: 2, // Checking for an Update
            DOWNLOADING: 3, // Download in progress
            INSTALLING: 4 // Installing downloaded update
        },

        IApplicationUpdateService: null, // Browser's nsIApplicationUpdateService interface - https://developer.mozilla.org/en-US/docs/Mozilla/Tech/XPCOM/Reference/Interface/nsIApplicationUpdateService
        IUpdateChecker: null, // Browser's nsIUpdateChecker interface - https://developer.mozilla.org/en-US/docs/Mozilla/Tech/XPCOM/Reference/Interface/nsIUpdateChecker
        IUpdateManager: null, // Browser's nsIUpdateManager interface - https://developer.mozilla.org/en-US/docs/Mozilla/Tech/XPCOM/Reference/Interface/nsIUpdateManager

        update: null, // Info about the currently available update version
        patch: null, // Info about the update/patch being downloaded

        curState: null,

        updateCallback: null,
        downloadCallback: null,

        // Public API

        initialize: function () {

            if (this.curState == this.State.NOT_INITIALIZED) {
                try {
                    // Check if the update services/interfaces are available in this browser
                    
                	//SB-1506-Intelligent-Muting. Use enableComponents to support both SB8.1 and 9.0 
                	if(!Mozilla.enableComponents()){
                		return false;
                	}

                    // Import JavaScript code modules
                    var Cu = Components.utils;
                    Cu.import("resource://gre/modules/Services.jsm");
                    Cu.import("resource://gre/modules/XPCOMUtils.jsm");
                    Cu.import("resource://gre/modules/DownloadUtils.jsm");
                    Cu.import("resource://gre/modules/AddonManager.jsm");

                    // Provide access to Mozilla interfaces
                    var Ci = Components.interfaces;
                    var Cc = Components.classes;
                    this.IApplicationUpdateService = Cc["@mozilla.org/updates/update-service;1"].getService(Ci.nsIApplicationUpdateService);
                    this.IUpdateChecker = Cc["@mozilla.org/updates/update-checker;1"].getService(Ci.nsIUpdateChecker);
                    this.IUpdateManager = Cc["@mozilla.org/updates/update-manager;1"].getService(Ci.nsIUpdateManager);

                    // Give our interface implementations access to this parent object
                    this.IUpdateCheckListener.autoUpdateRef = this;
                    this.IIncrementalDownload.autoUpdateRef = this;

                    this.curState = this.State.IDLE;

                } catch (e) {
                    // Not SB 8+ (aka doesn't support autoupdate) so leave in an Uninitialized state
                }
            }

            return this.curState != this.State.NOT_INITIALIZED;
        },

        canAutoUpdate: function () {
            if (this.curState == this.State.NOT_INITIALIZED) {
                return false;
            }

            return this.IApplicationUpdateService.canCheckForUpdates;
        },

        updateURL: function () {
            if (this.curState == this.State.NOT_INITIALIZED) {
                return '';
            }

            return Services.urlFormatter.formatURLPref("app.update.url");
        },

        // Return the current status as a number
        getStatus: function () {
            return this.curState;
        },

        // Return the current status as a string
        getStatusText: function () {
            switch (this.curState) {
                case this.State.NOT_INITIALIZED:
                    return "Not Initialized";
                case this.State.IDLE:
                    return "Idle";
                case this.State.CHECK_FOR_UPDATE:
                    return "Checking For Update";
                case this.State.DOWNLOADING:
                    return "Downloading Update";
                case this.State.INSTALLING:
                    return "Installing Update";
                default:
                    throw "AutoUpdate has Invalid Status";
            }
        },

        // Check to see if an update is available. This function will return a Promise that will be fulfilled when the async
        //  request is complete. It will be successful once it is done returning either a falsy value if there are no
        //  available updates or a truthy value in the form of an object with info about the update. If the check fails
        //  then the Promise will be rejected with an appropriate error message.
        // The XML file that it downloads comes from the pref('app.update.url') and has the format described here:
        //  https://wiki.mozilla.org/Software_Update:updates.xml_Format
        check: function () {

            var self = this;

            var promise = new Promise(function (resolve, reject) {
                switch (self.curState) {

                    case self.State.NOT_INITIALIZED: // Not initialized
                        reject("Not Initialized");
                        break;

                    case self.State.IDLE: // Currently idle so we can check for updates

                        self.updateCallback = function (retValue) {
                            self.curState = self.State.IDLE;

                            if (typeof retValue == 'string') { // A string means the call failed and the string is the error message
                                reject(retValue);
                            }else if(typeof retValue == 'boolean'){ // A bool means the call succeeded, but there were no updates
                                resolve(retValue);
                            } else { // Otherwise must be an object with update details
                                resolve(retValue);
                            }
                        };

                        self.IUpdateChecker.checkForUpdates(self.IUpdateCheckListener, true);

                        break;

                    default: // Not idle so we must wait for the current operation to complete
                        reject("Not Idle");
                        break;
                }
            });

            return promise;
        },

        // Initiate the download of an update. This function returns a promise that will be fulfilled when the download has completed
        //  or rejected if the download fails for whatever the reason (e.g. network does down, can't locate the update URL, the download
        //  is stopped/paused...). This function also takes a callback function that will be notified of progress by passing it a numerical
        //  percentage however there are a couple special values used here: 0 means the download is starting, 100 means the download is
        //  complete and 101 means it has been installed.
        download: function (progressCallback) {

            var self = this;

            var promise = new Promise(function (resolve, reject) {

                if (self.curState == self.State.NOT_INITIALIZED) { // Has this object been Initialized?
                    reject('Cannot Start Download... Auto Update has not Initialized');
                } else if (self.curState != self.State.IDLE) { // Are we already downloading?
                    reject('Cannot Start Download... Not Idle');
                } else if (!self.update) { // Is there an update available?
                    reject('Cannot Start Download... No Update Available (Check For Updates First)');
                } else if (Services.vc.compare(self.update.appVersion, Services.appinfo.version) == 0) { // See if there's a new/different version available
                    reject('No Updates Available to Download');
                } else {

                    self.update.QueryInterface(Components.interfaces.nsIWritablePropertyBag);

                    // If we don't have a patch to get then get the latest patch info (we might already have a patch if we paused the download and are resuming)
                    if (!self.patch) {
                        self.patch = self.update.getPatchAt(0);
                    }

                    self.downloadCallback = function (progress) {
                        if (typeof progress == 'string') { // The Interface says we failed so pass it on as a rejected promise
                            self.curState = self.State.IDLE;
                            if (progress != 'Download Paused') {
                                self.update = null; // Clear update unless download was paused in which case we can resume
                            }
                            reject(progress);
                        } else if (typeof progress == 'number') { // progress is a number telling us how far we've progressed towards completion with 101 meaning downloaded/installed
                            if (progress == 101) { // All done and we were successful!
                                self.curState = self.State.IDLE;
                                self._removeDownloadListener();
                                resolve(true);
                            } else {
                                // Call the progress callback function to notify the consuming app of progress as downloads can take awhile
                                if (progressCallback) {
                                    progressCallback(progress);
                                }
                                lastProgress = progress;
                            }
                        }
                    };

                    self.update.setProperty("backgroundDownload", "true");
                    self.IApplicationUpdateService.pauseDownload();

                    // Try to start the download
                    try {
                        self.patch.state = self.IApplicationUpdateService.downloadUpdate(self.update, false);
                    } catch (e) {
                        reject('Could not start the download (' + e.message + ')')
                    }

                    switch (self.patch.state) {
                        case 'failed': // Install Failed
                            //self.removeDownloadListener();
                            reject('Install Failed');
                            break;
                        case 'download-failed': // Download Failed
                            reject('Download Failed');
                            break;
                        case 'downloading': // Downloading
                        case 'applying': // Installing
                            // If we succeeded at starting the download then add a listener so that we can notify a callback with update messages
                            self.curState = self.State.DOWNLOADING;

                            self.IApplicationUpdateService.addDownloadListener(self.IIncrementalDownload);
                            SecureBrowser.addDownloadListener(self.IIncrementalDownload);
                            break;
                        case 'pending': // Ready to apply (via restart)
                            reject('Update is Pending');
                            break;
                        case 'succeeded':
                            reject('Update Succeeded');
                            break;
                        default:
                            reject('Could not start download (' + self.patch.state + ')');
                            break;
                    }
                }
            });

            return promise;
        },

        // Tell the update service that we want the download to pause. We'll get a callback in onStopRequest when it has actually happened
        //  resulting in a rejected promise during download. We can resume downloading by simply requesting another update (e.g. it will
        //  automatically resume from where it left off)
        stop: function () {
            if (this.curState == this.State.DOWNLOADING) {
                this.IApplicationUpdateService.pauseDownload();
                return true;
            }

            return false;
        },

        // Restart the browser so that any installed updates become active
        restart: function(){
            SecureBrowser.Restart();
        },

        // Private Helper methods

        // Stop listening for download events because downloading is done or was cancelled
        _removeDownloadListener: function () {
            if (this.IApplicationUpdateService) {
                this.IApplicationUpdateService.removeDownloadListener(this.IIncrementalDownload);
            }
            SecureBrowser.removeDownloadListener();
        },

        // Interfaces

        // Implements nsIUpdateCheckListener used during an update check.
        // https://developer.mozilla.org/en-US/docs/Mozilla/Tech/XPCOM/Reference/Interface/nsIUpdateCheckListener
        IUpdateCheckListener: {

            autoUpdateRef: null,

            QueryInterface: function (aIID) {
                if (!aIID.equals(Components.interfaces.nsIUpdateCheckListener) && !aIID.equals(Components.interfaces.nsISupports)) {
                    throw Components.results.NS_ERROR_NO_INTERFACE;
                }

                return this;
            },

            // Once the browser has finished trying to download the update it calls this
            onCheckComplete: function (aRequest, aUpdates, aUpdateCount) {
                var au = this.autoUpdateRef;
                if (aUpdateCount > 0) {
                    try {
                        var update = au.IApplicationUpdateService.selectUpdate(aUpdates, aUpdates.length); // Selects the best update

                        if (update) {
                            // If there's an available update then return the details
                            au.update = update;

                            // don't show prompt when doing background update
                            update.showPrompt = false;

                            au.updateCallback({
                                Available: aUpdateCount,
                                Type: update.type,
                                Name: update.name,
                                DisplayVersion: update.displayVersion,
                                AppVersion: update.appVersion,
                                AppInfoVersion: Services.appinfo.version,
                                BuildID: update.buildID,
                                DetailsURL: update.detailsURL
                            });

                        } else {
                            // No available updates available
                            au.updateCallback(false);
                        }
                    } catch (e) {
                        au.updateCallback('Could not select an update (' + e.message + ')');
                    }
                } else {
                    au.updateCallback('No updates are available');
                }
            },

            // This can happen if the network is unavailable
            onError: function (aRequest, aUpdate) {
                var au = this.autoUpdateRef;
                au.updateCallback('An error occurred while checking for updates (' + aUpdate.statusText + ')');
            }
        },

        // Implements nsIIncrementalDownload (nsIRequestObserver and IProgressEventSink) for downloading.
        IIncrementalDownload: {

            autoUpdateRef: null,

            // nsISupports.idl interface functions
            // https://developer.mozilla.org/en-US/docs/Mozilla/Tech/XPCOM/Reference/Interface/nsISupports
            QueryInterface: function (aIID) {
                if (!aIID.equals(Components.interfaces.nsIProgressEventSink) && !aIID.equals(Components.interfaces.nsIRequestObserver) && !aIID.equals(Components.interfaces.nsISupports)) {
                    throw Components.results.NS_ERROR_NO_INTERFACE;
                }
                return this;
            },

            // nsIRequestObserver.idl interface functions
            // https://developer.mozilla.org/en-US/docs/Mozilla/Tech/XPCOM/Reference/Interface/nsIRequestObserver
            onStartRequest: function (aRequest, aContext) {
                var au = this.autoUpdateRef;
                au.downloadCallback(0);
            },

            // We get this when the download is complete whether successful or not
            onStopRequest: function (aRequest, aContext, aStatusCode) {

                var au = this.autoUpdateRef;

                // Ignore status events that arrive before DOWNLOAD/UPDATE started
                if (au.curState == au.State.IDLE) {
                    return;
                }

                switch (aStatusCode) { // aStatusCodes can be found here: https://developer.mozilla.org/en-US/docs/Mozilla/Errors
                    case Components.results.NS_ERROR_UNEXPECTED: // e.g. Error
                        au._removeDownloadListener();
                        au.downloadCallback('Download Failed');
                        break;
                    case Components.results.NS_BINDING_ABORTED: // e.g. Pause
                        au.downloadCallback('Download Paused');
                        break;
                    case Components.results.NS_OK: // e.g. Success
                        try {
                            au._removeDownloadListener();
                        } catch (e) {
                            ;
                        }

                        // We've successfully downloaded an update so monitor its installation
                        au.curState = au.State.INSTALLING;
                        au.downloadCallback(100);

                        var update = au.IUpdateManager.activeUpdate;

                        // https://developer.mozilla.org/en-US/docs/Mozilla/Tech/XPCOM/Reference/Interface/nsIObserverService
                        Services.obs.addObserver(
                            function (aSubject, aTopic, aData) {
                                try {
                                    // Update the UI when the background updater is finished e.g. the patch has been applied
                                    var status = aData;
                                    if (status == "applied" || status == "applied-service" || status == "pending" || status == "pending-service") {
                                        au.downloadCallback(101); // Download and install complete
                                    } else if (status == "failed") {
                                        au.downloadCallback('Update Failed');
                                    } else if (status == "downloading") {
                                        // We've fallen back to downloading the full update because the partial update failed to get staged in the background.
                                        // Therefore we need to keep our observer.
                                        au.downloadCallback(0);
                                        return;
                                    } else {
                                        au.downloadCallback('Observer Reports Unknown Status During Install = ' + status);
                                    }

                                    Services.obs.removeObserver(arguments.callee, "update-staged");
                                } catch (e) {
                                    au.downloadCallback('Error While Installing Update (' + e.message + ')');
                                }
                            },
                            "update-staged", false);
                        break;
                    case Components.results.NS_ERROR_CONNECTION_REFUSED:
                        au.downloadCallback('Connection Refused');
                        break;
                    case Components.results.NS_ERROR_UNKNOWN_HOST:
                        au.downloadCallback('Unknown Host');
                        break;
                    default:
                        au.downloadCallback('Download Unexpectedly Stopped (' + aStatusCode + ')');
                        break;
                }
            },

            // nsIProgressEventSink.idl interface functions
            // https://developer.mozilla.org/en-US/docs/Mozilla/Tech/XPCOM/Reference/Interface/nsIProgressEventSink
            //
            onProgress: function (aRequest, aContext, aProgress, aProgressMax) {
                var au = this.autoUpdateRef;
                var pctComplete = aProgress / (aProgressMax + 1) * 100; // We add 1 to progressMax here so that we NEVER say we've hit 100% here... we do that when we shift to installing the patch
                au.downloadCallback(pctComplete);
            },

            onStatus: function (aRequest, aContext, aStatus, aStatusArg) {
                ;
            }
        }
    };

    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    SB.AutoUpdate = AU;

})(TDS.SecureBrowser);
