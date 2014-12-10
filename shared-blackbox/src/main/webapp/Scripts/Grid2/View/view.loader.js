/*
Contains the SVG code for loading.
*/

// create a new svg object within a DOM element
Grid.View.prototype._create = function(parentEl)
{
    // get elements document and window
    var view = this;
    var elementDoc = parentEl.ownerDocument;
    var elementWin = elementDoc.parentWindow || elementDoc.defaultView;
    var isFrame = (window != elementWin);

    // FRAME FIX: if elements window does not have svgweb then copy it from parent parent window
    if (Grid.Utils.hasSVGWeb() && elementWin && !elementWin.svgweb)
    {
        elementWin.svgweb = window.svgweb;
    }

    // BUG #62035: fixes ipad 3 crash when leaving page
    var pageUnloaded = function() {
        view.dispose();
    };

    elementWin.addEventListener('unload', pageUnloaded, false);

    if (this._inlineHtml) this._createInline(parentEl);
    else this._createObject(parentEl);
};

// Create a <object> tag and begin loading the svg file into it.
Grid.View.prototype._createObject = function(parentEl)
{
    var svgID = parentEl.id + 'Container';

    // create <object>
    // NOTE: We use the top level document to create element since that is where svgweb is loaded.
    // WARNING: DO NOT CHANGE THIS
    var svgObject = document.createElement('object', true);
    svgObject.setAttribute('id', svgID);
    svgObject.setAttribute('name', svgID);
    svgObject.setAttribute('type', 'image/svg+xml');
    svgObject.setAttribute('data', this.svgFile);

    var view = this;

    // when svg file has loaded this gets called
    var loaded = function() { view._loadedObject(this); };
    
    // assign dom load event
    if (Grid.Utils.hasSVGWeb())
    {
        svgObject.addEventListener('SVGLoad', loaded, false);
        svgweb.appendChild(svgObject, parentEl);
    }
    else
    {
        svgObject.addEventListener('load', loaded, false);
        parentEl.appendChild(svgObject);
    }
};

// When the svg file is loaded into a <object> tag this gets called.
Grid.View.prototype._loadedObject = function(svgObject)
{
    this._svgObject = svgObject;
    this._svgDoc = this._svgObject.contentDocument;
    this._svgWin = this._svgDoc.defaultView;
    this._svgElement = this._svgDoc.documentElement;
    this._svgRoot = this._svgDoc.rootElement;

    this.svgLoaded = true;
    this.fireLazy('loaded');
};

// Create <svg> tag inline with html and put the svg file contents into it.
Grid.View.prototype._createInline = function(parentEl)
{
    var callback =
    {
        success: this._loadedInline,                    
        failure: this._failedInline,
        scope: this,
        argument: parentEl
    };

    YAHOO.util.Connect.asyncRequest('GET', this.svgFile, callback);
};

// When the svg file has loaded and the <svg> element is populated then this gets called.
Grid.View.prototype._loadedInline = function(xhrObj)
{
    var parentEl = xhrObj.argument;
    var svgText = xhrObj.responseText;
    
    // write svg to the dom
    parentEl.innerHTML = svgText;

    // get the svg element
    this._svgElement = YAHOO.util.Dom.getChildren(parentEl)[0];
    this._svgRoot = this._svgElement;
    this._svgObject = this._svgElement; // the <object> tag does not exist
    this._svgDoc = this._svgElement.ownerDocument;
    this._svgWin = this._svgDoc.parentWindow || this._svgDoc.defaultView;

    this.svgLoaded = true;
    this.fireLazy('loaded');
};