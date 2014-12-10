Sections.LoginVerify = function()
{
    Sections.LoginVerify.superclass.constructor.call(this, 'sectionLoginVerify');

    this.Controls =
    {
        btnVerifyDeny: YUD.get('btnVerifyDeny'),
        btnVerifyApprove: YUD.get('btnVerifyApprove')
    };

    this.addClick(this.Controls.btnVerifyDeny, function()
    {
        this.request('back');
    });

    this.addClick(this.Controls.btnVerifyApprove, this.approve);
};

YAHOO.lang.extend(Sections.LoginVerify, Sections.Base);

// verify the login info received from the server
Sections.LoginVerify.prototype.load = function (loginInfo)
{
    var session = loginInfo.session,
        testee = loginInfo.testee;

    var $confirmAttribs = $('#sectionLoginVerify .ot-infoConfirm');
    $confirmAttribs.empty();

    // render grade dropdown
    function renderGradeSelector() {
        
        var liEl = document.createElement('li');
        liEl.id = 'verifyGradeSelector';
        liEl.className = 'ot-forPractice';

        // "Student Grade Level:"

        var labelKey = 'User.Label.Identified.StudentGradeLevel';
        var label = Messages.get(labelKey);
        var labelEl = document.createElement('label');
        labelEl.id = 'gradelevellabel';
        labelEl.className = 'labeled';
        labelEl.setAttribute('i18n-content', labelKey);
        labelEl.setAttribute('for', 'ddlGrades');
        $(labelEl).text(label);
        liEl.appendChild(labelEl);

        // create space
        liEl.appendChild(document.createTextNode(' '));

        var selectEl = document.createElement('select');
        labelEl.id = 'ddlGrades';
        labelEl.setAttribute('tabindex', '0');
        liEl.appendChild(selectEl);

        $confirmAttribs.append(liEl);
    }

    // render attribute
    function renderAttribute(attrib) {

        // if guest student then use grade dropdown
        if (testee.isGuest && attrib.id == 'Grade') {
            renderGradeSelector();
            return;
        }

        var liEl = document.createElement('li');

        // create label
        var labelKey = 'User.Label.Identified.' + attrib.id;
        var labelEl = document.createElement('span');
        labelEl.className = 'labeled';
        labelEl.setAttribute('i18n-content', labelKey);
        $(labelEl).text(Messages.getAlt(labelKey, attrib.label + ':'));
        liEl.appendChild(labelEl);

        // create space between label and text
        liEl.appendChild(document.createTextNode(' '));

        // create text
        var textEl = document.createElement('span');
        textEl.className = 'confirmData';
        $(textEl).text(attrib.value || 'None');
        liEl.appendChild(textEl);

        $confirmAttribs.append(liEl);
    }

    // render attributes
    if (testee.attributes) {
        testee.attributes.forEach(renderAttribute);
    }

    // set grades for PT
    if (loginInfo.grades && loginInfo.grades.length > 0) {
        this.setGrades(loginInfo.grades);
    }
};

Sections.LoginVerify.prototype.getGradeSelectorEl = function () {
    var $gradeSelector = $('#verifyGradeSelector select');
    if ($gradeSelector.length > 0) {
        return $gradeSelector.get()[0];
    }
    return null;
};

Sections.LoginVerify.prototype.setGrades = function (grades) {
    var gradeSelectorEl = this.getGradeSelectorEl();
    var label = Messages.get('User.List.Identified.SelectGradeList');
    gradeSelectorEl[0] = new Option(label, '');
    for (var i = 0; i < grades.length; i++) {
        var grade = grades[i];
        gradeSelectorEl[i + 1] = new Option(grade, grade);
    }
};

Sections.LoginVerify.prototype.getSelectedGrade = function () {
    var gradeSelectorEl = this.getGradeSelectorEl();
    if (gradeSelectorEl) {
        return gradeSelectorEl.value;
    } else {
        return null;
    }
};

Sections.LoginVerify.prototype.approve = function()
{
    if (LoginShell.testee.isGuest)
    {
        // get grade from dropdown
        var grade = this.getSelectedGrade();

        if (grade == null || grade.length == 0) {
            var label = Messages.get('User.List.Identified.MustSelectGrade');
            label = label.replace('<-- ', ''); // remove any arrows from label
            TDS.Dialog.showWarning(label);
            return;
        } else {
            LoginShell.testee.grade = grade;
        }
    }

    // go to the satellite server
    TDS.Dialog.showProgress();
    this.redirectToSat();
};

Sections.LoginVerify.prototype.redirectToSat = function() {

    // save accommodations
    LoginShell.info.globalAccs = TDS.globalAccommodations.getSelectedJson();

    // get url
    var url = LoginShell.info.satellite.url;
    var loginSerialized = JSON.stringify(LoginShell.info);

    // create login form
    var form = document.createElement('form');
    form.enctype = form.encoding = 'multipart/form-data';
    form.setAttribute('method', 'POST');
    form.setAttribute('action', url);

    // create login package
    var loginPackage = document.createElement('input');
    loginPackage.setAttribute('type', 'hidden');
    loginPackage.setAttribute('name', 'package');
    loginPackage.setAttribute('value', loginSerialized);
    form.appendChild(loginPackage);
    
    // submit form
    document.body.appendChild(form);
    form.submit();
};

