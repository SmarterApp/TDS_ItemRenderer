//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
/*
Item widget for the instruction item format ("INS"). 
This type of item only shows instructional content. The
widget is used for being able to provide an empty response.
*/

(function(CM) {

    function match(page, item) {
        var id = 'Item_Instruction_' + item.position;
        if (item.format == 'INS' ||
            item.format == 'Generic Instruction') {
            return new CM.WidgetConfig(id, item.getElement());
        }
        return false;
    }

    function Widget_Ins(page, item) {}

    CM.registerWidget('instructional', Widget_Ins, match);

    Widget_Ins.prototype.isResponseAvailable = function () {
        return true;
    }

    Widget_Ins.prototype.getResponse = function () {
        // always return a valid response
        return this.createResponse('', true, false, true);
    }

})(window.ContentManager);