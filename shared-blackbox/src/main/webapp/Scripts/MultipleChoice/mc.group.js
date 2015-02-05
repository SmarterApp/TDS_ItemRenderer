/**********************/
/* MC OPTION GROUP    */
/**********************/

(function() {

    // Collection of MC options
    function MC(item) {
        this._item = item;
        this._options = [];
        this._optionHash = {};
        this._role = 'radiogroup';
        // if this is true we try and call tdsUpdateItemResponse()
        this.autoRespond = false;
    }

    // get item that belongs to these options
    MC.prototype.getItem = function() {
        return this._item;
    };

    // add new option
    MC.prototype.addOption = function(option) {
        // store option
        this._options.push(option);
        this._optionHash[option.key] = option;
    };

    // get all options
    MC.prototype.getOptions = function() {
        return this._options;
    };

    // get option by key or order number
    MC.prototype.getOption = function(optionKey) {
        var option = null;
        if (typeof optionKey == 'string') {
            optionKey = optionKey.toUpperCase();
            option = this._optionHash[optionKey] || null;
        } else if (typeof optionKey == 'number') {
            option = this._options[optionKey - 1] || null; // e.x., 1 = 'A', 2 = 'B'
        }
        return option;
    };

    // get the selected option, will return null if nothing is selected
    MC.prototype.getSelected = function() {
        for (var i = 0; i < this._options.length; i++) {
            if (this._options[i].isSelected()) {
                return this._options[i];
            }
        }
        return null;
    };

    // remove all selections
    MC.prototype.clear = function() {
        var selected = this.getSelected();
        if (selected != null) {
            selected.deselect();
        }
    };

    // get the selected options value, will return null if nothing is selected
    MC.prototype.getValue = function() {
        var option = this.getSelected();
        return (option) ? option.key : null;
    };

    // set the value of the option group which will select the option
    MC.prototype.setValue = function(optionKey) {
        var option = this.getOption(optionKey);
        if (!option) {
            return false;
        } // no option with this key

        option.select();
        return true;
    };

    // get the focused option
    MC.prototype.getFocusedOption = function() {
        var focusedComponent = this.getItem().getActiveComponent();

        for (var i = 0; i < this._options.length; i++) {
            var option = this._options[i];
            if (option.getElement() == focusedComponent) {
                return option;
            }
        }

        return null;
    };

    // move next or back
    MC.prototype.navigate = function(dir) {
        // check if mc option is focused
        var focusedOption = this.getFocusedOption();
        if (!focusedOption) {
            return null;
        }
        // move to the next/prev option
        var iter = new Util.Iterator(this.getOptions());
        iter.jumpTo(focusedOption);
        var option;
        if (dir == 'prev') {
            option = iter.prev();
        } else {
            option = iter.next();
        }
        if (option) {
            this.getItem().setActiveComponent(option.getElement());
        }
        return option;
    };

    // render options into a container element
    MC.prototype.render = function (el) {
        if (el) {
            el.setAttribute('role', this._role);
            el.setAttribute('aria-required', 'true');
        }
        this.getOptions().forEach(function (option) {
            option.render();
        });
    };

    // exports
    window.ContentMCGroup = MC;
})();