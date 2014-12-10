/*
Validate if spaces is enabled on OS X.
*/

(function(SBV) {

    SBV.register({

        name: 'spaces',

        // is this browser supported
        isSupported: function () {
            // only perform Spaces validation on Mac SB
            return (Util.Browser.isSecure() && Util.Browser.isMac());
        },

        // if everything validates then return true, otherwise false
        validate: function () {
            var prefValue = Mozilla.getPreference('bmakiosk.spaces.enabled');
            if (prefValue === true) {
                return false;
            }
            return true;
        },

        // message for code failure
        message: 'Browser.Denied.SpacesEnabled'
    });
    
})(TDS.SecureBrowser.Validators);