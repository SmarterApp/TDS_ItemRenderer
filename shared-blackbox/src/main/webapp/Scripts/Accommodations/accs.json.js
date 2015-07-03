//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
﻿(function(Accs) {

    // imports a generic JSON data structure
    Accs.prototype.importJsonArray = function (accTypes) {

        // import types
        if (!$.isArray(accTypes)) {
            return;
        }

        // go through the json types
        for (var i = 0; i < accTypes.length; i++) {
            var jsonType = accTypes[i];

            // create real accommodation type
            var accType = this.createTypeFromObject(jsonType);

            // import values
            var jsonvalues = jsonType.values;

            for (var j = 0; j < jsonvalues.length; j++) {
                var jsonValue = jsonvalues[j];
                // create real accommodation value
                var accValue = accType.createValueFromObject(jsonValue);
            }
        }
    };

    // imports a generic JSON data structure
    Accs.prototype.importJson = function (accJson) {

        if (!accJson) {
            return;
        }

        this.setPosition(accJson.position);
        this.setId(accJson.id);
        this.setLabel(accJson.label);

        // import types
        this.importJsonArray(accJson.types);

        // import dependencies
        if ($.isArray(accJson.dependencies)) {
            // go through the json types
            for (var i = 0; i < accJson.dependencies.length; i++) {
                var jsonDependency = accJson.dependencies[i];
                this.addDependency(jsonDependency.ifType, jsonDependency.ifValue, jsonDependency.thenType, jsonDependency.thenValue, jsonDependency.isDefault);
            }
        }

    };
    
    // get all the selected accommodations in a simple JSON structure
    Accs.prototype.exportJson = function () {

        var json = {};
        json.position = this.getPosition();
        json.id = this.getId();
        json.label = this.getLabel();
        json.types = [];
        json.dependencies = [];

        this.getTypes().forEach(function(accType) {

            var accValues = accType.getValues();
            if (accValues.length == 0) {
                return; // skip types that have no values
            }

            var dependsOnType = accType.getDependsOnTool();
            var dependsOnTypeName = (dependsOnType == null) ? null : dependsOnType.getName();

            var jsonType = {
                name: accType.getName(),
                label: accType.getLabel(),
                isVisible: accType.isVisible(),
                isSelectable: accType.isSelectable(),
                allowChange: accType.allowChange(),
                studentControl: accType.allowStudentControl(),
                dependsOn: dependsOnTypeName
            };

            // add type to json
            json.types.push(jsonType);

            // create values
            jsonType.values = [];

            accValues.forEach(function (accValue) {
                var jsonValue = {
                    code: accValue.getCode(),
                    name: accValue.getName(),
                    label: accValue.getLabel(),
                    isDefault: (accValue == accType.getDefault()),
                    allowCombine: accValue.allowCombine(),
                    selected: accValue._selected
                };
                jsonType.values.push(jsonValue);
            });
        });

        this.getDependencies().forEach(function(dependency) {
            var jsonDependency = {
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

})(window.Accommodations);