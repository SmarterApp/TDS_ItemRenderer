// entry point into the javascript from the login shell
function init() {
    LoginShell.init();
}

var LoginShell = {
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
    segmentsAccommodations: null, // all segments accommodations
    proctor: null // ProctorLoginInfo object (to be appended to LoginInfo object)
};

// settings for the login shell
LoginShell.Settings = {};

// initialize the login shell for the first time
LoginShell.init = function() {

    try {
        // check if the http cache is valid
        if (TDS.Cache.validate && Util.Browser.isSecure()) {
            TDS.Cache.checkObsolete();
        }
    } catch (ex) {}

    // perform validation check
    if (!LoginShell.validateSecureBrowser()) return;

    // Try to set the appStartTime which we can use later
    if (Util.Browser.isSecure()) {
        Util.SecureBrowser.setAppStartTime((new Date()).toUTCString(), false);
    }

    this.Events.fire('onInit');

    this.defaultBodyCSS = document.body.className;

    // load any login info
    this.setupLoginInfo();

    // create workflow
    this.workflow = LoginShell.createWorkflow();
    this.start();
    sbacossChanges();
};

LoginShell.start = function () {

    this.Events.fire('onStart');

    // figure out what section to start on
    var startSection;
    if (TDS.isProxyLogin) {
        startSection = (document.getElementById('sectionLoginProctor')) ? 'sectionLoginProctor' : 'sectionTestSelection';
    } else {
        startSection = (document.getElementById('sectionLogin')) ? 'sectionLogin' : 'sectionTestSelection';
    }

    // check if custom section was requested
    var querystring = Util.QueryString.parse();
    if (querystring.section) {
        startSection = querystring.section;
    }

    // start workflow
    this.workflow.start(startSection);
};

LoginShell.canShowGlobalAccs = function() {

    if (LoginShell.testSelection != null) {
        return false;
    }
    if (LoginShell.segmentsAccommodations != null) {
        return false;
    }
    if (TDS.globalAccommodations == null) {
        return false;
    }

    // return true if any type is visible, otherwise we hide the global accs
    var accTypes = TDS.globalAccommodations.getTypes();
    return (accTypes.some(function (accType) {
        return accType.isVisible();
    }));
};

// create the workflow that the login shell will follow
LoginShell.createWorkflow = function () {

    var wf = Sections.createWorkflow();

    // logging
    wf.Events.subscribe('onRequest', function(activity) { Util.log('Section Request: ' + activity); });
    wf.Events.subscribe('onReady', function(activity) { Util.log('Section Ready: ' + activity); });
    wf.Events.subscribe('onLeave', function (activity) { Util.log('Section Hide: ' + activity); });
    wf.Events.subscribe('onEnter', function (activity) { Util.log('Section Show: ' + activity); });

    // section is showing
    wf.Events.subscribe('onEnter', function(activity) {

        // scroll up to the top
        window.scrollTo(0, 0);

        // hide the sb logout
        if (activity.getId() != 'sectionLogin') {
            $('#logOut').hide();
        }
    });

    // if there are no test accommodations but there are global accommodaton then show "Settings" link
    wf.Events.subscribe('onEnter', function (section) {
        if (LoginShell.canShowGlobalAccs()) {
            YUD.setStyle('btnAccGlobal', 'display', 'inline');
        } else {
            YUD.setStyle('btnAccGlobal', 'display', 'none');
        }
    });

    if (document.getElementById('sectionLogin')) {
        LoginShell.setupLoginWorkflow(wf);
    }

    if (document.getElementById('sectionTestSelection')) {
        LoginShell.setupSatelliteWorkflow(wf);
    }

    return wf;
};

// workflow for login server
LoginShell.setupLoginWorkflow = function (wf) {

    // create sections
    wf.addActivity(new Sections.LoginProctor());
    wf.addActivity(new Sections.Login());
    wf.addActivity(new Sections.LoginVerify());
    wf.addActivity(new Sections.Logout());

    /* create transitions */

    // "Proctor Login"
    wf.addTransition('sectionLoginProctor', 'next', 'sectionLogin');

    // "Please Sign In"
    wf.addTransition('sectionLogin', 'diag', 'sectionDiagnostics');
    wf.addTransition('sectionLogin', 'next', 'sectionLoginVerify');

    // "Is This You?"
    wf.addTransition('sectionLoginVerify', 'back', 'sectionLogout');
    wf.addTransition('sectionLoginVerify', 'next', 'sectionTestSelection');
};

