//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
﻿/* Init */

(function(CM) {

    // # of seconds until image times out
    var IMAGE_TIMEOUT = 90;

    // how many times we can retry loading images
    var IMAGE_MAX_RETRY = 2;

    var State = {
        Init: 0, // This is the default state. Object is created and the content HTML is ready to render.
        Rendering: 1, // Right before we write the content HTML to the DOM.
        Rendered: 2, // The content HTML has finished writing but the DOM might not be ready to access yet.
        Available: 3, // The content HTML is now ready in the DOM to be accessed.
        Loaded: 4 // All the resources in the HTML (e.x. images) have been loaded and content is ready to view.
    };

    var StateNames = {};
    StateNames[State.Init] = 'init';
    StateNames[State.Rendering] = 'rendering';
    StateNames[State.Rendered] = 'rendered';
    StateNames[State.Available] = 'available';
    StateNames[State.Loaded] = 'loaded';

    function Renderer(parentEl, id, html) {

        this.id = id;
        this._parentEl = parentEl; // <div> that holds all the pages
        this._pageEl = null; // <div> that wraps this page
        this._html = html;

        // images
        this._imagesLoading = []; // images currently waiting to load
        this._imagesLoaded = []; // images that loaded successfully
        this._imagesFailed = []; // images that failed to load
        this._imagesAborted = []; // images that got aborted or timed out
        this._imagesTimer = null; // timer object for waiting on images
        this._imagesRetry = 0; // how many times a timeout occured and we retried

        // resource loader
        this._resourceCollection = new ResourceLoader.Collection();

        // status info
        this._status = State.Init;

        Util.Event.Emitter(this);
    }

    Renderer.State = State;

    Renderer.getStateNames = function() {
        return Util.Object.values(StateNames);
    }

    Renderer.init = function () {
        // Here for compatibility...
    }

    Renderer.isDirect = function() {
        return true; // TODO: Remove usages of this
    }

    // a helper method for writing html into the innerHTML of a node
    Renderer.writeHtml = function (parentEl, html) {

        // create page html container
        // NOTE: Can't appendChild to a node created from another frame so get parent node owner
        var parentDoc = Util.Dom.getOwnerDocument(parentEl);
        var pageWrapper = parentDoc.createElement('div');
        YUD.addClass(pageWrapper, 'pageWrapper');

        // check if html exists
        if (html) {

            // if the html is a xml document then get its element
            if (html.documentElement) {
                html = html.documentElement;
            }

            // check for the type of html
            if (html.nodeType > 0) {
                pageWrapper.appendChild(html);
            } else {
                pageWrapper.innerHTML = html;
            }
        }

        // set page hidden from JAWS until it is ready
        pageWrapper.setAttribute('aria-hidden', 'true');

        // add container to frame
        parentEl.appendChild(pageWrapper);

        return pageWrapper;
    };

    // a helper method for showing a page container
    Renderer.show = function (el) {
        if (el) {
            el.setAttribute('aria-hidden', 'false');
            YUD.removeClass(el, 'hiding');
            YUD.addClass(el, 'showing');
        }
    };

    // a helper method for hiding a page container
    Renderer.hide = function (el) {
        if (el) {
            el.setAttribute('aria-hidden', 'true');
            YUD.removeClass(el, 'showing');
            YUD.addClass(el, 'hiding');
        }
    };

    Renderer.remove = function(page) {
        var pageContainer = page.getContainer();
        Util.Dom.removeNode(pageContainer);
    }

    /************************************************************/

    Renderer.prototype._log = function (message) {
        if (!CM._debug) {
            return;
        }
        CM.log('RENDERER ' + this.id + ': ' + message);
    };
    
    Renderer.prototype.getState = function () {
        return this._status;
    };

    Renderer.prototype.setState = function (newState) {

        // check if valid page status
        if (!YAHOO.lang.isNumber(newState) ||
            newState < State.Init ||
            newState > State.Loaded) {
            throw 'Invalid page state';
        }

        // get current status
        var currentState = this.getState();

        // get the string names of the status's
        var currentStateName = StateNames[currentState];
        var newStateName = StateNames[newState];

        // check if page status string name was found
        if (newStateName == null) {
            throw 'No page state name found';
        }

        // check if this is a valid status transition
        var statusError = 'Invalid page state transition (' + currentStateName + ' --> ' + newStateName + ')';
        if (newState == State.Init && currentState >= State.Init) {
            throw statusError;
        } else if (newState == State.Rendering &&
            currentState != State.Init) {
            throw statusError;
        } else if (newState == State.Rendered &&
            currentState != State.Rendering) {
            throw statusError;
        } else if (newState == State.Available &&
            currentState != State.Rendered) {
            throw statusError;
        } else if (newState == State.Loaded &&
            currentState != State.Available) {
            throw statusError;
        }

        // set new status
        this._status = newState;

        this._log(newStateName);
        this.fire(newStateName);
    };

    // get the HTML used to render the page
    Renderer.prototype.getHtml = function () { return this._html; };

    // set the HTML used to render the page
    Renderer.prototype.setHtml = function (html) {

        if (this.getState() <= State.Rendering) {
            this._html = html;
            return true;
        }

        return false;
    };

    // gets the container for the page, this is what we hide/show
    Renderer.prototype.getContainer = function () {
        return this._pageEl;
    };

    // get the pages current window
    Renderer.prototype.getWin = function () {
        return document.parentWindow || document.defaultView;
    };
    
    // get the container element for this page
    Renderer.prototype.getElement = function () {
        return document.getElementById('Page_' + this.id);
    };

    // call this function to render the pages HTML
    Renderer.prototype.render = function () {

        // check if we have already started to render
        if (this.getState() > State.Init) {
            return this._pageEl;
        }

        // set status/fire event
        this.setState(State.Rendering);

        // write out page html
        var pageEl = Renderer.writeHtml(this._parentEl, this.getHtml());
        this._pageEl = pageEl;

        // hide page container
        Renderer.hide(pageEl);

        // add YUI class to enable widgets
        YUD.addClass(document.body, 'yui-skin-sam');

        // add touch class
        YUD.addClass(document.body, Util.Browser.isTouchDevice() ? 'touch' : 'no-touch');

        // get the element containing the pages content
        var pageElement = this.getElement();

        // this will occur if something got rendered but there was no page found
        if (pageElement == null) {
            throw new Error('The page element could not be found.');
        }

        // get all images and check for them to be loaded
        YUD.batch(pageElement.getElementsByTagName('img'), this.addImage, this, true);

        // set status/fire event
        this.setState(State.Rendered);

        // let DOM refresh
        YAHOO.lang.later(1, this, this.onAvailable);

        return pageEl;
    };

    // process renderer document
    function process(renderer) {

        var pageWin = renderer.getWin();

        // check if we already processed this doc
        if (pageWin.__tds_processed) {
            return;
        }

        // apply YUI menu events to iframe (NOTE: you must create a menu at some point for this to work)
        ContentManager.Menu.applyDocFix(document);

        // listen for keyboard events on the pages document
        if (typeof CM.addKeyEvents == 'function') {
            CM.addKeyEvents(document);
        }

        // stop drag/scroll DOM events
        Util.Dom.stopDragEvents(document);

        // stop right click on regular browsers
        Util.Dom.stopAllEvents(document, 'contextmenu');

        // stop middle click
        YUE.on(document, 'mousedown', function (ev) {
            if (ev.button == 1) {
                YUE.stopEvent(ev);
            }
        });

        pageWin.__tds_processed = true;
    };

    // this function gets called after writing the HTML to the DOM is done and DOM has been refreshed
    Renderer.prototype.onAvailable = function () {

        // process doc
        process(this);

        // get the element containing the pages content
        var pageElement = this.getElement();

        // set status/fire event
        this.setState(State.Available);

        // stop clicks on all page links (help, print, comment, mark review)
        YUD.batch(pageElement.getElementsByTagName('a'), function (link) {

            // For 2014 just let tab work
            // disable tab index so it cannot be tabbed to
            /*if (CM.enableARIA === false) {
                link.setAttribute('tabindex', '-1');

                // disable links from getting focus when clicked
                YUE.on(link, 'mousedown', function (ev) { YUE.stopEvent(ev); });
                YUE.on(link, 'mouseup', function (ev) { YUE.stopEvent(ev); });
            }*/

            // disable link click so you cannot go the url
            if (!CM.isLinkClickable(link)) {
                YUE.on(link, 'click', function(ev) {
                    YUE.stopEvent(ev);
                });
            }
        });

        // check if resources that were added
        if (this._resourceCollection.hasLoaders()) {
            // subscribe to collection events and start loading
            this._resourceCollection.subscribe(ResourceLoader.Status.COMPLETE, this.checkLoaded, this);
            this._resourceCollection.subscribe(ResourceLoader.Status.ERROR, this.checkLoaded, this);
            this._resourceCollection.subscribe(ResourceLoader.Status.ABORT, this.checkLoaded, this);
            this._resourceCollection.load();
        }

        // check if page is done loading
        YAHOO.lang.later(1, this, this.checkLoaded);
    };

    // call this function when you think the page might be loaded
    Renderer.prototype.checkLoaded = function () {

        // check if there are any images we are still waiting on
        if (this._imagesLoading.length > 0) {
            return;
        }

        // cancel existing timeout
        if (this._imagesTimer != null) {
            this._imagesTimer.cancel();
            this._imagesTimer = null;
        }

        // check if any resources we are still waiting on
        if (this._resourceCollection.hasLoaders() &&
            this._resourceCollection.getStatus() == ResourceLoader.Status.LOADING) {
            return;
        }

        // fire loaded event
        if (this.getState() == State.Available) {
            // set status/fire event
            this.setState(State.Loaded);
        }
    };

    // get resource loaders
    Renderer.prototype.getResourceLoaders = function() {
        return this._resourceCollection;
    };

    // add a resource to load
    Renderer.prototype.addResourceLoader = function (resource) {
        this._resourceCollection.add(resource);
    };

    Renderer.prototype.getImagesLoading = function() {
        return this._imagesLoading;
    };

    Renderer.prototype.getImagesLoaded = function() {
        return this._imagesLoaded;
    };

    Renderer.prototype.getImagesFailed = function() {
        return this._imagesFailed;
    };

    Renderer.prototype.getImagesAborted = function() {
        return this._imagesAborted;
    };

    // add an image that we will be waiting for
    // PRELOAD? http://www.phpied.com/preload-cssjavascript-without-execution/
    Renderer.prototype.addImage = function (image) {

        // generate an ID for an image if it doesn't have one
        if (image.id == '') {
            image.id = YUD.generateId();
        }

        this._imagesLoading.push(image);

        // Internet Explorer prior to IE 11 doesn't reliably raise LOAD events on images, so we must use READY_STATE_CHANGE.
        // If the image is cached locally, IE won't fire the LOAD event while the
        // onreadystate event is fired always. On the other hand, the ERROR event
        // is always fired whenever the image is not loaded successfully no matter
        // whether it's cached or not.

        // add dom events
        var loadEvent = (YAHOO.env.ua.ie && YAHOO.env.ua.ie < 11) ? 'readystatechange' : 'load';
        YUE.addListener(image, loadEvent, this._onImageEvent, image, this);
        YUE.addListener(image, 'abort', this._onImageEvent, image, this);
        YUE.addListener(image, 'error', this._onImageEvent, image, this);

        // set timestamp
        image.dateRequested = Util.Date.now();

        // cancel existing timeout and start new one
        this._startImageTimer();
    };

    // cancel existing timeout and start new one
    Renderer.prototype._startImageTimer = function () {
        if (this._imagesTimer != null) {
            this._imagesTimer.cancel();
        }
        this._imagesTimer = YAHOO.lang.later((IMAGE_TIMEOUT * 1000), this, this._onImagesTimeout);
    };

    // this function is called when an time has a timeout
    Renderer.prototype._onImagesTimeout = function () {

        Util.log('image timeout');

        // check if we can retry
        if (this._imagesRetry < IMAGE_MAX_RETRY) {
            this._imagesRetry++;

            // attempt to reload each image
            Util.Array.each(this._imagesLoading, function (image) {
                image.src = image.src;

                // set timestamp
                image.dateRequested = Util.Date.now();
            });

            this._startImageTimer();
        } else {
            // simulate abort event
            Util.Array.each(this._imagesLoading, function (image) {
                var evt = { type: 'abort' };
                this._onImageEvent(evt, image);
            }, this);
        }
    };

    // handles image DOM event handler 
    Renderer.prototype._onImageEvent = function (evt, image) {
        // BUG 160415: DOMParser can trigger image load events so we need to schedule them
        setTimeout(this._processImageEvent.bind(this, evt, image), 0);
    };
    
    // process image event (READY_STATE_CHANGE, LOAD, ABORT, and ERROR)
    Renderer.prototype._processImageEvent = function (evt, image) {

        // make sure we are waiting on this event
        if (!Util.Array.contains(this._imagesLoading, image)) {
            return;
        }

        if (evt.type == 'readystatechange') {
            // This implies that the user agent is IE
            if (image.readyState == 'complete') {
                // This is the IE equivalent of a LOAD event.
                evt = { type: 'load' }; // (NOTE: can't change evt.type property so we fake it)
            } else {
                // This may imply that the load failed.
                // Note that the image has only the following states:
                //   * uninitialized
                //   * loading
                //   * complete
                // When the ERROR or the ABORT event is fired, the readyState
                // will be either uninitialized or loading and we'd ignore those states
                // since they will be handled separately (eg: evt.type = 'ERROR').

                // Notes from MSDN : The states through which an object passes are
                // determined by that object. An object can skip certain states
                // (for example, interactive) if the state does not apply to that object.
                // see http://msdn.microsoft.com/en-us/library/ms534359(VS.85).aspx

                // The image is not loaded, ignore.
                return;
            }
        }

        // Add natural width/height properties for non-Gecko browsers.
        if (typeof image.naturalWidth == 'undefined') {
            if (evt.type == 'load') {
                image.naturalWidth = image.width;
                image.naturalHeight = image.height;
            } else {
                // This implies that the image fails to be loaded.
                image.naturalWidth = 0;
                image.naturalHeight = 0;
            }
        }

        // image load
        // this._log('image ' + evt.type + ' - ' + image.src);

        // remove dom events
        var loadEvent = (YAHOO.env.ua.ie && YAHOO.env.ua.ie < 11) ? 'readystatechange' : 'load';
        YUE.removeListener(image, loadEvent, this._onImageEvent);
        YUE.removeListener(image, 'abort', this._onImageEvent);
        YUE.removeListener(image, 'error', this._onImageEvent);

        // remove the image from waiting queue
        Util.Array.remove(this._imagesLoading, image);

        // move image into final queue
        if (evt.type == 'load') {
            this._imagesLoaded.push(image);
        } else if (evt.type == 'abort') {
            this._imagesAborted.push(image);
        } else {
            this._imagesFailed.push(image);
        } // error

        // set timestamp
        image.dateCompleted = Util.Date.now();

        // check if page is done loading
        this.checkLoaded();
    };

    Renderer.prototype.dispose = function () {
        this.id = null;
        this._html = null;
        this._container = null;
        this._doc = null;
        this._imagesLoading = null;
        this._imagesLoaded = null;
        this._imagesFailed = null;
        this._imagesAborted = null;
        this._imagesTimer = null;
        this._imagesRetry = null;
        
        this.fire('dispose');
        this.removeAllListeners();
    };

    CM.Renderer = Renderer;

})(ContentManager);
