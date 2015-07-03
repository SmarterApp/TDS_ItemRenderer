//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
﻿window.TDS = window.TDS || {};

/*
SB JAWS FIX:
Basically, what you need to do is JAWS user settings, add to the confignames.ini a single line (after Firefox3=firefox) the line 
OaksSecureBrowser5.0=firefox
JAWS user setting is an option in the program list
*/

TDS.ARIA = (function() {

    // TODO: people should be able to register these
    var SELECTOR_ARIA_HIDDEN = '.tds-ot-wrapper, #topBar, #contents';

    var aria = {};

    function getStatus(container) {
        var statusEl = $(container).children('.startContent')[0];
        if (!statusEl) {
            var html = '<div tabindex="-1" class="startContent">Beginning of Content</div>';
            statusEl = $(html).prependTo(container)[0];
        }
        return statusEl;
    }

    aria.setStatus = function (container, msg) {
        var statusEl = getStatus(container);
        $(statusEl).text(msg);
        return statusEl;
    };

    // hide the document's main content
    aria.hideContent = function() {
        $(SELECTOR_ARIA_HIDDEN).attr('aria-hidden', 'true');
    };

    // show the document's main content
    aria.showContent = function() {
        $(SELECTOR_ARIA_HIDDEN).attr('aria-hidden', 'false');
    };

    return aria;

})();

