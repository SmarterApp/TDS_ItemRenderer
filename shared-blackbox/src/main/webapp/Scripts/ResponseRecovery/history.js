//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
﻿// the ResponseRecovery.Item class is a container for historical response values for a particular item
// it stores a lookup of sessions by their key

TestShell.ResponseRecovery.Item = function (responseRecoveryManager, position) {
    this._manager = responseRecoveryManager;
    this.position = position;
    this._sessions = {};
};

TestShell.ResponseRecovery.Item.prototype = {
    getSession: function (browserKey) {
        var session = this._sessions[browserKey];

        if (!session) {
            session = new TestShell.ResponseRecovery.Session(this._manager, browserKey);
            this._sessions[browserKey] = session;
        }

        return session;
    },

    addResponse: function (response) {
        var session = this.getSession(response.browserKey);
        session.addResponse(response);
    },

    addSession: function (session) {
        var s = this.getSession(session.browserKey);

        session.responses.forEach(function (response) {
            s.addResponse(response);
        });
    },

    getSessions: function () {
        var sessions = this._sessions;

        // get array of sessions
        sessions = Object.keys(sessions).map(function (browserKey) {
            return sessions[browserKey];
        });

        // sory by the session's min sequence
        sessions.sort(function (a, b) {
            return a.sequence - b.sequence;
        });

        return sessions;
    }
};
