// TODO: 
// * https://github.com/marquete/kibo/blob/master/kibo.js
// * https://github.com/madrobby/keymaster

// key behavior
var KeyEventResult =
{
    Ignored: 0, // no shortcut found (stop)
    Stop: 1, // explicitly stop this event (stop)
    Matched: 2, // shortcut found (stop)
    Allow: 3 // allow browser key event (allow)
};

// global function for handling keyboard
function onglobalkeyevent(evt, type, key, keyCode, charCode) {

    // FB 146275 - hardware keyboards act different under iOS >= 7 so we're going to disallow Ctrl key shortcuts because
    //  Caps-Lock on sets Ctrl key flag to true for all subsequent key presses
    //  Ctrl-key sets Meta = true and only generates a key up event
    //  Shift/Alt keys works fine
    if (evt.ctrlKey && !Util.Browser.supportsModifierKeys()) {
        return;
    }

    var shiftKey = evt.shiftKey;
    var ctrlKey = evt.ctrlKey;
    var metaKey = evt.metaKey;
    var altKey = evt.altKey;
    var target = YUE.getTarget(evt);
    var inTextInput = Util.Event.inTextInput(evt);
    var inLoadingDialog = YAHOO.util.Dom.hasClass(document.body, 'showingLoading');
    var inModalDialog = YAHOO.util.Dom.hasClass(document.body, 'showingDialog');

    // var keyInfo = "[type]:" + type + " [shift]:" + shiftKey + " [ctrl]:" + ctrlKey + " [alt]:" + altKey + " [meta]:" + metaKey + " [keyIdentifier]:" + key + " keyCode:" + keyCode + " charCode:" + charCode;
    // Util.log('DOM keys: ' + keyInfo);

    var keyObj =
    {
        type: type,
        key: key,
        keyCode: keyCode,
        charCode: charCode,
        shiftKey: shiftKey,
        ctrlKey: ctrlKey,
        altKey: altKey,
        metaKey: metaKey,
        target: target
    };

    // fire key event
    KeyManager.onKeyEvent.fire(keyObj);

    // shortcut to close secure browser
    if (evt.ctrlKey && evt.altKey && evt.shiftKey && key == 'F10') {
        return;
    }

    var stopEvent = function() {
        YAHOO.util.Event.stopEvent(evt);
    };

    // check if the key is considered safe for this language (text areas)
    var isKeySafeForLanguage = function() {
        // if we are not in a text field then ignore
        if (!inTextInput) {
            return false;
        }

        // get current language
        if (typeof (TDS) != 'object') {
            return false;
        }
        var currentLanguage = TDS.getLanguage();

        // Hawaiian keyboard
        if (currentLanguage == 'HAW' && evt.altKey) {
            switch (keyCode) {
                case 65: // A
                case 69: // E
                case 73: // I
                case 79: // O
                case 85: // U
                case 222: return true; // "
            }
        }

        return false;
    };

    // check if the key is considered safe (navigation)
    var isKeyNavigational = function() {
        // tab and shift-tab
        if (!evt.altKey && !evt.ctrlKey && evt.keyCode == 9) {
            return true;
        }

        // non modifier navigation keys
        if (!Util.Event.hasModifier(evt)) {
            // enter key
            if (keyCode == 13) {
                return true;
            }

            // page up/down
            // if (keyCode == 33 || keyCode == 34) return true;

            // home/end
            // if (keyCode == 36 || keyCode == 35) return true;
        }

        // allow arrow keys if no modifiers or shift key (for text selection)
        if (!Util.Event.hasModifier(evt) || evt.shiftKey) {
            // left/up/right/down
            if (keyCode >= 37 && keyCode <= 40) {
                return true;
            }
        }

        // check if the key is safe for the current language
        if (isKeySafeForLanguage()) {
            return true;
        }

        return false;
    };

    // if progress dialog is showing don't allow any keys
    if (inLoadingDialog) {
        stopEvent();
        return;
    }

    // if modal dialog is showing then allow safe keys
    if (inModalDialog && !inTextInput) {
        if (!isKeyNavigational()) {
            stopEvent(); // stop key if not safe
        }
        return;
    }

    var keyResult;

    // process any key events
    if (typeof window.onkeyevent == 'function') {
        // fire key function
        keyResult = window.onkeyevent(evt, type, key, keyCode, charCode, target);
    }

    // // on ChromeBook, disabling Ctrl+Alt+Z(Voice Guide) and Ctrl+F1/F2(Back/Forward) bug: https://bugz.airast.org/default.asp?134340 and https://bugz.airast.org/default.asp?106596#783577
    if (Util.Browser.isChromeOS() && type == 'keydown') {
        if (evt.ctrlKey && ((evt.altKey && evt.keyCode == 90) || (evt.keyCode == 166 || evt.keyCode == 167))) { // keycode 90 for Z 166/167 for Back and Forward (F1/F2) keys
            keyResult = KeyEventResult.Stop;
        }
    }

    // check if key result was ignored
    if (!keyResult) {
        // if we consider this safe then allow key
        if (isKeyNavigational()) {
            keyResult = KeyEventResult.Allow;
        } else {
            keyResult = KeyEventResult.Ignored;
        }
    }

    // check if this key was all
    if (keyResult === KeyEventResult.Allow) {
        return;
    }
    // check if asked to stop this event
    else if (keyResult === KeyEventResult.Stop) {
        stopEvent();
    }
    // check if editing (input, textarea, html editor)
    else if (inTextInput) {
        // has a modifier or matched an existing shortcut
        if (Util.Event.hasModifier(evt) || keyResult === KeyEventResult.Matched) {
            stopEvent();
        }
    }
    // unless allowed we will stop this event
    else if (keyResult !== KeyEventResult.Allow) {
        stopEvent();
    }
}

