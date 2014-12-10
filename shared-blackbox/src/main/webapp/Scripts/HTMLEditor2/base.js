(function (CKEDITOR) {

    // check if ckeditor lib is available
    if (CKEDITOR == null) return;

    // We need to turn off the automatic inline editor creation 
    CKEDITOR.disableAutoInline = true;

    // check if we are using inline mode
    var useInline = false;
    var mode = Util.QueryString.parse().ckeditor;
    if (mode) {
        // someone manually defined mode
        useInline = (mode == 'inline');
    } else if (Util.Browser.isIOS() || Util.Browser.isAndroid()) {
        // tablets need inline for selection to work properly (especially android)
        useInline = true;
    }

    // fix paths for icons
    CKEDITOR.on('instanceCreated', function (ev) {
        var clipPath = HTMLEditor.resolveBaseUrl('Scripts/HTMLEditor2/plugins/clipboard/icons/');
        var spellPath = HTMLEditor.resolveBaseUrl('Scripts/HTMLEditor2/plugins/spellchecker/icons/');
        var keymapPath = HTMLEditor.resolveBaseUrl('Scripts/HTMLEditor2/plugins/keymaphelp/icons/');
        CKEDITOR.skin.addIcon('cut', clipPath + 'cut.png', 0, true);
        CKEDITOR.skin.addIcon('copy', clipPath + 'copy.png', 0, true);
        CKEDITOR.skin.addIcon('paste', clipPath + 'paste.png', 0, true);
        CKEDITOR.skin.addIcon('spellchecker', spellPath + 'spellchecker.png', 0, true);
        CKEDITOR.skin.addIcon('keymaphelp', keymapPath + 'keymaphelp.png', 0, true);
    });

    // fix paths
    function fixPaths() {

        // version of ckeditor (should match what is in scripts_shared.xml)
        var version = '4.4';

        var rootPath = HTMLEditor.resolveBaseUrl('');
        var basePath = rootPath + 'Scripts/Libraries/ckeditor/' + version + '/';
        var pluginsPath = basePath + 'plugins/';
        var customPath = rootPath + 'Scripts/HTMLEditor2/plugins/';

        // set base path for ckeditor, needed for js file combiner
        if (CKEDITOR.basePath != basePath) {
            CKEDITOR.basePath = basePath;
        }

        // set base path for plugins
        if (CKEDITOR.plugins.basePath != pluginsPath) {
            CKEDITOR.plugins.basePath = pluginsPath;
        }

        // manually fix plugin paths since they are registered early with the wrong path
        var pluginName;
        for (pluginName in CKEDITOR.plugins.registered) {
            var plugin = CKEDITOR.plugins.registered[pluginName];

            // check if the base path is not correct
            if (plugin.path.indexOf(pluginsPath) == -1) {
                plugin.path = CKEDITOR.plugins.getPath(pluginName);
            }
        }

        // manually fix icon paths since they are registered early with the wrong path
        var iconName;
        for (iconName in CKEDITOR.skin.icons) {
            var icon = CKEDITOR.skin.icons[iconName];
            var fileName = icon.path.split('/').pop();

            // check if the path is not our custom plugins (for clipboard fix above)
            if (icon.path.indexOf(customPath) == -1) {
                icon.path = pluginsPath + fileName;
            }
        }
    }

    // this defines groups of buttons we can show
    var DEFAULT_GROUPS = {
        'help': ['KeyMapHelp'],
        'basicstyles': ['Bold', 'Italic', 'Underline'],
        'cleanup': ['RemoveFormat'],
        'list': ['NumberedList', 'BulletedList'],
        'indent': ['Outdent', 'Indent'],
        'clipboard': ['Cut', 'Copy', 'Paste'],
        'undo': ['Undo', 'Redo'],
        'spellchecker': ['SpellChecker', 'Languages'],
        'table': ['Table'],
        'specialchar': ['SpecialChar']
    };

    function createToolbar(responseType, addGroups, removeGroups) {
        
        var toolGroups = {};

        // for custom we only use the groups that are given to us
        if (responseType == 'HTMLEditorCustom') {
            // take groups that match
            if (addGroups) {
                addGroups.forEach(function (groupName) {
                    toolGroups[groupName] = DEFAULT_GROUPS[groupName];
                });
            }
        } else {
            // take all groups
            Object.keys(DEFAULT_GROUPS).forEach(function(groupName) {
                toolGroups[groupName] = DEFAULT_GROUPS[groupName];
            });
        }

        // this defines the ckeditor button groups used by ckeditor
        var toolbar = [
            ['KeyMapHelp'],
            ['Bold', 'Italic', 'Underline', 'RemoveFormat'],
            ['NumberedList', 'BulletedList', 'Outdent', 'Indent'],
            ['Cut', 'Copy', 'Paste', 'Undo', 'Redo'],
            ['SpellChecker', 'Languages'],
            ['Table', 'SpecialChar']
        ];

        // always remove table if we aren't using table or custom response type
        if (responseType != 'HTMLEditorTable' &&
            responseType != 'HTMLEditorCustom') {
            delete toolGroups['table'];
        }

        // if plain text remove all groups other than spell check
        if (responseType == 'PlainTextSpell') {
            Object.keys(toolGroups).forEach(function(groupName) {
                if (groupName != 'spellchecker') {
                    delete toolGroups[groupName];
                }
            });
        }

        // if not in streamlined mode then remove the help group
        var accProps = Accommodations.Manager.getCurrentProps();
        if (!accProps.isStreamlinedMode()) {
            delete toolGroups['help'];
        }

        // remove any groups passed in
        if (removeGroups) {
            removeGroups.forEach(function (groupName) {
                delete toolGroups[groupName];
            });
        }

        // create lookup for buttons with the groups we have left
        var buttons = Util.Array.flatten(Util.Object.values(toolGroups));

        // remove buttons for any groups we removed
        toolbar = toolbar.map(function (group) {
            // remove any buttons we don't have groups for
            return group.filter(function (button) {
                return buttons.indexOf(button) != -1;
            });
        }).filter(function (group) {
            // remove any empty groups
            return group.length;
        });

        return toolbar;

    }

    function createConfig(responseType, addGroups, removeGroups) {

        // create ckeditor config
        var config = {
            title: '', // removes title attribute
            customConfig: '', // disables downloading config.js
            readOnly: true, // always lock to protect against fixDom() being triggered
            startupFocus: false,
            baseFloatZIndex: 50, // allow showAlert dialogs to be higher than cke_dialog_background_cover and dialogs
            dialog_noConfirmCancel: true,
            //tabSpaces: 4,  // Please see FB 147852 before changing this
            extraPlugins: 'clipboard,spellchecker,keymaphelp',
            removePlugins: 'sharedSpaces,floatingspace,resize,tableresize,wordcount',
            disableNativeSpellChecker: true,
            disableNativeTableHandles: true,
            height: '' // removes height attribute
        };

        // create toolbar
        config.toolbar = createToolbar(responseType, addGroups, removeGroups);

        if (useInline) {
            config.removePlugins += ',wysiwygarea'; // remove iframe
        } else {
            config.removePlugins += ',divarea'; // remove inline
        }

        // if using iframes then add styles
        if (!useInline) {
            var styles = [];
            styles.push(HTMLEditor.resolveBaseUrl('Shared/CSS/accommodations.css'));
            styles.push(HTMLEditor.resolveBaseUrl('Scripts/HTMLEditor2/frame.css'));
            config.contentsCss = styles;
        }

        return config;
    }

    // this function is called when the editor and dom is ready 
    function onInstanceReady(editor) {

        var editable = editor.editable();

        editor.isReady = true;

        // add TDS class
        editor.container.addClass('editor');

        // get the main content element
        if (useInline) {
            editor.contentDom = editable.$; // editable <div>
        } else {
            editor.contentDom = editor.document.$.body; // frame <body>
        }

        // remove title attribute
        var editorEl = editor.element.$;
        if (editorEl.removeAttribute) {
            editorEl.removeAttribute('title');
        }

        // FB 146275 - hardware keyboards act different under iOS >= 7 so we're going to disallow Ctrl key shortcuts because
        //  Caps-Lock on sets Ctrl key flag to true for all subsequent key presses
        //  Ctrl-key sets Meta = true and only generates a key up event
        //  Shift/Alt keys works fine
        if (!Util.Browser.supportsModifierKeys()) {
            editable.attachListener(editable, 'keydown', function (evt) {
                if (evt.data.$.ctrlKey) {
                    evt.stop();
                }
            }, null, null, 1);
        }

        // unlock editor
        if (editor.config.disabled !== true) {
            setTimeout(function () {
                editor.setReadOnly(false);
            }, 0);
        }
    }

    function createEditor(containerEl, responseType, configOverride) {

        // clear editor div
        containerEl.innerHTML = '';

        // create editor and add it to the container element 
        fixPaths();
        var config = createConfig(responseType, configOverride.addGroups, configOverride.removeGroups);
        if (configOverride) {
            for (var property in configOverride){
                config[property] = configOverride[property];
            }
        }

        // Hack: CKEditor 4.4 adds a flag to test browser compatibility and then checks this when a new
        //  editor is created (at least those at the only check points in the 4.4.3 code we use). One of those
        //  tests is for FireFox >= 4 which breaks our need to support 3.6. For now we'll force all
        //  browsers to be compatible.
        CKEDITOR.env.isCompatible = true;

        var editor = CKEDITOR.appendTo(containerEl, config);
        if (!editor) {
            throw new Error('CKEditor failed to be created.');
        }

        editor.isReady = false;

        // wait for editor to be ready
        editor.on('instanceReady', onInstanceReady.bind(null, editor));

        return editor;
    }

    var HTMLEditor = {};

    HTMLEditor.create = createEditor;

    // users of HTMLEditor need to always override this
    HTMLEditor.resolveBaseUrl = function (url) {
        return url;
    };

    // users of HTMLEditor need to always override this
    HTMLEditor.getLanguage = function() {
        return 'ENU';
    };

    window.HTMLEditor = HTMLEditor;

})(window.CKEDITOR);

