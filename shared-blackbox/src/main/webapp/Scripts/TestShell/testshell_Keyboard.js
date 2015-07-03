//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
﻿/*
This file is used to listen for test shell key events.
*/

// process the keys that are pressed
function onkeyevent(e, type, key, keyCode, charCode, target) {

    // check if someone hit escape
    // bug 170010 Allow ESC to close tools and dialogs even if key events are disabled
    if (type == 'keydown' && keyCode == 27) {

        // hide all dialogs if the context menu is now showing
        TDS.ToolManager.hideAll();

        // close tutorial
        ContentManager.Dialog.hide();
    }

    if (!TestShell.enableKeyEvents) {
        return KeyEventResult.Allow;
    }

    // check if tutorial is showing
    if (ContentManager.Dialog.isShowing()) {

        if (keyCode == 77 && e.ctrlKey) { // ctrl-m
            ContentManager.Dialog.hide();
        } 

        // allow context menu to work
        if (keyCode == 13 /*enter*/) {
            return KeyEventResult.Allow;
        }

        // check if we are in content popup (tutorial, gtr)
        if (ContentManager.Dialog.containsElement(target)) {
            // allow arrow keys
            if (keyCode >= 37 && keyCode <= 40) {
                return KeyEventResult.Allow;
            }
        }

        return KeyEventResult.Stop;
    }

    // if an shift-arrow key is used while not in caret mode and not in a textbox
    // BUG #15824 : Able to highlight both Questions and Answers
    if (keyCode >= 37 && keyCode <= 40 && e.shiftKey && !Util.Event.inTextInput(e) && !Mozilla.inCaretMode()) {
        return KeyEventResult.Stop;
    }

    // this is for debug purposes only (ctrl-alt-shift-D)
    try {
        if (e.ctrlKey && e.altKey && e.shiftKey && type == 'keyup' && keyCode == 68) {
            // TestShell.Logging.logServerDebug();
            return KeyEventResult.Matched;
        }
    } catch (ex) {
    }

    if (e.ctrlKey && !e.shiftKey && type == 'keypress') {
        // Zooming: OS X 10.3 - BUG #15296
        if (keyCode == 0 && navigator.userAgent.indexOf('PPC Mac OS X') != -1) {
            if (charCode == 61) { // +
                TestShell.UI.zoomIn();
                return KeyEventResult.Matched;
            } 
            if (charCode == 31) { // -
                TestShell.UI.zoomOut();
                return KeyEventResult.Matched;
            } 
        }
    } else if (e.ctrlKey && !e.shiftKey && type == 'keyup') {

        // Zooming: All OS's
        if (keyCode == 107 /* add key on numeric kybd */ || keyCode == 61 /*mac*/ || keyCode == 187 /* =/+ key */ ) { // +
            TestShell.UI.zoomIn();
            return KeyEventResult.Matched;
        } 

        if (keyCode == 109 /* subtract key on numeric kybd */ || keyCode == 189 /* -/_ key */ || keyCode == 173 /* -/_ Firefox */) { // -
            TestShell.UI.zoomOut();
            return KeyEventResult.Matched;
        } 

        switch (key) {

            // navigation 
            case 'Left':
                TestShell.Navigation.back();
                return KeyEventResult.Matched;
            case 'Right':
                TestShell.Navigation.next();
                return KeyEventResult.Matched;

            // global menu
            case 'G':
                TestShell.UI.showGlobalContextMenu(e);
                return KeyEventResult.Matched;
        }
    }

    return KeyEventResult.Ignored;
}