//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
// base class for comments
TestShell.Comments.Base = function () {
    this._dialog = null; // current YUI dialog
};

TestShell.Comments.Base.Type = {
    None: 0,
    DropDown: 1,
    TextArea: 2
};

// get a unique ID for the comment dialog
TestShell.Comments.Base.prototype.getId = function() {
    return 'comment';
};

TestShell.Comments.Base.prototype.getElement = function() {
    var commentId = this.getId();
    return YUD.get(commentId);
};

TestShell.Comments.Base.prototype.getHeaderEl = function() {
    var commentContainer = this.getElement();
    return Util.Dom.getElementByClassName('comment-header', 'div', commentContainer);
};

TestShell.Comments.Base.prototype.getHeaderText = function() {
    return '';
};

TestShell.Comments.Base.prototype.getBodyEl = function() {
    var commentContainer = this.getElement();
    return Util.Dom.getElementByClassName('comment-body', 'div', commentContainer);
};

TestShell.Comments.Base.prototype.getFormEl = function() {
    var commentContainer = this.getElement();
    return Util.Dom.getElementByClassName('comment-form', 'form', commentContainer);
};

TestShell.Comments.Base.prototype.getInputEl = function() {
    var commentContainer = this.getElement();
    return Util.Dom.getElementByClassName('comment-input', null, commentContainer);
};

// get the comment response value
TestShell.Comments.Base.prototype.getInputValue = function() {
    var inputEl = this.getInputEl();
    return (inputEl != null) ? inputEl.value : null;
};

TestShell.Comments.Base.prototype.render = function() {

    // try and get existing comment container
    var commentContainer = this.getElement();
    if (commentContainer != null) return;

    // CREATE:
    var dialog = new YAHOO.widget.SimpleDialog(this.getId(), {
        visible: false,
        draggable: true,
        modal: false,
        constraintoviewport: true,
        close: false,
        fixedcenter: true,
        width: '450px',
        height: '150px',
        zindex: 999,
        postmethod: 'none',
        autofillheight: false
    });
    
    // save dialog instance
    this._dialog = dialog;

    //Register the dialog to TDS.ToolManager where we manage all dialogs together. 
    //This is needed because https://bugz.airast.org/default.asp?150705#922339 ESC key does not work as expected to cancel the dialog in Chrome.
    //Because the YUI containerariaplugin.js line #131 has a chrome detection error especially for chrome. And we have our own code to take care of it in TDS.ToolManager's _overlayManager.
    //This can be found officially at the example containerariaplugin.js page: http://yui.github.io/yui2/docs/yui_2.9.0_full/examples/container/container-ariaplugin.html
    TDS.ToolManager._overlayManager.register(dialog);

    // set header
    dialog.setHeader(this.getHeaderText());

    // BUTTONS:
    var buttons = [
        { text: Messages.get('Cancel'), handler: { fn: this.hide, scope: this} },
        { text: Messages.get('Submit and Close'), handler: { fn: this.submit, scope: this }, isDefault: true }
    ];

    dialog.cfg.queueProperty("buttons", buttons);
    
    // EVENTS:
    dialog.beforeShowEvent.subscribe(this._onBeforeShow, this, true);
    dialog.showEvent.subscribe(this._onShow, this, true);
    dialog.hideEvent.subscribe(this._onHide, this, true);

    // render the dialog container
    var commentsEl = YUD.get('comments');
    dialog.render(commentsEl);

    // add class
    YUD.addClass(dialog.innerElement, 'comment');
    YUD.addClass(dialog.header, 'comment-header');
    YUD.addClass(dialog.body, 'comment-body');
    YUD.addClass(dialog.form, 'comment-form');

    // create input
    var input = this._createInput();

    if (input != null) {
        $(input).attr('aria-labelledby', dialog.header.id);
        dialog.form.appendChild(input);
    }
};

// get the type of comment to create
TestShell.Comments.Base.prototype.getType = function() {
    return TestShell.Comments.Base.Type.None;
};

TestShell.Comments.Base.prototype._createInput = function() {

    var input = null;

    // get comment type
    var commentType = this.getType();
    
    if (commentType == TestShell.Comments.Base.Type.DropDown) {
        input = this._createDropDown();
    }
    else if (commentType == TestShell.Comments.Base.Type.TextArea) {
        input = this._createTextArea();
    } else {
        console.warn('There is no student comment accommodation code found.');
    }

    return input;
};

TestShell.Comments.Base.prototype._createTextArea = function()
{
    var textarea = HTML.TEXTAREA({
        className: 'comment-input comment-textbox',
        rows: '4',
        cols: '', 
        style: 'resize: none;'
    });

    return textarea;
};

TestShell.Comments.Base.prototype._createDropDown = function()
{
    // create select box
    var selectbox = HTML.SELECT({
        className: 'comment-input comment-selectbox'
    });

    if (TDS.Comments) {
        
        Util.Array.each(TDS.Comments, function(commentLine) {
            var option = HTML.OPTION();
            option.text = commentLine;
            option.value = commentLine;
            selectbox.appendChild(option);
        });
    }

    return selectbox;
};

// get the response from the stored model
TestShell.Comments.Base.prototype.getModelValue = function() {
    return null;
};

// this is called when the comment dialog onBeforeShow event fires
TestShell.Comments.Base.prototype._onBeforeShow = function()
{
    // set current comment
    var inputEl = this.getInputEl();
    if (inputEl == null) return;

    // if response comment is empty then clear input
    var value = this.getModelValue();

    if (value == null || value == '') {
        if (inputEl.nodeName == 'SELECT') inputEl.selectedIndex = 0;
        else inputEl.value = '';
    } else {
        inputEl.value = value;
    }

    // trap focus inside dialog
    if (TDS.Dialog.isAccessible()) {
        TDS.Dialog.fixTabLoop(this._dialog, false);
    }
    
    // reset component focus
    ContentManager.resetActiveComponent();

    // set dialog body to the right height
    this._dialog.fillHeight(this._dialog.body);
};

// this is called when the comment dialog show event fires
TestShell.Comments.Base.prototype._onShow = function() {

    TDS.Dialog.onShow();

    // automatically set focus on input if this is not a touch device
    if (!Util.Browser.isTouchDevice()) {
        var inputEl = this.getInputEl();
        if (inputEl != null) {
            setTimeout(function() {
                inputEl.focus();
            }, 0);
        }
    }
};

// this is called when the comment dialog hide event fires 
TestShell.Comments.Base.prototype._onHide = function() {
    TDS.Dialog.onHide();
    Util.Dom.focusWindow(2); // (BUG #26524)
};

// call this to show the comment dialog
TestShell.Comments.Base.prototype.show = function() {
    this._dialog.show();
};

// call this to hide the comment dialog
TestShell.Comments.Base.prototype.hide = function() {
    if (this._dialog) this._dialog.hide();
};

// check if the comment dialog is showing
TestShell.Comments.Base.prototype.isShowing = function() {
    return (this._dialog) ? this._dialog.cfg.getProperty('visible') : false;
};

// this is called when the user clicks the submit button
TestShell.Comments.Base.prototype.submit = function()
{
    var text = this.getInputValue();
    
    if (text != null) {
        this.save(text);
    }
    
    this.hide();
};

// this is called if there is a comment to save
TestShell.Comments.Base.prototype.save = function(text) {
};
