Simulator.Animation.HTML5Shell = function(sim, theSimID) {
    var source = 'HTML5Shell';
    var simURL = null;
    var iFrameID = null;
    var iFrame = null;
    var behavior = null;
    var simCallback = null;
    var simHeight = null;
    var simWidth = null;
    var simID = theSimID;
    var outputOnReq = null;
    var maxSRTimeouts = 2; // number of status request timeouts before
                            // reporting an error to the simulator
    var statusReqTimer = null;
    var statusReturnTimer = null;
    var statusReportInterval = 10 * 1000; // in milliseconds
    var statusReturnInterval = 1 * 1000; // in milliseconds
//    var animationFinishedDelayTimer = null;
    var animationFinishedDelay = 1000; // 1 second

    var dbg = function() {
        return sim.getDebug();
    };
    var utils = function() {
        return sim.getUtils();
    };
    var simDocument = function() {
        return sim.getSimDocument();
    };

    this.initialize = function(theSimID, parameters) {
        if (!simIDIsValid(theSimID)) {
            dbg().logError(source,
                    'initialize message with simID = ' + simulationID
                            + ' sent to HTML5Shell with simID = ' + simID);
            return Simulator.Constants.FAILURE;
        } else {
            iFrameID = parameters.containerID;
            iFrame = simDocument().getElementById(iFrameID);
            if (!iFrame) {
                dbg().logError(source, 'Could not get iFrame from id ' + iframeID);
                return Simulator.Constants.FAILURE;
            } else {
                simURL = iFrame.src;
                behavior = parameters.behavior;
                simWidth = iFrame.width;
                simHeight = iFrame.height;
                simCallback = parameters.callback;
                outputOnReq = parameters.outputOnReq;

                debug('In initialize');
                simWidth1 = simWidth;
                if (simID === "" && simURL === "") {
                    dbg().logError(source, "Simulation does not exist");
                    return Simulator.Constants.FAILURE;
                } else {
                    var animationParams = {
                        behavior : behavior,
                        callback : this.fromAnimationInterface,
                        simHeight: simHeight,
                        simWidth: simWidth
                    };
                    debug('animationParams.behavior = '+ animationParams.behavior);
                    debug('animationParams.simHeight = '+ animationParams.simHeight);
                    debug('animationParams.simWidth = '+ animationParams.simWidth);
                    debug('Calling init in the animation interface');
                    var status = iFrame.contentWindow.init(this, animationParams);
                    if (status === Simulator.Constants.SUCCESS) {
                        debug('Received SUCCESS from init function in animation. Link with HTML Animation established');
                        status = Simulator.Constants.ANIMATION_LOADED;
                        if (behavior !== Simulator.Constants.INTERACTIVE_ANIMATION) startStatusTimer();
                    } else {
                        dbg().logFatalError(source,
                                        'animation interface returned failure. Link with HTML Animation NOT established');
                        return Simulator.Constants.FAILURE;
                    }
                }
                return Simulator.Constants.ANIMATION_LOADED;
            }
        }
    };

    this.fromAnimationInterface = function(type, data) { // Function called by the animation interface to send data to the shell
        debug("HTML5Shell.fromAnimationInterface(), type = " + type);
        var formattedOutput = null;
        resetStatusTimer();
        switch (type) {
        case Simulator.Constants.ANIMATION_PROPERTIES:
            //returnProperties(type, data);
            formattedOutput = formatOutput(data);
            sendOutputToSimulator(type, formattedOutput);
            break;
        case Simulator.Constants.ANIMATION_REPORTING:
            if(data === Simulator.Constants.ANIMATION_ALIVE) debug('Received "I am alive" message from animation at ' + utils().getElapsedTime());
            else debug('Received "' + data + '" message from animation at ' + utils().getElapsedTime());
            break;
        case Simulator.Constants.PARAM_OUTPUT:
            formattedOutput = formatOutput(data);
            sendOutputToSimulator(type, formattedOutput);
            break;
        case Simulator.Constants.PARAM_ERROR:
        case Simulator.Constants.PARAM_INFO:
            if ((data === Simulator.Constants.ANIMATION_FINISHED) && (behavior != Simulator.Constants.INTERACTIVE_ANIMATION)) {
                processCommand(simID, Simulator.Constants.OUTPUT_REQ_CMD);
            }
            sendOutputToSimulator(type, data);
            break;
        default:
            debug("ERROR - Unrecognized type, '" + type + "' of messsage received from animationInterface.");
        }

    };

    this.animationInput = function(simulationID, type, input) { // Input function called by simulator
        debug("HTML5Shell.animationInput(): type = " + type + ", input = "
                + input);
        var inputs = null;
        if (!simIDIsValid(theSimID)) {
            return Simulator.Constants.FAILURE;
        } else {
            debug("Received message from simulator: simID = " + simID
                    + ", type = " + type + ", input = " + input);

            switch (type) {
            case Simulator.Constants.PARAM_COMMAND:
                processCommand(simulationID, input);
                break;
            case Simulator.Constants.PARAM_INFO:
                break;
            case Simulator.Constants.PARAM_INPUT:
                if (input === null || input === "") {
                    debug("Inputs not provided");
                    sendInfo(Simulator.Constants.ANIMATION_UNABLE_TO_START);
                } else {
                    inputs = parseInputs(input);
                    if (iFrame.contentWindow) {
                        iFrame.contentWindow.updateInputs(inputs);
                    }
                }
                break;
            case Simulator.Constants.PARAM_UPDATE:
                // input + play
                if (!checkID(simulationID)) {
                    dbg().logError(source, 'simID does not match!');
                    return;
                } else if (input === null || input === "") {
                    debug("Inputs not provided");
                    sendInfo(Simulator.Constants.ANIMATION_UNABLE_TO_START);
                } else {
                    inputs = parseInputs(input);
                    iFrame.contentWindow.updateInputs(inputs);
                    //sendInfo(Simulator.Constants.ANIMATION_STARTED);
                    iFrame.contentWindow.playAnimation();
                    if (behavior === Simulator.Constants.INTERACTIVE_ANIMATION) {
                            setTimeout(function() {
                                sendInfo(Simulator.Constants.ANIMATION_FINISHED);
                              }, animationFinishedDelay);
                    }                        
                    startStatusTimer();
                }
                break;
            default:
                debug("Inputs not provided");
            }
        }
    };

    var processCommand = function(simulationID, cmd) {
        debug("Received command from simulator: " + cmd);
        switch (cmd) {
        case Simulator.Constants.GET_ANIMATION_PROPERTIES:
            var properties = iFrame.contentWindow.getProperties();
            var output = formatOutput(properties);
            sendOutputToSimulator(Simulator.Constants.ANIMATION_PROPERTIES, output);
            break;
        case Simulator.Constants.PLAY_CMD:
            if (iFrame.contentWindow) {
                iFrame.contentWindow.playAnimation();
                if (behavior === Simulator.Constants.INTERACTIVE_ANIMATION) {
                    setTimeout(function () {
                        sendInfo(Simulator.Constants.ANIMATION_FINISHED);
                    }, animationFinishedDelay);
                }
                startStatusTimer();
            }
            break;
        case Simulator.Constants.STOP_CMD:
            break;
        case Simulator.Constants.REWIND_CMD:
            rewind();
            break;
        case Simulator.Constants.SET_ID_CMD:
            this.simID = simulationID;
            break;
        case Simulator.Constants.RESTART_CMD:
            reStart();
            break;
        case Simulator.Constants.OUTPUT_REQ_CMD:            
            var outputs = iFrame.contentWindow.getOutputs();
            debug("HTML5Shell.processCommand() with Simulator.Constants.OUTPUT_REQ_CMD, outputs = "
                    + outputs);
            var data = formatOutput(outputs);
            debug("Received data from formatOutput: " + data);
            sendOutputToSimulator(Simulator.Constants.PARAM_OUTPUT, data);
            break;
        case Simulator.Constants.ANIMATION_REPORT_STATUS:
            sendStatusRequest();
            break;
        default:
            dbg().logError(source, "Unknown command passed to animation");
        }
    };

    var parseInputs = function(input) {
        console.log("parseInputs(): " + input);
        inputArray = [];
        input = removeBrackets(input);
        input = removeSemi(input);

        var elements = input.split(Simulator.Constants.ITERATION_DELIMITTER);

        for ( var j = 0; j < elements.length; j++) {
            var pairs = String(elements[j]).split(
                    Simulator.Constants.PAIR_DELIMITTER);
            for ( var i = 0; i < pairs.length; i++) {
                parts = String(pairs[i]).split(
                        Simulator.Constants.KEY_VALUE_DELIMITTER);
                parts[Simulator.Constants.INPUT_NAME_PART] = removeQuotes(String(
                        parts[Simulator.Constants.INPUT_NAME_PART]).trim());
                parts[Simulator.Constants.INPUT_VALUE_PART] = removeQuotes(String(
                        parts[Simulator.Constants.INPUT_VALUE_PART]).trim());
                var values = String(parts[Simulator.Constants.INPUT_VALUE_PART])
                        .split(Simulator.Constants.MULTIPLE_VALUE_DELIMITTER);
                parts[Simulator.Constants.INPUT_VALUE_PART] = values;
                debug("Input #" + (j + 1) + ", '"
                        + parts[Simulator.Constants.INPUT_NAME_PART] + "' = "
                        + parts[Simulator.Constants.INPUT_VALUE_PART] + ";");
                inputArray[parts[Simulator.Constants.INPUT_NAME_PART]] = parts[Simulator.Constants.INPUT_VALUE_PART];
            }
        }
        return inputArray;
    };

    var rewind = function() {
        iFrame.contentWindow.gotoAndStop(Simulator.Constants.START_FRAME);
    };

    var reStart = function() {
        iFrame.contentWindow.gotoAndStop(Simulator.Constants.START_FRAME);
        iFrame.contentWindow.playAnimation();
    };

    var formatOutput = function(dataArray) {
        var str = "";
        for (key in dataArray) {
            if (str)
                str += Simulator.Constants.PAIR_DELIMITTER;
            str += key + Simulator.Constants.KEY_VALUE_DELIMITTER + dataArray[key];
        }
        return str;
    };

    var sendOutput = function() {
        var data = formatOutput();
        sendOutputToSimulator(Simulator.Constants.PARAM_OUTPUT, data);
    };

    var sendInfo = function(info) {
        sendOutputToSimulator(Simulator.Constants.PARAM_INFO, info);
    };

    var sendError = function(info) {
        sendOutputToSimulator(Simulator.Constants.PARAM_ERROR, info);
    };

    var sendOutputToSimulator = function(type, output) {
        debug("Sending simulator " + type + " message with data =  " + output.toString());
        simCallback(this.simID, type, output);
    };

    var simIDIsValid = function(simulationID) {
        if (simID === simulationID)
            return true;
        else
            return false;
    };

    var removeBrackets = function(str) {
        var rex = /[\[\]]*/gim;
        return str.replace(rex, '');
    };

    var removeSemi = function(str) {
        var rex = /[;]$/im;
        return str.replace(rex, '');
    };

    var removeQuotes = function(str) {
        var rex = /["]*/gim;
        return str.replace(rex, '');
    };

    var startStatusTimer = function() {
        if (statusReqTimer)
            clearTimeout(statusReqTimer);
        statusReqTimer = setTimeout(sendStatusRequest, statusReportInterval);
        //debug('Status timer started');
        utils().markTime();
        if (!statusReqTimer) dbg().logError(source,
                            'Could not start statusReqTimer. No "alive" messages will be sent to the animation.');
    };

    var resetStatusTimer = function() {
        debug('Status timers reset at ' + utils().getElapsedTime());
        if (statusReturnTimer)
            clearTimeout(statusReturnTimer);
        if (statusReqTimer)
            clearTimeout(statusReqTimer);
        startStatusTimer();
    };

    var sendStatusRequest = function() {
        utils().markTime();
        srTimeouts++;
        statusReturnTimer = setTimeout(statusReportTimeout,
                statusReturnInterval);
        debug('Sending number ' + srTimeouts + ' status request to animation.');
        if (iFrame.contentWindow) {
            var result = iFrame.contentWindow.statusRequest();
            if (result === Simulator.Constants.ANIMATION_ALIVE) {
                resetStatusTimer();
            }
        }
    };

    var srTimeouts = 0;
    statusReportTimeout = function() {
        debug('Status report waiting period ' + srTimeouts + ' timed out at ' + utils().getElapsedTime());
        if (srTimeouts === maxSRTimeouts) {
            debug('Sending "animationUnresponsive" message to simulator');
            sendOutputToSimulator(Simulator.Constants.PARAM_ERROR,
                    Simulator.Constants.ANIMATION_UNRESPONSIVE);
            srTimeouts = 0;
            //clearInterval(statusReturnTimer);
        }
    };

    // Convenience functions for debugging
    function debug(str1, str2, trace) {
        dbg().debug(source, str1, str2, trace);
    }

    function debugf(str1, str2, trace) {
        dbg().debugf(source, str1, str2, trace);
    }

};
