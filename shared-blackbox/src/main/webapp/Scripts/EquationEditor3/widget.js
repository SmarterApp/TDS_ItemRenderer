/*
Widget for desmos equation editor.
*/

(function (CM) {

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

        var content = item.rendererSpec;
        //old tool rendererspec to new tool renderer spec
        if (!(item.rendererSpec && item.rendererSpec.indexOf('<editorRow>') != -1)) {
            content = MathEditorContent.Config.EquationAdapter.convertToDesmosXml(item.rendererSpec);            
        }

        // create equation editor
        var data = MathEditorContent.Config.PreviewFormatter.getPreviewXmlDoc(content);
        var containerDom = document.getElementById('EquationEditor_' + item.position);
        var oldClasses = containerDom.getAttribute('class');
        containerDom.setAttribute('class', oldClasses + ' no-highlight');
        var debug = false; //TURN OFF in Production
        var eq = MathEditorWidget(containerDom, data, debug ? function (msg) { /*eventcallback for widget*/ /*console.log(msg);*/ } : function (msg) { });
        this.eq = eq;

        // try to set response if there is a value (in case we are doing a review or page refresh)
        if (item.value != null) {
            item.setResponse(item.value);
        }

        // create and add EQ component
        var eqComponent = {
            id: 'EQ_' + item.position,
            focus: function() { eq.focus(); },
            blur: function() { eq.unfocus(); }
        };

        item.addComponent(eqComponent);

        // check when EQ component is active        
        var eqContainer = containerDom;

        YUE.on(eqContainer, 'click', function () {
            item.setActiveComponent(eqComponent);
        });

        //set eq mode to readonly
        if (item.isReadOnly()) {
            eq.setMode('readOnly');
        }


    };

    /**
    * Zooming.   Blackbox zoom levels do really scary things with text font sizes.  MathJax
    * has to position things via absolutes, and the interaction between our scary css em
    * zoom and the absolute positions can really mess up the html.   
    *
    * This sets the MathJax internal scaling = Page scaling of fonts which will then ensure
    * the cursor actually ends up in the right places when zooming in.
    */
    /*
    Widget_EQ.prototype.zoom = function(level) {

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
    };
    */

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
        if (el && CM.isAccessibilityEnabled()) {
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
