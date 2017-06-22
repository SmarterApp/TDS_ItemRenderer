//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
﻿/**********************/
/* MC OPTION          */
/**********************/

(function(CM) {

    // Single MC option
    function MCOption(options, key) {
        Util.Event.Emitter(this);
        this._options = options;
        this._role = 'radio';
        this.key = key;
        this.audioLink = null;
        this.tts = null;
        this.feedback = null; // LPN feedback html
    }

    // get the container div around the option
    MCOption.prototype.getElement = function() {
        var item = this._options.getItem();
        return document.getElementById('Item_OptionContainer_Response_MC_' + item.position + '_' + this.key);
    };

    // get form radio button element
    MCOption.prototype.getInputElement = function() {
        var item = this._options.getItem();
        var inputName = 'Item_Response_MC_' + item.position + '_' + this.key;
        return document.getElementById(inputName);
    };

    // get sound anchor tag element
    MCOption.prototype.getSoundLink = function() {
        var item = this._options.getItem();
        var soundEl = document.getElementById('Item_OptionSound_Response_MC_' + item.position + '_' + this.key);
        if (soundEl) {
            return soundEl.getElementsByTagName('a')[0];
        }
        return null;
    };

    // get the content element
    MCOption.prototype.getContentElement = function() {
        var optionElement = this.getElement();
        return Util.Dom.getElementByClassName('optionContent', 'div', optionElement);
    };

    // get the feedback element
    MCOption.prototype.getFeedbackElement = function() {
        var optionElement = this.getElement();
        return Util.Dom.getElementByClassName('optionFeedback', 'div', optionElement);
    };

    // show feedback for this option
    MCOption.prototype.showFeedback = function() {
        var feedbackElement = this.getFeedbackElement();
        if (feedbackElement != null) {
            YUD.addClass(feedbackElement, 'showing');
        }
    };

    // hide feedback for this option
    MCOption.prototype.hideFeedback = function() {
        var feedbackElement = this.getFeedbackElement();
        if (feedbackElement != null) {
            YUD.removeClass(feedbackElement, 'showing');
        }
    };

    MCOption.prototype.createFeedback = function() {

        var group = this._options;
        var item = group.getItem();
        var page = item.getPage();
        var accProps = page.getAccProps();

        // check if feedback is enabled before adding it
        if (accProps && accProps.showFeedback()) {

            var feedbackEl = document.createElement('div');
            YUD.addClass(feedbackEl, 'optionFeedback');
            feedbackEl.innerHTML = this.feedback;

            // add feedback into DOM
            var optionEl = this.getElement();
            optionEl.appendChild(feedbackEl);

            // check if we should show the feedback right now
            if (this.isSelected()) {
                this.showFeedback();
            } else {
                this.hideFeedback();
            }
        }

    };

    MCOption.prototype.select = function (force) {

        var group = this._options;
        var item = group.getItem();
        var page = item.getPage();
        
        // get the current selected MC option
        var currentSelection = group.getSelected();

        // if this is already selected then rturn
        if (currentSelection == this && force !== true) {
            return false;
        }

        // fire before select event (and cancel if someone returns false)
        var cancelSelect = this.fire('beforeSelect');
        if (cancelSelect === false) {
            return false;
        }

        // clear current selection css
        if (force) {
            var options = group.getOptions();
            Util.Array.each(options, function(option) {
                option.deselect();
            });
        } else if (currentSelection) {
            currentSelection.deselect();
        }

        // mark radio button as checked (this also removes the current selection)
        var inputEl = this.getInputElement();
        if (!inputEl.checked) {
            inputEl.checked = true;
        }

        // add selected css
        var optionEl = this.getElement();
        YUD.addClass(optionEl, 'optionSelected');
        optionEl.setAttribute('aria-checked', 'true');

        // show feedback
        var accProps = page.getAccProps();
        if (accProps && accProps.showFeedback()) {
            this.showFeedback();
        }

        // fire event
        this.fire('select');

        // TDS notification
        if (group.autoRespond && typeof window.tdsUpdateItemResponse == 'function') {
            window.tdsUpdateItemResponse(item.position, this.key);
        }

        return true;
    };

    MCOption.prototype.deselect = function () {

        var group = this._options;
        var optionEl = this.getElement();
        var inputEl = this.getInputElement();

        // remove class
        YUD.removeClass(optionEl, 'optionSelected');
        optionEl.setAttribute('aria-checked', 'false');

        // remove selection
        inputEl.checked = false;

        // hide feedback
        this.hideFeedback();

        // TDS notification
        this.fire('deselect');
    };

    // is this option selected
    MCOption.prototype.isSelected = function() {
        var inputEl = this.getInputElement();
        return (inputEl && inputEl.checked === true);
    };

    MCOption.prototype.hasStrikethrough = function() {
        var element = this.getElement();
        return (element && YUD.hasClass(element, 'strikethrough'));
    };

    MCOption.prototype.toggleStrikethrough = function() {
        var element = this.getElement();
        if (element) {
            YUD.toggleClass(element, 'strikethrough');
        }
    };

    MCOption.prototype.render = function () {

        var group = this._options;
        var item = group.getItem();

        var optionEl = this.getElement();
        optionEl.setAttribute('role', this._role);
        optionEl.setAttribute('aria-checked', this.isSelected());
        optionEl.setAttribute('aria-label', 'Option ' + this.key);

        // set label
        var contentEl = this.getContentElement();
        var contentId = contentEl.getAttribute('id');
        if (!contentId) {
            contentId = 'Item_OptionContent_Response_MC_' + item.position + '_' + this.key;
            contentEl.setAttribute('id', contentId);
        }
        optionEl.setAttribute('aria-labelledby', contentId);

        // HACK: this fixes JAWS so when tabbing it treats this like a radio button
        var clickerEl = Util.Dom.getElementByClassName('optionClicker', 'span', optionEl);
        if (clickerEl) {
            clickerEl.setAttribute('style', 'text-indent:-9999px;overflow:hidden;');
            clickerEl.innerHTML = '&nbsp';
        }

        // add feedback
        if (this.feedback) {
            this.createFeedback();
        }

        // add click event to option container
        YUE.on(optionEl, 'click', function (evt) {
            if (!item.isReadOnly()) {
                this.select();
            }
        }, this, true);

        // listen for spece bar
        new YAHOO.util.KeyListener(optionEl, {
            keys: [32]
        }, {
            fn: function(evt) {
                if (!item.isReadOnly()) {
                    this.select();
                }
            },
            scope: this,
            correctScope: true
        }).enable();

        // if streamlined mode then enable up/down
        if (CM.isAccessibilityEnabled()) {

            function navigateWrapper(dir, type, args) {
                // move next option
                var option = group.navigate(dir);
                // prevent scrolling
                if (option && args && args.length) {
                    YUE.stopEvent(args[1]);
                }
            }

            // listen for up arrow
            new YAHOO.util.KeyListener(optionEl, {
                keys: [38]
            }, {
                fn: navigateWrapper.bind(null, 'prev')
            }).enable();

            // listen for down arrow
            new YAHOO.util.KeyListener(optionEl, {
                keys: [40]
            }, {
                fn: navigateWrapper.bind(null, 'next')
            }).enable();

        }

    };
    
    MCOption.prototype.toString = function() {
        return this.key;
    };

    // exports
    window.ContentMCOption = MCOption;

})(window.ContentManager);