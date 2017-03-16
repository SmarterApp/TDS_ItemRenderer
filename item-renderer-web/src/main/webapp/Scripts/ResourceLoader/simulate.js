//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
﻿// simulate a resource loader
ResourceLoader.Simulate = function()
{
    ResourceLoader.Simulate.superclass.constructor.call(this);
};

ResourceLoader.extend(ResourceLoader.Simulate);

ResourceLoader.Simulate.prototype.load = function()
{
    this.setStatus(ResourceLoader.Status.LOADING);
    this.setStatus(ResourceLoader.Status.COMPLETE);
};

// simulate a async resource loader
ResourceLoader.SimulateAsync = function()
{
    ResourceLoader.SimulateAsync.superclass.constructor.call(this);
};

ResourceLoader.extend(ResourceLoader.SimulateAsync);

ResourceLoader.SimulateAsync.prototype.load = function()
{
    this.setStatusAsync(ResourceLoader.Status.LOADING);
    this.setStatusAsync(ResourceLoader.Status.COMPLETE);
};

