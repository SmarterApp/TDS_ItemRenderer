/**
 *  Wrapper class for the YUI Dialog and also provides access to the submit and 
 *  load events.
 */
TDS.Notes.Dialog = function(args) {
    args = args || {};
    this.dom = args.dom; //ID for this dialog, this is the DOM conai
    this.cfg = args.cfg; //Configuration for the size of the dialog height and width

    this._yuiDialog = null;
    this._impl = args.impl;
};

//Define these so that the code works outside of blackbox.
Messages = window.Messages || { get: function(str) { return str; } };

/*
*  The actual dom implementation, one of TDS.Notes.Types instantiated
*/
TDS.Notes.Dialog.prototype.setInstance = function(impl) {
    this._impl = impl;
};

TDS.Notes.Dialog.prototype._onShow = function() {
    //console.log('_onShow');
    //Typicallly used to for the load operation.
};
TDS.Notes.Dialog.prototype.loading = function() {
    //console.log('Mask the UI?  Or just not worry?');
};

TDS.Notes.Dialog.prototype.loadingComplete = function() {
    //console.log('UnMask the UI?');
};

TDS.Notes.Dialog.prototype._onBeforeShow = function() {
    //console.log('_onBeforeShow');
};

TDS.Notes.Dialog.prototype._onHide = function() {
    //console.log('_onHide');
};

TDS.Notes.Dialog.prototype.loadCb = function(response) {
    TDS.Notes.Debug && console.log("Load Callback for (this, response)", this, response);
    this.loadingComplete();

    if (this._impl.unserialize(response)) {
        this._impl.saveState(response);
    }
};

TDS.Notes.Dialog.prototype.load = function() {
    var args = {
        id: this.getId(),
        data: {
            type: this._impl.type,
            id: this.getId()
        },
        cb: this.loadCb.bind(this)
    };
    TDS.Notes.Debug && console.log('Loading information for this Notes instance', this, args);
    TDS.Notes.Events.Load.fire(args);
    return args;
};


//Override dialog instance to pre-process or prevent saves.  
//  - return false in order to prevent a save operation.
//  - return true to save, modify the args in place to pre update / add more informatino
TDS.Notes.Dialog.prototype.preSave = function(args){
  return true;
};

//Kick off save event, also return what is being saved for test purposes.
TDS.Notes.Dialog.prototype.submit = function() {
    var args = {
        id: this.getId(),
        data: {
            type: this._impl.type,
            comment: this._impl.serialize()
        },
        cb: this.saveCb.bind(this)
    };
    if(this.preSave(args)){
      //Preserve the user state
      this._impl.saveState(args.data.comment);

      TDS.Notes.Debug && console.log('Saving information for this Notes instance', this, args);
      TDS.Notes.Events.Save.fire(args);

      this.close(true); //Prevent reverting state on a close
    }
    return args;
};

/**
 *  Override at will?
 */
TDS.Notes.Dialog.prototype.saveCb = function(response) {
    TDS.Notes.Debug && console.log('Save cb for the notes has been called, (this, response)', this, response);
};


// this is called when a dialog is closed
TDS.Notes.Dialog.prototype.close = function (preventRevert) {
    if (this._yuiDialog) {
        this._yuiDialog.hide();
    }

    if (typeof this.preClose == 'function') {
        this.preClose();
    }
    
    //Ensure that evts from the cancel button do not prevent the revert
    if (preventRevert !== true) {
        this._impl.revertState();
    }
};

//Open the dialog, creating it if needed, and rendering to the body.
TDS.Notes.Dialog.prototype.open = function() {
    if (!this._yuiDialog) {
        this.create();
    }
    this._yuiDialog.render(document.body);
    this._yuiDialog.show();

    if(this._impl){
        this._impl.focus();
    }
};

/**
 *  Get the id that we are using to track this instance of the notes implementation.
 */
TDS.Notes.Dialog.prototype.getId = function() {
    if (this.dom) {
        return this.dom.id;
    }
};

/**
 *  Creates the actual YUI dialog, and assigns it to this._yuiDialog
 */
TDS.Notes.Dialog.prototype.create = function() {
    var id = this.getId();
    if (!id) {
        console.error('Cannot create a dialog without a valid dom element (id, this): ', id, this);
        return;
    }
    var dialog = new YAHOO.widget.Dialog(id, {
        visible: true,
        draggable: false,
        modal: true,
        close: false,
        fixedcenter: true,
        width: this.cfg.width,
        height: this.cfg.height,
        zIndex: 1,
        postmethod: 'none'
    });
    
    // set header
    dialog.setHeader(this.cfg.label || 'Comments');

    // EVENTS:
    dialog.beforeShowEvent.subscribe(this._onBeforeShow, this, true);
    dialog.showEvent.subscribe(this._onShow, this, true);
    dialog.hideEvent.subscribe(this._onHide, this, true);

    // BUTTONS (get the scope right, include all the crazy css)
    var buttons = [
        { text: Messages.get('Cancel'), handler: { fn: this.close, scope: this } },
        { text: Messages.get('Submit and Close'), handler: { fn: this.submit, scope: this }, isDefault: true }
    ];
    dialog.cfg.queueProperty('buttons', buttons);

    YAHOO.util.Dom.addClass(dialog.element, 'TDS_Notes_dialog');
    YAHOO.util.Dom.addClass(dialog.innerElement, 'comment');
    YAHOO.util.Dom.addClass(dialog.header, 'comment-header');
    YAHOO.util.Dom.addClass(dialog.body, 'comment-body');
    YAHOO.util.Dom.addClass(dialog.form, 'comment-form');

    this._yuiDialog = dialog;
    return dialog;
};