// workflow for satellite server
LoginShell.setupSatelliteWorkflow = function (wf) {

    // create sections
    wf.addActivity(new Sections.TestSelection());
    wf.addActivity(new Sections.TestApproval());
    wf.addActivity(new Sections.Accommodations());
    wf.addActivity(new Sections.TestVerify());
    wf.addActivity(new Sections.Instructions());
    wf.addActivity(new Sections.SoundCheck());
    wf.addActivity(new Sections.TTSCheck());
    wf.addActivity(new Sections.Logout());


    /* create transitions */

    // "Your Tests"
    wf.addTransition('sectionTestSelection', 'back', 'sectionLogout');
    wf.addTransition('sectionTestSelection', 'acc', 'sectionAccommodations');
    wf.addTransition('sectionTestSelection', 'next', 'sectionTestApproval');

    // "Select accommodations"
    wf.addTransition('sectionAccommodations', 'next', 'sectionTestApproval');
    wf.addTransition('sectionAccommodations', 'back', 'sectionTestSelection');

    // "Waiting For TA Approval"
    wf.addTransition('sectionTestApproval', 'logout', 'sectionLogout');
    wf.addTransition('sectionTestApproval', 'next', 'sectionTestVerify');

    // "Is This Your Test?"
    wf.addTransition('sectionTestVerify', 'back', function() {
        // if there is no proctor or if this is a proxy app then return to test selection
        if (LoginShell.session.isGuest || TDS.isProxyLogin) {
            return 'sectionTestSelection';
        }

        // otherwise put them back for waiting on approval
        return 'sectionTestApproval';
    });

    wf.addTransition('sectionTestVerify', 'next', function () {

        var accProps = TDS.getAccommodationProperties();

        // check if has ELPA
        if (accProps && accProps.hasSoundCheck()) {
            return 'sectionSoundCheck';
        }

        //check that it is not the proxy app and that accommodations have TTS
        if (!TDS.isDataEntry && accProps && accProps.hasTTS()) {
            // TODO: check if there is a matching TTS voice for the current language
            return 'sectionTTSCheck';
        }

        // goto instructions
        return 'sectionInstructions';
    });

    // "Test Instructions and Help"
    wf.addTransition('sectionInstructions', 'back', 'sectionLogout');

    // ELPA audio sound check
    wf.addTransition('sectionSoundCheck', 'back', function() {
        if (LoginShell.testSelection == null) {
            return 'sectionDiagnostics';
        } else {
            return 'sectionLogout';
        }
    });

    wf.addTransition('sectionSoundCheck', 'next', function () {

        var accProps = TDS.getAccommodationProperties();

        //check that it is not the proxy app and that accommodations have TTS
        if (!TDS.isDataEntry && accProps && accProps.hasTTS()) {
            // TODO: check if there is a matching TTS voice for the current language
            return 'sectionTTSCheck';
        }

        if (LoginShell.testSelection == null) {
            return 'sectionDiagnostics';
        } else {
            return 'sectionInstructions';
        }
    });

    // TTS sound check
    wf.addTransition('sectionTTSCheck', 'back', function() {
        if (LoginShell.testSelection == null) {
            return 'sectionDiagnostics';
        } else {
            return 'sectionLogout';
        }
    });

    wf.addTransition('sectionTTSCheck', 'next', function() {
        if (LoginShell.testSelection == null) {
            return 'sectionDiagnostics';
        } else {
            return 'sectionInstructions';
        }
    });
};

LoginShell.clear = function() {
    LoginShell.clearBrowser();
    LoginShell.resetCSS(true);
    LoginShell.clearLoginInfo();
    LoginShell.clearTestSelection();
};

// clear css back to global accommodation defaults
LoginShell.resetCSS = function (useDefaults) {

    // remove test accommodations
    if (LoginShell.segmentsAccommodations &&
        LoginShell.segmentsAccommodations.length > 0) {
        LoginShell.segmentsAccommodations[0].removeCSS(document.body);
    }

    // check if should reset global defaults
    if (useDefaults) {
        TDS.globalAccommodations.removeCSS(document.body);
        TDS.globalAccommodations.selectDefaults();
    }

    // reapply global accomodations
    TDS.globalAccommodations.applyCSS(document.body);
};

