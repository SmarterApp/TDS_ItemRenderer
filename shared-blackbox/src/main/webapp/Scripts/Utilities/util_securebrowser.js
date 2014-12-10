// REQUIRES: util_browser.js, securebrowser.base.js, securebrowser.desktop.js, securebrowser.ios.js, securebrowser.android.js

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
        }

    };

})(Util.SecureBrowser, Mozilla);
