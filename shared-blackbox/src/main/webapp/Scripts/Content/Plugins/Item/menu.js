//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
/*
Item Menu
*/

(function (CM) {

    function match(page, entity, content) {
        if (entity instanceof ContentItem) {
            var accProps = page.getAccProps();
            return accProps.showItemToolsMenu();
        }
        return false;
    }

    function Plugin_Menu(page, entity, el) {
        this.el = el; // tools container element
    }

    CM.registerEntityPlugin('item.menu', Plugin_Menu, match);

    Plugin_Menu.prototype.load = function () {

        var entity = this.entity;
        var messageKey = 'TDSContentEventsJS.Label.ContextMenu';
        entity.addToolElement({
            classname: 'itemMenu',
            text: Messages.getAlt(messageKey, 'Menu'),
            stopEvent: true,
            hasPopup: true,
            delay: true,
            fn: function (menuEl, evt) {
                CM.Menu.show({
                    entity: entity,
                    evt: evt,
                    target: menuEl,
                    location: 'bottom'
                });
            }
        });

    }

})(window.ContentManager);