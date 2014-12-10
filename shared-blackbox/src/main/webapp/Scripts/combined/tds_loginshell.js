/*
Copyright (c) 2014, American Institutes for Research. All rights reserved.
GENERATED: 10/6/2014 3:52:02 PM
MACHINE: DC1KHANMOLT
*/

/* SOURCE FILE: section.js (9da9eb63) 9/9/2014 2:09:39 PM */

var Sections = {};
Sections.Base = function(id)
{
Sections.Base.superclass.constructor.call(this, id);
var sectionHeader = this.getHeader();
if (sectionHeader)
{
sectionHeader.setAttribute('tabindex', -1);
}
this.hide();
};
YAHOO.lang.extend(Sections.Base, Util.Workflow.Activity);
Sections.Base.prototype.addClick = function(id, callback)
{
var target =  YUD.get(id);
if (target == null) return false;
YUE.on(target, 'click', function(evt)
{
if (target.nodeName == 'A') YUE.stopEvent(evt);
callback.call(this, evt);
}, this, true);
return true;
};
Sections.Base.prototype.getContainer = function()
{
return  YUD.get(this.getId());
};
Sections.Base.prototype.getHeader = function()
{
return  YUD.get(this.getId() + 'Header');
};
Sections.Base.prototype.getHeaderText = function()
{
var sectionHeader = this.getHeader();
return Util.Dom.getTextContent(sectionHeader);
};
Sections.Base.prototype.show = function()
{
var sectionContainer = this.getContainer();
if (!sectionContainer) return false;
YUD.setStyle(sectionContainer, 'display', 'block');
YUD.setStyle(sectionContainer, 'visibility', 'visible');
sectionContainer.setAttribute('aria-hidden', 'false');
var sectionHeader = this.getHeader();
if (sectionHeader) sectionHeader.focus();
TDS.ARIA.writeLog('Page is ready');
return true;
};
Sections.Base.prototype.hide = function()
{
var sectionContainer = this.getContainer();
if (!sectionContainer) return false;
YUD.setStyle(sectionContainer, 'display', 'none');
YUD.setStyle(sectionContainer, 'visibility', 'hidden');
sectionContainer.setAttribute('aria-hidden', 'true');
return true;
};
Sections.createWorkflow = function()
{
var wf = new Util.Workflow();
wf.Events.subscribe('onEnter', function(section)
{
section.show();
});
wf.Events.subscribe('onLeave', function(section)
{
section.hide();
});
return wf;
}

/* SOURCE FILE: section_Logout.js (6e4b2833) 9/9/2014 2:09:39 PM */

Sections.Logout = function()
{
Sections.Logout.superclass.constructor.call(this, 'sectionLogout');
};
YAHOO.lang.extend(Sections.Logout, Sections.Base);
Sections.Logout.prototype.requestApproval = function(skipCheck)
{
if (skipCheck === true) return Util.Workflow.Approval.Approved;
var section = this;
TDS.Dialog.showPrompt(Messages.get('Global.Label.LogoutVerify'), function()
{
section.requestApproved();
});
return Util.Workflow.Approval.Pending;
};
Sections.Logout.prototype.load = function ()
{
if (LoginShell.testSelection != null)
{
TDS.Student.API.pauseTest().then(function() {
this.ready();
}.bind(this));
return true;
}
return false;
};
Sections.Logout.prototype.enter = function()
{
TDS.logout();
};

/* SOURCE FILE: mastershell.js (e4e4fa99) 9/9/2014 2:34:36 PM */

