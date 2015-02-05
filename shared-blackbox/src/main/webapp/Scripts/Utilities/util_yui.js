/*
These are fixes for YUI 2. Most of them have to do with touch support.
*/

// fix YUI 2 drag and drop
(function(YAHOO) {

    // check if drag/drop is available and this is a touch device
    if (typeof YAHOO.util.DragDropMgr != 'object' || !Util.Browser.isTouchDevice()) {
        return;
    }

    var Event = YAHOO.util.Event;
    var DDM = YAHOO.util.DragDropMgr;
    var DD = YAHOO.util.DragDrop;

    // patch a YUI function that takes event as first argument
    var fixEvent = function(origFunc) {
        return (function() {
            // fix touch event
            var args = Array.prototype.slice.call(arguments, 0);
            args[0] = Util.Event.normalize(args[0]);

            // call orig function
            origFunc.apply(this, args);
        });
    };

    // fix drop drop manager
    DDM.handleMouseDown = fixEvent(DDM.handleMouseDown);
    DDM.handleMouseMove = fixEvent(DDM.handleMouseMove);
    DDM.handleMouseUp = fixEvent(DDM.handleMouseUp);
    DD.prototype.handleMouseDown = fixEvent(DD.prototype.handleMouseDown);

    // fix DDM shim
    YUE.removeListener(DDM._shim, 'mouseup', DDM.handleMouseUp, DDM, true);
    YUE.removeListener(DDM._shim, 'mousemove', DDM.handleMouseMove, DDM, true);
    YUE.addListener(DDM._shim, 'touchend', DDM.handleMouseUp, DDM, true);
    YUE.addListener(DDM._shim, 'touchstart', DDM.handleMouseMove, DDM, true);

    // patch YUI DDM functions
    YUE.removeListener(document, 'mouseup', DDM.handleMouseUp, DDM, true);
    YUE.removeListener(document, 'mousemove', DDM.handleMouseMove, DDM, true);
    YUE.addListener(document, 'touchend', DDM.handleMouseUp, DDM, true);
    YUE.addListener(document, 'touchmove', DDM.handleMouseMove, DDM, true);

    // patch DD prototype functions
    var replaceFunc = function(origFunc, newFunc) {
        return (function() {
            origFunc.apply(this, arguments);
            newFunc.apply(this, arguments);
        });
    };

    // fix DD init
    DD.prototype.init = replaceFunc(DD.prototype.init, function() {
        YUE.removeListener(this._domRef || this.id, 'mousedown', this.handleMouseDown, this, true);
        YUE.addListener(this._domRef || this.id, 'touchstart', this.handleMouseDown, this, true);
    });

    // fix DD setOuterHandleElId
    DD.prototype.setOuterHandleElId = replaceFunc(DD.prototype.setOuterHandleElId, function() {
        YUE.removeListener(this.handleElId, 'mousedown', this.handleMouseDown, this, true);
        YUE.addListener(this.handleElId, 'touchstart', this.handleMouseDown, this, true);
    });

    DD.prototype.unreg = replaceFunc(DD.prototype.unreg, function() {
        YUE.removeListener(this.id, 'touchstart', this.handleMouseDown);
    });

})(YAHOO);

