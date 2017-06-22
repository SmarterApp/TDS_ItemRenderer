//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
// Collection of MC/MS items
var EBSR = function (xmlString, item) {
    this._xmlString = xmlString;
    var ebsrItem = this;
    this._position = item.position;
    

    // Parse choiceInteraction XML tags into array
    var nodes = Util.Xml.parseFromString(xmlString);
    var docElement = nodes.documentElement;
    this.interactionsXml = docElement.getElementsByTagName('choiceInteraction');
    this._interactions = [];
    this._interactionHash = {};

    $.each(this.interactionsXml, function (i, interactionXml) {
        // Set up the Option processing class based on interaction type
        var contentOptionClass = [];
        contentOptionClass["MS"] = EBSR.MSOption;
        contentOptionClass["MC"] = EBSR.MCOption;

        // parse each interaction
        var interaction = new EBSR.QTI(interactionXml, item.position, contentOptionClass, i + 1);
        // overload the getItem method, returning the EBSR item
        interaction.options.getItem = function () {
            return item;
        };

        // add the processed MC/MS interaction to the EBSR item
        ebsrItem.addInteraction(interaction);
    });

};

// Add a choiceInteraction (either an MC or MS sub-item) to the EBSR item
EBSR.prototype.addInteraction = function(interaction) {
    // store interaction
    this._interactions.push(interaction);
    this._interactionHash[interaction.responseId] = interaction;
};

// get all choiceInteractions for this EBSR item
EBSR.prototype.getInteractions = function() {
    return this._interactions;
};

// get prompt nodes for all interactions in this EBSR item
EBSR.prototype.getPrompts = function() {
    var interactions = this.getInteractions();
    var prompts = [];
    Util.Array.each(interactions, function(interaction) {
        var prompt = interaction.getPrompt();
        if (prompt && prompt.length == 1) {
            prompts.push(prompt[0]);
        }
    });
    return prompts;
};

// Get an interaction based on it's key
EBSR.prototype.getInteractionByKey = function (key) {
    var interactions = this.getInteractions();
    var targetInteraction = {};
    Util.Array.each(interactions, function(interaction) {
        if (interaction.key == key) {
           targetInteraction = interaction;
        }
    });
    return targetInteraction;
};

// Get an interaction based on it's responseId
EBSR.prototype.getInteraction = function (key) {
    return this._interactionHash[key];
};

// Traverse all interactions to find the option that matches the focusedComponent
EBSR.prototype.getFocusedOption = function (focusedComponent) {
    for (var i = 0; i< this._interactions.length; i++) {
        var options = this._interactions[i].getOptions();
        for (var j = 0; j < options.length; j++) {
            var option = options[j];
            if (option.getElement() == focusedComponent) return option;
        }
    }
};


// Remove all <choiceInteraction> tags, and place remaining content into the Stem
// NOTE: At time of writing, ITS had no plans for any structures outside of the <choiceInteraction> tags
EBSR.prototype.populateStem = function () {

    // Get the contents from XML
    if (this._xmlString == null) return;

    // build xml based on <itemBody>
    var xmlDoc = Util.Xml.parseFromString(this._xmlString);
    var itemBodyNode = xmlDoc.documentElement;

    // remove all choice interactions
    $('choiceInteraction', itemBodyNode).remove();

    // write out stem html
    $("#Stem_" + this._position).html(Util.Xml.innerHTML(itemBodyNode));

};

// Generate the HTML DOM structure for the EBSR item, and all sub-item interactions/options
EBSR.prototype.generateHTML = function (answerContainer) {
    var interactions = this.getInteractions();

    // parse each interaction into HTML
    Util.Array.each(interactions, function (interaction) {
        interaction.generateInteractionHTML(answerContainer);
    });
};

//  Compile the list of components for all sub-items for keyboard navigation
EBSR.prototype.getAllComponentLists = function () {
    var componentList = [];
    var interactions = this.getInteractions();

    // fetch componentList for each interaction
    Util.Array.each(interactions, function (interaction) {
        var interactionComponentList = interaction.getComponentList();
        componentList = componentList.concat(interactionComponentList);
    });

    return componentList;
};

// Compile the list of radio buttons for all sub-items
EBSR.prototype.getAllRadioButtons = function () {
    var radioButtons = [];
    var interactions = this.getInteractions();

    // fetch componentList for each interaction
    Util.Array.each(interactions, function (interaction) {
        var interactionRadioButtons = interaction.getRadioButtons();
        radioButtons = radioButtons.concat(interactionRadioButtons);
    });

    return radioButtons;
};


// Preset the answer to item provided in 'value'
EBSR.prototype.setValue = function (value) {

    // make sure valid response
    if (typeof value != 'string' || 
        value.indexOf('<itemResponse>') == -1) {
        return false;
    }

    var ebsr = this;

    // Parse choiceInteraction XML tags into array
    var nodes = Util.Xml.parseFromString(value);
    var docElement = nodes.documentElement;

    // iterate over <response> nodes
    $('response', docElement).each(function (responseIdx, responseNode) {
        var responseId = responseNode.getAttribute('id');
        var interaction = ebsr.getInteraction(responseId);
        if (interaction && interaction.options) {
            interaction.options.clear(); // Bug 112020 - clear selections before loading new values
            // iterate over <value> nodes in a <response>
            $('value', responseNode).each(function (valueIdx, valueNode) {
                var optionId = $(valueNode).text();
                if (optionId) {
                    // select the option key
                    var option = interaction.options.getOption(optionId);
                    if (option) {
                        option.select(true);
                    }
                }
            });
        }
    });

    return true;
};

// Create the response XML document
// TODO: handle shuffle.  ITS doesn't currently support shuffle
EBSR.prototype.getResponse = function() {
    // build response xml with all interactions
    var responseEl = ['<itemResponse>'];

    var interactions = this.getInteractions();
    var createSelectedNode = function (selected) {
        if (selected) {
            responseEl.push('<value>');
            responseEl.push(selected);
            responseEl.push('</value>');
        }
    };

    Util.Array.each(interactions, function(interaction) {
        // build group node
        responseEl.push('<response id="' + interaction.responseId + '">');

        // build response node
        var selected = interaction.options.getSelected();

        if (interaction.type.toUpperCase() == "MS") {
            for (var i = 0; i < selected.length; i++) {
                createSelectedNode(selected[i]);
            }
        } else {
            createSelectedNode(selected);
        }
        responseEl.push('</response>');
    });

    responseEl.push('</itemResponse>');
    return responseEl.join('');
};

// Has the EBSR item been answered?  All sub-items must have a option selected
// TODO: validate min/maxChoice constraints
EBSR.prototype.isValid = function() {
    var interactions = this.getInteractions();
    var response = true;
    Util.Array.each(interactions, function (interaction) {
        var selected = interaction.options.getSelected();
        // Bug 112670 MS interactions return selected = [], MC return selected = null, check both
        if (!selected || selected.length == 0) {
            response = false;
        }
    });
    return response;
};

// If no MC or MS option has been selected yet then this will be true. 
EBSR.prototype.isEmpty = function() {
    var interactions = this.getInteractions();
    // all the interactions have to have no response to be empty
    return interactions.every(function (interaction) {
        var selected = interaction.options.getSelected();
        if (interaction.type == 'MC') {
            // MC is a string (null if no response)
            return (!selected);
        } else if (interaction.type == 'MS') {
            // MS is an array
            return selected.length == 0;
        }
        // interactions can only be MC/MS.. so can we ever get here? Bruce?
        return true; 
    });
};

