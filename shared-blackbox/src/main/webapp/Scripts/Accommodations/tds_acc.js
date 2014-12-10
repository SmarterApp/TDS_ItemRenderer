// collection of accommodations
function Accommodations(id, label)
{
    this._position = null;
    this._id = null;
    this._label = null;
    this._types = [];
    this._typeLookup = new Util.Structs.Map();
    this._valuesLookup = new Util.Structs.Map();
    this._toolDependencies = [];

    this.setId(id);
    this.setLabel(label);
    
    // iterate over each type
    this.each = function(fn, scope) { return Util.Array.each(this.getTypes(), fn, scope); };
    
    // find first type that matches
    this.find = function(fn, scope) { return Util.Array.find(this.getTypes(), fn, scope); };

    // find all types that match
    this.filter = function(fn, scope) { return Util.Array.filter(this.getTypes(), fn, scope); };

    /* EVENTS */
    
    // occurs when a type or value is created
    this.onCreateType = new YAHOO.util.CustomEvent('onCreateType', this, false, YAHOO.util.CustomEvent.FLAT);
    this.onRemoveType = new YAHOO.util.CustomEvent('onRemoveType', this, false, YAHOO.util.CustomEvent.FLAT);
    this.onCreateValue = new YAHOO.util.CustomEvent('onCreateValue', this, false, YAHOO.util.CustomEvent.FLAT);
    this.onRemoveValue = new YAHOO.util.CustomEvent('onRemoveValue', this, false, YAHOO.util.CustomEvent.FLAT);
    
    // occurs when the values for a type get modified (e.x., tool dependencies)
    this.onUpdateValues = new YAHOO.util.CustomEvent('onUpdateValues', this, false, YAHOO.util.CustomEvent.FLAT);

    // occurs when a value is selected or deselected
    this.onSelectValue = new YAHOO.util.CustomEvent('onSelectValue', this, false, YAHOO.util.CustomEvent.FLAT);
    this.onDeselectValue = new YAHOO.util.CustomEvent('onDeselectValue', this, false, YAHOO.util.CustomEvent.FLAT);
};

// factory function for creating accommodations and loading with JSON data
Accommodations.create = function(json)
{
    var accommodations = new Accommodations();
    accommodations.importJson(json);
    return accommodations;
};

Accommodations.prototype.getPosition = function() { return this._position; };
Accommodations.prototype.setPosition = function(position) { this._position = position; };

Accommodations.prototype.getId = function() { return this._id; };

Accommodations.prototype.setId = function(id)
{
    if (YAHOO.lang.isString(id))
    {
        // set ID passed in
        this._id = id;
    }
    else if (!YAHOO.lang.isString(this._id))
    {
        // set default ID
        this._id = 'default';
    }
};
    
Accommodations.prototype.getLabel = function() { return this._label; };
Accommodations.prototype.setLabel = function(label) { this._label = YAHOO.lang.isString(label) ? label : null; };

// This creates a new accommodation type within this collection and returns it.
Accommodations.prototype.createType = function(name, label, isVisible, isSelectable, allowChange, studentControl, dependsOn)
{
    if (!YAHOO.lang.isString(name)) throw Error('Cannot create acc type because the name is not a valid string.');

    var accType = this.getType(name);

    // check if type exists
    if (accType == null)
    {
        // create type
        accType = new Accommodations.Type(this, name, label, isVisible, isSelectable, allowChange, studentControl, dependsOn);

        // save type
        this._types.push(accType);
        this._typeLookup.set(name, accType);

        this.onCreateType.fire(accType);
    }

    return accType;
};

Accommodations.prototype.createTypeFromObject = function(obj)
{
    if (obj instanceof Accommodations.Type)
    {
        // real acc type

        var dependsOnType = obj.getDependsOnTool();
        var dependsOnTypeName = (dependsOnType == null) ? null : dependsOnType.getName();

        return this.createType(obj.getName(), obj.getLabel(), obj.isVisible(), obj.isSelectable(), obj.allowChange(), obj.studentControl(), dependsOnTypeName);
    }
    else
    {
        // json acc type
        return this.createType(obj.name, obj.label, obj.isVisible, obj.isSelectable, obj.allowChange, obj.studentControl, obj.dependsOn);
    }
};

// remove type by its name
Accommodations.prototype.removeType = function(typeName)
{
    var accType = this.getType(typeName);
    if (accType == null) return false;

    // remove types values
    accType.each(function(accValue)
    {
        accType.removeValue(accValue.getCode());
    });

    Util.Array.remove(this._types, accType);
    this._typeLookup.remove(accType.getName());
    this.onRemoveType.fire(accType);
    return true;
};

