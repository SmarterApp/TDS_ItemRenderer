/*
Copyright (c) 2014, American Institutes for Research. All rights reserved.
GENERATED: 10/6/2014 3:52:03 PM
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

/* SOURCE FILE: reviewshell.js (de191a72) 9/9/2014 2:09:39 PM */

function preinit()
{
ReviewShell.init();
}
var ReviewShell =
{
workflow: null
};
ReviewShell.init = function()
{
this.workflow = ReviewShell.createWorkflow();
ReviewShell.start();
};
ReviewShell.start = function()
{
if (TDS.showItemScores) this.workflow.start('sectionTestResults');
else this.workflow.start('sectionTestReview');
};
ReviewShell.createWorkflow = function()
{
var wf = Sections.createWorkflow();
wf.Events.subscribe('onRequest', function(activity) { Util.log('Section Request: ' + activity); });
wf.Events.subscribe('onReady', function(activity) { Util.log('Section Ready: ' + activity); });
wf.Events.subscribe('onLeave', function (activity) { Util.log('Section Hide: ' + activity); });
wf.Events.subscribe('onEnter', function (activity) { Util.log('Section Show: ' + activity); });
wf.Events.subscribe('onEnter', function (activity) {
$('#logOut').hide();
});
wf.addActivity(new Sections.TestReview());
wf.addActivity(new Sections.TestResults());
wf.addActivity(new Sections.Logout());
wf.addTransition('sectionTestReview', 'back', 'sectionTestShell');
wf.addTransition('sectionTestReview', 'next', 'sectionTestResults');
return wf;
};

/* SOURCE FILE: section_TestReview.js (0c33b2b4) 9/9/2014 2:09:39 PM */

(function (TDS, Sections) {
function TestReview() {
TestReview.superclass.constructor.call(this, 'sectionTestReview');
this.addClick('btnReviewTest', this.viewGroup);
this.addClick('btnCompleteTest', this.score);
};
YAHOO.lang.extend(TestReview, Sections.Base);
TestReview.prototype.load = function() {
this.setMarked(window.groups);
this.setGroups(window.groups);
};
TestReview.prototype.setMarked = function(groups) {
var markedWarning = YUD.get('markedWarning');
var marked = false;
for (var i = 0; i < groups.length; i++) {
var group = groups[i];
if (group.marked) {
marked = true;
break;
}
}
if (marked) {
YUD.setStyle(markedWarning, 'display', 'block');
} else {
YUD.setStyle(markedWarning, 'display', 'none');
}
};
TestReview.prototype.setGroups = function (groups) {
var ddlNavigation = YUD.get('ddlNavigation');
ddlNavigation.options.length = 0;
for (var i = 0; i < groups.length; i++) {
var group = groups[i];
var label = "";
var defaultAccProps = Accommodations.Manager.getDefaultProperties();
if (defaultAccProps && defaultAccProps.getNavigationDropdown() == 'TDS_NavTk') {
label = Messages.getAlt('TDSShellObjectsJS.Label.TaskLabel', 'Task ') + group.page;
} else {
label = group.firstPos;
if (group.firstPos != group.lastPos) {
label += ' - ' + group.lastPos;
}
}
if (group.marked) {
label += ' (' + Messages.get('TDSShellObjectsJS.Label.Marked') + ')';
}
ddlNavigation[i] = new Option(label, group.page);
}
};
TestReview.prototype.viewGroup = function(group) {
var ddlNavigation = YUD.get('ddlNavigation');
if (ddlNavigation.value == '') {
var label = Messages.get('TDSShellObjectsJS.Label.PageLabel').toLowerCase();
var defaultAccProps = Accommodations.Manager.getDefaultProperties();
if (defaultAccProps && defaultAccProps.getNavigationDropdown() == 'TDS_NavTk') {
label = Messages.get('TDSShellObjectsJS.Label.TaskLabel').toLowerCase();
}
var pageFirstMessage = Messages.get('ReviewShell.Message.PageFirst', [label]);
TDS.Dialog.showAlert(pageFirstMessage);
return;
}
TDS.redirectTestShell(ddlNavigation.value);
};
TestReview.prototype.score = function() {
var msgCannotComplete = Messages.getAlt('ReviewShell.Message.CannotCompleteTest', 'Cannot complete the test.');
var msgSubmitTest = Messages.getAlt('ReviewShell.Message.SubmitTest', 'Are you sure you want to submit the test?');
var accProps = Accommodations.Manager.getCurrentProps();
var hideTestScore = accProps.hideTestScore();
var showItemScoreReportSummary = accProps.showItemScoreReportSummary();
var showItemScoreReportResponses = accProps.showItemScoreReportResponses();
var submitTest = function() {
TDS.Dialog.showPrompt(msgSubmitTest, function() {
TDS.Student.API.scoreTest(hideTestScore, showItemScoreReportSummary, showItemScoreReportResponses).then(function(summary) {
if (summary) {
this.request('next', summary);
}
}.bind(this));
}.bind(this));
}.bind(this);
var testInfo = TDS.Student.Storage.getTestInfo();
if (testInfo && testInfo.validateCompleteness) {
TDS.Student.API.canCompleteTest().then(function(canComplete) {
if (canComplete) {
submitTest();
} else {
TDS.Dialog.showAlert(msgCannotComplete);
}
}.bind(this));
} else {
submitTest();
}
};
Sections.TestReview = TestReview;
})(window.TDS, window.Sections);

