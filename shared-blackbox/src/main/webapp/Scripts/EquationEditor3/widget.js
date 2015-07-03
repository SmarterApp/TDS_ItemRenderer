//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
﻿/*
Widget for desmos equation editor.
*/

(function (CM) {

    ///////////////////////////////////
    function match_ITS(page, item) {
        var id = 'EquationEditor_' + item.position;
        var el = document.getElementById(id);
        if (el && !page.getAccProps().hasBraille()) {   // Braille tests get a plain text response area
            return new CM.WidgetConfig(id, el, item.rendererSpec);
        }
        return false;
    }

    function Widget_EQ(wdgId, element, config) {
        this.eq = null; // equation editor instance
    } 

    // register old ITS interaction
    CM.registerWidget('equationeditor', Widget_EQ, match_ITS);

    // register QTI custom interaction
    var match_QTI = CM.QTI.createWidgetMatch('customInteraction', 'eq');
    CM.registerWidget('qti.eq', Widget_EQ, match_QTI);

    Widget_EQ.prototype.load = function () {
        var page = this.page,
            item = this.entity,
            containerEl = this.element,
            renderXml = this.config;

        if (typeof renderXml !== "string")
            renderXml = Util.Xml.serializeToString(renderXml);

        // check: renderxml format if v2 then process into desmos format
        if (!(renderXml && renderXml.indexOf('<editorRow>') != -1)) {
            renderXml = MathEditorContent.Config.EquationAdapter.convertToDesmosXml(renderXml);
        }

        // convert render xmlstring into preview doc i.e mathml to latex
        var renderDoc = MathEditorContent.Config.PreviewFormatter.getPreviewXmlDoc(renderXml);

        var oldClasses = containerEl.getAttribute('class');
        containerEl.setAttribute('class', oldClasses + ' no-highlight lr-skip');

        // create desmos instance
        var debug = false; //TURN OFF in Production

        // this.eq must be assigned before we call item.setResponse
        var eq = this.eq = MathEditorWidget(containerEl, renderDoc, debug ? function (msg) { /*eventcallback for widget*/ /*console.log(msg);*/ } : function (msg) { });

        // try to set response if there is a value (in case we are doing a review or page refresh)
        if (item.value != null) {
            item.setResponse(item.value);
        }

        // create and add EQ component
        var eqComponent = {
            id: 'EQ_' + item.position,
            focus: function () { eq.focus(); },
            blur: function () { eq.unfocus(); }
        };

        item.addComponent(eqComponent);

        // check when EQ component is active        
        YUE.on(containerEl, 'click', function () {
            item.setActiveComponent(eqComponent);
        });

        //set eq mode to readonly
        if (item.isReadOnly()) {
            eq.setMode('readOnly');
        }
    };

    Widget_EQ.prototype.getResponse = function() {
        var eq = this.eq;
        try {            
            var val = eq.getResponse();
            val = Util.Xml.serializeToString(val);
            var isValid = eq.isValid();
            return this.createResponse(val, isValid);
        } catch (e) {
            console.error("Failed to get a response for the EQ item.", eq, e);
        }
        return null;
    };

    Widget_EQ.prototype.setResponse = function(value) {

        try { //Needs to handle multiple saved editors better, damn xml
            if (value) {
                var eq = this.eq;
                var response = $.parseXML(value);
                eq.setResponse(response);
            }
        } catch (e) {
            console.error("Faield to update the mathML with this value.", value, e);
        }
    };
    ///////////////////////////////////

    function match_EQA(page, item) {
        var id = 'EquationEditor_' + item.position;
        var el = document.getElementById(id);
        if (el && page.getAccProps().hasBraille()) {
            return new CM.WidgetConfig(id, el);
        }
        return false;
    }

    function Widget_EQA(page, item, config) {
        this.textAreaEl = null; // textarea
    }

    CM.registerWidget('equationeditor.text', Widget_EQA, match_EQA);

    Widget_EQA.prototype.load = function() {
        var item = this.entity;
        var textAreaEl = HTML.TEXTAREA();
        textAreaEl.disabled = item.isReadOnly();
        this.textAreaEl = textAreaEl;
        var containerEl = this.element;
        containerEl.appendChild(textAreaEl);
        if (item.value != null) {
            item.setResponse(item.value);
        }
    };

    Widget_EQA.prototype.getResponse = function() {
        var text = this.textAreaEl.value;
        var xmlDoc = Util.Xml.parseFromString('<response type="plaintext"></response>');
        var textNode = xmlDoc.createTextNode(text);
        xmlDoc.documentElement.appendChild(textNode);
        var value = Util.Xml.serializeToString(xmlDoc);
        var isValid = text.length > 0;
        return this.createResponse(value, isValid);
    };

    Widget_EQA.prototype.setResponse = function(value) {

        // HACK: Fix legacy responses (e.x., "<response type="plaintext"><![CDATA[51]]&gt;</response>")
        value = value.replace('<![CDATA[', '');
        value = value.replace(']]&gt;', '');
        value = value.replace(']]>', '');

        // parse text node from xml
        var text = '';
        var xmlDoc = Util.Xml.parseFromString(value);
        if (xmlDoc && xmlDoc.documentElement && xmlDoc.documentElement.childNodes[0]) {
            text = Util.Xml.getNodeText(xmlDoc.documentElement.childNodes[0]);
        }

        this.textAreaEl.value = text;
    };


})(window.ContentManager);
