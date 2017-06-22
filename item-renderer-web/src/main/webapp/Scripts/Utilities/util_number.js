//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
Util.Number = function() { };

// parse string into number
Util.Number.parse = function(str)
{
    return parseInt(str, 10);
};

// Limits this number between two bounds.
Util.Number.limit = function(num, min, max)
{
    return Math.min(max, Math.max(min, num));
};

// Returns the passed parameter as a Number, or null if not a number.
Util.Number.from = function(item)
{
    var number = parseFloat(item);
    return isFinite(number) ? number : null;
};