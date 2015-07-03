//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
﻿// image loader
// note: src can be an image already added to the page or just a url
ResourceLoader.Image = function(src, timeoutInterval, retriesMax)
{
    ResourceLoader.Image.superclass.constructor.call(this);

    if (YAHOO.lang.isString(src))
    {
        this._img = new Image(); // new DOM image
        this._src = src; // new url
    }
    else
    {
        this._img = src; // existing HTML image
        this._src = this._img.src; // current url
    }

    this._timeoutInterval = timeoutInterval || 0;
    this._timeoutObj = null;

    this._retriesMax = retriesMax || 0;
    this._retries = 0;
};

ResourceLoader.extend(ResourceLoader.Image);

// get the DOM image object
ResourceLoader.Image.prototype.getElement = function() { return this._img; };

// add an image that we will be waiting for
ResourceLoader.Image.prototype.load = function()
{
    // generate an ID for an image if it doesn't have one
    if (this._img.id == '') this._img.id = YAHOO.util.Dom.generateId();

    // Internet Explorer doesn't reliably raise LOAD events on images, so we must use READY_STATE_CHANGE.
    // If the image is cached locally, IE won't fire the LOAD event while the
    // onreadystate event is fired always. On the other hand, the ERROR event
    // is always fired whenever the image is not loaded successfully no matter
    // whether it's cached or not.

    // attach dom events
    this._attachEvents();

    // if this image does not already have a source then add it
    if (this._img.src == '') this._img.src = this._src;

    // set status
    this.setStatus(ResourceLoader.Status.LOADING);
    this._startTimer();
    return true;
};

// handles dom image events
ResourceLoader.Image.prototype._onEvent = function(evt) {
    // BUG 160415: DOMParser can trigger image load events so we need to schedule them
    setTimeout(this._processEvent.bind(this, evt), 0);
};

// process image events (READY_STATE_CHANGE, LOAD, ABORT, and ERROR)
ResourceLoader.Image.prototype._processEvent = function(evt)
{
    this._stopTimer();

    var eventType = evt.type;

    if (eventType == 'readystatechange')
    {
        // This implies that the user agent is IE
        if (this._img.readyState == 'complete')
        {
            // This is the IE equivalent of a LOAD event.
            eventType = 'load';
        }
        else
        {
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
    if (typeof this._img.naturalWidth == 'undefined')
    {
        if (eventType == 'load')
        {
            this._img.naturalWidth = this._img.width;
            this._img.naturalHeight = this._img.height;
        }
        else
        {
            // This implies that the image fails to be loaded.
            this._img.naturalWidth = 0;
            this._img.naturalHeight = 0;
        }
    }

    // image load
    // this._log('image ' + evt.type + ' - ' + image.src);

    // remove dom events
    this._removeEvents();

    // set status
    if (eventType == 'load') this.setStatus(ResourceLoader.Status.COMPLETE);
    else this.setStatus(ResourceLoader.Status.ERROR);
};

ResourceLoader.Image.prototype._attachEvents = function()
{
    var loadEvent = (YAHOO.env.ua.ie && YAHOO.env.ua.ie < 11) ? 'readystatechange' : 'load';
    YUE.addListener(this._img, loadEvent, this._onEvent, this, true);
    YUE.addListener(this._img, 'abort', this._onEvent, this, true);
    YUE.addListener(this._img, 'error', this._onEvent, this, true);
};

ResourceLoader.Image.prototype._removeEvents = function()
{
    var loadEvent = (YAHOO.env.ua.ie && YAHOO.env.ua.ie < 11) ? 'readystatechange' : 'load';
    YUE.removeListener(this._img, loadEvent, this._onEvent);
    YUE.removeListener(this._img, 'abort', this._onEvent);
    YUE.removeListener(this._img, 'error', this._onEvent);
};

// start the timeout timer
ResourceLoader.Image.prototype._startTimer = function()
{
    this._stopTimer();

    // start new timer
    if (this._timeoutInterval > 0)
    {
        this._timeoutObj = YAHOO.lang.later(this._timeoutInterval, this, this._onTimeout);
    }
};

// stop the timeout timer
ResourceLoader.Image.prototype._stopTimer = function()
{
    // clear any existing timer
    if (this._timeoutObj != null)
    {
        this._timeoutObj.cancel();
        this._timeoutObj = null;
    }
};

// this function is called when an time has a timeout
ResourceLoader.Image.prototype._onTimeout = function()
{
    // only do anything if we are trying to load
    if (this.getStatus() != ResourceLoader.Status.LOADING) return;

    // check if we can retry
    if (this._retries < this._retriesMax)
    {
        this._retry();
    }
    else
    {
        // simulate abort event
        this._removeEvents();
        this.setStatus(ResourceLoader.Status.ABORT);
    }
};

// call this function to retry loading the image
ResourceLoader.Image.prototype._retry = function()
{
    this._retries++;
    this._img.src = this._src;
    this._startTimer();
};

/************************************************************************************/

ResourceLoader.ImageCollection = function()
{
    ResourceLoader.ImageCollection.superclass.constructor.call(this);
};

YAHOO.lang.extend(ResourceLoader.ImageCollection, ResourceLoader.Collection);

ResourceLoader.ImageCollection.prototype.addImage = function(url)
{
    this.add(new ResourceLoader.Image(url));
};

ResourceLoader.ImageCollection.prototype.getImage = function(url)
{
    var imageLoaders = this.getLoaders();

    for (var i = 0; i < imageLoaders.length; i++)
    {
        var image = imageLoaders[i].getElement();
        if (image.src == url) return image;
    }

    return null;
};

ResourceLoader.ImageCollection.prototype.getErrors = function()
{
    var imageErrors = [];
    var imageLoaders = this.getLoaders();

    for (var i = 0; i < imageLoaders.length; i++)
    {
        var imageLoader = imageLoaders[i];

        if (imageLoader.getStatus() != ResourceLoader.Status.COMPLETE)
        {
            imageErrors.push(imageLoader.getElement());
        }
    }

    return imageErrors;
};

ResourceLoader.ImageCollection.prototype.load = function(callbackSuccess, callbackFailure)
{
    if (YAHOO.lang.isFunction(callbackSuccess))
    {
        this.subscribe(ResourceLoader.Status.COMPLETE, callbackSuccess, this);
    }

    if (YAHOO.lang.isFunction(callbackFailure))
    {
        this.subscribe(ResourceLoader.Status.ERROR, callbackFailure, this);
        this.subscribe(ResourceLoader.Status.ABORT, callbackFailure, this);
    }

    ResourceLoader.ImageCollection.superclass.load.call(this);
};

