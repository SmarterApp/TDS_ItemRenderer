//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
﻿/*
The main test shell entry code.
*/

(function () {

    'use strict';

    var TS = {
        initializing: true,
        testLengthMet: false, // no more groups will be created
        testFinished: false, // all questions on the test have been responded to

        idleTimer: null, // idle timer object

        autoSaveTimer: null, // auto save timer object
        autoSaveInterval: 120, // # of seconds until we try to auto save

        enableKeyEvents: true,
        xhrManager: null,
        xhrTimer: null,

        muted: false, // did we mute the volume for this test?

        isUnloading: false  // Flag indicating that the testshell is currently in the process of unloading (due to pause or end test). Timers can inspect this to determine if they should run or stop
    };

    // gets loaded from TestShellScripts.ascx code behind AddTestConfig()
    // preset sane defaults
    TS.Config = {
        urlBase: './', // the base url of the entire site
        reviewPage: 0, // this is used for when we come back to the shell from the review page
        testName: 'Unknown', // the name of the test displayed to the student
        testLength: 0, // The # of questions on the test.
        prefetch: 0,
        startPosition: 1, // What question to first show the student.
        contentLoadTimeout: 120, // The # of seconds until you abort trying to load content.
        interfaceTimeout: 20, // The # of minutes the student can be idle before logging them out.
        interfaceTimeoutDialog: 30, // The # of seconds the student has to respond to the logout dialog before logging them out.
        requestInterfaceTimeout: 40, // The # of minutes the student can be idle after making a print request before logging them out.
        oppRestartMins: 20, // The # of minutes until a pause will expire answered questions.
        autoSaveInterval: 120, // # of seconds until we try to auto save
        saveOnFocusChange: true, // save when losing focus
        forbiddenAppsInterval: 60, // # of seconds until we check for forbidden apps
        environmentCheckInterval: 30,
        disableSaveWhenInactive: false,
        disableSaveWhenForbiddenApps: false,
        disableSaveWhenEnvironmentCompromised: false,
        allowSkipAudio: false,
        showSegmentLabels: false,
        audioTimeout: 180, // # of seconds (set 0 to turn off, default is 3 mins)
        enableLogging: false, // enable logging in TestShell.Logging
        dictionaryUrl: null,
        auditTimerInterval: 60 // interval for the poller posting completed audit records to the DB
    };

    TS.Events = new Util.EventManager(TS);

    TS.SaveRequest = {
        Manual: 0, // click save
        Implicit: 1, // next/back
        Auto: 2, // timer
        FocusChange: 3, // change items
        Force: 4 // forced save (disregards saveoptions settings only; other checks still apply)
    };

    // call this function to load the test shell
    TS.load = function () {
        try {
            TS.init();
        } catch (ex) {
            TDS.Diagnostics.report(ex);
        }
    };

    // let the user confirm they want to exit the test
    TS.unload = function (event) {

        if (TDS.unloader.initiateUnload()) {
            // navigation away from this page is not allowed, give the user a warning
            return Messages.getAlt('TestShell.Label.leavingPageAlert', 'You are attempting to leave the test. If you select OK, the test will be paused. Select cancel to continue your test.');
        }

        // stop xhr timer
        if (TS.xhrTimer) {
            TS.xhrTimer.stop();
        }

        // Set the unload state
        TS.isUnloading = true;

        // always try and stop TTS before leaving a page
        TTS.Manager.stop();
    };

    // this function helps with unloading the SecureBrowser
    TS.unloadSB = function (event) {
        // check if we muted the test during start and it is still muted
        if (TS.muted && Util.SecureBrowser.isMuted()) {
            // Bug 130005: unmute system volume as well
            TS.muted = false;
            Util.SecureBrowser.unmute();
        }
    };

    // this function gets called when the test shell scripts/html/css is ready
    TS.init = function () {

        TS.UI.showLoading(Messages.getAlt('TestShell.Label.Initializing', 'Initializing'));

        // initialize xhr api
        TS.xhrManager = new TS.XhrManager();

        // initialize xhr timer
        var batchUrl = TDS.resolveBaseUrl('Pages/API/TestShell.axd/timer');
        var batchTimeout = 120000; // 2 mins until xhr times out
        var timerInterval = 60000; // 1 min for timer to trigger (1 tick = ~1 min)
        TS.xhrTimer = new TDS.XhrTimer.create(batchUrl, batchTimeout, timerInterval);
        TS.xhrTimer.start();

        // initialize the TDS object and load global configs
        TDS.init();
        
        // set lang tag on <html>
        if (TDS.getLanguage() == 'ESN') {
            $('html').attr('lang', 'es'); // set <html> lang to Spanish, otherwise default to English
        }

        // check if enhanced accessibility mode is enabled
        var accProps = TDS.getAccProps();
        if (accProps.isStreamlinedMode()) {
            // enable accessibility mode in content manager 
            ContentManager.enableAccessibility();
            // disable test shell keyboard shortcuts
            TS.enableKeyEvents = false;
            // allow focus on buttons
            TDS.Shell.allowFocus = true;
        }

        // initialize the UI
        TS.UI.init();

        // set url of iframe for resource dialogs
        ContentManager.Dialog.urlFrame = TS.Config.urlBase + 'Pages/DialogFrame.aspx';

        // subscribe to button clicks
        TS.subscribeDomEvents();

        // subscribe to keyboard events
        KeyManager.init();

        // check if any forbidden apps (also starts timer)
        if (TS.checkForbiddenApps()) {
            return;
        }

        // check if the environment is secure (also starts timer)
        if (TS.checkForEnvironmentSecurity()) {
            return;
        }

        // initialize content manager
        ContentManager.init(TDS.baseUrl);
        ContentManager.setReadOnly(TDS.isReadOnly);

        // setup audio player
        var flashPath = TDS.resolveBaseUrl('Scripts/Libraries/soundmanager2/swf/');
        TDS.Audio.Player.setup(flashPath);

        // FIX: json parser for MS dates when serializing (only works with YUI 2.7.0 version of JSON)
        // NOTE FROM YUI for 2.8.0: Overriding YAHOO.lang.JSON.dateToString is no longer recommended because the default ISO 8601 
        // serialization is defined in the spec. If Dates must be formatted differently, either preprocess the data or 
        // set useNativeStringify to false after overriding dateToString.
        YAHOO.lang.JSON.dateToString = function (d) {
            // UTC milliseconds since Unix epoch (M$-AJAX serialized date format (MRSF))
            return '\/Date(' + d.getTime() + ')\/';
        };

        // NOTE: this needs to be after overriding YAHOO.lang.JSON.dateToString in 2.8.0
        // YAHOO.lang.JSON.useNativeStringify = false; // we want to overwrite dateToString so we can't use native JSON stringifier right now

        // load segments
        TS.SegmentManager.init();

        // get current responses
        TS.ResponseManager.ping();

        // Subscribe to the disposing of SecureBrowser runtime object
        if (Util.SecureBrowser.once) { // <-- if base constructor isn't called then missing
            Util.SecureBrowser.once('dispose', TS.unloadSB);
        } else {
            console.warn('The SB implementation is missing call to base constructor.');
        }

        // let everyone know the test shell has been initialized
        TS.Events.fire('init');
        
        //SB-1364: To hide print page button
        sbacossChanges();
    };

    // attach DOM events to the test shell
    TS.subscribeDomEvents = function () {

        TS.UI.Events.btnSave.subscribe(function () {
            TS.save(TS.SaveRequest.Manual);
        });

        TS.UI.Events.btnPause.subscribe(function() {
            TS.pause();
        });

        TS.UI.Events.btnBack.subscribe(function() {
            TS.Navigation.back();
        });

        TS.UI.Events.btnNext.subscribe(function() {
            TS.Navigation.next();
        });
        
        // SB-1504: Binding the bottom next button in testshell to next button's event handler
        TS.UI.Events.btnNextBottom.subscribe(function() {
        	TS.Navigation.next();
        });

        TS.UI.Events.btnEnd.subscribe(function() {
            TS.complete();
        });

        TS.UI.Events.btnResults.subscribe(function() {
            TS.redirectReview();
        });

        // when in accessibility mode use "GO" button
        if (ContentManager.isAccessibilityEnabled()) {
            $('#jumpGo').show();
            $('#jumpGo').on('click', function() {
                TS.Navigation.change();
            });
        } else {
            $('#ddlNavigation').on('change', function () {
                TS.Navigation.change();
            });
        }

    };

    TS.getHandlersUrl = function (handler) {
        var urlBuilder = [];
        urlBuilder.push(TDS.baseUrl);
        urlBuilder.push('Pages/API/');
        if (handler) {
            urlBuilder.push(handler);
        }
        return urlBuilder.join('');
    };

    // if this is true then the test has been completed and we can leave the test shell
    TS.isTestCompleted = function () {
        // check if the test length has been met and we have pages
        if (TS.testLengthMet && TS.PageManager.hasPages()) {
            // check if all the pages have been completed
            var completed = TS.PageManager.isCompleted();

            // Are all pages that need to be visited, visited?
            var requiredPagesVisited = !TS.PageManager.getPages().some(function (page) {
                return page.requiresVisit() && !page.isVisited();
            });

            return completed && requiredPagesVisited;
        }

        return false;
    };

    // runs some validations and then pauses the test
    TS.pause = function () {
        var taskWorkflow = new Util.TaskWorkflow();

        // BUG 118416 static introduced when pausing during a recording 
        taskWorkflow.add(TS.Validation.checkRecorderWarning);

        // WARNING: It is possible the applet could be recording when you try and record.
        // (e.x., try recording something and save, then record something else, pause and say yes.. it will call undo)
        taskWorkflow.add(TS.Validation.checkDirtyResponses);
        taskWorkflow.add(TS.Validation.checkSimulatorPlaying, 'SimulatorPlayingWhileNavigating');

        // check block pausing
        taskWorkflow.add(TS.save, TS, true);
        taskWorkflow.add(TS.Validation.checkBlockPausing);

        taskWorkflow.start(TS._pauseInternal, TS);
    };

    // internal function for pausing test
    TS._pauseInternal = function (silent, reason, disableSave) {

        // Save all items that can be implicit saved.
        // NOTE: If this was called from public function then there should be nothing to save.
        if (!disableSave) {
            TS.save();
        }

        // send pause request to server
        function sendPause() {

            // check for a reason and set default if none
            if (!YAHOO.lang.isString(reason)) {
                reason = 'manual';
            }

            TS.Navigation.hidePage(); // try and hide the current page

            // send pause notice to server and whether it fails or succeeds redirect to login
            TS.xhrManager.queueAction('pause', { reason: reason }, function () {
                if (TDS.isProxyLogin) {
                    TS.redirectProxyLogout();
                } else {
                    TS.redirectLogin();
                }
            });
        }

        if (silent === true) {
            sendPause();
        } else {
            // HACK: writing gets different pause message
            // var pauseMessage = (TS.Frame.getWriting()) ? ErrorCodes.get('WritingPause') : ErrorCodes.get('Pause', [TS.Config.oppRestartMins]);
            // TODO: Add writing message back. This was broken with new composite item code.
            var pauseMessage = ErrorCodes.get('Pause', [TS.Config.oppRestartMins]);
            TS.UI.showWarningPrompt(pauseMessage, {
                yes: sendPause
            });
        }
    };

    TS.complete = function () {
        var taskWorkflow = new Util.TaskWorkflow();
        taskWorkflow.add(TS.Validation.checkAudioPlaying);
        taskWorkflow.add(TS.Validation.checkDirtyResponses);
        taskWorkflow.add(TS.Validation.checkAudioRecording);
        taskWorkflow.add(TS.Validation.checkRecorderQuality);
        taskWorkflow.add(TS.Validation.checkIfPromptSelected);
        taskWorkflow.add(TS.Validation.checkSimulatorPlaying, 'SimulatorPlayingWhileNavigating');

        if (TDS.isProxyLogin && TDS.isSIRVE) {
            //if SIRVE do not do any validation and just redirect to login shell.
            TS.redirectLogin();
            return;
        }

        taskWorkflow.start(this._completeInternal, this);
    };

    TS._completeInternal = function () {

        // check if button is visible, if not then don't allow this function to work (prevents shortcut from still working)
        var btn = YUD.getStyle('btnEnd', 'display');
        if (btn == 'none') {
            return;
        }

        // save current page
        TS.save();

        var hasUnanswered = false;

        // make sure each group has a valid response
        Util.Array.each(TS.PageManager.getGroups(), function (group) {
            if (!group.isCompleted()) {
                TS.UI.showWarning(ErrorCodes.get('EndUnanswered'));
                hasUnanswered = true;
            }
        });

        if (hasUnanswered) {
            return;
        }

        // show warning
        TS.UI.showWarningPrompt('Complete', {
            yes: function () {
                TS.Navigation.hidePage(); // try and hide the current page
                // send complete notice to server and redirect to review screen if succeeds
                TS.xhrManager.queueAction('complete', null, function () {
                    TS.redirectReview();
                });
            }
        });
    };

    // save the responses on the page 
    // (NOTE: if savetype is not specified then it is considered implicit)
    TS.save = function (saveRequest, items) {
        
        // Bug 93008: save() was blocking page navigation in SIRVE - it shouldn't have been applied to SIRVE after all
        if (TDS.isSIRVE) {
            return;
        }

        // assume implicit save
        if (saveRequest == null) {
            saveRequest = TS.SaveRequest.Implicit;
        }

        // perform validation only if the user manually clicked save
        if (saveRequest == TS.SaveRequest.Manual) {
            var taskWorkflow = new Util.TaskWorkflow();
            taskWorkflow.add(TS.Validation.checkAudioRecording);
            taskWorkflow.add(TS.Validation.checkRecorderQuality);
            taskWorkflow.add(TS.Validation.checkSimulatorPlaying, 'SimulatorPlayingWhileSaving');
            taskWorkflow.add(TS.Validation.checkIfPromptSelected);
            taskWorkflow.start(function() {
                TS._saveInternal(saveRequest, items);
            }, TS);
        } else {
            TS._saveInternal(saveRequest, items);
        }
    };

    // Sends any unsaved responses to the server (if autosave is true then this save required was made by the timer)
    TS._saveInternal = function (saveRequest, items) {

        // save item responses
        try {
            TS._saveResponses(saveRequest, items);
        } catch (ex) {
            TDS.Diagnostics.report(ex);
        }

        // reset auto save timer
        TS.autoSaveStart();
    };

    TS._saveResponses = function (saveRequest, items) {
        
        // get current group
        var currentPage = TS.PageManager.getCurrent();
        if (!currentPage || !currentPage.items) {
            return;
        }

        // ignore performing auto save when an action is being performed
        if (saveRequest == TS.SaveRequest.Auto && TS.xhrManager.hasAction()) {
            return;
        }

        // collection of items we need to save
        var itemsToSave = [];

        // check if item can be saved
        function checkItem(item) {

            // make sure item has been loaded otherwise there is nothing to save
            var contentItem = item.getContentItem();
            if (!contentItem) {
                return;
            }

            // check if response is available
            if (!contentItem.isResponseAvailable()) {
                return;
            }

            // check if this item supports the current save request
            var saveOptions = item.getSaveOptions();

            // check if item allows for manually save (user initiated)
            if (saveRequest == TS.SaveRequest.Manual && !saveOptions.explicit) {
                return;
            }

            // check if item allows for auto save (timer)
            if (saveRequest == TS.SaveRequest.Auto && !saveOptions.auto) {
                return;
            }

            // check if item allows for implicit save (next/back)
            // if (saveRequest == TS.SaveRequest.Implicit && !saveOptions.implicit) {
            //     return;
            // }

            // check if item allows for focus change save (switching items)
            if (saveRequest == TS.SaveRequest.FocusChange && !saveOptions.focusChange) {
                return;
            }

            // check if html editor has spell check enabled
            if (contentItem.editor &&
                contentItem.editor.commands &&
                contentItem.editor.commands.spellchecker &&
                contentItem.editor.commands.spellchecker.enabled) {

                // ignore auto save when spell checking
                if (saveRequest == TS.SaveRequest.Auto) {
                    return;
                }

                // disable spell check so we can save
                contentItem.editor.commands.spellchecker.exec();
            }

            // HACK: finalize grid
            if (contentItem.grid) {
                contentItem.grid.canvas.stopAction();
                contentItem.grid.canvas.clearFocused();
            }

            // get the response to send to the server
            var response = contentItem.getResponse();
            if (!response) {
                console.warn('There is no item response.');
                return;
            }

            // HACK: set recorder to not dirty
            if (contentItem.recorder) {
                var recorderObj = TDS.Audio.Widget.getRecorder(contentItem.recorder);
                if (recorderObj) {
                    recorderObj.dirty = false;
                }
            }

            // save response to the item object which is what we use to coordinate with the server
            item.value = response.value;
            item.isSelected = response.isSelected;
            item.isValid = response.isValid;

            itemsToSave.push(item);
        }

        // get items to check
        var itemsToCheck;
        if (items && items.length > 0) {
            // someone passed in specific items
            itemsToCheck = items;
        } else {
            // all items on the page
            itemsToCheck = currentPage.items;
        }

        // check if any of the items can be saved
        itemsToCheck.forEach(function (item) {
            try {
                checkItem(item);
            } catch (ex) {
                TDS.Diagnostics.report(ex);
            }
        });

        // check if there are any responses to save
        // BUG #57542: we must check for this because if we send empty responses 
        // and an action is assigned to xhrmanager it will get triggered
        if (itemsToSave.length > 0) {
            TS.ResponseManager.sendResponses(itemsToSave);
        }

    };

    TS.autoSaveStart = function () {

        // cancel any existing timers
        if (TS.autoSaveTimer) {
            TS.autoSaveTimer.cancel();
            TS.autoSaveTimer = null;
        }

        // check if there is an auto save interval
        if (TS.Config.autoSaveInterval == 0) {
            return;
        }

        var autoSaveMillis = (TS.Config.autoSaveInterval * 1000);

        // start a new timer
        TS.autoSaveTimer = YAHOO.lang.later(autoSaveMillis, TS, function() {

            // timer was triggered so clear it
            TS.autoSaveTimer = null;

            // run save
            try {
                TS.save(TS.SaveRequest.Auto);
            } catch (ex) { }

            // as a backup if nobody started the timer we will
            if (!TS.autoSaveTimer) {
                TS.autoSaveStart();
            }
            
        });
    };

    TS.redirectProxyLogout = function () {
        TDS.unloader.disable();
        TDS.logoutProctor(false);
    };

    TS.redirectLogin = function () {
        TDS.unloader.disable();
        TS.UI.showLoading('');
        top.location.href = TDS.getLoginUrl();
    };

    TS.redirectReview = function () {
        TDS.unloader.disable();
        TS.UI.showLoading('');
        var url = TDS.baseUrl + 'Pages/ReviewShell.aspx';
        top.location.href = url;
    };

    // redirect to the error page
    TS.redirectError = function (text) {
        TDS.unloader.disable();
        var url = TDS.baseUrl + 'Pages/Notification.aspx';

        if (YAHOO.util.Lang.isString(text)) {
            url += '?message=' + encodeURIComponent(text);
        }

        top.location.href = url;
    };

    // set timer for forbidden apps
    TS.checkForbiddenApps = function () {
        // check if forbidden apps checking is disabled
        if (TDS.Debug.ignoreForbiddenApps) {
            return false;
        }
        if (!(TS.Config.forbiddenAppsInterval > 0)) {
            return false;
        }
        
        if (TS.isUnloading)
            return false;  // TS is unloading. No need to show an alert fb# 152367 (similar)

        // check if this school is excluded
        if (Util.Browser.readCookie('TDS-Student-ExcludeSchool') == 'True') {
            return false;
        }

        var checkForbiddenAppsCallback = function(forbiddenApps) {
            // if there are any forbidden apps then alert user and log them out
            if (forbiddenApps.length > 0) {
                var message = Messages.get('ForbiddenApps') + forbiddenApps[0];

                TS.UI.showAlert('Error', message, function () {
                    TS._pauseInternal(true, 'forbiddenApps', TS.Config.disableSaveWhenForbiddenApps);
                });

                return true;
            }
        };

        Util.SecureBrowser.getForbiddenApps().then(checkForbiddenAppsCallback.bind(this));

        // check 30 seconds from now again
        // var forbiddenAppsMillis = (TS.Config.forbiddenAppsInterval * 1000);
        var forbiddenAppsMillis = 30 * 1000; // (TS.Config.environmentCheckInterval * 1000);
        YAHOO.lang.later(forbiddenAppsMillis, TS, TS.checkForbiddenApps);
        return false;
    };

    // set timer for checking that the environment is still secure
    TS.checkForEnvironmentSecurity = function () {

        if (TDS.Debug.ignoreBrowserChecks) {
            return false;
        }

        if (TS.isUnloading) return false;  // TS is unloading. No need to show an alert fb# 152367

        var isEnvironmentSecureCallback = function(securityCheckResult) {
            if (securityCheckResult != null && (!securityCheckResult.secure)) {
                var errorMessageKey = (securityCheckResult.messageKey != null) ? securityCheckResult.messageKey : 'TestShell.Alert.EnvironmentInsecure';
                var error = Messages.getAlt(errorMessageKey, 'Environment is not secure. Your test will be paused.');
                TS.UI.showAlert('Error', error, function () {
                    TS._pauseInternal(true, 'Environment Security', TS.Config.disableSaveWhenEnvironmentCompromised);
                });
            }
        };
        // if the environment security has been breached, alert user and log them out
        Util.SecureBrowser.isEnvironmentSecure().then(isEnvironmentSecureCallback.bind(this));

        // check 30 seconds from now again
        var timerMillis = 30 * 1000; // (TS.Config.environmentCheckInterval * 1000);
        YAHOO.lang.later(timerMillis, TS, TS.checkForEnvironmentSecurity);

        return false;
    };
    
    window.TestShell = TS;

    // this function gets called when an iframe gets logged out and redirected back to the login page
    window.onFrameLogout = function () {
        if (top._frameLoggedOut) {
            return;
        }
        top._frameLoggedOut = true;
        var logoutError = Messages.get('TDSShellJS.Label.FrameLogout');
        TS.redirectError(logoutError);
    }

})();

