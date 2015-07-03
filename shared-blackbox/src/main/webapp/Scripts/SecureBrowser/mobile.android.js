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
The mobile Android version of the secure browser built on top of the Summit application.
*/
TDS.SecureBrowser.Mobile.Android = function () {
    TDS.SecureBrowser.Mobile.Android.superclass.constructor.call(this);
    this._config = { pausedSinceLaunch: false, keyboardChanged: false, clipboardChanged: false };
    this._airMobile = (new Summit.SecureBrowser.Mobile()).getNativeBrowser();
    this._airMobile.initialize();
    this._textSelected = { rangyValue: null };
};

YAHOO.lang.extend(TDS.SecureBrowser.Mobile.Android, TDS.SecureBrowser.Base);

TDS.SecureBrowser.Mobile.Android.prototype.initialize = function () {
    var sb = this._airMobile;
    var config = this._config;
    var textSelected = this._textSelected;

    // wait for SB to be ready
    sb.listen(sb.EVENT_DEVICE_READY, window.document, function () {

        // Any time the app returns from background, we treat that as a breach of security
        sb.listen(sb.EVENT_RETURN_FROM_BACKGROUND, window.document, function () {
            config.pausedSinceLaunch = true;
        });

        // check if a differnt keyboard other than the default soft keyboard is being used, and if so,
        // retreat as a breach of security
        if (sb.device.keyboard != 'com.air.mobilebrowser/.softkeyboard.SoftKeyboard') {
            config.keyboardChanged = true;
        }

        // detect any change in keyboard, and if there is change, treat as a breach of security
        sb.listen(sb.EVENT_KEYBOARD_CHANGED, window.document, function () {
            config.keyboardChanged = true;
        });

        // detect if the content of the clipboard has been changed, and if there is change, treat as a breach of security
        sb.listen(sb.EVENT_CLIPBOARD_CHANGED, window.document, function () {
            config.clipboardChanged = true;
        });

        // This is the code to capture the event that will be fired when mini apps are running
        // (Samsung Galaxy Tab 2 only)
        sb.listen(sb.EVENT_MINI_APP_DETECTED, window.document, function () {
            config.pausedSinceLaunch = true;
        });
    });

    sb.listen(sb.EVENT_TEXT_SELECTED, window.document, function () {
        textSelected.rangyValue = window.rangy.getSelection(document);
    });

};

TDS.SecureBrowser.Mobile.Android.prototype.isEnvironmentSecure = function () {
    var result = { 'secure': (!this._config.pausedSinceLaunch && !this._config.keyboardChanged && !this._config.clipboardChanged), 'messageKey': null };
    return result;
};

TDS.SecureBrowser.Mobile.Android.prototype.getSelectedText = function () {
    return this._textSelected.rangyValue;
};

// Returns a handle to the native browser engine.
TDS.SecureBrowser.Mobile.Android.prototype.getRunTime = function () {
    return this._airMobile;
};


