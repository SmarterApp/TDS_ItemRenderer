//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
﻿/*
Item Tool: Response Recovery
*/

TestShell.ResponseRecovery.Plugin = function (page, entity, responseRecovery) {
    this._responseRecovery = responseRecovery;
    this._dialog = new TestShell.ResponseRecovery.Dialog();
};

TestShell.ResponseRecovery.Plugin.register = function (responseRecovery) {

    function match(page, entity, content) {
        if (entity instanceof ContentItem) {
            if (responseRecovery.isEnabledFor(entity)) {
                return responseRecovery;
            }
        }
        return false;
    }

    ContentManager.registerEntityPlugin('item.responseRecovery', TestShell.ResponseRecovery.Plugin, match, { prototypeHasOverrides: true });
};

TestShell.ResponseRecovery.Plugin.prototype = {
    click: function () {
        var page = TestShell.PageManager.getCurrent(),
            item = page.getResponse(this.entity.position),
            responseRecovery = this._responseRecovery,
            dialog = this._dialog;

        var onSaveError = function () {
            // on true save failure the student will be logged out
            // so we don't need to really handle failure here; just log it
            throw new Error('Error saving response during ResponseRecovery');
        };

        var showResponseRecovery = function () {
            var onLoad = function (responseManager) {
                var history = responseManager.getHistory(item.position);

                var onSubmit = function () {
                    return responseRecovery.save(item).fail(onSaveError);
                };

                var onCancel = function () {
                    // nothing to do
                };

                dialog.update(history, item, page.pageKey, item.id, item.position);
                dialog.show().then(onSubmit, onCancel).done();
            };

            responseRecovery.load().then(onLoad).done();
        };

        responseRecovery.save(item).then(showResponseRecovery, onSaveError).done();
    },

    load: function () {

        // check if we are only showing menu
        var accProps = this.page.getAccProps();
        if (accProps.showItemToolsMenu()) {
            return;
        }

        // add tool
        this.entity.addToolElement({
            classname: 'response-recovery-item',
            text: TestShell.ResponseRecovery.messages.toolText,
            fn: this.click.bind(this)
        });
    },

    showMenu: function (menu, evt) {
        menu.addMenuItem('entity', {
            text: TestShell.ResponseRecovery.messages.toolText,
            classname: 'response-recovery',
            onclick: { fn: this.click.bind(this) }
        });
    }
};

