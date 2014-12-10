Accommodations.Type = function(parentAccommodations, name, label, isVisible, isSelectable, allowChange, studentControl, dependsOn)
{
    this.getParentAccommodations = function() { return parentAccommodations; };
    this.getName = function() { return name; };

    this.getLabel = function()
    {
        if (typeof TDS == 'object' && TDS.messages != null)
        {
            var text = TDS.messages.getTextByContext('AccType', name);
            if (text != name) return text;
        }

        return (label) ? label : name;
    };

    this.isVisible = function()
    {
        // check if type is allowed to be seen
        if (isVisible)
        {
            // then check if there are even any values to show
            return (this.getValues().length > 0);
        }

        return false;
    };

    this.isSelectable = function() { return (isSelectable === true); };
    this.allowChange = function() { return (allowChange === true); };
    this.studentControl = function() { return (studentControl === true); };
    this._dependsOnTypeName = dependsOn;
    this._values = [];

    // DOM ID's
    var id = parentAccommodations.getId() + '-' + name.replace(/\s+/g, '').toLowerCase();
    this.getControlId = function() { return 'accs-control-' + id; };
    this.getId = function() { return 'accs-type-' + id; };

    // iterate over each value
    this.each = function(fn, scope) { return Util.Array.each(this.getValues(), fn, scope); };

    // find first value that matches
    this.find = function(fn, scope) { return Util.Array.find(this.getValues(), fn, scope); };

    // find all values that match
    this.filter = function(fn, scope) { return Util.Array.filter(this.getValues(), fn, scope); };

    // check if any value matches
    this.some = function(fn, scope) { return Util.Array.some(this.getValues(), fn, scope); };
};

Accommodations.Type.prototype.createValue = function(code, name, label, isDefault, allowCombine)
{
    if (!YAHOO.lang.isString(code)) throw Error('Cannot create acc value because the code is not a valid string.');

    // check if value already exists
    var accValue = this.getParentAccommodations().getValue(code);

    if (accValue == null)
    {
        // create value
        accValue = new Accommodations.Value(this, code, name, label, isDefault, allowCombine);

        // save value
        this._values.push(accValue);
        this.getParentAccommodations()._valuesLookup.set(code, accValue);
        this.getParentAccommodations().onCreateValue.fire(accValue);
    }

    return accValue;
};

Accommodations.Type.prototype.createValueFromObject = function(obj)
{
    var accValue;

    if (obj instanceof Accommodations.Value)
    {
        accValue = this.createValue(obj.getCode(), obj.getName(), obj.getLabel(), obj.isDefault(), obj.allowCombine());
        accValue._selected = obj._selected;
    }
    else
    {
        accValue = this.createValue(obj.code, obj.name, obj.label, obj.isDefault, obj.allowCombine);
        accValue._selected = obj.selected;
    }

    return accValue;
};

// remove value by its code
Accommodations.Type.prototype.removeValue = function(code)
{
    var accValue = this.getParentAccommodations().getValue(code);

    if (accValue != null)
    {
        // deselect value we are removing
        accValue.deselect();

        Util.Array.remove(this._values, accValue);
        this.getParentAccommodations()._valuesLookup.remove(accValue.getCode());
        this.getParentAccommodations().onRemoveValue.fire(accValue);
    }
};

// get all the values for this type
Accommodations.Type.prototype.getValues = function(includeDeactivated)
{
    return Util.Array.filter(this._values, function(accValue)
    {
        // return all values no matter what
        if (includeDeactivated === true) return true;
        
        // return only values that aren't filtered by dependency rules
        return (accValue.isActive());
    });
};

Accommodations.Type.prototype.getCodes = function(requireSelected)
{
    var codes = [];
    var values = this.getValues();

    Util.Array.each(values, function(accValue)
    {
        // check if are skipping values that aren't selected
        if (requireSelected && accValue.isSelected() !== true) return; 
        codes.push(accValue.getCode());
    });

    return codes;
};

// gets the default value
Accommodations.Type.prototype.getDefault = function()
{
    var values = this.getValues(true);

    // find the default value
    var defaultValue = this.find(function(accValue)
    {
        var dependencyRule = accValue.getDependencyRule();

        // if there is a dependency rule found then use its default value
        if (dependencyRule)
        {
            return dependencyRule.isDefault();
        }
        else
        {
            return accValue.isDefault();
        }
    });

    // if there were no default values (would be a config error) then return first value as default
    if (defaultValue) return defaultValue;
    else return this.getValues()[0];
};

// get all the selected values
Accommodations.Type.prototype.getSelected = function()
{
    return Util.Array.filter(this.getValues(), function(accValue)
    {
        return accValue.isSelected();
    });
};

// get all the selected values
Accommodations.Type.prototype.deselectAll = function()
{
    return this.each(function(value) 
    {
        value.deselect();
    });
};

// does this type support multiple selections
Accommodations.Type.prototype.isMultiSelect = function()
{
    return this.some(function(value)
    {
        return value.allowCombine();
    });
};

Accommodations.Type.prototype.isBoolSelect = function()
{
    var values = this.getValues();

    if (values.length != 2) return false;

    var value1 = values[0].getName();
    var value2 = values[1].getName();
    return ((value1 == 'False' && value2 == 'True') || (value1 == 'True' && value2 == 'False'));
};

Accommodations.Type.prototype.hashCode = function()
{
    var hashString = this.getCodes().join('|');
    return Util.String.hashCode(hashString);
};

Accommodations.Type.prototype.toString = function() { return this.getName(); };

/************************************/

// gets the acctype that this acctype depends on (null if none)
Accommodations.Type.prototype.getDependsOnTool = function()
{
    if (YAHOO.lang.isString(this._dependsOnTypeName))
    {
        var accommodations = this.getParentAccommodations();
        return accommodations.getType(this._dependsOnTypeName);
    }

    return null;
};

Accommodations.Type.prototype.clearDependsOnTool = function()
{
    this._dependsOnTypeName = null;
};

// get all the accommodation types that are dependent on this values accommodation type
Accommodations.Type.prototype.getDependentTypes = function()
{
    var accommodations = this.getParentAccommodations();
    var accTypes = accommodations.getTypes(); 
    var dependentTypes = [];

    // find all the types that are dependent on this values type
    Util.Array.each(accTypes, function(accType)
    {
        // check if this values parent type has a dependency on another type
        if (this === accType.getDependsOnTool())
        {
            // check if already added
            if (dependentTypes.indexOf(accType) == -1)
            {
                dependentTypes.push(accType);
            }
        }

    }, this);

    return dependentTypes;
};