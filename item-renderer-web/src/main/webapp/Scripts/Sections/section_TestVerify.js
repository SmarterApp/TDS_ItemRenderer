//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
﻿/*
Section: "Is This Your Test?". 
Shows list of approved accommodations. 
*/

Sections.TestVerify = (function (Sections) {

    var api = TDS.Student.API;
    var storage = TDS.Student.Storage;

    // this is the approved accs as they looked when we entered this section
    var approvedAccs = null;

    function TestVerify() {
        TestVerify.superclass.constructor.call(this, 'sectionTestVerify');
        this.addClick('btnApproveAccommodations', this.approve);
        this.addClick('btnWrongAccommodations', this.deny);
    };

    YAHOO.lang.extend(TestVerify, Sections.Base);

    function applyAccsCSS(fromAccs, toAccs) {
        fromAccs.removeCSS(document.body);
        toAccs.applyCSS(document.body);
    };

    // this function is used for applying any accommodations
    function enableAccsFeatures () {
        var accProps = TDS.getAccommodationProperties();
        if (accProps && accProps.isPermissiveModeEnabled()) {
            Util.SecureBrowser.enablePermissiveMode(true);
        }
    }

    TestVerify.prototype.load = function (approval) {

        // clear the segments container
        var segmentsContainer = YUD.get('summary-segments');
        segmentsContainer.innerHTML = '';

        // set student info
        var session = storage.getTestSession();
        if (session) {
            YUD.get('lblVerifySessionID').innerHTML = session.id;
        }

        // show form selector if proxy mode
        this.renderForms(LoginShell.formGroups);

        // check for accommodations
        if (approval.segmentsAccommodations) {

            // save accs so we can compare later
            approvedAccs = approval.segmentsAccommodations[0].clone();

            // remove global accommodations css and use test accommodations
            applyAccsCSS(TDS.globalAccommodations, approval.segmentsAccommodations[0]);

            // render accommodations
            approval.segmentsAccommodations.forEach(this.renderAccommodations.bind(this));
        }

    };

    TestVerify.prototype.renderForms = function (formGroups) {

        var verifyForm = YUD.get('verifyTestForm');
        if (verifyForm == null) {
            return;
        }

        var verifyFormSelector = verifyForm.getElementsByTagName('select')[0];
        if (verifyFormSelector == null) {
            return;
        }

        // clear existing forms
        verifyFormSelector.options.length = 0;

        // check if any forms
        if (!formGroups || formGroups.length == 0) {
            YUD.setStyle(verifyForm, 'display', 'none');
            return;
        }

        // if test is being resumed after started, then don't show form selection
        var testSelection = storage.getTestProperties(),
            oppInfo = storage.getOppInfo();
        if (testSelection.status === api.TestSelectionStatus.Resume &&
            oppInfo.status === api.OpportunityStatus.Suspended) {
            YUD.setStyle(verifyForm, 'display', 'none');
            return;
        }

        verifyFormSelector[0] = new Option('Select a form', '');

        // add test forms
        formGroups.forEach(function (formGroup, formIdx) {
            var formSegment = formGroup.segments[0];
            verifyFormSelector[formIdx + 1] = new Option(formSegment.label, formSegment.key);
        });

        YUD.setStyle(verifyForm, 'display', 'block');
    };

    TestVerify.prototype.renderAccommodations = function(segmentAccommodations) {
        // skip accommodations that have nothing visible
        if (!segmentAccommodations.isAnyVisible()) {
            return;
        }

        var segmentsContainer = YUD.get('summary-segments');

        // create segment container
        var segmentContainer = HTML.DIV({ 'className': 'summary-segment' });
        segmentsContainer.appendChild(segmentContainer);

        // create segment header
        var segmentHeader = HTML.H2(null, segmentAccommodations.getLabel());
        segmentContainer.appendChild(segmentHeader);

        // create accommodations
        var accsRenderer = new Accommodations.Renderer(segmentAccommodations, {
            showLocked: true,
            reviewAll: true
        });
        accsRenderer.bind();
        accsRenderer.render(segmentContainer);

        // add classes to make backwards compatible with existing styles
        $('form', segmentContainer).children('div').addClass('summary-segment-type');
        $('.summary-segment-type .label', segmentContainer).addClass('summary-segment-type-label');
        $('.summary-segment-type .control', segmentContainer).addClass('summary-segment-type-values');
    };

    // Get the selected test form key.
    // - NULL = wasn't possible for user to select form
    // - '' = user did not choose anything
    // - 'some value' = form selected
    TestVerify.prototype.getSelectedTestForm = function() {
        var ddlTestForms = YUD.get('ddlTestForms');
        return (ddlTestForms.options.length > 0) ? ddlTestForms.value : null;
    };

    TestVerify.prototype.approve = function () {

        var ddlTestForms = YUD.get('ddlTestForms');

        // check if any forms to select
        if (ddlTestForms.options.length) {

            // check if a form was selected
            if (ddlTestForms.selectedIndex == 0) {
                var defaultError = 'Must select a test form';
                TDS.Dialog.showWarning(Messages.getAlt('LoginShell.Alert.MustSelectForm', defaultError));
                return;
            }

            // find the selected form group
            var formGroupIdx = ddlTestForms.selectedIndex - 1;
            var formGroup = LoginShell.formGroups[formGroupIdx];

            // check if form is enabled
            if (!formGroup || !formGroup.enabled) {
                var defaultError = 'The selected test form does not match what is allowed for the student';
                TDS.Dialog.showWarning(Messages.getAlt('LoginShell.Alert.FormSelectionInvalid', defaultError));
                return;
            }

            // save form keys
            LoginShell.formKeys = formGroup.segments.map(function (segment) {
                return segment.key;
            });
        }

        // check if user changed accs and make css changes
        if (approvedAccs && JSON.stringify(approvedAccs.exportJson()) != JSON.stringify(LoginShell.segmentsAccommodations[0].exportJson())) {
            LoginShell.setTestAccommodations(LoginShell.segmentsAccommodations);
            applyAccsCSS(approvedAccs, LoginShell.segmentsAccommodations[0]);
        }

        // enable acc features
        enableAccsFeatures();

        // go to test instructions page
        this.request('next');
    };

    // The student clicked the "No" button to reject approved accommodations
    TestVerify.prototype.deny = function () {
        var testee = storage.getTestee();
        if (testee && testee.isGuest) {
            this.denyGuest();
        } else {
            this.denyTestee();
        }
    };

    // Denying a real student 
    TestVerify.prototype.denyTestee = function() {
        // reset CSS on body
        LoginShell.resetCSS();

        // remove accommodations
        LoginShell.clearTestAccommodations();

        // go back
        api.denyApproval().then(function () {
            this.request('back');
        }.bind(this));
    };

    // Denying a guest student
    // HACK: Balaji/Larry/Jeremy approved this because resuming a denied guest 
    // student causes "Access Violation" when approving accommodations. 
    // Larry will look into a real fix for this problem.
    TestVerify.prototype.denyGuest = function() {
        // Manually ask if they want to log out and then deny opp
        TDS.Dialog.showPrompt(Messages.get('Global.Label.LogoutVerify'), function() {
            api.denyApproval().then(function () {
                TDS.logout();
            }.bind(this));
        });
    };

    return TestVerify;

})(Sections);