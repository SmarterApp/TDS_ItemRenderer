//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
﻿Sections.Login = function()
{
    Sections.Login.superclass.constructor.call(this, 'sectionLogin');

    this.Controls =
    {
        txtLoginSessionID: YUD.get('loginSessionID') ? [YUD.get('loginSessionID')] : [YUD.get('loginSessionID1'), YUD.get('loginSessionID2'), YUD.get('loginSessionID3')],
        cbUser: YUD.get('cbUser'),
        cbSession: YUD.get('cbSession'),
        btnLogin: YUD.get('btnLogin'),
        btnLogout: YUD.get('btnLogout')
    };

    // Events: checkboxes
    this.addClick(this.Controls.cbUser, function()
    {
        this.disableUserInput(this.Controls.cbUser.checked);
    });

    this.addClick(this.Controls.cbSession, function()
    {
        this.disableSessionInput(this.Controls.cbSession.checked);
    });

    this.addClick(this.Controls.btnLogout, function () {
        TDS.logout();
    });
};

YAHOO.lang.extend(Sections.Login, Sections.Base);

Sections.Login._loginInputPrefix = 'loginRow_';
Sections.Login._loginErrorPrefix = 'loginErr_';

// get user info
Sections.Login.prototype.getLoginInput = function(id)
{
    return YUD.get(Sections.Login._loginInputPrefix + id);
};

Sections.Login.prototype.setLoginInput = function(id, value)
{
    var input = YUD.get(Sections.Login._loginInputPrefix + id);
    if (input) input.value = value;
};

// get session info
Sections.Login.prototype.getSessionID = function () {
    var txtLoginSessionIdArray = this.Controls.txtLoginSessionID,
        txtLoginSessionIdValue = '';

    if (TDS.isDataEntry || TDS.isReadOnly) {
        txtLoginSessionIdValue = LoginShell.getProxySessionID();
    } else {
        for (var i = 0; i < txtLoginSessionIdArray.length; i++) {
            var inputValue = txtLoginSessionIdArray[i].value.trim();
            txtLoginSessionIdValue += (i == 0 || inputValue == '') ? inputValue : '-' + inputValue;
        }
    }

    // for guest session, a transfer would be neccessary
    if (txtLoginSessionIdValue == 'GUEST-GUEST-GUEST') {
        txtLoginSessionIdValue = 'GUEST Session';
    }

    return txtLoginSessionIdValue;
};
Sections.Login.prototype.setSessionID = function (value) {
    var txtLoginSessionIdArray = value.split('-');
    for (var j = 0; j < this.Controls.txtLoginSessionID.length; j++) {
        // get specific session input element
        var sessionEl = this.Controls.txtLoginSessionID[j];
        if (sessionEl) {
            sessionEl.value = value ? txtLoginSessionIdArray[j] : '';
        }
    }
};

Sections.Login.prototype.enter = function () {
    if (TDS.isProctoredAssessmentPreview()) {
        // switch to GUEST user and sign in
        this.disableUserInput(true);
        this.validate();
    }
};

Sections.Login.prototype.load = function ()
{
    // clear previous student and reset accommodations
    TDS.globalAccommodations.selectDefaults();
    LoginShell.clear();

    // Mainly On chrome OS running our extension, we want to try to force full screen after student logs in 
    // and release this lock when they log out; also on iOS browser, we call function enableLockDown to disable
    // the check if the browser has been backgrounded
    if (Util.Browser.isSecure()) {
        if (Util.Browser.isWindows()) {
            // For Windows, we attempt to lock down while launching the Secure Browser
            Util.SecureBrowser.enableLockDown(true);
        } else {
            Util.SecureBrowser.enableLockDown(false);
        }
    }

    var loginForm = YUD.get('loginForm');

    loginForm.onsubmit = function () {
        this.validate();
        return false; // cancels form submission
    }.bind(this);

    // render login fields and set visible controls
    this.render();
    this.setControls();

    // If the welcome mat has already collected the login information, 
    // submit it now.
    this.checkForRedirect(loginForm);

    // load currently running apps (some mobile browsers require we do this)
    Util.SecureBrowser.loadProcessList();
};

Sections.Login.prototype.render = function() {

    this.setBrowserInfo();

    // reset current requirements
    var loginContainer = YUD.get('loginContainer');
    if (loginContainer.innerHTML != '') loginContainer.innerHTML = '';

    // render new inputs
    Util.Array.each(TDS.Config.loginRequirements, this.renderRequirement, this);
};

