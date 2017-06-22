//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
﻿/**********************/
/* MS OPTION          */
/**********************/

(function() {

    var MSOption = function(options, key) {
        MSOption.superclass.constructor.call(this, options, key);
        this._role = 'checkbox';
    };

    YAHOO.lang.extend(MSOption, ContentMCOption);

    // check if the selection can be made
    MSOption.prototype._validateSelection = function() {

        var maxChoices = this._options.getMaxChoices();
        var selected = this._options.getSelected();
        var selectedCount = selected.length;

        // check if max choices was met
        if (maxChoices == 1 && selectedCount > 0) {
            selected[0].deselect(); // deselect existing option as a convenience
        } else if (maxChoices > 0 && maxChoices <= selectedCount) {
            return false; // max has been met
        }

        // selection is allowed
        return true;
    };

    MSOption.prototype.select = function() {

        var group = this._options;
        var item = group.getItem();
        var page = item.getPage();

        // fire before select event (and cancel if someone returns false)
        var cancelSelect = this.fire('beforeSelect');
        if (cancelSelect === false) {
            return false;
        }

        // toggle checkbox
        var inputEl = this.getInputElement();

        if (inputEl.checked) {
            this.deselect();
        } else {

            // check if we can select this choice
            if (!this._validateSelection()) {
                return false;
            }

            // select checkbox input
            inputEl.checked = true;

            // add selected css
            var optionEl = this.getElement();
            YUD.addClass(optionEl, 'optionSelected');
            optionEl.setAttribute('aria-checked', 'true');

            // show feedback
            var accProps = page.getAccommodationProperties();
            if (accProps != null && accProps.showFeedback()) {
                this.showFeedback();
            }
        }

        // TDS notification
        this.fire('select');

        return true;
    };

    // exports
    window.ContentMSOption = MSOption;

})();