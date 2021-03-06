//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************

/**
 * YAHOO.env is used to keep track of what is known about the YUI library and
 * the browsing environment
 * @class YAHOO.env
 * @static
 */
YAHOO.env = YAHOO.env || {

    /**
     * Keeps the version info for all YUI modules that have reported themselves
     * @property modules
     * @type Object[]
     */
    modules: [],

    /**
     * List of functions that should be executed every time a YUI module
     * reports itself.
     * @property listeners
     * @type Function[]
     */
    listeners: []
};

/**
 * Returns the version data for the specified module:
 *      <dl>
 *      <dt>name:</dt>      <dd>The name of the module</dd>
 *      <dt>version:</dt>   <dd>The version in use</dd>
 *      <dt>build:</dt>     <dd>The build number in use</dd>
 *      <dt>versions:</dt>  <dd>All versions that were registered</dd>
 *      <dt>builds:</dt>    <dd>All builds that were registered.</dd>
 *      <dt>mainClass:</dt> <dd>An object that was was stamped with the
 *                 current version and build. If
 *                 mainClass.VERSION != version or mainClass.BUILD != build,
 *                 multiple versions of pieces of the library have been
 *                 loaded, potentially causing issues.</dd>
 *       </dl>
 *
 * @method getVersion
 * @static
 * @param {String}  name the name of the module (event, slider, etc)
 * @return {Object} The version info
 */
YAHOO.env.getVersion = function(name) {
    return YAHOO.env.modules[name] || null;
};

/**
 * Do not fork for a browser if it can be avoided.  Use feature detection when
 * you can.  Use the user agent as a last resort.  YAHOO.env.ua stores a version
 * number for the browser engine, 0 otherwise.  This value may or may not map
 * to the version number of the browser using the engine.  The value is
 * presented as a float so that it can easily be used for boolean evaluation
 * as well as for looking for a particular range of versions.  Because of this,
 * some of the granularity of the version info may be lost (e.g., Gecko 1.8.0.9
 * reports 1.8).
 * @class YAHOO.env.ua
 * @static
 */

/**
 * parses a user agent string (or looks for one in navigator to parse if
 * not supplied).
 * @method parseUA
 * @since 2.9.0
 * @static
 */