var MasterShell = {};
(function(TDS, MS) {
var dialog = null;
var currentGlobalAccs = null;
var currentGlobalLang = 'ENU';
function getAccommodations() {
var testAccommodations = Accommodations.Manager.getDefault();
if (testAccommodations) {
return testAccommodations;
} else {
return TDS.globalAccommodations;
}
}
function remove(accommodations) {
accommodations.removeCSS(document.body);
}
function processLanguage() {
TDS.Messages.Template.processLanguage();
}
function updateLanguage(language) {
if (TDS.messages.hasLanguage(language)) {
processLanguage();
} else {
var urlBuilder = new Util.StringBuilder(TDS.baseUrl);
urlBuilder.append('Pages/API/Global.axd/getMessages');
urlBuilder.appendFormat('?language={0}', language);
urlBuilder.append('&context=LoginShell');
var url = urlBuilder.toString();
$.ajax(url, {cache: false}).then(function (msgJson) {
TDS.Dialog.hideProgress();
var messageLoader = new TDS.Messages.MessageLoader(TDS.messages);
messageLoader.load(msgJson);
processLanguage();
}, function() {
TDS.Dialog.hideProgress();
TDS.Dialog.showWarning('Could not load the message translations.');
});
TDS.Dialog.showProgress();
}
}
function apply(accommodations) {
accommodations.applyCSS(document.body);
var accProps = new Accommodations.Properties(accommodations);
var newGlobalLang = accProps.getLanguage();
if (currentGlobalLang != newGlobalLang) {
currentGlobalLang = newGlobalLang;
updateLanguage(currentGlobalLang);
}
}
function setup() {
var mainAccs = getAccommodations();
var dialogAccs = TDS.globalAccommodations;
apply(mainAccs);
dialog = new Accommodations.Dialog(dialogAccs, 'globalAccDialog');
dialog.onBeforeSave.subscribe(remove);
dialog.onSave.subscribe(apply);
dialog.onCancel.subscribe(function () {
var accs = currentGlobalAccs.getSelectedJson();
accs.forEach(function (acc) {
dialogAccs.selectCodes(acc.type, acc.codes);
});
});
YUE.on('btnAccGlobal', 'click', function (evt) {
TDS.ToolManager.hideAll();
currentGlobalAccs = dialogAccs.clone();
dialog.show();
});
}
MS.setupAccs = setup;
MS.removeAccs = remove;
MS.applyAccs = apply;
MS.updateLanguage = updateLanguage;
})(TDS, MasterShell);
(function (TDS, MS) {
function isLoginShell() {
return Util.String.contains(location.href.toLowerCase(), 'loginshell.aspx');
}
function clearShellData() {
Util.Storage.clear();
Accommodations.Manager.clear();
}
function onShellReady() {
window.focus();
var qs = Util.QueryString.parse();
if (isLoginShell() && !qs.section) {
clearShellData();
}
if (typeof window.preinit == 'function') {
try {
window.preinit();
} catch (ex) {
TDS.Diagnostics.report(ex);
}
}
KeyManager.init();
KeyManager.onKeyEvent.subscribe(function (obj) {
if (obj.type == 'keydown' && obj.keyCode == 27) {
TDS.ToolManager.hideAll();
}
});
YUE.on('btnHelp', 'click', function (evt) {
YUE.stopEvent(evt);
var key = TDS.Help.getKey();
var lang = TDS.getLanguage();
var id = 'tool-' + key + '-' + lang;
var panel = TDS.ToolManager.get(id);
if (panel == null) {
var headerText = Messages.getAlt('StudentMaster.Label.HelpGuider', 'Help');
panel = TDS.ToolManager.createPanel(id, 'helpguide', headerText, null, key);
}
TDS.ToolManager.toggle(panel);
});
TDS.Button.init();
TDS.ARIA.createLog();
MS.setupAccs();
if (TDS.isProxyLogin) {
var currentPage = (location.href).toLowerCase();
if (currentPage.indexOf('login') == -1) {
var idleTimer = new TimeoutIdle(TDS.timeout, 30, function () { TDS.logoutProctor(false); });
idleTimer.start();
}
}
if (typeof window.init == 'function') {
setTimeout(function () {
try {
window.init();
} catch (ex) {
TDS.Diagnostics.report(ex);
}
}, 0);
}
}
YUE.onDOMReady(onShellReady);
function onShellUnload() {
TTS.Manager.stop();
}
YUE.on(window, 'beforeunload', onShellUnload);
function closeWindow() {
if (TDS.isProxyLogin) {
TDS.logout();
} else {
if (TDS.Cache.isAvailable()) {
TDS.Cache.stop();
YAHOO.lang.later(60000, this, function () {
Util.SecureBrowser.close();
});
} else {
Util.SecureBrowser.close();
}
}
}
window.closeWindow = closeWindow;
TDS.Cache.Events.subscribe('onStop', function () {
TDS.Dialog.showProgress();
});
TDS.Cache.Events.subscribe('onShutdown', function () {
Util.SecureBrowser.close();
});
TDS.ToolManager.Events.subscribe('onShow', function (panel) {
var frame = panel.getFrame();
Util.Dom.copyCSSFrame(frame);
});
})(TDS, MasterShell);

/* SOURCE FILE: loginshell.js (ab61fcd9) 9/9/2014 2:09:39 PM */

