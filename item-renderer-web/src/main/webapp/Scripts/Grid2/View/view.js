//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
/*
Contains all the core SVG view code.

Other Libraries:
- http://raphaeljs.com/
- http://mbostock.github.com/d3/ (https://github.com/mbostock/d3)
- http://processing.org/
- http://mbostock.github.com/protovis/
- SVG helper utils: http://www.pottisjs.com/pottis.js
*/

var SVG_NS = "http://www.w3.org/2000/svg";
var XLINK_NS = "http://www.w3.org/1999/xlink";
var GRID_NS = 'http://www.air.org/2010/grid/';

// The grid UI class (uses SVG)
Grid.View = function(svgFile)
{
    this.svgFile = svgFile;
    this.paletteImgIndex = 0;
    this.paletteCenter = false;
    this.paletteScale = false;
    this.width = 600;
    this.height = 500;

    // reference to svg <object> element
    this._svgObject = null;

    // reference to svg document
    this._svgDoc = null;

    // reference to svg window
    this._svgWin = null;

    // reference to svg root
    this._svgRoot = null;

    this._svgElement = null;

    // current zoom level
    this._zoomLevel = 1;

    // cache for quick dom lookups
    this._domCache = {};

    // is svg ready to be used (svgweb initialized)
    this.svgReady = false;

    // has the svg file been successfully loaded
    this.svgLoaded = false;

    // use SVG suspendRedraw()
    this._suspendRedrawEnabled = false;

    // write out extra debug logs
    this._debug = false;

    // if this is true then the page offset was fixed
    this._fixedOffset = false;

    this._layout = null;

    // add error logging to public functions (NOTE: firebug doesn't report <object> exceptions..)
    if (Grid.Utils.hasSVGWeb()) {
        ErrorHandler.wrapFunctions(this, [
            'setAttributes', 'createElement',
            'createPoint', 'createSnapPoint', 'movePoint', 'createLine', 'moveLine'
        ]);
    }
};

// load the svg file into child of a div
Grid.View.prototype.render = function(id)
{
	var parent = YAHOO.util.Dom.get(id);
	var view = this;
	
	var ready = function() {
		view.svgReady = true;
		view._create(parent);
	};
	
	// check if the svg library is loaded
	if (Grid.Utils.hasSVGWeb()) {

		if (svgweb.pageLoaded) {
			ready();
		} else {
			// wait for svgweb to finish loading
            window.onsvgload = function() { ready(); };
		}
	}
	// if there is no svg library then use native svg if available
	else if (Grid.Utils.hasSVGNative()) {
		ready();
	} else {
		throw new Error('This browser does not have support for SVG');
	}
};

// fix offset for the element passed in and all of that elements parent iframes
Grid.View.prototype._fixOffset = function()
{
    if (this._fixedOffset) return;
    Grid.Utils.fixOffset(this._svgObject);
    this._fixedOffset = true;
};

/*******************************************************************************************/

// add element to the dom cache
Grid.View.prototype._addCache = function(element) {
     if (typeof element.id == 'string') this._domCache[element.id] = element;
};

// remove an element from the dom cache
Grid.View.prototype._removeCache = function(element) {
    if (typeof element.id == 'string') delete(this._domCache[element.id]);
};
	
// get element by id
Grid.View.prototype.getElementById = function(id) {

    if (this._svgDoc == null) return null;
    if (!id) return null;
    if (id.nodeType) return id; // already a dom element

    if (typeof id == 'string') {
        var element = this._domCache[id];
        if (element) return element;
        else return this._svgDoc.getElementById(id);
    }

    return null;
};

// get elements by tag name
Grid.View.prototype.getElementsByTagName = function(tagName)
{
    if (this._svgDoc == null) return null;
    return this._svgDoc.getElementsByTagNameNS(SVG_NS, tagName);
};
	
