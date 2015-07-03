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
- \Scripts\Utilities\util_xhr.js
*/

ResourceLoader.Xhr = function(url, opt_method, opt_content, opt_timeout, opt_maxRetries)
{
    ResourceLoader.Xhr.superclass.constructor.call(this);

    this._manager = new Util.XhrManager(0, 0, true);
    this._request = this._manager.createRequest(url, url, opt_method, opt_content, this._onCompleted, this, opt_timeout, opt_maxRetries);
};

ResourceLoader.extend(ResourceLoader.Xhr);

ResourceLoader.Xhr.prototype.load = function()
{
    this.setStatus(ResourceLoader.Status.LOADING);
    this._manager.sendRequest(this._request);
};

ResourceLoader.Xhr.prototype._onCompleted = function()
{
    if (this._request.isSuccess()) this.setStatus(ResourceLoader.Status.COMPLETE);
    else this.setStatus(ResourceLoader.Status.ERROR);
};

