Accommodations.Value = function(parentType, code, name, label, isDefault, allowCombine)
{
    this.getParentType = function() { return parentType; };
    this.getCode = function() { return code; };
    this.getCodes = function() { return code.split('&'); };
    this.getName = function() { return name; };
    this.allowCombine = function() { return (allowCombine === true); };

    this.getLabel = function()
    {
        if (typeof TDS == 'object' && TDS.messages != null)
        {
            var text = TDS.messages.getTextByContext('AccValue', code);
            if (text != code) return text;
        }

        return (label) ? label : name;
    };

    // the original default value
    this._isDefault = isDefault;

    // get if this value selected
    // NOTE: use select() and deselect() functions to set this
    this._selected = false;

    this.toString = function() { return code; };
};

// gets the original isdefault for this value (NOTE: use the acc types getDefault() instead)
Accommodations.Value.prototype.isDefault = function() { return this._isDefault; };

/*
// set this value as the default
Accommodations.Value.prototype.setDefault = function()
{
    var values = this.getParentType().getValues();

    Util.Array.each(values, function(value)
    {
        value._isDefault = (value == this);
    });
}*/

Accommodations.Value.prototype.isSelected = function() { return this._selected; };

// set this value as selected and perform any business rules associated to it
Accommodations.Value.prototype.select = function()
{
    // check if value is already selected
    if (this._selected) return false;

    // make sure the value is visible before allowing anyone to select it
    if (!this.isActive()) return false;

    var parentType = this.getParentType();

    // if this value does not allow to be combined with other 
    // values we need to deselect all other values for this type
    if (!this.allowCombine())
    {
        var selectedValues = parentType.getSelected();

        Util.Array.each(selectedValues, function(selectedValue)
        {
            selectedValue.deselect();
        });
    }

    // mark value as selected
    this._selected = true;

    // find all the types that are dependent on this value being changed
    var dependentTypes = parentType.getDependentTypes();

    Util.Array.each(dependentTypes, function(dependentType)
    {
        // deselect all visible and hidden responses for dependent type
        Util.Array.each(dependentType.getValues(true), function(dependentValue)
        {
            dependentValue.deselect();
        });

        // set default value of depdenent type as selected
        var dependentDefaultValue = dependentType.getDefault();
        if (dependentDefaultValue) dependentDefaultValue.select();
    });

    parentType.getParentAccommodations().onSelectValue.fire(this);

    return true;
};

Accommodations.Value.prototype.deselect = function()
{
    // check if value is already deselected
    if (!this._selected) return false;

    this._selected = false;
    this.getParentType().getParentAccommodations().onDeselectValue.fire(this);

    return true;
};

/************************************/

// find a matching dependency rule for this value
Accommodations.Value.prototype.getDependencyRule = function()
{
    // check if this value has a tool dependancy
    var dependancyType = this.getParentType().getDependsOnTool();
    if (dependancyType == null) return null;

    var accommodations = this.getParentType().getParentAccommodations();

    // iterate through all the dependancies
    var dependancy = Util.Array.find(accommodations.getDependencies(), function(dependency)
    {
        // check if we found a matching tool dependency
        var accIfType = dependency.ifType();

        if (accIfType && accIfType == dependancyType)
        {
            // check if the tool dependency value is selected
            var accIfValue = dependency.ifValue();

            if (accIfValue && accIfValue.isSelected())
            {
                // at this point we found a matching ifType/ifValue, now lets see if the theValue matches
                var accThenValue = dependency.thenValue();
                return (accThenValue == this);
            }
        }

        return false;

    }, this);

    return dependancy;
};

// this will be true as long a rule dependency is not disabling it
Accommodations.Value.prototype.isActive = function()
{
    // check if there is a dependency required and if so then make sure the rule matches something
    var dependancyType = this.getParentType().getDependsOnTool();

    if (dependancyType != null)
    {
        return (this.getDependencyRule() != null);
    }

    // no dependency rules..
    return true;
};

