//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
Util.Converters = {};

Util.Converters.parseBoolean = function(value) {
	if (YAHOO.util.Lang.isNull(value)) return null;
	if (YAHOO.util.Lang.isBoolean(value)) return value;
	if (YAHOO.util.Lang.isString(value)) {
		return value.toLowerCase() === 'true';
	} else {
		return null;
	}
};

Util.Converters.parseInt = function(value) {
	if (YAHOO.util.Lang.isNull(value)) return null;
	if (YAHOO.util.Lang.isNumber(value)) return value;
	if (YAHOO.util.Lang.isString(value)) {
		return value * 1;
	} else {
		return null;
	}
};