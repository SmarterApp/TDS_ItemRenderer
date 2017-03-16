//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
﻿/*
Run MathJax to render MathML content (if any) on browsers that don't natively support it.
*/

(function (CM) {

    function match(page, content) {
        // If MathJax has not been included, there is nothing we can do here.
        if (window.MathJax === undefined) {
            return false;
        }

        // Does browser support MathML tags natively?
        if (Util.Browser.supportsMathML()) {
            return false;
        }

        // MathJax is included and the browser does not support MathML. This plugin will invoke MathJax to render MathML embedded in content
        return true;
    }

    function Plugin_MathJax(page, config) {
    }

    CM.registerPagePlugin('mathjax', Plugin_MathJax, match);

    Plugin_MathJax.prototype.load = function () {
        // Perform MathJax typesetting if needed on newly loaded pages
        // FB-89368 CRS item content uses MathML formatting on non-EquationEditor items, 
        // so typesetting needs to occur once the page is loaded   
        var pageEl = this.page.getElement();

        if (pageEl.getElementsByTagName("math").length > 0) {
            MathJax.Hub.Queue(['Typeset', MathJax.Hub, pageEl.id]);
        }        
    }

})(ContentManager);
