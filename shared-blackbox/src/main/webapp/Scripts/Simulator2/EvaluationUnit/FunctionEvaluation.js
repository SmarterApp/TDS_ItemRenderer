/**
 * *****************************************************************************
 * @class FunctionEvaluation 
 * @superclass none
 * @param none
 * @return - instance of FunctionEvaluation
 * 
 *******************************************************************************
 */
SimParser.FunctionEvaluation = function (eUnit) {

    // class variables
    var key = undefined;
    var varList = [];
    // internal list of var names
    var varNames = [];
    // internal list of var values
    var varValues = [];
    // internal list of function/var names
    var varFuncs = [];
    // internal result
    var evalResult = [];
    var isContinue = true;
    var evUnit = eUnit;
    var evUtils = new SimParser.Utils(eUnit);
    var scoringTable = function() { return evUnit.getSimInstance().getScoringTable(); };
    
    // main function to execute function evaluator
    this.process = function (p, f) {
        
        var d1 = new Date();
        
        // read data from the whiteboard and convert to internal format
        doInit(p,f);
        
        if (isContinue) {
            // run evaluation
            evalResult = doProcess(p,f);
             // do nothing if there no evaluation results
            if (evalResult.length > 0) {
                // convert data to whiteboard format and write result to the whiteboard
                doEnd();
            }
        }
        var d2 = new Date();
        //EU.debug('process time:' + (d2.getTime() - d1.getTime()));
        // return the result
        return evalResult;
    }
    
    // prepares variables for constraint/function evaluation
    // get binadable variables from the whiteboard and assign variable names from element names
    // add constant variavles and implicit variables to the list
    // convert variables to the format used internally by evaluation unit
    // var doInit = function (p, f) {
    function doInit(p, f) {
        
        varNames = [];
        varValues = [];
        varFuncs = [];
        varList = [];

        // retrieve variables from white board
        varList = evUtils.readDataFromWhiteBoard('evaluationInput', 'input');
        if (varList === undefined || varList.length === 0) {
            // leave if nothing is on the whiteboard
            isContinue = false;
            return;
        }
        
        // merge variables with the same name into single value
        var vWB = evUtils.mergeWBVariables(varList);
        varNames = evUtils.getWBVarNames(vWB);
        varValues = evUtils.getWBVarValues(vWB);

        // convert element names to var names
        varNames = evUtils.convertElementNamesToVarNames(varNames);

        // initialize a parser instance
        p = new Parser();

        // add constant values to the list;
        var c = evUtils.getConstantValues();
        for (var i = 0; i < c.vNames.length; i++) {
            varNames.push(c.vNames[i]);
            varValues.push(c.vValues[i]);
        }
        if (typeof (f) === 'undefined') {
            varFuncs = evUtils.getFuncVars(); // evaluate all functions
        } else {
           varFuncs = evUtils.getFuncVars(f); // evaluate just f function
        }

        // add implicit values to the list
        var impVars = evUtils.getImplicitValues(varFuncs);
        for (var i = 0; i < impVars.names.length; i++) {
            varNames.push(impVars.names[i]);
            varValues.push(impVars.values[i]);
        }       
    }
    
    // main method to run function evaluation
    // var doProcess = function (p, f) {
    function doProcess (p, f) {
        
        // check algorithm parameter
        var param = {};
        if (typeof (p) === 'undefined') {
            param.algorithm = 'greedy';
        }
        else {
            param.algorithm = p;
        }

        // if parameter f is empty evaluate all functions
        var fList = [];
        if (typeof (f) === 'undefined' || f === null || f === '') {
            // do nothing here. chained evaluation will take care of order

        }
        else {
            var fMng = evUnit.getFunctionManager();
            var sirF = fMng.getFunctionByName(f);
            if (sirF === undefined) {
                EU.debug('unknown function to evaluate: ' + f);
            }
            else {
                fList.push(f);
            }
        }

        // proceed with the evaluation
        var r = doProcess3();
        return r;
    }
    
    // example: evalFormula2('e^(x*y)/z', [{name:'x',value:1}, {name:'y', value:2}, {name:'z', value:-1}])
    var evalFormula2 = function (formula, variables) {
        var parser = new Parser();
        vars = {};
        // unpack variables
        for (var i = 0; i < variables.length; i++) {
            vars[variables[i].name] = variables[i].value;
        }
        try {
            var result = parser.parse(formula).evaluate(vars);
        }
        catch (e) {
            result = e.message;
        }
        return result;
    }

    // evaluation unit main pipeline for renderer support.
    // supports 1) three function types (regular, lookup, javascript)
    // 2) pre- and post-constraints
    // 3) chained evaluation for regular and javascript functions
    // 4) filters (min, max, average) for iterations
    // var doProcess3 = function () {
    function doProcess3 () {

        var fMng = evUnit.getFunctionManager();
     
        // build dependency tree first
        fMng.buildFunctionDependancyTree();
        // result variable
        var result = [];
        // retrieve persistent variables
        // var persistentVarDB = PersistentVariableDataBase.GetInstance();
        var persistentVarDB = evUnit.getSimInstance().getPersistentVariableDB();
        // get array of all permutations
        var funcCount = fMng.getFunctions().length;
        var permList = SimParser.Permutation(varValues);
        // move the definition of varValueList outside the loop
        var varValueList = [];
        // load the variable manager and constraint manager
        var vMng = evUnit.getVariableManager();
        var cMng = evUnit.getConstraintManager();
         
        for (var i = 0; i < permList.length; i++) {
            // build new list with values of the current permutation
            varValueList = [];         
            var fLastIteration = false;
            for (var k = 0; k < varNames.length; k++) {
                varValueList.push({ 'name': varNames[k], 'value': permList[i][k] });
            }
         
            // add persistent and cumulative variables to the list
            for (var k = 0; k < funcCount; k++) {
                 var sirF = fMng.getFunctionByCompOrder(k);
                 if (sirF.getValue() != null) {
                     var currentVariable = vMng.getVariableByName(sirF.getValue());
                     if ((currentVariable != null) && ((currentVariable.getType() == 'cumulative') || (currentVariable.getType() == 'persistent'))) {
                         var variableStore = currentVariable.getStore();
                         if (variableStore != null) {
                             if (persistentVarDB.getElementValue(variableStore) != null) {
                                 varValueList.push ({ 'name': sirF.getValue(), 'value': persistentVarDB.getElementValue(variableStore)});
                             }
                         }
                     }
                 }
            }
         
            // var funcVector = new Array(funcCount.length);
            var funcVector = [];
            // var varFuncVars = new Array(funcCount.length);
            var varFuncVars = [];
            var fEval = true;
            // var fn = new Array(funcCount.length);
            var fn = [];
            // evaluate global pre-condition constraints (not tied to any particular function)
            if (cMng.evalPreConstraints('', varValueList)) {
                for (var k = 0; k < funcCount; k++) {
                    var sirF = fMng.getFunctionByCompOrder(k);
                    fn[k] = sirF.getName();
                    if (cMng.evalPreConstraints(fn[k], varValueList)) {
                        /*Start - Lookup Chaining*/
                        if (sirF.getType() != "lookup") { //Regular and Javascript Functions
                            funcVector[k] = evalFormula2(sirF.getEquation(), varValueList);
                        }
                        else { //Look Up Functions
                            funcVector[k] = evalLFunction(sirF, varValueList); //Evaluate Lookup Functions
                        }/*End - Lookup Chaining*/
                        // check if the variable is 'cumulative' or 'persistent', if yes, need to update the persistent variable store, and retrieve the updated value for that variable
                        // retrieve the result variable name
                        if (sirF.getValue() != null) {
                            var currentVariable = vMng.getVariableByName(sirF.getValue());
                             if ((currentVariable != null) && (currentVariable.getType() == 'cumulative')) {
                                 var variableStore = currentVariable.getStore();
                                 if (variableStore != null) {
                                     var cumOp = currentVariable.getCumOp();
                                     var variableCumOp = '+';    // by default, if the operation is not specified, is '+'
                                     if (cumOp != null) {
                                         if (cumOp === 'add') {
                                             variableCumOp = '+';
                                         }
                                         else if (cumOp === 'multiply') {
                                             variableCumOp = '*';
                                         }
                                         else if (cumOp === 'subtract') {
                                             variableCumOp = '-';
                                         }
                                         else if (cumOp === 'divide') {
                                             variableCumOp = '/';
                                         }
                                     }
                                     // update the variable in the persistent variable store
                                     persistentVarDB.updateElement(variableStore, funcVector[k], variableCumOp);
                                     // retrieve the new value of the variable from the persistent variable store
                                     funcVector[k] = persistentVarDB.getElementValue(variableStore);
                                 }
                             }
                             else if ((currentVariable != null) && (currentVariable.getType() == 'persistent')) {
                                 var variableStore = currentVariable.getStore();
                                 if (variableStore != null) {
                                     // overwrite the value of the variable in the persistent variable store with current value
                                     persistentVarDB.updateElement(variableStore, funcVector[k], 'overwrite');
                                 }
                             }
                             // as per Joe's request
                             if (sirF.getScoreable() !== 'no') {
                                 scoringTable().setValue(fn[k], null, funcVector[k]);
                             }
                             varFuncVars[k] = { 'name': sirF.getValue(), 'value': funcVector[k] };
                             fEval = fEval && cMng.evalPostConstraints(fn[k], varValueList, varFuncVars);
                             if (!fEval) {
                                 fLastIteration = true;
                             }
                             if (currentVariable != null) {
                                 if ((currentVariable.getType() == 'cumulative') || (currentVariable.getType() == 'persistent')) {
                                     // replace the variable with the new value
                                     for (var l=0; l<varValueList.length; l++) {
                                         if (varValueList[l].name === sirF.getValue()) {
                                             varValueList[l].value = funcVector[k];
                                             break;
                                         }
                                     }
                                 }
                                 else {
                                       // add the value we just evaluated to the input variable list
                                     varValueList.push({ 'name': sirF.getValue(), 'value': funcVector[k] });
                                 }
                             }
                         }
                    }
                    else {
                         // process 'cumulative' variables in case they cannot be evaluated
                         // if the variable is 'cumulative', just take the value from previous trial (or the default value if this is the first trial
                         var currentVariable = vMng.getVariableByName(sirF.getValue());
                         if ((currentVariable != null) && (currentVariable.getType() == 'cumulative')) {
                             var variableStore = currentVariable.getStore();
                             if (variableStore != null) {
                                 funcVector[k] = persistentVarDB.getElementValue(variableStore);
                             }
                             if (sirF.getScoreable() !== 'no') {
                                 scoringTable().setValue(fn[k], null, funcVector[k]);
                             }
                             varFuncVars[k] = { 'name': sirF.getValue(), 'value': funcVector[k] };
                             fEval = fEval && cMng.evalPostConstraints(fn[k], varValueList, varFuncVars);
                             if (!fEval) {
                                 fLastIteration = true;
                             }
                            // replace the variable with the new value
                             for (var l=0; l<varValueList.length; l++) {
                                 if (varValueList[l].name === sirF.getValue()) {
                                     varValueList[l].value = funcVector[k];
                                     break;
                                 }
                             }
                        }
                    }
                }
                result.push({ 'functions': evUtils.packFunctionforWhiteboard(fn, funcVector), 'variables': evUtils.packVariablesforWhiteboard(varValueList) });
                // evaluate global post-constraints (not tied to any function)
                // if any function post-condition or any global post constraint return false -- stop further evaluation and return results produced so far
                if (fLastIteration || !cMng.evalPostConstraints('', varValueList, varFuncVars)) {
                    break; // this will leave permutation loop (i)
                }
            }
        }
        if (result.length === 0) {
            result.push({ 'functions': undefined, 'variables': undefined});
        }


        /* Commented out the Old Code for Lookups - Lookup Chaining
         add results of lfunctions to the output
        var lr = fMng.evaluateLFunctions(varValueList, varNames, varValues);
         add it to the FIRST element of result array
        if (result.length >= 0) {
            var r = result[0].functions;
            if (r) {
                for (p in lr) {
                    r[p] = lr[p];
                }
            }
        }*/
        /* Commented out the Old Code for JFunctions*/
        // add results of jfunctions to the output
        //var jr = fMng.evaluateJFunctions(varNames, varValues);
        // add it to the FIRST element of result array
        /*if (result.length >= 0) {
            var r = result[0].functions;
            if (r) {
                for (var p in jr) {
                    r[p] = jr[p];
                }
            }
        }*/
         
        // filter evaluation
        // var fe = new FilterEvaluation();
        var fe = new SimParser.FilterEvaluation(evUnit);
        result = fe.run(result);

        // write the final result to the scoring table
        if (result.length >= 0) {
            var r = result[0].functions;
            if (r) {
                for (var p in r) {
                     // fix an issue with p is 'undefined', in this case, do not write to the scoring table
                     if (p != 'undefined') {
                         scoringTable().setValue(p, null, r[p]);
                       }
                }
            }
        }
     
        return result;
    }

    //Start - Lookup Chaining
    function evalLFunction(lFunction, varValueList) {
        var keyName = lFunction.getKeyName(); // Get the keyname from the look up function
        var keyValue;
        // Get the value of the key from varValueList
        for (var i = 0; i < varValueList.length; i++) {
            var obj = varValueList[i];
            if (obj["name"] == keyName) {
                keyValue = obj["value"];
            }
        }
        return lFunction.getLookupValue(keyValue); //get the lookup value for the key and return
    }
    //End - Lookup Chaining
    
    // convert data to whiteboard format and write result to the whiteboard
    // var doEnd = function () {
    function doEnd () {

        // convert result into JSON string separated by ';' as per Joe's request
        var r = [], r1 = '', rs = evalResult, str, strCopy;
        var fMng = evUnit.getFunctionManager();

        for (var k = 0; k < rs.length; k++) {
            str = rs[k].functions;
            strCopy = {};
            if (str !== undefined) {
                // replace with proxyName
                for (var p in str) {
                    if (str.hasOwnProperty(p)) {
                        strCopy[p] = str[p];
                        if (str[p]) {
                            var sirF = fMng.getFunctionByName(p);
                            var prName = sirF.getProxyName();
                            if (prName) {
                                // str[prName] = str[p];
                                // replace all : and , with special strings before stringification
                                if (typeof str[p] === 'string') {
                                    strCopy[prName] = str[p].replace(/:/g, '\\0x1G\\').replace(/,/g, '\\0x1H\\');
                                }
                                else {
                                    strCopy[prName] = str[p];
                                }
                                // remove the key for strCopy only if the name and proxy name of a function do not match
                                if (p !== prName) delete strCopy[p];
                            }
                        }
                    }
                }
                // r.push(JSON.stringify(str) + ';');
                // use ‘\0x1D\' to separate iterations, and use ‘\0x1E\' and ‘\0x1F\' instead of , and : respectively after stringification
                r.push(JSON.stringify(strCopy).replace(/:/g, '\\0x1F\\').replace(/,/g, '\\0x1E\\') + '\\0x1D\\');
            }
        }

        r1 = r.join('');
        // retrieve all original : and , (ones before stringification
        r1 = r1.replace(/\\0x1H\\/g, ',').replace(/\\0x1G\\/g, ':');
        // remove brackets {} and repeating ;
        r1 = r1.replace(/{/g, '').replace(/}/g, '').replace(/;;/g, '');
        r1 = unescape(r1); // for ":" in lookup functions
        // remove '\0x1D\' at the end of the string
        if ((r1.length > 6)  && (r1.substring(r1.length-6, r1.length) === '\\0x1D\\')) {
            r1 = r1.substring(0, r1.length-6);
        }
        //r1 = r1.replace(/{};/g, '');
        key = evUtils.writeDataOnWhiteBoard(r1, key, 'evaluationOutput', 'output');
    }

}
