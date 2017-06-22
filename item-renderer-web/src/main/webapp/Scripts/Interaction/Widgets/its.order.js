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

        // look for groups
        var stemEl = item.getStemElement();
        var $groups = $('ul.interaction.order-group', stemEl);

        if ($groups.length > 0) {
            var groupId = $groups.attr('data-its-identifier');
            if (!groupId) {
                throw new Error('Order interaction missing group id: ' + $groups.html().split('>')[0] + '>');
            }
            return new CM.WidgetConfig(groupId, stemEl);
        }

        return false;
    }

    function Widget_Order_ITS(page, item, config) {
        this.dataType = isQTIResponse(item) ? CM.DataType.Array : CM.DataType.Xml;
        this.options = {
            autoLoad: true
        }
        this.interaction = null;
    }

    CM.registerWidget('order', Widget_Order_ITS, match);

    Widget_Order_ITS.prototype.load = function () {
        var stemEl = this.element; // stem element
        this.interaction = new TDS.OrderInteraction(this.id);
        this.interaction.load(stemEl);
    }

    Widget_Order_ITS.prototype.show = function () {
        this.interaction.prepareForShow();
    };

    Widget_Order_ITS.prototype.getResponseDataType = function () {
        if (isQTIResponse(this.entity)) {
            return CM.DataType.Array;
        } else {
            return CM.DataType.Xml;
        }
    }

    // get <interaction> doc
    Widget_Order_ITS.prototype.getResponse = function () {
        var data;
        if (isQTIResponse(this.entity)) {
            // get the first group responses
            data = this.interaction.getResponseJson()[0].responses;
        } else {
            data = this.interaction.getResponseXml();
        }
        var isValid = this.interaction.validateResponse();
        return this.createResponse(data, isValid);
    }

    // set <interaction> node
    Widget_Order_ITS.prototype.setResponse = function (data) {
        if (isQTIResponse(this.entity)) {
            // sort identifier keys ()
            var group = this.interaction.getGroup(this.id);
            group.sort(data);
        } else {
            // set <interaction> node ()
            this.interaction.loadResponseXml(data);
        }
    }

})(window.ContentManager);