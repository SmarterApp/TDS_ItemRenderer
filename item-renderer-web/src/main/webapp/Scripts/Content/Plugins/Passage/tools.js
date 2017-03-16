//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
/*
Used to create the container for passage controls
*/

(function (CM) {

    // check for passage and element
    function match(page, entity, content) {
        if (entity instanceof ContentPassage) {
            var passageEl = entity.getElement();
            if (passageEl) {
                // check if div is already in the layout
                if (entity.getToolsElement()) {
                    return false;
                }
                // check for padding div
                var paddingEl = Util.Dom.getElementByClassName('padding', 'div', passageEl);
                if (paddingEl) {
                    return paddingEl;
                }
            }
        }
        return false;
    }

    function Plugin_PTools(page, entity, el) {
        this.el = el;
    }

    CM.registerEntityPlugin('passage.tools', Plugin_PTools, match);

    Plugin_PTools.prototype.load = function () {

        var passage = this.entity;
        var passageEl = passage.getElement();

        // check if tools div already exists
        var toolsEl = $('.passageTools', passageEl).get(0);
        if (toolsEl) return;

        // create new container for passage tools
        toolsEl = document.createElement('div');
        toolsEl.className = 'toolsContainer passageTools';
        $(passageEl).prepend(toolsEl);

        /*
        var paddingEl = this.el;
        var paddingChildEl = YUD.getFirstChild(paddingEl);
        if (paddingChildEl) {
            YUD.insertBefore(controlsEl, paddingChildEl);
        } else {
            paddingEl.appendChild(controlsEl);
        }
        */
    }

})(window.ContentManager);