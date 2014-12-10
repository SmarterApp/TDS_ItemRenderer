/*
MC/MS object model.
NOTE: Do not add DOM code here.
*/

TDS = window.TDS || {};

(function(TDS) {

    var MS = TDS.MultipleSelect;
    var Mode = MS.Mode;

    function Option(parent, key, html) {
        Util.Event.Emitter(this);
        this.parent = parent; /* MultipleSelect */
        this.selected = false;
        this.key = key;
        this.html = html;
        this.feedback = null;
        this.soundLink = null;
    }

    // This is a single letter or number value that represents the option.
    Object.defineProperty(Option.prototype, 'value', {
        get: function() {
            var idx = this.parent.options.indexOf(this);
            if (idx != -1) {
                if (this.parent.mode == Mode.Single) {
                    return String.fromCharCode(idx + 65);
                } else {
                    return (idx + 1) + '';
                }
            } else {
                return '';
            }
        }
    });

    Option.prototype.select = function() {

        // check if selected
        if (this.selected) {
            // in multiple selection mode deselect
            if (this.parent.mode == Mode.Multiple) {
                return this.deselect();
            } else {
                // in single selection mode ignore request
                return false;
            }
        }

        // get constraints
        var maxChoices = this.parent.maxChoices;
        var selectedOptions = this.parent.selectedOptions;
        var selectedCount = selectedOptions.length;

        // if only one choice is allowed then deselect existing option a convenience
        if (maxChoices === 1 && selectedCount > 0) {
            selectedOptions[0].deselect();
        } else if (maxChoices > 0 && maxChoices <= selectedCount) {
            return false; // max has been met
        }

        // mark dom element as checked and fire event
        this.selected = true;
        this.onChanged();
        return true;
    }

    Option.prototype.deselect = function() {

        // check if already deselected
        if (!this.selected) {
            return false;
        }

        // mark dom element as checked and fire event
        this.selected = false;
        this.onChanged();
        return true;
    }

    // Call this when the option has changed
    Option.prototype.onChanged = function() {
        if (this.selected) {
            this.fire('selected');
        } else {
            this.fire('deselected');
        }
    }

    /*Object.defineProperty(Option.prototype, 'selected', {
        get: function() {
            return this.inputEl != null && this.inputEl.checked === true;
        }
    });*/

    Option.prototype.toString = function() {
        return this.key;
    }

    MS.Option = Option;

})(window.TDS);