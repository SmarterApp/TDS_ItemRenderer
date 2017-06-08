/**
 * @license Copyright (c) 2003-2013, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.html or http://ckeditor.com/license
 */

/**
 * @ignore
 * File overview: Clipboard support.
 */

(function () {

    'use strict';

    // Register the plugin.
    CKEDITOR.plugins.add('clipboard', {
        requires: 'dialog',
        icons: 'copy,cut,paste',
        init: function (editor) {
            initClipboard(editor);
        }
    });

    function initClipboard(editor) {

        var BUFFER = null;
        var inReadOnly = 0;

        addListeners();
        addButtonsCommands();

        function pasteHtml() {

            if (!BUFFER) return;

            // Get the currently selected range to verify that a location has been selected for pasting
            var sel = editor.getSelection();
            var rng = sel.getRanges();
            if (rng && rng.length > 0) {
                // Insert html from cut/copy buffer
                editor.insertHtml(BUFFER, 'html');
            }
        };

        function cutCopyHtml(type) {

            // Get the current selection
            var sel = editor.getSelection();
            var rng = sel.getRanges();

            // If there was a selection...
            if (!rng || rng.length == 0) return;

            var contents;
            if (type == 'cut') {
                // Pull the contents out of the editor removing them from the editor into our BUFFER
                contents = rng[0].extractContents();
            } else {
                // Make a copy of what was selected
                contents = rng[0].cloneContents();
                // Reselect copied range (to be more MS Word-like)
                sel.selectRanges(rng);
            }

            // If both the first and last character in the cut/copied string are contained
            // within a common parent node then that parent (i.e. bold-facing) is not
            // applied. This addresses that shortcoming. For example, if we had the HTML
            // in the editor as follows:
            //
            //  <strong>cut <em>and</em> paste</strong>
            //
            // and we were to cut the text 't and p' the editor would previously
            // have only cut the following HTML
            //
            //  t <em>and</em> p
            //
            // and the pasted text would not be properly bolded as it originally was.

            // First, check all parents of this range and save those that affect
            // this node's appearance
            var commonParent = rng[0].getCommonAncestor();
            var parentNodes = [];
            if (commonParent) {
                commonParent = commonParent.$;
                // If the common nodeType is the text node then skip it
                if (commonParent.nodeType === Util.Dom.NodeType.TEXT) {
                    commonParent = commonParent.parentNode;
                }
                var tableCellContent = false;
                while (!tableCellContent && !YUD.hasClass(commonParent, 'cke_editable')) {
                    // Apply this type to the entire buffer
                    switch (commonParent.tagName.toLowerCase()) {
                        case 'strong':
                        case 'em':
                        case 'u':
                            parentNodes.push(commonParent);
                            break;
                        case 'td':
                            // If parent's are outside of a table cell then we're done as those
                            //  styles don't affect a table's contents
                            tableCellContent = true;
                            break;
                    }

                    commonParent = commonParent.parentNode;
                }
            }

            // Second, update 'buffer' so that it reflects the styles contained
            // in these common parent nodes
            if (parentNodes.length > 0) {
                var bufferRoot = document.createDocumentFragment();
                var bufferNode = bufferRoot;
                for (var nodeIndex = parentNodes.length - 1; nodeIndex >= 0; --nodeIndex) {
                    bufferNode.appendChild(parentNodes[nodeIndex].cloneNode(false));
                    bufferNode = bufferNode.firstChild;
                }
                bufferNode.appendChild(contents.$.cloneNode(true));
                contents.$ = bufferRoot;
            }

            // Convert buffer to a string of html and save in BUFFER
            var div = document.createElement('div');
            div.appendChild(contents.$);
            BUFFER = div.innerHTML;

            setToolbarStates(); // <-- update cut/copy/paste buttons
        }

        function addButtonsCommands() {
            addButtonCommand('Cut', 'cut', createCutCopyCmd('cut'), 10, 1);
            addButtonCommand('Copy', 'copy', createCutCopyCmd('copy'), 20, 4);
            addButtonCommand('Paste', 'paste', createPasteCmd(), 30, 8);

            function addButtonCommand(buttonName, commandName, command, toolbarOrder, ctxMenuOrder) {
                var lang = editor.lang.clipboard[commandName];

                editor.addCommand(commandName, command);
                editor.ui.addButton && editor.ui.addButton(buttonName, {
                    label: lang,
                    command: commandName,
                    toolbar: 'clipboard,' + toolbarOrder
                });

                // If the "menu" plugin is loaded, register the menu item.
                if (editor.addMenuItems) {
                    editor.addMenuItem(commandName, {
                        label: lang,
                        command: commandName,
                        group: 'clipboard',
                        order: ctxMenuOrder
                    });
                }
            }
        }

        function isSelectionReadOnly(selection) {
            var rng = selection.getRanges();
            return rng && rng[0] && rng[0].checkReadOnly ? rng[0].checkReadOnly() : true;
        }

        function addListeners() {
            editor.on('key', onKey);
            editor.on('contentDom', addListenersToEditable);

            // For improved performance, we're checking the readOnly state on selectionChange instead of hooking a key event for that.
            editor.on('selectionChange', function (evt) {
                inReadOnly = isSelectionReadOnly(evt.data.selection);
                setToolbarStates(); // <-- update cut/copy/paste buttons
            });

            // If the "contextmenu" plugin is loaded, register the listeners.
            if (editor.contextMenu) {
                editor.contextMenu.addListener(function (element, selection) {
                    inReadOnly = isSelectionReadOnly(selection);
                    return {
                        cut: stateFromNamedCommand('Cut'),
                        copy: stateFromNamedCommand('Copy'),
                        paste: stateFromNamedCommand('Paste')
                    };
                });
            }
        }

        // Add events listeners to editable.
        function addListenersToEditable() {

            var editable = editor.editable();

            var mouseupTimeout;

            // Use editor.document instead of editable in non-IEs for observing mouseup
            // since editable won't fire the event if selection process started within
            // iframe and ended out of the editor (#9851).
            editable.attachListener(CKEDITOR.env.ie ? editable : editor.document.getDocumentElement(), 'mouseup', function () {
                clearTimeout(mouseupTimeout);
                mouseupTimeout = setTimeout(function () {
                    setToolbarStates(); // <-- update cut/copy/paste buttons
                }, 0);
            });

            // Touch devices weren't highlighting the cut/copy buttons when text was selected so we have to account for
            // touchend events, but 
            if ('ontouchend' in window) {
                editable.attachListener(CKEDITOR.env.ie ? editable : editor.document.getDocumentElement(), 'touchend', function () {
                    clearTimeout(mouseupTimeout);
                    mouseupTimeout = setTimeout(function () {
                        setToolbarStates(); // <-- update cut/copy/paste buttons
                    }, 0);
                });
            }

            // Make sure that deferred mouseup callback isn't executed after editor instance
            // had been destroyed. This may happen when editor.destroy() is called in parallel
            // with mouseup event (i.e. a button with onclick callback) (#10219).
            editor.on('destroy', function () {
                clearTimeout(mouseupTimeout);
            });

            editable.on('keyup', setToolbarStates); // <-- update cut/copy/paste buttons
        }

        // Create object representing Cut or Copy commands.
        function createCutCopyCmd(type) {
            return {
                type: type,
                canUndo: type == 'cut', // We can't undo copy to clipboard.
                startDisabled: true,
                exec: function (data) {
                    cutCopyHtml(type);
                }
            };
        }

        function createPasteCmd() {
            return {
                // Snapshots are done manually by editable.insertXXX methods.
                canUndo: false,
                startDisabled: true,
                exec: function () {
                    pasteHtml();
                }
            };
        }

        // Listens for some clipboard related keystrokes, so they get customized.
        // Needs to be bind to keydown event.
        function onKey(event) {

            if (editor.mode != 'wysiwyg') {
                return;
            }

            switch (event.data.keyCode) {
                // Paste
                case CKEDITOR.CTRL + 86: // CTRL+V
                    pasteHtml();
                    event.cancel();
                    return;
                // Copy
                case CKEDITOR.CTRL + 67: // CTRL+C
                    cutCopyHtml('copy');
                    event.cancel();
                    return;
                // Cut
                case CKEDITOR.CTRL + 88: // CTRL+X
                    editor.fire('saveSnapshot');
                    cutCopyHtml('cut');
                    event.cancel();
                    return;
            }
        }

        function setToolbarStates() {
            if (editor.mode != 'wysiwyg') {
                return;
            }

            editor.getCommand('cut').setState(stateFromNamedCommand('Cut'));
            editor.getCommand('copy').setState(stateFromNamedCommand('Copy'));
            editor.getCommand('paste').setState(stateFromNamedCommand('Paste'));
        }

        function stateFromNamedCommand(command) {

            if (editor.readOnly) {
                return CKEDITOR.TRISTATE_DISABLED;
            }

            if (inReadOnly && command in { Paste: 1, Cut: 1 }) {
                return CKEDITOR.TRISTATE_DISABLED;
            }

            if (command == 'Paste') {
                if (BUFFER) {
                    return CKEDITOR.TRISTATE_OFF;
                } else {
                    return CKEDITOR.TRISTATE_DISABLED;
                }
            } else {
                // Cut, Copy - check if the selection is not empty            
                var sel = editor.getSelection(),
                    ranges = sel.getRanges(),
                    selectionIsEmpty = sel.getType() == CKEDITOR.SELECTION_NONE || (ranges.length == 1 && ranges[0].collapsed);

                return selectionIsEmpty ? CKEDITOR.TRISTATE_DISABLED : CKEDITOR.TRISTATE_OFF;
            }
        }
    }

})();
