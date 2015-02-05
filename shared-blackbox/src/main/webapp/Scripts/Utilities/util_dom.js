// REQUIRES: NONE

(function(Util) {

    var D = {};

    // get the Document class (on IE < 11 there is no HTMLDocument)
    var DocClass = window.HTMLDocument || window.Document;

    // check if an object is a document
    D.isDocument = function (obj) {
        return (obj instanceof DocClass ||
                Object.prototype.toString.call(obj) == "[object HTMLDocument]");
    };

    // get the window for a document
    D.getWindow = function(doc) {
        if (doc) {
            return (doc.defaultView || doc.parentWindow);
        }
        return null;
    };

    // Cross-browser function for getting the document element of a frame or iframe.
    D.getFrameContentDocument = function(frame) {
        if (frame) {
            if (YAHOO.env.ua.webkit) {
                return (frame.document || frame.contentWindow.document);
            } else {
                return (frame.contentDocument || frame.contentWindow.document);
            }
        }
        return null;
    };

    // Cross-browser function for getting the window of a frame or iframe.
    D.getFrameContentWindow = function(frame) {
        if (frame) {
            return (frame.contentWindow || this.getWindow(this.getFrameContentDocument(frame)));
        }
        return null;
    };

    /**
    * Returns the owner document for a node.
    * @param {Node|Window} node The node to get the document for.
    * @return {!Document} The document owning the node.
    */
    D.getOwnerDocument = function (node) {
        return (node.nodeType == NODE_TYPE.DOCUMENT ? node :
                node.ownerDocument || node.document);
    };

    D.getOwnerWindow = function(node) {
        var doc = D.getOwnerDocument(node);
        return doc ? D.getWindow(doc) : null;
    };
    
    // copy the document body css to frame body
    D.copyCSSFrame = function(frameID) {

        var frame = YUD.get(frameID);
        if (frame == null || frame.src == '') {
            return false;
        }

        // ignore empty frame
        if (frame.contentDocument == null || frame.contentDocument.body == null) {
            return false;
        }

        // ignore empty content
        frame.contentDocument.body.className = document.body.className; // update CSS
        return true;
    };

    // check if this element is current showing (this does not take into account if it is visible on the screen due to scroll though)
    D.isVisible = function (node) {

        // get node
        node = YUD.get(node);

        // check if valid object
        if (!node) {
            return false;
        }

        // keep looping through parent nodes to make sure none are hidden until we reach the body
        while (node && (node.nodeName.toLowerCase() != 'body') && (YUD.getStyle(node, 'display') != 'none') && (YUD.getStyle(node, 'visibility') != 'hidden')) {
            node = node.parentNode;
        }

        // if we made it to the body then everything was visible
        if (node && node.nodeName.toLowerCase() == 'body') {
            return true;
        } else {
            return false;
        }
    };

    // get all focusable elements in an element
    // NOTE: Just use $(":focusable")
    D.getFocusableElements = function(root) {
        root = root || this.innerElement;

        var focusableTags = [
            "a",
            "button",
            "select",
            "textarea",
            "input",
            "iframe"
        ];

        var focusable = {};

        for (var i = 0; i < focusableTags.length; i++) {
            focusable[focusableTags[i]] = true;
        }

        function isFocusable(el) {
            if (el.focus && el.type !== "hidden" && !el.disabled && focusable[el.tagName.toLowerCase()]) {
                return true;
            }

            return false;
        }

        // Not looking by Tag, since we want elements in DOM order
        return YUD.getElementsBy(isFocusable, null, root);
    };

    // returns true if element is a form element
    D.isFormElement = function(el) {
        if (el.nodeType == 3 /*TEXT_NODE*/) {
            el = el.parentNode;
        }
        return " button textarea input select option ".indexOf(" " + el.tagName.toLowerCase() + " ") >= 0;
    };
    
    D.focus = function(obj) {
        if (!obj || typeof (obj.focus) != 'function') {
            return false;
        }

        try {
            obj.focus();
        } catch (ex) {
            return false;
        } // IE throws error if frame is hidden

        return true;
    };

    D.blur = function(obj) {
        if (!obj || typeof (obj.blur) != 'function') {
            return false;
        }
        try {
            obj.blur();
        } catch (ex) {
            return false;
        }
        return true;
    };

    // a helper function for focusing on the current window
    D.focusWindow = function(delay) {
        if (YAHOO.lang.isNumber(delay)) {
            setTimeout(function() {
                D.focus(window);
            }, delay);
        } else {
            D.focus(window);
        }
    };

    // check if an element (needle) is a child of an array of DOM elements (haystacks)
    D.getAncestor = function(needle, haystacks) {
        if (needle == null || haystacks == null) {
            return false;
        }

        var isMatch = function(element) {
            for (var i = 0; i < haystacks.length; i++) {
                var haystack = haystacks[i];
                if (haystack == element) {
                    return true;
                }
            }

            return false;
        };

        if (isMatch(needle)) {
            return needle;
        }

        var element = null;

        try {
            element = YUD.getAncestorBy(needle, function(ancestor) {
                return isMatch(ancestor);
            });
        } catch (ex) {
        } // Permission denied to access property 'parentNode' from a non-chrome context

        return element;
    };

    // check if object is a DOM element
    D.isNode = function (o) {
        return (
            typeof Node === 'function' ? o instanceof Node :
            o && typeof o === 'object' && typeof o.nodeType === 'number' && typeof o.nodeName === 'string'
        );
    };

    D.isElement = function (o) {
        return (
            typeof HTMLElement === 'function' ? o instanceof HTMLElement : //DOM2
            o && typeof o === 'object' && o.nodeType === 1 && typeof o.nodeName === 'string'
        );
    };

    // input types that represent text input 
    // http://www.w3schools.com/tags/att_input_type.asp
    var TEXT_TYPES = {
        'text': 1,
        'password': 1
    };

    // is this element a text area (<input>, <textarea>, "html editor")?
    D.isTextInput = function(el) {

        // check valid element
        if (!el) {
            return false;
        }

        // check if textarea
        if (el.tagName && el.tagName.toLowerCase() == 'textarea') {
            return true;
        }

        // check if input text type
        if (el.tagName && el.tagName.toLowerCase() == 'input' && TEXT_TYPES[el.type]) {
            return true;
        }

        // check if element is content editable (old way)
        if (el.contentEditable == '' ||
            el.contentEditable == 'true') {
            return true;
        }

        // check if element is content editable (new way)
        if (el.isContentEditable) {
            return true;
        }

        var doc = D.getOwnerDocument(el);

        if (doc) {

            // check if contenteditable
            if (doc.designMode == 'on') {
                return true;
            }

            // check if explicitly set as allowing text input
            if (YUD.getAttribute(doc.body, 'data-tds-textinput') == 'true') {
                return true;
            }
        }

        return false;
    };

    // check if an image is loaded
    D.isImgLoaded = function(img) {
        if (!img.complete) {
            return false;
        }

        if (typeof img.naturalWidth != 'undefined' && img.naturalWidth == 0) {
            return false;
        }

        return true;
    };

    var NODE_TYPE = D.NodeType = {
        ELEMENT: 1,
        ATTRIBUTE: 2,
        TEXT: 3,
        CDATA_SECTION: 4,
        ENTITY_REFERENCE: 5,
        ENTITY: 6,
        PROCESSING_INSTRUCTION: 7,
        COMMENT: 8,
        DOCUMENT: 9,
        DOCUMENT_TYPE: 10,
        DOCUMENT_FRAGMENT: 11,
        NOTATION: 12
    };

    /**
    * Removes a node from its parent.
    * @param {Node} node The node to remove.
    * @return {Node} The node removed if removed; else, null.
    */
    D.removeNode = function(node) {
        return node && node.parentNode ? node.parentNode.removeChild(node) : null;
    };

    /**
    * Removes all the child nodes on a DOM node.
    * @param {Node} node Node to remove children from.
    */
    D.removeChildren = function(node) {
        // Note: Iterations over live collections can be slow, this is the fastest
        // we could find. The double parenthesis are used to prevent JsCompiler and
        // strict warnings.
        var child;
        while ((child = node.firstChild)) {
            node.removeChild(child);
        }
    };

    /**
    * Map of attributes that should be set using
    * element.setAttribute(key, val) instead of element[key] = val.  Used
    * by Util.Dom.setProperties.
    *
    * @type {Object}
    * @private
    */
    var DIRECT_ATTRIBUTE_MAP = {
        'cellpadding': 'cellPadding',
        'cellspacing': 'cellSpacing',
        'colspan': 'colSpan',
        'rowspan': 'rowSpan',
        'valign': 'vAlign',
        'height': 'height',
        'width': 'width',
        'usemap': 'useMap',
        'frameborder': 'frameBorder',
        'maxlength': 'maxLength',
        'type': 'type'
    };

    /**
    * Sets multiple properties on a node.
    * @param {Element} element DOM node to set properties on.
    * @param {Object} properties Hash of property:value pairs.
    */
    D.setProperties = function(element, properties) {
        for (key in properties) {
            var val = properties[key];

            if (key == 'style') {
                element.style.cssText = val;
            } else if (key == 'class') {
                element.className = val;
            } else if (key == 'for') {
                element.htmlFor = val;
            } else if (key.lastIndexOf('aria-', 0) == 0) // startsWith
            {
                element.setAttribute(key, val);
            } else if (key in DIRECT_ATTRIBUTE_MAP) {
                element.setAttribute(DIRECT_ATTRIBUTE_MAP[key], val);
            } else {
                element[key] = val;
            }
        }
    };

    /**
    * Cross-browser function for setting the text content of an element.
    * @param {Element} element The element to change the text content of.
    * @param {string} text The string that should replace the current element
    *     content.
    */
    D.setTextContent = function(element, text) {
        if ('textContent' in element) {
            element.textContent = text;
        } else if (element.firstChild && element.firstChild.nodeType == NODE_TYPE.TEXT) {
            // If the first child is a text node we just change its data and remove the
            // rest of the children.
            while (element.lastChild != element.firstChild) {
                element.removeChild(element.lastChild);
            }
            element.firstChild.data = text;
        } else {
            D.removeChildren(element);
            var doc = D.getOwnerDocument(element);
            element.appendChild(doc.createTextNode(text));
        }
    };

    // Sets the specified outer HTML on a element
    // https://github.com/tinymce/tinymce/blob/master/jscripts/tiny_mce/classes/dom/DOMUtils.js
    D.setOuterHTML = function (el, html, doc) {

        function setHTML(el, html, doc) {
            var n, tp;

            tp = doc.createElement("body");
            tp.innerHTML = html;

            n = tp.lastChild;

            while (n) {
                YUD.insertAfter(n.cloneNode(true), el);
                n = n.previousSibling;
            }

            D.removeNode(el);
        };

        el = YAHOO.util.Dom.get(el);

        // Only set HTML on elements
        if (!el || el.nodeType != 1) {
            return null;
        }

        doc = doc || el.ownerDocument || document;

        if (YAHOO.env.ua.ie) {
            try {
                // try outerHTML for IE it sometimes produces an "unknown runtime error"
                el.outerHTML = html;
            } catch (ex) {
                // fix for "unknown runtime error"
                setHTML(el, html, doc);
            }
        } else {
            setHTML(el, html, doc);
        }

        return el;
    };
    
    /**
    * Map of tags whose content to ignore when calculating text length.
    * @type {Object}
    * @private
    */
    var TAGS_TO_IGNORE = {
        'SCRIPT': 1,
        'STYLE': 1,
        'HEAD': 1,
        'IFRAME': 1,
        'OBJECT': 1
    };

    /**
    * Map of tags which have predefined values with regard to whitespace.
    * @type {Object}
    * @private
    */
    var PREDEFINED_TAG_VALUES = {
        'IMG': ' ',
        'BR': '\n'
    };

    /**
    * Recursive support function for text content retrieval.
    *
    * @param {Node} node The node from which we are getting content.
    * @param {Array} buf string buffer.
    * @param {boolean} normalizeWhitespace Whether to normalize whitespace.
    * @private
    */
    function _getTextContent(node, buf, normalizeWhitespace) {
        if (node.nodeName in TAGS_TO_IGNORE) {
            // ignore certain tags
        } else if (node.nodeType == NODE_TYPE.TEXT) {
            if (normalizeWhitespace) {
                buf.push(String(node.nodeValue).replace(/(\r\n|\r|\n)/g, ''));
            } else {
                buf.push(node.nodeValue);
            }
        } else if (node.nodeName in PREDEFINED_TAG_VALUES) {
            buf.push(PREDEFINED_TAG_VALUES[node.nodeName]);
        } else {
            var child = node.firstChild;

            while (child) {
                _getTextContent(child, buf, normalizeWhitespace);
                child = child.nextSibling;
            }
        }
    };

    /**
    * Returns the text content of the current node, without markup and invisible
    * symbols. New lines are stripped and whitespace is collapsed,
    * such that each character would be visible.
    *
    * In browsers that support it, innerText is used.  Other browsers attempt to
    * simulate it via node traversal.  Line breaks are canonicalized in IE.
    *
    * @param {Node} node The node from which we are getting content.
    * @return {string} The text content.
    */
    D.getTextContent = function(node) {
        var textContent;

        // Note(user): IE9, Opera, and Safara 3 support innerText but they include
        // text nodes in script tags. So we revert to use a user agent test here.
        var CAN_USE_INNER_TEXT = (YAHOO.env.ua.ie > 0 && YAHOO.env.ua.ie < 9);

        if (CAN_USE_INNER_TEXT && ('innerText' in node)) {
            // canonicalize new lines
            textContent = node.innerText.replace(/(\r\n|\r|\n)/g, '\n');
            // Unfortunately .innerText() returns text with &shy; symbols
            // We need to filter it out and then remove duplicate whitespaces
        } else {
            var buf = [];
            _getTextContent(node, buf, true);
            textContent = buf.join('');
        }

        // Strip &shy; entities.
        textContent = textContent.replace(/ \xAD /g, ' ').replace(/\xAD/g, '');

        // Skip this replacement on IE, which automatically turns &nbsp; into ' '
        // and / +/ into ' ' when reading innerText.
        if (!YAHOO.env.ua.ie) {
            textContent = textContent.replace(/ +/g, ' ');
        }
        if (textContent != ' ') {
            textContent = textContent.replace(/^\s*/, '');
        }

        return textContent;
    };

    /**
     * Whether a node contains another node.
     * @param {Node} parent The node that should contain the other node.
     * @param {Node} descendant The node to test presence of.
     * @return {boolean} Whether the parent node contains the descendent node.
     */
    D.contains = function(parent, descendant) {
        // We use browser specific methods for this if available since it is faster
        // that way.

        // IE DOM
        if (parent.contains && descendant.nodeType == NODE_TYPE.ELEMENT) {
            return parent == descendant || parent.contains(descendant);
        }

        // W3C DOM Level 3
        if (typeof parent.compareDocumentPosition != 'undefined') {
            return parent == descendant || Boolean(parent.compareDocumentPosition(descendant) & 16);
        }

        // W3C DOM Level 1
        while (descendant && parent != descendant) {
            descendant = descendant.parentNode;
        }

        return descendant == parent;
    };
    
    /**
     * Compares the document order of two nodes, returning 0 if they are the same
     * node, a negative number if node1 is before node2, and a positive number if
     * node2 is before node1.  Note that we compare the order the tags appear in the
     * document so in the tree <b><i>text</i></b> the B node is considered to be
     * before the I node.
     *
     * @param {Node} node1 The first node to compare.
     * @param {Node} node2 The second node to compare.
     * @return {number} 0 if the nodes are the same node, a negative number if node1
     *     is before node2, and a positive number if node2 is before node1.
     */
    D.compareNodeOrder = function (node1, node2) {

        // Fall out quickly for equality.
        if (node1 == node2) {
            return 0;
        }

        // Make sure really nodes
        if (!D.isNode(node1) || !D.isNode(node2)) {
            return 0;
        }

        // 4 is the bitmask for FOLLOWS.
        return node1.compareDocumentPosition(node2) & 2 ? 1 : -1;

    };

    // sort an array of elements
    D.sort = function(arr) {
        Util.Array.sort(arr, D.compareNodeOrder);
    };
    
    /******************************************************************************************/

    // YUI DOM HELPER METHOD: If the className exists on the node it is removed, if it doesn't exist it is added.
    D.toggleClass = function(node, className, force) {
        var add = (force !== undefined) ? force : !(YUD.hasClass(node, className));
        if (add) {
            YUD.addClass(node, className);
        } else {
            YUD.removeClass(node, className);
        }
    };

    // a helper method for looking up an element by class name and only getting first result
    D.getElementByClassName = function(className, tag, root, apply, o, overrides) {
        var elements = YUD.getElementsByClassName(className, tag, root, apply, o, overrides);
        if (elements.length > 0) {
            return elements[0];
        }
        return null;
    };

    // get a selection range safely from a window object
    D.getSelectionRange = function(win) {
        win = win || window;

        // get selection object
        var selection = win.getSelection();
        var range = null;

        // get range object
        // NOTE: Check rangeCount first if it is zero then don't call getRangeAt()
        if (selection && selection.rangeCount > 0) {
            try {
                range = selection.getRangeAt(0);
            } catch (ex) {
            }
        }

        return range;
    };

    // get all the regions for this element
    D.getElementRegions = function(el) {
        var regions = [];

        // check if element supports client rects
        if (el.getClientRects) {
            // get bounding rectangles (https://developer.mozilla.org/en-US/docs/DOM/element.getClientRects)
            var clientRects = el.getClientRects();

            for (var i = 0, ii = clientRects.length; i < ii; i++) {
                var clientRect = clientRects[i];
                var region = new YAHOO.util.Region(clientRect.top, clientRect.right, clientRect.bottom, clientRect.left);
                regions.push(region);
            }
        } else {
            // get DOM position
            var targetPos = YAHOO.util.Dom.getXY(el);

            var top = targetPos[1],
                left = targetPos[0],
                bottom = top + el.offsetHeight,
                right = left + el.offsetWidth;

            var region = new YAHOO.util.Region(top, right, bottom, left);
            regions.push(region);
        }

        return regions;
    };

    // Create dom element from html string
    D.createElementFromHtml = function(html) {
        var div = document.createElement('div');
        div.innerHTML = html;
        return YUD.getFirstChild(div);
    };

    D.batch = function(nodes, method, scope) {
        var count = nodes.length;
        for (var i = 0; i < count; i++) {
            var node = nodes[i];
            if (typeof scope == 'object') {
                method.call(scope, node);
            } else {
                method(node);
            }
        }
    };

    /* DEPRECATED START */

    // get all elements by tag name 
    // (DEPRECATED: use D.getElementsByTagName)
    D.queryTags = function(name, context) {
        context = context || document;
        return context.getElementsByTagName(name);
    };

    // get the first element found by tag name
    // (DEPRECATED: use D.getElementByTagName)
    D.queryTag = function(name, context) {
        var results = D.queryTags(name, context);
        return (results.length > 0) ? results[0] : null;
    };

    // get all elements by tag name and run a function against them
    // (DEPRECATED: use D.batchElementByTagName)
    D.queryTagsBatch = function(name, context, method, scope) {
        var results = D.queryTags(name, context);
        return D.batch(results, method, scope);
    };

    /* DEPRECATED END */

    // get all elements by tag name in an array
    D.getElementsByTagName = function(name, context) {
        context = context || document;
        var collection = context.getElementsByTagName(name);
        return Util.Array.slice(collection);
    };

    // get the first element found by tag name
    D.getElementByTagName = function(name, context) {
        var list = D.getElementsByTagName(name, context);
        return (list.length > 0) ? list[0] : null;
    };

    // get all elements by tag name and run a function against them
    D.batchElementsByTagName = function(name, context, method, scope) {
        var list = D.getElementsByTagName(name, context);
        return D.batch(list, method, scope);
    };

    D.querySelectorAll = function(selector, context) {
        context = context || document;
        var nodeList = context.querySelectorAll(selector);
        return Util.Array.slice(nodeList); // convert into array
    };

    D.querySelector = function(selector, context) {
        context = context || document;
        return context.querySelector(selector);
    };

    // find all matching selectors and run a function against them
    D.batchQuerySelector = function(selector, context, method, scope) {
        var results = D.querySelectorAll(selector, context);
        return D.batch(results, method, scope);
    };

    // find all matching selectors and run a function against them
    // (DEPRECATED: use D.batchQuerySelector)
    D.querySelectorBatch = D.batchQuerySelector;

    // Stops all events for this element.
    D.stopAllEvents = function (el, type) {
        YUE.on(el, type, YUE.stopEvent, YUE, true);
    };

    // stop drag and drop (https://developer.mozilla.org/en/Drag_and_Drop)
    D.stopDragEvents = function (el) {
        el = el || window; // default to current window
        D.stopAllEvents(el, 'dragstart'); // FF >= 3.5
        D.stopAllEvents(el, 'draggesture'); // FF <= 3.0
    };

    D.stopDropEvents = function (el) {
        el = el || window; // default to current window
        D.stopAllEvents(el, 'drop');
    };

    // rename the tagName of an element
    D.renameTag = function(el, tag) {

        // create replacement element
        var replacementEl = el.ownerDocument.createElement(tag);

        // copy over attributes
        $.each(el.attributes, function(idx, attrib) {
            replacementEl.setAttributeNode(attrib.cloneNode(true));
        });

        var $el = $(el);
        var $replacement = $(replacementEl);

        // get all the kids, with data and events
        var contents = $el.children().clone(true);

        // copy children
        $replacement.append(contents);

        // copy the data
        $replacement.data($el.data());

        // swap it out
        $el.replaceWith($replacement);

        // and we're done
        return replacementEl;
    };

    Util.Dom = D;

})(window.Util);