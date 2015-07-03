//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
/*
Item Tool: Tutorials 
<tutorial id="16004" bankkey="71" />
*/

(function (CM) {

    function match(page, entity, content) {
        // check if item and it has a tutorial
        if (entity instanceof ContentItem && content.tutorial) {
            // check if the tutorial acc is enabled for items
            var accProps = page.getAccProps();
            if (accProps.hasTutorial()) {
                // return tuturial bank/item keys
                return content.tutorial;
            }
        }
        return false;
    }

    function Plugin_Tut(page, entity, tutorial) {

    }

    CM.registerEntityPlugin('item.tutorial', Plugin_Tut, match);

    Plugin_Tut.prototype.open = function () {

        var item = this.entity;
        console.log('Item Tool: Tutorial', this.config, item);

        // TDS notification
        if (typeof (window.tdsItemResource) == 'function') {
            window.tdsItemResource('help', item.tutorial.bankKey, item.tutorial.itemKey);
        }
    }

    Plugin_Tut.prototype.load = function () {

        // check if we are only showing menu
        var accProps = this.page.getAccProps();
        if (accProps.showItemToolsMenu()) {
            return;
        }

        // add tool
        var messageKey = 'TDSContentEventsJS.Label.HelpItem';
        this.entity.addToolElement({
            classname: 'contexthelp',
            text: Messages.get(messageKey),
            fn: this.open.bind(this)
        });
    }

    Plugin_Tut.prototype.showMenu = function (menu, evt) {
        var messageKey = 'TDSContentEventsJS.Label.HelpItem';
        menu.addMenuItem('entity', {
            text: Messages.get(messageKey),
            classname: 'helpItem',
            hasPopup: true,
            onclick: { fn: this.open.bind(this) }
        });
    }

})(window.ContentManager);