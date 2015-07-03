//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
﻿// REQUIRES: SecureBrowser.Base.js, Summit/air_mobile.js


TDS.SecureBrowser.Mobile = TDS.SecureBrowser.Mobile || {};

/*
The mobile iOS version of the secure browser built on top of the Summit application.
*/

TDS.SecureBrowser.Mobile.iOS = function () {

    TDS.SecureBrowser.Mobile.iOS.superclass.constructor.call(this);

    // retrieve the guide access status from local storage.
    this._guidedAccessMode = localStorage.getItem('ios-guidedaccessstatus');
    // set guided access status to 'unknown' if local storage does not have the data
    if (this._guidedAccessMode == null) {
        this._guidedAccessMode = 'unknown';
    }

    this._processes = [];
    this._backgroundThreshold = 5;  // default value is five seconds

    // get browser object and initialize
    this._airMobile = (new Summit.SecureBrowser.Mobile()).getNativeBrowser();
    this._airMobile.initialize();
};

YAHOO.lang.extend(TDS.SecureBrowser.Mobile.iOS, TDS.SecureBrowser.Base);

TDS.SecureBrowser.Mobile.iOS.prototype.loadProcessList = function () {
    this.setProcessList();
};

TDS.SecureBrowser.Mobile.iOS.prototype.getProcessList = function () {
    this.setProcessList();
    return this._processes;
};

TDS.SecureBrowser.Mobile.iOS.prototype.setBackgroundThreshold = function (value) {
    this._backgroundThreshold = value;
};

TDS.SecureBrowser.Mobile.iOS.prototype.initialize = function () {

    var secBrowser = this._airMobile;
    var guidedAccessMode = this._guidedAccessMode;
    var backgroundThreshold = this._backgroundThreshold;
    var startTimeBackground = null;
    var hasBeenBackgrounded = false;
    this.getHasBeenBackgrounded = function () { return hasBeenBackgrounded; };
    this.setProcessList = function () { this._processes = secBrowser.device.runningProcesses; };
    var isLockedDown = true; // indicate if a student test session is going on
    this.isSystemLockedDown = function () { return isLockedDown; };
    var isAutonomousGuidedAccessEnabled;    // we cannot determine whether autonomous guided access is available until the student app is fully loaded

    this.checkAutonomousGuidedAccess = function () {
        if (typeof (isAutonomousGuidedAccessEnabled) == 'undefined') {
            // Determine whether autonomous guided access is available. ASAM will cause the browser to crash on iOS 7.0.x,
            // so we limit the use of ASAM to iOS 7.1 or later versions.
            if (Util.Browser.getIOSVersion() >= 7.1) {
                isAutonomousGuidedAccessEnabled = TDS.getAppSetting('sb.iosAutonomousGuidedAccessAllowed', false);
            } else {
                isAutonomousGuidedAccessEnabled = false;
            }
        }
        return isAutonomousGuidedAccessEnabled;
    };

    this.getGuidedAccessMode = function () {
        return guidedAccessMode;
    };

    this.setLockDown = function (lockdown) {
        isLockedDown = lockdown;
        if (!lockdown) {
            hasBeenBackgrounded = false;
            // Disable guided access when lockdown is lifted.
            if (this.checkAutonomousGuidedAccess() && guidedAccessMode == 'enabled') {
                secBrowser.enableGuidedAccess(lockdown, null, function (enableResults) {
                    if (enableResults.didSucceed) {
                        guidedAccessMode = 'disabled';
                        // store the guided access status using local storage
                        localStorage.setItem('ios-guidedaccessstatus', 'disabled');
                    }
                });
            }
        } else if (isAutonomousGuidedAccessEnabled && guidedAccessMode == 'disabled') {
            // if autonomous guided access is available, enable guided access when system lockdown
            secBrowser.enableGuidedAccess(lockdown, null, function (enableResults) {
                if (enableResults.didSucceed) {
                    guidedAccessMode = 'enabled';
                    // store the guided access status using local storage
                    localStorage.setItem('ios-guidedaccessstatus', 'enabled');
                }
            });
        }
    };

    // check the guided access mode from the API
    secBrowser.checkGuidedAccessStatus(null, function (results) {
        if (results.enabled) {
            guidedAccessMode = 'enabled';
        } else {
            guidedAccessMode = 'disabled';
        }
        // store the guided access status using local storage
        localStorage.setItem('ios-guidedaccessstatus', guidedAccessMode);
        Util.log("access mode recorded is .. " + guidedAccessMode);
    });

    // listen and update for guided access changes
    secBrowser.listen(secBrowser.EVENT_GUIDED_ACCESS_CHANGED, document, function () {
        if (secBrowser.device.guidedAccessEnabled) {
            guidedAccessMode = 'enabled';
        } else {
            guidedAccessMode = 'disabled';
        }
        // store the guided access status using local storage
        localStorage.setItem('ios-guidedaccessstatus', guidedAccessMode);
        Util.log("access mode now is changed to ... " + guidedAccessMode);
    });

    // listen and check if the browser has been pushed to the background
    secBrowser.listen(secBrowser.EVENT_ENTER_BACKGROUND, document, function () {
        // record the time when the browser enters background during a test session
        if (isLockedDown) {
            startTimeBackground = (new Date()).getTime();
        }
        Util.log("the browser has been pushed to the background");
    });

    // listen and check if the browser has returned to the background
    secBrowser.listen(secBrowser.EVENT_RETURN_FROM_BACKGROUND, document, function () {
        // check if it is currently in a test session
        if (isLockedDown) {
            // check if the browser has been pushed to the background previously
            if (startTimeBackground != null) {
                // calculate the duration in which the browser has been running in the background
                var endTimeBackground = (new Date()).getTime();
                if ((endTimeBackground - startTimeBackground) > (backgroundThreshold * 1000)) {
                    // issue a warning only when the duration is longer than a threshold
                    hasBeenBackgrounded = true;
                }
                startTimeBackground = null;
            }
        }
        Util.log("the browser has been put to the background");
    });
};

TDS.SecureBrowser.Mobile.iOS.prototype.enableLockDown = function (lockDown) {
    this.setLockDown(lockDown);
};

TDS.SecureBrowser.Mobile.iOS.prototype.canEnvironmentBeSecured = function () {
    var result = { 'canSecure': true, 'messageKey': null };

    if (this.getGuidedAccessMode() == 'enabled') {
        // if guided access is ON, issue a warning for volume control on iOS devices
        result.messageKey = 'LoginShell.Alert.EnvironmentSecureiOSVolumeControl';
        var defaultVolumeWarning = 'Warning: You cannot adjust the volume of your iPad during the test. If you need to adjust the volume, please turn off Guided Access. Adjust the volume using the volume control buttons on the iPad, and then activate Guided Access.  If you need help, please ask your proctor.';
        TDS.Dialog.showWarning(result.messageKey, defaultVolumeWarning);
    } else if (!this.checkAutonomousGuidedAccess()) {
        // the guided access is OFF abd autonomous guided access is not enabled, issue the warning that the security cannot be enabled
        result.canSecure = false;
        result.messageKey = 'LoginShell.Alert.EnvironmentInsecureiOSVolumeControl';
    }

    return result;
};

TDS.SecureBrowser.Mobile.iOS.prototype.isEnvironmentSecure = function () {
    var result = { 'secure': (this.getGuidedAccessMode() == 'enabled') && (!this.getHasBeenBackgrounded()), 'messageKey': null };
    return result;
};

// Returns a handle to the native browser engine.
TDS.SecureBrowser.Mobile.iOS.prototype.getRunTime = function () {
    return this._airMobile;
};


