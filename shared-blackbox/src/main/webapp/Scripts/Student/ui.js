TDS.Student = TDS.Student || {};

(function(Student) {

    var Storage = Student.Storage;
    var UI = {};

    function setSession() {
        var testSession = Storage.getTestSession();
        if (testSession && testSession.id) {
            $('.sessionID').html(testSession.id);
        }
    }

    function getTesteeLabel() {
        var testeeLabel = '';
        var testee = Storage.getTestee();
        if (testee) {
            if (testee.lastName && testee.firstName) {
                testeeLabel += testee.lastName + ', ' + testee.firstName;
            }
            if (testee.id) {
                var ssidLabel = Messages.get('Global.Label.SSID');
                testeeLabel += ' (' + ssidLabel + ': ' + testee.id + ')';
            }
        }
        return testeeLabel;
    }

    function setName() {
        var testeeLabel = getTesteeLabel();
        // NOTE: Depending on the shell we have different ways of setting this
        $('#ot-studentInfo, .studentInfo, #lblStudentName').html(testeeLabel);
    }

    function sync() {
        setSession();
        setName();
    }

    UI.sync = sync;
    UI.getTesteeLabel = getTesteeLabel;
    Student.UI = UI;

    // queue the sync() function to be called after all DOM ready events have been processed
    $().ready(function () {
        // Bug #150899 - IE 10 was calling sync() too soon... delay until other DOM ready fcn's fire
        setTimeout(UI.sync, 0);
    });

})(TDS.Student);
