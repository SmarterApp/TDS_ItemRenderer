//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
﻿/*
Requires:
- \Scripts\Utilities\util_event.js
*/

ResourceLoader.Conditional = function(listener, interval, timeout)
{
    ResourceLoader.Conditional.superclass.constructor.call(this);
    this._conditionalDelay = new Util.ConditionalDelay(listener, this);
    this._interval = interval;
    this._timeout = timeout;
};

ResourceLoader.extend(ResourceLoader.Conditional);

ResourceLoader.Conditional.prototype.load = function()
{
    this.setStatus(ResourceLoader.Status.LOADING);

    this._conditionalDelay.onSuccess.subscribe(function()
    {
        this.setStatus(ResourceLoader.Status.COMPLETE);
    });

    this._conditionalDelay.onFailure.subscribe(function()
    {
        this.setStatus(ResourceLoader.Status.ERROR);
    });

    this._conditionalDelay.start(this._interval, this._timeout);
};

