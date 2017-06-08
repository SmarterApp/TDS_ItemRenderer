//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
YAHOO.namespace("tool.CoverageFormat");

/**
 * Returns the coverage report in JSON format. This is the straight
 * JSON representation of the native coverage report.
 * @param {Object} coverage The coverage report object.
 * @return {String} A JSON-formatted string of coverage data.
 * @method JSON
 * @namespace YAHOO.tool.CoverageFormat
 */
YAHOO.tool.CoverageFormat.JSON = function(coverage){
    return YAHOO.lang.JSON.stringify(coverage);
};

/**
 * Returns the coverage report in a JSON format compatible with
 * Xdebug. See <a href="http://www.xdebug.com/docs/code_coverage">Xdebug Documentation</a>
 * for more information. Note: function coverage is not available
 * in this format.
 * @param {Object} coverage The coverage report object.
 * @return {String} A JSON-formatted string of coverage data.
 * @method XdebugJSON
 * @namespace YAHOO.tool.CoverageFormat
 */
YAHOO.tool.CoverageFormat.XdebugJSON = function(coverage){
    var report = {},
        prop;
    for (prop in coverage){
        if (coverage.hasOwnProperty(prop)){
            report[prop] = coverage[prop].lines;
        }
    }

    return YAHOO.lang.JSON.stringify(report);        
};

