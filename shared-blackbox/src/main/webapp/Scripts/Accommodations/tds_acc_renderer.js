Accommodations.Renderer = function(accommodations, parentContainer)
{
    this._accommodations = accommodations;
    this._parentContainer = YAHOO.util.Dom.get(parentContainer);
};

Accommodations.Renderer.prototype.getDoc = function()
{
    return this._parentContainer.ownerDocument;
};

Accommodations.Renderer.prototype.getContainer = function()
{
    var containerId = 'accs-container-' + this._accommodations.getId();
    return this.getDoc().getElementById(containerId);
};

Accommodations.Renderer.prototype.getForm = function()
{
    var formId = 'accs-form-' + this._accommodations.getId();
    return this.getDoc().forms[formId];
};

Accommodations.Renderer.prototype.bind = function()
{
    var renderer = this;

    this._accommodations.onSelectValue.subscribe(function(accValue)
    {
        Util.log('AccSelect: ' + accValue);

        // find all the types that are dependent on this value being changes and rerender
        var dependentTypes = accValue.getParentType().getDependentTypes();

        Util.Array.each(dependentTypes, function(dependentType)
        {
            // re-render the HTML for this type
            renderer.renderAccommodationType(dependentType);
        });
    });
};

Accommodations.Renderer.prototype.init = function()
{
    // check for container
    var container = this.getContainer();
    
    if (container == null)
    {
        var containerId = 'accs-container-' + this._accommodations.getId();
        container = HTML.DIV({ id: containerId });
        this._parentContainer.appendChild(container);
    }

    // clear current html
    var form = this.getForm();

    if (form == null)
    {
        var formId = 'accs-form-' + this._accommodations.getId();
        form = HTML.FORM({ id: formId, name: formId });
        container.appendChild(form);
    }
};

Accommodations.Renderer.prototype.render = function()
{
    // create container elements and form
    this.init();

    // get all the acc types
    var accTypes = this._accommodations.getTypes();

    // get only the types that don't have dependencies
    var accParentTypes = Util.Array.filter(accTypes, function(accType)
    {
        return (accType.getDependsOnTool() == null);
    });

    // iterate through each non-dependent type and render it
    Util.Array.each(accParentTypes, function(accParentType)
    {
        this.renderAccommodationType(accParentType);

        // now iterate through each of this types dependencies and render them
        Util.Array.each(accParentType.getDependentTypes(), this.renderAccommodationType, this);

    }, this);

    return true;
};

// set this to true to hide accommodations that are not visible
Accommodations.Renderer.hideInvisible = true;

// set tis to true to hide accommodations that are not selectable
Accommodations.Renderer.hideUnselectable = true;

Accommodations.Renderer.prototype.renderAccommodationType = function(accType)
{
    var doc = this.getDoc();
    var form = this.getForm();

    var accContainer = doc.getElementById(accType.getControlId());
    var accTypeHash = accType.hashCode();

    if (accContainer != null)
    {
        // check if there is a difference
        // if (accTypeHash == (accContainer.getAttribute('hash') * 1)); return;

        // clear existing container
        Util.Dom.removeChildren(accContainer);
    }

    if (accContainer == null)
    {
        // create container
        accContainer = doc.createElement('div');
        accContainer.setAttribute('id', accType.getControlId());
        form.appendChild(accContainer);
    }
    
    // clear all previous classes
    accContainer.className = '';

    // check if this type has any dependencies at all
    if (accType.getDependsOnTool() != null)
    {
        YUD.addClass(accContainer, 'dependency');
    }

    // check if accommodation is visible
    if ((Accommodations.Renderer.hideInvisible && !accType.isVisible()) ||
        (Accommodations.Renderer.hideUnselectable && !accType.isSelectable()))
    {
        YUD.setStyle(accContainer, 'display', 'none');
        return; // don't render
    }
    else
    {
        YUD.setStyle(accContainer, 'display', 'block');
    }

    // create form element label
    var label = doc.createElement('label');
    label.setAttribute('for', accType.getId());
    label.setAttribute('i18n-text', accType.getId());
    var labelText = doc.createTextNode(accType.getLabel() + ': ');
    label.appendChild(labelText);
    accContainer.appendChild(label);

    // logic for figuring out best way to render this accommodation
    if (accType.isBoolSelect())
    {
        YUD.addClass(accContainer, 'checkbox');
        this.renderCheckBox(accType, accContainer);
    }
    else if (accType.isMultiSelect())
    {
        YUD.addClass(accContainer, 'multiselect');
        this.renderMultiSelect(accType, accContainer);
    }
    else
    {
        YUD.addClass(accContainer, 'singleselect');
        this.renderSingleSelect(accType, accContainer);
    }

    // create line break
    var clear = doc.createElement('span');
    YUD.addClass(clear, 'clear');
    accContainer.appendChild(clear);
};

