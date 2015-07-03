//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
TestShell.Comments.Global = function() {
    TestShell.Comments.Global.superclass.constructor.call(this);

    this._loaded = false; // check if loaded from server
    this._text = null; // current saved comment text
};

YAHOO.lang.extend(TestShell.Comments.Global, TestShell.Comments.Base);

TestShell.Comments.Global.prototype.getId = function() {
    return 'global';
};

TestShell.Comments.Global.prototype.getHeaderText = function() {
    return Messages.getAlt('TestShell.Comments.Global', 'Global Notes');
};

TestShell.Comments.Global.prototype.getType = function() {
    return TestShell.Comments.Base.Type.TextArea;
};

TestShell.Comments.Global.prototype.getModelValue = function() {
    return this._text;
};

TestShell.Comments.Global.prototype.show = function() {

    var commentObj = this;

    // check if the comment was already loaded from the server
    if (this._loaded) {
        // show the dialog since we already loaded the comment
        TestShell.Comments.Global.superclass.show.call(commentObj);
    } else {
        // try and load comment from the server
        TestShell.UI.showLoading();

        TestShell.xhrManager.getOppComment(function(text) {
            TestShell.UI.hideLoading();
            commentObj._loaded = true;
            commentObj._text = text;

            // now show the dialog
            TestShell.Comments.Global.superclass.show.call(commentObj);
        });
    }
};

TestShell.Comments.Global.prototype.save = function(text)
{
    // check if there was any difference in comment
    if (this._text == text) return;

    // show progress screen
    TestShell.UI.showLoading('');

    // submit data to server
    var commentData = {
        comment: text
    };

    // geo code:
    if (typeof TDS.Student == 'object') {
        var testee = TDS.Student.Storage.getTestee();
        if (testee) {
            // add testee data
            commentData.testeeKey = testee.key;
            commentData.testeeToken = testee.token;
        }
    }

    // hide loading screen and set the submitted comment to the response object
    var commentObj = this;
    
    TestShell.xhrManager.recordOppComment(commentData, function() {
        TestShell.UI.hideLoading();
        commentObj._text = text;
    });
};

