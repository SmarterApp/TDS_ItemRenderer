//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
﻿Sections.Instructions = function()
{
    Sections.Instructions.superclass.constructor.call(this, 'sectionInstructions');

    this.addClick('btnCancelTest', function()
    {
        this.request('back');
    });

    this.addClick('btnStartTest', this.start);

};

YAHOO.lang.extend(Sections.Instructions, Sections.Base);

Sections.Instructions.prototype.init = function ()
{
    var container = YUD.get('quickGuide');
    var frame = YUD.get('helpFrame');
    var url = TDS.Help.getUrl();

    // load instructions
    TDS.ToolManager.loadFrameUrl(container, frame, url, function(frameDoc, allowAccess) // loadFrameKey
    {
        // set embedded class so the help styles itself for being embedded in a page
        YUD.addClass(frameDoc.body, 'embedded');

        // init help tts
        TDS.Help.onLoad(frame, 'startSpeakingButton', 'stopSpeakingButton', 'ttsHelpMessage', 'noTTSHelpMessage');
    });
};

Sections.Instructions.prototype.enter = function () {
    if (TDS.isProctoredAssessmentPreview()) {
        this.start();
    }
};

Sections.Instructions.prototype.start = function () {

    // get testee info
    var testee = TDS.Student.Storage.getTestee();

    // start the test and then go to the test shell
    TDS.Student.API.startTest(testee, LoginShell.formKeys).then(function (testInfo) {
        TDS.Student.Storage.setTestInfo(testInfo);
        TDS.redirectTestShell();
    });
};
