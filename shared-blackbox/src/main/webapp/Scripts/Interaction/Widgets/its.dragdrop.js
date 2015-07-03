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
(function(CM) {

    function isQTIResponse(item) {
        return item.format.toUpperCase() == 'HTQ';
    }

    function match(page, item) {

        // check if hottext item
        if (!item.isResponseType('Hottext')) {
            return false;
        }

        // look for draggables
        var stemEl = item.getStemElement();
        var $draggables = $('span.interaction.draggable', stemEl);

        if ($draggables.length > 0) {
            var id;
            if (isQTIResponse(item)) {
                // for QTI we need to use the group id
                var groupId = $draggables.attr('data-its-group');
                if (!groupId) {
                    throw new Error('Drag interaction missing group id: ' + $draggables.html().split('>')[0] + '>');
                }
                id = groupId;
            } else {
                // for ITS we use made up id
                id = 'dd-' + item.getID();
            }

            return new CM.WidgetConfig(id, stemEl);
        }

        return false;
    }

    function Widget_DD(page, item, config) {
        this.dataType = isQTIResponse(item) ? CM.DataType.Array : CM.DataType.Xml;
        this.options = {
            autoLoad: true
        };
        this.interaction = null;
    }

    CM.registerWidget('dragdrop', Widget_DD, match);

    Widget_DD.prototype.load = function() {

        var page = this.page;
        var stemEl = this.element; // stem element

        var dd = new TDS.DDInteraction(this.id);
        this.interaction = dd;
        dd.load(stemEl);

        // get draggables
        var draggables = dd.getDraggables();
        if (draggables.length > 0) {

            // tell each DD proxy what the scroll container is
            var pageElement = page.getElement();
            var scrollContainer = Util.Dom.getElementByClassName('theQuestions', 'div', pageElement);
            if (scrollContainer) {
                for (var i = 0; i < draggables.length; i++) {
                    var ddProxy = draggables[i].getProxy();
                    ddProxy.setScrollDirection(true, true);
                    ddProxy.setParentScroll(scrollContainer);
                }
            }
        }

    };

    // get <interaction> doc
    Widget_DD.prototype.getResponse = function() {
        var dd = this.interaction,
            data = null;
        // check if this requires QTI response
        if (isQTIResponse(this.entity)) {
            // get the first group responses (for ITS we don't support more than one)
            data = dd.getResponseJson()[0].responses;
        } else {
            data = dd.getResponseXml();
        }
        var isValid = dd.validateResponse();
        return this.createResponse(data, isValid);
    };

    // set <interaction> node
    Widget_DD.prototype.setResponse = function(data) {
        var dd = this.interaction;
        // check if this requires QTI response
        if (isQTIResponse(this.entity)) {
            // get the group
            var group = dd.getGroup(this.id);
            if (group) {
                // data is an array of <value>'s
                data.forEach(function (responseIdentifier) {
                    // get the draggable
                    var draggable = dd.getDraggable(responseIdentifier);
                    if (draggable) {
                        // move the draggable into the group
                        dd.onDrop(draggable, group);
                    }
                });
            }
        } else {
            dd.loadResponseXml(data);
        }
    };

})(window.ContentManager);