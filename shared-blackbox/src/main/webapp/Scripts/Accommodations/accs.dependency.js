//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
﻿Accommodations.Dependency = (function () {

    function Dependency(parentAccommodations, ifTypeName, ifValueCode, thenTypeName, thenValueCode, thenIsDefault) {

        this.ifType = function() {
            return parentAccommodations.getType(ifTypeName);
        };

        this.ifValue = function() {
            return parentAccommodations.getValue(ifValueCode);
        };

        this.thenType = function() {
            return parentAccommodations.getType(thenTypeName);
        };

        this.thenValue = function() {
            return parentAccommodations.getValue(thenValueCode);
        };

        this.isDefault = function() {
            return (thenIsDefault === true);
        };

        this.destroy = function() {
            parentAccommodations = null;
            ifTypeName = null;
            ifValueCode = null;
            thenTypeName = null;
            thenValueCode = null;
        };
    };

    return Dependency;

})();