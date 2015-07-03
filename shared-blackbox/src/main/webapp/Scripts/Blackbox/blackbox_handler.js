//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
/*
This code is used to load the test shell and blackbox resources.
*/

(function()
{
    // check for config
    if (typeof blackboxConfig != 'object') return;

    // set config defaults
    if (!blackboxConfig.container) blackboxConfig.container = 'testShell';

    var scriptContents = '<script type="text/javascript">{0}</script>';
    var templateContents = '<script id="{0}" type="text/html">{1}</script>';
    var scriptLink = '<script type="text/javascript" src="{0}"><\/script>';
    var styleLink = '<link type="text/css" media="all" rel="stylesheet" href="{0}" />';

    var createStyleLink = function(src) {
        return styleLink.replace('{0}', src);
    };

    var createScriptLink = function(src) {
        return scriptLink.replace('{0}', src);
    };

    var createTemplate = function(id, src) {
        return templateContents.replace('{0}', id).replace('{1}', src);
    };

    var blackboxStyleTags = [];
    var blackboxScriptTags = [];
    
    // resolve style url's
    for (var i = 0, ii = blackboxConfig.styles.length; i < ii; i++)
    {
        var blackboxStyle = blackboxConfig.styles[i];
        // blackboxStyle = blackboxConfig.baseUrl + blackboxStyle;
        blackboxStyleTags.push(createStyleLink(blackboxStyle));
    }

    // resolve script url's
    for (var i = 0, ii = blackboxConfig.scripts.length; i < ii; i++) 
    {
        var blackboxScript = blackboxConfig.scripts[i];
        // blackboxScript = blackboxConfig.baseUrl + blackboxScript;
        blackboxScriptTags.push(createScriptLink(blackboxScript));
    }
    
    // write out style tags
    document.write(blackboxStyleTags.join(''));

    // write out script tags
    document.write(blackboxScriptTags.join(''));
    
    // write out test shell template
    var tsTemplateTag = createTemplate('testShellHtml', blackboxConfig.testShellHtml);
    document.write(tsTemplateTag);
})();
