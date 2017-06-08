//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
/*
Item Tool: Guid to Revision
<resource type="guideToRevision" id="3000255" bankkey="64" />
*/

(function (CM) {

    function match(page, entity, content) {
        // check if item
        if (entity instanceof ContentItem) {
            // check if item has gtr
            var gtr = content.resources['guideToRevision'];
            if (gtr) {
                // check if the gtr acc is enabled for items
                var accProps = page.getAccProps();
                if (accProps.hasGuideForRevision()) {
                    // return gtr bank/item keys
                    return gtr;
                }
            }
        }
        return false;
    }

    function Plugin_GTR(page, entity, config) {

    }

    CM.registerEntityPlugin('item.gtr', Plugin_GTR, match);

    // send print request
    Plugin_GTR.prototype.open = function () {

        var item = this.entity;
        console.log('Item Tool: GTR', this.config, item);

        // TDS notification
        if (typeof (window.tdsItemResource) == 'function') {
            window.tdsItemResource('gtr_' + item.position, item.gtr.bankKey, item.gtr.itemKey);
        }
    }

    Plugin_GTR.prototype.load = function () {

        // check if we are only showing menu
        var accProps = this.page.getAccProps();
        if (accProps.showItemToolsMenu()) {
            return;
        }

        // add tool
        var messageKey = 'TDSContentEventsJS.Label.GTRItem';
        this.entity.addToolElement({
            classname: 'guideToRevision',
            text: Messages.get(messageKey),
            hasPopup: true,
            fn: this.open.bind(this)
        });

    }

    Plugin_GTR.prototype.showMenu = function (menu, evt) {
        var messageKey = 'TDSContentEventsJS.Label.GTRItem';
        menu.addMenuItem('entity', {
            text: Messages.get(messageKey),
            classname: 'gtrItem',
            onclick: { fn: this.open.bind(this) }
        });
    }

})(window.ContentManager);