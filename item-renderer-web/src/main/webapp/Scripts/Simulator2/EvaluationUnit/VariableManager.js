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
 * @class VariableManager 
 * @superclass none
 * @param none
 * @return - instance of a VariableManager
 * 
 *******************************************************************************
 */
SimParser.VariableManager = function (eUnit) {

    // Instance variables
    var variables = []; // new Dictionary();
    var evUnit = eUnit;
    var that = this;

    // get the list of variables
    this.getVariables = function () {
        return variables;
    }

    // loads variables from xml. Parameter 'root' is a reference to the root of the evaluation unit
    this.setVariables = function (root) {
        
        variables = [];   // new Dictionary(); 
        
        // retrieve the 'variable' node from xml
        r = root.getElementsByTagName('variables').item(0);
        if (r !== null && r.hasChildNodes()) {
            for (var i = 0; i < r.childNodes.length; i++) {
                if (r.childNodes[i].nodeName[0] === '#') {
                	continue;
                }
                var attr = {};
                var rc = r.childNodes[i];
                for (var j = 0; j < r.childNodes[i].attributes.length; j++) {
                    attr[r.childNodes[i].attributes[j].name] = r.childNodes[i].attributes[j].nodeValue;
                }
                if (rc.hasChildNodes()) {
                    var vals = [];
                    for (var k = 0; k < rc.childNodes.length; k++) {
                        if (rc.childNodes[k].nodeName[0] === '#') {
                        	continue;
                        }
                        vals.push(rc.childNodes[k].textContent);
                    }
                    attr.allValues = vals;
                }
                var vr;
                // initialize variables according to the variable type
                switch (attr.type) {
                    case 'binding':
                        vr = new SimParser.BindableVariable();
                        break;
                    case 'constant':
                        vr = new SimParser.ConstantVariable();
                        break;
                    case 'implicit':
                        vr = new SimParser.ImplicitVariable();
                        var rMng = evUnit.getRangeManager();
                        attr.sirRange = rMng.getRangeByName(attr.range);
                        break;
                    case 'result':
                        vr = new SimParser.ResultVariable();
                        break;
                    case 'lookup':
                        vr = new SimParser.LookupVariable();
                        break;
                    case 'cumulative':
                        vr = new SimParser.CumulativeVariable();
                        break;
                    case 'persistent':
                        vr = new SimParser.PersistentVariable();
                        break;
                    // handle other types
                    default:
                        vr = new SimParser.Variable();
                        break;
                }

                // set variable attributes
                vr.setAttributes(attr, r);
                
                // add this variable to the list
                variables.push(vr);
            }
        }

    }

    // get the list of constant variables
    this.getConstants = function () {
        var cNames = [];
        var vars = that.getVariables();
        for (var i = 0; i < vars.length; i++) {
            if (vars[i].type === 'constant') {
                cNames.push({ name: vars[i].name, value: [vars[i].value] });
            }
        }
        return cNames;
    }
    
    // look up the variable by its name
    this.getVariableByName = function (vName) {
        var v = undefined;
        for (var i = 0; i < variables.length; i++) {
            if (variables[i].getName() === vName) {
                return variables[i];
            }

        }

    }

    // get the index of the variable by its name
    this.getVarIndexByName = function (vName) {
        for (var i = 0; i < variables.length; i++) {
            if (variables[i].getName() === vName) {
                return i;
            }

        }

    }

    // retrieve the variables with specific types given by the filter (such as ['implicit', 'constant'])
    this.getVariableNames = function (filter) {
        var vNames = [];
        for (var i = 0; i < variables.length; i++) {
            if ((filter === undefined) || (filter.indexOf(variables[i].getType()) >= 0)) {
                vNames.push(variables[i].getName());
            }
        }
        return vNames;
    }

    // retrieve the variable by object name
    this.getVariableByObjectName = function (name) {
        for (var i = 0; i < variables.length; i++) {
            if (variables[i].getObjectName() === name) {
                return variables[i];
            }

        }
    }

    // check if the variable is a bindable variable
    this.isVarBindable = function (vName) {
        var v = that.getVariableByName(vName);
        return (v === undefined) ? false : v.type === 'binding';
    }

    // check if the variable is a constant variable
    this.isVarConstant = function (vName) {
        var v = that.getVariableByName(vName);
        return (v === undefined) ? false : v.type === 'constant';
    }

    // check if the variable is an implicit variable
    this.isVarImplicit = function (vName) {
        var v = that.getVariableByName(vName);
        return (v === undefined) ? false : v.type === 'implicit';
    }

    // check if the variable is a result variable
    this.isVarResult = function (vName) {
        var v = that.getVariableByName(vName);
        return (v === undefined) ? false : v.type === 'result';
    }

    // return a list of constant variable names
    this.getConstantNames = function () {
        var cNames = [];
        var vars = that.getVariables();
        for (var i = 0; i < vars.length; i++) {
            if (vars[i].getType() === 'constant') {
                cNames.push(vars[i].getName());
            }
        }
        return cNames;
    }

    // return a list of constant variables
    this.getConstants = function () {
        var cNames = [];
        var vars = that.getVariables();
        for (var i = 0; i < vars.length; i++) {
            if (vars[i].getType() === 'constant') {
                cNames.push({ name: vars[i].getName(), value: [vars[i].getValue()] });
            }
        }
        return cNames;
    }

    // builder support
    function createVariable (name, value, type) {
        var vr = undefined;
        var attr = { 'type': type, 'name': name, 'value': value };
        // create a variable of certain type
        switch (attr.type) {
            case 'binding':
                vr = new SimParser.BindableVariable();
                break;
            case 'constant':
                vr = new SimParser.ConstantVariable();
                break;
            case 'implicit':
                vr = new SimParser.ImplicitVariable();
                attr.sirRange = SirRangeManager.getRangeByName(attr.range);
                break;
            case 'result':
                vr = new SimParser.ResultVariable();
                break;
            case 'lookup':
                vr = new SimParser.LookupVariable();
                break;
        }

        if (vr) {
            vr.setAttributes(attr);
            variables.push(vr);
            return true;
        }
        else {
            return false;
        }

    }

    this.saveVariable = function (name, value, type) {
        var v = this.getVariableByName(name);
        if (v) {
            v.setValue(value);
            v.setName(name)
        }
        else {
            createVariable(name, value, type);
        }
    }
    
    // rename a variable
    this.renameVariable = function (oldName, newName) {
        var v = this.getVariableByName(oldName);
        if (v) {
            v.setName(newName);
        }
    }

    // update the value of a variable
    this.updateVariable = function (name, value) {
        var v = this.getVariableByName(name);
        if (v) {
            var attr = { 'name': name, 'value': value }; // do not change var type on updates
            v.setAttributes(attr);
            //this.deleteVariable(name);
            //this.createVariable(name, value, type);
        }
    }

    // delete a variable by its name
    this.deleteVariable = function (name) {
        var i = this.getVarIndexByName(name);
        if (i) {
        	functions.splice(i, 1);
        }
    }

};