// fix YUI2 MenuManager
(function (YAHOO) {

    // check if MenuManager is available and this is a touch device
    if (typeof YAHOO.widget.MenuManager != 'object' || !Util.Browser.isTouchDevice()) {
        return;
    }

    var fixListener = function (obj, type, listener) {
        
        // do not remove the original listeners for ChromeBooks with touch screen, because this bug:https://bugz.airast.org/default.asp?155344
        // we'll need to keep these mousedodwn/mouseup/click event listeners for the physical mouse event.
        // the MIGHT duplicated event listener will not be problem because of browser will discard the duplicated automatically,according to this:https://developer.mozilla.org/en-US/docs/Web/API/EventTarget.addEventListener
        if (!(Util.Browser.isTouchDevice() && Util.Browser.isChromeOS())) {
            // remove current listener
            YUE.removeListener(obj, listener.type, listener.fn);
        }
        
        // add new listener 
        YUE.on(document, type, function(ev) {

            // normalize dom event
            ev = Util.Event.normalize(ev);
            // clone event and rename type
            ev = Util.Object.clone(ev);
            ev.type = listener.type;

            // call the MenuManager onDOMEvent func
            listener.fn.call(this, ev);
        });
    };

    var fixMenuManager = function() {

        // add menu which triggers YUI adding listeners
        var menu = new YAHOO.widget.Menu('dummy_menu_id');
        try {
            YAHOO.widget.MenuManager.addMenu(menu);
            YAHOO.widget.MenuManager.removeMenu(menu);
        } catch (ex) {
            console.error(ex);
        }

        // look for events to fix on menu manager
        var docListeners = YUE.getListeners(document);
        if (docListeners == null) {
            return;
        }

        for (var i = 0; i < docListeners.length; i++) {

            var docListener = docListeners[i];

            if (docListener.obj == YAHOO.widget.MenuManager) {
                if (docListener.type == 'mousedown') {
                    // this fixes it so if you click outside menu it will close
                    fixListener(document, 'touchstart', docListener);
                } else if (docListener.type == 'mouseup') {
                    // not sure this is used..
                    fixListener(document, 'touchend', docListener);
                } else if (docListener.type == 'click') {
                    // this replaces click with touchstart which will remove the delay
                    fixListener(document, 'touchstart', docListener);
                }
            }
        }
    };

    YUE.onDOMReady(fixMenuManager);

})(YAHOO);

