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

    var match = CM.QTI.createWidgetMatch('textEntryInteraction');

    function Widget_TE(page, item, config) {
        this.options = {
            autoLoad: true
        }
        this.inputEl = null;
    }

    CM.registerWidget('qti.textentry', Widget_TE, match);

    Widget_TE.prototype.load = function() {
        var teEl = this.element; // dom element
        var teNode = this.config; // qti element
        var teInput = document.createElement('input');
        teInput.type = 'text';
        teInput.className = 'textEntry';
        teEl.appendChild(teInput);
        var expectedLength = teNode.getAttribute('expectedLength') * 1;
        if (expectedLength > 0) {
            teInput.setAttribute('size', expectedLength);
            teInput.setAttribute('maxlength', expectedLength);
        }
        this.inputEl = teInput;
    }

    Widget_TE.prototype.getComponents = function () {
        return [this.inputEl];
    }

    Widget_TE.prototype.getResponse = function() {
        var value = this.inputEl.value;
        var isValid = YAHOO.lang.trim(value).length > 0;
        return this.createResponse(value, isValid);
    }

    Widget_TE.prototype.setResponse = function (value) {
        this.inputEl.value = value;
    }

})(window.ContentManager);