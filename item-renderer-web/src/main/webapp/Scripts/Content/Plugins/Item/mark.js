//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
/*
Item Tool: Mark for Review
*/

(function (CM) {

    function match(page, entity, content) {
        // check if item
        if (entity instanceof ContentItem) {
            // check if the mark for review acc is enabled for items
            var accProps = page.getAccProps();
            if (accProps.hasMarkForReview()) {
                // return if item is marked
                return {
                    marked: content.marked
                }
            }
        }
        return false;
    }

    function Plugin_Mark(page, entity, config) {
        this.marked = config.marked;
    }

    CM.registerEntityPlugin('item.mark', Plugin_Mark, match);

    Plugin_Mark.prototype.update = function () {

        var item = this.entity;
        var itemEl = item.getElement();

        // update item
        if (this.marked) {
            YUD.addClass(itemEl, 'itemMarked');
        } else {
            YUD.removeClass(itemEl, 'itemMarked');
        }

        // update link
        var markLinkEl = item.getToolElement('markReview');
        if (markLinkEl) {
            if (this.marked) {
                YUD.addClass(markLinkEl, 'markReviewMarked');
                markLinkEl.setAttribute('aria-checked', 'true');
            } else {
                YUD.removeClass(markLinkEl, 'markReviewMarked');
                markLinkEl.setAttribute('aria-checked', 'false');
            }
        }
    }

    Plugin_Mark.prototype.toggle = function () {

        // set boolean
        this.marked = !this.marked;

        // update styles
        this.update();

        var item = this.entity;
        console.log('Item Tool: Mark', this.marked, item);

        // TDS notification
        if (typeof (window.tdsUpdateItemMark) == 'function') {
            window.tdsUpdateItemMark(item.position, this.marked);
        }
    }

    Plugin_Mark.prototype.load = function () {

        //Perform update on display styles regardless of menu options
        this.update();
        
        // check if we are only showing menu
        var accProps = this.page.getAccProps();
        if (accProps.showItemToolsMenu()) {
            return;
        }

        // add tool
        var messageKey = 'TDSContentEventsJS.Label.MarkForReview';
        this.entity.addToolElement({
            classname: 'markReview',
            text: Messages.get(messageKey),
            fn: this.toggle.bind(this)
        });

    }

    Plugin_Mark.prototype.showMenu = function (menu, evt) {
        var messageKey = this.marked ? 'TDSContentEventsJS.Label.UnmarkForReview' : 'TDSContentEventsJS.Label.MarkForReview';
        menu.addMenuItem('entity', {
            text: Messages.get(messageKey),
            classname: 'markReview',
            onclick: { fn: this.toggle.bind(this) }
        });
    }

})(window.ContentManager);