//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
﻿/** **************************************************************************
* @class Constraint
* @superclass none
* @param none
* @return - an instance of Constraint
*
*****************************************************************************
*/
SimParser.Constraint = function() {

    // Inherit instance variables
    SimParser.ParserItem.call(this);
    
    // class variables
    var constraint;   // constraint's clause
    var boundedConstraint; // bounded constraint, ready for evaluation
    var formulaName;  // formula's name
    var name;     // constraint's name
    var varList;     // list of variables bound to constraint
    var type;    // pre or post condition constraint

    // setters and getters
    this.getName = function () {
     return name;
    }
    
    this.setName = function (newName) {
        name = newName;
    }
    
    this.getFormulaName = function () {
        return formulaName;
    }
    
    this.setFormulaName = function (newFormulaName) {
        formulaName = newFormulaName;
    }

    this.getConstraint = function () {
        return constraint;
    }
    
    this.setConstraint = function (newConstraint) {
        constraint = newConstraint;
    }
    
    this.getType = function () {
        return type;
    }
    
    this.setType = function (newType) {
        type = newType;
    }

    this.isConstraintBindable = function (varsWB) {
        var varNames = getVarNames();
        r = true;
        for (var i = 0; i < varNames.length; i++) {
            if (varsWB.indexOf(varNames[i]) === -1) {
                r = false;
                break;
            }
        }
        return r;
    }

    this.setAttributes = function (attr, node) {
        if (attr.name !== undefined) {
            this.setName(attr.name);
        }
        if (attr.formula !== undefined) {
            this.setFormulaName(attr.formula);
        }
        if (attr.clause !== undefined) {
            this.setConstraint(attr.clause);
        }
        if (attr.type !== undefined) {
            this.setType(attr.type);
        }
    }

    // bind variables to a constraint
    this.bindConstraint = function (vars) {
        
        // clear varList
        varList = [];
        
        var c = constraint;
        
        // step 1 -- use regexp as a tokenizer
        // match tokens with variable names
        tokens = c.match(/\w+/g);
        for (var i = 0; i < tokens.length; i++) {
            for (var j = 0; j < vars.length; j++) {
                if (tokens[i] === vars[j].getName()) {
                    varList.push(vars[j]);
                    break;
                }
            }
        }

        // step 2 -- make a string 'var=value1; var2=value2;' etc for all bound variables
        var strVar = new String();
        for (var i = 0; i < varList.length; i++) {
            strVar = strVar + varList[i].getName() + '=' + varList[i].getValue() + ';';
        }

        // step 3 replace OR and AND operators with javascript's || and && (single words only not as part of variable name (ex: v1or, tand, etc)
        c = c.replace(/\bor\b/g, '||').replace(/\band\b/g, '&&');

        boundedConstraint = strVar + '(' + c +')';

        return boundedConstraint;
    }

    // evaluate the constraint
    this.evaluate = function () {
        if (boundedConstraint)
            return eval(boundedConstraint);
    }

    // retrieve the list of variables used in the constraint string
    this.getVarNames = function () {
        var c = constraint;
        var cNames = [];
        var tokens = c.match(/\w+/g);
        for (var i = 0; i < tokens.length; i++) {
            if (tokens[i].toString().toLowerCase() === 'and' || // skip and
                tokens[i].toString().toLowerCase() === 'or' ||  // skip or
                parseFloat(tokens[i] !== NaN)) {                  // skip number
                ; //skip
            }
            else {
                cNames.push(tokens[i]);
            }
        }
        return cNames;
    }
    
    this.setEname('Constraint');

}

SimParser.Constraint.prototype = new SimParser.ParserItem();
SimParser.Constraint.prototype.constructor = SimParser.Constraint;