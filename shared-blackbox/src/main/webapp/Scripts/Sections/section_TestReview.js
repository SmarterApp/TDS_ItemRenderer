//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
﻿/*
This is the code for the review screen where they can go back into the test or complete.
*/
/*
This is the code for the review screen where they can go back into the test or complete.
*/

(function (TDS, Sections) {

    function TestReview() {
        TestReview.superclass.constructor.call(this, 'sectionTestReview');
    };

    YAHOO.lang.extend(TestReview, Sections.Base);

    TestReview.prototype.init = function () {

        // listen for test complete
        this.addClick('btnCompleteTest', this.score);

        // listen for test pause and hide/show button
        var pauseEnabled = TDS.getAppSetting('tds.reviewshell.pauseEnabled', false);
        if (pauseEnabled) {
            this.addClick('btnPauseTest', this.pause);
        } else {
            $('#btnPauseTest').remove();
        }

    };

    TestReview.prototype.load = function () {

        // show marked warning text
        this.showMarked(window.groups);

        // show unanswered warning text
        this.showUnanswered(window.groups);

        // fill select box
        this.render(window.groups);
    };

    // show warning div if any question is marked for review
    TestReview.prototype.showMarked = function(groups) {
        var marked = groups.some(function (group) {
            return group.items.some(function(item) {
                return item.marked;
            });
        });
        if (marked) {
            $('.markedWarning').show();
        }
    };

    // show warning div if any question is unanswered
    TestReview.prototype.showUnanswered = function (groups) {
        var unanswered = groups.some(function (group) {
            return group.items.some(function(item) {
                return !item.answered;
            });
        });
        if (unanswered) {
            $('.unansweredWarning').show();
        }
    };

    // render the buttons for each item
    TestReview.prototype.render = function (groups) {
        
        // remove hard coded drop down 
        var $container = $('#sectionTestReview div.choices');

        // create <div class="pages"> 
        var pagesEl = document.createElement('div');
        pagesEl.className = 'pages';

        // create <h3>Questions:</h3>
        var headerEl = document.createElement('h3');
        $(headerEl).text(Messages.getAlt('TestShellScripts.Label.Questions', 'Questions:'));

        // create <ul> of items
        var listEl = document.createElement('ul');

        // create <li>
        groups.forEach(function (group) {
            group.items.forEach(function(item) {
                var el = document.createElement('li');
                var linkEl = document.createElement('a');
                linkEl.href = '#';
                $(linkEl).click(function (evt) {
                    YUE.stopEvent(evt);
                    TDS.redirectTestShell(group.page, item.position);
                });
                $(linkEl).text(item.position);
                var label = 'Question';
                if (item.marked) {
                    $(linkEl).addClass('marked');
                    label += ' marked for review';
                }
                if (!item.answered) {
                    $(linkEl).addClass('unanswered');
                    if (item.marked) {
                        label += ' and';
                    }
                    label += ' unanswered';
                }
                linkEl.setAttribute('title', label);
                el.appendChild(linkEl);
                listEl.appendChild(el);
            });
        });

        // add to review shell
        pagesEl.appendChild(headerEl);
        pagesEl.appendChild(listEl);
        $container.prepend(pagesEl);

    };

    TestReview.prototype.score = function() {

        // show confirm dialog
        var msgCannotComplete = Messages.getAlt('ReviewShell.Message.CannotCompleteTest', 'Cannot complete the test.');
        var msgSubmitTest = Messages.getAlt('ReviewShell.Message.SubmitTest', 'Are you sure you want to submit the test?');

        // get score accommodations
        var accProps = Accommodations.Manager.getCurrentProps();
        var hideTestScore = accProps.hideTestScore();
        var showItemScoreReportSummary = accProps.showItemScoreReportSummary();
        var showItemScoreReportResponses = accProps.showItemScoreReportResponses();

        var self = this;

        // score the test
        function scoreTest() {
            var surveyData = TestReview.Survey.getData();
            return TDS.Student.API.scoreTest(hideTestScore, showItemScoreReportSummary, showItemScoreReportResponses, surveyData).then(function (summary) {
                if (summary) {
                    self.request('next', summary);
                }
            });
        }

        // submit the test
        function submitTest() {
            // confirm if want to submit test
            TDS.Dialog.showPrompt(msgSubmitTest, function () {
                // check if survey is enabled
                if (TestReview.Survey.isSupported()) {
                    TestReview.Survey.show();
                } else {
                    scoreTest();
                }
            });
        }

        // when submitting survey score the test
        TestReview.Survey.on('submit', scoreTest);

        // check if the test can be completed
        var testInfo = TDS.Student.Storage.getTestInfo();
        if (testInfo && testInfo.validateCompleteness) {
            TDS.Student.API.canCompleteTest().then(function(canComplete) {
                if (canComplete) {
                    submitTest();
                } else {
                    TDS.Dialog.showAlert(msgCannotComplete);
                }
            });
        } else {
            submitTest();
        }
    };

    TestReview.prototype.pause = function() {

        // get the restart mins
        var oppRestartMins = -1;
        var testInfo = TDS.Student.Storage.getTestInfo();
        if (testInfo) {
            oppRestartMins = testInfo.oppRestartMins;
        }

        // get the pause message
        var pauseMessage = ErrorCodes.get('Pause', [oppRestartMins]);

        // show pause warning
        TDS.Dialog.showPrompt(pauseMessage, function() {
            // tell server to pause
            TDS.Student.API.pauseTest('manual from review').then(function () {
                // go back to login page
                TDS.logout();
            });
        });

    };

    Sections.TestReview = TestReview;

})(window.TDS, window.Sections);