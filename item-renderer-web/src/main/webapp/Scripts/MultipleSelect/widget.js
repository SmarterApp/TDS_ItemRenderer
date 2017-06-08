//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
/*
Widget for the QTI choiceInteraction
*/

(function (CM) {

    var MS = TDS.MultipleSelect;
    var Renderer = TDS.MultipleSelect.Renderer;

    // Parse the QTI and create a MS object
    function parseQTI(interactionNode) {
        
        // setup MS
        var responseIdentifier = interactionNode.getAttribute('responseIdentifier');
        var minChoices = interactionNode.getAttribute('minChoices') * 1;
        var maxChoices = interactionNode.getAttribute('maxChoices') * 1;
        var orientation = interactionNode.getAttribute('orientation');
        var ms = new MS(responseIdentifier, minChoices, maxChoices, orientation);

        // set prompt
        var promptNode = Util.Dom.getElementByTagName('prompt', interactionNode);
        if (promptNode) {
            ms.prompt = Util.Xml.innerHTML(promptNode);
        }

        // load options
        var simpleChoiceNodes = Util.Dom.getElementsByTagName('simpleChoice', interactionNode);
        simpleChoiceNodes.forEach(function (simpleChoiceNode) {
            var identifier = simpleChoiceNode.getAttribute('identifier');
            var html = Util.Xml.innerHTML(simpleChoiceNode);
            ms.createOption(identifier, html);
        });

        // check for shuffle
        var shuffle = interactionNode.getAttribute('shuffle') === 'true';
        if (shuffle) {
            ms.shuffle();
        }

        return ms;

    }

    // TODO: Implement this if QTI goes well. 
    function parseITS() {
        
    }

    var match = CM.QTI.createWidgetMatch('choiceInteraction');

    function Widget_MS(page, item, config) {
        this.dataType = CM.DataType.Array;
        this.options = {
            autoLoad: true
        }
        this.ms = null;
    }

    CM.registerWidget('qti.choice', Widget_MS, match);

    Widget_MS.prototype.load = function() {
        var ms = parseQTI(this.config);
        var renderer = new Renderer(ms);
        renderer.render(this.element);
        this.ms = ms;
    }

    Widget_MS.prototype.getResponse = function () {
        var values = this.ms.selectedKeys;
        var isValid = values.length > 0;
        return this.createResponse(values, isValid);
    }

    Widget_MS.prototype.setResponse = function (values) {
        values.forEach(function(value) {
            this.ms.select(value);
        }.bind(this));
    }

})(window.ContentManager);