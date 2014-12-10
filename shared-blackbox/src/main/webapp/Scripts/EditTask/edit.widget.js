/*
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
        item.getStemElement = function () {
            var compoundEl = page.getCompoundElement();
            if (compoundEl) {
                return compoundEl;
            } else {
                return item.getElement(); // we need stem and response area
            }
        };

    }

    Widget_ET.prototype.load = function () {
         
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
        var editChoiceInstance = ei.choiceInteractions;
        var editing = {
            editText: editTextInstance,
            editChoice: editChoiceInstance
        };

        this._editing = editing;

        // listen for window resize so we can fix lines
        YUE.on(window, 'resize', function () {
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
            }
            else if (isEditTaskChoice(item)) {
                editChoiceInstance.setXmlResponse(item.value);
            }
        }

    }

    Widget_ET.prototype.keyEvent = function(evt) {

        var item = this.entity;
        var editing = this._editing;

        // check if mi
        if (evt.type != 'keydown') return;
        if (evt.ctrlKey || evt.altKey) return; // no modifiers

        // ignore key events if in read-only mode
        if (item.isReadOnly()) return;

        // get the current edit task span
        var componentEl = item.getActiveComponent(evt);

        // if the component is the stem then let's leave
        if (componentEl == null) {
            // Component logic sometimes gives us the wrong component.  Since the dialog
            //box that controls this is modal, we will always assume key elements are for the active
            // db.  If no db is up then we check for that and exit.
            //||  componentEl == item.getStemElement()) {
            return;
        }

        // Notify widget of key event and fetch handler based on component ID
        var edits = isEditTaskText(item) ? editing.editText : editing.editChoice;
        if (edits) {
            edits.handleKeyEvent.call(edits, componentEl, evt);
        }

    }

    // If we zoom,the dialog gets displaced. Undisplace it.
    Widget_ET.prototype.zoom = function () {
        var editing = this._editing;
        if (editing && editing.editText) {
            editing.editText.setDbPosition();
        }
    }

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
    }

    Widget_ET.prototype.isResponseAvailable = function () {
        return this._editing != null;
    }

    Widget_ET.prototype.getResponse = function() {
        var item = this.entity;
        var editing = this._editing;
        var editType = isEditTaskText(item) ? editing.editText : editing.editChoice;
        var value = editType.getXmlResponse();
        var isValid = (value && value.length > 0) ? true : false;
        return this.createResponse(value, isValid);
    }

    Widget_ET.prototype.setResponse = function (value) {
        var item = this.entity;
        var editing = this._editing;
        var editType = isEditTaskText(item) ? editing.editText : editing.editChoice;
        editType.setXmlResponse(value);
    }

})(window.ContentManager);

