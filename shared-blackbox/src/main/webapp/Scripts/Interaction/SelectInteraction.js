TDS.SelectInteraction = function(responseIdentifier) {
    TDS.SelectInteraction.superclass.constructor.call(this, responseIdentifier);
    this._selectElements = [];
    this._cardinalityLookup = new Util.Structs.Map();
};

YAHOO.lang.extend(TDS.SelectInteraction, TDS.ChoiceInteraction);

// add a constraint
TDS.SelectInteraction.prototype.setCardinality = function (id, min, max) {
    this._cardinalityLookup.set(id, {
        id: id,
        min: min,
        max: max
    });
};

// get the constraint for a group
TDS.SelectInteraction.prototype.getCardinality = function (id) {
    // return default constraint if not found
    return this._cardinalityLookup.get(id) || {
        id: id,
        min: 0,
        max: 0
    };
};

/*
// The maximum number of choices that can be selected by the candidate. 
// If matchChoices is 0 there is no restriction. If maxChoices is greater than 1 (or 0) 
// then the interaction must be bound to a response with multiple cardinality.
TDS.SelectInteraction.prototype.getMaxChoices = function() {
    return this._maxChoices;
};

TDS.SelectInteraction.prototype.setMaxChoices = function(maxChoices) {
    this._maxChoices = maxChoices;
};

// If minChoices is 0 then the candidate is not required to select any choices. 
// minChoices must be less than or equal to the limit imposed by maxChoices.
TDS.SelectInteraction.prototype.getMinChoices = function() {
    return this._minChoices;
};

TDS.SelectInteraction.prototype.setMinChoices = function(minChoices) {
    this._minChoices = minChoices;
};
*/

TDS.SelectInteraction.prototype.addChoice = function(choice) {
    TDS.SelectInteraction.superclass.addChoice.call(this, choice);

    // right before this choice is selected we need to validate it
    choice.subscribe('beforeSelectEvent', this._validateSelection, choice, this);
};

TDS.SelectInteraction.prototype.removeChoice = function(choice) {
    TDS.SelectInteraction.superclass.removeChoice.call(this, choice);
    choice.unsubscribe('beforeSelectEvent', this._validateSelection, choice, this);
};

// get all the choices that have been selected
TDS.SelectInteraction.prototype.getSelectedChoices = function () {
    return this.getChoices().filter(function(choice) {
        return choice.isSelected();
    });
};

// get all the choices in a group
TDS.SelectInteraction.prototype.getChoicesInGroup = function (id) {
    return this.getChoices().filter(function (choice) {
        return (id == choice.getGroupIdentifier());
    });
};

// get all the selected choices in a group
TDS.SelectInteraction.prototype.getSelectedInGroup = function (id) {
    return this.getSelectedChoices().filter(function (choice) {
        return (id == choice.getGroupIdentifier());
    });
};

// get all the group id's
TDS.SelectInteraction.prototype.getGroups = function () {
    return Util.Array.unique(this.getChoices().map(function(choice) {
        return choice.getGroupIdentifier();
    }));
};

// check if the selection can be made
TDS.SelectInteraction.prototype._validateSelection = function(id, choice) {

    var groupId = choice.getGroupIdentifier();

    // get the constraints for this group
    var cardinality = this.getCardinality(groupId);

    // get the selected choices for the group
    var choices = this.getSelectedInGroup(groupId);

    // check if max choices was met
    if (cardinality.max == 1 && choices.length > 0) {
        choices[0].deselect();
        return true;
    }
    else if (cardinality.max > 0 &&
        cardinality.max <= choices.length) {
        return false;
    }

    return true;
};

// check if the response is valid
TDS.SelectInteraction.prototype.validateResponse = function () {

    // the total min required and selected
    var totalMin = 0, 
        totalSelected = 0;

    // get all the group ids
    var groupIds = this.getGroups();

    for (var i = 0; i < groupIds.length; i ++) {

        var groupId = groupIds[i];

        // get the constraints for this group
        var cardinality = this.getCardinality(groupId);

        // get all the selected choices for the group
        var choices = this.getSelectedInGroup(groupId);
        
        // check if we have not selected enough for the min
        if (choices.length < cardinality.min) {
            return false;
        }

        totalMin += cardinality.min;
        totalSelected += choices.length;
    }

    // if nobody said a min across all groups then we need to make sure one thing has been selected
    if (totalMin == 0 && totalSelected == 0) {
        return false;
    }

    return true;
};

