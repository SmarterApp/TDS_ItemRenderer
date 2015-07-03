//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
﻿if (typeof TDS != 'object') TDS = {};

// A simple static class used to add functionality to our TDS buttons
TDS.Button = {};

// find all the buttons on the page and adds events
TDS.Button.init = function()
{
    var spans = YUD.getElementsByClassName('tds-button', 'span');
    YUD.batch(spans, this.processButtonSpan);
}

TDS.Button.processButtonSpan = function(buttonSpan)
{
    var button = buttonSpan.getElementsByTagName('button')[0];

    YUE.on(button, 'focus', function(el)
    {
        YUD.addClass(buttonSpan, 'tds-button-focus');
    });

    YUE.on(button, 'blur', function(el)
    {
        YUD.removeClass(buttonSpan, 'tds-button-focus');
    });

    YUE.on(button, 'mouseover', function(el)
    {
        YUD.addClass(buttonSpan, 'tds-button-hover');
    });

    YUE.on(button, 'mouseout', function(el)
    {
        YUD.removeClass(buttonSpan, 'tds-button-hover');
    });

}