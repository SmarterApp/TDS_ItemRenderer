//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************

/*******************************************************************************
 * @class SimulationManager 
 * @superclass none
 * @param sim the Simulator instance
 * @return SimulationManager instance
 * 
 * This class manages the activity of the AIR Assessment Simulator.
 * It is instantiated by the Simulator
 ******************************************************************************/
Simulator.SimulationManager = function (sim) {

    // Instance variables
    var source = 'SimulationManager'; // used in debugging
    var name = 'SimulationManager';
    var instance = this;
    this.zoomFactor = 1; // current zoom scale
    var maxTrials = 0; // 0 indicates no limit
    var initialTrialNum = 0;
    var currentTrial = initialTrialNum;
    var isTrialLimitReached = false;
    var noMoreTrialsString = 'Limit on the Number of Trials Reached.';   // default
    var simulatorHeight = 0;
    var simulatorWidth = 0;
    var originalSimulatorHeight = 0; // the original height of the simulation item before expanding
    var originalSimulatorWidth = 0;  // the original width of the simulation item before expanding
    var animationFinished = false;
    var tableUpdated = false; // True if a data table has been updated with results of the most recent trial
    var itemName = '';  // The name (if provided in the xml) of the simulation item
    var redoingTrial = false;  // if true we are redoing a trial
    var tableExists = false;  // True if a data table exists in the item, false otherwise
    var animationCompleteWithoutOutput = false;  // If true, we do not increase the trial number when the animation completes
    var stateDB = {};  // The object in which the state of the simulator is kept
    var stateName = null;
    var restoreAnimationOnReload = null;
    var clearScoreOnNewTrial = false;
    var useTrialNumFromDeleteQueue = false;

    var state =
    {
        SimError: -1, // error in any of the simulator states
        Uninitialized: 0, // initial simulator state
        Initialized: 1, // simulator initialization process started, getting SVG
        Instantiated: 2, // images and animations have loaded but events are not hooked up yet
        Loading: 3, // in process of loading the answer space and response xml
        Loaded: 4, // all xml has loaded and the student can use the simulator now
        Ready: 5, // all events are hooked up and the simulator is ready to interact with the user
        TrialLimitReached: 6,    // Most commands are disabled until the number of trials goes below the MaxTrial limit
        Playing: 7,   // An animation is playing
        ReadOnly: 8
        // note: any future states with state number > Loaded should comply with this.isLoaded() below
    };

    var currentState = state.Uninitialized;

    // Get instances of all necessary services and objects
    var eventMgr = function () { return sim.getEventManager(); };
    var whiteboard = function () { return sim.getWhiteboard(); };
    var scoringTable = function () { return sim.getScoringTable(); };
    var persistentVariableDB = sim.getPersistentVariableDB();
    var trialNumStack = new Simulator.Utils.Stack(sim);   // access function not required since private
    var deleteQueue = new Simulator.Utils.OrderedQueue(sim);     // access function not required since private
    //    keyBrdInput = new Simulator.Input.KeyboardInput(this);
    var layout = function () { return sim.getLayout(); };
    var simID = function () { return sim.getSimID(); };
    var dbg = function () { return sim.getDebug(); };
    var dataTable = function () { return sim.getDataTable(); };
    var simDocument = function () { return sim.getSimDocument(); };
    var transDictionary = function () { return sim.getTranslationDictionary(); };

    //  Register for all required events
    registerAllEvents = function (simMgr) {
        eventMgr().registerEvent(new Simulator.Event(simMgr, 'command', 'startTrial'));
        eventMgr().registerEvent(new Simulator.Event(simMgr, 'command', 'newTrial'));
        eventMgr().registerEvent(new Simulator.Event(simMgr, 'command', 'startAnimation'));
        eventMgr().registerEvent(new Simulator.Event(simMgr, 'command', 'resetTrials'));
        eventMgr().registerEvent(new Simulator.Event(simMgr, 'info', 'errorOccurred'));
        eventMgr().registerEvent(new Simulator.Event(simMgr, 'info', 'animationStarted'));
        eventMgr().registerEvent(new Simulator.Event(simMgr, 'info', 'animationFinished'));
        eventMgr().registerEvent(new Simulator.Event(simMgr, 'info', 'animationThreadFinished'));
        eventMgr().registerEvent(new Simulator.Event(simMgr, 'info', 'simulatorStateChange'));   // data will contain the new state
        eventMgr().registerEvent(new Simulator.Event(simMgr, 'info', 'animationUnreachable'));
        eventMgr().registerEvent(new Simulator.Event(simMgr, 'info', 'tableUpdated'));
        eventMgr().registerEvent(new Simulator.Event(simMgr, 'info', 'allMediaLoaded'));
        eventMgr().registerEvent(new Simulator.Event(simMgr, 'info', 'allTableRowsCleared'));
        eventMgr().registerEvent(new Simulator.Event(simMgr, 'command', 'redoTrial'));
        eventMgr().registerEvent(new Simulator.Event(simMgr, 'info', 'simulatorDimensionsAvaiable'));

        debug('Registered all pre - required events');
    };

    /*      
    * Instance Methods
    */
    this.getName = function () {
        return name;
    };

    this.getSourceName = function () {
        return source;
    };

    this.getRestoreAnimationOnReload = function () {
        return restoreAnimationOnReload;
    };

    this.setSimulatorHeight = function (height) {
        if (height) {
            simulatorHeight = height;
        } else {
            simulatorHeight = layout().getContainerHeight();
        }
    };

    this.setSimulatorWidth = function (width) {
        if (width) {
            simulatorWidth = width;
        } else {
            simulatorWidth = layout().getContainerWidth();
        }
    };

    this.setOriginalSimulatorHeight = function (height) {
        if (height) {
            originalSimulatorHeight = height;
        } else {
            originalSimulatorHeight = layout().getContainerHeight();
        }
    };

    this.setOriginalSimulatorWidth = function (width) {
        if (width) {
            originalSimulatorWidth = width;
        } else {
            originalSimulatorWidth = layout().getContainerWidth();
        }
    };

    // Return the name of this simulation item
    this.getItemName = function () {
        return itemName;
    };

    this.getSimulatorHeight = function () {
        simulatorHeight = layout().getContainerHeight();
        return simulatorHeight;
    };

    this.getSimulatorWidth = function () {
        simulatorWidth = layout().getContainerWidth();
        return simulatorWidth;
    };

    this.getOriginalSimulatorHeight = function () {
        return originalSimulatorHeight;
    };

    this.getOriginalSimulatorWidth = function () {
        return originalSimulatorWidth;
    };

    this.setAnimationCompleteWithoutOutput = function (flag) {
        animationCompleteWithoutOutput = (flag === 'yes' || flag == true) ? true : false;
    };
    this.getAnimationCompleteWithoutOutput = function () {
        return animationCompleteWithoutOutput;
    };
    this.setState = function (theState) {
        currentState = theState;
        switch (theState) {
            case state.SimError: stateName = 'SimError'; break;
            case state.Uninitialized: stateName = 'Uninitialized'; break;
            case state.Initialized: stateName = 'Initialized'; break;
            case state.Instantiated: stateName = 'Instantiated'; break;
            case state.Loading: stateName = 'Loading'; break;
            case state.Loaded: stateName = 'Loaded'; break;
            case state.Ready: stateName = 'Ready'; break;
            case state.TrialLimitReached: stateName = 'TrialLimitReached'; break;
            case state.Playing: stateName = 'Playing'; break;
            case state.ReadOnly: stateName = 'ReadOnly'; break;
            default:
                dbg().logError(source, 'Unknown state passed to setState: ' + theState);
                return;
        }
        debugf('Simulator state: ' + stateName);
        eventMgr().postEvent(new Simulator.Event(this, 'info', 'simulatorStateChange', stateName));

    };

    this.getState = function () {
        return currentState;
    };

    this.getStateName = function () {
        return stateName;
    };

    this.verifyCheckListSelection = function () {
        return layout().hasEmptyChoiceListSelection();
    };

    this.setStateFromName = function (theStateName) {
        switch (theStateName) {
            case 'SimError': this.setState(state.SimError); break;
            case 'Uninitialized': this.setState(state.Uninitialized); break;
            case 'Initialized': this.setState(state.Initialized); break;
            case 'Instantiated': this.setState(state.Instantiated); break;
            case 'Loading': this.setState(state.Loading); break;
            case 'Loaded': this.setState(state.Loaded); break;
            case 'Ready': this.setState(state.Ready); break;
            case 'TrialLimitReached': this.setState(state.TrialLimitReached); break;
            case 'Playing': this.setState(state.Playing); break;
            case 'ReadOnly': this.setState(state.ReadOnly); break;
            default:
                dbg().logError(source, 'Unknown state name passed to setState: ' + stateName);
                return;
        }
    };

    // Process received events
    this.handleEvent = function (event) {
        switch (event.type) {
            case 'command':
                switch (event.context) {
                    case 'startTrial':
                        var redoingATrial = this.adjustForRedoTrials();
                        if (!this.checkTrialLimitReached(redoingATrial)) {
                            layout().saveInputs(true);
                            tableUpdated = false;
                            animationFinished = false;
                            this.setAnimationCompleteWithoutOutput(false);
                            if (!redoingATrial) this.nextTrialNum();
                        } else this.trialLimitReachedAction();
                        break;
                    case 'startAnimation':
                        this.adjustForRedoTrials();
                        layout().saveInputs();
                        tableUpdated = false;
                        animationFinished = false;
                        break;
                    case 'newTrial':
                        if (!this.checkTrialLimitReached()) {
                            this.adjustForRedoTrials();
                        } else this.trialLimitReachedAction();
                        break;
                    case 'resetTrials':
                        if (!this.isReadOnly()) {
                            this.resetTrialNum();
                            layout().enableAllInput();
                        }
                        break;
                    case 'redoTrial':
                        if (!this.isReadOnly()) {
                            this.redoTrialNum(event.data);
                        }
                        break;
                }
                break;
            case 'info':
                switch (event.context) {
                    case 'animationStarted':
                        this.setPlayingState();
                        break;
                    case 'animationThreadFinished':
                        animationFinished = true;
                        debug(source, "Received animationThreadFinished event from, animationCompleteWithoutOutput = " + this.getAnimationCompleteWithoutOutput());
                        if (!this.getAnimationCompleteWithoutOutput()) {
                            debug('this.getTableExists() = ' + this.getTableExists() + ', tableUpdated = ' + tableUpdated);
                            if (this.getTableExists() && tableUpdated) {
                                dataTable().saveScoreableInputs();
                                whiteboard().clearCategory('evaluationOutput');
                                this.setReadyState();
                            } else {
                                if (!this.getTableExists()) {
                                    debug(source, 'Table does not exist. Setting simulator state to Ready');
                                    this.setReadyState();
                                }
                                else {
                                    debug(source, 'Table does exist but has not been updated');
                                    this.setReadyState();
                                }
                            }
                        } else {
                            dataTable().saveScoreableInputs();
                            debug(source, "Received animationThreadFinished event with animationCompleteWithoutOutput = true. Table was not updated. Current trial number remains at " + this.getTrialNum());
                            this.setReadyState();
                        }
                        break;
                    case 'animationUnreachable':
                        dbg.logWarning('AnimationUnreachable.Setting Ready state in SimulationManager.handleEvent');
                        this.setReadyState();
                        break;
                    case 'tableUpdated':
                        tableUpdated = true;
                        debug('Received tableUpdated event');
                        if (animationFinished) {
                            this.setReadyState();
                        }
                        break;
                    case 'allTableRowsCleared':
                        layout().enableAllInput();
                        break;
                    case 'allMediaLoaded':
                        debug("SimulationManager received 'allMediaLoaded' event");
                        //layout().makeAllPanelsVisible();
                        //eventMgr().postEvent(new Simulator.Event(this, 'command', 'load'));
                        this.setReadyState();
                        break;
                    case 'fatalErrorOccurred':
                        this.setState(state.Error);
                        eventMgr().postEvent(new Simulator.Event({ source: this, type: 'error', context: 'FatalSimulationError', data: event.data }));
                        eventMgr().stopEventProcessing();
                        break;
                }
                break;
            default: dbg().logWarning(source, 'Unrecognized event of type "' + event.type + '" and context: "' + event.context + '"');
                break;
        }
    };

    // Determine if the last allowed trial has been reached
    this.lastTrialReached = function () {
        if (deleteQueue.length() > 0) return false;
        else if (maxTrials === 0) return false;  // 0 indicates no limit
        else if (trialNumStack.peek() < parseInt(maxTrials)) return false;
        else {
            trialNumStack.push(parseInt(maxTrials));
            return true;
        }
    };

    this.checkTrialLimitReached = function (redoingATrial) {
        if (deleteQueue.length() > 0) {
            isTrialLimitReached = false;
            return false;
        } else if (maxTrials === 0) { // 0 indicates no limit
            isTrialLimitReached = false;
            return false;
        } else {
            // for redoing a trial, the current trial number has been advanced by 1,
            // so use a separate logic to check if maxtrial has been reached
            if (redoingATrial) isTrialLimitReached = (currentTrial > parseInt(maxTrials));
            else isTrialLimitReached = (currentTrial >= parseInt(maxTrials));
            return isTrialLimitReached;
        }
    };

    this.trialLimitReached = function () {
        return isTrialLimitReached;
    };

    this.nextTrialNum = function () {
        var val = trialNumStack.peek();
        if (isNaN(val)) trialNumStack.push(initialTrialNum);
        else trialNumStack.push(parseInt(trialNumStack.peek()) + 1);
        currentTrial = trialNumStack.peek();
        if (!this.trialLimitReached() && clearScoreOnNewTrial) {
            scoringTable().clearTable();
        }
        trialNumStack.inspect();
        deleteQueue.inspect();
        debug('SimulationManager.NextTrialNum: Setting next trial number to ' + currentTrial);
    };

    this.adjustForRedoTrials = function () {
        if (deleteQueue.length() > 0) {
            currentTrial = deleteQueue.remove();
            useTrialNumFromDeleteQueue = true;
            redoingTrial = false;
            return true;
            //debug('Set current trial number to redo trial number: ' + currentTrial);
        } else if (useTrialNumFromDeleteQueue) {
            // if previous trial is a redoing trial, set the current trial number properly before checking if maxtrial has been reached
            useTrialNumFromDeleteQueue = false;
            currentTrial = trialNumStack.peek();
            if (isNaN(currentTrial)) currentTrial = initialTrialNum;
            return false;
        } else return false;
    };

    this.redoTrialNum = function (num) {
        deleteQueue.add(num);
        //trialNumStack.pop();  // Since we already incremented for a new trial, pop it to back off for the redo
        trialNumStack.inspect();
        deleteQueue.inspect();
        redoingTrial = true;
        this.setReadyState();
    };

    // retrieve the correct row number of the scoring table for populating the variables
    this.getTrialRowNum = function (recordOnChange) {
        if (recordOnChange) {
            if (deleteQueue.length() == 0) {
                var val = trialNumStack.peek();
                if (isNaN(val)) return initialTrialNum;
                else return parseInt(trialNumStack.peek());
            } else {
                return deleteQueue.peek() - 1;
            }
        } else {
            if (useTrialNumFromDeleteQueue) {
                return currentTrial - 1;
            } else {
                var val = trialNumStack.peek();
                if (isNaN(val)) return initialTrialNum;
                else return parseInt(trialNumStack.peek());
            }
        }
    }

    this.isRedoingTrial = function () {
        return redoingTrial;
    };

    this.getTrialNum = function () {
        return currentTrial;
    };

    this.getInitialTrialNum = function () {
        return initialTrialNum;
    };

    this.setTrialNum = function (num) {
        trialNumStack.push(num);
        currentTrial = num;
        debug('SimulationManager.SetTrialNum: Setting current trial number to ' + currentTrial);
    };

    this.resumeTrials = function () {
    };

    this.resetTrialNum = function () {
        //        var init = min(0, parseInt(whiteboard().getItem('initialization', 'TrialNum')));
        deleteQueue.clear();
        //        trialNumStack.push(init === null ? initialTrialNum : init);
        trialNumStack.push(Simulator.Constants.DEFAULT_INITIAL_TRIAL_NUM);
        currentTrial = trialNumStack.peek();
        //debug('Resetting trial number to ' + currentTrial);
    };

    // Action taken when the user tries to perform a trial while the simulator is diabled
    this.getDisabledAction = function () {
        switch (this.getState()) {
            case state.TrialLimitReached:
                return trialLimitReachedAction; // a function
            default: return this.noAction;
        }
    };

    // Action the simulator takes when the trial limit is reached
    this.trialLimitReachedAction = function () {
        this.setTrialLimitReachedState();
        Simulator.showAlertWarning(this.getNoMoreTrialString());
    };

    // no-op
    this.noAction = function () {
        return;
    };

    // The string displayed when the user is notified that the trial limit has been reached
    this.getNoMoreTrialString = function () {
        // retrieve translated string
        return transDictionary().translate(noMoreTrialsString);
    };

    this.getBaseURL = function () {
        return baseURL;
    };

    // Get the name of the simulation item
    this.getName = function () {
        return source;
    };

    this.isPlaying = function () {
        return this.getStateName() === 'Playing';
    };

    this.isReadOnly = function () {
        return this.getStateName() == 'ReadOnly';
    };

    // has the simulator at least loaded (can it return a response XML)
    this.isLoaded = function () {
        // any state including "Loaded" and above
        return (this.getState() >= state.Loaded);
    }

    // has the simulator finished loading and is ready to use
    this.isReady = function () {
        return (this.getState() === state.Ready);
    };

    this.setReadOnlyState = function (newState) {
        newState === true ? this.setState(state.ReadOnly) : this.setState(state.Ready);
    };

    this.setReadyState = function () {
        this.setState(state.Ready);
        debugf('Enabling all input and setting simulator state to "Ready"', null, 'notrace');
        layout().enableAllInput();
    };

    this.setPlayingState = function () {
        debugf('Disabling all input and setting simulator state to "Playing"', null, 'notrace');
        this.setState(state.Playing);
        layout().disableAllInput();
    };

    this.setTrialLimitReachedState = function () {
        this.setState(state.TrialLimitReached);
        layout().disableAllInput();

        // fb-147867: re-enable start button after max trial reached so that all subsequent attempts will throw warning
        layout().enableStartButton();
    };

    this.getNextItem = function () {
        window.location.reload(); // FOR TESTING ONLY
    };

    // Get the scoring response for the item
    this.getResponse = function () {
        var contents = dataDB.getContents();
        return contents;
    };

    // Set whether or not a data table exists
    this.setTableExists = function (flag) {
        flag == true ? tableExists = true : tableExists = false;
    };

    this.getTableExists = function () {
        return tableExists;
    };

    this.displaySimulatorState = function (embedded) {
        var buff = [];
        var aState = null;
        buff.push('Simulator State:');
        buff.push('-----------------------');
        buff.push(deleteQueue.inspect(false));
        buff.push(trialNumStack.inspect(false));
        buff.push('currentTrial = ' + currentTrial);
        buff.push('redoingTrial = ' + redoingTrial);
        buff.push('currentState = ' + this.getStateName());
        buff.push('zoomFactor = ' + this.zoomFactor);
        buff.push('speechEnabled = ' + sim.getSpeechEnabled());
        buff.push('simulator height = ' + this.getSimulatorHeight());
        buff.push('simulator width = ' + this.getSimulatorWidth());
        if (sim.getAnimationSet() !== null) {
            aState = sim.getAnimationSet().getCurrentAnimationState();
        } else {
            aState = [];
            aState['animation state'] = 'none';
        }
        for (var p in aState) buff.push(p + ' = ' + aState[p]);
        buff.push('End of Simulator State');
        buff.push('-----------------------');
        if (!embedded) debug(buff.join('\n'));
        else return buff.join('\n');
    };

    // Set the initial value of the variables in the xml initialization section
    this.initManagerVariables = function () {
        var whtBrd = whiteboard();
        //        var initTrial = whtBrd.getItem('initialization', 'TrialNum');
        //        if (initTrial) initialTrialNum = Math.min(0, parseInt(initTrial));   // THE MATH FUNCTION IS A KLUDGE SINCE TRIALS MUST NOW START AT 0
        //        else initialTrialNum = Simulator.Constants.DEFAULT_INITIAL_TRIAL_NUM;
        this.setTrialNum(Simulator.Constants.DEFAULT_INITIAL_TRIAL_NUM);
        currentTrial = this.getTrialNum();
        //debug('After initialization of SimulationManager variables, CurrentTrial = ' + currentTrial);
        if (whtBrd.itemExists('initialization', 'MaxTrials')) {
            maxTrials = whtBrd.getItem('initialization', 'MaxTrials');
            if ((maxTrials) && (maxTrials > 0)) {
                scoringTable().setMaxRowNum(maxTrials);
            }
        }
        if (whtBrd.itemExists('initialization', 'NoMoreTrialsString')) {
            noMoreTrialsString = whtBrd.getItem('initialization', 'NoMoreTrialsString');
        }
        if (whtBrd.itemExists('initialization', 'ClearScoreOnNewTrial')) {
            clearScoreOnNewTrial = whtBrd.getItem('initialization', 'ClearScoreOnNewTrial');
            clearScoreOnNewTrial = clearScoreOnNewTrial === 'yes' ? true : false;
        }
        if (whtBrd.itemExists('initialization', 'RestoreAnimationOnReload')) {
            restoreAnimationOnReload = whtBrd.getItem('initialization', 'RestoreAnimationOnReload');
            restoreAnimationOnReload = restoreAnimationOnReload === 'yes' ? true : false;
        }
    };

    // The height of the simulation item
    this.setSimulatorHeight = function (height) {
        simulatorHeight = height;
    };

    // The width of the simulation item
    this.setSimulatorWidth = function (width) {
        simulatorWidth = width;
    };

    this.setResponseStateVariables = function (stateMgr) {
        stateMgr.setResponseStateVariableValue('deleteQueue', deleteQueue.entriesAsString());
        stateMgr.setResponseStateVariableValue('trialNumStack', trialNumStack.entriesAsString());
        stateMgr.setResponseStateVariableValue('currentTrial', currentTrial);
        stateMgr.setResponseStateVariableValue('redoingTrial', redoingTrial);
        if (this.getStateName() == 'ReadOnly') stateMgr.setResponseStateVariableValue('currentState', 'Ready');
        else stateMgr.setResponseStateVariableValue('currentState', this.getStateName());
        stateMgr.setResponseStateVariableValue('zoomFactor', this.zoomFactor);
        stateMgr.setResponseStateVariableValue('speechEnabled', sim.getSpeechEnabled());
        if (this.getStateName() == 'ReadOnly') stateMgr.setResponseStateVariableValue('simulatorHeight', this.getOriginalSimulatorHeight()); // use the origninal height in review mode
        else stateMgr.setResponseStateVariableValue('simulatorHeight', this.getSimulatorHeight());
        if (this.getStateName() == 'ReadOnly') stateMgr.setResponseStateVariableValue('simulatorWidth', this.getOriginalSimulatorWidth());  // use the original width in review mode
        else stateMgr.setResponseStateVariableValue('simulatorWidth', this.getSimulatorWidth());
    };

    this.clearSimulationState = function () {
        trialNumStack.clear();
        deleteQueue.clear();
    };

    /*
    * Private functions
    */
    // Record elements of the simulator state
    function recordStateSpecs(initNode) {
        if (initNode.length > 0) {
            var children = initNode[0].childNodes;
            for (var i = 0; i < children.length; i++) {
                spec = children[i];
                if (children[i].nodeName[0] != '#') {
                    varName = children[i].attributes[0].nodeValue;
                    stateDB.varName = '';
                }
            }
        }
    }

    // Restore the state of the simulator from the stateDB
    this.restoreStateVariables = function (stateDB) {
        var parts = null;
        for (p in stateDB) {
            switch (p) {
                case 'deleteQueue':
                    deleteQueue.clear();
                    parts = stateDB['deleteQueue'].split(',');
                    for (var i = 0; i < parts.length; i++) {
                        if (parts[i]) {
                            if (parts[i] !== undefined && parts[i] !== '') deleteQueue.add(parseInt(parts[i]));
                        }
                    }
                    break;
                case 'trialNumStack':
                    trialNumStack.clear();
                    parts = stateDB['trialNumStack'].split(',');
                    for (var i = parts.length - 1; i > -1; i--) {
                        if (parts[i]) {
                            if (parts[i] !== undefined && parts[i] !== '') trialNumStack.push(parseInt(parts[i]));
                        }
                    }
                    break;
                case 'currentTrial':
                    if (stateDB[p] !== '') currentTrial = parseInt(stateDB[p]);
                    break;
                case 'redoingTrial':
                    redoingTrial = stateDB[p] === 'true' ? true : false;
                    break;
                case 'currentState':
                    this.setStateFromName(stateDB[p]);
                    break;
                case 'zoomFactor':
                    this.zoomFactor = parseFloat(stateDB[p]);
                    break;
                case 'simulatorHeight':
                    this.setSimulatorHeight(stateDB[p]);
                    this.setOriginalSimulatorHeight(stateDB[p]); // store the original height, will be used when exporting the response xml in review mode
                    break;
                case 'simulatorWidth':
                    this.setSimulatorWidth(stateDB[p]);
                    this.setOriginalSimulatorWidth(stateDB[p]); // store the original width, will be used when exporting the response xml in review mode
                    break;
            }
        }
        this.displaySimulatorState();
    };

    if (sim) registerAllEvents(instance);


    // Convenience functions for debugging
    function debug(str1, str2, trace) {
        dbg().debug(source, str1, str2, trace);
    }

    function debugf(str1, str2, trace) {
        dbg().debugf(source, str1, str2, trace);
    }

};

