//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
﻿SpellCheck.XHR = { };

// fired when a XHR request is made
SpellCheck.XHR.onRequest = new YAHOO.util.CustomEvent('onRequest', SpellCheck.XHR, false, YAHOO.util.CustomEvent.FLAT),

// fired when a XHR request has completed (success or failure)
SpellCheck.XHR.onComplete = new YAHOO.util.CustomEvent('onComplete', SpellCheck.XHR, false, YAHOO.util.CustomEvent.FLAT),

// fired when a XHR request was successful
SpellCheck.XHR.onSuccess = new YAHOO.util.CustomEvent('onSuccess', SpellCheck.XHR, false, YAHOO.util.CustomEvent.FLAT),

// fired when a XHR request failed (timeout, connection problem)
SpellCheck.XHR.onFailure = new YAHOO.util.CustomEvent('onFailure', SpellCheck.XHR, false, YAHOO.util.CustomEvent.FLAT),

SpellCheck.XHR._encodeText = function(text)
{
    return encodeURIComponent(text).replace(/%20/g, '+');
};

SpellCheck.XHR._sendRequest = function(action, language, text, success, failure)
{
    var spellCheckSuccess = function(xhrObj)
    {
        // fire events
        SpellCheck.XHR.onComplete.fire();
        SpellCheck.XHR.onSuccess.fire();

        var contentType = xhrObj.getResponseHeader['Content-Type'];
        var responseText = xhrObj.responseText;

        var data = null;

        if (contentType == 'text/plain')
        {
            data = xhrObj.responseText;
        }
        else if (contentType == 'application/json')
        {
            var jsonString = xhrObj.responseText;
            data = YAHOO.lang.JSON.parse(jsonString);
        }

        if (typeof (success) == 'function')
        {
            success(action, data);
        }
    };

    var spellCheckFailure = function(xhrObj)
    {
        // fire events
        SpellCheck.XHR.onComplete.fire();
        SpellCheck.XHR.onFailure.fire();

        if (typeof (failure) == 'function')
        {
            failure(xhrObj);
        }
    };

    var callback =
    {
        success: spellCheckSuccess,
        failure: spellCheckFailure,
        timeout: 30000 // 30 secs
    };

    var url = 'SpellEngine.axd/' + action + '?lang=' + language;
    var postData = 'text=' + this._encodeText(text);

    // make XHR request
    var id = YAHOO.util.Connect.asyncRequest('POST', url, callback, postData);

    // fire event
    SpellCheck.XHR.onRequest.fire();

    return id;
};

SpellCheck.XHR.checkWord = function(language, word, success, failure)
{
    return SpellCheck.XHR._sendRequest('checkWord', language, word, function(action, data)
    {
        success(data);
    });
};

SpellCheck.XHR.checkText = function(language, text, success, failure)
{
    return SpellCheck.XHR._sendRequest('checkText', language, text, function(action, data)
    {
        success(data);
    });
};

SpellCheck.XHR.getSuggestions = function(language, word, success, failure)
{
    return SpellCheck.XHR._sendRequest('getSuggestions', language, word, function(action, data)
    {
        success(data);
    });
};

SpellCheck.XHR.getErrors = function(language, text, success, failure)
{
    return SpellCheck.XHR._sendRequest('getErrors', language, text, function(action, data)
    {
        success(data);
    });
};
