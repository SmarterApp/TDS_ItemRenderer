//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
/*
Plugin for setting up QTI item body. This can be used so 
widget's can match against the QTI xml and DOM element. 
*/

(function(CM) {

    var inlineInteractions = [
        'textEntryInteraction',
        'inlineChoiceInteraction'
    ];

    function processQTI(page, item) {

        // parse qti xml string into dom
        var qtiDoc = Util.Xml.parseFromString(item.qti.xml);

        // get the <itemBody>
        var itemBodyNode = Util.Dom.getElementByTagName('itemBody', qtiDoc);

        // get all the nodes in item body
        var itemBodyChildren = Util.Dom.getElementsByTagName('*', itemBodyNode);

        // replace all the interactions with div or span
        itemBodyChildren.forEach(function (itemBodyChild) {

            // check if interaction node
            if (!Util.String.contains(itemBodyChild.nodeName, 'Interaction')) return;

            // change interaction node into html element
            var interactionType = itemBodyChild.nodeName;
            var inline = inlineInteractions.indexOf(interactionType) != -1;
            var nodeName = inline ? 'span' : 'div';
            var interactionEl = qtiDoc.createElement(nodeName);
            var interactionId = itemBodyChild.getAttribute('responseIdentifier');
            interactionEl.setAttribute('data-qti-type', interactionType);
            interactionEl.setAttribute('data-qti-identifier', interactionId);

            // set class name
            var className = 'qti-interaction';
            var customData = itemBodyChild.getAttribute('class');
            if (customData) {
                className += ' ' + customData;
            }
            interactionEl.setAttribute('class', className);

            // swap out interaction node
            $(itemBodyChild).replaceWith(interactionEl);

            // add interaction spec
            var scriptEl = qtiDoc.createElement('script');
            if (itemBodyChild.nodeName == 'customInteraction') {
                scriptEl.setAttribute('type', 'text/xml');
                scriptEl.appendChild($(itemBodyChild).children().get(0));
                // we use the first class name as the custom interaction name
                if (customData) {
                    var customList = customData.split(' ');
                    if (customList[0]) {
                        interactionEl.setAttribute('data-qti-custom', customList[0]);
                    }
                }
            } else {
                scriptEl.setAttribute('type', 'text/qti');
                scriptEl.appendChild(itemBodyChild);
            }

            interactionEl.appendChild(scriptEl);

        });

        // add the xml to the stem
        var itemBodyHtml = Util.Xml.innerHTML(itemBodyNode);
        var stemEl = item.getStemElement();
        stemEl.innerHTML = itemBodyHtml;

        // get response element
        var responseEl = item.getResponseArea();
        if (responseEl) {
            // find the first block level interaction
            var $blockInteraction = $('div.qti-interaction', stemEl);
            if ($blockInteraction.length) {
                var $afterInteraction = $blockInteraction.nextAll();
                // move the interaction and everything after into the response area
                $blockInteraction.appendTo(responseEl);
                $afterInteraction.appendTo(responseEl);
            }
        }

        // BUG: The xml nodes are not understood by html due to namespace so we need to use innerHTML...
        /*var itemBodyImport = document.importNode(itemBodyEl, true);
        $(itemBodyImport).children().each(function (idx, el) {
            $(stemEl).append(el);
        });*/
    }
    
    /////////////////////////////////

    // Plugin code for QTI

    function match(page, entity) {
        return (entity instanceof ContentItem &&
                entity.isResponseType('QTI'));
    }

    function Plugin_QTI(page, item, config) {
                
    }

    CM.registerEntityPlugin('qti', Plugin_QTI, match);

    Plugin_QTI.prototype.init = function () {
        processQTI(this.page, this.entity);
    }

    /////////////////////////////////

    // Xml container for QTI

    function Container_QTI(widgets) {
        
    }

    CM.registerResponseContainer('qti', Container_QTI);

    // this creates the response container
    Container_QTI.prototype.create = function (responses) {

        // create the <itemResponse> xml
        var xmlDoc = Util.Xml.parseFromString('<itemResponse></itemResponse>');
        var rootNode = xmlDoc.documentElement;

        // adds a <value> node to <response>
        function addValue(responseNode, value) {
            if (value == null) return;
            var valueNode = xmlDoc.createElement('value');
            valueNode.appendChild(document.createTextNode(value));
            responseNode.appendChild(valueNode);
        }

        // iterate over the widget responses
        responses.forEach(function (response) {

            // create <response> node
            var responseNode = xmlDoc.createElement('response');
            responseNode.setAttribute('id', response.id);

            // add <value>'s
            if (response.dataType == 'array') {
                response.value.forEach(function (value) {
                    addValue(responseNode, value);
                });
            } else {
                addValue(responseNode, response.value);
            }

            rootNode.appendChild(responseNode);
        });

        return Util.Xml.serializeToString(xmlDoc);
    }

    // this loads an existing response container
    Container_QTI.prototype.load = function (value, widgets) {

        // parse the <itemResponse> xml
        var xmlDoc = Util.Xml.parseFromString(value);
        var rootNode = xmlDoc.documentElement;

        // look through all the <response> nodes
        $('response', rootNode).each(function (idx, responseNode) {

            // collect all the <value>'s in an array
            var values = $('value', responseNode).map(function (valueIdx, valueNode) {
                return Util.Xml.getNodeText(valueNode);
            }).get();

            // check if any values
            if (values.length > 0) {

                // get the response identifier and find matching widget
                var id = responseNode.getAttribute('id');
                var widget = Util.Array.find(widgets, function (widget) {
                    return widget.id == id;
                });

                // if there is a matching widget set the response
                if (widget) {
                    if (widget.dataType == 'array') {
                        widget.setResponse(values);
                    } else {
                        widget.setResponse(values[0]);
                    }
                }
            }
        });

    }

    CM.mapResponseContainer('QTI', 'QTI');


})(window.ContentManager);