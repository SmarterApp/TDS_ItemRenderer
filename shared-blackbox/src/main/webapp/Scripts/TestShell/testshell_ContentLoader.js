//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
﻿TestShell.ContentLoader = 
{
    _requests: [],
    _contentLookup: {}
};

// add contents for cache lookup
TestShell.ContentLoader.addContents = function(contents) {
    contents.forEach(function (content) {
        this._contentLookup[content.id] = content;
    }.bind(this));
};

// check of cached content
TestShell.ContentLoader.getContent = function (group) {
    return this._contentLookup[group.id];
};

// get a group based on the xhr request
TestShell.ContentLoader.lookupGroup = function(request)
{
    var groupID = request.getId();
    var group = TestShell.PageManager.get(groupID);
    return group;
};

// create an xhr manager with 120 second timeout and 2 retries
TestShell.ContentLoader._xhrManager = new TDS.XhrManager(120000, 2);

// onRequest, onSuccess, onFailure
TestShell.ContentLoader.Events = new Util.EventManager();

// create the xhr request data
TestShell.ContentLoader._createRequest = function(group)
{
    // get url for loading content
    var url = group.getContentUrl();

    var json = {
        accs: TDS.Student.Storage.serializeAccs()
    };

    var content = Util.QueryString.stringify(json);

    // create request object
    var request = this._xhrManager.createRequest(group.id, url, 'POST', content, this._processResponse, this);

    // config:
    request.setArgs(
    {
        showProgress: false,
        showDialog: true,
        allowRetry: true,
        forceLogout: true
    });

    return request;
};

TestShell.ContentLoader.isRequesting = function(group)
{
    return Util.Array.contains(this._requests, group);
};

// request a groups content
TestShell.ContentLoader.request = function(group)
{
    // check if already requesting this group
    if (this.isRequesting(group)) return false;

    // add group to current requests
    this._requests.push(group);

    // check for cached content
    var content = this.getContent(group);
    if (content) {
        YAHOO.lang.later(0, this, function () {
            Util.Array.remove(this._requests, group); // remove PageContent request
            Util.Object.remove(this._contentLookup, group.id); // remove cached json content
            this._processContent(content);
        });
        return true; // don't call xhr
    }

    // create request object
    var request = TestShell.ContentLoader._createRequest(group);

    // schedule xhr content request 
    // (stagger requests by 1 second times however many outgoing requests we have)
    var delay = (this._requests.length > 1) ? (this._requests.length * 1000) : 0;

    YAHOO.lang.later(delay, this, function()
    {
        // send xhr and fire event
        this._xhrManager.sendRequest(request);
        this.Events.fire('onRequest', group);
    });

    return true;
};

// process the incoming group's xhr response from the server
TestShell.ContentLoader._processResponse = function(request)
{
    // get group
    var group = TestShell.ContentLoader.lookupGroup(request);
    if (group == null) return;

    // remove group from current requests
    Util.Array.remove(this._requests, group);
    
    // get xml
    var xmlDoc = request.getResponseXml();

    // check if xml was returned
    if (xmlDoc != null)
    {
        this.Events.fire('onSuccess', group, request);
        this._processXml(group, xmlDoc);
    }
    else
    {
        this.Events.fire('onFailure', group, request);
    }
};

// process the group's xml
TestShell.ContentLoader._processXml = function(group, xmlDoc)
{
    // check if content page already exists (it should not)
    var contentPage = group.getContentPage();

    // if the content page already existed then try and remove it
    if (contentPage)
    {
        try
        {
            ContentManager.removePage(contentPage);
        }
        catch (e) { }
    }

    // create new content page and render html
    var xmlContents = ContentManager.Xml.create(xmlDoc);
    this._processContent(xmlContents[0]);
};

TestShell.ContentLoader._processContent = function (content)
{
    var contentPage = ContentManager.createPage(content);
    contentPage.render();
};

// listen for TDS.XhrManager class if a request has an error
TestShell.ContentLoader._xhrManager.Events.subscribe('onError', function(request, errorMessage, retriable, logout)
{
    var group = TestShell.ContentLoader.lookupGroup(request);

    // ignore errors for a group that is not currently showing
    var currentGroup = TestShell.PageManager.getCurrent();
    if (currentGroup != null && currentGroup != group) return;

    TestShell.UI.hideLoading();

    if (retriable)
    {
        errorMessage += ' ' + Messages.getAlt('Messages.Label.XHRError', 'Select Yes to try again or No to logout.');

        TDS.Dialog.showPrompt(errorMessage,
        function()
        {
            // yes (resubmit original xhr)
            TestShell.Navigation.requestPage();
        },
        function()
        {
            // no (back to login page)
            if (logout) TestShell.redirectLogin();
        });
    }
    else
    {
        TDS.Dialog.showWarning(errorMessage, function()
        {
            // ok (back to login page)
            if (logout) TestShell.redirectLogin();
        });
    }
});