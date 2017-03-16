//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
/*
This test shell module is used for the fullscreen button.
*/

(function (TS) {

    var CSS_ENABLED = 'fs-enabled';

    // if this is true then one of the segments has full screen
    var checkForFullScreen = false;

    function getPassword() {
        var testee = TDS.Student.Storage.getTestee();
        if (testee && testee.firstName) {
            return testee.firstName;
        } else {
            return '';
        }
    }

    // show the password dialog
    function showPasswordDialog() {
        var msgRequest = Messages.get('TestShell.Fullscreen.PasswordRequest');
        TDS.Dialog.showInput(msgRequest, function (text) {
            if (text.toLowerCase() == getPassword().toLowerCase()) {
                YUD.removeClass(document.body, CSS_ENABLED);
            } else {
                var msgDenied = Messages.get('TestShell.Fullscreen.PasswordDenied');
                TDS.Dialog.showAlert(msgDenied);
            }
        });
    }

    function isEnabled() {
        return YUD.hasClass(document.body, CSS_ENABLED);
    }
    
    // this is called when full screen is requested
    function enable() {
        YUD.addClass(document.body, CSS_ENABLED);
    }

    // this is called when full screen is disabled
    function disable() {
        var accProps = TDS.getAccommodationProperties();
        if (accProps && accProps.hasFullScreenPassword()) {
            showPasswordDialog();
        } else {
            YUD.removeClass(document.body, CSS_ENABLED);
        }
    }

    // call this to toggle full screen on and off
    function toggle() {
        if (isEnabled()) {
            disable();
        } else {
            enable();
        }
    }

    function load() {

        // check if any of the segments have full screen
        var foundAccs = Util.Array.find(Accommodations.Manager.getAll(), function(accs) {
            var accProps = new Accommodations.Properties(accs);
            return accProps.hasFullScreenEnabled();
        });

        // check if we should add button
        if (foundAccs) {
            checkForFullScreen = true;
            TestShell.UI.addButtonControl({
                id: 'btnFullScreen',
                className: 'fullscreen',
                i18n: 'TestShell.Link.FullScreen',
                label: 'Full Screen',
                fn: toggle
            });
        }
    }

    TestShell.Events.on('changeAccommodations', function(currentAccs, previousAccs) {

        // if no segment has full screen then stop here
        if (!checkForFullScreen) {
            return;
        }

        var currentAccProps = new Accommodations.Properties(currentAccs);
        var previousAccProps = new Accommodations.Properties(previousAccs);

        // if we move from a segment where full screen is off to one where it is on, then we need to enable it (and vice versa)
        if (previousAccProps.hasFullScreenEnabled() === false &&
            currentAccProps.hasFullScreenEnabled() === true) {
            enable();
        } else if (previousAccProps.hasFullScreenEnabled() === true &&
            currentAccProps.hasFullScreenEnabled() === false) {
            disable();
        }

    });

    TS.registerModule({
        name: 'fullscreen',
        load: load
    });

})(TestShell);