Sections.Login.prototype.renderRequirement = function(loginReq)
{
    var loginContainer = YUD.get('loginContainer');

    // <label for="loginFirstName" i18n-content="User.Label.FirstName"></label>
    // <input type="text" id="loginFirstName" name="loginFirstName" size="26" tabindex="0" />
    // <span id="loginFirstNameError" class="validation">&nbsp;</span><br/>

    var idReq = Sections.Login._loginInputPrefix + loginReq.id;
    var idErr = Sections.Login._loginErrorPrefix + loginReq.id;
    var i18n = 'User.Label.' + loginReq.id;

    // login row
    var loginRow = HTML.DIV({ 'className': 'loginRow' });
    loginContainer.appendChild(loginRow);

    // label 
    var loginReqLabel = HTML.LABEL({ 'for': idReq });

    if (Messages.get(i18n) != i18n)
    {
        // use i18n replacement
        Messages.setHTMLContent(loginReqLabel, 'User.Label.' + loginReq.id);
    }
    else
    {
        // if there is no i18n then fallback on login req label info
        Util.Dom.setTextContent(loginReqLabel, loginReq.label + ':');
    }

    loginRow.appendChild(loginReqLabel);

    // input
    var loginReqInput = HTML.INPUT(
    {
        'type': 'text',
        'id': idReq,
        'name': idReq,
        'size': 26, 
        'maxlength': 100, 
        'tabindex': 0
    });
    
    loginRow.appendChild(loginReqInput);

    // error message
    var loginReqError = HTML.SPAN({ 'id': idErr, 'className': 'validation' });
    loginReqError.innerHTML = '&nbsp;';
    loginRow.appendChild(loginReqError);

};

// enable/disable the login controls
Sections.Login.prototype.setControls = function()
{
    // check if PT mode
    if (TDS.inPTMode)
    {
        // enable checkboxes in PT mode
        this.disableUserInput(true);
        this.disableSessionInput(true);

        this.Controls.cbUser.checked = true;
        this.Controls.cbSession.checked = true;
    }
    else
    {
        // hide checkboxes in OP mode
        this.disableUserInput(false);
        this.disableSessionInput(false);

        this.Controls.cbUser.checked = false;
        this.Controls.cbSession.checked = false;
    }

    this.setStudentGuestLogin();

    // check if score entry app
    if (TDS.isDataEntry || TDS.isReadOnly)
    {
        // hide session input section since we assign session on the server side
        YUD.setStyle('loginForm2', 'display', 'none');
        // Cannot login as GUEST
        this.disableUserInput(false);
        this.Controls.cbUser.checked = false;
    }
};

Sections.Login.prototype.setStudentGuestLogin = function () {

    if (TDS.inPTMode && $(document.body).hasClass('mode_Student')) {

        //show/hide/disable GUEST Session Form
        var userProp = TDS.getAppSetting('student.login.guestUser'),
            sessionProp = TDS.getAppSetting('student.login.guestSession');

        if (userProp) {
            //possible value of userProp:
            //TDS_Glogin_User_Hide 
            //TDS_Glogin_User_Disable
            $(document.body).addClass(userProp);
        }
        if (sessionProp) {
            //possible value of sessionProp:
            //TDS_Glogin_Session_Hide
            //TDS_Glogin_Session_Disable
            $(document.body).addClass(sessionProp);
        }
    }
};

Sections.Login.prototype.disableUserInput = function(disabled)
{
    this.Controls.cbUser.checked = disabled;

    Util.Array.each(TDS.Config.loginRequirements, function(loginReq)
    {
        var input = this.getLoginInput(loginReq.id);

        if (disabled)
        {
            input.disabled = true;
            input.value = 'GUEST';
        }
        else
        {
            input.disabled = false;
            input.value = '';
        }
        
    }, this);
};

Sections.Login.prototype.disableSessionInput = function(disabled)
{
    this.Controls.cbSession.checked = disabled;
    for (var i = 0; i < this.Controls.txtLoginSessionID.length; i++) {
        if (this.Controls.txtLoginSessionID[i]) {
            this.Controls.txtLoginSessionID[i].disabled = disabled;
        }
    }

    if (disabled) {
        this.setSessionID('GUEST-GUEST-GUEST');
    } else {
        this.setSessionID('');
    }
};

