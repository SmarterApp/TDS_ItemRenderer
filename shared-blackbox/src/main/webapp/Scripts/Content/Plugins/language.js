//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
/*
Add language tags to the content.
*/

(function (CM) {

    function match(page, entity, content) {
        // only process ITS items (leave QTI alone)
        return !CM.QTI.isNativeEntity(entity);
    }

    function Plugin_Lang(page, entity, config) {
    }

    CM.registerEntityPlugin('language', Plugin_Lang, match, {
        priority: 301, // <-- needs to be after all rendering
        defer: true
    });

    Plugin_Lang.prototype.load = function () {
        var el = this.entity.getElement();
        tds.language.tagElements(el);
    }

})(ContentManager);
