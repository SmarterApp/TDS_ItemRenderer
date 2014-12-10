/*
Test shell general user interface functionality. 
*/

(function (TS, CM) {

    var UI = {

        // default CSS on the test shell
        defaultBodyCSS: null,

        CSS: {
            dialogShowing: 'showingDialog', // use on current iframe when dialog is shown
            popupShowing: 'showingPopup', // use on current iframe when help or tool is used
            loading: 'showingLoading' // used on shell for loading screen
        },

        Nodes: {},
        Events: {}
    };

    var Notification = {
        None: 0,
        Success: 1,
        Notice: 2,
        Error: 3
    };

    // helper function for adding a dom onclick event
    UI.addClick = function(id, callback) {

        var target = YUD.get(id);
        if (!target) {
            return false;
        }

        // disable targets ability to get focus
        if (CM.enableARIA === false) {

            target.setAttribute('tabindex', '-1');

            // BUG #63493: If you stop mousedown on <select> in Chrome/Firefox16+ then it won't open
            if (target.tagName != 'SELECT') {
                // disable links from getting focus when clicked
                $(target).on('mousedown', function(evt) {
                    YUE.stopEvent(evt);
                });
                $(target).on('mouseup', function(evt) {
                    YUE.stopEvent(evt);
                });
            }
        }

        // Please DO NOT change this to $(target).on().
        // Using YUE.on() instead of $(target).on() because some of our tools (Dictionary, MT, Masking, Rubric) are attaching listeners by YUE.on() [tds_shell.js line #37], 
        // and in Global Menu, all click event are triggering the navi tool bar button click event, so we'll need the YAHOO.util.UserAction.click(target) to trigger those click event [testshell_Menu.js line #33]
        // in this case, jQuery just does not work well with YUI.
        YUE.on(target, 'click', function (evt) {

            // stop click event on links
            if (target.nodeName == 'A' || target.nodeName == 'SELECT') {
                YUE.stopEvent(evt);
            }

            // if the button is not disabled then execute callback
            if (YUD.getAttribute(target, 'disabled') != 'disabled') {
                callback.call(this, evt);
            }

        }, this, true);

        return true;
    };

    // helper function for adding a custom YUI event
    UI.createEvent = function(name) {
        this.Events[name] = new YAHOO.util.CustomEvent(name, this, false, YAHOO.util.CustomEvent.FLAT);
    };

    UI.init = function() {

        // write out buttons
        if (TDS.Config.testShellButtons) {
            TDS.Shell.processConfig(TDS.Config.testShellButtons);
        }

        // save original CSS to be used for new frames
        this.defaultBodyCSS = document.body.className;

        // get dom nodes and create events
        this.loadDomNodes();
        this.createDomEvents();

        // hook up to context menu button
        this.enableContextMenuButton();

        // enable the redraw fix if someone clicks the header
        this.enableRedrawFix();

        // add button events
        TDS.Button.init();

        // add aria log
        TDS.ARIA.createLog();
    };

    UI.loadDomNodes = function() {

        // get header elements
        this.Nodes.ddlNavigation = YUD.get('ddlNavigation');

        // get student control elements
        this.Nodes.lblStatus = YUD.get('lblStatus');
        this.Nodes.btnSave = YUD.get('btnSave');
        this.Nodes.btnPause = YUD.get('btnPause');
        this.Nodes.btnBack = YUD.get('btnBack');
        this.Nodes.btnNext = YUD.get('btnNext');
        this.Nodes.btnEnd = YUD.get('btnEnd');
        this.Nodes.btnResults = YUD.get('btnResults');

        this.Nodes.testName = YUD.get('lblTestName');
        this.Nodes.tools = YUD.get('studentTools');
        this.Nodes.controls = YUD.get('studentControls');
    };

    UI.createDomEvents = function() {

        // add events for each element
        Object.keys(this.Nodes).forEach(function(key) {

            // HACK: ignore page selector
            if (key == 'ddlNavigation') {
                return;
            }

            var element = UI.Nodes[key];

            // create event
            UI.createEvent(key);

            // add event trigger
            UI.addClick(element, function() {
                UI.Events[key].fire(element);
            });
        });
    };

    UI.isLoading = function() {
        return YUD.hasClass(document.body, UI.CSS.loading);
    };

    UI.showLoading = function(message) {
        if (YAHOO.lang.isString(message)) {
            if (YUD.get('loadingMessage')) {
                YUD.get('loadingMessage').innerHTML = message;
            }
        } else {
            // YUD.get('loadingMessage').innerHTML = '';
        }

        if (this.isLoading()) {
            return false;
        }
        return YUD.addClass(document.body, UI.CSS.loading);
    };

    UI.hideLoading = function() {
        if (!this.isLoading()) {
            return false;
        }
        return YUD.removeClass(document.body, UI.CSS.loading);
    };

    function enableControl(id, enabled) {

        // get control
        var el = YUD.get(id);
        if (!el || !el.parentNode) {
            return;
        }

        // enable/disable button?
        if (enabled) {
            YUD.addClass(el.parentNode, 'active');
            YUD.removeClass(el.parentNode, 'inactive');
            el.removeAttribute('disabled');
        } else {
            YUD.removeClass(el.parentNode, 'active');
            YUD.addClass(el.parentNode, 'inactive');
            el.setAttribute('disabled', 'disabled');
        }
    }
    
    // refresh the controls on the page to the latest state
    UI.updateControls = function() {

        enableControl('btnPause', true);

        var currentPage = TS.PageManager.getCurrent();

        if (currentPage) {
            // show back button as long as we are not on the first page
            var allowBack = !TS.PageManager.isFirst(currentPage);
            if (!allowBack) {
                // if we can't request the next page then pagination is pending
                allowBack = !CM.requestPreviousPage(true);
            }
            enableControl('btnBack', allowBack);
            enableControl('btnNext', true);
        } else {
            enableControl('btnBack', false);
            enableControl('btnNext', false);
        }

        enableControl('btnEnd', TS.isTestCompleted());

        // disable pause/end if we are showing item scores
        if (TDS.showItemScores) {
            enableControl('btnPause', false);
            enableControl('btnEnd', false);
            enableControl('btnResults', true);
        }

        // update dropdown with anything that has changed
        TS.Navigation.update();

        // update test info
        UI.updateTestInfo();
    };

    // update test name and # of completed
    UI.updateTestInfo = function() {

        // figure out how many responses the user has seen
        var responsesSoFar = 0;

        // assume all responses before the first content page are answered
        var firstPage = TS.PageManager.getFirstGroup();
        if (firstPage && firstPage.items) {
            responsesSoFar = firstPage.items[0].position - 1;
        }

        // count num responses answered for all visible content pages
        var pages = TS.PageManager.getGroups();
        Util.Array.each(pages, function(page) {
            responsesSoFar += page.getNumAnswered();
        });

        // build label text
        var labelEl = UI.Nodes.testName;
        var labelText = TS.Config.testName;

        // get type of label to show
        var accProps = Accommodations.Manager.getDefaultProps();
        var tpiCode = accProps ? accProps.getTestProgressIndicator() : null;

        // check if we need to calc stats
        if (tpiCode && tpiCode != 'TDS_TPI_None') {

            var testLength = TS.Config.testLength;

            // if the test is completed make sure length is correct (ignore legacy TDS_TCI_Responses)
            if (TS.testFinished && tpiCode != 'TDS_TPI_Responses') {
                var itemsCount = 0;
                pages.forEach(function(page) {
                    itemsCount += page.items.length;
                });
                testLength = itemsCount;
            }

            // figure out percentage complete
            var testPercent = Math.floor((responsesSoFar / testLength) * 100);
            if (testPercent < 0 || testPercent === Infinity) {
                testPercent = 0;
            } else if (testPercent > 100) {
                testPercent = 100;
            }

            if (tpiCode == 'TDS_TPI_Responses' || tpiCode == 'TDS_TPI_ResponsesFix') {
                var i18n_1 = Messages.getAlt('TDSShellUIJS.Label.OutOf', 'out of');
                labelText += ' (' + responsesSoFar + ' ' + i18n_1 + ' ' + testLength + ')';
            } else if (tpiCode == 'TDS_TPI_Percent') {
                var i18n_2 = Messages.getAlt('TDSShellUIJS.Label.OutOfPercent', 'completed');
                labelText += ' (' + testPercent + '% ' + i18n_2 + ')';
            }

        }

        Util.Dom.setTextContent(labelEl, labelText);
    };

    // check if there are any items that require saving for the group, if so show the save button
    UI.showSave = function(group) {

        var enable = false;

        // check if any item allows explicit save
        if (group && group.items) {
            enable = Util.Array.find(group.items, function(item) {
                var saveOptions = item.getSaveOptions();
                return saveOptions.explicit;
            });
        }

        // add enabled class
        if (enable) {
            YUD.addClass('btnSave', 'enable');
        } else {
            YUD.removeClass('btnSave', 'enable');
        }

        // add inactive class
        enableControl('btnSave', enable);

        return enable;
    };
    
    UI.reload = function() {
        UI.showLoading();
        var currentPage = TS.PageManager.getCurrent();
        if (currentPage) {
            currentPage.requestContent(true);
        }
    };

    UI.showContentError = function(preventReload) {
        UI.hideLoading();
        if (preventReload) {
            TestShell.UI.showError('ContentError', function () {
                TS._pauseInternal(true);
            });
        } else {
            UI.showErrorPrompt('ContentTimeout', {
                yes: function () {
                    UI.reload();
                    var currentPage = TS.PageManager.getCurrent();
                    if (currentPage) {
                        TDS.Diagnostics.logServerError('CONTENT ' + currentPage.id + ': Reload');
                    }
                },
                no: function () {
                    TS._pauseInternal(true);
                }
            });
        }
    };

    UI.clearScreen = function() {
        while (true) {
            try {
                document.body.removeChild(document.body.firstChild);
            } catch (ex) {
                break;
            }
        }
    };

    UI.enableRedrawFix = function() {

        var navigationEl = YUD.get('navigation');
        if (!navigationEl) {
            return;
        }

        YUE.on(navigationEl, Util.Event.Mouse.start, function(ev) {

            var targetEl = YUE.getTarget(ev);

            // check if the target is only the navigation bar
            if (navigationEl == targetEl) {
                CM.applyRedrawFix();
            }
        });
    };

    // add a button to the top bar tool section 
    UI.addButtonTool = TDS.Shell.addTool;

    // add a button to the top bar controls section 
    UI.addButtonControl = TDS.Shell.addControl;

    TS.UI = UI;

})(window.TestShell, window.ContentManager);

