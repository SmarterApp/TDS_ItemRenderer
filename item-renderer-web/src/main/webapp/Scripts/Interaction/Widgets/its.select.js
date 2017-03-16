//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
﻿/*
Widget for matching ITS selectables.
*/
(function (CM) {

    function isQTIResponse(item) {
        return item.format.toUpperCase() == 'HTQ';
    }

    function match(page, item) {

        // check if hottext item
        if (!item.isResponseType('Hottext')) return false;

        // look for selectables
        var stemEl = item.getStemElement();
        var $selectables = $('span.interaction.selectable', stemEl);

        if ($selectables.length > 0) {
            var groupId = $selectables.attr('data-its-group');
            return new CM.WidgetConfig(groupId, stemEl);
        }

        return false;
    }

    function Widget_Select(page, item, config) {
        this.dataType = isQTIResponse(item) ? CM.DataType.Array : CM.DataType.Xml;
        this.options = {
            autoLoad: true
        }
        this.interaction = null;
    }

    CM.registerWidget('select', Widget_Select, match);

    Widget_Select.prototype.load = function () {

        // load interaction
        var item = this.entity;
        var stemEl = this.element;
        var interaction = new TDS.SelectInteraction(this.id);
        interaction.load(stemEl);
        this.interaction = interaction;

        // check for constraints
        var constraints = Util.Array.find(item.specs, function (spec) {
            return spec.nodeName == 'constraints';
        });

        // apply constraints
        if (constraints) {
            Util.Dom.queryTagsBatch('cardinality', constraints, function (el) {
                var id = Util.Xml.getAttribute(el, 'target');
                var min = Util.Xml.getAttributeInt(el, 'min');
                var max = Util.Xml.getAttributeInt(el, 'max');
                interaction.setCardinality(id, min, max);
            });
        }

    }

    Widget_Select.prototype.getComponents = function () {
        return this.interaction.getChoices().map(function(choice) {
            return choice.getElement();
        });
    }

    // get <interaction> doc
    Widget_Select.prototype.getResponse = function () {
        var data;
        if (isQTIResponse(this.entity)) {
            data = this.interaction.getResponseArray();
        } else {
            data = this.interaction.getResponseXml();
        }
        var isValid = this.interaction.validateResponse();
        return this.createResponse(data, isValid);
    }

    // set <interaction> node
    Widget_Select.prototype.setResponse = function (data) {
        if (isQTIResponse(this.entity)) {
            // set identifier keys ("HTQ" - 33293)
            this.interaction.loadResponseIDs(data);
        } else {
            // set <interaction> node ("Hottext Passage" - 53677)
            this.interaction.loadResponseXml(data);
        }
    }

})(window.ContentManager);