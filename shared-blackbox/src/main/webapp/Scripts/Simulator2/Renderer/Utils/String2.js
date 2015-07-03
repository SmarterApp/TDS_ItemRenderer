//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
/** **************************************************************************
* @class String
* @superclass Object
* @param none
* @return none
* Extends String class and adds three prototype functions.  
*****************************************************************************
*/

String.prototype.trim = function () {
    return this.replace(/^\s+|\s+$/g,'');
};

String.prototype.ltrim = function() {
    return this.replace(/^\s+/,'');
};

String.prototype.rtrim = function() {
    return this.replace(/\s+$/,'');
};