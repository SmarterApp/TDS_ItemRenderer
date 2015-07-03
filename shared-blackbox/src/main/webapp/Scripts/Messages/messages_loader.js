//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
﻿/* MessageLoader.cs */

TDS.Messages.MessageLoader = function(messageSystem)
{
    this._messageSystem = messageSystem || new TDS.Messages.MessageSystem();
};

TDS.Messages.MessageLoader.prototype.getMessageSystem = function() { return this._messageSystem; };

TDS.Messages.MessageLoader.prototype.load = function(json)
{
    // track languages added
    if (json.c_l != null && !this._messageSystem.hasLanguage(json.c_l))
    {
        this._messageSystem._languages.push(json.c_l);
    }

    // loop through each message context
    Util.Array.each(json.c_a, this.loadContext, this);
};

TDS.Messages.MessageLoader.prototype.loadContext = function(jsonContext)
{
    if (jsonContext == null) return;

    var messageContext = this._messageSystem.getContext(jsonContext.c);

    if (messageContext == null)
    {
        messageContext = this._messageSystem.addContext(jsonContext.c);
    }

    Util.Array.each(jsonContext.m_a, function(jsonMessage)
    {
        var message = messageContext.getMessage(jsonMessage.m);

        if (message == null)
        {
            message = messageContext.addMessage(jsonMessage.id, jsonMessage.m);
        }

        Util.Array.each(jsonMessage.t_a, function(jsonTranslation)
        {
            // clientMessage, languageCode, subject, gradeCode
            message.addTranslation(jsonTranslation.t, jsonTranslation.l, jsonTranslation.s, jsonTranslation.g);
        });

    });
};

TDS.Messages.MessageLoader.prototype.buildIndex = function()
{
    var messageIndexer = this._messageSystem.getIndexer();
    
    // build main index lookup
    Util.Array.each(this._messageSystem.getContexts(), function(messageContext)
    {
        Util.Array.each(messageContext.getMessages(), function(message)
        {
            Util.Array.each(message.getTranslations(), function(translation)
            {
                messageIndexer.addLanguage(translation.getLanguage());
                messageIndexer.addSubject(translation.getSubject());
                messageIndexer.addGrade(translation.getGrade());
            });
        });
    });
    
    // build lookup for each message
    Util.Array.each(this._messageSystem.getContexts(), function(messageContext)
    {
        Util.Array.each(messageContext.getMessages(), function(message)
        {
            message.initTranslationIndex(messageIndexer.createIndexer3D());
            
            var translationIndex = 0;
            Util.Array.each(message.getTranslations(), function(translation)
            {
                var messageIndex = messageIndexer.get(translation.getLanguage(), translation.getSubject(), translation.getGrade());
                message.setTranslationIndex(messageIndex, translationIndex);
                translationIndex++;
            });
        });
    });

};

