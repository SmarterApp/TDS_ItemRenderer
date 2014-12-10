/*
Utilities used for content manager or widgets. 
*/
(function (CM) {
    
    // get element by id but check if it is in parent el
    CM.getElementById = function (id, obj) {
        var el = document.getElementById(id);
        var parentEl;
        if (parent instanceof ContentPage ||
            parent instanceof ContentEntity) {
            parentEl = parent.getElement();
        } else if (Util.Dom.isElement(parent)) {
            parentEl = parent;
        } else {
            parentEl = document;
        }
        if (parentEl == document || parentEl.contains(el)) {
            return el;
        }
        return null;
    }

    CM.getEventXY = function (domEvent, clickXY) {
        var element = YUE.getTarget(domEvent);
        if (!clickXY) {
            clickXY = YUE.getXY(domEvent);
        }

        // check if the elements document is contained in an iframe
        while (Util.Dom.getWindow(element.ownerDocument).frameElement &&
            !Util.Dom.getWindow(element.ownerDocument).its) {
            element = Util.Dom.getWindow(element.ownerDocument).frameElement;

            var elementXY = YUD.getXY(element);

            clickXY[0] = clickXY[0] + elementXY[0];
            clickXY[1] = clickXY[1] + elementXY[1];
        }

        return clickXY;
    };

    // turn java string object into js string
    CM.getJavaString = function (value) {
        if (value != null && typeof (value) == 'object') {
            value = new String(value).toString();
        }

        return value;
    };

    CM.focus = function (obj) {
        if (CM.enableARIA) {
            return false;
        }
        return Util.Dom.focus(obj);
    };

    CM.blur = function (obj) {
        if (CM.enableARIA) {
            return false;
        }
        return Util.Dom.blur(obj);
    };

    // call this to prevent focus on an element
    CM.preventFocus = function (el) {
        YUE.onFocus(el, function () {
            CM.blur(el);
        });
    };

    // check if an anchor tag is clickable
    CM.isLinkClickable = function (link) {
        var mediaType = link.getAttribute('type');
        if (mediaType == null) {
            return false;
        }

        // check if link has allowed media type
        var supportedMediaTypes = ['application/rtf', 'application/pdf'];
        return (supportedMediaTypes.indexOf(mediaType) != -1);
    };

    CM.getAncestor = Util.Dom.getAncestor;
    CM.isElement = Util.Dom.isElement;
    CM.isVisible = Util.Dom.isVisible;

    CM.isDialogShowing = function () {
        return YUD.hasClass(document.body, 'showingLoading') ||
            YUD.hasClass(document.body, 'showingDialog');
    };

    CM.log = function (message) {
        if (typeof Util == 'object') {
            Util.log(message); // TDS logs
        }
        else if (typeof console == 'object') {
            console.log(message); // firebug logs
        }
    };

    // Does this browser require the Mac OS X secure browser selection hack
    CM.requiresSelectionFix = function () {
        // check if mac and SB is less than 4.0
        return (Util.Browser.isMac() &&
                Util.Browser.getSecureVersion() > 0 &&
                Util.Browser.getSecureVersion() < 4.0);
    };

    // call this function on an iframe that is used in the content (e.x., html editor, simulator)
    CM.fixItemFrame = function (item, win, doc) {

        // add menu fixes to the frame
        CM.Menu.applyDocFix(win);

        // add content manager events into frame
        CM.addMouseEvents(item, doc);
        CM.addKeyEvents(doc);

        // stop right click on regular browsers
        Util.Dom.stopAllEvents(doc, 'contextmenu');

        // BUG #12516: Mac OS X secure browser selection hack
        if (CM.requiresSelectionFix()) {
            YUE.addListener(doc, 'mousedown', function (e) {
                CM.focus(top);
            });

            YUE.addListener(doc, 'mouseup', function (e) {
                CM.focus(win);
            });
        }

        var page = item.getPage();

        // add accommodations
        var pageAccommodations = page.getAccommodations();
        pageAccommodations.applyCSS(doc.body);

        // add zoom
        var zoom = page.getZoom();
        zoom.addDocument(doc);
        zoom.refresh();
    };

    // sets event handlers which disable input when the item is in a read only state
    CM.setReadOnlyKeyEvent = function (item, input) {
        // check for read-only
        var readOnlyFunc = function (evt) {
            if (item.isReadOnly()) {
                YUE.stopEvent(evt);
            }
        };

        YUE.on(input, 'keypress', readOnlyFunc);
        YUE.on(input, 'mousedown', readOnlyFunc);
    };

    // create a DOM range (using rangy)
    CM.createRange = function (doc) {
        if (typeof window.rangy == 'object') {
            try {
                return window.rangy.createRange(doc);
            } catch (ex) {
            }
        }
        return null;
    };

    // get the mouse selection (using rangy)
    CM.getSelection = function (doc) {
        if (typeof window.rangy == 'object') {
            try {
                return window.rangy.getSelection(doc);
            } catch (ex) {
            }
        }
        return null;
    };

    // adds the forceRedraw class and then removes it
    CM.applyRedrawFix = function () {

        // both calls need to be in a timer to be reliable
        setTimeout(function () {

            // apply fix
            // console.log('forceRedraw: add');
            YUD.addClass(document.body, 'forceRedraw');

            setTimeout(function () {
                // remove fix
                // console.log('forceRedraw: remove');
                YUD.removeClass(document.body, 'forceRedraw');
            }, 0);

        }, 0);

    };

    // Listen for when an input has focus. This can be used for
    // fixing tablets that open up keyboard.
    CM.listenForFocus = function (doc) {

        var focused = false;

        var setFocused = function () {
            // console.log('inputFocus: add');
            YUD.addClass(document.body, 'inputFocus');
            focused = true;
        };

        var setBlurred = function () {
            // console.log('inputFocus: remove');
            YUD.removeClass(document.body, 'inputFocus');
            focused = false;
        };

        YUE.onFocus(doc, function (ev) {

            if (Util.Event.inTextInput(ev)) {

                var targetEl = YUE.getTarget(ev);

                // check if autocorrect is disabled
                if (YUD.getAttribute(targetEl, 'autocorrect') != 'off') {
                    YUD.setAttribute(targetEl, 'autocorrect', 'off');
                    YUD.setAttribute(targetEl, 'autocapitalize', 'off');
                    YUD.setAttribute(targetEl, 'autocomplete', 'off');
                }

                CM.applyRedrawFix();
                setFocused();
            }
        });

        YUE.onBlur(doc, function (ev) {
            setBlurred();
        });

        var win = Util.Dom.getWindow(doc);

        // if when scrolling we notice the active element is not a text area then remove focus
        YUE.on(win, 'scroll', function (ev) {
            if (focused && !Util.Dom.isTextInput(document.activeElement)) {
                setBlurred();
            }
        });

    };

    /***************/
    /* YUI HELPERS */
    /***************/

    // YUI DOM HELPER METHOD: If the className exists on the node it is removed, if it doesn't exist it is added.
    YUD.toggleClass = function (node, className, force) {
        var add = (force !== undefined) ? force : !(YUD.hasClass(node, className));
        if (add) {
            YUD.addClass(node, className);
        } else {
            YUD.removeClass(node, className);
        }
    };


})(ContentManager);
