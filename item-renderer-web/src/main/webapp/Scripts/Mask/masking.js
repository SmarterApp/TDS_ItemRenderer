//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
/*
This is used for the masking button in Iris.
*/

function Masking() {}

    Masking.isEnabled = function() {
        return YUD.hasClass(document.body, 'msk-enabled');
    };

    // this is called when masking tool is requested
    Masking.enable = function() {
        YUD.addClass(document.body, 'msk-enabled');
    };

    // this is called when masking tool is disabled
    Masking.disable = function() {
        YUD.removeClass(document.body, 'msk-enabled');
    };

    // call this to toggle masking tool on and off
    Masking.toggle = function() {
        if (Masking.isEnabled()) {
            Masking.disable();
        } else {
            Masking.enable();
        }
        TDS.Mask.toggle();
    };


