//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
/*
Passage print menu.
*/

(function(CM) {

    function match(page, entity) {

        // check if TDS passage print function is found
        if (typeof (window.tdsPassagePrint) != 'function') {
            return false;
        }

        // if there is no proctor then we can't print
        if (YUD.hasClass(document.body, 'unproctored')) {
            return false;
        }

        // check if passage
        if (entity instanceof ContentPassage) {
            // check if the print acc is enabled
            var accProps = page.getAccProps();
            return accProps.hasPrintStimulus() ||
                   accProps.hasEmbossStimulus();
        }

        return false;
    }

    function Plugin_Print() { }

    CM.registerEntityPlugin('passage.print', Plugin_Print, match);

    // send print request
    Plugin_Print.prototype.send = function () {

        var item = this.entity;
        console.log('Passage Tool: Print', item);

        // TDS notification
        if (typeof (window.tdsPassagePrint) == 'function') {
            window.tdsPassagePrint();
        }
    };

    Plugin_Print.prototype.load = function () {

        // check if we are only showing menu
        var accProps = this.page.getAccProps();
        if (accProps.showItemToolsMenu()) {
            return;
        }

        // add tool
        var messageKey = 'TDSContentEventsJS.Label.PrintPassage';
        this.element = this.entity.addToolElement({
            classname: 'printPassage',
            text: Messages.get(messageKey),
            fn: this.send.bind(this)
        });
    };

    Plugin_Print.prototype.showMenu = function(menu, evt) {
        
        var menuText = Messages.get('TDSContentEventsJS.Label.PrintPassage');
        var menuItem = {
            text: menuText,
            classname: 'printPassage',
            onclick: { fn: this.send.bind(this) }
        };

        menu.addMenuItem('entity', menuItem);

    }

})(window.ContentManager);