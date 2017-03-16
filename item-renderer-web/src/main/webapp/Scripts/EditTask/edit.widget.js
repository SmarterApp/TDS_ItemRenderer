//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
﻿/*
This module is used for loading editText or editChoice interaction items (QTI).
*/

(function(CM) {

    function isEditTaskText(item) {
        return item.isResponseType('EditTask');
    }

    function isEditTaskChoice(item) {
        return item.isResponseType('EditTaskChoice');
    }

    function isEditTask(item) {
        return isEditTaskText(item) || isEditTaskChoice(item);
    }

    function match(page, item, content) {
        var id = 'EditContainer_' + item.position;
        var el = document.getElementById(id);
        if (el) {
            // NOTE: Each edit task dropdown should actually be a widget
            return new CM.WidgetConfig(id, el, item.qti.xml);
        }
        return false;
    }

    function Widget_ET() {
        this._editing = null; // edit task instance
    }

    CM.registerWidget('edittask', Widget_ET, match);

    Widget_ET.prototype.init = function() {

        var page = this.page;
        var item = this.entity;

        // change the stem to be the response container
        item.getStemElement = function() {
            var compoundEl = page.getCompoundElement();
            if (compoundEl) {
                return compoundEl;
            } else {
                return item.getElement(); // we need stem and response area
            }
        };

    };

    Widget_ET.prototype.load = function() {

        var item = this.entity;
        var container = this.element;
        var qtiXml = this.config;

        // Edit item QTI contains regular HTML markup.  The edit objects know what do do with
        // the markup, so just add it to the page.
        var ei = new EditItem.Parse(item.position);
        ei.createFromXml(qtiXml, container);

        YUD.removeClass(container, 'loading');
        YUD.addClass(container, 'edit-container');

        // Per requirements, all edit interactions in an item are either
        // choice or text, not mixed.
        var editTextInstance = ei.textInteractions;
        editTextInstance.isReadOnly = item.isReadOnly.bind(item);
        var editChoiceInstance = ei.choiceInteractions;
        editChoiceInstance.isReadOnly = item.isReadOnly.bind(item);
        var editing = {
            editText: editTextInstance,
            editChoice: editChoiceInstance
        };

        this._editing = editing;

        // listen for window resize so we can fix lines
        YUE.on(window, 'resize', function() {
            if (onresize != null) {
                onresize();
            }
            if (editTextInstance) {
                editTextInstance.setDbPosition();
            }
        });

        editChoiceInstance.showItem();
        editTextInstance.showItem();

        // Add components to keyboard navigation using ctrl-TAB
        var componentArray = editTextInstance.getComponentArray();
        componentArray.push.apply(componentArray, editChoiceInstance.getComponentArray());
        for (var i = 0; i < componentArray.length; ++i) {
            item.addComponent(componentArray[i]);
        }

        // check if there is an existing response
        if (item.value) {
            if (isEditTaskText(item)) {
                editTextInstance.setXmlResponse(item.value);
            } else if (isEditTaskChoice(item)) {
                editChoiceInstance.setXmlResponse(item.value);
            }
        }

    };

  
    // If we zoom,the dialog gets displaced. Undisplace it.
    Widget_ET.prototype.zoom = function() {
        var editing = this._editing;
        if (editing && editing.editText) {
            editing.editText.setDbPosition();
        }
    };

    // Handle the case where an item is being shown again.
    Widget_ET.prototype.hide = function() {
        var activeInstance = EditItem.Html._activeDbInstance;
        if (activeInstance && activeInstance.panelWidget) {
            activeInstance.panelWidget.hide();
            activeInstance.interaction = null;
            if (activeInstance.activeSpan) {
                YUD.removeClass(activeInstance.activeSpan, 'TDS_EDIT_SPAN_HOVER');
                activeInstance.activeSpan = null;
            }
        }
    };

    Widget_ET.prototype.isResponseAvailable = function() {
        return this._editing != null;
    };

    Widget_ET.prototype.getResponse = function() {
        var item = this.entity;
        var editing = this._editing;
        var editType = isEditTaskText(item) ? editing.editText : editing.editChoice;
        var response = editType.getResponse();
        var value = response.responseBody;
        var isValid = response.isValid;
        return this.createResponse(value, isValid);
    };

    Widget_ET.prototype.setResponse = function(value) {
        var item = this.entity;
        var editing = this._editing;
        var editType = isEditTaskText(item) ? editing.editText : editing.editChoice;
        editType.setXmlResponse(value);
    };

})(window.ContentManager);

