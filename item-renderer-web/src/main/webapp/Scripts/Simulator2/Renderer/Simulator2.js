//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
/** **************************************************************************
 * @class Simulator
 * @superclass none
 * @param none
 * @return Simulator instance
 * 
 * This is the main class for the AIR Assessment Simulator.
 * It parses the xml file and creates the elements,
 * instantiates the SimulationManager
 *****************************************************************************
 */

Simulator.showAlertWarning = function (msg) {
    if (window.TDS && TDS.Dialog) {
        TDS.Dialog.showWarning(msg, function () {});
    } else {
        alert(msg);
    }
};

Simulator.showAlert = function (headline,msg) {
    if (window.TDS && TDS.Dialog) {
        TDS.Dialog.showAlert(msg, function () {});
    } else {
        alert(msg);
    }
};

Simulator.Simulator = function (container, assistiveMode, speechMode) {

    // Instance Variables
    var source = 'Simulator';  // Used for debugging
    var simID = null;
    var speechEnabled = speechMode;
    var language = 'english'; // deprecated: store language in translationDictionary
    var mode = 'operation';  // Simulator can be in 'test' or 'operation mode'
    var xmlns = '';
    var simMgr = null;
    var layout = null;
    var animationSetObj = null;
    var animationShellPath = null;
    var animationExternalScriptsPath = null;
    var animationPresent = true;
    //var simElement = container;
    var accessibilityIFActive = assistiveMode;
    var currentLanguage = null; // current language - should be set by widget

    var dataTable = null;

    var instance = this;

    var simDocument = null;

    var visible = true;

    // Instantiate required class instances
    var eventMgr = new Simulator.EventManager(this);
    var whiteboard = new Simulator.Whiteboard(this);
    var scoringTable = new Simulator.Utils.Table(true, 'ScoringTable', this);
    var persistentVariableDB = new Simulator.Utils.PersistentVariableDataBase(this);
    var utils = new Simulator.Utils.Utils(this);
    var dbg = new Simulator.Utils.Debug(this);
    var keyboardInput = new Simulator.Input.KeyboardInput(this); // create a KeyboardInput instance
    var html2jsMap = new Simulator.HTML2JSMap(this);
    var translationDictionary = (typeof Simulator.Utils.TranslationDictionary == 'function') // check if we have this available first
        ? new Simulator.Utils.TranslationDictionary(this)
        : { translate: function (tag) { return tag; } }; // if not, use dummy object to emulate an unloaded translation dictionary (fb-146865: SimTool doesn't know about TranslationDictionary2.js yet)

    // for storing pre-render queue for sliders
    var sliderPreRenderQueue = new Simulator.Utils.Queue();
    // slider index
    var sliderIndex = 1;
    var speechGrammarBldr = null;
    var speechMgr = null;

    /*
    * Instance Functions
    */

    this.getSpeechGrammarBldr = function () {
        return speechGrammarBldr;
    };

    this.getVisibility = function () {
        return visible;
    };

    this.setVisibilityAndAttachEvents = function (newValue) {
        visible = newValue;
        if (newValue) {
            //layout.recordPanelSizes();
            this.resize(this, false);
            this.bindResize(simDocument.body, this);
        }
    };

    this.getSourceName = function () {
        return source;
    };

    this.getDataTable = function () {
        return dataTable;
    };

    this.setAnimationShellPath = function (path) {
        if (!animationShellPath)
            animationShellPath = path;
    };

    this.getAnimationShellPath = function () {
        return animationShellPath;
    };

    this.setAnimationExternalScriptsPath = function (path) {
        if (!animationExternalScriptsPath)
            animationExternalScriptsPath = path;
    };

    this.getAnimationExternalScriptsPath = function () {
        return animationExternalScriptsPath;
    };

    this.getAnimationSet = function () {
        return animationSetObj;
    };

    this.getSimulationManager = function () {
        return simMgr;
    };

    this.getSimDocument = function () {
        return simDocument;
    };

    this.getLayout = function () {
        return layout;
    };

    this.getSimID = function () {
        return simID;
    };

    this.getHTML2JSMap = function () {
        return html2jsMap;
    };

    this.getParser = function () {
        return parser;
    };

    this.getWhiteboard = function () {
        return whiteboard;
    };

    this.getScoringTable = function () {
        return scoringTable;
    };

    this.getPersistentVariableDB = function () {
        return persistentVariableDB;
    };

    this.getEventManager = function () {
        return eventMgr;
    };

    this.getDebug = function () {
        return dbg;
    };

    this.getUtils = function () {
        return utils;
    };

    this.getKeyboardInput = function () {
        return keyboardInput;
    };

    this.getTranslationDictionary = function () {
        return translationDictionary;
    };

    debug('Instantiating SimulationManager');
    simMgr = new Simulator.SimulationManager(this);
    debug('Required services instantiated');

    this.getSliderPreRenderQueue = function () {
        return sliderPreRenderQueue;
    };

    this.getSliderIndex = function () {
        return sliderIndex++;
    };

    this.getSpeechEnabled = function () {
        return speechEnabled;
    };

    /*
    this.presetLanguage = function (lang) {
        presetLang = lang;
    }

    // actually sets language once XML is loaded (called internally)
    this.setCurrentLanguage = function (lang) {
        if (lang == 'ENU-Braille')
            lang = 'ENU';
        if (lang != 'ENU' && !translationDictionary.isLoaded()) {
            // SUPPRESS MISSING TRANSLATION WARNING: --SDN 2/26/2015
            // we have some faux-Spanish simulations out there which were recreated with spanish text where we'd expect english to be, so proceed in 'english' mode regardless
            //dbg.logFatalError(source, 'Error: Translations have not been loaded. Request for non-English language ("' + lang + '") cannot be supported.');
            lang = 'ENU'; // default back to english if that is all we have...
        }
        translationDictionary.setCurrentLanguage(lang);
    }
    */

    this.setCurrentLanguage = function (lang) {
        currentLanguage = lang;
    }

    this.getCurrentLanguage = function () {
        return currentLanguage;
    }

    this.getAnimationDisplayLanguage = function () {
        return this.getCurrentLanguage();
    }

    this.getLanguage = function () { // deprecated: use getCurrentLanguage, which is set by widget using accommodations
        return language;
    };

    // ALT TEXT
    this.getAltText = function () {
        if (this.getAccessibilityIFActive() == false) {
            debugf('attempted to access altText when not in accessibility mode');
            return '';
        }

        if (this._altText)
            return this._altText;
        else
            return '';
    }

    this.setAltText = function (altTextString) {
        var missingAltTextString;
        var messageLabel = 'Simulator.Animation.MissingAltText';
        if (typeof (window.Messages) == 'object' && window.Messages.has(messageLabel))
            missingAltTextString = window.Messages.get(messageLabel);
        else
            missingAltTextString = 'Animation alt text not found.';


        if (altTextString == '' || altTextString == 'null')
            this._altText = missingAltTextString;
        else
            this._altText = altTextString;

        debugf('Setting simulator alt text to "' + this._altText + '"');
    }


    this.getMode = function () {
        return mode;
    };

    this.getXmlns = function () {
        return xmlns;
    };

    this.animationIsPresent = function () {
        return animationPresent;
    };

    // start the simulator with a xml file path
    this.startSimulation = function (xmlFile) {
        var xmlDoc = loadXMLDoc(xmlFile);
        this.startSimulationXmlDom(xmlDoc);
        //debug('Sending start event');
        sendStartEvent();
    };

    // load translations from xml string
    this.loadTranslationXmlText = function (xmlText) {
        var transElem = loadXMLDocFromString(xmlText);
        this.loadTranslationXmlDom(transElem);
    };

    // start the simulator with a xml string
    this.startSimulationXmlText = function (xmlText) {
        var xmlDoc = loadXMLDocFromString(xmlText);
        this.startSimulationXmlDom(xmlDoc);
        sendStartEvent();
    };

    var onSliderContainerDone = function () {
        var sliderElement = instance.getSliderPreRenderQueue().remove();
        while (sliderElement) {
            sliderElement.postContainerRender();
            sliderElement = instance.getSliderPreRenderQueue().remove();
        }
    };

    this.loadTranslationXmlDom = function (transDom) {
        debug('Translation dictionary is loading');
        x = transDom.getElementsByTagName('translation');
        if (x.length > 0) {
            debug('Found translation section');
            // load translation dictionary - defaults to english
            translationDictionary.loadTranslations(x);
        }
    }

    // start the simulator with a xml dom
    this.startSimulationXmlDom = function (xmlDoc) {
        eventMgr.startEventProcessing();
        debug('Simulator is loading');

        if (container) {
            var className = container.getAttribute('class');
            if (className)
                className += ' simV2';
            else
                className = 'simV2';
            container.setAttribute('class', className);
        }

        var x = xmlDoc.childNodes[1];
        if (!x) x = xmlDoc.childNodes[0];
        if (!x) x = xmlDoc.getElementsByTagName('simulationItem');
        if (x) {
            recordItemAttributes(this, x);
            simDocument = container.ownerDocument;
        } else {
            dbg.logFatalError(source, 'Missing "simulationItem" element in xml input file.');
            return;
        }

        if (speechEnabled) {
            if (speechGrammarBldr === null) speechGrammarBldr = new Simulator.Speech.SpeechGrammarBuilder(this);
            speechGrammarBldr.setItemName(this.getItemName());
            speechGrammarBldr.createHeader();
        }

        x = xmlDoc.getElementsByTagName('definition');
        if (x.length > 0) {
            debug('found definition spec');
            var layOut = xmlDoc.getElementsByTagName('layout');
            if (layOut.length > 0) {
                debug('Found layout spec');
                layout = new Simulator.Display.Layout(this, container);
                layout.specifyLayout(layOut);
                layout.createPanels(layOut[0].childNodes);
            } else {
                dbg.logFatalError(source, 'Missing "layout" element in xml input file.');
                return;
            }
        } else {
            dbg.logFatalError(source, 'Missing "definition" element in xml input file.');
        }

        var x = xmlDoc.getElementsByTagName('initialization');
        if (x.length > 0) {
            debug('Found initialization section');
            recordInitializationSpecs(x);
        }

        simMgr.initManagerVariables();

        var x = xmlDoc.getElementsByTagName('state');
        if (x.length > 0) {
            debug('Found state element');
            //recordStateSpecs(x);
        }

        x = xmlDoc.getElementsByTagName('input');
        if (x.length > 0) {
            debug('Found input section');
            whiteboard.addCategory('dataInput');
            whiteboard.addCategory('evaluationInput');
            whiteboard.addCategory('animationInput');
            whiteboard.addCategory('evaluationOutput');
            whiteboard.addCategory('animationOutput');
            var sections = xmlDoc.getElementsByTagName('section');
            if (sections) {
                for (var i = 0; i < sections.length; i++) {  // do each section
                    createInputSection(this, sections[i], i); // pass in i to help generate unique id for section headers (WCAG)
                }
            } else {
                dbg.logFatalError(source, 'Missing "section" elements in xml input file.');
                return;
            }
        } else {
            dbg.logFatalError(source, 'Missing "input" element in xml input file.');
        }

        x = xmlDoc.getElementsByTagName('animation');
        if (x.length > 0) {
            animationPresent = true;
            for (var k = 0; k < x.length; k++) {
                debug('Found animation section');
                createAnimationMembers(this, x[k]);
            }

        } else animationPresent = false;

        x = xmlDoc.getElementsByTagName('display');
        if (x.length > 0) {
            for (var k = 0; k < x.length; k++) {
                debug('Found display section');
                createDisplayMembers(this, x[k]);
            }

        }

        x = xmlDoc.getElementsByTagName('evaluation');
        var parser = new SimParser.EvaluationUnit(this);
        if (x.length > 0) {
            debug('Found evaluation section');
            try {
                parser.load(xmlDoc);
            } catch (err) {
                dbg.logFatalError(source, 'Error loading evaluation element: ' + err);
                return;
            }
        }

        x = xmlDoc.getElementsByTagName('control');
        if (x.length > 0) {
            debug('Found control section');
            /*            for ( var k = 0; k < x.length; k++) {
            createControlMembers(this, x[k]);
            }
            */
        }

        onSliderContainerDone();

        if (speechEnabled) {
            speechGrammarBldr.finishItemSpeechGrammar();
            if (speechMgr === null) speechMgr = new Simulator.Speech.SpeechManager(this);
        }

        simMgr.setStateFromName('Loaded');

        if (!animationPresent) eventMgr.postEvent(new Simulator.Event(this, 'info', 'allMediaLoaded'));   // EARLY TESTING ONLY!!

    };

    this.bindResize = function (dom, scope) {
        //debug(source, 'bindResize method called');
        if (dom) {
            var f = function () { scope.resize(scope, false); };
            dom.onresize = f;
        } else {
            dbg.logError(source, 'Failed to bind a resize event.');
        }
    };

    this.resize = function (scope, zoom) {
        scope = scope || this;
        //debug(source, 'Resize event fired for simID=' + scope.getSimID());
        //        var width = layout.getContainerWidth();
        //        var height = layout.getContainerHeight();
        //        if (!width || !height) {
        //            debug('We still don\'t have a width or height. Calling "checkReady" again.');
        //            setTimeout(function () { scope.resize(scope); }, 100);
        //            return;
        //        }

        if (scope.getVisibility())
            layout.resizeAllPanels(zoom);
    };

    // get the document the simulation manager exists in
    this.getDoc = function () { return simDocument; };

    // get the window the simulation manager exists in
    this.getWin = function () { return window; };

    // This is the main function to call for external users to
    // render the item and response xml into the simulator.
    // Translation xml is passed in separately.
    this.loadXml = function (itemXml, responseXml) {

        // load item xml
        if (typeof itemXml === 'string') {
            this.loadTranslationXmlText(itemXml);
            this.startSimulationXmlText(itemXml);
        } else {
            this.loadTranslationXmlDom(itemXml);
            this.startSimulationXmlDom(itemXml);
            sendStartEvent();
        }

        // load response xml
        if (responseXml != null && responseXml.length > 0) {
            this.loadResponseXml(responseXml);
        }
    };

    // get the response table and state
    this.getResponseXml = function () {
        var stateMgr = new Simulator.ResponseStateManager(this);
        simMgr.setResponseStateVariables(stateMgr);
        return stateMgr.saveState();
    };

    // loads the response and state information
    this.loadResponseXml = function (xmlText) {
        var responseMgr = new Simulator.ResponseStateManager(this);
        simMgr.clearSimulationState();
        var xmlDoc = loadXMLDocFromString(xmlText);
        responseMgr.restoreSimulation(xmlDoc);
        simMgr.displaySimulatorState();
    };

    // check if the response is considered valid
    this.isValid = function () {
        return scoringTable.outputEntered();
    };

    // check if an animation is playing
    this.isPlaying = function () {
        return simMgr.isPlaying();
    };

    this.setReadOnlyState = function (readOnlyState) {
        simMgr.setReadOnlyState(readOnlyState);
    };

    this.getAccessibilityIFActive = function () {
        return accessibilityIFActive;
    };

    // this function is called when zooming is performed externally
    this.zoom = function (factor) {
        // set zoom scale var
        this.zoomFactor = factor;
        this.resize(this, true);
    };

    // this function is called when someone views a page with the simulator
    this.show = function () {

    };

    // this function is called when someone leaves a page with the simulator
    this.hide = function () {
        // reset keyboard focus so when re-entering a sim page things like fb-97025 (open dropdown) don't happen
        keyboardInput.resetKeyboardFocusState();
    };

    // this function is called when someone enters the simulator frame
    this.focus = function () {
        // we no longer use keyboard shortcuts for streamlined/accessibility mode (WCAG)
        if (!this.getAccessibilityIFActive())
            // enable shortcut keys for a simulation item while it is on focus
            keyboardInput.initializeKeyboardShortcuts();
    };

    // this function is called when someone leaves the simulator frame
    this.blur = function () {
        // disable shortcut keys for a simulation item after it loses focus
        keyboardInput.removeKeyboardShortcuts();
    };

    // subscribe to a sim event
    // example input: 'info', 'simulatorStateChange', function() {}
    // callback obj: { context: 'simulatorStateChange', data: 'Instantiated', src: event }
    this.subscribe = function (type, context, callback) {
        // create event source
        var stateCallback =
        {
            handleEvent: callback
        };

        //create event obj
        var event = new Simulator.Event(stateCallback, type, context);
        // register
        eventMgr.registerEvent(event);
        return event;
    };

    // unsubscribe to a sim event
    this.unsubscribe = function (event) {
        eventMgr.deRegisterEvent(event);
    };

    this.inspect = function (embedded, forced) {
        var buff = [];
        buff.push('Inspecting ' + source);
        buff.push('simID = ' + simID);
        buff.push('End inspecting ' + source);
        if (embedded) return buff.join('\n');
        else forced ? debugf(buff.join('\n')) : debug(buff.join('\n'));
    };

    this.isLoaded = function () {
        return simMgr.isLoaded();
    };

    dbg.setDebug(true);
    dbg.setErrorReportLevel('SimWarning');
    simID = simIDgenerate();

    debug('accessibilityIFActive = ' + accessibilityIFActive);

    /*
    * Private Functions
    */

    // Instantiates the SimulatorManager
    function startSimulator() {
        simMgr.setStateFromName('Loaded');
    }

    function recordItemAttributes(sim, node) {
        var attrArray = utils.getAttributes(node);
        for (var attr in attrArray) {
            switch (attr) {
                case 'speechEnabled': speechEnabled = attrArray[attr] === 'yes' ? true : false;
                    break;
                case 'language': language = attrArray[attr];
                    break;
                case 'mode': mode = attrArray[attr];
                    break;
                case 'itemName': itemName = attrArray[attr];
                    break;
                case 'xmlns': xmlns = attrArray[attr];
                    break;
                default: dbg.logWarning(source, 'Unrecognized Simulator attribute ' + attr + ' with value ' + attrArray[attr]);
                    break;
            }
            //debug('Set attrinute ' + attr);
        }
        debug('Completed recording item attributes');
    }

    // Retrieve the xml file with the specified name 
    function loadXMLDoc(fileName) {
        var xhttp = null;
        if (window.XMLHttpRequest) {
            xhttp = new XMLHttpRequest();
        } else {
            xhttp = new ActiveXObject('Microsoft.XMLHTTP');
        }
        xhttp.open('GET', fileName, false);
        xhttp.send();
        return xhttp.responseXML;
    }

    // Parse the sml in xmlStr
    function loadXMLDocFromString(xmlStr) {
        var xmlDoc = null;
        if (window.DOMParser) {
            var domParser = new DOMParser();
            xmlDoc = domParser.parseFromString(xmlStr, 'application/xml');
        } else // Internet Explorer
        {
            xmlDoc = new ActiveXObject('Microsoft.XMLDOM');
            xmlDoc.async = 'false';
            xmlDoc.loadXML(xmlStr);
        }
        return xmlDoc;
    }

    // Record the values of the variables in the initialization section of the item xml file
    function recordInitializationSpecs(initNode) {
        var varName = null;
        var value = null;
        //var spec = null;
        var isIE = utils.isInternetExplorer();
        if (initNode.length > 0) {
            var children = initNode[0].childNodes;
            whiteboard.addCategory('initialization');
            for (var i = 0; i < children.length; i++) {
                //spec = children[i];
                if (children[i].nodeName[0] !== '#') {
                    varName = children[i].attributes[0].nodeValue;
                    value = children[i].attributes[1].nodeValue;
                    debug('Found initialization variable ' + varName + ' with value = ' + value);
                    if ((isIE && (children[i].attributes).getNamedItem('persistent') != undefined)
                            || 'persistent' in children[i].attributes)
                        persistentVariableDB.updateElement(varName, value);
                    else {
                        key = whiteboard.addItem('initialization', varName);
                        whiteboard.setItem('initialization', varName, value, key);
                    }
                }
            }
            debug('Completed recording initialization specs');
        }
    }

    // Create all of the input panel elements from the xml fie
    function createInputSection(sim, section, count) {
        var panel = layout.getPanelInstance(Simulator.Constants.INPUT_PANEL_NAME);
        var attr = utils.getAttributes(section);
        var aSection = new Simulator.Input.Section(sim, panel, count);
        aSection.setAttributes(attr);
        aSection.render();
        var sectionElements = section.childNodes;
        var theElement;
        var elementorientation = aSection.getSectionSettings().elementorientation;
        var numberofcolumns = aSection.getSectionSettings().numberofcolumns;
        var container;
        if (elementorientation === "vertical") {
            var tableRow = aSection.getSimDocument().createElement("div");
            tableRow.className = "inputpanelrow";
            panel.getHTMLElement().appendChild(tableRow);
            container = tableRow;
        }
        for (var i = 0; i < sectionElements.length; i++) {
            if (elementorientation === "horizontal") {
                if (i % numberofcolumns == 0) {
                    var tableRow = aSection.getSimDocument().createElement("div");
                    tableRow.className = "inputpanelrow";
                    panel.getHTMLElement().appendChild(tableRow);
                }
                container = tableRow;
            }
            switch (sectionElements[i].nodeName) {
                case 'inputElement':
                    var iElements = sectionElements[i].childNodes;
                    for (var j = 0; j < iElements.length; j++) {
                        var my = {};
                        switch (iElements[j].nodeName) {
                            case 'dropList':
                                theElement = new Simulator.Input.DropList(sim, iElements[j], panel, aSection, container);
                                break;
                            case 'optionList':
                                theElement = new Simulator.Input.OptionList(sim, iElements[j], panel, aSection, container);
                                break;
                            case 'choiceList':
                                theElement = new Simulator.Input.ChoiceList(sim, iElements[j], panel, aSection, container);
                                break;
                            case 'upDownCounter':
                                if (sim.getAccessibilityIFActive()) { // if in streamlined/accessibility mode, convert counters to droplists
                                    my.accessibleNode = convertUpDownCounterToDropDown(iElements[j]);
                                    theElement = new Simulator.Input.DropList(sim, my.accessibleNode, panel, aSection, container);
                                } else
                                    theElement = new Simulator.Input.UpDownCounter(sim, iElements[j], panel, aSection, container);
                                break;
                            case 'slider':
                                theElement = new Simulator.Input.SimSlider(sim, iElements[j], panel, aSection, container);
                                break;
                            case 'textField':
                                theElement = new Simulator.Input.TextField(sim, iElements[j], panel, aSection, container);
                                break;
                            default:
                                continue;  // Immediately start next for loop iteration
                        }
                        if (my.accessibleNode != undefined) {
                            var attr = utils.getAttributes(my.accessibleNode);
                            theElement.setAttributes(attr, my.accessibleNode);
                            setEvents(theElement, my.accessibleNode);
                            delete my.accessibleNode;
                        } else {
                            var attr = utils.getAttributes(iElements[j]);
                            theElement.setAttributes(attr, iElements[j]);
                            setEvents(theElement, iElements[j]);
                        }
                        theElement.render();
                        break;
                    }
                    break;
                case 'commandElement':
                    var cElements = sectionElements[i].childNodes;
                    for (var c = 0; c < cElements.length; c++) {
                        switch (cElements[c].nodeName) {
                            case 'button':
                                theElement = new Simulator.Control.Button(sim, panel, aSection, container);
                                break;
                            default:
                                continue;
                        }
                        theElement.setAttributes(cElements[c].attributes, cElements[c]);
                        setEvents(theElement, cElements[c]);
                        theElement.render(panel.getNodeID());
                        break;
                    }
                    break;
                case 'staticElement':
                    var sElements = sectionElements[i].childNodes;
                    for (var s = 0; s < sElements.length; s++) {
                        switch (sElements[s].nodeName) {
                            case 'imageElement':
                                theElement = new Simulator.Input.ImageElement(sim, panel, aSection, container);
                                break;
                            case 'horizontalLine':
                                theElement = new Simulator.Input.HorizontalLine(sim, panel, aSection, container);
                                break;
                            case 'sectionDivider':
                                theElement = new Simulator.Input.SectionDivider(sim, panel, aSection, container);
                                break;
                            case 'verticalSpace':
                                theElement = new Simulator.Input.VerticalSpace(sim, panel, aSection, container);
                                break;
                            case 'textConstant':
                                theElement = new Simulator.Input.TextConstant(sim, panel, aSection, container);
                                break;
                            default:
                                continue;
                        }
                        theElement.setAttributes(sElements[s].attributes, sElements[s]);
                        theElement.render(Simulator.Constants.INPUT_PANEL_NAME);
                        break;
                    }
                    break;
            }
        }
    }

    // in streamlined/accessible mode, UpDownCounters get rendered as DropDowns
    // this converts the counter XML to the corresponding dropdown XML
    function convertUpDownCounterToDropDown(upDownNode) {
        /*var dropElementNode = document.createElement('dropList');
        dropElementNode.setAttribute('eName', 'dropList');
        dropElementNode.setAttribute('type', 'dropList');
        */

        function gatherPropertyString(obj) {
            var stringVector = [];
            for (var prop in obj) {
                if (obj[prop] != null)
                    stringVector.push(prop + '="' + obj[prop] + '"');
            }
            return stringVector.join(' ');
        }

        var my = {};
        my.xml = [];
        my.dropElement = {};
        my.dropElement.eName = 'dropList';
        my.dropElement.name = upDownNode.getAttribute('name');
        my.dropElement.type = 'dropList';
        my.dropElement.inputScope = upDownNode.getAttribute('inputScope');
        my.dropElement.label = upDownNode.getAttribute('label');
        my.dropElement.note = upDownNode.getAttribute('note');
        my.dropElement.image = upDownNode.getAttribute('image');

        my.xml.push('<dropList ' + gatherPropertyString(my.dropElement) + '>');

        my.calc = {};
        my.calc.defaultValue = parseFloat(upDownNode.getAttribute('defaultValue'));
        my.calc.minValue = parseFloat(upDownNode.getAttribute('minValue'));
        my.calc.maxValue = parseFloat(upDownNode.getAttribute('maxValue'));
        my.calc.increment = parseFloat(upDownNode.getAttribute('increment'));
        my.calc.units = upDownNode.getAttribute('units'); // *****will need to be internationalized!*****: if (my.units != null) my.units = getTranslationDictionary().translate(my.units);
        

        my.calc.values = []; // collect all possible values
        var currentValue = my.calc.defaultValue;
        while (currentValue >= my.calc.minValue) { // default and below
            my.calc.values.push(currentValue);
            currentValue -= my.calc.increment;
        }
        currentValue = my.calc.defaultValue + my.calc.increment;
        while (currentValue <= my.calc.maxValue) { // above default
            my.calc.values.push(currentValue);
            currentValue += my.calc.increment;
        }
        my.calc.values.sort(function (a, b) { return a - b }); // sort numerically, ascending


        my.items = [];
        for (var i = 0; i < my.calc.values.length; i++)
            my.items.push(
                {
                    'val': ((my.calc.units == null) ? my.calc.values[i] : (my.calc.values[i] + ' ' + my.calc.units)),
                    'dataProxy': my.calc.values[i],
                    'evaluationProxy': my.calc.values[i],
                    'animationProxy': my.calc.values[i],
                    'default': ((my.calc.values[i] == my.calc.defaultValue) ? 'yes' : null)
                });
        for (var j = 0; j < my.items.length; j++)
            my.xml.push('<item ' + gatherPropertyString(my.items[j]) + ' />');

        my.eventNodes = upDownNode.getElementsByTagName('event');
        for (var j = 0; j < my.eventNodes.length; j++) {
            my.xml.push(my.eventNodes[j].outerHTML); // copy over any event nodes
        }

        my.xml.push('</dropList>');

        var xmlString = my.xml.join('\n').replace("&", "&amp;");
        var xmlDoc = loadXMLDocFromString(xmlString);

        return xmlDoc.getElementsByTagName('dropList')[0];
    }

    // Create all of the animation elements from the xml file
    function createAnimationMembers(sim, animationNode) {
        var attr;
        var theElement;
        var animationSet = null;
        var panel = layout.getPanelInstance(Simulator.Constants.ANIMATION_PANEL_NAME);
        panel.setLiveAttribute('polite'); // set live to polite to allow notificaiton (WCAG)
        panel.recordOriginalWidthAndHeight();
        for (var i = 0; i < animationNode.childNodes.length; i++) {
            if (animationNode.childNodes[i].nodeName[0] != '#') {
                animationSet = animationNode.childNodes[i];
                break;
            }
        }
        if (!animationSet) {
            dbg().logError(source, 'Could not initialize animationSet.');
            return;
        }
        var theSet = new Simulator.Animation.AnimationSet(sim, panel);
        animationSetObj = theSet;
        theSet.setAttributes(animationSet.attributes, animationSet);
        setEvents(theSet, animationSet);
        var animationSetElements = animationSet.childNodes;
        for (var j = 0; j < animationSetElements.length; j++) {
            switch (animationSetElements[j].nodeName) {
                case 'animationThread':
                    var animationThread = animationSetElements[j];
                    theElement = new Simulator.Animation.AnimationThread(sim, panel, null, theSet);  // section is null
                    attr = animationThread.attributes;
                    theElement.setAttributes(attr, animationThread);
                    var threadElements = animationThread.childNodes;
                    for (var k = 0; k < threadElements.length; k++) {
                        if (threadElements[k].nodeName === 'animationThreadElement') {
                            var aThreadElement = new Simulator.Animation.AnimationThreadElement(sim, theElement);
                            aThreadElement.setAttributes(threadElements[k].attributes, threadElements[k]);
                            theElement.addAnimationThreadElement(aThreadElement);
                        }
                    }
                    setEvents(theElement, animationThread);
                    break;
                case 'animationElement':
                    theElement = new Simulator.Animation.AnimationElement(sim, theSet, panel);
                    attr = animationSetElements[j].attributes;
                    theElement.setAttributes(attr, animationSetElements[j]);
                    theSet.addAnimationElement(theElement);
                    if (theElement.getSrc() === '') {
                        var inlineElement = getElementInlineData(animationSetElements[j], sim);
                        if (inlineElement) {
                            theElement.setSrc(inlineElement.getData());
                            theElement.setInlineDataID(inlineElement.getID());
                        }
                    }
                    //theElement.inspect(null, true);
                    if ((theElement.getType() == 'html5') && (utils.canPlayHtml5())) {
                        panel.addPanelClass('withHTML5');
                    } else {
                        panel.addPanelClass('withFlash');
                    }
                    break;
                case 'poster':
                    attr = animationSetElements[j].attributes;
                    theSet.setPoster(attr);
                    break;
                case 'commandElement':
                    var cElements = animationSetElements[j].childNodes;
                    for (var c = 0; c < cElements.length; c++) {
                        switch (cElements[c].nodeName) {
                            case 'button':
                                theElement = new Simulator.Control.Button(sim, panel);
                                break;
                            default:
                                continue;
                        }
                        theElement.setAttributes(cElements[c].attributes, cElements[c]);
                        setEvents(theElement, cElements[c]);
                        theElement.render('animationPanel');
                        break;
                    }
                    break;
            }
        }
    }

    // Get the inline data element if there is one
    function getElementInlineData(node, sim) {
        var aNode = null;
        var theElement = new Simulator.Animation.InlineData(sim);
        var attr = node.attributes;
        var nodes = node.childNodes;
        var numChildren = nodes.length;
        for (var i = 0; i < numChildren; i++) {
            aNode = nodes[i];
            if (aNode.nodeName === 'inlineData') {
                theElement.setAttributes(attr, aNode);
                //aNode = aNode.childNodes[0];
                var data = aNode.textContent;
                theElement.setData(data);
                return theElement;
            }
        }
        dbg.logError(source, 'Missing CDATA section for inlineData element');
        return '';
    }

    // Create all data display elements from the xml file
    function createDisplayMembers(sim, displayNode) {
        var theElement = null;
        //var displayElements = displayNode.childNodes;
        var panel = layout.getPanelInstance(Simulator.Constants.DATA_DISPLAY_PANEL_NAME);
        panel.setLiveAttribute('polite'); // set live to polite to allow notificaiton (WCAG)

        var displayElementsOriginal = displayNode.childNodes;
        var displayElements = [];
        if (sim.getAccessibilityIFActive()) { // if in streamlined/accessible mode: force ClearAllRows button below the data table (WCAG)
            var clearAllRowsButtons = [];
            var otherElements = [];
            for (var j = 0; j < displayElementsOriginal.length; j++) {
                if (displayElementsOriginal[j].nodeName == 'commandElement' && displayElementsOriginal[j].getElementsByTagName('button')[0].getAttribute('handler') == 'ResetTrials')
                    clearAllRowsButtons.push(displayElementsOriginal[j]); // gather any ClearAllRows buttons
                else
                    otherElements.push(displayElementsOriginal[j]); // gather all other elements
            }
            for (var j = 0; j < otherElements.length; j++) {
                displayElements.push(otherElements[j]);
                if (otherElements[j].nodeName == 'displayElement') { // once we find the table...
                    displayElements = displayElements.concat(clearAllRowsButtons); // place ClearAllRows buttons immediately after
                    clearAllRowsButtons = [];
                }
            }
        } else { // otherwise, use specified ordering
            for (var j = 0; j < displayElementsOriginal.length; j++) {
                displayElements.push(displayElementsOriginal[j]);
            }
        }
        var clearAllRowsButton;
        for (var i = 0; i < displayElements.length; i++) {
            switch (displayElements[i].nodeName) {
                case 'displayElement':
                    var dElements = displayElements[i].childNodes;
                    for (var j = 0; j < dElements.length; j++) {
                        switch (dElements[j].nodeName) {
                            case 'table':
                                theElement = new Simulator.Display.DataTable(sim, panel);
                                dataTable = theElement;
                                //dataDB = theElement;  Is this needed?
                                simMgr.setTableExists(true);
                                break;
                            case 'graph':
                                // theElement = new Simulator.Display.Graph(this, panel);
                                break;
                            default:
                                continue;
                        }
                        theElement.setAttributes(dElements[j].attributes, dElements[j]);
                        setEvents(theElement, dElements[j]);
                        theElement.render('dataOutputPanel');
                    }
                    break;
                case 'commandElement':
                    var cElements = displayElements[i].childNodes;
                    for (var c = 0; c < cElements.length; c++) {
                        switch (cElements[c].nodeName) {
                            case 'button':
                                theElement = new Simulator.Control.Button(sim, panel);
                                //.childNodes[0].getAttribute('handler') == 'ResetTrials'
                                break;
                            default:
                                continue;
                        }
                        theElement.setAttributes(cElements[c].attributes, cElements[c]);
                        setEvents(theElement, cElements[c]);
                        theElement.render('dataOutputPanel');
                        if (sim.getAccessibilityIFActive()
                            && theElement.getHandler() == 'ResetTrials'
                            && clearAllRowsButton == undefined) {
                            clearAllRowsButton = simDocument.getElementById(theElement.getNodeID());
                        }
                        break;
                    }
                    break;
            }
        }

        /*
        fb-153487: remove clear all rows aria-labelledBy attribute, per Deque
        if (clearAllRowsButton != undefined) // WCAG - label the clear all rows button with table caption
            clearAllRowsButton.setAttribute('aria-labelledby', dataTable.getCaptionID());
        */
    }

    // Create all the control elements (ex, buttons) from the xml file
    function createControlMembers(sim, controlNode) {
        var theElement = null;
        var controlElements = controlNode.childNodes;
        var panel = layout.getPanelInstance(Simulator.Constants.CONTROL_PANEL_NAME);
        for (var i = 0; i < controlElements.length; i++) {
            switch (controlElements[i].nodeName) {
                case 'commandElement':
                    var cElements = controlElements[i].childNodes;
                    for (var c = 0; c < cElements.length; c++) {
                        switch (cElements[c].nodeName) {
                            case 'button':
                                theElement = new Simulator.Control.Button(sim, panel);
                                break;
                            default:
                                continue;
                        }
                        theElement.setAttributes(cElements[c].attributes, cElements[c]);
                        setEvents(theElement, cElements[c]);
                        theElement.render('controlPanel');
                        break;
                    }
                    break;
            }
        }
    }

    // Create all events asociated with the element
    function setEvents(element, node) {
        var events = [];
        var attributes;
        var children = node.childNodes;
        if (children != null && children != undefined) {
            for (var j = 0; j < children.length; j++) {
                var id = children[j].nodeName;
                if (id === 'event') {
                    attributes = children[j].attributes;
                    var eventInfo = createEvent(element, attributes);
                    element.addEvent(eventInfo['theEvent'], eventInfo['direction']);
                }
            }
        }
        return events;
    }

    // Create an event object from the provided attributes and return it nd its direction
    function createEvent(obj, attributes) {
        var response = [];
        var data = '';
        var ctx = '';
        var dir = '';
        var type = '';
        var postOnChange = 'no';
        var completeWithoutOutput = false;
        for (var k = 0; k < attributes.length; k++) {
            switch (attributes[k].nodeName) {
                case 'direction':
                    dir = attributes[k].nodeValue;
                    break;
                case 'data':
                    data = attributes[k].nodeValue;
                    break;
                case 'context':
                    ctx = attributes[k].nodeValue;
                    break;
                case 'type':
                    type = attributes[k].nodeValue;
                    break;
                case 'postOnChange':
                    postOnChange = attributes[k].nodeValue;
                    break;
                case 'completeWithoutOutput':
                    completeWithoutOutput = attributes[k].nodeValue === 'yes' ? true : false;
                    break;
            }
        }
        response['theEvent'] = new Simulator.Event(obj, type, ctx, data, postOnChange, completeWithoutOutput); response['direction'] = dir;
        return response;
    }

    // Post the load event to all elements
    function sendStartEvent() {
        eventMgr.postEvent(new Simulator.Event(simMgr, 'command', 'load'));
    }

    // Generate a test globally unique id
    function simIDgenerate() {
        var id = new Date().getTime();  // milliseconds since 1970
        debug('simID generated: ' + id);
        return id;
    }


    // Convenience function for the most frequently used Debug methods
    function debug(str1, str2, trace) {
        dbg.debug(source, str1, str2, trace);
    }

    function debugf(str1, str2, trace) {
        dbg.debugf(source, str1, str2, trace);
    }
};
