//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
﻿if (typeof TDS == 'undefined') var TDS = {};

/*
Interactions allow the candidate to interact with the item. 
Through an interaction, the candidate selects or constructs a response. 
The candidate's responses are stored in the response variables. 
Each interaction is associated with (at least) one response variable.
*/
TDS.Interaction = function(responseIdentifier, config)
{
    this._responseIdentifier = responseIdentifier;
    this._config = config || {};
};

YAHOO.lang.augmentProto(TDS.Interaction, YAHOO.util.EventProvider);

TDS.Interaction.prototype.getResponseIdentifier = function()
{
    return this._responseIdentifier;
};

// Initialize the interaction.
TDS.Interaction.prototype.init = function() { };

// Validate the response associated with this interaction Subclasses should override this method as required.
TDS.Interaction.prototype.validateResponse = function() { return false; };

// Get the user response (can be: string, array, xml, table)
TDS.Interaction.prototype.getResponse = function() { return null; };

TDS.Interaction.prototype.resetResponse = function() { };

TDS.Interaction.prototype.loadResponse = function(/*args*/) { };

// helper method for getting a response identifier
TDS.Interaction.parseIdentifier = function(el)
{
    return YUD.getAttribute(el, 'data-its-identifier');
};

TDS.Interaction.compareOrder = function(obj1, obj2)
{
    return Util.Dom.compareNodeOrder(obj1.getElement(), obj2.getElement());
};

TDS.Interaction.parseXmlRoot = function (xml) {

    // parse string
    var xmlDoc;
    if (typeof xml == 'string') {
        xmlDoc = Util.Xml.parseFromString(xml);
    } else {
        xmlDoc = xml;
    }

    // get root node
    var xmlRoot;
    if (xmlDoc.documentElement) {
        xmlRoot = xmlDoc.documentElement;
    } else {
        xmlRoot = xml;
    }

    return xmlRoot;
}
