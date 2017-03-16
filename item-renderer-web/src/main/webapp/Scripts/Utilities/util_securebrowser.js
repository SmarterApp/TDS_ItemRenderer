//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
﻿// REQUIRES: util_browser.js, securebrowser.base.js, securebrowser.desktop.js, securebrowser.ios.js, securebrowser.android.js

(function() {

    TDS.SecureBrowser.initialize();
    Util.SecureBrowser = TDS.SecureBrowser.getImplementation();
})();

// generic SB utilities
(function(SB, Mozilla) {

    // call this to fix the user agent string for this SB
    SB.fixUserAgent = function() {

        // if this is SB 5.5 or SB 5.6 and the UA doesn't identify itself as Firefox then add it
        var ua = navigator.userAgent;
        if (ua.indexOf('AIRSecureBrowser/5.5') != -1 && ua.indexOf('Firefox/3.6.28') == -1) { // SB 5.5
			    Mozilla.setPreference('general.useragent.extra.kiosk', '5.5 Firefox/3.6.28');
        } else if (ua.indexOf('AIRSecureBrowser/5.6') != -1 && ua.indexOf('Firefox/3.6.28') == -1) { // SB 5.6
			    Mozilla.setPreference('general.useragent.extra.kiosk', '5.6 Firefox/3.6.28');
        } else if (ua.indexOf('AIRSecureBrowser/8.0') != -1 && ua.indexOf('Windows NT 6.3') != -1) {
            // SB-1506-Intelligent-Muting. Secure Browser 8.0 does not report the correct NT version for Windows 10, so we need to fix the user agent
            var windowsNTMajorVersionRegistryKeyValue = Util.SecureBrowser.readRegistryValue(Util.SecureBrowser.HKEY_LOCAL_MACHINE, "SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion", "CurrentMajorVersionNumber");
            var windowsNTMinorVersionRegistryKeyValue = Util.SecureBrowser.readRegistryValue(Util.SecureBrowser.HKEY_LOCAL_MACHINE, "SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion", "CurrentMinorVersionNumber");
            // if the two registry keys exist, we use the keys to determine the Windows NT version.
            if (windowsNTMajorVersionRegistryKeyValue != null && windowsNTMinorVersionRegistryKeyValue != null) {
                var ntVersion = parseFloat(windowsNTMajorVersionRegistryKeyValue) + parseFloat(windowsNTMinorVersionRegistryKeyValue) / 10;
                if (ntVersion == 10) {
                    ua = ua.replace(new RegExp('Windows NT 6.3', 'g'), 'Windows NT 10.0');
                    Mozilla.setPreference("general.useragent.override", ua);
                }
            }
        }
    };

})(Util.SecureBrowser, Mozilla);
