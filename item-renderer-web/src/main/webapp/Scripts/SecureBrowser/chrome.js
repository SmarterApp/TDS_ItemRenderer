//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
﻿// REQUIRES: SecureBrowser.Base.js

/*
The chrome browser running our security extension (mainly on chrome OS)
*/

(function (SB) {
    
    function Chrome() {
        Chrome.superclass.constructor.call(this);
        // This is disabled for now since we use the hardware buttons on chrome books to control volume. We may reenable this once the chrome.audio apis make it into the stable channel
        /*
        this.isMuted = false;
        this.volume = -1;
    
        var messageHandler = function (event) {
            if (event.data.type && event.data.type == "CHROME RESPONSE" && event.data.command == "APP GETVOLUME" && event.data.status == "OK") {
                this.volume = event.data.result.volume;
                this.isMuted = event.data.result.isMuted;
            }
            if (event.data.type && event.data.type == "CHROME RESPONSE" && event.data.command == "APP SETVOLUME" && event.data.status == "OK") {
                this.volume = event.data.params.volume;
                this.isMuted = event.data.params.isMuted;
            }
        };
    
        TDS.AppWindow.addEventListener("message", messageHandler.bind(this), true);
        TDS.AppWindow.postMessage({ type: "CHROME COMMAND", command: "APP GETVOLUME", params: { } }, "*");   // Get the current volume
        */
    };

    YAHOO.lang.extend(Chrome, TDS.SecureBrowser.Base);

    Chrome.prototype.initialize = function() {
        TDS.AppWindow = window;

        var bootstrap = function (event) {
            if (event.data.type && event.data.type == "CHROME RESPONSE" && event.data.command == "APP WELCOME") {
                TDS.AppWindow = event.source;
                window.removeEventListener(bootstrap);
            }
        };

        window.addEventListener("message", bootstrap, true);
    };

    Chrome.prototype.close = function () {
        // post a message in case we are a packaged app and the app launcher can shut us down if it is around
        TDS.AppWindow.postMessage({ type: "CHROME COMMAND", command: "APP CLOSE", params: {} }, "*");

        // continue to execute the "old" way closing - ie returning to 
        if (typeof TDS.logout == 'function') TDS.logout();
        return false;
    };

/*
// Mute the system volume
TDS.SecureBrowser.Chrome.prototype.mute = function () {
    if (this.volume < 0) return false;  // if volume has not already been updated, it is likely that our call to GETVOLUME did not succeed and in that case, we are likely not running in a packaged app
    TDS.AppWindow.postMessage({ type: "CHROME COMMAND", command: "APP SETVOLUME", params: { isMuted: true, volume: this.volume } }, "*");
    return true;
};

// Unmute the system volume
TDS.SecureBrowser.Chrome.prototype.unmute = function () {
    if (this.volume < 0) return false;  // if volume has not already been updated, it is likely that our call to GETVOLUME did not succeed and in that case, we are likely not running in a packaged app
	TDS.AppWindow.postMessage({ type: "CHROME COMMAND", command: "APP SETVOLUME", params: { isMuted: false, volume: this.volume } }, "*");
    return true;
};

// Check if the system is muted
TDS.SecureBrowser.Chrome.prototype.isMuted = function () {
    return this.isMuted;
};

// get the volume.. if this returns -1 then not supported
TDS.SecureBrowser.Chrome.prototype.getVolume = function () {
    return Math.max(this.volume*100,-1);   // chrome volume is in the range 0.0 - 1.0
};

// set the volume.. if this returns false then not supported or invalid percentage
TDS.SecureBrowser.Chrome.prototype.setVolume = function (percent) {
    if (this.volume < 0) return false;  // if volume has not already been updated, it is likely that our call to GETVOLUME did not succeed and in that case, we are likely not running in a packaged app
	TDS.AppWindow.postMessage({ type: "CHROME COMMAND", command: "APP SETVOLUME", params: { isMuted: this.isMuted, volume: percent/100 } }, "*");
    return true;
};
*/

    SB.Chrome = Chrome;

})(TDS.SecureBrowser);