function init() {
LoginShell.init();
}
var LoginShell = {
Events: new Util.EventManager(),
defaultBodyCSS: null,
api: null,
workflow: null,
info: null,
satellite: null,
session: null,
testee: null,
testeeForms: null,
testSelection: null,
testForms: null,
testApproved: false,
formSelection: null,
segmentsAccommodations: null,
proctor: null
};
LoginShell.Settings = {};
LoginShell.init = function() {
try {
if (TDS.Cache.validate && Util.Browser.isSecure()) {
TDS.Cache.checkObsolete();
}
} catch (ex) {}
if (!LoginShell.validateSecureBrowser()) return;
if (Util.Browser.isSecure()) {
Util.SecureBrowser.setAppStartTime((new Date()).toUTCString(), false);
}
this.Events.fire('onInit');
this.defaultBodyCSS = document.body.className;
this.setupLoginInfo();
this.workflow = LoginShell.createWorkflow();
this.start();
};
LoginShell.start = function () {
this.Events.fire('onStart');
var startSection;
if (TDS.isProxyLogin) {
startSection = (document.getElementById('sectionLoginProctor')) ? 'sectionLoginProctor' : 'sectionTestSelection';
} else {
startSection = (document.getElementById('sectionLogin')) ? 'sectionLogin' : 'sectionTestSelection';
}
var querystring = Util.QueryString.parse();
if (querystring.section) {
startSection = querystring.section;
}
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
var accTypes = TDS.globalAccommodations.getTypes();
return (accTypes.some(function (accType) {
return accType.isVisible();
}));
};
LoginShell.createWorkflow = function () {
var wf = Sections.createWorkflow();
wf.Events.subscribe('onRequest', function(activity) { Util.log('Section Request: ' + activity); });
wf.Events.subscribe('onReady', function(activity) { Util.log('Section Ready: ' + activity); });
wf.Events.subscribe('onLeave', function (activity) { Util.log('Section Hide: ' + activity); });
wf.Events.subscribe('onEnter', function (activity) { Util.log('Section Show: ' + activity); });
wf.Events.subscribe('onEnter', function(activity) {
window.scrollTo(0, 0);
if (activity.getId() != 'sectionLogin') {
$('#logOut').hide();
}
});
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
LoginShell.setupLoginWorkflow = function (wf) {
wf.addActivity(new Sections.LoginProctor());
wf.addActivity(new Sections.Login());
wf.addActivity(new Sections.LoginVerify());
wf.addActivity(new Sections.Logout());
wf.addTransition('sectionLoginProctor', 'next', 'sectionLogin');
wf.addTransition('sectionLogin', 'diag', 'sectionDiagnostics');
wf.addTransition('sectionLogin', 'next', 'sectionLoginVerify');
wf.addTransition('sectionLoginVerify', 'back', 'sectionLogout');
wf.addTransition('sectionLoginVerify', 'next', 'sectionTestSelection');
};
LoginShell.setupSatelliteWorkflow = function (wf) {
wf.addActivity(new Sections.TestSelection());
wf.addActivity(new Sections.TestApproval());
wf.addActivity(new Sections.Accommodations());
wf.addActivity(new Sections.TestVerify());
wf.addActivity(new Sections.Instructions());
wf.addActivity(new Sections.SoundCheck());
wf.addActivity(new Sections.TTSCheck());
wf.addActivity(new Sections.Logout());
wf.addTransition('sectionTestSelection', 'back', 'sectionLogout');
wf.addTransition('sectionTestSelection', 'acc', 'sectionAccommodations');
wf.addTransition('sectionTestSelection', 'next', 'sectionTestApproval');
wf.addTransition('sectionAccommodations', 'next', 'sectionTestApproval');
wf.addTransition('sectionAccommodations', 'back', 'sectionTestSelection');
wf.addTransition('sectionTestApproval', 'logout', 'sectionLogout');
wf.addTransition('sectionTestApproval', 'next', 'sectionTestVerify');
wf.addTransition('sectionTestVerify', 'back', function() {
if (LoginShell.session.isGuest || TDS.isProxyLogin) {
return 'sectionTestSelection';
}
return 'sectionTestApproval';
});
wf.addTransition('sectionTestVerify', 'next', function () {
var accProps = TDS.getAccommodationProperties();
if (accProps && accProps.hasSoundCheck()) {
return 'sectionSoundCheck';
}
if (!TDS.isDataEntry && accProps && accProps.hasTTS()) {
return 'sectionTTSCheck';
}
return 'sectionInstructions';
});
wf.addTransition('sectionInstructions', 'back', 'sectionLogout');
wf.addTransition('sectionSoundCheck', 'back', function() {
if (LoginShell.testSelection == null) {
return 'sectionDiagnostics';
} else {
return 'sectionLogout';
}
});
wf.addTransition('sectionSoundCheck', 'next', function() {
if (LoginShell.testSelection == null) {
return 'sectionDiagnostics';
} else {
return 'sectionInstructions';
}
});
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
LoginShell.resetCSS = function (useDefaults) {
if (LoginShell.segmentsAccommodations &&
LoginShell.segmentsAccommodations.length > 0) {
LoginShell.segmentsAccommodations[0].removeCSS(document.body);
}
if (useDefaults) {
TDS.globalAccommodations.removeCSS(document.body);
TDS.globalAccommodations.selectDefaults();
}
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
var langGlobal = TDS.getLanguage();
LoginShell.segmentsAccommodations = null;
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
this.info = loginInfo;
if (this.proctor) {
this.info.proctor = this.proctor;
}
if (loginInfo.proctor) {
Storage.setProctorLoginBrowserKey(loginInfo.proctor.loginBrowserKey);
Storage.setProctorSatBrowserKey(loginInfo.proctor.satBrowserKey);
Storage.setProctorReturnUrl(loginInfo.proctor.returnUrl);
}
if (loginInfo.returnUrl) {
Storage.setReturnUrl(loginInfo.returnUrl);
}
if (loginInfo.satellite) {
this.satellite = loginInfo.satellite;
}
if (loginInfo.testee) {
this.testee = loginInfo.testee;
this.testee.name = this.testee.lastName + ', ' + this.testee.firstName;
Storage.setTestee(this.testee);
}
if (loginInfo.session) {
this.session = loginInfo.session;
Storage.setTestSession(this.session);
}
if (loginInfo.globalAccs && loginInfo.globalAccs.length > 0) {
MasterShell.removeAccs(TDS.globalAccommodations);
loginInfo.globalAccs.forEach(function(acc) {
TDS.globalAccommodations.selectCodes(acc.type, acc.codes);
});
MasterShell.applyAccs(TDS.globalAccommodations);
}
TDS.Student.UI.sync();
};
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
TDS.Student.Storage.setOppInfo(oppInfo);
this.testForms = oppInfo.testForms;
this.testeeForms = oppInfo.testeeForms;
};
LoginShell.setTestAccommodations = function (segmentsAccommodations) {
TDS.Student.Storage.setAccList(segmentsAccommodations);
var langGlobal = TDS.getLanguage();
LoginShell.segmentsAccommodations = segmentsAccommodations;
var langTest = TDS.getLanguage();
if (langGlobal != langTest) {
MasterShell.updateLanguage(langTest);
}
};
LoginShell.clearBrowser = function() {
Util.SecureBrowser.emptyClipBoard();
var querystring = Util.QueryString.parse();
if (querystring.logout || querystring.section == null) {
Util.Browser.eraseCookie('TDS-Student-Auth');
Util.Browser.eraseCookie('TDS-Student-Data');
}
Util.Browser.eraseCookie('TDS-Student-Accs');
if (Util.Browser.isSecure() && !TDS.isProxyLogin) {
var clientKey = 'TDS-Student-Client';
var clientValue = YAHOO.util.Cookie.get(clientKey);
Util.SecureBrowser.clearCookies();
if (clientValue) {
YAHOO.util.Cookie.set(clientKey, clientValue, { path: TDS.cookiePath });
}
}
try {
LoginShell.saveBrowserInfo();
} catch (ex) {
}
};
LoginShell.validateSecureBrowser = function () {
var validationErrors = TDS.SecureBrowser.Validators.validate();
if (validationErrors.length > 0) {
TDS.redirectError(validationErrors[0], 'LoginDenied.Header', 'Default.aspx');
return false;
}
return true;
};
LoginShell.closeAllOtherBrowserWindows = function () {
var cnt = 0;
try {
var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator);
var en = wm.getEnumerator("navigator:browser");
while (en.hasMoreElements()) {
var win = en.getNext();
if (win != wm.getMostRecentWindow("navigator:browser")) {
win.close();
cnt++;
}
}
} catch (e) {
}
Util.log("Closed " + cnt + " backgrounded windows");
};
LoginShell.setMozillaPreferences = function () {
var success = Mozilla.execPrivileged(function() {
Mozilla.setPreference('accessibility.tabfocus', 7);
Mozilla.setPreference('security.OCSP.enabled', 0);
Mozilla.setPreference('mousewheel.horizscroll.withaltkey.action', 0);
Mozilla.setPreference('mousewheel.horizscroll.withaltkey.numlines', 1);
Mozilla.setPreference('mousewheel.horizscroll.withaltkey.sysnumlines', true);
Mozilla.setPreference('mousewheel.withcontrolkey.action', 0);
Mozilla.setPreference('mousewheel.withcontrolkey.numlines', 1);
Mozilla.setPreference('mousewheel.withcontrolkey.sysnumlines', false);
Mozilla.setPreference('mousewheel.withshiftkey.action', 0);
Mozilla.setPreference('mousewheel.withshiftkey.numlines', 1);
Mozilla.setPreference('mousewheel.withshiftkey.sysnumlines', false);
Mozilla.setPreference('browser.safebrowsing.enabled', false);
Mozilla.setPreference('browser.safebrowsing.malware.enabled', false);
Mozilla.setPreference('extensions.blocklist.enabled', false);
Mozilla.setPreference('extensions.update.enabled', false);
Mozilla.setPreference('browser.search.update', false);
Mozilla.setPreference('browser.microsummary.enabled', false, 0, 6.9);
Mozilla.setPreference('browser.microsummary.updateGenerators', false, 0, 6.9);
Mozilla.setPreference('network.prefetch-next', true);
Mozilla.setPreference('dom.max_script_run_time', 0);
Mozilla.setPreference('layout.spellcheckDefault', 0);
Mozilla.setPreference('browser.sessionhistory.max_entries', 0);
var offlineEnablePref = 'browser.cache.offline.enable';
if (!Mozilla.getPreference(offlineEnablePref)) {
Mozilla.setPreference(offlineEnablePref, true);
}
var offlineAllowPref = 'offline-apps.allow_by_default';
if (!Mozilla.getPreference(offlineAllowPref)) {
Mozilla.setPreference(offlineAllowPref, true);
}
if (navigator.userAgent.indexOf('OS X 10.6') != -1) {
Mozilla.setPreference('layers.acceleration.disabled', true);
}
Util.SecureBrowser.fixUserAgent();
if (Util.Browser.isWindows() || Util.Browser.isLinux()) {
var fullscreenFix = Util.Storage.get('tds.fullscreenFix');
if (!fullscreenFix) {
Mozilla.fullscreen();
Util.Storage.set('tds.fullscreenFix', true);
}
}
if (Util.Browser.isMac() && (Util.Browser.getOSXVersion() >= 10.8) && (Util.Browser.getSecureVersion() <= 6.2)) {
var screenshotsDisabled = Mozilla.disableScreenshots();
if (screenshotsDisabled) {
Util.log('Screenshots are disabled.');
} else {
Util.log('Screenshots are not disabled.');
}
}
Util.SecureBrowser.enablePermissiveMode(false);
LoginShell.closeAllOtherBrowserWindows();
});
if (success) {
Util.log('Mozilla preferences successfully set.');
} else {
Util.log('Mozilla preferences failed to set.');
}
};
LoginShell.saveBrowserInfo = function () {
var BC = LoginShell.BrowserInfoCookie;
BC.clear();
BC.setClientInfo('screen', screen.width + 'x' + screen.height);
var macAddress = Util.SecureBrowser.getMACAddress();
if (macAddress != null) {
BC.setClientInfo('mac', macAddress);
}
var ipAddress = Util.SecureBrowser.getIPAddress();
if (ipAddress != null) {
BC.setClientInfo('ip', ipAddress);
}
};
LoginShell.Events.subscribe('onInit', function () {
if (Util.Browser.isSecure() && !Util.Browser.isMac()) {
Util.SecureBrowser.fixFocus();
}
if (Util.Browser.isSecure()) {
setTimeout(LoginShell.setMozillaPreferences, 0);
}
if (window.browserUnsupported) {
TDS.Dialog.showWarning(Messages.get('BrowserUnsupported'));
}
});
LoginShell.BrowserInfoCookie = {
_name: 'TDS-Student-Browser',
clear: function() {
YAHOO.util.Cookie.remove(this._name, {
path: TDS.cookiePath
});
},
setClientInfo: function(key, value) {
YAHOO.util.Cookie.setSub(this._name, key, value, {
path: TDS.cookiePath
});
},
getClientInfo: function(key) {
YAHOO.util.Cookie.getSub(this._name, key);
}
};

