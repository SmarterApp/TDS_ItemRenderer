//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
/*
This file contains the TableInput widget.
*/

TDS = window.TDS || {};

(function (TDS) {

    /*
    Attributes:
    - data-its-validationRule = alphaOnly, numericOnly, alphaNumericOnly, textOnly
    - data-its-input = 'true' is input box
    - data-its-includedInResponse = 'true' means the <span> text is included in the response 
    */

    var TI = function (el, useTextArea) {
        this._tableEl = el; // main table element
        this._useTextArea = useTextArea || false;
        this._columnIds = []; // header id's
        this._inputValidators = []; // functions for validating inputs
    };

    TI.CSS_INPUT = 'ti-input'; // <input> or <textarea>
    TI.CSS_EDITABLE = 'ti-editable'; // <tr>/<td> that has an input
    TI.CSS_ACTIVE = 'ti-active'; // <tr>/<td> that has focused input
    TI.CSS_INVALID = 'ti-invalid'; // <tr>/<td> that has an invalid input

    var globalValidator;

    TI.setValidator = function(fn) {
        globalValidator = fn;
    };

    // get all the column ids
    TI.prototype.getColumnIds = function () {
        return this._columnIds;
    };

    // return the table element
    TI.prototype.getElement = function() {
        return this._tableEl;
    };

    // get all the input elements
    TI.prototype.getInputs = function () {
        var tableEl = this.getElement();
        return $('.' + TI.CSS_INPUT, tableEl);
    };

    TI.prototype.validateInputs = function() {
        this._inputValidators.forEach(function(inputValidator) {
            inputValidator();
        });
    };

    // change a tagged column into an input
    TI.prototype._processTag = function (idx, tagEl) {

        var $tag = $(tagEl);

        // get tag data
        var validationRule = $tag.data('itsValidationrule');
        var includedInResponse = ($tag.data('itsIncludedinresponse') === true);

        // create element
        var tagName = this._useTextArea ? 'textarea' : 'input';
        var $input = $(document.createElement(tagName));

        // set attributes
        $input.attr('type', 'text')
              .attr('autocomplete', 'off')
              .attr('autocorrect', 'off')
              .attr('autocapitalize', 'off')
              .attr('spellcheck', 'false');

        // add input class
        $input.addClass(TI.CSS_INPUT);

        // check if we should center checkbox (we look at the parent <p> to figure this out)
        if ($tag.parent().css('text-align') == 'center') {
            $input.css('text-align', 'center');
        }

        // get the table cell for the input
        var tableEl = this.getElement();
        var $cell = $tag.closest('td, th', tableEl);

        // add class to cell indicating it is editable
        $cell.addClass(TI.CSS_EDITABLE);

        // add focus/blur css to cell
        $input.focus(function() {
            $cell.addClass(TI.CSS_ACTIVE);
        }).blur(function() {
            $cell.removeClass(TI.CSS_ACTIVE);
        });

        // prevent drag
        /*$input.bind('dragstart', function(evt) {
            evt.preventDefault();
            return false;
        });*/

        // prevent from being resized
        // $input.css('resize', 'none');

        // check if we should include the tag text in the input box
        if (includedInResponse) {
            var tagText = $tag.text().trim();
            if (tagText) {
                $input.val(tagText);
            }
        }

        // keep original value
        $input.data('originalResponse', $input.val());

        // validate keypress
        if (typeof globalValidator == 'function') {
            var inputValidator = globalValidator.bind(this, $input, $cell, validationRule);
            // $input.keyup(inputValidator);
            $input.on('input', inputValidator);
            this._inputValidators.push(inputValidator);
        }

        // append <input> in <span>
        $tag.replaceWith($input);
    };

    // render the table inputs
    TI.prototype.render = function() {

        var tableEl = this.getElement();

        // get the headers id's
        $('thead th', tableEl).each(function (idx, thEl) {
            var $cell = $(thEl);
            if ($cell.prop('tagName') == 'TH') {
                var id = $cell.data('itsIdentifier');
                this._columnIds.push(id);
            }
        }.bind(this));

        // process all the its tags
        $('span[data-its-input="true"]', tableEl)
            .each(this._processTag.bind(this));
    };

    TDS.TableInput = TI;

})(TDS);