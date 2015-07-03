//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
﻿// the ResponesRecovery.ManagerFacade is a read-only wrapper around an instance of ResponseRecovery.Manager
// it creates a copy of an item's historical response values, which can be manipulated and rendered

TestShell.ResponseRecovery.ManagerFacade = function (manager) {
    this._manager = manager;
};

TestShell.ResponseRecovery.ManagerFacade.prototype = {
    getHistory: function (position) {
        var history = this._manager.getHistory(position);

        // we want to include an incrementing session number
        var index = 1;
        var sessions = history.getSessions().map(function (session) {
            return {
                index: index++,
                id: session.id,
                label: session.getLabel(),
                versions: session.getVersions()
            };
        });

        return {
            position: history.position,
            sessions: sessions,

            hasCompleteHistory: this._manager.hasLoadedPriorHistory(),
            hasRecoverableVersions: sessions.length > 0,

            getVersion: function (sessionId, sequence) {
                return this._manager.getHistory(position).getSession(sessionId).getVersion(sequence);
            }.bind(this)
        };
    }
};