/* SOURCE FILE: section_TestSelection.js (9a2decf7) 9/9/2014 2:09:39 PM */

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
Sections.TestSelection.prototype.load = function(grade) {
LoginShell.testSelection = null;
var testee = TDS.Student.Storage.getTestee();
var testSession = TDS.Student.Storage.getTestSession();
TDS.Student.API.getTests(testee, testSession, grade).then(function (testSelections) {
this.testSelections = testSelections;
this.ready(testSelections);
}.bind(this));
return true;
};
Sections.TestSelection.prototype.enter = function() {
Util.dir(this.testSelections);
var testSelectionsEl = YUD.get('testSelections');
if (testSelectionsEl.innerHTML.length > 0) {
testSelectionsEl.innerHTML = '';
}
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
TDS.Messages.Template.processLanguage(testSelectionsEl);
};
Sections.TestSelection.prototype._createButton = function(testSelection, idx) {
var testName = testSelection.displayName;
if (TDS.isDataEntry) {
testName += ' (' + testSelection.mode + ')';
}
var testActive = false;
var testClass = '';
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
return null;
}
testOpp = Messages.get('Login.TS.DescActive', [testSelection.opportunity, testSelection.maxOpportunities]);
var testButtonEl = HTML.DIV();
YUD.addClass(testButtonEl, 'testSelection');
YUD.addClass(testButtonEl, testClass);
YUD.addClass(testButtonEl, (idx % 2 == 0) ? 'even' : 'odd');
YUD.setAttribute(testButtonEl, 'role', 'button');
YUD.setAttribute(testButtonEl, 'tabindex', 0);
var testHeaderEl = HTML.STRONG();
testHeaderEl.innerHTML = testHeader;
testButtonEl.appendChild(testHeaderEl);
var testDescEl = HTML.P();
testDescEl.innerHTML = testDesc;
if (testActive) {
testDescEl.appendChild(HTML.SPAN(null, testOpp));
}
testButtonEl.appendChild(testDescEl);
if (testActive) {
this.addClick(testButtonEl, function(evt) {
this.select(testSelection);
});
YUE.on(testButtonEl, 'keypress', function(ev) {
var charCode = YUE.getCharCode(ev);
if (charCode == 13) {
this.select(testSelection);
}
}, this, true);
}
return testButtonEl;
};
Sections.TestSelection.prototype.select = function(testSelection, skipWarning) {
var self = this;
if (!skipWarning && !Util.String.isNullOrEmpty(testSelection.warningText)) {
TDS.Dialog.showPrompt(testSelection.warningText, function() {
self.select(testSelection, true);
});
return false;
}
LoginShell.setTestSelection(testSelection);
TDS.Dialog.showProgress();
self.open(testSelection);
return true;
};
Sections.TestSelection.prototype.open = function(test) {
var testee = TDS.Student.Storage.getTestee();
var session = TDS.Student.Storage.getTestSession();
var proctorBrowserKey = TDS.Student.Storage.getProctorSatBrowserKey();
if (LoginShell.session.isGuest && test.status == 2) {
TDS.Student.API.getTestAccommodations(test, testee, session)
.then(function (accommodations) {
this.request('acc', accommodations);
}.bind(this));
} else {
TDS.Student.API.openTest(test, testee, session, null, proctorBrowserKey)
.then(function (oppInfo) {
LoginShell.setOppInfo(oppInfo);
this.request('next');
}.bind(this));
}
};

