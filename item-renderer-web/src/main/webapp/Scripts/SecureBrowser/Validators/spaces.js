//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
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