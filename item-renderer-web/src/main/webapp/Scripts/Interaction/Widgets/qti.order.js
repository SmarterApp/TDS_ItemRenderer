//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
﻿// This module is used for setting up the hottext interactions (e.x., selectables, draggables)
(function (CM) {

    var QTI = CM.QTI;
    var match = QTI.createWidgetMatch('orderInteraction');

    function Widget_Order(page, item, config) {
        this.dataType = CM.DataType.Array;
        this.options = {
            autoLoad: true
        }
        this.interaction = null;
    }

    CM.registerWidget('qti.order', Widget_Order, match);

    Widget_Order.prototype.load = function () {

        var containerEl = this.element; // dom element
        var interactionNode = this.config; // qti element
        var interactionDoc = interactionNode.ownerDocument;
        var interactionId = this.id;

        // create the prompt <div>
        QTI.replacePrompt(interactionNode);

        // create <ul> container
        var listEl = interactionDoc.createElement('ul');
        listEl.setAttribute('class', 'interaction order-group');
        listEl.setAttribute('data-its-identifier', this.id);

        // replace all the <hottext> nodes with <span>'s
        var choiceSpans = QTI.replaceNodes(interactionNode, 'simpleChoice', function (simpleNode) {
            var span = interactionDoc.createElement('li');
            span.setAttribute('class', 'interaction order-choice');
            span.setAttribute('data-its-group', interactionId);
            span.setAttribute('data-its-identifier', simpleNode.getAttribute('identifier'));
            return span;
        });

        // move all the choice spans into the list <ul>
        $(choiceSpans).appendTo(listEl);

        // move the <ul> into the interaction node (right after the prompt <div>)
        $(listEl).appendTo(interactionNode);

        // add html to dom element
        var interactionEl = QTI.createInteractionElement(interactionNode);

        // load select interaction
        this.interaction = new TDS.OrderInteraction('order-' + this.id);
        this.interaction.load(interactionEl);

        // add element to the dom
        containerEl.appendChild(interactionEl);
    }
    
    Widget_Order.prototype.show = function () {
        this.interaction.prepareForShow();
    };

    Widget_Order.prototype.getResponse = function () {
        // get the first group responses
        var values = this.interaction.getResponseJson()[0].responses;
        var isValid = this.interaction.validateResponse();
        return this.createResponse(values, isValid);
    }

    Widget_Order.prototype.setResponse = function (values) {
        var group = this.interaction.getGroup(this.id);
        group.sort(values);
    }

})(window.ContentManager);