// create an element using json
Grid.View.prototype.createElement = function(name, attrs) {

    // check if valid data object
    if (typeof name != 'string') return false;

    var element = null;

    // if there is an id attribute then try and lookup existing element
    if (attrs != null && typeof attrs.id == 'string') {
	    element = this.getElementById(attrs.id);
    }
	
    // if there is no element then create one
	if (element == null) {
		element = this._svgDoc.createElementNS(SVG_NS, name);
	}
	
    // set attributes
	this.setAttributes(element, attrs);

	if (this._debug && element.id) {
		logger.debug('Created \'{nodeName}\' with id \'{id}\'', element);
	}
	
    // add to cache lookup
	this._addCache(element);
	
	return element;
};

// assign attributes to an alement using json
Grid.View.prototype.setAttributes = function(node, attrs)
{
    // get element
    if (typeof node == 'string') {
        node = this.getElementById(node);
    }
    if (node == null) return false;

    // check if attributes are valid
    if (attrs == null) return false;

    var handle = null;

    // suspend native svg
    if (this._suspendRedrawEnabled === true) {
        try {
            handle = this._svgRoot.suspendRedraw(10000);
        } catch (ex) {}
    }

    // apply attributes to dom nodes
    for (var name in attrs) {
        if (attrs.hasOwnProperty(name)) {
            var value = attrs[name];
            node.setAttribute(name, value);
        }
    }

    // resume native svg
    if (handle != null) {
        this._svgRoot.unsuspendRedraw(handle);
    }

    return true;
};

Grid.View.prototype.setAttribute = function(node, name, value)
{
    // get element
    if (typeof node == 'string') {
        node = this.getElementById(node);
    }
    if (node == null) return false;

    node.setAttribute(name, value);
    return true;
};

// append an element to a parent id
Grid.View.prototype.appendChild = function(parent, element)
{
    if (typeof parent == 'string') {
        parent = this.getElementById(parent);
    }

    if (parent == null) {
        logger.warn('Failed to append the element \'' + element.id + '\' because the parent was not found.');
        return false;
    }

    parent.appendChild(element);

    // Hack for IE -- SVG in Flash does not appear to propagate parent group styles to children
    // We read any parent styles and attempt to apply to children when flash renderer is being used
    if (Grid.Utils.isSVGFlash()) {
        if (parent.getAttribute('style') != '') {
            this.setAttributes(element, {
                'style': parent.getAttribute('style')
            });
        }
    }

    return true;
};

// replacement for using elements removeChild directly
Grid.View.prototype.removeChild = function(parent, element)
{
    // remove element from parent
    parent.removeChild(element);

    // there is an issue in svgweb which sets this as an array
    if (YAHOO.lang.isObject(element._fakeNode) && 
        YAHOO.lang.isArray(element._fakeNode._listeners)) {
        element._fakeNode._listeners = {};
    }
};

// remove all the children of an element
Grid.View.prototype.removeChildren = function(parent)
{
    if (typeof parent == 'string') {
        parent = this.getElementById(parent);
    }

    while (parent && parent.firstChild) {
        this.removeChild(parent, parent.firstChild);
    }
};

// remove an element
Grid.View.prototype.removeElement = function(id)
{
    var element = this.getElementById(id);

    if (element == null) {
        logger.warn('Cannot remove the element \'' + id + '\' because it does not exist');
        return false;
    }

    this._removeCache(element);

    // NOTE: if there is no parentNode then this element is not attached to the dom and is already removed
    if (element.parentNode != null) {
        this.removeChild(element.parentNode, element);
    }

    if (this._debug) logger.debug('Removed \'{nodeName}\' with id \'{id}\'', element);

    return true;
};

// sets the text node of an element
Grid.View.prototype.setText = function(id, text)
{
    var element = this.getElementById(id);
    if (element == null) return false;

    // clear current text
    this.removeChildren(element);

    // add new text
    var textNode = this._svgDoc.createTextNode(text);
    element.appendChild(textNode);
    return true;
};

