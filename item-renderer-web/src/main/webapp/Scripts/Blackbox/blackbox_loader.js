//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
﻿/* The external blackbox API */

var BlackboxLoader = 
{
    _id: 'blackbox'
};

// Cross-browser function for getting the document element of a frame or iframe.
BlackboxLoader._getFrameContentDocument = function(frame)
{
    if (YAHOO.env.ua.webkit) return (frame.document || frame.contentWindow.document);
    else return (frame.contentDocument || frame.contentWindow.document);
};

// Cross-browser function for getting the window of a frame or iframe.
BlackboxLoader._getFrameContentWindow = function(frame)
{
    var getWindow = function(doc) { return (doc.parentWindow || doc.defaultView); };
    return frame.contentWindow || getWindow(this._getFrameContentDocument(frame));
};

// get the document containing the blackbox
BlackboxLoader.getDoc = function()
{
    var frameElement = document.getElementById(this._id);
    return this._getFrameContentDocument(frameElement);
};

// get the window containing the blackbox
BlackboxLoader.getWin = function()
{
    var frameElement = document.getElementById(this._id);
    return this._getFrameContentWindow(frameElement);
};

// get the internal blackbox API
BlackboxLoader.getAPI = function()
{
    var bwin = this.getWin();
    return (bwin ? bwin.Blackbox : null);
};

// get the content manager
BlackboxLoader.getContentManager = function()
{
    var bwin = this.getWin();
    return (bwin ? bwin.ContentManager : null);
};

// get the YAHOO library root
BlackboxLoader.getYUI = function()
{
    var bwin = this.getWin();
    return (bwin ? bwin.YAHOO : null);
};

// get the generic utilities
BlackboxLoader.getUtils = function()
{
    var bwin = this.getWin();
    return (bwin ? bwin.Util : null);
};

// create the blackbox iframe as a child of an existing element
BlackboxLoader.create = function(parentId, url)
{
    // create frame
    var frameElement;

    // IE does not allow the setting of id and name attributes as object properties via createElement()
    var docMode = document.documentMode ? document.documentMode : 0;

    if (YAHOO.env.ua.ie > 0 && docMode < 9)
    {
        frameElement = document.createElement('<iframe id="' + this._id + '" name="' + this._id + '">');
    }
    else
    {
        frameElement = document.createElement('iframe');
        frameElement.setAttribute('id', this._id);
        frameElement.setAttribute('name', this._id);
    }

    // add attributes
    frameElement.setAttribute('border', 0);
    frameElement.setAttribute('width', '100%');
    frameElement.setAttribute('height', '100%');
    frameElement.src = url;

    // add frame
    var frameParent = (typeof parentId == 'string') ? document.getElementById(parentId) : parentId;
    frameParent.appendChild(frameElement);
};

