EditItem = (typeof (EditItem) == "undefined") ? {} : EditItem;

///////////////////////
// Parser.  Parse the editItem xml into js object.
////
//   an Edit item contains valid html markup in its xml, with 
//   specific tags interspersed that contain the qti item rendering content.
//   we need to go through and store the qti information, then remove the non-html
//   tags.
EditItem.Parse = function (id) {

    // Unique ID for things in this table
    this.mid = id;
    var self = this;

    //var item = ContentManager.getItem(id);

    // There are really 2 different edit items and we handle them together.  Keep the parsed data in here.
    this.choiceInteractions = new EditItem.Html.Choice();
    this.textInteractions = new EditItem.Html.Text();

    // Legacy function to read the file in from URL (used in development/unit testing).  Not
    // used in student app/preview
    this.createFromFile = function (xmlUrl) {
        var xmlhttp;

        if ((typeof (window.XMLHttpRequest) == "function") ||
          (typeof (window.XMLHttpRequest) == "object")) {// code for IE7+, Firefox, Chrome, Opera, Safari
            xmlhttp = new XMLHttpRequest();
        }
        else {// code for IE6, IE5
            xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
        }
        xmlhttp.open("GET", xmlUrl, false);
        xmlhttp.send();
        var xmlDoc = xmlhttp.responseText;
        return this.createFromXml(xmlDoc);
    };

    // Create shell-unique identifier for this interaction block.
    this.createDivId = function (nodeType, identifier) {
        return self.mid + '-' + nodeType + '-' + identifier;
    };

    // To convert xml into html, we need to traverse the DOM and preserve only the html parts.
    // The edit xml specifications are removed and replaced with a span, to be used during rendering.
    var fixXmlTasks;

    // First recurse through DOM and identify any nodes that are to be removed.
    var fixXmlRecurse = function (parentNode) {
        for (var i = 0; i < parentNode.childNodes.length; ++i) {
            var childNode = parentNode.childNodes[i];
            if ((childNode.nodeName == 'inlineChoiceInteraction') ||
                (childNode.nodeName == 'textEntryInteraction')) {
                var obj = {
                    parent: parentNode,
                    child: childNode
                };
                fixXmlTasks.push(obj);
            } else
                fixXmlRecurse(childNode);
        }
    };

    // Identify and remove xml tags that are not valid html.
    var fixXml = function (xmlDoc, parentNode) {
        fixXmlTasks = [];
        fixXmlRecurse(parentNode);
        // Now remove them.
        for (var i = 0; i < fixXmlTasks.length; ++i) {
            var span = xmlDoc.createElement('span');
            var parent = fixXmlTasks[i].parent;
            var child = fixXmlTasks[i].child;
            var identifier = YUD.getAttribute(child, 'responseIdentifier');
            var nid = self.createDivId(child.nodeName, identifier);
            span.setAttribute('id', nid);
            // HTML doesn't like self-closing spans, so put some space in there.
            Util.Dom.setTextContent(span, ' ');
            parent.replaceChild(span, child);
        }
    };

    // The whole item is embedded in 'item body' tag.  Remove that since it's not valid HTML.
    var removeItemBody = function (doc) {
        var itemBody = doc.getElementsByTagName('itemBody');
        if (itemBody && itemBody.length) {
            // There should just be one, but just in case...
            if (itemBody && itemBody.length == 1) {
                var bodyElement = itemBody[0];
                var ndiv = doc.createElement('div');
                var bodyChildren = YUD.getChildren(bodyElement);
                for (var j = 0; j < bodyChildren.length; ++j) {
                    var childNode = bodyChildren[j];
                    var childClone = childNode.cloneNode(true);
                    ndiv.appendChild(childClone);
                }
                bodyElement.parentNode.replaceChild(ndiv, bodyElement);
            }
        }
    };

    // For inline choice interactions, parse those xml elements and save them to an array.
    var parseChoiceInteractions = function (xmlElements) {
        var interactionElements = xmlElements.getElementsByTagName('inlineChoiceInteraction');
        for (var i = 0; i < interactionElements.length; ++i) {
            var interactionElement = interactionElements[i];
            var choices = interactionElement.getElementsByTagName('inlineChoice');

            // Interactions have an identifier and 'shuffle'.
            var interactionObj = {
                identifier: YUD.getAttribute(interactionElement, 'responseIdentifier'),
                shuffle: YUD.getAttribute(interactionElement, 'shuffle'),
                inlineChoices: []
            };

            // choices each have their own tags, with identifier attribute and some html content.
            for (var j = 0; j < choices.length; ++j) {
                var choice = choices[j];
                var obj = {
                    identifier: YUD.getAttribute(choice, 'identifier'),
                    showDefault: ((YUD.getAttribute(choice, 'default') == 'true') ? true : false),
                    content: ''
                };
                // Concatenate all the content nodes together into a string, we will put them into a span later.
                for (var k = 0; k < choice.childNodes.length; ++k) {
                    var cnode = choice.childNodes[k];
                    var cstr = Util.Xml.serializeToString(cnode);
                    obj.content = obj.content + cstr;
                }
                interactionObj.inlineChoices.push(obj);
            }

            // Create the new object with the parsed information.
            var choiceInteraction = new EditItem.Interaction.Choice(
                id, interactionObj.identifier, interactionObj.shuffle, interactionObj.inlineChoices);

            self.choiceInteractions.push(choiceInteraction);
        }
    };

    // For edit interactions, parse those parts and save them to an array.
    var parseTextInteractions = function (xmlElements) {
        var interactionElements = xmlElements.getElementsByTagName('textEntryInteraction');

        for (var i = 0; i < interactionElements.length; ++i) {
            var interactionElement = interactionElements[i];
            var interactionObj = {
                identifier: YUD.getAttribute(interactionElement, 'responseIdentifier'),
                content: ''
            };
            for (var k = 0; k < interactionElement.childNodes.length; ++k) {
                var cnode = interactionElement.childNodes[k];
                var cstr = Util.Xml.serializeToString(cnode);
                interactionObj.content = interactionObj.content + cstr;
            }
            var editObj = new EditItem.Interaction.Text(id, interactionObj.identifier, interactionObj.content);
            self.textInteractions.push(editObj);
        }
    };

    // Student app sends us xml doc in one big string.  Parse it.
    this.createFromXml = function (xmlString,container) {

        var xmlDoc = Util.Xml.parseFromString(xmlString);

        // Remove the outer tag and replace it with html-friendly div.
        removeItemBody(xmlDoc);

        var xmlNodes = xmlDoc.documentElement;

        // Extract the qti logic from the XML dom.
        parseChoiceInteractions(xmlNodes);
        parseTextInteractions(xmlNodes);

        // Remove the qti parts from the html parts, now that we've extracted them.
        fixXml(xmlDoc, xmlNodes);

        // Now we have only html part left.  Put that into a div for later rendering.
        var aDiv = document.createElement('div');
	// Convert from XHTML to HTML in cross-browser way.
        aDiv.innerHTML = Util.Xml.serializeToString(xmlNodes);
        container.innerHTML = aDiv.childNodes[0].innerHTML;
    };

};
