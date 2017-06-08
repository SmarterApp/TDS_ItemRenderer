//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
/** **************************************************************************
* @class NextNumGenerator
* @superclass none
* @param none
* @return NextNumGenerator instance
* Creates a new NextNumGenerator data structure. Last In First Out.
*****************************************************************************
*/
Simulator.Utils.NumberGenerator = function (type) {

    var simItemNextNumber = 0;
    var defaultNextNumber = 0;

    this.getNext = function (type) {
        switch (type) {
            case 'SimItem': return simItemNextNumber++;
            default : return defaultNextNumber++;
        }
    };
};