/* SOURCE FILE: section_TestApproval.js (4786cf58) 9/9/2014 2:09:39 PM */

Sections.TestApproval = function()
{
Sections.TestApproval.superclass.constructor.call(this, 'sectionTestApproval');
this._timer = null;
this.Controls =
{
btnCancelApproval: YUD.get('btnCancelApproval')
};
this.addClick(this.Controls.btnCancelApproval, this.cancel);
};
YAHOO.lang.extend(Sections.TestApproval, Sections.Base);
Sections.TestApproval.Status =
{
waiting: 0,
approved: 1,
denied: 2,
logout: 3
};
Sections.TestApproval.prototype.setMessage = function(header, message)
{
YUD.get('lblApprovalHeader').innerHTML = header;
YUD.get('lblApprovalMessage').innerHTML = message;
};
Sections.TestApproval.prototype.cancel = function()
{
TDS.Student.API.cancelCheckApproval();
if (this._timer)
{
this._timer.cancel();
this._timer = null;
}
this.request('logout', true);
};
Sections.TestApproval.prototype.load = function ()
{
};
Sections.TestApproval.prototype.enter = function () {
var Store = TDS.Student.Storage;
var oppInstance = Store.createOppInstance();
var testSession = Store.getTestSession();
var testProps = Store.getTestProperties();
var pollDuration = 5000;
var pollForApproval = function(duration) {
this.timer = YAHOO.lang.later(duration, this, checkForApproval);
}.bind(this);
var checkForApproval = function() {
TDS.Student.API.checkApproval(oppInstance, testSession.id, testProps.key).then(function (approval) {
switch (approval.status) {
case Sections.TestApproval.Status.approved: {
this.approved(approval); return;
}
case Sections.TestApproval.Status.denied: {
this.denied(approval); return;
}
case Sections.TestApproval.Status.logout: {
this.logout(); return;
}
}
pollForApproval(pollDuration);
}.bind(this));
};
pollForApproval(1);
};
Sections.TestApproval.prototype.approved = function(approval)
{
LoginShell.setTestAccommodations(approval.segmentsAccommodations);
this.request('next', approval);
};
Sections.TestApproval.prototype.denied = function(approval)
{
var self = this;
var deniedMessage = Messages.get('Approval.Label.TADenied');
if (approval.comment != null && approval.comment.length > 0) {
deniedMessage += ": " + approval.comment;
}
TDS.Dialog.showAlert(deniedMessage, function() {
self.logout();
});
};
Sections.TestApproval.prototype.logout = function()
{
this.request('logout', true);
};

/* SOURCE FILE: section_Accommodations.js (51c1a45c) 9/9/2014 2:09:39 PM */

Sections.Accommodations = function()
{
Sections.Accommodations.superclass.constructor.call(this, 'sectionAccommodations');
this.addClick('btnAccBack', function()
{
this.request('back');
});
this.addClick('btnAccSelect', this.submit);
this._segmentsAccommodations = null;
this._rendererCollection = null;
};
YAHOO.lang.extend(Sections.Accommodations, Sections.Base);
Sections.Accommodations.prototype.init = function()
{
var querystring = Util.QueryString.parse();
if (querystring.showInvisibleAccs) Accommodations.Renderer.hideInvisible = false;
if (querystring.showUnselectableAccs) Accommodations.Renderer.hideUnselectable = false;
};
Sections.Accommodations.prototype.load = function (segmentsAccommodations)
{
this._segmentsAccommodations = segmentsAccommodations;
this._rendererCollection = [];
var segmentsContainer = YUD.get('segments');
segmentsContainer.innerHTML = '';
Util.Array.each(segmentsAccommodations, function(segmentAccommodations)
{
if (!segmentAccommodations.isAnyVisible()) return;
var segmentContainer = HTML.DIV({ id: 'segment-' + segmentAccommodations.getId(), 'className': 'segment' });
segmentsContainer.appendChild(segmentContainer);
var segmentHeader = HTML.H3(null, segmentAccommodations.getLabel());
segmentContainer.appendChild(segmentHeader);
var renderer = new Accommodations.Renderer(segmentAccommodations, segmentContainer);
renderer.bind();
renderer.render();
this._rendererCollection.push(renderer);
}, this);
};
Sections.Accommodations.prototype.submit = function()
{
var test = LoginShell.testSelection;
var testee = TDS.Student.Storage.getTestee();
var session = TDS.Student.Storage.getTestSession();
TDS.Student.API.openTest(test, testee, session, this._segmentsAccommodations)
.then(function (oppInfo) {
LoginShell.setOppInfo(oppInfo);
this.request('next');
}.bind(this));
};

