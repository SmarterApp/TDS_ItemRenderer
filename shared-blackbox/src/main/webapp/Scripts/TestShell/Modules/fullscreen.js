/*
This test shell module is used for the fullscreen button.
*/

(function (TS) {

    var CSS_ENABLED = 'fs-enabled';

    function getPassword() {
        var testee = TDS.Student.Storage.getTestee();
        if (testee) {
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

        // check if full screen is enabled
        var accProps = TDS.getAccommodationProperties();
        if (accProps && accProps.hasFullScreenEnabled()) {

            // setup button
            TestShell.UI.addButtonControl({
                id: 'btnFullScreen',
                className: 'fullscreen',
                i18n: 'TestShell.Link.FullScreen',
                label: 'Full Screen',
                fn: toggle
            });

            // if full screen pass is enabled Jeremy said to enable right away
            if (accProps.hasFullScreenPassword()) {
                enable();
            }
        }
    }

    TS.registerModule({
        name: 'fullscreen',
        load: load
    });

})(TestShell);

