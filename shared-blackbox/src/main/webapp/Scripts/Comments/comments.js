//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
/*
This code in this file is for showing the comments dialog and saving them.
NOTE: I only use the comments accommodation at the test level and not for segments.
*/

TestShell.Comments = 
{
    // track YUI dialogs created for comments
    _overlayManager: new YAHOO.widget.OverlayManager(),
    
    // the different comment instances
    _itemComments: null,
    _globalComments: null
};

TestShell.Comments.init = function() {
    
    this._itemComments = new TestShell.Comments.Item();
    this._itemComments.render();

    this._globalComments = new TestShell.Comments.Global();
    this._globalComments.render();
};

TestShell.Comments.showItem = function(obj) {
    this._itemComments.show(obj);
};

TestShell.Comments.showGlobal = function() {
    this._globalComments.show();
};

TestShell.Comments.hide = function() {
    this._itemComments.hide();
    this._globalComments.hide();
};

TestShell.Comments.isShowing = function() {
    return this._itemComments.isShowing() || 
           this._globalComments.isShowing();
};