// Fix for YUI2 dragdrop to allow for a scroll container
(function(YAHOO) {

    var DD = YAHOO.util.DD;
    var DDM = YAHOO.util.DragDropMgr;

    // draw a box for debugging purposes
    function drawBox(id, x, y, h, w) {

        var el = document.getElementById(id);

        if (el == null) {
            el = document.createElement('box');
            el.setAttribute('id', id);
            el.style.position = 'absolute';
            el.style.border = '3px solid red';
            el.style.zIndex = '99999';
            el.style.pointerEvents = 'none';
            document.body.appendChild(el);
        }

        el.style.left = x + 'px';
        el.style.top = y + 'px';
        el.style.height = h + 'px';
        el.style.width = w + 'px';
    }

    // remove a box
    function removeBox(id) {
        var el = document.getElementById(id);
        if (el == null) {
            Util.Dom.removeNode(el);
        }
    }

    // returns the appropriate document.
    function getElDoc(element) {
        return (element['nodeType'] === 9) ? element : // element === document
            element['ownerDocument'] || // element === DOM node
            element.document || // element === window
            document; // default
    }

    /**
     * Amount page has been scroll horizontally 
     * @method docScrollX
     * @return {Number} The current amount the screen is scrolled horizontally.
     */
    function docScrollX(node, doc) {
        doc = doc || (node) ? getElDoc(node) : document; // Y.config.doc; // perf optimization
        var dv = doc.defaultView,
            pageOffset = (dv) ? dv.pageXOffset : 0;
        return Math.max(doc['documentElement'].scrollLeft, doc.body.scrollLeft, pageOffset);
    }

    /**
     * Amount page has been scroll vertically 
     * @method docScrollY
     * @return {Number} The current amount the screen is scrolled vertically.
     */
    function docScrollY(node, doc) {
        doc = doc || (node) ? getElDoc(node) : document; // Y.config.doc; // perf optimization
        var dv = doc.defaultView,
            pageOffset = (dv) ? dv.pageYOffset : 0;
        return Math.max(doc['documentElement'].scrollTop, doc.body.scrollTop, pageOffset);
    }

    // get the scrollLeft for an element
    function getScrollLeft(node) {
        return ('scrollLeft' in node) ? node.scrollLeft : docScrollX(node);
    }

    // get the scrollTop for an element
    function getScrollTop(node) {
        return ('scrollTop' in node) ? node.scrollTop : docScrollY(node);
    }

    // The number of pixels from the edge of the screen to turn on scrolling. Default: 30
    DD.prototype.setScrollBuffer = function (value) {
        this._scrollBuffer = value;
    }

    DD.prototype.getScrollBuffer = function () {
        return this._scrollBuffer || 20;
    }

    // The number of milliseconds delay to pass to the auto scroller. Default: 235
    DD.prototype.setScrollDelay = function (value) {
        this._scrollDelay = value;
    }

    DD.prototype.getScrollDelay = function () {
        return this._scrollDelay || 150;
    }

    DD.prototype.setScrollDirection = function (horizontal, vertical) {
        this._scrollHorizontal = horizontal;
        this._scrollVertical = vertical;
    }

    DD.prototype.isScrollHorizontal = function () {
        return this._scrollHorizontal || false;
    }

    DD.prototype.isScrollVertical = function () {
        return this._scrollVertical || false;
    }

    DD.prototype.isWindowScroll = function() {
        return this._parentScroll == null || this._parentScroll == window;
    };

    /**
    *  Internal set and get, not used by top level clients to preserve compat with pure YUI2 libs or
    * cases where util_mobile.js is not pulled in for some reason.
    */
    DD.prototype.getParentScroll = function() {
        return this._parentScroll || window;
    };

    DD.prototype.setParentScroll = function(element) {
        this._parentScroll = element;
    };

    // return the region dimensions of the scroll viewport (_getVPRegion)
    DD.prototype._getVPRegion = function() {

        var el = this.getParentScroll(), // window or element
            b = this.getScrollBuffer(),
            ws = this.isWindowScroll(),
            xy = ((ws) ? [] : YUD.getXY(el)),
            width = ((ws) ? YUD.getViewportWidth() : el.offsetWidth),
            height = ((ws) ? YUD.getViewportHeight() : el.offsetHeight),
            top = ((ws) ? getScrollTop(el) : xy[1]),
            left = ((ws) ? getScrollLeft(el) : xy[0]);

        return {
            top: top + b,
            right: (width + left) - b,
            bottom: (height + top) - b,
            left: left + b
        };
    };

    DD.prototype._initScroll = function() {
        var scrollDelay = this.getScrollDelay();
        this._cancelScroll();
        this._scrollTimer = YAHOO.lang.later(scrollDelay, this, this._checkWinScroll, [true], true);
    };

    DD.prototype._cancelScroll = function() {
        if (this._scrollTimer) {
            this._scrollTimer.cancel();
            delete this._scrollTimer;
        }
    };

    DD.prototype._checkWinScroll = function(move) {

        // if we aren't currently dragging then stop our timer
        if (this != DDM.dragCurrent) {
            this._cancelScroll();
            return;
        }

        // get drag element region
        var dragEl = this.getDragEl(),
            dragHeight = dragEl.offsetHeight,
            dragWidth = dragEl.offsetWidth,
            dragXY = YUD.getXY(dragEl),
            dragBottom = dragXY[1] + dragHeight,
            dragTop = dragXY[1],
            dragRight = dragXY[0] + dragWidth,
            dragLeft = dragXY[0];

        // get viewport element region
        var parentRegion = this._getVPRegion(),
            parentEl = this.getParentScroll(), // get the scroll container (window or an element)
            parentScrollTop = getScrollTop(parentEl),
            parentScrollLeft = getScrollLeft(parentEl),
            ws = this.isWindowScroll(),
            scroll = false, // should we perform scrolling?
            b = this.getScrollBuffer(), // how much of a buffer before we scroll?
            nt = dragTop, // where to move element top
            nl = dragLeft, // where to move element left
            st = parentScrollTop, // how much to scroll container top
            sl = parentScrollLeft; // how much to scroll container left

        // check if we are scrolling horizontally 
        if (this.isScrollHorizontal()) {
            if (dragLeft <= parentRegion.left) {
                scroll = true;
                nl = dragXY[0] - ((ws) ? b : 0);
                sl = parentScrollLeft - b;
            }
            if (dragRight >= parentRegion.right) {
                scroll = true;
                nl = dragXY[0] + ((ws) ? b : 0);
                sl = parentScrollLeft + b;
            }
        }

        // check if we are scrolling vertically 
        if (this.isScrollVertical()) {
            if (dragBottom >= parentRegion.bottom) {
                scroll = true;
                nt = dragXY[1] + ((ws) ? b : 0);
                st = parentScrollTop + b;
            }
            if (dragTop <= parentRegion.top) {
                scroll = true;
                nt = dragXY[1] - ((ws) ? b : 0);
                st = parentScrollTop - b;
            }
        }

        if (st < 0) {
            st = 0;
            nt = dragXY[1];
        }
        if (sl < 0) {
            sl = 0;
            nl = dragXY[0];
        }
        if (nt < 0) {
            nt = dragXY[1];
        }
        if (nl < 0) {
            nl = dragXY[0];
        }

        if (move) {

            // adjust element
            this.alignElWithMouse(dragEl, nl, nt);

            // perform scrolling
            if (parentEl == window) {
                parentEl.scrollTo(sl, st);
            } else {
                parentEl.scrollTop = st;
                parentEl.scrollLeft = sl;
            }

            // console.log('scroll: x=%d y=%d nl=%d nt=%d sl=%d st=%d', dragXY[0], dragXY[1], nl, nt, sl, st);

            // if scrolling for left/top is at zero then no need to check anymore
            if (!st && !sl) {
                this._cancelScroll();
            }
        } else {
            if (scroll) {
                this._initScroll();
            } else {
                this._cancelScroll();
            }
        }
    };

    // noop the existing YUI2 auto scroll
    DD.prototype.autoScroll = function(x, y, h, w) {};

    // replace the before drag and include our scroll timer
    DD.prototype.b4Drag = function(e) {

        // set the drag element position (original code)
        this.setDragElPos(YAHOO.util.Event.getPageX(e), YAHOO.util.Event.getPageY(e));

        // check if scrolling is enabled (new code)
        if (this.scroll) {
            if (this._scrollTimer) {
                this._cancelScroll();
            }
            this._checkWinScroll();
        }
    };

})(YAHOO);

