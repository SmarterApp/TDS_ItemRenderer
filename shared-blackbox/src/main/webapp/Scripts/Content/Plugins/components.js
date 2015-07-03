//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
/*
Add general entity components (e.x., stem)
*/

(function (CM) {

    function match(page, entity, content) {
        return true;
    }

    function Plugin_Comp(page, entity, config) {
    }

    CM.registerEntityPlugin('components', Plugin_Comp, match);

    Plugin_Comp.prototype.findPassageComponents = function(passage) {
        var passageEl = passage.getElement();
        if (passageEl != null) {
            passage.addComponent(passageEl);
        }
    }

    Plugin_Comp.prototype.findItemComponents = function (item) {
        var itemEl = item.getElement();
        item.addComponent(itemEl);
    }

    Plugin_Comp.prototype.load = function () {

        var entity = this.entity;

        if (entity instanceof ContentItem) {
            this.findItemComponents(entity);
        } else if (entity instanceof ContentPassage) {
            this.findPassageComponents(entity);
        }

        // when component has focus add class
        entity.on('focusComponent', function(component) {
            if (ContentManager.isElement(component)) {
                YUD.addClass(component, 'contextAreaFocus');
            }
        });

        // when component loses focus remove class
        entity.on('blurComponent', function (component) {
            if (ContentManager.isElement(component)) {
                YUD.removeClass(component, 'contextAreaFocus');
            }
            ContentManager.enableCaretMode(false);
        });

    }

})(ContentManager);
