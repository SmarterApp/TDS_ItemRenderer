/**********/
/* DIALOG */
/**********/

Accommodations.Dialog = function(accommodations, parentContainer, width, height)
{
    this.onCancel = new YAHOO.util.CustomEvent('onCancel', this, true, YAHOO.util.CustomEvent.FLAT);
    this.onBeforeSave = new YAHOO.util.CustomEvent('onBeforeSave', this, true, YAHOO.util.CustomEvent.FLAT);
    this.onSave = new YAHOO.util.CustomEvent('onSave', this, true, YAHOO.util.CustomEvent.FLAT);

    this._parentContainer = YAHOO.util.Dom.get(parentContainer);
    this._yuiDialog = null;
    this._width = width || 350;
    this._height = height || 400;

    this._accommodations = accommodations;
    this._renderer = null;
};

// a static instance of the dialog
Accommodations.Dialog.instance = null;

Accommodations.Dialog.prototype._init = function()
{
    var accDialog = this;

    YAHOO.util.Dom.setStyle(this._parentContainer, 'display', '');

    var handleSubmit = function()
    {
        this.hide();
        accDialog.onBeforeSave.fire(accDialog._accommodations);
        accDialog._renderer.save();
        accDialog.onSave.fire(accDialog._accommodations);
    };

    var handleCancel = function()
    {
        this.hide();
        accDialog.onCancel.fire();
    };

    // Instantiate the Dialog // this._parentContainer
    var dialog = new YAHOO.widget.Dialog(this._parentContainer,
    {
        // height: '400px',
        // constraintoviewport: true,
        // fixedcenter: true,
        modal: true,
        visible: false,
        draggable: false,
        close: false,
        postmethod: 'none'
    });

    this._yuiDialog = dialog;

    TDS.Dialog.fixTabIndex(dialog);

    // add dialog buttons
    dialog.cfg.queueProperty("buttons",
    [
        { text: 'Submit', handler: handleSubmit, isDefault: true },
        { text: 'Cancel', handler: handleCancel }
    ]);

    // right before the dialog is shown replace buttons label with i18n text
    dialog.beforeShowEvent.subscribe(function()
    {
        var buttons = dialog.getButtons();
        buttons[0].set('label', Messages.getAlt("Global.Button.Submit", "Submit"));
        buttons[1].set('label', Messages.getAlt("Global.Button.Cancel", "Cancel"));
    });

    // create accommodations renderer
    var rendererElement = YUD.getElementsByClassName('bd', 'div', dialog.innerElement)[0];
    this._renderer = new Accommodations.Renderer(this._accommodations, rendererElement);
};

Accommodations.Dialog.prototype.show = function()
{
    if (this._yuiDialog == null) this._init();

    // render accommodations html
    this._renderer.render();

    // render dialog html
    this._yuiDialog.render();
    
    // force dialog to find focusable elements
    this._yuiDialog.changeContentEvent.fire();

    // show dialog
    this._yuiDialog.show();
};
