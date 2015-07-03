//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
var SimParser = SimParser || {}; //The global nameSpace object for evaluation unit / parser

/**
* Returns the nameSpace specified and creates it if it doesn't exist
* <pre>
* Simulator.namespace('property.package');
* Simulator.namespace('Simulator.property.package');
* </pre>
* Either of the above would create Simulator.property, then
* Simulator.property.package
* 
 * This routine is adapted from the YUI YAHOO nameSpace routine
*
* @param  {String*} arguments 1-n nameSpaces to create
* @return {Object}  A reference to the last nameSpace object created
*/
SimParser.nameSpace = function() {
    var nsObj = null, parts;
    for (var i = 0; i < arguments.length; i++) {
       parts = ('' + arguments[i]).split('.');
       nsObj = SimParser;

        // Simulator is implied, so it is ignored if it is included
        for (var j = (parts[0] == 'SimParser') ? 1 : 0; j < parts.length; j++) {
              nsObj[parts[j]] = nsObj[parts[j]] || {};
              nsObj = nsObj[parts[j]];
        }
    }

    return nsObj;
};

// Create the nameSpaces
SimParser.ParserItem = SimParser.nameSpace('SimParser', 'ParserItem');
SimParser.Utils = SimParser.nameSpace('SimParser', 'Utils');
SimParser.Variable = SimParser.nameSpace('SimParser', 'Variable');
SimParser.VariableManager = SimParser.nameSpace('SimParser', 'VariableManager');
SimParser.Range = SimParser.nameSpace('SimParser', 'Range');
SimParser.RangeManager = SimParser.nameSpace('SimParser', 'RangeManager');
SimParser.Constraint = SimParser.nameSpace('SimParser', 'Constraint');
SimParser.ConstraintManager = SimParser.nameSpace('SimParser', 'ConstraintManager');
SimParser.Permutation = SimParser.nameSpace('SimParser', 'Permutation');
SimParser.Function = SimParser.nameSpace('SimParser', 'Function');
SimParser.FunctionManager = SimParser.nameSpace('SimParser', 'FunctionManager');
SimParser.FilterEvaluation = SimParser.nameSpace('SimParser', 'FilterEvaluation');
SimParser.FunctionEvaluation = SimParser.nameSpace('SimParser', 'FunctionEvaluation');
SimParser.EvaluationUnit = SimParser.nameSpace('SimParser', 'EvaluationUnit');

