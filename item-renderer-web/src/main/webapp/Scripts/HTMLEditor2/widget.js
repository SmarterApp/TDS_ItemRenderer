//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
/*
Widget for CKEditor HTML editor
*/

(function (HTMLEditor, CM) {
    
    HTMLEditor.resolveBaseUrl = CM.resolveBaseUrl.bind(CM);
    HTMLEditor.getLanguage = CM.getLanguage.bind(CM);
    
    function match(page, item, content) {
        if (page.layout == '12') return false; // skip writing layout
        var id = 'editor_' + item.position;
        var el = document.getElementById(id);
        if (el) {
            return new CM.WidgetConfig(id, el);
        }
        return false;
    };

    function Widget_CK(page, item, config) {
        this._editor = null; // ckeditor instance
    }

    CM.registerWidget('htmleditor', Widget_CK, match);

    Widget_CK.prototype.load = function () {

        var item = this.entity;

        // get groups to add for this item (or leave undefined if we should use all groups)
        var addGroups = [];
        if (item.responseType === 'HTMLEditorCustom') {
            if (item.rendererSpec) {
                var xmlButtonGroupsDoc = $.parseXML(item.rendererSpec);
                var $xml = $(xmlButtonGroupsDoc);

                $xml.find('htmlEditor toolbarGroups group').each(function (index, groupEl) {
                    addGroups.push($(groupEl).attr('name'));
                });
            }
        }

        // get groups to remove based on test level accommodations
        var removeGroups = [];
        var page = this.page;
        var accProps = page.getAccProps();
        var buttonGroups = accProps.getHTMLEditorButtonGroups();
        if (buttonGroups.length && buttonGroups[0] != 'TDS_HEBG_None') {
            buttonGroups.forEach(function (groupName) {
                // groupName.substring(9).toLowerCase() below converts accommodation codes to our group names e.g. TDS_HEBG_BasicStyles -> basicstyles
                removeGroups.push(groupName.substring(9).toLowerCase());
            });
        }

        // create ckeditor
        var containerEl = this.element;
        var editor = HTMLEditor.create(containerEl, item.responseType, {
            addGroups: addGroups,
            removeGroups: removeGroups,
            disabled: item.isReadOnly()
        });

        // Used by plugins to detect if we're trying to make the editor more accessible
        if (accProps.isStreamlinedMode()) {
            editor.accessibility = true;
        }

        // hack:
        this._editor = editor; // set instance on widget
        editor.parentItem = item; // set instance on editor

        // check if existing response
        if (item.value) {
            // we use private variable because in editor.js (line 867) 
            // it will use it when loading but won't fire events
            editor._.data = item.value;
        }
    };

    // prevent the content manager menu from showing and use ckeditor's
    Widget_CK.prototype.showMenu = function (contentMenu, evt) {

        var targetNode = YUE.getTarget(evt); // Get node where click came from

        if (targetNode) { // Ensure the click came from a node and not a keyboard event

            // This handles the special case of being an iFrame and clicking outside of the body
            //  as the 'targetNode' will be the HTML document node so we compensate by adjusing the
            // 'targetNode' to be the document's body before checking for a 'cke_editable' below...
            if (targetNode.tagName == 'HTML') {
                var children = targetNode.childNodes;
                for (var i = 0; i < children.length; ++i) {
                    targetNode = children[i];
                    if (targetNode.tagName == 'BODY') {
                        break;
                    }
                }
            }

            // Check to see if 'targetNode' or any of its parents are cke_editable aka
            //  'Did the click come from CKEditor?'
            while (targetNode) {
                if (YUD.hasClass(targetNode, 'cke_editable')) {
                    contentMenu.cancel = true;
                    break;
                } else {
                    targetNode = targetNode.parentNode;
                }
            }
        }
    };

    Widget_CK.prototype.hide = function() {
        // check if html editor has spell check enabled
        var editor = this._editor;
        if (editor &&
            editor.commands &&
            editor.commands.spellchecker &&
            editor.commands.spellchecker.enabled) {
            editor.commands.spellchecker.exec();
        }
    };

    Widget_CK.prototype.isResponseAvailable = function () {
        return this._editor && this._editor.isReady;
    };

    Widget_CK.prototype.getResponse = function () {
        var item = this.entity;
        if (item.isResponseType('PlainTextSpell')) {
            return this.getResponseText();
        } else {
            return this.getResponseHtml();
        }
    };

    Widget_CK.prototype.getResponseHtml = function () {
        var value = this._editor.getData();
        var isValid = (value.length > 0);
        return this.createResponse(value, isValid);
    };

    Widget_CK.prototype.getResponseText = function () {
        var value = this._editor.element.$;
        value = Util.Dom.getTextContent(value);
        var isValid = (value.length > 0);
        return this.createResponse(value, isValid);
    };

    Widget_CK.prototype.setResponse = function (value) {
        var editable = this._editor.editable();
        if (editable) {
            editable.setHtml(value);
        }
    };

    // when an instance of CKEditor is ready apply fixes
    CKEDITOR.on('instanceReady', function (ev) {

        // Settings used when monitoring editor content deletion
        var charNumDiff = TDS.getAppSetting('editor.contentDeletedCharThreshold', 50); // 50 chars default
        var charPctDiff = TDS.getAppSetting('editor.contentDeletedPctThreshold', 10); // 10%
        var deleteLogging = TDS.getAppSetting('editor.contentDeletedLogging', 'none'); // No logging by default

        // Validate so that the min char delta is 30 and the min char % delta is 5. 0 is also valid and turns off that check so that
        //  we could do a charDiff check without a charPct check.
        if (charNumDiff != 0) {
            charNumDiff = Math.max(charNumDiff, 30);
        }
        if (charPctDiff != 0) {
            charPctDiff = Math.max(charPctDiff, 5);
            if (charPctDiff > 100) {
                charPctDiff = 100;
            }
        }
        
        // Convert charPctDiff from an integral percentage (e.g. 40 for 40%) to its true decimal
        //  value (e.g. 0.40 is 40%)
        charPctDiff = charPctDiff / 100;

        var editor = ev.editor;
        if (!editor) {
            return;
        }
        var item = editor.parentItem;
        if (!item) {
            return;
        }
        
        var page = item.getPage();

        // add a entity component compatible blur function 
        /*editor.blur = function () {
            var editable = editor.editable();
            if (editable) {
                editable.$.blur();
            }
        };*/

        // check when editor is focused
        editor.on('focus', function (ev) {
            ContentManager.Menu.hide(); // FB 153609 - Ensure no context menus left open when editor gains focus
            item.setActiveComponent(editor);
        });


        // This code is intended to monitor the student's interaction with the HTML Editor and wanr them if they have removed a sizable amount of content.
        // It works by adding a 'change' event handler for this editor instance that monitors for when either a) the amount of text content decreases by
        //  chrNumDiff characters or b) the percentage of content changes by charPctDiff% characters (but not ridiculouly small amounts such as going from
        //  1 to 0 characters which would be a 100% change).

        (function () {

            // if the editor is disabled then don't check deleted characters
            if (editor.config.disabled) {
                return;
            }

            // We need to keep these variables separate as one is the actual HTML content of the editor that may be used to restore the editor's state 
            //  and the other is the length of the text as we measure based on text changes and not HTML changes
            var lastHtmlContent = '';
            var lastTextLength = 0;

            var deleteLogger = function (contentDeleted, num, pct, prevContent, content) {

                var msg = 'EDITOR DELETE NOTIFICATION (' + contentDeleted + ')';
                var detail = '';
                if (contentDeleted) {
                    detail = num + ' [' + pct * 100 + '%] CHARACTERS DELETED';
                }

                // Only log if the appropriate logging option is enabled
                if ((contentDeleted && (deleteLogging == 'yes' || deleteLogging == 'all')) ||
                (!contentDeleted && (deleteLogging == 'no' || deleteLogging == 'all'))) {
                    TDS.Diagnostics.logServerError(msg, detail);
                    console.warn(msg + ' (' + detail + ')');
                }
            };

            var checkContentChanged = function () {

                // Get editor HTML content
                var editable = editor.editable();
                var html = editable.getHtml();

                // If the editor's content changed...
                if (html != lastHtmlContent) {

                    // Extract the text (not HTML) content of the editor
                    var text = editable.getText();

                    // Compute both the number of characters and % difference between the current state of the editor and the last changed state
                    var diffNum = lastTextLength - text.length;
                    var diffPct = 0;
                    if (lastTextLength > 0 && diffNum > 0) { // If there used to be something in the editor and we now have LESS editor content
                        diffPct = diffNum / lastTextLength;
                    }

                    // If we have exceeded a deletion threshold then prompt the user
                    if ((charNumDiff > 0 && diffNum > charNumDiff) || (charPctDiff > 0 && diffPct > charPctDiff && diffNum > 10)) {

                        var dialog = TDS.Dialog.showPrompt(Messages.getAlt('TDSEditorEventsJS.Label.EditorContentDeleted',
                                'You have removed/deleted a large portion of your content. If this is intentional (e.g. cutting a paragraph of text for pasting somewhere else) ' +
                                'then please click \'Yes\' and we will proceed, otherwise please click \'No\' and your content will be restored. Are you sure you want to do this?'),
                            function () {
                                // Yes... allow content removal... log this!
                                deleteLogger(true, diffNum, diffPct, lastHtmlContent, html);
                                lastHtmlContent = html;
                                lastTextLength = text.length;
                                editor.focus();
                            }, function () {
                                // No... so log and restore editor content to last save point...
                                deleteLogger(false, diffNum, diffPct, lastHtmlContent, html);
                                editable.setHtml(lastHtmlContent);
                                editor.focus();
                            });

                        // FB 163861 - Space bar would immediately dismiss SB so remove focus from any of the dialog buttons so user has to deliberatly
                        //  tab to or click on a button to dismiss the dialog
                        dialog.blurButtons();

                    } else {
                        // Save current state for next time
                        lastHtmlContent = html;
                        lastTextLength = text.length;
                    }
                }
            };

            var editable = editor.editable();

            // CKEditor 'change' events weren't always being received after editor content had changed... the combination of JavaScript 'input'
            //  events for the little changes and CKEditor 'beforeUndoImage' events for the big changes seems to work well.
            //
            // Note: This works in concert with the 'beforeUndoImage' event below. It catches the small changes such as the user typing
            //  a single character at a time, but won't catch programmatic changes to the editor such as deleting a table cell via the
            //  editor's content menu.
            editable.attachListener(editable, 'input', checkContentChanged);

            // We'll use this because anything big that happens in the editor (e.g. deleting a table cell) should also create an undo image, but
            //  we can't do it right away as the image is for the 'old' content and does not reflect the change so we set a timeout.
            //
            // Note: This works in concert with the input event above which catches the granular (aka one letter at a time changes). Without that
            //  it's possible to type stuff "e.g. this is a test", delete that, choose 'No', but to not have the full content restored because
            //  it misses anything prior to the start of the last undo frame.
            editor.on('beforeUndoImage', function (event) {
                setTimeout(checkContentChanged, 1);
            }, editor, null, 100); // Note: 100 is not a time in ms, but is a CKEditor priority

        })();

        // FB 153610 - For streamlined mode we need to augment the editor's toolbar so we can navigate through it via the tab key
        var accProps = page.getAccProps();
        if (accProps && accProps.isStreamlinedMode()) {
            var elEditor = editor.element.$;
            var $Editor = $(elEditor);
            $Editor.find('.cke_toolbox a').attr('tabindex', '0'); // All toolbar buttons should have a tabindex of 0
            $Editor.find('.cke_top').prepend('<a href="#" class="skipTools" tabindex="0">Skip Formatting tool bar</a>'); // Add skip link
            $Editor.find('.cke_combo__languages').parent().addClass('spellcheckGroup');

            // Add a keyhandler for the skipTools link for processing enter, space, and tab key navigation
            $Editor.find('.skipTools').keydown(function(event) {
                if (!event.shiftKey && !event.ctrlKey && !event.altKey && !event.metaKey) { // We only want unmodified keys
                    switch (event.keyCode) {
                    case 9: // Tab
                        // Tab on skip link should navigate to the toolbar
                        editor.execCommand('toolbarFocus');
                        return false;
                    case 32: // Spacebar
                    case 13: // Enter
                        // Space/enter on skiplink should skip the toolbar and send focus to the editor
                        editor.focus();
                        return false;
                    default:
                        break;
                    }
                }
                return true;
            });

            editor.setKeystroke(CKEDITOR.SHIFT + 9 /*Tab*/, "toolbarFocus"); // Shift-Tab in editor should set focus back on the toolbar

            // Override the key handlers for all of the editor's toolbar buttons
            editor.toolbox.toolbars.forEach(function(toolbar) {
                toolbar.items.forEach(function (tbItem) {
                    // Replace key handler for a single button
                    var oldOnkeyHandler = tbItem.onkey;
                    tbItem.onkey = function(tbButton, keycode) {
                        // If Shift-Tab if pressed in the first toolbar group then move focus back to the skipTools link and if Tab is pressed
                        //  in the last toolbar group then change key to Escape so we cleanly exit the toolbar and
                        //  return focus to the editor. The .first()/.last().find() clauses below basically checks to see if the element that received the
                        //  keypress is contained in the first/last toolbar group.
                        var $toolbar = $Editor.find('.cke_toolbox .cke_toolbar');
                        if (keycode === 2228233 /*Shift+Tab*/ && $toolbar.first().find('#' + tbButton.id).length > 0) {
                            $Editor.find('.skipTools').focus();
                            return false;
                        } else if (keycode === 9 /*Tab*/ && $toolbar.last().find('#' + tbButton.id).length > 0) {
                            keycode = 27;
                        }
                        return oldOnkeyHandler(tbButton, keycode); // Call the original handler
                    };
                });
            });
        }

        // add item component
        item.addComponent(editor);

        // if the editor has the same document object as
        // main document then don't apply iframe fixes
        var doc = editor.document.$;
        var win = editor.document.getWindow().$;
        if (doc == document) return;

        // add menu fixes to the editors iframe
        CM.Menu.applyDocFix(win);

        // Add title to iFrame for WCAG
        var $iFrame = $(editor.container.$).find('iframe');
        $iFrame.attr('title', 'Rich Text Editor');

        // Register this iFrame
        CM.registerFrame($iFrame[0]);

        // add content manager events into editor
        CM.addMouseEvents(item, doc);
        CM.addKeyEvents(doc);

        // check if this is mobile device
        if (Util.Browser.isTouchDevice()) {
            CM.listenForFocus(doc);
        }

        // add accommodations to iframe 
        // TODO: add this code for event 'dataReady' when more time to test
        if (doc.body) {
            var pageAccommodations = page.getAccommodations();
            pageAccommodations.applyCSS(doc.body);
        }

        // add zoom
        var zoom = page.getZoom();
        zoom.addDocument(doc);
        zoom.refresh();
    });

})(HTMLEditor, ContentManager);
