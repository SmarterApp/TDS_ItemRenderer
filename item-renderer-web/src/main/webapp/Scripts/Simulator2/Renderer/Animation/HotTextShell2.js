//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
/** **************************************************************************
* @class HotTextShell
* @superclass none
* @param sim
* @return HotTextShell instance
* Adaptor for interacting between hot elements and Simulator. Similar to SimulationShell interface for flash animations.
*****************************************************************************
*/
Simulator.Animation.HotTextShell = function (sim) {

    //private variables
    var interactions = [];
    var dictionary = new Object();
    var source = 'HotTextShell';
    var inlineDataID = null;

    var dbg = function () {
        return sim.getDebug();
    };
    var utils = function () {
        return sim.getUtils();
    };
    var simDocument = function () {
        return sim.getSimDocument();
    };

    //private functions 
    function generateOutputStr(simID) {
        var output = '';
        var semicolon = '\\0x1D\\'; //to separate iterations
        var comma = '\\0x1E\\'; //to separate data groups
        var colon = '\\0x1F\\'; //to separate a key and value in a key-value group
        var formattedResponse = '';
        var rawResponse = '';
        var responseText = '';
        var interactionType = '';
        var itemId = inlineDataID;

        var responseXMLString, interaction, returnString;
        if (interactions.length > 0) {
            for (var j = 0; j < interactions.length; j++) {
                interaction = interactions[j];
                rawResponse = interaction.getResponse();
                if (interaction instanceof TDS.DDInteraction) {
                    //TODO; use more robust response method for DDinteraction
                    if (interactionType)
                        interactionType += '|' + 'draggable';
                    else
                        interactionType += 'draggable';
                }
                else if (interaction instanceof TDS.SelectInteraction) {
                    if (interactionType)
                        interactionType += '|' + 'selectable';
                    else
                        interactionType += 'selectable';
                    var selectionChoices = interaction.getSelectedChoices();
                    var selectedChoicesLength = 0;
                    if (selectionChoices)
                        selectedChoicesLength = selectionChoices.length;
                    for (var i = 0; i < selectedChoicesLength; i++) {
                        if (i == 0) {
                            formattedResponse = selectionChoices[i].getIdentifier();
                            responseText = selectionChoices[i].getElement().innerHTML.replace(/<[^>]*>/gi, '').replace(/&.{4};/gi, '');
                        }
                        else {
                            formattedResponse += '|' + selectionChoices[i].getIdentifier();
                            responseText += '|' + selectionChoices[i].getElement().innerHTML.replace(/<[^>]*>/gi, '').replace(/&.{4};/gi, '');
                        }
                    }
                }
            }

            var xml = [];
            xml.push('<interactions>');
            xml.push(rawResponse);
            xml.push('</interactions>');
            rawResponse = xml.join('');

            output += 'itemId' + colon + inlineDataID + comma;
            output += 'interactionType' + colon + interactionType + comma;
            output += 'formattedResponse' + colon + formattedResponse + comma;
            output += 'rawHTResponseRC' + colon + rawResponse + comma;
            output += 'responseText' + colon + responseText;
        }
        return output;
    }

    //public functions
    this.initialize = function (simID, parameters) {
        inlineDataID = parameters.inlineDataID;
        var itemContainer = simDocument().getElementById(parameters.containerID);
        var id_postfix = '-interaction-' + simID;

        // drag drop
        var ddInteraction = new TDS.DDInteraction('dd' + id_postfix);
        ddInteraction.load(itemContainer);

        if (ddInteraction.getDraggables().length > 0) {
            interactions.push(ddInteraction);
        }

        // selectable
        var selectInteraction = new TDS.SelectInteraction('select' + id_postfix);
        selectInteraction.load(itemContainer);

        var numChoices = selectInteraction.getChoices().length;

        if (numChoices > 0) {
            interactions.push(selectInteraction);
            if (!parameters.outputOnReq)
                for (var i = 0; i < numChoices; i++) {
                    selectInteraction.getChoices()[i].subscribe('selectEvent', function () { sim.getAnimationSet().animationMediaOutput(simID, 'output', generateOutputStr(simID)) });
                    selectInteraction.getChoices()[i].subscribe('deselectEvent', function () { sim.getAnimationSet().animationMediaOutput(simID, 'output', generateOutputStr(simID)) });
                }
        }

        if (interactions.length) {
            sim.getAnimationSet().animationMediaOutput(simID, 'info', 'animationLoaded');
        }
        else {
            sim.getAnimationSet().animationMediaOutput(simID, 'info', 'animationError');
        }
    }

    this.animationInput = function (simID, type, content) {
        if (type == 'command') {
            switch (content) {
                case 'outputRequest':
                    {
                        var output = generateOutputStr(simID);
                        sim.getAnimationSet().animationMediaOutput(simID, 'output', output);
                        break;
                    }
                case 'play':
                    {
                        sim.getAnimationSet().animationMediaOutput(simID, 'info', 'animationStarted');
                        sim.getAnimationSet().animationMediaOutput(simID, 'info', 'animationFinished');
                        break;
                    }
                default:
                    break;
            }
        }
    }

    this.animationIONames = function () {
        //return 'output:itemId|interactionType|formattedResponse|rawResponse|responseText'
        return 'output' + Simulator.Constants.KEY_VALUE_DELIMITTER + 'itemId' + Simulator.Constants.MULTIPLE_VALUE_DELIMITTER + 'interactionType' + Simulator.Constants.MULTIPLE_VALUE_DELIMITTER + 'formattedResponse' + Simulator.Constants.MULTIPLE_VALUE_DELIMITTER + 'rawHTResponseRC' + Simulator.Constants.MULTIPLE_VALUE_DELIMITTER + 'responseText' + Simulator.Constants.PAIR_DELIMITTER;
    }

    // Convenience functions for debugging
    function debug(str1, str2, trace) {
        dbg().debug(source, str1, str2, trace);
    }

    function debugf(str1, str2, trace) {
        dbg().debugf(source, str1, str2, trace);
    }
}