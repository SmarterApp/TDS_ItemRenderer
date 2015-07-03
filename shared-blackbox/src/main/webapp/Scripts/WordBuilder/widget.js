//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
/*
Widget for WordBuilder
*/

(function(CM) {

    // get the keyboard input element
    function getInputEl(item) {
        var itemEl = item.getElement();
        return $('input[name=textbox1_item_' + item.itemKey + ']', itemEl).get(0);
    }

    function match(page, item, content) {
        if (item.isResponseType('keyboard custom') ||
            item.isResponseType('keyboard alphabetical')) {
            var id = 'keyboard_' + item.position;
            var el = getInputEl(item);
            if (el) {
                return new CM.WidgetConfig(id, el);
            }
        }
        return false;
    }

    function Widget_WB(page, item) {
    }

    CM.registerWidget('wordbuilder', Widget_WB, match);

    Widget_WB.prototype.load = function () {

        // make sure keyboard item
        var item = this.entity;
        var inputEl = this.element;
        var keyboardEl = document.getElementById('keyboard_' + item.position);

        // make sure input exist
        if (keyboardEl == null || inputEl == null) return;

        // create keyboard widget
        var wb = new WordBuilder(keyboardEl, inputEl);
        wb.activate();

        // check for read-only
        CM.setReadOnlyKeyEvent(item, inputEl);

        // set response
        if (item.value != null) {
            inputEl.value = item.value;
        }

        // set aria tags
        var ariaTag = inputEl.getAttribute('data-desc');
        if (ariaTag) {
            inputEl.removeAttribute('data-desc');
            inputEl.setAttribute('aria-label', ariaTag);
        }
        keyboardEl.setAttribute('aria-hidden', true);
        keyboardEl.setAttribute('role', 'presentation');
        
        // Set tabIndex to -1 on all keyboard anchor tags if in streamlined mode
        var accProps = Accommodations.Manager.getCurrentProps();
        if (accProps.isStreamlinedMode()) {
            $('.keydisplay').children('a').attr('tabIndex', '-1');
        }

    }

    Widget_WB.prototype.focus = function() {
        CM.focus(this.element);
    }

    Widget_WB.prototype.isResponseAvailable = function () {
        return getInputEl(this.entity) != null;
    }

    Widget_WB.prototype.getResponse = function() {
        var value = this.element.value;
        var isValid = (value.length > 0) ? true : false;
        return this.createResponse(value, isValid);
    }

    Widget_WB.prototype.setResponse = function(value) {
        this.element.value = value;
    }

})(window.ContentManager);


