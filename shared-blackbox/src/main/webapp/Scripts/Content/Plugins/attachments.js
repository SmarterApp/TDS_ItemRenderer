//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
﻿// this event checks when page is ready and then goes through all the links to 
// resources like PDF and RTF and makes sure that they are opened in a different tab
(function(CM) {

    // find attachment links
    function match(page) {
        var pageEl = page.getElement();
        var links = Util.Dom.getElementsByTagName('a', pageEl);
        var attachments = links.filter(function (linkEl) {
            return '.pdf .rtf'.indexOf(linkEl.href) != -1;
        });
        return (attachments.length > 0) ? attachments : null;
    }

    function Plugin(page) {}

    CM.registerPagePlugin('attachments', Plugin, match);

    Plugin.prototype.init = function(links) {
        links.forEach(function(linkEl) {
            linkEl.target = '_blank';
        });
    }

})(window.ContentManager);