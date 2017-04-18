"use strict";

/**
 * Interact with the Desmos calculator.  Provide functionality to construct a Desmos calculator based on the requested
 * type.
 *
 * This script depends on the following:
 * <ul>
 *     <li>The Desmos calculator javascript file (currently in webapp/Scripts/Calculator/desmos/calculator.js)</li>
 *     <li>An element to contain the Desmos calculator</li>
 *     <li>An element to contain error messages</li>
 * </ul>
 *
 * <ul>
 *     <li>Examples of the calculators can be found here:</li>
 *     <ul>
 *         <li>Four Function: http://jsbin.com/xikibo/edit?html,output</li>
 *         <li>Scientific: http://jsbin.com/gezowisewa/edit?html,output</li>
 *         <li>Graphing/Regression: http://jsbin.com/lumecujenu/edit?html,output</li>
 *     </ul>
 *     <li>Additional documentation:</li>
 *     <ul>
 *         <li>https://www.desmos.com/api/v0.8/docs/index.html#document-expressions</li>
 *         <li>http://learn.desmos.com/</li>
 *     </ul>
 * </ul>
 */
var TdsCalculator = function() {
    /**
     * Enumerate the types of calculators that are available for use as accommodations.
     */
    var calculatorTypes = {
        GRAPHING: "graphing", // also provides support for linear regression algebra and scientific calculators
        SCIENTIFIC: "scientific",
        FOUR_FUNCTION: "basic"
    };

    /**
     * Configuration settings for the Desmos calculators.
     * <p>
     *     The settings for the graphing and scientific calculators can be found here:
     *     https://www.desmos.com/api/v0.8/docs/index.html#document-calculator
     * </p>
     */
    var calculatorConfigurations = {
        "graphing": {
            // disable displaying roots of equations
            singleVariableSolutions: false,
            // disable images, folders, and notes
            images: false,
            folders: false,
            notes: false,
            // use a non-qwerty keyboard
            qwertyKeyboard: false,
            // restrict the set of allowed methods
            restrictedFunctions: true,
            // use degrees instead of radians for trig function arguments
            degreeMode: true
        },
        "scientific": {
            // use a non-qwerty keyboard
            qwertyKeyboard: false,
            // disable function definition
            functionDefinition: false,
            // use degrees instead of radians for trig functions
            degreeMode: true
        }
    };

    /**
     * Initialize the calculator for the requested type and render it in the specified container.
     */
    var init = function() {
        var queryString = window.location.search;
        if (!queryString) {
            handleException("No calculator accommodation requested");
            return;
        }

        var container = document.getElementById("calculatorwidget");
        if (!container) {
            handleException("Could not find container to render the calculator in");
        }

        var type = getType(queryString, "mode");

        container.style.display = "block";

        return getCalculator(type, container);
    };

    /**
     * Build the requested calculator implementation and return it to the caller.
     *
     * @param {string} type The type of calculator to build
     * @param {object} container the HTML element that will contain the calculator
     * @returns {object} a Desmos calculator implementation for the specified type
     */
    var getCalculator = function(type, container) {
        var config = calculatorConfigurations[type] || {};
        var calculatorImpl = null;

        switch (type) {
            case calculatorTypes.GRAPHING:
                calculatorImpl = Desmos.GraphingCalculator(container, config);
                break;
            case calculatorTypes.SCIENTIFIC:
                calculatorImpl = Desmos.ScientificCalculator(container, config);
                break;
            case calculatorTypes.FOUR_FUNCTION:
                calculatorImpl = Desmos.FourFunctionCalculator(container, config);
                break;
            default:
                handleException("Could not find a calculator accommodation for '" + type + "' type");
                break;
        }

        return calculatorImpl;
    };

    /**
     * Get the type of calculator the student is allowed to use based on his/her accommodation(s).
     *
     * @param {string} queryString The querystring containing the parameter that describes the requested calculator
     *                               type
     * @param {string} paramName The name of the querystring parameter for which the value should be returned
     * @returns {string} A string describing the type of calculator to return
     */
    var getType = function(queryString, paramName) {
        var paramMatch = new RegExp("[?&]" + paramName + "=([^&]*)")
            .exec(queryString);

        var typeValue = paramMatch && decodeURIComponent(paramMatch[1].replace(/\+/g, " "));

        // The Desmos graphing calculator provides support for graphing, linear regression and scientific functionality
        // so if a graphing OR regression calculator accommodation is requested, return the graphing calculator type.
        if (typeValue.match(/graphing|regression/gi)) {
            return calculatorTypes.GRAPHING;
        } else if (typeValue.match(/scientific/gi)) {
            return calculatorTypes.SCIENTIFIC;
        } else if (typeValue.match(/basic/gi)) {
            return calculatorTypes.FOUR_FUNCTION;
        } else {
            return "unknown";
        }
    };

    /**
     * Display an exception message on the user interface.
     * <p>
     *     If the HTML element to display the error message cannot be found, the error message will be written to the
     *     console.
     * </p>
     *
     * @param {string} message The error message to display
     */
    var handleException = function(message) {
        var errorContainer = document.getElementById("errorDiv");
        if (!errorContainer) {
            console.log(message);
            return;
        }
        var calculatorContainer = document.getElementById("calculatorwidget");

        errorContainer.innerHTML = message;
        errorContainer.style.display = "block";

        calculatorContainer.style.display = "none";
    };

    return {
        init: init
    };
}();