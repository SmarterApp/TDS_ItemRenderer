// REQUIRES: util_event.js, YUI

/*
Parser help:
https://github.com/tobie/ua-parser/blob/master/regexes.yaml
https://github.com/faisalman/ua-parser-js/
*/

(function (Util) {

    var MOBILE_REGEX = /mobile|tablet|ip(ad|hone|od)|android/i;
    var SUPPORT_TOUCH = ('ontouchstart' in window);
    var SUPPORT_ONLY_TOUCH = SUPPORT_TOUCH && MOBILE_REGEX.test(navigator.userAgent);

    var Browser = {};

    Browser.isWindows = function () {
        return (navigator.platform.indexOf("Windows") != -1 ||
                navigator.platform.indexOf("Win32") != -1 ||
                navigator.platform.indexOf("Win64") != -1);
    };

    Browser.isLinux = function () {
        return (navigator.platform.indexOf("X11") != -1 ||
                navigator.platform.indexOf("Linux") != -1 ||
                navigator.platform.indexOf("BSD") != -1);
    };

    Browser.isMac = function () {
        return (navigator.platform.indexOf("Macintosh") != -1 ||
                navigator.platform.indexOf("MacPPC") != -1 ||
                navigator.platform.indexOf("MacIntel") != -1);
    };

    // Get the windows nt version
    Browser.getWindowsNTVersion = function () {
        var matches = navigator.userAgent.match(/Windows NT (\d+\.\d+)/);
        var value;
        if (matches && matches[1]) {
            value = parseFloat(matches[1]);
        }
        return value || 0;
    };

    // Get the mac os x version (does not work reliably on older versions 10.3-10.4)
    Browser.getOSXVersion = function () {
        var matches = navigator.userAgent.match(/Mac OS X (\d+\.\d+)/);
        var value;
        if (matches && matches[1]) {
            value = parseFloat(matches[1]);
        }
        return value || 0;
    };

    function getOSXMajorMinorVersion() {
        var matches = navigator.userAgent.match(/Mac OS X (\d+)\.(\d+)/);

        var version = {
            major: 0,
            minor: 0
        };

        if (matches) {
            version.major = +matches[1] || Infinity;
            version.minor = +matches[2] || Infinity;
        }

        return version;
    }

    Browser.osxVersionIsAtLeast = function (minMajor, minMinor) {
        var version = getOSXMajorMinorVersion();

        return minMajor < version.major
           || (minMajor === version.major && minMinor <= version.minor);
    };

    Browser.osxVersionIsAtMost = function (maxMajor, maxMinor) {
        var version = getOSXMajorMinorVersion();

        return maxMajor > version.major
           || (maxMajor === version.major && maxMinor >= version.minor);
    };

    // Is this Mac based on the PPC architecture
    Browser.isMacPPC = function () {
        return navigator.userAgent.indexOf('PPC Mac') != -1;
    };

    // get the firefox version (http://en.wikipedia.org/wiki/Gecko_%28layout_engine%29)
    Browser.getFirefoxVersion = function () {

        if (YAHOO.env.ua.gecko > 0) {
            switch (YAHOO.env.ua.gecko) {
                case 1.7: return 1.0;
                case 1.8: return 1.5;
                case 1.81: return 2.0;
                case 1.9: return 3.0;
                case 1.91: return 3.5;
                case 1.92: return 3.6;
                case 1.93: return 3.7;
                case 2.0: return 4.0;
                default: return YAHOO.env.ua.gecko; // NOTE: after 4.0 the gecko version matched firefox version
            }
        }

        return 0;
    };

    Browser.isFirefox = function () {
        return (Browser.getFirefoxVersion() > 0);
    };

    Browser.isIE = function () {
        return (YAHOO.env.ua.ie > 0);
    };

    // get the IE document mode (0 means browser does not support this)
    Browser.getIEDocMode = function () {
        return (document.documentMode ? document.documentMode : 0);
    };

    Browser.isChrome = function () {
        return (YAHOO.env.ua.chrome > 0);
    };

    Browser.isChromeOS = function () {
        return (window.navigator.userAgent.indexOf('CrOS') > -1);
    };

    Browser.getChromeVersion = function () {
        return YAHOO.env.ua.chrome;
    };

    Browser.isMobile = function () {
        return (YAHOO.env.ua.mobile != null || YAHOO.env.ua.ios > 0 || YAHOO.env.ua.android > 0);
    };

    Browser.isIOS = function () {
        return (Browser.getIOSVersion() > 0);
    };

    Browser.getIOSVersion = function () {
        return YAHOO.env.ua.ios;
    };

    Browser.isAndroid = function () {
        return (YAHOO.env.ua.android > 0);
    };

    // check if this browser supports touch events
    Browser.isTouchDevice = function () {
        return SUPPORT_TOUCH;
    };

    // check if this browser only supports touch events (no mouse)
    Browser.isOnlyTouchDevice = function () {
        return SUPPORT_ONLY_TOUCH;
    };
    
    Browser.supportsSVG = function () {
        return document.implementation.hasFeature('http://www.w3.org/TR/SVG11/feature#BasicStructure', '1.1');
    };
    
    Browser.supportsAudioOGG = function () {
        if (Browser.isIOS() || Browser.isAndroid()) {
            return false;
        } else if (Browser.isChrome() || Browser.isFirefox()) {
            return true;
        } else {
            return false;
        }
    };

    // Call this to check if browser supports MathML.
    // Summary of Browser Support for MathML: https://vismor.com/documents/site_implementation/viewing_mathematics/S1.SS2.php
    // For future: https://github.com/Modernizr/Modernizr/blob/master/feature-detects/mathml.js
    Browser.supportsMathML = function () {

        // if we are using ipad or android SB then disable MathML
        if (Browser.isSecure() && (YAHOO.env.ua.android || YAHOO.env.ua.ios)) {
            return false;
        }

        // check firefox
        if (Util.Browser.getFirefoxVersion() > 0) {
            return (Util.Browser.getFirefoxVersion() >= 4.0); // Firefox 4.0+
        }

        // check chrome
        if (YAHOO.env.ua.chrome > 0) {
            // Chrome 24 added MathML but Chrome 25+ disabled it...
            // https://code.google.com/p/chromium/issues/detail?id=174455
            return false;
        }

        // check safari
        if (YAHOO.env.ua.webkit >= 534) {
            return true; // Safari 5.1+
        }

        // no browsers match
        return false;
    };

    // Determines if Ctrl/Alt/Meta keys are available for this browser. Currently iOS is the only one we can't trust
    // due to FB146275 as when CapsLock is on the ctrlKey flag on keyboard events is erroneously set to true.
    Browser.supportsModifierKeys = function () {
        return !Browser.isIOS();
    };

    Browser.isSecure = function () {
        var clientSideCheck = (navigator.userAgent.indexOf('AIRSecureBrowser') != -1 ||
                               navigator.userAgent.indexOf('AIRMobile') != -1); // Summit's browser

        var serverSideCheck = (typeof TDS == 'object' && typeof TDS.BrowserInfo == 'object') ? TDS.BrowserInfo.isSecure : false;

        var extensionCheck = window.AIRSecureBrowserExtension ? true : false;

        var chromeAppCheck = YUD.hasClass(document.body, 'browser_airsecurebrowser');

        return clientSideCheck || serverSideCheck || extensionCheck || chromeAppCheck;
    };

    Browser.getSecureVersion = function () {

        var numberfy = function (s) {
            var c = 0;
            return parseFloat(s.replace(/\./g, function () {
                return (c++ == 1) ? '' : '.';
            }));
        };

        var ua = navigator.userAgent;

        // Check for desktop version
        var ma = ua.match(/AIRSecureBrowser\/([^\s\)]*)/);
        if (ma && ma[1]) {
            return numberfy(ma[1]);
        }

        // Check for mobile version (Summit)
        ma = ua.match(/AIRMobile[SecureBrowser]*\/([^\s\)]*)/);
        if (ma && ma[1]) {
            return numberfy(ma[1]);
        }

        return 0;
    };

    Browser.getFlashVersion = function () {
        return parseFloat(FlashDetect.major + '.' + FlashDetect.minor);
    };

    /*********************************************************************************************/

    /* Utils */

    // resolve a url to the current base
    Browser.resolveUrl = function (url, root) {

        // set default if empty
        url = url || '';

        // set root document for resolving
        root = root || document;

        // change any html ampersand entities into the ampersand character
        url = url.replace(/&amp;/g, '&');

        // escape url
        url = url.split('&').join('&amp;').split('<').join('&lt;').split('"').join('&quot;');

        // cross browser compatible (even in IE 6) way of qualifying a url
        // http://stackoverflow.com/questions/470832/getting-an-absolute-url-from-a-relative-one-ie6-issue
        var el = root.createElement('div');
        el.innerHTML = '<a href="' + url + '">x</a>';
        return el.firstChild.href;
    };

    // enable full screen mode on Chrome Book
    Browser.requestFullScreen = function (elem) {

        if (!elem) {
            elem = document.body;
        }

        // webkit browser
        if (elem.webkitRequestFullScreen) {
            // apply className fullScreenMode to fix the size of document.body element in full-screen mode
            YUD.addClass(elem, 'fullScreenMode');
            elem.webkitRequestFullScreen();
            elem.addEventListener('webkitfullscreenchange', function () {
                if (!document.webkitIsFullScreen) {
                    YUD.removeClass(elem, 'fullScreenMode');
                    removeEventListener(this);
                }
            });
        }
            //else if (elem.mozRequestFullScreen) elem.mozRequestFullScreen();    // firefox
            //else if (elem.requestFullScreen) elem.requestFullScreen();          // others
        else {
            return;
        }
    };

    

    Util.Browser = Browser;

})(Util);

