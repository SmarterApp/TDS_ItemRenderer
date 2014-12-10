/*
This is the code for the final section of the test that shows the results.
*/

(function(TDS, Sections) {

    function TestResults() {
        TestResults.superclass.constructor.call(this, 'sectionTestResults');
        this._pollAttempts = 5; // how many times we check for display scores
        this._pollDelay = 60000; // the delay between each display score check
        this.addClick('btnScoreLogout', this.logout);
        this.addClick('btnEnterMoreScores', this.redirectToTestSelectionSection); // Enter more scores for this student
    }

    YAHOO.lang.extend(TestResults, Sections.Base);

    TestResults.prototype.load = function(summary) {

        // reset fields
        YUD.get('lblName').innerHTML = '';
        YUD.get('lblSSID').innerHTML = '';
        YUD.get('lblTestName').innerHTML = '';

        // set test info from global variables
        var testee = TDS.Student.Storage.getTestee();
        if (testee) {
            if (testee.lastName && testee.firstName) {
                YUD.get('lblName').innerHTML = testee.lastName + ', ' + testee.firstName;
            }
            if (testee.id) {
                YUD.get('lblSSID').innerHTML = testee.id;
            }
        }

        var testProps = TDS.Student.Storage.getTestProperties();
        if (testProps && testProps.displayName) {
            YUD.get('lblTestName').innerHTML = testProps.displayName;
        }

        // if there was a summary passed in then render it otherwise go load it
        if (summary != null) {
            this.renderSummary(summary);
        } else {
            this.loadSummary();
        }
    };

    TestResults.prototype.renderSummary = function(testSummary) {
        Util.dir(testSummary);

        var resultsContainer = this.getContainer();

        // check if we are supposed to poll score scores
        if (testSummary.pollForScores) {
            if (this._pollAttempts > 0) {
                // schedule polling
                YUD.addClass(resultsContainer, 'scoreWaiting');
                this.pollSummary();
            } else {
                // stop polling
                YUD.addClass(resultsContainer, 'scoreTimedOut');
            }
        } else {
            // check what kind of scores we have to show
            var hasTestScores = (testSummary.testScores && testSummary.testScores.length > 0);
            var hasItemScores = (testSummary.itemScores && testSummary.itemScores.length > 0);

            // render scores if available
            if (hasTestScores) {
                this.renderTestScores(testSummary.testScores);
            }
            if (hasItemScores) {
                this.renderItemScores(testSummary.itemScores, testSummary.viewResponses);
            }

            // if there are no scores available then show explanation
            if (!hasTestScores && !hasItemScores) {
                // if this is PT then add class indicating score isn't available
                YUD.addClass(resultsContainer, TDS.inPTMode ? 'scoreUnavailableInPT' : 'scoreUnavailable');
            }
        }
    };

    // this gets called when there are display scores to write out to the screen
    TestResults.prototype.renderTestScores = function(testScores) {
        var resultsContainer = this.getContainer();

        // hide polling message
        YUD.removeClass(resultsContainer, 'scoreWaiting');

        // show score panel
        YUD.addClass(resultsContainer, 'scoreAvailable');

        // create score html
        var html = [];

        Util.Array.each(testScores, function(testScore) {
            var scoreHtml = '<li><span class="scoreLabel">{label}</span><span class="scoreValue">{value}</span></li>';
            scoreHtml = YAHOO.lang.substitute(scoreHtml, testScore);
            html.push(scoreHtml);
        }, this);

        // write score
        var testScoresListEl = YUD.get('scoreList'); // <ul>
        testScoresListEl.innerHTML = html.join(' ');
    };

    TestResults.prototype.renderItemScores = function(itemScores, viewResponses) {

        var resultsContainer = this.getContainer();

        // hide polling message
        YUD.removeClass(resultsContainer, 'scoreWaiting');

        // show score panel
        YUD.addClass(resultsContainer, 'scoreAvailable');

        // get table body
        var scoresTblEl = YUD.get('itemScores'); // <table>
        var scoresBodyEl = scoresTblEl.getElementsByTagName('tbody')[0];

        // the default correct answer text if the format text is missing
        var defaultCorrectAnswer = Messages.getAlt('ItemScores.Row.Format.NA', '');

        // create table rows
        Util.Array.each(itemScores, function(itemScore) {
            var scoreRowEl = HTML.TR();

            // create position
            var scorePosEl;

            // check if we allow going back into the test to view responses
            if (viewResponses) {
                // create link back to test shell
                scorePosEl = HTML.A({ href: '#' }, itemScore.position);

                this.addClick(scorePosEl, function(ev) {
                    TDS.redirectTestShell(itemScore.page);
                });
            } else {
                // just show text
                scorePosEl = itemScore.position;
            }

            // Column "Question Number"
            scoreRowEl.appendChild(HTML.TD(null, scorePosEl));

            // Column "Your Answer"
            var responseText;

            if (itemScore.format != 'MC') {
                responseText = Messages.getAlt('ItemScores.Row.Format.' + itemScore.format, itemScore.response);
            } else {
                responseText = itemScore.response;
            }

            scoreRowEl.appendChild(HTML.TD(null, responseText));

            // Column "Correct Answer"
            var answerText;

            if (itemScore.format != 'MC') {
                // show the custom message key otherwise the score rationale
                answerText = Messages.getAlt('ItemScores.Row.Format.' + itemScore.format, defaultCorrectAnswer);
            } else {
                // show the MC answer key
                var answerKey = parseScoreRationale(itemScore.scoreRationale);
                answerText = answerKey;
            }

            scoreRowEl.appendChild(HTML.TD(null, answerText));

            // Column "Score"
            if (itemScore.score >= 0) {
                scoreRowEl.appendChild(HTML.TD(null, itemScore.score + '/' + itemScore.scoreMax));
            } else {
                scoreRowEl.appendChild(HTML.TD(null, Messages.getAlt('ItemScores.Row.NoScore', 'N/A')));
            }

            scoresBodyEl.appendChild(scoreRowEl);
        }, this);

        // show table
        YUD.setStyle(scoresTblEl, 'display', 'block');
    };

    // call this to wait and then try and load test summary
    TestResults.prototype.pollSummary = function() {
        this._pollAttempts--;
        YAHOO.lang.later(this._pollDelay, this, this.loadSummary);
    };

    // load test summary
    TestResults.prototype.loadSummary = function() {
        // get score accommodations
        var accProps = Accommodations.Manager.getCurrentProps();
        var hideTestScore = accProps.hideTestScore();
        var showItemScoreReportSummary = accProps.showItemScoreReportSummary();
        var showItemScoreReportResponses = accProps.showItemScoreReportResponses();

        TDS.Student.API.getDisplayScores(hideTestScore, showItemScoreReportSummary, showItemScoreReportResponses).then(function(summary) {
            if (summary) {
                this.renderSummary(summary);
            }
        }.bind(this));
    };

    TestResults.prototype.logout = function() {
        TDS.Dialog.showProgress();
        TDS.logout();
    };

    TestResults.prototype.redirectToTestSelectionSection = function () {
        if (TDS.isProxyLogin) {
            var testee = TDS.Student.Storage.getTestee();
            var firstName = testee.firstName;
            var lastName = testee.lastName;
            var testeeID = testee.id;

            var message = Messages.get('TestResults.Link.EnterMoreScoresConfirm', [lastName, firstName, testeeID]);

            TDS.Dialog.showPrompt(message, function() {
                //this logic may be useful also for SIRVE and that is why the check above is for isProxyLogin rather than isDataEntry.
                TDS.redirect('Pages/LoginShell.aspx?section=sectionTestSelection');
            });
        } else {
            // this button should never show up on a student page
            this.logout();
        }
    };

    Sections.TestResults = TestResults;

    /////////////////////////////////////////////

    // This is some beginning of rationale parsing.

    // This tries to parse the <ScoreRationale> info 
    function parseScoreRationale(scoreRationale) {
        // check if xml 
        if (scoreRationale && scoreRationale.indexOf('<ScoreRationale>') != -1) {
            // parse xml
            var xmlDoc;
            try {
                xmlDoc = Util.Xml.parseFromString(scoreRationale);
            } catch (ex) {}
            // find score rationale text
            if (xmlDoc) {
                scoreRationale = $(xmlDoc).find('ScoreRationale').text();
                scoreRationale = $.trim(scoreRationale);
            }
        }
        return scoreRationale;
    }

})(window.TDS, window.Sections);