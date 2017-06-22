//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
﻿(function (CKEDITOR) {

    var modeName = 'spellcheck';
    var cmdName = 'spellchecker';
    var pluginName = 'spellchecker';

    // create spellcheck service if it is not created yet
    function createSpellCheck(editor) {
        if (editor.spellCheck) return;
        editor.spellCheck = new SpellCheck(SpellCheckManager, editor.contentDom);
        $(editor.contentDom).click(function (evt) {
            if (editor.commands.spellchecker.enabled) {
                if ($(evt.target).hasClass('spellcheck-word')) {
                    clickedWord(editor, evt);
                }
            }
        });
    }
    
    // disable all enabled spellchecks
    function disableSpellChecks() {
        Util.Object.values(CKEDITOR.instances).forEach(function (editor) {
            var cmdSC = editor.commands.spellchecker;
            if (cmdSC.enabled) {
                cmdSC.exec(); // toggle it off
            }
        });
    }

    function resetSelection(editor) {
        // Position cursor at the beginning of the editor area... IE 10 in particular seems to have problems
        // with old ranges causing crashes if the cursor is in the midst of DOM elements that changed
        editor.getSelection().removeAllRanges(); // Clear any existing selections

        var range = editor.createRange(); // Move the cursor (and set a collapsed range) as the beginning of the editor document
        range.moveToPosition(range.root.getFirst() ? range.root.getFirst() : range.root, CKEDITOR.POSITION_AFTER_START);
        editor.getSelection().selectRanges([range]);
    }

    // call this to enable spellcheck
    function enableSpellCheck(editor) {

        // check if already enabled
        if (this.enabled) return;
        console.log('SpellCheck Enabled "' + editor.name + '": ' + this.language);

        resetSelection(editor);

        // disable any other spell checks
        disableSpellChecks();

        // mark as enabled
        this.enabled = true;

        // create SpellCheck engine if it is not already
        createSpellCheck(editor);

        // set language in dropdown
        SpellCheckManager.setLanguage(this.language);

        // remove focus
        Util.Dom.blur(editor.contentDom);

        // set as read only so user cannot change anything
        editor.setReadOnly(true);

        // fetch words async and highlight mistakes
        var bookmarks = editor.getSelection().createBookmarks2();
        editor.spellCheck.check();
        editor.getSelection().selectBookmarks(bookmarks);

        // set button as on
        this.setState(CKEDITOR.TRISTATE_ON);
    }

    // call this to disable spellcheck
    function disableSpellCheck(editor) {

        // check if already disabled
        if (!this.enabled) return;
        console.log('SpellCheck Disabled "' + editor.name + '"');

        resetSelection(editor);

        // mark as disabled
        this.enabled = false;

        // disable highlighted mistakes
        var bookmarks = editor.getSelection().createBookmarks2();
        editor.spellCheck.done();
        editor.getSelection().selectBookmarks(bookmarks);

        // turn off read only
        editor.setReadOnly(false);

        // set button as off
        this.setState(CKEDITOR.TRISTATE_OFF);

        // fix that sets cursor back in editor
        if (editor.focusManager.hasFocus) {
            Util.Dom.blur(editor.contentDom);
        }
        setTimeout(function() {
            Util.Dom.focus(editor.contentDom);
        }, 0);
    }

    // this is event handler for when clicking on a replacement word in the context menu
    function replaceWord(editor, node, word, replacement) {

        // Removing bookmark code as it causes a problem when used with the replaceWord function (next). The exception can be demonstrated by visiting a new editor item and
        // 1) Typing 'this is a tst of the editr'
        // 2) Entering spell check mode
        // 3) Clicking on the word 'tst' to correct it
        // 4) Spelling choices list will appear... click outside of the list in the middle of the editor box to dismiss the suggestions list
        // 5) Click on the word 'tst' again to correct it
        // 6) Choose the word 'test' and an exception will occur in SB or Chrome (and likely other browsers)
        //var bookmarks = editor.getSelection().createBookmarks2();

        editor.spellCheck.replaceWord(node, word, replacement);
        /*
        // Experimental code used as a replacement for the above replaceWord code to demonstrate a way to modify that DOM that cooperates with CKEditor
        var ckNode = new CKEDITOR.dom.node(node);
        var prevNode = ckNode.getPrevious();
        var newTextNode = new CKEDITOR.dom.text(replacement);
        newTextNode.insertAfter(prevNode);
        ckNode.remove();
        */
        //editor.getSelection().selectBookmarks(bookmarks);
    }

    // this is event handler for when clicking on a misspelled word in CKEditor
    function clickedWord(editor, evt) {

        var node = evt.target;
        var word = Util.Dom.getTextContent(node);
        if (!word) return; // not a valid word
        var suggestions = SpellCheckManager.getSuggestions(word);

        var menuItems = [];

        // check if there are any word suggestions
        if (suggestions.length > 0) {
            for (var i = 0; i < suggestions.length; i++) {
                var suggestion = suggestions[i];
                menuItems.push({
                    text: suggestion,
                    onclick: { fn: replaceWord.bind(null, editor, node, word, suggestion) }
                });
            }
        } else {
            // create empty menu item
            menuItems.push({
                text: 'No suggestions'
                // disabled: true // BUG #16817: ESC does not close Suggestion list menu if it has 'No Suggestion'
            });
        }

        // get element XY
        var menuXY = YUD.getXY(node);

        // include XY of iframe
        menuXY = ContentManager.getEventXY(evt, menuXY);

        // add height of word offset 
        var region = YAHOO.util.Region.getRegion(node);
        menuXY[1] += region.height;

        ContentManager.Menu.show({
            custom: menuItems,
            evt: evt,
            xy: menuXY
        });
    };

    // initialize the language selector 
    function initLanguages(editor) {
        
        var lookup = {
            ESN: 'Español',
            ENU: 'English'
        };

        //This TDS specific code should have been something that accommodations handle, but does not.
        var languages = window.ContentManager ? ContentManager.getAccommodationProperties().getLanguages() : ['ENU', 'ESN'];
        var defaultLang = window.ContentManager ? ContentManager.getAccommodationProperties().getLanguage() : 'ENU';
        if (languages.indexOf('ESN') != -1) {
            //If ESN, but not ENU enabled, always add in ENU, but do NOT add in ESN if only ENU is around.
            //https://bugz.airast.org/default.asp?89893
            if (languages.indexOf('ENU') == -1) {
                languages.push('ENU');
            }
        }

        // If ENU-Braille is found, but not English then ensure English (ENU) is available as they
        // will use the same dictionary
        if (languages.indexOf('ENU-Braille') != -1) {
            if (languages.indexOf('ENU') == -1) {
                languages.push('ENU');
            }
            // If ENU-Braille is selected then use the English dictionary
            if (defaultLang == 'ENU-Braille') {
                defaultLang = 'ENU';
            }
        }

        // set spellchecker language
        var cmdSC = editor.commands.spellchecker;
        cmdSC.language = defaultLang;

        // if there are multiple languages then add dropdown
        if (languages.length > 1) {
            editor.ui.addRichCombo('Languages', {
                toolbar: 'spellchecker,20',
                label: lookup[defaultLang],
                value: defaultLang,
                onClick: function (selectedLang) {
                    // set text for dropdown button
                    this.setValue(selectedLang, lookup[selectedLang]);
                    this.label = lookup[selectedLang];
                    // set language for spellchecker command
                    cmdSC.language = selectedLang;
                },
                panel: {
                    css: [CKEDITOR.skin.getPath('editor')].concat(editor.config.contentsCss),
                    multiSelect: false,
                    attributes: {
                        'aria-label': 'Spellcheck language',
                        name: 'Languages'
                    }
                },
                init: function () {
                    this.startGroup('Language');
                    for (var i = 0; i < languages.length; ++i) {
                        if (lookup[languages[i]]) {
                            this.add(languages[i], lookup[languages[i]]);
                        }
                    }
                    this.commit();
                }
            });

            // In accessbility mode send the focus back to the richcombo when it is dismissed. Note: We may want to do this
            //  regardless of accessibility mode in the future.
            if (editor.accessibility) {
                editor.on('panelHide', function (e) {
                    var editor = e.editor;
                    var data = e.data;

                    // If only I could find something better than this to identify that it is the languages richcombo
                    if (data._.definition.attributes.name === 'Languages') {
                        var elEditor = editor.element.$;
                        var $Editor = $(elEditor);

                        // Set focus back on the Languages combo after it has been dismissed
                        setTimeout(function () {
                            editor.execCommand('toolbarFocus');
                            $Editor.find('.cke_combo__languages a').focus();
                        }, 0);
                    }
                });
            }
        }

    }

    // initialize the CKEditor spellcheck plugin (called for each editor instance)
    function initPlugin(editor) {

        // add a custom command to CKEditor to run
        var cmd = editor.addCommand(cmdName, {
            canUndo: true,
            async: false,
            modes: { wysiwyg: 1, spellcheck: 1 },
            exec: function () {
                if (this.enabled) {
                    disableSpellCheck.call(this, editor);
                } else {
                    enableSpellCheck.call(this, editor);
                }
            },
            enabled: false // is spell check enabled?
        });

        // add a button that runs our custom command
        var button = editor.ui.addButton('SpellChecker', {
            label: 'SpellCheck',
            icon: 'spellchecker',
            command: cmdName, // calls command exec
            toolbar: 'spellchecker,10'
        });

        // add language dropdown
        initLanguages(editor);

        // add to CKEditor context menu
        if (editor.contextMenu) {

            // FB 152116 - Check if spell checker is on before adding to context menu
            var spellcheckOn = false;
            editor.config.toolbar.forEach(function(elements) {
                elements.forEach(function(element) {
                    if (element == 'SpellChecker') {
                        spellcheckOn = true;
                    }
                });
            });

            if (spellcheckOn) {
                editor.addMenuGroup('spellCheckGroup');
                editor.addMenuItem('spellCheckItem', {
                    label: 'Spell Check',
                    icon: 'spellchecker',
                    command: cmdName,
                    group: 'spellCheckGroup'
                });
            }

            editor.contextMenu.addListener(function (element) {
                return { spellCheckItem: CKEDITOR.TRISTATE_ON };
            });
        }
    }

    CKEDITOR.plugins.add(pluginName, {
        requires: 'richcombo',
        config: {
            parser: 'html'
        },
        init: initPlugin
    });

})(CKEDITOR);
