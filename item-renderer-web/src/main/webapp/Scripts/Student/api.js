//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
﻿TDS.Student = TDS.Student || {};

(function (Student) {

    var API = {};
    var xhr = new TDS.Student.Xhr();

    // storage.getTestProperties() (TestSelection.cs)
    API.TestSelectionStatus = {
        Disabled: 0,
        Hidden: 1,
        Start: 2,
        Resume: 3
    };

    // api.checkApproval() (ApprovalInfo.cs)
    API.TestApprovalStatus = {
        Waiting: 0,
        Approved: 1,
        Denied: 2,
        Logout: 3
    };

    // storage.getOppInfo() (OpportunityStatus.cs)
    API.OpportunityStatus = {
        Unknown: 0,
        Denied: -1,
        Failed: -2,
        Pending: 1, // never started test (even if TestSelectionStatus is 'Resume')
        Suspended: 2, // resuming started test (got into test shell)
        Approved: 3,
        Started: 4,
        Paused: 5,
        Review: 6,
        Completed: 7,
        Scored: 8,
        NotApplicable: 9,
        SegmentEntry: 10,
        SegmentExit: 11,
        Closed: 12,
        Disabled: 13
    };

    // POST: Pages/API/MasterShell.axd/loginStudent
    API.loginStudent = function (keyValues /*string[]*/, sessionID /*string*/, forbiddenApps /*string[]*/, secureBrowser /*boolean*/) {

        var forbiddenAppsFlat = forbiddenApps.map(function (app) {
            return app.desc;
        }).join('|');

        var data = {
            keyValues: keyValues.join(';'), // e.x., 'ID:9999999504;FirstName:FirstName504'
            sessionID: sessionID,
            forbiddenApps: forbiddenAppsFlat, // e.x., 'iexplore|skype'
            secureBrowser: secureBrowser
        };

        return xhr.sendPromise('loginStudent', data, null, {
            forceLogout: false
        });
    };

    // POST: Pages/API/MasterShell.axd/loginProctor
    API.loginProctor = function (keyValues /*string[]*/) {
        var data = {
            keyValues: keyValues.join(';') // ID:test@air.org;p:password123
        };

        return xhr.sendPromise('loginProctor', data, null, {
            forceLogout: false
        });
    };

    // POST: Pages/API/MasterShell.axd/getTestSession
    API.getTestSession = function (sessionID /*string*/) {
        var data = {
            sessionID: sessionID
        };
        return xhr.sendPromise('getTestSession', data, null, {
            forceLogout: false
        });
    };

    function processTests(testSelections) {
        testSelections.forEach(function(testSelection) {
            // translate reason key
            if (!Util.String.isNullOrEmpty(testSelection.reasonKey)) {
                testSelection.reasonText = Messages.get(testSelection.reasonKey);
            }
            // translate warning key
            if (!Util.String.isNullOrEmpty(testSelection.warningKey)) {
                testSelection.warningText = Messages.get(testSelection.warningKey);
            }
        });
        return testSelections;
    }

    // POST: Pages/API/MasterShell.axd/getTests
    API.getTests = function(testee, testSession, grade /*string*/) {
        var data = {
            testeeKey: testee.key,
            testeeToken: testee.token,
            sessionKey: testSession.key,
            grade: grade || testee.grade
        };
        return xhr.sendPromise('getTests', data).then(processTests);
    };

    // create real accommodations object out of the segment accommodations json
    function processTestAccs(accsList) {
        return accsList.map(function (json) {
            var accs = Accommodations.create(json);
            accs.selectDefaults();
            return accs;
        });
    }

    // POST: Pages/API/MasterShell.axd/getTestAccommodations
    API.getTestAccommodations = function (testSelection, testee, testSession) {
        var data = {
            testeeKey: testee.key,
            testeeToken: testee.token,
            sessionID: testSession.id,
            testKey: testSelection.key
        };
        return xhr.sendPromise('getTestAccommodations', data).then(processTestAccs);
    };

    // POST: Pages/API/MasterShell.axd/openTest
    API.openTest = function (test, testee, testSession, segmentsAccommodations, proctorBrowserKey, passphrase) {

        var data = {
            testeeKey: testee.key,
            testeeToken: testee.token,
            sessionKey: testSession.key,
            sessionID: testSession.id,
            proctorKey: testSession.proctorKey,
            proctorName: testSession.proctorName,
            testKey: test.key,
            testID: test.id,
            oppKey: test.oppKey, // required for SIRVE purposes.
            opportunity: test.opportunity, // required for GEO purposes.

            // cookie:
            subject: test.subject,
            grade: test.grade
        };

        // Required for RTS
        // NOTE: Don't attach this if null or it gets sent to server as empty string
        if (passphrase != null) {
            data.passphrase = passphrase; 
        }

        // Required for DEI purposes. Satellite browser key for session.
        if (proctorBrowserKey) {
            data.proctorBrowserKey = proctorBrowserKey;
        }

        // send selected segments accs (PT mode)
        if (segmentsAccommodations) {
            data.segment = segmentsAccommodations.map(function (segmentAccommodations) {
                var segmentPos = segmentAccommodations.getPosition();
                var codes = segmentAccommodations.getSelectedDelimited(false, ',');
                return segmentPos + '#' + codes; // e.x., '0#ENU,TDS_F_S12'
            });
        }

        return xhr.sendPromise('openTest', data);
    };

    // POST: Pages/API/MasterShell.axd/pauseTest
    API.pauseTest = function (reason, validate) {

        // create pause data
        var data = {
            validate: !!validate
        };

        // set reason it was included (otherwise null on the server)
        if (reason) {
            data.reason = reason;
        }

        // send pause request
        return xhr.sendPromise('pauseTest', data);
    };
    
    // process the proctor approval data
    function processApproval(approval) {
        // convert json accs into real accs
        if (approval && approval.segmentsAccommodations) {
            approval.segmentsAccommodations = approval.segmentsAccommodations.map(function (json) {
                return Accommodations.create(json);
            });
        }
        return approval;
    }

    // POST: Pages/API/MasterShell.axd/checkApproval
    API.checkApproval = function (oppInstance, sessionID, testKey) {
        // use oppInstance as our json packet
        oppInstance.sessionID = sessionID;
        oppInstance.testKey = testKey;
        return xhr.sendPromise('checkApproval', oppInstance, null, {
            showProgress: false
        }).then(processApproval);
    };

    // cancel xhr call for checking approval
    API.cancelCheckApproval = function() {
        xhr.abort('checkApproval');
    };

    // POST: Pages/API/MasterShell.axd/denyApproval
    API.denyApproval = function () {
        return xhr.sendPromise('denyApproval');
    };

    // POST: Pages/API/MasterShell.axd/startTest
    API.startTest = function (testee, formKeys /*List<string>*/) {
        var data = {
            testeeKey: testee.key,
            testeeToken: testee.token
        };
        if (formKeys) {
            data.formKeys = formKeys;
        }
        return xhr.sendPromise('startTest', data);
    };
    
    // POST: Pages/API/MasterShell.axd/canCompleteTest
    API.canCompleteTest = function () {
        return xhr.sendPromise('canCompleteTest');
    };

    // POST: Pages/API/MasterShell.axd/scoreTest
    API.scoreTest = function (hideScoreReport, showItemScoreReportSummary, showItemScoreReportResponses, surveyData) {
        var data = {
            suppressScore: hideScoreReport,
            itemScoreReportSummary: showItemScoreReportSummary,
            itemScoreReportResponses: showItemScoreReportResponses
        };
        if (surveyData) {
            data.surveyData = surveyData;
        }
        return xhr.sendPromise('scoreTest', data);
    };

    // POST: Pages/API/MasterShell.axd/getDisplayScores
    API.getDisplayScores = function (hideScoreReport, showItemScoreReportSummary, showItemScoreReportResponses) {
        var data = {
            suppressScore: hideScoreReport,
            itemScoreReportSummary: showItemScoreReportSummary,
            itemScoreReportResponses: showItemScoreReportResponses
        };
        return xhr.sendPromise('getScores', data, null, {
            showProgress: false,
            showDialog: false
        });
    };

    // POST: Pages/API/MasterShell.axd/logoutProctor
    API.logoutProctor = function(sessionKey, proctorKey, loginBrowserKey, satBrowserKey) {
        var data = {
            sessionKey: sessionKey,
            proctorKey: proctorKey,
            loginBrowserKey: loginBrowserKey,
            satBrowserKey: satBrowserKey
        };
        return xhr.sendPromise('logoutProctor', data, null, {
            showProgress: false,
            showDialog: false
        });
    };

    Student.API = API;

})(TDS.Student);
