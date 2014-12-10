/*
 Provides a set of common routines used in evaluation unit
 */

if (typeof(EU) === 'undefined') EU = {};

EU.debug = function(str)
{
    if (typeof debug == 'function') debug(str);
    if (typeof console == 'object') console.log(str);
};

// this function tries to identify all function that should be evaluated using 'greedy' approach
// only functions with the biggest number of variable matches is evaluated

// varsWB is an array of variable names read from the whiteboard: ['var1', 'var2', 'var3']
// varsFunc is an array of objects : [{name: 'function1', vars: ['var1', 'var2']}, {name: 'function2': vars: ['var1', 'var2']}]
// result is an array of function names that should be evaluated : ['function2', 'function3']
/**
 * *****************************************************************************
 * @class Utils 
 * @superclass none
 * @param none
 * @return - instance of Utils
 * 
 *******************************************************************************
 */
SimParser.Utils = function (vUnit) {
    
    // class variables
    var evUnit = vUnit;
    
    // retrieve the white board instance
    var whiteboard = evUnit.getSimInstance().getWhiteboard();

    this.greedyEvaluation = function (varsWB, varsFunc) {

        var varCount = new Array(varsFunc.length);
        // for each function count the number of bindable variables
        for (var i = 0; i < varsFunc.length; i++) {
            varCount[i] = countVarBindable(varsWB, varsFunc[i]);
        }
        // find maximum among bindable variables
        var iMax = 0;
        for (var i = 0; i < varCount.length; i++) {
            if (varCount[i].bindable && varCount[i].count > iMax) {
            	iMax = varCount[i].count;
            }
        }
        // return the list with the max count of bindable variables
        r = [];
        for (var i = 0; i < varsFunc.length; i++) {
            if ((varCount[i].bindable && varCount[i].count === iMax) || varCount[i].count === 0) {
            	r.push(varsFunc[i].name);
            }
        }
        return r;
    };

    // same as above but uses different approach: return ALL functions that could be evaluated, e.g. all required variables are provided
    this.fullEvaluation = function (varsWB, varsFunc) {
        var func = [];
        var vMng = evUnit.getVariableManager();
        for (var i = 0; i < varsFunc.length; i++) {
            var v = varsFunc[i].vars;
            var fBind = true;
            for (var j = 0; j < v.length; j++) {
                if ((vMng.isVarBindable(v[j])) && (varsWB.indexOf(v[j]) === -1)) {
                    fBind = false;
                    break;
                }
            }
            if (fBind) {
            	func.push(varsFunc[i]);
            }
        }
        return func;
    };

    //    this.isVarConstant = function (v) {
    //        return SirVariableManager.isVarConstant(v);
    //    }
    //    this.isVarImplicit = function (v) {
    //        return SirVariableManager.isVarImplicit(v);
    //    }
    //    this.isVarBindable = function (v) {
    //        return SirVariableManager.isVarBindable(v);
    //    }
    //    this.isVarResult = function (v) {
    //        return SirVariableManager.isVarResult(v);
    //    }

    // return the number of bindable variables for a function
    // for example, if varsWB is ['var1', 'var2', 'var3'] and varFunc is {name: 'function2': vars: ['var1', 'var2']}, the result is {count:2, bindable: true}
    // for example, if varsWB is ['var1', 'var2', 'var3'] and varFunc is {name: 'function2': vars: ['var1', 'var4']}, the result is {count:1, bindable: false} (because var4 cannot be bounded)
    this.countVarBindable = function (varsWB, varFunc) {
        var r = { count: 0, bindable: true };
        var v = varFunc.vars;
        var vMng = evUnit.getVariableManager();
        for (var i = 0; i < v.length; i++) {
            if (vMng.isVarBindable(v[i])) {
                if (varsWB.indexOf(v[i]) !== -1) {
                    r.count++;
                } else {
                    r.bindable = false;
                }
            }
        }
        return r;
    };

    // [{var1: value1}, {var2: value2}, ..., {vark: valuek}] but varj could be equal to vari
    // this function will merge values for variable with the same name into array 
    this.mergeWBVariables = function (varsWB) {
        var r = {};
        var varsWB1 = [];
        // convert to [{name:var1, value:value1},{name:var2, value:value2},.., {name:vark, value:valuek}]
        for (var i = 0; i < varsWB.length; i++) {
            for (var key in varsWB[i]) {
                varsWB1.push({ name: key, value: varsWB[i][key] });
            }
        }
        for (var i = 0; i < varsWB1.length; i++) {
            if (r[varsWB1[i].name] === undefined) {
                r[varsWB1[i].name] = [varsWB1[i].value]
            }
            else {
                r[varsWB1[i].name].push(varsWB1[i].value);
            }
        }
        var rr = [];
        for (var key in r) {
            rr.push({ name: key, value: r[key] });
        }
        return rr;
    };

    this.getWBVarNames = function (varsWB) {
        var names = [];
        for (var i = 0; i < varsWB.length; i++) {
            names.push(varsWB[i].name);
        }
        return names;
    };

    this.getWBVarValues = function (varsWB) {
        var v = [];
        for (var i = 0; i < varsWB.length; i++) {
            v.push(varsWB[i].value);
        }
        return v;
    };

    // convert element name in varNames to variable name
    this.convertElementNamesToVarNames = function (vNames) {
        r = [];
        var vMng = evUnit.getVariableManager();
        for (var j = 0; j < vNames.length; j++) {
            var v = vMng.getVariableByObjectName(vNames[j]);
            if (v) {
                r.push(v.getName());
            } else {
                EU.debug('Cannot find a varible name for element:' + vNames[j]);
                // save under original name
                r.push(vNames[j]);
            }
        }
        return r;
    };

    this.getConstantValues = function () {
        // add constants to the list
        r = { vNames: [], vValues: [] };
        var vMng = evUnit.getVariableManager();
        var c = vMng.getConstants();
        for (var i = 0; i < c.length; i++) {
            if (r.vNames.indexOf(c[i].name) === -1) {
                r.vNames.push(c[i].name);
                r.vValues.push(c[i].value);
            }
        }
        return r;
    };

    // return all implicit variables that are used in functions; it's a subset of all implicit variables declared in xml
    this.getImplicitValues = function (varFuncs) {
        var imvarsRequiredNames = [];
        var imvarsRequiredValues = [];
        var vMng = evUnit.getVariableManager();
        // get list of all implicit vars declared in xml
        var impvarsDeclaredNames = vMng.getVariableNames(['implicit']);
        for (var i = 0; i < varFuncs.length; i++) {
            var v = varFuncs[i].vars;
            for (var j = 0; j < v.length; j++) {
                if (impvarsDeclaredNames.indexOf(v[j]) >= 0) {
                	// found an implicit var
                    if (imvarsRequiredNames.indexOf(v[j]) === -1) {
                    	// if not in the list already, save
                        imvarsRequiredNames.push(v[j]);
                        // get var object
                        var sirVar = vMng.getVariableByName(v[j]);
                        // get all values and save
                        imvarsRequiredValues.push(sirVar.getValues());
                    }
                }
            }
        }
        return { 'names': imvarsRequiredNames, 'values': imvarsRequiredValues };
    };

    this.getVarObject = function(varNames, varValues) {
        var r = {};
        for (var i = 0; i < varNames.length; i++) {
            r[varNames[i]] = varValues[i];
        }
        return r;
    };

    this.getFuncVars = function () {
        vFuncs = [];
        var fMng = evUnit.getFunctionManager();
        var fn = fMng.getFunctions();
        for (var i = 0; i < fn.length; i++) {
            vFuncs.push({ name: fn[i].getName(), vars: fn[i].getVarNames() });
        }
        return vFuncs;
    };

    this.writeDataOnWhiteBoard = function (data, key1, cat, item) {
        if (typeof (whiteboard) === 'undefined') {
            EU.debug('whiteboard object not defined.');
            return;
        }
        whiteboard.addCategory(cat);
        if (!key1) {
            //key = whiteboard.addItem('evaluation', 'output');
            key1 = whiteboard.addItem(cat, item);
        }
        whiteboard.setItem(cat, item, data, key1)
        return key1;
    };

    this.readDataFromWhiteBoard = function (section, item) {
        //var vars = whiteboard.getItem('evaluation', 'input');
       var  vars = [{ 'chalk': 15 }, { 'surfaceArea': 600 }, { 'chalk': 16}];
        return vars;
    };

    this.readDataFromWhiteBoard = function (category) {
        var data = [];
        var cat = whiteboard.getCategory(category);
        if (cat !== null || cat !== undefined || cat.length !== 0) {
            for (var p in cat) {
                if (cat.hasOwnProperty(p)) {
                    var d = {};
                    d[p] = cat[p];
                    data.push(d);
                }
            }
        }
        return data;
    };

    // converts [{name: var1, value: val1},....{name: varm, value: valuem}] to {var1:val1, ... varm:valm}
    this.packVariablesforWhiteboard = function (v) {
        var vv = {};
        var vMng = evUnit.getVariableManager();
        for (var i = 0; i < v.length; i++) {
            var objName = v[i].name;
            var sirVar = vMng.getVariableByName(v[i].name);
            if (sirVar && sirVar.getType() === 'binding') {
                objName = sirVar.getObjectName();
            } 
            vv[objName] = v[i].value;
        }
        return vv;
    };
    
    // converts [{functions:[f1,..., fk], values:{val1,... valk}] to {f1:val1, ... fk:valk}
    this.packFunctionforWhiteboard = function (f, v) {
        var ff = {};
        for (var i = 0; i < f.length; i++) {
            ff[f[i]] = v[i];
        }
        return ff;
    };
    
    // return a list of function names for evaluation
    this.getFuncNames = function (algorithm, varNames, varFuncs) {
        if (algorithm === 'greedy') {
            return greedyEvaluation(varNames, varFuncs)
        } else {
            if (algorithm === 'all') {
                return this.fullEvaluation(varNames, varFuncs)
            } else {
                EU.debug('Unsupported algorithm in function evaluation');
            }
        }
    };
    
    //input : varibles:[{name:var1, value: val1},...{name:vark, value: valk}]
    //input : functions:[{name:func1, result: val1},...{name:funck, value: funck}]
    //output:{variables: {variableName1:value1, .. , variableNamek:valuek}}, {functions: {functionName1: result1, .., functionNamem: resultm}}
    this.createSingleOutput = function (varList, funcList) {
        var r = {};
        var v = {};
        var f = {};
        for (var i = 0; i < varList.length; i++) {
            v[varList[i].name] = varList[i].value;
        }

        for (var i = 0; i < funcList.length; i++) {
            f[funcList[i].name] = funcList[i].value;
        }
        r = { variables: v, functions: f };
        return r;
    };
    
    this.oddValue = function (v) {
        return ((v === undefined) || ((v === null) ||
                   ((typeof (v) === 'string') ||
                   ((typeof (v) === 'number') &&
                   ((v === Infinity) || (v === -Infinity) || (v.toString() === 'NaN'))))))
    };

}

if (!Array.prototype.indexOf)
{
    Array.prototype.indexOf = function(elt /*, from*/)
    {
        var len = this.length;

        var from = Number(arguments[1]) || 0;
        from = (from < 0)
            ? Math.ceil(from)
            : Math.floor(from);
        if (from < 0)
            from += len;

        for (; from < len; from++)
        {
            if ((from in this) && (this[from] === elt)) {
                return from;
            }
        }
        return -1;
    };
}