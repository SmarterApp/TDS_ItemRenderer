//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
﻿// the ResponseRecovery.Session class is a container for historical response values for one item over the span of a particular session
// it stores a list of versions, sorted by their sequence

TestShell.ResponseRecovery.Session = function (responseRecoveryManager, id) {
    this._manager = responseRecoveryManager;
    this.id = id;
    this.startTime = null;
    this.sequence = 0;
    this._versions = [];
}

TestShell.ResponseRecovery.Session.prototype = {
    addResponse: function (response) {
        if (response.time && response.time.getTime() === 0) {
            response.time = null;
        }

        // update the start time and sequence
        if (!this.startTime || (response.time && response.time < this.startTime)) {
            this.startTime = response.time;
        }
        if (!this.sequence || (response.sequence > 0 && response.sequence < this.sequence)) {
            this.sequence = response.sequence;
        }

        var version = new TestShell.ResponseRecovery.Version(this._manager, response.sequence, response.time, response.count);

        if (response.value !== undefined) {
            version.setValue(response.value);
        }

        // find the index at which to insert this version
        var insertionIndex = 0;
        for (; insertionIndex < this._versions.length && this._versions[insertionIndex].sequence < response.sequence; ++insertionIndex);

        this._versions.splice(insertionIndex, 0, version);
    },

    isCurrent: function () {
        return this.id === this._manager.getCurrentSessionId();
    },

    getLabel: function () {
        if (this.startTime === null) {
            return '';
        }

        if (this.isCurrent()) {
            return TestShell.ResponseRecovery.messages.sessionLabelCurrent;
        }

        var date = {
            year: this.startTime.getFullYear(),
            month: this.startTime.getMonth() + 1,
            day: this.startTime.getDate()
        };

        return YAHOO.lang.substitute(TestShell.ResponseRecovery.messages.sessionLabel, date);
    },

    getVersion: function (sequence) {
        var versions = this._versions,
            i = 0;

        for (; i < versions.length && versions[i].sequence !== sequence; ++i);

        return versions[i];
    },

    getVersions: function () {
        return this._versions.slice();
    }
};
