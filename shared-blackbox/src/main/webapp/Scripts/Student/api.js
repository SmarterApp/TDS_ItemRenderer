TDS.Student = TDS.Student || {};

(function (Student) {

    var API = {};
    var xhr = new TDS.Student.Xhr();

    // POST: Pages/API/MasterShell.axd/loginStudent
    API.loginStudent = function (keyValues /*string[]*/, sessionID /*string*/, forbiddenApps /*string[]*/) {

        var forbiddenAppsFlat = forbiddenApps.map(function (app) {
            return app.desc;
        }).join('|');

        var data = {
            keyValues: keyValues.join(';'), // e.x., 'ID:9999999504;FirstName:FirstName504'
            sessionID: sessionID,
            forbiddenApps: forbiddenAppsFlat // e.x., 'iexplore|skype'
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
    API.pauseTest = function () {
        return xhr.sendPromise('pauseTest');
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
    API.startTest = function (testee, formKey /*string*/) {
        var data = {
            testeeKey: testee.key,
            testeeToken: testee.token,
            formKey: formKey
        };
        return xhr.sendPromise('startTest', data);
    };
    
    // POST: Pages/API/MasterShell.axd/canCompleteTest
    API.canCompleteTest = function () {
        return xhr.sendPromise('canCompleteTest');
    };

    // POST: Pages/API/MasterShell.axd/scoreTest
    API.scoreTest = function (hideScoreReport, showItemScoreReportSummary, showItemScoreReportResponses) {
        var data = {
            suppressScore: hideScoreReport,
            itemScoreReportSummary: showItemScoreReportSummary,
            itemScoreReportResponses: showItemScoreReportResponses,
        };
        return xhr.sendPromise('scoreTest', data);
    };

    // POST: Pages/API/MasterShell.axd/getDisplayScores
    API.getDisplayScores = function (hideScoreReport, showItemScoreReportSummary, showItemScoreReportResponses) {
        var data = {
            suppressScore: hideScoreReport,
            itemScoreReportSummary: showItemScoreReportSummary,
            itemScoreReportResponses: showItemScoreReportResponses,
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
