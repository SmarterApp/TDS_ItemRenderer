//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
﻿// the ResponseRecovery.Manager class is the top-level container for historical response values
// it contains a lookup of items by their position

TestShell.ResponseRecovery.Manager = function (responseRecoveryManager) {
    this._manager = responseRecoveryManager;
    this._items = {};
    this._hasLoadedPriorHistory = false;
};

TestShell.ResponseRecovery.Manager.prototype = {
    getHistory: function (position) {
        var item = this._items[position];

        if (!item) {
            item = new TestShell.ResponseRecovery.Item(this._manager, position);
            this._items[position] = item;
        }

        return item;
    },

    addResponse: function (response) {
        var item = this.getHistory(response.position);
        item.addResponse(response);
    },

    addHistory: function (item) {
        var h = this.getHistory(item.position);

        item.sessions.forEach(function (session) {
            h.addSession(session);
        });
    },

    loadHistory: function (items) {
        items.forEach(function (item) {
            this.addHistory(item);
        }.bind(this));

        this._hasLoadedPriorHistory = true;
    },

    hasLoadedPriorHistory: function () {
        return this._hasLoadedPriorHistory;
    },

    getFacade: function () {
        return new TestShell.ResponseRecovery.ManagerFacade(this);
    }
};
