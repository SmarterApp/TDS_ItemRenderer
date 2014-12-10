/**********/
/* DIALOG */
/**********/

Accommodations.Dialog = (function() {

    // static dialog instance
    var yuiDialog = null;

    function AccsDialog(accs, parentEl, width, height) {

        // events
        this.onCancel = new YAHOO.util.CustomEvent('onCancel', this, true, YAHOO.util.CustomEvent.FLAT);
        this.onBeforeSave = new YAHOO.util.CustomEvent('onBeforeSave', this, true, YAHOO.util.CustomEvent.FLAT);
        this.onSave = new YAHOO.util.CustomEvent('onSave', this, true, YAHOO.util.CustomEvent.FLAT);

        // private properties
        this._parentContainer = YAHOO.util.Dom.get(parentEl);
        this._yuiDialog = null;
        this._width = width || 350;
        this._height = height || 400;
        this._accommodations = accs;
        this._renderer = null;
    }

    AccsDialog.prototype._init = function() {

        var self = this;

        YAHOO.util.Dom.setStyle(this._parentContainer, 'display', '');

        var handleSubmit = function() {
            this.hide();
            self.onBeforeSave.fire(self._accommodations);
            self._renderer.save();
            self.onSave.fire(self._accommodations);
        };

        var handleCancel = function() {
            this.hide();
            self.onCancel.fire();
        };

        // Instantiate the Dialog // this._parentContainer
        yuiDialog = new YAHOO.widget.Dialog(this._parentContainer, {
            // height: '400px',
            // constraintoviewport: true,
            // fixedcenter: true,
            modal: true,
            visible: false,
            draggable: false,
            close: false,
            postmethod: 'none'
        });

        TDS.Dialog.fixTabIndex(yuiDialog);

        // add dialog buttons
        yuiDialog.cfg.queueProperty('buttons', [
            { text: 'Submit', handler: handleSubmit, isDefault: true },
            { text: 'Cancel', handler: handleCancel }
        ]);

        // right before the dialog is shown replace buttons label with i18n text
        yuiDialog.beforeShowEvent.subscribe(function() {
            var buttons = yuiDialog.getButtons();
            buttons[0].set('label', Messages.getAlt('Global.Button.Submit', 'Submit'));
            buttons[1].set('label', Messages.getAlt('Global.Button.Cancel', 'Cancel'));
        });

        this._renderer = new Accommodations.Renderer(this._accommodations);
    };

    AccsDialog.prototype.show = function () {

        if (!yuiDialog) {
            this._init();
        }

        // render accommodations html
        var el = $('div.bd', yuiDialog.innerElement).get(0);
        this._renderer.render(el);

        // render dialog html
        yuiDialog.render();

        // force dialog to find focusable elements
        yuiDialog.changeContentEvent.fire();

        // show dialog
        yuiDialog.show();
    };

    return AccsDialog;

})();