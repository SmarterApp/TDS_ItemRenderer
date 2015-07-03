//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
/*
Accommodations
*/

(function (CM) {

    function match(page, content) {
        return page.getAccommodations() != null;
    }

    function Plugin_Accs(page, config) {
    }

    CM.registerPagePlugin('accommodations', Plugin_Accs, match);

    Plugin_Accs.prototype.beforeShow = function () {
        var page = this.page;
        var pageAccs = page.getAccommodations();
        Accommodations.Manager.updateCSS(page.getBody(), pageAccs.getId());
    }

})(ContentManager);
