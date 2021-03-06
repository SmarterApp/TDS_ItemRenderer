//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
/*
Setup item tools container
*/

(function (CM) {

    // check for passage and element
    function match(page, entity, content) {
        return (entity instanceof ContentItem);
    }

    function Plugin_ITools(page, entity, el) {
        this.el = el;
    }

    CM.registerEntityPlugin('item.tools', Plugin_ITools, match);

    Plugin_ITools.prototype.load = function () {

        var item = this.entity;
        var itemEl = item.getElement();

        // remove old comment box div
        var commentBoxEl = document.getElementById('Item_CommentBox_' + item.position);
        $(commentBoxEl).remove();

        // check if tools div already exists
        var toolsEl = $('.itemTools', itemEl).get(0);
        if (toolsEl) return;
        
        // get the current mark comment span
        var markCommentEl = $('.markComment', itemEl).get(0);
        if (!markCommentEl) return;

        // create new container for item tools
        toolsEl = document.createElement('div');
        toolsEl.className = 'toolsContainer itemTools markComment';

        // insert new tools container right after span
        $(markCommentEl).after(toolsEl);

        // remove span
        $(markCommentEl).remove();

    }

})(window.ContentManager);