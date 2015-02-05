Grid.Utils = {};

// does this browser support native SVG
Grid.Utils.hasSVGNative = function() {
	return document.implementation.hasFeature('http://www.w3.org/TR/SVG11/feature#BasicStructure', '1.1');
};

// does the svgweb library exist
Grid.Utils.hasSVGWeb = function() {
    return (typeof(svgweb) == 'object');
};

Grid.Utils.isSVGFlash = function() {
    return (Grid.Utils.hasSVGWeb() && svgweb.getHandlerType() == 'flash');
};

// mouse events
(function (Utils) {

    var touchScreen = 'ontouchstart' in window;

    var touchEvents = {
        'mousedown': 'touchstart',
        'mouseup': 'touchend',
        'mousemove': 'touchmove'
    };

    var mouseEvents = {
        'mousedown': 'mousedown',
        'mouseup': 'mouseup',
        'mousemove': 'mousemove'
    };

    // Get the windows nt version
    var getWindowsNTVersion = function() {
        var matches = navigator.userAgent.match(/Windows NT (\d+\.\d+)/);
        var value;
        if (matches && matches[1]) {
            value = parseFloat(matches[1]);
        }
        return value || 0;
    };

    // if this is true then we need to support both mouse/touch, win8 and chromebook with touchscreen
    var supportsTouchAndMouse = function() {
        return (touchScreen && (getWindowsNTVersion() >= 6.1 || window.navigator.userAgent.indexOf('CrOS') > -1));
    };

    // this fixes a touch event to look like a mouse event
    var normalizeTouchEvent = function (evt) {

        if (evt.changedTouches) {

            var touches = evt.changedTouches;

            // find touch event that matches dom event
            for (var i = 0, ii = touches.length; i < ii; i++) {

                if (touches[i].target == evt.target) {

                    // save original event
                    var oldevt = evt;

                    // replace DOM event with touch event
                    evt = touches[i];

                    evt.preventDefault = function () {
                        return oldevt.preventDefault();
                    };

                    evt.stopPropagation = function () {
                        return oldevt.stopPropagation();
                    };

                    return evt;
                }
            }
        }

        return evt;
    };

    // add a mouse listener
    var addMouseListener = function (target, name, fn) {

        // check if browser supports both touch and mouse
        var touchAndMouse = supportsTouchAndMouse();

        // figure out the event name and alt event name
        var eventName, altEventName;
        if (touchScreen) {
            eventName = (touchEvents[name] || name);
            if (touchAndMouse) {
                altEventName = (mouseEvents[name] || name);
            }
        } else {
            eventName = (mouseEvents[name] || name);
        }

        // perform some processing on the dom event (http://www.html5rocks.com/en/mobile/touchandmouse/)
        var processEvent = function(evt) {

            // prevents default mouse-emulation
            if (touchAndMouse) {
                evt.preventDefault();
            }

            // normalize event to look like mouse
            if (touchScreen) {
                evt = normalizeTouchEvent(evt);
            }

            fn(evt);
        };

        // add event listener
        if (eventName) {
            target.addEventListener(eventName, processEvent, false);
            if (altEventName) {
                target.addEventListener(altEventName, processEvent, false);
            }
        }
    };

    Utils.addMouseListener = addMouseListener;

})(Grid.Utils);

// Import a node from one xml document to another.
/* 
HELP:
- http://pastebin.com/f2gKUNDV
- http://stackoverflow.com/questions/1811116/ie-support-for-dom-importnode
- http://stackoverflow.com/questions/6075566/import-svg-node-into-another-document-in-ie9/6075604#6075604
*/
Grid.Utils.importNode = function(doc, importedNode, deep) {

    // check if document was defined
    if (!doc) doc = document;
    var node = null;
    
    switch (importedNode.nodeType) {
    case 1:
        // ELEMENT NODE
        var nodeNS = importedNode.namespaceURI;
        if (typeof doc.createElementNS == 'function' && nodeNS != null) {
            node = doc.createElementNS(nodeNS, importedNode.nodeName);
        } else {
            node = doc.createElement(importedNode.nodeName);
        }

        // does the node have any attributes to add?
        Grid.Utils.importAttributes(importedNode, node);

        // are we going after children too, and does the node have any?
        if (deep && importedNode.childNodes && importedNode.childNodes.length > 0) {
            for (var i = 0, il = importedNode.childNodes.length; i < il; i++) {
                var childNode = Grid.Utils.importNode(doc, importedNode.childNodes[i], deep);
                if (childNode) node.appendChild(childNode);
            }
        }
        break;
    case 3:
        // TEXT NODE
        // BUG: If you don't pass true then throws a "Type mismatch" error in svgweb for svg
        node = doc.createTextNode(importedNode.nodeValue, true);
        break;
    case 4:
        // CDATA NODE
        // node = doc.createCDATASection(importedNode.nodeValue);
        break;
    case 7:
        // PROCESSING INSTRUCTIONS NODE
        // node = doc.createProcessingInstruction(importedNode.target, importedNode.data);
        break;
    case 8:
        // COMMENT NODE
        // BUG: Throws a "Type mismatch" error in svgweb
        // node = doc.createComment(importedNode.nodeValue);
        break;
    }

    return node;
};