/*
Any patches or hacks for CKEditor.
*/

(function(CKEDITOR) {

    // BUG 103684 Handle special character CKE dialog same as YUI dialogs
    // http://ckeditor.com/forums/CKEditor-3.x/dialogDefinition.onShow-adding-event-handler
    CKEDITOR.on('dialogDefinition', function (e) {
        var dialogName = e.data.name;
        var dialog = e.data.definition.dialog;
        dialog.on('show', function () {
            YUD.addClass(document.body, 'showingDialog');
        });
        dialog.on('hide', function () {
            YUD.removeClass(document.body, 'showingDialog');
        });
    });

    // BUG 116874 recommended solution for preventing drag&drop into editor
    CKEDITOR.on('instanceCreated', function (ev) {

        ev.editor.on('contentDom', function () {

            // check if iframe and get element
            var element = (document != ev.editor.document) ?
                ev.editor.document : ev.editor.element;

            // stop drag
            element.on('dragstart', function (ev) {
                ev.data.preventDefault(true);
            });
            element.on('drop', function (ev) {
                ev.data.preventDefault(true);
            });

            // stop contextmenu
            element.on('contextmenu', function (ev) {
                ev.data.preventDefault(true);
            });
        });

        // for debugging setting response...
        /*ev.editor.on('dataReady', function () {
            var editable = ev.editor.editable();
            console.log('ckeditor dataReady: ', editable.$.innerHTML);
        });*/

    });

    // BUG 116874 ariaWidget is fired when menu iframes are created.  
    // Add ondragstart='return false;' to iframe body to disable drag&drop of menu items
    // Justin tried to have this integrated into CKEditor
    // https://github.com/ckeditor/ckeditor-dev/pull/52
    CKEDITOR.on('ariaWidget', function (e) {

        var menuCKEditorEl = e.data;

        if (menuCKEditorEl.hasClass && !menuCKEditorEl.hasClass('dragDisabled')) {

            var tag = menuCKEditorEl.$.tagName.toLowerCase();
            var doc;
            var menuBody;
            if (tag === 'iframe') {
                doc = menuCKEditorEl.getFrameDocument();
                menuBody = doc.getBody();
            } else if (tag === 'body') { // IE passes the body in
                doc = menuCKEditorEl.getDocument();
                menuBody = menuCKEditorEl;
            } else {
                return; // Better than no menu?
            }

            if (doc && menuBody) {
                menuBody.setAttribute('ondragstart', 'return false;');
                menuCKEditorEl.addClass('dragDisabled');
            }
        }
    });
    
    /* 
    BUG: On Firefox 3.6 the mode is undefined until 'dataReady' is fired. 
    But we can still get the selection. Otherwise we will return null and cause problems.
    You can find original code in \ckeditor\core\selection.js.
    */
    if (Util.Browser.getFirefoxVersion() < 10) {
        CKEDITOR.editor.prototype.getSelection = function (forceRealSelection) {

            // Check if there exists a locked or fake selection.
            if ((this._.savedSelection || this._.fakeSelection) && !forceRealSelection)
                return this._.savedSelection || this._.fakeSelection;

            // Editable element might be absent or editor might not be in a wysiwyg mode.
            var editable = this.editable();
            if (editable && (this.mode === undefined || this.mode == 'wysiwyg')) {
                var sel = new CKEDITOR.dom.selection(editable);
                // BUG: fixDom() will get triggered unless dom selection is locked (editable.js line 1085)
                if (this.mode === undefined) {
                    sel.isLocked = 1;
                }
                return sel;
            }

            return null;
        };
    }

})(CKEDITOR);

// Check if user deleted everything
(function (CKEDITOR) {

    var charDiff = 10;

    function instanceCreated(editor) {

        // the last text that was changed by this editor instance
        var lastChange = '';

        // check for when text is changed
        editor.on('change', function (evt) {

            // get editor text
            var editable = editor.editable();
            var text = editable.getText();

            // remove all whitespaces
            if (text) {
                text = text.replace(/([\s\t\r\n]*)/gm, '');
            }

            // check if anyting has changed
            if (text != lastChange && text.length == 0 && lastChange.length > charDiff) {
                console.warn('EDITOR DELETE WARNING: ' + lastChange);
            }

            // save text for the next check
            lastChange = text;

        });
        
    }

    CKEDITOR.on('instanceCreated', function (ev) {
        instanceCreated(ev.editor);
    });
    
})(CKEDITOR);
