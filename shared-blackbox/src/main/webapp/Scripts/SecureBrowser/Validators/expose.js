/*
Validate if expose is enabled on OS X.
*/

(function(SBV) {

    SBV.register({

        name: 'expose',

        // is this browser supported
        isSupported: function () {
            // only perform Expose validation on Mac SB running on OS X 10.6 or earlier
            return (Util.Browser.isSecure() && Util.Browser.isMac() && Util.Browser.osxVersionIsAtMost(10, 6));
        },

        // if everything validates then return true, otherwise false
        validate: function () {
            var prefValue = Mozilla.getPreference('bmakiosk.expose.enabled');
            if (prefValue === true) {
                return false;
            }
            return true;
        },

        // message for code failure
        message: 'Browser.Denied.ExposeEnabled'
    });
    
})(TDS.SecureBrowser.Validators);