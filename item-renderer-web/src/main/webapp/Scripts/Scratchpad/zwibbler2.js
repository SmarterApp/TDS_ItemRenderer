(function () {
    "use strict";
    /**
    Zwibbler
    
    Copyright 2013 Hanov Solutions Inc. All Rights Reserved. This software is
    NOT open source. For licensing information, contact the author.
    
    steve.hanov@gmail.com
    
    @license
    */
    /** @suppress {duplicate} */
    var __hasProp = Object.prototype.hasOwnProperty;
    /** @suppress {duplicate} */
    var __extends = function (child, parent) {
        for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
        /** @constructor */
        function ctor() { this.constructor = child; }
        ctor.prototype = parent.prototype;
        child.prototype = new ctor;
        child.__super__ = parent.prototype;
        return child;
    };

    /** @suppress {duplicate} */
    var __bind = function (fn, me) {
        return function () {
            return fn.apply(me, arguments);
        };
    }

    /** @suppress {duplicate} */
    var __indexOf = Array.prototype.indexOf || function (item) {
        for (var i = 0, l = this.length; i < l; i++) {
            if (this[i] === item) return i;
        }
        return -1;
    };

    /** @suppress {duplicate} */
    var __slice = Array.prototype.slice;
    /*	This work is licensed under Creative Commons GNU LGPL License.
    
    License: http://creativecommons.org/licenses/LGPL/2.1/
    Version: 0.9
    Author:  Stefan Goessner/2006
    Web:     http://goessner.net/ 
    */
    function xml2jsonv2(xml, tab) {
        var X = {
            toObj: function (xml) {
                var o = {};
                if (xml.nodeType === 1) {   // element node ..
                    if (xml.attributes.length) {   // element with attributes  ..
                        for (var i = 0; i < xml.attributes.length; i++) {
                            o["@" + xml.attributes[i].nodeName] = (xml.attributes[i].value || "").toString();
                        }
                    }
                    if (xml.firstChild) { // element has child nodes ..
                        var textChild = 0, cdataChild = 0, hasElementChild = false;
                        for (var n = xml.firstChild; n; n = n.nextSibling) {
                            if (n.nodeType === 1) {
                                hasElementChild = true;
                            } else if (n.nodeType === 3 && n.nodeValue.match(/[^ \f\n\r\t\v]/)) {
                                textChild++; // non-whitespace text
                            } else if (n.nodeType === 4) {
                                cdataChild++; // cdata section node
                            }
                        }
                        if (hasElementChild) {
                            if (textChild < 2 && cdataChild < 2) { // structured element with evtl. a single text or/and cdata node ..
                                X.removeWhite(xml);
                                for (n = xml.firstChild; n; n = n.nextSibling) {
                                    if (n.nodeType === 3) {// text node
                                        o["#text"] = X.escape(n.nodeValue);
                                    } else if (n.nodeType === 4) { // cdata node
                                        o["#cdata"] = X.escape(n.nodeValue);
                                    } else if (n.nodeName in o) {  // multiple occurence of element ..
                                        if (o[n.nodeName] instanceof Array) {
                                            o[n.nodeName][o[n.nodeName].length] = X.toObj(n);
                                        } else {
                                            o[n.nodeName] = [o[n.nodeName], X.toObj(n)];
                                        }
                                    } else { // first occurence of element..
                                        o[n.nodeName] = X.toObj(n);
                                    }
                                }
                            } else { // mixed content
                                if (!xml.attributes.length) {
                                    o = X.escape(X.innerXml(xml));
                                } else {
                                    o["#text"] = X.escape(X.innerXml(xml));
                                }
                            }
                        } else if (textChild) { // pure text
                            if (!xml.attributes.length) {
                                o = X.escape(X.innerXml(xml));
                            } else {
                                o["#text"] = X.escape(X.innerXml(xml));
                            }
                        } else if (cdataChild) { // cdata
                            if (cdataChild > 1) {
                                o = X.escape(X.innerXml(xml));
                            } else {
                                for (n = xml.firstChild; n; n = n.nextSibling) {
                                    o["#cdata"] = X.escape(n.nodeValue);
                                }
                            }
                        }
                    }
                    if (!xml.attributes.length && !xml.firstChild) { o = null; }
                } else if (xml.nodeType === 9) { // document.node
                    o = X.toObj(xml.documentElement);
                } else {
                    console.error("unhandled node type: ", xml.nodeType, xml);
                }
                return o;
            },
            toJson: function (o, name, ind) {
                var json = name ? ("\"" + name + "\"") : "";
                if (o instanceof Array) {
                    for (var i = 0, n = o.length; i < n; i++) {
                        o[i] = X.toJson(o[i], "", ind + "\t");
                    }
                    json += (name ? ":[" : "[") + (o.length > 1 ? ("\n" + ind + "\t" + o.join(",\n" + ind + "\t") + "\n" + ind) : o.join("")) + "]";
                } else if (o === null) {
                    json += (name && ":") + "null";
                } else if (typeof (o) === "object") {
                    var arr = [];
                    for (var m in o) {
                        if (o.hasOwnProperty(m)) {
                            arr[arr.length] = X.toJson(o[m], m, ind + "\t");
                        }
                    }
                    json += (name ? ":{" : "{") + (arr.length > 1 ? ("\n" + ind + "\t" + arr.join(",\n" + ind + "\t") + "\n" + ind) : arr.join("")) + "}";
                } else if (typeof (o) === "string") {
                    if ((name.substr(0, 4) === "nmb_") || (name.substr(0, 4) ===
                                "bln_")) {
                        json = (name && "\"" + name.substr(4) + "\":") + o.toString();
                    } else {
                        json += (name && ":") + "\"" + o.toString() + "\"";
                    }
                } else {
                    json += (name && ":") + o.toString();
                }
                return json;
            },
            innerXml: function (node) {
                var s = "";
                if ("innerHTML" in node) {
                    s = node.innerHTML;
                } else {
                    var asXml = function (n) {
                        var s = "";
                        if (n.nodeType === 1) {
                            s += "<" + n.nodeName;
                            for (var i = 0; i < n.attributes.length; i++) {
                                s += " " + n.attributes[i].nodeName + "=\"" + (n.attributes[i].value || "").toString() + "\"";
                            }
                            if (n.firstChild) {
                                s += ">";
                                for (var c = n.firstChild; c; c = c.nextSibling) {
                                    s += asXml(c);
                                }
                                s += "</" + n.nodeName + ">";
                            } else {
                                s += "/>";
                            }
                        } else if (n.nodeType === 3) {
                            s += n.nodeValue;
                        } else if (n.nodeType === 4) {
                            s += "<![CDATA[" + n.nodeValue + "]]>";
                        }
                        return s;
                    };
                    for (var c = node.firstChild; c; c = c.nextSibling) {
                        s += asXml(c);
                    }
                }
                return s;
            },
            escape: function (txt) {
                return txt.replace(/[\\]/g, "\\\\")
                          .replace(/[\"]/g, '\\"')
                          .replace(/[\n]/g, '\\n')
                          .replace(/[\r]/g, '\\r');
            },
            removeWhite: function (e) {
                e.normalize();
                for (var n = e.firstChild; n; ) {
                    if (n.nodeType === 3) {  // text node
                        if (!n.nodeValue.match(/[^ \f\n\r\t\v]/)) { // pure whitespace text node
                            var nxt = n.nextSibling;
                            e.removeChild(n);
                            n = nxt;
                        } else {
                            n = n.nextSibling;
                        }
                    } else if (n.nodeType === 1) {  // element node
                        X.removeWhite(n);
                        n = n.nextSibling;
                    } else {                      // any other node
                        n = n.nextSibling;
                    }
                }
                return e;
            }
        };
        if (xml.nodeType === 9) { // document node
            xml = xml.documentElement;
        }
        var json = X.toJson(X.toObj(X.removeWhite(xml)), xml.nodeName, "\t");
        return "{\n" + tab + (tab ? json.replace(/\t/g, tab) : json.replace(/\t|\n/g, "")) + "\n}";
    }


    function parseXml(xml) {
        var dom = null;
        if (window.DOMParser) {
            try {
                dom = (new DOMParser()).parseFromString(xml, "text/xml");
            }
            catch (e) { dom = null; }
        }
        else if (window.ActiveXObject) {
            try {
                dom = new ActiveXObject('Microsoft.XMLDOM');
                dom.async = false;
                if (!dom.loadXML(xml)) { // parse error ..
                    console.error(dom.parseError.reason + dom.parseError["srcText"]);
                }
            }
            catch (e2) { dom = null; }
        } else {
            console.error("Failed to pare xml.");
        }
        return dom;
    }

    function resolveUrl(url) {
        // change any html ampersand entities into the ampersand character
        url = url.replace(/&amp;/g, '&');

        // escape url
        url = url.split('&').join('&amp;').split('<').join('&lt;').split('"').join('&quot;');

        // cross browser compatible (even in IE 6) way of qualifying a url
        // http://stackoverflow.com/questions/470832/getting-an-absolute-url-from-a-relative-one-ie6-issue
        var el = document.createElement('div');
        el.innerHTML = '<a href="' + url + '">x</a>';
        return el.firstChild.href;
    }

    (function ($) {

        /*
         * jQuery Double Tap
         * Developer: Sergey Margaritov (sergey@margaritov.net)
         * Date: 22.10.2013
         * Based on jquery documentation http://learn.jquery.com/events/event-extensions/
         */

        $.event.special.dbltap = {
            bindType: 'touchend',
            delegateType: 'touchend',

            handle: function (event) {
                var handleObj = event.handleObj,
                    targetData = jQuery.data(event.target),
                    now = new Date().getTime(),
                    delta = targetData.lastTouch ? now - targetData.lastTouch : 0,
                    delay = delay == null ? 300 : delay;

                if (delta < delay && delta > 30) {
                    targetData.lastTouch = null;
                    event.type = handleObj.origType;
                    ['clientX', 'clientY', 'pageX', 'pageY'].forEach(function (property) {
                        event[property] = event.originalEvent.changedTouches[0][property];
                    })

                    // let jQuery handle the triggering of "dbltap" event handlers
                    handleObj.handler.apply(this, arguments);
                } else {
                    targetData.lastTouch = now;
                }
            }
        };

    })(jQuery);

    /*
    Zwibbler
    
    Copyright 2013 Hanov Solutions Inc. All Rights Reserved. This software is
    NOT open source. For licensing information, contact the author.
    
    steve.hanov@gmail.com
    */
    /**
    @param {string} key
    @param {...*} args
    */

    var log = function (key, args) {
        if (!console) {
            return;
        }

        var message = [];
        var format = args[0];
        var i;
        if (log.disabled[key]) {
            return;
        }

        var segments = format.split("%s");
        message.push(segments[0]);
        for (i = 1; i < segments.length; i++) {
            if (i - 1 >= args.length - 1) {
                message.push("<too few args>");
            } else if (typeof args[i] === "string" || typeof args[i] === "number") {
                message.push(args[i]);
            } else {
                message.push(JSON.stringify(args[i]));
            }
            message.push(segments[i]);
        }

        var joined = message.join("");
        for (i = 0; i < log.listeners.length; i++) {
            log.listeners[i](key, joined);
        }
    };

    log.disabled = {};
    log.listeners = [];

    log.enable = function (key, enabled) {
        log.disabled[key] = !enabled;
    };

    /** @param {string} key
    @param {boolean=} enabled */
    log.create = function (key, enabled) {
        if (enabled === false) {
            log.disabled[key] = true;
        }
        return function (args) {
            log(key, arguments);
        };
    };

    log.addListener = function (listenerFn) {
        log.listeners.push(listenerFn);
    };

    log.enableConsole = function () {
        if (!log.emulatedConsole) {
            log.listeners.push(function (key, message) {
                console.log(key + ": " + message);
            });
        }
    };

    if (!("console" in window)) {
        log.emulatedConsole = true;
        window["console"] = {
            "log": function () {
                var parts = [];
                for (var i = 0; i < arguments.length; i++) {
                    parts.push(JSON.stringify(arguments[i]));
                }

                for (i = 0; i < log.listeners.length; i++) {
                    log.listeners[i]("Console", parts.join(""));
                }
            }
        };
        window["console"]["error"] = window["console"]["log"];
    }
    /*
    Zwibbler
    
    Copyright 2013 Hanov Solutions Inc. All Rights Reserved. This software is
    NOT open source. For licensing information, contact the author.
    
    steve.hanov@gmail.com
    */
    /*
    Copyright 2010 Hanov Solutions Inc. All Rights Reserved
    
    steve.hanov@gmail.com
    */
    /*jslint browser: true, white: false */
    //#include <log.js>

    /** @constructor 
     
    The toolbar holds the images of the tools that the user can click on and
    takes care of highlighting them.
    */
    function Toolbar(useTouch) {
        this.div = $("<div>", { 'class': 'sp_toolbar_container' });
        //this.ul = $("<ul>", { 'class': 'sp_toolbar_ul' });
        this.div_toolbarleftcol = $("<div>", { 'class': 'sp_toolbar_leftcolumn' });
        this.div_toolbarrightcol = $("<div>", { 'class': 'sp_toolbar_rightcolumn' });

        this.ul_Left = $("<ul>", { 'class': 'sp_toolbar_ul_left sp_controls' });
        this.ul_Right = $("<ul>", { 'class': 'sp_toolbar_ul_right sp_tools' });

        this.div.append(this.div_toolbarleftcol.append(this.ul_Left));
        this.div.append(this.div_toolbarrightcol.append(this.ul_Right));

        //this.div.append(this.ul);

        this.lastClick = new Date().getTime();
        this.named = {};

        // array of buttons, for the keyboard focus. Each element is a structure
        // with member element as the jQuery object for the button on the screen,
        // and clickfn for the function to call when it is clicked.
        this.buttons = [];
        this.focusedIndex = 0;
        this.zwibblerContext = null;
    }

    Toolbar.prototype = {

        log: log.create("TOOLBAR"),

        /**
        Set the fake keyboard focus to the toolbar, which highlights one of the
        buttons. Optionally pass the index of the button to highlight.
        @param {number=} index */
        focus: function (index) {
            if (this.buttons.length > 0) {
                if (arguments.length > 0) {
                    this.buttons[this.focusedIndex].element.removeClass("focus");
                    this.focusedIndex = index;
                }
                this.buttons[this.focusedIndex].element.addClass("focus");
            }
        },

        blur: function () {
            if (this.buttons.length > 0) {
                this.buttons[this.focusedIndex].element.removeClass("focus");
            }
        },

        onKeyCommand: function (action, e) {
            if (this.buttons.length === 0) {
                return;
            }
            var change = action === "next" || action === "previous";

            if (change) {
                this.buttons[this.focusedIndex].element.removeClass("focus");
            }

            switch (action) {
                case "next":
                    this.focusedIndex = Math.min(this.focusedIndex + 1,
                            this.buttons.length - 1);
                    break;
                case "previous":
                    this.focusedIndex = Math.max(this.focusedIndex - 1, 0);
                    break;
                case "enter":
                    this.buttons[this.focusedIndex].clickfn(e);
                    break;
            }

            if (change) {
                // prevent document from scrolling
                this.buttons[this.focusedIndex].element.addClass("focus");
                e.stopPropagation();
                e.preventDefault();
            }
        },

        width: function () {
            return 50;
        },

        moveTo: function (x, y) {
            this.div.css("left", "" + x + "px");
            this.div.css("top", "" + y + "px");
        },

        clearHighlights: function () {
            console.warn("Clear highlights");
            /*
            for(var name1 in this.named) {
            if ( this.named.hasOwnProperty(name1) ) {
            this.named[name1].div.style.background = "#ffffff";
            }
            }
            */
        },

        setButtonHighlight: function (name, highlighted) {
            $('.sp_tool_btn').removeClass('sp_tool_btn_select');
            $('.sp_tool_' + name).addClass('sp_tool_btn_select');
        },

        /** 
        Adds a button with the given name. When the button is clicked, or
        selected with the keyboard, the clickfn is called. It takes a single
        parameter containing the event that led to it being clicked. The event
        type can be used to check whether it was activated by keyboard or mouse.
        */
        addButton: function (name, clickfn, col_name, text) {
            var self = this;
            var a = $('<a>', { 'class': 'sp_tool_btn sp_tool_' + name, 'title': name }).text(text);
            var li = $("<li>", { 'class': 'sp_tool_list_item' }).append(a);
            var index = this.buttons.length;
            if (clickfn) {
                a.on('click touchend', function (evt) {
                    evt.stopPropagation();

                    // prevent touchend events from raising click events after 300ms
                    evt.preventDefault();

                    if (!self.isReadOnly()) {
                        self.focus(index);
                        clickfn(evt);
                    }
                });
            }
            if (col_name == this.ul_Left.valueOf(0)) {
                this.ul_Left.append(li);
            }
            else
                this.ul_Right.append(li);
            //this.ul.append(li);
            this.buttons.push({
                element: li,
                clickfn: clickfn
            });
        },

        isReadOnly : function () {
            return this.zwibblerContext && this.zwibblerContext.isReadOnly();
        }
    };
    /*
    //#include <log.js>
    */
    var Url;
    Url = {
        log: log.create("URL"),
        unescape: function (string) {
            string = string.replace(/\+/g, " ");
            if (window.decodeURIComponent) {
                return window.decodeURIComponent(string);
            } else {
                return unescape(string);
            }
        },
        /** @param {string=} separator */
        splitQueryString: function (string, separator) {
            var a, field, fields, i, index, key, value, _i, _len;
            if (separator == null) {
                separator = '?';
            }
            a = {};
            index = string.indexOf(separator);
            if (index >= 0) {
                string = string.substr(index + 1);
            }
            index = string.indexOf('#');
            if (index >= 0) {
                string = string.substr(0, index);
            }
            fields = string.split("&");
            for (_i = 0, _len = fields.length; _i < _len; _i++) {
                field = fields[_i];
                i = field.split("=");
                key = Url.unescape(i[0]);
                value = i.length > 1 ? Url.unescape(i[1]) : "";
                if (key.length) {
                    a[key] = value;
                }
            }
            return a;
        },
        encode: function (mapping) {
            var first, key, parts;
            parts = [];
            first = true;
            for (key in mapping) {
                if (!first) {
                    parts.push('&');
                }
                first = false;
                parts.push(encodeURIComponent(key));
                if (mapping[key] !== "") {
                    parts.push('=');
                    parts.push(encodeURIComponent(mapping[key]));
                }
            }
            return parts.join("");
        },
        replaceHashValue: function (key, value) {
            var encoded, query;
            query = Url.hash();
            query[key] = value;
            encoded = Url.encode(query);
            return window.location.hash = encoded;
        },
        deleteHashValue: function (key) {
            var encoded, query;
            query = Url.hash();
            delete query[key];
            encoded = Url.encode(query);
            return window.location.hash = encoded;
        },
        setBooleanHashValue: function (key, value) {
            var encoded, query;
            query = Url.hash();
            if (value) {
                query[key] = "1";
            } else {
                delete query[key];
            }
            encoded = Url.encode(query);
            return window.location.hash = encoded;
        },
        hash: function () {
            return Url.splitQueryString(window.location.hash, '#');
        }
    };
    /*
    Zwibbler
    
    Copyright 2013 Hanov Solutions Inc. All Rights Reserved. This software is
    NOT open source. For licensing information, contact the author.
    
    steve.hanov@gmail.com
    //#include <Url.js>
    //#include <log.js>
    */
    /*
    Keep global configuration settings in one place. These configuration settings
    can be set on startup from the Zwibbler API.
    */
    /*
    This function, if called immediately retrieves the src of the currently
    executing script. It will not work properly if called later.
    */
    var GetMyScript, ScriptSrc;
    GetMyScript = function () {
        var script, scripts, src;
        scripts = document.getElementsByTagName('script');
        script = scripts[scripts.length - 1];
        if (script.getAttribute.length !== 0) {
            src = script.src;
        } else {
            src = script.getAttribute('src', -1);
        }
        return src;
    };
    ScriptSrc = GetMyScript();
    /**
    * @constructor
    */
    var Config = function (options) {
        var key, name, query, scriptPath, touch;
        this.options = {
            "backgroundImage": null,
            "debug": false,
            "defaultArrowHeadSize": "Medium",
            "defaultBrushColour": "#ff0000",
            "defaultBrushThickness": "Brush",
            "defaultFillStyle": "#00ff00",
            "defaultFont": "Arial",
            "defaultFontSize": 20,
            "defaultOutlineColour": "#000000",
            "defaultOutlineThickness": "Pen",
            "defaultSmoothness": "smooth",
            "defaultTextColour": "#000000",
            "defaultShadow": false,
            "fonts": ["Arial", "Times New Roman"],
            "imageFolder": "$SCRIPT/images",
            "nudge": 10,
            "showArrowTool": true,
            "showArrowHeadSizeProperty": true,
            "showBackgroundSelector": false,
            "showBrushColourProperty": true,
            "showBrushThicknessProperty": true,
            "showBrushTool": true,
            "showCircleTool": true,
            "showColourPanel": true,
            "showCopyPaste": true,
            "showCurveTool": true,
            "showDebug": false,
            "showFillColourProperty": true,
            "showFontProperty": true,
            "showFontSizeProperty": true,
            "showFreeformCurveTool": false,
            "showImageSelector": false,
            "showImageTool": false,
            "showLineTool": true,
            "showMathTool": true,
            "showMenu": false,
            "showOutlineColourProperty": true,
            "showOutlineThicknessProperty": true,
            "showPickTool": true,
            "showPropertyPanel": false,
            "showShadowProperty": true,
            "showSquareTool": true,
            "showKeyboardHelp": true,
            "showTextColourProperty": true,
            "showTextTool": true,
            "showUndoRedo": true,
            "showDeleteButton": true,
            "sloppy": true,
            "snap": 0,
            "useTouch": "auto",
            "canvasSize": ""
        };
        for (name in options) {
            if (name && typeof options[name] !== 'function') {
                if (name in this.options) {
                    var oldValue = this.options[name];
                    var newValue = options[name];
                    if (typeof oldValue === "string") {
                    } else if (typeof oldValue === "number") {
                        newValue = parseFloat(newValue);
                    } else if (typeof oldValue === "boolean") {
                        newValue = newValue === 'true';
                    }
                    this.options[name] = newValue;
                } else {
                    if(name != '@xmlns')
                        console.error("Zwibbler: Unknown option: ", name, options[name]);
                }
            }
        }

        query = Url.hash();
        for (name in query) {
            if (typeof this.options[name] === "number") {
                this.options[name] = parseFloat(query[name]);
            } else if (typeof this.options[name] === "boolean") {
                this.options[name] = query[name] === 'true';
            } else {
                this.options[name] = query[name];
            }
        }
        scriptPath = this.getScriptFolder();
        if (scriptPath === "") {
            this.imageFolder = this.options["imageFolder"].replace("$SCRIPT/", "");
            this.imageFolder = this.imageFolder.replace("$SCRIPT", "");
        } else {
            this.imageFolder = this.options["imageFolder"].replace("$SCRIPT", this.getScriptFolder());
        }
        if (this.imageFolder !== "" && this.imageFolder[this.imageFolder.length - 1] !== "/") {
            this.imageFolder += "/";
        }
        if (this.options["useTouch"] === "auto") {
            touch = 'ontouchstart' in window || 'onmsgesturechange' in window;
            this.log("Detected touch support: %s", touch);
        }
        for (key in this.options) {
            if (typeof this.options[key] !== 'function') {
                this.log("%s=%s", key, this.options[key]);
            }
        }
    };

    Config.prototype.log = log.create("CONFIG");
    Config.prototype.getScriptFolder = function () {
        var i, src;
        src = ScriptSrc;
        i = src.lastIndexOf("/");
        if (i >= 0) {
            src = src.substr(0, i + 1);
        } else {
            src = "";
        }
        return src;
    };
    Config.prototype.hasMenu = function () {
        return this.options["showMenu"];
    };
    Config.prototype.showFreeformCurveTool = function () {
        return this.options["showFreeformCurveTool"];
    };
    Config.prototype.showBrushTool = function () {
        return this.options["showBrushTool"];
    };
    Config.prototype.showPropertyPanel = function () {
        return this.options["showPropertyPanel"];
    };
    Config.prototype.showColourPanel = function () {
        return this.options["showColourPanel"];
    };
    Config.prototype.showKeyboardHelp = function () {
        return this.options["showKeyboardHelp"];
    };
    Config.prototype.showDebug = function () {
        return this.options["showDebug"];
    };
    Config.prototype.getOption = function (name) {
        return this.options[name];
    };
    Config.prototype.get = function (name) {
        return this.getOption(name);
    };
    Config.prototype.useTouch = function () {
        if (this.options["useTouch"] === "auto") {
            return 'ontouchstart' in window || 'onmsgesturechange' in window;
        } else {
            return this.options["useTouch"];
        }
    };
    Config.prototype.getDefaultSmoothness = function () {
        var smoothness;
        smoothness = ("" + this.options["defaultSmoothness"]).toLowerCase();
        if (smoothness === "sharper") {
            return 0.1;
        } else if (smoothness === "sharp") {
            return 0.2;
        } else if (smoothness === "smoothest") {
            return 0.5;
        } else {
            return 0.3;
        }
    };

    Config.prototype.getThickness = function (name) {
        var thickness;
        thickness = ("" + this.options[name]).toLowerCase();
        if (thickness === "pencil") {
            return 1.0;
        } else if (thickness === "pen") {
            return 2.0;
        } else if (thickness === "marker") {
            return 4.0;
        } else if (thickness === "brush") {
            return 10.0;
        } else {
            return 0.0;
        }
    };

    Config.prototype.getDefaultBrushThickness = function () {
        return this.getThickness("defaultBrushThickness");
    };

    Config.prototype.getDefaultOutlineThickness = function () {
        return this.getThickness("defaultOutlineThickness");
    };

    Config.prototype.getDefaultArrowSize = function () {
        var size;
        size = ("" + this.options["defaultArrowHeadSize"]).toLowerCase();
        if (size === "tiny") {
            return 10.0;
        } else if (size === "small") {
            return 15.0;
        } else if (size === "medium") {
            return 20.0;
        } else if (size === "large") {
            return 30.0;
        } else {
            return 0.0;
        }
    };

    Config.prototype.getImageUrl = function (icon) {
        return this.imageFolder + icon;
    };
    /*
    Zwibbler
    
    Copyright 2013 Hanov Solutions Inc. All Rights Reserved. This software is
    NOT open source. For licensing information, contact the author.
    
    steve.hanov@gmail.com
    //#include <log.js>
    */
    /*
    A transaction is a list of user actions that, when placed on the Undo stack, 
    should be undone and redone as a group. 
    */
    /**
    @constructor
    */
    /**
    * @constructor
    */
    var Transaction = function (parentid, actions, base, data) {
        this.parentid = parentid;
        this.actions = actions;
        this.base = base;
        this.id = "-1";
    };

    Transaction.prototype.log = log.create("TRANS", true);
    /** @return {string} */
    Transaction.prototype.getId = function () {
        return this.id;
    };
    /** @return {string} */
    Transaction.prototype.getParentId = function () {
        return this.parentid;
    };
    Transaction.prototype.rename = function (replacer) {
        var action, _i, _len, _ref;
        _ref = this.actions;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            action = _ref[_i];
            action.rename(replacer);
        }
    }; ;
    /*
    Zwibbler
    
    Copyright 2013 Hanov Solutions Inc. All Rights Reserved. This software is
    NOT open source. For licensing information, contact the author.
    
    steve.hanov@gmail.com
    */
    //#include <log.js>

    /*
    These implement the segments that make up a PathNode.
    */

    /** @constructor */
    function MoveSegment(previous, to) {
        this.init(previous, to);
    }

    MoveSegment.prototype = {
        init: function (previous, to) {
            this.to = to;
        },

        draw: function (ctx) {
            ctx.moveTo(this.to.x, this.to.y);
        },

        drawControls: function (ctx) {

        },

        outline: function (points, error) {
            points.push(this.to);
        },

        startSlope: function () {
            return null;
        },

        endSlope: function () {
            return {
                x: 1.0, y: 0.0
            };
        }
    };

    function DrawSegmentControls(ctx, segment) {
        // if there are two controls and a previous
        if (segment.previous && segment.control1 && segment.control2) {
            ctx.moveTo(segment.previous.to.x, segment.previous.to.y);
            ctx.lineTo(segment.control1.x, segment.control1.y);
            ctx.moveTo(segment.to.x, segment.to.y);
            ctx.lineTo(segment.control2.x, segment.control2.y);
        }
    }

    /** @constructor */
    function LineSegment(previous, to, randomSequence, sloppiness) {
        this.init(previous, to, randomSequence, sloppiness);
    }

    LineSegment.prototype = {
        init: function (previous, to, randomSeq, sloppiness) {
            this.to = to;
            this.previous = previous;

            var length = CalcLineLength(
                    this.previous.to.x,
                    this.previous.to.y,
                    this.to.x,
                    this.to.y);

            // This offset determines how sloppy the line is drawn. It depends on the 
            // length, but maxes out at 10.
            var offset = length / 10 * sloppiness;
            if (offset > 10) {
                offset = 10;
            }

            var r1 = randomSeq.next();
            var r2 = randomSeq.next();
            var r3 = randomSeq.next();

            // Overshoot the destination a little, as one might if drawing with a pen.
            this.to.x = this.to.x + sloppiness * r1 * offset / 4;
            this.to.y = this.to.y + sloppiness * r2 * offset / 4;

            var t1X = this.previous.to.x;
            var t1Y = this.previous.to.y;
            var t2X = this.to.x;
            var t2Y = this.to.y;

            // t1 and t2 are coordinates of a line shifted under or to the right of 
            // our original.
            t1X += offset;
            t2X += offset;
            t1Y += offset;
            t2Y += offset;

            // create a control point at random along our shifted line.
            this.control1 = new Point(t1X + r2 * (t2X - t1X),
                                       t1Y + r2 * (t2Y - t1Y));

            // now make t1 and t2 the coordinates of our line shifted above 
            // and to the left of the original.

            t1X = this.previous.to.x - offset;
            t2X = this.to.x - offset;
            t1Y = this.previous.to.y - offset;
            t2Y = this.to.y - offset;

            // create a second control point at random along the shifted line.
            this.control2 = new Point(
                t1X + r3 * (t2X - t1X),
                t1Y + r3 * (t2Y - t1Y));
        },

        draw: function (ctx) {
            ctx.bezierCurveTo(this.control1.x, this.control1.y,
                    this.control2.x, this.control2.y,
                    this.to.x, this.to.y);
        },

        drawControls: function (ctx) {
            DrawSegmentControls(ctx, this);
        },

        outline: function (points, error) {
            bezier(points,
                    this.previous.to.x, this.previous.to.y,
                    this.control1.x, this.control1.y,
                    this.control2.x, this.control2.y,
                    this.to.x, this.to.y, error);
        },

        startSlope: function () {
            if (this.previous) {
                return CreateVector(this.previous.to.x, this.previous.to.y,
                        this.control1.x, this.control1.y);
            } else {
                return null;
            }
        },

        endSlope: function () {
            return CreateVector(this.control2.x, this.control2.y,
                    this.to.x, this.to.y);
        }

    };

    /** @constructor */
    function CurveSegment(previous, to, smoothness) {
        this.init(previous, to, smoothness);
    }

    CurveSegment.prototype = {
        init: function (previous, to, smoothness) {
            this.to = to;
            this.previous = previous;
            this.smoothness = smoothness;

            var length = CalcLineLength(previous.to.x, previous.to.y, to.x, to.y);

            if (!length) {
                length = 1;
            }

            var vx = (to.x - previous.to.x) / length;
            var vy = (to.y - previous.to.y) / length;

            this.control2 = new Point(
                    to.x - length * smoothness * vx,
                    to.y - length * smoothness * vy);

            var pcontrol2 = previous.control2;

            if (pcontrol2) {
                var slope = CreateVector(previous.previous.to.x,
                        previous.previous.to.y,
                        previous.to.x,
                        previous.to.y);
                var plength = CalcLineLength(previous.previous.to.x,
                        previous.previous.to.y,
                        previous.to.x,
                        previous.to.y);

                vx = (vx + slope.x) * 0.5;
                vy = (vy + slope.y) * 0.5;

                pcontrol2.x = previous.to.x - plength * smoothness * vx;
                pcontrol2.y = previous.to.y - plength * smoothness * vy;
            }

            this.control1 = new Point(
                previous.to.x + length * smoothness * vx,
                previous.to.y + length * smoothness * vy);
            this.length = length;
        },

        setPrevious: function (previous) {
            this.previous = previous;
            var pcontrol2 = previous.control2;

            var vx = (this.to.x - previous.to.x) / this.length;
            var vy = (this.to.y - previous.to.y) / this.length;
            var smoothness = this.smoothness;

            if (pcontrol2) {
                var slope = CreateVector(previous.previous.to.x,
                        previous.previous.to.y,
                        previous.to.x,
                        previous.to.y);
                var plength = CalcLineLength(previous.previous.to.x,
                        previous.previous.to.y,
                        previous.to.x,
                        previous.to.y);

                vx = (vx + slope.x) * 0.5;
                vy = (vy + slope.y) * 0.5;

                pcontrol2.x = previous.to.x - plength * smoothness * vx;
                pcontrol2.y = previous.to.y - plength * smoothness * vy;
            }

            this.control1 = new Point(
                previous.to.x + this.length * smoothness * vx,
                previous.to.y + this.length * smoothness * vy);
        },

        draw: function (ctx) {
            ctx.bezierCurveTo(this.control1.x, this.control1.y,
                    this.control2.x, this.control2.y,
                    this.to.x, this.to.y);
        },

        drawControls: function (ctx) {
            DrawSegmentControls(ctx, this);
        },

        outline: function (points, error) {
            bezier(points,
                    this.previous.to.x, this.previous.to.y,
                    this.control1.x, this.control1.y,
                    this.control2.x, this.control2.y,
                    this.to.x, this.to.y, error);
        },

        startSlope: function () {
            if (this.previous) {
                return CreateVector(this.previous.to.x, this.previous.to.y,
                        this.control1.x, this.control1.y);
            } else {
                return null;
            }
        },

        endSlope: function () {
            return CreateVector(this.control2.x, this.control2.y,
                    this.to.x, this.to.y);
        }

    };

    /** @constructor */
    function QuadraticSegment(previous, control, to) {
        this.init(previous, control, to);
    }

    QuadraticSegment.prototype = {
        init: function (previous, control, to) {
            this.control = control;
            this.to = to;
        },

        draw: function (ctx) {
            ctx.quadraticCurveTo(this.control.x, this.control.y, this.to.x, this.to.y);
        },

        drawControls: function (ctx) {
            DrawSegmentControls(ctx, this);
        },

        outline: function (points, error) {
            points.push(this.control);
            points.push(this.to);
        },

        startSlope: function () {
            if (this.previous) {
                return CreateVector(this.previous.to.x, this.previous.to.y,
                        this.control.x, this.control.y);
            } else {
                return null;
            }
        },


        endSlope: function () {
            return CreateVector(this.control.x, this.control.y,
                    this.to.x, this.to.y);
        }
    };

    /** @constructor */
    function ArcSegment(previous, control, to, radius) {
        this.init(previous, control, to, radius);
    }

    ArcSegment.prototype = {
        init: function (previous, control, to, radius) {
            this.control = control;
            this.to = to;
            this.radius = radius;
        },

        draw: function (ctx) {
            ctx.arcTo(this.control.x, this.control.y, this.to.x, this.to.y,
                    this.radius);
        },

        drawControls: function (ctx) {
            DrawSegmentControls(ctx, this);
        },

        outline: function (points, error) {
            points.push(this.control);
            points.push(this.to);
        }
    };

    /** @constructor */
    function BezierSegment(previous, control1, control2, to) {
        this.init(previous, control1, control2, to);
    }

    BezierSegment.prototype = {
        init: function (previous, control1, control2, to) {
            this.control1 = control1;
            this.control2 = control2;
            this.to = to;
            this.previous = previous;
        },

        draw: function (ctx) {
            ctx.bezierCurveTo(this.control1.x, this.control1.y,
                    this.control2.x, this.control2.y,
                    this.to.x, this.to.y);
        },

        drawControls: function (ctx) {
            DrawSegmentControls(ctx, this);
        },

        outline: function (points, error) {
            bezier(points,
                    this.previous.to.x, this.previous.to.y,
                    this.control1.x, this.control1.y,
                    this.control2.x, this.control2.y,
                    this.to.x, this.to.y, error);
        },

        startSlope: function () {
            if (this.previous) {
                return CreateVector(this.previous.to.x, this.previous.to.y,
                        this.control1.x, this.control1.y);
            } else {
                return null;
            }
        },

        endSlope: function () {
            return CreateVector(this.control2.x, this.control2.y,
                    this.to.x, this.to.y);
        }
    };

    /** @constructor */
    function CornerSegment(previous, corner, to, randomSequence, sloppiness) {
        this.init(previous, corner, to, randomSequence, sloppiness);
    }


    CornerSegment.prototype = {
        log: log.create("SEGMENT"),
        init: function (previous, corner, to, randomSequence, sloppiness) {
            var KAPPA = 0.5522847498;
            this.previous = previous;

            sloppiness = sloppiness * 2;

            var r1 = randomSequence.next() * 2 - 1;
            var r2 = randomSequence.next() * 2 - 1;

            // place first control point
            var slope = this.previous.endSlope();
            if (slope) {
                var radius = CalcLineLength(
                        previous.to.x, previous.to.y,
                        corner.x, corner.y);

                this.control1 = new Point(
                        previous.to.x + slope.x * KAPPA * radius,
                        previous.to.y + slope.y * KAPPA * radius);
            } else {
                this.control1 = new Point(
                        previous.to.x + KAPPA * (corner.x - previous.to.x),
                        previous.to.y + KAPPA * (corner.y - previous.to.y));
            }

            // place second control point
            this.control2 = new Point(
                to.x - KAPPA * (to.x - corner.x) * (1.0 - r1 * sloppiness),
                to.y - KAPPA * (to.y - corner.y) * (1.0 - r2 * sloppiness));
            this.to = to;
        },

        draw: function (ctx) {
            ctx.bezierCurveTo(this.control1.x, this.control1.y,
                    this.control2.x, this.control2.y,
                    this.to.x, this.to.y);
        },

        drawControls: function (ctx) {
            DrawSegmentControls(ctx, this);
        },

        outline: function (points, error) {
            bezier(points,
                    this.previous.to.x, this.previous.to.y,
                    this.control1.x, this.control1.y,
                    this.control2.x, this.control2.y,
                    this.to.x, this.to.y, error);
        },

        startSlope: function () {
            if (this.previous) {
                return CreateVector(this.previous.to.x, this.previous.to.y,
                        this.control1.x, this.control1.y);
            } else {
                return null;
            }
        },

        endSlope: function () {
            return CreateVector(this.control2.x, this.control2.y,
                    this.to.x, this.to.y);
        }
    };
    /*
    Zwibbler
    
    Copyright 2013 Hanov Solutions Inc. All Rights Reserved. This software is
    NOT open source. For licensing information, contact the author.
    
    steve.hanov@gmail.com
    */

    //#include <log.js>

    /** @constructor 
    This behaviour is invoked when the user holds down the mouse button on an
    empty area of the screen. As the mouse moves, a square is highlighted. When
    the user releases the mouse, everything inside the square is selected.
    */
    function SelectBoxBehaviour(view, previousBehaviour, x, y) {
        this.view = view;
        this.dx = 0;
        this.dy = 0;
        this.dragging = false;
        this.previousBehaviour = previousBehaviour;
        this.onMouseDown(x, y);
    }

    SelectBoxBehaviour.prototype = {

        log: log.create("SelectBehaviour"),

        onTouch: function (e) {
            var pt;
            if (e.type === "touchmove") {
                pt = this.view.touchPoint(e.changedTouches[0]);
                this.onMouseMove(pt.x, pt.y);
            } else if (e.type === "touchend") {
                pt = this.view.touchPoint(e.changedTouches[0]);
                this.onMouseUp(pt.x, pt.y);
            }

        },

        onMouseDown: function (x, y) {
            this.dx = x;
            this.dy = y;
            this.dragging = true;
        },

        onMouseMove: function (x, y) {
            if (this.dragging) {
                var ctx = this.view.ctx;
                this.view.draw();
                ctx.save();
                ctx.strokeStyle = "#0050B7";
                ctx.lineWidth = 2.0 / this.view.scale;
                ctx.fillStyle = "rgba(0, 80, 183, 0.2)";

                // Use a rectangle object which corrects negative width/height.
                // Opera cares about that.
                var rect = new Rectangle(this.dx + 0.5, this.dy + 0.5,
                    x - this.dx, y - this.dy);
                ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
                ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);
                ctx.restore();
            }
        },

        onMouseUp: function (x, y) {
            this.dragging = false;

            this.view.clearSelection();
            this.view.selectByRect(new Rectangle(this.dx, this.dy, x - this.dx, y -
                        this.dy));

            this.view.doneSelecting();

            this.view.draw();
            this.view.behaviour = this.previousBehaviour;
        }
    };
    /*
    Zwibbler
    
    Copyright 2013 Hanov Solutions Inc. All Rights Reserved. This software is
    NOT open source. For licensing information, contact the author.
    
    steve.hanov@gmail.com
    //#include <log.js>
    */
    /*
    This is the context object that is accessible from the API for licensed
    users. It enforces separation between internal Zwibbler functions and the
    external API.
    */
    /**
    * @constructor
    */
    var ZwibblerContext = function (app) {
        this.app = app;
        //hack to allow access to internals.
        this["app"] = app;
        this.events = {};
        this.app.setZwibblerContext(this);
        this.id = "" + ZwibblerContext.nextId;
        ZwibblerContext.nextId += 1;
    };

    ZwibblerContext.nextId = 0;

    //@export ZwibblerContext.prototype.enableConsoleLogging
    ZwibblerContext.prototype.enableConsoleLogging = function () {
        log.enableConsole();
    };

    /** @param {string} name
    @param {...*} var_args
    */
    ZwibblerContext.prototype.emit = function (name, var_args) {
        var args;
        if (!this.events) {
            this.events = {};
        }
        args = Array.prototype.slice.call(arguments, 1);
        setTimeout(__bind(function () {
            var fn, _i, _len, _ref;
            if (name in this.events) {
                _ref = this.events[name];
                for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                    fn = _ref[_i];
                    fn.apply(null, args);
                }
            }
        }, this), 0);
        return this;
    };
    /** @export ZwibblerContext.prototype.on */
    ZwibblerContext.prototype.on = function (name, fn) {
        if (name in this.events) {
            this.events[name].push(fn);
        } else {
            this.events[name] = [fn];
        }
        return this;
    };
    /** @export ZwibblerContext.prototype.newDocument */
    ZwibblerContext.prototype.newDocument = function () {
        return this.app.newDocument();
    };

    /** @export ZwibblerContext.prototype.isValid */
    ZwibblerContext.prototype.isValid = function () {

        //could have used this.app.view.doc.getNextId() but it is not tracking the deleted nodes
        var docNodes = this.app.view.doc.nodes;
        var nitems = 0;
        for (var p in docNodes) {
            if (docNodes.hasOwnProperty(p) && docNodes[p].type() !== "GroupNode" && docNodes[p].type() !== "ImageNode") {
                ++nitems;
            }
            if (nitems > 0) {
                return true; //true if we have an user created node
            }
        }

        return false;
    };

    /** @export ZwibblerContext.prototype.getResponseXml */
    ZwibblerContext.prototype.getResponseXml = function () {        
        return this.save('xml');
    };

    /** @export ZwibblerContext.prototype.setResponseXml */
    ZwibblerContext.prototype.setResponseXml = function (contents) {
        return this.load('xml', contents);
    };

    /** @export ZwibblerContext.prototype.save */
    ZwibblerContext.prototype.save = function (format) {
        if (format === "list") {
            return this.app.saveAsList();
        } else if (format === "png") {
            return this.app.saveAsDataUrl();
        } else if (format === "zwibbler3" || arguments.length === 0) {
            return this.app.view.doc.save("zwibbler3");
        } else if (format === "xml") {
            return this.app.view.doc.getResponseXml();
        } else {
            return "Unsupported format: " + format;
        }
    };

    /** @export ZwibblerContext.prototype.load */
    ZwibblerContext.prototype.load = function (format, data) {
        if (format === "list") {
            return this.app.loadFromList(data);
        } else if (format === "xml") {
            //remove eq containers            
            //$(request.canvas.parentNode.parentNode).find('div.sp_toolbar_container')[0]
            var eqParent = this.app.canvasContainer[0];
            var eqItems = YAHOO.util.Dom.getElementsByClassName('mje_container', 'div', eqParent);
            for (var i = 0; i < eqItems.length; i++) {
                eqParent.removeChild(eqItems[i]);
            }

            this.app.newDocument();
            this.app.setBackgroundImageFromConfig();
            return this.app.loadFromList(this.app.view.doc.processResponseXml(data));
        } else {
            return this.app.setDocument(ZwibblerDocument.load(data));
        }
    };

    /** @export ZwibblerContext.prototype.setBackgroundBrowserImages */
    ZwibblerContext.prototype.setBackgroundBrowserImages = function (urls) {
        return this.app.setBackgroundImageList(urls);
    };
    /** @export ZwibblerContext.prototype.setIconBrowserImages */
    ZwibblerContext.prototype.setIconBrowserImages = function (urls) {
        return this.app.setIconBrowserList(urls);
    };
    /** @export ZwibblerContext.prototype.resize */
    ZwibblerContext.prototype.resize = function () {
        return this.app._onResize();
    };
    /** @export ZwibblerContext.prototype.dirty */
    ZwibblerContext.prototype.dirty = function () {
        if (arguments.length === 1 && arguments[0] === false) {
            this.app.view.doc.markClean();
        }
        return this.app.view.doc.dirty();
    };
    /** @export ZwibblerContext.prototype.setItemProperty */
    ZwibblerContext.prototype.setItemProperty = function (id, property, value) {
        this.app.setItemProperty(id, property, value);
    };

    /** @export ZwibblerContext.prototype.setImage */
    ZwibblerContext.prototype.setImage = function (id, img) {
        // sets the image of a mathml node to a rendered DOM image.
        var doc = this.app.view.doc;
        var view = this.app.view;

        var node = doc.getNode(id, true);
        if (node.type() !== "MathNode") {
            this.log("setImage() error: node %s is of type %s", id, node.type());
            return;
        }

        node.setImage(img);
        view.update();
    };

    /** @export ZwibblerContext.prototype.getItemProperty */
    ZwibblerContext.prototype.getItemProperty = function (id, property) {
        return this.app.getItemProperty(id, property);
    };


    /** 
    In response to a convert-dom-request, set the dom element of the given node
    id.
    @export ZwibblerContext.prototype.setDomElement
    */
    ZwibblerContext.prototype.setDomElement = function (nodeid, element) {
        var node = this.app.view.doc.getNode(nodeid);

        // The node must exist and be a DomNode.
        if (!node) {
            this.error("setDomElement: Node %s does not exist", nodeid);
        }

        if (node.type() !== "DomNode") {
            this.error("setDomElement: Node %s is not a DomNode. It is %s", nodeid,
                    node.type());
        }

        node.setElement(element);
    };

    /**
    When an API error happens, report it.
    @param {string} formatString
    @param {...*} var_args
    */
    ZwibblerContext.prototype.error = function (formatString, var_args) {
        var parts = arguments[0].split("%s");
        var message = [];
        for (var i = 0; i < parts.length; i++) {
            message.push(parts[i]);
            if (i < parts.length - 1) {
                message.push(JSON.stringify(arguments[i + 1]));
            }
        }

        this.log(message.join(""));

        throw {
            "message": message,

            "toString": function () {
                return message;
            }
        };
    };

    /**
    Sets the unique id for this instance of scratchpad to one of your choosing,
    if desired.
    
    @export ZwibblerContext.prototype.getInstanceId
    */
    ZwibblerContext.prototype.setInstanceId = function (id) {
        this.id = id;
    };

    /**
    Returns a unique id for this instance of scratchpad.
    @return {string}
    
    @export ZwibblerContext.prototype.getInstanceId
    */
    ZwibblerContext.prototype.getInstanceId = function () {
        return this.id;
    };

    ZwibblerContext.prototype.isReadOnly = function () { return false; }

    /*
    #include <log.js>
    */
    var Cookies;
    Cookies = {
        log: log.create("Cookies"),
        /** @param {number=} secondsValid */
        set: function (name, value, secondsValid) {
            var date, str;
            if (secondsValid == null) {
                secondsValid = 365 * 24 * 60 * 60;
            }
            date = new Date();
            date.setTime(date.getTime() + (secondsValid * 1000));
            name = encodeURIComponent(name);
            value = encodeURIComponent(value);
            str = "" + name + "=" + value + "; expires=" + (date.toGMTString()) + "; path=/";
            Cookies.log("Set document.cookie=%s", str);
            document.cookie = str;
        },
        get: function (name) {
            var cookie, i, _i, _len, _ref;
            name = encodeURIComponent(name);
            _ref = document.cookie.split(';');
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                cookie = _ref[_i];
                i = 0;
                while (i < cookie.length && cookie[i] === ' ') {
                    i += 1;
                }
                if (cookie.indexOf(name + "=") === i) {
                    return decodeURIComponent(cookie.substr(i + name.length + 1));
                }
            }
            return null;
        },
        remove: function (name) {
            return Cookies.set(name, "", -1);
        },
        test: function () {
            Cookies.set("steve", "blah blah");
            Cookies.set("alice", "wife");
            Cookies.log("Steve=%s", Cookies.get("steve"));
            Cookies.log("Alice=%s", Cookies.get("alice"));
            Cookies.remove("steve");
            return Cookies.log("Steve=%s", Cookies.get("steve"));
        }
    };
    /*
    The EventEmitter is inspired by the node.js API. It lets you bind handler
    functions to certain named events. When the event occurs, all the handlers for
    it are called.
    */
    /**
    * @constructor
    */
    var EventEmitter = function () {
        this.events = {};
        this.nolog = false;
    };

    EventEmitter.prototype.log = log.create("EventEmitter");
    /** @param {string} name
    @param {...*} var_args
    */
    EventEmitter.prototype.emit = function (name, var_args) {
        var args;
        if (!this.events) {
            this.events = {};
        }
        args = Array.prototype.slice.call(arguments, 1);
        setTimeout(__bind(function () {
            var fn, _i, _len, _ref;
            if (name in this.events) {
                _ref = this.events[name];
                for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                    fn = _ref[_i];
                    if (!this.nolog) {
                        this.log("Emit %s", name);
                    }
                    fn.apply(null, args);
                }
            }
        }, this), 0);
        return this;
    };

    /** @param {string} name
    @param {...*} var_args
    
    This is like emit but calls the functions immediately.
    */
    EventEmitter.prototype.emitNow = function (name, var_args) {
        var args;
        if (!this.events) {
            this.events = {};
        }
        args = Array.prototype.slice.call(arguments, 1);
        var fn, _i, _len, _ref;
        if (name in this.events) {
            _ref = this.events[name];
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                fn = _ref[_i];
                if (!this.nolog) {
                    this.log("Emit %s", name);
                }
                fn.apply(null, args);
            }
        }
        return this;
    };
    EventEmitter.prototype.on = function (name, fn) {
        if (!this.events) {
            this.events = {};
        }
        this.bind(name, fn);
        return this;
    };
    EventEmitter.prototype.bind = function (name, fn) {
        if (name in this.events) {
            this.events[name].push(fn);
        } else {
            this.events[name] = [fn];
        }
        return fn;
    };
    EventEmitter.prototype.unbind = function (name, fn) {
        var arr, i, _ref;
        if (name in this.events) {
            arr = this.events[name];
            for (i = 0, _ref = arr.length - 1; i <= _ref; i += 1) {
                if (arr[i] === fn) {
                    arr.splice(i, 1);
                    break;
                }
            }
        }
    };
    EventEmitter.prototype.joinEvents = function (emitter) {
        var key;
        if (emitter.events === this.events) {
            return;
        }
        for (key in emitter.events) {
            if (key in this.events) {
                this.events[key] = this.events[key].concat(emitter.events[key]);
            } else {
                this.events[key] = emitter.events[key];
            }
        }
        emitter.events = this.events;
    };
    /**
    * @constructor
    */
    var Menu = function () {
        this.items = [];
    };

    /** @param {*=} eventData */
    Menu.prototype.addItem = function (display, event, eventData) {
        return this.items.push({
            type: "normal",
            display: display,
            event: event,
            eventData: eventData
        });
    };
    Menu.prototype.addSeparator = function () {
        return this.items.push({
            type: "separator"
        });
    };
    Menu.prototype.addSubmenu = function (display, menu) {
        return this.items.push({
            type: "menu",
            display: display,
            menu: menu
        });
    }; ;
    function SplitQueryString(b) {
        var a = {};

        var c = b.split("#");
        var fields = c[c.length - 1].split("&");

        for (var f = 0; f < fields.length; f++) {
            var i = fields[f].split("=");

            if (i[0]) {

                try {
                    if (i.length > 1) {
                        i[1] = i[1].replace(/\+/g, " ");
                        if (window.decodeURIComponent) {
                            a[i[0]] = decodeURIComponent(i[1]);
                        } else {
                            a[i[0]] = unescape(i[1]);
                        }
                    } else {
                        a[i[0]] = "";
                    }
                } catch (except) {

                }

            }
        }

        return a;
    }
    /**
    @param {number} length
    @return {string}
    */
    var RandomString = function (length) {
        var digits =
            "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz01234567890";
        var usernameChars = [];
        for (var i = 0; i < length; i++) {
            usernameChars.push(digits[Math.floor(Math.random() * digits.length)]);
        }

        return usernameChars.join("");
    };

    if (typeof module === "object") {
        exports.RandomString = RandomString;
    }
    function Inherit(base, child) {
        for (var key in base) {
            if (base.hasOwnProperty(key) && !child.hasOwnProperty(key)) {
                child[key] = base[key];
            }
        }
    }
    /*
    Copyright 2010 Hanov Solutions Inc. All Rights Reserved
    
    steve.hanov@gmail.com
    */
    /*jslint sub: true */

    //#include <Inherit.js>

    /** 
    @constructor 
    @param {number} x    
    @param {number} y    
    */
    function Point(x, y) {
        this.x = x;
        this.y = y;
    }

    Point.prototype.distanceTo = function (point) {
        return Math.sqrt((point.x - this.x) * (point.x - this.x) +
                          (point.y - this.y) * (point.y - this.y));
    };

    Point.prototype.toString = function () {
        return "(" + this.x + ", " + this.y + ")";
    };

    /** @constructor 
    @param {number} width
    @param {number} height
    */
    function Size(width, height) {
        this.width = width;
        this.height = height;
    }

    /**
    @param {number} x1
    @param {number} y1
    @param {number} x2
    @param {number} y2
    */
    function CalcLineLength(x1, y1, x2, y2) {
        return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
    }

    function CreateVector(x1, y1, x2, y2) {
        var len = CalcLineLength(x1, y1, x2, y2);
        if (len === 0) {
            return {
                x: 1.0, y: 0.0
            };
        }
        return {
            x: (x2 - x1) / len,
            y: (y2 - y1) / len
        };
    }

    /** @param {Array.<{x: number, y: number}>} points */
    function CalculateCentroid(points) {
        if (points.length === 0) {
            return new Point(0, 0);
        }

        var x = points[0].x;
        var y = points[0].y;
        for (var i = 1; i < points.length; i++) {
            x += points[i].x;
            y += points[i].y;
        }

        return new Point(x / points.length, y / points.length);
    }

    /** @constructor 
    @param {number} x
    @param {number} y
    @param {number} w
    @param {number} h
    */
    function Rectangle(x, y, w, h) {
        this.x = x;
        this.y = y;
        this.width = w;
        this.height = h;
        this.repair();
    }

    Rectangle.load = function (s) {
        return new Rectangle(s["x"], s["y"], s["width"], s["height"]);
    };

    /** @param {Array.<{x: number, y: number}>} points */
    Rectangle.CreateBoundingBox = function (points) {
        if (points.length === 0) {
            return new Rectangle(0, 0, 0, 0);
        }

        var minX = points[0].x;
        var maxX = points[0].x;
        var minY = points[0].y;
        var maxY = points[0].y;

        for (var i = 1; i < points.length; i++) {
            if (points[i].x < minX) {
                minX = points[i].x;
            }

            if (points[i].x > maxX) {
                maxX = points[i].x;
            }

            if (points[i].y < minY) {
                minY = points[i].y;
            }

            if (points[i].y > maxY) {
                maxY = points[i].y;
            }
        }

        return new Rectangle(minX, minY, maxX - minX, maxY - minY);
    };

    Rectangle.prototype = {

        save: function () {
            return { "x": this.x, "y": this.y, "width": this.width, "height": this.height };
        },

        clone: function () {
            return new Rectangle(this.x, this.y, this.width, this.height);
        },

        union: function (other) {
            if (other.x < this.x) {
                this.width += this.x - other.x;
                this.x = other.x;
            }
            if (other.y < this.y) {
                this.height += this.y - other.y;
                this.y = other.y;
            }

            if (other.x + other.width > this.x + this.width) {
                this.width += other.x + other.width - this.x - this.width;
            }

            if (other.y + other.height > this.y + this.height) {
                this.height += other.y + other.height - this.y - this.height;
            }
        },

        unionPoint: function (x, y) {
            if (x < this.x) {
                this.width += this.x - x;
                this.x = x;
            } else if (x > this.x + this.width) {
                this.width = x - this.x;
            }

            if (y < this.y) {
                this.height += this.y - y;
                this.y = y;
            } else if (y > this.y + this.height) {
                this.height = y - this.y;
            }
        },

        contains: function (other) {
            return this.x <= other.x &&
                   this.x + this.width > other.x + other.width &&
                   this.y <= other.y &&
                   this.y + this.height > other.y + other.height;
        },

        containsPoint: function (x, y) {
            return this.x <= x && this.x + this.width > x &&
                   this.y <= y && this.y + this.height > y;
        },

        repair: function () {
            if (this.width < 0) {
                this.x += this.width;
                this.width = -this.width;
            }

            if (this.height < 0) {
                this.y += this.height;
                this.height = -this.height;
            }
        },

        inflate: function (dx, dy) {
            this.x -= dx / 2;
            this.y -= dy / 2;
            this.width += dx;
            this.height += dy;
        },

        transform: function (matrix) {
            var tl, tr, bl, br;
            tl = matrix.apply(this.x, this.y);
            tr = matrix.apply(this.x + this.width, this.y);
            br = matrix.apply(this.x + this.width, this.y + this.height);
            bl = matrix.apply(this.x, this.y + this.height);
            this.x = Math.min(tl.x, tr.x, br.x, bl.x);
            this.y = Math.min(tl.y, tr.y, br.y, bl.y);
            this.width = Math.max(tl.x, tr.x, br.x, bl.x) - this.x;
            this.height = Math.max(tl.y, tr.y, br.y, bl.y) - this.y;
        },

        right: function () {
            return this.x + this.width;
        },

        bottom: function () {
            return this.y + this.height;
        },

        centre: function () {
            return new Point(this.x + this.width / 2, this.y + this.height / 2);
        }

    };

    function Clone(obj) {
        var copy;
        if (obj instanceof Function) {
            return obj;
        } else if (obj instanceof Array) {
            copy = obj.concat();
        } else if (obj instanceof Object) {
            copy = {};
            for (var prop in obj) {
                if (1) {
                    copy[prop] = Clone(obj[prop]);
                }
            }
        } else {
            copy = obj;
        }

        return copy;
    }

    /** @constructor
    @param {...*} var_args
    */
    function Matrix(var_args) {
        if (arguments.length === 0) {
            this.m11 = 1;
            this.m12 = 0;
            this.m21 = 0;
            this.m22 = 1;
            this.dx = 0;
            this.dy = 0;
        } else if (arguments.length === 1) {
            if (arguments[0].length !== 6) {
                throw "Bad array initializer for Matrix.";
            }
            this.m11 = arguments[0][0];
            this.m12 = arguments[0][1];
            this.m21 = arguments[0][2];
            this.m22 = arguments[0][3];
            this.dx = arguments[0][4];
            this.dy = arguments[0][5];
        } else if (arguments.length === 6) {
            this.m11 = arguments[0];
            this.m12 = arguments[1];
            this.m21 = arguments[2];
            this.m22 = arguments[3];
            this.dx = arguments[4];
            this.dy = arguments[5];
        } else {
            throw "Bad initializer for Matrix.";
        }
    }

    Matrix.prototype.toString = function () {
        return "[ " + this.m11 + " " + this.m12 + " " + this.dx + "\n" +
               "   " + this.m21 + " " + this.m22 + " " + this.dy + "\n" +
               "   0 0 1 ]";
    };

    Matrix.prototype.toArray = function () {
        return [this.m11, this.m12, this.m21, this.m22, this.dx, this.dy];
    };

    Matrix.prototype.toCssTransformString = function () {
        return 'matrix(' + [this.m11, this.m21, this.m12, this.m22, this.dx, this.dy].join(', ') + ')';
    };

    Matrix.prototype._class = "Matrix";

    /**
    @return {boolean}
    */
    Matrix.prototype.isIdentity = function () {
        return this.m11 === 1 &&
               this.m12 === 0 &&
               this.m21 === 0 &&
               this.m22 === 1 &&
               this.dx === 0 &&
               this.dy === 0;
    };

    /**
    @param {Matrix} o
    @return {Matrix}
    */
    Matrix.prototype.multiply = function (o) {
        var m = new Matrix();
        m.m11 = this.m11 * o.m11 + this.m12 * o.m21;
        m.m21 = this.m21 * o.m11 + this.m22 * o.m21;
        m.m12 = this.m11 * o.m12 + this.m12 * o.m22;
        m.m22 = this.m21 * o.m12 + this.m22 * o.m22;
        m.dx = this.m11 * o.dx + this.m12 * o.dy + this.dx;
        m.dy = this.m21 * o.dx + this.m22 * o.dy + this.dy;

        //dbg.printf("[ %s %s %s ]\n", m.m11, m.m12, m.dx);
        //dbg.printf("[ %s %s %s ]\n", m.m21, m.m22, m.dy);
        //dbg.printf("[ %s %s %s ]\n\n", 0,0, 1);
        return m;
    };

    /**
    @param {number} x
    @param {number} y
    @return {Point}
    */
    Matrix.prototype.apply = function (x, y) {
        return new Point(this.m11 * x + this.m12 * y + this.dx,
                          this.m21 * x + this.m22 * y + this.dy);
    };

    /**
    @param {number} x
    @param {number} y
    @param {canvas context} ctx
    @return {Point}
    */
    Matrix.prototype.applyWRTContext = function (x, y, ctx) {
        var nudge = 10;
        if (this.m11 * x + this.dx < 0) {
            this.dx += nudge;
        } else if (this.m11 * x + this.dx > ctx.canvas.width) {
            this.dx -= nudge;
        } else if (this.m22 * y + this.dy < 0) {
            this.dy += nudge;
        } else if (this.m22 * y + this.dy > ctx.canvas.height) {
            this.dy -= nudge;
        }
        return new Point(this.m11 * x + this.m12 * y + this.dx,
                          this.m21 * x + this.m22 * y + this.dy);
    };

    /** 
    @return {Matrix}
    */
    Matrix.prototype.clone = function () {
        return new Matrix(this.m11,
                this.m12, this.m21, this.m22, this.dx, this.dy);
    };

    /**
    @return {Matrix}
    */
    Matrix.prototype.inverse = function () {
        var det = this.m11 * this.m22 -
                  this.m12 * this.m21;

        return new Matrix(
             this.m22 / det,
             -this.m12 / det,
             -this.m21 / det,
             this.m11 / det,
             (this.m12 * this.dy - this.dx * this.m22) / det,
             (this.dx * this.m21 - this.m11 * this.dy) / det
        );
    };

    /** 
    @constructor
    @extends Matrix
    @param {number} sx
    @param {number} sy
    @param {number=} ox
    @param {number=} oy
    */
    function ScaleMatrix(sx, sy, ox, oy) {
        //check for zero because in the inverse method, you divide by sx an sy.
        if (sx === 0) {
            sx = 0.1;
        }
        if (sy === 0) {
            sy = 0.1;
        }
        if (ox === undefined) {
            this.m11 = sx;
            this.m12 = 0;
            this.m21 = 0;
            this.m22 = sy;
            this.dx = 0;
            this.dy = 0;

            this.ox = 0;
            this.oy = 0;
        } else {
            this.m11 = sx;
            this.m12 = 0;
            this.m21 = 0;
            this.m22 = sy;
            this.dx = ox - sx * ox;
            this.dy = oy - sy * oy;

            this.ox = ox;
            this.oy = oy;
        }

        this.sx = sx;
        this.sy = sy;
    }

    /**
    @return {ScaleMatrix}
    */
    ScaleMatrix.prototype.inverse = function () {
        return new ScaleMatrix(1.0 / this.sx, 1.0 / this.sy, this.ox, this.oy);
    };

    Inherit(Matrix.prototype, ScaleMatrix.prototype);

    /** 
    @constructor 
    @extends Matrix
    @param {number} angle
    @param {number} x
    @param {number} y
    */
    function RotateMatrix(angle, x, y) {
        var cosa = Math.cos(angle);
        var sina = Math.sin(angle);

        this.m11 = cosa;
        this.m12 = sina;
        this.m21 = -sina;
        this.m22 = cosa;
        this.dx = -x * cosa - y * sina + x;
        this.dy = x * sina - y * cosa + y;

        this.angle = angle;
        this.x = x;
        this.y = y;
    }

    /**
    @return {RotateMatrix}
    */
    RotateMatrix.prototype.inverse = function () {
        return new RotateMatrix(-this.angle, this.x, this.y);
    };

    Inherit(Matrix.prototype, RotateMatrix.prototype);

    /** 
    @constructor
    @extends Matrix
    @param {number} dx
    @param {number} dy
    */
    function TranslateMatrix(dx, dy) {
        this.m11 = 1;
        this.m12 = 0;
        this.m21 = 0;
        this.m22 = 1;
        this.dx = dx;
        this.dy = dy;
    }

    /**
    @return {TranslateMatrix}
    */
    TranslateMatrix.prototype.inverse = function () {
        return new TranslateMatrix(-this.dx, -this.dy);
    };

    Inherit(Matrix.prototype, TranslateMatrix.prototype);

    /**
    max_error of 4 is good, 32 is rough
    */

    function recursive_bezier(points, x1, y1, x2, y2, x3, y3, x4, y4, max_error) {
        // http://www.antigrain.com/research/adaptive_bezier/index.html
        if (++recursive_bezier.depth > 8) {
            recursive_bezier.depth -= 1;
            return;
        }

        // Calculate all the mid-points of the line segments
        //----------------------
        var x12 = (x1 + x2) / 2;
        var y12 = (y1 + y2) / 2;
        var x23 = (x2 + x3) / 2;
        var y23 = (y2 + y3) / 2;
        var x34 = (x3 + x4) / 2;
        var y34 = (y3 + y4) / 2;
        var x123 = (x12 + x23) / 2;
        var y123 = (y12 + y23) / 2;
        var x234 = (x23 + x34) / 2;
        var y234 = (y23 + y34) / 2;
        var x1234 = (x123 + x234) / 2;
        var y1234 = (y123 + y234) / 2;

        // Try to approximate the full cubic curve by a single straight line
        //------------------
        var dx = x4 - x1;
        var dy = y4 - y1;

        var d2 = Math.abs(((x2 - x4) * dy - (y2 - y4) * dx));
        var d3 = Math.abs(((x3 - x4) * dy - (y3 - y4) * dx));

        if ((d2 + d3) * (d2 + d3) < max_error * (dx * dx + dy * dy)) {
            points.push(new Point(x1234, y1234));
            recursive_bezier.depth -= 1;
            return;
        }

        // Continue subdivision
        //----------------------
        recursive_bezier(points, x1, y1, x12, y12, x123, y123, x1234, y1234,
                max_error);
        recursive_bezier(points, x1234, y1234, x234, y234, x34, y34, x4, y4,
                max_error);
        recursive_bezier.depth -= 1;
    }

    recursive_bezier.depth = 0;


    function bezier(points, x1, y1, x2, y2, x3, y3, x4, y4, max_error) {
        if (x1 !== x4 && y1 !== y4) {
            recursive_bezier(points, x1, y1, x2, y2, x3, y3, x4, y4,
                    max_error * max_error);
        }
        points.push(new Point(x4, y4));
    }

    function PointInPolygon(poly, x, y, radius) {
        var xnew, ynew;
        var xold, yold;
        var x1, y1;
        var x2, y2;
        var i;
        var inside = 0;

        if (poly.length < 3) {
            return 0;
        }

        xold = poly[poly.length - 1].x;
        yold = poly[poly.length - 1].y;
        for (i = 0; i < poly.length; i++) {
            xnew = poly[i].x;
            ynew = poly[i].y;
            if (xnew > xold) {
                x1 = xold;
                x2 = xnew;
                y1 = yold;
                y2 = ynew;
            } else {
                x1 = xnew;
                x2 = xold;
                y1 = ynew;
                y2 = yold;
            }
            if ((xnew < x) === (x <= xold) &&
                  (y - y1) * (x2 - x1) < (y2 - y1) * (x - x1)) {
                inside = !inside;
            }
            xold = xnew;
            yold = ynew;
        }
        return (inside);
    }

    function PointNearPath(path, x3, y3, radius) {
        radius = radius * radius;
        for (var i = 1; i < path.length; i++) {
            var x1 = path[i - 1].x;
            var y1 = path[i - 1].y;
            var x2 = path[i].x;
            var y2 = path[i].y;

            var px = x2 - x1;
            var py = y2 - y1;

            var something = px * px + py * py;

            var u = ((x3 - x1) * px + (y3 - y1) * py) / something;

            if (u > 1) {
                u = 1;
            } else if (u < 0) {
                u = 0;
            }

            var x = x1 + u * px;
            var y = y1 + u * py;

            var dx = x - x3;
            var dy = y - y3;

            var dist = dx * dx + dy * dy;

            if (dist <= radius) {
                return true;
            }
        }

        return false;
    }

    /** @constructor */
    function ImageManipulator(imageData) {
        this.image = imageData;
    }

    ImageManipulator.prototype =
    {
        clear: function () {
            for (var i = 0; i < this.image.width * this.image.height * 4; i++) {
                this.image.data[i] = 0;
            }
        },

        getImageData: function () {
            return this.image;
        },

        width: function () {
            return this.image.width;
        },

        height: function () {
            return this.image.height;
        },

        get: function (x, y) {
            var i = this.image.width * y * 4 + x * 4;
            return (this.image.data[i]) |
                   (this.image.data[i + 1] << 8) |
                   (this.image.data[i + 2] << 16) |
                   (this.image.data[i + 3] << 24);
        },

        set: function (x, y, clr) {
            var i = this.image.width * y * 4 + x * 4;
            this.image.data[i] = (clr) & 0xff;
            this.image.data[i + 1] = (clr >> 8) & 0xff;
            this.image.data[i + 2] = (clr >> 16) & 0xff;
            this.image.data[i + 3] = (clr >> 24) & 0xff;
        },

        invertScanline: function (y, x1, x2) {

        }
    };

    /** @constructor */
    function BitmapImage(width, height) {
        this._width = width;
        this._height = height;
        this.data = [];
    }

    BitmapImage.prototype = {
        width: function () {
            return this._width;
        },

        height: function () {
            return this._height;
        },

        getImageData: function () {
            // create an image data object and fill it in
            var canvas = document.createElement("canvas");
            canvas.width = this._width;
            canvas.height = this._height;
            var context = canvas.getContext("2d");

            var image = context.getImageData(0, 0, this._width, this._height);
            var size = this._width * this._height;

            for (var i = 0; i < size; i++) {
                var clr = this.data[i] === true ? 255 : 0;
                image.data[i * 4] = clr;
                image.data[i * 4 + 1] = clr;
                image.data[i * 4 + 2] = clr;
                image.data[i * 4 + 3] = 255;
            }
            return image;
        },

        get: function (x, y) {
            return this.data[this._width * y + x] === true;
        },

        set: function (x, y, isSet) {
            this.data[this._width * y + x] = isSet;
        },

        invertScanline: function (y, x1, x2) {
            var start = this._width * y + x1;
            var end = this._width * y + x2;
            for (var i = start; i < end; i++) {
                this.data[i] = !this.data[i];
            }
        },

        findFirstOnPixel: function () {
            for (var i = 0; i < this.data.length - 1; i++) {
                if (this.data[i + 1]) {
                    return {
                        x: i % this._width,
                        y: Math.floor(i / this._width)
                    };
                }
            }
            return null;
        }
    };


    /** @constructor */
    function PathData() {
        this.closed = false;
        this.commands = [];
    }

    PathData.MOVE = 0;
    PathData.LINE = 1;
    PathData.BEZIER_CURVE = 2;
    PathData.CLOSE = 4;
    PathData.SizeOf = [
        3,
        3,
        7,
        1
    ];

    PathData.NumPoints = [
        1,
        1,
        3,
        0
    ];

    PathData.prototype =
    {
        save: function () {
            var s = {};
            s["strokeStyle"] = this.strokeStyle;
            s["fillStyle"] = this.fillStyle;
            s["lineWidth"] = this.lineWidth;
            s["d"] = this.commands.concat();
            return s;
        },

        load: function (s) {
            this.commands = s["d"];
            this.strokeStyle = s["strokeStyle"];
            this.fillStyle = s["fillStyle"];
            this.lineWidth = s["lineWidth"];
        },

        moveTo: function (x, y) {
            this.commands.push(PathData.MOVE, x, y);
        },

        lineTo: function (x, y) {
            this.commands.push(PathData.LINE, x, y);
        },

        bezierCurveTo: function (x2, y2, x3, y3, x4, y4) {
            this.commands.push(PathData.BEZIER_CURVE, x2, y2, x3, y3, x4, y4);
        },

        close: function () {
            this.commands.push(PathData.CLOSE);
        },

        draw: function (ctx) {
            var i = 0;
            while (i < this.commands.length) {
                switch (this.commands[i]) {
                    case PathData.MOVE:
                        ctx.moveTo(
                            this.commands[i + 1],
                            this.commands[i + 2]);
                        break;

                    case PathData.LINE:
                        ctx.lineTo(
                            this.commands[i + 1],
                            this.commands[i + 2]);
                        break;

                    case PathData.BEZIER_CURVE:
                        ctx.bezierCurveTo(
                            this.commands[i + 1],
                            this.commands[i + 2],
                            this.commands[i + 3],
                            this.commands[i + 4],
                            this.commands[i + 5],
                            this.commands[i + 6]);
                        break;

                    case PathData.CLOSE:
                        ctx.closePath();
                        break;

                    default:
                        console.error("Error!");
                        break;
                }

                i += PathData.SizeOf[this.commands[i]];
            }

            if (this.lineWidth !== undefined) {
                ctx.lineWidth = this.lineWidth;
            }
            if (this.fillStyle !== undefined) {
                ctx.fillStyle = this.fillStyle;
            }
            if (this.strokeStyle !== undefined) {
                ctx.strokeStyle = this.strokeStyle;
            }
        },

        drawControls: function (ctx) {
            var i = 0;
            var x = 0;
            var y = 0;
            while (i < this.commands.length) {
                switch (this.commands[i]) {
                    case PathData.MOVE:
                        x = this.commands[i + 1];
                        y = this.commands[i + 2];
                        break;

                    case PathData.LINE:
                        x = this.commands[i + 1];
                        y = this.commands[i + 2];
                        break;

                    case PathData.BEZIER_CURVE:
                        ctx.rect(x - 2, y - 2, 4, 4);
                        ctx.moveTo(x, y);
                        ctx.lineTo(
                            this.commands[i + 1],
                            this.commands[i + 2]);
                        ctx.moveTo(
                            this.commands[i + 3],
                            this.commands[i + 4]);
                        ctx.lineTo(
                            this.commands[i + 5],
                            this.commands[i + 6]);

                        x = this.commands[i + 5];
                        y = this.commands[i + 6];
                        break;

                    case PathData.CLOSE:
                        ctx.closePath();
                        break;
                }
                i += PathData.SizeOf[this.commands[i]];
            }
        },

        transform: function (matrix) {
            var i = 0;
            var j;
            var numPoints;
            while (i < this.commands.length) {
                numPoints = PathData.NumPoints[this.commands[i]];
                //console.log("pos=%d numPoints=%d", i, numPoints);
                for (j = 0; j < numPoints; j++) {
                    var pt = matrix.apply(
                            this.commands[i + 1 + j * 2],
                            this.commands[i + 1 + j * 2 + 1]);
                    this.commands[i + 1 + j * 2] = pt.x;
                    this.commands[i + 1 + j * 2 + 1] = pt.y;
                }

                i += PathData.SizeOf[this.commands[i]];
            }
        },

        clone: function () {
            var newPath = new PathData();
            newPath.commands = this.commands.concat();
            newPath.fillStyle = this.fillStyle;
            newPath.strokeStyle = this.strokeStyle;
            return newPath;
        },

        calcBoundingRect: function (tolerance) {
            var i = 0;
            var x, y;
            // assume first command is moveTo
            var rect = new Rectangle(this.commands[1], this.commands[2], 0, 0);
            while (i < this.commands.length) {
                switch (this.commands[i]) {
                    case PathData.MOVE:
                    case PathData.LINE:
                        x = this.commands[i + 1];
                        y = this.commands[i + 2];
                        rect.unionPoint(x, y);
                        break;

                    case PathData.BEZIER_CURVE:
                        var points = [];
                        bezier(points, x, y,
                            this.commands[i + 1],
                            this.commands[i + 2],
                            this.commands[i + 3],
                            this.commands[i + 4],
                            this.commands[i + 5],
                            this.commands[i + 6],
                            tolerance);

                        for (var j = 0; j < points.length; j++) {
                            rect.unionPoint(points[j].x, points[j].y);
                        }
                        break;
                }

                i += PathData.SizeOf[this.commands[i]];
            }
            return rect;
        },

        append: function (otherPath) {
            this.commands = this.commands.concat(otherPath.commands);
        }

    };

    function blur_image_data(srcdata, radius, MAX_ITERATIONS) {
        radius = Math.round(radius);
        var width = srcdata.width;
        var height = srcdata.height;
        var width4 = width * 4;
        var radius4 = radius * 4;
        var precalc = [];
        var src = srcdata.data;
        var mul = 1.0 / ((radius * 2) * (radius * 2));
        var channel;

        var iteration;

        for (iteration = 0; iteration < MAX_ITERATIONS; iteration++) {
            var x, y, i;

            // precomputation step.
            precalc[0] = src[0];
            precalc[1] = src[1];
            precalc[2] = src[2];
            precalc[3] = src[3];

            for (i = 4; i < width4; i++) {
                precalc[i] = src[i] + precalc[i - 4];
            }

            for (y = 1; y < height; y++) {
                precalc[i] = src[i] + precalc[i - width4];
                precalc[i + 1] = src[i + 1] + precalc[i + 1 - width4];
                precalc[i + 2] = src[i + 2] + precalc[i + 2 - width4];
                precalc[i + 3] = src[i + 3] + precalc[i + 3 - width4];
                i += 4;

                for (x = 4; x < width4; x++) {
                    precalc[i] = src[i] + precalc[i - width4] + precalc[i - 4] -
                        precalc[i - width4 - 4];
                    i++;
                }
            }

            // blur step.
            for (y = radius; y < height - radius; y++) {
                var r = (radius) * width4;
                i = y * width4 + radius4;
                for (x = radius4; x < width4 - radius; x++) {
                    // bottom right + top left - bottom left - top right 
                    src[i] = Math.floor(mul * (
                        precalc[i + radius4 + r] +
                        precalc[i - radius4 - r] -
                        precalc[i - radius4 + r] -
                        precalc[i + radius4 - r]));

                    i++;
                }
            }
        }
    }

    function blur_image_data2(srcdata, radius, MAX_ITERATIONS) {
        // get width, height
        var width = srcdata.width;
        var height = srcdata.height;
        var width4 = width * 4;
        var height4 = height * 4;
        var precalc = [];
        var src = srcdata.data;
        var mul = 1.0 / ((radius * 2) * (radius * 2));
        var channel;

        // The number of times to perform the averaging. According to wikipedia,
        // three iterations is good enough to pass for a gaussian.
        var iteration;

        //memcpy( dst, src, width*height*4 );

        for (iteration = 0; iteration < MAX_ITERATIONS; iteration++) {
            for (channel = 0; channel < 4; channel++) {
                var x, y, i;

                // precomputation step.
                var pix = 0;
                var pre = 0;
                var tot;

                pix = channel;
                i = 1;
                x = 0;
                y = 1;

                precalc[0] = src[pix];

                while (i < width) {
                    precalc[i] = src[pix] + precalc[i - 1];
                    i += 1;
                    pix += 4;
                }

                while (y < height) {
                    precalc[i] = src[pix] + precalc[i - width];
                    i++;
                    pix += 4;

                    x = 1;
                    while (x < width) {
                        precalc[i] = src[pix] + precalc[i - width] + precalc[i - 1] -
                            precalc[i - width - 1];
                        x++;
                        i++;
                        pix += 4;
                    }

                    y++;
                }

                // blur step.
                pix = radius * width * 4 + radius * 4 + channel;
                for (y = radius; y < height - radius; y++) {
                    for (x = radius; x < width - radius; x++) {
                        var l = x < radius ? 0 : x - radius;
                        var t = y < radius ? 0 : y - radius;
                        var r = x + radius >= width ? width - 1 : x + radius;
                        var b = y + radius >= height ? height - 1 : y + radius;
                        tot = precalc[r + b * width] + precalc[l + t * width] -
                            precalc[l + b * width] - precalc[r + t * width];
                        src[pix] = Math.round(tot * mul);
                        pix += 4;
                    }
                    pix += radius * 2 * 4;
                }
            }
        }
    }

    function Canvas_drawRoundRect(ctx, x, y, width, height, radius) {
        if (radius === 0.0) {
            ctx.rect(x, y, width, height);
        } else {
            var x1 = x;
            var x2 = x + width;
            var y1 = y;
            var y2 = y + height;
            ctx.moveTo(x1 + radius, y1);
            ctx.lineTo(x2 - radius, y1);
            ctx.quadraticCurveTo(x2, y1, x2, y1 + radius);
            ctx.lineTo(x2, y2 - radius);
            ctx.quadraticCurveTo(x2, y2, x2 - radius, y2);
            ctx.lineTo(x1 + radius, y2);
            ctx.quadraticCurveTo(x1, y2, x1, y2 - radius);
            ctx.lineTo(x1, y1 + radius);
            ctx.quadraticCurveTo(x1, y1, x1 + radius, y1);
            ctx.closePath();
        }
    }

    /**
    @constructor
    @param {...*} var_args
    */
    function Polygon(var_args) {
        this.points = [];
        if (arguments.length === 1) {
            var arg = arguments[0];
            if (arg instanceof Rectangle) {
                this.points.push(new Point(arg.x, arg.y));
                this.points.push(new Point(arg.right(), arg.y));
                this.points.push(new Point(arg.right(), arg.bottom()));
                this.points.push(new Point(arg.x, arg.bottom()));
            } else if (arg instanceof Array) {
                this.points = arg;
            } else {
                console.error("Bad parameter passed to Polygon() constructor.");
            }
        }
    }

    Polygon.prototype = {
        transform: function (matrix) {
            for (var i = 0; i < this.points.length; i++) {
                this.points[i] = matrix.apply(this.points[i].x, this.points[i].y);
            }
        },
        transformWRTContext: function (matrix, ctx) {
            for (var i = 0; i < this.points.length; i++) {
                this.points[i] = matrix.applyWRTContext(this.points[i].x, this.points[i].y, ctx);
            }
        },
        containsPoint: function (x, y, radius) {
            return PointInPolygon(this.points, x, y, radius);
        }
    };
    //#include <Graphics.js>
    //#include <log.js>

    /** @constructor 
     
    This behaviour is invoked when the user has selected some shapes and is now
    dragging a corner or rotation handle to scale or rotate them. It also 
    handles guestures.
    */
    function TransformSelectionBehaviour(view, previousBehaviour, handle,
            toggleEditNode, x, y) {
        this.view = view;
        this.handle = handle;
        this.previousBehaviour = previousBehaviour;
        this.toggleEditNode = toggleEditNode; // should we allow toggle to edit node if mouse didn't
        this.view.showRotationHandle(this.handle === this.view.ROT);

        this.haveGesture = false;

        //move?
        this.onMouseDown(x, y);
    }

    function GetNodeIds(nodes) {
        var result = [];
        for (var i = 0; i < nodes.length; i++) {
            result.push(nodes[i].id);
        }
        return result;
    }

    TransformSelectionBehaviour.prototype = {

        log: log.create("TransformSelectionBehaviour"),

        onTouch: function (e) {
            var touch;
            var i;
            var point;
            if (this.haveGesture) {
                return;
            }

            for (i = 0; i < e.touches.length; ) {
                touch = e.touches[i];
                point = this.view.screenPoint(touch.pageX, touch.pageY);
                if (e.type === "touchmove") {
                    this.onMouseMove(point.x, point.y);
                }
                break;
            }

            for (i = 0; i < e.changedTouches.length; ) {
                touch = e.changedTouches[i];
                point = this.view.screenPoint(touch.pageX, touch.pageY);
                if (e.type === "touchend") {
                    this.onMouseUp(point.x, point.y);
                }
                break;
            }
        },

        onGesture: function (e) {
            this.log("%s scale=%s rotation=%s", e.type, e.scale, e.rotation);
            this.haveGesture = true;

            var cx = this.selRect.x + this.selRect.width / 2;
            var cy = this.selRect.y + this.selRect.height / 2;

            var scale = new ScaleMatrix(e.scale, e.scale, cx, cy);
            var rotate = new RotateMatrix(-e.rotation / 180 * Math.PI, cx, cy);

            var xform = scale.multiply(rotate);
            var inverse = xform.inverse();
            var i;

            for (i = 0; i < this.nodes.length; i++) {
                this.nodes[i].setMatrix(xform.multiply(this.matrices[i]),
                            this.inverses[i].multiply(inverse));
                this.nodes[i].format(this.view.ctx, this.view.request);
            }
            this.view.transformSelectHandles(xform);
            this.view.draw();

            if (e.type === "gestureend") {
                for (i = 0; i < this.nodes.length; i++) {
                    this.nodes[i].setMatrix(this.matrices[i], this.inverses[i]);
                }

                this.view.commit([
                        new TransformAction(
                            GetNodeIds(this.nodes),
                            xform,
                            xform.inverse())
                ]);
                this.exit();
            }
        },

        onMouseDown: function (x, y) {
            this.log("onMouseDown");
            var pt = this.view.snap(new Point(x, y));
            x = pt.x;
            y = pt.y;
            this.dx = x;
            this.dy = y;

            this.nodes = this.view.getSelectedNodes();
            this.extractMatrices(this.nodes);
            this.selRect = new Rectangle(this.view.selectionBounds.x,
                    this.view.selectionBounds.y,
                    this.view.selectionBounds.width,
                    this.view.selectionBounds.height);

            if (this.handle === this.view.ROT) {
                this.cx = this.selRect.x + this.selRect.width / 2;
                this.cy = this.selRect.y + this.selRect.height / 2;
                this.startAngle = Math.atan2(this.cy - y, x - this.cx);
            }
        },

        extractMatrices: function (nodes) {
            this.matrices = [];
            this.inverses = [];
            for (var i = 0; i < nodes.length; i++) {
                this.matrices.push(nodes[i].getMatrix());
                this.inverses.push(nodes[i].getInverseMatrix());
            }
        },

        getTransform: function (x, y) {
            var offsetX = x - this.dx;
            var offsetY = y - this.dy;

            var xform;
            var sx;
            var sy;
            switch (this.handle) {
                case this.view.NE:
                    sx = (x - this.selRect.x) / this.selRect.width;
                    sy = (this.selRect.y + this.selRect.height - y) / this.selRect.height;
                    xform = new ScaleMatrix(sx, sy, this.selRect.x,
                            this.selRect.y + this.selRect.height);
                    break;
                case this.view.SE:
                    sx = (x - this.selRect.x) / this.selRect.width;
                    sy = (y - this.selRect.y) / this.selRect.height;
                    xform = new ScaleMatrix(sx, sy, this.selRect.x, this.selRect.y);
                    break;
                case this.view.SW:
                    sx = (this.selRect.x + this.selRect.width - x) / this.selRect.width;
                    sy = (y - this.selRect.y) / this.selRect.height;
                    xform = new ScaleMatrix(sx, sy, this.selRect.x +
                            this.selRect.width, this.selRect.y);
                    break;
                case this.view.NW:
                    sx = (this.selRect.x + this.selRect.width - x) / this.selRect.width;
                    sy = (this.selRect.y + this.selRect.height - y) / this.selRect.height;
                    xform = new ScaleMatrix(sx, sy,
                            this.selRect.x + this.selRect.width,
                            this.selRect.y + this.selRect.height);
                    break;
                case this.view.ROT:
                    var angle = Math.atan2(this.cy - y, x - this.cx) - this.startAngle;
                    xform = new RotateMatrix(angle, this.cx, this.cy);
                    break;
                default:
                    xform = new TranslateMatrix(offsetX, offsetY);
            }
            return xform;

        },

        onMouseMove: function (x, y) {
            var pt = this.view.snap(new Point(x, y));
            x = pt.x;
            y = pt.y;
            var xform = this.getTransform(x, y);
            var inverse = xform.inverse();

            for (var i = 0; i < this.nodes.length; i++) {
                this.nodes[i].setMatrix(xform.multiply(this.matrices[i]),
                            this.inverses[i].multiply(inverse));
                this.nodes[i].format(this.view.ctx, this.view.request);
            }
            this.view.transformSelectHandles(xform);
            if (this.handle === this.view.ROT) {

                this.view.rotHandleX = x;
                this.view.rotHandleY = y;
            }
            this.view.draw();
            if (this.handle === this.view.ROT) {
                var ctx = this.view.ctx;
                ctx.save();
                ctx.beginPath();
                ctx.strokeStyle = "#0050B7";
                ctx.lineWidth = 1.0 / this.view.scale;
                ctx.moveTo(this.cx, this.cy);
                ctx.lineTo(x, y);
                ctx.stroke();
                ctx.restore();
            }
        },

        onMouseUp: function (x, y) {
            this.log("onMouseUp");
            var pt = this.view.snap(new Point(x, y));
            x = pt.x;
            y = pt.y;
            var node;
            if (x !== this.dx || y !== this.dy) {
                var xform = this.getTransform(x, y);

                for (var i = 0; i < this.nodes.length; i++) {
                    this.nodes[i].setMatrix(this.matrices[i], this.inverses[i]);
                }

                this.view.commit([
                        new TransformAction(
                            GetNodeIds(this.nodes),
                            xform,
                            xform.inverse())
                ]);
            }
            else if (this.toggleEditNode) {
                // didn't move!

                node = this.view.doc.hittest(x, y);
                if (node && node.hasEditMode()) {
                    this.log("Didn't move, and has edit mode. Selecting node %s",
                        node.id);
                    this.view.clearSelection();
                    this.view.setEditNode(node);
                }
            }

            this.exit();
        },

        exit: function () {
            this.view.transformSelectHandles(new Matrix());
            this.view.showRotationHandle(true);
            this.view.calcSelection();
            this.view.update(true);
            this.view.behaviour = this.previousBehaviour;
        },

        onDoubleClick: function (x, y) {
            this.log("onDoubleClick");
        }
    };
    /*
    Zwibbler
    
    Copyright 2013 Hanov Solutions Inc. All Rights Reserved. This software is
    NOT open source. For licensing information, contact the author.
    
    steve.hanov@gmail.com
    */

    //#include <log.js>
    //#include <Graphics.js>

    var _fitLogger = log.create("FitCurve");

    /**
    This function is taken from the Graphics Gems book. It converts a series of
    points to the closest matching bezier curves, and returns the calculated
    path.
    */
    function GenerateCurvesFromPoints(points, error) {
        var path = new PathData();

        function DrawBezierCurve(n, curve) {
            //path.moveTo( curve[0].x, curve[0].y );
            path.bezierCurveTo(
                curve[1].x, curve[1].y,
                curve[2].x, curve[2].y,
                curve[3].x, curve[3].y);
            _fitLogger("Bezier: (%s,%s), (%s,%s), (%s,%s), (%s,%s)",
                curve[0].x, curve[0].y,
                curve[1].x, curve[1].y,
                curve[2].x, curve[2].y,
                curve[3].x, curve[3].y);
        }

        function V2Negate(v) {
            v.x = -v.x;
            v.y = -v.y;
            return v;
        }

        function V2Dot(a, b) {
            return (a.x * b.x) + (a.y * b.y);
        }

        /*
        *  B0, B1, B2, B3 :
        *      Bezier multipliers
        */
        function B0(u) {
            var tmp = 1.0 - u;
            return (tmp * tmp * tmp);
        }

        function B1(u) {
            var tmp = 1.0 - u;
            return (3 * u * (tmp * tmp));
        }

        function B2(u) {
            var tmp = 1.0 - u;
            return (3 * u * u * tmp);
        }

        function B3(u) {
            return (u * u * u);
        }

        function V2DistanceBetween2Points(a, b) {
            var dx = a.x - b.x;
            var dy = a.y - b.y;
            return Math.sqrt((dx * dx) + (dy * dy));
        }

        function V2SquaredLength(a) {
            return (a.x * a.x) + (a.y * a.y);
        }

        function V2Length(a) {
            return Math.sqrt(V2SquaredLength(a));
        }

        function V2Scale(v, newlen) {
            var len = V2Length(v);
            if (len !== 0.0) {
                v.x *= newlen / len;
                v.y *= newlen / len;
            }
            return v;
        }

        function V2Add(a, b, c) {
            if (c === undefined) {
                _fitLogger("Undef!");
            }
            c.x = a.x + b.x;
            c.y = a.y + b.y;
            return c;
        }

        function V2AddII(a, b) {
            return { x: a.x + b.x, y: a.y + b.y };
        }

        function V2ScaleII(v, s) {
            return { x: v.x * s, y: v.y * s };
        }

        function V2SubII(a, b) {
            return { x: a.x - b.x, y: a.y - b.y };
        }

        /*
        *  GenerateBezier :
        *  Use least-squares method to find Bezier control points for region.
        *
        Point2      *d;                       Array of digitized points   
        int         first, last;              Indices defining region     
        double      *uPrime;                  Parameter values for region 
        Vector2     tHat1, tHat2;     Unit tangents at endpoints  
        */
        function GenerateBezier(d, first, last, uPrime, tHat1, tHat2) {
            var i;
            var A = [];        /* Precomputed rhs for eqn [MAXPOINTS,2]      */
            var nPts;                   /* Number of pts in sub-curve */
            var C = [[], []];                        /* Matrix C [2][2]            */
            var X = [];                   /* Matrix X                     */
            var det_C0_C1,              /* Determinants of matrices     */
                        det_C0_X,
                        det_X_C1;
            var alpha_l,                /* Alpha values, left and right */
                        alpha_r;
            var tmp;                    /* Utility variable             */
            var bezCurve;       /* RETURN bezier curve ctl pts  */

            bezCurve = [{}, {}, {}, {}]; // 4 points
            nPts = last - first + 1;

            /* Compute the A's  */
            for (i = 0; i < nPts; i++) {
                var v1 = { x: tHat1.x, y: tHat1.y };
                var v2 = { x: tHat2.x, y: tHat2.y };
                V2Scale(v1, B1(uPrime[i]));
                V2Scale(v2, B2(uPrime[i]));
                A[i] = [v1, v2];
            }

            /* Create the C and X matrices      */
            C[0][0] = 0.0;
            C[0][1] = 0.0;
            C[1][0] = 0.0;
            C[1][1] = 0.0;
            X[0] = 0.0;
            X[1] = 0.0;

            for (i = 0; i < nPts; i++) {
                C[0][0] += V2Dot(A[i][0], A[i][0]);
                C[0][1] += V2Dot(A[i][0], A[i][1]);
                /*                                      C[1][0] += V2Dot(&A[i][0], &A[i][1]);*/
                C[1][0] = C[0][1];
                C[1][1] += V2Dot(A[i][1], A[i][1]);

                tmp = V2SubII(d[first + i],
                        V2AddII(
                            V2ScaleII(d[first], B0(uPrime[i])),
                            V2AddII(
                                V2ScaleII(d[first], B1(uPrime[i])),
                                V2AddII(
                                    V2ScaleII(d[last], B2(uPrime[i])),
                                    V2ScaleII(d[last], B3(uPrime[i]))))));


                X[0] += V2Dot(A[i][0], tmp);
                X[1] += V2Dot(A[i][1], tmp);
            }

            /* Compute the determinants of C and X      */
            det_C0_C1 = C[0][0] * C[1][1] - C[1][0] * C[0][1];
            det_C0_X = C[0][0] * X[1] - C[0][1] * X[0];
            det_X_C1 = X[0] * C[1][1] - X[1] * C[0][1];

            /* Finally, derive alpha values     */
            if (det_C0_C1 === 0.0) {
                det_C0_C1 = (C[0][0] * C[1][1]) * 10e-12;
            }
            alpha_l = det_X_C1 / det_C0_C1;
            alpha_r = det_C0_X / det_C0_C1;


            /*  If alpha negative, use the Wu/Barsky heuristic (see text) */
            if (alpha_l < 0.0 || alpha_r < 0.0) {
                var dist = V2DistanceBetween2Points(d[last], d[first]) /
                    3.0;

                bezCurve[0] = d[first];
                bezCurve[3] = d[last];
                V2Add(bezCurve[0], V2Scale(tHat1, dist), bezCurve[1]);
                V2Add(bezCurve[3], V2Scale(tHat2, dist), bezCurve[2]);
                return (bezCurve);
            }

            /*  First and last control points of the Bezier curve are */
            /*  positioned exactly at the first and last data points */
            /*  Control points 1 and 2 are positioned an alpha distance out */
            /*  on the tangent vectors, left and right, respectively */
            bezCurve[0] = d[first];
            bezCurve[3] = d[last];
            V2Add(bezCurve[0], V2Scale(tHat1, alpha_l), bezCurve[1]);
            V2Add(bezCurve[3], V2Scale(tHat2, alpha_r), bezCurve[2]);
            return (bezCurve);
        }

        /*
        *  Bezier :
        *      Evaluate a Bezier curve at a particular parameter value
        *
        int         degree;          The degree of the bezier curve       
        Point2      *V;              Array of control points              
        double      t;               Parametric value to find point for  
        */
        function Bezier(degree, V, t) {
            var i, j;
            var Q;              /* Point on curve at parameter t        */
            var Vtemp;         /* Local copy of control points         */

            /* Copy array       */
            Vtemp = [];
            for (i = 0; i <= degree; i++) {
                Vtemp[i] = { x: V[i].x, y: V[i].y };
            }

            /* Triangle computation     */
            for (i = 1; i <= degree; i++) {
                for (j = 0; j <= degree - i; j++) {
                    Vtemp[j].x = (1.0 - t) * Vtemp[j].x + t * Vtemp[j + 1].x;
                    Vtemp[j].y = (1.0 - t) * Vtemp[j].y + t * Vtemp[j + 1].y;
                }
            }

            Q = Vtemp[0];
            return Q;
        }

        /*
        *  NewtonRaphsonRootFind :
        *      Use Newton-Raphson iteration to find better root.
        *
        BezierCurve Q;                        Current fitted curve        
        Point2              P;                Digitized point             
        double              u;                Parameter value for "P"     
        */
        function NewtonRaphsonRootFind(Q, P, u) {
            var numerator, denominator;
            var Q1 = [], Q2 = [];   /*  Q' and Q''                  */
            var Q_u, Q1_u, Q2_u; /*u evaluated at Q, Q', & Q''  */
            var uPrime;         /*  Improved u                  */
            var i;

            /* Compute Q(u)     */
            Q_u = Bezier(3, Q, u);

            /* Generate control vertices for Q' */
            for (i = 0; i <= 2; i++) {
                Q1[i] = {};
                Q1[i].x = (Q[i + 1].x - Q[i].x) * 3.0;
                Q1[i].y = (Q[i + 1].y - Q[i].y) * 3.0;
            }

            /* Generate control vertices for Q'' */
            for (i = 0; i <= 1; i++) {
                Q2[i] = {};
                Q2[i].x = (Q1[i + 1].x - Q1[i].x) * 2.0;
                Q2[i].y = (Q1[i + 1].y - Q1[i].y) * 2.0;
            }

            /* Compute Q'(u) and Q''(u) */
            Q1_u = Bezier(2, Q1, u);
            Q2_u = Bezier(1, Q2, u);

            /* Compute f(u)/f'(u) */
            numerator = (Q_u.x - P.x) * (Q1_u.x) + (Q_u.y - P.y) * (Q1_u.y);
            denominator = (Q1_u.x) * (Q1_u.x) + (Q1_u.y) * (Q1_u.y) +
                (Q_u.x - P.x) * (Q2_u.x) + (Q_u.y - P.y) * (Q2_u.y);

            /* u = u - f(u)/f'(u) */
            uPrime = u - (numerator / denominator);
            return (uPrime);
        }

        /*
        *  Reparameterize:
        *      Given set of points and their parameterization, try to find
        *   a better parameterization.
        *
        Point2      *d;                       Array of digitized points   
        int         first, last;              Indices defining region     
        double      *u;                       Current parameter values    
        BezierCurve bezCurve;         Current fitted curve        
        */
        function Reparameterize(d, first, last, u, bezCurve) {
            var nPts = last - first + 1;
            var i;
            var uPrime = [];                /*  New parameter values        */

            uPrime = [];
            for (i = first; i <= last; i++) {
                uPrime[i - first] = NewtonRaphsonRootFind(bezCurve, d[i],
                    u[i - first]);
            }
            return (uPrime);
        }

        function V2Normalize(v) {
            var len = Math.sqrt(V2Length(v));
            if (len !== 0.0) {
                v.x /= len;
                v.y /= len;
            }
            return v;
        }


        //    Point2      *d;                     /*  Digitized points                    */
        //    int         center;         /*  Index to point inside region        
        function ComputeCenterTangent(d, center) {
            var V1, V2, tHatCenter = {};

            V1 = V2SubII(d[center - 1], d[center]);
            V2 = V2SubII(d[center], d[center + 1]);
            tHatCenter.x = (V1.x + V2.x) / 2.0;
            tHatCenter.y = (V1.y + V2.y) / 2.0;
            tHatCenter = V2Normalize(tHatCenter);
            return tHatCenter;
        }

        /*
        *  ChordLengthParameterize :
        *      Assign parameter values to digitized points
        *      using relative distances between points.
        Point2      *d;                      Array of digitized points 
        int         first, last;              Indices defining region     
        */
        function ChordLengthParameterize(d, first, last) {
            var i;
            var u = [];                     /*  Parameterization            */

            u[0] = 0.0;
            for (i = first + 1; i <= last; i++) {
                u[i - first] = u[i - first - 1] +
                    V2DistanceBetween2Points(d[i], d[i - 1]);
            }

            for (i = first + 1; i <= last; i++) {
                u[i - first] = u[i - first] / u[last - first];
            }

            return (u);
        }

        /*
        *  ComputeMaxError :
        *      Find the maximum squared distance of digitized points
        *      to fitted curve.
        Point2      *d;                       Array of digitized points   
        int         first, last;              Indices defining region     
        BezierCurve bezCurve;                 Fitted Bezier curve         
        double      *u;                       Parameterization of points  
        int         *splitPoint;              Point of maximum error      
        */
        function ComputeMaxError(d, first, last, bezCurve, u) {
            var i;
            var maxDist;                /*  Maximum error               */
            var dist;           /*  Current error               */
            var P;                      /*  Point on curve              */
            var v;                      /*  Vector from point to curve  */

            var splitPoint = (last - first + 1) / 2;
            maxDist = 0.0;
            for (i = first + 1; i < last; i++) {
                P = Bezier(3, bezCurve, u[i - first]);
                v = V2SubII(P, d[i]);
                dist = V2SquaredLength(v);
                if (dist >= maxDist) {
                    maxDist = dist;
                    splitPoint = i;
                }
            }
            return { maxError: maxDist, splitPoint: splitPoint };
        }



        /*
        *  FitCubic :
        *      Fit a Bezier curve to a (sub)set of digitized points
        Point2      *d;                       Array of digitized points 
        int         first, last;     Indices of first and last pts in region 
        Vector2     tHat1, tHat2;    Unit tangent vectors at endpoints 
        double      error;            User-defined error squared     
        */
        function FitCubic(d, first, last, tHat1, tHat2, error) {
            var bezCurve; /*Control points of fitted Bezier curve*/
            var u;             /*  Parameter values for point  */
            var uPrime;        /*  Improved parameter values */
            var maxError;       /*  Maximum fitting error        */
            var splitPoint;     /*  Point to split point set at  */
            var nPts;           /*  Number of povars in subset  */
            var iterationError; /*Error below which you try iterating  */
            var maxIterations = 4; /*  Max times to try iterating  */
            var tHatCenter;     /* Unit tangent vector at splitPovar */
            var i;
            bezCurve = [{}, {}, {}, {}];

            iterationError = error * error;
            nPts = last - first + 1;

            /*  Use heuristic if region only has two points in it */
            if (nPts === 2) {
                var dist = V2DistanceBetween2Points(d[last], d[first]) / 3.0;

                bezCurve[0] = d[first];
                bezCurve[3] = d[last];
                V2Add(bezCurve[0], V2Scale(tHat1, dist), bezCurve[1]);
                V2Add(bezCurve[3], V2Scale(tHat2, dist), bezCurve[2]);
                DrawBezierCurve(3, bezCurve);
                return;
            }

            /*  Parameterize points, and attempt to fit curve */
            u = ChordLengthParameterize(d, first, last);
            bezCurve = GenerateBezier(d, first, last, u, tHat1, tHat2);

            /*  Find max deviation of points to fitted curve */
            var ret = ComputeMaxError(d, first, last, bezCurve, u);
            maxError = ret.maxError;
            splitPoint = ret.splitPoint;
            if (maxError < error) {
                DrawBezierCurve(3, bezCurve);
                return;
            }

            /*  If error not too large, try some reparameterization  */
            /*  and iteration */
            if (maxError < iterationError) {
                for (i = 0; i < maxIterations; i++) {
                    uPrime = Reparameterize(d, first, last, u, bezCurve);
                    bezCurve = GenerateBezier(d, first, last, uPrime, tHat1, tHat2);
                    ret = ComputeMaxError(d, first, last,
                            bezCurve, uPrime);
                    maxError = ret.maxError;
                    splitPoint = ret.splitPoint;
                    if (maxError < error) {
                        DrawBezierCurve(3, bezCurve);
                        return;
                    }
                    u = uPrime;
                }
            }

            /* Fitting failed -- split at max error point and fit recursively */
            tHatCenter = ComputeCenterTangent(d, splitPoint);
            FitCubic(d, first, splitPoint, tHat1, tHatCenter, error);
            V2Negate(tHatCenter);
            FitCubic(d, splitPoint, last, tHatCenter, tHat2, error);
        }

        /*
        * ComputeLeftTangent, ComputeRightTangent, ComputeCenterTangent :
        *Approximate unit tangents at endpoints and "center" of digitized curve
    
        Point2      *d;                       Digitized points
        int         end;              Index to "left" end of region 
        */
        function ComputeLeftTangent(d, end) {
            var tHat1;
            tHat1 = V2SubII(d[end + 1], d[end]);
            tHat1 = V2Normalize(tHat1);
            return tHat1;
        }

        // Point2      *d;                     /*  Digitized points            
        // int         end;            /*  Index to "right" end of region 
        function ComputeRightTangent(d, end) {
            var tHat2;
            tHat2 = V2SubII(d[end - 1], d[end]);
            tHat2 = V2Normalize(tHat2);
            return tHat2;
        }


        /*
        *  FitCurve :
        *      Fit a Bezier curve to a set of digitized points
        Point2      *d;             Array of digitized points   
        int         nPts;           Number of digitized points  
        double      error;          User-defined error squared  
    
        */
        function FitCurve(d, nPts, error) {
            /*  Unit tangent vectors at endpoints */
            var tHat1 = ComputeLeftTangent(d, 0);
            var tHat2 = ComputeRightTangent(d, nPts - 1);

            FitCubic(d, 0, nPts - 1, tHat1, tHat2, error);
        }

        path.moveTo(points[0].x, points[0].y);
        FitCurve(points, points.length, error * error);

        return path;
    }

    /*
    *  main:
    *      Example of how to use the curve-fitting code.  Given an array
    *   of points and a tolerance (squared error between points and
    *      fitted curve), the algorithm will generate a piecewise
    *      cubic Bezier representation that approximates the points.
    *      When a cubic is generated, the routine "DrawBezierCurve"
    *      is called, which outputs the Bezier curve just created
    *      (arguments are the degree and the control points, respectively).
    *      Users will have to implement this function themselves
    *   ascii output, etc.
    */
    function main() {
        var d = [
        ];

        var x = 0;
        var y = 0;
        for (var j = 0; j < 10; j++) {
            d.push({
                x: Math.random() * 640,
                y: Math.random() * 480
            });
        }

        var canvas = document.createElement("canvas");
        canvas.width = 640;
        canvas.height = 480;
        canvas.style.borderWidth = "1px";
        canvas.style.borderColor = "#000000";
        canvas.style.borderStyle = "solid";
        canvas.strokeStyle = "#000000";
        canvas.lineWidth = 1;
        document.getElementById("debug").appendChild(canvas);
        var m = 1;
        var ctx = canvas.getContext("2d");

        for (var i = 0; i < d.length; i++) {
            ctx.rect(d[i].x * m - 2, d[i].y * m - 2, 4, 4);
        }

        ctx.stroke();
        ctx.beginPath();
        //dbg.printf("\nRunning trace...\n");
        var error = 4.0;            //  Squared error 
        var path = GenerateCurvesFromPoints(d, error);              //  Fit the Bezier curves 
        ctx.lineWidth = 3;
        path.draw(ctx);
        ctx.stroke();
        ctx.beginPath();
        ctx.lineWidth = 1;
        ctx.strokeStyle = "#c0c0ff";
        path.drawControls(ctx);
        ctx.stroke();
        //dbg.printf("done trace.");
    }

    /*
    Zwibbler
    
    Copyright 2013 Hanov Solutions Inc. All Rights Reserved. This software is
    NOT open source. For licensing information, contact the author.
    
    steve.hanov@gmail.com
    */
    //#include <log.js>
    //#include <Graphics.js>
    /** @constructor 
    In text edit mode, clicking on a text box will cause an input box to appear
    supermposed over it. Clicking elsewhere on the document will hide it.
    */
    function DrawTextBehaviour(view) {
        this.view = view;
        this.editing = false;
        this.editBox = null;
        this.editPoint = null; // point
        this.editNodeId = 0;

        this.textPosition = "normal";
    }

    DrawTextBehaviour.prototype = {
        log: log.create("Text"),

        enter: function () {
            this.log("Entering text mode");
            this.view.canvas.style.cursor = "text";

        },

        leave: function () {
            if (this.editing) {
                this.createText();
            }
            this.view.canvas.style.cursor = "default";
            this.log("Leaving text mode");
            if (this.editBox) {
                //document.body.removeChild(this.editBox);                  
                $(this.editBox).remove();   //Ashok
                this.editBox = null;
            }
        },

        onTouch: function (e) {
            for (var i = 0; i < e.touches.length; i++) {
                var touch = e.touches[i];
                var point = this.view.screenPoint(touch.pageX, touch.pageY);
                if (e.type === "touchstart") {
                    this.onMouseDown(point.x, point.y, e);
                }
            }
        },

        onMouseDown: function (x, y, e) {

            // if we are currently editing, cancel that first.
            if (this.editing) {
                this.log("Editing somewhere else on mousedown; submit that first.");
                this.createText();
                this.view.pickTool();
                return;
            }

            // check if the mouse is down over an existing node.
            var node = this.view.doc.hittest(x, y);

            var fontName, fontSize;

            if (node && node.type() === "TextNode") {
                // edit an existing text node.
                this.editNode = node;
                if (this.textPosition !== "top") {
                    this.editNode.setHidden(true);
                }
                this.view.draw();
                this.editPoint = new Point(node.rect.x, node.rect.y);

                fontName = node.getProperty("fontName");
                fontSize = node.getProperty("fontSize");
            } else {
                this.editNode = null;
                this.editPoint = new Point(x, y);
                fontName = this.view.defaults["fontName"];
                fontSize = this.view.defaults["fontSize"];
            }

            var self = this;
            var self = this, cContainer = $(this.view.canvas).parent(), cOffset = cContainer.offset();    //Ashok
            this.editBox = document.createElement("input");
            this.editBox.type = "text";
            //document.body.appendChild(this.editBox);
            cContainer.append(this.editBox); //Ashok

            var height = $(this.editBox).height();

            if (this.editPoint.x < $(this.view.canvas.parentNode.parentNode).find('div.sp_toolbar_container')[0].offsetWidth) {
                this.editPoint.x = $(this.view.canvas.parentNode.parentNode).find('div.sp_toolbar_container')[0].offsetWidth;
            }
            var pos = this.view.documentPoint(this.editPoint.x, this.editPoint.y);

            this.editBox.style.position = "absolute";
            this.editBox.style.fontFamily = fontName;
            this.editBox.style.fontSize = "" + (fontSize * this.view.scale) + "px";

            if (this.textPosition === "top") {
                var offset = $(this.view.canvas).offset();
                var width = $(this.view.canvas).width();
                var editWidth = $(this.editBox).width();
                this.editBox.style.left = "" + (offset.left + width / 2 - editWidth / 2) + "px";
                this.editBox.style.top = "" + (offset.top) + "px";
            } else {
                this.editBox.style.left = "" + Math.round(pos.x - cOffset.left) + "px";
                this.editBox.style.top = "" + Math.round(pos.y - cOffset.top) + "px";
            }

            this.editing = true;
            this.editPoint = new Point(x, y + height);

            if (this.editNode) {
                this.editBox.value = this.editNode.getProperty("text");
            }

            $(this.editBox).bind("keydown", function (e) {
                if (e.keyCode === 27) {
                    self.log("ESC pressed; cancel.");
                    self.cancel();
                    self.view.pickTool();
                    self.view.eventSource.emit("goto-toolbar");
                } else if (e.keyCode === 13) {
                    self.log("Enter pressed. create text.");
                    self.createText();
                    if (self.view.isKeyboardCursorShown()) {
                        self.view.showKeyboardCursorAndStartMoving();
                    }
                    self.view.pickTool();
                    self.view.eventSource.emitNow("goto-canvas");
                }
            });

            // desktop browsers need a focus after a timeout sometimes.
            setTimeout(function () {
                if (self.editBox) {
                    $(self.editBox).focus();
                }
            }, 300);

            // ios browser needs focus right away.
            $(self.editBox).focus();
        },

        cancel: function () {
            //document.body.removeChild(this.editBox);            
            $(this.editBox).remove();    //Ashok
            this.editBox = null;
            this.editing = false;
            if (this.editNode) {
                this.editNode.setHidden(false);
                this.view.draw();
            }
        },

        createText: function () {
            var text = this.editBox.value;
            this.cancel();

            // discard false edit
            if (this.editNode && this.editNode.getProperty("text") === text) {
                this.log("Text was not changed.");
                return;
            }

            if (this.editNode === null && text === "") {
                this.log("No text entered.");
                return;
            }

            if (this.editNode) {
                this.log("Update text in node %s", this.editNode.id);
                this.view.commit([
                    new SetAction([this.editNode.id], "text", text)]);
                this.view.doneSelecting();
            } else {
                this.log("Create new text node.");
                var id = this.view.doc.peekNextId();
                var xform = new TranslateMatrix(this.editPoint.x,
                        this.editPoint.y);
                this.view.commit([
                    new CreateAction("TextNode", {
                        "text": text,
                        "fontSize": this.view.defaults["fontSize"],
                        "fontName": this.view.defaults["fontName"],
                        "textFillStyle": this.view.defaults["textFillStyle"]
                    }),

                    new TransformAction([id], xform, xform.inverse())
                ]);
            }
        },

        onMouseMove: function (x, y) {

        },

        onKeyCommand: function (action) {
            this.log("keyboard: %s", action);
            if (action === "cancel" && this.editBox === null) {
                // When the user presses escape, and there is no edit box
                // shown, go to pick tool.
                this.view.pickTool();

                // emitNow because some browsers require a focus change to be in
                // response to an event by the user.
                this.view.eventSource.emit("goto-toolbar");
            }
        },

        onColourClicked: function (e) {
            this.log("Set text colour to %s", e.colour);
            this.view.setProperty("textFillStyle", e.colour);
        }
    };
    /*
    Zwibbler
    
    Copyright 2013 Hanov Solutions Inc. All Rights Reserved. This software is
    NOT open source. For licensing information, contact the author.
    
    steve.hanov@gmail.com
    */

    //#include <Graphics.js>
    //#include <Inherit.js>
    /** @constructor 
    @param {number} id
    
    Everything in the zwibbler document is a node. Nodes have a type and a
    numeric id. Here are all the functions common to all the node types.
    */
    function BaseNode(id) {
        this.initBase(id, BaseNode);
    }

    BaseNode.defaults = {
        "fillStyle": "#cccccc",
        "strokeStyle": "#000000",
        "lineWidth": 2,
        "shadow": false
    };

    BaseNode.prototype = {

        /**
        The ID parameter is a numeric ID that uniquely identifies the node in
        the document. The contructor is the function that constructed it, and
        is used to implement the clone() function.
          
        @param {number} id
        @param {function(number)} constructor
        */
        initBase: function (id, constructor) {
            this.id = id;
            this.properties = {};
            this.applyDefaults(BaseNode.defaults);
            this.rect = new Rectangle(0, 0, 1, 1);
            this.properties["matrix"] = new Matrix();
            this.properties["inverse"] = new Matrix();
            this.parent = null;
            this.constructor = constructor;
            this._hidden = false;
        },

        /**
        @param {!Object} defaults
        */
        applyDefaults: function (defaults) {
            for (var key in defaults) {
                if (1) {
                    this.properties[key] = defaults[key];
                }
            }
        },

        /**
        Return true if the node has an edit mode. If so, then clicking on the
        selection will put the node into edit mode and draw edit handles.
    
        */
        hasEditMode: function () {
            return false;
        },

        hasText: function () {
            return "text" in this.properties;
        },

        hasData: function () {
            return "data" in this.properties;
        },

        /**
        Make an exact duplicate of the node. Use the given function to determine
        the ID.
    
        @param {function(): number} nameGenerator
        @return {!Object}
        */
        clone: function (nameGenerator) {
            var clone = new this.constructor(nameGenerator());
            clone.setProperties(this.getProperties());
            return clone;
        },

        /**
        @return {!Object}
        */
        getProperties: function () {
            return this.properties;
        },

        /**
        @param {!Object} properties
        */
        setProperties: function (properties) {
            for (var key in properties) {
                if (properties.hasOwnProperty(key)) {
                    this.setProperty(key, properties[key]);
                }
            }
        },

        /**
        Returns true if this is a group node.
    
        @return {boolean}
        */
        isGroup: function () {
            return this.children !== undefined;
        },

        /**
        Returns true if this is the document root.
    
        @return {boolean}
        */
        isRoot: function () {
            return this.parent === null;
        },

        /**
        @return {boolean}
        */
        isGroupMember: function () {
            // a node is a group member if its parent is not the root.
            return this.parent !== null && !this.parent.isRoot();
        },

        /**
        @return {string}
        */
        type: function () {
            return "BaseNode";
        },

        /**
        @return {Matrix}
        */
        getMatrix: function () {
            return this.properties["matrix"];
        },

        /**
        @return {Matrix}
        */
        getInverseMatrix: function () {
            return this.properties["inverse"];
        },

        /**
        @param {Matrix} matrix
        @param {Matrix} inverse
        */
        setMatrix: function (matrix, inverse) {
            this.properties["matrix"] = matrix;
            this.properties["inverse"] = inverse;
        },

        /**
        @param {string} name
        @param {string|number|Array.<number>|Matrix} value
        */
        setProperty: function (name, value) {
            if (name in this.properties) {
                this.properties[name] = value;
            }
        },

        /**
        @param {string} name
        @return {*}
        */
        getProperty: function (name) {
            return this.properties[name];
        },

        /**
        Return the smallest rectangle that fully encloses the object. This is
        used for determining the size of the selection rectangle.
    
        @return {Rectangle}
        */
        getRect: function () {
            return this.rect;
        },

        /**
        @param {Matrix} matrix
        @param {Matrix} inverse
        */
        transform: function (matrix, inverse) {
            this.properties["matrix"] = matrix.multiply(this.properties["matrix"]);
            this.properties["inverse"] = this.properties["inverse"].multiply(
                    inverse);
        },

        /**
        The format function is called when the node is created or a property has
        changed. Expensive calculations should be done here instead of in the
        draw() function.
    
        @param {CanvasRenderingContext2D} ctx
        */
        format: function (ctx, request) {
        },

        /**
        Return the node, if it is under the given point. This might use the
        bounding rect, or non-rectangular shapes can use a more precise algorithm
        such as PointInPolygon.
    
        @param {number} x
        @param {number} y
        @return {BaseNode}
        */
        hittest: function (x, y) {
            return this.rect.containsPoint(x, y) ? this : null;
        },

        /**
        Sets the node as temporarily hidden. This is not a property and is not
        saved. It is used to temporarily hide elements, for example during text
        editing.
        @param {boolean} hidden
        */
        setHidden: function (hidden) {
            this._hidden = hidden;
        },

        /**
        @return {boolean}
        */
        hidden: function () {
            return this._hidden;
        },

        /**
        @param {CanvasRenderingContext2D} ctx
        */
        draw: function (ctx) {
            ctx.save();
            var matrix = this.properties["matrix"];
            ctx.transform(matrix.m11, matrix.m21, matrix.m12,
                              matrix.m22, matrix.dx, matrix.dy);
            ctx.strokeStyle = this.properties["strokeStyle"];
            ctx.fillStyle = this.properties["fillStyle"];
            ctx.lineWidth = this.properties["lineWidth"];

            if (this.properties["shadow"]) {
                ctx.shadowOffsetX = 3;
                ctx.shadowOffsetY = 3;
                ctx.shadowBlur = 5;
                ctx.shadowColor = "rgba(0,0,0,0.5)";
            }

            this._draw(ctx);
            ctx.restore();
        },

        /**
        The _draw function is called by draw() after the matrix, fill style, and
        stroke style are applied.
    
        @param {CanvasRenderingContext2D} ctx
        */
        _draw: function (ctx) {

        },

        /**
        Called when the item is added to the document.
        */
        onAdded: function () {

        },

        /**
        Called when the item is removed from the document.
        */
        onRemoved: function () {

        }
    };
    /*
    Zwibbler
    
    Copyright 2013 Hanov Solutions Inc. All Rights Reserved. This software is
    NOT open source. For licensing information, contact the author.
    
    steve.hanov@gmail.com
    //#include <BaseNode.js>
    //#include <log.js>
    */
    /*
    The image node has a URL parameter and loads it from the server using a
    FormatRequest. When the URL is retrieved, the image is drawn and treated like
    any object.
    */
    /**
    * @constructor
    * @extends {BaseNode}
    */
    var ImageNode = function (id) {
        this.initBase(id, ImageNode);
        this.properties["url"] = "";
        this.img = null;
        this.width = 100;
        this.height = 20;
        this.poly = new Polygon();
        this.locked = false;
    };
    __extends(ImageNode, BaseNode);

    ImageNode.prototype.log = log.create("IMAGE", true);
    ImageNode.prototype.type = function () {
        return "ImageNode";
    };
    ImageNode.prototype.setProperty = function (name, value) {
        this.properties[name] = value;
        if (name === "url") {
            return this.img = null;
        }
    };
    ImageNode.prototype.format = function (ctx, request) {
        var name;
        if (this.img === null) {
            this.rect = new Rectangle(0, 0, this.width, this.height);
            name = "image-" + this.id + this.properties["url"];
            request.add(this, "image", this.properties["url"], null, __bind(function (img, url) {
                this.log("Got image response.");
                this.img = img;
                return request.emit("reformat", this);
            }, this));
        } else {
            this.rect = new Rectangle(0, 0, this.img.width, this.img.height);
        }
        /* create the precise bounding polygon, and the imprecise bounding */
        /* rectangle. */
        this.poly = new Polygon(this.rect);
        this.poly.transform(this.properties["matrix"]);
        return this.rect.transform(this.properties["matrix"]);
    };
    ImageNode.prototype.hittest = function (x, y) {
        /* we should do the inexpensive rect test first. */if (!this.properties["locked"] && this.poly.containsPoint(x, y, 3)) {
            return this;
        } else {
            return null;
        }
    };
    ImageNode.prototype._draw = function (ctx) {
        if (this.img === null) {
            ctx.save();
            ctx.lineWidth = 1.0;
            ctx.strokeStyle = "#cccccc";
            ctx.strokeRect(0, 0, this.width, this.height);
            return ctx.restore();
        } else {
            return ctx.drawImage(this.img, 0, 0);
        }
    }; ;
    /*
    Zwibbler
    
    Copyright 2013 Hanov Solutions Inc. All Rights Reserved. This software is
    NOT open source. For licensing information, contact the author.
    
    steve.hanov@gmail.com
    */
    //#include <BaseNode.js>
    //#include <log.js>
    /**
    The DOM node is one which is an HTML element that floats over the canvas.
    It is represented by some text. A hook into the containing application
    allows it to render the text into a DOM element.
    
    Here is what happens when a DomNode is created, either through a user
    action, or through loading a new document:
    
    1. The node is formatted. Since it does not have a real DOM element
    available, it will call into the FormatRequest object to
    convert the data string into a DOM element.
    
    2. If the external application has registered to receive the
    "convert-dom-request" event, then it will receive the data and a
    reference to this object. It will perform work to create a real HTML
    DOM element from the data string. When done, it calls the setElement
    method on the passed in object, which is a DomNode.
    
    3. Through the formatRequest object, the DomNode requests a reformat.
    
    4. ZwibblerView will reformat this node. Upon reformatting, the DomNode
    will have the element and be able to position it and calculate bouding
    box information.
    
    5. Done!
    
    @constructor
    @extends {BaseNode}
    */
    function DomNode(id) {
        this.initBase(id, DomNode);
        this.properties["data"] = "";
        this.element = null;

        // keep track of what we have requested to avoid duplicate requests.
        this.dataRequested = "";
    }

    DomNode.prototype = {
        log: log.create("DomNode", true),

        type: function () {
            return "DomNode";
        },

        setProperty: function (key, value) {
            if (key === "data") {
                if (this.element) {
                    $(this.element).remove();
                    this.element = null;
                    this.dataRequested = null;
                }
            }

            BaseNode.prototype.setProperty.call(this, key, value);
        },

        //@export DomNode.prototype.setElement
        setElement: function (element) {
            // Called by the external app as a result of a format request. After
            // the element is set, a format will be initiated by ZwibblerView

            this.log("Node %s receives DOM element and requests reformat", this.id);
            this.element = element;

            this.element.style.position = "absolute";
            this.element.style["pointerEvents"] = "none";
            $(this.formatRequest.canvas.parentNode).append(this.element);
            this.originalWidth = this.element.offsetWidth;
            this.originalHeight = this.element.offsetHeight;
            this.element.style.top = "0px";
            this.element.style.left = "0px";
            this._setStyle("transformOrigin", "top left");

            this.formatRequest.requestReformat(this);
        },

        _setStyle: function (name, value) {
            // This function sets a CSS3 style, taking into account all known
            // vendor prefixes.

            var upper = name.charAt(0).toUpperCase() + name.substr(1);
            var prefixes = ["ms", "Webkit", "O", "Moz"];
            for (var i = 0; i < prefixes.length; i++) {
                this.element.style[prefixes[i] + upper] = value;
            }

            this.element.style[name] = value;
        },

        format: function (ctx, request) {
            // If the element has not been set, then request it from the external
            // application.
            if (this.element === null && this.dataRequested !==
                    this.getProperty("data")) {

                this.dataRequested = this.getProperty("data");
                this.formatRequest = request;
                this.log("DomNode %s requests conversion to DOM element", this.id);
                this.formatRequest.convertDomRequest(this.dataRequested, this.id);
            }

            // If the DOM element has been received, then apply the transformation
            // matrix to it using CSS3 transforms, and calculate the bounding
            // rectangle.
            if (this.element) {
                var scale = request.getScale(),
                    matrix = this.getMatrix();

                // transform the bounding box; start with the elements original width/height
                this.rect.x = 0;
                this.rect.y = 0;
                this.rect.width = this.originalWidth;
                this.rect.height = this.originalHeight;
                this.rect.transform(matrix);

                // transform the dom element:
                // the canvas-drawn stuff is automatically scaled by the canvas' context (which is set in ZwibblerView.prototype.draw)
                // the element is sized by its content and CSS, and Is NOT drawn on the canvas
                // therfore, we must apply a scale transformation manually
                var scaleTransform = new ScaleMatrix(scale, scale),
                    elementTransform = scaleTransform.multiply(matrix);

                this._setStyle("transform", elementTransform.toCssTransformString());
            }
        },

        _draw: function (ctx) {
            // no need to draw a DOM element. But make a placeholder.
            if (!this.element) {
                ctx.beginPath();
                ctx.lineWidth = 1;
                ctx.fillStyle = "#888888";
                ctx.strokeStyle = "#CCCCCC";
                ctx.rect(0, 0, 100, 22);
                ctx.stroke();

                ctx.font = "20px Arial";
                ctx.textBaseline = "top";
                ctx.fillText("", 0, 0);
            }
        },


        hittest: function (x, y) {
            if (!this.properties["locked"] &&
                    this.rect.containsPoint(x, y)) {
                return this;
            } else {
                return null;
            }
        },

        onAdded: function () {
            // The item was added to the document.
            if (this.element) {
                document.body.appendChild(this.element);
            }
        },

        onRemoved: function () {
            // The item was removed from the document.
            if (this.element) {
                $(this.element).remove();
            }
        }
    };

    DomNode.prototype = $.extend({}, BaseNode.prototype, DomNode.prototype);
    /*
    Zwibbler
    
    Copyright 2013 Hanov Solutions Inc. All Rights Reserved. This software is
    NOT open source. For licensing information, contact the author.
    
    steve.hanov@gmail.com
    */
    //#include <Inherit.js>
    //#include <BaseNode.js>
    /** @constructor 
    @extends BaseNode
    
    This type of node is not drawn. However, it contains child nodes. All of
    them are moved as a group and when any one is selected the others are
    selected too.
    */
    function GroupNode(name) {
        this.init(name);
    }

    GroupNode.prototype.init = function (name) {
        this.initBase(name, GroupNode);
        this.parent = null;
        this.children = [];
    };

    GroupNode.prototype.type = function () {
        return "GroupNode";
    };

    GroupNode.prototype.clone = function (namer) {
        var clone = new GroupNode(namer());
        for (var i = 0; i < this.children.length; i++) {
            var child = this.children[i].clone(namer);
            child.parent = clone;
            clone.children.push(child);
        }

        return clone;
    };

    GroupNode.prototype.setProperty = function (key, value) {
        for (var i = 0; i < this.children.length; i++) {
            this.children[i].setProperty(key, value);
        }
    };

    GroupNode.prototype.format = function (ctx, request) {
        for (var i = 0; i < this.children.length; i++) {
            this.children[i].format(ctx, request);
            if (i === 0) {
                this.rect = this.children[i].rect.clone();
            } else {
                this.rect.union(this.children[i].rect);
            }
        }
    };

    GroupNode.prototype.draw = function (ctx) {
        for (var i = 0; i < this.children.length; i++) {
            this.children[i].draw(ctx);
        }
    };

    // hittest should return the node if the x,y point is over the shape.
    // Otherwise, it should return null.
    GroupNode.prototype.hittest = function (x, y) {
        for (var i = this.children.length - 1; i >= 0; i--) {
            var result = this.children[i].hittest(x, y);
            if (result) {
                return result;
            }
        }
        return null;
    };

    GroupNode.prototype.findChildIndex = function (child) {
        for (var i = 0; i < this.children.length; i++) {
            if (child === this.children[i]) {
                return i;
            }
        }

        return -1;
    };

    Inherit(BaseNode.prototype, GroupNode.prototype);

    /*
    Zwibbler
    
    Copyright 2013 Hanov Solutions Inc. All Rights Reserved. This software is
    NOT open source. For licensing information, contact the author.
    
    steve.hanov@gmail.com
    //#include <BaseNode.js>
    //#include <log.js>
    */
    /*
    The image node has a URL parameter and loads it from the server using a
    FormatRequest. When the URL is retrieved, the image is drawn and treated like
    any object.
    */
    /**
    * @constructor
    * @extends {BaseNode}
    */
    var MathNode = function (id) {
        this.initBase(id, MathNode);
        this.properties["mathml"] = "";
        this.img = null;
        this.width = 100;
        this.height = 20;
        this.poly = new Polygon();
        this.locked = false;
        this.zoomed = false;
    };
    __extends(MathNode, BaseNode);

    MathNode.prototype.log = log.create("MATHNODE", true);
    MathNode.prototype.type = function () {
        return "MathNode";
    };
    MathNode.prototype.setProperty = function (name, value) {
        this.properties[name] = value;
        if (name === "mathml") {
            this.img = null;
            return;
        }
    };

    MathNode.prototype.setImage = function (img) {
        if (!img) { return; }

        this.img = img;
    };

    MathNode.prototype.format = function (ctx, request) {
        if (this.img === null) {
            this.zoomed = false;
            this.rect = new Rectangle(0, 0, this.width, this.height);

            console.log("Format call in the math node.", ctx, request);

            request.add(this, "math", this.properties["mathml"], null, __bind(function (img, url) {
                this.log("Got math response.");
                this.img = img;
                if (this.img) {
                    return request.emit("reformat", this);
                }
            }, this));
        } else {
            this.realWidth = this.img.width;
            this.realHeight = this.img.height;
            this.zoomedWidth = this.img.width;
            this.zoomedHeight = this.img.height;
            this.rect = new Rectangle(0, 0, this.realWidth, this.realHeight);
        }
        /* create the precise bounding polygon, and the imprecise bounding */
        /* rectangle. */
        this.poly = new Polygon(this.rect);
        this.poly.transform(this.properties["matrix"]);
        return this.rect.transform(this.properties["matrix"]);
    };

    MathNode.prototype.hittest = function (x, y) {
        /* we should do the inexpensive rect test first. */if (!this.properties["locked"] && this.poly.containsPoint(x, y, 3)) {
            return this;
        } else {
            return null;
        }
    };

    /**
    *  Pass in the Zwibbler Context?
    */
    MathNode.prototype._draw = function (ctx) {
        console.log("What is the draw context?", ctx);
        if (this.img === null) {
            ctx.save();
            ctx.lineWidth = 1.0;
            ctx.strokeStyle = "#cccccc";
            ctx.strokeRect(0, 0, this.width, this.height);
            return ctx.restore();
        } else {
            try {
                return ctx.drawImage(this.img, 0, 0);
            } catch (e) {
                return console.error("Error drawing the image", e);
            }
        }
    };
    /*
    Zwibbler
    
    Copyright 2013 Hanov Solutions Inc. All Rights Reserved. This software is
    NOT open source. For licensing information, contact the author.
    
    steve.hanov@gmail.com
    //#include <BaseNode.js>
    //#include <log.js>
    */
    /**
    * @constructor
    * @extends {BaseNode}
    */
    var TextNode = function (id) {
        this.initBase(id, TextNode);
        this.applyDefaults(TextNode.defaults);
        this.properties["text"] = "lorum ipsum dolor";
        this.textWidth = 0;
        this.textHeight = 0;
        this.path = null;
        /* transformed path */
        this.xpath = null;
        this.bounds = [];
        this.lines = [];
    };
    __extends(TextNode, BaseNode);

    TextNode.prototype.log = log.create("TEXT", true);
    TextNode.prototype.type = function () {
        return "TextNode";
    };
    TextNode.prototype.setProperty = function (name, value) {
        this.properties[name] = value;
        if (name === "fontName" || name === "text") {
            this.path = null;
        }
        if (name === 'textFillStyle') {
            return this.properties['fillStyle'] = value;
        } else if (name === 'fillStyle') {
            return this.properties['textFillStyle'] = value;
        }
    };
    TextNode.prototype.strip = function (text) {
        /* strip trailing newlines */

        //check for text is null
        if (text === null)
            return '';

        var len;
        len = text.length;
        while (len > 0 && text[len - 1] === '\n') {
            len -= 1;
        }
        return text.substr(0, len);
    };
    TextNode.prototype.format = function (ctx, request) {
        var bl, br, i, line, lineHeight, matrix, pt, text, tl, tr, width, _i, _len, _ref;
        this.font = "" + this.properties["fontSize"] + "px " + this.properties["fontName"];
        ctx.font = this.font;
        if (ctx.getTextOutline) {
            ctx.textBaseline = "alphabetic";
            this.path = ctx.getTextOutline(this.properties["text"], 0, 0);
        }
        if (this.path === null) {
            /*
            if false
            @log "Making text outline request"
            request.add @, "text", "/getTextOutline",
            "text": @properties["text"]
            "fontSize": @properties["fontSize"]
            "fontName": @properties["fontName"]
            , (data) =>
            @log "Got path data: %s", data
            @path = data
            return
            */
            ctx.save();
            matrix = this.properties["matrix"];
            if (matrix.dx < 0) {
                matrix.dx = 0;
            }
            if (matrix.dx > ctx.canvas.width - this.textWidth) {
                matrix.dx = ctx.canvas.width - this.textWidth;
            }
            if (matrix.dy < this.textHeight) {
                matrix.dy = this.textHeight;
            }
            if (matrix.dy > ctx.canvas.height) {
                matrix.dy = ctx.canvas.height;
            }

            ctx.transform(matrix.m11, matrix.m21, matrix.m12, matrix.m22, matrix.dx, matrix.dy);
            i = 0;
            this.textWidth = 0;
            this.lines = [];
            text = this.strip(this.properties["text"]);
            lineHeight = this.properties["fontSize"];
            _ref = text.split("\n");
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                line = _ref[_i];
                this.lines.push({
                    text: line,
                    x: 0,
                    y: this.properties["fontSize"] * i
                });
                width = ctx.measureText(line).width;
                this.textWidth = Math.max(this.textWidth, width);
                i += 1;
            }
            this.textHeight = lineHeight * this.lines.length;
            ctx.restore();
            tl = matrix.apply(0, -lineHeight);
            tr = matrix.apply(this.textWidth, -lineHeight);
            br = matrix.apply(this.textWidth, lineHeight * (this.lines.length - 1));
            bl = matrix.apply(0, lineHeight * (this.lines.length - 1));
            this.bounds = [tl, tr, br, bl];
            this.rect = Rectangle.CreateBoundingBox(this.bounds);
        } else {
            /* we have the path. */
            /* calculate the rectangle */
            i = 0;
            matrix = this.properties["matrix"];
            this.xpath = this.path.concat();
            while (i < this.xpath.length) {
                switch (this.xpath[i]) {
                    case 0:
                    case 1:
                        pt = matrix.apply(this.xpath[i + 1], this.xpath[i + 2]);
                        this.xpath[i + 1] = pt.x;
                        this.xpath[i + 2] = pt.y;
                        if (i === 0) {
                            this.rect.x = pt.x;
                            this.rect.y = pt.y;
                            this.rect.width = 0;
                            this.rect.height = 0;
                        } else {
                            this.rect.unionPoint(pt.x, pt.y);
                        }
                        i += 3;
                        break;
                    case 2:
                        pt = matrix.apply(this.xpath[i + 1], this.xpath[i + 2]);
                        this.xpath[i + 1] = pt.x;
                        this.xpath[i + 2] = pt.y;
                        this.rect.unionPoint(pt.x, pt.y);
                        pt = matrix.apply(this.xpath[i + 3], this.xpath[i + 4]);
                        this.xpath[i + 3] = pt.x;
                        this.xpath[i + 4] = pt.y;
                        this.rect.unionPoint(pt.x, pt.y);
                        pt = matrix.apply(this.xpath[i + 5], this.xpath[i + 6]);
                        this.xpath[i + 5] = pt.x;
                        this.xpath[i + 6] = pt.y;
                        this.rect.unionPoint(pt.x, pt.y);
                        i += 7;
                        break;
                    case 3:
                        i += 1;
                        break;
                    default:
                        this.log("Bad path command: %s", this.xpath[i]);
                        i = this.xpath.length;
                        break;
                }
            }
        }
    };
    TextNode.prototype._draw = function (ctx) {
        var i, line, matrix, offset, _i, _len, _ref;
        if (this.path) {
            matrix = this.properties["inverse"];
            ctx.transform(matrix.m11, matrix.m21, matrix.m12, matrix.m22, matrix.dx, matrix.dy);
            ctx.beginPath();
            i = 0;
            while (i < this.xpath.length) {
                switch (this.xpath[i]) {
                    case 0:
                        ctx.moveTo(this.xpath[i + 1], this.xpath[i + 2]);
                        i += 3;
                        break;
                    case 1:
                        ctx.lineTo(this.xpath[i + 1], this.xpath[i + 2]);
                        i += 3;
                        break;
                    case 2:
                        ctx.bezierCurveTo(this.xpath[i + 1], this.xpath[i + 2], this.xpath[i + 3], this.xpath[i + 4], this.xpath[i + 5], this.xpath[i + 6]);
                        i += 7;
                        break;
                    case 3:
                        ctx.closePath();
                        i += 1;
                        break;
                    default:
                        this.log("Bad xpath command: %s", this.xpath[i]);
                        i = this.xpath.length;
                        break;
                }
            }
            ctx.fill();
            if (this.properties["lineWidth"] > 0) {
                ctx.shadowColor = "rgba(0,0,0,0.0)";
                ctx.stroke();
            }
        } else {
            ctx.font = this.font;
            ctx.textBaseline = "alphabetic";
            offset = 0;
            /* we don't support alphebetic baseline on the server. */
            if (window["IN_SERVER_CGI"] === true) {
                offset = -this.properties["fontSize"];
            }
            _ref = this.lines;
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                line = _ref[_i];
                if (this.properties["lineWidth"] > 0.0) {
                    ctx.strokeText(line.text, line.x, line.y + offset);
                }
                ctx.fillText(line.text, line.x, line.y + offset);
            }
        }
    }; ;
    TextNode.defaults = {
        "textFillStyle": "#000000",
        "fontName": "Arial",
        "fontSize": 20,
        "lineWidth": 0,
        "fillStyle": "#000000"
    };
    /*
    Zwibbler
    
    Copyright 2013 Hanov Solutions Inc. All Rights Reserved. This software is
    NOT open source. For licensing information, contact the author.
    
    steve.hanov@gmail.com
    
    //#include <BaseNode.js>
    //#include <log.js>
    */
    /*
    The Brush node has a sequence of points that the user moused over, and it draws
    a thick line over them.
    
    Properties:
    points: an array of x, y coordinates.
    lineWidth
    
    */
    /**
    * @constructor
    * @extends {BaseNode}
    */
    var BrushNode = function (id) {
        this.initBase(id, BrushNode);
        this.log("New BrushNode created.");
        /* untransformed points */
        this.properties["points"] = [];
        this.properties["strokeStyle"] = "#ff00ff";
        this.properties["lineWidth"] = 10;
        /* untransformed points in the form of Point objects. */
        this.points = [];
        /* inverse matrix */
        this.inverse = null;
    };
    __extends(BrushNode, BaseNode);

    BrushNode.prototype.log = log.create("BRUSH", true);
    BrushNode.prototype.type = function () {
        return "BrushNode";
    };
    BrushNode.prototype.setProperty = function (name, value) {
        if (name === "fillStyle") {
            name = "strokeStyle";
        }
        if (name in this.properties) {
            return this.properties[name] = value;
        }
    };
    BrushNode.prototype.format = function (ctx, request) {
        /* create a list of untransformed points so we can accurately hittest. */
        var i, points, poly, rect, _ref;
        this.points.length = 0;
        points = this.properties["points"];
        for (i = 0, _ref = points.length - 1; i <= _ref; i += 2) {
            this.points.push(new Point(points[i], points[i + 1]));
        }
        /* Find bounding box of untransformed points, inflate, convert to */
        /* polygon, transform it, and then find the bounding box of that */
        /* polygon. */
        rect = Rectangle.CreateBoundingBox(this.points);
        rect.inflate(this.properties["lineWidth"] + 3, this.properties["lineWidth"] + 3);
        poly = new Polygon(rect);
        poly.transformWRTContext(this.properties["matrix"], ctx);
        this.rect = Rectangle.CreateBoundingBox(poly.points);
        return this.inverse = this.properties["matrix"].inverse();
    };
    BrushNode.prototype.hittest = function (x, y) {
        /* do inexpensive bounding box test. */
        var point;
        if (this.rect.containsPoint(x, y)) {
            /* transform to our coordinate space and check if the point is near */
            /* the path. */
            point = this.inverse.apply(x, y);
            if (PointNearPath(this.points, point.x, point.y, this.properties["lineWidth"] / 2)) {
                return this;
            }
        }
        return null;
    };
    BrushNode.prototype._draw = function (ctx) {
        /* Matrix is already applied.. just draw */
        var i, points, _ref;
        points = this.properties["points"];
        if (points.length === 0) {
            return;
        }
        ctx.save();
        ctx.beginPath();
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.moveTo(points[0], points[1]);
        for (i = 2, _ref = points.length - 1; i <= _ref; i += 2) {
            ctx.lineTo(points[i], points[i + 1]);
        }
        ctx.stroke();
        return ctx.restore();
    }; ;
    /*
    Zwibbler
    
    Copyright 2013 Hanov Solutions Inc. All Rights Reserved. This software is
    NOT open source. For licensing information, contact the author.
    
    steve.hanov@gmail.com
    //#include <Graphics.js>
    //#include <BrushNode.js>
    //#include <log.js>
    */
    /*
    Draw brush. The user will first click, hold down the mouse button
    while moving, and then release the button. 
    */
    /**
    * @constructor
    */
    var DrawBrushBehaviour = function (view, previousBehaviour) {
        this.view = view;
        this.previousBehaviour = previousBehaviour;
        this.dragging = false;
        /* for each finger, an array of points. */
        this.paths = [];
    };

    DrawBrushBehaviour.prototype.log = log.create("Brush");
    DrawBrushBehaviour.prototype.enter = function () {
        this.view.setHintText("Hold down the button to draw");
        this.view.canvas.style.cursor = "crosshair";
    };
    DrawBrushBehaviour.prototype.reset = function () {
        this.dragging = false;
        this.paths = [];
    };
    DrawBrushBehaviour.prototype.onTouch = function (e) {
        var p, path, touch, _i, _j, _len, _len2, _ref, _ref2, _results, _results2;
        if (e.type === "touchstart") {
            _ref = e.changedTouches;
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                touch = _ref[_i];
                p = this.view.screenPoint(touch.pageX, touch.pageY);
                this.paths.push([p]);
            }
        } else if (e.type === "touchmove") {
            _ref2 = e.changedTouches;
            // For each touch point tracked on the screen, find the nearest path to
            // associate it with and add it.
            for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
                touch = _ref2[_j];
                p = this.view.screenPoint(touch.pageX, touch.pageY);
                path = this.findNearest(p);
                if (p.x !== path[path.length - 1].x || p.y !== path[path.length - 1].y) {
                    path.push(p);
                    this.draw(path);
                }
            }
        } else if (e.type === "touchend") {
            if (e.touches.length === 0) {
                this.commit();
            }
        }
    };
    DrawBrushBehaviour.prototype.findNearest = function (point) {
        var best, bestDist, path, _i, _len, _ref;
        best = null;
        bestDist = 1000000;
        _ref = this.paths;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            path = _ref[_i];
            if (best === null || path[path.length - 1].distanceTo(point) < bestDist) {
                best = path;
                bestDist = path[path.length - 1].distanceTo(point);
            }
        }
        return best;
    };
    DrawBrushBehaviour.prototype.onMouseDown = function (x, y) {
        var pt;
        pt = this.view.snap(new Point(x, y));
        this.dragging = true;
        this.view.setHintText(null);
        return this.paths.push([pt]);
    };
    DrawBrushBehaviour.prototype.draw = function (points) {
        this.from = points[points.length - 2];
        this.to = points[points.length - 1];
        this.view.ctx.beginPath();
        this.view.ctx.moveTo(this.from.x, this.from.y);
        this.view.ctx.lineTo(this.to.x, this.to.y);
        this.stroke(this.view.ctx);
    };

    /**
    Stroke the path (already in the context) with the brush style.
    */
    DrawBrushBehaviour.prototype.stroke = function (ctx) {
        ctx.strokeStyle = this.view.defaultBrushStyle;
        ctx.lineCap = "round";
        ctx.joinCap = "round";
        ctx.lineWidth = this.view.defaultBrushThickness;
        ctx.stroke();
    };

    /**
    Called when the view is redrawn. Since the brush strokes currently being
    drawn are not part of the document  yet, we will have to draw all the paths
    again.
    
    @param {CanvasRenderingContext2D} ctx
    */
    DrawBrushBehaviour.prototype.onRedraw = function (ctx) {
        if (this.paths.length === 0) {
            return;
        }
        ctx.beginPath();
        for (var i = 0; i < this.paths.length; i++) {
            var path = this.paths[i];
            ctx.moveTo(path[0].x, path[0].y);
            for (var j = 1; j < path.length; j++) {
                var p = path[j];
                ctx.lineTo(p.x, p.y);
            }
        }

        this.stroke(ctx);
    };

    DrawBrushBehaviour.prototype.onMouseMove = function (x, y) {
        var pt;
        pt = this.view.snap(new Point(x, y));
        if (this.dragging) {
            this.from = this.paths[0][this.paths[0].length - 1];
            if (pt.x !== this.from.x || pt.y !== this.from.y) {
                this.paths[0].push(pt);
                this.draw(this.paths[0]);
            }
        }
    };
    DrawBrushBehaviour.prototype.onMouseUp = function (x, y) {
        this.onMouseMove(x, y);
        this.dragging = false;
        this.commit();
        this.view.pickTool();
    };
    DrawBrushBehaviour.prototype.commit = function () {
        var actions, commands, i, path, _i, _len, _ref, _ref2;
        actions = [];
        _ref = this.paths;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            path = _ref[_i];
            commands = [];
            for (i = 0, _ref2 = path.length - 1; i <= _ref2; i += 1) {
                commands.push(path[i].x);
                commands.push(path[i].y);
            }
            actions.push(new CreateAction("BrushNode", {
                "points": commands,
                "strokeStyle": this.view.defaultBrushStyle,
                "lineWidth": this.view.defaultBrushThickness
            }));
        }
        this.view.commit(actions);
        this.reset();
    };
    DrawBrushBehaviour.prototype.leave = function () {
        this.view.canvas.style.cursor = "default";
        this.view.setHintText(null);
        this.view.draw();
    };

    DrawBrushBehaviour.prototype.onColourClicked = function (e) {
        if (e.button === 1) {
            this.view.defaultBrushStyle = e.colour;
        }
    };

    DrawBrushBehaviour.prototype.onKeyCommand = function (action, e) {
        if (action === "cancel") {
            this.log("ESC pressed. Abort brush and go back to toolbar.");
            this.view.pickTool();
            this.view.eventSource.emit("goto-toolbar");
        }
    };

    //#include <EventEmitter.js>
    //#include <log.js>
    //#include <Inherit.js>

    /** 
    The KeyboardMap translates from a browser keyboard event to a user action,
    which is a string.
    
    It is configured by adding mappings from a keystring to an action. Example
    keystrings are:
    
    C
    Shift+Ctrl+alt+A
    !
    PageUp
    PageDown
    Left
    Right
    Up
    Down
    
    Case does not matter.
      
    @constructor
    @extends EventEmitter
    */
    function KeyboardMap() {
        EventEmitter.call(this);
        this.init();
    }

    KeyboardMap.prototype = {

        init: function () {
            /*
            Mapping from key descriptor to an array of action strings.
            A key descriptor is:
    
            <keycode>-shift-control-alt
            */
            this.keys = {};

            // tell the event emitter not to log events. we will do it.
            this.nolog = true;

            this.specialWords = new RegExp([
                "alt",
                "control",
                "ctrl",
                "del",
                "delete",
                "down",
                "end",
                "esc",
                "enter",
                "home",
                "ins",
                "insert",
                "left",
                "pagedown",
                "pageup",
                "right",
                "shift",
                "up",
                "backspace"
            ].sort(function (a, b) {
                return b.length - a.length;
            }).join("|"), "g");

            // declare a handler that can be used to attach and detatch to DOM
            // elements.
            var self = this;
            this.handler = function (e) {
                self.handleKeyboardEvent(e);
            };
        },

        log: log.create("KEYMAP"),

        /**
        Add a mapping between a key description and an action.
    
        Multiple keys or actions can be separated by ","
    
        @param {string} keyString
        @param {string} actionString
        */
        map: function (keyString, actionString) {

            var keys = keyString.toLowerCase().split(",");
            var actions = actionString.split(",");
            for (var i = 0; i < keys.length; i++) {
                for (var j = 0; j < actions.length; j++) {
                    this._addMapping(keys[i], actions[j]);
                }
            }
        },

        /** 
        Parse the key string into 
        */
        _addMapping: function (keyString, action) {
            if (keyString.length === 0) {
                return false;
            }

            // look for shift, control, alt
            var words = keyString.match(this.specialWords) || [];

            // the rest of the function fills in the modifiers and keycodes.
            var shift = false;
            var control = false;
            var alt = false;

            // array of keycodes to look for
            var codes = [];
            var i;

            // look for special keys esc, left, right, up, down, home, end, pageup,
            // pagedown, insert, delete, ins, del
            for (i = 0; i < words.length; i++) {
                switch (words[i]) {
                    case "alt":
                        alt = true;
                        break;
                    case "control":
                    case "ctrl":
                        control = true;
                        break;
                    case "shift":
                        shift = true;
                        break;
                    case "shift":
                        shift = true;
                        break;
                    case "home":
                        codes.push(36);
                        break;
                    case "end":
                        codes.push(35);
                        break;
                    case "pageup":
                        codes.push(33);
                        break;
                    case "pagedown":
                        codes.push(34);
                        break;
                    case "delete":
                    case "del":
                        codes.push(46);
                        break;
                    case "backspace":
                        codes.push(8);
                        break;
                    case "up":
                        codes.push(38);
                        break;
                    case "right":
                        codes.push(39);
                        break;
                    case "down":
                        codes.push(40);
                        break;
                    case "left":
                        codes.push(37);
                        break;
                    case "esc":
                        codes.push(27);
                        break;
                    case "enter":
                        codes.push(13);
                        break;
                    default:
                        console.error("key entry not found: " + words[i]);
                        break;
                }
            }

            var self = this;
            var assign = function (key) {
                if (shift && key.indexOf("-shift") === -1) {
                    key += "-shift";
                }
                if (control && key.indexOf("-control") === -1) {
                    key += "-control";
                }
                if (alt && key.indexOf("-alt") === -1) {
                    key += "-alt";
                }
                self.log("Keyboard mapping: %s->%s", key, action);
                if (key in self.keys) {
                    // add the action if it doesn't already exit.
                    var i = 0;
                    var actions = self.keys[key];
                    for (i = 0; i < actions.length; i++) {
                        if (actions[i] === action) {
                            break;
                        }
                    }
                    if (i === actions.length) {
                        self.keys[key].push(action);
                    }
                } else {
                    self.keys[key] = [action];
                }
            };

            // if no special key found, assume final character is what we are
            // looking for.
            if (codes.length === 0) {
                var ch = keyString.toUpperCase()[keyString.length - 1];
                switch (ch) {
                    case "=":
                        assign("107-shift");
                        assign("187");
                        assign("61");
                        break;
                    case "+":
                        assign("107");
                        assign("61-shift");
                        break;
                    case "-":
                        assign("109");
                        assign("189");
                        assign("173");
                        break;

                    default:
                        codes.push(ch.charCodeAt(0));
                        break;
                }
            }

            // for each code, add the mapping.
            for (i = 0; i < codes.length; i++) {
                assign("" + codes[i]);
            }
        },

        getKeyName: function (e) {
            var key = "";
            if (e.keyCode) {
                key += e.keyCode;
            }

            if (e.shiftKey) {
                key += "-shift";
            }

            if (e.ctrlKey) {
                key += "-control";
            }

            if (e.altKey) {
                key += "-alt";
            }

            return key;
        },

        /**
        Translate a browser event into an action.
        */
        translate: function (e) {
            var actions = [];
            var key = this.getKeyName(e);

            if (key in this.keys) {
                actions = this.keys[key];
            }

            this.log("%s", key);
            return actions;
        },

        each: function (e, fn) {
            var actions = this.translate(e);
            for (var i = 0; i < actions.length; i++) {
                fn(actions[i]);
            }
        },

        handleKeyboardEvent: function (e) {
            var actions = this.translate(e);
            for (var i = 0; i < actions.length; i++) {
                this.log("action: %s", actions[i]);
                this.emitNow("*", actions[i], e);
            }
        },

        attachTo: function (element) {
            element.addEventListener("keydown", this.handler, false);
        }
    };

    Inherit(EventEmitter.prototype, KeyboardMap.prototype);

    /** @constructor */
    function Panel(div) {
        this.initPanel(div);
    }

    Panel.prototype.initPanel = function (div) {
        this.div = div || $("<div>");

        /*
        this.div.css("position", "absolute");
        this.div.css("margin", "0px");
        this.div.css("padding", "0px");
        */

        $("body").append(this.div);
    };

    /** @param {number=} width */
    Panel.prototype.width = function (width) {
        var self = this;
        function get(name) {
            var v = parseInt(self.div.css(name), 10);
            if (isNaN(v)) {
                return 0;
            } else {
                return v;
            }
        }

        if (width === undefined) {
            return this.div.outerWidth();
        } else {
            width -= get("border-left-width");
            width -= get("border-right-width");
            width -= get("padding-right");
            width -= get("padding-left");
            width -= get("margin-left");
            width -= get("margin-right");
            this._width = width;
            this.div.css("width", "" + width + "px");
        }
    };

    /** @param {number=} height */
    Panel.prototype.height = function (height) {
        var self = this;
        function get(name) {
            var v = parseInt(self.div.css(name), 10);
            if (isNaN(v)) {
                return 0;
            } else {
                return v;
            }
        }
        if (height === undefined) {
            return this.div.outerHeight();
        } else {
            height -= get("border-top-width");
            height -= get("border-bottom-width");
            height -= get("padding-top");
            height -= get("padding-bottom");
            height -= get("margin-top");
            height -= get("margin-bottom");
            this._height = height;
            this.div.css("height", "" + this._height + "px");
        }
    };

    Panel.prototype.moveTo = function (x, y) {
        this.div.css("left", "" + x + "px");
        this.div.css("top", "" + y + "px");
    };

    Panel.prototype.show = function () {
        this.div.show();
    };

    Panel.prototype.hide = function () {
        this.div.hide();
    };

    Panel.prototype.destroy = function () {
        this.div.remove();
    };
    /*
    Zwibbler
    
    Copyright 2013 Hanov Solutions Inc. All Rights Reserved. This software is
    NOT open source. For licensing information, contact the author.
    
    steve.hanov@gmail.com
    //#include <Panel.js>
    //#include <log.js>
    */
    /*
    A div that hooks into the @log framework and displays lines that are
    logged.
    
    To see debugging output, enable the "debug" configuration property or
    include #debug at the end of the URL.
    */
    /**
    * @constructor
    * @extends {Panel}
    */
    var DebugPanel = function (div) {
        Panel.apply(this, arguments);
        this.div.css("background", "black");
        this.div.css("font-family", "\"Lucida Console\",\"Dejavu Sans Mono\",Monospace,\"Courier New\"");
        this.div.css("font-size", "10px");
        this.div.css("line-height", "12px");
        this.div.css("overflow", "scroll");
        this.div.css("z-index", 1);
        this.nextColour = 0;
        this.keyColours = {};
        this.curColour = this.colours[0];
        this.shown = false;
        this.width(300);
        log.addListener(__bind(function (key, line) {
            return this.addLine(key, line);
        }, this));
        this.timeout = null;
        this.lines = [];
        this.addLine("DEBUG", "Debug window starting");
    };
    __extends(DebugPanel, Panel);

    DebugPanel.prototype.colours = ["#ffffff", "#008800", "#008888", "#880000", "#880088", "#884400", "#888888", "#444444", "#0000ff", "#00ff00", "#00ffff", "#ff0000", "#ff00ff", "#ffff00"];
    DebugPanel.prototype.show = function () {
        Panel.prototype.show.apply(this, arguments);
        this.shown = true;
        this._addLine();
        this.div[0].scrollTop = this.div[0].scrollHeight;
    };
    DebugPanel.prototype.hide = function () {
        this.shown = false;
        return Panel.prototype.hide.apply(this, arguments);
    };
    DebugPanel.prototype.getColourOf = function (key) {
        if (!(key in this.keyColours)) {
            this.keyColours[key] = this.colours[this.nextColour];
            this.nextColour = (this.nextColour + 1) % this.colours.length;
        }
        return this.keyColours[key];
    };
    DebugPanel.prototype.addLine = function (key, line) {
        var part, _i, _len, _ref;
        var self = this;
        _ref = line.split('\n');
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            part = _ref[_i];
            this.lines.push({
                key: key,
                line: part
            });
        }
        /* wait a bit so the logging doesn't slow things down. */
        if (this.shown && this.timeout === null) {
            this.timeout = setTimeout(function () {
                self._addLine();
            }, 100);
        }
    };
    DebugPanel.prototype._addLine = function () {
        var atBottom, colour, div, item, key, line, _i, _len, _ref;
        atBottom = true;
        _ref = this.lines;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            item = _ref[_i];
            key = item.key;
            line = item.line;
            colour = this.getColourOf(key);
            div = $("<div>").css("color", colour);
            div.css("border-bottom", "1px solid #222");
            div.text("" + key + ": " + line);
            this.div.append(div);
        }
        if (atBottom) {
            this.div[0].scrollTop = this.div[0].scrollHeight;
        }
        this.timeout = null;
        this.lines.length = 0;
    };
    var ImageLoader = {
        loading: [],
        timeoutRunning: null,

        timeout: function () {
            var self = ImageLoader;
            var repl = [];
            for (var i = 0; i < self.loading.length; i++) {
                if (self.loading[i].complete) {
                    self.loading[i].fn(self.loading[i],
                            self.loading[i].srcWanted);
                } else {
                    repl.push(self.loading[i]);
                }

            }
            self.loading = repl;

            if (self.loading.length) {
                setTimeout(self.timeout, 250);
            } else {
                self.timeoutRunning = false;
            }
        },

        load: function (url, fn) {
            var self = ImageLoader;
            var img = new Image();
            self.loading.push(img);
            img.fn = fn;
            img.src = url;
            img.srcWanted = url;
            img.onload = function () {
                if (img.complete) {
                    for (var i = 0; i < self.loading.length; i++) {
                        if (self.loading[i] === this) {
                            self.loading.splice(i, 1);
                            fn(img, img.srcWanted);
                            break;
                        }
                    }

                } else if (!self.timeoutRunning) {
                    self.timeoutRunning = true;
                    // bug in firefox?
                    setTimeout(self.timeout, 250);
                }
            };

            return img;
        },

        loadDebug: function (url, fn) {
            // load, after a random timeout.
            setTimeout(function () {
                ImageLoader.load(url, fn);
            }, Math.floor(Math.random() * 2500));
        }
    };
    /*
    Zwibbler
    
    Copyright 2013 Hanov Solutions Inc. All Rights Reserved. This software is
    NOT open source. For licensing information, contact the author.
    
    steve.hanov@gmail.com
    //#include <log.js>
    //#include <EventEmitter.js>
    //#include <ImageLoader.js>
    //#include <Graphics.js>
    */
    /*
    During formatting, some nodes might need to request additional resources from
    the server. For example, an image. Until they get the image, they format
    themselves temporarily. When the request completes, the node will be
    reformatted and the document redrawn.
    
    Nodes may be formatted very frequently, so this handles ignoring older and
    duplicate requests too.
    
    In addition, to avoid performance problems with the server, only one 
    outstanding request is made at a time. The rest will be queued.
    */
    /**
    * @constructor
    * @extends {EventEmitter}
    */
    var FormatRequest = function () {
        EventEmitter.apply(this, arguments);
        this.queue = [];
        this.busy = false;
        this.mathjax = null;

        // The DOM element of the canvas, for computation of its rect.
        this.canvas = null;
    };
    __extends(FormatRequest, EventEmitter);

    FormatRequest.prototype.log = log.create("FORMAT", true);
    /* Add a format request from the given node. The request overrides any */
    /* previous requests from the node and url. */
    FormatRequest.prototype.add = function (node, type, url, params, callback) {
        var item, _i, _len, _ref;
        _ref = this.queue;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            item = _ref[_i];
            if (item.type === type && item.node === node) {
                item.skip = true;
            }
        }
        this.log("Request URL %s", url);
        this.queue.push({
            node: node,
            type: type,
            url: url,
            params: params,
            callback: callback,
            skip: false
        });
        return this.check();
    };

    FormatRequest.prototype.check = function () {
        console.log("Checking the format request.");
        var index, item;
        index = 0;
        while (!this.busy && index < this.queue.length) {
            if (this.queue[0].skip) {
                this.queue.shift();
                continue;
            }
            this.busy = true;
            item = this.queue[index];
            this.log("Processing request for item %s url=%s", item.node.id, item.url);
            if (item.type.indexOf("image") === 0) {
                ImageLoader.load(item.url, __bind(function (img, url) {
                    this.log("Image request completed for item %s", item.node.id);
                    item.callback(img, url);
                    this.log("Image request completed for url %s", url);
                    this.busy = false;
                    item.skip = true;
                    this.check();
                }, this));
            } else {
                /* note: the "complete" member doesn't get called in the case of */
                /* error in some versions of jquery */
                $.ajax({
                    "url": item.url,
                    "data": item.params,
                    "dataType": "json",
                    "success": __bind(function (data) {
                        if (!item.skip) {
                            this.log("Request completed for item %s", item.node.id);
                            item.callback(data);
                            this.emit("reformat", item.node);
                            this.busy = false;
                            this.queue.shift();
                            this.check();
                        }
                    }, this),
                    "error": __bind(function (jqXHR, textStatus, errorThrown) {
                        this.log("Error: %s %s", textStatus, errorThrown);
                        this.busy = false;
                        this.queue.shift();
                        this.check();
                    }, this)
                });
            }
        }
    };

    FormatRequest.prototype.getCanvasRect = function () {
        var offset = $(this.canvas).offset();
        return new Rectangle(offset.left, offset.top, this.canvas.width,
                this.canvas.height);

    };

    FormatRequest.prototype.convertDomRequest = function (dataString, domNodeId) {
        this.emit("convert-dom-request", dataString, domNodeId);
    };

    FormatRequest.prototype.requestReformat = function (node) {
        this.emit("reformat", node);
    };
    /*
    Zwibbler
    
    Copyright 2013 Hanov Solutions Inc. All Rights Reserved. This software is
    NOT open source. For licensing information, contact the author.
    
    steve.hanov@gmail.com
    //#include <Panel.js>
    //#include <ImageLoader.js>
    //#include <log.js>
    */
    /*
    This is a div that contains images that the user can select.
    */
    /**
    * @constructor
    * @extends {Panel}
    */
    var ListView = function (parent) {
        Panel.call(this, $("<div>"));
        parent.append(this.div);
        this.events = {};
        this.maxWidth = 60;
        this.spacing = 5;
        this.div.css("overflow-x", "auto");
        this.div.css("overflow-y", "auto");
        this.layout = "grid";
        /* The next index of image that is being inserted. */
        this.nextIndex = 0;
        /* Used to avoid issues with asynchronously loading images. */
        this.generation = 1;
        /* an array of objects of this form: */
        /*    img: a jQuery object containing an img */
        this.cells = [];
    };
    __extends(ListView, Panel);

    ListView.prototype.on = function (name, fn) {
        return this.events[name] = fn;
    };
    ListView.prototype.setIconWidth = function (width, height) {
        return this.maxWidth = width;
    };
    ListView.prototype.log = log.create("ListView");
    ListView.prototype.setLayout = function (layout) {
        this.layout = layout;
        if (this.layout !== 'grid') {
            return this.div.css("white-space", "no-wrap");
        }
    };
    ListView.prototype.addImage = function (url, data) {
        var cell, generation;
        generation = this.generation;
        cell = {
            img: null,
            index: this.nextIndex,
            inserted: false
        };
        this.nextIndex += 1;
        /* carefully take into the account the fact that images may load at */
        /* different times. We still want them to appear in order. */
        return ImageLoader.load(url, __bind(function (img) {
            var height, ratio, width;
            if (generation !== this.generation) {
                return;
            }
            width = img.width;
            height = img.height;
            if (width > this.maxWidth) {
                ratio = height / width;
                img.width = this.maxWidth;
                img.height = this.maxWidth * ratio;
            }
            img = $(img);
            img.css("margin", "" + this.spacing + "px");
            img.css("border-width", "3");
            img.css("border-color", "white");
            img.css("border-style", "solid");
            img.css("image-rendering", "optimizeQuality");
            img.mouseenter(__bind(function (e) {
                this.log("Mouseenter");
                return img.css("border-color", "#888888");
            }, this));
            img.mouseleave(function (e) {
                return img.css("border-color", "white");
            });
            img.click(__bind(function (e) {
                if ("click" in this.events) {
                    return this.events["click"](data);
                }
            }, this));
            cell.img = img;
            this.cells.push(cell);
            this.cells.sort(function (a, b) {
                return a.index - b.index;
            });
            /* now insert the image into the proper place in the dom */
            return this.format();
        }, this));
    };
    ListView.prototype.format = function () {
        var cell, prev, _i, _len, _ref, _results;
        prev = null;
        _ref = this.cells;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            cell = _ref[_i];
            /* if the cell is not inserted into the dom, */
            if (!cell.inserted) {
                /* if it's the first one, */
                if (prev === null) {
                    this.div.prepend(cell.img);
                } else {
                    prev.img.after(cell.img);
                }
                cell.inserted = true;
            }
            _results.push(prev = cell);
        }
        return _results;
    };
    ListView.prototype.clear = function () {
        this.div.empty();
        this.cells.length = 0;
        return this.generation += 1;
    }; ;
    /*
    Zwibbler
    
    Copyright 2013 Hanov Solutions Inc. All Rights Reserved. This software is
    NOT open source. For licensing information, contact the author.
    
    steve.hanov@gmail.com
    */
    /** @constructor 
    Generates a pseudo-random sequence. We need this predicatble randomness to
    make the Path shapes look hand drawn. Using a pseudo-random sequence reduces
    the storage requirements when saving the document.
    */
    function RandomSequence(seed) {
        this.init(seed);
    }

    RandomSequence.prototype = {
        init: function (seed) {
            if (typeof seed === "string") {
                while (seed.length < 8) {
                    seed = seed + seed;
                }
                var d = 0x01000193;
                for (var i = 0; i < seed.length; i++) {
                    d = ((d * 0x01000193) ^ seed.charCodeAt(i)) & 0xffffffff;
                }

                seed = d;
            }
            this.seed = seed;
            this.reset();
        },

        reset: function () {
            this.m_w = this.seed;
            this.m_z = this.seed;
        },

        next: function () {
            this.m_z = 36969 * (this.m_z & 65535) + (this.m_z >> 16);
            this.m_w = 18000 * (this.m_w & 65535) + (this.m_w >> 16);
            var value = (this.m_z << 16) + this.m_w;
            return value / 0xffffffff / 2 + 0.5;
        }
    };
    /*
    Zwibbler
    
    Copyright 2013 Hanov Solutions Inc. All Rights Reserved. This software is
    NOT open source. For licensing information, contact the author.
    
    steve.hanov@gmail.com
    */
    /*
    Copyright 2010 Hanov Solutions Inc. All Rights Reserved
    
    steve.hanov@gmail.com
    */
    //#include <Graphics.js> 
    //#include <TextNode.js>
    //#include <Segments.js>
    //#include <RandomSequence.js>
    //#include <BaseNode.js>
    /*jslint sub: true */

    /** @const */
    // show reduction of bezier curves to line segments
    var SHOW_LINES = false;

    // show control points of bezier curves
    var SHOW_CONTROL_POINTS = false;

    /**
    @constructor 
    @param {number} name
    @extends BaseNode
    */
    function PathNode(name) {
        this.init(name);
    }

    PathNode.defaults = {
        "strokeStyle": "#000000",
        "fillStyle": "#ffffff",
        "textFillStyle": "#000000",
        "fontName": "Arial",
        "fontSize": 20,
        "lineWidth": 2,
        "smoothness": 0.3,
        "sloppiness": 0.5,
        "shadow": false,
        "closed": false,
        "arrowSize": 0,
        "text": "",
        "isTextEditable": true
    };

    // bezier curve approximation (for bounding box) can be up to this many
    // pixels off.
    PathNode.BEZIER_ERROR = 16;

    PathNode.MOVE_TO = 0;
    PathNode.LINE_TO = 1;
    PathNode.QUADRATIC_TO = 2;
    PathNode.ARC_TO = 3;
    PathNode.BEZIER_TO = 4;
    PathNode.CURVE_TO = 5;
    PathNode.CORNER_TO = 6;
    PathNode.CLOSE = 7;

    PathNode.KAPPA = 0.5522847498;

    PathNode.CommandLengths = [];
    PathNode.CommandLengths[PathNode.MOVE_TO] = 2;
    PathNode.CommandLengths[PathNode.LINE_TO] = 2;
    PathNode.CommandLengths[PathNode.QUADRATIC_TO] = 4;
    PathNode.CommandLengths[PathNode.ARC_TO] = 5;
    PathNode.CommandLengths[PathNode.BEZIER_TO] = 6;
    PathNode.CommandLengths[PathNode.CURVE_TO] = 2;
    PathNode.CommandLengths[PathNode.CORNER_TO] = 4;
    PathNode.CommandLengths[PathNode.CLOSE] = 0;


    /**
    @param {number} name
    */
    PathNode.prototype.init = function (name) {
        this.initBase(name, PathNode);
        this.applyDefaults(PathNode.defaults);
        this.properties["closed"] = false;
        this.properties["commands"] = [];
        this.segments = [];
        this.properties["seed"] = 0;

        this.textNode = new TextNode(0);
        this.textNode.setProperty("text", this.properties["text"]);
    };

    /**
    @param {number} x
    @param {number} y
    */
    PathNode.prototype.moveTo = function (x, y) {
        var commands = this.properties["commands"];
        commands.push(PathNode.MOVE_TO);
        commands.push(x);
        commands.push(y);
    };

    /**
    @param {number} c1x
    @param {number} c1y
    @param {number} c2x
    @param {number} c2y
    @param {number} x
    @param {number} y
    */
    PathNode.prototype.bezierTo = function (c1x, c1y, c2x, c2y, x, y) {
        var commands = this.properties["commands"];
        commands.push(PathNode.BEZIER_TO);
        commands.push(x);
        commands.push(y);
        commands.push(c1x);
        commands.push(c1y);
        commands.push(c2x);
        commands.push(c2y);
    };

    /**
    @return {string}
    */
    PathNode.prototype.type = function () {
        return "PathNode";
    };

    /**
    @param {Array.<number>} commands
    */
    PathNode.prototype.setPath = function (commands) {
        var old = this.properties["commands"];
        this.properties["commands"] = commands;
        return old;
    };

    /**
    @return {Array.<number>}
    */
    PathNode.prototype.getPath = function () {
        return this.properties["commands"];
    };

    /**
    @param {string} key
    @param {string|number|Array.<number>|Matrix} value
    */
    PathNode.prototype.setProperty = function (key, value) {
        BaseNode.prototype.setProperty.apply(this, arguments);
        if (key === "fontName" || key === "fontSize" || key === "text") {
            this.textNode.setProperty(key, value);
        } else if (key === "textFillStyle") {
            this.textNode.setProperty("fillStyle", value);

            // don't do this. This is bad for importing old documents.
            //} else if ( key === 'fillStyle' && this.properties["closed"] === false ) {
            //    this.properties["strokeStyle"] = value;
        }
    };

    PathNode.prototype.moveEditHandle = function (index, x, y) {
        var pos = 0;
        var commands = this.properties["commands"];
        for (var i = 0; i < index; i++) {
            pos += PathNode.CommandLengths[commands[pos]] + 1;
        }

        var point = this.properties["matrix"].apply(commands[pos + 1],
            commands[pos + 2]);

        point = this.properties["inverse"].apply(point.x + x, point.y + y);
        commands[pos + 1] = point.x;
        commands[pos + 2] = point.y;

        // if the segment is a bezier curve to, then also move its control points.
        /*
        if ( commands[pos] === PathNode.BEZIER_TO ) {
        for( i = pos + 3; i < pos + 6; i += 2 ) {
        point = this.properties["matrix"].apply( commands[i+0],
        commands[i+1] );
    
        point = this.properties["inverse"].apply(point.x + x, point.y+y);
        commands[i + 0] = point.x;
        commands[i + 1] = point.y;
        }
        }
        */

        // if it is the first edit handle, and we are closed, then also move the
        // last one.
        if (index === 0 && this.properties["closed"]) {
            var lastCommand = null;
            while (pos < commands.length) {
                var length = PathNode.CommandLengths[commands[pos]];
                if (length >= 2) {
                    lastCommand = pos;
                }
                pos += length + 1;
            }

            if (lastCommand) {
                pos = lastCommand;
                point = this.properties["matrix"].apply(commands[pos + 1],
                    commands[pos + 2]);

                point = this.properties["inverse"].apply(point.x + x, point.y + y);
                commands[pos + 1] = point.x;
                commands[pos + 2] = point.y;
            }
        }
    };

    PathNode.prototype.removePoint = function (index) {
        var commands = this.properties["commands"];
        var pos = 0;
        for (var i = 0; i < index; i++) {
            pos += PathNode.CommandLengths[commands[pos]] + 1;
        }

        commands.splice(pos, PathNode.CommandLengths[commands[pos]] + 1);
    };

    PathNode.prototype.getStartPoint = function () {
        return this.origin;
    };

    PathNode.prototype.getEndPoint = function () {
        var seg = this.segments[this.segments.length - 1];
        return seg.to;
    };

    PathNode.prototype.format = function (ctx, request) {
        var from = new Point(0, 0);
        this.origin = null;
        this.segments.length = 0;

        var to = new Point(0, 0);
        var commands = this.properties["commands"];
        var prev = null;
        var control, control1, control2;
        var radius;
        var matrix = this.properties["matrix"];
        var randomSequence = new RandomSequence(this.properties["seed"]);
        
        //check if the command points are within canvas        
        if (commands.length > 0) {
            var canvasWidth = ctx.canvas.width;
            var canvasheight = ctx.canvas.height;
            var nudge = 10;//to-do fetch from the config this.config.get("nudge");
            for (var j = 0; j < commands.length;) {
                var cmd = commands[j++];
                //if (PathNode.CommandLengths[cmd] > 5) { //if not moveto or lineto
                //    j += PathNode.CommandLengths[cmd];
                //    continue;
                //}

                for (var k = 0; k < PathNode.CommandLengths[cmd];) {
                    var cp = new Point(commands[j++], commands[j++]);
                    if (matrix.m11 * cp.x + matrix.dx < 0) {
                        matrix.dx += nudge;
                    } else if (matrix.m11 * cp.x + matrix.dx > canvasWidth) {
                        matrix.dx -= nudge;
                    } else if (matrix.m22 * cp.y + matrix.dy < 0) {
                        matrix.dy += nudge;
                    } else if (matrix.m22 * cp.y + matrix.dy > canvasheight) {
                        matrix.dy -= nudge;
                    }
                    k += 2;
                }
            }
            this.properties["matrix"] = matrix;
            this.properties["inverse"] = matrix.inverse();
        }
        
        for (var i = 0; i < commands.length; ) {
            switch (commands[i++]) {
                case PathNode.MOVE_TO:
                    to = matrix.apply(commands[i++], commands[i++]);
                    this.segments.push(new MoveSegment(prev, to));
                    if (this.origin === null) {
                        this.origin = to;
                    }
                    break;

                case PathNode.LINE_TO:
                    to = matrix.apply(commands[i++], commands[i++]);
                    this.segments.push(new LineSegment(prev, to,
                                randomSequence,
                                this.properties["sloppiness"]));
                    break;

                case PathNode.QUADRATIC_TO:
                    to = matrix.apply(commands[i++], commands[i++]);
                    control = matrix.apply(commands[i++], commands[i++]);
                    this.segments.push(new QuadraticSegment(prev, control, to));
                    break;

                case PathNode.ARC_TO:
                    to = matrix.apply(commands[i++], commands[i++]);
                    control = matrix.apply(commands[i++], commands[i++]);
                    radius = commands[i++];
                    this.segments.push(new ArcSegment(prev, control, to,
                                radius));
                    break;

                case PathNode.BEZIER_TO:
                    to = matrix.apply(commands[i++], commands[i++]);
                    control1 = matrix.apply(commands[i++], commands[i++]);
                    control2 = matrix.apply(commands[i++], commands[i++]);
                    this.segments.push(new BezierSegment(prev, control1,
                                control2, to));
                    break;

                case PathNode.CURVE_TO:
                    to = matrix.apply(commands[i++], commands[i++]);
                    this.segments.push(new CurveSegment(prev, to,
                                this.properties["smoothness"]));
                    break;

                case PathNode.CORNER_TO:
                    to = matrix.apply(commands[i++], commands[i++]);
                    control1 = matrix.apply(commands[i++], commands[i++]);
                    this.segments.push(new CornerSegment(prev, control1,
                                to, randomSequence,
                                this.properties["sloppiness"]));
                    break;

                case PathNode.CLOSE:
                    this.properties["closed"] = true;
                    break;

                default:
                    i++;
                    break;
            }
            prev = this.segments[this.segments.length - 1];
        }

        // fix up the smoothing of the first to the last segment.
        if (this.properties["closed"] && this.segments.length >= 4 &&
             this.segments[1].setPrevious) {
            this.segments[1].setPrevious(prev);
            prev.to = this.origin;
        }

        this.formatArrow();

        // calculate the bounding box using a crude approximation.
        this.rect.x = this.origin.x;
        this.rect.y = this.origin.y;
        this.rect.width = 0;
        this.rect.height = 0;

        this.points = this.calcPoints(PathNode.BEZIER_ERROR);
        this.rect = Rectangle.CreateBoundingBox(this.points);

        // account for lineWidth and antialiasing in the bounding rect.
        var lineWidth = this.properties["lineWidth"];
        this.rect.inflate(lineWidth * 2 + 1, lineWidth * 2 + 1);

        // Adjust the bounding rect to be large enough to click on.
        if (this.rect.width < 8) {
            this.rect.x += this.rect.width / 2 - 4;
            this.rect.width = 8;
        }

        if (this.rect.height < 8) {
            this.rect.y += this.rect.height / 2 - 4;
            this.rect.height = 8;
        }

        if (this.properties["closed"]) {
            var centroid = CalculateCentroid(this.points);

            this.textNode.format(ctx, request);

            var xshift = centroid.x - this.textNode.rect.x -
                this.textNode.rect.width / 2;
            var yshift = centroid.y - this.textNode.rect.y -
                this.textNode.rect.height / 2;

            this.textNode.transform(new TranslateMatrix(xshift, yshift),
                    new TranslateMatrix(-xshift, -yshift));
            this.textNode.format(ctx, request);
        }

    };

    PathNode.prototype.formatArrow = function () {
        this.hasArrow = this.properties["arrowSize"] > 0 &&
            !this.properties["closed"] && this.segments.length > 0;

        if (!this.hasArrow) {
            return;
        }

        var finalSegment = this.segments[this.segments.length - 1];
        var endPoint = finalSegment.to;
        var directionVector = finalSegment.endSlope();
        var arrowSize = this.properties["arrowSize"];
        var smoothness = this.properties["smoothness"];

        var x1, y1;
        var x2, y2;
        x1 = endPoint.x - directionVector.x * arrowSize;
        y1 = endPoint.y - directionVector.y * arrowSize;

        x2 = x1 + directionVector.y * arrowSize / 2;
        y2 = y1 - directionVector.x * arrowSize / 2;

        x1 += -directionVector.y * arrowSize / 2;
        y1 += directionVector.x * arrowSize / 2;

        this.segments.push(new MoveSegment(finalSegment, new Point(x1, y1)));
        this.segments.push(new CurveSegment(
                    this.segments[this.segments.length - 1],
                    endPoint, smoothness));
        this.segments.push(new CurveSegment(
                    this.segments[this.segments.length - 1],
                    new Point(x2, y2), smoothness));
    };

    PathNode.prototype.close = function () {
        var commands = this.properties["commands"];
        commands.push(PathNode.CLOSE);
    };

    PathNode.prototype.autoclose = function () {
        // if the last segment is close to the start, then close it.
        var seg = this.segments[this.segments.length - 1];
        if (CalcLineLength(seg.to.x, seg.to.y, this.origin.x, this.origin.y) <= 8) {
            this.close();
        }
    };

    PathNode.prototype._draw = function (ctx) {
        var matrix = this.properties["inverse"];
        ctx.save();
        ctx.lineJoin = "round";
        ctx.transform(matrix.m11, matrix.m21, matrix.m12,
                          matrix.m22, matrix.dx, matrix.dy);

        ctx.beginPath();
        ctx.lineCap = 'round';
        ctx.joinCap = 'round';

        for (var i = 0; i < this.segments.length; i++) {
            this.segments[i].draw(ctx);
        }

        if (this.properties["closed"]) {
            ctx.closePath();
            ctx.fill();
            ctx.shadowColor = "rgba(0,0,0,0.0)";
        }
        if (this.properties["lineWidth"] > 0) {
            ctx.stroke();
        }

        if (SHOW_LINES && this.points.length > 0) {
            ctx.shadowColor = "rgba(0,0,0,0.0)";
            ctx.beginPath();

            ctx.moveTo(this.points[0].x, this.points[0].y);
            for (i = 1; i < this.points.length; i++) {
                ctx.lineTo(this.points[i].x, this.points[i].y);
            }
            ctx.lineWidth = 1.0;
            ctx.strokeStyle = "#ff0000";
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(this.points[0].x, this.points[0].y);
            for (i = 1; i < this.points.length; i++) {
                ctx.rect(this.points[i].x - 4, this.points[i].y - 4, 8, 8);
            }
            ctx.lineWidth = 1;
            ctx.fillStyle = "#a0a0e0";
            ctx.fill();
        }

        if (SHOW_CONTROL_POINTS && this.segments.length > 0) {
            ctx.shadowColor = "rgba(0,0,0,0.0)";
            ctx.beginPath();
            for (i = 0; i < this.segments.length; i++) {
                this.segments[i].drawControls(ctx);
            }
            ctx.strokeStyle = "#800000";
            ctx.lineWidth = 0.5;
            ctx.stroke();
        }

        if (this.properties["closed"]) {
            this.textNode.draw(ctx);
        }

        ctx.restore();
    };

    PathNode.prototype.hittest = function (x, y) {
        var radius = 8;
        if (x >= this.rect.x - radius && x < this.rect.x + radius + this.rect.width &&
            y >= this.rect.y - radius && y < this.rect.y + radius + this.rect.height) {
            if (this.properties["closed"]) {
                if (PointInPolygon(this.points, x, y, radius)) {
                    return this;
                }
            } else if (PointNearPath(this.points, x, y, radius)) {
                return this;
            }
        }
        return null;
    };

    // 64 is crude enough; 4 is fine.
    PathNode.prototype.calcPoints = function (resolution) {
        var points = [];

        for (var i = 0; i < this.segments.length; i++) {
            this.segments[i].outline(points, resolution);
        }

        return points;
    };

    PathNode.prototype.lineTo = function (x, y) {
        var commands = this.properties["commands"];
        commands.push(PathNode.LINE_TO);
        commands.push(x);
        commands.push(y);
    };

    PathNode.prototype.curveTo = function (x, y) {
        var commands = this.properties["commands"];
        commands.push(PathNode.CURVE_TO);
        commands.push(x);
        commands.push(y);
    };

    PathNode.prototype.hasEditMode = function () {
        return this.properties["editable"] !== false;
    };

    PathNode.prototype.hitTestEditHandle = function (x, y, scale) {
        var r = 8.0 * scale;
        if (x >= this.origin.x - r && x < this.origin.x + r &&
             y >= this.origin.y - r && y < this.origin.y + r) {
            return 0;
        }

        var num = this.properties["closed"] ? this.segments.length - 1 :
            this.segments.length;

        if (this.hasArrow) {
            num -= 3;
        }

        for (var i = 0; i < num; i++) {
            if (x >= this.segments[i].to.x - r && x < this.segments[i].to.x + r &&
                 y >= this.segments[i].to.y - r && y < this.segments[i].to.y + r) {

                return i;
            }
        }

        return null;
    };

    PathNode.prototype.drawEditHandles = function (ctx, scale) {
        ctx.save();
        ctx.lineWidth = 1.0 * scale;
        ctx.strokeStyle = "#0050B7";

        var r = 4.0 * scale;

        ctx.strokeRect(this.origin.x - r, this.origin.y - r, r * 2, r * 2);
        var num = this.segments.length;
        if (this.properties["closed"]) {
            num -= 1;
        }

        // start at 1 to avoid the initial moveTo
        if (this.hasArrow) {
            num -= 3;
        }

        for (var i = 1; i < num; i++) {
            ctx.strokeRect(this.segments[i].to.x - r, this.segments[i].to.y - r,
                r * 2, r * 2);
        }

        ctx.restore();
    };


    Inherit(BaseNode.prototype, PathNode.prototype);

    /** @constructor 
    @param {Array.<number>=} commands
    
    Path commands are an array of commands for drawing shapes. Each command
    other than CLOSE_SHAPE has the command type and the final x and y
    coordinates. Depending on the command type, there may be other coordinates.
    */
    function PathCommands(commands) {
        this.init(commands);
    }

    PathCommands.prototype = {
        init: function (commands) {
            if (commands === undefined) {
                this.commands = [];
            } else {
                this.commands = commands;
            }
        },

        change: function (index, x, y) {
            var pos = 0;
            for (var i = 0; i < index; i++) {
                pos += PathNode.CommandLengths[this.commands[pos]] + 1;
            }
            this.commands[pos + 1] = x;
            this.commands[pos + 2] = y;
        },

        moveTo: function (x, y) {
            this.commands.push(PathNode.MOVE_TO);
            this.commands.push(x);
            this.commands.push(y);
        },

        lineTo: function (x, y) {
            this.commands.push(PathNode.LINE_TO);
            this.commands.push(x);
            this.commands.push(y);
        },

        curveTo: function (x, y) {
            this.commands.push(PathNode.CURVE_TO);
            this.commands.push(x);
            this.commands.push(y);
        },

        quadraticTo: function (cx, cy, x, y) {
            this.commands.push(PathNode.QUADRATIC_TO);
            this.commands.push(x);
            this.commands.push(y);
            this.commands.push(cx);
            this.commands.push(cy);
        },

        cornerTo: function (cx, cy, x, y) {
            this.commands.push(PathNode.CORNER_TO);
            this.commands.push(x);
            this.commands.push(y);
            this.commands.push(cx);
            this.commands.push(cy);
        },

        bezierTo: function (c1x, c1y, c2x, c2y, x, y) {
            this.commands.push(PathNode.BEZIER_TO);
            this.commands.push(x);
            this.commands.push(y);
            this.commands.push(c1x);
            this.commands.push(c1y);
            this.commands.push(c2x);
            this.commands.push(c2y);
        },

        arcTo: function (x1, y1, x2, y2, radius) {
            this.commands.push(PathNode.ARC_TO);
            this.commands.push(x2);
            this.commands.push(y2);
            this.commands.push(x1);
            this.commands.push(y1);
            this.commands.push(radius);
        },

        close: function () {
            this.commands.push(PathNode.CLOSE);
        },

        toArray: function () {
            return this.commands;
        }
    };


    function CreatePolygonPath(centre, corners, outerRadius, innerRadius) {
        var outer = true;
        var commands = new PathCommands();
        var angle = Math.PI / corners + Math.PI;
        var startx = 0;
        var starty = 0;
        for (var i = 0; i < corners; i++) {
            var radius = outer ? outerRadius : innerRadius;
            var x = centre.x - Math.sin(angle) * radius;
            var y = centre.y - Math.cos(angle) * radius;
            if (i === 0) {
                commands.moveTo(x, y);
                startx = x;
                starty = y;
            } else {
                commands.lineTo(x, y);
            }

            angle += 2 * Math.PI / corners;
            outer = !outer;
        }

        commands.lineTo(startx, starty);
        commands.close();

        return commands.toArray();
    }

    function CreateCirclePath(center, radius) {
        var commands = new PathCommands();
        commands.moveTo(center.x, center.y - radius);
        commands.cornerTo(center.x + radius, center.y - radius,
                              center.x + radius, center.y);
        commands.cornerTo(center.x + radius, center.y + radius,
                              center.x, center.y + radius);
        commands.cornerTo(center.x - radius, center.y + radius,
                              center.x - radius, center.y);
        commands.cornerTo(center.x - radius, center.y - radius,
                              center.x, center.y - radius);
        commands.close();

        return commands.toArray();
    }
    /*
    Zwibbler
    
    Copyright 2013 Hanov Solutions Inc. All Rights Reserved. This software is
    NOT open source. For licensing information, contact the author.
    
    steve.hanov@gmail.com
    //#include <Graphics.js>
    //#include <PathNode.js>
    //#include <FitCurve.js>
    //#include <log.js>
    */
    /*
    Draw freeform lines. The user will first click, hold down the mouse button
    while moving, and then release the button. This will create a smoothed 
    freeform path.
    */
    /**
    * @constructor
    */
    var DrawFreeformBehaviour = function (view, previousBehaviour) {
        this.view = view;
        this.previousBehaviour = previousBehaviour;
        this.view.setHintText("Hold down the button to draw");
        this.view.canvas.style.cursor = "crosshair";
        this.dragging = false;
        this.points = [];
    };

    DrawFreeformBehaviour.prototype.log = log.create("Freeform");
    DrawFreeformBehaviour.prototype.onMouseDown = function (x, y) {
        this.dragging = true;
        this.view.setHintText(null);
        return this.points.push(new Point(x, y));
    };
    DrawFreeformBehaviour.prototype.onMouseUp = function (x, y) {
        var commands, i, node, path;
        this.onMouseMove(x, y);
        this.dragging = false;
        this.log("Points=%s", "" + this.points);
        path = GenerateCurvesFromPoints(this.points, 8);
        node = new PathNode(this.view.doc.getNextId());
        commands = path.commands;
        i = 0;
        while (i < commands.length) {
            if (commands[i] === PathData.MOVE) {
                node.moveTo(commands[i + 1], commands[i + 2]);
                this.log("MoveTo: %s, %s", commands[i + 1], commands[i + 2]);
            } else if (commands[i] === PathData.BEZIER_CURVE) {
                node.bezierTo(commands[i + 1], commands[i + 2], commands[i + 3], commands[i + 4], commands[i + 5], commands[i + 6]);
                this.log("CurveTo: %s, %s, %s, %s, %s, %s", commands[i + 1], commands[i + 2], commands[i + 3], commands[i + 4], commands[i + 5], commands[i + 6]);
            } else {
                this.log("Unknown command %s", commands[i]);
            }
            i += PathData.SizeOf[commands[i]];
        }
        node.format(this.view.ctx, this.view.request);
        node.autoclose();
        this.view.commit([
          new CreateAction("PathNode", {
              "commands": node.getProperty("commands"),
              "seed": node.getProperty("seed"),
              "fillStyle": this.view.defaultFillStyle,
              "strokeStyle": this.view.defaultStrokeStyle,
              "lineWidth": this.view.defaults["lineWidth"]
          })
        ]);
        return this.exit();
    };
    DrawFreeformBehaviour.prototype.onMouseMove = function (x, y) {
        if (this.dragging) {
            this.from = this.points[this.points.length - 1];
            if (x !== this.from.x || y !== this.from.y) {
                this.points.push(new Point(x, y));
                this.to = this.points[this.points.length - 1];
                this.view.ctx.beginPath();
                this.view.ctx.moveTo(this.from.x, this.from.y);
                this.view.ctx.lineTo(this.to.x, this.to.y);
                this.view.ctx.strokeStyle = "black";
                this.view.ctx.lineWidth = 1;
                return this.view.ctx.stroke();
            }
        }
    };
    DrawFreeformBehaviour.prototype.exit = function () {
        this.view.behaviour = this.previousBehaviour;
        this.view.canvas.style.cursor = "default";
        this.view.setHintText(null);
        return this.view.draw();
    }; ;
    /*
    Zwibbler
    
    Copyright 2013 Hanov Solutions Inc. All Rights Reserved. This software is
    NOT open source. For licensing information, contact the author.
    
    steve.hanov@gmail.com
    */
    //#include <PathNode.js>
    /** @constructor 
        
    Draw lines, curves, or arrows. The user will first click on the first
    point, then click on the second point and continue clicking to place
    additional points. Double-clicking ends the line.
    
    Since the functionality is so similar, the same class implements drawing
    curves and arrows.
    */
    function DrawLinesBehaviour(view, isCurves, hasArrow) {
        this.view = view;
        this.node = null;
        this.isCurves = isCurves;
        this.hasArrow = hasArrow;
    }

    DrawLinesBehaviour.prototype = {
        enter: function () {
            this.numPoints = 0;
            this.view.canvas.style.cursor = "crosshair";
            this.view.setHintText("Click to place first point of line");
            this.view.draw();
            this.oldId = this.view.doc.peekNextId();
            this.lastPoint = new Point(0, 0);
            this.node = null;
        },

        reset: function () {
            this.enter();
        },

        onTouch: function (e) {
            var touch, pt;
            if (e.type === 'touchstart') {
                touch = e.changedTouches[0];
                pt = this.view.screenPoint(touch.pageX, touch.pageY);
                if (pt.distanceTo(this.lastPoint) > 10) {
                    this.onMouseClick(pt.x, pt.y);
                } else {
                    this.onMouseClick(pt.x, pt.y);
                    this.onMouseClick(pt.x, pt.y);
                    this.onDoubleClick(pt.x, pt.y);
                }
            } else if (e.type === 'touchmove') {
                touch = e.changedTouches[0];
                pt = this.view.screenPoint(touch.pageX, touch.pageY);
                this.onMouseMove(pt.x, pt.y);
            }
        },

        onKeyCommand: function (action, e) {
            if (action === "cancel") {
                // if we are drawing curves with the keyboard and the user presses
                // escape, just terminate commit current node.
                if (this.node !== null && this.view.isKeyboardCursorShown &&
                        this.isCurves && !this.hasArrow) {
                    this.commit();
                }
                if (this.node !== null) {
                    this.view.doc.removeNode(this.node);
                    this.view.doc.setNextId(this.oldId);
                }
                if (this.view.isKeyboardCursorShown()) {
                    this.view.eventSource.emit("goto-toolbar");
                } else {
                    this.view.pickTool();
                }
            }
        },

        addPoint: function (x, y) {
            if (this.isCurves) {
                this.node.curveTo(x, y);
            } else {
                this.node.lineTo(x, y);
            }
        },

        onMouseClick: function (x, y) {
            var pt = this.view.snap(new Point(x, y));
            x = pt.x;
            y = pt.y;
            if (this.node === null) {
                this.node = new PathNode(this.view.doc.getNextId());
                this.node.setProperty("seed", Math.round(Math.random() * 65535)
                        );
                this.node.setProperty("strokeStyle", this.view.defaultStrokeStyle
                    );
                this.node.setProperty("lineWidth", this.view.defaults["lineWidth"]
                    );
                this.node.setProperty("sloppiness", this.view.defaults["sloppiness"]
                    );
                this.node.setProperty("smoothness", this.view.defaults["smoothness"]
                    );
                this.view.doc.addNode(this.node);
                if (this.hasArrow) {
                    this.node.setProperty("arrowSize",
                            this.view.defaults["arrowSize"]);
                }
                this.node.moveTo(x, y);
                this.addPoint(x, y);
                this.index = 1;
                this.view.setHintText("Click to place another point, or double-click to end the line");
                this.view.update();

                this.numPoints = 2;

                var self = this;
                $(this.view.canvas).mouseleave(function (e) {
                    console.log('Mouse Leave on canvas called !!');
                    if (self && self.node && typeof self.commit == 'function') {
                        self.commit();
                        self.view.pickTool();
                        //$(self.view.canvas).unbind('mouseleave');
                    }
                    e.preventDefault();
                });

            } else {
                // if a keyboard cursor is shown, and we are drawing lines or
                // arrows, then terminate now as per the
                // specs. Only one line segment is possible.
                if (this.view.isKeyboardCursorShown() && (!this.isCurves ||
                            this.hasArrow)) {
                    this.commit();
                    this.view.pickTool();
                    this.view.eventSource.emit("goto-toolbar");
                } else {
                    this.addPoint(x, y);
                    this.numPoints++;
                    this.index += 1;
                    this.view.doc.markRedraw(this.node.id);
                    this.view.update();
                }

            }

            this.lastPoint.x = x;
            this.lastPoint.y = y;
        },

        onMouseMove: function (x, y) {
            var pt = this.view.snap(new Point(x, y));
            x = pt.x;
            y = pt.y;
            if (this.node) {
                this.node.moveEditHandle(this.index, x - this.lastPoint.x,
                    y - this.lastPoint.y);
                this.node.format(this.view.ctx, this.view.request);
                this.view.draw();

                this.lastPoint.x = x;
                this.lastPoint.y = y;
            }
        },

        onDoubleClick: function (x, y) {
            var pt = this.view.snap(new Point(x, y));
            x = pt.x;
            y = pt.y;
            if (this.node && this.index > 1) {
                var numPoints = this.index;
                this.node.removePoint(numPoints);
                this.node.removePoint(numPoints - 1);
                this.commit();
            }

            this.reset();
            this.view.pickTool();
        },

        commit: function () {
            this.node.autoclose();
            this.view.doc.removeNode(this.node);
            this.view.doc.setNextId(this.oldId);
            this.view.commit([
                new CreateAction(
                    "PathNode", {
                        "arrowSize": this.hasArrow ?
                            this.view.defaults["arrowSize"] : 0,
                        "commands": this.node.getProperty("commands"),
                        "seed": this.node.getProperty("seed"),
                        "fillStyle": this.view.defaultFillStyle,
                        "strokeStyle": this.view.defaultStrokeStyle,
                        "lineWidth": this.view.defaults["lineWidth"],
                        "sloppiness": this.view.defaults["sloppiness"],
                        "smoothness": this.view.defaults["smoothness"],
                        "shadow": this.view.defaults["shadow"],
                        "isTextEditable": false
                    })
            ]);
            this.node = null;
        },

        leave: function () {
            this.view.canvas.style.cursor = "default";
            this.view.setHintText(null);
            if (this.node) {
                this.commit();
            }
            this.view.draw();
            $(this.view.canvas).unbind('mouseleave');

        },

        onColourClicked: function (e) {
            var property;
            if (e.button === 1) {
                this.view.defaultFillStyle = e.colour;
                this.view.defaultBrushStyle = e.colour;
                property = "fillStyle";
            } else {
                this.view.defaultStrokeStyle = e.colour;
                property = "strokeStyle";
            }

            this.view.setProperty(property, e.colour);
        }
    };

    /*
    Zwibbler
    
    Copyright 2013 Hanov Solutions Inc. All Rights Reserved. This software is
    NOT open source. For licensing information, contact the author.
    
    steve.hanov@gmail.com
    */
    /** @constructor 
    This is a mouse behaviour for moving the edit node. The mouse is currently
    down and the user moves to a new location and releases the button. Then we
    create a new MoveEditHAndleAction.
    */
    function MoveEditNodeBehaviour(view, node, handle, x, y) {
        this.view = view;
        this.node = node;
        this.handle = handle;
        this.onMouseDown(x, y);
    }

    MoveEditNodeBehaviour.prototype = {

        onTouch: function (e) {
            var touch, pt;
            if (e.type === "touchmove") {
                touch = e.touches[0];
                pt = this.view.screenPoint(touch.pageX, touch.pageY);
                this.onMouseMove(pt.x, pt.y);
            } else if (e.type === "touchend") {
                touch = e.changedTouches[0];
                pt = this.view.screenPoint(touch.pageX, touch.pageY);
                this.onMouseUp(pt.x, pt.y);
            }
        },

        onMouseDown: function (x, y) {
            var pt = this.view.snap(new Point(x, y));
            x = pt.x;
            y = pt.y;
            this.startX = x;
            this.startY = y;
            this.prevX = x;
            this.prevY = y;
        },

        onMouseMove: function (x, y) {
            var pt = this.view.snap(new Point(x, y));
            x = pt.x;
            y = pt.y;
            this.node.moveEditHandle(this.handle, x - this.prevX, y - this.prevY);
            this.node.format(this.view.ctx, this.view.request);
            this.view.draw();
            this.prevX = x;
            this.prevY = y;
        },

        onMouseUp: function (x, y) {
            var pt = this.view.snap(new Point(x, y));
            x = pt.x;
            y = pt.y;
            if (x !== this.startX || y !== this.startY) {
                this.view.commit([
                    new MoveEditHandleAction(this.node.id, this.handle,
                       x - this.startX, y - this.startY)],
                       this.view.doc.peekNextId());
            } else {
                // didn't move!
            }

            this.view.draw();
            this.view.setBehaviour(new DefaultBehaviour(this.view));
        }
    };
    /** @constructor
    @param {string=} colour 
    @param {number=} left
    @param {number=} top
    @param {number=} width
    @param {number=} height
    */
    function Overlay(colour, left, top, width, height) {
        this.colour = colour || "transparent";
        this.left = left || 0;
        this.top = top || 0;
        this.width = width || $(window).width();
        this.height = height || $(window).height();
    }

    Overlay.prototype.hide = function () {
        this.div.remove();
    };

    Overlay.prototype.show = function (clickfn) {
        this.div = $("<div>");
        var body = $(window);
        this.div.css("position", "fixed");
        this.div.css("background", this.colour);
        this.div.css("opacity", "0.25");
        this.div.css("left", "" + this.left + "px");
        this.div.css("top", "" + this.top + "px");
        this.div.css("z-index", "1");
        this.div.css("width", "" + this.width + "px");
        this.div.css("height", "" + this.height + "px");
        this.div.css("display", "none");
        this.div.click(function (e) {
            clickfn(e);
        });
        $("body").append(this.div);
        this.div.fadeIn("normal");
    };

    //#include <Panel.js>
    //#include <Overlay.js>
    //#include <log.js>
    /** @constructor
    @extends Panel
    @param {boolean=} popup
    */
    function Menubar(menu, eventSource, popup) {
        this.init(menu, eventSource, popup);
    }

    Menubar.HilightColour = "#ff9900";
    Menubar.ClickColour = "#ffffff";
    Menubar.BackgroundColour = "#ccc";

    Menubar.prototype.log = log.create("Menubar");

    Menubar.prototype.init = function (menu, eventSource, popup) {
        this.initPanel($("<div>"));
        this.popup = popup;
        this.div.css("position", "absolute");
        this.div.css("background", Menubar.BackgroundColour);
        this.div.css("font-family", "tahoma,helvetica,arial,sans");
        this.div.css("font-size", "12px");
        this.div.css("padding", "0.5em");
        this.div.css("cursor", "default");
        this.div.css("MozUserSelect", "none");
        this.div[0].onselectstart = function () { return false; };

        if (popup) {
            this.div.css("background", "white");
            this.div.css("border-left", "1px solid #ccc");
            this.div.css("border-bottom", "1px solid #888");
            this.div.css("border-right", "1px solid #888");
            this.div.css("box-shadow", "3px 3px 5px #ccc");
        }
        //this.width(400);
        //this.height(32);
        this.menu = menu;
        this.eventSource = eventSource;

        for (var i = 0; i < menu.items.length; i++) {
            var item = menu.items[i];
            this._append(item);
        }

        this.overlay = null;
        this.currentlyShownMenu = null;
        this.div.css("z-index", 3001);
    };

    Menubar.prototype._append = function (item) {
        var div;
        var self = this;
        if (!this.popup) {
            if (item.type === "separator") {
                return;
            }
            if (item.display.length > 6 && item.display.substr(0, 6) === "image:") {
                div = $("<img>");
                div.attr("src", item.display.substr(6));
                div.load(function () {
                    self.eventSource.emit("resize", {});
                });
                div.css("border", "1px solid #888");
                div.css("box-shadow", "3px 3px 3px #000");
                div.css("border-radius", "5px");
                div.css("vertical-align", "middle");
                div.css("margin-left", "0.5em");
                div.css("margin-right", "0.5em");
                div.hover(
                    function () {
                        div.css("background", Menubar.HilightColour);
                        div.css("color", "white");
                    },
                    function () {
                        div.css("background", "transparent");
                        div.css("color", "black");
                    }
                );
                this.div.append(div);
            } else {
                div = $("<div>");
                div.css("display", "inline");
                div.css("padding-left", "0.5em");
                div.css("padding-right", "0.5em");
                div.css("padding-top", "0.5em");
                div.css("padding-bottom", "0.5em");
                //div.css("border", "1px solid #888");
                //div.css("box-shadow", "3px 3px 5px #ccc");
                //div.css("border-radius", "5px");
                div.css("MozUserSelect", "none");
                div[0].onselectstart = function () { return false; };
                div.css("vertical-align", "middle");
                div.text(item.display);
                div.hover(
                    function () {
                        div.css("background", Menubar.HilightColour);
                        //div.css("color", "white");
                    },
                    function () {
                        div.css("background", "transparent");
                        //div.css("color", "black");
                    }
                );
            }
            if (item.type === "menu") {
                div.mousedown(function () {
                    var offset = div.offset();
                    self.showMenu(item, offset.left,
                        offset.top + div.outerHeight());
                });
            } else {
                div.click(function () {
                    self.eventSource.emit(item.event, {});
                });
            }
            this.div.append(div);
        } else {
            if (item.type === "separator") {
                div = $("<hr>");
                this.div.append(div);
                return;
            }
            div = $("<div>");
            div.css("padding-left", "0.5em");
            div.css("padding-right", "0.5em");
            div.text(item.display);
            div.hover(
                function () {
                    div.css("background", Menubar.HilightColour);
                    //div.css("color", "white");
                },
                function () {
                    div.css("background", "transparent");
                    //div.css("color", "black");
                }
            );
            div.mouseup(function () {
                if (self.clickfn) {
                    self.clickfn();
                }
                self.eventSource.emit(item.event, item.eventData);
            });
            this.div.append(div);

        }
    };

    Menubar.prototype.click = function (clickfn) {
        this.clickfn = clickfn;
    };

    Menubar.prototype.hideActive = function () {
        if (this.currentlyShownMenu) {
            this.currentlyShownMenu.destroy();
            this.currentlyShownMenu = null;
        }

        if (this.overlay) {
            this.overlay.hide();
            this.overlay = null;
        }
    };

    Menubar.prototype.showMenu = function (item, x, y) {
        if (this.currentlyShownMenu && this.currentlyShownMenu.menu === item.menu) {
            // re-clicked on same menu item. Hide it.
            this.hideActive();
            return;
        }
        this.hideActive();
        var top = $(this.div).offset().top + this.height();
        var overlay = new Overlay("transparent", 0, top);
        var menu;

        var self = this;
        var hidefn = function (e) {
            self.hideActive();
        };

        overlay.show(hidefn);

        menu = new Menubar(item.menu, this.eventSource, true);
        menu.click(hidefn);

        menu.moveTo(x, y);

        this.currentlyShownMenu = menu;
        this.overlay = overlay;
    };

    Inherit(Panel.prototype, Menubar.prototype);
    /*
    //#include <Overlay.js>
    //#include <EventEmitter.js>
    //#include <log.js>
    */
    /**
    * @constructor
    * @extends {EventEmitter}
    */
    var Dialog = function (name) {
        this.name = name;
        EventEmitter.apply(this, arguments);
        if (typeof this.name === "string") {
            this.div = $("#" + this.name);
        } else {
            this.div = $("<div>").addClass("dialog");
            $(document.body).append(this.div);
            this.div.css("z-index", "2");
        }
        this.overlay = null;
    };
    __extends(Dialog, EventEmitter);

    Dialog.prototype.log = log.create("Dialog");
    Dialog.prototype.show = function () {
        if (Dialog._current) {
            Dialog._current.hide();
        }
        this.log("Set Dialog.current");
        Dialog._current = this;
        this.overlay = new Overlay("black");
        this.overlay.show(__bind(function () {
            return this.hide();
        }, this));
        this.onResize();
        this.div.slideDown("fast");
        return this.on("cancel", __bind(function () {
            return this.hide();
        }, this));
    };
    Dialog.prototype.onResize = function () {
        var winHeight, winWidth;
        winWidth = $(window).width();
        winHeight = $(window).height();
        this.div.css("left", "" + (winWidth / 2 - this.div.outerWidth() / 2) + "px");
        return this.div.css("top", "" + (winHeight / 2 - this.div.outerHeight() / 2) + "px");
    };
    Dialog.prototype.hide = function () {
        if (Dialog._current === this) {
            this.overlay.hide();
            this.div.hide();
            Dialog._current = null;
            return this.log("Clear Dialog.current");
        }
    }; ;
    Dialog._current = null;
    /** @export Dialog */
    /** @export Dialog.emit */
    /** @export Dialog.current */
    Dialog.emit = function () {
        var args;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        if (Dialog._current) {
            Dialog._current.emit.apply(Dialog._current, args);
        }
    };
    Dialog.current = function () {
        return Dialog._current;
    };
    $(document).keydown(function (e) {
        if (Dialog._current !== null && e.keyCode === 27) {
            return Dialog._current.emit("cancel");
        }
    });
    $(window).resize(function () {
        if (Dialog._current) {
            return Dialog._current.onResize();
        }
    });

    var editTextDialog = (function () {

        var _dialog;

        function getDialog() {
            return _dialog || createDialog();
        }

        function createDialog() {
            var dialogHtml = '\
            <div id="editTextDialog"> \
                <div class="hd title"></div> \
                <div class="bd"> \
                    <input type="text"></input> \
                </div> \
            </div>';

            var dialog = $(dialogHtml)[0];
            document.body.appendChild(dialog);

            _dialog = new YAHOO.widget.Dialog(dialog, {
                modal: true,
                visible: false,
                draggable: false,
                close: false,
                postmethod: 'none',
                width: 'auto'
            });

            _dialog.renderEvent.subscribe(function () {
                this.element.style.marginLeft = -this.element.offsetWidth / 2 + 'px';
            });

            return _dialog;
        }

        return function (title, value, onOk) {

            var dialog = getDialog(),
                $input = $(dialog.body).find('input');

            dialog.header.innerHTML = title;
            $input.val(value);

            var handleOk = function () {
                var value = $input.val();
                this.hide();
                onOk(value);
            };

            var handleCancel = function () {
                this.hide();
            };

            // add dialog buttons
            dialog.cfg.queueProperty("buttons", [
                { text: 'OK', handler: handleOk, isDefault: true },
                { text: 'Cancel', handler: handleCancel }
            ]);

            dialog.render();
            dialog.show();

            $input.focus().select();
        };
    })();

    /*
    Zwibbler
    
    Copyright 2013 Hanov Solutions Inc. All Rights Reserved. This software is
    NOT open source. For licensing information, contact the author.
    
    steve.hanov@gmail.com
    */
    //#include <MoveEditNodeBehaviour.js>
    //#include <SelectBoxBehaviour.js>
    //#include <TransformSelectionBehaviour.js>
    //#include <EditTextDialog.js>
    //#include <log.js>
    /** 
    The DefaultBehaviuor object defines how the mouse behaves when the user isn't
    doing anything special. There may be selected shapes on the screen, but the
    user is not currently selecting anything or dragging anything around.
    
    We also implement all the keyboard shortcuts here.
    
    @constructor 
    */
    function DefaultBehaviour(view) {
        this.init(view);
    }

    DefaultBehaviour.prototype = {
        init: function (view) {
            this.view = view;
            this.view.setHintText("");
            this.useTouch = this.view.config.useTouch();
            this.scaleTouchRadius = 1.0;
            if (this.useTouch) {
                this.scaleTouchRadius = 2.0;
            }
        },

        log: log.create("DefaultBehaviour"),

        enter: function () {
            this.log("Entering pick tool.");
        },

        leave: function () {
            this.log("Leaving pick tool.");
        },

        onTouch: function (e) {
            for (var i = 0; i < e.touches.length; i++) {
                var touch = e.touches[i];
                var point = this.view.screenPoint(touch.pageX, touch.pageY);
                if (e.type === "touchstart") {
                    this.handleTouchStart(point.x, point.y, e);
                } else if (e.type === "touchend") {
                    this.onMouseUp(point.x, point.y);
                }
            }
        },

        handleTouchStart: function (x, y, e) {
            this.onMouseDown(x, y, e);
        },

        onMouseDown: function (x, y, e) {
            // The user might be over a selection or an edit handle or a shape, or
            // nothing. Handle all cases.

            this.log("onMouseDown");
            // check if we clicked on a selection handle.
            var dir = this.view.getHandleUnderPoint(x, y);
            if (dir) {
                this.view.setBehaviour(new TransformSelectionBehaviour(this.view,
                        this, dir, false, x, y));
                return;
            }

            if (this.view.selection.length &&
                    this.view.selectionBounds.containsPoint(x, y)) {
                this.view.setBehaviour(new TransformSelectionBehaviour(this.view,
                        this, -1, true, x, y));

                return;
            }

            var node;
            var handle;

            // if there is an edit node,
            if (this.view.editNode) {
                // if we are over an edit node handle,
                node = this.view.editNode;
                handle = node.hitTestEditHandle(x, y, 1.0 / this.view.scale *
                        this.scaleTouchRadius);
                if (handle !== null) {
                    // start moving it.
                    this.view.setBehaviour(new MoveEditNodeBehaviour(this.view,
                            node, handle, x, y));
                    return;
                }
            }

            node = this.view.doc.hittest(x, y);
            // if we are over a node, 
            if (node) {
                var wasEditNode = node === this.view.editNode;
                var wasSelected = this.view.isNodeSelected(node);
                this.log("wasEditNode: %s, wasSelected: %s", wasEditNode,
                    wasSelected);

                // Did not click on the edit node.
                // if the node is not selected,
                if (!wasSelected) {
                    // select the node.
                    this.view.clearSelection();
                    this.view.addToSelection(node);
                    this.view.doneSelecting();
                    this.view.draw();
                }
                //if (node.type() == "TextNode") {
                //    this.view.setBehaviour(new DrawTextBehaviour(this.view, this.view.behaviour));
                //}else
                this.view.setBehaviour(new TransformSelectionBehaviour(
                        this.view, this, -1, !wasEditNode && wasSelected, x, y));

            } else {
                this.view.setEditNode(null);
                this.view.setBehaviour(new SelectBoxBehaviour(this.view, this, x,
                            y));
            }
        },

        onMouseUp: function (x, y) {
            this.log("onMouseUp");

        },

        onKeyCommand: function (action, e) {
            this.log("keyboard: %s", action);
            var handled = true;
            switch (action) {
                case "bring-to-front":
                    this.view.eventSource.emit("menu.bringToFront", {});
                    break;
                case "send-to-back":
                    this.view.eventSource.emit("menu.sendToBack", {});
                    break;
                case "left":
                    if (!this.view.nudgeSelection(-1, 0)) {
                        this.view.translateX = Math.min(this.view.translateX + 16,
                                0);
                        this.view.draw();
                    }
                    break;
                case "right":
                    if (!this.view.nudgeSelection(1, 0)) {
                        this.view.translateX = Math.max(
                            -(this.view.canvas.width * this.view.scale -
                            this.view.canvas.width),
                            this.view.translateX - 16);
                        this.view.draw();
                    }
                    break;
                case "up":
                    if (!this.view.nudgeSelection(0, -1)) {
                        this.view.translateY = Math.min(this.view.translateY + 16,
                                0);
                        this.view.draw();
                    }
                    break;
                case "down":
                    if (!this.view.nudgeSelection(0, 1)) {
                        this.view.translateY = Math.max(
                                -(this.view.canvas.height * this.view.scale -
                                  this.view.canvas.height),
                                this.view.translateY - 16);
                        this.view.draw();
                    }
                    break;
                case "select-none":
                    this.view.clearSelection();
                    this.view.doneSelecting();
                    this.view.draw();
                    if (this.view.isKeyboardCursorShown()) {
                        this.view.eventSource.emit("goto-toolbar");
                    }
                    break;
                case "duplicate":
                    this.view.eventSource.emit("menu.duplicate", {});
                    break;
                case "move-up":
                    this.view.eventSource.emit("menu.moveUp", {});
                    break;
                case "move-down":
                    this.view.eventSource.emit("menu.moveDown", {});
                    break;
                case "delete":
                    this.view.eventSource.emit("menu.delete", {});
                    break;
                case "curve-tool":
                    this.view.curveTool();
                    break;
                case "line-tool":
                    this.view.lineTool();
                    break;
                case "group":
                    this.view.eventSource.emit("menu.group", {});
                    break;
                case "ungroup":
                    this.view.eventSource.emit("menu.ungroup", {});
                    break;
                case "undo":
                    this.view.eventSource.emit("menu.undo", {});
                    break;
                case "redo":
                    this.view.eventSource.emit("menu.redo", {});
                    break;
                case "cut":
                    this.view.eventSource.emit("menu.cut", {});
                    break;
                case "copy":
                    this.view.eventSource.emit("menu.copy", {});
                    break;
                case "paste":
                    this.view.eventSource.emit("menu.paste", {});
                    break;
                case "zoom-1-1":
                    // on firefox, + is 107 but on chrome it's 189
                    this.view.scale = 1;
                    this.view.translateX = 0;
                    this.view.translateY = 0;
                    this.view.draw();
                    break;
                case "zoom-in":
                    this.view.scale = this.view.scale * 1.1;
                    this.view.draw();
                    break;
                case "zoom-out":
                    this.view.scale = this.view.scale / 1.1;
                    this.view.draw();
                    break;
                default:
                    handled = false;
            }

            if (handled) {
                e.preventDefault();
                e.stopPropagation();
            }
        },

        onColourClicked: function (e) {
            var property;
            if (e.button === 1) {
                this.view.defaultFillStyle = e.colour;
                this.view.defaultBrushStyle = e.colour;
                property = "fillStyle";
            } else {
                this.view.defaultStrokeStyle = e.colour;
                property = "strokeStyle";
            }

            this.view.setProperty(property, e.colour);
        },

        onDoubleClick: function (x, y) {
            this.log("onDoubleClick");
            var node = this.view.doc.hittest(x, y);
            // if we are over a node, and it has text,

            if (node && node.hasText()) {
                var isEditable = node.getProperty("isTextEditable");
                if (isEditable) {
                    var oldValue = node.getProperty("text"),
                        self = this;

                    editTextDialog("Enter new text:", oldValue, function (value) {
                        if (value !== null && value !== oldValue) {
                            self.changeText(node, value);
                        }
                    });
                }
            }

            if (node && node.hasData()) {
                this.view.zwibblerContext.app.startMathEditor(node.id);
            }

            if (node && node.type() == "TextNode") {
                this.view.setBehaviour(new DrawTextBehaviour(this.view));
                this.view.behaviour.onMouseDown(x, y);

            }


            this.log("hittest: %s, hasText: %s",
                     node !== null, node !== null && node.hasText());
        },

        changeText: function (node, text) {
            if (text === node.getProperty("text")) {
                return;
            }

            this.view.commit([new SetAction([node.id], "text", text)]);
        }
    };
    /*
    Zwibbler
    
    Copyright 2013 Hanov Solutions Inc. All Rights Reserved. This software is
    NOT open source. For licensing information, contact the author.
    
    steve.hanov@gmail.com
    */
    /*
    Here are some functions to help detect the types of objects.
    */
    var assert, assertArray, assertArrayOf, assertInstanceOf, assertNumber, assertString, isarray, isnumber, isstring;
    assert = null;
    /** @param {boolean} condition
    @param {string=} message
    */
    assert = function (condition, message) {
        if (message == null) {
            message = "Assertion failed";
        }
        if (!condition) {
            throw message;
        }
    };
    assertInstanceOf = function (fn, arg) {
        return assert(arg instanceof fn);
    };
    assertArray = function (arg) {
        return assert(Object.prototype.toString.apply(arg) === '[object Array]');
    };
    assertArrayOf = function (fn, arg) {
        return assert(arg.length === 0 || arg[0] instanceof fn);
    };
    assertString = function (arg) {
        return assert(typeof arg === 'string', "Expected a string");
    };
    assertNumber = function (arg) {
        return assert(typeof arg === 'number', "Expected a number");
    };
    isarray = function (arg) {
        return typeof arg === 'object' && Object.prototype.toString.apply(arg) === '[object Array]';
    };
    isstring = function (arg) {
        return typeof arg === 'string';
    };
    isnumber = function (arg) {
        return typeof arg === 'number';
    };
    /*
    Zwibbler
    
    Copyright 2013 Hanov Solutions Inc. All Rights Reserved. This software is
    NOT open source. For licensing information, contact the author.
    
    steve.hanov@gmail.com
    //#include <Assert.js>
    */
    /** @constructor 
    @param {(Array.<string>|*)=} var_args

    The set object implements a set of strings or numbers, with no
    duplicates.
    */
    /**
    * @constructor
    */
    var Set = function () {
        this.keys = {};
        this.length = 0;
        /*
        if arguments.length == 1 and typeof arguments[0] == 'object'
        if Object.prototype.toString.apply(arguments[0]) == '[object Array]'
        for key in arguments[0]
        @length += 1if not key of @keys
        @keys[key] = true
        else
        for key of arguments[0]
        @keys[key] = true
        */
    };

    Set.prototype.contains = function (key) {
        return key in this.keys;
    };
    /** @param {(Array.<string>|string|number)} arg */
    Set.prototype.add = function (arg) {
        var key, _i, _len, _ref, _results;
        if ((_ref = typeof arg) === "string" || _ref === "number") {
            if (!(arg in this.keys)) {
                this.keys[arg] = true;
                return this.length += 1;
            }
        } else if (typeof arg === "object" && Object.prototype.toString.apply(arg) === '[object Array]') {
            _results = [];
            for (_i = 0, _len = arg.length; _i < _len; _i++) {
                key = arg[_i];
                _results.push(!(arg in this.keys) ? (this.keys[arg] = true, this.length += 1) : void 0);
            }
            return _results;
        } else {
            return assert(false, "Arg must be an array");
        }
    };
    Set.prototype.remove = function (key) {
        return delete this.keys[key];
    };
    Set.prototype.intersect = function (other) {
        var key, result;
        assertInstanceOf(Set, other);
        result = new Set();
        for (key in this.keys) {
            if (other.contains(key)) {
                result.add(key);
            }
        }
        return result;
    };
    Set.prototype.unionWith = function (other) {
        var key, _results;
        assertInstanceOf(Set, other);
        _results = [];
        for (key in other.keys) {
            _results.push(this.add(key));
        }
        return _results;
    };
    Set.prototype.toArray = function () {
        var key, _results;
        _results = [];
        for (key in this.keys) {
            _results.push(key);
        }
        return _results;
    };
    Set.prototype.toMap = function () {
        return this.keys;
    };
    Set.prototype.clear = function () {
        this.keys = {};
    }; ;
    /*
    Zwibbler
    
    Copyright 2013 Hanov Solutions Inc. All Rights Reserved. This software is
    NOT open source. For licensing information, contact the author.
    
    steve.hanov@gmail.com
    */
    /*
    //#include <DomNode.js>
    //#include <TextNode.js>
    //#include <PathNode.js>
    //#include <GroupNode.js>
    //#include <ImageNode.js>
    //#include <BrushNode.js>
    //#include <MathNode.js>
    //#include <Set.js>
    */
    /*
    A document does not contain the shapes. Instead it contains the actions needed
    to build the document starting from nothing. Here are all the actions a user
    can perform.
    
    This is important for the Undo/Redo to work properly.
    */
    var TransformNode;
    /**
    * @constructor
    */
    var Action = function () { };

    /* 
    The rename function maps any ids that this action contains to other ids.
    */
    Action.prototype.rename = function (replacer) {
        var i, _ref, _results;
        if (this.id !== null && this.id !== undefined) {
            this.id = replacer(this.id);
        }
        if ((this.ids !== null && this.ids !== undefined) && this.ids.length > 0) {
            for (i = 0, _ref = this.ids.length - 1; 0 <= _ref ? i <= _ref : i >= _ref; 0 <= _ref ? i++ : i--) {
                this.ids[i] = replacer(this.ids[i]);
            }
        }
    };
    Action.prototype.log = log.create("ACTION");
    /*
    Dependent ids are the ids of objects that this action refers to. It is
    used to merge two branches of undo actions.
    */
    Action.prototype.getDependentIds = function (doc, set) {
        var ids;
        if (this.ids !== null) {
            ids = this.ids.concat();
        } else {
            ids = [];
        }
        if (this.id !== null) {
            ids.push(this.id);
        }
        return doc.closure(ids, set);
    };
    /* returns any ids that this action affects. */
    Action.prototype.getAffectedIds = function (doc, set) {
        return this.getDependentIds(doc, set);
    };
    Action.prototype.toString = function () {
        return "" + this._class + "()";
    };
    /* Create a node of the given type with the given properties. */
    /**
    * @constructor
    * @extends {Action}
    */
    var CreateAction = function (type, properties) {
        this.type = type;
        this.properties = properties;
    };
    __extends(CreateAction, Action);

    CreateAction.prototype._class = "CreateAction";
    CreateAction.prototype.redo = function (doc) {
        switch (this.type) {
            case "TextNode":
                this.node = new TextNode(doc.getNextId());
                break;
            case "PathNode":
                this.node = new PathNode(doc.getNextId());
                break;
            case "ImageNode":
                this.node = new ImageNode(doc.getNextId());
                break;
            case "BrushNode":
                this.node = new BrushNode(doc.getNextId());
                break;
            case "MathNode":
                this.node = new MathNode(doc.getNextId());
                break;
            case "DomNode":
                this.node = new DomNode(doc.getNextId());
                break;
        }
        if (!this.node) {
            this.log("Bad node type: %s", this.type);
        }
        this.node.setProperties(this.properties);
        return doc.addNode(this.node);
    };
    CreateAction.prototype.toString = function () {
        return "" + this._class + "(" + this.type + ", " + (JSON.stringify(this.properties)) + ")";
    };
    CreateAction.prototype.undo = function (doc) {
        return doc.removeNode(this.node);
    };
    CreateAction.prototype.getAffectedIds = function (doc, set) {
        return set.add(doc.peekNextId());
    };
    /* Remove all of the given nodes */
    /**
    * @constructor
    * @extends {Action}
    */
    var DeleteAction = function (ids) {
        this.ids = ids;
        this.old = [];
    };
    __extends(DeleteAction, Action);

    DeleteAction.prototype._class = "DeleteAction";
    DeleteAction.prototype.redo = function (doc) {
        var id, node, _i, _len, _ref, _results;
        this.old.length = 0;
        _ref = this.ids;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            id = _ref[_i];
            node = doc.getNode(id, false);
            _results.push(this.old.push({
                node: node,
                parent: node.parent,
                index: doc.removeNode(node)
            }));
        }
        return _results;
    };
    DeleteAction.prototype.undo = function (doc) {
        var old, _i, _len, _ref, _results;
        if (this.old.length === 0) {
            return;
        }
        _ref = this.old;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            old = _ref[_i];
            _results.push(doc.addChild(old.parent, old.node, old.index));
        }
        return _results;
    };
    /* For each node, set the property value. */
    /**
    * @constructor
    * @extends {Action}
    */
    var SetAction = function (ids, name, value) {
        this.ids = ids;
        this.name = name;
        this.value = value;
        this.oldValues = [];
    };
    __extends(SetAction, Action);

    SetAction.prototype._class = "SetAction";
    SetAction.prototype.redo = function (doc) {
        var id, node, _i, _len, _ref;
        this.oldValues.length = 0;
        _ref = this.ids;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            id = _ref[_i];
            node = doc.getNode(id, true);
            this.oldValues.push(node.getProperty(this.name));
            node.setProperty(this.name, this.value);
        }
    };
    SetAction.prototype.undo = function (doc) {
        var i, node, _ref;
        if (this.ids.length === 0) {
            return;
        }
        for (i = 0, _ref = this.ids.length - 1; 0 <= _ref ? i <= _ref : i >= _ref; 0 <= _ref ? i++ : i--) {
            node = doc.getNode(this.ids[i], true);
            node.setProperty(this.name, this.oldValues[i]);
        }
    };
    /* For each node, set the transformation matrix. */
    /**
    * @constructor
    * @extends {Action}
    */
    var TransformAction = function (ids, matrix, inverse) {
        this.ids = ids;
        this.matrix = matrix;
        this.inverse = inverse;
    };
    __extends(TransformAction, Action);

    TransformAction.prototype._class = "TransformAction";
    TransformAction.prototype.redo = function (doc) {
        var id, node, _i, _len, _ref;
        _ref = this.ids;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            id = _ref[_i];
            node = doc.getNode(id, true);
            node.transform(this.matrix, this.inverse);
        }
    };
    TransformAction.prototype.undo = function (doc) {
        var id, node, _i, _len, _ref;
        _ref = this.ids;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            id = _ref[_i];
            node = doc.getNode(id, true);
            node.transform(this.inverse, this.matrix);
        }
    };
    TransformAction.prototype.rename = function (replacer) {
        var i, _ref;
        if (this.ids.length === 0) {
            return;
        }
        for (i = 0, _ref = this.ids.length - 1; 0 <= _ref ? i <= _ref : i >= _ref; 0 <= _ref ? i++ : i--) {
            this.ids[i] = replacer(this.ids[i]);
        }
    };
    /* Set the path of the given path object. */
    /**
    * @constructor
    * @extends {Action}
    */
    var SetPathAction = function (id, commands) {
        this.id = id;
        this.commands = commands;
    };
    __extends(SetPathAction, Action);

    SetPathAction.prototype._class = "SetPathAction";
    SetPathAction.prototype.redo = function (doc) {
        var node;
        node = doc.getNode(this.id, true);
        this.oldCommands = node.setPath(this.commands);
    };
    SetPathAction.prototype.redo = function (doc) {
        var node;
        node = doc.getNode(this.id, true);
        node.setPath(this.oldCommands);
    };
    /* Move the edit handle of the given node by the given amount. */
    /**
    * @constructor
    * @extends {Action}
    */
    var MoveEditHandleAction = function (id, handle, offsetX, offsetY) {
        this.id = id;
        this.handle = handle;
        this.offsetX = offsetX;
        this.offsetY = offsetY;
    };
    __extends(MoveEditHandleAction, Action);

    MoveEditHandleAction.prototype._class = "MoveEditHandleAction";
    MoveEditHandleAction.prototype.redo = function (doc) {
        var node;
        node = doc.getNode(this.id, true);
        return node.moveEditHandle(this.handle, this.offsetX, this.offsetY);
    };
    MoveEditHandleAction.prototype.undo = function (doc) {
        var node;
        node = doc.getNode(this.id, true);
        return node.moveEditHandle(this.handle, -this.offsetX, -this.offsetY);
    };
    /*
    Create a new group consisting of the named nodes and add 
    it to the document.
    */
    /**
    * @constructor
    * @extends {Action}
    */
    var GroupAction = function (ids) {
        this.ids = ids;
        this.old = [];
    };
    __extends(GroupAction, Action);

    GroupAction.prototype._class = "GroupAction";
    GroupAction.prototype.redo = function (doc) {
        var id, node, _i, _len, _ref;
        this.old.length = 0;
        _ref = this.ids;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            id = _ref[_i];
            node = doc.getNode(id);
            this.old.push({
                node: node,
                parent: node.parent,
                index: node.parent.findChildIndex(node)
            });
        }
        this.node = doc.createGroup(this.ids);
    };
    GroupAction.prototype.undo = function (doc) {
        var i, info, _ref;
        if (this.ids.length === 0) {
            return;
        }
        for (i = _ref = this.ids.length - 1; i >= 0; i += -1) {
            if (i < 0) {
                break;
            }
            info = this.old[i];
            doc.addChild(info.parent, info.node, info.index);
        }
        return doc.removeNode(this.node);
    };
    GroupAction.prototype.getAffectedIds = function (doc, set) {
        return set.add(doc.peekNextId());
    };
    GroupAction.prototype.toString = function () {
        return "GroupAction(" + (JSON.stringify(this.ids)) + ")";
    };
    /* Remove the group nodes and add its members back to the document. */
    /**
    * @constructor
    * @extends {Action}
    */
    var UngroupAction = function (ids) {
        this.ids = ids;
        this.groups = [];
    };
    __extends(UngroupAction, Action);

    UngroupAction.prototype._class = "UngroupAction";
    UngroupAction.prototype.redo = function (doc) {
        var child, id, info, node, nodesProcessed, _i, _j, _len, _len2, _ref, _ref2, _ref3;
        nodesProcessed = [];
        _ref = this.ids;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            id = _ref[_i];
            node = doc.getNode(id);
            if (!node.isGroup()) {
                continue;
            }
            /* If the parent has already been processed, skip it. */
            _ref2 = node.id;
            if (__indexOf.call(nodesProcessed, _ref2) >= 0) {
                continue;
            }
            /* add the parent to the processed list */
            nodesProcessed[node.id] = true;
            info = {
                node: node,
                parent: node.parent,
                children: node.children.concat(),
                index: doc.removeNode(node)
            };
            this.groups.push(info);
            /* remove its children and add them to the root */
            _ref3 = info.children;
            for (_j = 0, _len2 = _ref3.length; _j < _len2; _j++) {
                child = _ref3[_j];
                doc.addChild(info.parent, child, -1);
            }
        }
    };
    UngroupAction.prototype.undo = function (doc) {
        var group, i, j, _ref, _ref2;
        if (this.groups.length === 0) {
            return;
        }
        for (i = _ref = this.groups.length - 1; i >= 0; i += -1) {
            if (i < 0) {
                break;
            }
            group = this.groups[i];
            if (group.children.length === 0) {
                continue;
            }
            for (j = _ref2 = group.children.length - 1; j >= 0; j += -1) {
                if (j < 0) {
                    break;
                }
                doc.addChild(group.node, group.children[j], -1);
            }
            doc.addChild(group.parent, group.node, group.index);
        }
        doc.forceRenumber();
    };
    TransformNode = function (node, matrix, inverse) {
        var child, _i, _len, _ref, _results;
        if (node.isGroup()) {
            _ref = node.children;
            _results = [];
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                child = _ref[_i];
                _results.push(TransformNode(child, matrix, inverse));
            }
            return _results;
        } else {
            return node.transform(matrix, inverse);
        }
    };
    /* Duplicate the given nodes, and shift the duplicates by the given offset. */
    /**
    * @constructor
    * @extends {Action}
    */
    var DuplicateAction = function (ids, offset) {
        this.ids = ids;
        this.offset = offset;
        this.nodes = [];
    };
    __extends(DuplicateAction, Action);

    DuplicateAction.prototype._class = "DuplicateAction";
    DuplicateAction.prototype.redo = function (doc) {
        var id, inverse, namer, node, xform, _i, _len, _ref;
        xform = new TranslateMatrix(this.offset, this.offset);
        inverse = xform.inverse();
        this.nodes.length = 0;
        namer = function () {
            return doc.getNextId();
        };
        _ref = this.ids;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            id = _ref[_i];
            node = (doc.getNode(id)).clone(namer);
            TransformNode(node, xform, inverse);
            doc.addNode(node);
            this.nodes.push(node);
        }
    };
    DuplicateAction.prototype.undo = function (doc) {
        var i, _ref;
        if (this.nodes.length === 0) {
            return;
        }
        for (i = _ref = this.nodes.length - 1; i >= 0; i += -1) {
            if (i < 0) {
                break;
            }
            doc.removeNode(this.nodes[i]);
        }
    };
    DuplicateAction.prototype.getAffectedIds = function (doc, set) {
        var base, count, id, _ref;
        base = doc.peekNextId();
        count = (doc.closure(this.ids)).length;
        for (id = base, _ref = count - 1; id <= _ref; id += 1) {
            set.add(id);
        }
    };
    /* Change the order of the given nodes, either bringing them to the front, */
    /* sending them to the back, or shifting them up or down the document layers */
    /**
    * @constructor
    * @extends {Action}
    */
    var ChangeOrderAction = function (ids, type) {
        this.ids = ids;
        this.type = type;
        this.nodes = [];
        this.oldPositions = [];
    };
    __extends(ChangeOrderAction, Action);

    ChangeOrderAction.prototype._class = "ChangeOrderAction";
    ChangeOrderAction.prototype.redo = function (doc) {
        var id, node, oldIndex, parent, _i, _len, _ref;
        this.oldPositions.length = 0;
        this.nodes.length = 0;
        _ref = this.ids;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            id = _ref[_i];
            node = doc.getNode(id);
            parent = node.parent;
            oldIndex = doc.removeNode(node);
            this.oldPositions.push(oldIndex);
            this.nodes.push(node);
            switch (this.type) {
                case ChangeOrderAction.BRING_TO_FRONT:
                    doc.addChild(parent, node, -1);
                    break;
                case ChangeOrderAction.SEND_TO_BACK:
                    doc.addChild(parent, node, 0);
                    break;
                case ChangeOrderAction.MOVE_DOWN:
                    if (oldIndex > 0) {
                        doc.addChild(parent, node, oldIndex - 1);
                    } else {
                        doc.addChild(parent, node, oldIndex);
                    }
                    break;
                case ChangeOrderAction.MOVE_UP:
                    if (oldIndex < parent.children.length) {
                        doc.addChild(parent, node, oldIndex + 1);
                    } else {
                        doc.addChild(parent, node, oldIndex);
                    }
            }
        }
    };
    ChangeOrderAction.prototype.undo = function (doc) {
        var i, node, parent, _ref;
        if (this.ids.length === 0) {
            return;
        }
        for (i = _ref = this.ids.length - 1; i >= 0; i += -1) {
            if (i < 0) {
                break;
            }
            node = this.nodes[i];
            parent = node.parent;
            doc.removeNode(node);
            doc.addChild(parent, node, this.oldPositions[i]);
        }
    };
    ChangeOrderAction.BRING_TO_FRONT = 0;
    ChangeOrderAction.SEND_TO_BACK = 1;
    ChangeOrderAction.MOVE_UP = 2;
    ChangeOrderAction.MOVE_DOWN = 3;

    var SetBackgroundAction = function (url) {
        this.createAction = new CreateAction("ImageNode", {
            "url": resolveUrl(decodeURIComponent(url)),
            "locked": true
        });

        this.oldBackground = null;
    };
    __extends(SetBackgroundAction, Action);

    SetBackgroundAction.prototype._class = "SetBackgroundAction";
    SetBackgroundAction.prototype.redo = function (doc) {
        this.oldBackground = doc.findBackground();

        this.createAction.redo(doc);
        doc.setBackground(this.createAction.node);
    };
    SetBackgroundAction.prototype.undo = function (doc) {
        this.createAction.undo(doc);

        if (this.oldBackground) {
            doc.setBackground(this.oldBackground);
        }
    };
    /*
    Zwibbler
    
    Copyright 2013 Hanov Solutions Inc. All Rights Reserved. This software is
    NOT open source. For licensing information, contact the author.
    
    steve.hanov@gmail.com
    */
    //#include <Actions.js>
    //#include <DefaultBehaviour.js>
    //#include <DrawBrushBehaviour.js>
    //#include <DrawFreeformBehaviour.js>
    //#include <DrawLinesBehaviour.js>
    //#include <DrawTextBehaviour.js>
    //#include <FormatRequest.js>
    //#include <log.js>
    //#include <SelectBoxBehaviour.js>
    /*jslint sub:true */


    /** 
    @constructor 
    @param {ZwibblerDocument} doc
    @param {ColourPanel} colourPanel
    @param {EventEmitter} eventSource
    
    Coordinates things that the user can do with their mouse with changes to the 
    document, and redraws the screen when the document changes.
    */
    function ZwibblerView(canvas, doc, colourPanel, eventSource, config) {
        this.init(canvas, doc, colourPanel, eventSource, config);
    }

    ZwibblerView.prototype = {
        /** 
        @param {ZwibblerDocument} doc
        @param {ColourPanel} colourPanel
        @param {EventEmitter} eventSource
        */
        init: function (canvas, doc, colourPanel, eventSource, config) {
            this.config = config;
            this.scale = config.scale;
            this.colourPanel = colourPanel;
            this.eventSource = eventSource;
            this.canvas = canvas[0];
            this.ctx = this.canvas.getContext("2d");
            this.zwibblerContext = null; // will be set later by app

            this.registerEvents();

            this.initializeKeyboardCursor();

            /** @private */
            this.behaviour = null;
            this.setBehaviour(new DefaultBehaviour(this));
            this.propertyPanel = null;

            var self = this;
            this.request = new FormatRequest();
            this.request.canvas = this.canvas;
            this.request.getScale = function () {
                return self.scale;
            };
            this.request.on("reformat", function (node) {
                self.log("Node %s requests reformat", node.id);
                if (self.doc.exists(node.id)) {
                    self.log("   Reformatting...");
                    self.doc.markRedraw(node.id);
                    self.update();
                }
            });

            this.request.on("convert-dom-request", function (dataString, node) {
                self.zwibblerContext.emit("convert-dom-request", dataString, node);
            });

            this.editNode = null;
            /** @const */
            this.HANDLE_RADIUS = 4;
            /** @const */
            this.RESIZE_RADIUS = 9;

            if (this.config.useTouch()) {
                this.HANDLE_TOUCH_RADIUS = this.HANDLE_RADIUS * 4;
            } else {
                this.HANDLE_TOUCH_RADIUS = this.HANDLE_RADIUS * 2;

            }

            /** @const */
            this.NE = 1;
            /** @const */
            this.SE = 2;
            /** @const */
            this.SW = 3;
            /** @const */
            this.NW = 4;
            /** @const */
            this.ROT = 5;
            this.eventSource.bind("menu.edit", function (e) {
                if (self.propertyPanel) {
                    self.propertyPanel.resetOffset();
                    self.propertyPanel.show();
                }
            });
            this.eventSource.bind("menu.undo", function (e) {
                self.undo();
            });
            this.eventSource.bind("menu.redo", function (e) {
                self.redo();
            });
            this.eventSource.bind("menu.copy", function (e) {
                self.copy();
            });
            this.eventSource.bind("menu.cut", function (e) {
                self.copy();
                self.deleteAction();
            });
            this.eventSource.bind("menu.paste", function (e) {
                self.paste();
            });
            this.eventSource.bind("menu.duplicate", function (e) {
                self.duplicate();
            });
            this.eventSource.bind("menu.moveUp", function (e) {
                self.moveUp();
            });
            this.eventSource.bind("menu.moveDown", function (e) {
                self.moveDown();
            });
            this.eventSource.bind("menu.bringToFront", function (e) {
                self.bringToFront();
            });
            this.eventSource.bind("menu.sendToBack", function (e) {
                self.sendToBack();
            });
            this.eventSource.bind("menu.group", function (e) {
                self.group();
            });
            this.eventSource.bind("menu.ungroup", function (e) {
                self.ungroup();
            });
            this.eventSource.bind("menu.delete", function (e) {
                self.deleteAction();
            });

            this.eventSource.bind("menu.outline-none", function (e) {
                self.setProperty("lineWidth", 0);
            });
            this.eventSource.bind("menu.outline-pencil", function (e) {
                self.setProperty("lineWidth", 1);
            });
            this.eventSource.bind("menu.outline-pen", function (e) {
                self.setProperty("lineWidth", 2);
            });
            this.eventSource.bind("menu.outline-marker", function (e) {
                self.setProperty("lineWidth", 4);
            });
            this.eventSource.bind("menu.shadow-none", function (e) {
                self.setProperty("shadow", false);
            });
            this.eventSource.bind("menu.shadow", function (e) {
                self.setProperty("shadow", true);
            });

            this.eventSource.bind("menu.font.FG Virgil", function (e) {
                self.setProperty("fontName", "FG Virgil");
            });
            this.eventSource.bind("menu.font.Stinky Kitty", function (e) {
                self.setProperty("fontName", "Stinky Kitty");
            });
            this.eventSource.bind("menu.font.Arial", function (e) {
                self.setProperty("fontName", "Arial");
            });
            this.eventSource.bind("menu.font.Times New Roman", function (e) {
                self.setProperty("fontName", "Times New Roman");
            });
            this.eventSource.bind("menu.sloppiness-draftsman", function (e) {
                self.setProperty("sloppiness", 0.0);
            });
            this.eventSource.bind("menu.sloppiness-artist", function (e) {
                self.setProperty("sloppiness", 0.25);
            });
            this.eventSource.bind("menu.sloppiness-Cartoonist", function (e) {
                self.setProperty("sloppiness", 0.5);
            });
            this.eventSource.bind("menu.sloppiness-child", function (e) {
                self.setProperty("sloppiness", 1.0);
            });
            this.eventSource.bind("menu.sloppiness-dizzy", function (e) {
                self.setProperty("sloppiness", 2.0);
            });

            this.eventSource.bind("menu.insert.cylinder", function (e) {
                var id = self.doc.peekNextId();
                var commands = new PathCommands([]);
                commands.moveTo(100, 100);
                commands.lineTo(200, 100);
                commands.lineTo(200, 200);
                commands.cornerTo(200, 225, 150, 225);
                commands.cornerTo(100, 225, 100, 200);
                commands.lineTo(100, 100);
                commands.close();
                var circle = new PathCommands();
                circle.moveTo(100, 100);
                circle.cornerTo(100, 75, 150, 75);
                circle.cornerTo(200, 75, 200, 100);
                circle.cornerTo(200, 125, 150, 125);
                circle.cornerTo(100, 125, 100, 100);
                circle.close();
                self.commit([
                    new CreateAction("PathNode",
                        {
                            "commands": commands.toArray()
                        }),
                    new CreateAction("PathNode",
                        {
                            "commands": circle.toArray()
                        }),
                    new GroupAction([id, id + 1])
                ]);
            });

            this.setDocument(doc);
        },

        log: log.create("VIEW"),

        /** 
        @param {ZwibblerDocument} doc 
        */
        setDocument: function (doc) {
            this.doc = doc;
            this.translateX = 0;
            this.translateY = 0;

            this.selection = [];
            this.editNode = null;
            this.selectGeneration = 1;
            this.selectionBounds = new Rectangle(0, 0, 0, 0);
            this.selectHandleTransform = new Matrix();
            this.enableRotationHandle = true;
            this.rotHandleX = 0;
            this.rotHandleY = 0;
            this.hintText = "";

            this.defaultFillStyle = "#ffffff";
            this.defaultBrushStyle = this.config.getOption("defaultBrushColour");
            this.defaultStrokeStyle =
                this.config.getOption("defaultOutlineColour");
            this.defaults = {};
            this.defaults["lineWidth"] =
                this.config.getDefaultOutlineThickness();
            this.defaults["sloppiness"] = 0.5;
            this.defaults["fontName"] = this.config.getOption("defaultFont");
            this.defaults["fontSize"] = this.config.getOption("defaultFontSize");
            this.defaults["arrowSize"] =
                this.config.getDefaultArrowSize();
            this.defaults["smoothness"] = 0.3;
            this.defaults["textFillStyle"] =
                this.config.getOption("defaultTextColour");
            this.defaults["shadow"] = this.config.getOption("defaultShadow");
            this.defaultBrushThickness = this.config.getDefaultBrushThickness();

            this.doc.format(this.ctx, this.request);
            this.draw();
        },

        setDefault: function (name, value) {
            this.defaults[name] = value;
            if (name === "fillStyle") {
                this.defaultFillStyle = value;
            } else if (name === "strokeStyle") {
                this.defaultStrokeStyle = value;
            }
        },

        // convert the screen coordinate into a document coordinate.                
        screenPoint: function (pagex, pagey) {
            var border = 4;
            var offset = $(this.canvas).offset();
            var x = (pagex - offset.left - border - this.translateX) / this.scale;
            var y = (pagey - offset.top - border - this.translateY) / this.scale;
            return this.snap(new Point(x, y));
        },

        // inverse of screenPoint
        documentPoint: function (docx, docy) {
            var border = 4;
            var offset = $(this.canvas).offset();
            var x = docx * this.scale + this.translateX + offset.left + border;
            var y = docy * this.scale + this.translateY + offset.top + border;
            return new Point(x, y);
        },

        touchPoint: function (touch) {
            return this.screenPoint(touch.pageX, touch.pageY);
        },

        onKeyCommand: function (action, e) {
            if (this.handleKeyboardCursorKeys(action, e)) {
                return;
            }

            // check if the current behavious would like notification of the
            // keypress.
            if (this.behaviour.onKeyCommand) {
                this.behaviour.onKeyCommand(action, e);
            }

            // if the key would cause scrolling of the browser, ensure that its
            // action is canceled.
            switch (action) {
                case "send-to-back":
                case "bring-to-front":
                case "move-up":
                case "move-down":
                case "up":
                case "down":
                    e.preventDefault();
                    e.stopPropagation();
                    break;
            }
        },

        registerEvents: function () {
            var self = this;
            var border = 4;

            this.canvas.addEventListener("touchstart", function (e) {
                if (self.isReadOnly()) {
                    e.stopPropagation();
                    e.preventDefault();
                    return;
                }
                if (self.behaviour.onTouch) {
                    self.behaviour.onTouch(e);
                    e.stopPropagation();
                    e.preventDefault();
                }
            }, false);

            this.canvas.addEventListener("touchmove", function (e) {
                if (self.isReadOnly()) {
                    e.stopPropagation();
                    e.preventDefault();
                    return;
                }
                if (self.behaviour.onTouch) {
                    self.behaviour.onTouch(e);
                    e.stopPropagation();
                    e.preventDefault();
                }
            }, false);

            this.canvas.addEventListener("touchend", function (e) {
                if (self.isReadOnly()) {
                    e.stopPropagation();
                    e.preventDefault();
                    return;
                }
                if (self.behaviour.onTouch) {
                    self.behaviour.onTouch(e);
                    e.stopPropagation();
                    e.preventDefault();
                }
            }, false);

            this.canvas.addEventListener("gesturestart", function (e) {
                if (self.isReadOnly()) {
                    e.stopPropagation();
                    e.preventDefault();
                    return;
                }
                self.log("GestureStart");
                if (self.behaviour.onGesture) {
                    self.behaviour.onGesture(e);
                    e.stopPropagation();
                    e.preventDefault();
                }
            }, false);

            this.canvas.addEventListener("gesturechange", function (e) {
                if (self.isReadOnly()) {
                    e.stopPropagation();
                    e.preventDefault();
                    return;
                }
                self.log("GestureChange");
                if (self.behaviour.onGesture) {
                    self.behaviour.onGesture(e);
                    e.stopPropagation();
                    e.preventDefault();
                }
            }, false);

            this.canvas.addEventListener("gestureend", function (e) {
                if (self.isReadOnly()) {
                    e.stopPropagation();
                    e.preventDefault();
                    return;
                }
                self.log("GestureEnd");
                if (self.behaviour.onGesture) {
                    self.behaviour.onGesture(e);
                    e.stopPropagation();
                    e.preventDefault();
                }
            }, false);

            $(this.canvas).mousemove(function (e) {
                if (self.isReadOnly()) {
                    e.stopPropagation();
                    e.preventDefault();
                    return;
                }
                if (self.behaviour.onMouseMove) {
                    var offset = $(self.canvas).offset();
                    var x = (e.pageX - offset.left - border - self.translateX) / self.scale;
                    var y = (e.pageY - offset.top - border - self.translateY) / self.scale;
                    self.behaviour.onMouseMove(x, y);
                }
            });

            $(this.canvas).mousedown(function (e) {
                if (self.isReadOnly()) {
                    e.stopPropagation();
                    e.preventDefault();
                    return;
                }
                var offset = $(self.canvas).offset();
                self.log("Offset=%s", offset);
                if (self.behaviour.onMouseDown) {
                    var x = (e.pageX - offset.left - border - self.translateX) / self.scale;
                    var y = (e.pageY - offset.top - border - self.translateY) / self.scale;
                    self.behaviour.onMouseDown(x, y, e);
                }
                e.preventDefault();
            });

            $(this.canvas).mouseup(function (e) {
                if (self.isReadOnly()) {
                    e.stopPropagation();
                    e.preventDefault();
                    return;
                }
                var offset = $(self.canvas).offset();
                if (self.behaviour.onMouseUp) {
                    var x = (e.pageX - offset.left - border - self.translateX) / self.scale;
                    var y = (e.pageY - offset.top - border - self.translateY) / self.scale;
                    self.behaviour.onMouseUp(x, y);
                }
                e.preventDefault();
            });

            $(this.canvas).click(function (e) {
                if (self.isReadOnly()) {
                    e.stopPropagation();
                    e.preventDefault();
                    return;
                }
                var offset = $(self.canvas).offset();
                $(self.canvas).focus();
                if (self.behaviour.onMouseClick) {
                    var x = (e.pageX - offset.left - border - self.translateX) / self.scale;
                    var y = (e.pageY - offset.top - border - self.translateY) / self.scale;
                    self.behaviour.onMouseClick(x, y);
                }
                e.preventDefault();
            });

            $(this.canvas).on("dblclick dbltap", function (e) {
                if (self.isReadOnly()) {
                    e.stopPropagation();
                    e.preventDefault();
                    return;
                }
                var offset = $(self.canvas).offset();
                if (self.behaviour.onDoubleClick) {
                    var x = (e.pageX - offset.left - border - self.translateX) / self.scale;
                    var y = (e.pageY - offset.top - border - self.translateY) / self.scale;
                    self.behaviour.onDoubleClick(x, y);
                }
                e.preventDefault();
            });

            $(this.canvas).focus();

            this.colourPanel.bind("colour", function (e) {
                if (self.isReadOnly()) {
                    e.stopPropagation();
                    e.preventDefault();
                    return;
                }
                if (self.behaviour.onColourClicked) {
                    self.behaviour.onColourClicked(e);
                }
            });
        },

        /**
        The keyboard cursor, when enabled, can be moved around the document
        using the arrow keys. As it is moved, and when enter is pressed, it 
        triggers simulated mouse events.
    
        The x and y coordinates of the keyboard cursor work on screen, not
        document coordinates. The origin is the top left of the canvas.
        */
        initializeKeyboardCursor: function () {
            var self = this;
            this.keyboardCursor = {
                shown: false,
                // Whether the fake mouse button is down. This is toggled
                // when enter is pressed.
                dragging: false,
                // when set to true, the cursor becomes a text entry caret.
                caret: false,
                x: 100,
                y: 100
            };
        },

        /** Move the keyboard cursor when a key is pressed. 
    
        @param {string} action
        */
        handleKeyboardCursorKeys: function (action, e) {
            if (!this.keyboardCursor.shown) {
                return false;
            }

            var moveX = 0, moveY = 0;
            // use the nudge config parameter to determine how far to move.
            var nudge = this.config.get("nudge");
            var eventType;

            switch (action) {
                case "right":
                    moveX = nudge;
                    break;
                case "left":
                    moveX = -nudge;
                    break;
                case "down":
                    moveY = nudge;
                    break;
                case "up":
                    moveY = -nudge;
                    break;
                case "enter":
                    // if the behaviour expects a click event, provide one.
                    // Otherwise, emulate dragging behaviour.
                    if (this.behaviour.onMouseClick) {
                        this.keyboardCursor.dragging = false;
                        eventType = "click";
                    } else {
                        this.keyboardCursor.dragging = !this.keyboardCursor.dragging;
                        if (this.keyboardCursor.dragging) {
                            eventType = "mousedown";
                        } else {
                            eventType = "mouseup";
                        }
                    }
                    break;
            }

            if (moveX || moveY) {
                this.keyboardCursor.x += moveX;
                this.keyboardCursor.x = Math.max(this.keyboardCursor.x, 0);
                this.keyboardCursor.x = Math.min(this.canvas.width,
                        this.keyboardCursor.x);

                this.keyboardCursor.y += moveY;
                this.keyboardCursor.y = Math.max(this.keyboardCursor.y, 0);
                this.keyboardCursor.y = Math.min(this.canvas.height,
                        this.keyboardCursor.y);

                this.draw();
                eventType = "mousemove";
            }

            if (eventType) {
                e.preventDefault();
                e.stopPropagation();

                // Draw now to show the new cursor position. Dispatch the event
                // afterwards in case it results in drawing more stuff on top of the
                // document.
                this.draw();

                var offset = $(this.canvas).offset();
                var x = this.keyboardCursor.x + offset.left;
                var y = this.keyboardCursor.y + offset.top;
                this.log("Simulate a %s at (%s,%s)", eventType, x, y);
                var evt = document.createEvent("MouseEvents");
                evt.initMouseEvent(eventType, true, true, window,
                      0,
                      x, y, x, y, false, false, false, false,
                      this.keyboardCursor.dragging ? 1 : 0,
                      null);
                this.canvas.dispatchEvent(evt);
                return true;
            }

            return false;
        },

        /** 
        Just show the keyboard cursor.
    
        @param {boolean=} caret
        */
        showKeyboardCursor: function (caret) {
            this.keyboardCursor.shown = true;
            this.keyboardCursor.dragging = false;
            this.keyboardCursor.caret = caret;
            this.log("Showing keyboard cursor, caret=%s", caret);
            this.draw();
        },

        /**
        Show the keyboard cursor. If items are selected, move the cursor to the
        centre of the selection and begin moving the shapes.
        */
        showKeyboardCursorAndStartMoving: function () {
            this.keyboardCursor.shown = true;
            this.keyboardCursor.caret = false;
            if (this.selection.length > 0) {
                this.log("showKeyboardCursorAndStartMoving()");
                this.keyboardCursor.dragging = true;
                var centre = this.selectionBounds.centre();
                var border = 4;
                this.keyboardCursor.x = centre.x;
                this.keyboardCursor.y = centre.y;

                this.pickTool();
                this.setBehaviour(new TransformSelectionBehaviour(this,
                            this.behaviour, null, false, centre.x - border,
                            centre.y - border));
            }

            this.draw();
        },

        /**
        Hide the keyboard cursor.
        */
        hideKeyboardCursor: function () {
            if (this.keyboardCursor.shown) {
                this.keyboardCursor.shown = false;
                this.draw();
            }
        },

        /**
        @return {boolean}
        */
        isKeyboardCursorShown: function () {
            return this.keyboardCursor.shown;
        },

        /** 
        @param {Point} pt
        @return {Point}
        */
        snap: function (pt) {
            var snap = this.config.get("snap");
            var x, y;
            if (snap > 0) {
                x = Math.round(pt.x / snap) * snap;
                y = Math.round(pt.y / snap) * snap;
            } else {
                x = pt.x;
                y = pt.y;
            }
            return new Point(x, y);
        },

        moveUp: function () {
            var ids = this.getSelectedIds();
            if (ids.length) {
                this.commit([
                    new ChangeOrderAction(ids,
                        ChangeOrderAction.MOVE_UP)

                ]);
            }
        },

        moveDown: function () {
            var ids = this.getSelectedIds();
            if (ids.length) {
                this.commit([
                    new ChangeOrderAction(ids,
                        ChangeOrderAction.MOVE_DOWN)

                ]);
            }

        },

        bringToFront: function () {
            var ids = this.getSelectedIds();
            if (ids.length) {
                this.commit([
                    new ChangeOrderAction(ids,
                        ChangeOrderAction.BRING_TO_FRONT)

                ]);
            }

        },

        sendToBack: function () {
            var ids = this.getSelectedIds();
            if (ids.length) {
                this.commit([
                    new ChangeOrderAction(ids,
                        ChangeOrderAction.SEND_TO_BACK)

                ]);
            }

        },

        setProperty: function (key, value) {
            var ids = this.getSelectedIds();
            this.defaults[key] = value;
            if (ids.length) {
                this.commit([
                    new SetAction(ids, key, value)
                ]);
            }

            if (this.selection.length > 0 && key === "lineWidth" && this.selection[0].type() ===
                    "BrushNode") {
                this.defaultBrushThickness = value;
            }
        },

        group: function () {
            var ids = this.getSelectedIds();
            if (ids.length) {
                this.commit([
                    new GroupAction(ids)
                ]);
            }
        },

        ungroup: function () {
            var ids = this.getSelectedIds();
            if (ids.length) {
                this.commit([
                    new UngroupAction(ids)
                ]);
            }

        },

        deleteAction: function () {
            var ids = this.getSelectedIds();
            if (ids.length) {
                this.commit([
                    new DeleteAction(ids)
                ]);
                if (this.propertyPanel) {
                    this.propertyPanel.loadFromNodes([]);                    
                }
                
            }
            this.pickTool();
        },

        clearSelection: function () {
            if (this.selection.length > 0) {
                this.selectGeneration += 1;
                this.selection.length = 0;
                this.log("Clear selection. selectGeneration=%s", this.selectGeneration);
            }
        },

        /** 
        @param {BaseNode} node
        */
        addToSelection: function (node) {
            // selection implies no edit node.
            this.setEditNode(null);

            if (node.selectGeneration === this.selectGeneration) {
                // already selected.
                return;
            }

            this.selection.push(node);
            node.selectGeneration = this.selectGeneration;

            // if the node is a group member, then also add its siblings.
            if (node.isGroupMember()) {
                var parent = node.parent;
                for (var i = 0; i < parent.children.length; i++) {
                    this.addToSelection(parent.children[i]);
                }
                this.addToSelection(parent);
            }

            // if the node has children, then also add its children.
            if (node.children && node.children.length > 0) {
                this.addToSelection(node.children[0]);
            }

        },

        /** 
        @param {Array.<BaseNode>} nodes
        */
        selectNodes: function (nodes) {
            this.clearSelection();
            for (var i = 0; i < nodes.length; i++) {
                this.addToSelection(nodes[i]);
            }
            this.doneSelecting();
        },

        /** 
        @param {Array.<Action>} actions
        @param {boolean=} alreadyDone
        */
        commit: function (actions, alreadyDone) {
            var addedNodes = this.doc.commit(actions, alreadyDone);
            this.doc.format(this.ctx, this.request);
            if (addedNodes.length) {
                this.selectNodes(addedNodes);
            } else if (this.selection.length || this.editNode) {
                var j = 0;
                this.selectGeneration += 1;
                for (var i = 0; i < this.selection.length; i++) {
                    if (i !== j) {
                        this.selection[j] = this.selection[i];
                    }

                    if (this.doc.exists(this.selection[j].id)) {
                        this.selection[j].selectGeneration = this.selectGeneration;
                        j++;
                    }
                }
                if (this.selection.length !== j) {
                    this.selection.length = j;
                    this.calcSelection();
                }

                if (this.selection.length === 0) {
                    this.clearSelection();
                }

                if (this.editNode && !this.doc.exists(this.editNode.id)) {
                    this.editNode = null;
                }
            }
            this.calcSelection();
            this.draw();
            this.eventSource.emit("document-changed");
        },

        /** 
        @param {Rectangle} rect
        */
        selectByRect: function (rect) {
            var nodes = this.doc.getNodesInRectangle(rect);
            for (var i = 0; i < nodes.length; i++) {
                this.addToSelection(nodes[i]);
            }
        },

        doneSelecting: function () {
            this.calcSelection();
            if (this.propertyPanel) {
                this.propertyPanel.loadFromNodes(this.selection);
            }
        },

        calcSelection: function () {
            if (this.selection.length === 0) {
                return;
            }

            this.selectionBounds = this.selection[0].getRect().clone();

            for (var i = 1; i < this.selection.length; i++) {
                this.selectionBounds.union(this.selection[i].getRect());
            }

            this.rotHandleX = this.selectionBounds.x +
                this.selectionBounds.width - 20 / this.scale;
            this.rotHandleY = this.selectionBounds.y;
        },

        checkSelection: function () {
            var dest = 0;
            // remove nodes that don't exist anymore from the selection
            for (var i = 0; i < this.selection.length; i++) {
                if (i !== dest) {
                    this.selection[dest] = this.selection[i];
                }

                if (this.doc.exists(this.selection[dest].id)) {
                    dest += 1;
                }
            }

            if (this.selection.length !== dest) {
                this.selection.length = dest;
            }
        },

        /**
        @return {Array.<BaseNode>}
        */
        getSelectedNodes: function () {
            var nodes = this.selection.concat();
            if (this.editNode) {
                nodes.push(this.editNode);
            }

            this.log("editNode=%s", this.editNode ? this.editNode.id : "none");
            for (var i = 0; i < nodes.length; i++) {
                this.log("Selected node=%s", nodes[i].id);
            }
            return nodes;
        },

        /**
        @return {Array.<number>}
        */
        getSelectedIds: function () {
            var result = [];
            var nodes = this.doc.collapseGroups(this.getSelectedNodes());

            for (var i = 0; i < nodes.length; i++) {
                this.log("Selected id=%s", nodes[i].id);
                result.push(nodes[i].id);
            }

            return result;
        },

        /** 
        @return {boolean}
        */
        hasSelection: function () {
            return this.selection.length > 0;
        },

        /** @param {boolean=} forceDraw */
        update: function (forceDraw) {
            this.doc.forceRedraw = forceDraw === true || this.doc.forceRedraw;
            if (this.doc.format(this.ctx, this.request) || forceDraw) {
                this.calcSelection();
                this.draw();
            }
        },

        drawBackground: function () {
            var snap = this.config.get("snap");
            if (snap > 0) {
                this.ctx.beginPath();
                for (var y = 0; y < this.canvas.height; y += snap) {
                    for (var x = 0; x < this.canvas.width; x += snap) {
                        this.ctx.arc(x, y, 3, 0, 2 * Math.PI, false);
                        this.log("x=%s width=%s", x, this.canvas.width);
                    }
                }

                this.ctx.fillStyle = "#c0c0c0";
                this.ctx.fill();
            }
        },

        /**
        Draws the keyboard cursor, if it is shown.
    
        @param {CanvasRenderingContext2D} ctx
        */
        drawKeyboardCursor: function (ctx) {
            if (this.keyboardCursor.shown) {
                var x = this.keyboardCursor.x;
                var y = this.keyboardCursor.y;
                ctx.globalCompositeOperation = "xor";
                ctx.beginPath();

                if (this.keyboardCursor.caret) {
                    ctx.moveTo(x - 3, y - 10);
                    ctx.lineTo(x + 3, y - 10);

                    ctx.moveTo(x - 3, y + 10);
                    ctx.lineTo(x + 3, y + 10);

                    ctx.moveTo(x, y - 10);
                    ctx.lineTo(x, y + 10);
                } else {
                    ctx.moveTo(x, y - 3);
                    ctx.lineTo(x, y - 15);

                    ctx.moveTo(x, y + 3);
                    ctx.lineTo(x, y + 15);

                    ctx.moveTo(x - 3, y);
                    ctx.lineTo(x - 15, y);

                    ctx.moveTo(x + 3, y);
                    ctx.lineTo(x + 15, y);
                }

                if (this.keyboardCursor.dragging) {
                    this.ctx.arc(x, y, 8, 0, 2 * Math.PI, false);
                }

                ctx.lineWidth = 2;
                ctx.strokeStyle = "#000000";
                ctx.stroke();
                ctx.globalCompositeOperation = "source-over";
            }
        },

        draw: function () {
            this.ctx.setTransform(1, 0, 0, 1, 0, 0);
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.drawBackground();

            this.ctx.translate(this.translateX, this.translateY);
            this.ctx.scale(this.scale, this.scale);
            this.doc.draw(this.ctx);
            if (this.behaviour.onRedraw) {
                this.behaviour.onRedraw(this.ctx);
            }

            if (this.selection.length > 0) {
                this.ctx.save();
                this.ctx.strokeStyle = "#000000";
                this.ctx.lineWidth = 1.0 / this.scale;

                var tr = this.selectHandleTransform.apply(
                    this.selectionBounds.x,
                    this.selectionBounds.y);
                var tl = this.selectHandleTransform.apply(
                    this.selectionBounds.x + this.selectionBounds.width,
                    this.selectionBounds.y);
                var bl = this.selectHandleTransform.apply(
                    this.selectionBounds.x + this.selectionBounds.width,
                    this.selectionBounds.y + this.selectionBounds.height);
                var br = this.selectHandleTransform.apply(
                    this.selectionBounds.x,
                    this.selectionBounds.y + this.selectionBounds.height);

                if (tr.x < 0) {
                    tr.x = 0;
                    br.x = 0;
                    tl.x = this.selectionBounds.width;                    
                    bl.x = this.selectionBounds.width;
                }

                if (tr.y < 0) {
                    tr.y = 0;
                    tl.y = 0;
                    br.y = this.selectionBounds.height;
                    bl.y = this.selectionBounds.height;
                }

                if (tl.x > this.canvas.width) {
                    tl.x = this.canvas.width;
                    bl.x = this.canvas.width;
                    tr.x = this.canvas.width - this.selectionBounds.width;
                    br.x = this.canvas.width - this.selectionBounds.width;
                }

                if (br.y > this.canvas.height) {
                    br.y = this.canvas.height;
                    bl.y = this.canvas.height;
                    tl.y = this.canvas.height - this.selectionBounds.height;
                    tr.y = this.canvas.height - this.selectionBounds.height;
                }


                var rh = new Point(this.rotHandleX, this.rotHandleY);

                var r = this.HANDLE_RADIUS / this.scale;
                this.ctx.strokeRect(tl.x - r, tl.y - r, r * 2, r * 2);
                this.ctx.strokeRect(tr.x - r, tr.y - r, r * 2, r * 2);
                this.ctx.strokeRect(br.x - r, br.y - r, r * 2, r * 2);
                this.ctx.strokeRect(bl.x - r, bl.y - r, r * 2, r * 2);

                if (this.enableRotationHandle) {
                    this.ctx.beginPath();
                    this.ctx.strokeStyle = "#008000";
                    this.ctx.lineWidth = 3.0 / this.scale;
                    this.ctx.moveTo(rh.x, rh.y);
                    this.ctx.arc(rh.x, rh.y, 6.0 / this.scale, 0, 1.5 * Math.PI, false);
                    this.ctx.stroke();
                }
            }

            if (this.editNode) {
                this.editNode.drawEditHandles(this.ctx, 1.0 / this.scale);
            }

            if (this.hintText) {
                this.ctx.save();
                this.ctx.font = "12px Arial";
                this.ctx.fillStyle = "#000000";
                this.ctx.textBaseline = "top";
                this.ctx.textAlign = "right";
                this.ctx.fillText(this.hintText, this.ctx.canvas.width, 0);
                this.ctx.restore();
            }

            this.drawKeyboardCursor(this.ctx);
        },

        /**
        @param {BaseNode} node
        */
        setEditNode: function (node) {
            this.editNode = node;
        },

        /**
        @param {Matrix} matrix
        */
        transformSelectHandles: function (matrix) {
            this.selectHandleTransform = matrix;
        },

        /**
        @param {boolean} shown
        */
        showRotationHandle: function (shown) {
            this.enableRotationHandle = shown;
        },

        /**
        @param {BaseNode} node
        @return {boolean}
        */
        isNodeSelected: function (node) {
            return node.selectGeneration === this.selectGeneration;
        },

        /**
        @param {number} x
        @param {number} y
        @return {number|null}
        */
        getHandleUnderPoint: function (x, y) {
            if (this.selection.length) {
                var r = this.HANDLE_TOUCH_RADIUS / this.scale;
                if (x >= this.selectionBounds.x - r && x < this.selectionBounds.x + r
                        ) {
                    if (y >= this.selectionBounds.y - r &&
                        y < this.selectionBounds.y + r) {
                        return this.NW;
                    } else if (y >= this.selectionBounds.y +
                            this.selectionBounds.height - r && y <
                            this.selectionBounds.y + this.selectionBounds.height +
                            r
                    ) {
                        return this.SW;
                    }
                } else if (
                        x >= this.selectionBounds.x + this.selectionBounds.width - r &&
                        x < this.selectionBounds.x + this.selectionBounds.width + r
                ) {
                    if (y >= this.selectionBounds.y - r &&
                        y < this.selectionBounds.y + r) {
                        return this.NE;
                    } else if (y >= this.selectionBounds.y +
                            this.selectionBounds.height - r && y <
                            this.selectionBounds.y + this.selectionBounds.height +
                            r
                    ) {
                        return this.SE;
                    }
                }

                if (x >= this.rotHandleX - r && x < this.rotHandleX + r &&
                     y >= this.rotHandleY - r && y < this.rotHandleY + r) {
                    return this.ROT;
                }
            }

            return null;
        },

        undo: function () {
            // Undo should not affect the canvas if there are no elements in it.
            if (this.zwibblerContext && !this.zwibblerContext.isValid())
                return;
            this.doc.undo();
            this.doc.format(this.ctx, this.request);
            this.checkSelection();
            this.calcSelection();
            this.draw();
            this.eventSource.emit("document-changed");
            this.pickTool();
        },

        redo: function () {
            this.doc.redo();
            this.doc.format(this.ctx, this.request);
            this.checkSelection();
            this.calcSelection();
            this.draw();
            this.eventSource.emit("document-changed");
            this.pickTool();
        },
        objectCounter: 0,
        copy: function () {
            var nodes = this.getSelectedNodes();
            if (nodes.length === 0) {
                return;
            }
            this.objectCounter = 0;
            this.copiedTransaction = this.doc.saveTransactions(nodes);
            this.pickTool();
        },

        duplicate: function () {
            var ids = this.getSelectedIds();
            if (ids.length > 0) {
                this.commit([
                    new DuplicateAction(ids, 10)
                ]);
            }
        },

        paste: function () {
            var saved = this.copiedTransaction;
            if (!saved)
                return;
            var offset = (++this.objectCounter) * 5;
            var actions = this.doc.loads(saved, offset);
            this.commit(actions);
            this.update();
            this.pickTool();
        },

        /**
        @param {string} text
        */
        setHintText: function (text) {
            this.hintText = text;
        },

        pickTool: function () {
            this.setBehaviour(new DefaultBehaviour(this));
        },

        setBehaviour: function (behaviour) {
            if (this.behaviour && this.behaviour.leave) {
                this.behaviour.leave();
            }

            this.behaviour = behaviour;
            if (behaviour.enter) {
                behaviour.enter();
            }
        },

        lineTool: function () {
            this.setBehaviour(new DrawLinesBehaviour(this,
                    false, false));
        },

        drawFreeformTool: function () {
            this.setBehaviour(new DrawFreeformBehaviour(this, this.behaviour));
        },

        drawBrushTool: function () {
            this.setBehaviour(new DrawBrushBehaviour(this, this.behaviour));
        },

        curveTool: function () {
            this.setBehaviour(new DrawLinesBehaviour(this,
                    true, false));
        },

        arrowTool: function () {
            this.setBehaviour(new DrawLinesBehaviour(this,
                    true, true));
        },

        textTool: function () {
            this.setBehaviour(new DrawTextBehaviour(this));
        },

        /**
        This is called by the property panel when someone clicks a property that
        is a button. Typically it is labeled "Edit..." and when it is clicked
        something has to pop up.
    
        @param {string} propertyName
        */
        onPropertyButtonClicked: function (propertyName) {
            this.log("Someone clicked a button for %s", propertyName);
            if (propertyName === "mathml") {
                this.eventSource.emit("math.edit", this.getSelectedIds()[0]);
            }
        },

        /*
        Nudge the selection in the given direction. dx, dy are either 0 or one
        and give the direction vector.
    
        Returns false if nothing is selected.
        */
        nudgeSelection: function (dx, dy) {
            var nudge = this.config.get("nudge");
            dx *= nudge / this.scale;
            dy *= nudge / this.scale;
            this.log("Nudge selection by %s, %s", dx, dy);

            var ids = this.getSelectedIds();
            if (ids.length) {
                var xform = new TranslateMatrix(dx, dy);

                this.commit([
                    new TransformAction(ids, xform, xform.inverse())
                ]);
            }
            return ids.length > 0;
        },

        isReadOnly : function () {
            return this.zwibblerContext && this.zwibblerContext.isReadOnly();
        }
    };
    /*
    Zwibbler
    
    Copyright 2013 Hanov Solutions Inc. All Rights Reserved. This software is
    NOT open source. For licensing information, contact the author.
    
    steve.hanov@gmail.com
    //#include <Transaction.js>
    //#include <log.js>
    //#include <EventEmitter.js>
    //#include <Assert.js>
    */
    /*
    The transaction list contains all of the actions that the user has done to
    create the document.
    */
    /** @constructor */
    /**
    * @constructor
    */
    var TransactionList = function () {
        this.transactions = [];
        this.next = 0;
    };

    TransactionList.prototype.log = log.create("TRANSLIST");
    TransactionList.prototype.getIndex = function () {
        return this.next;
    };
    /** @param {(number|null)=} base
    */
    TransactionList.prototype.commit = function (doc, actions, base) {
        var parentid;
        if (base == null) {
            base = null;
        }
        if (this.transactions.length) {
            parentid = this.transactions[this.transactions.length - 1].getId();
        } else {
            parentid = "0";
        }
        this.transactions.length = this.next;
        if (base === null) {
            this.transactions.push(new Transaction(parentid, actions, doc.peekNextId(), null));
            return this.redo(doc);
        } else {
            this.transactions.push(new Transaction(parentid, actions, base, null));
            return this.next += 1;
        }
    };
    TransactionList.prototype.commitTransaction = function (doc, transaction, affectedIds, dependentIds) {
        var parentid;
        if (this.transactions.length) {
            parentid = this.transactions[this.transactions.length - 1].getId();
        } else {
            parentid = "0";
        }
        if (transaction.parentid !== parentid) {
            throw "ERROR! mismatched parent id";
        }
        if (transaction.base !== doc.peekNextId()) {
            throw "ERROR! mismatched base id";
        }
        this.transactions.length = this.next;
        this.transactions.push(transaction);
        return this.redo(doc, affectedIds, dependentIds);
    };
    /** @param {Set=} affectedIds
    @param {Set=} dependentIds */
    TransactionList.prototype.redo = function (doc, affectedIds, dependentIds) {
        var action, _i, _len, _ref;
        if (affectedIds == null) {
            affectedIds = null;
        }
        if (dependentIds == null) {
            dependentIds = null;
        }
        if (this.next === this.transactions.length) {
            return false;
        }
        assert(doc.peekNextId() === this.transactions[this.next].base);
        _ref = this.transactions[this.next].actions;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            action = _ref[_i];
            if (affectedIds) {
                action.getAffectedIds(doc, affectedIds);
            }
            if (dependentIds) {
                action.getDependentIds(doc, dependentIds);
            }
            action.redo(doc);
        }
        this.next += 1;
        return true;
    };
    /** @param {Set=} affectedIds
    @param {Set=} dependentIds */
    TransactionList.prototype.undo = function (doc, affectedIds, dependentIds) {
        var actions, i, _ref;
        if (affectedIds == null) {
            affectedIds = null;
        }
        if (dependentIds == null) {
            dependentIds = null;
        }
        if (this.next === 0) {
            return false;
        }
        this.next -= 1;
        actions = this.transactions[this.next].actions;
        if (actions.length === 0) {
            return;
        }
        for (i = _ref = actions.length - 1; i >= 0; i += -1) {
            if (i < 0) {
                break;
            }
            actions[i].undo(doc);
            if (affectedIds) {
                actions[i].getAffectedIds(doc, affectedIds);
            }
            if (dependentIds) {
                actions[i].getDependentIds(doc, dependentIds);
            }
        }
        return doc.setNextId(this.transactions[this.next].base);
    }; ;
    /*
    http://www.JSON.org/json2.js
    2010-03-20
    
    Public Domain.
    
    NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.
    
    See http://www.JSON.org/js.html
    
    
    This code should be minified before deployment.
    See http://javascript.crockford.com/jsmin.html
    
    USE YOUR OWN COPY. IT IS EXTREMELY UNWISE TO LOAD CODE FROM SERVERS YOU DO
    NOT CONTROL.
    
    
    This file creates a global JSON object containing two methods: stringify
    and parse.
    
    JSON.stringify(value, replacer, space)
    value       any JavaScript value, usually an object or array.
    
    replacer    an optional parameter that determines how object
    values are stringified for objects. It can be a
    function or an array of strings.
    
    space       an optional parameter that specifies the indentation
    of nested structures. If it is omitted, the text will
    be packed without extra whitespace. If it is a number,
    it will specify the number of spaces to indent at each
    level. If it is a string (such as '\t' or '&nbsp;'),
    it contains the characters used to indent at each level.
    
    This method produces a JSON text from a JavaScript value.
    
    When an object value is found, if the object contains a toJSON
    method, its toJSON method will be called and the result will be
    stringified. A toJSON method does not serialize: it returns the
    value represented by the name/value pair that should be serialized,
    or undefined if nothing should be serialized. The toJSON method
    will be passed the key associated with the value, and this will be
    bound to the value
    
    For example, this would serialize Dates as ISO strings.
    
    Date.prototype.toJSON = function (key) {
    function f(n) {
    // Format integers to have at least two digits.
    return n < 10 ? '0' + n : n;
    }
    
    return this.getUTCFullYear()   + '-' +
    f(this.getUTCMonth() + 1) + '-' +
    f(this.getUTCDate())      + 'T' +
    f(this.getUTCHours())     + ':' +
    f(this.getUTCMinutes())   + ':' +
    f(this.getUTCSeconds())   + 'Z';
    };
    
    You can provide an optional replacer method. It will be passed the
    key and value of each member, with this bound to the containing
    object. The value that is returned from your method will be
    serialized. If your method returns undefined, then the member will
    be excluded from the serialization.
    
    If the replacer parameter is an array of strings, then it will be
    used to select the members to be serialized. It filters the results
    such that only members with keys listed in the replacer array are
    stringified.
    
    Values that do not have JSON representations, such as undefined or
    functions, will not be serialized. Such values in objects will be
    dropped; in arrays they will be replaced with null. You can use
    a replacer function to replace those with JSON values.
    JSON.stringify(undefined) returns undefined.
    
    The optional space parameter produces a stringification of the
    value that is filled with line breaks and indentation to make it
    easier to read.
    
    If the space parameter is a non-empty string, then that string will
    be used for indentation. If the space parameter is a number, then
    the indentation will be that many spaces.
    
    Example:
    
    text = JSON.stringify(['e', {pluribus: 'unum'}]);
    // text is '["e",{"pluribus":"unum"}]'
    
    
    text = JSON.stringify(['e', {pluribus: 'unum'}], null, '\t');
    // text is '[\n\t"e",\n\t{\n\t\t"pluribus": "unum"\n\t}\n]'
    
    text = JSON.stringify([new Date()], function (key, value) {
    return this[key] instanceof Date ?
    'Date(' + this[key] + ')' : value;
    });
    // text is '["Date(---current time---)"]'
    
    
    JSON.parse(text, reviver)
    This method parses a JSON text to produce an object or array.
    It can throw a SyntaxError exception.
    
    The optional reviver parameter is a function that can filter and
    transform the results. It receives each of the keys and values,
    and its return value is used instead of the original value.
    If it returns what it received, then the structure is not modified.
    If it returns undefined then the member is deleted.
    
    Example:
    
    // Parse the text. Values that look like ISO date strings will
    // be converted to Date objects.
    
    myData = JSON.parse(text, function (key, value) {
    var a;
    if (typeof value === 'string') {
    a =
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(value);
    if (a) {
    return new Date(Date.UTC(+a[1], +a[2] - 1, +a[3], +a[4],
    +a[5], +a[6]));
    }
    }
    return value;
    });
    
    myData = JSON.parse('["Date(09/09/2001)"]', function (key, value) {
    var d;
    if (typeof value === 'string' &&
    value.slice(0, 5) === 'Date(' &&
    value.slice(-1) === ')') {
    d = new Date(value.slice(5, -1));
    if (d) {
    return d;
    }
    }
    return value;
    });
    
    
    This is a reference implementation. You are free to copy, modify, or
    redistribute.
    */

    /*jslint evil: true, strict: false */

    /*members "", "\b", "\t", "\n", "\f", "\r", "\"", JSON, "\\", apply,
    call, charCodeAt, getUTCDate, getUTCFullYear, getUTCHours,
    getUTCMinutes, getUTCMonth, getUTCSeconds, hasOwnProperty, join,
    lastIndex, length, parse, prototype, push, replace, slice, stringify,
    test, toJSON, toString, valueOf
    */


    // Create a JSON object only if one does not already exist. We create the
    // methods in a closure to avoid creating global variables.

    if (!window.JSON) { /** @suppress */
        window.JSON = {}; /** @suppress */
    }

    (function () {

        function f(n) {
            // Format integers to have at least two digits.
            return n < 10 ? '0' + n : n;
        }

        if (typeof Date.prototype.toJSON !== 'function') {

            /** @return {string} */
            Date.prototype.toJSON = function (key) {

                return isFinite(this.valueOf()) ?
                       this.getUTCFullYear() + '-' +
                     f(this.getUTCMonth() + 1) + '-' +
                     f(this.getUTCDate()) + 'T' +
                     f(this.getUTCHours()) + ':' +
                     f(this.getUTCMinutes()) + ':' +
                     f(this.getUTCSeconds()) + 'Z' : "";
            };

            String.prototype.toJSON =
            Number.prototype.toJSON =
            Boolean.prototype.toJSON = function (key) {
                return "" + this.valueOf();
            };
        }

        var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
            escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
            gap,
            indent,
            meta = {    // table of character substitutions
                '\b': '\\b',
                '\t': '\\t',
                '\n': '\\n',
                '\f': '\\f',
                '\r': '\\r',
                '"': '\\"',
                '\\': '\\\\'
            },
            rep;


        function quote(string) {

            // If the string contains no control characters, no quote characters, and no
            // backslash characters, then we can safely slap some quotes around it.
            // Otherwise we must also replace the offending characters with safe escape
            // sequences.

            escapable.lastIndex = 0;
            return escapable.test(string) ?
                '"' + string.replace(escapable, function (a) {
                    var c = meta[a];
                    return typeof c === 'string' ? c :
                        '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                }) + '"' :
                '"' + string + '"';
        }


        function str(key, holder) {

            // Produce a string from holder[key].

            var i,          // The loop counter.
                k,          // The member key.
                v,          // The member value.
                length,
                mind = gap,
                partial,
                value = holder[key];

            // If the value has a toJSON method, call it to obtain a replacement value.

            if (value && typeof value === 'object' &&
                    typeof value.toJSON === 'function') {
                value = value.toJSON(key);
            }

            // If we were called with a replacer function, then call the replacer to
            // obtain a replacement value.

            if (typeof rep === 'function') {
                value = rep.call(holder, key, value);
            }

            // What happens next depends on the value's type.

            switch (typeof value) {
                case 'string':
                    return quote(value);

                case 'number':

                    // JSON numbers must be finite. Encode non-finite numbers as null.

                    return isFinite(value) ? String(value) : 'null';

                case 'boolean':
                case 'null':

                    // If the value is a boolean or null, convert it to a string. Note:
                    // typeof null does not produce 'null'. The case is included here in
                    // the remote chance that this gets fixed someday.

                    return String(value);

                    // If the type is 'object', we might be dealing with an object or an array or
                    // null.

                case 'object':

                    // Due to a specification blunder in ECMAScript, typeof null is 'object',
                    // so watch out for that case.

                    if (!value) {
                        return 'null';
                    }

                    // Make an array to hold the partial results of stringifying this object value.

                    gap += indent;
                    partial = [];

                    // Is the value an array?

                    if (Object.prototype.toString.apply(value) === '[object Array]') {

                        // The value is an array. Stringify every element. Use null as a placeholder
                        // for non-JSON values.

                        length = value.length;
                        for (i = 0; i < length; i += 1) {
                            partial[i] = str(i, value) || 'null';
                        }

                        // Join all of the elements together, separated with commas, and wrap them in
                        // brackets.

                        v = partial.length === 0 ? '[]' :
                            gap ? '[\n' + gap +
                                    partial.join(',\n' + gap) + '\n' +
                                        mind + ']' :
                                  '[' + partial.join(',') + ']';
                        gap = mind;
                        return v;
                    }

                    // If the replacer is an array, use it to select the members to be stringified.

                    if (rep && typeof rep === 'object') {
                        length = rep.length;
                        for (i = 0; i < length; i += 1) {
                            k = rep[i];
                            if (typeof k === 'string') {
                                v = str(k, value);
                                if (v) {
                                    partial.push(quote(k) + (gap ? ': ' : ':') + v);
                                }
                            }
                        }
                    } else {

                        // Otherwise, iterate through all of the keys in the object.

                        for (k in value) {
                            if (Object.hasOwnProperty.call(value, k)) {
                                v = str(k, value);
                                if (v) {
                                    partial.push(quote(k) + (gap ? ': ' : ':') + v);
                                }
                            }
                        }
                    }

                    // Join all of the member texts together, separated with commas,
                    // and wrap them in braces.

                    v = partial.length === 0 ? '{}' :
                        gap ? '{\n' + gap + partial.join(',\n' + gap) + '\n' +
                                mind + '}' : '{' + partial.join(',') + '}';
                    gap = mind;
                    return v;
            }
        }

        // If the JSON object does not yet have a stringify method, give it one.

        if (typeof window.JSON.stringify !== 'function') {
            /**
            @param {*} value
            @param {*=} replacer
            @param {string=} space
            */
            window.JSON.stringify = function (value, replacer, space) {

                // The stringify method takes a value and an optional replacer, and an optional
                // space parameter, and returns a JSON text. The replacer can be a function
                // that can replace values, or an array of strings that will select the keys.
                // A default replacer method can be provided. Use of the space parameter can
                // produce text that is more easily readable.

                var i;
                gap = '';
                indent = '';

                // If the space parameter is a number, make an indent string containing that
                // many spaces.

                if (typeof space === 'number') {
                    for (i = 0; i < space; i += 1) {
                        indent += ' ';
                    }

                    // If the space parameter is a string, it will be used as the indent string.

                } else if (typeof space === 'string') {
                    indent = space;
                }

                // If there is a replacer, it must be a function or an array.
                // Otherwise, throw an error.

                rep = replacer;
                if (replacer && typeof replacer !== 'function' &&
                        (typeof replacer !== 'object' ||
                         typeof replacer.length !== 'number')) {
                    throw new Error('JSON.stringify');
                }

                // Make a fake root object containing our value under the key of ''.
                // Return the result of stringifying the value.

                return str('', { '': value });
            };
        }


        // If the JSON object does not yet have a parse method, give it one.

        if (typeof window.JSON.parse !== 'function') {
            /** @param {string} text
            @param {*=} reviver
            */
            window.JSON.parse = function (text, reviver) {

                // The parse method takes a text and an optional reviver function, and returns
                // a JavaScript value if the text is a valid JSON text.

                var j;

                function walk(holder, key) {

                    // The walk method is used to recursively walk the resulting structure so
                    // that modifications can be made.

                    var k, v, value = holder[key];
                    if (value && typeof value === 'object') {
                        for (k in value) {
                            if (Object.hasOwnProperty.call(value, k)) {
                                v = walk(value, k);
                                if (v !== undefined) {
                                    value[k] = v;
                                } else {
                                    delete value[k];
                                }
                            }
                        }
                    }
                    return reviver.call(holder, key, value);
                }


                // Parsing happens in four stages. In the first stage, we replace certain
                // Unicode characters with escape sequences. JavaScript handles many characters
                // incorrectly, either silently deleting them, or treating them as line endings.

                text = String(text);
                cx.lastIndex = 0;
                if (cx.test(text)) {
                    text = text.replace(cx, function (a) {
                        return '\\u' +
                            ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                    });
                }

                // In the second stage, we run the text against regular expressions that look
                // for non-JSON patterns. We are especially concerned with '()' and 'new'
                // because they can cause invocation, and '=' because it can cause mutation.
                // But just to be safe, we want to reject all unexpected forms.

                // We split the second stage into 4 regexp operations in order to work around
                // crippling inefficiencies in IE's and Safari's regexp engines. First we
                // replace the JSON backslash pairs with '@' (a non-JSON character). Second, we
                // replace all simple value tokens with ']' characters. Third, we delete all
                // open brackets that follow a colon or comma or that begin the text. Finally,
                // we look to see that the remaining characters are only whitespace or ']' or
                // ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.

                if (/^[\],:{}\s]*$/.
    test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@').
    replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').
    replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {

                    // In the third stage we use the eval function to compile the text into a
                    // JavaScript structure. The '{' operator is subject to a syntactic ambiguity
                    // in JavaScript: it can begin a block or an object literal. We wrap the text
                    // in parens to eliminate the ambiguity.

                    j = eval('(' + text + ')');

                    // In the optional fourth stage, we recursively walk the new structure, passing
                    // each name/value pair to a reviver function for possible transformation.

                    return typeof reviver === 'function' ?
                        walk({ '': j }, '') : j;
                }

                // If the text is not JSON parseable, then a SyntaxError is thrown.

                throw new SyntaxError('JSON.parse');
            };
        }
    } ());
    /*
    Zwibbler
    
    Copyright 2013 Hanov Solutions Inc. All Rights Reserved. This software is
    NOT open source. For licensing information, contact the author.
    
    steve.hanov@gmail.com
    */
    /*
    //#include <EventEmitter.js>
    //#include <json2.js>
    //#include <log.js>
    */
    /*
    This interacts with the outside world when zwibbler is used inside of an
    IFRAME. We use cross site messages as described at 
    http://stevehanov.ca/blog/index.php?id=109
    */
    /**
    * @constructor
    * @extends {EventEmitter}
    */
    var Api = function () {
        EventEmitter.apply(this, arguments);
        window.addEventListener("message", __bind(function (e) {
            return this.receive(e);
        }, this), false);
        window.parent.postMessage("{\"event\": \"ready\"}", "*");
    };
    __extends(Api, EventEmitter);

    Api.prototype.log = log.create("Api");
    Api.prototype.receive = function (e) {
        var fn, json, replyFn, _i, _len, _ref, _results;
        try {
            json = window["JSON"].parse(e.data);
        } catch (except) {
            this.log("Error parsing %s from %s", e.data, e.origin);
            return;
        }
        this.log("Received %s", e.data);
        replyFn = function (args_array) {
            var rep;
            if ("ticket" in json) {
                rep = {
                    "ticket": json["ticket"],
                    "args": args_array
                };
                return window.parent.postMessage(window["JSON"].stringify(rep), "*");
            }
        };
        if (json["function"] in this.events) {
            /* shouldn't really be a loop. it would be bad to reply more than */
            /* once. */
            _ref = this.events[json["function"]];
            _results = [];
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                fn = _ref[_i];
                _results.push(fn(json["args"], replyFn));
            }
            return _results;
        }
    }; ;
    /*
    Zwibbler
    
    Copyright 2013 Hanov Solutions Inc. All Rights Reserved. This software is
    NOT open source. For licensing information, contact the author.
    
    steve.hanov@gmail.com
    //#include <TransactionList.js>
    //#include <GroupNode.js>
    //#include <json2.js>
    //#include <Actions.js>
    //#include <EventEmitter.js>
    //#include <log.js>
    //#include <Set.js>
    //#include <Assert.js>
    //#include <PathNode.js>
    */
    /**
    * @constructor
    * @extends {EventEmitter}
    */
    var ZwibblerDocument = function () {
        EventEmitter.apply(this, arguments);
        this.transactions = new TransactionList();
        this.nodes = {};
        this.redraw = new Set();
        this.forceRedraw = true;
        this.forceRenumber = true;
        this.nextId = 0;
        this.newNodes = [];
        this.root = new GroupNode(this.getNextId());
        this.markClean();
        this._insert(this.root);

        this.domRoot = new GroupNode(this.getNextId());
        this.addChild(this.root, this.domRoot);
        this.domRoot.parent = null; // we want the domRoot subtree to view the domRoot as its root
    };
    __extends(ZwibblerDocument, EventEmitter);

    ZwibblerDocument.prototype.log = log.create("DOC");
    ZwibblerDocument.prototype.markClean = function () {
        this.savedTo = this.transactions.getIndex();
    };
    ZwibblerDocument.prototype.dirty = function () {
        return this.savedTo !== this.transactions.getIndex();
    };
    ZwibblerDocument.prototype.rebuild = function () {
        while (this.transactions.undo(this)) { }
        if (this.root.children.length) {
            throw "Error: There should be 0 children length.";
        }
        if (this.nextId !== 1) {
            throw "Error: nextId should be 1";
        }
        while (this.transactions.redo(this)) { }
    };
    /** @return {number} */
    ZwibblerDocument.prototype.getNextId = function () {
        return this.nextId++;
    };
    /** @param {number} id */
    ZwibblerDocument.prototype.setNextId = function (id) {
        assertNumber(id);
        this.nextId = id;
        this.log("nextId now %s", id);
    };
    /** @return {number} */
    ZwibblerDocument.prototype.peekNextId = function () {
        return this.nextId;
    };
    /** @param {number} id
    @return {boolean}
    */
    ZwibblerDocument.prototype.exists = function (id) {
        return id in this.nodes;
    };
    /** @param {BaseNode} node
    @param {boolean=} redraw
    */
    ZwibblerDocument.prototype._insert = function (node, redraw) {
        var child, _i, _len, _ref;
        if (redraw === undefined) {
            redraw = true;
        }
        assert("id" in node, "Must be a node");
        if (!(node.id in this.nodes)) {
            this.nodes[node.id] = node;
            this.newNodes.push(node);
            node.onAdded();
            if (node.isGroup()) {
                _ref = node.children;
                for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                    child = _ref[_i];
                    this._insert(child, redraw);
                }
            }
        }
        if (redraw) {
            this.redraw.add(node.id);
        }
    };
    /** @param {number} id */
    ZwibblerDocument.prototype.markRedraw = function (id) {
        assertNumber(id);
        return this.redraw.add(id);
    };
    /** @param {BaseNode} node */
    ZwibblerDocument.prototype.addNode = function (node) {
        return this.addChild(this.domRoot, node, -1);
    };
    /** @param {number} id
    @param {boolean=} redraw 
    @return {BaseNode}
    */
    ZwibblerDocument.prototype.getNode = function (id, redraw) {
        var node;
        if (redraw === undefined) {
            redraw = false;
        }
        assertNumber(id);
        if (id in this.nodes) {
            node = this.nodes[id];
            this.redraw.add(id);
            return node;
        } else {
            return null;
        }
    };
    /** @param{Array.<Action>} actions
    @param {(number|null)=} base
    */
    ZwibblerDocument.prototype.commit = function (actions, base) {
        this.newNodes.length = 0;
        this.transactions.commit(this, actions, base);
        return this.newNodes;
    };
    ZwibblerDocument.prototype.undo = function () {
        return this.transactions.undo(this);
    };
    ZwibblerDocument.prototype.redo = function () {
        return this.transactions.redo(this);
    };
    /** @param {CanvasRenderingContext2D} ctx
    @param {FormatRequest} request
    */
    ZwibblerDocument.prototype.format = function (ctx, request) {
        var ids = this.forceRedraw ? this.nodes : this.redraw.toMap();
        var nodes = [];
        for (var id in ids) {
            if (ids.hasOwnProperty(id)) {
                nodes.push(this.nodes[id]);
            }
        }

        nodes = this.collapseGroups(nodes);
        for (var i = 0; i < nodes.length; i++) {
            var node = nodes[i];
            node.format(ctx, request);
        }
        this.redraw.clear();
        this.forceRedraw = false;
        return nodes.length;
    };
    /** @param {CanvasRenderingContext2D} ctx
    */
    ZwibblerDocument.prototype.draw = function (ctx) {
        this.each(false, function (node) {
            if (node.hidden()) {
                // skip
            } else {
                node.draw(ctx);
            }
        });
    };
    /** @param {number} x
    @param {number} y
    @return {BaseNode}
    */
    ZwibblerDocument.prototype.hittest = function (x, y) {
        return this.root.hittest(x, y);
    };
    /** @param {Rectangle} rect
    @return {Array.<BaseNode>}
    */
    ZwibblerDocument.prototype.getNodesInRectangle = function (rect) {
        return this.filter(function (node) {
            return rect.contains(node.getRect());
        });
    };
    /** Return a node list that consists of the unput set of nodes, except
    that if any nodes are members of the group, it is removed from the
    selection and its parent is instead added.
    @param {Array.<BaseNode>} nodes
    @return {Array.<BaseNode>}
    */
    ZwibblerDocument.prototype.collapseGroups = function (nodes) {
        var added, node, result, _i, _len;
        result = [];
        added = {};
        for (_i = 0, _len = nodes.length; _i < _len; _i++) {
            node = nodes[_i];
            while (node.isGroupMember()) {
                node = node.parent;
            }
            if (!(node.id in added)) {
                added[node.id] = true;
                result.push(node);
            }
        }
        this.sortNodes(result);
        return result;
    };
    /** @param {Array.<number>} ids }
    @param {Set=} result
    @return {Set}
    */
    ZwibblerDocument.prototype.closure = function (ids, result) {
        var id, process, _i, _len;
        result = result || new Set();
        process = function (node) {
            var child, _i, _len, _ref, _results;
            result.add(node.id);
            if (node.isGroup()) {
                _ref = node.children;
                _results = [];
                for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                    child = _ref[_i];
                    _results.push(process(child));
                }
                return _results;
            }
        };
        for (_i = 0, _len = ids.length; _i < _len; _i++) {
            id = ids[_i];
            process(this.nodes[id]);
        }
        return result;
    };
    /** @param {boolean} wantGroups
    */
    ZwibblerDocument.prototype.each = function (wantGroups, fn) {
        var process;
        process = function (node) {
            var child, _i, _len, _ref;
            if (node.isGroup()) {
                if (wantGroups) {
                    fn(node);
                }
                _ref = node.children;
                for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                    child = _ref[_i];
                    process(child);
                }
            } else {
                fn(node);
            }
        };
        process(this.root);
    };
    ZwibblerDocument.prototype.filter = function (fn) {
        var results;
        results = [];
        this.each(false, function (node) {
            if (fn(node)) {
                return results.push(node);
            }
        });
        return results;
    };
    /** @param {Array.<BaseNode>} nodes
    @return {Array.<BaseNode>}
    */
    ZwibblerDocument.prototype.sortNodes = function (nodes) {
        var count;
        count = 0;
        if (this.forceRenumber) {
            this.forceRenumber = false;
            this.each(true, function (node) {
                node.order = count++;
            });
        }
        nodes.sort(function (a, b) {
            return a.order - b.order;
        });
        return nodes;
    };
    /** @param {Array.<number>} ids
    @return {GroupNode}
    */
    ZwibblerDocument.prototype.createGroup = function (ids) {
        var group, id, _i, _len;
        group = new GroupNode(this.getNextId());
        this.addNode(group);
        for (_i = 0, _len = ids.length; _i < _len; _i++) {
            id = ids[_i];
            this.addChild(group, this.nodes[id], -1);
        }
        return group;
    };
    /** @return {number} */
    ZwibblerDocument.prototype.getTransactionCount = function () {
        return this.transactions.transactions.length;
    };
    /** @param {Array.<BaseNode>} nodes
    @return {string}
    */
    ZwibblerDocument.prototype.saveTransactions = function (nodes) {
        var actions, id, node, _i, _len, _ref;
        actions = [];
        id = 0;
        _ref = this.collapseGroups(nodes);
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            node = _ref[_i];
            id = this._save(node, actions, id);
        }
        return JSON.stringify(actions);
    };
    /** @param {BaseNode} node
    @param {Array.<Action>} actions
    @param {number} nextid
    @return {number}
    */
    ZwibblerDocument.prototype._save = function (node, actions, nextid) {
        var child, members, name, properties, value, x, _i, _len, _ref;
        if (node.isGroup()) {
            members = [];
            _ref = node.children;
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                child = _ref[_i];
                nextid = this._save(child, actions, nextid);
                members.push(nextid - 1);
            }
            actions.push({
                "type": "GroupAction",
                "members": members
            });
        } else {
            properties = node.getProperties();
            x = {};
            for (name in properties) {
                if (properties.hasOwnProperty(name)) {
                    value = properties[name];
                    if (value instanceof Matrix) {
                        value = ["Matrix", value.m11, value.m12, value.m21, value.m22, value.dx, value.dy];
                    }
                    x[name] = value;
                }
            }
            actions.push({
                "type": "CreateAction",
                "node": node.type(),
                "properties": x
            });
        }
        return nextid + 1;
    };
    /**
    @param {string} input
    @return {Array.<Action>}
    */
    ZwibblerDocument.prototype.loads = function (input, offset) {
        var action, actions, base, item, items, name, properties, renamer, value, x, _i, _j, _len, _len2;
        items = JSON.parse(input);
        actions = [];
        for (_i = 0, _len = items.length; _i < _len; _i++) {
            item = items[_i];
            if (item["type"] === "GroupAction") {
                actions.push(new GroupAction(item["members"]));
            } else if (item["type"] === "CreateAction") {
                x = item["properties"];
                properties = {};
                for (name in x) {
                    if (x.hasOwnProperty(name)) {
                        value = x[name];
                        if (Object.prototype.toString.apply(value) === '[object Array]' && value[0] === "Matrix") {
                            value.splice(0, 1);

                            if (name === "inverse") {
                                value[4] -= offset;
                                value[5] -= offset;
                            } else {
                                value[4] += offset;
                                value[5] += offset;
                            }

                            value = new Matrix(value);
                        }
                        properties[name] = value;
                    }
                }
                actions.push(new CreateAction(item["node"], properties));
            }
        }
        base = this.nextId;
        renamer = __bind(function (oldName) {
            this.log("Remap %s -> %s", oldName, oldName + base);
            return oldName + base;
        }, this);
        for (_j = 0, _len2 = actions.length; _j < _len2; _j++) {
            action = actions[_j];
            action.rename(renamer);
        }
        return actions;
    };
    /**
    Add the child at the specified position
    
    @param {GroupNode} parent
    @param {BaseNode} child
    @param {number} index
    */
    ZwibblerDocument.prototype.addChild = function (parent, child, index) {
        if (child.parent) {
            this.removeNode(child, false);
        }
        if (index === -1) {
            parent.children.push(child);
        } else {
            parent.children.splice(index, 0, child);
        }
        this._insert(child);
        this.forceRenumber = true;
        child.parent = parent;
    };
    /**
    Remove the child from the node, returning its old index.
    @param {BaseNode} child
    @param {boolean=} detach
    @return {number}
    */
    ZwibblerDocument.prototype.removeNode = function (child, detach) {
        var index, process;
        if (detach === undefined) {
            detach = true;
        }
        index = child.parent.findChildIndex(child);
        if (index >= 0) {
            child.parent.children.splice(index, 1);
            child.parent = null;
            if (detach) {
                process = __bind(function (node) {
                    var n, _i, _len, _ref;
                    delete this.nodes[node.id];
                    child.onRemoved();
                    this.redraw.remove(node.id);
                    if (node.isGroup()) {
                        _ref = node.children;
                        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                            n = _ref[_i];
                            process(n);
                        }
                    }
                }, this);
                process(child);
            }
        }
        return index;
    };

    ZwibblerDocument.prototype.findBackground = function () {
        var firstNode = this.root.children[0];
        if (firstNode && firstNode.locked && firstNode.type() == "ImageNode") {
            return firstNode;
        }
    };

    ZwibblerDocument.prototype.setBackground = function (background) {
        var oldBackground = this.findBackground();
        if (oldBackground) {
            this.removeNode(oldBackground);
        }

        if (typeof background === 'number') {
            background = this.getNode(background);
            this.removeNode(background);
        }

        this.addChild(this.root, background, 0);
    };

    ZwibblerDocument.prototype.docString = function () {
        var parts, process;
        parts = [];
        process = function (node, level) {
            var child, i, _i, _len, _ref, _ref2;
            for (i = 0, _ref = level - 1; i <= _ref; i += 1) {
                parts.push("  ");
            }
            parts.push(node.type());
            parts.push(":" + node.id + "\n");
            if (node.isGroup()) {
                _ref2 = node.children;
                for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
                    child = _ref2[_i];
                    process(child, level + 1);
                }
            }
        };
        process(this.root, 0);
        return parts.join("");
    };
    /** @return {Rectangle} */
    ZwibblerDocument.prototype.getRect = function () {
        var bottom, left, right, top;
        left = null;
        right = null;
        top = null;
        bottom = null;
        this.each(false, function (node) {
            if (left === null || node.rect.x < left) {
                left = node.rect.x;
            }
            if (right === null || node.rect.right() > right) {
                right = node.rect.right();
            }
            if (top === null || node.rect.y < top) {
                top = node.rect.y;
            }
            if (bottom === null || node.rect.bottom() > bottom) {
                bottom = node.rect.bottom();
            }
        });
        if (left === null) {
            return new Rectangle(0, 0, 10, 10);
        } else {
            return new Rectangle(left, top, right - left, bottom - top);
        }
    };
    /*
    Zwibbler
    
    Copyright 2013 Hanov Solutions Inc. All Rights Reserved. This software is
    NOT open source. For licensing information, contact the author.
    
    steve.hanov@gmail.com
    */
    //#include <PathNode.js>
    //#include <Actions.js>
    //#include <Graphics.js>
    //#include <json2.js>
    //#include <ZwibblerDocument.js>
    /*jslint evil: true */

    /**
    Functions for importing and exporting the zwibbler document to older
    formats.
    */

    ZwibblerDocument.log = log.create("DOC");

    /** @export ZwibblerContext.prototype.getResponseXml */
    ZwibblerDocument.prototype.getResponseXml = function () {
        try {
            var list = ZwibblerDocument.exportAsList(this.root);
            var j = 0;
            var resArr = [];

            for (var i = 0; i < list.length; i++) {
                var lItem = list[i];
                var res = '<node>';
                
                if (lItem.type === "ImageNode")
                    continue;

                for (var p in lItem) {
                    //if matrix
                    if (p === 'matrix' || p === 'commands' || p === 'points') {
                        var matrixData = lItem[p];
                        for (j = 0; j < matrixData.length; j++) { //save values as array
                            res += '<' + p + '>' + matrixData[j] + '</' + p + '>';
                        }
                    } else if (p === 'url') { //specific to imagenode
                        res += '<' + p + '>' + 'nobgimg' + '</' + p + '>'; // handle for empty url; 
                    } else if (p === 'data') { //specific to domnode
                        res += '<data>';
                        for (var eqd in lItem[p]) {
                            if (eqd == 'tabConfig') {
                                res += '<tabConfig>';
                                var tcOrder = (lItem[p])[eqd];
                                for (j = 0; j < tcOrder.Order.length; j++) {
                                    res += '<Order>' + tcOrder.Order[j] + '</Order>';
                                }
                                res += '</tabConfig>';
                            }
                            //else if (eqd == 'mathML') {
                            //    res += '<' + eqd + '><![CDATA[' + (lItem[p])[eqd] + ']]></' + eqd + '>';                                
                            //}
                            else if (eqd.toLowerCase() == 'editorlabels') {
                                //skip labels
                            }
                            else
                                res += '<' + eqd + '>' + (lItem[p])[eqd] + '</' + eqd + '>';
                        }
                        res += '</data>';
                    } else {
                        res += '<' + p + '>' + lItem[p] + '</' + p + '>';
                    }
                }

                res += '</node>';
                resArr.push(res);
            }

            return "<response>" + resArr.join(' ') + "</response>";
        } catch (e) {
            return "Unsupported format: xml";
        }
    };

    /** @export ZwibblerContext.prototype.getResponseXml */
    ZwibblerDocument.prototype.processResponseXml = function (contents) {
        try {

            // HACK: add cdata wrapper to the contents of mathml
            contents = contents.replace(/<mathML>/g, '<mathML><![CDATA[');
            contents = contents.replace(/<\/mathML>/g, ']]></mathML>');
            
            var list = JSON.parse(xml2jsonv2(parseXml(contents), ''));
            for (var i in list.response.node) {
                for (var p in list.response.node[i]) {
                    if (p === 'id' || p == 'lineWidth' || p == 'parent' || p == 'arrowSize')
                        (list.response.node[i])[p] = parseInt((list.response.node[i])[p]);
                    else if (p === 'fontSize' || p == 'smoothness' || p == 'sloppiness' )
                        (list.response.node[i])[p] = parseFloat((list.response.node[i])[p]);
                    else if (p === 'matrix' || p === 'commands' || p === 'points') {
                        for (var j = 0; j < (list.response.node[i])[p].length; j++) {
                            ((list.response.node[i])[p])[j] = parseFloat(((list.response.node[i])[p])[j]);
                        }
                    } else if (typeof (list.response.node[i])[p] == 'string' && ((list.response.node[i])[p] == 'true' || (list.response.node[i])[p] == 'false')) {
                        (list.response.node[i])[p] = ((list.response.node[i])[p] == 'true');
                    } else if (p == 'text')
                    (list.response.node[i])[p] = (list.response.node[i])[p] != null ? (list.response.node[i])[p] : "";
                }
            }
            
            //corrections for data property in mathnode elements
            for (i in list.response.node) {
                var n = list.response.node[i];
                if (typeof n.data !== 'undefined') {                    
                    n.data.mathML = [n.data.mathML["#cdata"]];
                }                
            }
            
            return list.response.node;
        } catch (e) {
            throw "XML Format detection failed.";
        }
    };


    /** @param {string} format */
    ZwibblerDocument.prototype.save = function (format) {
        if (format === "list") {
            return ZwibblerDocument.exportAsList(this.root);
        } else if (format === "zwibbler3") {
            var list = ZwibblerDocument.exportAsList(this.root);
            return "zwibbler3." + window.JSON.stringify(list);
        } else {
            throw "Unknown save format: " + format;
        }
    };

    ZwibblerDocument.load = function (contents) {
        if (contents.indexOf("zwibbler3.") === 0) {
            var list = window.JSON.parse(contents.substr(10));
            return ZwibblerDocument.importFromList(list);
        } else {
            throw "Format detection failed.";
        }

    };

    ZwibblerDocument.exportAsList = function (root) {
        var list = [];

        function handle(parent, node) {
            var saved = {
                "id": node.id,
                "type": node.type()
            };

            list.push(saved);

            if (parent) {
                saved["parent"] = parent.id;
            }

            var properties = node.getProperties();
            for (var name in properties) {
                if (properties.hasOwnProperty(name)) {
                    if (name === "matrix") {
                        saved[name] = properties[name].toArray();
                    } else if (name === "inverse") {
                        // skip
                    } else {
                        saved[name] = properties[name];
                    }
                }
            }

            if (node.isGroup()) {
                for (var i = 0; i < node.children.length; i++) {
                    handle(node, node.children[i]);
                }
            }
        }

        handle(null, root);

        return list;
    };

    ZwibblerDocument.importFromList = function (list, zwibblerDocument) {

        var i;
        var parent, child;

        // create a deep copy so we don't modify the original list.
        list = window.JSON.parse(window.JSON.stringify(list));

        var actions = [];

        // create a mapping of ids in the list to ids in the document we are
        // building.
        var mapping = {};
        var nextId = 1;

        // create a tree, indexed by item id
        var tree = {};

        // for each list item,
        for (i = 0; i < list.length; i++) {
            // add to the tree parent if it has one.
            child = list[i];
            if ("parent" in child) {
                if (!(child["parent"] in tree)) {
                    throw "Error: child " + child["id"] +
                        " references parent " + child["parent"] +
                        " before it was defined.";
                }
                parent = tree[child["parent"]];
                if (parent.children !== undefined) {
                    parent.children.push(child);
                } else {
                    parent.children = [child];
                }
            }

            // make extra sure that GroupNodes have children
            if (child["type"] === "GroupNode" && child.children === undefined) {
                child.children = [];
            }

            tree[child["id"]] = child;
        }

        // process the tree records
        function handle(item) {
            var j;

            if (item === undefined)
                return;
            // if the record is a group,
            if (item.children !== undefined) {
                // process the children
                for (j = 0; j < item.children.length; j++) {
                    handle(item.children[j]);
                }

                // if the id is not 0, then add a GroupAction grouping the children
                // together
                if (item["id"] !== 0) {
                    var members = [];
                    for (j = 0; j < item.children.length; j++) {
                        members.push(mapping[item.children[j]["id"]]);
                    }

                    actions.push(new GroupAction(members));
                }
            } else {
                // map the id in our table
                // process the properties, handling the "matrix" and "inverse" one
                // specially.

                var properties = {};
                for (var key in item) {
                    if (item.hasOwnProperty(key)) {
                        if (key === "children" || key === "parent" ||
                                key === "id" || key === "type") {
                            // skip this file format metadata.
                        } else if (key === "matrix") {
                            properties[key] = new Matrix(item[key]);
                            properties["inverse"] = properties["matrix"].inverse();
                        } else {
                            properties[key] = item[key];
                        }
                    }
                }
                // create the node with the given properties.
                actions.push(new CreateAction(item["type"], properties));
            }

            if (item["id"] !== 0) {
                mapping[nextId] = item["id"];
                nextId += 1;
            }
        }

        // process record with id=0    
        handle(tree[0]);

        ZwibblerDocument.log(JSON.stringify(mapping));
        for (i = 0; i < actions.length; i++) {
            ZwibblerDocument.log(actions[i].toString());
            zwibblerDocument.commit([actions[i]]);
        }

        return zwibblerDocument;
    };

    /**
    The Colour object allows conversion of colours between strings and several
    other colour spaces.
    
    The colour has two public members. It's type is the type of colour space. Its
    values are an array of numbers specifying the colour coordinates. These
    coordinates depend on the type of colour space used.
    
    @constructor
    @param {number} type
    @param {Array.<number>} values
    */
    function Colour(type, values) {
        this.type = type;
        this.values = values;

        if (this.values.length < 4) {
            throw "Bad value";
        }
    }

    // Here is an enumeration of colour spaces.

    // RGBA. All components are in the range 0..1
    Colour.RGBA = 0;

    // CIE XYZ, with added alpha value.
    Colour.XYZA = 1;

    // Hue/Saturation/Value. Hue is in the range 0...360 and the others are 0...1
    Colour.HSVA = 2;

    // CIE LAB 1976 colour space, with added alpha component.
    Colour.LABA = 3;

    Colour.LAST_COLOURSPACE = 3;

    /**
    Creates an RGBA colour object from the given string. If the string is not
    valid, a default colour of magenta is used. Valid strings are one of the
    following:
    
    1. A standard CSS colour name (eg. "Blue"). The case does not matter.
    
    2. A CSS hex string with 6 digits. Eg. #80ff00
    
    3. An rgba value. Eg. rgba( 128, 255, 0, 1.0 ). Note the last component must
    be in the range 0..1 and the others are in the range 0..255.
    
    @param {string} colourString
    @return {Colour}
    */
    Colour.fromString = function (colourString) {
        if (colourString.toLowerCase() in Colour.CssColours) {
            colourString = Colour.CssColours[colourString.toLowerCase()];
        }

        var hex6 = /\#([0-9a-f][0-9a-f])([0-9a-f][0-9a-f])([0-9a-f][0-9a-f])/i;
        var rgbStr = /rgba\( *([0-9]+) *, *([0-9]+) *, *([0-9]+) *, *([0-9\.]+) *\)/;
        var r, g, b, a;

        var m = hex6.exec(colourString);
        if (m !== null) {
            r = parseInt(m[1], 16) / 255;
            g = parseInt(m[2], 16) / 255;
            b = parseInt(m[3], 16) / 255;
            a = 1.0;
        } else {
            m = rgbStr.exec(colourString);
            if (m !== null) {
                r = parseFloat(m[1]) / 255;
                g = parseFloat(m[2]) / 255;
                b = parseFloat(m[3]) / 255;
                a = parseFloat(m[4]);
            } else {
                // default colour
                r = 1.0;
                g = 0.0;
                b = 1.0;
                a = 1.0;
            }
        }

        return new Colour(Colour.RGBA, [r, g, b, a]);
    };

    Colour.prototype = {

        /**
        Converts the colour to a string. The string is formatted such that it can
        be used to set the fillStyle or strokeStyle of an HTML5 Canvas 2d context.
    
        @return {string}
        */
        toString: function () {
            function toHex(val) {
                val = Math.round(val * 255);
                if (val < 16) {
                    return "0" + val.toString(16);
                } else {
                    return val.toString(16);
                }
            }

            var clr = this.convertTo(Colour.RGBA);

            if (clr.values[3] === 1.0) {
                return "#" +
                    toHex(clr.values[0]) +
                    toHex(clr.values[1]) +
                    toHex(clr.values[2]);
            } else {
                return "rgba(" +
                    Math.round(clr.values[0] * 255) + "," +
                    Math.round(clr.values[1] * 255) + "," +
                    Math.round(clr.values[2] * 255) + "," +
                    clr.values[3] + ")";
            }
        },

        /**
        Returns a new colour object, converting to the given colour space.
    
        @param {number} type
        @return {Colour}
        */
        convertTo: function (type) {
            return Colour.converters[this.type][type](this);
        },

        /**
        Returns the distance between this colour and another, using the colour
        space of this colour. If the other colour is another colour space, it is
        converted before the calculation is done.
        */
        distanceTo: function (colour) {
            if (colour.type !== this.type) {
                colour = colour.convertTo(this.type);
            }

            if (this.type === Colour.HSVA) {
                // Hue goes from 0 to 360, unlike other colour schemes, so it needs
                // to be scaled relative to the other values. It must also wrap
                // around.

                var a = this.values[0], b = colour.values[0];
                var hueDiff;
                if (a > b) {
                    hueDiff = Math.min(a - b, b - a + 360);
                } else {
                    hueDiff = Math.min(b - a, a - b + 360);
                }

                hueDiff /= 360;

                return Math.pow(
                       hueDiff * hueDiff +
                       (this.values[1] - colour.values[1]) *
                       (this.values[1] - colour.values[1]) +
                       (this.values[2] - colour.values[2]) *
                       (this.values[2] - colour.values[2]), 0.5);

            } else {
                return Math.pow(
                       (this.values[0] - colour.values[0]) *
                       (this.values[0] - colour.values[0]) +
                       (this.values[1] - colour.values[1]) *
                       (this.values[1] - colour.values[1]) +
                       (this.values[2] - colour.values[2]) *
                       (this.values[2] - colour.values[2]), 0.5);
            }
        }

    };

    (function () {

        var WHITE = { X: 0.9505, Y: 1.0000, Z: 1.0890 }; // D65

        /**
        @param {Colour} clr
        @return {Colour}
        */
        function convert_HSVA_RGBA(clr) {
            var h = clr.values[0];
            var s = clr.values[1];
            var v = clr.values[2];
            if (h < 0) { h += 360; }
            var hi = Math.floor(h / 60) % 6;
            var f = h / 60 - Math.floor(h / 60);
            var p = v * (1 - s);
            var q = v * (1 - f * s);
            var t = v * (1 - (1 - f) * s);
            var r, g, b;
            switch (hi) {
                case 0:
                    r = v;
                    g = t;
                    b = p;
                    break;
                case 1:
                    r = q;
                    g = v;
                    b = p;
                    break;
                case 2:
                    r = p;
                    g = v;
                    b = t;
                    break;
                case 3:
                    r = p;
                    g = q;
                    b = v;
                    break;
                case 4:
                    r = t;
                    g = p;
                    b = v;
                    break;
                case 5:
                    r = v;
                    g = p;
                    b = q;
                    break;
            }

            return new Colour(Colour.RGBA, [r, g, b, clr.values[3]]);
        }

        /**
        @param {Colour} clr
        @return {Colour}
        */
        function convert_RGBA_HSVA(clr) {
            var h, s, v;
            var r = clr.values[0];
            var g = clr.values[1];
            var b = clr.values[2];
            var max = Math.max(r, g, b);
            var min = Math.min(r, g, b);
            if (max === min) {
                h = 0;
            } else if (max === r) {
                h = (60 * (g - b) / (max - min) + 360) % 360;
            } else if (max === g) {
                h = 60 * (b - r) / (max - min) + 120;
            } else if (max === b) {
                h = 60 * (r - g) / (max - min) + 240;
            }

            if (max === 0) {
                s = 0;
            } else {
                s = 1 - min / max;
            }

            v = max;

            return new Colour(Colour.HSVA, [h, s, v, clr.values[3]]);
        }

        /**
        @param {Colour} clr
        @return {Colour}
        */
        function convert_XYZA_LABA(clr) {
            function f(t) {
                if (t > (6.0 / 29.0) * (6.0 / 29.0) * (6.0 / 29.0)) {
                    return Math.pow(t, 1.0 / 3.0);
                } else {
                    return (1.0 / 3.0) *
                        (29.0 / 6.0) * (29.0 / 6.0) * t +
                        4.0 / 29.0;
                }
            }

            var X = f(clr.values[0] / WHITE.X);
            var Y = f(clr.values[1] / WHITE.Y);
            var Z = f(clr.values[2] / WHITE.Z);

            return new Colour(Colour.LABA,
                [116 * Y - 16,
                 500 * (X - Y),
                 200 * (Y - Z),
                 clr.values[3]]);
        }

        /**
        @param {Colour} clr
        @return {Colour}
        */
        function convert_LABA_XYZA(clr) {
            var fy = (clr.values[0] + 16) / 116;
            var fx = fy + clr.values[1] / 500;
            var fz = fy - clr.values[2] / 200;

            var squiggle = 6.0 / 29;
            var X, Y, Z;

            if (fy > squiggle) {
                Y = WHITE.Y * fy * fy * fy;
            } else {
                Y = (fy - 16.0 / 116) * 3 * squiggle * squiggle * WHITE.Y;
            }

            if (fx > squiggle) {
                X = WHITE.X * fx * fx * fx;
            } else {
                X = (fx - 16.0 / 116) * 3 * squiggle * squiggle * WHITE.X;
            }

            if (fz > squiggle) {
                Z = WHITE.Z * fz * fz * fz;
            } else {
                Z = (fz - 16.0 / 116) * 3 * squiggle * squiggle * WHITE.Z;
            }

            return new Colour(Colour.XYZA, [X, Y, Z, clr.values[3]]);
        }

        /**
        @param {Colour} rgb
        @return {Colour}
        */
        function convert_RGBA_XYZA(rgb) {
            var temp = [];

            for (var i = 0; i < 3; i++) {
                if (rgb.values[i] <= 0.04045) {
                    temp[i] = rgb.values[i] / 12.92;
                } else {
                    temp[i] = Math.pow((rgb.values[i] + 0.055) / 1.055, 2.4);
                }
            }

            return new Colour(Colour.XYZA, [
                0.4124 * temp[0] + 0.3576 * temp[1] + 0.1805 * temp[2],
                0.2126 * temp[0] + 0.7152 * temp[1] + 0.0722 * temp[2],
                0.0193 * temp[0] + 0.1192 * temp[1] + 0.9505 * temp[2],
                rgb.values[3]]);
        }

        /**
        @param {Colour} xyz
        @return {Colour}
        */
        function convert_XYZA_RGBA(xyz) {
            var temp = [];
            var values = [];

            temp[0] = 3.2410 * xyz.values[0] - 1.5374 * xyz.values[1] - 0.4986 * xyz.values[2];
            temp[1] = -0.9692 * xyz.values[0] + 1.8760 * xyz.values[1] + 0.0416 * xyz.values[2];
            temp[2] = 0.0556 * xyz.values[0] - 0.2040 * xyz.values[1] + 1.0570 * xyz.values[2];

            for (var i = 0; i < 3; i++) {
                if (temp[i] <= 0.0031308) {
                    values[i] = 12.92 * temp[i];
                } else {
                    values[i] = 1.055 * Math.pow(temp[i], 1.0 / 2.4) - 0.055;
                }
            }

            values[3] = xyz.values[3];

            return new Colour(Colour.RGBA, values);
        }

        /**
        @param {Colour} clr
        @return {Colour}
        */
        function convert_SAME(clr) {
            return new Colour(clr.type, clr.values.concat());
        }

        /**
        @param {Colour} clr
        @return {Colour}
        */
        function convert_RGBA_LABA(clr) {
            return convert_XYZA_LABA(
                convert_RGBA_XYZA(clr));
        }

        /**
        @param {Colour} clr
        @return {Colour}
        */
        function convert_LABA_RGBA(clr) {
            return convert_XYZA_RGBA(
                convert_LABA_XYZA(clr));
        }

        /**
        @param {Colour} clr
        @return {Colour}
        */
        function convert_XYZA_HSVA(clr) {
            return convert_RGBA_HSVA(
                convert_XYZA_RGBA(clr));
        }

        /**
        @param {Colour} clr
        @return {Colour}
        */
        function convert_HSVA_XYZA(clr) {
            return convert_RGBA_XYZA(
                convert_HSVA_RGBA(clr));
        }

        /**
        @param {Colour} clr
        @return {Colour}
        */
        function convert_HSVA_LABA(clr) {
            return convert_RGBA_LABA(
                convert_HSVA_RGBA(clr));
        }

        /**
        @param {Colour} clr
        @return {Colour}
        */
        function convert_LABA_HSVA(clr) {
            return convert_XYZA_HSVA(
                convert_LABA_XYZA(clr));
        }

        Colour.converters = [
            [convert_SAME,
              convert_RGBA_XYZA,
              convert_RGBA_HSVA,
              convert_RGBA_LABA],

            [convert_XYZA_RGBA,
              convert_SAME,
              convert_XYZA_HSVA,
              convert_XYZA_LABA],

            [convert_HSVA_RGBA,
              convert_HSVA_XYZA,
              convert_SAME,
              convert_HSVA_LABA],

            [convert_LABA_RGBA,
              convert_LABA_XYZA,
              convert_LABA_HSVA,
              convert_SAME]
        ];
    } ());

    Colour.CssColours = {
        "aliceblue": "#f0f8ff",
        "antiquewhite": "#faebd7",
        "aqua": "#00ffff",
        "aquamarine": "#7fffd4",
        "azure": "#f0ffff",
        "beige": "#f5f5dc",
        "bisque": "#ffe4c4",
        "black": "#000000",
        "blanchedalmond": "#ffebcd",
        "blue": "#0000ff",
        "blueviolet": "#8a2be2",
        "brown": "#a52a2a",
        "burlywood": "#deb887",
        "cadetblue": "#5f9ea0",
        "chartreuse": "#7fff00",
        "chocolate": "#d2691e",
        "coral": "#ff7f50",
        "cornflowerblue": "#6495ed",
        "cornsilk": "#fff8dc",
        "crimson": "#dc143c",
        "cyan": "#00ffff",
        "darkblue": "#00008b",
        "darkcyan": "#008b8b",
        "darkgoldenrod": "#b8860b",
        "darkgray": "#a9a9a9",
        "darkgreen": "#006400",
        "darkkhaki": "#bdb76b",
        "darkmagenta": "#8b008b",
        "darkolivegreen": "#556b2f",
        "darkorange": "#ff8c00",
        "darkorchid": "#9932cc",
        "darkred": "#8b0000",
        "darksalmon": "#e9967a",
        "darkseagreen": "#8fbc8f",
        "darkslateblue": "#483d8b",
        "darkslategray": "#2f4f4f",
        "darkturquoise": "#00ced1",
        "darkviolet": "#9400d3",
        "deeppink": "#ff1493",
        "deepskyblue": "#00bfff",
        "dimgray": "#696969",
        "dodgerblue": "#1e90ff",
        "firebrick": "#b22222",
        "floralwhite": "#fffaf0",
        "forestgreen": "#228b22",
        "fuchsia": "#ff00ff",
        "gainsboro": "#dcdcdc",
        "ghostwhite": "#f8f8ff",
        "gold": "#ffd700",
        "goldenrod": "#daa520",
        "gray": "#808080",
        "green": "#008000",
        "greenyellow": "#adff2f",
        "honeydew": "#f0fff0",
        "hotpink": "#ff69b4",
        "indianred": "#cd5c5c",
        "indigo": "#4b0082",
        "ivory": "#fffff0",
        "khaki": "#f0e68c",
        "lavender": "#e6e6fa",
        "lavenderblush": "#fff0f5",
        "lawngreen": "#7cfc00",
        "lemonchiffon": "#fffacd",
        "lightblue": "#add8e6",
        "lightcoral": "#f08080",
        "lightcyan": "#e0ffff",
        "lightgoldenrodyellow": "#fafad2",
        "lightgreen": "#90ee90",
        "lightgrey": "#d3d3d3",
        "lightpink": "#ffb6c1",
        "lightsalmon": "#ffa07a",
        "lightseagreen": "#20b2aa",
        "lightskyblue": "#87cefa",
        "lightslategray": "#778899",
        "lightsteelblue": "#b0c4de",
        "lightyellow": "#ffffe0",
        "lime": "#00ff00",
        "limegreen": "#32cd32",
        "linen": "#faf0e6",
        "magenta": "#ff00ff",
        "maroon": "#800000",
        "mediumaquamarine": "#66cdaa",
        "mediumblue": "#0000cd",
        "mediumorchid": "#ba55d3",
        "mediumpurple": "#9370d8",
        "mediumseagreen": "#3cb371",
        "mediumslateblue": "#7b68ee",
        "mediumspringgreen": "#00fa9a",
        "mediumturquoise": "#48d1cc",
        "mediumvioletred": "#c71585",
        "midnightblue": "#191970",
        "mintcream": "#f5fffa",
        "mistyrose": "#ffe4e1",
        "moccasin": "#ffe4b5",
        "navajowhite": "#ffdead",
        "navy": "#000080",
        "oldlace": "#fdf5e6",
        "olive": "#808000",
        "olivedrab": "#6b8e23",
        "orange": "#ffa500",
        "orangered": "#ff4500",
        "orchid": "#da70d6",
        "palegoldenrod": "#eee8aa",
        "palegreen": "#98fb98",
        "paleturquoise": "#afeeee",
        "palevioletred": "#d87093",
        "papayawhip": "#ffefd5",
        "peachpuff": "#ffdab9",
        "peru": "#cd853f",
        "pink": "#ffc0cb",
        "plum": "#dda0dd",
        "powderblue": "#b0e0e6",
        "purple": "#800080",
        "red": "#ff0000",
        "rosybrown": "#bc8f8f",
        "royalblue": "#4169e1",
        "saddlebrown": "#8b4513",
        "salmon": "#fa8072",
        "sandybrown": "#f4a460",
        "seagreen": "#2e8b57",
        "seashell": "#fff5ee",
        "sienna": "#a0522d",
        "silver": "#c0c0c0",
        "skyblue": "#87ceeb",
        "slateblue": "#6a5acd",
        "slategray": "#708090",
        "snow": "#fffafa",
        "springgreen": "#00ff7f",
        "steelblue": "#4682b4",
        "tan": "#d2b48c",
        "teal": "#008080",
        "thistle": "#d8bfd8",
        "tomato": "#ff6347",
        "turquoise": "#40e0d0",
        "violet": "#ee82ee",
        "wheat": "#f5deb3",
        "white": "#ffffff",
        "whitesmoke": "#f5f5f5",
        "yellow": "#ffff00",
        "yellowgreen": "#9acd32"
    };

    /*
    Zwibbler
    
    Copyright 2013 Hanov Solutions Inc. All Rights Reserved. This software is
    NOT open source. For licensing information, contact the author.
    
    steve.hanov@gmail.com
    */
    //#include <Colours.js>
    //#include <EventEmitter.js>
    /** 
    A simple HSV colour wheel.
    
    @constructor
    @param {Array.<string>=} colours
    @extends EventEmitter */
    function ColourPanel(parent, size, useTouch, colours) {
        this.init(parent, size, useTouch, colours);
    }

    ColourPanel.prototype.init = function (parent, size, useTouch, colours) {
        EventEmitter.call(this);
        this.canvas = $("<div>", { 'class': 'sp_colour_panel' });

        this.useTouch = useTouch;
        this.colours = colours || [
            "#000000",
            "#ffffff",
            "#000088",
            "#008800",
            "#008888",
            "#880000",
            "#880088",
            "#884400",
            "#888888",
            "#444444",
            "#0000ff",
            "#00ff00",
            "#00ffff",
            "#ff0000",
            "#ff00ff",
            "#ffff00"
        ];

        //Build all the panels and bind the mouse click events.
        this.buildPanel(this.colours, this.canvas);

        //Do this last.
        parent.append(this.canvas);
    };

    ColourPanel.prototype.buildPanel = function (colours, p) {

        var ul = $('<ul>', { 'class': 'sp_color_ul' });
        for (var i = 0; i < colours.length; ++i) {
            var colour = colours[i];

            var li = $('<li>', { 'class': 'sp_colour_list_item' }).append($('<a>', {
                'title': 'Fill color',
                'class': 'sp_colour sp_colour_' + colour.replace('#', ''),
                text: colour,
                click: this.onMouseClick.bind(this, colour)
            }));
            ul.append(li);
        }
        p.append(ul);
    };


    ColourPanel.prototype.setWidth = function (width) {
        this.width = width;
        //this.canvas.attr("width", "" + this.width );
    };

    ColourPanel.prototype.setHeight = function (height) {
        this._height = height;
        //this.canvas.attr("height", "" + this._height );
    };

    ColourPanel.prototype.height = function () {
        return this._height;
    };

    ColourPanel.prototype.moveTo = function (x, y) {
        /*
        this.canvas.css("left", "" + x + "px");
        this.canvas.css("top", "" + y + "px");
        */
    };

    ColourPanel.prototype.draw = function () {
        /*
        for( var i = 0; i < this.colours.length; i++ ) {
        this.ctx.fillStyle = this.colours[i];
        this.ctx.fillRect(i * this._height, 0, this._height, this._height);
        }
        */
    };

    ColourPanel.prototype.hide = function () {
        this.canvas.hide();
    };

    ColourPanel.prototype.show = function () {
        this.canvas.show();
    };

    ColourPanel.prototype.onMouseClick = function (colour, evt) {
        evt = evt || window.event;
        console.log("The colour, the button etc.", colour, evt);

        $('.sp_colour').removeClass('sp_colour_select');
        $('.sp_colour_' + colour.replace('#', '')).addClass('sp_colour_select');

        console.log($('.sp_color_' + colour.replace('#', '')));

        this.emit("colour", {
            colour: colour,
            button: evt.which //Which button?
        });
    };
    $.extend(ColourPanel.prototype, EventEmitter.prototype);
    /*
    Copyright 2010 Hanov Solutions Inc. All Rights Reserved
    
    steve.hanov@gmail.com
    */

    //#include <Colours.js> 

    /** 
    @constructor 
    @param {number} size
    */
    // for generating ids for sliders in older browsers
    var nextIdForColorWheelSlider = 0;

    function ColourWheel(size) {
        this.div = document.createElement("div");

        this.canvas = document.createElement("canvas");
        this.width = size;
        this.height = size;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.canvas.style.cursor = "crosshair";
        this.ctx = this.canvas.getContext("2d");

        // for generating ids for the label tag
        //this.nextId = 0;

        this.div.appendChild(this.canvas);

        // check if browser supports range control
        var input = document.createElement("input");
        input.setAttribute("type", "range");
        //this.transparentCheck = document.createElement("input");
        //this.transparentCheck.setAttribute("type", "checkbox");

        if (input.type === "range") { //feature detect
            this.div.appendChild(document.createElement("br"));
            this.div.appendChild(input);

            input.min = 0;
            input.max = 255;
            input.value = 255;
            this.alphaSlider = input;
        } else {
           /* this.alphaSlider = null;
            var id = "colourcheckbox" + this.nextId;
            this.transparentCheck.setAttribute("id", id);
            this.div.appendChild(document.createElement("br"));
            this.div.appendChild(this.transparentCheck);
            this.nextId += 1;
            var label = $("<label>").attr("for", id).text("Transparent");
            this.div.appendChild(label[0]);*/

            //Slider for older browsers in place of checkbox

            this.nextId = nextIdForColorWheelSlider;
            this.alphaSlider = null;
            var id = "colourSlider" + this.nextId;
            var colourSlider = Util.Slider.create(id, 0, 100);
            var sliderEl = colourSlider.getEl();
            this.div.appendChild(document.createElement("br"));
            this.div.appendChild(sliderEl);
            this.colourSlider = colourSlider;
            this.nextId += 1;

        }
        nextIdForColorWheelSlider = this.nextId;
        this.outer = this.height;
        this.inner = this.height * 0.8;

        if (ColourWheel[size]) {
            this.data = ColourWheel[size];
        } else {
            var data = this.ctx.getImageData(0, 0, this.outer, this.outer);
            var r = this.outer / 2;
            var r2 = this.inner / 2;
            var rgb, hsv;
            var a;

            for (var y = 0; y < this.outer; y++) {
                var s = Math.sqrt(r * r - (y - r) * (y - r));
                var fromX1 = Math.floor(-s + r);
                var toX1 = Math.floor(s + r);
                var p;
                var x;

                var b = r2 * r2 - (y - r) * (y - r);
                if (b >= 0) {
                    s = Math.sqrt(b);
                    var fromX2 = Math.floor(-s + r);
                    var toX2 = Math.floor(s + r);
                    p = y * this.outer * 4 + fromX1 * 4;
                    for (x = fromX1; x <= fromX2; x++) {
                        a = Math.atan2(y - r, x - r);
                        hsv = new Colour(Colour.HSVA,
                                [a / Math.PI * 180, 1, 1, 1]);
                        rgb = hsv.convertTo(Colour.RGBA);

                        data.data[p++] = rgb.values[0] * 255;
                        data.data[p++] = rgb.values[1] * 255;
                        data.data[p++] = rgb.values[2] * 255;
                        data.data[p++] = 255;
                    }

                    p = y * this.outer * 4 + toX2 * 4;
                    for (x = toX2; x <= toX1; x++) {
                        a = Math.atan2(y - r, x - r);
                        hsv = new Colour(Colour.HSVA,
                                [a / Math.PI * 180, 1, 1, 1]);
                        rgb = hsv.convertTo(Colour.RGBA);

                        data.data[p++] = rgb.values[0] * 255;
                        data.data[p++] = rgb.values[1] * 255;
                        data.data[p++] = rgb.values[2] * 255;
                        data.data[p++] = 255;
                    }
                } else {
                    p = y * this.outer * 4 + fromX1 * 4;

                    for (x = fromX1; x <= toX1; x++) {
                        a = Math.atan2(y - r, x - r);
                        hsv = new Colour(Colour.HSVA,
                                [a / Math.PI * 180, 1, 1, 1]);
                        rgb = hsv.convertTo(Colour.RGBA);

                        data.data[p++] = rgb.values[0] * 255;
                        data.data[p++] = rgb.values[1] * 255;
                        data.data[p++] = rgb.values[2] * 255;
                        data.data[p++] = 255;
                    }
                }
            }
            this.data = data;
            ColourWheel[size] = data;
        }

        this.hsv = new Colour(Colour.HSVA, [20, 1, 1, 1]);
        this.update();
        this.draw();

        var self = this;
        self.buttonDown = false;
        self.mouseArea = "";
        $(this.canvas).mousedown(function (e) {
            var offset = $(self.canvas).offset();
            var x = (e.pageX - offset.left);
            var y = (e.pageY - offset.top);
            self.buttonDown = true;
            self.calcClick(x, y);
            e.stopPropagation();
            e.preventDefault();
        });

        $(this.canvas).mousemove(function (e) {
            if (self.buttonDown) {
                var offset = $(self.canvas).offset();
                var x = (e.pageX - offset.left);
                var y = (e.pageY - offset.top);
                self.calcClick(x, y);
            }
            e.stopPropagation();
            e.preventDefault();
        });

        $(window).mouseup(function (e) {
            self.buttonDown = false;
            self.mouseArea = "";
        });

        if (this.alphaSlider !== null) {
            $(this.alphaSlider).change(function (e) {
                self.hsv.values[3] = self.alphaSlider.value / 255;
                self.update();
                self.draw();
            });
        }else {
            colourSlider.onEnd.subscribe(function (e) {
                console.log("Slider start");
                self.hsv.values[3] = (this.getValue() * 2.55) / 255;
                self.update();
                self.draw();
            });
        }
        /*
        $(this.transparentCheck).change(function (e) {
            if (self.transparentCheck.checked) {
                self.hsv.values[3] = 0.0;
            } else {
                self.hsv.values[3] = 1.0;
            }
            self.update();
            self.draw();
        });
        */
    }
    ColourWheel.prototype = {

        /** 
        @param {string} colourString
        */
        setFromColour: function (colourString) {
            this.hsv = Colour.fromString(colourString).convertTo(Colour.HSVA);
            if (this.alphaSlider !== null) {
                this.alphaSlider.value = Math.round(this.hsv.values[3] * 255);
            }

            else if (this.colourSlider !== null) {
                this.colourSlider.value = Math.round(this.hsv.values[3] * 255);
            }
            //if (this.hsv.values[3] === 0.0) {
            //    this.transparentCheck.checked = true;
            //} else {
            //    this.transparentCheck.checked = false;
            //}
            this.draw();
            this.update();
        },

        update: function () {
            if (this.onUpdate) {
                this.onUpdate(this.hsv.toString());
            }

        },

        draw: function () {
            this.ctx.save();
            this.ctx.lineWidth = 1;
            this.ctx.fillStyle = "rgb(128, 128, 128)";
            this.ctx.fillRect(0, 0, this.width, this.height);
            this.ctx.putImageData(this.data, 0, 0);

            var a = this.hsv.values[0] / 180 * Math.PI;

            this.ctx.beginPath();
            var p1 = {
                x: Math.cos(a) * this.inner / 2 + this.outer / 2,
                y: Math.sin(a) * this.inner / 2 + this.outer / 2
            };
            var p2 = {
                x: Math.cos(a + 2 * Math.PI / 3) * this.inner / 2 + this.outer / 2,
                y: Math.sin(a + 2 * Math.PI / 3) * this.inner / 2 + this.outer / 2
            };
            var p3 = {
                x: Math.cos(a + 4 * Math.PI / 3) * this.inner / 2 + this.outer / 2,
                y: Math.sin(a + 4 * Math.PI / 3) * this.inner / 2 + this.outer / 2
            };

            var outLine = {
                x: Math.cos(a) * this.outer / 2 + this.outer / 2,
                y: Math.sin(a) * this.outer / 2 + this.outer / 2
            };

            var mid = {
                x: p2.x + (p3.x - p2.x) / 2,
                y: p2.y + (p3.y - p2.y) / 2
            };
            this.ctx.moveTo(p1.x, p1.y);
            this.ctx.lineTo(p2.x, p2.y);
            this.ctx.lineTo(p3.x, p3.y);
            this.ctx.lineTo(p1.x, p1.y);

            var fill = this.ctx.createLinearGradient(p2.x, p2.y, p3.x, p3.y);
            fill.addColorStop(0, "#ffffff");
            fill.addColorStop(1, "#000000");
            this.ctx.fillStyle = fill;
            this.ctx.fill();

            fill = this.ctx.createLinearGradient(p1.x, p1.y, mid.x, mid.y);

            var hsv = this.hsv.convertTo(Colour.HSVA);
            hsv.values[1] = 1.0;
            hsv.values[2] = 1.0;

            var fullRgb = hsv.convertTo(Colour.RGBA);
            fullRgb.values[3] = 1.0;

            fill.addColorStop(0, fullRgb.toString());
            fullRgb.values[3] = 0.0;
            fill.addColorStop(1, fullRgb.toString());
            this.ctx.fillStyle = fill;
            this.ctx.fill();

            // Draw the line that points the colour
            this.strokeStyle = "#000000";
            this.ctx.beginPath();
            this.ctx.moveTo(p1.x, p1.y);
            this.ctx.lineTo(outLine.x, outLine.y);
            this.ctx.stroke();

            // draw the circle around the exact point on the triangle.
            var x, y, v;
            v = 1.0 - this.hsv.values[2];
            x = this.hsv.values[1] * p1.x + v * p3.x + (1 - this.hsv.values[1] - v) *
                p2.x;
            y = this.hsv.values[1] * p1.y + v * p3.y + (1 - this.hsv.values[1] - v) *
                p2.y;

            this.ctx.beginPath();
            this.ctx.arc(x, y, 4, 0, 2 * Math.PI, false);
            this.ctx.stroke();

            this.ctx.restore();

            this.p1 = p1;
            this.p2 = p2;
            this.p3 = p3;
            this.mid = mid;
        },

        /** 
        @param {number} x
        @param {number} y
        */
        calcClick: function (x, y) {
            var distance = Math.sqrt((x - this.outer / 2) * (x - this.outer / 2) +
                    (y - this.outer / 2) * (y - this.outer / 2));

            if (this.mouseArea === "ring" ||
                    this.mouseArea !== "triangle" &&
                    distance >= this.inner / 2 && distance <= this.outer / 2) {
                var a = Math.atan2(this.outer / 2 - y, this.outer / 2 - x);
                this.hsv.values[0] = a / Math.PI * 180 + 180;
                if (this.hsv.values[1] === 0.0) {
                    // Usability: Testing revealed user was unable to change the
                    // colour, because she expected it to change when she clicked
                    // on the outer ring.
                    this.hsv.values[1] = 1.0;
                    this.hsv.values[2] = 1.0;
                }
                this.mouseArea = "ring";
            } else {
                var lambda1, lambda2, lambda3;
                var det;
                var p1 = this.p1;
                var p2 = this.p2;
                var p3 = this.p3;

                det = (p1.x - p3.x) * (p2.y - p3.y) - (p2.x - p3.x) * (p1.y - p3.y);

                lambda1 = ((p2.y - p3.y) * (x - p3.x) - (p2.x - p3.x) * (y - p3.y)) / det;
                lambda2 = (-(p1.y - p3.y) * (x - p3.x) + (p1.x - p3.x) * (y - p3.y)) / det;
                lambda3 = 1.0 - Math.max(0, lambda1) - Math.max(0, lambda2);

                this.hsv.values[1] = Math.min(Math.max(lambda1, 0.0), 1.0);
                this.hsv.values[2] = 1.0 - Math.min(Math.max(lambda3, 0.0), 1.0);

                this.mouseArea = "triangle";
            }

            this.draw();
            this.update();
        }

    };

    /*
    Copyright 2010 Hanov Solutions Inc. All Rights Reserved
    
    steve.hanov@gmail.com
    */
    //#include <ColourWheel.js>
    //#include <Panel.js>
    //#include <log.js>

    /*jslint sub:true */


    /** @constructor 
    @extends Panel
    
    The property panel displays information about the currently selected shapes
    and lets the user change the properties.
    */
    function PropertyPanel(config, id) {
        this.config = config;

        this.initPanel($("<div>"));
        this.div.addClass("sp_property_panel");
        this.SPID = id;
        this.div.attr('id', id + '_sp_property-panel');

        this.wrapperDiv = $('<div>', { 'class': 'sp_property_panel_wrapper' });
        this.div.append(this.wrapperDiv);

        var dragHanldeId = this.SPID + '_property_panel_drag_handle';
        var dragHandle = $('<div>', { 'class': 'sp_drag_panel_handle', 'title': 'Move', 'id': dragHanldeId }).text('Property Panel');
        this.makeDraggableElement(this.div, dragHandle, $('.theQuestions'));
        this.wrapperDiv.append(dragHandle);

        var self = this;
        var a = $('<a>', { 'class': 'sp_close_panel', 'title': 'Close', 'href': '#'}).text('Hide Options').click(function () { self.hide() });
        this.wrapperDiv.append(a);
        var contentsDiv = $('<div>', { 'class': 'sp_property_panel_contents'});
        this.contentsDiv = contentsDiv;
        this.wrapperDiv.append(contentsDiv);
        this.config = config;
        this.records = [];
        this.recordsByName = {};
        this.view = null; // must be set after construction.
        this.nodes = [];

        this.action = null;

    }

    PropertyPanel.prototype = {
        log: log.create("PROP"),
        loadFromNodes: function (nodes) {
            this.action = null;
            this.records.length = 0;
            this.recordsByName = {};
            this.nodes = nodes.concat();
            var hasGroup = false;

            // for each node,
            for (var i = 0; i < nodes.length; i++) {
                var node = nodes[i];

                if (node.isGroupMember()) {
                    hasGroup = true;
                }

                // floating dom nodes have no editable properties.
                if (node.type() === "DomNode") {
                    continue;
                }

                // get the property list.
                var properties = node.getProperties();

                // add the property from the node.
                for (var key in properties) {
                    if (properties.hasOwnProperty(key)) {
                        this.loadFromNode(key, node);
                    }
                }
            }

            this.createControls();
            if (this.config.showKeyboardHelp()) {
                this.showKeyboardShortcuts(nodes, hasGroup);
            }
        },

        showKeyboardShortcuts: function (nodes, hasGroup) {
            var keydiv = $("<div>").addClass("keydiv");
            //keydiv.css("font-size", "8pt");
            //keydiv.css("color", "black");
            //keydiv.css("font-weight", "normal");

            $(this.contentsDiv).append(keydiv);

            keydiv.append("<h4>Keyboard</h4>");

            var Shortcuts = [
                {
                    key: 'C',
                    description: "Draw curves"
                },
                {
                    key: 'L',
                    description: "Draw lines"
                }
            ];

            if (nodes.length > 0) {
                Shortcuts.push(
                    {
                        key: 'Del',
                        description: "Delete Selection"
                    },
                    {
                        key: 'Ctrl+D',
                        description: "Duplicate Selection"
                    },
                    {
                        key: 'PageUp',
                        description: "Move selection closer"
                    },
                    {
                        key: 'PageDown',
                        description: "Move selection away"
                    }
                );
            }

            if (nodes.length > 1) {
                Shortcuts.push(
                    {
                        key: 'Ctrl+G',
                        description: "Group selection"
                    });
            }

            if (hasGroup) {
                Shortcuts.push(
                    {
                        key: 'Ctrl+Shift+G',
                        description: "Break apart group"
                    }
                );
            }
            /* Hide the keyboard shortcuts for Zoom-in, zoom out */            
//            Shortcuts.push({
//                key: "+",
//                description: "Zoom in"
//            });
//            Shortcuts.push({
//                key: "-",
//                description: "Zoom out"
//            }); 
            Shortcuts.push({
                key: "Arrow Keys",
                description: "Move while zoomed"
            });

            for (var i = 0; i < Shortcuts.length; i++) {
                var a = $("<span>").text(Shortcuts[i].key).addClass("key sp_property_shortcut");
                var p = $("<p>").append(a);
                p[0].appendChild(document.createTextNode(Shortcuts[i].description));
                keydiv.append(p);
            }

        },

        createProperty: function (node, name) {
            /* given a property name, for example, "strokestyle" or "sloppiness",
            return a structure with the following members:
    
            display: the text to display for the name of the property. Example:
            "Background colour.
    
            type: "select", "colour", or "text" depending on the control that should be
            used to select it.
    
            values: an array of records with elements:
            name: the name of the thing to but in the select control
            value: The value corresponding to the name.
            */
            var i;

            if (name === "strokeStyle") {
                return {
                    name: name,
                    type: "colour",
                    display: "Outline Colour"
                };
            } else if (name === "fillStyle") {
                return {
                    name: name,
                    type: "colour",
                    display: "Fill Colour"
                };
            } else if (name === "lineWidth") {
                var values = [
                         { name: "Pencil", value: 1.0 },
                         { name: "Pen", value: 2.0 },
                         { name: "Marker", value: 4.0 },
                         { name: "Brush", value: 10.0 }
                ];

                if (node.getProperty("closed") === true ||
                        node.type() === "TextNode") {
                    values.unshift({ name: "None", value: 0.0 });
                }
                return {
                    name: name,
                    display: "Outline Thickness",
                    type: "select",
                    values: values
                };
            } else if (name === "sloppiness") {
                return {
                    name: "sloppiness",
                    display: "Sloppiness",
                    type: "select",
                    values: [
                        { name: "Draftsman", value: 0.0 },
                        { name: "Artist", value: 0.25 },
                        { name: "Cartoonist", value: 0.5 },
                        { name: "Child", value: 1.0 },
                        { name: "Dizzy", value: 2.0 }
                    ]
                };
            } else if (name === "smoothness") {
                return {
                    name: "smoothness",
                    display: "Smoothness",
                    type: "select",
                    values: [
                        { name: "Sharper", value: 0.1 },
                        { name: "Sharp", value: 0.2 },
                        { name: "Smooth", value: 0.3 },
                        { name: "Smoothest", value: 0.5 }
                    ]
                };
            } else if (name === "shadow") {
                return {
                    name: "shadow",
                    display: "Shadow",
                    type: "select",
                    values: [
                        { name: "Shadow", value: true },
                        { name: "None", value: false }
                    ]
                };
            } else if (name === "matrix" || name === "inverse" ||
                    name === "closed" || name === "commands" || name === "seed") {
                return {
                    name: name,
                    type: "none"
                };
            } else if (name === "text") {
                return {
                    name: "text",
                    display: "Text",
                    type: "textarea"
                };
            } else if (name === "textFillStyle") {
                return {
                    name: "textFillStyle",
                    display: "Text Colour",
                    type: "colour"
                };

            } else if (name === "fontSize") {
                return {
                    name: "fontSize",
                    display: "Font Size",
                    type: "select",
                    values: [
                        { name: "10", value: 10 },
                        { name: "12", value: 12 },
                        { name: "15", value: 15 },
                        { name: "20", value: 20 },
                        { name: "30", value: 30 },
                        { name: "40", value: 40 },
                        { name: "50", value: 50 },
                        { name: "60", value: 60 }
                    ]
                };

            } else if (name === "fontName") {
                var fonts = [];
                var allowedFonts = this.config.getOption("fonts");
                for (i = 0; i < allowedFonts.length; i++) {
                    fonts.push({
                        name: allowedFonts[i], value: allowedFonts[i]
                    });
                }
                return {
                    name: "fontName",
                    display: "Font",
                    type: "select",
                    values: fonts
                };

            } else if (name === "arrowSize") {
                return {
                    name: "arrowSize",
                    display: "Arrow Head Size",
                    type: "select",
                    values: [
                        { name: "None", value: 0.0 },
                        { name: "Tiny", value: 10.0 },
                        { name: "Small", value: 15.0 },
                        { name: "Medium", value: 20.0 },
                        { name: "Large", value: 30.0 }
                    ]
                };

            } else if (name === "url") {

                return {
                    name: "url",
                    display: "Image URL",
                    type: "text"
                };

            } else if (name === "mathml") {

                return {
                    name: "mathml",
                    display: "Equation",
                    type: "button"
                };
            } else if (name === "isTextEditable") {

                return {
                    name: "isTextEditable",
                    display: "isTextEditable",
                    type: "none"
                };
            } else {
                    return {
                        name: name,
                        display: "Display-" + name,
                        type: "text"
                    };
                }
        },

        loadFromNode: function (property, node) {
            var record;
            var config = this.config;

            // if we already have the property,
            if (property in this.recordsByName) {
                record = this.recordsByName[property];

                // if the node's value differs from the property value,
                if (record.value !== node.getProperty(property)) {
                    // mark the property as "multiple values"
                    record.value = null;
                }
            } else if (property === "locked" || property === "points") {
                // don't show this.
            } else if ((node.getProperty("closed") === true &&
                         property === "arrowSize") ||
                        (node.getProperty("closed") === false &&
                         (property === "fontName" ||
                         property === "fontSize" ||
                         property === "textFillStyle" ||
                         property === "text" ||
                         property === 'fillStyle'))) {
                // don't show.
            } else if (node.type() === "BrushNode" && property === "fillStyle") {
                // don't show.

            } else if (node.type() === "MathNode" &&
                    (property === "fillStyle" ||
                     property === "strokeStyle" ||
                     property === "lineWidth")) {
                // don't show.
            } else if (node.type() === "TextNode" &&
                    property === 'fillStyle') {
                // don't show
            } else if (
                    property === "fillStyle" &&
                        !config.get("showFillColourProperty") ||

                    property === "strokeStyle" &&
                        !config.get("showOutlineColourProperty") ||

                    node.type() !== "BrushNode" && property === "lineWidth" &&
                        !config.get("showOutlineThicknessProperty") ||

                    node.type() === "BrushNode" && property === "lineWidth" &&
                        !config.get("showBrushThicknessProperty") ||

                    node.type() === "BrushNode" && property === "strokeStyle" &&
                        !config.get("showBrushColourProperty") ||

                    property === "shadow" &&
                        !config.get("showShadowProperty") ||

                    property === "textFillStyle" &&
                        !config.get("showTextColourProperty") ||

                    property === "fontName" &&
                        !config.get("showFontProperty") ||

                    property === "fontSize" &&
                        !config.get("showFontSizeProperty") ||

                    property === "arrowSize" &&
                        !config.get("showArrowHeadSizeProperty")
                    ) {
                // don't show
            } else {
                // don't already have the property. Add it.
                record = {
                    property: this.createProperty(node, property),
                    value: node.getProperty(property)
                };
                this.records.push(record);
                this.recordsByName[property] = record;
            }
        },

        createControls: function () {
            // remove all existing controls.
            $(this.contentsDiv).empty();

            var self = this;
            var i;
            var j;
            var input;
            var self = this;

            var selectOnChangeFn = function () {
                var which = parseInt(this.value, 10);
                self.apply(this.prop.name, this.prop.values[which].value);
            };

            var onEnterFn = function (e) {                
                if (e.keyCode === 13) {                    
                    self.apply(this.prop.name, this.value);
                }                
            };

            //outline color keydown handler
            var onColourEnterFn = function (e) {                                
                //avoid propagating the colour property key events to canvas, and restrict invalid key codes                                        
                e.preventDefault ? e.preventDefault() : e.returnValue = false;
                e.stopPropagation ? e.stopPropagation() : e.cancelBubble = true;
            };

            var onButtonClickFn = function () {
                self.view.onPropertyButtonClicked(this.prop.name);
            };

            var onWheelClickFn = function (wheel, input) {
                wheel.input = input;
                self.wheelClicked(wheel);
            };


            // for each property record,
            for (i = 0; i < this.records.length; i++) {
                var record = this.records[i];
                var prop = record.property;

                if (prop.type === "none") {
                    continue;
                }

                var div = document.createElement("div");

                // add a span for its name.
                var span = document.createElement("span");
                span.appendChild(document.createTextNode(prop.display));
                div.appendChild(span);
                div.appendChild(document.createElement("br"));

                // if it's a select, 
                if (prop.type === "select") {
                    // create a select box.
                    var select = document.createElement("select");

                    // for each name/value pair,
                    for (j = 0; j < prop.values.length; j++) {
                        var item = prop.values[j];

                        // add the item to the select box.
                        var option = document.createElement("option");
                        option.appendChild(document.createTextNode(item.name));
                        option.setAttribute("value", j);

                        // if the value is equal to the value of the record, then
                        // set the item as default.
                        if (item.value === record.value) {
                            option.setAttribute("selected", "");
                        }

                        select.appendChild(option);
                    }

                    select.prop = prop;

                    select.onchange = selectOnChangeFn;

                    div.appendChild(select);

                    // if it's a color, 
                } else if (prop.type === "colour") {
                    // create a text box containing the colour as a string.
                    input = document.createElement("input");
                    //input.style.MozUserSelect = "text";
                    input.setAttribute("type", "text");
                    input.className = 'sp_colour_input';
                    input.value = record.value;
                    input.prop = prop;
                    //input.title = "Color codes use keys a-f and 0-9"; //add tooltip for valid color codes                    
                    input.readOnly = true;
                    $(input).keydown(onColourEnterFn);
                    
                    div.appendChild(input);

                    //Build the color wheel.
                    var wheel = document.createElement("a");
                    wheel.className = 'sp_colour_wheel';
                    div.appendChild(wheel);

                    $(wheel).click(onWheelClickFn.bind(this, wheel, input));
                    $(input).click(onWheelClickFn.bind(this, wheel, input));

                    // if it's text,    
                } else if (prop.type === "text") {
                    // create a text box containing the text.
                    input = document.createElement("input");
                    input.setAttribute("type", "text");
                    input.value = record.value;

                    input.prop = prop;
                    $(input).keydown(onEnterFn);

                    div.appendChild(input);

                    // if it's multiline text,    
                } else if (prop.type === "textarea") {
                    // create a text box containing the text.
                    input = document.createElement("textarea");
                    input.setAttribute("rows", "3");
                    input.setAttribute("cols", "20");
                    input.value = record.value;

                    input.prop = prop;
                    
                    $(input).keyup(function(e) {
                        self.apply(this.prop.name, this.value);
                    });

                    div.appendChild(input);

                    // if it's a button,    
                } else if (prop.type === "button") {
                    // create a text box containing the text.
                    input = document.createElement("input");
                    input.setAttribute("type", "button");
                    input.value = "Edit";

                    input.prop = prop;

                    $(input).click(onButtonClickFn);

                    div.appendChild(input);

                } else {
                    // error! Invalid property type.
                    throw "Error: No such property";
                }
                this.contentsDiv.append(div);
            }
        },

        apply: function (name, value) {
            this.view.setProperty(name, value);
        },

        wheelClicked: function (element) {
            if (element.hasWheel) {
                if (element.wheel.div.style.display == "") {
                    element.wheel.div.style.display = "none";
                } else {
                    element.wheel.div.style.display = "";
                }
                return;
            }
            var wheel = new ColourWheel(120);
            var self = this;
            wheel.setFromColour(element.input.value);
            wheel.onUpdate = function (colourStr) {
                self.colourChanged(colourStr, element.input, element.input.prop);
            };
            element.wheel = wheel;
            element.hasWheel = true;
            element.parentNode.appendChild(wheel.div);
        },

        colourChanged: function (colour, input, prop) {
            if (this.action === null || this.action.name !== prop.name) {
                this.view.setProperty(prop.name, colour);
            }
            input.value = colour;

            /*
            this.action.value = colour;
            for ( var i = 0; i < this.nodes.length; i++ ) {
            var node = this.nodes[i];
            node.setProperty( prop.name, colour );
            node.format();
            }
    
            this.view.draw();
            */
        },

        resetOffset: function (){
            if(parseInt(this.div.css('left')) > 0 && parseInt(this.div.css('top')) > -30)
                return;
            this.div.css({
                "left": "155px",
                "top": "30px"
            });
        },

        makeDraggableElement: function ($element, $dragHandle, $boundingElement) {
            var dragging = false,
                $document = $(document),
                mouseOrigin, elementOffsetOrigin;

            function getPoint(event) {

                if (typeof event.screenX !== 'number') {
                    event = event.originalEvent.changedTouches[0];
                }

                return {
                    x: event.screenX | 0,
                    y: event.screenY | 0
                };
            }

            function getDelta(currentEvent) {
                var point = getPoint(currentEvent);
                point.x -= mouseOrigin.x;
                point.y -= mouseOrigin.y;

                return point;
            }

            function getRect($element, outter) {
                var element = $element[0],
                    elementOffset = $element.offset();

                return {
                    left: elementOffset.left | 0,
                    top: elementOffset.top | 0,
                    right: (elementOffset.left + (outter ? element.offsetWidth : element.scrollWidth)) | 0,
                    bottom: (elementOffset.top + (outter ? element.offsetHeight : element.scrollHeight)) | 0,
                    width: function () {
                        return this.right - this.left;
                    },
                    height: function () {
                        return this.bottom - this.top;
                    }
                };
            }

            // includes margins/borders/paddings
            function getOutterRect($element) {
                return getRect($element, true);
            }

            // inner area's rectangle
            function getInnerRect($element) {
                return getRect($element, false);
            }

            function startDrag(event) {
                if (!dragging) {
                    dragging = true;

                    mouseOrigin = getPoint(event);
                    elementOffsetOrigin = getOutterRect($element);

                    $dragHandle.off('mousedown touchstart', startDrag).on('mouseup touchend', endDrag);
                    $document.on('mousemove touchmove', drag);

                    event.stopPropagation();
                    event.preventDefault();
                }
            }

            function drag(event) {

                if (!dragging) {
                    return endDrag(event);
                }

                var delta = getDelta(event),
                    bounds = getInnerRect($boundingElement),
                    deltaLimits = {
                        min: {
                            x: bounds.left - elementOffsetOrigin.left,
                            y: bounds.top - elementOffsetOrigin.top
                        },
                        max: {
                            x: bounds.right - elementOffsetOrigin.right,
                            y: bounds.bottom - elementOffsetOrigin.bottom
                        }
                    };

                function constrain(dimension, axis) {
                    if (elementOffsetOrigin[dimension]() < bounds[dimension]()) {
                        delta[axis] = Math.max(delta[axis], deltaLimits.min[axis]);
                        delta[axis] = Math.min(delta[axis], deltaLimits.max[axis]);
                    } else {
                        // we are bigger than the container, can't move either direction
                        delta[axis] = 0;
                    }
                }

                constrain('width', 'x');
                constrain('height', 'y');

                if (delta.x || delta.y) {
                    $element.offset({
                        left: elementOffsetOrigin.left + delta.x,
                        top: elementOffsetOrigin.top + delta.y
                    });
                }

                event.stopPropagation();
                event.preventDefault();
            }

            function endDrag(event) {
                if (dragging) {
                    $dragHandle.on('mousedown touchstart', startDrag).off('mouseup touchend', endDrag);
                    $document.off('mousemove touchmove', drag);
                    dragging = false;
                }

                event.stopPropagation();
                event.preventDefault();
            }

            $dragHandle.on('mousedown', startDrag);
        }
    };

    // inherit from Panel
    PropertyPanel.prototype = $.extend({}, Panel.prototype,
            PropertyPanel.prototype);
    /*
    Zwibbler
    
    Copyright 2013 Hanov Solutions Inc. All Rights Reserved. This software is
    NOT open source. For licensing information, contact the author.
    
    steve.hanov@gmail.com
    */
    /*
    //#include <Api.js>
    //#include <ColourPanel.js>
    //#include <Config.js>
    //#include <Cookies.js>
    //#include <DebugPanel.js>
    //#include <EventEmitter.js>
    //#include <ImageNode.js>
    //#include <Import.js>
    //#include <log.js>
    //#include <Menubar.js>
    //#include <Menu.js>
    //#include <PropertyPanel.js>
    //#include <QueryString.js>
    //#include <RandomString.js>
    //#include <Set.js>
    //#include <Toolbar.js>
    //#include <Url.js>
    //#include <ZwibblerDocument.js>
    //#include <ZwibblerView.js>
    //#include <ListView.js>
    //#include <BrushNode.js>
    //#include <jquery.lite.js>
    //#include <KeyboardMap.js>
    */
    /*
    This the main zwibbler application object. It manages the layout of the page
    when the window is resized, and glues together the menu and commands to changes
    to the document and view.
    */
    /**
    * @constructor
    */
    var Application = function (div, options) {
        var mjax;
        this.div = div;
        this.minimal = true;
        this.div.empty();
        this.objectCounter = 0;
        this.readOnly = false;

        this.debugPanel = new DebugPanel($("<div>"));
        this.div.append(this.debugPanel.div);
        this.config = new Config(options);
        /* id of the background image in the document. */
        this.backgroundImageId = null;

        //Container for the tools and the color panel.
        this.toolbarContainer = $('<div>', { 'class': 'sp_toolbar' });
        this.div.append(this.toolbarContainer);

        this.config.scale = this.config.scale || 1.0;
        var canvasSize = (this.config.options.canvasSize || "600X800").split('X');
        this.config.originalWidth = canvasSize[0];
        this.config.originalHeight = canvasSize[1];

        this.canvasContainer = $('<div>', {
            'class': 'sp_canvas_container',
            'width': this.config.originalWidth + 'px',
            'height': this.config.originalHeight + 'px'
        });
        this.div.append(this.canvasContainer);

        this.canvas = $("<canvas>", { 'class': 'sp_main_canvas' });
        this.resizeCanvas();
        this.canvasContainer.append(this.canvas);


        //Why?
        this.ctx = this.canvas[0].getContext("2d");
        if (this.config.useTouch()) {
            this.colourPanel = new ColourPanel(this.toolbarContainer, 40, true);
        } else {
            this.colourPanel = new ColourPanel(this.toolbarContainer, 20, false);
        }
        this.eventSource = new EventEmitter();
        this.eventSource.bind("document-changed", __bind(function (e) {
            return this.onLocalDocumentChanged(e);
        }, this));
        this.eventSource.bind("math.edit", __bind(function (id) {
            this.startMathEditor(id);
        }, this));

        this.view = new ZwibblerView(this.canvas, new ZwibblerDocument(), this.colourPanel, this.eventSource, this.config);
        this.setDefaults();
        this.createToolbar(this.toolbarContainer);


        /* link the view and property panel together, but only if it is */
        /* configured to be shown. If no property panel is desired, this avoids */
        /* unnecessary references to wd-wheel.png */
        this.propertyPanel = new PropertyPanel(this.config, this.div.attr('id'));
        //this.propertyPanel.div[0].setAttribute('style', 'height:' + canvasHeight); //Per Adam's recommendation.
        this.div.append(this.propertyPanel.div);
        if (this.config.showPropertyPanel()) {
            this.view.propertyPanel = this.propertyPanel;
        }
        this.propertyPanel.view = this.view;
        $(window).resize(__bind(function () {
            return this._onResize();
        }, this));
        this.eventSource.bind("resize", __bind(function (e) {
            return this._onResize;
        }, this));
        this.query = Url.hash();
        this.showDebug = ("debug" in this.query) || this.config.showDebug();
        this.backgroundSelector = new ListView(this.div);
        this.backgroundSelector.div.css("border-right", "1px solid black");
        this.imageSelector = new ListView(this.div);
        this.imageSelector.div.css("border-top", "1px solid black");
        this.imageSelector.setLayout("horizontal");
        this.imageSelector.on("click", __bind(function (url) {
            return this.newImage(url);
        }, this));
        this.backgroundSelector.on("click", __bind(function (url) {
            return this.setBackgroundImage(url);
        }, this));
        this.oldWidth = -1;
        this.oldHeight = -1;
        this._onResize();
        this.setupKeyboardSupport();
        if (this.config.getOption("backgroundImage") !== null) {
            this.setBackgroundImage(this.config.getOption("backgroundImage"));
        }
        this.ensureFontsAreLoaded();

        /* The Zwibbler context that will be set later */
        this.zwibblerContext = null;

        // set keyboard focus to toolbar.
        //this.focus(true);
    };

    Application.prototype.log = log.create("APP");
    Application.prototype.ensureFontsAreLoaded = function () {
        /* There is a delay between fonts referenced in css using @font-face and */
        /* when we can use them. */
        /* make sure all the fonts are loaded now. */
        var ctx, div, fontname, _i, _len, _ref, _results;
        ctx = this.canvas[0].getContext("2d");
        _ref = this.config.getOption("fonts");
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            fontname = _ref[_i];
            /*            ctx.fillText "M", 100, 100 */
            this.log("Preloading: %s", fontname);
            div = $("<div>", { 'class': 'hidden' }).css("font-family", fontname).text("abcd");
            div.css("color", "white");
            _results.push(this.div.append(div));
            //this.div.remove(div);
        }
        return _results;
    };
    Application.prototype.setDefaults = function () {
        if (!this.config.getOption("sloppy")) {
            this.view.setDefault("sloppiness", 0.0);
        }
        this.view.setDefault("smoothness", this.config.getDefaultSmoothness());
        return this.view.setDefault("fillStyle", this.config.getOption("defaultFillStyle"));
    };
    Application.prototype.setBackgroundImageList = function (images) {
        var arg, _i, _len, _results;
        this.backgroundSelector.clear();
        _results = [];
        for (_i = 0, _len = images.length; _i < _len; _i++) {
            arg = images[_i];
            _results.push(typeof arg === 'string' ? this.backgroundSelector.addImage(arg, arg) : this.backgroundSelector.addImage(arg['small'], arg['large']));
        }
        return _results;
    };
    Application.prototype.setIconBrowserList = function (images) {
        var arg, _i, _len, _results;
        this.imageSelector.clear();
        _results = [];
        for (_i = 0, _len = images.length; _i < _len; _i++) {
            arg = images[_i];
            _results.push(typeof arg === 'string' ? this.imageSelector.addImage(arg, arg) : this.imageSelector.addImage(arg['small'], arg['large']));
        }
        return _results;
    };
    Application.prototype.setDocument = function (doc) {        
        this.backgroundImageId = null;
        this.view.setDocument(doc);
        this.setDefaults();
        this.findBackgroundImage();
    };
    Application.prototype.notify = function (text) {
        return $("#notifier").text(text);
    };
    Application.prototype.onLocalDocumentChanged = function (doc) {
        return this.log("Local document changed.");
    };

    Application.prototype.zoom = function (scale) {
        this.canvasContainer.css({
            width: this.config.originalWidth * scale + 'px',
            height: this.config.originalHeight * scale + 'px',
        });

        this.resizeCanvas();

        this.view.scale = scale;
        this.view.update(true);
    };

    Application.prototype.resizeCanvas = function () {
        var rect = this.getCanvasRectangle(this.canvasContainer);
        this.canvas[0].setAttribute('width', rect.width);
        this.canvas[0].setAttribute('height', rect.height);
    };
    //Provide a guess at how big the canvas should be, will work better once the canvasContainer
    //has a slightly more defined set of css settings
    Application.prototype.getCanvasRectangle = function (dom) {
        dom = dom || this.canvasContainer;

        var outerRect = this.div[0].getBoundingClientRect();
        var innerRect = dom[0].getBoundingClientRect();
        return {
            width: innerRect.width || outerRect.width || window.innerWidth - 200,
            height: innerRect.height || outerRect.height || window.innerHeight
        };
    };

    Application.prototype.createToolbar = function (div) {
        div = div || this.div;
        var menu, submenu;
        var self = this;
        this.toolbar = new Toolbar(this.config.useTouch());

        var leftList = this.toolbar.ul_Left;
        var rightList = this.toolbar.ul_Right;

        function isKeyEvent(e) {
            return e.type.indexOf("key") === 0;
        }

        if (this.config.get("showPickTool")) {
            this.toolbar.addButton("pick", function (e) {
                self.toolbar.setButtonHighlight("pick", true);
                self.view.pickTool();
                if (isKeyEvent(e)) {
                    self.showKeyboardCursor();
                }
            }, leftList, 'Pick');
        }
        if (!this.config.hasMenu()) {
            if (this.config.get("showDeleteButton")) {
                this.toolbar.addButton('delete', __bind(function (e) {
                    return this.eventSource.emit("menu.delete");
                }, this), leftList, 'Delete');
            }
            if (this.config.get("showUndoRedo")) {
                this.toolbar.addButton('undo', __bind(function (e) {
                    return this.eventSource.emit("menu.undo");
                }, this), leftList, 'Undo');
                this.toolbar.addButton('redo', __bind(function (e) {
                    return this.eventSource.emit("menu.redo");
                }, this), leftList, 'Redo');
            }
            if (this.config.get("showCopyPaste")) {
                this.toolbar.addButton('copy', __bind(function (e) {
                    return this.eventSource.emit("menu.copy");
                }, this), leftList, 'Copy');
                this.toolbar.addButton('paste', __bind(function (e) {
                    return this.eventSource.emit("menu.paste");
                }, this), leftList, 'Paste');
            }
        }
        
        if (this.config.get("showPropertyPanel")) {
            this.toolbar.addButton('edit', __bind(function (e) {
                return this.eventSource.emit("menu.edit");
            }, this), leftList, 'Options');
        }        
        if (this.config.get("showSquareTool")) {
            this.toolbar.addButton('box', function (e) {
                self.toolbar.clearHighlights();
                self.newRect();
                if (isKeyEvent(e)) {
                    self.startMovingWithKeyboard();
                }
            }, rightList, 'Box');
        }
        if (this.config.get("showCircleTool")) {
            this.toolbar.addButton('circle', function (e) {
                self.toolbar.clearHighlights();
                self.newCircle();
                if (isKeyEvent(e)) {
                    self.startMovingWithKeyboard();
                }
            }, rightList, 'Circle');
        }
        if (this.config.showBrushTool()) {
            this.toolbar.addButton("brush", function (e) {
                self.toolbar.setButtonHighlight("brush", true);
                self.view.drawBrushTool();
                if (isKeyEvent(e)) {
                    self.showKeyboardCursor();
                }
            }, rightList, 'Brush');
        }
        if (this.config.get("showLineTool")) {
            this.toolbar.addButton("line", function (e) {
                self.toolbar.setButtonHighlight("line", true);
                self.view.lineTool();
                if (isKeyEvent(e)) {
                    self.showKeyboardCursor();
                }
            }, rightList, 'Line');
        }
        if (this.config.get("showCurveTool")) {
            this.toolbar.addButton("curve", function (e) {
                self.toolbar.setButtonHighlight("curve", true);
                self.view.curveTool();
                if (isKeyEvent(e)) {
                    self.showKeyboardCursor();
                }
            }, rightList, 'Curve');
        }
        if (this.config.get("showArrowTool")) {
            this.toolbar.addButton("arrow", function (e) {
                self.toolbar.setButtonHighlight("arrow", true);
                self.view.arrowTool();
                if (isKeyEvent(e)) {
                    self.showKeyboardCursor();
                }
            }, rightList, 'Arrow');
        }
        if (this.config.get("showTextTool")) {
            this.toolbar.addButton('text', __bind(function (e) {
                this.toolbar.clearHighlights();
                this.newText();
                if (isKeyEvent(e)) {
                    self.showKeyboardCursor(true);
                }
            }, this), rightList, 'Text');
        }
        //Hiding Math Tool until we resolve Math Editor Reload function.
        /*if (this.config.get("showMathTool")) {
            this.toolbar.addButton('math', __bind(function (e) {
                this.toolbar.clearHighlights();
                return this.newMathML("");
            }, this), rightList, 'Math');
        }*/
        this.toolbar.setButtonHighlight("pick", true);
        if (this.config.getOption("showImageTool")) {
            this.toolbar.addButton('pick', __bind(function (e) {
                return this.newImage("logo.png");
            }, this, rightList));
        }

        div.prepend(this.toolbar.div);
        menu = new Menu();
        submenu = new Menu();
        submenu.addItem("New", "menu.new");
        menu.addSubmenu("File", submenu);
        submenu = new Menu();
        submenu.addItem("Undo\tCtrl+Z", "menu.undo");
        submenu.addItem("Redo\tCtrl+Shift+Z", "menu.redo");
        submenu.addSeparator();
        submenu.addItem("Cut\tCtrl+X", "menu.cut");
        submenu.addItem("Copy\tCtrl+C", "menu.copy");
        submenu.addItem("Paste\tCtrl+V", "menu.paste");
        submenu.addItem("Duplicate\tCtrl+D", "menu.duplicate");
        submenu.addSeparator();
        submenu.addItem("Delete\tDel", "menu.delete");
        menu.addSubmenu("Edit", submenu);
        submenu = new Menu();
        submenu.addItem("Raise", "menu.moveUp");
        submenu.addItem("Lower", "menu.moveDown");
        submenu.addItem("Raise to front", "menu.bringToFront");
        submenu.addItem("Send to back", "menu.sendToBack");
        submenu.addSeparator();
        submenu.addItem("Group", "menu.group");
        submenu.addItem("Break apart group", "menu.ungroup");
        menu.addSubmenu("Arrange", submenu);
        submenu = new Menu();
        submenu.addItem("No Outline", "menu.outline-none");
        submenu.addItem("Pencil Outline", "menu.outline-pencil");
        submenu.addItem("Pen Outline", "menu.outline-pen");
        submenu.addItem("Marker Outline", "menu.outline-marker");
        submenu.addSeparator();
        submenu.addItem("No shadow", "menu.shadow-none");
        submenu.addItem("Shadow", "menu.shadow");
        submenu.addSeparator();
        submenu.addItem("Draftsman", "menu.sloppiness-draftsman");
        submenu.addItem("Artist", "menu.sloppiness-artist");
        submenu.addItem("Cartoonist", "menu.sloppiness-cartoonist");
        submenu.addItem("Child", "menu.sloppiness-child");
        submenu.addItem("Dizzy", "menu.sloppiness-dizzy");
        menu.addSubmenu("Appearance", submenu);
        submenu = new Menu();
        submenu.addItem("Arial", "menu.font.Arial");
        submenu.addItem("Times New Roman", "menu.font.Times New Roman");
        menu.addSubmenu("Font", submenu);
        submenu = new Menu();
        submenu.addItem("Force redraw", "menu.force-redraw");
        submenu.addSeparator();
        submenu.addItem("Rebuild document", "menu.rebuild-doc");
        submenu.addItem("Show/Hide Debug Panel", "menu.toggle-debug");
        submenu.addItem("dump", "menu.dump");
        if (true || "debug" in this.query) {
            menu.addSubmenu("Debug", submenu);
        }
        this.menuBar = new Menubar(menu, this.eventSource);
        this.div.append(this.menuBar.div);
        this.menuBar.moveTo(0, 0);
        this.eventSource.bind("menu.new", __bind(function () {
            return this.newDocument();
        }, this));
        this.eventSource.bind("menu.force-redraw", __bind(function () {
            return this.view.update(true);
        }, this));
        this.eventSource.bind("menu.remove-cookie", __bind(function () {
            return Cookies.remove("cookieid");
        }, this));
        this.eventSource.bind("menu.rebuild-doc", __bind(function () {
            return this.view.doc.rebuild();
        }, this));
        return this.eventSource.bind("menu.toggle-debug", __bind(function () {
            this.showDebug = !this.showDebug;
            Url.setBooleanHashValue("debug", this.showDebug);
            return this._onResize();
        }, this));
    };
    Application.prototype.newRect = function () {
        var bl, br, commands, tl, tr;
        commands = new PathCommands();
        var offset = (++this.objectCounter) * 5;
        tl = this.view.snap(new Point(100 + offset, 100 + offset));
        tr = this.view.snap(new Point(200 + offset, 100 + offset));
        br = this.view.snap(new Point(200 + offset, 200 + offset));
        bl = this.view.snap(new Point(100 + offset, 200 + offset));
        commands.moveTo(tl.x, tl.y);
        commands.lineTo(tr.x, tr.y);
        commands.lineTo(br.x, br.y);
        commands.lineTo(bl.x, bl.y);
        commands.lineTo(tl.x, tl.y);
        commands.close();
        this.view.pickTool();
        return this.view.commit([
          new CreateAction("PathNode", {
              "commands": commands.toArray(),
              "fillStyle": this.view.defaultFillStyle,
              "strokeStyle": this.view.defaultStrokeStyle,
              "seed": Math.round(Math.random() * 65535),
              "lineWidth": this.view.defaults["lineWidth"],
              "sloppiness": this.view.defaults["sloppiness"]
          })
        ]);
    };
    Application.prototype.newCircle = function () {
        var offset = (++this.objectCounter) * 5;
        this.view.pickTool();
        return this.view.commit([
          new CreateAction("PathNode", {
              "commands": CreateCirclePath(this.view.snap(new Point(150 + offset, 150 + offset)), 50),
              "fillStyle": this.view.defaultFillStyle,
              "strokeStyle": this.view.defaultStrokeStyle,
              "seed": Math.round(Math.random() * 65535),
              "lineWidth": this.view.defaults["lineWidth"],
              "sloppiness": this.view.defaults["sloppiness"]
          })
        ]);
    };
    Application.prototype.newText = function () {
        this.view.textTool();
    };
    Application.prototype.newImage = function (url) {
        var id, pt, xform;
        id = this.view.doc.peekNextId();
        pt = this.view.snap(new Point(100, 100));
        xform = new TranslateMatrix(pt.x, pt.y);
        return this.view.commit([
          new CreateAction("ImageNode", {
              "url": url
          }), new TransformAction([id], xform, xform.inverse())
        ]);
    };
    //@export Application.prototype.newMathML
    Application.prototype.newMathML = function () {
        var id, xform;
        this.view.pickTool();
        id = this.view.doc.peekNextId();
        var offset = (++this.objectCounter) * 5;
        xform = new TranslateMatrix(100 + offset, 100 + offset);

        var mn = new CreateAction("DomNode", {});
        console.log("Math node?", mn);
        var ret = this.view.commit([
          mn,
          new TransformAction([id], xform, xform.inverse())
        ]);

        console.log("What is the return from the commit action?", ret);
        this.startMathEditor(id, mn.node);
    };
    Application.prototype.findBackgroundImage = function () {
        /* search for the background image in the current document. */this.backgroundImageId = null;
        return this.view.doc.each(false, __bind(function (node) {
            if (node.type() === "ImageNode" && node.getProperty("locked") === true) {
                this.log("Found background image at nodeid %s", node.id);
                return (this.backgroundImageId = node.id);
            }
        }, this));
    };
    Application.prototype.setBackgroundImage = function (url) {
        var actions = [new SetBackgroundAction(url)];
        this.view.commit(actions);
        this.view.clearSelection();
        return this.view.doneSelecting();
    };

    Application.prototype.setBackgroundImageFromConfig = function () {
        if (this.config.getOption("backgroundImage")) {
            this.setBackgroundImage(this.config.getOption("backgroundImage"));
        }
    };

    Application.prototype.newDocument = function () {
        return this.setDocument(new ZwibblerDocument());
    };
    Application.prototype._onResize = function () {
        var backgroundSelectorWidth, borderWidth, canvasHeight, colourHeight, colourPanelTop,
            debugPanelWidth, fudge, height, imageSelectorHeight, imageSelectorWidth,
            menuHeight, propPanelWidth, sideWidth, toolbarWidth, width;
        fudge = 5;
        width = this.div.width() - fudge;
        height = this.div.height() - fudge;
        if (width === this.oldWidth && height === this.oldHeight) {
            return;
        }
        this.oldWidth = width;
        this.oldHeight = height;
        toolbarWidth = this.toolbar.width();
        borderWidth = 4;
        menuHeight = this.menuBar.height();
        if (this.config.hasMenu()) {
            this.menuBar.show();
            this.menuBar.moveTo(0, 0);
            this.menuBar.width(width);
        } else {
            this.menuBar.hide();
            menuHeight = 0;
        }
        if (this.config.getOption("showBackgroundSelector")) {
            backgroundSelectorWidth = 100;
            this.backgroundSelector.show();
        } else {
            backgroundSelectorWidth = 0;
            this.backgroundSelector.hide();
        }
        if (this.config.getOption("showImageSelector")) {
            imageSelectorHeight = 100;
            this.imageSelector.show();
        } else {
            imageSelectorHeight = 0;
            this.imageSelector.hide();
        }

        //this.toolbar.moveTo(backgroundSelectorWidth, menuHeight);

        if (this.config.showColourPanel()) {
            this.colourPanel.show();
            colourHeight = this.colourPanel.height();
        } else {
            this.colourPanel.hide();
            colourHeight = 0;
        }
        colourPanelTop = height - colourHeight;
        sideWidth = 0;
        propPanelWidth = 0;
        debugPanelWidth = 0;
        if (this.showDebug) {
            debugPanelWidth = this.debugPanel.width();
        }
        if (this.config.showPropertyPanel()) {
            propPanelWidth = 300;
        }
        sideWidth += propPanelWidth + debugPanelWidth;
        imageSelectorWidth = width - 2 * borderWidth - backgroundSelectorWidth - sideWidth;
        canvasHeight = height - 2 * borderWidth - colourHeight - menuHeight - imageSelectorHeight;
        this.backgroundSelector.width(backgroundSelectorWidth);
        this.backgroundSelector.height(height - 2 * borderWidth - menuHeight - colourHeight);
        this.backgroundSelector.moveTo(0, menuHeight);
        this.imageSelector.width(imageSelectorWidth);
        this.imageSelector.height(imageSelectorHeight);
        this.imageSelector.moveTo(backgroundSelectorWidth, height - 2 * borderWidth - colourHeight - imageSelectorHeight);


        this.colourPanel.moveTo(0, colourPanelTop);
        this.colourPanel.setWidth(width);
        this.colourPanel.draw();
        if (this.showDebug) {
            this.debugPanel.show();
            this.debugPanel.moveTo(width - debugPanelWidth, menuHeight);
            this.debugPanel.height($(window).height() | 0);
        } else {
            this.debugPanel.hide();
        }

        this.view.draw();
    };

    /**
    Setup up the keyboard monitoring. Called once when the Application object is
    created.
    */
    Application.prototype.setupKeyboardSupport = function () {
        var self = this;

        // whether the toolbar has the virtual focus.
        this.toolbarInFocus = false;

        this.keymap = new KeyboardMap();

        // configure the keymap with the keyboard commands and the names of the
        // actions that they trigger.
        this.keymap.map("left", "left");
        this.keymap.map("right", "right");
        this.keymap.map("up", "up");
        this.keymap.map("down", "down");
        this.keymap.map("esc", "select-none");
        this.keymap.map("esc", "cancel");
        this.keymap.map("home", "bring-to-front");
        this.keymap.map("end", "send-to-back");
        this.keymap.map("pageup", "move-up");
        this.keymap.map("pagedown", "move-down");
        this.keymap.map("ctrl+d", "duplicate");
        this.keymap.map("delete,backspace", "delete");
        this.keymap.map("c,C", "curve-tool");
        this.keymap.map("l,L", "line-tool");
        this.keymap.map("ctrl+shift+g", "ungroup");
        this.keymap.map("ctrl+g", "group");
        this.keymap.map("ctrl+z", "undo");
        this.keymap.map("ctrl+shift+z", "redo");
        this.keymap.map("ctrl+x", "cut");
        this.keymap.map("ctrl+c", "copy");
        this.keymap.map("ctrl+v", "paste");
        /*Allow zoom in zoom out in Itempreiview using Zoom buttons
        this.keymap.map("=", "zoom-1-1");
        this.keymap.map("+,shift+=", "zoom-in");
        this.keymap.map("-", "zoom-out");
        */
        // for the toolbar
        this.keymap.map("left,up", "previous");
        this.keymap.map("down,right", "next");
        this.keymap.map("enter", "enter");

        // when an action is triggered, forward it to the view.
        this.keymap.on("*", function (action, e) {
            if (self.isReadOnly()) {
                return;
            }

            //Bug: 115745 shortcuts and key events on property window elements should not be propagated
            var targetEl = e.target || e.srcElement;
            if (targetEl.tagName.toLowerCase() === 'div') {
                if (self.toolbarInFocus) {
                    self.toolbar.onKeyCommand(action, e);
                } else {
                    self.view.onKeyCommand(action, e);
                }
            }
        });

        // ensure our div has a tabindex. when it is in focus, we will interpret
        // the keyboard commands.
        this.div.attr("tabindex", "-1");

        this.div.on("focus", function (e) {
            self.log("Got keyboard focus");
        });

        this.div.on("blur", function (e) {
            self.log("Lost keyboard focus");
        });

        this.keymap.attachTo(this.div[0]);

        // When anthing inside our container is clicked, then give us the keyboard
        // focus.
        this.canvas.click(function (e) {
            self.focus(false);
        });
        this.toolbar.div.click(function (e) {

            self.focus(true);
        });
        this.colourPanel.on("colour", function (colour) {
            self.focus(false);
        });

        // when the user presses escape in certain situations, we return to the
        // toolbar.
        this.eventSource.on("goto-toolbar", function () {
            self.focus(true);
        });

        this.eventSource.on("goto-canvas", function () {
            self.focus(false);
        });
    };

    /** 
    Grab the keyboard focus. If toolbar is true, the
    toolbar is given the focus. Otherwise, the canvas has the focus.
    
    @param {boolean} toolbar
    */
    Application.prototype.focus = function (toolbar) {
        // on some browsers, giving focus to an element scrolls to that element
        // this is useful for elements which you tab into, but in our case the
        // Application will only recieve focus on a click event on the canvas or
        // div, and the scrolling is not wanted (bug 126539)
        var container = $('.theQuestions'),
            scrollTop = container.scrollTop();

        this.toolbarInFocus = toolbar;

        if (this.toolbarInFocus) {
            this.toolbar.focus();
            this.view.hideKeyboardCursor();
        } else {
            this.toolbar.blur();
        }
        this.div.focus();

        container.scrollTop(scrollTop);
    };

    /**
    Called when a shape is clicked on the toolbar. Immediately set the focus to
    the canvas and begin moving the shape with the cursor keys.
    */
    Application.prototype.startMovingWithKeyboard = function () {
        this.focus(false);
        this.view.showKeyboardCursorAndStartMoving();
    };

    /**
    Move fake focus to the canvas and show the keyboard cursor.
    @param {boolean=} caret
    */
    Application.prototype.showKeyboardCursor = function (caret) {
        this.focus(false);
        this.view.showKeyboardCursor(caret);
    };

    /*//@export Application.prototype.emit*/
    Application.prototype.emit = function (name, data) {
        return this.eventSource.emit(name, data);
    };
    Application.prototype.saveAsList = function () {
        return ZwibblerDocument.exportAsList(this.view.doc.root);
    };
    Application.prototype.saveAsDataUrl = function () {
        var canvas, ctx, rect;
        rect = this.view.doc.getRect();
        canvas = $("<canvas>");
        canvas.attr("width", "" + rect.width);
        canvas.attr("height", "" + rect.height);
        ctx = canvas[0].getContext("2d");
        ctx.translate(-rect.x, -rect.y);
        this.view.doc.draw(ctx);
        return canvas[0].toDataURL();
    };
    Application.prototype.loadFromList = function (list) {
        return ZwibblerDocument.importFromList(list, this.view.doc);
    };
    /**
    @param {ZwibblerContext} zwibblerContext
    */
    Application.prototype.setZwibblerContext = function (zwibblerContext) {
        this.zwibblerContext = zwibblerContext;
        this.view.zwibblerContext = zwibblerContext;
        if (this.toolbar) {
            this.toolbar.zwibblerContext = zwibblerContext;
        }
    };

    Application.prototype.startMathEditor = function (id, mn) {
        this.log("Starting equation editor");        
        //mn is undefined
        //find the node associated with id
        if (typeof mn === 'undefined') {
            //pass node info so we have data accessible for dialog, check node exists else create new
            var node = this.view.doc.getNode(id);
            if (typeof node === 'undefined')
                this.app.newMathML();
            else
                this.startMathEditor(id, node);
        } else {
            this.zwibblerContext.emit("math.edit", id, mn);
        }
    };

    Application.prototype.setItemProperty = function (id, property, value) {
        this.log("External app setItemProperty %s: %s=%s", id, property, value);
        this.view.commit([new SetAction([id], property, value)]);
    };
    Application.prototype.getItemProperty = function (id, property) {
        var node, value;
        node = this.view.doc.getNode(id);
        value = 0;
        if (node) {
            value = node.getProperty(property);
        }
        this.log("GetItemProperty %s: %s=%s", id, property, value);
        return value;
    };

    Application.prototype.isReadOnly = function () {
        return this.zwibblerContext && this.zwibblerContext.isReadOnly();
    }
    /*
    Zwibbler
    
    Copyright 2013 Hanov Solutions Inc. All Rights Reserved. This software is
    NOT open source. For licensing information, contact the author.
    
    steve.hanov@gmail.com
    */
    /**
    Copyright 2010 Hanov Solutions Inc. All Rights Reserved
    
    steve.hanov@gmail.com
    */

    /*jslint sub: true */
    /*jslint evil: true */
    //#include <misc.js>
    //#include <jquery.lite.js>
    //#include <Application.js>
    //#include <ZwibblerContext.js>
    //#include <xml2jsonv2.js>

    /**
    This is the "main" file of Zwibbler. It adds the Zwibbler API functions to
    the window object.
    */
    if ("jQuery" in window) {
        /** @this {jQuery} */
        window["jQuery"].fn["zwibbler"] = function (options) {
            options = options || {};
            var context = null;
            this.each(function (i, elem) {
                if (elem["zwibbler"]) {
                    $(elem).empty();
                }
                var app = new Application($(elem), options);
                elem["zwibbler"] = new ZwibblerContext(app);
                context = elem["zwibbler"];
            });
            return context;
        };

        /** @this {jQuery} */
        window["jQuery"].fn["zwibblerContext"] = function () {
            return this[0]["zwibbler"];
        };
    }

    // Here is another way of accessing zwibbler for those who don't want to use
    // jQuery.
    var Zwibbler = {
        create: function (id, options) {
            var div = document.getElementById(id);
            if (div === null) {
                console.error("Zwibbler.create: Cannot find an element with id " + id);
                return null;
            }

            var app = new Application($(div),
                    window["Zwibbler"]["parseConfig"](options));
            var context = new ZwibblerContext(app);
            return context;
        },

        /**
        Here is a function to parse a configuration into a JSON object.
        @param {string|Object} config
        */
        parseConfig: function (config) {
            // if it's a string, try parsing it as JSON. Otherwise, try parsing it
            // as XML. If It's an object, then just return it unchanged.
            var object = {};
            if (typeof config === "string") {
                try {
                    object = JSON.parse(config);
                } catch (e) {
                    if (config) {
                        object = JSON.parse(xml2jsonv2(parseXml(config), ""));
                        if ("scratchpad" in object) {
                            object = object["scratchpad"];
                        }
                    }
                }
            } else {
                object = config;
            }
            return object;
        }
    };

    // export the above
    window["Zwibbler"] = Zwibbler;
    Zwibbler["create"] = Zwibbler.create;
    Zwibbler["parseConfig"] = Zwibbler.parseConfig;

    /*
    window.addEventListener("error", function(err) {
    console.log(err);
    }, false);
    */
    /**
    *  This is the instance that determines the type of content to create
    */

    //#include <driver.js>


    /**
    *  Setup so it is a bit easier to determine the instance types we want to create
    */
    var ScratchPad = {};

    window['ScratchPad'] = ScratchPad; //REQUIRED to export to global namespace when using the closure compiler

    //@export ScratchPad.Factory
    //@export ScratchPad.Factory.getInstance
    ScratchPad.Factory = {
        Instance: null,
        Sequence: { id: 0 },
        getInstance: function () {
            if (!ScratchPad.Factory.Instance) {
                ScratchPad.Factory.Instance = new ScratchPad.ZwibblerFactory();
            }
            return ScratchPad.Factory.Instance;
        },
        setInstance: function (impl) {
            ScratchPad.Factory.Instance = impl;
        }
    };

    /**
    *  @constructor
    *  This is the class that will default to building Zwibbler/ZwibblerFactory Items
    */
    var ZwibblerFactory = function () {
        this.Store = {};

        //Where should the scratchpad be appended by default.
        this.targetDom = document.body;
    };

    //@export ScratchPad.ZwibblerFactory
    ScratchPad.ZwibblerFactory = ZwibblerFactory;

    /**
    *  Creates a new scratchpad instance.
    *  The configuration is a string of xml.
    */
    ZwibblerFactory.prototype.createScratchPad = function (id, configuration) {
        id = id || 'ScratchPad_' + (++ScratchPad.Factory.Sequence.id);
        var zwibbler = Zwibbler.create(this.assureDomExists(id), configuration);
        if (zwibbler) {
            zwibbler.setInstanceId(id);
        }
        return zwibbler;
    };

    /**
    @param {HTMLElement=} pNode
    */
    ZwibblerFactory.prototype.assureDomExists = function (id, pNode) {
        if (!id) { return; }

        pNode = pNode || this.targetDom || document.body;

        var dom = document.getElementById(id);
        if (!dom && pNode) {
            dom = document.createElement('div');
            dom.id = id;
            pNode.appendChild(dom);
        }
        dom.className += ' sp_container';
        return id;
    };

    /**
    *  Lookup a scratchpad by the id and return it, create it if needed.
    */
    //@export ZwibblerFactory.prototype.getGlobalScratchPad
    ZwibblerFactory.prototype.getGlobalScratchPad = function () {
        return this.getScratchPadById('global_scratchpad');
    };

    //@export ZwibblerFactory.prototype.getOrCreateScratchPadById
    /**
    @param {string=} configuration
    */
    ZwibblerFactory.prototype.getOrCreateScratchPadById = function (id,
            configuration) {
        if (!id) { return; }
        configuration = configuration || "";
        try {
            if (!this.Store[id]) {
                this.Store[id] = this.createScratchPad(id, configuration);
            }
            return this.Store[id];
        } catch (e) {
            console.error('Failed to create a new instance (id, e)', id, e);
        }
        return this.Store[id];
    };

    //@export ZwibblerFactory.prototype.getScratchPadById
    ZwibblerFactory.prototype.getScratchPadById = function (id) {
        try {
            if (!id) { return; }
            return this.Store[id];
        } catch (e) {
            console.error('Failed to initialize or find a new Scratchpad (id, e)', id, e);
        }
    };




    ScratchPad["Factory"] = ScratchPad.Factory;
    ScratchPad.Factory["getInstance"] = ScratchPad.Factory.getInstance;
    ScratchPad["ZwibblerFactory"] = ScratchPad.ZwibblerFactory;
    ZwibblerFactory.prototype["getGlobalScratchPad"] = ZwibblerFactory.prototype.getGlobalScratchPad;
    ZwibblerFactory.prototype["getOrCreateScratchPadById"] = ZwibblerFactory.prototype.getOrCreateScratchPadById;
    ZwibblerFactory.prototype["getScratchPadById"] = ZwibblerFactory.prototype.getScratchPadById;
    ZwibblerContext.prototype["enableConsoleLogging"] = ZwibblerContext.prototype.enableConsoleLogging;
    ZwibblerContext.prototype["on"] = ZwibblerContext.prototype.on;
    ZwibblerContext.prototype["newDocument"] = ZwibblerContext.prototype.newDocument;
    ZwibblerContext.prototype["save"] = ZwibblerContext.prototype.save;
    ZwibblerContext.prototype["load"] = ZwibblerContext.prototype.load;
    ZwibblerContext.prototype["setBackgroundBrowserImages"] = ZwibblerContext.prototype.setBackgroundBrowserImages;
    ZwibblerContext.prototype["setIconBrowserImages"] = ZwibblerContext.prototype.setIconBrowserImages;
    ZwibblerContext.prototype["resize"] = ZwibblerContext.prototype.resize;
    ZwibblerContext.prototype["dirty"] = ZwibblerContext.prototype.dirty;
    ZwibblerContext.prototype["setItemProperty"] = ZwibblerContext.prototype.setItemProperty;
    ZwibblerContext.prototype["setImage"] = ZwibblerContext.prototype.setImage;
    ZwibblerContext.prototype["getItemProperty"] = ZwibblerContext.prototype.getItemProperty;
    ZwibblerContext.prototype["setDomElement"] = ZwibblerContext.prototype.setDomElement;
    ZwibblerContext.prototype["getInstanceId"] = ZwibblerContext.prototype.getInstanceId;
    Application.prototype["newMathML"] = Application.prototype.newMathML;
    Application.prototype["emit"] = Application.prototype.emit;
    window["Dialog"] = Dialog;
    Dialog["emit"] = Dialog.emit;
    Dialog["current"] = Dialog.current;
    DomNode.prototype["setElement"] = DomNode.prototype.setElement;
} ());