// validate the login fields and submit to the server for authentication
Sections.Login.prototype.validate = function ()
{
    // Test to verify that local storage is working... otherwise thing will fail silectly later resulting
    //  in much user frustration.
    try {
        Util.Storage.set('storageTest', '');
    } catch (ex) {
        if (ex.name.toLowerCase() === 'quotaexceedederror') {
            var localStorageErrorMsg = Messages.getAlt('Login.Message.LocalStorageError', 'Unable to use local storage on your device. Please disable Private browsing if enabled');
            TDS.Dialog.showAlert(localStorageErrorMsg, function () { return; });
        }
        return false;
    }
    Util.Storage.remove('storageTest'); // Clean Up

    //Check if the environment is secure in case we are using a secure browser
    if (Util.Browser.isSecure() && !TDS.Debug.ignoreBrowserChecks) {
        var securityCheckResult = Util.SecureBrowser.canEnvironmentBeSecured();
        if (securityCheckResult && !securityCheckResult.canSecure) {
            var defaultError = 'Environment is not secure. Please notify your proctor';
            if (securityCheckResult.messageKey) {
                TDS.Dialog.showWarning(Messages.getAlt(securityCheckResult.messageKey, defaultError));
            } else {
                TDS.Dialog.showWarning(Messages.getAlt('LoginShell.Alert.EnvironmentInsecure', defaultError));
            }
            return;
        }
    }

    // get login fields
    var keyValues = [];

    Util.Array.each(TDS.Config.loginRequirements, function (loginReq) {
        var input = this.getLoginInput(loginReq.id); // form control
        var value = YAHOO.lang.trim(input.value); // trimmed form value
        var keyValue = loginReq.id + ':' + value;
        keyValues.push(keyValue);

    }, this);

    // get forbidden apps
    var forbiddenApps = Util.SecureBrowser.getForbiddenApps();
    var sessionID = this.getSessionID();

    var loginCallback = function(loginInfo) {
        console.log('Login Info', loginInfo);
        LoginShell.setLoginInfo(loginInfo);
        this.request('next', loginInfo);

        // we want to try to force full screen after student logs in and release lock when they log out, and
        // that applies to secure browsers that implement function enableLockDown (except for Windows Secure Browser)
        if (Util.Browser.isSecure() && !Util.Browser.isWindows()) {
            Util.SecureBrowser.enableLockDown(true);
        }
    };

    TDS.Student.API.loginStudent(keyValues, sessionID, forbiddenApps)
        .then(loginCallback.bind(this));
};

// this is a helper function for the login form
function loginForm()
{
    LoginShell.workflow.getActivity('sectionLogin').validate();
    return false;
}

// If we are here from welcome mat app, try the login
// credentials now, don't make the user type them in again.
Sections.Login.prototype.checkForRedirect = function (loginForm) {
    // field names that we get from the browser.
    var oname = 'globalRedirectSettings';
    var appString = "accommodationStringP";
    
    var self = this;
    if (typeof (window[oname]) == "object") {
        Util.Array.each(TDS.Config.loginRequirements, function (loginReq) {
            self.setLoginInput(loginReq.id, window[oname][Sections.Login._loginInputPrefix + loginReq.id]);
        });
        this.setSessionID(window[oname]['loginSessionID']);

        // If we are logging in from the distribution site, we get our global accommodations
        // from the welcome mat, too.  Because they may have changed.
        var astr = decodeURIComponent(window[oname][appString]);
        astr = YAHOO.lang.JSON.parse(astr);
        TDS.globalAccommodations.importJson(astr);
        TDS.globalAccommodations.applyCSS(document.body);
        TDS.Messages.Template.processLanguage();

        // Try the login.
        loginForm.onsubmit();
    }
};
// take any user info in the querystring and auto fill in forms (used for debugging only at this time)
/*Sections.Login.prototype.setQuerystring = function()
{
    var querystring = Util.QueryString.parse();

    if (querystring.ssid || querystring.firstname)
    {
        this.disableUserInput(false);
        this.setSSID(querystring.ssid);
        this.setFirstName(querystring.firstname);
    }

    if (querystring.session)
    {
        this.disableSessionInput(false);
        this.setSessionID(querystring.session);
    }
};*/

Sections.Login.prototype.setBrowserInfo = function()
{
    if (TDS.BrowserInfo == null) return;

    var lblVerEl = document.getElementById('lblLoginBrowserVer');
    lblVerEl.innerHTML = TDS.BrowserInfo.label;
};
