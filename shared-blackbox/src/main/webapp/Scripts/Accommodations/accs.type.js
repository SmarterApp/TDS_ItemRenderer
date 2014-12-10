Accommodations.Type = (function() {

    var AccType = function (parentAccommodations, name, label, isVisible, isSelectable, allowChange, studentControl, dependsOn) {

        this.getParentAccommodations = function() {
            return parentAccommodations;
        };

        this.getName = function() {
            return name;
        };

        this.getLabel = function () {
            if (typeof TDS == 'object' && TDS.messages != null) {
                var text = TDS.messages.getTextByContext('AccType', name);
                if (text != name) {
                    return text;
                }
            }
            return label ? label : name;
        };

        this.isVisible = function () {
            // check if type is allowed to be seen
            if (isVisible) {
                // then check if there are even any values to show
                return (this.getValues().length > 0);
            }
            return false;
        };

        this.isSelectable = function () {
            return (isSelectable === true);
        };

        this.allowChange = function () {
            return (allowChange === true);
        };

        this.allowStudentControl = function () {
            return (studentControl === true);
        };

        this._dependsOnTypeName = dependsOn;
        this._values = [];

        // DOM ID's
        var id = parentAccommodations.getId() + '-' + name.replace(/\s+/g, '').toLowerCase();

        this.getControlId = function() {
            return 'accs-control-' + id;
        };

        this.getId = function() {
            return 'accs-type-' + id;
        };

        // clear values
        this.clear = function() {
            // remove values
            Util.Array.clone(this._values).forEach(function (accValue) {
                accValue.destroy();
            });
            Util.Array.clear(this._values);
        };

        // destroy this object
        this.destroy = function () {
            // remove values
            this.clear();
            // remove leftover dependencies
            var self = this;
            parentAccommodations.getDependencies()
                .filter(function (dep) {
                    return dep.ifType() == self || dep.thenType() == self;
                })
                .forEach(function (dep) {
                    parentAccommodations.removeDependency(dep);
                });
            // remove from global lookup
            parentAccommodations._typeLookup.remove(name);
            // remove from parent lookup
            Util.Array.remove(parentAccommodations._types, this);
            // clear vars
            parentAccommodations = null;
            name = null;
            label = null;
            this._dependsOnTypeName = null;
        };
    };

    var AccTypeProto = AccType.prototype;

    AccTypeProto.createValue = function (code, name, label, isDefault, allowCombine) {

        if (typeof code != 'string') {
            throw Error('Cannot create acc value because the code is not a valid string.');
        }

        // check if value already exists
        var accValue = this.getParentAccommodations().getValue(code);
        if (!accValue) {
            // create value
            accValue = new Accommodations.Value(this, code, name, label, isDefault, allowCombine);
            // save value
            this._values.push(accValue);
            this.getParentAccommodations()._valuesLookup.set(code, accValue);
            this.getParentAccommodations().fire('createValue', accValue);
        }

        return accValue;
    };

    AccTypeProto.createValueFromObject = function (obj) {
        var accValue;
        if (obj instanceof Accommodations.Value) {
            accValue = this.createValue(obj.getCode(), obj.getName(), obj.getLabel(), obj.isDefault(), obj.allowCombine());
            accValue._selected = obj._selected;
        } else {
            accValue = this.createValue(obj.code, obj.name, obj.label, obj.isDefault, obj.allowCombine);
            accValue._selected = obj.selected;
        }
        return accValue;
    };

    // remove value by its code
    AccTypeProto.removeValue = function (code) {
        var accValue = this.getParentAccommodations().getValue(code);
        if (accValue) {
            this.getParentAccommodations().fire('removeValue', accValue);
            accValue.deselect(); // deselect value we are removing
            accValue.destroy();
        }
    };

    // get all the values for this type
    AccTypeProto.getValues = function (includeAll) {
        return this._values.filter(function (accValue) {
            return (includeAll || accValue.isActive());
        });
    };

    AccTypeProto.getCodes = function (requireSelected) {
        return this.getValues().filter(function (accValue) {
            // check if are skipping values that aren't selected
            return (!requireSelected || accValue.isSelected());
        }).map(function(accValue) {
            return accValue.getCode();
        });
    };

    // gets the default value
    AccTypeProto.getDefault = function () {

        // find the default value
        var defaultValue = Util.Array.find(this.getValues(), function (accValue) {
            // if there is a dependency rule found then use its default value
            var dependencyRule = accValue.getDependencyRule();
            if (dependencyRule) {
                return dependencyRule.isDefault();
            } else {
                return accValue.isDefault();
            }
        });

        // if there were no default values (would be a config error) then return first value as default
        if (defaultValue) {
            return defaultValue;
        } else {
            return this.getValues()[0];
        }
    };

    // get all the selected values
    AccTypeProto.getSelected = function () {
        return this.getValues().filter(function(accValue) {
            return accValue.isSelected();
        });
    };

    // get all the selected values
    AccTypeProto.deselectAll = function () {
        this.getValues().forEach(function (accValue) {
            accValue.deselect();
        });
    };

    // does this type support multiple selections
    AccTypeProto.isMultiSelect = function () {
        return this.getValues().some(function (accValue) {
            return accValue.allowCombine();
        });
    };

    AccTypeProto.isBoolSelect = function () {
        var values = this.getValues();
        if (values.length != 2) {
            return false;
        }
        var value1 = values[0].getName();
        var value2 = values[1].getName();
        return ((value1 == 'False' && value2 == 'True') || (value1 == 'True' && value2 == 'False'));
    };

    AccTypeProto.hashCode = function () {
        var hashString = this.getCodes().join('|');
        return Util.String.hashCode(hashString);
    };

    AccTypeProto.toString = function() {
        return this.getName();
    };

    /************************************/

    // set the accommodation type that this type depends on
    AccTypeProto.setDependsOnTool = function (name) {
        this._dependsOnTypeName = name;
    };

    // gets the acctype that this acctype depends on (null if none)
    AccTypeProto.getDependsOnTool = function () {
        if (typeof this._dependsOnTypeName == 'string') {
            var accommodations = this.getParentAccommodations();
            return accommodations.getType(this._dependsOnTypeName);
        }
        return null;
    };

    AccTypeProto.clearDependsOnTool = function () {
        this._dependsOnTypeName = null;
    };

    // get all the accommodation types that are dependent on this values accommodation type
    AccTypeProto.getDependentTypes = function () {

        var accommodations = this.getParentAccommodations();
        var accTypes = accommodations.getTypes();
        var dependentTypes = [];

        // find all the types that are dependent on this values type
        accTypes.forEach(function (accType) {
            // check if this values parent type has a dependency on another type
            if (accType.getDependsOnTool() === this) {
                // check if already added (NOTE: why would this ever happen?)
                if (dependentTypes.indexOf(accType) == -1) {
                    dependentTypes.push(accType);
                }
            }
        }.bind(this));

        return dependentTypes;
    };

    return AccType;

})();

