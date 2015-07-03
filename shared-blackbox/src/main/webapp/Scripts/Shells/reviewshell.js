//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
﻿// entry point into the javascript from the review shell
function preinit()
{
    ReviewShell.init();
}

var ReviewShell =
{
    workflow: null // section behavior management
};

ReviewShell.init = function()
{
    // create workflow
    this.workflow = ReviewShell.createWorkflow();
    ReviewShell.start();
    sbacossChanges();
};

ReviewShell.start = function()
{
    if (TDS.showItemScores) this.workflow.start('sectionTestResults');
    else this.workflow.start('sectionTestReview');
};

ReviewShell.createWorkflow = function()
{
    var wf = Sections.createWorkflow();

    // logging
    wf.Events.subscribe('onRequest', function(activity) { Util.log('Section Request: ' + activity); });
    wf.Events.subscribe('onReady', function(activity) { Util.log('Section Ready: ' + activity); });
    wf.Events.subscribe('onLeave', function (activity) { Util.log('Section Hide: ' + activity); });
    wf.Events.subscribe('onEnter', function (activity) { Util.log('Section Show: ' + activity); });

    // section is showing
    wf.Events.subscribe('onEnter', function (activity) {
        // hide the sb logout
        $('#logOut').hide();
    });

    // create sections
    wf.addActivity(new Sections.TestReview());
    wf.addActivity(new Sections.TestResults());
    wf.addActivity(new Sections.Logout());

    /* create transitions */

    // "Congratulations, you have reached the end of the test!"
    wf.addTransition('sectionTestReview', 'back', 'sectionTestShell'); // "Review My Answers"
    wf.addTransition('sectionTestReview', 'next', 'sectionTestResults'); // "Submit Test"

    // "Your Results"
    
    return wf;
};



