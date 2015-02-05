/*
Common code between login and review shell.
This is kind of a mess and we should move this into some kind of infrastructure.
*/

var MasterShell = {};

// accommodations code
(function(TDS, MS) {

    var dialog = null;
    var currentGlobalAccs = null; // copy of global accs
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

        // update css
        accommodations.applyCSS(document.body);

        // check if language changed
        var accProps = new Accommodations.Properties(accommodations);
        var newGlobalLang = accProps.getLanguage();

        // update i18n messages
        if (currentGlobalLang != newGlobalLang) {
            currentGlobalLang = newGlobalLang;
            updateLanguage(currentGlobalLang);
        }
    }

    function setup() {

        var mainAccs = getAccommodations();
        var dialogAccs = TDS.globalAccommodations;

        // apply accs
        apply(mainAccs);

        // create global accs selector dialog
        dialog = new Accommodations.Dialog(dialogAccs, 'globalAccDialog');

        // remove existing accs
        dialog.onBeforeSave.subscribe(remove);

        // apply new accs
        dialog.onSave.subscribe(apply);

        dialog.onCancel.subscribe(function () {
            var accs = currentGlobalAccs.getSelectedJson();
            accs.forEach(function (acc) {
                dialogAccs.selectCodes(acc.type, acc.codes);
            });
        });

        // listen for cog wheel click
        YUE.on('btnAccGlobal', 'click', function (evt) {
            TDS.ToolManager.hideAll(); // hide help
            currentGlobalAccs = dialogAccs.clone(); // make a copy of accs for onCancel
            dialog.show();
        });
    }

    MS.setupAccs = setup;
    MS.removeAccs = remove;
    MS.applyAccs = apply;
    MS.updateLanguage = updateLanguage;

})(TDS, MasterShell);

// misc code
(function (TDS, MS) {

    function isLoginShell() {
        return Util.String.contains(location.href.toLowerCase(), 'loginshell.aspx');
    }

    // this is called when first entering login shell
    // NOTE: hack so we can clear accs before we call setupAccommodations() 
    function clearShellData() {
        Util.Storage.clear();
        Accommodations.Manager.clear();
    }
    
    // fires when the DOM is loaded (but not all the images)
    function onShellReady() {

        // Sets focus to the current window
        // BUG: #13529 - Focus is lost on 'Is this your test?' page
        window.focus();
        
        var qs = Util.QueryString.parse();
        // check if we just got to login shell. Check to see if we are coming back to a specific section 7/30.
        if (isLoginShell() && !qs.section) { // check for section querystring parameter
            clearShellData();
        }

        // fire preinit function if it exists
        if (typeof window.preinit == 'function') {
            try {
                window.preinit();
            } catch (ex) {
                TDS.Diagnostics.report(ex);
            }
        }

        // setup keyboard listener
        KeyManager.init();

        // global key events
        KeyManager.onKeyEvent.subscribe(function (obj) {
            // check for escape
            if (obj.type == 'keydown' && obj.keyCode == 27) {
                // hide help
                TDS.ToolManager.hideAll();
            }
        });

        // setup help:
        YUE.on('btnHelp', 'click', function (evt) {
            // stop mouse click
            YUE.stopEvent(evt);

            // get the tools path
            var key = TDS.Help.getKey();
            var lang = TDS.getLanguage(); // this is because we need the key to unique if someone switches global language
            var id = 'tool-' + key + '-' + lang;

            var panel = TDS.ToolManager.get(id);

            if (panel == null) {
                var headerText = Messages.getAlt('StudentMaster.Label.HelpGuider', 'Help');
                panel = TDS.ToolManager.createPanel(id, 'helpguide', headerText, null, key);
                $(panel.close).attr('href', '#');
            }

            TDS.ToolManager.toggle(panel);
        });

        // attach buttons events
        TDS.Button.init();

        // setup accommodations
        MS.setupAccs();

        // perform some proxy specific code
        if (TDS.isProxyLogin) {

            //initialize a timeout handler. in the proxy app we want to log the proctor out if he is idle on any page.
            //testshell has a separate timer. the timer here handles idling in student login and review shells.
            //do not do this on the proctor login pages i.e. clslogin.aspx or replogin.aspx.
            var currentPage = (location.href).toLowerCase();
            if (currentPage.indexOf('login') == -1) {
                //the time the user gets to response is hardcoded to 30 seconds right now.
                var idleTimer = new TDS.IdleTimer(TDS.timeout, 30, function() {
                    TDS.logoutProctor(false);
                });
                idleTimer.start();
            }
        }

        // check if there is an init function on the page
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

    // fires before the page gets unloaded
    function onShellUnload() {

        TDS.unloader.initiateUnload();

        // always try and stop TTS before leaving a page
        TTS.Manager.stop();
    }

    YUE.on(window, 'beforeunload', onShellUnload);

    function closeWindow() {
        if (TDS.isProxyLogin) {
            TDS.logout();
        } else {
            // check if offline cache is available for this browser
            if (TDS.Cache.isAvailable()) {
                // stop the cache and wait for it to be shutdown
                TDS.Cache.stop();

                // failsafe timer for shutting down (wait 1 min)
                YAHOO.lang.later(60000, this, function () {
                    TDS.Dialog.showProgress();
                    Util.SecureBrowser.close();
                });
            } else {
                TDS.Dialog.showProgress();
                Util.SecureBrowser.close();
            }
        }
    }

    window.closeWindow = closeWindow;

    // this gets triggered when someone tries to stop the cache
    TDS.Cache.Events.subscribe('onStop', function () {
        TDS.Dialog.showProgress();
    });

    // this gets triggered when the cache has been forced to shutdown
    TDS.Cache.Events.subscribe('onShutdown', function () {
        Util.SecureBrowser.close();
    });

    // apply accommodations css to help guide
    TDS.ToolManager.Events.subscribe('onShow', function (panel) {
        var frame = panel.getFrame();
        Util.Dom.copyCSSFrame(frame);
    });

})(TDS, MasterShell);
