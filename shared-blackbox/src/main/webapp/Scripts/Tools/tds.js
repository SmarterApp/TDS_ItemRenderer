// define global namespace for all TDS global variables and components
var TDS = window.TDS || {};
var tds = TDS; // alias

(function(TDS) {

    TDS._initialized = false;
    TDS.buildNumber = 0;
    TDS.baseUrl = '';
    TDS.messages = null; // messageSystem instance
    TDS.globalAccommodations = null;
    TDS.testeeCheckin = null;
    TDS.clientStylePath = null;

    // app flags
    TDS.isProxyLogin = false;
    TDS.isDataEntry = false;
    TDS.isReadOnly = false;
    TDS.isSIRVE = false;
    TDS.inPTMode = false;
    TDS.showItemScores = false;

    // global app settings 
    TDS.Settings = {};

    // global debug settings
    TDS.Debug = {
        showExceptions: false,
        ignoreForbiddenApps: false,
        ignoreBrowserChecks: false
    };

    TDS.init = function () {

        if (TDS._initialized) {
            return;
        }

        // loads configs
        if (TDS.Config) {
            TDS.Config.load();
        }

        if (TDS.messages) {
            // set message system language callback
            TDS.messages._getLanguage = TDS.getLanguage;

            // update i18n messages on the page
            TDS.Messages.Template.processLanguage();
        }

        if (TDS.unloader && TDS.isProxyLogin) {
            TDS.unloader.promptToDisablePopupBlocker();
        }

        TDS._initialized = true;
        Util.log('TDS INIT');
    };

    // get current accommodations 
    // NOTE: one stop shop to get accommodations no matter where we are
    TDS.getAccommodations = function () {

        // check if login shell
        if (typeof LoginShell == 'object' && LoginShell.segmentsAccommodations != null) {
            return LoginShell.segmentsAccommodations[0];
        }

        // check if test shell
        if (typeof ContentManager == 'object') {
            var page = ContentManager.getCurrentPage();
            if (page) {
                return page.getAccommodations();
            }
        }

        // check accommodations manager
        var accommodations = Accommodations.Manager.getCurrent();
        if (accommodations) {
            return accommodations;
        }

        // finally try global accommodations
        return TDS.globalAccommodations;
    };

    TDS.getAccs = TDS.getAccommodations;

    // get current accommodation properties
    TDS.getAccommodationProperties = function () {
        var accommodations = TDS.getAccommodations();
        return new Accommodations.Properties(accommodations);
    };

    TDS.getAccProps = TDS.getAccommodationProperties;

    // get all the languages for this client
    TDS.getLanguages = function () {
        var accGlobalProps = new Accommodations.Properties(TDS.globalAccommodations);
        return accGlobalProps.getLanguages();
    };

    // get the currently selected language
    TDS.getLanguage = function () {
        var accProps = TDS.getAccommodationProperties();
        return accProps.getLanguage();
    };

    // resolve a path to the base of the site
    TDS.resolveBaseUrl = function (path) {
        var url = TDS.baseUrl + (path || '');
        return Util.Browser.resolveUrl(url);
    };

    // call this function to redirect to another url
    TDS.redirect = function (url) {
        if (TDS.Dialog) {
            TDS.Dialog.showProgress();
        }

        // if raw is to true then don't include base url
        var raw = Util.String.isHttpProtocol(url);
        if (raw !== true) {
            url = this.baseUrl + url;
        }

        setTimeout(function () {
            top.window.location.href = url;
        }, 1);
    };

    TDS.redirectError = function (key, header, context) {
        var url = TDS.baseUrl + 'Pages/Notification.aspx';

        if (YAHOO.lang.isString(key)) {
            var message = Messages.get(key);
            url += '?messageKey=' + encodeURIComponent(message);
        }

        if (YAHOO.lang.isString(header)) {
            //add header key if one has been passed.
            url = url + "&header=" + encodeURIComponent(header);
        }

        if (YAHOO.lang.isString(context)) {
            //add header key context. 
            url = url + "&context=" + encodeURIComponent(context);
        }

        top.location.href = url;
    };

    // redirects to the test shell
    TDS.redirectTestShell = function (pageNum, itemNum) {
        var redirectUrl;
        var accProps = TDS.getAccommodationProperties();

        // figure out url
        if (accProps.isTestShellModern()) {
            redirectUrl = 'Pages/TestShell.aspx?name=modern';
        } else {
            redirectUrl = 'Pages/TestShell.aspx';
        }

        // add optional page 
        if (pageNum > 0) {
            redirectUrl += (redirectUrl.indexOf('?') != -1) ? '&' : '?';
            redirectUrl += 'page=' + pageNum;
        }

        // add optional item
        if (itemNum > 0) {
            redirectUrl += (redirectUrl.indexOf('?') != -1) ? '&' : '?';
            redirectUrl += 'item=' + itemNum;
        }

        TDS.unloader.disable();
        TDS.redirect(redirectUrl);
    };

    TDS.getLoginUrl = function () {

        var url;

        // check for return url
        if (typeof TDS.Student == 'object') {
            url = TDS.Student.Storage.getReturnUrl();
        }

        // if there is no return url use base url
        if (url == null) {
            url = TDS.baseUrl;
            url += 'Pages/LoginShell.aspx?logout=true';
        }

        return url;
    };

    TDS.redirectLogin = function () {
        var url = TDS.getLoginUrl();
        TDS.redirect(url);
    };

    TDS.logoutProctor = function (onlyLogoutOfTest, redirect) {

        TDS.unloader.disable();

        if (arguments.length < 2) {
            redirect = true;
        }

        var proctor = TDS.Student.Storage.getProctor();

        if (!proctor) {
            var deferred = Util.Promise.defer();
            // TODO: deferred.reject();
            return deferred.promise;
        }

        // check if we're still on login site with proctor login data.  Otherwise, we are on satellite and should be using data from storage.
        var sessionKey = proctor.sessionKey;
        var proctorKey = proctor.proctorKey;
        var proctorLogoutUrl = proctor.returnUrl;
        var loginBrowserKey = proctor.loginBrowserKey;
        // sat browser key is only set on satellite, this will be an empty guid if logging out on login site
        var satBrowserKey = proctor.satBrowserKey;

        // close the test session
        var promise = TDS.Student.API.logoutProctor(sessionKey, proctorKey, loginBrowserKey, satBrowserKey);

        if (!onlyLogoutOfTest && proctorLogoutUrl) {
            // optionally log the proctor out
            promise = promise.then(function () {
                return Util.Frame.loadInBackground(proctorLogoutUrl);
            });
        }

        if (redirect) {
            // do not need to update the promise, because the redirect will wipe out this script
            promise.then(TDS.redirectLogin);
        }

        return promise;
    };

    TDS.logout = function (onlyLogProctorOfTest) {

        TDS.unloader.disable();

        if (TDS.isProxyLogin) {
            TDS.logoutProctor(onlyLogProctorOfTest);
        } else {
            TDS.redirectLogin();
        }
    };

    // lookup a client side app setting
    TDS.getAppSetting = function (name, defaultValue /*[boolean|number|string]*/) {
        if (TDS.Config && TDS.Config.appSettings) {
            var value = TDS.Config.appSettings[name];
            if (value !== undefined) {
                return value;
            }
        }
        return defaultValue;
    };

    // run init when all scripts are done loading
    YAHOO.util.Event.onDOMReady(TDS.init);

    // force YUI to throw exceptions in custom events (default is off)
    YAHOO.util.Event.throwErrors = true;

    // stop drag/scroll DOM events
    if (typeof Util == 'object') {
        Util.Dom.stopDragEvents();
    }

})(window.TDS);

