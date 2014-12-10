TestShell.Comments.Item = function() {
    TestShell.Comments.Item.superclass.constructor.call(this);
    this._response = null;
};

YAHOO.lang.extend(TestShell.Comments.Item, TestShell.Comments.Base);

TestShell.Comments.Item.prototype.getHeaderText = function() {
    return ContentManager.getCommentLabel();
};

TestShell.Comments.Item.prototype.getType = function() {

    // get comment type
    var commentCode = ContentManager.getCommentCode();
    
    if (commentCode != null)
    {
        if (commentCode == 'TDS_SCDropDown') {
            return TestShell.Comments.Base.Type.DropDown;
        }
        else if (commentCode == 'TDS_SCTextArea' || commentCode == 'TDS_SCNotepad') {
            return TestShell.Comments.Base.Type.TextArea;
        }
    }

    return TestShell.Comments.Base.Type.None;
};

TestShell.Comments.Item.prototype.show = function(contentItem) {
    this._response = TestShell.PageManager.getResponse(contentItem.position);
    TestShell.Comments.Item.superclass.show.call(this);
};

TestShell.Comments.Item.prototype.hide = function() {
    this._response = null;
    TestShell.Comments.Item.superclass.hide.call(this);
};

TestShell.Comments.Item.prototype.getModelValue = function() {
    return this._response.comment;
};

TestShell.Comments.Item.prototype.save = function(text)
{
    var response = this._response;

    // check if there was any difference in comment
    if (response.comment == text) return;

    // show progress screen
    TestShell.UI.showLoading('');

    // submit data to server
    var commentData = {
        position: response.position,
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
    TestShell.xhrManager.recordItemComment(commentData, function() {
        TestShell.UI.hideLoading();
        response.comment = text;
    });
};
