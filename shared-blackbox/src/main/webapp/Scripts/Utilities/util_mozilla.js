//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
﻿// REQUIRES: None

// Code that is specific for mozilla browsers:

/*
MOZILLA SIGNED SCRIPTS:
http://www.mozilla.org/projects/security/components/signed-scripts.html#privs-list
netscape.security.PrivilegeManager.enablePrivilege("UniversalPreferencesRead UniversalPreferencesWrite")
*/

var Mozilla = {};

Mozilla.SecurityPrivilege =
{
    Unavailable: 0, // browser does not support enablePrivilege
    Disabled: 1, // browser supports enablePrivilege but not enabled right now
    Available: 2 // browser supports enablePrivilege and it is enabled
};

Mozilla.UniversalConnect =
{
    Unknown: 0, // not sure if universal connect is enabled
    Denied: 1, // universal connect does not exist or was request was denied
    Allowed: 2 // universal connect was allowed
};

// indicate if universal connect is enabled
Mozilla._universalConnect = Mozilla.UniversalConnect.Unknown;

Mozilla._lastException = null;

// Check if this browser allows higher privileges (Mozilla)
Mozilla.allowPrivileged = function()
{
    // check for PrivilegeManager (only in Mozilla browers)
    try
    {
        if (typeof netscape == 'object' &&
            typeof netscape.security == 'object' &&
            typeof netscape.security.PrivilegeManager == 'object') {
            return Mozilla.SecurityPrivilege.Available;
        }
    }
    catch (ex)
    {
        // NOTE: This stuff won't run anymore since we switching to checking for PrivilegeManager
        Mozilla._lastException = ex;

        // If the error we got was not the browser needing permission then this browser is not mozilla
        var errorMessage = (typeof ex == 'string') ? ex : ex.message; // FF2 exceptions are just strings

        // Check if we got a permission denied error which indicates this browser 
        // does have preferences we just aren't allowed to modify them right now
        if (errorMessage.indexOf('Permission denied') != -1)
        {
            return Mozilla.SecurityPrivilege.Disabled;
        }
    }

    return Mozilla.SecurityPrivilege.Unavailable;
};

// Enables heightened privileges when executing a function.
// You can call this without a callback if you want to see if this browser supports execute privileges.
// NOTE: If privileges are denied then this will stop requesting them.
// NOTE: The callback function will only get executed if we gain security privileges.
Mozilla.execPrivileged = function (callback, browserMinVersion, browserMaxVersion)
{
    // check if universal connect was denied
    if (Mozilla._universalConnect == Mozilla.UniversalConnect.Denied) return false;

    // check if browser supports changing security
    if (Mozilla._universalConnect == Mozilla.UniversalConnect.Unknown)
    {
        var securityPrivilege = Mozilla.allowPrivileged();

        // check if browser even supports security privileges (Mozilla)
        if (securityPrivilege == Mozilla.SecurityPrivilege.Unavailable)
        {
            Mozilla._universalConnect = Mozilla.UniversalConnect.Denied;
            return false;
        }
    }

    // check if the browser meets the version requirements
    var minBrowser = YAHOO.lang.isNumber(browserMinVersion) ? browserMinVersion : -1;
    var maxBrowser = YAHOO.lang.isNumber(browserMaxVersion) ? browserMaxVersion : -1;
    if (minBrowser > 0 && Util.Browser.getFirefoxVersion() <= minBrowser ||
        maxBrowser > 0 && Util.Browser.getFirefoxVersion() >= maxBrowser)
        return false;    

    try
    {
        // Allows special browser privileges when executing a function. This only applies to the current scope
        // and calls within it. Once the scope is exited the privileges revert back.
        // DEV: If you are using regular FF make sure set about:config "signed.applets.codebase_principal_support" as true.
        netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
        Mozilla._universalConnect = Mozilla.UniversalConnect.Allowed;
    }
    catch (ex)
    {
        Mozilla._lastException = ex;

        // approval was denied!
        Mozilla._universalConnect = Mozilla.UniversalConnect.Denied;
        return false;
    }

    if (typeof (callback) == 'function') callback();
    return true;
};