LoginShell.clearLoginInfo = function() {
    this.session = null;
    this.testee = null;
    LoginShell.setSessionLabel('');
    LoginShell.setNameLabel('');
};

LoginShell.clearTestSelection = function() {
    this.testSelection = null;
    this.testForms = null;
    this.testeeForms = null;
    this.segmentsAccommodations = null;
};

LoginShell.clearTestAccommodations = function () {

    // get selected test language
    var langGlobal = TDS.getLanguage();

    // remove accommodations
    LoginShell.segmentsAccommodations = null;

    // get select global language
    var langTest = TDS.getLanguage();

    if (langGlobal != langTest) {
        TDS.Messages.Template.processLanguage();
    }
};

LoginShell.setupLoginInfo = function() {
    if (window.tdsLoginInfo) {
        LoginShell.setLoginInfo(window.tdsLoginInfo);
    }
};

LoginShell.setLoginInfo = function(loginInfo) {

    var Storage = TDS.Student.Storage;

    // set login info locally
    this.info = loginInfo;

    // add proctor login info to loginInfo to pass it to Satellite
    if (this.proctor) {
        this.info.proctor = this.proctor;
    }

    if (loginInfo.proctor) {
        // keep login browser key to close out sessions on the login site.
        Storage.setProctorLoginBrowserKey(loginInfo.proctor.loginBrowserKey);

        // keep sat browser key to perform satellite actions - creating session, opening session, etc.
        Storage.setProctorSatBrowserKey(loginInfo.proctor.satBrowserKey);

        // keep track of return url for logging out of non-standard login systems (OpenAM/QueryString)
        Storage.setProctorReturnUrl(loginInfo.proctor.returnUrl);
    }

    if (loginInfo.returnUrl) {
        Storage.setReturnUrl(loginInfo.returnUrl);
    }

    if (loginInfo.satellite) {
        this.satellite = loginInfo.satellite;
    }

    if (loginInfo.testee) {

        // set locally
        this.testee = loginInfo.testee;

        // create full name
        this.testee.name = this.testee.lastName + ', ' + this.testee.firstName;

        // save in storage
        Storage.setTestee(this.testee);
    }

    if (loginInfo.session) {

        // set locally
        this.session = loginInfo.session;

        // save in storage
        Storage.setTestSession(this.session);
    }

    // store passphrase
    if (loginInfo.passphrase) {
        Storage.setPassphrase(loginInfo.passphrase);
    }
    
    // set global accommodations from the login shell
    if (loginInfo.globalAccs && loginInfo.globalAccs.length > 0) {
        MasterShell.removeAccs(TDS.globalAccommodations);
        loginInfo.globalAccs.forEach(function(acc) {
            TDS.globalAccommodations.selectCodes(acc.type, acc.codes);
        });
        MasterShell.applyAccs(TDS.globalAccommodations);
    }

    // update student info on top bar
    TDS.Student.UI.sync();
};

// storing the proctor login info here temporarily before adding it to loginInfo when testee logs in.
LoginShell.setProctor = function (proctor) {
    this.proctor = proctor;
};

LoginShell.getProxySessionID = function () {
    return this.proctor.sessionID;
};

LoginShell.setSessionLabel = function(sessionID) {
    var spanSession = Util.Dom.getElementByClassName('sessionID', 'span', 'ot-topBar');
    spanSession.innerHTML = sessionID;
};

LoginShell.setNameLabel = function(name) {
    var spanName = YUD.get('ot-studentInfo');
    spanName.innerHTML = name;
};

LoginShell.setTestSelection = function(testSelection) {
    TDS.Student.Storage.setTestProperties(testSelection);
    this.testSelection = testSelection;
};

LoginShell.setOppInfo = function(oppInfo) {

    // put in storage
    TDS.Student.Storage.setOppInfo(oppInfo);

    // set forms for test verify screen 
    this.testForms = oppInfo.testForms;
    this.testeeForms = oppInfo.testeeForms;
};

LoginShell.setTestAccommodations = function (segmentsAccommodations) {

    TDS.Student.Storage.setAccList(segmentsAccommodations);

    // get selected global language
    var langGlobal = TDS.getLanguage();

    // set accommodations
    LoginShell.segmentsAccommodations = segmentsAccommodations;

    // get selected test language
    var langTest = TDS.getLanguage();

    // if the approved language has changed then update i18n
    if (langGlobal != langTest) {
        MasterShell.updateLanguage(langTest);
    }
};

