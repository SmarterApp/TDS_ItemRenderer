//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
/****************************************
* Add size method to Object to easily determine
* size of associative arrays
 ****************************************/
Object.size = function(obj) {
    var size = 0;
    if(obj.length) size = obj.length;
    if(size == 0) {   // obj could be an associative array so could get a false size = 0
        try {
            for (var propName in obj) {
                if (obj.hasOwnProperty(propName)) size++;
            }
        } catch(err) {
            logError('Javascript error: ' + err.message + ' occurred. Object size could not be determined.');
            return Simulator.Constants.FAILURE;
        }
    }
    return size;
};
