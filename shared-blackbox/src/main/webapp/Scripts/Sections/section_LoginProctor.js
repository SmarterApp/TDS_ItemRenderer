Sections.LoginProctor = function()
{
    Sections.LoginProctor.superclass.constructor.call(this, 'sectionLoginProctor');

    this.Controls =
    {
        txtProctorUserName: YUD.get('txtProctorUserName'),
        txtProctorPassword: YUD.get('txtProctorPassword'),
        cbUser: YUD.get('cbUser'),
        btnLoginProctor: YUD.get('btnLoginProctor')
    };

    // Wire up control events
    this.addClick(this.Controls.cbUser, function () {
        this.disableUserInput(this.Controls.cbUser.checked);
    });
};

YAHOO.lang.extend(Sections.LoginProctor, Sections.Base);

Sections.LoginProctor.prototype.getLoginInput = function (loginProctorControl) {
    return YUD.get(loginProctorControl).value;
};

Sections.LoginProctor.prototype.setLoginInput = function (loginProctorControl, value) {
    YUD.get(loginProctorControl).value = value;
};

Sections.LoginProctor.prototype.load = function ()
{
    var loginForm = YUD.get('loginProctorForm');

    loginForm.onsubmit = function () {
        this.validate();
        return false; // cancels form submission
    }.bind(this);

    // render login fields and set visible controls
    this.setControls();
};

Sections.LoginProctor.prototype.setControls = function () {
    // check if PT mode
    if (TDS.inPTMode) {
        // enable checkboxes in PT mode
        this.disableUserInput(true);

        this.Controls.cbUser.checked = true;
    }
    else {
        // hide checkboxes in OP mode
        this.disableUserInput(false);

        this.Controls.cbUser.checked = false;
    }

    // check if score entry app
    if (TDS.isDataEntry || TDS.isReadOnly) {
        // hide session input section since we assign session on the server side
        YUD.setStyle('loginForm2', 'display', 'none');
    }
};

Sections.LoginProctor.prototype.disableUserInput = function (disabled) {
    this.Controls.cbUser.checked = disabled;
};

// validate login fields and submit to server for authentication
Sections.LoginProctor.prototype.validate = function()
{
    var keyValues = [], input, value, keyValue;

    // get username
    input = this.getLoginInput(this.Controls.txtProctorUserName);
    value = YAHOO.lang.trim(input);
    keyValue = 'ID:' + value;
    keyValues.push(keyValue);
    // get pw
    input = this.getLoginInput(this.Controls.txtProctorPassword);
    value = YAHOO.lang.trim(input);
    keyValue = 'pw:' + value;
    keyValues.push(keyValue);
    
    var loginCallback = function (loginInfo) {
        console.log('Proctor Login Info', loginInfo);
        LoginShell.setProctor(loginInfo);
        this.request('next', loginInfo);
    };

    TDS.Student.API.loginProctor(keyValues).then(loginCallback.bind(this));
};

// helper function for the login form
function loginForm() {
    LoginShell.workflow.getActivity('sectionLoginProctor').validate();
    return false;
}