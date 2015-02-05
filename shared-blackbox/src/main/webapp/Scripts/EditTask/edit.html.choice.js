EditItem = (typeof (EditItem) == "undefined") ? {} : EditItem;
EditItem.Html = (typeof (EditItem.Html) == "undefined") ? {} : EditItem.Html;


////////////////////////
// THe HTML logic for replacement feature, drop-down list form.
EditItem.Html.Choice = function () {
    // inherit.
    EditItem.Html.call(this);
    var self = this;
    var addComponentArray = [];

    // FOr all the choices in all the items, do stuff.
    var forAllInlineChoices = function (ftor) {
        self.forEachInteraction(function (interaction) {
            interaction.forEachInlineChoice(function (choice) {
                ftor(choice);
            });
        });
    };

    // Initialize the choices with selected/default.
    var initializeChoiceInteractions = function () {
        forAllInlineChoices(function (choice) {
            if (choice.showDefault) {
                choice.selected = true;
            } else {
                choice.selected = false;
            }
        });
    };

    // Called by the module when the div is available.  Renders the item on the page.
    this.showItem = function () {
        
        // Constructor logic.  
        initializeChoiceInteractions();

        self.forEachInteraction(function (interaction) {
            var aDiv = YUD.get(interaction.createDivId());
            var aChoice = interaction.getDefaultChoice();
            if (aDiv && aChoice) {
                aDiv.innerHTML = aChoice.content;                
                YUD.addClass(aDiv, 'TDS_EDIT_SPAN ');
                YUD.addClass(aDiv, 'edit-originaltext');    // add background-color to choice word
                YUE.addListener(aDiv, "click", clickOnChoiceItem, this);
                
                // listen for space bar or enter keys
                var boundClick = clickOnChoiceItem.bind(aDiv);
                this.setKeyHandlers(aDiv, this, boundClick);

                addComponentArray.push(aDiv);
                
                //silence this from TTS
                YUD.addClass(aDiv, "TTS speakAs");
                aDiv.setAttribute("ssml", "sub");
                aDiv.setAttribute("ssml_alias", "{silence:1000}");

                // set aria role="button"
                aDiv.setAttribute('role', 'button');
                
                // set title
                aDiv.setAttribute('title', 'click to correct');
            }
        });

        this.getComponentArray = function () {
            return addComponentArray;
        };
    };
    
    // Create the span iD that we use on the li elements
    // (mangled parent ID, choice identifier and -value)
    var getInlineChoiceId = function (interaction, choice) {
        var iid = interaction.createDivId();
        return iid + '-' + choice.identifier + '-value';
    };

    // Handle click event for the word span.  The student can edit the word.
    var clickOnChoiceItem = function (ev) {

        if (self.isReadOnly()) {
            return;
        }

        var span = this;

        // Only allow one dialog a at a time.
        if (EditItem.Html._activeDbInstance.interaction)
            return;

        var interaction = self.getInteractionFromSpan(span);
        YUD.addClass(span, 'TDS_EDIT_SPAN_HOVER');
        EditItem.Html._activeDbInstance.activeSpan = span;

        if (interaction) {
            createChoiceInteractionMarkup(interaction);
        }
    };

    var hideDropdown = function () {
        var selectNode = EditItem.Html._activeDbInstance.activeSelect;

        if (YUD.hasClass(selectNode, 'edit-nav-opened')) {
            YUD.removeClass(selectNode, 'edit-nav-opened');
            YUD.addClass(selectNode, 'edit-nav-closed');
        }
        YUE.removeListener(this, 'click', hideDropdown);
    };
    
    this.redisplay = function () {
        this.forEachInteraction(function (interaction) {
            var choiceSpan = YUD.get(interaction.createDivId());
            var selectedValue = '';
            interaction.forEachInlineChoice(function(choice) {
                if (choice.selected && !choice.showDefault) {
                    selectedValue = choice.content;
                }
            });
            this.createCrossoutSpan(interaction.getDefaultChoice().content, selectedValue, choiceSpan);
        });
    };
    
    // User has clicked on the ok button.  Get the choice, if student made one, and commit the choice
    // and also update the markup with the word choice.
    var handleOkButtonChoice = function (interaction) {
        // Update the markup.
        var responseContent = EditItem.Html._activeDbInstance.activeSelect.value;
        var choiceSpan = YUD.get(interaction.createDivId());
        var defaultChoice = interaction.getDefaultChoice();
        self.createCrossoutSpan(defaultChoice.content, responseContent, choiceSpan);
        
        // The markup looks good.  Now update the choice so we can return the results
        var choiceSpans = EditItem.Html._activeDbInstance.choiceSpans;
        for (var i = 0; i < choiceSpans.length; i++) {
            if (choiceSpans[i].selected == true) {
                
                // The span for each of the options has the choice identifier mangled 
                // into it like so:
                // 220-inlineChoiceInteraction-ETC_3-3-value
                //
                // before the -value part.
                var choiceId = choiceSpans[i].id.split('-')[3];
                interaction.forEachInlineChoice(function(choice) {
                    if (choice.identifier == choiceId) {
                        choice.selected = true;
                    } else {
                        choice.selected = false;
                    }
                });
            }
        }
    };

    // Construct the dropdown dialog box for this interaction object.  Put the choices
    // in a drop-down list, make the spans clickable, and all that.
    var createChoiceInteractionMarkup = function (interaction) {
        var dialog = EditItem.Dialog.getChoiceDialog();
        EditItem.Html._activeDbInstance.okHandler = handleOkButtonChoice;
        EditItem.Html._activeDbInstance.interaction = interaction;
        EditItem.Html._activeDbInstance.panelWidget = dialog;

        self.populateDialogBox(dialog, interaction);
        dialog.show();
    };
    
    // Create the choice list and parent container for dialog box
    this.createInteractionCore = function(interaction) {
        var parentForm = document.createElement('form');
        YUD.addClass(parentForm, 'edit-nav');
        YUD.setAttribute(parentForm, 'onSubmit', 'EditItem.Html.submit()');

        var defaultChoice = interaction.getDefaultChoice();
        this.createLabel(defaultChoice.content, parentForm, 'edit-select');

        var select = document.createElement('select');
        YUD.addClass(select, 'first-of-type');
        YUD.addClass(select, 'edit-nav-closed');
        //YUD.setAttribute(ul, 'onChange', 'EditItem.Html.submit()');
        YUD.setAttribute(select, 'id', 'edit-select');
        EditItem.Html._activeDbInstance.activeSelect = select;
        var i = 0;
        interaction.forEachInlineChoice(function (choice) {
            // Don't show the original (default) choice or the currently selected one (fb-103200)
            if (!choice.showDefault && !choice.selected) {
                // create the new <option>'s markup
                var li = document.createElement('option');
                YUD.addClass(li, 'yuimenuitem edit-nav');
                if (choice.selected) {
                    YUD.addClass(li, 'edit-list-selected');
                    YUD.setAttribute(li, 'selected', 'selected');
                }
                YUD.setAttribute(li, 'id', getInlineChoiceId(interaction, choice));
                YUD.setAttribute(li, 'groupindex', 0);
                YUD.setAttribute(li, 'index', i.toString());
                YUD.setAttribute(li, 'value', choice.content);
                li.innerHTML = choice.content;
                
                if (choice.selected && select.firstChild) {
                    YUD.insertBefore(li, select.firstChild); // show up selected <li> as default
                } else {
                    select.appendChild(li);
                }

                // Store the spans in the global dialog instance.
                EditItem.Html._activeDbInstance.choiceSpans.push(li);
            }
            i++;
        });
        parentForm.appendChild(select);
        return parentForm;
    };
};

EditItem.Html.Choice.prototype.isReadOnly = function () { return false; };