TDS.SelectInteraction.prototype.getResponseArray = function() {
    var selectedIdentifiers = [];
    var selectedChoices = this.getSelectedChoices();

    for (var i = 0; i < selectedChoices.length; i++) {
        var choice = selectedChoices[i];
        selectedIdentifiers.push(choice.getIdentifier());
    }

    return selectedIdentifiers;
};

// Get the response as a simple json object.
// TODO: Add group objects to selectables and use them.
TDS.SelectInteraction.prototype.getResponseJson = function () {

    var groupList = [];
    var groupLookup = {};

    // create responses
    var selectedChoices = this.getSelectedChoices();

    Util.Array.each(selectedChoices, function(choice) {
        var selectIdent = choice.getIdentifier();
        var selectEl = choice.getElement();
        var selectGroupIdent = YUD.getAttribute(selectEl, 'data-its-group') || '';

        var selectGroup = groupLookup[selectGroupIdent];

        if (selectGroup == null) {
            // create json group
            selectGroup =
            {
                responses: [],
                identifier: selectGroupIdent
            };

            groupLookup[selectGroupIdent] = selectGroup;
            groupList.push(selectGroup);
        }

        selectGroup.responses.push(selectIdent);

    });

    return groupList;
};

// Get the response as a xml document.
TDS.SelectInteraction.prototype.getResponseXml = function() {
    var responseXml = Util.Xml.createDocument('interaction');
    var interactionEl = responseXml.documentElement;
    interactionEl.setAttribute('identifier', this.getResponseIdentifier());
    interactionEl.setAttribute('type', 'selectable');

    var groupsList = this.getResponseJson();

    Util.Array.each(groupsList, function(groupJson) {
        // <group>
        var groupNode = responseXml.createElement('group');
        groupNode.setAttribute('identifier', groupJson.identifier);
        interactionEl.appendChild(groupNode);

        Util.Array.each(groupJson.responses, function(response) {
            // <response>
            var responseNode = responseXml.createElement('response');
            responseNode.setAttribute('identifier', response);
            groupNode.appendChild(responseNode);
        });

    });

    return responseXml;
};

// Get the response as xml text.
TDS.SelectInteraction.prototype.getResponse = function() {
    var responseXml = this.getResponseXml();
    return Util.Xml.serializeToString(responseXml);
};

TDS.SelectInteraction.prototype.resetResponse = function() {
    var choices = this.getChoices();
    for (var i = 0; i < choices.length; i++) {
        choices[i].deselect();
    }
};

TDS.SelectInteraction.prototype.setResponse = function(identifier) {
    var choice = this.getChoice(identifier);
    return (choice) ? choice.select() : false;
};

TDS.SelectInteraction.prototype.loadResponseIDs = function(responseIdentifiers) {
    this.resetResponse();
    responseIdentifiers.forEach(function(id) {
        this.setResponse(id);
    }.bind(this));
};

TDS.SelectInteraction.prototype.loadResponseXml = function (xml) {

    // get root node
    var interactionNode = TDS.Interaction.parseXmlRoot(xml);
    var responseIdentifiers = [];

    Util.Dom.queryTagsBatch('response', interactionNode, function(responseNode) {
        var responseIdentifier = responseNode.getAttribute('identifier');
        responseIdentifiers.push(responseIdentifier);
    });

    this.loadResponseIDs(responseIdentifiers);
};

TDS.SelectInteraction.prototype.getSelectElements = function() {
    return this._selectElements;
};

/************************************************************/

// load draggables and groups from a parent element
TDS.SelectInteraction.prototype.load = function(parent) {
    parent = YUD.get(parent);

    // get all the interactions
    var interactionElements = YUD.getElementsByClassName('interaction', null, parent);

    var selectElements = [];

    // sort out the elements
    YUD.batch(interactionElements, function(interactionEl) {
        if (YUD.hasClass(interactionEl, 'selectable')) {
            selectElements.push(interactionEl);
        }
    });

    //save selectElements array for KB shortcuts
    this._selectElements = selectElements;

    // process all the selectable elements
    for (var i = 0; i < selectElements.length; i++) {
        var selectElement = selectElements[i];
        var responseIdentifier = TDS.Interaction.parseIdentifier(selectElement);

        var choice = new TDS.SelectChoice(responseIdentifier, selectElement);
        this.addChoice(choice);
    }

    // this.setMinChoices(1);
};