// move an element id to top layer
Grid.View.prototype.bringToFront = function(id)
{
    var element = this.getElementById(id);
    if (element == null) return false; //  || element.nodeName == 'image'

    var parent = element.parentNode;
    if (parent == null) return false;

    this.removeChild(parent, element);
    parent.appendChild(element);
    return true;
};

// get the height and width of the entire grid container
/*Grid.View.prototype.getResolution = function()
{
	if (!this._svgRoot) return null;
	
	return {
	    width: this._svgElement.getAttribute("width") * 1,
	    height: this._svgElement.getAttribute("height") * 1,
	    zoom: this._zoomLevel
	};
};*/

// zoom the grid
Grid.View.prototype.zoom = function(scale) {

    // save scale (if it doesn't exist use existing or default to 1)
    this._zoomLevel = scale = (scale || this._zoomLevel || 1);

    // zoom original width/height
    var zoomedWidth = Math.round(this.width * scale);
    var zoomedHeight = Math.round(this.height * scale);

    // set width/height on svg element
    if (this._svgElement) {
        if (this._svgElement.width.baseVal) {
            this._svgElement.width.baseVal.value = zoomedWidth;
            this._svgElement.height.baseVal.value = zoomedHeight;
        }
        
        // Bug 142346 - Safari as well as android require the attributes to set the dimensions of the svg element
        if (YAHOO.env.ua.android > 0 || YAHOO.env.ua.webkit >= 534) { 
            this._svgElement.setAttribute('width', zoomedWidth);
            this._svgElement.setAttribute('height', zoomedHeight);
        }
    }

    // set width/height on svg container
    if (this._svgObject) {
        this._svgObject.width = zoomedWidth;
        this._svgObject.height = zoomedHeight;
    }

    // set zoom scale
    var groupWrapper = this.getElementById('groupWrapper');

    if (groupWrapper) {

        // parse out existing transform
        var groupTransform = groupWrapper.getAttribute('transform');
        var groupTranslate = groupTransform.split(' scale')[0];

        // apply existing transform and updated scale
        this.setAttributes(groupWrapper, {
            'transform': groupTranslate + ' scale(' + scale + ')'
        });
    }
};

// convert the mouse coordinates into the space of the SVG element.
Grid.View.prototype.translateElement = function(element, x, y)
{
    if (typeof element == 'string') {
        element = this.getElementById(element);
    }

    if (element == null) return null;

    // get svg matrix
    var matrix = element.getCTM().inverse();

    // convert window points through the matrix to get the document coordinates
    x = matrix.a * x + matrix.c * y + matrix.e;
    y = matrix.b * x + matrix.d * y + matrix.f;

    return { x: x, y: y };
};

// clean up any nodes that were removed in the past
Grid.View.prototype.dispose = function()
{
    // remove object tag
    if (this._svgObject && this._svgObject.parentNode) {
        this._svgObject.parentNode.removeChild(this._svgObject);
    }

    this._svgObject = null;
    this._svgDoc = null;
    this._svgWin = null;
    this._svgRoot = null;
    this._svgElement = null;
    this._domCache = null;

    // check if svg web exists
    if (Grid.Utils.hasSVGWeb()) {
        
        // clear removed nodes array
        if (svgweb._removedNodes != null) {
            
            for (var i = 0; i < svgweb._removedNodes.length; i++) {
                var node = svgweb._removedNodes[i];

                if (node._fakeNode) {
                    node._fakeNode._htcNode = null;
                }

                node._fakeNode = null;
                node._handler = null;

                svgweb._removedNodes[i] = null;
            }

            svgweb._removedNodes = [];        
        }
    }
};

YAHOO.lang.augmentProto(Grid.View, EventLazyProvider);

// make sure svgweb is on the top element (this is not really required but does prevent an exception)
if (window.svgweb && top != window) top.svgweb = window.svgweb;
