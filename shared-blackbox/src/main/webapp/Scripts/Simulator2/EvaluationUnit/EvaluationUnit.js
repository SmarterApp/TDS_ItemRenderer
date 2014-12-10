/**
 * *****************************************************************************
 * @class EvaluationUnit 
 * @superclass none
 * @param sim, and instance of Simulator
 * @return - instance of EvaluationUnit
 * 
 *******************************************************************************
 */
SimParser.EvaluationUnit = function (sim) {

    // class variables
    var source = 'EvaluationUnit';
    var root;

    // initialize various manager class instances
    var vMng = new SimParser.VariableManager(this);
    var cMng = new SimParser.ConstraintManager(this);
    var rMng = new SimParser.RangeManager(this);
    // var fMng = new SimParser.FunctionManager(this);
    var simInstance = sim;
    
    var dbg = function() { return sim.getDebug(); };
    
    // initialize an instance for function evaluation class
    // var fEvaluation = new SimParser.FunctionEvaluation(this);
    
    var isRunning = false;
    
    // pseudo-element for EvaluationManager to send and receive events
    var eventElement = new Simulator.SimElement(sim);
    
    // setters and getters
    this.getVariableManager = function () {
        return vMng;
    }
    
    this.getConstraintManager = function () {
        return cMng;
    }
    
    this.getRangeManager = function () {
        return rMng;
    }
    
    this.getSimInstance = function () {
    	return simInstance;
    }
    
    var fMng = new SimParser.FunctionManager(this);
    
    this.getFunctionManager = function () {
        return fMng;
    }
    
    // initialize an instance for function evaluation class
    var fEvaluation = new SimParser.FunctionEvaluation(this);

    // evaluate a function identified by its name
    this.evaluateFunction = function (funcName) {

        var func = fMng.getFunctionByName(funcName);
        var vars = func.getVarList();
        var valueList = [];
        var results = [];

        // get all possible values from each function's variables
        for (var i = 0; i < vars.length; i++) {
            valueList.push(vars[i].getValues());
        }
        
        // create a list of all permutations
        var permList = SimParser.Permutation(valueList);

        // evaluate function for each permutation
        for (var i = 0; i < permList.length; i++) {
            // assign each permutation back to variables
            for (var j = 0; j < vars.length; j++) {
                vars[j].setValue(permList[i][j]);
            }
            // call function and save result in array
            results.push({
                params: permList[i], // values for all function variables
                result: func.evaluateEquation()      // function result
            });
        }
        return results;
    };

    //Start - Function Verifier
    //Function Verifier call to Evaluate the Functions
    this.functionVerifierEvaluation = function () {
        return runEvaluation(1);
    }
    //End - Function Verifier

    // evaluate all functions
    var runEvaluation = function (funcVerifier) {
        
        var result = false;
        var d1 = new Date();
        
        // don't start the new evaluation before the previous one completes to execute
        if (isRunning) {
        	return;
        }
        
        isRunning = true;
        try {
            try {
                if (!root) {
                    Simulator.showAlertWarning('Evaluation Unit is not loaded');
                }
                else {
                    var fCount = fMng.getFunctions().length + fMng.getLFunctions().length + fMng.getJFunctions().length;
                    if (fCount > 0) {
                        // evaluate all functions
                        if (!funcVerifier) {
                            fEvaluation.process('greedy');
                            result = true;
                        }
                        else {
                            result = fEvaluation.process('greedy');
                        }
                    }
                }
            }
            catch (e) {
                EU.debug(e.message);
            }
        }
        finally {
            isRunning = false;
        }
        
        /*
        var d2 = new Date();
        console.log('runEvaluation time:' + (d2.getTime() - d1.getTime()));
        */
        
        return result;
    };

    // load the parser with contents from the source (xml)
    this.load = function (source) {
        var d1 = new Date();
        root = source; // expect a reference to root of evaluation unit (<evaluation>)
        //root = xmlHelper.xmlParse(source);
        //!load in this exact order!
        // ranges : no dependencies
        rMng.setRanges(root);
        // implicit variables depend on ranges
        vMng.setVariables(root);
        // functions depend on variables
        fMng.setFunctions(root);
        // constraints depend on variables
        cMng.setConstraints(root);

        this.setupEvents();
        // for function we need to bind variables first
        //bindVars();
        //evalFuncs()
        //evaluateFunction('dissolve1');
        //constraints[0].bindConstraint(variables);
        
        /*
        var d2 = new Date();
        console.log('load evaluation unit from xml time:' + (d2.getTime() - d1.getTime()));
        */
    };

    // event handling
    eventElement.handleEvent = function (event) {
    	var simulationMgr = sim.getSimulationManager();
    	var eventMgr = sim.getEventManager();
        switch (event.type) {
            case 'info':
                if(simulationMgr.trialLimitReached()) {
                	return;
                }
                if (event.context === 'inputAvailable' || event.context === 'animationThreadFinished') {
                    if (runEvaluation()) {
                        // var ev = new Simulator.Event(this, 'info', 'outputAvailable', null, false);
                        // ev.postEvent();
                        eventMgr.postEvent(new Simulator.Event(this, 'info', 'outputAvailable', null, false));
                    }
                    break;
                }
            case 'command':
                if(simulationMgr.trialLimitReached()) {
                	return;
                }
                if ((event.context === 'startTrial') || (event.context === 'startAnimation')) {
                    if (runEvaluation()) {
                        // var ev = new Simulator.Event(this, 'info', 'outputAvailable', null, false);
                        // ev.postEvent();
                    	eventMgr.postEvent(new Simulator.Event(this, 'info', 'outputAvailable', null, false));
                    }
                    break;
                }
            default:
                debug(this.getName() + ': Unhandled event type received: ' + event.toString());
                return;
        }
    };

    this.setupEvents = function () {
        var r = root.getElementsByTagName('unit').item(0);
        if (r !== undefined && r !== null) {
            setEvents(eventElement, r);
        }
    };

    this.getEvents = function () {
        return eventElement;
    };

    // Create all events asociated with the element
    function setEvents(element, node) {
        var events = [];
        var attributes;
        var children = node.childNodes;
        if (children != null && children != undefined) {
            for ( var j = 0; j < children.length; j++) {
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
        var  completeWithoutOutput = false;
        for ( var k = 0; k < attributes.length; k++) {
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
    
    // Convenience function for the most frequently used Debug methods
    function debug(str1, str2, trace) {
        dbg().debug(source, str1, str2, trace);
    }
    
    function debugf(str1, str2, trace) {
        dbg().debugf(source, str1, str2, trace);
    }

};

