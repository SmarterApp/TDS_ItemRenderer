// define global namespace for all TDS global variables and components
var TDS = window.TDS || {};
var tds = TDS; // alias

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
TDS.getAccommodationProperties = function() {
    var accommodations = TDS.getAccommodations();
    return new Accommodations.Properties(accommodations);
};

TDS.getAccProps = TDS.getAccommodationProperties;

// get all the languages for this client
TDS.getLanguages = function() {
    var accGlobalProps = new Accommodations.Properties(TDS.globalAccommodations);
    return accGlobalProps.getLanguages();
};

// get the currently selected language
TDS.getLanguage = function() {
    var accProps = TDS.getAccommodationProperties();
    return accProps.getLanguage();
};

// resolve a path to the base of the site
TDS.resolveBaseUrl = function(path) {
    var url = TDS.baseUrl + (path || '');
    return Util.Browser.resolveUrl(url);
};

// call this function to redirect to another url
TDS.redirect = function(url) {
    if (TDS.Dialog) {
        TDS.Dialog.showProgress();
    }

    // if raw is to true then don't include base url
    var raw = Util.String.isHttpProtocol(url);
    if (raw !== true) {
        url = this.baseUrl + url;
    }

    setTimeout(function() {
        top.window.location.href = url;
    }, 1);
};

TDS.redirectError = function(key, header, context) {
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

    TDS.redirect(redirectUrl);
};

TDS.getLoginUrl = function() {

    var url;

    // check for return url
    if (typeof TDS.Student == 'object') {
        url = TDS.Student.Storage.getReturnUrl();
    }

    // if proxy and a return url is specified, we will go here instead
    if (TDS.isProxyLogin) {
        url = TDS.Student.Storage.getProctorReturnUrl() || url ;
    }

    // if there is no return url use base url
    if (url == null) {
        url = TDS.baseUrl;
        url += 'Pages/LoginShell.aspx?logout=true';
    }

    return url;
};

TDS.logout = function () {
    var url = TDS.getLoginUrl();

    // if proxy, send a request to close out the proctor session
    if (TDS.isProxyLogin) {
        var proctor = (window.LoginShell) ? LoginShell.proctor : null;
        var storage = TDS.Student.Storage;
        var testSession = storage.getTestSession();

        // check if we're still on login site with proctor login data.  Otherwise, we are on satellite and should be using data from storage.
        var sessionKey = (proctor) ? proctor.sessionKey : testSession.key;
        var proctorKey = (proctor) ? proctor.proctorKey : testSession.proctorKey;
        var loginBrowserKey = (proctor) ? proctor.loginBrowserKey : storage.getProctorLoginBrowserKey();
        // sat browser key is only set on satellite, this will be an empty guid if logging out on login site
        var satBrowserKey = (proctor) ? proctor.satBrowserKey : storage.getProctorSatBrowserKey(); 
        var logoutProctorCallback = function() {
            TDS.redirect(url);
        }
        TDS.Student.API.logoutProctor(sessionKey, proctorKey, loginBrowserKey, satBrowserKey).then(logoutProctorCallback);
    } else {
        TDS.redirect(url);
    }
};

TDS.logoutProctor = function(exl) {
    TDS.redirect('Pages/Proxy/logout.aspx?exl=' + exl, false);
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

// event stuff
(function () {

    // run init when all scripts are done loading
    YAHOO.util.Event.onDOMReady(TDS.init);

    // force YUI to throw exceptions in custom events (default is off)
    YAHOO.util.Event.throwErrors = true;

    // stop drag/scroll DOM events
    if (typeof Util == 'object') {
        Util.Dom.stopDragEvents();
    }

})();