// get all the types
Accommodations.prototype.getTypes = function()
{
    return this._types.slice(0);
};

// check if a specific type name exists
Accommodations.prototype.hasType = function(typeName)
{
    return this._typeLookup.containsKey(typeName); 
};

// get a specific type
Accommodations.prototype.getType = function(typeName)
{
    return this._typeLookup.get(typeName); 
};

// check if a value exists
Accommodations.prototype.hasValue = function(valueCode)
{
    return this._valuesLookup.containsKey(valueCode);
};

// get a specific value by code
Accommodations.prototype.getValue = function(valueCode)
{
    return this._valuesLookup.get(valueCode); 
};

/************************************/

// checks a type if it has a matching value code or a split code
Accommodations.prototype.findCode = function(typeName, valueCode, requireSelected)
{
    var accType = this.getType(typeName);

    // check if accommodation type exists
    if (!accType) return null;

    return accType.find(function(accValue)
    {
        // if checking for selected values and this is not selected skip it
        if (requireSelected && accValue.isSelected() !== true) return false;

        // check if the code as is matches
        if (valueCode == accValue.getCode()) return true;

        // check if any of the split codes match
        var splitCodes = accValue.getCodes();
        
        for (var i = 0; i < splitCodes.length; i++)
        {
            if (valueCode == splitCodes[i]) return true;
        }

        return false;
    });
};

// get all the values from each type
Accommodations.prototype.getValues = function(includeDeactivated)
{
    var filteredValues = [];

    this.each(function(accType)
    {
        Util.Array.each(accType.getValues(includeDeactivated), function(accValue)
        {
            filteredValues.push(accValue);
        });
    });

    return filteredValues;
};

// get all the values that are selected from each type
Accommodations.prototype.getSelected = function()
{
    var filteredValues = [];

    this.each(function(accType)
    {
        Util.Array.each(accType.getSelected(), function(accValue)
        {
            filteredValues.push(accValue);
        });
    });

    return filteredValues;
};

// selects all the value codes for a type and deselects any others
Accommodations.prototype.selectCodes = function(typeName, codes)
{
    var valuesToSelect = [];
    if (!YAHOO.lang.isArray(codes)) {
        return valuesToSelect;
    }

    // get type
    var accType = this.getType(typeName);

    // get the values for the codes passed in
    Util.Array.each(codes, function(code) {
        var accValue = this.getValue(code);
        if (accValue) {
            valuesToSelect.push(accValue);
        }
    }, this);

    // deselect any value that is not going to be selected
    if (accType) {
        Util.Array.each(accType.getValues(), function (value) {
            if (valuesToSelect.indexOf(value) == -1) {
                value.deselect();
            }
        }, this);
    }

    // select all the values to be selected
    Util.Array.each(valuesToSelect, function(value) {
        value.select();
    }, this);

    return valuesToSelect;
};

// select all the values that isdefault is true for
Accommodations.prototype.selectDefaults = function()
{
    // get all the types
    var accTypes = this.getTypes();

    // split types that depend on a tool and those that don't
    var accPartition = Util.Array.partition(accTypes, function(accType)
    {
        return (accType.getDependsOnTool() == null);
    });

    var selectDefaultCodes = function(accType)
    {
        var accValue = accType.getDefault();
        if (accValue) this.selectCodes(accType.getName(), [accValue.getCode()]);
    };

    // first select all the tools not dependent on other tools with defaults
    Util.Array.each(accPartition.matches, selectDefaultCodes, this);

    // then select all the dependent tools (but they should of already been selected from first call)
    Util.Array.each(accPartition.rejects, selectDefaultCodes, this);
};

// clear all dependency rules
Accommodations.prototype.clearDependencies = function()
{
    // clear dependency rules
    this._toolDependencies = [];

    this.each(function(accType)
    {
        // clear dependency on a tool
        accType.clearDependsOnTool();
    });
};

// set each types values as selected
Accommodations.prototype.selectAll = function()
{
    this.clearDependencies();

    this.each(function(accType)
    {
        this.selectCodes(accType.getName(), accType.getCodes());

    }, this);
};

// get the selected form values
Accommodations.prototype.getSelectedEncoded = function()
{
    var accStrings = [];

    Util.Array.each(this.getSelected(), function(accValue)
    {
        var accType = accValue.getParentType();
        var name = accType.getName();
        var code = encodeURIComponent(accValue.getCode());
        var accString = encodeURIComponent(name + '=' + code);
        accStrings.push(accString);
    });

    return accStrings.join('&');
};