YAHOO.env.parseUA = function (subUA) {

    var numberify = function (s) {
        var c = 0;
        return parseFloat(s.replace(/\./g, function () {
            return (c++ === 1) ? '' : '.';
        }));
    },

    win = window,
    nav = win && win.navigator,

    o = {

        /**
            * Internet Explorer version number or 0.  Example: 6
            * @property ie
            * @type float
            * @static
            */
        ie: 0,

        /**
            * Opera version number or 0.  Example: 9.2
            * @property opera
            * @type float
            * @static
            */
        opera: 0,

        /**
            * Gecko engine revision number.  Will evaluate to 1 if Gecko
            * is detected but the revision could not be found. Other browsers
            * will be 0.  Example: 1.8
            * <pre>
            * Firefox 1.0.0.4: 1.7.8   <-- Reports 1.7
            * Firefox 1.5.0.9: 1.8.0.9 <-- 1.8
            * Firefox 2.0.0.3: 1.8.1.3 <-- 1.81
            * Firefox 3.0   <-- 1.9
            * Firefox 3.5   <-- 1.91
            * </pre>
            * @property gecko
            * @type float
            * @static
            */
        gecko: 0,

        /**
            * AppleWebKit version.  KHTML browsers that are not WebKit browsers
            * will evaluate to 1, other browsers 0.  Example: 418.9
            * <pre>
            * Safari 1.3.2 (312.6): 312.8.1 <-- Reports 312.8 -- currently the
            *                                   latest available for Mac OSX 10.3.
            * Safari 2.0.2:         416     <-- hasOwnProperty introduced
            * Safari 2.0.4:         418     <-- preventDefault fixed
            * Safari 2.0.4 (419.3): 418.9.1 <-- One version of Safari may run
            *                                   different versions of webkit
            * Safari 2.0.4 (419.3): 419     <-- Tiger installations that have been
            *                                   updated, but not updated
            *                                   to the latest patch.
            * Webkit 212 nightly:   522+    <-- Safari 3.0 precursor (with native
            * SVG and many major issues fixed).
            * Safari 3.0.4 (523.12) 523.12  <-- First Tiger release - automatic
            * update from 2.x via the 10.4.11 OS patch.
            * Webkit nightly 1/2008:525+    <-- Supports DOMContentLoaded event.
            *                                   yahoo.com user agent hack removed.
            * </pre>
            * http://en.wikipedia.org/wiki/Safari_version_history
            * @property webkit
            * @type float
            * @static
            */
        webkit: 0,

        /**
            * Safari will be detected as webkit, but this property will also
            * be populated with the Safari version number
            * @property safari
            * @type float
            * @static
            */
        safari: 0,

        /**
            * Chrome will be detected as webkit, but this property will also
            * be populated with the Chrome version number
            * @property chrome
            * @type float
            * @static
            */
        chrome: 0,

        /**
            * The mobile property will be set to a string containing any relevant
            * user agent information when a modern mobile browser is detected.
            * Currently limited to Safari on the iPhone/iPod Touch, Nokia N-series
            * devices with the WebKit-based browser, and Opera Mini.
            * @property mobile
            * @type string
            * @default null
            * @static
            */
        mobile: null,

        /**
            * Adobe AIR version number or 0.  Only populated if webkit is detected.
            * Example: 1.0
            * @property air
            * @type float
            */
        air: 0,
        /**
            * PhantomJS version number or 0.  Only populated if webkit is detected.
            * Example: 1.0
            * @property phantomjs
            * @type float
            */
        phantomjs: 0,
        /**
            * Detects Apple iPad's OS version
            * @property ipad
            * @type float
            * @static
            */
        ipad: 0,
        /**
            * Detects Apple iPhone's OS version
            * @property iphone
            * @type float
            * @static
            */
        iphone: 0,
        /**
            * Detects Apples iPod's OS version
            * @property ipod
            * @type float
            * @static
            */
        ipod: 0,
        /**
            * General truthy check for iPad, iPhone or iPod
            * @property ios
            * @type Boolean
            * @default null
            * @static
            */
        ios: null,
        /**
            * Detects Googles Android OS version
            * @property android
            * @type float
            * @static
            */
        android: 0,
        /**
            * Detects Kindle Silk
            * @property silk
            * @type float
            * @static
            */
        silk: 0,
        /**
            * Detects Kindle Silk Acceleration
            * @property accel
            * @type Boolean
            * @static
            */
        accel: false,
        /**
            * Detects Palms WebOS version
            * @property webos
            * @type float
            * @static
            */
        webos: 0,

        /**
            * Google Caja version number or 0.
            * @property caja
            * @type float
            */
        caja: nav && nav.cajaVersion,

        /**
            * Set to true if the page appears to be in SSL
            * @property secure
            * @type boolean
            * @static
            */
        secure: false,

        /**
            * The operating system.  Currently only detecting windows or macintosh
            * @property os
            * @type string
            * @default null
            * @static
            */
        os: null,

        /**
            * The Nodejs Version
            * @property nodejs
            * @type float
            * @default 0
            * @static
            */
        nodejs: 0,
        /**
        * Window8/IE10 Application host environment
        * @property winjs
        * @type Boolean
        * @static
        */
        winjs: !!((typeof Windows !== "undefined") && Windows.System),
        /**
        * Are touch/msPointer events available on this device
        * @property touchEnabled
        * @type Boolean
        * @static
        */
        touchEnabled: false
    },

    ua = subUA || nav && nav.userAgent,
    loc = win && win.location,
    href = loc && loc.href,
    m;

    /**
    * The User Agent string that was parsed
    * @property userAgent
    * @type String
    * @static
    */
    o.userAgent = ua;
    o.secure = href && (href.toLowerCase().indexOf('https') === 0);

    if (ua) {

        if ((/windows|win32/i).test(ua)) {
            o.os = 'windows';
        } else if ((/macintosh|mac_powerpc/i).test(ua)) {
            o.os = 'macintosh';
        } else if ((/android/i).test(ua)) {
            o.os = 'android';
        } else if ((/symbos/i).test(ua)) {
            o.os = 'symbos';
        } else if ((/linux/i).test(ua)) {
            o.os = 'linux';
        } else if ((/rhino/i).test(ua)) {
            o.os = 'rhino';
        }

        // Modern KHTML browsers should qualify as Safari X-Grade
        if ((/KHTML/).test(ua)) {
            o.webkit = 1;
        }
        if ((/IEMobile|XBLWP7/).test(ua)) {
            o.mobile = 'windows';
        }
        if ((/Fennec/).test(ua)) {
            o.mobile = 'gecko';
        }

        // Modern WebKit browsers are at least X-Grade
        m = ua.match(/AppleWebKit\/([^\s]*)/);
        if (m && m[1]) {
            o.webkit = numberify(m[1]);
            o.safari = o.webkit;

            if (/PhantomJS/.test(ua)) {
                m = ua.match(/PhantomJS\/([^\s]*)/);
                if (m && m[1]) {
                    o.phantomjs = numberify(m[1]);
                }
            }

            // Mobile browser check
            if (/ Mobile\//.test(ua) || (/iPad|iPod|iPhone/).test(ua)) {
                o.mobile = 'Apple'; // iPhone or iPod Touch

                m = ua.match(/OS ([^\s]*)/);
                if (m && m[1]) {
                    m = numberify(m[1].replace('_', '.'));
                }
                o.ios = m;
                o.os = 'ios';
                o.ipad = o.ipod = o.iphone = 0;

                m = ua.match(/iPad|iPod|iPhone/);
                if (m && m[0]) {
                    o[m[0].toLowerCase()] = o.ios;
                }
            } else {
                m = ua.match(/NokiaN[^\/]*|webOS\/\d\.\d/);
                if (m) {
                    // Nokia N-series, webOS, ex: NokiaN95
                    o.mobile = m[0];
                }
                if (/webOS/.test(ua)) {
                    o.mobile = 'WebOS';
                    m = ua.match(/webOS\/([^\s]*);/);
                    if (m && m[1]) {
                        o.webos = numberify(m[1]);
                    }
                }
                if (/ Android/.test(ua)) {
                    if (/Mobile/.test(ua)) {
                        o.mobile = 'Android';
                    }
                    m = ua.match(/Android ([^\s]*);/);
                    if (m && m[1]) {
                        o.android = numberify(m[1]);
                    }

                }
                if (/Silk/.test(ua)) {
                    m = ua.match(/Silk\/([^\s]*)/);
                    if (m && m[1]) {
                        o.silk = numberify(m[1]);
                    }
                    if (!o.android) {
                        o.android = 2.34; //Hack for desktop mode in Kindle
                        o.os = 'Android';
                    }
                    if (/Accelerated=true/.test(ua)) {
                        o.accel = true;
                    }
                }
            }

            m = ua.match(/OPR\/(\d+\.\d+)/);

            if (m && m[1]) {
                // Opera 15+ with Blink (pretends to be both Chrome and Safari)
                o.opera = numberify(m[1]);
            } else {
                m = ua.match(/(Chrome|CrMo|CriOS)\/([^\s]*)/);

                if (m && m[1] && m[2]) {
                    o.chrome = numberify(m[2]); // Chrome
                    o.safari = 0; //Reset safari back to 0
                    if (m[1] === 'CrMo') {
                        o.mobile = 'chrome';
                    }
                } else {
                    m = ua.match(/AdobeAIR\/([^\s]*)/);
                    if (m) {
                        o.air = m[0]; // Adobe AIR 1.0 or better
                    }
                }
            }
        }

        if (!o.webkit) { // not webkit
            // @todo check Opera/8.01 (J2ME/MIDP; Opera Mini/2.0.4509/1316; fi; U; ssr)
            if (/Opera/.test(ua)) {
                m = ua.match(/Opera[\s\/]([^\s]*)/);
                if (m && m[1]) {
                    o.opera = numberify(m[1]);
                }
                m = ua.match(/Version\/([^\s]*)/);
                if (m && m[1]) {
                    o.opera = numberify(m[1]); // opera 10+
                }

                if (/Opera Mobi/.test(ua)) {
                    o.mobile = 'opera';
                    m = ua.replace('Opera Mobi', '').match(/Opera ([^\s]*)/);
                    if (m && m[1]) {
                        o.opera = numberify(m[1]);
                    }
                }
                m = ua.match(/Opera Mini[^;]*/);

                if (m) {
                    o.mobile = m[0]; // ex: Opera Mini/2.0.4509/1316
                }
            } else { // not opera or webkit
                m = ua.match(/MSIE ([^;]*)|Trident.*; rv:([0-9.]+)/);

                if (m && (m[1] || m[2])) {
                    o.ie = numberify(m[1] || m[2]);
                } else { // not opera, webkit, or ie
                    m = ua.match(/Gecko\/([^\s]*)/);

                    if (m) {
                        o.gecko = 1; // Gecko detected, look for revision
                        m = ua.match(/rv:([^\s\)]*)/);
                        if (m && m[1]) {
                            o.gecko = numberify(m[1]);
                            if (/Mobile|Tablet/.test(ua)) {
                                o.mobile = "ffos";
                            }
                        }
                    }
                }
            }
        }
    }

    //Check for known properties to tell if touch events are enabled on this device or if
    //the number of MSPointer touchpoints on this device is greater than 0.
    if (win && nav && !(o.chrome && o.chrome < 6)) {
        o.touchEnabled = (("ontouchstart" in win) || (("msMaxTouchPoints" in nav) && (nav.msMaxTouchPoints > 0)));
    }

    return o;
};

YAHOO.env.ua = YAHOO.env.parseUA();

/*
 * Initializes the global by creating the default namespaces and applying
 * any new configuration information that is detected.  This is the setup
 * for env.
 * @method init
 * @static
 * @private
 */
(function() {
    YAHOO.namespace("util", "widget", "example");
    /*global YAHOO_config*/
    if ("undefined" !== typeof YAHOO_config) {
        var l=YAHOO_config.listener, ls=YAHOO.env.listeners,unique=true, i;
        if (l) {
            // if YAHOO is loaded multiple times we need to check to see if
            // this is a new config object.  If it is, add the new component
            // load listener to the stack
            for (i=0; i<ls.length; i++) {
                if (ls[i] == l) {
                    unique = false;
                    break;
                }
            }

            if (unique) {
                ls.push(l);
            }
        }
    }
})();
