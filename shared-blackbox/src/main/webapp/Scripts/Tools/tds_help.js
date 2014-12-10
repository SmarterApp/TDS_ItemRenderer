/*
Code for using the help guide popup and inline iframe.
*/
TDS.Help = (function (TDS) {

    function HelpGuide(contentFrame, btnStartTTS) {

        //**************************public members
        this.onReset = new YAHOO.util.CustomEvent('onReset', TTS.Manager, false, YAHOO.util.CustomEvent.FLAT);
        this.selection = null;

        //**************************private members
        var frame = contentFrame;
        var enabled = false;
        var that = this;

        // add selectionchange event, to capture range before it is lost due to button touch
        if (frame && Util.Browser.isMobile()) {
            var frameDoc = Util.Dom.getFrameContentDocument(frame);
            if (frameDoc) {
                YUE.addListener(frameDoc, 'selectionchange', function(evt) {
                    // Don't update selected range if Speak button is pressed
                    if (evt && evt.target != btnStartTTS) {
                        that.selection = rangy.getSelection(frameDoc);
                    }
                });
            }
        }

        //**************************public methods
        this.init = function() {
            shouldEnableTTS();
            return enabled;
        };

        this.isEnabled = function() {
            return enabled;
        };

        this.hasTTSInstrAccommodationEnabled = function() {
            var accProps = TDS.getAccommodationProperties();
            // get the current language
            var language = accProps.getLanguage();
            return accProps.hasTTSInstruction() && isTTSPossibleForLanguage(language);
        };


        this.getStartSpeakingHandler = function() {
            return startSpeakingHandler;
        };

        this.getStopSpeakingHandler = function() {
            return stopSpeakingHandler;
        };

        this.reset = function(fireResetEvent) {
            //reset all states but do not reinitialize TTS by calling TTS.Manager.init.
            enabled = checkEnabled();
            if (fireResetEvent) {
                this.onReset.fire();
            }
        };

        /**************************private meth */

        //HACK
        //this is a hard coded function to help us tentatively decide if it is even worth our while honoring TTS accommodations.
        var isTTSPossibleForLanguage = function(language) {
            if ("ENU" == language || "ESN" == language) {
                return true;
            }
            return false;
        };


        var checkEnabled = function() {
            var accProps = TDS.getAccommodationProperties();
            var language = accProps.getLanguage();
            // check if language is supported (TODO: why isn't this part of play?)
            var ctrl = TTS.getInstance();
            var languageSupported = ctrl.isLanguageSupported(language);

            // check if TTS is supported on this machine
            var ttsSupported = (ctrl.getStatus() != TTS.Status.NotSupported);

            // only if tts and current languauge are both supported should we enable TTS for Help.
            if (ttsSupported && languageSupported) {
                return true;
            } else {
                return false;
            }
        };


        // This is a hack since we dont have the notion of client specific
        // accomodations that are not tied to a test
        var shouldEnableTTS = function() {

            if (that.hasTTSInstrAccommodationEnabled()) {
                //first check if TTS is already initialized.
                if (TTS.Manager.getStatus() != TTS.Status.Uninitialized) {
                    //looks like TTS is already initizlized. just fire the reset event.
                    that.reset(true);
                } else {

                    TTS.Manager.Events.onInitFailure.subscribe(function() {
                        disable();
                    });
                    TTS.Manager.Events.onStatusChange.subscribe(function() {
                        if (TTS.Manager.getStatus() == TTS.Status.NotSupported) {
                            disable();
                        }
                    });
                    TTS.Manager.Events.onInitSuccess.subscribe(function() {
                        that.reset(true); //just fire the reset event.
                    });

                    YAHOO.util.Event.onDOMReady(function() { //Init on help page if it isn't already started.
                        TTS.getInstance();
                    });
                }
            }
            return false;
        };


        var disable = function() {
            enabled = false;
            that.onReset.fire();
        };
        
        var startSpeakingHandler = function(evt, altFrame, touchSelected) {
            if (enabled) {
                var prepSelection = function(frame, language) {
                    var doc = Util.Dom.getFrameContentWindow(frame).document;

                    // if touchSelected has value, use it, otherwise get the selected range
                    if (touchSelected) {
                        selected = touchSelected;
                    } else {
                        var selected = rangy.getSelection(doc);
                    }
                    var element = doc.getElementById('helpContent');
                    ctrl.languageManager.addLanguageTags(element, language);
                    var entity = {};
                    entity.getElement = function() { return element; };
                    ctrl.setCurrentDomEntity(entity);
                    return selected;
                };
                // get the current language
                var language = TDS.getAccommodationProperties().getLanguage();
                //fix for 16018. Call sto before play on the help menu everytime.
                var ctrl = TTS.getInstance();
                ctrl.stop();

                // play selected text
                var domWalker = null;
                // Bug 116603 Both TTS and TTS2 code needs to be supported
                if (TTS.version && TTS.version > 1) {
                    var selection;
                    if (typeof altFrame != 'undefined' && altFrame != null) {
                        selection = prepSelection(altFrame, language);
                    } else {
                        selection = prepSelection(frame, language);
                    }
                    // Bug JS exceptions make sure selection has a valid range before calling .playSelection()
                    if (selection.getAllRanges().length) {
                        ctrl.playSelection(selection, language);
                    }
                } else {
                    if (typeof altFrame != 'undefined' && altFrame != null) {
                        ctrl.play(Util.Dom.getFrameContentWindow(altFrame), TTS.Parser.Types.Selection, language);
                    } else {
                        ctrl.play(Util.Dom.getFrameContentWindow(frame), TTS.Parser.Types.Selection, language);
                    }
                }
            }
        };

        var stopSpeakingHandler = function(evt, altFrame) {
            if (enabled) {
                TTS.getInstance().stop();
            }
        };

    }

    // get the message key used to lookup help guide path
    HelpGuide.getKey = function() {
        var key = 'Global.Path.Help';
        var accProps = TDS.getAccProps();
        if (accProps && accProps.isStreamlinedMode()) {
            if (Messages.has(key + '.Streamlined')) {
                key = key + '.Streamlined';
            }
        }
        return key;
    };

    HelpGuide.getUrl = function () {
        var key = HelpGuide.getKey();
        var url = TDS.baseUrl + 'Pages/';
        url += Messages.get(key);
        return url;
    };

    // call this function when loading a help guide
    HelpGuide.onLoad = function(frame, btnStartSpeaking, btnStopSpeaking, messageDiv, noTTSMessageDiv) {

        //This is some of the last TTS related code that really needs to be updated...

        // get links
        btnStartSpeaking = YUD.get(btnStartSpeaking);
        btnStopSpeaking = YUD.get(btnStopSpeaking);
        messageDiv = YUD.get(messageDiv);
        noTTSMessageDiv = YUD.get(noTTSMessageDiv);

        //create a tts help container for this frame and attach a reset handler to it.
        var tdsHelpFunctionality = new HelpGuide(frame, btnStartSpeaking);

        var disableTTS = function() {
            var hasTTSInstrAccommmodation = tdsHelpFunctionality.hasTTSInstrAccommodationEnabled();
            // add disabled classes
            YUD.addClass(btnStartSpeaking, 'disabled');
            YUD.addClass(btnStopSpeaking, 'disabled');
            YUD.setStyle(messageDiv, 'display', 'none');

            if (hasTTSInstrAccommmodation) {
                YUD.setStyle(noTTSMessageDiv, 'display', 'block');
            } else {
                YUD.setStyle(noTTSMessageDiv, 'display', 'none');
                YUD.setStyle(btnStartSpeaking, 'display', 'none');
                YUD.setStyle(btnStopSpeaking, 'display', 'none');
            }
            //remove all listeners for those buttons.
            var startSpeakingEvt = Util.Browser.isMobile() ? 'touchstart' : 'click';
            YUE.removeListener(btnStartSpeaking, startSpeakingEvt);
            YUE.removeListener(btnStopSpeaking, 'click');
        };

        var initDisplay = function() {
            var enableTTSOnInstr = tdsHelpFunctionality.isEnabled();
            if (enableTTSOnInstr) {
                // remove disabled classes
                YUD.removeClass(btnStartSpeaking, 'disabled');
                YUD.removeClass(btnStopSpeaking, 'disabled');

                // add startSpeaking handlers, touchstart for mobile, click for all others
                var startSpeakingEvt = Util.Browser.isMobile() ? 'touchstart' : 'click';
                YUE.addListener(btnStartSpeaking, startSpeakingEvt, function(evt) {
                    YUE.stopEvent(evt);
                    var handler = tdsHelpFunctionality.getStartSpeakingHandler();
                    handler(null, null, tdsHelpFunctionality.selection);
                });

                YUE.addListener(btnStopSpeaking, 'click', function() {
                    var handler = tdsHelpFunctionality.getStopSpeakingHandler();
                    handler();
                });

            } else {
                disableTTS();
            }
        };

        //attach a event handler in case TTS is ever reset.
        tdsHelpFunctionality.onReset.subscribe(function() {
            initDisplay();
        });

        //initialize the tts handler container
        tdsHelpFunctionality.init();

        //initialize display. this second call is necessary in case tts has not initialized yet.
        initDisplay();
    };

    /************************************************************/

    // adds TTS buttons to help guide
    TDS.ToolManager.Events.subscribe('onCreating', function(panel) {

        // ignore non-help guide
        if (panel.id.indexOf('tool-Global.Path.Help') == -1) {
            return;
        }

        var tdsHelpFunctionality = new HelpGuide(panel.getFrame());
        var hasTTSInstrAccommmodation = tdsHelpFunctionality.hasTTSInstrAccommodationEnabled();

        if (hasTTSInstrAccommmodation) {

            var startSpeaking = function() {
                var thatPanel = panel;
                var handler = tdsHelpFunctionality.getStartSpeakingHandler();
                handler(null, thatPanel.getFrame());
            };

            var stopSpeaking = function() {
                var thatPanel = panel;
                var handler = tdsHelpFunctionality.getStopSpeakingHandler();
                handler(null, thatPanel.getFrame());
            };

            //if there is TTS accommodation but for some reason TTS is not supported then show the buttons 
            //but disable them.
            // tts buttons
            var buttons = [
                { text: Messages.get('TDSContentJS.Label.StartSpeaking'), handler: startSpeaking, disabled: true },
                { text: Messages.get('TDSContentJS.Label.StopSpeaking'), handler: stopSpeaking, isDefault: true, disabled: true }
            ];

            panel.cfg.queueProperty("buttons", buttons);

            panel.renderEvent.subscribe(function() {
                //add the help message. we would need to create an element 
                //and add both the messages to it. 
                var helpMessage = Messages.get('TestInstructions.Label.Help');
                helpMessage = helpMessage + Messages.get('TestInstructions.Label.NoTTSHelp');
                var helpMessageElement = document.createElement('span');
                helpMessageElement.innerHTML = helpMessage;
                panel.appendToFooter(helpMessageElement);
            });

            var oninited = function(thatPanel) {
                var enableTTSOnInstr = tdsHelpFunctionality.isEnabled();
                if (thatPanel.getButtons() == null) {
                    return;
                }
                for (var counter1 = 0; counter1 < thatPanel.getButtons().length; ++counter1) {
                    var button = null;
                    var label = thatPanel.getButtons()[counter1].getAttributeConfig('label').value;
                    if (label == Messages.get('TDSContentJS.Label.StartSpeaking')) {
                        button = thatPanel.getButtons()[counter1];
                        button.addClass('ttsHelpSpeakButtonClass');
                    } else if (label == Messages.get('TDSContentJS.Label.StopSpeaking')) {
                        button = thatPanel.getButtons()[counter1];
                        button.addClass('ttsHelpStopSpeakButtonClass');
                    }

                    if (button != null) {
                        button.setAttributeConfig('disabled', enableTTSOnInstr);
                        if (!enableTTSOnInstr) {
                            button.addClass('disabled');
                        } else {
                            button.removeClass('disabled');
                        }
                    }
                }

                //set which message is to be displayed.
                if (enableTTSOnInstr) {
                    YAHOO.util.Dom.addClass(panel.footer, 'hasTTS');
                    YAHOO.util.Dom.removeClass(panel.footer, 'noTTS');
                } else {
                    YAHOO.util.Dom.addClass(panel.footer, 'noTTS');
                    YAHOO.util.Dom.removeClass(panel.footer, 'hasTTS');
                }
            };

            // when showing help reset TTS
            panel.showEvent.subscribe(function() {
                tdsHelpFunctionality.reset(false);
                oninited(panel);
            });

            // stop TTS on panel hide. 
            panel.hideEvent.subscribe(function() {
                TTS.Manager.stop();
            });

            tdsHelpFunctionality.onReset.subscribe(function() { oninited(panel); });
            tdsHelpFunctionality.init();

            YAHOO.util.Event.onDOMReady(function() {
                TTS.getInstance();
            });
        }
    });

    return HelpGuide;

})(window.TDS);