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

    // do this automatically for all pages
    $().ready(sync);

})(TDS.Student);

