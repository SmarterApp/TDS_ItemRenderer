//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
/*
This code is used for setting up the writing widget with ckeditor.
*/

(function(CM, CKEDITOR) {

    var wordsAllowed = 850;

    // get the word count for some text
    function countHTMLWords(html) {

        // if there is no html then just return 0 words
        if (!html) {
            return 0;
        }

        // This method for counting words from an HTMl document comes from the CKEditor word count plugin
        var text = html.
            replace(/(\r\n|\n|\r)/gm, " "). // Replace end of line chars with spaces
            replace(/^\s+|\s+$/g, ""). // Remove whitespace from start/end of lines
            replace("&nbsp;", " "); // Replace &nbsp with spaces

        // Strip all HTML
        var tmp = document.createElement("div");
        tmp.innerHTML = text;
        text = Util.Dom.getTextContent(tmp);

        var words = text.split(/\s+/); // Split on whitespace

        for (var wordIndex = words.length - 1; wordIndex >= 0; wordIndex--) {
            if (words[wordIndex].match(/^([\s\t\r\n]*)$/)) {
                words.splice(wordIndex, 1);
            }
        }

        return words.length;
    }

    // update the word count for a ckeditor instance
    function updateWordCount(item, warning) {

        // get the word count
        var editor = item.editor;
        var isEditorReady = editor && editor.isReady;
        var wordsCount = countHTMLWords(isEditorReady ? editor.getData() : item.value);

        // update the main word count (bottom of the screen)
        var wordCountLabel = (wordsCount == 0) ? '' : wordsCount + ' out of ' + wordsAllowed + ' words used.';
        var page = item.getPage();
        var pageEl = page.getElement();
        if (pageEl) {
            $('div.writeNav2', pageEl).text(wordCountLabel);
        }

        // update the unit word count (prompt selection screen)
        if (wordsCount > 0) {
            var promptCountLabel = wordsCount + ' words';
            var itemEl = item.getElement();
            if (itemEl) {
                $('span.inlineCount', itemEl).text(promptCountLabel);
            }
        }

        // check if we should show an alert dialog
        if (isEditorReady && warning && wordsCount > wordsAllowed) {
            var message = 'Your response cannot exceed ' + wordsAllowed + ' words.';
            TDS.Dialog.showAlert(message, function () {
                CM.focus(editor);
            });
        }
    }
    
    // This builds an ckeditor instance for an items writing prompt.
    // NOTE: We don't use module_htmleditor2.js right now because 
    // there are some differences in how we set this up.
    function createEditor(writing, item) {
        
        var itemDiv = YUD.get('Item_' + item.position);
        var editorDiv = itemDiv.getElementsByClassName('writingBlock')[0];
        var editor = HTMLEditor.create(editorDiv, item.responseType, { disabled: item.isReadOnly() });
        item.editor = editor;
        editor.parentItem = item;

        // check if existing response
        if (item.value) {
            // we use private variable because in editor.js (line 867) 
            // it will use it when loading but won't fire events
            editor._.data = item.value;
        }
                        
        // Chrome needs this...
        // TODO: I commented this out in code rewrite.. do we still need it?
        // editor.contentDom.focus();

        // #bug 104821 add item component, fix ctrl+tab  change focus
        item.addComponent(editor);
        
        // listen for when a key is pressed so we can update word count
        editor.on('change', function() {
            updateWordCount(item, true);
        });

        editor.on('instanceReady', function () {
            updateWordCount(item, false);
        });

    }

    // sets up a writing item unit
    function processItem(writing, item) {
        
        // create writing prompt
        var unit = new WritingUnit(item.getElement());
        unit.item = item; // assign item to unit (TODO: remove this)
        unit.writing = writing; // parent writing object
        writing.units.push(unit); // add to unit list
        
        // check if a unit is already selected (if selected on server side) 
        if (unit.isSelected()) {
            unit.select(); // we need to call select do the CSS class gets applied
            YUD.removeClass(writing.linkStart, 'inactive'); // set start writing mode to active
            item.setActive();
        }

        // add onlick for when clicking on prompt
        YUE.addListener(unit.linkSelect, 'click', function () {
            if (CM.Menu.isShowing()) return;
            writing.selectUnit(unit);
        });

        // add onlick for expanding prompt
        YUE.addListener(unit.linkExpandPrompt, 'click', unit.toggleExpand, unit, true);

        item.isVisible = function () {
            return Util.Dom.isVisible(unit.divPrompt);
        };
        
        // Update on show...due to issues with CKE editor and Chrome, we need to
        // create the editor instance only after the parent div is visible.
        unit.onOpenEdit.subscribe(function () {

            updateWordCount(item, false);

            // lazy load editor
            if (!item.editor) {
                createEditor(writing, item);
            }
        });

        updateWordCount(item, false);

        return unit;
    }

    // sets up the writing page widget
    function processPage(page) {

        // create writing widget
        var divWriting = page.getElement();
        var writing = new WritingLayout(divWriting);

        // create word count bar and add it to the dom
        var wordCountDiv = divWriting.getElementsByClassName('writeNav2')[0];
        YUD.addClass(wordCountDiv, 'writeNav2');
        var parentDiv = divWriting.getElementsByClassName('bigTable')[0];
        parentDiv.appendChild(wordCountDiv);
        writing.wordCountEl = wordCountDiv;

        // process each item (prompt) on the page
        var items = page.getItems();
        Util.Array.each(items, function (item) {
            // create writing unit
            var unit = processItem(writing, item);
            var unitEl = item.getElement();
            var config = new CM.WidgetConfig(unitEl.id, unitEl);
            var widget = CM.createWidget(Widget_Writing, page, item, config);
            widget.unit = unit;
            item.widgets.add('writing', widget);
        });

        // hack for one prompt
        if (writing.units.length == 1) {
            writing.units[0].select();
            writing.enableEditing();
        }
        else {
            writing.toggleEdit();
        }

        return writing;
    }

    function Plugin_Writing() {
        this.writing = null;
    }

    CM.registerPagePlugin('writing', Plugin_Writing, function(page) {
        return (page.layout == '12');
    });

    Plugin_Writing.prototype.load = function () {
        this.writing = processPage(this.page);
    }
    
    function Widget_Writing(page, item) {
        this.unit = null;
    }

    CM.extendWidget(Widget_Writing);

    Widget_Writing.prototype.keyEvent = function(evt) {

        var unit = this.unit;
        var writing = unit.writing;

        // make sure keydown event and no modifiers
        if (evt.type != 'keydown' || evt.ctrlKey || evt.altKey) return;

        // if we are on the prompt selection screen and someone hits enter then perform an action on the prompt
        if (evt.key == 'Enter' && !writing.isEditing()) {
            if (unit.isSelected()) {
                writing.enableEditing();
            } else {
                writing.selectUnit(unit);
            }
        }

    }
    
    Widget_Writing.prototype.showMenu = function(menu) {

        var item = this.entity;
        var unit = this.unit;
        var writing = unit.writing;

        // check if stem
        if (item.getActiveComponent() != item.getStemElement()) return;

        // add change prompt if editing 
        if (writing.isEditing()) {
            menu._entity.push({
                text: 'Change Prompt',
                classname: 'changePrompt',
                onclick: {
                    fn: writing.toggleEdit,
                    scope: writing
                }
            });
        }

    }

    Widget_Writing.prototype.isResponseAvailable = function () {
        return this.entity.editor && this.entity.editor.isReady;
    }

    Widget_Writing.prototype.getResponse = function() {
        var item = this.entity;
        var editor = item.editor;
        var unit = this.unit;
        var value = editor.getData();
        var isValid = (value.length > 0);
        var isEmpty = !isValid;
        var isSelected = unit.isSelected();
        return this.createResponse(value, isValid, isEmpty, isSelected);
    }

    Widget_Writing.prototype.setResponse = function(value) {
        var item = this.entity;
        var editor = item.editor;
        editor.setData(value);
    }

})(window.ContentManager, window.CKEDITOR);



