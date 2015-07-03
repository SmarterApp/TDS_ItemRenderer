//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
/*
Expandable Passages
*/

(function (CM) {

    function match(page, entity) {
        if (entity instanceof ContentPassage && page.getPassage()) {
            var accProps = page.getAccommodationProperties();
            if (accProps && accProps.showExpandablePassages()) return true;
        }
        return false;
    }

    var CSS_COLLAPSED = 'passage-collapsed'; // passage is normal size
    var CSS_EXPANDED = 'passage-expanded'; // passage has filled up screen

    function Plugin_Expand(page, config) {
    }

    CM.registerEntityPlugin('passage.expandable', Plugin_Expand, match);

    Plugin_Expand.prototype.load = function () {

        var page = this.page;
        var pageEl = page.getElement();
        var passage = page.getPassage();
        var passageEl = passage.getElement();
        if (passageEl == null) return; // no passage element

        // start off as collapsed
        YUD.addClass(pageEl, CSS_COLLAPSED);

        // create new expand/collapse link
        var expandLink = document.createElement('a');
        YUD.setAttribute(expandLink, 'href', '#');
        YUD.setAttribute(expandLink, 'role', 'button');
        YUD.addClass(expandLink, 'toolButton');
        YUD.addClass(expandLink, 'expand-collapse-passage');

        var expandCollapse = function(clickEv) {
            // stop dom event
            YUE.stopEvent(clickEv);

            // fire event after animation done
            $(pageEl).one('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', function () {
                CM.fireEntityEvent('passageExpandCollapse', passage);
            });

            // check for class
            if (YUD.hasClass(pageEl, CSS_EXPANDED)) {
                // make passage collapsed
                YUD.removeClass(pageEl, CSS_EXPANDED);
                YUD.addClass(pageEl, CSS_COLLAPSED);
            } else if (YUD.hasClass(pageEl, CSS_COLLAPSED)) {
                // make passage expanded
                YUD.removeClass(pageEl, CSS_COLLAPSED);
                YUD.addClass(pageEl, CSS_EXPANDED);
            }
        };

        // add event handler to toggle classes
        YUE.on(expandLink, 'click', expandCollapse);

        // add expand link as the first child of passage padding
        /*var paddingEl = Util.Dom.getElementByClassName('padding', 'div', passageEl);

        if (paddingEl) {
            var paddingChildEl = YUD.getFirstChild(paddingEl);
            if (paddingChildEl) {
                YUD.insertBefore(expandLink, paddingChildEl);
            } else {
                paddingEl.appendChild(expandLink);
            }
        }*/

        var toolsEl = passage.getToolsElement();
        if (toolsEl) {
            toolsEl.appendChild(expandLink);
        }

    }

})(ContentManager);
