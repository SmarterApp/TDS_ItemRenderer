//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
﻿MatchItem = (typeof (MatchItem) == "undefined") ? {} : MatchItem;

// Parser.  Parse the matchItem xml text and
MatchItem.Parse = function (id) {

    // Unique ID for things in this table
    this.mid = id;

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

    // Student app sends us xml doc in one big string.  Parse it.
    this.createFromXml = function (xmlDoc) {

        var nodes = Util.Xml.parseFromString(xmlDoc);

        // This function is used to correct an issue where after an XML parse empty <span> its-tags become self closing tags
        //  and later down the line self-closing tags don't work so we add a simple empty text node to these spans.
        var spanNodes = nodes.getElementsByTagName('span');
        for (var spanIndex = 0; spanIndex < spanNodes.length; ++spanIndex) {
            var spanNode = spanNodes[spanIndex];
            if ((spanNode.childNodes.length === 0) && spanNode.hasAttribute('data-tag-boundary')) {
                var spanAttrValue = spanNode.getAttribute('data-tag-boundary');
                if (spanAttrValue === 'start' || spanAttrValue === 'end') {
                    spanNode.appendChild(document.createTextNode(''));
                }
            }
        }
        
        // The stuff we care about is in the matchInteraction node.  It may be embedded in
        // other stuff by ITS or the server.  Make sure that is the top-level node that 
        // we are dealing with.
        var docElement = nodes.documentElement;
        var choiceXml;
        if (docElement.tagName == 'matchInteraction') {
            choiceXml = docElement;
        } else {
            var matchInteraction = docElement.getElementsByTagName('matchInteraction');

            if ((matchInteraction == null) || matchInteraction.length != 1) {
                return; // Something is wrong with the item format, should be exactly 1.
            }
            choiceXml = matchInteraction[0];
        }

        // Read the content of the row/column, preserving any markup
        var readContent = function (choice) {
            var rv = '';
            for (var k = 0; k < choice.childNodes.length; ++k) {
                if (choice.childNodes[k].nodeType == 1) { // Element node
                    rv = rv + Util.Xml.serializeToString(choice.childNodes[k]);
                } else if (choice.childNodes[k].nodeType == 3) { // Text node
                    rv = rv + Util.Dom.getTextContent(choice.childNodes[k]);
                }
            }
            return rv;
        };
        // Got through a list of columns/rows in the xml and parse them, returing an array.
        var processItemSet = function (choices) {
            // <simpleAssociableChoice identifier="C" matchMax="1">Capulet</simpleAssociableChoice>
            var itemAr = [];
            var choiceItems = choices.getElementsByTagName('simpleAssociableChoice');

            for (var j = 0; j < choiceItems.length; ++j) {
                var choice = choiceItems[j];
                var choiceItem = {
                    identifier: choice.getAttribute('identifier'),
                    matchMax: choice.getAttribute('matchMax'),
                    // content: Util.Dom.getTextContent(choice) // .textContent
                    content: readContent(choice)
                };
                itemAr.push(choiceItem);
            }
            return itemAr;
        };

        // Parse the stuff in the header.  Title, maxAssociations etc. are part of top=level
        // matchInteraction tag
        this.maxAssociations = parseInt(choiceXml.getAttribute('maxAssociations'));
        this.title = choiceXml.getAttribute('title');
        this.forceTable = choiceXml.getAttribute('forceTable');
        // TODO: Type in XML file has attribute "responseIdentifier" spelled with a 'd'
        this.responseId = choiceXml.getAttribute('responseIdentifier');

        this.shuffle = (choiceXml.getAttribute('shuffle') === 'true');
        var choiceSets = choiceXml.getElementsByTagName('simpleMatchSet');

        var promptNodes = choiceXml.getElementsByTagName('prompt');
        this.prompt = (promptNodes && promptNodes.length > 0) ? Util.Dom.getTextContent(promptNodes[0]) : '';

        // Parse the row/columns header info
        this.rows = processItemSet(choiceSets[0]);
        this.columns = processItemSet(choiceSets[1]);
    };
};
