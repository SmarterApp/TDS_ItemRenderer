//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
﻿/*
This loader is compatible with promise spec.
*/

(function (RL) {

    var Status = RL.Status;

    function RLP(promise) {
        this.promise = promise;
        RLP.superclass.constructor.call(this);
    }

    RL.extend(RLP);

    RLP.prototype.load = function () {
        if (this.getStatus() != Status.NEW) {
            return false;
        }
        this.setStatus(Status.LOADING);
        this.promise.done(
            function () {
                this.setStatus(Status.COMPLETE);
            }.bind(this),
            function (error) {
                this.setStatus(Status.ERROR);
            }.bind(this));
        return true;
    }

    RL.Promise = RLP;

})(window.ResourceLoader);
