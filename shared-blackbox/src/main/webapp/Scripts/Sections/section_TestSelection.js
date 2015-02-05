Sections.TestSelection = function() {
    Sections.TestSelection.superclass.constructor.call(this, 'sectionTestSelection');
    this.testSelections = null;
};

YAHOO.lang.extend(Sections.TestSelection, Sections.Base);

Sections.TestSelection.Status = {
    disabled: 0,
    hidden: 1,
    start: 2,
    resume: 3
};

Sections.TestSelection.prototype.init = function() {
    this.addClick('btnLogout', function() {
        this.request('back');
    });
};

// load the tests
Sections.TestSelection.prototype.load = function(grade) {

    // erase any test previous selections
    LoginShell.testSelection = null;

    // HACK: if the grade is null and there are previously loaded tests then just show them
    // BUG 108114: Always get list of tests.. maybe we can cache oppkey in future
    /*if (grade == null && this.testSelections != null) {
        return false;
    }*/

    var testee = TDS.Student.Storage.getTestee();
    var testSession = TDS.Student.Storage.getTestSession();

    TDS.Student.API.getTests(testee, testSession, grade).then(function (testSelections) {
        this.testSelections = testSelections;
        this.ready(testSelections);
    }.bind(this));

    return true; // tell workflow to wait for xhr to finish
};

// render the test selections
Sections.TestSelection.prototype.enter = function() {
    
    // debug info
    Util.dir(this.testSelections);

    var testSelectionsEl = YUD.get('testSelections');

    // clear html
    if (testSelectionsEl.innerHTML.length > 0) {
        testSelectionsEl.innerHTML = '';
    }

    // add test properties
    if (this.testSelections && this.testSelections.length > 0) {
        for (var i = 0; i < this.testSelections.length; i++) {
            var testSelection = this.testSelections[i];
            var tableRow = this._createButton(testSelection, i + 1);
            if (tableRow != null) {
                testSelectionsEl.appendChild(tableRow);
            }
        }
    } else {
        testSelectionsEl.innerHTML = '<span id="testSelectionsEmpty" i18n-content="Opportunity.Label.NoTests"></span>';
    }

    // apply message translations
    TDS.Messages.Template.processLanguage(testSelectionsEl);
};

// this function creates a single test selection div
Sections.TestSelection.prototype._createButton = function(testSelection, idx) {
    
    /*
    Login.TS.HeaderStart = 'Start {0} Test';
    Login.TS.HeaderResume = 'Resume {0} Test';
    Login.TS.HeaderInactive = 'You\'ve used all your opportunities';
    Login.TS.DescActive = 'This is <em class="">opportunity {0} of {1}</em>';
    Login.TS.DescInactive = 'You\'ve used all your opportunities';
    */

    // figure out all the labels
    var testName = testSelection.displayName;

    // if score entry app then add mode
    if (TDS.isDataEntry) {
        testName += ' (' + testSelection.mode + ')';
    }

    var testActive = false; // can we begin test
    var testClass = ''; // start, resume or inactive
    var testHeader = '';
    var testDesc = '';
    var testOpp = '';

    if (testSelection.status == Sections.TestSelection.Status.start) {
        testActive = true;
        testClass = 'start';
        testHeader = '<span class="testAction">Start</span> ' + testName;
        testDesc = 'This is ';
    } else if (testSelection.status == Sections.TestSelection.Status.resume) {
        testActive = true;
        testClass = 'resume';
        testHeader = '<span class="testAction">Resume</span> ' + testName;
        testDesc = 'This is ';
    } else if (testSelection.status == Sections.TestSelection.Status.disabled) {
        testClass = 'inactive';
        testHeader = '<span class="testAction">Inactive</span> ' + testName;
        testDesc = testSelection.reasonText;
    } else {
        // hidden
        return null;
    }

    testOpp = Messages.get('Login.TS.DescActive', [testSelection.opportunity, testSelection.maxOpportunities]);

    // render the html:

    // create test selection button
    var testButtonEl = HTML.LI();
    YUD.addClass(testButtonEl, 'testSelection');
    YUD.addClass(testButtonEl, testClass);
    YUD.addClass(testButtonEl, (idx % 2 == 0) ? 'even' : 'odd');
    YUD.setAttribute(testButtonEl, 'tabindex', 0);

    // create div wrapper
    var divWrapperEl = HTML.DIV();
    YUD.setAttribute(divWrapperEl, 'role', 'button');

    // create test header
    var testHeaderEl = HTML.STRONG();
    testHeaderEl.innerHTML = testHeader;
    divWrapperEl.appendChild(testHeaderEl);

    // create test description
    var testDescEl = HTML.P();
    testDescEl.innerHTML = testDesc;

    if (testActive) {
        testDescEl.appendChild(HTML.SPAN(null, testOpp));
    }

    divWrapperEl.appendChild(testDescEl);
    
    testButtonEl.appendChild(divWrapperEl);

    if (testActive) {
    // add mouse click
    this.addClick(testButtonEl, function(evt) {
            this.select(testSelection);
    });

    // add enter key
        YUE.on(testButtonEl, 'keypress', function(ev) {
            var charCode = YUE.getCharCode(ev);
            if (charCode == 13) {
            this.select(testSelection);
        }
    }, this, true);
    }

    return testButtonEl;
};

// called when someone clicks on start/resume on a test
Sections.TestSelection.prototype.select = function(testSelection, skipWarning) {

    var self = this;
    
    // check if there is a warning
    if (!skipWarning && !Util.String.isNullOrEmpty(testSelection.warningText)) {
        TDS.Dialog.showPrompt(testSelection.warningText, function() {
            self.select(testSelection, true);
        });
        return false;
    }

    // save test selection
    LoginShell.setTestSelection(testSelection);

    // show progress since we might be detecting java
    TDS.Dialog.showProgress();
    
    self.open(testSelection);
    return true;
};

// call the server to open test
Sections.TestSelection.prototype.open = function(test) {

    var testee = TDS.Student.Storage.getTestee();
    var session = TDS.Student.Storage.getTestSession();

    // if this is a proctorless session and the test has never been started then show accommodations selection
    if (session.isGuest && test.status == 2) {
        // get accommodations for selected test
        TDS.Student.API.getTestAccommodations(test, testee, session)
            .then(function (accommodations) {
                this.request('acc', accommodations);
        }.bind(this));
    } else {

        // get data for opening test
        var proctor = TDS.Student.Storage.getProctor();
        // TODO: if (!proctorBrowserKey) log(error)
        var proctorBrowserKey = (proctor && proctor.satBrowserKey) || null;
        var passphrase = TDS.Student.Storage.getPassphrase();

        // open the selected test
        TDS.Student.API.openTest(test, testee, session, null, proctorBrowserKey, passphrase)
            .then(function (oppInfo) {
                LoginShell.setOppInfo(oppInfo);
                this.request('next');
        }.bind(this));
    }
};
