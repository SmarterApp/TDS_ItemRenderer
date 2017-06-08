//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
﻿/*
Widget for equation editor.
*/

(function (CM, MathJax) {

    function getMathMLArr(xmlStr) {
        var mathML = xmlStr.match(/<mathML>([\w\W]*)<\/mathML>/m);
        if (mathML) {
            mathML = mathML[1];
        } else {
            return [];
        }
        //Deals with XML screwing up an array
        mathML = mathML.replace(/<mathML>/gm, '');
        mathML = mathML.replace(/<\/mathML>/gm, '');

        return mathToArr(mathML);
    };

    function mathToArr(mathML) {
        var fin = [];
        mathML = mathML.trim().split('</math>');
        for (var m in mathML) {
            if (mathML[m]) {
                fin.push(mathML[m] + '</math>');
            }
        }
        return fin;
    };

    function parseBooleans(content) {
        if (!content) return {};
        for (var c in content) {
            if (content[c] === 'true') content[c] = true;
            if (content[c] === 'false') content[c] = false;
        }
        return content;
    };

    function parseXmlToJson(item) {
        var content = {};
        try {
            var xmlStr = decodeURIComponent(item.rendererSpec);
            if (xmlStr) {
                content = JSON.parse(xml2jsonv2(parseXml(xmlStr), '')); //JSON.parse(xml2jsonv2(parseXml(xmlStr), ''));
                content = content.editorconfig;
                content.mathML = getMathMLArr(xmlStr);
                content = parseBooleans(content);
            }
        } catch (e) {
            console.error('Failed to parse the Eq rendererSpec', item.rendererSpec, e);
        }
        content.containerId = 'EquationEditor_' + item.position;
        content.id = null;
        return content;
    };

    ///////////////////////////////////

    function match(page, item) {
        var id = 'EquationEditor_' + item.position;
        var el = document.getElementById(id);
        if (el && !CM.isAccessibilityEnabled()) {
            return new CM.WidgetConfig(id, el);
        }
        return false;
    }

    function Widget_EQ(page, item, config) {
        this.eq = null; // equation editor instance
    }

    CM.registerWidget('equationeditor', Widget_EQ, match);

    Widget_EQ.prototype.load = function() {

        var item = this.entity;

        //Initial page settings for the mathjax lib, changes will be made on zoom
        MathJax.Editor.Config.DEBUG = false;
        MathJax.Hub.Config({
            showMathMenu: false,
            "HTML-CSS": {
                availableFonts: ["TeX"],
                imageFont: null, //work with webfonts only
                scale: MathJax.Editor.Config.Scale || 150
            }
        });

        var content = parseXmlToJson(item);
        if (typeof content.RestrictKeysToContent == 'undefined') {
            content.RestrictKeysToContent = true; //Always on for the content editors unless SPECIFIED
            content.TeXEntryMode = 'Allow';
        }
        content.navigation = true;

        // create equation editor
        var eq = new MathJax.Editor.Widget(content);
        this.eq = eq;
        eq.addCls(content.containerId, 'no-highlight');

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
        var eqContainer = eq.getContainerDom();

        YUE.on(eqContainer, 'click', function () {
            item.setActiveComponent(eqComponent);
        });

    }

    /**
    * Zooming.   Blackbox zoom levels do really scary things with text font sizes.  MathJax
    * has to position things via absolutes, and the interaction between our scary css em
    * zoom and the absolute positions can really mess up the html.   
    *
    * This sets the MathJax internal scaling = Page scaling of fonts which will then ensure
    * the cursor actually ends up in the right places when zooming in.
    */
    Widget_EQ.prototype.zoom = function (level) {

        if (isNaN(level)) return;

        var eq = this.eq;

        var scale = { 0: 0.8, 1: 1.2, 2: 1.4, 3: 1.5, 4: 1.5 };
        MathJax.Hub.Config({
            showMathMenu: false,
            "HTML-CSS": {
                scale: 150 * scale[level] //Render the bounding boxes correctly
            }
        });

        eq.CFG.fontTest();

        var eds = eq.getEditors();
        for (var i = 0; i < eds.length; ++i) {
            eds[i] && eds[i].Update && eds[i].Update();
        }

        eq.unfocus();
    }

    Widget_EQ.prototype.getResponse = function () {
        var eq = this.eq;
        var ed = eq.getEdit();
        if (ed) { //If the user is typing then we want to enter their math
            ed.insertPending();
        }
        var mArr = eq.toMathML();
        var value = '<response>' + mArr.join('') + '</response>';
        var isValid = !eq.isEmpty(); // Non-empty response is always valid for now.
        return this.createResponse(value, isValid);
    }

    Widget_EQ.prototype.setResponse = function (value) {
        value = value.replace(/<response>/gm, '');
        value = value.replace(/<\/response>/gm, '');
        value = mathToArr(value);
        var eq = this.eq;
        var cb = eq.updateEditors.bind(eq, value);
        MathJax.Hub.Queue(cb);
    }

    ///////////////////////////////////

    function match_EQA(page, item) {
        var id = 'EquationEditor_' + item.position;
        var el = document.getElementById(id);
        if (el && CM.isAccessibilityEnabled()) {
            return new CM.WidgetConfig(id, el);
        }
        return false;
    }

    function Widget_EQA(page, item, config) {
        this.textAreaEl = null; // textarea
    }

    CM.registerWidget('equationeditor.text', Widget_EQA, match_EQA);

    Widget_EQA.prototype.load = function () {
        var item = this.entity;
        var textAreaEl = HTML.TEXTAREA();
        this.textAreaEl = textAreaEl;
        var containerEl = this.element;
        containerEl.appendChild(textAreaEl);
        if (item.value != null) {
            item.setResponse(item.value);
        }
    }

    Widget_EQA.prototype.getResponse = function() {
        var text = this.textAreaEl.value;
        var xmlDoc = Util.Xml.parseFromString('<response type="plaintext"></response>');
        var textNode = xmlDoc.createTextNode(text);
        xmlDoc.documentElement.appendChild(textNode);
        var value = Util.Xml.serializeToString(xmlDoc);
        var isValid = text.length > 0;
        return this.createResponse(value, isValid);
    }

    Widget_EQA.prototype.setResponse = function (value) {

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
    }

    ///////////////////////////////////

    // Perform MathJax typesetting if needed on newly loaded pages
    // FB-89368 CRS item content uses MathML formatting on non-EquationEditor items, 
    // so typesetting needs to occur once the page is loaded
    CM.onPageEvent('loaded', function (page) {

        var pageEl = page.getElement();

        // Does browser support MathML tags natively?
        var unsupportedBrowser =
            Util.Browser.isChrome() ||
            Util.Browser.isIE();

        // Does the page contain MathML tags?
        var containsMathML = pageEl.getElementsByTagName("math").length > 0;

        // Determine if we need to use MathJax to typeset the page
        var typesetConditional =
            pageEl &&
            unsupportedBrowser &&
            containsMathML;

        if (typesetConditional) {
            MathJax.Hub.Queue(['Typeset', MathJax.Hub, pageEl.id]);
        }
    });
    

})(window.ContentManager, window.MathJax);
