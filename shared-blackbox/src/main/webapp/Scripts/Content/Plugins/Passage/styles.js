//*******************************************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2016 American Institutes for Research
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at 
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************************************/

/*
Plugin for adding styles to the page, passage or item. 
*/

(function (CM) {

    function match(page, entity, content) {
        return entity instanceof ContentPassage;
    }

    function Plugin_Styles(page, entity, config) {}

    CM.registerEntityPlugin('styles', Plugin_Styles, match);

    Plugin_Styles.prototype.load = function () {

        var page = this.page,
            pageEl = page.getElement(),
            entity = this.entity;

        entity.on('show', function () {
            pageEl.classList.add('passageShowing');
        });

        entity.on('hide', function () {
            pageEl.classList.remove('passageShowing');
        });

    }
    
})(ContentManager);
