//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
/*
This code is used to initialize the blackbox xhr handler javascript link.
*/

// try and use the original version of jQuery that was installed in this site
(function ($, jQuery) {

    var _$ = $;
    var _jQuery = jQuery;

    // swap out to older version
    jQuery.noConflict(true);

    // reassign vars if no previous ver
    if (typeof window.$ == 'undefined') {
        window.$ = _$;
        window.jQuery = _jQuery;
    }

})($, jQuery);

// initialize the blackbox
(function()
{
    var testShellLoader = function()
    {
        var tsEl = document.getElementById(blackboxConfig.container);
        var tsTemplateEl = document.getElementById('testShellHtml');

        // check if template exists
        if (tsEl == null || tsTemplateEl == null) return;

        // load template html
        // var tsTemplate = tsTemplateEl.textContent || tsTemplateEl.innerText;
        var tsTemplate = YAHOO.lang.trim(tsTemplateEl.innerHTML);
        tsEl.innerHTML = tsTemplate;
    };

    var seedLoader = function()
    {
        // set base url
        TDS.baseUrl = blackboxConfig.baseUrl;
    
        // load test shell template
        testShellLoader();

        // schedule blackbox init
        YAHOO.lang.later(0, Blackbox, Blackbox.init);
    };

    // wait for dom to load
    YAHOO.util.Event.on(window, 'load', seedLoader);

})();
