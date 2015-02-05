EditItem = (typeof (EditItem) == "undefined") ? {} : EditItem;


////////////////////////////////
// Render a dialog box with a text box, and allow user to replace a word.
//////////////////////////////
EditItem.Html.Text = function () {
    EditItem.Html.call(this);
    var self = this;
    var addComponentArray = [];

    this.textDialog = YUD.get('EditTaskTextDialog');
    this.textDialog = (typeof(this.textDialog) == "undefined") ? 'EditTaskTextDialog' : this.textDialog;
    // Called by the module.  Show the item and do some initilization.
    this.showItem = function () {

        this.forEachInteraction(function (interaction) {
            var aDiv = YUD.get(interaction.createDivId());
            YUD.addClass(aDiv, 'TDS_EDIT_SPAN ');
            // aDiv.innerHTML = interaction.getContent();
            this.createCrossoutSpan(interaction.getContent(), null, aDiv);
            YUE.addListener(aDiv, "click", clickOnTextItem, this);

            // listen for space bar or enter keys
            var boundClick = clickOnTextItem.bind(aDiv);
            this.setKeyHandlers(aDiv, this, boundClick);
            
            if (aDiv) {
                addComponentArray.push(aDiv);
            }

            //silence this from TTS
            YUD.addClass(aDiv, "TTS speakAs");
            aDiv.setAttribute("ssml", "sub");
            aDiv.setAttribute("ssml_alias", "{silence:1000}");
            
            // set aria role="button"
            aDiv.setAttribute('role', 'button');   

            // set title
            aDiv.setAttribute('title', 'click to correct');
        });
    };

    this.getComponentArray = function () {
        return addComponentArray;
    };
    
    //Encode HTML entities (i.e. <>&/ etc)
    var entityEncode = function (text) {

        if (text && typeof text == 'string') {
            var textElement = document.createElement('span');
            Util.Dom.setTextContent(textElement, text);
            return textElement.innerHTML;
        } else return;
    };

    //Decode HTML entities (i.e. <>&/ etc)
    var entityDecode = function (text, code) {

        if (text && typeof text == 'string') {
            var textElement = document.createElement('span');
            textElement.innerHTML = text
            text = Util.Dom.getTextContent(textElement);
            return text;
        } else return;
    };

    //Create the text input box and form container for dialog box
    this.createInteractionCore = function(interaction) {
        var parentForm = document.createElement('form');
        YUD.addClass(parentForm, 'edit-text');
        this.createLabel(interaction.getContent(), parentForm, 'edit-textarea');
        YUD.setAttribute(parentForm, 'onSubmit', 'EditItem.Html.submit()');

        var textInput = document.createElement('input');
        var textValue = entityDecode(interaction.responseValue);
        if (textValue && typeof textValue == 'string') textInput.value = textValue;

        YUD.addClass(textInput, 'edit-textarea');
        YUD.setAttribute(textInput, 'id', 'edit-textarea');
        YUD.setAttribute(textInput, 'type', 'text'); //WCAG 23.1-0
        parentForm.appendChild(textInput);
        interaction.textSpan = textInput;
        return parentForm;
    };

    // Populate the dialog box that allows the user to interact with the word.
    var createTextInteractionMarkup = function (interaction) {
        var dialog = EditItem.Dialog.getTextDialog();
        this.populateDialogBox(dialog, interaction);
        EditItem.Html._activeDbInstance.interaction = interaction;
        EditItem.Html._activeDbInstance.textSpan = interaction.textSpan;
        EditItem.Html._activeDbInstance.okHandler = handleOkButtonText;
        EditItem.Html._activeDbInstance.panelWidget = dialog;

        dialog.show();
        dialog.cfg.setProperty('zindex', 1005); // BUG: 33828

        inputPos(interaction.textSpan);

        // Place the dialog in a nice spot.
        setTimeout(this.setDbPosition, 1);
    };

    var inputPos = function (node) {
        var position = 0;
        if ((node) && (node.value)) {
            position = node.value.length;
        }
        if (node.setSelectionRange) {
            node.focus();
            node.setSelectionRange(0, position);
        } else if (node.createTextRange) {
            var range = node.createTextRange();
            range.collapse(true);
            range.moveEnd('character', position);
            range.moveStart('character', 0);
            range.select();
        }
    };

    this.redisplay = function () {
        this.forEachInteraction(function (interaction) {
            var textSpan = YUD.get(interaction.createDivId());
            //Decode the responses to prevent HTML entity names from displaying
            var text = entityDecode(interaction.responseValue);
            this.createCrossoutSpan(interaction.getContent(), text, textSpan);
        });
    };

    // Callback.  If the user has given us a replacement word, replace it.
    var handleOkButtonText = function (ev) {
        var text = EditItem.Html._activeDbInstance.textSpan.value;
        // Blank response - reset the item.
        if (!/\S/.test(text)) {
            text = null;
        }

        var interaction = EditItem.Html._activeDbInstance.interaction;
        self.createCrossoutSpan(interaction.getContent(), text, YUD.get(interaction.createDivId()));
        interaction.responseValue = entityEncode(text);
    };

    // Callback. User has clicked on a word that can be replaced.  SHow the dialog.
    var clickOnTextItem = function (ev) {

        if (self.isReadOnly()) {
            return;
        }

        var span = this;

        // Active Dialog already?
        if (EditItem.Html._activeDbInstance.interaction)
            return;

        var interaction = self.getInteractionFromSpan(span);
        YUD.addClass(span, 'TDS_EDIT_SPAN_HOVER');
        EditItem.Html._activeDbInstance.activeSpan = span;
        if (interaction) {
            createTextInteractionMarkup.call(self, interaction);
        }
    };
};

EditItem.Html.Text.prototype.isReadOnly = function () { return false; };
