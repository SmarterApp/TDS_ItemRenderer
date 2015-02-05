EditItem = (typeof (EditItem) == "undefined") ? {} : EditItem;

////////////////////////
// Handle the Generic HTML for editing items.  
////////////////////////////////
EditItem.Html = function () {

    // FB-115001 - Only init this during the first construction of EditItem.Html
    if (EditItem.Html._activeDbInstance === undefined) {
        EditItem.Html._activeDbInstance = {
            interaction: null,
            okHandler: null,
            enterHandler: null,
            choiceSpans: [],
            textSpan: null
        };
    }

    var self = this;
    EditItem.InteractionSet.call(this);

    // Get an interaction object from the span that represents it
    // by looking up the span id.  INteraction spans look like:
    // TestItem-inlineChoiceInteraction-Q1 - get identifier (Q1) 
    // and then look through the list to find the item that matches.
    this.getInteractionFromSpan = function (span) {
        var spanId = span.getAttribute('id');
        var nameAr = spanId.split('-');
        return self.getInteraction(function (interaction) {
            return interaction.getId() == nameAr[2];
        });
    };

    // One thing the items have in common - replace a word in the stem with a crossed out word 
    // and replacement.
    this.createCrossoutSpan = function (crossoutContent, replaceContent, parentDiv) {
        parentDiv.innerHTML = '';
        YUD.setAttribute(parentDiv, 'tabindex', '0');
        var crossoutSpan = document.createElement('span');
        var replacementSpan = document.createElement('span');
        crossoutSpan.innerHTML = crossoutContent;

        // Restore the item if the student has blanked out the response.
        if (replaceContent) {
            YUD.addClass(crossoutSpan, 'edit-crossout');
            crossoutSpan.setAttribute('title', 'crossed-out text');
            YUD.addClass(replacementSpan, 'edit-newtext');
        } else {
            YUD.addClass(crossoutSpan, 'edit-originaltext');
        }

        // WCAG 13.1 - Provide visually hidden spoken cues that text is crossed out
        var startCrossoutSpan = document.createElement('span');
        YUD.addClass(startCrossoutSpan, 'hidden-spoken');
        var spokenCue = Messages.getAlt('ET.strikethrough.begin', 'start crossed out text');
        Util.Dom.setTextContent(startCrossoutSpan, spokenCue);
        var endCrossoutSpan = document.createElement('span');
        YUD.addClass(endCrossoutSpan, 'hidden-spoken');
        spokenCue = Messages.getAlt('ET.strikethrough.end', 'end crossed out text');
        Util.Dom.setTextContent(endCrossoutSpan, spokenCue);

        if (replaceContent) {
            parentDiv.appendChild(startCrossoutSpan);
            parentDiv.appendChild(crossoutSpan);
            parentDiv.appendChild(endCrossoutSpan);

            //replacementSpan.innerHTML = replaceContent;
            Util.Dom.setTextContent(replacementSpan, replaceContent);
            parentDiv.appendChild(replacementSpan);
        } else {
            parentDiv.appendChild(crossoutSpan);
        }
    };

    this.createLabel = function (defaultPhrase, parentDiv, id) {
        var stemLabel = document.createElement('label');
        stemLabel.innerHTML = 'Replace "' + defaultPhrase + '" with:';
        YUD.addClass(stemLabel, 'edit-db-stem');
        YUD.setAttribute(stemLabel, 'for', id);
        parentDiv.appendChild(stemLabel);
    };

    // Position the dialog box so that it is just below the word and centered.
    this.setDbPosition = function () {
        if (EditItem.Html._activeDbInstance.activeSpan && EditItem.Html._activeDbInstance.panelWidget) {
            var spanRegion = YUD.getRegion(EditItem.Html._activeDbInstance.activeSpan);
            EditItem.Html._activeDbInstance.panelWidget.cfg.setProperty('xy', [spanRegion.x, spanRegion.y + spanRegion.height]);
        }
    };

    this.setKeyHandlers = function(target, scope, clickHandler) {
        new YAHOO.util.KeyListener(target, {
            keys: [32, 13]
        }, {
            fn: function (evtName, args) {
                //stop event to prevent Enter key event from closing ET modal
                YUE.stopEvent(args[1]);
                clickHandler();
            },
            scope: scope,
            correctScope: true
        }).enable();
    };

    // We render the dialog boxes on YUI panes.  Populate the header and body of them here.
    this.populateDialogBox = function (dialog, interaction) {
        //populate dialog box header
        dialog.setHeader('Edit Tool');
        // TODO: we need to get these strings from i18n probably.
        YUD.addClass(dialog.header, 'edit-db-header');
        
        //populate dialog box body
        var parentForm = this.createInteractionCore(interaction);
        dialog.setBody(parentForm);
        
        //render dialog box
        dialog.render(document.body);
    };
};
////////////////////////////////////////////////
// Generic functions for the creation and initialization of EditItem Dialog boxes
///////////////////////////////////////////////
EditItem.Dialog = {
    textDialog: null,
    choiceDialog: null,

    // Public function to return the Dialog box widget associated with Text items.
    // If the widget doesn't exist, create and return a new one
    getTextDialog: function () {
        if (this.textDialog == null) {
            this.textDialog = this._buildEditDialog('EditTaskTextDialog');
            YUD.addClass(this.textDialog.element, 'edit-text itemMessage editTaskMessage');
        }
        return this.textDialog;
    },

    // Public method to return the Dialog box widget associated with Choice items.
    // If the widget doesn't exist, create and return a new one
    getChoiceDialog: function () {
        if (this.choiceDialog == null) {
            this.choiceDialog = this._buildEditDialog('EditTaskChoiceDialog');
            YUD.addClass(this.choiceDialog.element, 'edit-text itemMessage editTaskMessage');
        }
        return this.choiceDialog;
    },

    // Private method to handle the cancel button on dialog box. Hide the global DB
    _handleCancelButton: function (ev) {
        // Bug 114596 - it is possible that we get here b4 the dialog is set up,
        // due to a keyboard shortcut.  If so, just ignore the event.
        var activeInst = EditItem.Html._activeDbInstance;
        if (activeInst.panelWidget) {
            activeInst.choiceSpans = [];
            activeInst.panelWidget.hide();
	        var span = activeInst.activeSpan;
            if (span) {
                YUD.removeClass(span, 'TDS_EDIT_SPAN_HOVER');
                span.focus();
            }
        }
        activeInst.interaction = null;
    },

    // Private method to handle the OK button and call the item-specific logic
    _handleOkButton : function (ev) {
        // Bug 114596 - it is possible that we get here b4 the dialog is set up,
        // due to a keyboard shortcut.  If so, just ignore the event.
        var activeInst = EditItem.Html._activeDbInstance;
        if (activeInst.interaction &&
            activeInst.panelWidget &&
            activeInst.okHandler) {
            var interaction = activeInst.interaction;
            activeInst.okHandler(interaction);
            activeInst.choiceSpans = [];
            activeInst.textSpan = null;
            activeInst.panelWidget.hide();
	        var span = activeInst.activeSpan;
            if (span) {
                YUD.removeClass(span, 'TDS_EDIT_SPAN_HOVER');
                span.focus();
            }
        }
        // Bug 114996 - always remove the active Db instance if we are dismissing the db.
        EditItem.Html._activeDbInstance.interaction = null;
    },


    // Private method to add the ok/cancel button to the dialog
    _addOkCancel : function () {
        EditItem.Html.submit = EditItem.Dialog._handleOkButton;
        
        var buttons = [
            { text: 'OK', handler: EditItem.Dialog._handleOkButton },
            { text: 'Cancel', handler: EditItem.Dialog._handleCancelButton }];
        return buttons;
    },

    // Private method for creating dialog boxes for EditItem
    _buildEditDialog : function(label) {
        var buttons = this._addOkCancel();

        var escKeyListener = new YAHOO.util.KeyListener(document, {
            keys: [27]
        }, {
            fn: this._handleCancelButton,
            scope: this,
            correctScope: true
        });

        var editDialog = new YAHOO.widget.Dialog(label,
        {
            width: "320px",
            constraintoviewport: true,
            modal: true,
            visible: false,
            draggable: true,
            close: false,
            postmethod: 'none',
            usearia: false,
            buttons: buttons,
            keylisteners: escKeyListener,
            role: 'dialog' // 'alertdialog'
            // labelledby: 'testby'
            // describedby: 'testby'
        });

        editDialog.showEvent.subscribe(function () {
            // DO NOT REMOVE - Tab navigation of dialog box does not work without this addClass
            YUD.addClass(document.body, 'showingDialog');
            
            //create tab loop from last element to first element
            editDialog.focusFirst();
            editDialog.setTabLoop(editDialog.firstElement, editDialog.lastElement);
        });

        editDialog.hideEvent.subscribe(function () {
            YUD.removeClass(document.body, 'showingDialog');
        });

        // set tab index on dialog
        this._setTabIndexOnDialog(editDialog);
        
        return editDialog;

    },

    // Private method for setting the tab index on all focusable elements to 0
    // Order of tab navigation is based on location in the widget
    _setTabIndexOnDialog: function (dialog) {
        // WARNING: Don't change the order or type of events they are currently set to work best with YUI
        dialog.beforeShowEvent.subscribe(function () {
            // Set first and last and zero out tab indexes
            this.setFirstLastFocusable();

            for (var i = 0; i < dialog.focusableElements.length; i++) {
                var focusableElement = dialog.focusableElements[i];
                focusableElement.setAttribute('tabindex', 0);
            }
            
            // set aria labels if enabled
            var usearia = dialog.cfg.getProperty('usearia');

            // add describedby pointing to the body
            if (usearia) {
                // NOTE: you must leave 'labelledby' pointing to the header as well
                var id = dialog.body.id || YUD.generateId(dialog.body);
                dialog.cfg.setProperty('describedby', id);
            }
        });
    }
};