/* SOURCE FILE: section_TestVerify.js (4abe9b2e) 9/9/2014 2:09:39 PM */

Sections.TestVerify = function ()
{
Sections.TestVerify.superclass.constructor.call(this, 'sectionTestVerify');
this.addClick('btnApproveAccommodations', this.approve);
this.addClick('btnWrongAccommodations', this.deny);
};
YAHOO.lang.extend(Sections.TestVerify, Sections.Base);
Sections.TestVerify.prototype.load = function(approval)
{
var segmentsContainer = YUD.get('summary-segments');
segmentsContainer.innerHTML = '';
YUD.get('lblVerifySessionID').innerHTML = LoginShell.session.id;
this.renderForms(LoginShell.testForms);
TDS.globalAccommodations.removeCSS(document.body);
var segmentsAccommodations = approval.segmentsAccommodations;
segmentsAccommodations[0].applyCSS(document.body);
Util.Array.each(segmentsAccommodations, this.renderAccommodations, this);
};
Sections.TestVerify.prototype.renderForms = function(testForms)
{
var verifyForm = YUD.get('verifyTestForm');
if (verifyForm == null) return;
var verifyFormSelector = verifyForm.getElementsByTagName('select')[0];
if (verifyFormSelector == null) return;
verifyFormSelector.options.length = 0;
if (testForms == null || testForms.length == 0)
{
YUD.setStyle(verifyForm, 'display', 'none');
return;
}
verifyFormSelector[0] = new Option('Select a form', '');
for (var i = 0; i < testForms.length; i++)
{
var testForm = testForms[i];
verifyFormSelector[i + 1] = new Option(testForm.id, testForm.key);
}
YUD.setStyle(verifyForm, 'display', 'block');
};
Sections.TestVerify.prototype.renderAccommodations = function(segmentAccommodations)
{
if (!segmentAccommodations.isAnyVisible()) return;
var segmentsContainer = YUD.get('summary-segments');
var segmentContainer = HTML.DIV({ 'className': 'summary-segment' });
segmentsContainer.appendChild(segmentContainer);
var segmentHeader = HTML.H3(null, segmentAccommodations.getLabel());
segmentContainer.appendChild(segmentHeader);
var accTypes = segmentAccommodations.getTypes();
Util.Array.each(accTypes, function(accType)
{
if (accType.isVisible())
{
this.renderAccType(segmentContainer, accType);
}
}, this);
};
Sections.TestVerify.prototype.renderAccType = function(segmentContainer, accType)
{
var typeLabel = accType.getLabel() + ':';
var valuesLabel = this.getTypeValuesLabel(accType);
var spanTypeLabel = HTML.SPAN({ 'class': 'summary-segment-type-label' }, typeLabel);
var spanValuesLabel = HTML.SPAN({ 'class': 'summary-segment-type-values' }, valuesLabel);
var row = HTML.DIV({ 'className': 'summary-segment-type' }, spanTypeLabel, spanValuesLabel);
segmentContainer.appendChild(row);
};
Sections.TestVerify.prototype.getTypeValuesLabel = function(accType)
{
var valueNames = [];
var accValues = accType.getValues();
for (var i = 0; i < accValues.length; i++)
{
var accValue = accValues[i];
valueNames.push(accValue.getLabel());
}
return valueNames.join(', ');
};
Sections.TestVerify.prototype.getSelectedTestForm = function()
{
var ddlTestForms = YUD.get('ddlTestForms');
return (ddlTestForms.options.length > 0) ? ddlTestForms.value : null;
};
Sections.TestVerify.prototype.approve = function()
{
var selectedFormKey = this.getSelectedTestForm();
if (YAHOO.lang.isString(selectedFormKey))
{
if (selectedFormKey == '')
{
var defaultError = 'Must select a test form';
TDS.Dialog.showWarning(Messages.getAlt('LoginShell.Alert.MustSelectForm', defaultError));
return;
}
var formKeys = LoginShell.testeeForms;
if (YAHOO.lang.isArray(formKeys) && (formKeys.length > 0) && formKeys.indexOf(selectedFormKey) == -1)
{
var defaultError = 'The selected test form does not match what is allowed for the student';
TDS.Dialog.showWarning(Messages.getAlt('LoginShell.Alert.FormSelectionInvalid', defaultError));
return;
}
LoginShell.formSelection = selectedFormKey;
}
this.applyAccommodations();
this.request('next');
};
Sections.TestVerify.prototype.applyAccommodations = function() {
var accProps = TDS.getAccommodationProperties();
if (accProps && accProps.isPermissiveModeEnabled()) {
Util.SecureBrowser.enablePermissiveMode(true);
}
};
Sections.TestVerify.prototype.deny = function()
{
if (LoginShell.testee.isGuest) {
this.denyGuest();
} else {
this.denyTestee();
}
};
Sections.TestVerify.prototype.denyTestee = function ()
{
LoginShell.resetCSS();
LoginShell.clearTestAccommodations();
TDS.Student.API.denyApproval().then(function() {
this.request('back');
}.bind(this));
};
Sections.TestVerify.prototype.denyGuest = function ()
{
TDS.Dialog.showPrompt(Messages.get('Global.Label.LogoutVerify'), function () {
TDS.Student.API.denyApproval().then(function () {
TDS.logout();
}.bind(this));
});
};