// Dialogs
(function(TS, CM) {

    var UI = TS.UI;

    function showAlert(textHeader, textMessage, funcOk) {

        // close menu and hide loading screen
        CM.Menu.hide();
        UI.hideLoading();

        var handleOk = function() {
            this.hide();
            top.focus();
            if (funcOk) {
                funcOk();
            }
        };

        // Ok
        var buttons = [
            { text: Messages.get('Global.Label.OK'), handler: handleOk }
        ];

        TDS.Dialog.show(textHeader, textMessage, buttons);
    }

    UI.showAlert = showAlert; // showAlert

    UI.showWarning = function(textMessage, funcOk) { // showWarningAlert
        var textHeader = Messages.get('TDSShellUIJS.Label.Warning');
        showAlert(textHeader, textMessage, funcOk);
    };

    UI.showError = function(textMessage, funcOk) { // showWarningError
        var textHeader = Messages.get('TDSShellUIJS.Label.Error');
        showAlert(textHeader, textMessage, funcOk);
    };

    // TDS shell prompt
    function showPrompt(textHeader, textMessage, obj) {

        // hide any context menus
        CM.Menu.hide();

        // prepare labels
        obj.noLabel = Messages.get(obj.noLabel ? obj.noLabel : 'Global.Label.No');
        obj.yesLabel = Messages.get(obj.yesLabel ? obj.yesLabel : 'Global.Label.Yes');

        // prepare functions
        var yesHandler = function() {
            this.hide();
            top.focus();
            if (obj.yes) {
                if (obj.scope) {
                    obj.yes.call(obj.scope);
                } else {
                    obj.yes();
                }
            }
        };

        var noHandler = function() {
            this.hide();
            top.focus();
            if (obj.no) {
                if (obj.scope) {
                    obj.no.call(obj.scope);
                } else {
                    obj.no();
                }
            }
        };

        // No, Yes
        var buttons = [
            { text: obj.noLabel, handler: noHandler, isDefault: true }, // NOTE: If isDefault is set on yes then tabbing seems to have problems
            { text: obj.yesLabel, handler: yesHandler }
        ];

        // Logout
        if (obj.logout) {
            var logoutHandler = function() {
                this.hide();
                UI.clearScreen();
                TS.redirectLogin();
            };

            var logoutLabel = Messages.getAlt('Global.Label.Logout', 'Logout');
            buttons.push({ text: logoutLabel, handler: logoutHandler });
        }

        TDS.Dialog.show(textHeader, textMessage, buttons);
    }

    // show warning prompt
    UI.showWarningPrompt = function(textMessage, obj) { // showWarningPrompt
        var textHeader = Messages.get('TDSShellUIJS.Label.Warning');
        textMessage = ErrorCodes.get(textMessage);
        showPrompt(textHeader, textMessage, obj);
    };

    // show error prompt
    UI.showErrorPrompt = function(textMessage, obj) { // showErrorPrompt
        var textHeader = Messages.get('TDSShellObjectsJS.Label.Error');
        textMessage = ErrorCodes.get(textMessage);
        showPrompt(textHeader, textMessage, obj);
    };

})(window.TestShell, window.ContentManager);