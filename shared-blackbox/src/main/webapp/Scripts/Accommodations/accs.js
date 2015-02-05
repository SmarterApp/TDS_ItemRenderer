var Accommodations = (function() {

    // collection of accommodations
    function Accs(id, label) {
        this._position = null;
        this._id = null;
        this._DOMId = null;
        this._label = null;
        this._types = [];
        this._typeLookup = new Util.Structs.Map();
        this._valuesLookup = new Util.Structs.Map();
        this._toolDependencies = [];
        this.setId(id || null);
        this.setLabel(label || null);
        Util.Event.Emitter(this);
    };

    Accs.DOM_ID = 'data-accs-id';

    // factory function for creating accommodations and loading with JSON data
    Accs.create = function(json) {
        var accommodations = new Accs();
        accommodations.importJson(json);
        return accommodations;
    };

    var AccsProto = Accs.prototype;

    AccsProto.getPosition = function() {
        return this._position;
    };

    AccsProto.setPosition = function(position) {
        this._position = position;
    };

    AccsProto.getId = function() {
        return this._id;
    };

    AccsProto.setId = function(id) {
        if (id) {
            // set ID passed in
            this._id = id;
            this._DOMId = id.replace(/\s+/g, '-');
        } else if (!this._id) {
            // set default ID
            this._id = 'default';
        }
    };
    
    AccsProto.getDomId = function () {
        return this._DOMId;
    };

    AccsProto.getLabel = function() {
        return this._label;
    };

    AccsProto.setLabel = function(label) {
        this._label = label;
    };

    // This creates a new accommodation type within this collection and returns it.
    AccsProto.createType = function(name, label, isVisible, isSelectable, allowChange, studentControl, dependsOn) {
        if (typeof name != 'string') {
            throw Error('Cannot create acc type because the name is not a valid string.');
        }
        var accType = this.getType(name);
        if (!accType) {
            accType = new Accs.Type(this, name, label, isVisible, isSelectable, allowChange, studentControl, dependsOn);
            this._types.push(accType);
            this._typeLookup.set(name, accType);
            this.fire('createType', accType);
        }
        return accType;
    };

    AccsProto.createTypeFromObject = function(obj) {
        if (obj instanceof Accs.Type) { // real acc type
            var dependsOnType = obj.getDependsOnTool();
            var dependsOnTypeName = (dependsOnType == null) ? null : dependsOnType.getName();
            return this.createType(obj.getName(), obj.getLabel(), obj.isVisible(), obj.isSelectable(), obj.allowChange(), obj.allowStudentControl(), dependsOnTypeName);
        } else { // json acc type
            return this.createType(obj.name, obj.label, obj.isVisible, obj.isSelectable, obj.allowChange, obj.studentControl, obj.dependsOn);
        }
    };

    // get all the types
    AccsProto.getTypes = function() {
        return this._types.slice(0);
    };

    // check if a specific type name exists
    AccsProto.hasType = function(typeName) {
        return this._typeLookup.containsKey(typeName);
    };

    // get a specific type
    AccsProto.getType = function(typeName) {
        return this._typeLookup.get(typeName);
    };

    // remove type by its name
    AccsProto.removeType = function (name) {
        var accType = this.getType(name);
        if (accType) {
            accType.destroy();
        }
    };

    // check if a value exists
    AccsProto.hasValue = function(valueCode) {
        return this._valuesLookup.containsKey(valueCode);
    };

    // get a specific value by code
    AccsProto.getValue = function(valueCode) {
        return this._valuesLookup.get(valueCode);
    };

    // checks if any of the types for these accommodations are visible
    AccsProto.isAnyVisible = function () {
        return this.getTypes().some(function(accType) {
            return accType.isVisible();
        });
    };

    // checks a type if it has a matching value code or a split code
    AccsProto.findCode = function(typeName, valueCode, requireSelected) {

        // check if accommodation type exists
        var accType = this.getType(typeName);
        if (!accType) {
            return null;
        }

        return Util.Array.find(accType.getValues(), function(accValue) {

            // if checking for selected values and this is not selected skip it
            if (requireSelected && accValue.isSelected() !== true) {
                return false;
            }

            // check if the code as is matches
            if (valueCode == accValue.getCode()) {
                return true;
            }

            // check if any of the split codes match
            var splitCodes = accValue.getCodes();

            for (var i = 0; i < splitCodes.length; i++) {
                if (valueCode == splitCodes[i]) {
                    return true;
                }
            }

            return false;

        });

    };

    // get all the values from each type
    AccsProto.getValues = function (includeAll) {
        var values = this._valuesLookup.getValues();
        return values.filter(function (accValue) {
            return (includeAll || accValue.isActive());
        });
    };

    // get all the values that are selected from each type
    AccsProto.getSelected = function () {
        return this.getValues().filter(function (accValue) {
            return accValue.isSelected();
        });
    };

    // selects all the value codes for a type and deselects any others
    AccsProto.selectCodes = function(typeName, codes) {
        
        // if passed in single code then convert to array
        if (typeof codes == 'string') {
            codes = [codes];
        }

        // if not an array then leave
        if (!$.isArray(codes)) {
            return [];
        }

        // get type
        var accType = this.getType(typeName);

        // get the values for the codes passed in
        var valuesToSelect = $.map(codes, function(code) {
            return this.getValue(code);
        }.bind(this));

        // deselect any value that is not going to be selected
        if (accType) {
            accType.getValues().forEach(function(accValue) {
                if (valuesToSelect.indexOf(accValue) == -1) {
                    accValue.deselect();
                }
            });
        }

        // select all the values to be selected
        valuesToSelect.forEach(function (accValue) {
            accValue.select();
        });

        return valuesToSelect;
    };

    // select all the values that isdefault is true for
    AccsProto.selectDefaults = function () {

        // get all the types
        var accTypes = this.getTypes();

        // split types that depend on a tool and those that don't
        var accPartition = Util.Array.partition(accTypes, function(accType) {
            return !accType.getDependsOnTool();
        });

        function selectDefaultCodes(accType) {
            var accValue = accType.getDefault();
            if (accValue) {
                this.selectCodes(accType.getName(), [accValue.getCode()]);
            }
        };

        // first select all the tools not dependent on other tools with defaults
        accPartition.matches.forEach(selectDefaultCodes.bind(this));

        // then select all the dependent tools (but they should of already been selected from first call)
        accPartition.rejects.forEach(selectDefaultCodes.bind(this));
    };

    // clear all dependency rules
    AccsProto.clearDependencies = function() {
        Util.Array.clear(this._toolDependencies);
        this.getTypes().forEach(function(accType) {
            accType.clearDependsOnTool();
        });
    };

    // set each types values as selected
    AccsProto.selectAll = function() {
        this.clearDependencies();
        this.getTypes().forEach(function (accType) {
            this.selectCodes(accType.getName(), accType.getCodes());
        }.bind(this));
    };

    // get the selected form values
    AccsProto.getSelectedEncoded = function() {
        return this.getSelected().map(function(accValue) {
            var accType = accValue.getParentType();
            var name = accType.getName();
            var code = encodeURIComponent(accValue.getCode());
            return encodeURIComponent(name + '=' + code);
        }).join('&');
    };

    // get the selected form values
    AccsProto.getSelectedDelimited = function(encode, delimiter) {
        return this.getSelected().map(function(accValue) {
            var code = accValue.getCode();
            if (encode) {
                code = encodeURIComponent(code);
            }
            return code;
        }).join(delimiter || ';');
    };

    // get all the selected accommodations in a simple JSON structure
    AccsProto.getSelectedJson = function() {
        return this.getTypes().map(function(accType) {
            return {
                type: accType.getName(),
                codes: accType.getCodes(true)
            };
        }).filter(function(obj) {
            return obj.codes.length;
        });
    };
    
    // Make a copy of the current accommodations data.
    AccsProto.clone = function() {
        var accommodations = new Accs();
        var jsonTypes = this.exportJson();
        accommodations.importJson(jsonTypes);
        return accommodations;
    };

    // Modifies the current accommodations object to contain all values that are 
    // present in both itself and in the specified accommodations.
    AccsProto.unionWith = function (other) {
        other.getTypes().forEach(function (otherType) {
            var unionType = this.createTypeFromObject(otherType);
            otherType.getValues().forEach(function(otherValue) {
                unionType.createValueFromObject(otherValue);
            });
        }.bind(this));
    };

    // Modifies the current accommodations object to replace or add the types 
    // that are present in itself with the ones in the specified accommodations.
    AccsProto.replaceWith = function(other) {
        other.getTypes().forEach(function(otherType) {

            // remove type if it exists
            var replaceType = this.getType(otherType.getName());
            if (replaceType) {
                replaceType.destroy();
            }

            // create new type
            replaceType = this.createTypeFromObject(otherType);

            // add all the values to the current accommodations
            otherType.getValues().forEach(function(otherValue) {
                replaceType.createValueFromObject(otherValue);
            });

        }.bind(this));
    };

    // adds all the selected accommodation value codes to the element
    AccsProto.applyCSS = function(el) {
        var accsId = this.getId();
        var codes = $.map(this.getValues(), function (accValue) {
            if (accValue.isSelected()) {
                return accValue.getCodes();
            }
        }).join(' ');
        $(el).addClass(codes)
             .attr(Accs.DOM_ID, accsId);
        console.log('ACCS APPLY CSS: ' + accsId);
    };

    AccsProto.removeCSS = function(el) {
        var accsId = this.getId();
        var codes = $.map(this.getValues(), function (accValue) {
            return accValue.getCodes();
        }).join(' ');
        $(el).removeClass(codes)
             .attr(Accs.DOM_ID, '');
        console.log('ACCS REMOVE CSS: ' + accsId);
    };

    // create props out of these accs
    AccsProto.createProps = function() {
        return new Accs.Properties(this);
    };

    AccsProto.getDependencies = function() {
        return this._toolDependencies;
    };

    AccsProto.addDependency = function (ifType, ifValue, thenType, thenValue, isDefault) {

        // create dependency
        var dependency = new Accs.Dependency(this, ifType, ifValue, thenType, thenValue, isDefault);

        // check for missing types and values
        if (!dependency.ifType() || !dependency.ifValue() || !dependency.thenType() || !dependency.thenValue()) {
            return null;
        }

        // add dependency
        this._toolDependencies.push(dependency);
        return dependency;
    };

    AccsProto.removeDependency = function(dep) {
        return Util.Array.remove(this._toolDependencies, dep);
    };

    // clear types
    AccsProto.clear = function() {
        Util.Array.clone(this._toolDependencies).forEach(function (dep) {
            dep.destroy();
        });
        Util.Array.clear(this._toolDependencies);
        Util.Array.clone(this._types).forEach(function (accType) {
            accType.destroy();
        });
        Util.Array.clear(this._types);
        this._typeLookup.clear();
        this._valuesLookup.clear();
    };

    AccsProto.destroy = function () {
        // remove types
        this.clear();
        // clear vars
        this._id = null;
        this._label = null;
    };
    
    return Accs;

})();