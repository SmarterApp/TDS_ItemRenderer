//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
if (typeof Segue != 'object') Segue = {};
if (typeof Segue.SecureBrowser != 'object') Segue.SecureBrowser = {};

Segue.SecureBrowser.Android = function () {

    /********************** CODE FROM SEGUE   ********************/

    var secbrowser = {
        // this holds a local copy of our configuration variables in javascript.
        // @common
        _config: {},

        // this holds references to our event listeners
        // @common
        eventListeners: {},

        // this holds references to callback methods for all of our function calls
        // @common
        callbackHandlers: {},

        // this actionid is used to create a unique identifier for each event listener
        // and callback. to cancel an eventListener, you must use the actionid assigned.
        // @common
        actionid: Math.floor((Math.random() * 1000) + 1),

        configready: function (config) {
            secbrowser._config = config;
            if (secbrowser.eventListeners['configReady']) {
                delete secbrowser.eventListeners['configReady'];
            }
            secbrowser.fireEvent('deviceReady');
        },

        // this function gets run as soon as the dom is loaded.
        // this is where we'd run our initial lookups to populate the config
        // @platform
        domready: function () {
            // get config is special, knows to call secbrowser.deviceready().
            Android.getConfig();
        },

        // add a listener
        // @common
        addListener: function (evt, handler) {
            // get a new actionid
            var aid = this.actionid++;
            // make sure the event exists in our eventListeners struct.
            if (!this.eventListeners[evt])
                this.eventListeners[evt] = {};

            // add the listener
            this.eventListeners[evt][evt + aid] = handler;

            // return the aid.  This is necessary for removeListener.
            return aid;
        },

        // remove a listener, using the generated actionid
        // @common
        removeListener: function (evt, aid) {
            if (this.eventListeners[evt]) {
                if (this.eventListeners[evt][evt + aid]) {
                    delete this.eventListeners[evt][evt + aid];
                }
            }
        },

        // going from native to javascript, fire the callback
        // specified.
        // @common
        fireCallback: function (aid, result) {
            if (this.callbackHandlers["callback" + aid]) {
                this.callbackHandlers["callback" + aid](result);
                delete this.callbackHandlers["callback" + aid];
            }
        },

        // working on events...
        // @common
        fireEvent: function (evt, result) {
            if (this.eventListeners[evt]) {
                for (listener in this.eventListeners[evt]) {
                    this.eventListeners[evt][listener](result);
                }
            }
        },

        // isAndroid
        isAndroid: function () { return true; },

        // isIOS
        isIOS: function () { return false; },

        toast: function (text) { Android.toast(text); },

        // set the URL
        // @platform
        setUrl: function (newUrl, reload) {
            if (!reload)
                reload = false;
            this._config.url = newUrl;
            Android.setUrl(newUrl, reload);
        },

        // get the URL
        // @common
        getUrl: function () {
            return this._config.url;
        },

        setTestId: function (testid) {
            Android.setTestId(testid);
        },

        setShutdownUrl: function (newUrl) {
            Android.setShutdownUrl(newUrl);
        },

        getShutdownUrl: function () {
            return this._config.shutdownUrl;
        },

        setUserAgent: function (newUserAgent, reload) {
            if (!reload)
                reload = false;
            this._config.userAgent = newUserAgent;
            Android.setUserAgent(newUserAgent, reload);
        },

        getUserAgent: function () {
            return this._config.userAgent;
        },

        // @platform
        isJailbroken: function (handler) {
            var aid = this.actionid++;
            this.callbackHandlers["callback" + aid] = handler;
            Android.isJailbroken(aid);
            // call native..
            // iOS: create ifram, call url, pass in aid...
            // android: native.isJailbroken(aid);
        },

        getVolume: function (handler, stream) {
            var aid = this.actionid++;
            if (!stream) {
                stream = "music";
            }
            this.callbackHandlers["callback" + aid] = handler;
            Android.getVolume(stream, aid);
        },

        setVolume: function (level, stream) {
            if (!stream) {
                stream = "music";
            }
            Android.setVolume(stream, level);
        },

        getRunning: function (handler) {
            var aid = this.actionid++;
            this.callbackHandlers["callback" + aid] = handler;
            Android.getRunning(aid);
        },

        speak: function (text, handler) {
            var aid = this.actionid++;
            this.callbackHandlers["callback" + aid] = handler;
            Android.speak(text, aid);
        },

        isGuidedAccessModeEnabled: function (handler) {
            handler(true);
        }


    }

    secbrowser.addListener('configReady', secbrowser.configready);
    document.addEventListener('DOMContentLoaded', secbrowser.domready, false);

    /********************** CODE FROM SEGUE   ********************/
    window.secbrowser = secbrowser;
    
    this.getNativeBrowser = function () { return secbrowser; };
}