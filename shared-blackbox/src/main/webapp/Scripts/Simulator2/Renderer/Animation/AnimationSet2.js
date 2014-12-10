/** **************************************************************************
* @class AnimationSet
* @superclass SimElement
* @param none
* @return AnimationSet instance
* Creates a new AnimationSet class.
*****************************************************************************
*/
Simulator.Animation.AnimationSet = function (sim, panel) {

    Simulator.SimElement.call(this, sim);

    this.setEname('AnimationSet');

    //#region private variables
    var source = 'AnimationSet';
    var instance = this;
    var setElements = [];
    var setThreads = [];
    var poster = [];
    var inputSource = [];
    var outputs = [];
    var outputOnRequest = false;
    var prevInputs = [];
    var currentInputs = [];
    var lastThreadExecuted = null;
    var currentThread = null;
    var currentAnimation = null;
    var currentAnimationState = [];
    var scoreable = true;
    var key = null;
    var renderer = null;
    var animationBehavior = 'timeBased';
    var instance = this;
    var animationLoaded = false;


    //#endregion

    //#region private functions

    var util = function () { return sim.getUtils(); };

    var dbg = function () { return sim.getDebug(); };

    var whiteboard = function () { return sim.getWhiteboard(); };

    var eventMgr = function () { return sim.getEventManager(); };

    var scoringTable = function () { return sim.getScoringTable(); };

    var simMgr = function () { return sim.getSimulationManager(); };

    var simDocument = function() { return sim.getSimDocument(); };

    var transDictionary = function () { return sim.getTranslationDictionary(); };

    function registerEvents(instance) {
        // Register some events
        //eventMgr().registerEvent(new Simulator.Event(this, 'info', 'inputAvailable'));
        eventMgr().registerEvent(new Simulator.Event(instance, 'info', 'animationThreadFinished'));
        eventMgr().registerEvent(new Simulator.Event(instance, 'info', 'animationFinished'));
        eventMgr().registerEvent(new Simulator.Event(instance, 'info', 'animationStarted'));
        eventMgr().registerEvent(new Simulator.Event(instance, 'info', 'animationError'));
        //eventMgr().registerEvent(new Simulator.Event(instance, 'command', 'load')); Not required. This is always registered from SAX
    }

    //#endregion

    //#region function calls in the constructor

    //#endregion

    //#region public functions

    this.getRenderer = function () {
        return renderer;
    };

    this.getKey = function () {
        return key;
    };

    this.getPrevInputs = function () {
        return prevInputs;
    };

    var inputSource = [];
    inputSource[0] = 'evaluator';  // Set the default
    this.getInputSource = function () {
        return inputSource;
    };

    this.setInputSource = function (newInputSource) {
        var parts = [];
        inputSource.splice(0, 1);  // clear the default value since we are explicitly specifying the source
        parts = newInputSource.split(',');
        for (var i = 0; i < parts.length; i++) {
            parts[i] = parts[i].trim();
            if (parts[i] == "evaluator" || parts[i] == "animation") {
                if (!util().elementInArray(inputSource, parts[i])) inputSource.push(parts[i]);
            }
            else dgb().logFatalError(source, 'Unknow input source "' + parts[i] + '" passed to AnimationSet.setInputSource');
        }
    };

    this.getCurrentAnimation = function () {
        return currentAnimation;
    };

    this.setCurrentAnimation = function (animation) {
        currentAnimation = animation;
    };
    
    this.getCurrentInputs = function() {
        return currentInputs;
    };

    this.getAnimationBehavior = function () {
        return animationBehavior;
    };

    this.setAnimationBehavior = function (newBehavior) {
        animationBehavior = newBehavior;
        return this;
    };

    this.addAnimationElement = function (element) {
        setElements.push(element);
        return this;
    };

    this.getAnimationElement = function (id) {
        for (var i = 0; i < setElements.length; i++) {
            if (setElements[i].getName() == id)
                return setElements[i];
        }
        return null;
    };

    this.addThread = function (aThread) {
        setThreads.push(aThread);
    };

    this.getThreadFromName = function (name) {
        for (var i = 0; i < setThreads.length; i++) {
            if (setThreads[i].getName() == name) return setThreads[i];
        }
        return null;
    };
    
    this.getFirstAnimationThread = function() {
        return setThreads[0];
    };

    this.getPosterName = function () {
        return poster['name'] + sim.getSimID();
    };

    this.getPosterSrc = function () {
        // retrieve language-specific version of poster image
        var translatedPosterSource = transDictionary().translate(poster['image']);
        debug("Getting a poster image using AnimationSet2.js method: " + translatedPosterSource);
        return translatedPosterSource;
    };

    this.getPosterShow = function () {
        return poster['show'];
    };

    this.getInputSource = function () {
        return inputSource;
    };

    this.setOutputs = function (newOutputs) {
        outputs = newOutputs.split(",");
        if(outputs == "inputs") scoringTable().cloneInputsForOutputs();
        else if(scoreable) {
            for(var i = 0; i < outputs.length; i++) {
                  if(outputs[i] != "none") scoringTable().addElement(outputs[i], "output");
            }
        }
    };

    this.getOutputs = function () {
        return outputs;
    };

    this.setScoreable = function (newScoreable) {
        scoreable = newScoreable == 'yes' ? true : false;
        return this;
    };

    this.getScoreable = function () {
        return scoreable;
    };

    this.setPoster = function (posterAttributes) {
        for (var i = 0; i < posterAttributes.length; i++) {
            if (posterAttributes[i].nodeName == 'image') {
                poster[posterAttributes[i].nodeName] = posterAttributes[i].nodeValue;
            }
            else poster[posterAttributes[i].nodeName] = posterAttributes[i].nodeValue;
        }
    };

    this.setOutputOnRequest = function (newOutputOnRequest) {
        outputOnRequest = newOutputOnRequest == 'yes' ? true : false;
        return this;
    };

    this.getOutputOnRequest = function () {
        return outputOnRequest;
    };

    this.recordOutputs = function () {
        var parts = [];
        var data = whiteboard().getCategory('animationOutput')['output'];
        if (data != null) {
            data = data.split(Simulator.Constants.PAIR_DELIMITTER);
            if (data != undefined && data != null && data != '') for (var i = 0; i < outputs.length; i++) {
                if (outputs[i] == 'none') break;
                else if (scoreable) {
                    for (var j = 0; j < data.length; j++) {
                        parts = data[j].split(Simulator.Constants.KEY_VALUE_DELIMITTER);
                        parts[0] = parts[0].trim();
                        if (parts[1]) parts[1] = parts[1].trim();
                        if (parts[0] == outputs[i]) scoringTable().setValue(parts[0], simMgr().getTrialNum() - 1, parts[1]);
                    }
                }
            }
        }
    };

    this.selectThread = function (noStart) {
        this.setCurrentThread(null);
        for (var i = 0; i < setThreads.length; i++) {
            if (setThreads[i].isSelected()) {
                this.setCurrentThread(setThreads[i]);
                if (!noStart) setThreads[i].startSimulation();  // if noStart is true, we want to select a thread but not actually start it
                return true;  // Found the next thread
            }
        }
        return false;  // Could not find the next thread
    };

    this.handleEvent = function (event) {
        var newEvent = undefined;
        switch (event.type) {
            case 'info':
                switch (event.context) {
                    case 'animationThreadFinished':
                    case 'animationFinished':
                        lastThreadExecuted = this.getCurrentThread();
                        //AnimationSet.setCurrentThread(null);
                        if (poster['show'] == 'after' || poster['show'] == 'both') renderer.renderImage(this, 'animationPanel', this.getPosterSrc(), this.getPosterName(), -1, null);
                        //this.postStaticEvents();
                        break;
                    case 'animationStarted':
                        break;
                    case 'inputAvailable':
                        var result = this.storeInputs(true);
                        if (result != false) {
                            simMgr().setAnimationCompleteWithoutOutput(event.completeWithoutOutput);
                            this.sendDataToAnimation();
                            /*          if(AnimationSet.getCurrentThread() == null) {
                            this.selectThread();
                            } else {
                            var nextElement = this.getCurrentThread().renderNextThreadElement(false);
                            if(!nextElement) {
                            threadFound = this.selectThread();
                            }
                            }
                            */
                        }
                        break;
                    case 'animationError':
                        dbg().logError(source, event.data);
                        break;
                    case 'outputAvailable':
                        if (!simMgr().trialLimitReached()) {
                            var result = this.storeInputs(true);
                            if (result != false) {
                                if (this.getCurrentThread() == null) {
                                    this.selectThread();
                                } else {
                                    var nextElement = this.getCurrentThread().renderNextThreadElement(false);
                                    if (!nextElement) this.selectThread();
                                }
                            }
                        }
                        break;
                    default:
                        dbg().logFatalError(source, 'AnimationSet - Unknown command name: ' + event.context + ' received by ' + this.getName());
                        break;
                }
                break;
            case 'command':
                switch (event.context) {
                    case 'load':
                        if(!animationLoaded) {
                            if (poster['show'] == 'before' || poster['show'] == 'both')
                                renderer.renderImage(this, 'animationPanel', this.getPosterSrc(), this.getPosterName(), -1, null);  // maxTime = -1
                            else if (util().assocArrayIsEmpty(poster)) eventMgr().postEvent(new Simulator.Event(instance, "info", "allMediaLoaded"));
                            animationLoaded = true;
                        }
                        break;
                    case 'startAnimation':
                        this.storeInputs(true);
                        if (this.getCurrentThread() == null) {
                            this.selectThread();
                        } else {
                            var nextElement = this.getCurrentThread().renderNextThreadElement(true);
                            if (nextElement) this.selectThread();
                        }

                        break;
                    case 'outputReq':
                        if (currentAnimation) {
                            currentAnimation.animationInput(sim.getSimID(), 'command', 'outputRequest');
                        }
                        break;
                    case 'startTrial':
                        if (!simMgr().trialLimitReached()) {
                            this.storeInputs(true);
                            simMgr().setAnimationCompleteWithoutOutput(event.completeWithoutOutput);
                            if (this.getCurrentThread() == null) {
                                this.selectThread();
                            } else {
                                var nextElement = this.getCurrentThread().renderNextThreadElement(false);
                                if (!nextElement) this.selectThread();
                            }
                        }
                        break;
                    default:
                        dbg().logFatalError(source, 'AnimationSet - Unknown command name: ' + event.context + ' received by ' + this.getName());
                        break;
                }
                break;
            default:
                dbg().logFatalError(source, 'AnimationSet ' + this.getName() + ': Unhandled event type received: ' + event.inspect());
                return;
        }
        if (newEvent != undefined && newEvent != null) {
            newEvent.postEvent();
        }
    };

    this.sendDataToAnimation = function () {
        debug('in sendDataToAnimation of AnimationSet');
        var thread = this.getCurrentThread();
        if (!thread) {
            thread = lastThreadExecuted;
            if (!thread) {   // No thread has been executed yet so select it now.
                if (!this.selectThread()) dbg().logFatalError(source, 'Could not select a thread in sendDataToAnimation of AnimationSet.');
                return;
            } else return;
        }
        var element = thread.getCurrentElement();
        if (!element) element = thread.getLastExecutedAnimationElement();
        debug('In sendDataToAnimation - element = ' + (element === null) ? 'null' : element.getName());
        if (element) {
            renderer.sendDataToAnimation(element);
        } else dbg().logFatalError(source, 'Could not find CurrentElement or LastExecutedAnimationElement in sendDataToAnimation of AnimationThread');
    };
    
    this.getSourceName = function() {
        return source;
    };

    this.inspect = function (embedded, force) {
        var buff = [];
        var sep = '\n\n';
        if (!embedded)
            buff.push('Inspecting AnimationSet');
        buff.push(sep);
        for (var i = 0; i < setElements.length; i++) {
            buff.push('[');
            buff.push(i);
            buff.push('] = ');
            buff.push(setElements[i].inspect(true));
            buff.push(sep);
        }
        if (!embedded)
            buff.push('End of AnimationSet inspection');
        buff.push(sep);
        if (!embedded) (force == null) ? debug(buff.join('')) : debugf(buff.join(''));
        else return buff.join('');
    };

    this.getCurrentAnimationState = function () {
        if (lastThreadExecuted) {
            currentAnimationState['lastThreadExecutedName'] = lastThreadExecuted.getName();
            currentAnimationState['currentThreadElementIndex'] = lastThreadExecuted.getCurrentThreadElementIndex();
            currentAnimationState['animationInputs'] = currentInputs.join(',');
            currentAnimationState['animationOutputs'] = this.getOutputs().join(',');
            return currentAnimationState;
        } else return [];
    };

    this.setCurrentAnimationState = function (stateArray) {
        lastThreadExecuted = this.getThreadFromName(stateArray['lastThreadExecutedName']);
        lastThreadExecuted.setCurrentThreadElementIndex(stateArray['currentThreadElementIndex']);
        var parts = stateArray['animationInputs'].split(',');
        for (var p in parts) currentInputs[p] = parts[p];
        this.setOutputs(stateArray['animationOutputs']);
        if (simMgr().getRestoreAnimationOnReload()) lastThreadExecuted.startSimulation();
    };

    this.storeInputs = function (backupInputs) {
        var inputs = whiteboard().getCategory('animationInput');
        if (inputs != null) {
            if (Object.size(inputs) > 0) {
                if (backupInputs) this.setPrevInputs();
                for (var s in inputs) {
                    currentInputs[s] = inputs[s];
                }
            }
        }

    };

    this.setPrevInputs = function () {
        for (var p in currentInputs) {
            prevInputs[p] = currentInputs[p];
        }
    };

    this.setCurrentThread = function (thread) {
        lastThreadExecuted = currentThread;
        currentThread = thread;
        if (currentThread !== null) {
            debug('In setCurrentThread - currentThread = "' + currentThread.getName() + '", so setting currentElement to null');
            currentThread.setCurrentElement(null);
        } else dbg().logWarning(source, 'In setCurrentThread - currentThread = null');
    };

    this.getCurrentThread = function (thread) {
        return currentThread;
    };

    function renderNextElement(instance) {
        var anEvent = null;
        if (currentThread != null && currentThread != undefined) {
            var element = currentThread.renderNextThreadElement();
            if (element == null) {
                anEvent = new Simulator.Event(instance, "info", "animationThreadFinished");
                eventMgr().postEvent(anEvent);
            }
        } else {
            anEvent = new Simulator.Event(instance, "info", "animationThreadFinished");
            eventMgr().postEvent(anEvent);
        }
    }

    this.animationMediaOutput = function (theSimID, type, data) {
        if (sim.getSimID() != theSimID) {
            dbg().logWarning(source, 'SimID from animation: ' + theSimID + ' does not match this simulator\'s ID: ' + sim.getSimID());
            //return;
        }
        var set = null;
        if (type != 'debug' && type != Simulator.Constants.PARAM_DEBUG_OUTPUT)
            debug('Received ' + type + ' output from the animation with data "' + data + '"');
        switch (type) {
            case 'info':
                switch (data) {
                    case Simulator.Constants.ANIMATION_THREAD_FINISHED:
                    case Simulator.Constants.ANIMATION_FINISHED:
                        //if (this.getCurrentThread()) set = this.getCurrentThread().getAnimationSet();
                        //else set = lastThreadExecuted.getAnimationSet();
                        var currentElement = currentThread.getCurrentElement();
                        debug('In animationMediaOutput - currentElement = ' + ((currentElement === null) ? 'null' : currentElement.getName()));
                        if(currentElement.getBehavior() != Simulator.Constants.INTERACTIVE_ANIMATION) {
                            if (instance.getOutputs() != '') instance.recordOutputs();
                        }
                        renderNextElement(instance);
                        break;
                    case Simulator.Constants.ANIMATION_STARTED:
                        break;
                    case Simulator.Constants.ANIMATION_ABORTED:
                    case Simulator.Constants.ANIMATION_UNABLE_TO_START:
                    case 'newTrial':
                        eventMgr().postEvent(new Simulator.Event(set, 'command', 'newTrial'));
                        break;
                    default:
                }
                break;
            case Simulator.Constants.PARAM_OUTPUT:
            case Simulator.Constants.PARAM_DATA:
                whiteboard().setItem('animationOutput', 'output', data, key);
                //if (this.getCurrentThread()) set = this.getCurrentThread().getAnimationSet();
                //else set = lastThreadExecuted.getAnimationSet();
                instance.recordOutputs();
                eventMgr().postEvent(new Simulator.Event(instance, 'info', 'animationOutputAvailable'));
                break;
            case Simulator.Constants.PARAM_DEBUG_OUTPUT:
                break;
            case Simulator.Constants.ANIMATION_ERROR:
                eventMgr().postEvent(new Simulator.Event(set, 'animationError', data));
                break;
            default:
        }
    };

    this.setAttributes = function (attr, node) {
        var attr = util().getAttributes(node);
        Simulator.Animation.AnimationSet.prototype.setAttributes.call(this, attr, node);
        for (var i in attr) {
            switch (i) {
                case 'poster':
                    this.setPoster(attr[i]);
                    break;
                case 'scoreable':
                    this.setScoreable(attr[i]);
                    break;
                case 'outputs':
                    this.setOutputs(attr[i]);
                    break;
                case 'inputSource':
                    this.setInputSource(attr[i]);
                    break;
                case 'outputOnRequest':
                    this.setOutputOnRequest(attr[i]);
                    break;
            }
        }
    };

    if (sim) {
        key = whiteboard().addItem('animationOutput', 'output');
        inputSource[0] = 'evaluator';  // Set the default
        registerEvents(instance);
        renderer = new Simulator.Animation.AnimationRenderer(sim, panel, this);
    }

    // Convenience functions for debugging
    function debug(str1, str2, trace) {
        dbg().debug(source, str1, str2, trace);
    }

    function debugf(str1, str2, trace) {
        dbg().debugf(source, str1, str2, trace);
    }


};

// Inherit methods and class variables
Simulator.Animation.AnimationSet.prototype = new Simulator.SimElement();
Simulator.Animation.AnimationSet.parent = Simulator.Simulator;
Simulator.Animation.AnimationSet.prototype.constructor = Simulator.Animation.AnimationSet; // Reset the prototype to point to the current class