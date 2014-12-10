// REQUIRE: tds_xhr.js

TDS.Student = TDS.Student || {};

(function(Student) {

    var Xhr = function (shell) {
        var timeout = (120 * 1000); // 2 min timeout
        Xhr.superclass.constructor.call(this, timeout, 1);

        // save ref to shell
        this._shell = shell;

        this.Events.subscribe('onShowProgress', function () {
            TDS.ARIA.writeLog('Please wait.');
            TDS.Dialog.showProgress();
        });

        this.Events.subscribe('onHideProgress', function () {
            TDS.Dialog.hideProgress();
        });

        this.Events.subscribe('onError', this.onError);
    };

    YAHOO.extend(Xhr, TDS.XhrManager);

    Xhr.prototype.getUrl = function (action) {
        return TDS.baseUrl + 'Pages/API/MasterShell.axd/' + action;
    };

    Xhr.prototype.onError = function (request, errorMessage, retriable, logout) {
        var xhr = this;
        var shell = this._shell;

        if (retriable) {
            errorMessage += ' ' + Messages.getAlt('Messages.Label.XHRError', 'Select Yes to try again or No to logout.');

            TDS.Dialog.showPrompt(errorMessage,
            function () {
                // yes (resubmit xhr)
                xhr.sendRequest(request);
            },
            function () {
                // no (back to login page)
                if (logout) {
                    TDS.logout();
                }
            });
        }
        else {
            TDS.Dialog.showWarning(errorMessage, function () {

                // Note: some login fail cases don't redirect the user and don't
                // reload the login page.  In the case we are a satellite, we want to force
                // the user to log out for any failure in login section.
                if (TDS.testeeCheckin != null) {
                    logout = true;
                }

                // ok (back to login page)
                if (logout) {
                    TDS.logout();
                }
            });
        }
    };

    Student.Xhr = Xhr;

})(TDS.Student);

