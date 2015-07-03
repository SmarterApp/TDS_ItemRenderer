//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
﻿// entry point into the javascript from the login shell
function init() {
    DiagnosticShell.init();
}

var DiagnosticShell = {
    Events: new Util.EventManager(),
    defaultBodyCSS: null,
    api: null, // xhr api
    workflow: null, // section behavior management
    info: null, // LoginInfo object
    satellite: null, // the sat info for geo
    session: null, // current session
    testee: null, // current student
    testeeForms: null, // current testee forms (from RTS)
    testSelection: null, // current test
    testForms: null, // current test forms
    testApproved: false, // is the test approved
    formSelection: null, // selected form key (only in data entry mode)
    segmentsAccommodations: null // all segments accommodations
};

// settings for the login shell
DiagnosticShell.Settings = {};

// initialize the login shell for the first time
DiagnosticShell.init = function () {

    // create workflow
    this.workflow = DiagnosticShell.createWorkflow();
    DiagnosticShell.setupDiagnosticWorkflow(this.workflow);
    this.start();
};

DiagnosticShell.start = function () {

    this.Events.fire('onStart');

    // figure out what section to start on
    startSection = 'sectionDiagnostics';

    var querystring = Util.QueryString.parse();

    // check if custom section was requested
    if (querystring.section) {
        startSection = querystring.section;
    }

    // start workflow
    this.workflow.start(startSection);
};

// create the workflow that the login shell will follow
DiagnosticShell.createWorkflow = function () {

    var wf = Sections.createWorkflow();

    // logging
    wf.Events.subscribe('onRequest', function(activity) { Util.log('Section Request: ' + activity); });
    wf.Events.subscribe('onReady', function(activity) { Util.log('Section Ready: ' + activity); });
    wf.Events.subscribe('onLeave', function(activity) { Util.log('Section Hide: ' + activity); });
    wf.Events.subscribe('onEnter', function(activity) {
        Util.log('Section Show: ' + activity);
        window.scrollTo(0, 0);
    });

    return wf;
};

// workflow for login server
DiagnosticShell.setupDiagnosticWorkflow = function (wf) {

    // create sections
    wf.addActivity(new Sections.Diagnostics());
    wf.addActivity(new Sections.TTSCheck());
    wf.addActivity(new Sections.SoundCheck());

    /* create transitions */

    // "Diagnostics"
    wf.addTransition('sectionDiagnostics', 'tts', 'sectionTTSCheck');
    wf.addTransition('sectionDiagnostics', 'elpa', 'sectionSoundCheck');

    // TTS check
    wf.addTransition('sectionTTSCheck', 'next', 'sectionDiagnostics');
    wf.addTransition('sectionTTSCheck', 'back', 'sectionDiagnostics');

    // Sound check
    wf.addTransition('sectionSoundCheck', 'next', 'sectionDiagnostics');
    wf.addTransition('sectionSoundCheck', 'back', 'sectionDiagnostics');
};

init();