//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
(function (TDS) {

    var _unloadWindow;

    TDS.unloader = {
        needUnload: true
    };

    TDS.unloader.disable = function () {
        this.needUnload = false;
    };

    TDS.unloader.initiateUnload = function () {

        if (!this.needUnload) {
            // don't need to handle the unload event
            return false;
        }

        if (TDS.isProxyLogin) {
            // proctor has unexpectedly closed the window or navigated away
            // the current window is closing and there's no way to stop/delay
            // so we need to open a new window in which the logout occurs

            if (Util.Browser.isSecure()) {
                // we can't open popups in the secure browser
                // let the caller know it needs to handle the event somehow
                return true;
            }

            var targetUrl = TDS.resolveBaseUrl('Pages/Logout.aspx');

            _unloadWindow = _unloadWindow || window.open(targetUrl, 'unload', '');

            // bring focus back to the main window immediately
            window.focus();

            // the proctor will always unload without a prompt
            return false;
        }

        // let the caller know it needs to handle the event somehow
        return true;
    }

    TDS.unloader.promptToDisablePopupBlocker = function () {
        if (TDS.Student.Storage.getPopupsEnabled()) {
            // popups are already enabled, according to a previous attempt
            return;
        }

        if (Util.Browser.isSecure()) {
            // we can't open popus on the secure browser
            return;
        }

        function checkAndPrompt() {
            // check if there is a popup blocker by tring to open a popup
            var popup = window.open('', 'popupcheck', '');
            if (popup) {
                popup.close();
                // popups work, we will make a note of it
                TDS.Student.Storage.setPopupsEnabled(true);
                return;
            }

            // popups don't work; prompt the user to enable them, then try again

            var warningMessage = Messages.get('Global.Label.Warning'),
                tryAgainMessage = Messages.get('Try again'),
                logoutMessage = Messages.get('Logout'),
                popupBlockerMessage = Messages.getAlt('Global.Label.PopupBlockerMessage', 'This site requires popus to work properly.  Please disable your popup blocker for this site, then click [' + Messages.get('Try again') + '].');

            var buttons = [
                {
                    text: tryAgainMessage,
                    handler: function () {
                        this.hide();

                        // click events interact differently with the popup blocker, so try again after a timeout
                        setTimeout(checkAndPrompt, 1);
                    },
                    isDefault: true
                }, {
                    text: logoutMessage,
                    handler: function () {
                        // the user doesn't want to enable popups, so the unload handler will work
                        // no tests for them
                        this.hide();
                        TDS.logout();
                    },
                    isDefault: false
                }
            ];

            TDS.Dialog.show(warningMessage, popupBlockerMessage, buttons);
        }

        checkAndPrompt();
    };

})(TDS);
