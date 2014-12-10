// CLASS: writing layout
function WritingLayout(divLayout) 
{
    this.units = []; // get all prompt unit wrappers

    this.divBigTable = YUD.getFirstChild(divLayout); // main div inside layout
    this.linkStart = YUD.getElementsByClassName('writeNow', 'a', divLayout)[0]; // link "Start Writing On Selected Prompt"
    this.linksChangePrompt = YUD.getElementsByClassName('changePrompt', 'a', divLayout); // link "Change Prompt"
    this.linkExpandAll = YUD.getElementsByClassName('expandAll', 'a', divLayout)[0];// link "Expand All Prompts"

    // check if layout is in edit mode
    this.isEditing = function()
    {
        return YUD.hasClass(this.divBigTable, 'nowWrite');
    };
    
    // enables editing on the selected prompt
    this.enableEditing = function()
    {
        var selectedUnit = this.getSelectedUnit();

        // if there is no selected prompt then nothing to do
        if (selectedUnit == null)
        {
            return false;
        }
        else
        {
            YUD.addClass(this.divBigTable, 'nowWrite');
            if (selectedUnit.item && selectedUnit.item.editor && selectedUnit.item.editor.contentLoaded)
            {
                // NOTE: Without this FF 2.0 will not be editable after showing prompt
                // BUG #16906: When in spell check mode, pressing left and right does not move to each highlighted word
                selectedUnit.item.editor.show();
                selectedUnit.item.editor.hide();
                selectedUnit.item.editor.show();

                // this fixes an issue with modal dialog taking focus and now allowing show() to focus
                ContentManager.focus(window);
                ContentManager.focus(divLayout);
            }

            selectedUnit.onOpenEdit.fire();

            return true;
        }
    };
    
    // disables editing mode and returns to prompt selection screen
    this.disableEditing = function() {
        var selectedUnit = this.getSelectedUnit();

        if (selectedUnit != null) {
            // Bug 108774 - destroy existing spellcheck instances before selecting a different response
            if (selectedUnit.item && selectedUnit.item.editor && selectedUnit.item.editor.spell) {
                selectedUnit.item.editor.spell.destroy();
            }
            // when toggling off edit mode then check if comment div is showing, if so disable it
            if (YUD.getStyle(selectedUnit.divComment, 'display') == 'block') {
                YUD.setStyle(selectedUnit.divComment, 'display', 'none');
            }
        }
        YUD.removeClass(this.divBigTable, 'nowWrite');

        selectedUnit.onCloseEdit.fire();
    };

    // toggle edit mode
    // @confirm = should confirm when going back to prompt selection
    this.toggleEdit = function()
    {
        if (this.checkForErrors('toggleEdit')) return;

        if (this.isEditing())
        {
            // Don't allow us to change response if we're in readOnlyMode
            var selectedUnit = this.getSelectedUnit();
            if (selectedUnit.item.isReadOnly()) {
                return;
            }

            // if the confirm dialog is already open then don't run this again (might happen with shortcut)
            if (YUD.hasClass(document.body, 'dialogPromptShow')) {
                return;
            }

            var self = this; // remember context of 'this'

            var closeEdit = function()
            {
                self.disableEditing();
                TTS.getInstance().stop();
                ContentManager.Menu.hide();
            };

            // if the showWarningPrompt function is found then show the user that first, otherwise just close edit mode
            if (window.TestShell)
            {
                TestShell.UI.showWarningPrompt('TDSWritingJS.Label.ChangePassage',
                {
                    yes: closeEdit
                });
            }
            else
            {
                closeEdit();
            }
        }
        else
        {
            this.enableEditing();
            TTS.getInstance().stop();
            ContentManager.Menu.hide();
        }
    };

    // is expand all link clicked
    this.isExpandAll = function()
    {
        return YUD.hasClass(this.linkExpandAll, 'collapse');
    };

    // toggle expanding all prompts
    this.toggleExpandAll = function()
    {
        if (this.isEditing()) return;
        
        for(var i = 0; i < this.units.length; i++)
        {
            // expand/collapse prompt
            if (this.isExpandAll()) this.units[i].collapse();
            else this.units[i].expand();
        }
        
        // set link class
        if (this.isExpandAll()) YUD.removeClass(this.linkExpandAll, 'collapse');
        else YUD.addClass(this.linkExpandAll, 'collapse');
    };
    
    // select a specific unit
    this.selectUnit = function(unit)
    {
        YUD.removeClass(this.linkStart, 'inactive'); // set start writing active
        
        var selectedUnit = this.getSelectedUnit();
        
        if (selectedUnit != null)
        {
            if (selectedUnit == unit) // check if prompt is already selected
            {
                if (this.isEditing()) selectedUnit.toggleExpand(); // if editing and user selected prompt it should open/close
                return;
            }

            selectedUnit.deselect(); // deselect previous prompt
        }
        
        unit.select(); // select new prompt
        
        this.checkForErrors('selectUnit');
    };
    
    // gets the currently selected unit object (or null if none are selected)
    this.getSelectedUnit = function()
    {
        for(var i = 0; i < this.units.length; i++)
        {
            if (this.units[i].isSelected()) return this.units[i];
        }

        return null;        
    };
      
    // checks layout for any errors and performs corrective action if found
    // @stack = function that caused error
    this.checkForErrors = function(stack)
    {
        stack = (stack == null) ? '' : stack;
    
        var selectedUnits = [];
        
        for (var i = 0; i < this.units.length; i++)
        {
            var unit = this.units[i];
            if (unit.isSelected()) selectedUnits.push(unit);
        }

        // check if multiple prompts are selected
        if (selectedUnits.length > 1)
        {
            // An error has occured. You will need to reselect your prompt.
            for (var i = 0; i < selectedUnits.length; i++)
            {
                selectedUnits[i].deselect();
                selectedUnits[i].hiddenChanged.value = true;                
            }

            if (this.isEditing()) this.disableEditing(); // if editing go back to selection screen

            return true;
        }
        
        return false;
    };
    
    /*** INIT ***/
    YUE.addListener(this.linkStart, 'click', this.toggleEdit, this, true); // switch to writing mode
    YUE.addListener(this.linksChangePrompt, 'click', this.toggleEdit, this, true); // switch back to selection mode
    YUE.addListener(this.linkExpandAll, 'click', this.toggleExpandAll, this, true); // expand all prompts
};
