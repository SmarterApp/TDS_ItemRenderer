//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
﻿
/**
 * *****************************************************************************
 * @class FunctionManager 
 * @superclass NONE
 * @param none
 * @return - instance of FunctionManager
 * 
 *******************************************************************************
 */
SimParser.FunctionManager = function (eUnit) {

    // Instance variables
    var functions = []; // regular functions
    var lfunctions = []; // lookup functions
    var jfunctions = []; // javascript functions
    var that = this;
    var maxDepLevel = 0;
    var depTreeExists = false;
    var currentOrder = 0;    // temporarily store the number of functions that have been ordered
    var varCurrent = [];    // the set of variables (identified by variable names) that have already been evaluated (with some values)
    var evUnit = eUnit;
    var scoringTable = evUnit.getSimInstance().getScoringTable();
    var cMng = evUnit.getConstraintManager();

    // internal methods that are used by other class methods
    // merge two arrays
    function mergeArrays(arrayOne, arrayTwo) {
        var result = [];
        for (var i = 0; i < arrayOne.length; i++) {
            result.push(arrayOne[i]);
        }
        for (var i = 0; i < arrayTwo.length; i++) {
            result.push(arrayTwo[i]);
        }
        return result;
    }

    // returns true if all element of the first array are present in the second array
    function compareArrays(arrayOne, arrayTwo) {
        for (var i = 0; i < arrayOne.length; i++) {
            if (arrayTwo.indexOf(arrayOne[i]) === -1) {
                return false;
            }
        }
        return true;
    }
    
    // setters and getters
    this.getMaxDepLevel = function () {
        return maxDepLevel;
    }

    this.setMaxDepLevel = function (level) {
        maxDepLevel = level;
    }

    this.getFunctions = function () {
        return functions;
    }

    this.getLFunctions = function () {
        return lfunctions;
    }

    this.getJFunctions = function () {
        return jfunctions;
    }

    // retrieve functions from the xml and put them to respective arrays according to function type
    // NOTE: regular and javascript functions are handled as the same type as they use the same parser
    this.setFunctions = function (root) {
        functions = [];
        var r = root.getElementsByTagName('functions').item(0);
        if (r !== null && r.hasChildNodes()) {
            for (var i = 0; i < r.childNodes.length; i++) {
                var attr = {};
                if (r.childNodes[i].nodeName[0] === '#') {
                	continue;
                }
                for (var j = 0; j < r.childNodes[i].attributes.length; j++) {
                    attr[r.childNodes[i].attributes[j].name] = r.childNodes[i].attributes[j].nodeValue;
                }
                var newFunction = new SimParser.Function();
                newFunction.setAttributes(attr, r);
                // as per Joe's request
                if (newFunction.getScoreable() !== 'no') {
                    scoringTable.addElement(newFunction.getName(), 'output');
                }
                //Get everything into one functions array - Lookup Chaining
                // put the lookup functions in the list for lookups
                /*if (attr.type === 'lookup') {
                    lfunctions.push(newFunction);
                }
                else {*/
                    // if (attr.type === 'javascript')
                        // jfunctions.push(f);
                    //else {
                    // put all other functions in another list
                functions.push(newFunction);
                    // }
                /*}*/
            }
        }

    }

    this.getFunctionNames = function () {
        var fNames = [];
        for (var i = 0; i < functions.length; i++) {
            fNames.push(functions[i].getName());
        }
        return fNames;
    }

    // return function object by function name
    this.getFunctionByName = function (funcName) {
        for (var i = 0; i < functions.length; i++) {
            if (functions[i].getName() === funcName) {
                return functions[i];
            }
        }
        for (var i = 0; i < lfunctions.length; i++) {
            if (lfunctions[i].getName() === funcName) {
                return lfunctions[i];
            }
        }
        for (var i = 0; i < jfunctions.length; i++) {
            if (jfunctions[i].getName() === funcName) {
                return jfunctions[i];
            }
        }
    }

    // return the function by its name
    this.getLFunctionByName = function (funcName) {
        for (var i = 0; i < functions.length; i++) {
            if (lfunctions[i].getName() === funcName) {
                return lfunctions[i];
            }
        }
    }
    
    // evaluate ordered functions (i.e., functions that does not rely on dependency tree to determine the computation order)
    this.evaluateOrderedFunctions = function () {
        
        var evaluationSucceed = true;    // if there is anything that prevents evaluating an ordered function, set to false
        var iCompOrder = 0;
        
        var vMng = evUnit.getVariableManager();
        varCurrent = vMng.getVariableNames(['binding', 'constant', 'implicit', 'persistent', 'cumulative']);    // current list of evaluated variables
        // var vNext = [];
        
        for (var i=0; i<functions.length; i++) {
            if (functions[i].getOrderedEvaluation() == true) {
                // check if the function can compute using the current list of variables
                if (this.canComputeFunction(functions[i], varCurrent)) {
                    functions[i].setCompOrder(iCompOrder);
                    iCompOrder++;
                    var varNext = [];
                    varNext.push(functions[i].getValue());
                    // add the variable of the function to the list of variables that have already been evaluated
                    varCurrent = mergeArrays(varCurrent, varNext);
                }
                else {
                    EU.debug('Function evaluation cannot work because ordered function ' + functions[i].getValue() + ' cannot be evaluated');
                    evaluationSucceed = false;
                    depTreeExists = true;
                    break;
                }
            }
        }
        
        if (evaluationSucceed == true) {
            currentOrder = iCompOrder;
        }
    }

    // build a function dependency tree
    this.buildFunctionDependancyTree = function () {
        
        // evaluate ordered functions first
        this.evaluateOrderedFunctions();
        
        if (depTreeExists) {
            return;
        }
        
        var orderedFuncList = [];
        // var varCurrent = SirVariableManager.getVariableNames(['binding', 'constant', 'implicit']);
        //var varResult = SirFunctionManager.buildFuncVarMap(); // e.g. {'height': 'h', 'range': 'r'}
        var varNext = [];
        // var iCompOrder = 0;
        var iCompOrder = currentOrder;
        var iDepLevel = 0;
        var bEnd = false;
        var iTotalAmount = functions.length;
        
        while (iCompOrder < iTotalAmount && !bEnd) {
            var oldCompOrder = iCompOrder;
            for (var k = 0; k < functions.length; k++) {
                if ((functions[k].getOrderedEvaluation() == false) && (functions[k].getDepLevel() === -1) && (this.canComputeFunction(functions[k], varCurrent))) {
                    functions[k].setDepLevel(iDepLevel);
                    functions[k].setCompOrder(iCompOrder);
                    orderedFuncList.push(functions[k]);
                    iCompOrder++;
                    // add function variable that can be computed now
                    varNext.push(functions[k].getValue());
                }
            }
            iDepLevel++;
            varCurrent = mergeArrays(varCurrent, varNext);
            bEnd = !!oldCompOrder == iCompOrder;
        }
        if (iCompOrder === iTotalAmount) {
            depTreeExists = true;
        }
        else {
            EU.debug('Function evaluation cannot work because of broken dependancy tree.');
        }
        maxDepLevel = iDepLevel - 1;
    }

    // build map of function names to function variables e.g. {'height': 'h', 'range': 'r'}
    this.buildFuncVarMap = function () {
        var map = {};
        for (var i = 0; i < functions.length; i++) {
            map[functions[i].name] = functions[i].value;
        }
        return map;
    }

    // check if a function can be evaluated provided with an array of values,
    // e.g., f='x+y+z', v=['x','y','z'] - returns true but f='x+y+z', v=['x','y'] - returns false because 'z' is not provided
    this.canComputeFunction = function (func, values) {
        //Start - Lookup Chaining
        //adjusted for lookup functions
        var fvars;
        if (func.getType() == "lookup") { 
            fvars = [func.getKeyName()]; //Get Lookup variables i.e Key
        }
        else {
            fvars = func.getVarNames();
        }
        //End - Lookup Chaining
        return compareArrays(fvars, values);
    }

    // return the function by its order of computation
    this.getFunctionByCompOrder = function (order) {
        for (var i = 0; i < functions.length; i++) {
            if (functions[i].getCompOrder() === order) {
                return functions[i];
            }
        }
    }

    this.bindVars = function () {
        for (var i = 0; i < functions.length; i++) {
            functions[i].bindVariables(variables);
        }
    }

    this.evalFuncs = function () {
        var res = [];
        for (var i = 0; i < functions.length; i++) {
            res.push(functions[i].evaluateEquation());
        }
    }

    // evaluate lookup functions
    //Deprecated Function - Lookup Chaining
    this.evaluateLFunctions = function (varValueList, varNames, varValues) {
        var r = {};
        for (var i = 0; i < lfunctions.length; i++) {
            // check scoring attribute
            if (lfunctions[i].getScoreable() === 'yes') {
                var varName = lfunctions[i].getName();
                var fName = lfunctions[i].getKeyName();
                // check precondition
                if ((varName) && (cMng.evalPreConstraints(varName, varValueList))) {
                    var ind = varNames.indexOf(fName);
                    if (ind >= 0) {
                        var val = varValues[ind];
                        r[varName] = lfunctions[i].getLookupValue(val);
                        scoringTable.setValue(varName, null, r[varName]);
                    }
                }
            }
        }
        return r;
    }

    // example: evalFormula('exp(x*y)/z', {x:1, y:2, z:-1})
    var evalFormula = function (formula, variables) {
        var parser = new Parser();
        try {
            var result = parser.parse(formula).evaluate(variables);
        }
        catch (e) {
            result = e.message;
        }
        return result;

    }
    
    // evaluate javascript function (deprecated)
    this.evaluateJFunctions = function (varNames, varValues) {
        var r = {};
        var evUtils = new SimParser.Utils(evUnit);
        var v = evUtils.getVarObject(varNames, varValues); // pack regualar variables into objects
        for (var i = 0; i < jfunctions.length; i++) {
            if (jfunctions[i].getScoreable() === 'yes') {
                var varName = jfunctions[i].getName();
                if (varName) {
                    var sirF = jfunctions[i];
                    var jF = sirF.getFunction(); // this is js function object
                    v[varName] = jF; // add function as a value for the function variable
                    r[varName] = evalFormula(sirF.getEquation(), v); // evaluate the whole expression
                    scoringTable.setValue(varName, null, r[varName]);
                }
            }
        }
        return r;
    }

    // builder support
    this.getFunctionIndexByName = function (name, type) {
        var fn = this.getFunctions();
        if (type === 'lookup') var fn = this.getLFunctions();
        for (var i = 0; i < fn.length; i++) {
            if (fn[i].getName() === name) {
                return i;
            }
        }
    }

    this.createFunction = function (name, type, formula, vName) {
        var f = new SimParser.Function();
        var attr = { 'name': name, 'type': type, 'formula': formula, 'variable': vName };
        f.setAttributes(attr);

        if (attr.type === 'lookup') {
            lfunctions.push(f);
        }
        else {
            functions.push(f);
        }
    }

    this.renameEquation = function (oldName, newName) {
        var f = this.getFunctionByName(oldName);
        if (f) {
            f.setName(newName);
        }
    }

    this.updateFunction = function (name, type, formula, vName) {
        var f = this.getFunctionNames(name); // check regular functions
        if (!f) f = this.getLFunctionNames(name); // check lookup functions
        if (f) {
            var attr = { 'name': name, 'type': type, 'formula': formula, 'variable': vName };
            f.setAttributes(attr);
        }
    }

    this.deleteFunction = function (name) {
        var i = this.getFunctionIndexByName(name);
        if (i) {
            var fn = this.getFunctions();
            fn.splice(i, 1);
        }
        else {
            i = this.getFunctionIndexByName(name, 'lookup');
            if (i) {
                var fn = getLFunctions();
                fn.splice(i, 1);
            }
        }
    }

};