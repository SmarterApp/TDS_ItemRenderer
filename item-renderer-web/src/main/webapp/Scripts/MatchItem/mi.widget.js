//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
﻿(function(CM, MatchItem) {

    if (!MatchItem) {
        return;
    }

    function create(item, containerEl) {

        // Create the parser.  
        var parseResult = new MatchItem.Parse(item.itemKey);

        // Parse the xml file.  It can come from renderer field or qti field.
        var qtiXml = (item.qti) ? item.qti.xml : item.rendererSpec;
        if (qtiXml == null) {
            return null;
        }

        // parse the qti xml
        parseResult.createFromXml(qtiXml);

        // Use the parsed XML to construct a table. Create table form or 
        // list form as accommodations require.
        var presentation;
        if (item.isResponseType('TableMatch') || CM.isAccessibilityEnabled()) {
            presentation = new MatchItem.TableHtmlGenerator(item.position);
        } else {
            presentation = new MatchItem.ListHtmlGenerator(item.position);
        }

        var discriminator = item.position;
        var m1 = new MatchItem.Matrix(parseResult, presentation, discriminator);

        // set read-only
        m1.isReadOnly = item.isReadOnly.bind(item);

        // Get list of tabbable components from widget and add to item 
        var componentArray = m1.getComponentArray();
        for (var i = 0; i < componentArray.length; ++i) {
            item.addComponent(componentArray[i]);
        }

        // Look for the parent div
        containerEl.innerHTML = '';

        // Get rid of the spinner.
        YUD.removeClass(containerEl, 'loading');

        // Render the content
        m1.attachTable(containerEl);

        var onresize = window.onresize;

        YUE.on(window, 'scroll', function() {
            if (onresize != null) {
                onresize();
            }
            if (item.isVisible()) {
                m1.reDrawChecks();
            }
        });

        // Restore old values.
        if (item.value) {
            m1.setResultXML(item.value);
        }

        return m1;

    }

    function match(page, item) {
        var id = 'MatchContainer_' + item.position;
        var el = document.getElementById(id);
        if (el) {
            return new CM.WidgetConfig(id, el);
        }
        return false;
    }

    function Widget_MI(page, item) {
        this.matchItem = null;
    }

    CM.registerWidget('matchitem', Widget_MI, match);

    Widget_MI.prototype.load = function() {
        this.matchItem = create(this.entity, this.element);
    };

    Widget_MI.prototype.keyEvent = function(evt) {

        if (evt.type != 'keydown') {
            return;
        }
        if (evt.ctrlKey || evt.altKey) {
            return;
        } // no modifiers

        var item = this.entity;
        var matches = this.matchItem;

        if (evt.key == 'Enter') {

            // ignore key events if in read-only mode
            if (item.isReadOnly()) {
                return;
            }

            evt.stopPropagation();

            // Notify widget of key event and fetch handler based on component ID
            var matchId = item.getActiveComponent().id;
            if (matchId) {
                matches.handleKeyEvent(matchId, evt);
            }
        }

    };

    Widget_MI.prototype.zoom = function(level) {
        this.matchItem.reDrawChecks();
    };

    Widget_MI.prototype.show = function() {
        this.matchItem.reDrawChecks();
    };

    Widget_MI.prototype.getResponse = function() {
        var value = this.matchItem.getResponseXML();
        var isValid = this.matchItem.isResponseValid();
        return this.createResponse(value, isValid);
    };

    Widget_MI.prototype.setResponse = function(value) {
        this.matchItem.setResultXML(value);
    };

})(window.ContentManager, window.MatchItem);