// a helper function for getting a preference value
Mozilla.getPreference = function(name)
{
    var value;

    Mozilla.execPrivileged(function()
    {
        value = Mozilla.preference(name);
    });

    return value;
};

// a helper function for setting a single preference value
Mozilla.setPreference = function (name, value, browserMinVersion, browserMaxVersion)
{
    var success = false;

    Mozilla.execPrivileged(function()
    {
        Mozilla.preference(name, value);
        success = true;
    }, browserMinVersion, browserMaxVersion);

    return success;
};

// Enable/disable caret mode (call with no arguments to toggle mode)
Mozilla.enableCaretMode = function(enable)
{
    var allowed = Mozilla.execPrivileged(function()
    {
        if (typeof (enable) == 'undefined')
        {
            enable = !Mozilla.getPreference('accessibility.browsewithcaret');
        }

        Mozilla.setPreference('accessibility.warn_on_browsewithcaret', false);
        Mozilla.setPreference('accessibility.browsewithcaret', enable);
    });

    return (allowed && enable);
};

// Are we in caret mode?
Mozilla.inCaretMode = function()
{
    return Mozilla.getPreference('accessibility.browsewithcaret');
};

// enable tabbing
Mozilla.enableTabFocus = function()
{
    return Mozilla.setPreference('accessibility.tabfocus', 7);
};

// replacement for navigator.preference
Mozilla.preference = function(name, value)
{
    // check if preference api exists
    if (typeof (navigator) == 'object' &&
        typeof (navigator.preference) == 'function')
    {
        return navigator.preference(name, value);
    }

    // create return value
    var rv;

    // check if we have access to get components
    if (typeof (Components) != 'object' ||
        typeof (Components.classes) != 'object') return rv;

    // Helpful links:
    // https://bugzilla.mozilla.org/show_bug.cgi?id=568059
    // http://hg.mozilla.org/mozilla-central/rev/d2b01fbc5480
    // https://groups.google.com/group/firebug/browse_thread/thread/7aa62c4a0ded05f7

    // get preferences service and the root branch
    var prefService = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
    var prefBranch = prefService.getBranch('');

    // check if there was a value passed in
    if (YAHOO.lang.isUndefined(value))
    {
        // GET PREFERENCE CODE:
        var prefType = prefBranch.getPrefType(name);

        switch (prefType)
        {
            case prefBranch.PREF_STRING: rv = prefBranch.getCharPref(name); break;
            case prefBranch.PREF_INT: rv = prefBranch.getIntPref(name); break;
            case prefBranch.PREF_BOOL: rv = prefBranch.getBoolPref(name); break;
            default: return null;
        }
    }
    else
    {
        // SET PREFERENCE CODE:
        if (YAHOO.lang.isString(value)) rv = prefBranch.setCharPref(name, value);
        else if (YAHOO.lang.isNumber(value)) rv = prefBranch.setIntPref(name, value);
        else if (YAHOO.lang.isBoolean(value)) rv = prefBranch.setBoolPref(name, value);
        else if (YAHOO.lang.isNull(value)) rv = prefBranch.deleteBranch(name);
    }

    return rv;
};

