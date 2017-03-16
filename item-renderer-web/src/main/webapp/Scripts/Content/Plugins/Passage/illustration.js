//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
/*
Creates a fake passage using the illustration.
*/

(function (CM) {

    function match(page, content) {
        var passage = page.getPassage();
        var pageEl = page.getElement();
        var passageEl = Util.Dom.getElementByClassName('thePassage', 'div', pageEl);
        return (!passage && passageEl);
    }

    function Plugin_FakePass(page, config) {
    }

    CM.registerPagePlugin('fakepassage', Plugin_FakePass, match);

    Plugin_FakePass.prototype.load = function () {

        var page = this.page;
        var items = page.getItems();
        var firstItem = items[0];

        var passage = ContentManager.createPassage(page, {
            bankKey: firstItem.bankKey,
            itemKey: 0
        });
        page.setPassage(passage);
    }

})(ContentManager);
