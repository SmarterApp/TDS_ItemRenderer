

/**
 * *****************************************************************************
 * @class InputElement 
 * @superclass SimElement
 * @param sim - The Simulator instance
 * @return - instance of an InputElement which is only used as an abstract class
 * Note - This is an abstract class
 *******************************************************************************
 */
Simulator.Input.InputElement = function (sim) {

    Simulator.SimElement.call(this, sim); // Inherit Instance variables

    // Instance variables
    var source = 'InputElement';
    var prevValue = null;
    var data = 0;
    var availableinputScopes = ['dataInput', 'animationInput', 'evaluationInput'];
    var inputScope = [];
    var saveOnChange = true;
    var key = undefined;
    var scoreable = true;
    var state = 'enabled';
    var eventsRegistered = false;
    var panel = null;
    var section = null;

    // Get required services
    var dbg = function () { return sim.getDebug(); };
    var eventMgr = function () { return sim.getEventManager(); };
    var simulationMgr = function () { return sim.getSimulationManager(); };
    var whiteboard = function () { return sim.getWhiteboard(); };
    var scoringTable = function () { return sim.getScoringTable(); };
    var simDocument = function () { return sim.getSimDocument(); };

    // Instance methods
    this.getPanel = function () {
        return panel;
    };

    this.setPanel = function (newPanel) {
        panel = newPanel;
        panel.registerIOElement(this);
        return this;
    };

    this.setSection = function (theSection) {
        section = theSection;
    };

    this.getSectionLabel = function () {
        return section.getLabel();
    };

    this.getSectionID = function () {
        return section.getSectionID();
    }

    this.createLabelID = function () {
        return this.createItemID(false, -1, this.getName() + 'Label');
    }

    this.createUnitsID = function () {
        return this.createItemID(false, -1, this.getName() + 'Units');
    }

    this.getPrevValue = function () {
        return prevValue;
    };

    this.setPrevValue = function (newPrevValue) {
        prevValue = newPrevValue;
        return this;
    };


    this.getData = function () {
        var dataArray = [];
        if (dataArray[0]) prevValue = dataArray[0];
        dataArray[0] = data;
        return dataArray;
    };

    this.setData = function (newData) {
        if (data) prevValue = data;
        data = newData;
        return this;
    };


    this.getInputScope = function () {
        return inputScope;
    };

    this.setInputScope = function (newinputScope) {
        if (newinputScope == 'globalInput') {
            for (var i = 0; i < availableinputScopes.length; i++) inputScope[i] = availableinputScopes[i];
        } else inputScope = newinputScope.split(',');
        for (var j = 0; j < inputScope.length; j++) inputScope[j] = inputScope[j].trim();
    };

    this.getSaveOnChange = function () {
        return saveOnChange;
    };

    this.setSaveOnChange = function (newSaveOnChange) {
        saveOnChange = newSaveOnChange == 'no' ? false : true;
    };


    this.onChange = function (id) {
        if (!id) id = this.getNodeID();
        var jsObj = this.getHTMLElement(id);
        //debug(source, 'In InputElement.onChange for element ' + id);
        this.recordInput(jsObj, false, true, false);
        this.postOnChangeEvents();
    };

    this.recordInput = function (obj, setDefault, recordOnChange, forcedSave) {
        var value = null;
        //debug('recording input for ' + this.getName());
        for (var i = 0; i < inputScope.length; i++) {
            if (key == undefined) key = whiteboard().addItem(inputScope[i], this.getName());
            value = this.getData(inputScope[i]);
            //debug('value = ' + value);
            if (value) {
                if (inputScope[i] == 'animationInput' && this instanceof Simulator.Input.InputElement) value = this.formatForAnimationInput(value);
                else if (inputScope[i] == 'dataInput' && this instanceof Simulator.Input.InputElement) value = this.formatForTableInput(value);
                //debug('Setting ' + this.getName() + ' to ' + value + ' in category ' + inputScope[i]);
                whiteboard().setItem(inputScope[i], this.getName(), value, key);
            }
        }
        // We don't put default values into the scoring table when they are declared, and we only write to the scoring table if the input element has
        // 'postOnChange' enabled or "forcedSave" flag is set to true (the flag is set to true only when a trial is started, in which writing
        // input element values to the scroing table is mandatory
        if (value && this.getScoreable() && !setDefault && (this.postOnChangeEnabled() || forcedSave)) {
            //debug('Recording '' + value + '' of '' + this.getName() + '' into scoring table', null, 'trace');
            scoringTable().setValue(this.getName(), simulationMgr().getTrialRowNum(recordOnChange), value);   // Trials start at 1, rows at 0
        }
    };

    this.getScoreable = function () {
        return scoreable;
    };

    this.formatForAnimationInput = function (value) {
        return value;   // Base class implementation is to do nothing
    };

    this.formatForTableInput = function (value) {
        return value;   // Base class implementation is to do nothing
    };

    this.setScoreable = function (newScoreable) {
        if (newScoreable == 'yes') scoreable = true;
        else scoreable = false;
    };

    this.getState = function () {
        return state;
    };

    this.setState = function (newState) {
        if (newState == 'disabled') state = 'disabled';
        else state = 'enabled';
    };

    this.disableInput = function () {
        var element = simDocument().getElementById(this.getNodeID());
        element.disabled = true;
        this.setState('disabled');
        //debug(element.getName() + ' disabled');
    };

    this.enableInput = function () {
        var element = simDocument().getElementById(this.getNodeID());
        element.disabled = false;
        this.setState('enabled');
        //debug(element.getName() + ' enabled');
    };

    this.getHTMLElement = function (id) {
        if (id) return simDocument().getElementById(id);  // If an id is supplied use it
        else return simDocument().getElementById(this.getNodeID());  // Default action is to use the standard mapping scheme
    };

    this.registerEvents = function () {
        if (!eventsRegistered) {
            eventMgr().registerEvent(new Simulator.Event(this, 'info', 'simulatorStateChange'), 'to');
            eventsRegistered = true;
        }
    };

    this.setAttributes = function (attr) {
        Simulator.Input.InputElement.prototype.setAttributes.call(this, attr);
        for (var i in attr) {
            switch (i) {
                case 'inputScope':
                    this.setInputScope(attr[i]);
                    break;
                case 'state':
                    this.setState(attr[i]);
                    break;
                case 'scoreable':
                    this.setScoreable(attr[i]);
                    break;
                case 'saveOnChange':
                    this.setSaveOnChange(attr[i]);
                    break;
            }
        }
    };


    // Convenience function for the most frequently used Debug methods
    function debug(str1, str2, trace) {
        dbg().debug(source, str1, str2, trace);
    }

    function debugf(str1, str2, trace) {
        dbg().debugf(source, str1, str2, trace);
    }
};

// Inherit methods and class variables
Simulator.Input.InputElement.prototype = new Simulator.SimElement();
Simulator.Input.InputElement.parent = Simulator.SimElement;
Simulator.Input.InputElement.prototype.constructor = Simulator.Input.InputElement; // Reset the prototype to point to the current class

