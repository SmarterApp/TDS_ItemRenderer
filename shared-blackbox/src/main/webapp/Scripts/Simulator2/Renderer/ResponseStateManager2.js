/** **************************************************************************
* @class ResponseStateManager
* @superclass none
* @param none
* @return ResponseStateManager instance
* Manages Responses.
*****************************************************************************
*/
Simulator.ResponseStateManager = function (sim) {

    //private variables    
    var stateDB = {};

    //#region private functions
    var persistentVarDB = function () { return sim.getPersistentVariableDB(); };

    var util = function () { return sim.getUtils(); };

    var simMgr = function () { return sim.getSimulationManager(); };


    var dbg = function () { return sim.getDebug(); };

    var scoringTable = function () { return sim.getScoringTable(); };

    var dataTable = function () { return sim.getDataTable(); };

    var simDocument = function() { return sim.getSimDocument(); };

    var setStateVarSpec = function (initNode) {
        var attr = initNode.attributes;
        if (attr.length > 0) {
            var element = attr['element'].nodeValue;
            var value = attr['value'].nodeValue;
            if (attr['persistent']) {
                if (attr['persistent'].nodeValue == 'yes') persistentVarDB().updateElement(element, value);
            }
            else stateDB[element] = value;
        }
    };

    var setInputStateSpec = function (initNode, panel) {
        var attr = initNode.attributes;
        if (attr.length > 0) {
            var element = attr['element' +
					''].nodeValue;
            var value = attr['value'].nodeValue;
            panel.setElementSelectState(element, value);
        }
    };

    var setAnimationStateSpec = function (initNode) {
        var spec = null;
        var attr = null;
        var animationStateDB = [];
        var children = initNode.childNodes;
        for (var i = 0; i < children.length; i++) {
            if (children[i].nodeName[0] != '#') {
                spec = children[i];
                attr = spec.attributes;
                if (attr.length > 0) {
                    var element = attr['element'].nodeValue;
                    var value = attr['value'].nodeValue;
                    animationStateDB[element] = value;
                }
            }
        }
        if (Object.size(animationStateDB) > 0) sim.getAnimationSet().setCurrentAnimationState(animationStateDB); 
    };

    function writeSimulationState(indent) {
        var simStateStr = indent + '<state>\n';
        var doubleIndent = indent + indent;
        var tripleIndent = doubleIndent + indent;
        for (var p in stateDB) {
            simStateStr = simStateStr + doubleIndent + '<stateSpec element="' + p + '" value="' + stateDB[p] + '" /> \n';
        }
        var store = persistentVarDB().getContents();
        for (var i in store) {
            simStateStr = simStateStr + doubleIndent + '<stateSpec element="' + i + '" value="' + store[i] + '" persistent="yes" /> \n';
        }
        var inputState = sim.getLayout().getPanelInstance(Simulator.Constants.INPUT_PANEL_NAME).saveInputElementStates(indent, '<inputSpec ', 'element="', '" value="', '" />\n'); 
        simStateStr = simStateStr + inputState;
        var displayTable = dataTable();
        if (displayTable) {
            var tableStr = displayTable.getContents(tripleIndent);
            if (tableStr) {
                simStateStr = simStateStr + doubleIndent + '<stateTableSpec id="dataTable"> \n' +
					tableStr + doubleIndent + '</stateTableSpec>';
            }
        }
        if (simMgr().getRestoreAnimationOnReload()) { 
            var animationState = sim.getAnimationSet().getCurrentAnimationState(); 
            if (animationState != undefined && animationState != null) {
                simStateStr = simStateStr + doubleIndent + '<animationStateSpec> \n';
                for (var k in animationState) {
                    simStateStr = simStateStr + tripleIndent + '<stateSpec element="' + k + '" value="' + animationState[k] + '" /> \n';
                }
                simStateStr = simStateStr + doubleIndent + '</animationStateSpec>';
            }
        }
        simStateStr = simStateStr + indent + '\n</state>\n';
        return simStateStr;
    }

    //#endregion private functions

    //#region public functions

    this.setResponseStateVariableValue = function (theVariable, theValue) {
        stateDB[theVariable] = theValue;
    };

    this.getResponseStateVariableValue = function (theVariable) {
        return stateDB[theVariable];
    };

    this.restoreSimulation = function (xmlDoc) {
        var responseSpec = xmlDoc.getElementsByTagName('responseSpec')[0];
        if (responseSpec) {
            var simState = responseSpec.getElementsByTagName('state')[0];   // Restore the state of the simulator
            var children = simState.childNodes;
            for (var i = 0; i < children.length; i++) {
                if (children[i].nodeName[0] != '#') {
                    switch (children[i].nodeName) {
                        case 'stateSpec':
                            setStateVarSpec(children[i]);
                            break;
                        case 'inputSpec':
                            setInputStateSpec(children[i], sim.getLayout().getPanelInstance(Simulator.Constants.INPUT_PANEL_NAME));
                            break;
                        case 'stateTableSpec':
                            var nextGen = children[i].childNodes;
                            for (var q = 0; q < nextGen.length; q++) {
                                if (nextGen[q].nodeName == 'stateTable') {
                                    dataTable().loadFromResponse(nextGen[q]);
                                }
                            }
                            break;
                        case 'animationStateSpec':
                            setAnimationStateSpec(children[i]);
                            break;
                    }
                }
            }
            simMgr().restoreStateVariables(stateDB);
            scoringTable().restoreResponseTable(responseSpec.getElementsByTagName('responseTable')[0]);
        }
    };

    this.saveState = function () {
        var stateStr = '<responseSpec>\n';
        // scoringTable().deleteEmptyRows();
        var responseStr = scoringTable().getContents('  ');
        stateStr += responseStr + '\n\n';
        stateStr += writeSimulationState('  ');
        stateStr += '\n</responseSpec>';
        return stateStr;
    };


    // Convenience function for the most frequently used Debug methods
    function debug(str1, str2, trace) {
        dbg().debug(source, str1, str2, trace);
    }
    
    function debugf(str1, str2, trace) {
        dbg().debugf(source, str1, str2, trace);
    }
    //#endregion
};