// render this accommodation as a checkbox
Accommodations.Renderer.prototype.renderCheckBox = function(accType, container)
{
    var renderer = this;
    var doc = this.getDoc();
    var accValues = accType.getValues();

    // get the code that represents "true"
    var trueCode = accValues[1].getCode();

    // <input id="checkbutton1" type="checkbox" name="checkboxfield1" value="1" checked>
    var checkbox = doc.createElement('input');
    checkbox.setAttribute('id', accType.getId());
    checkbox.setAttribute('name', accType.getId());
    checkbox.setAttribute('type', 'checkbox');
    checkbox.setAttribute('tabindex', 0);

    checkbox.value = accValues[1].getCode();

    Util.Array.each(accValues, function(accValue)
    {
        // if this value is selected and represents "true" then check the checkbox
        if (accValue.isSelected() && accValue.getCode() == checkbox.value)
        {
            checkbox.checked = true;
        }
    });

    // check if accommodation is selectable and if it isn't then disable form element
    if (!accType.isSelectable() || accType.getValues().length <= 1)
    {
        checkbox.disabled = true;
    }

    // click events
    YUE.on(checkbox, 'click', function()
    {
        renderer.save();
    });

    container.appendChild(checkbox);
    return checkbox;
};

// render this accommodation as dropdown select box
Accommodations.Renderer.prototype.renderSingleSelect = function(accType, container)
{
    var renderer = this;
    var doc = this.getDoc();
    var accValues = accType.getValues();

    // create selectbox element
    var select = doc.createElement('select');
    select.id = accType.getId();
    select.name = accType.getId();
    select.setAttribute('tabindex', 0);

    // check if accommodation supports multiple selections
    if (accType.isMultiSelect())
    {
        select.setAttribute('multiple', 'multiple');
    }

    // add selectbox options
    var optIdx = 0;

    Util.Array.each(accValues, function(accValue)
    {
        if (accType.isMultiSelect())
        {
            // skip this if the value name is "None" or the code represents none.
            if (accValue.getCode() == 'None' || accValue.getCode().indexOf('_None') != -1) return;
        }

        var optionLabel = accValue.getLabel() || accValue.getCode();
        var optionValue = accValue.getCode();
        var option = select.options[optIdx] = new Option(optionLabel, optionValue);
        option.selected = accValue.isSelected();
        optIdx++;
    });

    // check if accommodation is selectable and if it isn't then disable form element
    if (!accType.isSelectable() || accType.getValues().length <= 1)
    {
        select.disabled = true;
    }

    // click events
    YUE.on(select, 'change', function()
    {
        renderer.save();
    });

    container.appendChild(select);
    return select;
};

