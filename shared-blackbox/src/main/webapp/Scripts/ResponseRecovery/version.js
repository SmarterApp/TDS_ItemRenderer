//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
﻿// the ResponseRecovery.Version class represents a single historical response value

TestShell.ResponseRecovery.Version = function (responseRecoveryManager, sequence, time, length) {
    this._manager = responseRecoveryManager;

    this.sequence = sequence;
    this.time = time;
    this.count = length || null;

    this._value = null;
}

TestShell.ResponseRecovery.Version.prototype = {
    setValue: function (value) {
        this._value = value;
        this.count = value.length;
    },

    getValue: function (itemContext) {
        if (this._value !== null) {
            var deferred = Util.Promise.defer();
            deferred.resolve(this._value);
            return deferred.promise;
        }

        var pageKey = itemContext.pageKey,
            itemId = itemContext.itemId,
            position = itemContext.position;

        return this._manager.getResponse(pageKey, itemId, position, this.sequence).then(function (value) {
            this.setValue(value);
            return value;
        }.bind(this));
    }
};
