//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
﻿// REQUIRES: YUI, IO.js, SecureBrowser.Base.js

/*
The Certified Device version of the secure browser built on top of the firefox platform.
*/

(function (SB) {

    function Certified() {
        Certified.superclass.constructor.call(this);
    };

    YAHOO.lang.extend(Certified, TDS.SecureBrowser.Base);

    Certified.prototype._hasAPI = function () {
        return (typeof (window.browser) != 'undefined');
    };

    Certified.prototype.clearCache = function () {
        try {
            if (this._hasAPI()) {
                browser.security.clearCache(); // Device Certification Required API #3
                return true;
            }
        } catch (ex) {
        }

        return false;
    };

    Certified.prototype.clearCookies = function () {
        try {
            if (this._hasAPI()) {
                browser.security.clearCookies(); // Device Certification Required API #4
                return true;
            }
        } catch (ex) {
        }

        return false;
    };

    Certified.prototype.emptyClipBoard = function () {
        try {
            if (this._hasAPI()) {
                browser.security.emptyClipBoard(); // Device Certification Required API #5
                return true;
            }
        } catch (ex) {
        }

        return false;
    };

    Certified.prototype.getMACAddress = function () {
        var mac = null;

        try {
            if (this._hasAPI()) {
                alert('try');
                mac = browser.security.getMACAddress(); // Device Certification Required API #6
                mac.toUpperCase();
            }
        } catch (e) {
            alert('catch');
        }

        return mac;
    };

    Certified.prototype.getIPAddressList = function () {
        var addressList = [];

        try {
            if (this._hasAPI()) {
                addressList = browser.security.getIPAddressList(); // Device Certification Required API #7
            }
        } catch (ex) {
        }

        return addressList;
    };

    Certified.prototype.getProcessList = function () {
        var processList = [];

        try {
            if (this._hasAPI()) {
                processList = browser.security.getProcessList(); // Device Certification Required API #8

            }
        } catch (ex) {
        }
        // clean any leading or trailing whitespace
        for (var i = 0; i < processList.length; i++) {
            processList[i] = YAHOO.lang.trim(processList[i]).toLowerCase();
        }

        // remove any duplicates
        processList = Util.Array.unique(processList);
        return processList;
    };

    Certified.prototype.close = function (restart) {

        try {
            if (this._hasAPI()) {
                browser.security.closeWindow(restart); // Device Certification Required API #9
                return true;
            }
        } catch (ex) {
        }
        return false;
    };

    // Get the start time of when the app was launched
    Certified.prototype.getAppStartTime = function () {
        try {
            if (this._hasAPI()) {
                browser.security.getStartTime(); // Device Certification Required API #10
                return true;
            }
        } catch (ex) {
        }
        return false;
    };

    Certified.prototype.enableLockDown = function (lockDown) {
        try {
            if (this._hasAPI()) {
                browser.security.enableLockDown(lockDown); // Device Certification Required API #1
                return true;
            }
        } catch (ex) {
        }
        return false;
    };

    Certified.prototype.isEnvironmentSecure = function () {
        try {
            if (this._hasAPI()) {
                var isSecure = browser.security.isEnvironmentSecure(); // Device Certification Required API #2
                var result = { 'secure': isSecure, 'messageKey': null };
                return result;
            }
        } catch (ex) {
        }
        return false;
    };

    Certified.prototype.getDeviceInfo = function () {
        try {
            if (this._hasAPI()) {
                browser.security.getDeviceInfo(); // Device Certification Required API #23
                return true;
            }
        } catch (ex) {
        }
        return false;
    };

    SB.Certified = Certified;

})(TDS.SecureBrowser);