// Copy attributes from one node to another.
Grid.Utils.importAttributes = function(importedNode, node) {
    
    // does the node have any attributes to add?
    if (importedNode.attributes && importedNode.attributes.length > 0) {
        for (var i = 0, il = importedNode.attributes.length; i < il; i++) {
            var attrNS = importedNode.attributes[i].namespaceURI;
            var attrName = importedNode.attributes[i].nodeName;
                
            // check if attribute already exists (NOTE: happens on svgweb for <svg> and 'xmlns')
            if (node.getAttribute(attrName) == null) {
                var attrValue = importedNode.getAttribute(attrName);

                // set attribute
                if (typeof node.setAttributeNS == 'function' && attrNS != null) {
                    node.setAttributeNS(attrNS, attrName, attrValue);
                } else {
                    node.setAttribute(attrName, attrValue);
                } 
            }
        }
    }
};

// get offset for a single element
Grid.Utils.getOffset = function(element) {

    var hasClientRects = false;

    try {
        hasClientRects = (element && typeof element.getClientRects == 'function');
    } catch (ex) {
        // cross-domain permissions error
    }

    if (hasClientRects) {
        return {
            top: element.getClientRects()[0].top,
            left: element.getClientRects()[0].left
        };
    } else {
        return {
            top: 0,
            left: 0
        };
    }
};

// Get offset for a single element (NOTE: not used right now, but maybe in the future)
// Helpful links:
// jquery: http://github.com/jquery/jquery/tree/master/src/
// jquery-ui: http://code.google.com/p/jquery-ui/
Grid.Utils.getOffsetAdv = function(elem)
{
    if (!("getBoundingClientRect" in document.documentElement))
    {
        return { top: 0, left: 0 };
    }

    // original code: http://github.com/jquery/jquery/blob/master/src/offset.js
    var boxModel = true;
    var box = elem.getBoundingClientRect();
    var doc = elem.ownerDocument;
    var body = doc.body;
    var docElem = doc.documentElement;
    var clientTop = docElem.clientTop || body.clientTop || 0;
    var clientLeft = docElem.clientLeft || body.clientLeft || 0;
    var top = box.top + (self.pageYOffset || boxModel && docElem.scrollTop || body.scrollTop) - clientTop;
    var left = box.left + (self.pageXOffset || boxModel && docElem.scrollLeft || body.scrollLeft) - clientLeft;
    return { top: top, left: left };
};

// fix offset for the element passed in and all of that elements parent iframes
Grid.Utils.fixOffset = function(svgObject)
{
    // function for getting an elements <iframe>
    var getElementFrame = function()
    {
        var doc;
        try {
            doc = element.ownerDocument;
        } catch (ex) {
            return null; // cross-domain permissions error
        }

        // get window
        var win = doc.parentWindow || doc.defaultView;

        // get windows frame element
        // NOTE: might not have permission to access this if cross-domain
        return win.frameElement;
    };

    // current element
    var element = svgObject;

    // add all the elements to fix offset on into a collection
    var elements = [];

    do
    {
        elements.push(element);
    }
    while (element = getElementFrame())

    // reverse the array so we start with the top level element first
    elements.reverse();

    // figure out the offset required to place the <object> tag in such a way where there is no fractional offset in relation to the parent iframes
    var top = 0, left = 0;

    for (var i = 0; i < elements.length; i++)
    {
        // get elements document offset
        var offset = Grid.Utils.getOffset(elements[i]);

        // round to get fractional difference and add that
        if (offset) {
            top += (Math.ceil(offset.top) - offset.top);
            left += (Math.ceil(offset.left) - offset.left);
        }
    }

    // check if any offsets to apply
    if (top > 0) {
        YAHOO.util.Dom.setStyle(svgObject, 'margin-top', top + 'px');
    }
    if (left > 0) {
        YAHOO.util.Dom.setStyle(svgObject, 'margin-left', left + 'px');
    }
};

// a helper function for getting a svg elements main details
// TODO: try and remove this function
Grid.Utils.parseElementXY = function(el)
{
    var getFloat = function(attrib)
    {
        var value = el.getAttribute(attrib);
        return (value == null) ? 0 : parseFloat(value);
    };

    var data = {};

    if (el.nodeName == 'circle')
    {
        data.x = getFloat('cx');
        data.y = getFloat('cy');
        data.radius = getFloat('r');
    }
    else if (el.nodeName == 'line')
    {
        data.x1 = getFloat('x1');
        data.y1 = getFloat('y1');
        data.x2 = getFloat('x2');
        data.y2 = getFloat('y2');
    }
    else if (el.nodeName == 'image' || el.nodeName == 'rect')
    {
        data.x = getFloat('x');
        data.y = getFloat('y');
        data.width = getFloat('width');
        data.height = getFloat('height');
    }
    else
    {
        data.x = getFloat('x');
        data.y = getFloat('y');
    }

    data.thickness = getFloat('stroke-width');

    return data;
};