/************************************************************/

LoginShell.clearBrowser = function() {

    // clear clipboard
    Util.SecureBrowser.emptyClipBoard();

    var querystring = Util.QueryString.parse();

    // clear student data if we are explicitly logging out or not trying to enter a specific section. 
    if (querystring.logout || querystring.section == null) {
        Util.Browser.eraseCookie('TDS-Student-Auth');
        Util.Browser.eraseCookie('TDS-Student-Data');
    }

    // delete these cookies in all cases.
    Util.Browser.eraseCookie('TDS-Student-Accs');

    // Check if we should clear all cookies. 
    // Don't clear cookies if proxy login because the
    // proctor cookies are set by a different page 
    // in prior requests and they get deleted.
    if (Util.Browser.isSecure() && !TDS.isProxyLogin) {

        // get client cookie
        var clientKey = 'TDS-Student-Client';
        var clientValue = YAHOO.util.Cookie.get(clientKey);

        // NOTE: for legacy purposes.. not sure if we need to still do this
        Util.SecureBrowser.clearCookies();

        // restore client cookie
        if (clientValue) {
            YAHOO.util.Cookie.set(clientKey, clientValue, { path: TDS.cookiePath });
        }
    }

    // try and save client info into cookie
    try {
        LoginShell.saveBrowserInfo();
    } catch (ex) {
    }
};

LoginShell.validateSecureBrowser = function () {
    // retrieve validation check results
    var validationErrors = TDS.SecureBrowser.Validators.validate();
    // check and report any errors
    if (validationErrors.length > 0) {
        TDS.redirectError(validationErrors[0], 'LoginDenied.Header', 'Default.aspx');
        return false;
    }
    return true;
};

LoginShell.closeAllOtherBrowserWindows = function () {
    var cnt = 0;
    try {
        // nsIWindowMediator component
        var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator);

        // enumerator of open browser windows
        var en = wm.getEnumerator("navigator:browser");

        while (en.hasMoreElements()) {
            // open window
            var win = en.getNext();

            // close any open windows that are not the current window
            if (win != wm.getMostRecentWindow("navigator:browser")) {
                win.close();
                cnt++;
            }
        }
    } catch (e) {
        // nothing we can do here.
    }
    Util.log("Closed " + cnt + " backgrounded windows");
};

