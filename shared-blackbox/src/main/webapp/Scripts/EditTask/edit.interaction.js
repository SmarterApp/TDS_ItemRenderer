//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
﻿EditItem = (typeof (EditItem) == "undefined") ? {} : EditItem;

////////////////////
// Handle some wrapper logic for the edit interaction items.  THere are
// 2 item types represented here.  Most of the logic is in html side, this 
// is the non-html logic which is mostly just iterators.
EditItem.InteractionSet = function () {

    var self = this;

    // The set of interaction elements in the item
    this.interactions = [];

    // Iterate through the interaction objects, and do things to them.
    this.forEachInteraction = function (ftor) {
        for (var i = 0; i < self.interactions.length; ++i) {
            ftor.call(this,self.interactions[i]);
        }
    };

    // Get an interaction object that matches a specific criteria.
    this.getInteraction = function (ctor) {
        for (var i = 0; i < self.interactions.length; ++i) {
            if (ctor.call(this,self.interactions[i]))
                return self.interactions[i];
        }
        return null;
    };

    // Act like an array.
    this.push = function (interaction) {
        self.interactions.push(interaction);
    };

    this.get = function (i) {
        return self.interactions[i];
    };

    // Return the response for scoring
    this.getResponse = function () {
        var isValid = false;
        var responseBody = '';
        this.forEachInteraction(function (interaction) {
            isValid = isValid || interaction.getResponse().isValid; // if isValid is true when any interaction is answered in the case of multiple interactions in an item
            responseBody = responseBody + interaction.getResponse().responseBody;
        });

        var rv = '<testeeResponse>' + responseBody + '</testeeResponse>';
        return { isValid: isValid, responseBody: rv };
    };

    // Parse the XML from the server, and update the object 
    // state based on the contents.
    this.setXmlResponse = function (xmlString) {
        
        // get all the <value> elements
        var xmlDoc = Util.Xml.parseFromString(xmlString);  //<testeeResponse>
        var valueNodes = xmlDoc.getElementsByTagName('value');
        
        // loop through <value> elements to set responses
        for (var i = 0; valueNodes && i < valueNodes.length; ++i) {

            var valueNode = valueNodes[i];
            
            // find the interaction for this <value>
            var responseIdentifier = valueNode.getAttribute('responseIdentifier');
            var matchInteraction = self.getInteraction(function (interaction) {
                return interaction.getId() === responseIdentifier;
            });

            // if interaction was found then set response
            if (matchInteraction) {
                // Bug 170875: escape the entities after we get the node, since the browser unescapes them
                var value = EditItem.Html.Text.entityEncode(valueNode.textContent);
                matchInteraction.setXmlResponse(value);
            }
        }
        this.redisplay();
    };
};

// A specific interaction item. The only thing they have in common is the
// identifier.
EditItem.Interaction = function (parentIdentifier, identifier) {
    this.getId = function () {
        return identifier;
    };
    this.getParentId = function () {
        return parentIdentifier;
    };
};

// ctor for the choice interaction.  Allow clients to interate through the list of choices
EditItem.Interaction.Choice = function (parentId, identifier, shuffle, inlineChoices) {
    // inherit from Interaction
    var self = this;
    this._inlineChoices = inlineChoices; // make debugging easier...
    
    EditItem.Interaction.call(this, parentId, identifier);

    this.forEachInlineChoice = function (ftor) {
        for (var j = 0; j < inlineChoices.length; ++j) {
            ftor.call(this,inlineChoices[j]);
        }
    };

    // Get a choice from the drop-down list info that 
    // meets a criteria
    this.getInlineChoice = function (comparator) {
        for (var j = 0; j < inlineChoices.length; ++j) {
            if (comparator.call(this,inlineChoices[j])) {
                return inlineChoices[j];
            }
        }
        return null;
    };

    // Get the choice info that has 'default' flag set
    // in item.
    this.getDefaultChoice = function () {
        var rv = this.getInlineChoice(function (choice) {
            return choice.showDefault;
        });
        return rv; // no default?   Bad item.
    };

    // HTML bridge-make a unique id that can be used as a span ID for this interaction.
    this.createDivId = function () {
        return self.getParentId() + '-' + 'inlineChoiceInteraction' + '-' + self.getId();
    };

    this.get = function (i) {
        return (inlineChoices.length > i) ? inlineChoices[i] : null;
    };
    
    this.setXmlResponse = function (value) {
        // get default if nothing was provided
        if (!value) {
            var defaultChoice = this.getDefaultChoice();
            if (defaultChoice) {
                value = defaultChoice.identifier;
            }
        }
        // set the selected choice
        this.forEachInlineChoice(function(choice) {
            choice.selected = false;
            if (choice.identifier == value) {
                choice.selected = true;
            }
        });
    };
    
    this.getResponse = function () {
        var responseBody = '';
        var nonDefaultChosen = false;
        var defaultChoice = this.getDefaultChoice();
        this.forEachInlineChoice(function (choice) {
            if ((choice.selected === true) && (choice.showDefault === false)) {
                responseBody = '<value responseIdentifier="' + this.getId() + '" choiceIdentifier="' + defaultChoice.identifier + '">' + choice.identifier + '</value>\n';
                nonDefaultChosen = true;
            }
        });
        if (!nonDefaultChosen) {
            responseBody = '<value responseIdentifier="' + this.getId() + '"/>\n';
        }
        return { isValid: nonDefaultChosen, responseBody: responseBody };
    };
};

// ctor for the open text interaction.  This is simpler than the drop-down one so not much here.
EditItem.Interaction.Text = function (parentId, identifier, content) {
    this.responseValue = '';
    EditItem.Interaction.call(this, parentId, identifier);

    this.setXmlResponse= function (text) {
        this.responseValue = text;
    };

    this.createDivId = function () {
        return this.getParentId() + '-' + 'textEntryInteraction' + '-' + this.getId();
    };

    this.getContent = function () {
        return content;
    };

    this.getResponse = function () {
        if (this.responseValue && /\S/.test(this.responseValue)) {
            return { isValid: true, responseBody: '<value responseIdentifier="' + this.getId() + '">' +this.responseValue + '</value>\n' };
        } else {
            return { isValid: false, responseBody: '<value responseIdentifier="' + this.getId() + '"/>\n' };
        }
    };
};