// render this accommodation as a series of checkboxes with logic for if combinations of values are possible
Accommodations.Renderer.prototype.renderMultiSelect = function(accType, container)
{
    var renderer = this;
    var accommodations = this._accommodations;
    var doc = this.getDoc();
    var form = this.getForm();

    var valueContainer = doc.createElement('div');
    YUD.addClass(valueContainer, 'values');

    // figuring out what to do with the checkboxes when they are clicked
    var clickEvent = function(clickedCheckbox, clickedValue)
    {
        // get all the checkboxes for this type
        var checkboxes = form[accType.getId()];

        // check if anything else else is selected
        if (!clickedCheckbox.checked)
        {
            var defaultValue = accType.getDefault();
            var defaultCheckbox = null;

            for (var i = 0; i < checkboxes.length; i++)
            {
                var checkbox = checkboxes[i];

                // keep track of default checkbox in case we need to select it
                if (defaultValue.getCode() == checkbox.value) defaultCheckbox = checkbox;

                // if there is something selected already then we can leave
                if (checkbox.checked) return;
            }

            // if we got here nothing was checked so we check the default
            defaultCheckbox.checked = true;
            return;
        }

        // make sure no checkboxes that cannot be combined aren't checked
        if (clickedValue.allowCombine())
        {
            Util.Array.each(checkboxes, function(checkbox)
            {
                // get value by code
                var accValue = accommodations.getValue(checkbox.value);

                if (!accValue.allowCombine())
                {
                    checkbox.checked = false;
                }
            });

            return;
        }

        Util.Array.each(checkboxes, function(checkbox)
        {
            // deselect all checkboxes other than the selected one
            if (clickedCheckbox.value != checkbox.value)
            {
                checkbox.checked = false;
            }
        });
    };

    // add check boxes
    var accValues = accType.getValues();

    Util.Array.each(accValues, function(accValue)
    {
        // <label>Value goes here<input name="acc_TTS" type="checkbox" value="TTS_Item">

        // <label>
        var valueLabel = doc.createElement('label');
        if (!accType.isSelectable()) YUD.addClass(valueLabel, 'disabled');
        valueContainer.appendChild(valueLabel);

        // <input type="checkbox">
        var valueCB = doc.createElement('input');
        valueCB.setAttribute('name', accType.getId()); // accValue.browserID
        valueCB.setAttribute('type', 'checkbox');
        valueCB.value = accValue.getCode();

        if (accValue.allowCombine()) YUD.addClass(valueCB, 'allowCombine');

        // if this value is selected and represents "true" then check the checkbox
        if (accValue.isSelected()) valueCB.checked = true;

        // check if accommodation is selectable and if it isn't then disable form element
        if (!accType.isSelectable() || accType.getValues().length <= 1)
        {
            valueCB.disabled = true;
        }

        // click events
        YUE.on(valueCB, 'click', function()
        {
            clickEvent(valueCB, accValue);
            renderer.save();
        });

        // add checkbox to the label
        valueLabel.appendChild(valueCB);

        // add text to the label
        var labelText = doc.createTextNode(accValue.getLabel());
        valueLabel.appendChild(labelText);

    });

    container.appendChild(valueContainer);
};

// sync's the form values with the accommodation data structure
Accommodations.Renderer.prototype.save = function()
{
    var form = this.getForm();

    var accTypes = this._accommodations.getTypes();

    Util.Array.each(accTypes, function(accType)
    {
        var accValues = accType.getValues();
        var formElement = form[accType.getId()];

        // make sure form element was visible
        if (formElement == null) return;

        // CHECKBOX
        if (accType.isBoolSelect())
        {
            var accValue = formElement.checked ? accValues[1] : accValues[0];
            this._accommodations.selectCodes(accType.getName(), [accValue.getCode()]);
        }
        // SELECT MULTIPLE
        else if (accType.isMultiSelect())
        {
            var selectedCodes = [];

            // get all the checkboxes for this type
            var checkboxes = form[accType.getId()];
            
            Util.Array.each(checkboxes, function(checkbox)
            {
                if (checkbox.checked) selectedCodes.push(checkbox.value);
            });

            this._accommodations.selectCodes(accType.getName(), selectedCodes);
        }
        // SELECT SINGLE
        else
        {
            this._accommodations.selectCodes(accType.getName(), [formElement.value]);
        }
        
    }, this);

};

