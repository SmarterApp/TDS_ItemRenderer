//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
﻿(function(CM) {

    function match(page, item) {
        var id = 'Item_Response_' + item.position;
        var el = document.getElementById(id);
        if (el) {
            return new CM.WidgetConfig(id, el);
        }
        return false;
    }

    function Widget_PT(page, item) {
    }

    CM.registerWidget('plaintext', Widget_PT, match);

    Widget_PT.prototype.load = function () {
        
        // get editor
        var item = this.entity;
        var inputEl = this.element;

        // set aria
        if (item.isReadOnly()) {
            inputEl.disabled = true;
        } else {
            inputEl.setAttribute('aria-required', 'true');
        }

        // add as tabbable
        item.addComponent(inputEl);

    }

    Widget_PT.prototype.focus = function() {
    }

    Widget_PT.prototype.blur = function () {
    }
    
    Widget_PT.prototype.isResponseAvailable = function () {
        return this.element != null;
    }

    Widget_PT.prototype.getResponse = function() {

        var value = this.element.value;
        var isValid = value.length > 0;

        if (value) {
            // escape closing tag for CDATA (bug #15742)
            value = value.replace(/]]>/g, ']]&gt;');
        }

        return this.createResponse(value, isValid);

    }

    Widget_PT.prototype.setResponse = function (value) {
        this.element.value = value;
    }
    
})(window.ContentManager);