// HELPFUL LINKS:
// http://unixpapa.com/js/key.html
// http://unixpapa.com/js/testkey.html

/**
 * This class attempts to provide unified key event handler for Internet Explorer, Firefox, Opera and Safari.
 */
var KeyManager =
{
    onKeyEvent: new YAHOO.util.CustomEvent('onGlobalKeyEvent', KeyManager, false, YAHOO.util.CustomEvent.FLAT),

    isInit: false,
    isWindows: false,
    isMac: false,
    isUnix: false,

    attachListener: function(doc) {
        YAHOO.util.Event.addListener(doc, "keyup", this._onKeyUpDown, this, true);
        YAHOO.util.Event.addListener(doc, "keydown", this._onKeyUpDown, this, true);
        YAHOO.util.Event.addListener(doc, "keypress", this._onKeyPress, this, true);
    },

    // call this function to initialize the keyboard handler variables
    preinit: function () {

        // figure out platform
        if (navigator.platform.indexOf("Windows") != -1 || navigator.platform.indexOf("Win32") != -1 || navigator.platform.indexOf("Win64") != -1) {
            this.isWindows = true;
        } else if (navigator.platform.indexOf("Macintosh") != -1 || navigator.platform.indexOf("MacPPC") != -1 || navigator.platform.indexOf("MacIntel") != -1) {
            this.isMac = true;
        } else if (navigator.platform.indexOf("X11") != -1 || navigator.platform.indexOf("Linux") != -1 || navigator.platform.indexOf("BSD") != -1) {
            this.isUnix = true;
        }

        // register at the event handler
        this._lastUpDownType = {};

        // construct invers of keyCodeToIdentifierMap
        if (!this._identifierToKeyCodeMap) {
            this._identifierToKeyCodeMap = {};

            for (var key in this._keyCodeToIdentifierMap) {
                this._identifierToKeyCodeMap[this._keyCodeToIdentifierMap[key]] = parseInt(key, 10);
            }

            for (var key in this._specialCharCodeMap) {
                this._identifierToKeyCodeMap[this._specialCharCodeMap[key]] = parseInt(key, 10);
            }
        }

        if (YAHOO.env.ua.ie) {
            this._charCode2KeyCode = {
                13: 13,
                27: 27
            };
        } else if (YAHOO.env.ua.gecko) {
            this._keyCodeFix = {
                12: this._identifierToKeyCode("NumLock")
            };
        } else if (YAHOO.env.ua.webkit) {
            // starting with Safari 3.1 (verion 525.13) Apple switched the key
            // handling to match the IE behaviour.
            if (YAHOO.env.ua.webkit < 525.13) {
                // Safari/Webkit Mappings
                this._charCode2KeyCode = {
                    63289: this._identifierToKeyCode("NumLock"),
                    63276: this._identifierToKeyCode("PageUp"),
                    63277: this._identifierToKeyCode("PageDown"),
                    63275: this._identifierToKeyCode("End"),
                    63273: this._identifierToKeyCode("Home"),
                    63234: this._identifierToKeyCode("Left"),
                    63232: this._identifierToKeyCode("Up"),
                    63235: this._identifierToKeyCode("Right"),
                    63233: this._identifierToKeyCode("Down"),
                    63272: this._identifierToKeyCode("Delete"),
                    63302: this._identifierToKeyCode("Insert"),
                    63236: this._identifierToKeyCode("F1"),
                    63237: this._identifierToKeyCode("F2"),
                    63238: this._identifierToKeyCode("F3"),
                    63239: this._identifierToKeyCode("F4"),
                    63240: this._identifierToKeyCode("F5"),
                    63241: this._identifierToKeyCode("F6"),
                    63242: this._identifierToKeyCode("F7"),
                    63243: this._identifierToKeyCode("F8"),
                    63244: this._identifierToKeyCode("F9"),
                    63245: this._identifierToKeyCode("F10"),
                    63246: this._identifierToKeyCode("F11"),
                    63247: this._identifierToKeyCode("F12"),
                    63248: this._identifierToKeyCode("PrintScreen"),
                    3: this._identifierToKeyCode("Enter"),
                    12: this._identifierToKeyCode("NumLock"),
                    13: this._identifierToKeyCode("Enter")
                };
            } else {
                this._charCode2KeyCode = {
                    13: 13,
                    27: 27
                };
            }
        }
    },

    // call this function to initialize and attach the keyboard handler to the main document
    init: function (el) {

        // init keyboard handler
        this.preinit();

        // attach the keyboard handler to the current document
        if (typeof el != 'object') {
            el = (YAHOO.env.ua.gecko) ? window : document;
        }
        this.attachListener(el);

        this.isInit = true;
        Util.log('keyboard: init');
    },

    /**
	 * Checks whether a given string is a valid keyIdentifier
	 *
	 * @type member
	 * @param keyIdentifier {String} The key identifier.
	 * @return {Boolean} whether the given string is a valid keyIdentifier
	 */
    isValidKeyIdentifier: function(keyIdentifier) {
        if (this._identifierToKeyCodeMap[keyIdentifier]) {
            return true;
        }

        if (keyIdentifier.length != 1) {
            return false;
        }

        if (keyIdentifier >= "0" && keyIdentifier <= "9") {
            return true;
        }

        if (keyIdentifier >= "A" && keyIdentifier <= "Z") {
            return true;
        }

        switch (keyIdentifier) {
            case "+":
            case "-":
            case "*":
            case "/":
                return true;
            default:
                return false;
        }
    },

    /** {Map} Internal data structure with all supported keyboard events */
    __keyEvents: {
        keyup: 1,
        keydown: 1,
        keypress: 1,
        keyinput: 1
    },

    /**
     * Low level handler for "keyup" and "keydown" events
     *
     * @param domEvent {Event} DOM event object
     * @signature function(domEvent)
     */
    _onKeyUpDown: function (domEvent) {

        if (!this.isInit) return;

        /* IE */
        if (YAHOO.env.ua.ie) {
            domEvent = window.event || domEvent;

            var keyCode = domEvent.keyCode;
            var charCode = 0;
            var type = domEvent.type;

            // Ignore the down in such sequences dp dp dp
            if (!(this._lastUpDownType[keyCode] == "keydown" && type == "keydown")) {
                this._idealKeyHandler(keyCode, charCode, type, domEvent);
            }

            // On non print-able character be sure to add a keypress event
            if (type == "keydown") {
                // non-printable, backspace or tab
                if (this._isNonPrintableKeyCode(keyCode) || keyCode == 8 || keyCode == 9) {
                    this._idealKeyHandler(keyCode, charCode, "keypress", domEvent);
                }
            }

            // Store last type
            this._lastUpDownType[keyCode] = type;
        }
        /* Mozilla/Firefox */
        else if (YAHOO.env.ua.gecko) {
            var keyCode = this._keyCodeFix[domEvent.keyCode] || domEvent.keyCode;
            var charCode = domEvent.charCode;
            var type = domEvent.type;

            // FF repeats under windows keydown events like IE
            if (this.isWindows) {
                var keyIdentifier = keyCode ? this._keyCodeToIdentifier(keyCode) : this._charCodeToIdentifier(charCode);

                if (!(this._lastUpDownType[keyIdentifier] == "keypress" && type == "keydown")) {
                    this._idealKeyHandler(keyCode, charCode, type, domEvent);
                }

                // Store last type
                this._lastUpDownType[keyIdentifier] = type;
            }
            // all other OSes
            else {
                this._idealKeyHandler(keyCode, charCode, type, domEvent);
            }
        }
        /* Safari/Chrome */
        else if (YAHOO.env.ua.webkit) {
            var keyCode = 0;
            var charCode = 0;
            var type = domEvent.type;

            // starting with Safari 3.1 (verion 525.13) Apple switched the key
            // handling to match the IE behaviour.

            /* Safari < 3.1 */
            if (YAHOO.env.ua.webkit < 525.13) {

                // prevent Safari from sending key signals twice for webkit < 420
                // This bug is fixed in recent Webkit builds so we need a revision check
                // see http://trac.mochikit.com/ticket/182 for details
                if (YAHOO.env.ua.webkit > 420) {
                    if (!this._lastCharCodeForType) {
                        this._lastCharCodeForType = {};
                    }

                    var isSafariSpecialKey = this._lastCharCodeForType[type] > 63000;

                    if (isSafariSpecialKey) {
                        this._lastCharCodeForType[type] = null;
                        return;
                    }

                    this._lastCharCodeForType[type] = domEvent.charCode;
                }

                if (type == "keyup" || type == "keydown") {
                    if ((domEvent.charCode == 3 || domEvent.charCode == 13) && domEvent.keyIdentifier != "Enter") {
                        // This is fix for Safari 2 where ctrl-m and ctrl-c look like the Enter key
                        // more info (search for "ctrl-m"): http://turtle.dojotoolkit.org/pipermail/dojo-checkins/2007-April/017569.html
                        keyCode = domEvent.keyCode;
                    } else {
                        keyCode = this._charCode2KeyCode[domEvent.charCode] || domEvent.keyCode;
                    }
                } else {
                    if (this._charCode2KeyCode[domEvent.charCode]) {
                        keyCode = this._charCode2KeyCode[domEvent.charCode];
                    } else {
                        charCode = domEvent.charCode;
                    }
                }

                this._idealKeyHandler(keyCode, charCode, type, domEvent);
            }
            /* Safari >= 3.1  or Chrome */
            else {
                keyCode = domEvent.keyCode;

                // Ignore the down in such sequences dp dp dp
                if (!(this._lastUpDownType[keyCode] == "keydown" && type == "keydown")) {
                    this._idealKeyHandler(keyCode, charCode, type, domEvent);
                }

                // On non print-able character be sure to add a keypress event
                if (type == "keydown") {
                    // non-printable, backspace or tab
                    if (this._isNonPrintableKeyCode(keyCode) || keyCode == 8 || keyCode == 9) {
                        this._idealKeyHandler(keyCode, charCode, "keypress", domEvent);
                    }
                    // on ChromeBook, disabling Ctrl+Alt+Z(Voice Guide) and Ctrl+F1/F2(Back/Forward) bug: https://bugz.airast.org/default.asp?134340 and https://bugz.airast.org/default.asp?106596#783577
                    if (Util.Browser.isChromeOS() && (keyCode == 90 || keyCode == 166 || keyCode == 167)) {
                        this._idealKeyHandler(keyCode, charCode, "keydown", domEvent);
                    }
                }

                // Store last type
                this._lastUpDownType[keyCode] = type;
            }

        }
        /* Opera */
        else if (YAHOO.env.ua.opera) {
            this._idealKeyHandler(domEvent.keyCode, 0, domEvent.type, domEvent);
        }
    },

    /**
     * Low level key press handler
     *
     * @param domEvent {Event} DOM event object
     * @signature function(domEvent)
     */
    _onKeyPress: function (domEvent) {

        if (!this.isInit) return;

        /* IE */
        if (YAHOO.env.ua.ie) {

            domEvent = window.event || domEvent;

            if (this._charCode2KeyCode[domEvent.keyCode]) {
                this._idealKeyHandler(this._charCode2KeyCode[domEvent.keyCode], 0, domEvent.type, domEvent);
            } else {
                this._idealKeyHandler(0, domEvent.keyCode, domEvent.type, domEvent);
            }
        }
        /* Mozilla/Firefox */
        else if (YAHOO.env.ua.gecko) {
            var keyCode = this._keyCodeFix[domEvent.keyCode] || domEvent.keyCode;
            var charCode = domEvent.charCode;
            var type = domEvent.type;

            // FF repeats under windows keydown events like IE
            if (this.isWindows) {
                var keyIdentifier = keyCode ? this._keyCodeToIdentifier(keyCode) : this._charCodeToIdentifier(charCode);

                if (!(this._lastUpDownType[keyIdentifier] == "keypress" && type == "keydown")) {
                    this._idealKeyHandler(keyCode, charCode, type, domEvent);
                }

                // Store last type
                this._lastUpDownType[keyIdentifier] = type;
            }
            // all other OSes
            else {
                this._idealKeyHandler(keyCode, charCode, type, domEvent);
            }
        }
        /* Safari/Chrome */
        else if (YAHOO.env.ua.webkit) {
            // starting with Safari 3.1 (verion 525.13) Apple switched the key
            // handling to match the IE behaviour.
            /* Safari < 3.1 */
            if (YAHOO.env.ua.webkit < 525.13) {
                var keyCode = 0;
                var charCode = 0;
                var type = domEvent.type;

                // prevent Safari from sending key signals twice
                // This bug is fixed in recent Webkit builds so we need a revision check
                // see http://trac.mochikit.com/ticket/182 for details
                if (!YAHOO.env.ua.webkit > 420) {

                    if (!this._lastCharCodeForType) {
                        this._lastCharCodeForType = {};
                    }

                    var isSafariSpecialKey = this._lastCharCodeForType[type] > 63000;

                    if (isSafariSpecialKey) {
                        this._lastCharCodeForType[type] = null;
                        return;
                    }

                    this._lastCharCodeForType[type] = domEvent.charCode;
                }

                if (type == "keyup" || type == "keydown") {
                    keyCode = this._charCode2KeyCode[domEvent.charCode] || domEvent.keyCode;
                } else {
                    if (this._charCode2KeyCode[domEvent.charCode]) {
                        keyCode = this._charCode2KeyCode[domEvent.charCode];
                    } else {
                        charCode = domEvent.charCode;
                    }
                }

                this._idealKeyHandler(keyCode, charCode, type, domEvent);
            }
            /* Safari >= 3.1  or Chrome */
            else {
                if (this._charCode2KeyCode[domEvent.keyCode]) {
                    this._idealKeyHandler(this._charCode2KeyCode[domEvent.keyCode], 0, domEvent.type, domEvent);
                } else {
                    this._idealKeyHandler(0, domEvent.keyCode, domEvent.type, domEvent);
                }
            }
        }
        /* Opera */
        else if (YAHOO.env.ua.opera) {
            if (this._keyCodeToIdentifierMap[domEvent.keyCode]) {
                this._idealKeyHandler(domEvent.keyCode, 0, domEvent.type, domEvent);
            } else {
                this._idealKeyHandler(0, domEvent.keyCode, domEvent.type, domEvent);
            }
        }
    },

    /*
    ---------------------------------------------------------------------------
      IDEAL KEY HANDLER
    ---------------------------------------------------------------------------
    */

    /**
     * Key handler for an idealized browser.
     * Runs after the browser specific key handlers have normalized the key events.
     *
     * @type member
     * @param keyCode {String} keyboard code
     * @param charCode {String} character code
     * @param eventType {String} type of the event (keydown, keypress, keyup)
     * @param domEvent {Element} DomEvent
     * @return {void}
     */
    _idealKeyHandler: function(keyCode, charCode, eventType, domEvent) {
        if (!keyCode && !charCode) {
            return;
        }

        var keyIdentifier;

        // Use: keyCode
        if (keyCode) {
            keyIdentifier = this._keyCodeToIdentifier(keyCode);
            onglobalkeyevent(domEvent, eventType, keyIdentifier, keyCode, charCode);
        }
        // Use: charCode
        else {
            keyIdentifier = this._charCodeToIdentifier(charCode);
            onglobalkeyevent(domEvent, "keypress", keyIdentifier, keyCode, charCode);
            //this._fireInputEvent(domEvent, charCode);
        }

        // NOTE: IE and Safari (3.1) suppress a "keypress" event if the "keydown" event's
        // default action was prevented. In this case we emulate the "keypress"
        // FIX LATER: When event is not cancelled and you use modifier key + letter/number the keypress DOES NOT work for ie/webkit
        var cancelled = (domEvent.returnValue == false);
        if (eventType == "keydown" && cancelled && (YAHOO.env.ua.webkit >= 525.13 || YAHOO.env.ua.ie)) {
            // special keycode identifier for when preventing defaults are enabled, the charCode isn't provdided in these cases
            if (!(this._isNonPrintableKeyCode(keyCode) || keyCode == 8 || keyCode == 9)) {
                if (!domEvent.shiftKey && charCode == 0 && this._IEkeyCodeToIdentifierMap[keyCode]) {
                    keyIdentifier = this._IEkeyCodeToIdentifierMap[keyCode];
                } else if (domEvent.shiftKey && keyIdentifier == 0 && this._IEShiftkeyCodeToIdentifierMap[keyCode]) {
                    keyIdentifier = this._IEShiftkeyCodeToIdentifierMap[keyCode];
                }

                onglobalkeyevent(domEvent, "keypress", keyIdentifier, keyCode, charCode);
            }
        }

    },

    /*
    ---------------------------------------------------------------------------
      KEY MAPS
    ---------------------------------------------------------------------------
    */

    /** maps the charcodes of special printable keys to key identifiers */
    _specialCharCodeMap: {
        8: "Backspace", // The Backspace (Back) key.
        9: "Tab", // The Horizontal Tabulation (Tab) key.

        //   Note: This key identifier is also used for the
        //   Return (Macintosh numpad) key.
        13: "Enter", // The Enter key.
        27: "Escape", // The Escape (Esc) key.
        32: "Space" // The Space (Spacebar) key.
    },

    /** maps the keycodes of non printable keys to key identifiers */
    _keyCodeToIdentifierMap: {
        16: "Shift", // The Shift key.
        17: "Control", // The Control (Ctrl) key.
        18: "Alt", // The Alt (Menu) key.
        20: "CapsLock", // The CapsLock key
        224: "Meta", // The Meta key. (Apple Meta and Windows key)

        37: "Left", // The Left Arrow key.
        38: "Up", // The Up Arrow key.
        39: "Right", // The Right Arrow key.
        40: "Down", // The Down Arrow key.

        33: "PageUp", // The Page Up key.
        34: "PageDown", // The Page Down (Next) key.

        35: "End", // The End key.
        36: "Home", // The Home key.

        45: "Insert", // The Insert (Ins) key. (Does not fire in Opera/Win)
        46: "Delete", // The Delete (Del) Key.

        112: "F1", // The F1 key.
        113: "F2", // The F2 key.
        114: "F3", // The F3 key.
        115: "F4", // The F4 key.
        116: "F5", // The F5 key.
        117: "F6", // The F6 key.
        118: "F7", // The F7 key.
        119: "F8", // The F8 key.
        120: "F9", // The F9 key.
        121: "F10", // The F10 key.
        122: "F11", // The F11 key.
        123: "F12", // The F12 key.

        144: "NumLock", // The Num Lock key.
        44: "PrintScreen", // The Print Screen (PrintScrn, SnapShot) key.
        145: "Scroll", // The scroll lock key
        19: "Pause", // The pause/break key
        91: "Win", // The Windows Logo key
        93: "Apps" // The Application key (Windows Context Menu)
    },

    /** maps the keycodes of non printable keys to key identifiers for IE/Safari3.1 */
    _IEkeyCodeToIdentifierMap: {
        186: ";",
        187: "=",
        188: ",",
        190: ".",
        191: "/",
        219: "[",
        220: "\\",
        221: "]",
        222: "'"
    },

    /** maps the keycodes of non printable keys to key identifiers for IE/Safari3.1 when SHIFT is held */
    _IEShiftkeyCodeToIdentifierMap: {
        48: ")",
        49: "!",
        50: "@",
        51: "#",
        52: "$",
        53: "%",
        54: "^",
        55: "&",
        56: "*",
        57: "(",
        186: ":",
        187: "+",
        188: "<",
        190: ">",
        191: "?",
        219: "{",
        220: "|",
        221: "}",
        222: "\""
    },

    /** maps the keycodes of the numpad keys to the right charcodes */
    _numpadToCharCode: {
        96: "0".charCodeAt(0),
        97: "1".charCodeAt(0),
        98: "2".charCodeAt(0),
        99: "3".charCodeAt(0),
        100: "4".charCodeAt(0),
        101: "5".charCodeAt(0),
        102: "6".charCodeAt(0),
        103: "7".charCodeAt(0),
        104: "8".charCodeAt(0),
        105: "9".charCodeAt(0),
        106: "*".charCodeAt(0),
        107: "+".charCodeAt(0),
        109: "-".charCodeAt(0),
        110: ",".charCodeAt(0),
        111: "/".charCodeAt(0)
    },

    /*
    ---------------------------------------------------------------------------
      HELPER METHODS
    ---------------------------------------------------------------------------
    */

    _charCodeA: "A".charCodeAt(0),
    _charCodeZ: "Z".charCodeAt(0),
    _charCode0: "0".charCodeAt(0),
    _charCode9: "9".charCodeAt(0),


    /**
     * Checks whether the keyCode represents a non printable key
     *
     * @type member
     * @param keyCode {String} key code to check.
     * @return {Boolean} Wether the keyCode represents a non printable key.
     */
    _isNonPrintableKeyCode: function(keyCode) {
        return this._keyCodeToIdentifierMap[keyCode] ? true : false;
    },


    /**
     * Check whether the keycode can be reliably detected in keyup/keydown events
     *
     * @type member
     * @param keyCode {String} key code to check.
     * @return {Boolean} Wether the keycode can be reliably detected in keyup/keydown events.
     */
    _isIdentifiableKeyCode: function(keyCode) {
        // A-Z (TODO: is this lower or uppercase?)
        if (keyCode >= this._charCodeA && keyCode <= this._charCodeZ) {
            return true;
        }

        // 0-9
        if (keyCode >= this._charCode0 && keyCode <= this._charCode9) {
            return true;
        }

        // Enter, Space, Tab, Backspace
        if (this._specialCharCodeMap[keyCode]) {
            return true;
        }

        // Numpad
        if (this._numpadToCharCode[keyCode]) {
            return true;
        }

        // non printable keys
        if (this._isNonPrintableKeyCode(keyCode)) {
            return true;
        }

        return false;
    },


    /**
     * converts a keyboard code to the corresponding identifier
     *
     * @type member
     * @param keyCode {Integer} key code
     * @return {String} key identifier
     */
    _keyCodeToIdentifier: function(keyCode) {
        if (this._isIdentifiableKeyCode(keyCode)) {
            var numPadKeyCode = this._numpadToCharCode[keyCode];

            if (numPadKeyCode) {
                return String.fromCharCode(numPadKeyCode);
            }

            return (this._keyCodeToIdentifierMap[keyCode] || this._specialCharCodeMap[keyCode] || String.fromCharCode(keyCode));
        } else {
            return "Unidentified";
        }
    },


    /**
     * converts a character code to the corresponding identifier
     *
     * @type member
     * @param charCode {String} character code
     * @return {String} key identifier
     */
    _charCodeToIdentifier: function(charCode) {
        return this._specialCharCodeMap[charCode] || String.fromCharCode(charCode).toUpperCase();
    },


    /**
     * converts a key identifier back to a keycode
     *
     * @type member
     * @param keyIdentifier {String} The key identifier to convert
     * @return {Integer} keyboard code
     */
    _identifierToKeyCode: function(keyIdentifier) {
        return this._identifierToKeyCodeMap[keyIdentifier] || keyIdentifier.charCodeAt(0);
    }

};