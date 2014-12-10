/**********************/
/* MS OPTION GROUP */
/**********************/

(function() {

    function MS(item) {
        MS.superclass.constructor.call(this, item);
        this._role = 'group';
        this._minChoices = 0;
        this._maxChoices = 0;
    }

    // inherit from MC
    YAHOO.lang.extend(MS, ContentMCGroup);

    MS.prototype.setMinChoices = function(num) {
        this._minChoices = num;
    };

    MS.prototype.getMinChoices = function() {
        return this._minChoices;
    };

    MS.prototype.setMaxChoices = function(num) {
        this._maxChoices = num;
    };

    MS.prototype.getMaxChoices = function() {
        return this._maxChoices;
    };

    // get the selected option, will return null if nothing is selected
    MS.prototype.getSelected = function() {
        var selectedOptions = [];

        for (var i = 0; i < this._options.length; i++) {
            if (this._options[i].isSelected()) {
                selectedOptions.push(this._options[i]);
            }
        }

        return selectedOptions;
    };

    // remove all selections
    MS.prototype.clear = function() {
        var selected = this.getSelected();
        for (var i = 0; i < selected.length; i++) {
            selected[i].deselect();
        }
    };

    // get the selected options value, will return null if nothing is selected
    MS.prototype.getValue = function() {
        var options = this.getSelected();
        return options.join(',');
    };

    // set the value of the option group which will select the option
    MS.prototype.setValue = function(value) {

        this.clear();

        if (value == null) {
            return false;
        }

        var optionKeys = value.split(',');

        for (var i = 0; i < optionKeys.length; i++) {
            var optionKey = optionKeys[i];
            var option = this.getOption(optionKey);
            if (option != null) {
                option.select();
            }
        }

        return true;
    };

    // exports
    window.ContentMSGroup = MS;

})();