// enable screenshot
Mozilla.enableScreenshots = function () {

    // instantiate two processes for enabling screenshot
    var processEnable1 = Components.classes["@mozilla.org/process/util;1"]
              .createInstance(Components.interfaces.nsIProcess);
    if (processEnable1 == null) {
        return false;
    }
    var processEnable2 = Components.classes["@mozilla.org/process/util;1"]
              .createInstance(Components.interfaces.nsIProcess);
    if (processEnable2 == null) {
        return false;
    }

    // intantiate instance for local files
    var fileEnable1 = Components.classes["@mozilla.org/file/local;1"]
                     .createInstance(Components.interfaces.nsILocalFile);
    if (fileEnable1 == null) {
        return false;
    }
    var fileEnable2 = Components.classes["@mozilla.org/file/local;1"]
                     .createInstance(Components.interfaces.nsILocalFile);
    if (fileEnable2 == null) {
        return false;
    }

    // set the commands to enable screenshots
    try {
        fileEnable1.initWithPath("/usr/bin/defaults");
    } catch (err) {
        return false;
    }

    try {
        fileEnable2.initWithPath("/usr/bin/killall");
    } catch (err) {
        return false;
    }

    // run the processes with the commands and parameters
    try {
        processEnable1.init(fileEnable1);
    } catch (err) {
        return false;
    }

    var args = [];
    args.push("write");
    args.push("com.apple.screencapture");
    args.push("location");
    args.push("~/Desktop");

    try {
        processEnable1.run(true, args, args.length);
    } catch (err) {
        return false;
    }

    try {
        processEnable2.init(fileEnable2);
    } catch (err) {
        return false;
    }

    args = [];
    args.push("SystemUIServer");

    try {
        processEnable2.run(true, args, args.length);
    } catch (err) {
        return false;
    }

    return true;
};

// disable screenshot
Mozilla.disableScreenshots = function () {

    // instantiate two processes for disabling screenshot
    var processDisable1 = Components.classes["@mozilla.org/process/util;1"]
              .createInstance(Components.interfaces.nsIProcess);
    if (processDisable1 == null) {
        return false;
    }
    var processDisable2 = Components.classes["@mozilla.org/process/util;1"]
              .createInstance(Components.interfaces.nsIProcess);
    if (processDisable2 == null) {
        return false;
    }

    // intantiate instance for local files
    var fileDisable1 = Components.classes["@mozilla.org/file/local;1"]
                     .createInstance(Components.interfaces.nsILocalFile);
    if (fileDisable1 == null) {
        return false;
    }
    var fileDisable2 = Components.classes["@mozilla.org/file/local;1"]
                     .createInstance(Components.interfaces.nsILocalFile);
    if (fileDisable2 == null) {
        return false;
    }

    // set the commands to disable screenshots
    try {
        fileDisable1.initWithPath("/usr/bin/defaults");
    } catch (err) {
        return false;
    }

    try {
        fileDisable2.initWithPath("/usr/bin/killall");
    } catch (err) {
        return false;
    }

    // run the processes with the commands and parameters
    try {
        processDisable1.init(fileDisable1);
    } catch (err) {
        return false;
    }

    var args = [];
    args.push("write");
    args.push("com.apple.screencapture");
    args.push("location");
    args.push("/tmp");

    try {
        processDisable1.run(true, args, args.length);
    } catch (err) {
        return false;
    }

    try {
        processDisable2.init(fileDisable2);
    } catch (err) {
        return false;
    }

    args = [];
    args.push("SystemUIServer");

    try {
        processDisable2.run(true, args, args.length);
    } catch (err) {
        return false;
    }

    return true;
};

// add window functions in this block
(function (Mozilla, Components) {

    function getWindowMediator() {
        return Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator);
    }

    function getRecentWindow() {
        var wm = getWindowMediator();
        return wm.getMostRecentWindow("navigator:browser");
    }

    // put the browser into full screen
    Mozilla.fullscreen = function () {
        try {
            return Mozilla.execPrivileged(function () {
                var win = getRecentWindow();
                if (win) {
                    win.moveTo(0, 0);
                    win.resizeTo(screen.width, screen.height);
                    win.BrowserFullScreen();
                }
            });
        } catch (ex) {
            return false;
        }
    };

    // move the browser window to specific x/y
    Mozilla.moveWindowTo = function (x, y) {
        try {
            return Mozilla.execPrivileged(function () {
                var win = getRecentWindow();
                if (win) {
                    win.moveTo(x, y);
                }
            });
        } catch (ex) {
            return false;
        }
    };

    // resize the browser window
    Mozilla.resizeWindowTo = function (width, height) {
        try {
            return Mozilla.execPrivileged(function () {
                var win = getRecentWindow();
                if (win) {
                    win.resizeTo(width, height);
                }
            });
        } catch (ex) {
            return false;
        }
    };

})(window.Mozilla, window.Components);
