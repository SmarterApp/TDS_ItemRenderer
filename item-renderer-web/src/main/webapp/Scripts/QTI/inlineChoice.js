//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
/*
Widget for the QTI textEntryInteraction
*/

(function(CM) {

    var match = CM.QTI.createWidgetMatch('inlineChoiceInteraction');

    function Widget_IC(page, item, config) {
        this.options = {
            autoLoad: true
        }
        this.selectEl = null;
    }

    CM.registerWidget('qti.inlinechoice', Widget_IC, match);

    Widget_IC.prototype.load = function () {

        var containerEl = this.element; // dom element
        var interactionNode = this.config; // qti element

        var selectEl = document.createElement('select');
        this.selectEl = selectEl;

        $('inlineChoice', interactionNode).each(function(idx, icNode) {
            var id = icNode.getAttribute('identifier');
            var text = Util.Xml.getNodeText(icNode); // spec says only text (http://www.imsglobal.org/question/qtiv2p1/imsqti_infov2p1.html#element10258)
            var optionEl = new Option(text, id);
            selectEl.options[idx] = optionEl;
        });

        containerEl.appendChild(selectEl);
    }

    Widget_IC.prototype.getComponents = function () {
        return [this.selectEl];
    }

    Widget_IC.prototype.getResponse = function() {
        var value = this.selectEl.value;
        var isValid = this.selectEl.selectedIndex > 0;
        return this.createResponse(value, isValid);
    }

    Widget_IC.prototype.setResponse = function (value) {
        this.selectEl.value = value;
    }

})(window.ContentManager);