/* SOURCE FILE: section_TestResults.js (7ec933c8) 9/9/2014 2:09:39 PM */

(function(TDS, Sections) {
function TestResults() {
TestResults.superclass.constructor.call(this, 'sectionTestResults');
this._pollAttempts = 5;
this._pollDelay = 60000;
this.addClick('btnScoreLogout', this.logout);
this.addClick('btnEnterMoreScores', this.redirectToTestSelectionSection);
}
YAHOO.lang.extend(TestResults, Sections.Base);
TestResults.prototype.load = function(summary) {
YUD.get('lblName').innerHTML = '';
YUD.get('lblSSID').innerHTML = '';
YUD.get('lblTestName').innerHTML = '';
var testee = TDS.Student.Storage.getTestee();
if (testee) {
if (testee.lastName && testee.firstName) {
YUD.get('lblName').innerHTML = testee.lastName + ', ' + testee.firstName;
}
if (testee.id) {
YUD.get('lblSSID').innerHTML = testee.id;
}
}
var testProps = TDS.Student.Storage.getTestProperties();
if (testProps && testProps.displayName) {
YUD.get('lblTestName').innerHTML = testProps.displayName;
}
if (summary != null) {
this.renderSummary(summary);
} else {
this.loadSummary();
}
};
TestResults.prototype.renderSummary = function(testSummary) {
Util.dir(testSummary);
var resultsContainer = this.getContainer();
if (testSummary.pollForScores) {
if (this._pollAttempts > 0) {
YUD.addClass(resultsContainer, 'scoreWaiting');
this.pollSummary();
} else {
YUD.addClass(resultsContainer, 'scoreTimedOut');
}
} else {
var hasTestScores = (testSummary.testScores && testSummary.testScores.length > 0);
var hasItemScores = (testSummary.itemScores && testSummary.itemScores.length > 0);
if (hasTestScores) {
this.renderTestScores(testSummary.testScores);
}
if (hasItemScores) {
this.renderItemScores(testSummary.itemScores, testSummary.viewResponses);
}
if (!hasTestScores && !hasItemScores) {
YUD.addClass(resultsContainer, TDS.inPTMode ? 'scoreUnavailableInPT' : 'scoreUnavailable');
}
}
};
TestResults.prototype.renderTestScores = function(testScores) {
var resultsContainer = this.getContainer();
YUD.removeClass(resultsContainer, 'scoreWaiting');
YUD.addClass(resultsContainer, 'scoreAvailable');
var html = [];
Util.Array.each(testScores, function(testScore) {
var scoreHtml = '<li><span class="scoreLabel">{label}</span><span class="scoreValue">{value}</span></li>';
scoreHtml = YAHOO.lang.substitute(scoreHtml, testScore);
html.push(scoreHtml);
}, this);
var testScoresListEl = YUD.get('scoreList');
testScoresListEl.innerHTML = html.join(' ');
};
TestResults.prototype.renderItemScores = function(itemScores, viewResponses) {
var resultsContainer = this.getContainer();
YUD.removeClass(resultsContainer, 'scoreWaiting');
YUD.addClass(resultsContainer, 'scoreAvailable');
var scoresTblEl = YUD.get('itemScores');
var scoresBodyEl = scoresTblEl.getElementsByTagName('tbody')[0];
var defaultCorrectAnswer = Messages.getAlt('ItemScores.Row.Format.NA', '');
Util.Array.each(itemScores, function(itemScore) {
var scoreRowEl = HTML.TR();
var scorePosEl;
if (viewResponses) {
scorePosEl = HTML.A({ href: '#' }, itemScore.position);
this.addClick(scorePosEl, function(ev) {
TDS.redirectTestShell(itemScore.page);
});
} else {
scorePosEl = itemScore.position;
}
scoreRowEl.appendChild(HTML.TD(null, scorePosEl));
var responseText;
if (itemScore.format != 'MC') {
responseText = Messages.getAlt('ItemScores.Row.Format.' + itemScore.format, itemScore.response);
} else {
responseText = itemScore.response;
}
scoreRowEl.appendChild(HTML.TD(null, responseText));
var answerText;
if (itemScore.format != 'MC') {
answerText = Messages.getAlt('ItemScores.Row.Format.' + itemScore.format, defaultCorrectAnswer);
} else {
var answerKey = parseScoreRationale(itemScore.scoreRationale);
answerText = answerKey;
}
scoreRowEl.appendChild(HTML.TD(null, answerText));
if (itemScore.score >= 0) {
scoreRowEl.appendChild(HTML.TD(null, itemScore.score + '/' + itemScore.scoreMax));
} else {
scoreRowEl.appendChild(HTML.TD(null, Messages.getAlt('ItemScores.Row.NoScore', 'N/A')));
}
scoresBodyEl.appendChild(scoreRowEl);
}, this);
YUD.setStyle(scoresTblEl, 'display', 'block');
};
TestResults.prototype.pollSummary = function() {
this._pollAttempts--;
YAHOO.lang.later(this._pollDelay, this, this.loadSummary);
};
TestResults.prototype.loadSummary = function() {
var accProps = Accommodations.Manager.getCurrentProps();
var hideTestScore = accProps.hideTestScore();
var showItemScoreReportSummary = accProps.showItemScoreReportSummary();
var showItemScoreReportResponses = accProps.showItemScoreReportResponses();
TDS.Student.API.getDisplayScores(hideTestScore, showItemScoreReportSummary, showItemScoreReportResponses).then(function(summary) {
if (summary) {
this.renderSummary(summary);
}
}.bind(this));
};
TestResults.prototype.logout = function() {
TDS.Dialog.showProgress();
TDS.logout();
};
TestResults.prototype.redirectToTestSelectionSection = function () {
if (TDS.isProxyLogin) {
var testee = TDS.Student.Storage.getTestee();
var firstName = testee.firstName;
var lastName = testee.lastName;
var testeeID = testee.id;
var message = Messages.get('TestResults.Link.EnterMoreScoresConfirm', [lastName, firstName, testeeID]);
TDS.Dialog.showPrompt(message, function() {
TDS.redirect('Pages/LoginShell.aspx?section=sectionTestSelection');
});
} else {
this.logout();
}
};
Sections.TestResults = TestResults;
function parseScoreRationale(scoreRationale) {
if (scoreRationale && scoreRationale.indexOf('<ScoreRationale>') != -1) {
var xmlDoc;
try {
xmlDoc = Util.Xml.parseFromString(scoreRationale);
} catch (ex) {}
if (xmlDoc) {
scoreRationale = $(xmlDoc).find('ScoreRationale').text();
scoreRationale = $.trim(scoreRationale);
}
}
return scoreRationale;
}
})(window.TDS, window.Sections);