// Fix for YUI2 container to support h2 header
(function (YAHOO) {

    // fix headers
    var m_oHeaderTemplate;
    function createHeader() {
        if (!m_oHeaderTemplate) {
            var m_oModuleTemplate = document.createElement('div');
            m_oModuleTemplate.innerHTML = '<h2 class=\"' + YAHOO.widget.Module.CSS_HEADER + '\"></h2>';
            m_oHeaderTemplate = m_oModuleTemplate.firstChild;
        }
        return (m_oHeaderTemplate.cloneNode(false));
    }

    // same code as container.js (line 1508) except custom createHeader() function
    YAHOO.widget.Module.prototype.setHeader = function (headerContent) {
        var oHeader = this.header || (this.header = createHeader());

        if (headerContent.nodeName) {
            oHeader.innerHTML = "";
            oHeader.appendChild(headerContent);
        } else {
            oHeader.innerHTML = headerContent;
        }

        if (this._rendered) {
            this._renderHeader();
        }

        this.changeHeaderEvent.fire(headerContent);
        this.changeContentEvent.fire();
    };

})(YAHOO);

/*
This code is used to patch YUI 2's browser detection with newer YUI 3 logic.
Straight port from: \yui3\src\yui\js\yui-ua.js
*/

(function (YAHOO) {

    // mock data for YUI3 version of parseUA
    var Y = {
        config: {
            win: window
        }
    };

    /**
    * Static method on `YUI.Env` for parsing a UA string.  Called at instantiation
    * to populate `Y.UA`.
    *
    * @static
    * @method parseUA
    * @param {String} [subUA=navigator.userAgent] UA string to parse
    * @return {Object} The Y.UA object
    */
    YAHOO.env.parseUA = function (subUA) {

        var numberify = function (s) {
            var c = 0;
            return parseFloat(s.replace(/\./g, function () {
                return (c++ === 1) ? '' : '.';
            }));
        },

            win = Y.config.win,

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

        //It was a parsed UA, do not assign the global value.
        /*if (!subUA) {

            if (typeof process === 'object') {

                if (process.versions && process.versions.node) {
                    //NodeJS
                    o.os = process.platform;
                    o.nodejs = numberify(process.versions.node);
                }
            }

            YUI.Env.UA = o;

        }*/

        return o;
    };

    // assign to YUI2
    YAHOO.UA = YAHOO.env.ua = YAHOO.env.parseUA();

})(window.YAHOO);