/* SOURCE FILE: section_Instructions.js (d92efd83) 9/9/2014 2:34:36 PM */

Sections.Instructions = function()
{
Sections.Instructions.superclass.constructor.call(this, 'sectionInstructions');
this.addClick('btnCancelTest', function()
{
this.request('back');
});
this.addClick('btnStartTest', this.start);
};
YAHOO.lang.extend(Sections.Instructions, Sections.Base);
Sections.Instructions.prototype.init = function ()
{
var container = YUD.get('quickQuide');
var frame = YUD.get('helpFrame');
var url = TDS.Help.getUrl();
TDS.ToolManager.loadFrameUrl(container, frame, url, function(frameDoc, allowAccess)
{
YUD.addClass(frameDoc.body, 'embedded');
TDS.Help.onLoad(frame, 'startSpeakingButton', 'stopSpeakingButton', 'ttsHelpMessage', 'noTTSHelpMessage');
});
};
Sections.Instructions.prototype.start = function () {
var testee = TDS.Student.Storage.getTestee();
var callback = function (testInfo) {
TDS.Student.Storage.setTestInfo(testInfo);
TDS.redirectTestShell();
};
TDS.Student.API.startTest(testee, LoginShell.formSelection).then(callback);
};

/* SOURCE FILE: section_SoundCheck.js (f4439a8e) 9/9/2014 2:09:39 PM */

Sections.SoundCheck = function()
{
Sections.SoundCheck.superclass.constructor.call(this, 'sectionSoundCheck');
};
YAHOO.lang.extend(Sections.SoundCheck, Sections.Base);
Sections.SoundCheck.prototype.init = function () {
var Player = TDS.Audio.Player;
var Recorder = TDS.Audio.Recorder;
var soundCheck = this;
var standalone = true;
var cssDisabled = 'disabled';
var accProps = TDS.getAccommodationProperties();
var CheckState = {
Audio: 0,
Sources: 1,
Recorder: 2,
RecorderError: -2,
Error: -1
};
var checkState;
function gotoInstructions() {
soundCheck.request('next');
}
function gotoLogin() {
soundCheck.request('back');
}
function showError() {
checkState = CheckState.Error;
YUD.setStyle('checkSound', 'display', 'none');
YUD.setStyle('checkRecorderSources', 'display', 'none');
YUD.setStyle('checkRecorder', 'display', 'none');
YUD.setStyle('checkRecorderError', 'display', 'none');
YUD.setStyle('checkError', 'display', '');
}
function showRecorderError() {
checkState = CheckState.RecorderError;
YUD.setStyle('checkSound', 'display', 'none');
YUD.setStyle('checkRecorderSources', 'display', 'none');
YUD.setStyle('checkRecorder', 'display', 'none');
YUD.setStyle('checkRecorderError', 'display', '');
YUD.setStyle('checkError', 'display', 'none');
}
var requiresAudio = accProps.hasSoundPlayCheck(),
audioPlayer = null;
if (requiresAudio) {
TDS.Audio.Player.setup();
audioPlayer = YUD.get('audioPlayer');
if (!Util.Browser.supportsAudioOGG()) {
var str = YUD.getAttribute(audioPlayer, 'href');
str = str.replace('.ogg', '.m4a');
YUD.setAttribute(audioPlayer, 'href', str);
str = YUD.getAttribute(audioPlayer, 'type');
str = str.replace('ogg', 'm4a');
YUD.setAttribute(audioPlayer, 'type', str);
}
TDS.Audio.Widget.createPlayer(audioPlayer);
Player.onIdle.subscribe(function () {
YUD.removeClass('btnSoundYes', cssDisabled);
});
YUE.addListener('btnSoundYes', 'click', function () {
if (YUD.hasClass('btnSoundYes', cssDisabled)) return;
if (requiresRecorder) {
showRecorderCheck();
}
else {
gotoInstructions();
}
});
YUE.addListener('btnSoundNo', 'click', function () {
TDS.Audio.stopAll();
var soundRetry = function () {
YUE.removeListener('btnErrorRetry', 'click', soundRetry);
showSoundCheck();
};
YUE.addListener('btnErrorRetry', 'click', soundRetry);
showError();
});
}
function showSoundCheck() {
checkState = CheckState.Audio;
YUD.removeClass('audioPlayer', 'playing_fail');
YUD.setStyle('checkSound', 'display', '');
YUD.setStyle('checkRecorderSources', 'display', 'none');
YUD.setStyle('checkRecorder', 'display', 'none');
YUD.setStyle('checkRecorderError', 'display', 'none');
YUD.setStyle('checkError', 'display', 'none');
}
var requiresRecorder = accProps.hasRecorderCheck(),
audioSourceSelect = null,
audioSourceSelectPromise = null,
audioRecorder = null,
recorderSupported = false,
audioSourceSelectController = null;
if (requiresRecorder) {
recorderSupported = TDS.Audio.Recorder.initialize();
audioRecorder = YUD.get('audioRecorder');
TDS.Audio.Widget.createRecorder(audioRecorder);
Recorder.onPlayStop.subscribe(function () {
YUD.removeClass('btnRecorderYes', cssDisabled);
});
audioSourceSelect = YUD.get('audioSourceSelect');
audioSourceSelectController = TDS.Audio.Widget.createSourceSelect(audioSourceSelect, function (deviceId) {
if (deviceId !== null) {
YUD.removeClass('btnSourceSelected', cssDisabled);
Recorder.setSource(deviceId);
Recorder.saveSourceInSessionStorage(deviceId);
} else {
YUD.addClass('btnSourceSelected', cssDisabled);
Recorder.setSource(null);
Recorder.removeSourceFromSessionStorage();
}
});
Recorder.removeSourceFromSessionStorage();
YUE.addListener('btnNoSuitableSource', 'click', function sourceNo() {
var sourcesRetry = function () {
YUE.removeListener('btnErrorRetry', 'click', sourcesRetry);
showSourcesCheck();
};
YUE.addListener('btnErrorRetry', 'click', sourcesRetry);
audioSourceSelectController.hide();
showError();
});
YUE.addListener('btnSourceSelected', 'click', function sourceYes() {
if (YUD.hasClass('btnSourceSelected', cssDisabled)) return;
audioSourceSelectController.hide();
showRecorderCheck();
});
YUE.addListener('btnRecorderYes', 'click', function () {
if (YUD.hasClass('btnRecorderYes', cssDisabled)) return;
if (audioSourceSelectController) {
audioSourceSelectController.dispose();
}
gotoInstructions();
});
YUE.addListener('btnRecorderProblem', 'click', function () {
TDS.Audio.stopAll();
Recorder.getSources(function (sources) {
var retry = function () {
YUE.removeListener('btnRecorderRetry', 'click', retry);
showRecorderCheck();
};
YUE.addListener('btnRecorderRetry', 'click', retry);
if (sources.length > 1) {
var sourceSelect = function () {
YUE.removeListener('btnSourceSelect', 'click', sourceSelect);
showSourcesCheck();
};
YUD.setStyle('btnSourceSelect', 'display', '');
YUE.addListener('btnSourceSelect', 'click', sourceSelect);
} else {
YUD.setStyle('btnSourceSelect', 'display', 'none');
}
var recorderRetry = function () {
YUE.removeListener('btnErrorRetry', 'click', recorderRetry);
showRecorderCheck();
};
YUE.addListener('btnErrorRetry', 'click', recorderRetry);
showRecorderError();
});
});
}
function showSourcesCheck() {
checkState = CheckState.Sources;
YUD.setStyle('checkSound', 'display', 'none');
YUD.setStyle('checkRecorderSources', 'display', '');
YUD.setStyle('checkRecorder', 'display', 'none');
YUD.setStyle('checkRecorderError', 'display', 'none');
YUD.setStyle('checkError', 'display', 'none');
var sourcesSection = $('#checkRecorderSources'),
sourcesPlaceholder = sourcesSection.find('.sources-placeholder'),
sourcesError = sourcesSection.find('.sources-error'),
sourcesContent = sourcesSection.find('.sources-content');
sourcesPlaceholder.show();
sourcesError.hide();
sourcesContent.hide();
if (audioSourceSelectPromise === null) {
audioSourceSelectPromise = audioSourceSelectController.buildDeviceList();
}
audioSourceSelectPromise.then(function () {
sourcesPlaceholder.hide();
sourcesError.hide();
sourcesContent.show();
audioSourceSelectController.show();
})
.catch(function () {
sourcesPlaceholder.hide();
sourcesError.show();
sourcesContent.hide();
});
}
function showRecorderCheck() {
checkState = CheckState.Recorder;
if (audioRecorder && YUD.hasClass(audioRecorder, 'recording_fail')) {
audioRecorder.classNameEvent = 'recording_ready';
audioRecorder.className = 'elicitedwrap recording_ready';
}
YUD.setStyle('checkSound', 'display', 'none');
YUD.setStyle('checkRecorderSources', 'display', 'none');
YUD.setStyle('checkRecorder', 'display', '');
YUD.setStyle('checkRecorderError', 'display', 'none');
YUD.setStyle('checkError', 'display', 'none');
}
YUD.batch(YUD.getElementsByClassName('soundCheckLogout', 'span'), function(logoutEl) {
YUE.on(logoutEl, 'click', gotoLogin);
});
this.load = function ()
{
YUD.setStyle('flashError', 'display', 'none');
YUD.setStyle('javaError', 'display', 'none');
YUD.setStyle('checkSound', 'display', 'none');
YUD.setStyle('checkRecorder', 'display', 'none');
if (requiresRecorder && !recorderSupported) {
YUD.setStyle('soundCheckRecorderError', 'display', 'block');
return;
}
if (requiresAudio)
{
showSoundCheck();
}
else if (requiresRecorder)
{
showRecorderCheck();
}
};
};

