//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
/*
Implements the AIR browser spec for the Amplify API's.
*/

(function() {

    // only run code if the browser is amplify
    if (navigator.userAgent.indexOf('AmplifyKiosk') == -1) {
        return;
    }

    function BrowserSecurity() {
        this.enableLockDown = function(enabled) {
            window.JavaBrowserSecurity.enableLockDown(enabled);
        };
        this.isEnvironmentSecure = function() {
            return window.JavaBrowserSecurity.isEnvironmentSecure();
        };
        this.clearCache = function() {
            window.JavaBrowserSecurity.clearCache();
        };
        this.clearCookies = function() {
            window.JavaBrowserSecurity.clearCookies();
        };
        this.emptyClipBoard = function() {
            window.JavaBrowserSecurity.emptyClipBoard();
        };
        this.close = function(restart) {
            window.JavaBrowserSecurity.close(restart);
        };
        this.getDeviceInfo = function() {
            return JSON.parse(window.JavaBrowserSecurity.getDeviceInfo());
        };
        this.getProcessList = function() {
            return JSON.parse(window.JavaBrowserSecurity.getProcessList());
        };
    }

    function BrowserTTS() {
        this.progressCallback = function(status, msg) {
            console.log("BrowserTts status: " + status + ' ' + (msg || ''));
            if (typeof this.callback !== 'undefined') {
                this.callback(status, msg);
            }
        };
        this.speak = function(text, options, callback) {
            this.callback = callback;
            try {
                window.JavaBrowserTTS.speak(text, options ? JSON.stringify(options) : null);
            } catch (err) {
                this.progressCallback(browser.tts.getStatus(), err);
            }
        };
        this.stop = function() {
            window.JavaBrowserTTS.stop();
        };
        this.pause = function() {
            window.JavaBrowserTTS.pause();
        };
        this.resume = function() {
            window.JavaBrowserTTS.resume();
        };
        this.getStatus = function() {
            try {
                return window.JavaBrowserTTS.getStatus();
            } catch (err) {
                console.log(err);
            }
        };
        this.getVoices = function() {
            return JSON.parse(window.JavaBrowserTTS.getVoices());
        };
    }

    function BrowserRecorder() {
        this.progressCallback = function(status, msg) {
            console.log("BrowserRecorder status: " + status + ' ' + (msg || ''));
            if (typeof this.callback !== 'undefined') {
                this.callback(status, msg);
            }
        };
        this.initialize = function(callback) {
            this.callback = callback;
            try {
                window.JavaBrowserRecorder.initialize();
            } catch (err) {
                this.progressCallback(browser.recorder.getStatus(), err);
            }
        };
        this.getStatus = function() {
            return window.JavaBrowserRecorder.getStatus();
        };
        this.startCapture = function(options, callback) {
            this.callback = callback;
            try {
                window.JavaBrowserRecorder.startCapture(options ? JSON.stringify(options) : null);
            } catch (err) {
                this.progressCallback(browser.recorder.getStatus(), err);
            }
        };
        this.stopCapture = function() {
            var filePath = window.JavaBrowserRecorder.stopCapture();
            this.progressCallback(browser.recorder.getStatus(), filePath);
            return filePath;
        };
        this.getCapabilities = function() {
            return window.JavaBrowserRecorder.getCapabilities();
        };
        this.retrieveAudio = function() {
            return window.JavaBrowserRecorder.retrieveAudio();
        };
        this.pausePlayback = function() {
            window.JavaBrowserRecorder.pausePlayback();
        };
        this.resumePlayback = function() {
            window.JavaBrowserRecorder.resumePlayback();
        };
        this.stopPlayback = function() {
            window.JavaBrowserRecorder.stopPlayback();
        };
        this.playback = function(b64audio, callback) {
            this.callback = callback;
            try {
                window.JavaBrowserRecorder.playback(b64audio);
            } catch (err) {
                this.progressCallback(browser.recorder.getStatus(), err);
            }
        };
    }

    // expose AIR API
    window.browser = {
        security: new BrowserSecurity(),
        tts: new BrowserTTS(),
        recorder: new BrowserRecorder()
    };

})();