EditItem = (typeof (EditItem) == "undefined") ? {} : EditItem;

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
    this.getXmlResponse = function () {
        var responseBody = '';
        this.forEachInteraction(function (interaction) {
            responseBody = responseBody + interaction.getXmlResponse();
        });

        if (responseBody.length == 0)
            return '';
        var rv = '<testeeResponse>' + responseBody + '</testeeResponse>';
        return rv;
    };

    // Parse the XML from the server, and update the object 
    // state based on the contents.
    this.setXmlResponse = function (xmlString) {
        var xmlDoc = Util.Xml.parseFromString(xmlString);
        var nodeAr = xmlDoc.getElementsByTagName('value');
        for (var i = 0; nodeAr && i < nodeAr.length; ++i) {
            var matchInteraction = self.getInteraction(function (interaction) {
                var id = nodeAr[i].getAttribute('responseIdentifier');
                return interaction.getId() == id;
            });

            if (matchInteraction) {
                var node = nodeAr[i];
                var newValue = '';
                if (!node.getAttribute('choiceIdentifier')) {
                    for (var j = 0; j < node.childNodes.length; ++j) {
                        var inner = node.childNodes[j];
                        newValue = newValue + Util.Xml.serializeToString(inner);
                    }
                } else {
                    newValue = newValue + node.getAttribute('choiceIdentifier');
                }
                matchInteraction.setXmlResponse(newValue);
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
    
    this.setXmlResponse = function (string) {
        
        this.forEachInlineChoice(function(choice) {
            choice.selected = false;
            if (choice.identifier == string) {
                choice.selected = true;
            }
        });
        
        
    };
    
    this.getXmlResponse = function () {
        var responseBody = '';
        this.forEachInlineChoice(function (choice) {
            if ((choice.selected === true) && (choice.showDefault === false))
                responseBody = '<value responseIdentifier="' + this.getId() + '" choiceIdentifier="' + choice.identifier + '">' + choice.identifier + '</value>\n';
        });
        return responseBody;
    };

};

// ctor for the open text interaction.  This is simpler than the drop-down one so not much here.
EditItem.Interaction.Text = function (parentId, identifier, content) {
    var self = this;
    this.responseValue = '';
    EditItem.Interaction.call(this, parentId, identifier);

    this.setXmlResponse= function (xmlString) {
        this.responseValue = xmlString;
    };

    this.createDivId = function () {
        return this.getParentId() + '-' + 'textEntryInteraction' + '-' + this.getId();
    };

    this.getContent = function () {
        return content;
    };

    this.getXmlResponse = function () {
        if (self.responseValue && /\S/.test(self.responseValue))
            return '<value responseIdentifier="' + this.getId() + '">' + self.responseValue + '</value>\n';

        return '';
    };
};

