//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
﻿/*
Test shell page that contains a generic ITS resource (e.x., cover sheet).
*/

TestShell.PageResource = function(bankKey, itemKey, segmentID, label)
{
    this._bankKey = bankKey;
    this._itemKey = itemKey;
    this._segmentID = segmentID;
    this._label = label;

    var id = 'I-' + bankKey + '-' + itemKey;
    TestShell.PageResource.superclass.constructor.call(this, id);
};

YAHOO.lang.extend(TestShell.PageResource, TestShell.PageContent);

// get the xhr url for loading the content
TestShell.PageResource.prototype.getContentUrl = function()
{
    var urlBuilder = [];
    urlBuilder.push(TDS.baseUrl);
    urlBuilder.push('Pages/API/TestShell.axd/getResourceContent');
    urlBuilder.push('?bankKey=' + this._bankKey);
    urlBuilder.push('&itemKey=' + this._itemKey);
    urlBuilder.push('&segmentID=' + this._segmentID);
    return urlBuilder.join('');
};

TestShell.PageResource.prototype.getLabel = function() { return this._label; };
