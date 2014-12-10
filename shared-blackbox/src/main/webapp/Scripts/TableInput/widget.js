/*
Widget for table input
*/

(function (CM) {

    // check for table
    function match(page, item, content) {

        // check for response type
        if (!item.isResponseType('TableInput') && !item.isResponseType('TableInputExt')) {
            return false;
        }

        // find table
        var $tables = $('table.tableItem', item.getElement());
        if ($tables.length == 0) {
            throw new Error('Could not find table matching class "tableItem" for TableInput item');
        }
        var tableEl = $tables.get(0);

        // return table and container to move it into
        var id = 'TableContainer_' + item.position;
        var containerEl = document.getElementById(id);
        return new CM.WidgetConfig(id, tableEl, containerEl);
    }

    function Widget_TI(page, item, config) {
        this._tableInput = null;
    }

    CM.registerWidget('tableinput', Widget_TI, match);

    Widget_TI.prototype.load = function () {

        var item = this.entity;
        var tableEl = this.element;
        var containerEl = this.config; // optional

        // move table into response area (if provided)
        if (containerEl) {
            containerEl.appendChild(tableEl);
        }

        // render table inputs
        var useTextArea = item.isResponseType('TableInputExt');
        var ti = new TDS.TableInput(tableEl, useTextArea);
        this._tableInput = ti;
        ti.render();

        // load existing value
        if (item.value) {
            ti.setResponse(item.value);
            ti.validateInputs();
        }

        // get all the input elements and add them as components
        var inputEls = ti.getInputs();
        for (var i = 0; i < inputEls.length; ++i) {
            item.addComponent(inputEls[i]);
        }

        var readOnlyFunc = function (evt) {
            if (item.isReadOnly()) {
                YUE.stopEvent(evt);
            }
        };

        YUE.on(tableEl, 'keypress', readOnlyFunc);
        YUE.on(tableEl, 'mousedown', readOnlyFunc);

    }

    Widget_TI.prototype.getResponse = function () {
        var ti = this._tableInput;
        var value = ti.getResponse();
        var isValid = ti.isResponseValid();
        return this.createResponse(value, isValid);
    }

    Widget_TI.prototype.setResponse = function(value) {
        var ti = this._tableInput;
        ti.setResponse(value);
    }
    
})(window.ContentManager);
