//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
﻿// This file contains common functions that can be used on any project.

// Requires: YUI - yahoo-dom-event.js
// Optional JSON: YUI - connection.js
// Optional XML: zxml.js

var YUE = YAHOO.util.Event;
var YUD = YAHOO.util.Dom;
var YUC = YAHOO.util.Connect;
var YCE = YAHOO.util.CustomEvent;
var YLang = YAHOO.util.Lang;

/*
var $ = YAHOO.util.Dom.get; // get by ID
var $$ = YAHOO.util.Dom.getElementsByClassName; // get by class
var Dom = YAHOO.util.Dom;
var Event = YAHOO.util.Event;
*/

/*
LIBRARIES:
- http://closure-library.googlecode.com/svn/docs/index.html
- https://github.com/jquery/jquery/tree/master/src
- http://www.commonjs.org/specs/
    + https://github.com/kriszyp/commonjs-utils/tree/master/lib
    + http://www.sitepen.com/blog/2010/03/02/commonjs-utilities/

TODO:
- http://wiki.commonjs.org/wiki/Promises/A
    + https://github.com/kriszyp/node-promise
    + http://intridea.com/2011/2/8/fun-with-jquery-deferred
- https://github.com/kriszyp/commonjs-utils/blob/master/lib/observe.js (AOP style event handling, for listening for method calls)
*/

// fix missing console
(function() {
    if (typeof window.console != 'object') {
        window.console = {
            log: function () { },
            error: function () { },
            warn: function () { },
            info: function () { },
            dir: function () { }
        };
    }
})();

var Util = {};

(function(Util) {

    var logs = [];
    var logMax = 500;

    function LogEvent(message) {
        this.message = message;
        this.date = new Date();
    }

    LogEvent.prototype.toString = function() {
        return '* ' + Util.Date.formatTime(this.date) + ' - ' + this.message;
    };

    Util.log = function(msg) {
        // create log event
        var logEvent = new LogEvent(msg);

        // add log to collection
        logs.push(logEvent);
        if (logs.length > logMax) {
            logs = logs.slice(1);
        }

        if (typeof console.log == 'function') {
            console.log(logEvent.toString());
        }

        return logEvent;
    };

    Util.logInfo = function(msg) {
        if (typeof console.info == 'function') {
            console.info(msg);
        }
    };

    Util.logError = function(msg) {
        if (typeof console.error == 'function') {
            console.error(msg);
        }
    };

    Util.dir = function(msg) {
        if (typeof console.dir == 'function') {
            console.dir(msg);
        }
    };

    Util.getDebugLog = function() {
        return logs.join('\n');
    };

    // queue some work to be done when the current function that this is called from is completed
    Util.queueWork = function(fn /* function */, context /* object */) {
        context = context || window;
        return YAHOO.lang.later(0, context, fn);
    };

})(Util);

Util.Asserts = { };

Util.Asserts.assert = function(condition, opt_message)
{
    if (!condition)
    {
        var message = 'Assertion failed';

        if (opt_message)
        {
            message += ': ' + opt_message;
        }

        throw new Error(message);
    }

    return condition;
};
