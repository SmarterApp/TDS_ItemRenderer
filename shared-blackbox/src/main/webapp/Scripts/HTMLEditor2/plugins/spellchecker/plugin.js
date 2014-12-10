(function (CKEDITOR) {

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

    // call this to enable spellcheck
    function enableSpellCheck(editor) {

        // check if already enabled
        if (this.enabled) return;
        console.log('SpellCheck Enabled "' + editor.name + '": ' + this.language);

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
        editor.spellCheck.check();

        // set button as on
        this.setState(CKEDITOR.TRISTATE_ON);
    }

    // call this to disable spellcheck
    function disableSpellCheck(editor) {

        // check if already disabled
        if (!this.enabled) return;
        console.log('SpellCheck Disabled "' + editor.name + '"');

        // mark as disabled
        this.enabled = false;

        // disable highlighted mistakes
        editor.spellCheck.done();

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
        editor.spellCheck.replaceWord(node, word, replacement);
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
                    attributes: { 'aria-label': 'Spellcheck language' }
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
            editor.addMenuGroup('spellCheckGroup');
            editor.addMenuItem('spellCheckItem', {
                label: 'Spell Check',
                icon: 'spellchecker',
                command: cmdName,
                group: 'spellCheckGroup'
            });

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