// these preferences get set everytime someone hits the homepage
LoginShell.setMozillaPreferences = function () {

    var success = Mozilla.execPrivileged(function() {

        // enable tabbing
        Mozilla.setPreference('accessibility.tabfocus', 7);

        // disable checking SSL certificate validity
        Mozilla.setPreference('security.OCSP.enabled', 0);

        // shut off Shift+scroll for back and next browsing
        // (ref: http://kb.mozillazine.org/Firefox_:_FAQs_:_About:config_Entries#Mousewheel.)

        // lets get the alt scroll to work like ctrl scroll
        Mozilla.setPreference('mousewheel.horizscroll.withaltkey.action', 0);
        Mozilla.setPreference('mousewheel.horizscroll.withaltkey.numlines', 1);
        Mozilla.setPreference('mousewheel.horizscroll.withaltkey.sysnumlines', true);

        // disable zooming with control scroll wheel, scroll instead
        Mozilla.setPreference('mousewheel.withcontrolkey.action', 0);
        Mozilla.setPreference('mousewheel.withcontrolkey.numlines', 1);
        Mozilla.setPreference('mousewheel.withcontrolkey.sysnumlines', false);

        // disable back/next with shiftscroll wheel, scroll instead
        Mozilla.setPreference('mousewheel.withshiftkey.action', 0);
        Mozilla.setPreference('mousewheel.withshiftkey.numlines', 1);
        Mozilla.setPreference('mousewheel.withshiftkey.sysnumlines', false);

        // unrequested connections
        Mozilla.setPreference('browser.safebrowsing.enabled', false);
        Mozilla.setPreference('browser.safebrowsing.malware.enabled', false);
        Mozilla.setPreference('extensions.blocklist.enabled', false);
        Mozilla.setPreference('extensions.update.enabled', false);
        Mozilla.setPreference('browser.search.update', false);
        Mozilla.setPreference('browser.microsummary.enabled', false, 0, 6.9);
        Mozilla.setPreference('browser.microsummary.updateGenerators', false, 0, 6.9);
        Mozilla.setPreference('network.prefetch-next', true);

        //hiding the unresponsive script pop up - mainly for SB3.5 (SB4.0 shipped with this property).
        Mozilla.setPreference('dom.max_script_run_time', 0);

        // disable spellcheck for multi-line controls (e.g., <textarea>s) and and single-line controls
        Mozilla.setPreference('layout.spellcheckDefault', 0);

        // disable page history  (so that browser back is not available)
        Mozilla.setPreference('browser.sessionhistory.max_entries', 0);

        // make sure appcache is always enabled
        var offlineEnablePref = 'browser.cache.offline.enable';
        if (!Mozilla.getPreference(offlineEnablePref)) {
            Mozilla.setPreference(offlineEnablePref, true);
        }

        var offlineAllowPref = 'offline-apps.allow_by_default';
        if (!Mozilla.getPreference(offlineAllowPref)) {
            Mozilla.setPreference(offlineAllowPref, true);
        }

        // BUG #80506: Screen flickering on OS X 10.6 
        if (navigator.userAgent.indexOf('OS X 10.6') != -1) {
            // turn off hardware acceleration
            Mozilla.setPreference('layers.acceleration.disabled', true);
        }

        // fix any user agent string issues
        Util.SecureBrowser.fixUserAgent();

        // if the browser is windows/linux then we need to force fullscreen
        if (Util.Browser.isWindows() || Util.Browser.isLinux()) {
            var fullscreenFix = Util.Storage.get('tds.fullscreenFix');
            if (!fullscreenFix) { // already applied fix?
                Mozilla.fullscreen();
                Util.Storage.set('tds.fullscreenFix', true);
            }
        }

        // if the browser is Mac OS 10.8 or higher, disable screenshots
        if (Util.Browser.isMac() && (Util.Browser.getOSXVersion() >= 10.8) && (Util.Browser.getSecureVersion() <= 6.2)) {
            var screenshotsDisabled = Mozilla.disableScreenshots();
            if (screenshotsDisabled) {
                Util.log('Screenshots are disabled.');
            } else {
                Util.log('Screenshots are not disabled.');
            }
        }

        // disable permissive mode
        Util.SecureBrowser.enablePermissiveMode(false);
        
        // close any other secure browser windows that might be hiding in the background
        LoginShell.closeAllOtherBrowserWindows();
    });

    if (success) {
        Util.log('Mozilla preferences successfully set.');
    } else {
        Util.log('Mozilla preferences failed to set.');
    }
};

// save client info in cookies
LoginShell.saveBrowserInfo = function () {

    var BC = LoginShell.BrowserInfoCookie;

    BC.clear();

    // screen dimensions
    BC.setClientInfo('screen', screen.width + 'x' + screen.height);

    // MAC address
    var macAddress = Util.SecureBrowser.getMACAddress();
    if (macAddress != null) {
        BC.setClientInfo('mac', macAddress);
    }

    // local IP
    var ipAddress = Util.SecureBrowser.getIPAddress();
    if (ipAddress != null) {
        BC.setClientInfo('ip', ipAddress);
    }
};

LoginShell.Events.subscribe('onInit', function () {

    // Windows and Linux SB have an issue where you cannot type into text areas without this hack.
    if (Util.Browser.isSecure() && !Util.Browser.isMac()) {
        Util.SecureBrowser.fixFocus();
    }

    // set SB preferences
    if (Util.Browser.isSecure()) {
        setTimeout(LoginShell.setMozillaPreferences, 0);
    }

    // check if browser is unsupported
    if (window.browserUnsupported) {
        TDS.Dialog.showWarning(Messages.get('BrowserUnsupported'));
    }

});

/************************************************************/

LoginShell.BrowserInfoCookie = {

    _name: 'TDS-Student-Browser',

    clear: function() {
        YAHOO.util.Cookie.remove(this._name, {
            path: TDS.cookiePath // all pages
        });
    },

    setClientInfo: function(key, value) {
        YAHOO.util.Cookie.setSub(this._name, key, value, {
            path: TDS.cookiePath // all pages
        });
    },

    getClientInfo: function(key) {
        YAHOO.util.Cookie.getSub(this._name, key);
    }
};