/** **************************************************************************
* @class Button
* @superclass CommandElement
* @param sim
* @param panel
* @param section
* @return Button instance
* Concrete class used for rendering buttons.
*****************************************************************************
*/
Simulator.Control.Button = function (sim, panel, section, container) {

    Simulator.Control.CommandElement.call(this, sim);


    //private variables used across all methods expect button event handlers
    var source = 'Button';
    var instance = this;
    var HTMLButton = null;
    var src = '';
    var implication = 'neutral';
    var borderColor = '';
    var eventsRegistered = false;

    //private variables used across button event handlers
    var debouceInterval = 1000;  // ms
    var lastStartTrialTime = 0;
    var genericButtonReady = true;  // indicates whether a generic button is ready to accept clicks
    var startTrialButtonReady = true;  // indicates whether the 'start trial' button is ready to accept clicks
    var startAnimationButtonReady = true;  // indicates whether the 'start animation' button is ready to accept clicks
    var resetTrialsButtonReady = true;  // indicates whether the 'reset trials' button is ready to accept clicks
    var newTrialButtonReady = true;  // indicates whether the 'new trial' button is ready to accept clicks
    var submitInputButtonReady = true;  // indicates whether the 'submit input' button is ready to accept clicks
    var submitItemButtonReady = true;  // indicates whether the 'submit item' button is ready to accept clicks
    var requestAnimationOutputButtonReady = true;  // indicates whether the 'request animation output' button is ready to accept clicks
    var showDialogButtonReady = true;  // indicates whether the show dialog button is ready to accept clicks
    var showAlertButtonReady = true;  // indicates whether the show alert button is ready to accept clicks


    //private functions - start here
    var util = function () { return sim.getUtils(); };

    var simMgr = function () { return sim.getSimulationManager(); };

    var eventMgr = function () { return sim.getEventManager(); };

    var dbg = function () { return sim.getDebug(); };

    var speechGrammarBldr = function () { return sim.getSpeechGrammarBldr(); };

    var scoringTable = function () { return sim.getScoringTable(); };

    var html2jsMap = function () { return sim.getHTML2JSMap(); };

    var simDocument = function () { return sim.getSimDocument(); };

    var transDictionary = function () { return sim.getTranslationDictionary(); }

    var keyboardInput = function () { return sim.getKeyboardInput(); };

    var whiteboard = function () { return sim.getWhiteboard(); };

    var registerClassEvents = function (instance) {
        if (!eventsRegistered) {
            eventMgr().registerEvent(new Simulator.Event(instance, 'info', 'animationFinished'));
            eventMgr().registerEvent(new Simulator.Event(instance, 'info', 'animationThreadFinished'));
            eventsRegistered = true;
        }
    };

    // function to reset the button to ready state (ready to accept clicks)
    function resetButton(buttonName) {
        switch (buttonName) {
            case 'generic':
                genericButtonReady = true;
                break;
            case 'startTrial':
                startTrialButtonReady = true;
                break;
            case 'startAnimation':
                startAnimationButtonReady = true;
                break;
            case 'resetTrials':
                resetTrialsButtonReady = true;
                break;
            case 'newTrial':
                newTrialButtonReady = true;
                break;
            case 'submitInput':
                submitInputButtonReady = true;
                break;
            case 'submitItem':
                submitItemButtonReady = true;
                break;
            case 'requestAnimationOutput':
                requestAnimationOutputButtonReady = true;
                break;
            case 'showDialog':
                showDialogButtonReady = true;
                break;
            case 'showAlert':
                showAlertButtonReady = true;
                break;
            case 'speechLabel':
                this.setSpeechLabel(attr[i]);
                break;
            default:
                break;
        }
    };

    function publishEvents(jsButton, context) {
        var anEvent = jsButton.nextEvent(true);
        if (!context) context = '*';
        while (anEvent != null) {
            if (anEvent.context == context || anEvent.context == '*' || context == '*') {
                eventMgr().postEvent(anEvent);
            }
            anEvent = jsButton.nextEvent();
        }
    };
    //private functions - end here

    //function calls in the constructor -- starts here
    this.setEname(source);

    //delay panel setting until this class is instantiated with not null 'panel' parameter
    if (panel) {
        this.setPanel(panel);
    }
    //function calls in the constructor -- end here


    //public functions -- start here 
    this.setHTMLButton = function () {
        return HTMLButton;
    };

    this.setHTMLButton = function (newHTMLButton) {
        HTMLButton = newHTMLButton;
        return this;
    };

    this.getSrc = function () {
        return src;
    };

    this.setSrc = function (newSrc) {
        src = newSrc;
        return this;
    };

    this.getImplication = function () {
        return implication;
    };

    this.setImplication = function (newImplication) {
        implication = newImplication;
        return this;
    };

    this.recordKeyboardSelection = function (elementID, itemID) {
        if (itemID) {
            var handler = this.getHandler();
            handler(elementID);
        }
    };

    this.receivedSpeechFocus = function () {
        debug(this.getName() + ' received speech focus');
        var node = simDocument().getElementById('buttonDiv' + this.getNodeID());
        borderColor = node.style.border.color;
        node.style.border = '#ff0000';
    };

    this.removeSpeechFocus = function (value) {
        debug(this.getName() + ' lost speech focus');
        var node = simDocument().getElementById('buttonDiv' + this.getNodeID());
        node.style.border.color = borderColor;
    };

    this.speechActivated = function (value) {
        var handler = 'Button.' + this.getHandler();
        eval(handler)(this.getNodeID());
    };

    this.handleEvent = function (event) {
        var newEvent = undefined;
        switch (event.type) {
            case 'command':
                break;
            case 'info':
                switch (event.context) {
                    case 'animationThreadFinished':
                        resetButton('startTrial');
                        break;
                    case 'animationFinished':
                        resetButton('startTrial');
                        break;
                }
                break;
            default:
                dbg().logWarning(this.getName() + ': Unhandled event type received: ' + event.toString());
                return;
        }
        if (newEvent != undefined && newEvent != null) newEvent.postEvent();
    };

    this.disableInput = function () {
        var element = simDocument().getElementById(this.getNodeID());
        element.disable = true;
        this.setState('disabled');
        //if(!this.getAlwaysEnabled()) this.setState('disabled');
    };

    this.enableInput = function () {
        var element = simDocument().getElementById(this.getNodeID());
        element.disable = false;
        this.setState('enabled');
    };

    this.getSourceName = function () {
        return source;
    };

    this.inspect = function (embedded, force) {
        var buff = [];
        var sep = '\n';
        buff.push('Inspecting ' + source + ' ' + this.getName() + sep);
        var str = Simulator.Control.Button.prototype.inspect.call(this, true, force);
        if (str) buff.push(str);
        else {
            for (var i in this) {
                if (i.substr(0, 3) == 'get') {
                    buff.push(i.charAt(3).toLowerCase() + i.slice(4));
                    buff.push(' = ');
                    buff.push(eval('this.' + i + '()'));
                    buff.push(sep);
                }
            }
        }
        buff.push('End inspecting ' + source + ' ' + this.getName() + sep + sep);
        if (!embedded) force == true ? debugf(buff.join('')) : debug(buff.join(''));
        else return buff.join('');
    };
    //public functions -- end here 


    function onClick(id) {
        var newTime = new Date();
        var theButton = simDocument().getElementById(id);
        if (theButton) {
            var jsButton = html2jsMap().getJSFromHTML(theButton);
            if (jsButton.getState() == 'enabled') {
                if ((genericButtonReady == true) && (!simMgr().isPlaying())) {
                    if ((newTime - lastStartTrialTime) > debouceInterval) {
                        lastStartTrialTime = newTime;
                        genericButtonReady = false;
                        setTimeout(function () { resetButton("generic"); }, debouceInterval);
                        if (jsButton.isDisabled()) {
                            (simMgr().GetDisabledAction())();
                        }
                        else {
                            publishEvents(jsButton);
                        }
                    }
                }
            }
            else {
                dbg().logWarning(source, '-- Button with id = ' + id + ' could not be activated --');
            }
        }
        else {
            dbg().logFatalError(source, 'Could not get Button instance with id = ' + id);
        }
    };

    function StartTrial(id) {
        if (!simMgr().verifyCheckListSelection()) {
            var newTime = new Date();
            var debounceMultiplier = (sim.animationIsPresent()) ? 4 : .5;
            var theButton = simDocument().getElementById(id);
            if (theButton) {
                var jsButton = html2jsMap().getJSFromHTML(theButton);
                if (jsButton.getState() == 'enabled') {
                    if ((startTrialButtonReady == true) && (!simMgr().isPlaying()) && !simMgr().isReadOnly()) {
                        // if((newTime - lastStartTrialTime) > (debouceInterval * 2)) {
                        lastStartTrialTime = newTime;
                        startTrialButtonReady = false;
                        whiteboard().clearCategory('evaluationOutput');
                        whiteboard().clearCategory('animationOutput');
                        setTimeout(function () { resetButton("startTrial"); }, debouceInterval * debounceMultiplier);
                        publishEvents(jsButton, 'startTrial');
                        // }
                    }
                }
            } else {
                dbg().logFatalError(source, 'Could not get Button instance with id = ' + id);
            }
        }
    };

    function StartAnimation(id) {
        if (!simMgr().verifyCheckListSelection()) {
            var newTime = new Date();
            var theButton = simDocument().getElementById(id);
            if (theButton) {
                var jsButton = html2jsMap().getJSFromHTML(theButton);
                if (jsButton.getState() == 'enabled') {
                    if ((startAnimationButtonReady == true) && (!simMgr().isPlaying()) && !simMgr().isReadOnly()) {
                        lastStartTrialTime = newTime;
                        startAnimationButtonReady = false;
                        whiteboard().clearCategory('evaluationOutput');
                        whiteboard().clearCategory('animationOutput');
                        setTimeout(function () { resetButton("startAnimation"); }, debouceInterval * 4);
                        publishEvents(jsButton, 'startAnimation');
                    }
                }
            } else {
                dbg().logFatalError(source, 'Could not get Button instance with id = ' + id);
            }
        }
    };

    function NewTrial(id) {
        if (!simMgr().verifyCheckListSelection()) {
            var newTime = new Date();
            var theButton = simDocument().getElementById(id);
            if (theButton) {
                var jsButton = html2jsMap().getJSFromHTML(theButton);
                if (jsButton.getState() == 'enabled') {
                    if ((newTrialButtonReady == true) && (!simMgr().isPlaying())) {
                        if ((newTime - lastStartTrialTime) > debouceInterval) {
                            lastStartTrialTime = newTime;
                            newTrialButtonReady = false;
                            setTimeout(function () { resetButton("newTrial"); }, debouceInterval);
                            if (jsButton.isDisabled()) {
                                (simMgr().GetDisabledAction())();
                            }
                            else {
                                simMgr().NexTrial();
                            }
                        }
                    }
                }
            }
        }
    };

    function SubmitInput(id) {
        var newTime = new Date();
        var theButton = simDocument().getElementById(id);
        if (theButton) {
            var jsButton = html2jsMap().getJSFromHTML(theButton);
            if (jsButton.getState() == 'enabled') {
                if ((submitInputButtonReady == true) && (!simMgr().isPlaying())) {
                    if ((newTime - lastStartTrialTime) > debouceInterval) {
                        lastStartTrialTime = newTime;
                        submitInputButtonReady = false;
                        setTimeout(function () { resetButton("submitInput"); }, debouceInterval);
                        if (jsButton.isDisabled()) {
                            (simMgr().GetDisabledAction())();
                        }
                        else {
                            publishEvents(jsButton, 'submitInput');
                        }
                    }
                }
            }
        }
    };

    function SubmitItem(id) {
        var newTime = new Date();
        var theButton = simDocument().getElementById(id);
        if (theButton) {
            var jsButton = html2jsMap().getJSFromHTML(theButton);
            if (jsButton.getState() == 'enabled') {
                if ((submitItemButtonReady == true) && (!simMgr().isPlaying())) {
                    if ((newTime - lastStartTrialTime) > debouceInterval) {
                        lastStartTrialTime = newTime;
                        submitItemButtonReady = false;
                        setTimeout(function () { resetButton("submitItem"); }, debouceInterval);
                        if (jsButton.isDisabled()) {
                            (simMgr().GetDisabledAction())();
                        }
                        else {
                            var answer = confirm('Are You Sure You Want to Submit the Item for Scoring');
                            if (answer) {
                                simMgr().ScoreItem();
                                Simulator.showAlert('Question', 'Press "Next" for Next Test Item');
                                simMgr().GetNextItem();
                            }
                        }
                    }
                }
            }
        }
    };

    function RequestAnimationOutput(id) {
        var newTime = new Date();
        var theButton = simDocument().getElementById(id);
        if (theButton) {
            var jsButton = html2jsMap().getJSFromHTML(theButton);
            if (jsButton.getState() == 'enabled') {
                if ((requestAnimationOutputButtonReady == true) && (!simMgr().isPlaying())) {
                    if ((newTime - lastStartTrialTime) > debouceInterval) {
                        lastStartTrialTime = newTime;
                        requestAnimationOutputButtonReady = false;
                        setTimeout(function () { resetButton("requestAnimationOutput"); }, debouceInterval);
                        if (jsButton.isDisabled()) {
                            (simMgr().GetDisabledAction())();
                        }
                        else {
                            eventMgr().postEvent(new Simulator.Event(jsButton, 'command', 'outputReq'));
                        }
                    }
                }
            }
        }
    };

    function ShowDialog(id, dialogID) {
        var newTime = new Date();
        var theButton = simDocument().getElementById(id);
        if (theButton) {
            var jsButton = html2jsMap().getJSFromHTML(theButton);
            if (jsButton.getState() == 'enabled') {
                if ((showDialogButtonReady == true) && (!simMgr().isPlaying())) {
                    if ((newTime - lastStartTrialTime) > debouceInterval) {
                        lastStartTrialTime = newTime;
                        showDialogButtonReady = false;
                        setTimeout(function () { resetButton("showDialog"); }, debouceInterval);
                        if (jsButton.isDisabled()) {
                            (simMgr().GetDisabledAction())();
                        }
                        else {
                            dialogID.style.display = '';
                        }
                    }
                }
            }
        }
    };

    function ShowAlert(id, parameters) {
        var transParameters = transDictionary().translate(parameters);
        var newTime = new Date();
        var theButton = simDocument().getElementById(id);
        if (theButton) {
            var jsButton = html2jsMap().getJSFromHTML(theButton);
            if (jsButton.getState() == 'enabled') {
                if ((showAlertButtonReady == true) && (!simMgr().isPlaying())) {
                    if ((newTime - lastStartTrialTime) > debouceInterval) {
                        lastStartTrialTime = newTime;
                        showAlertButtonReady = false;
                        setTimeout(function () { resetButton("showAlert"); }, debouceInterval);
                        if (jsButton.isDisabled())
                            (simMgr().GetDisabledAction())();
                        else {
                            if (transParameters) {
                                var parts = transParameters.split('|');
                                var elements = [];
                                var aParameter = null;
                                for (var i = 0; i < parts.length; i++) {
                                    aParameter = parts[i].split('*');
                                    elements[aParameter[0]] = aParameter[1];
                                }
                                if ('contents' in elements) {
                                    var msg = unescape(elements['contents']);
                                    Simulator.showAlertWarning(unescape(elements['contents']));
                                }
                            }
                        }
                    }
                }
            }
        }
    };

    function ResetTrials(id) {
        var newTime = new Date();
        var theButton = simDocument().getElementById(id);
        if (theButton) {
            var jsButton = html2jsMap().getJSFromHTML(theButton);
            if (jsButton.getState() == 'enabled' && !simMgr().isReadOnly()) {
                if ((resetTrialsButtonReady == true) && (!simMgr().isPlaying())) {
                    if ((newTime - lastStartTrialTime) > debouceInterval) {
                        lastStartTrialTime = newTime;
                        resetTrialsButtonReady = false;
                        setTimeout(function () { resetButton("resetTrials"); }, debouceInterval);
                        if (jsButton.isDisabled()) {
                            (simMgr().GetDisabledAction())();
                        }
                        else {
                            publishEvents(jsButton, 'resetTrials');
                            simMgr().setReadyState();
                            scoringTable().clearTable();
                        }
                    }
                }
            }
        }
    };

    this.setAttributes = function (attr, node) {
        if (node) attr = util().getAttributes(node);
        Simulator.Control.Button.prototype.setAttributes.call(this, attr, node);
        for (var i in attr) {
            switch (i) {
                case 'implication':
                    this.setImplication(attr[i]);
                    break;
            }
        }
    };
    this.recordKeyboardSelection = function (elementID, itemID, itemIndex) {
        var bHandler = this.getHandler();
        var bNodeID = this.getNodeID();
        var parameters = this.getHandlerParameters();
        if (parameters) parameters = ', "' + parameters + '"';
        if (!parameters)
            parameters = '';
        eval(bHandler + '("' + bNodeID + '"' + parameters + ')');
    };

    this.render = function (panelName) {
        var needTableDiv = false;
        var tableDiv = null;
        var buttonDiv = null;
        if (section) {
            var HTMLPanel = container;
        }
        else {
            var HTMLPanel = panel.getHTMLElement();
        }
        var button = null;
        var imageSpan = null;
        var imageElement = null;
        var labelSpan = null;
        var type = this.getType();
        //if (simMgr().getSpeechEnabled()) HTMLPanel.innerHTML += Simulator.Constants.SPEECH_LABEL_PREFIX + Simulator.Constants.SPEECH_CMD_ITEM_PREFIX + this.getLabel();
        var tableElement = null;
        if (HTMLPanel.id.indexOf('dataOutputPanel') != -1) {
            tableElement = util().getElementsByClassName('table_controls', HTMLPanel);
            needTableDiv = true;
        }
        if (needTableDiv) {
            tableDiv = simDocument().createElement('div');
            tableDiv.id = 'tableDiv' + this.getNodeID();
            tableDiv.setAttribute('class', 'table_controls');
            HTMLPanel.appendChild(tableDiv);
        } else {
            buttonDiv = simDocument().createElement('div');
            buttonDiv.id = 'buttonDiv' + this.getNodeID();
            if (section) {
                if (section.getSectionSettings().elementorientation === "horizontal") {
                    buttonDiv.classList.add("inputpanelcell");
                }
            }
            HTMLPanel.appendChild(buttonDiv);
        }
        button = simDocument().createElement('button');
        button.id = this.getNodeID();
        button.setAttribute('type', 'button');

        var bHandler = this.getHandler();
        var bNodeID = this.getNodeID();
        var parameters = this.getHandlerParameters();
        if (parameters) parameters = ', "' + parameters + '"';
        if (!parameters)
            parameters = '';

        //button.setAttribute('onclick', 'StartTrial("' + bNodeID + '"' + parameters + '); return false;');

        //button.setAttribute('onclick', bHandler + '("' + bNodeID + '"' + parameters + '); return false;');

        util().bindEvent(button, 'click', function (event) {
            eval(bHandler + '("' + bNodeID + '"' + parameters + ')');
            //StartTrial(bNodeID, parameters);
            // event.stopPropagation();
            // a fix for safari, otherwise the page reloads after every button click
            if (event.preventDefault) {
                event.preventDefault();
            } else {
                event.returnValue = false;
            }
            return false;
        });

        if (type == 'mixed' || type == 'image') {
            imageSpan = simDocument().createElement('span');
            imageSpan.setAttribute('class', 'holderImage');
            var image = this.getImage();
            if (this.isAPredefinedCmdElementImage(image)) button.setAttribute('class', 'actionButton ' + image + ' ' + this.getImplication());
            else {
                button.setAttribute('class', 'actionButton withImages ' + this.getImplication());
                imageElement = simDocument().createElement('img');
                imageElement.src = image;
                imageElement.alt = this.getLabel();
                imageSpan.appendChild(imageElement);
            }
            button.appendChild(imageSpan);
        }
        if (type == 'mixed' || type == 'text') {
            if (type == 'text')
                button.setAttribute('class', 'actionButton ' + this.getImplication());
            labelSpan = simDocument().createElement('span');
            labelSpan.setAttribute('class', 'holderText');
            if (sim.getSpeechEnabled()) {

                labelSpan.innerHTML = Simulator.Constants.SPEECH_CMD_ITEM_PREFIX + this.getLabel();
            } else labelSpan.innerHTML = this.getLabel();
            button.appendChild(labelSpan);
        }
        if (needTableDiv)
            tableDiv.appendChild(button);
        else if (HTMLPanel.id.indexOf('dataOutputPanel') == -1)
            buttonDiv.appendChild(button);
        else
            tableElement[0].appendChild(button); // the table_controls div

        // already existed so append the button to that
        this.setHTMLButton(button);
        hButton = button;
        this.mapHTML2JS(button);

        this.setFocusable(true, true);

        if (sim.getSpeechEnabled()) {
            var speechLabel = this.getSpeechLabel();   // if there is a speechLabel defined for the button use it
            if (!speechLabel) {
                speechLabel = this.getLabel();   // else if there is a label defined, use it
                if (!speechLabel && section) {
                    label = section.getSectionLabel();  // else if there is a section label use it
                }
                if (!speechLabel) {
                    dbg().logFatalError(source, 'Item is speech enabled but speechLabel attribute is missing for ' + this.getName(), true);
                    return;
                }
            }
            speechGrammarBldr().createButtonGrammarRule(this.getName(), speechLabel, this, speechLabel);
        }
        if (this.isFocusable()) {
            keyboardInput().addFocusableElementItem(this, this.getNodeID());
        }

    };
    //protoype functions - end here

    //delay registration until this class is instantiated with not null 'sim' parameter
    if (sim) {
        registerClassEvents(instance);
    }

    // Convenience functions for debugging
    function debug(str1, str2, trace) {
        dbg().debug(source, str1, str2, trace);
    }

    function debugf(str1, str2, trace) {
        dbg().debugf(source, str1, str2, trace);
    }

};

//Inherit methods and class variables
Simulator.Control.Button.prototype = new Simulator.Control.CommandElement();
Simulator.Control.Button.parent = Simulator.Control.CommandElement;
Simulator.Control.Button.prototype.constructor = Simulator.Control.Button;  // Reset the prototype to point to the current class