/* SOURCE FILE: section_TTSCheck.js (80e2e952) 9/9/2014 2:09:39 PM */

Sections.TTSCheck = function(){
Sections.TTSCheck.superclass.constructor.call(this, 'sectionTTSCheck');
};
YAHOO.lang.extend(Sections.TTSCheck, Sections.Base);
Sections.TTSCheck.prototype.init = function(){
YAHOO.util.Event.onDOMReady(function(){
this.ui  = new TTS.Config.UI();
this.ui.next = this.request.bind(this, 'next');
this.ui.back = this.request.bind(this, 'back');
TTS.getInstance().runOnInit(function(){
TTS.Config.User.reset();
this.ui.setCfg(this.getSettings());
this.ui.init();
}.bind(this));
}.bind(this));
};
Sections.TTSCheck.prototype.load = function(){
};
Sections.TTSCheck.prototype.hasLang = function(lang){
var properties = TDS.getAccommodationProperties();
if(window.LoginShell && (LoginShell.testSelection == null)){
properties = new Accommodations.Properties(TDS.globalAccommodations);
}
var langs = properties.getLanguages() || [];
return (langs.indexOf(lang) != -1);
};
Sections.TTSCheck.prototype.getSettings = function(){
TTS.Config.Lang.ESN.Enabled = this.hasLang('ESN');
var accProps = TDS.getAccommodationProperties();
var config = {
ShowVoicePacks: TDS.getAccommodationProperties().showVoicePackControl(),
ShowVolume: accProps.showVolumeControl() && TTS.Manager.supportsVolumeControl(),
ShowPitch: accProps.showPitchControl() && TTS.Manager.supportsPitchControl() && !Util.Browser.isLinux(),
ShowRate: accProps.showRateControl() && TTS.Manager.supportsRateControl()
};
return config;
};