// get the selected form values
Accommodations.prototype.getSelectedDelimited = function(encode, delimiter)
{
    var accStrings = [];

    Util.Array.each(this.getSelected(), function(accValue)
    {
        var code = accValue.getCode();
        if (encode) code = encodeURIComponent(code);
        accStrings.push(code);
    });

    return accStrings.join(delimiter || ';');
};

// get all the selected accommodations in a simple JSON structure
Accommodations.prototype.getSelectedJson = function()
{
    var jsonTypes = [];

    this.each(function(accType)
    {
        var jsonType =
        {
            type: accType.getName(),
            codes: accType.getCodes(true)
        };

        if (jsonType.codes.length > 0)
        {
            jsonTypes.push(jsonType);
        }
    });

    return jsonTypes;
};

// checks if any of the types for these accommodations are visible
Accommodations.prototype.isAnyVisible = function()
{
    return (this.find(function(accType) { return accType.isVisible(); }) != null);
};

/************************************/

// imports a generic JSON data structure
Accommodations.prototype.importJson = function(accJson, preSelect)
{
    if (!YAHOO.lang.isObject(accJson)) return;

    this.setPosition(accJson.position);
    this.setId(accJson.id);
    this.setLabel(accJson.label);

    // import dependencies
    if (YAHOO.lang.isArray(accJson.dependencies))
    {
        // go through the json types
        for (var i = 0; i < accJson.dependencies.length; i++)
        {
            var jsonDependency = accJson.dependencies[i];
            this.addDependency(jsonDependency.ifType, jsonDependency.ifValue, jsonDependency.thenType, jsonDependency.thenValue, jsonDependency.isDefault);
        }
    }

    // import types
    this.importJsonArray(accJson.types, preSelect);
};

// imports a generic JSON data structure
Accommodations.prototype.importJsonArray = function(accTypes, preSelect)
{
    // import types
    if (!YAHOO.lang.isArray(accTypes)) return;

    // go through the json types
    for (var i = 0; i < accTypes.length; i++)
    {
        var jsonType = accTypes[i];

        // create real accommodation type
        var accType = this.createTypeFromObject(jsonType);

        // import values
        var jsonvalues = jsonType.values;

        for (var j = 0; j < jsonvalues.length; j++)
        {
            var jsonValue = jsonvalues[j];

            // create real accommodation value
            var accValue = accType.createValueFromObject(jsonValue);
            if (preSelect) accValue.select();
        }
    }
};

// get all the selected accommodations in a simple JSON structure
Accommodations.prototype.exportJson = function()
{
    var json = {};
    json.position = this.getPosition();
    json.id = this.getId();
    json.label = this.getLabel();
    json.types = [];
    json.dependencies = [];

    this.each(function(accType)
    {
        var accValues = accType.getValues();
        if (accValues.length == 0) return; // skip types that have no values

        var dependsOnType = accType.getDependsOnTool();
        var dependsOnTypeName = (dependsOnType == null) ? null : dependsOnType.getName();
        
        var jsonType =
        {
            name: accType.getName(),
            label: accType.getLabel(),
            isVisible: accType.isVisible(),
            isSelectable: accType.isSelectable(),
            allowChange: accType.allowChange(),
            studentControl: accType.studentControl(),
            dependsOn: dependsOnTypeName
        };

        // add type to json
        json.types.push(jsonType);

        // create values
        jsonType.values = [];

        Util.Array.each(accValues, function(accValue)
        {
            var jsonValue =
            {
                code: accValue.getCode(),
                name: accValue.getName(),
                label: accValue.getLabel(),
                isDefault: (accValue == accType.getDefault()),
                allowCombine: accValue.allowCombine(),
                selected: accValue._selected
            };

            // add value to json
            jsonType.values.push(jsonValue);
        });
    });

    Util.Array.each(this.getDependencies(), function(dependency)
    {
        var jsonDependency =
        {
            ifType: dependency.ifType().getName(),
            ifValue: dependency.ifValue().getCode(),
            thenType: dependency.thenType().getName(),
            thenValue: dependency.thenValue().getCode(),
            isDefault: dependency.isDefault()
        };

        json.dependencies.push(jsonDependency);
    });

    return json;
};

// Make a copy of the current accommodations data.
Accommodations.prototype.clone = function()
{
    var accommodations = new Accommodations();
    var jsonTypes = this.exportJson();
    accommodations.importJson(jsonTypes);
    return accommodations;
};

