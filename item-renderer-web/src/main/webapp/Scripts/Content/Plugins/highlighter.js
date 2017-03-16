//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
/*
Plugin for rangy highlighter
*/

(function(rangy, CM) {

    var CSS_HIGHLIGHT = 'highlight';

    // check for rangy
    if (!rangy) return;

    if (rangy.config) {
        rangy.config.alertOnFail = false;
        rangy.config.alertOnWarn = false;
    }

    // this variable will get lazy loaded on the first call
    var globalClassApplier;

    function getSelfOrAncestorWithClass(node, cssClass) {
        while (node) {
            if (YUD.hasClass(node, cssClass)) {
                return node;
            }
            node = node.parentNode;
        }
        return null;
    };

    // Checks for MathML structures with children
    function checkMathML(node) {
        var mathTypes = /mfrac|msup|mfenced|msqrt|msubsup|msub|mover|munder|msubsup|mlongdiv|munderover|mroot/;
        if (mathTypes.test(node)) {
            return true;
        }
        return false;
    };

    function createCSSClassApplier() {

        var cssClassApplier = rangy.createClassApplier(CSS_HIGHLIGHT, {
            ignoreWhiteSpace: true,
            useExistingElements: false,
            removeEmptyElements: false,
            tagNames: ['span']
        });

        // modify this function for any elements you don't want to perform highlighting on
        cssClassApplier.isModifiable = function(textNode) {
            // ignore any text nodes that have a ancestor with the class 'no-highlight'
            // Bug 121028 ignores any node that is a MathML parent structure with children, this does not affect display
            if (getSelfOrAncestorWithClass(textNode.parentNode, 'no-highlight') != null ||
                checkMathML(textNode.parentNode.nodeName)) {
                return false;
            }
            return true;
        };

        return cssClassApplier;
    }

    function getCSSClassApplier() {
        if (!globalClassApplier) {
            globalClassApplier = createCSSClassApplier();
        }
        return globalClassApplier;
    }

    // highlight selected text
    function setHighlight(selection) {
        if (selection.rangeCount > 0) {
            var cssClassApplier = getCSSClassApplier();
            cssClassApplier.applyToRanges(selection.getAllRanges());
            selection.collapseToStart();
        }
    }

    // does a selection object have any text selected
    function hasSelection(selection) {
        if (selection && typeof selection.toString == "function") {
            var text = selection.toString();
            text = YAHOO.lang.trim(text);
            return (text.length > 0);
        }
        return false;
    }

    function Plugin_High(page, entity, config) {
        this.highlighter = rangy.createHighlighter(); // document, 'TextRange'
        this.highlighter.addClassApplier(getCSSClassApplier());
    }

    CM.registerEntityPlugin('highlighter', Plugin_High, function match(page, entity) {
        var accProps = page.getAccommodationProperties();
        return accProps && accProps.hasHighlighting();
    });

    // highlight the current browser selection
    Plugin_High.prototype.highlightSelection = function (selection) {
        var page = this.page;
        var pageEl = page.getElement();
        // highlight the stored selection and use page element as container
        this.highlighter.highlightSelection('highlight', {
            selection: selection,
            containerElementId: pageEl.id
        });
        // collapsing selection on mobile devices has weird side effects
        if (!Util.Browser.isMobile()) {
            selection.collapseToStart();
        }
    };

    // remove all highlights from an element
    Plugin_High.prototype.removeAllHighlights = function () {

        this.highlighter.removeAllHighlights();

        /*
        // clear highlight objects
        this.highlighter.highlights = [];

        // create a range for the element
        var range = rangy.createRange();
        range.selectNode(this.entity.getElement());

        // undo the highlighting for the element range
        var cssClassApplier = getCSSClassApplier();
        cssClassApplier.undoToRange(range);
        */

    };

    Plugin_High.prototype.reload = function() {
        var serialized = this.highlighter.serialize();
        console.log(serialized);
        this.removeAllHighlights();
        this.highlighter.deserialize(serialized);
    };

    Plugin_High.prototype.showMenu = function(menu, evt, selection) {

        // if TTS is doing highlighting we don't want to interfere
        if (TTS.Singleton && TTS.Singleton.isPlaying()) {
            return;
        }

        var self = this, // plugin
            highlighter = this.highlighter; // rangy

        // check if there is something currently selected
        var hasSelectedText = hasSelection(selection);
        if (hasSelectedText) {
            // add highlight text menu item
            var lblHighlightText = CM.getLabel('HIGHLIGHT_TEXT');
            menu.addMenuItem('entity', lblHighlightText, function () {
                self.highlightSelection(selection);
                // BUG #16185: The Flashing cursor is not seen after highlighting some text
                CM.enableCaretMode(false);
            });
        }

        // check if selection covered some existing highlights
        var selectedHighlights = highlighter.getHighlightsInSelection(selection);
        if (selectedHighlights.length == 0) {
            // check if element we clicked on has highlighting
            var targetEl = YUE.getTarget(evt);
            if (targetEl && targetEl.firstChild) {
                var targetHighlight = highlighter.getHighlightForElement(targetEl);
                if (targetHighlight) {
                    selectedHighlights.push(targetHighlight);
                }
            }
        }

        // check if we had found any selected highlights
        if (selectedHighlights && selectedHighlights.length) {
            // add remove highlight menu item
            var lblHighlightRemove = Messages.getAlt('TDSContentJS.Label.RemoveHighlight', 'Remove Highlight');
            menu.addMenuItem('entity', {
                classname: 'highlightremove',
                text: lblHighlightRemove
            }, function () {
                highlighter.removeHighlights(selectedHighlights);
            });
        }

        // check if there are any highlights at all
        if (highlighter.highlights.length > 0) {
            // add clear highlights menu item
            var lblHighlightClr = CM.getLabel('HIGHLIGHT_CLEAR');
            menu.addMenuItem('entity', lblHighlightClr, function () {
                self.removeAllHighlights();
            });
        }

    };

})(window.rangy, window.ContentManager);
