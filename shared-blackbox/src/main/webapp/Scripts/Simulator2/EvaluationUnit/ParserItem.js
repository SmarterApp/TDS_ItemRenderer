//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
/** **************************************************************************
* @class ParserItem
* @superclass none
* @param none
* @return ParserItem instance
* Creates a new ParserItem base class.
*****************************************************************************
*/
SimParser.ParserItem = function(parser) {
	var eName = 'ParserItem';
   
    // Privileged accessor for 'eName'
    this.getEname = function() {
        return eName;
    };

    //Privileged mutator for 'eName'
    this.setEname = function(newEname) {
    	eName = newEname;
        return this;
    };

    SimParser.ParserItem.prototype.setAttributes = function (attr, node) {
        for (var i in attr) {
            switch (i) {
                case 'eName':
                    this.setEname(attr[i]);
                    break;
            }
        }
    }
    
};
