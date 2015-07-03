//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
﻿Accommodations.Value = (function () {

    var AccValue = function (parentType, code, name, label, isDefault, allowCombine) {

        this.getParentType = function () {
            return parentType;
        };

        this.getCode = function () {
            return code;
        };

        this.setCode = function (str) {
            code = str;
        };

        this.getCodes = function () {
            return (code && code.split('&')) || [];
        };

        this.getName = function () {
            return name;
        };

        this.setName = function (str) {
            name = str;
        };

        this.allowCombine = function () {
            return (allowCombine === true);
        };

        this.setCombinable = function (value) {
            allowCombine = !!value;
        };

        this.getLabel = function () {
            if (typeof TDS == 'object' && TDS.messages != null) {
                var text = TDS.messages.getTextByContext('AccValue', code);
                if (text != code) {
                    return text;
                }
            }
            return label ? label : name;
        };

        this.setLabel = function(str) {
            label = str;
        };

        // the original default value
        this._isDefault = isDefault;

        // get if this value selected
        // NOTE: use select() and deselect() functions to set this
        this._selected = false;

        this.destroy = function () {
            // remove dependencies
            var self = this;
            parentType.getParentAccommodations().getDependencies()
                .filter(function (dep) {
                    return dep.ifValue() == self || dep.thenValue() == self;
                })
                .forEach(function (dep) {
                    parentType.getParentAccommodations().removeDependency(dep);
                });
            // remove from global lookup
            parentType.getParentAccommodations()._valuesLookup.remove(code);
            // remove from parent lookup
            Util.Array.remove(parentType._values, this);
            // clear vars
            parentType = null;
            code = null;
            label = null;
        };

        this.toString = function () {
            return code;
        };
    };

    var AccValueProto = AccValue.prototype;

    // gets the original isdefault for this value (NOTE: use the acc types getDefault() instead)
    AccValueProto.setDefault = function (isDefault) {
        this._isDefault = !!isDefault;
    };

    AccValueProto.isDefault = function () {
        return this._isDefault;
    };

    /*
    // set this value as the default
    ValueProto.setDefault = function()
    {
        var values = this.getParentType().getValues();
    
        Util.Array.each(values, function(value)
        {
            value._isDefault = (value == this);
        });
    }*/

    AccValueProto.isSelected = function () { return this._selected; };

    // set this value as selected and perform any business rules associated to it
    AccValueProto.select = function () {

        // check if value is already selected
        if (this._selected) {
            return false;
        }

        // make sure the value is visible before allowing anyone to select it
        if (!this.isActive()) {
            return false;
        }

        var parentType = this.getParentType();

        // if this value does not allow to be combined with other 
        // values we need to deselect all other values for this type
        if (!this.allowCombine()) {
            var selectedValues = parentType.getSelected();
            selectedValues.forEach(function(selectedValue) {
                selectedValue.deselect();
            });
        }

        // mark value as selected
        this._selected = true;

        // find all the types that are dependent on this value being changed
        var dependentTypes = parentType.getDependentTypes();
        dependentTypes.forEach(function (dependentType) {

            // deselect all visible and hidden responses for dependent type
            var allValues = dependentType.getValues(true);
            allValues.forEach(function (dependentValue) {
                dependentValue.deselect();
            });

            // set default value of depdenent type as selected
            var dependentDefaultValue = dependentType.getDefault();
            if (dependentDefaultValue) {
                dependentDefaultValue.select();
            }
        });

        parentType.getParentAccommodations().fire('selectValue', this);

        return true;
    };

    AccValueProto.deselect = function () {
        // check if value is already deselected
        if (!this._selected) {
            return false;
        }

        this._selected = false;
        this.getParentType().getParentAccommodations().fire('deselectValue', this);

        return true;
    };

    /************************************/

    // find a matching dependency rule for this value
    AccValueProto.getDependencyRule = function () {

        // check for parent type
        var parentType = this.getParentType();
        if (!parentType) {
            return null;
        }

        // check if this value has a tool dependancy
        var dependancyType = parentType.getDependsOnTool();
        if (!dependancyType) {
            return null;
        }

        var accs = parentType.getParentAccommodations();

        // iterate through all the dependancies
        var dependancy = Util.Array.find(accs.getDependencies(), function (dependency) {
            // check if we found a matching tool dependency
            var accIfType = dependency.ifType();

            if (accIfType && accIfType == dependancyType) {
                // check if the tool dependency value is selected
                var accIfValue = dependency.ifValue();

                if (accIfValue && accIfValue.isSelected()) {
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
    AccValueProto.isActive = function () {
        
        // check if there is a dependency required and if so then make sure the rule matches something
        var dependancyType = this.getParentType().getDependsOnTool();

        if (dependancyType != null) {
            return (this.getDependencyRule() != null);
        }

        // no dependency rules..
        return true;
    };

    // if this value is selected then filter the type to a code
    AccValueProto.restrict = function (restrictType, byValue, isDefault) {
        var thisType = this.getParentType();
        var accs = thisType.getParentAccommodations();
        var restrictTypeObj = accs.getType(restrictType);
        var restrictValueObj = accs.getValue(byValue);
        if (restrictTypeObj) {
            restrictTypeObj.setDependsOnTool(thisType.getName());
        }
        isDefault = isDefault || (restrictValueObj && restrictValueObj.isDefault());

        // set dependency
        accs.addDependency(thisType.getName(), this.getCode(), restrictType, byValue, isDefault);
    };

    // this value depends on the selected code of another value
    AccValueProto.depends = function (dependType, onValue, isDefault) {
        var thisType = this.getParentType();
        var accs = thisType.getParentAccommodations();
        thisType.setDependsOnTool(dependType);
        isDefault = isDefault || this.isDefault();

        // set dependency
        accs.addDependency(dependType, onValue, thisType.getName(), this.getCode(), isDefault);
    };

    return AccValue;

})();