// Modifies the current accommodations object to contain all values that are 
// present in both itself and in the specified accommodations.
Accommodations.prototype.unionWith = function(other)
{
    var otherTypes = other.each(function(otherType)
    {
        var unionType = this.createTypeFromObject(otherType);

        otherType.each(function(otherValue)
        {
            unionType.createValueFromObject(otherValue);
        });

    }, this);
};

// Modifies the current accommodations object to replace or add the types 
// that are present in itself with the ones in the specified accommodations.
Accommodations.prototype.replaceWith = function(other)
{
    var otherTypes = other.each(function(otherType)
    {
        // check if this type already exists
        var replaceType = this.getType(otherType.name);

        if (replaceType == null)
        {
            // create new type
            replaceType = this.createTypeFromObject(otherType);
        }
        else
        {
            // remove all current values from this type
            var existingValues = replaceType.getValues();

            Util.Array.each(existingValues, function(existingValue)
            {
                replaceType.removeValue(existingValue);
            });
        }

        // add all the values to the current accommodations
        var otherValues = otherType.getValues();

        Util.Array.each(otherValues, function(otherValue)
        {
            replaceType.createValueFromObject(otherValue);
        });

    }, this);
};

Accommodations.DOM_ID = 'data-accs-id';

// adds all the selected accommodation value codes to the element
Accommodations.prototype.applyCSS = function(el) {

    var accsId = this.getId();
    Util.log('ACCS CSS APPLY: ' + accsId);

    var selectedValues = this.getSelected();
    
    Util.Array.each(selectedValues, function(accValue)
    {
        Util.Array.each(accValue.getCodes(), function(code)
        {
            YUD.addClass(el, code);
        });
    });
    
    el.setAttribute(Accommodations.DOM_ID, accsId);
};

Accommodations.prototype.removeCSS = function(el)
{
    var accsId = this.getId();
    Util.log('ACCS CSS REMOVE: ' + accsId);

    var accValues = this.getValues();
    
    Util.Array.each(accValues, function(accValue)
    {
        Util.Array.each(accValue.getCodes(), function(code)
        {
            YUD.removeClass(el, code);
        });
    });

    el.setAttribute(Accommodations.DOM_ID, '');
};

// create props out of these accs
Accommodations.prototype.createProps = function() {
    return new Accommodations.Properties(this);
};

/************************************/

Accommodations.Dependency = function(parentAccommodations, ifTypeName, ifValueCode, thenTypeName, thenValueCode, thenIsDefault)
{
    this.ifType = function() { return parentAccommodations.getType(ifTypeName); };
    this.ifValue = function() { return parentAccommodations.getValue(ifValueCode); };
    this.thenType = function() { return parentAccommodations.getType(thenTypeName); };
    this.thenValue = function() { return parentAccommodations.getValue(thenValueCode); };
    this.isDefault = function() { return (thenIsDefault === true); };
};

Accommodations.prototype.getDependencies = function()
{
    return this._toolDependencies;
};

Accommodations.prototype.addDependency = function(ifType, ifValue, thenType, thenValue, isDefault)
{
    var dependency = new Accommodations.Dependency(this, ifType, ifValue, thenType, thenValue, isDefault);
    this._toolDependencies.push(dependency);
};

/************************************/

// create a tree with one branch
Accommodations.prototype.getTree = function()
{
    var tree = new Util.Structs.TreeNode();

    // get all the types
    var accTypes = this.getTypes();

    // split types that depend on a tool and those that don't
    var results = Util.Array.partition(accTypes, function(accType)
    {
        return (accType.getDependsOnTool() == null);
    });

    // add top level accommodations to tree
    Util.Array.each(results.matches, function(accType)
    {
        var rootNode = new Util.Structs.TreeNode(accType.getName(), accType);
        tree.addChild(rootNode);
    });

    tree.forEachChild(function(node, index, children)
    {
        Util.Array.each(results.rejects, function(accType)
        {
            // check if this is a child of the parent node
            if (node.getValue() == accType.getDependsOnTool())
            {
                var childNode = new Util.Structs.TreeNode(accType.getName(), accType);
                node.addChild(childNode);
            }
        });
    });

    return tree;
};

// create a tree with one branch
Accommodations.prototype.getTypesByDependency = function()
{
    var tree = this.getTree();

    // get flattened type keys
    var typeKeys = tree.getSubtreeKeys();
    typeKeys = Util.Array.flatten(typeKeys);

    return Util.Array.map(typeKeys, function(typeKey)
    {
        return this.getType(typeKey);
    }, this);
};
