/*
Sortable lists interaction block.
*/

(function(TDS) {

    var Orientation = {
        Vertical: 'vertical',
        Horizontal: 'horizontal'
    }

    var CSS = {
        INTERACTION: 'interaction',
        ORDER_CHOICE: 'order-choice', // this identifies a order choice
        ORDER_GROUP: 'order-group', // this identifies a order group
        ORDER_SOURCE: 'order-source', // this gets set on a draggable/group when you start dragging
        ORDER_HOVER: 'order-hover', // this gets set on order choice when you hover it
        ORDER_PROXY: 'order-proxy'
    };

    // order interaction
    function OI(responseIdentifier, orientation) {
        this._orientation = orientation || Orientation.Vertical;
        this._groups = new Util.Structs.Map();
        this._defaultResponse = null;
        OI.superclass.constructor.call(this, responseIdentifier);
    };

    YAHOO.lang.extend(OI, TDS.Interaction);

    OI.Orientation = Orientation;
    OI.CSS = CSS;

    OI.prototype.getOrientation = function () {
        return this._orientation;
    };

    OI.prototype.createGroup = function(id, el) {
        var group = new TDS.OrderGroup(this, id, el);
        this._groups.set(id, group);
        return group;
    };

    OI.prototype.removeGroup = function (id) {
        return this._groups.remove(id);
    };

    OI.prototype.getGroup = function(id) {
        return this._groups.get(id);
    };

    OI.prototype.getGroups = function (sort) {
        var groups = this._groups.getValues();
        if (sort) {
            Util.Array.sort(groups, TDS.Interaction.compareOrder);
        }
        return groups;
    };

    OI.prototype.getGroupIdentifiers = function(sort) {
        var groups = this._groups.getValues(sort);
        return groups.map(function(group) {
            return group.getIdentifier();
        });
    };

    /************************************************************/

    // load order interaction from a group element
    OI.prototype.load = function (parentEl) {

        parentEl = YUD.get(parentEl);

        $('.interaction.order-group', parentEl).each(function (groupIdx, groupEl) {
            var groupId = TDS.Interaction.parseIdentifier(groupEl);
            var group = this.createGroup(groupId, groupEl);
            $('.interaction.order-choice', groupEl).each(function (choiceIdx, choiceEl) {
                var choiceId = TDS.Interaction.parseIdentifier(choiceEl);
                group.createChoice(choiceId, choiceEl);
            }.bind(this));
        }.bind(this));

        // save original response
        this._defaultResponse = this.getResponse();
    };

    // it is a valid response if the draggables have changed at all
    OI.prototype.validateResponse = function () {
        return (this._defaultResponse != this.getResponse());
    };

    // get the response a json object
    OI.prototype.getResponseJson = function () {

        var groupsList = [];

        // get all the groups and sort them by DOM order
        var groups = this.getGroups(true);

        groups.forEach(function (group) {

            var jsonGroup = {
                identifier: group.getIdentifier(),
                responses: []
            };

            var choices = group.getChoices(true);
            choices.forEach(function (choice) {
                jsonGroup.responses.push(choice.getIdentifier());
            });

            groupsList.push(jsonGroup);

        }, this);

        return groupsList;
    };

    // get the response as a xml document
    OI.prototype.getResponseXml = function () {
        var responseXml = Util.Xml.createDocument('interaction');
        var interactionEl = responseXml.documentElement;
        interactionEl.setAttribute('identifier', this.getResponseIdentifier());
        interactionEl.setAttribute('type', 'order');

        var groupsList = this.getResponseJson();

        Util.Array.each(groupsList, function (groupJson) {
            // <group>
            var groupNode = responseXml.createElement('group');
            groupNode.setAttribute('identifier', groupJson.identifier);
            interactionEl.appendChild(groupNode);

            Util.Array.each(groupJson.responses, function (response) {
                // <response>
                var responseNode = responseXml.createElement('response');
                responseNode.setAttribute('identifier', response);
                groupNode.appendChild(responseNode);
            });

        });

        return responseXml;
    };

    // get the response as a xml string
    OI.prototype.getResponse = function () {
        var responseXml = this.getResponseXml();
        return Util.Xml.serializeToString(responseXml);
    };

    // load a xml response string
    OI.prototype.loadResponseXml = function (xml) {

        // get root node
        var interactionNode = TDS.Interaction.parseXmlRoot(xml);
        var interaction = this;

        Util.Dom.queryTagsBatch('group', interactionNode, function (groupNode) {
            var groupIdentifier = groupNode.getAttribute('identifier');
            var group = interaction.getGroup(groupIdentifier);
            if (group) {
                var identifiers = [];
                Util.Dom.queryTagsBatch('response', groupNode, function (responseNode) {
                    var responseIdentifier = responseNode.getAttribute('identifier');
                    identifiers.push(responseIdentifier);
                });
                group.sort(identifiers);
            }
        });
    };

    OI.prototype.loadResponse = function(xmlStr) {
        var xmlDoc = Util.Xml.parseFromString(xmlStr);
        this.loadResponseXml(xmlDoc);
    }

    TDS.OrderInteraction = OI;

})(TDS);