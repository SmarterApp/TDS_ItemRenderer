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

        // hack:
        this._editor = editor; // set instance on widget
        editor.parentItem = item; // set instance on editor

        // check if existing response
        if (item.value) {
            // we use private variable because in editor.js (line 867) 
            // it will use it when loading but won't fire events
            editor._.data = item.value;
        }
    }

    // prevent the content manager menu from showing and use ckeditor's
    Widget_CK.prototype.showMenu = function (contentMenu, evt) {

        var targetNode = YUE.getTarget(evt); // Get node where click came from

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
    }

    Widget_CK.prototype.getResponse = function() {
        var item = this.entity;
        if (item.isResponseType('PlainTextSpell')) {
            return this.getResponseText();
        } else {
            return this.getResponseHtml();
        }
    }

    Widget_CK.prototype.getResponseHtml = function () {
        var value = this._editor.getData();
        var isValid = (value.length > 0);
        return this.createResponse(value, isValid);
    }

    Widget_CK.prototype.getResponseText = function () {
        var value = this._editor.element.$;
        value = Util.Dom.getTextContent(value);
        var isValid = (value.length > 0);
        return this.createResponse(value, isValid);
    }

    Widget_CK.prototype.setResponse = function(value) {
        this._editor.setData(value);
    }

    // when an instance of CKEditor is ready apply fixes
    CKEDITOR.on('instanceReady', function (ev) {

        var editor = ev.editor;
        if (!editor) {
            return;
        }
        var item = editor.parentItem;
        if (!item) {
            return;
        }
        
        // add a entity component compatible blur function 
        /*editor.blur = function () {
            var editable = editor.editable();
            if (editable) {
                editable.$.blur();
            }
        };*/

        // check when editor is focused
        editor.on('focus', function (ev) {
            item.setActiveComponent(editor);
        });

        // add item component
        item.addComponent(editor);

        // if the editor has the same document object as
        // main document then don't apply iframe fixes
        var doc = editor.document.$;
        var win = editor.document.getWindow().$;
        if (doc == document) return;

        // add menu fixes to the editors iframe
        CM.Menu.applyDocFix(win);

        // add content manager events into editor
        CM.addMouseEvents(item, doc);
        CM.addKeyEvents(doc);

        // check if this is mobile device
        if (Util.Browser.isTouchDevice()) {
            CM.listenForFocus(doc);
        }

        var page = item.getPage();

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
