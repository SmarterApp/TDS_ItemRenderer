//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
/*
This code in this file is for showing the comments dialog and saving them.
NOTE: I only use the comments accommodation at the test level and not for segments.
*/

(function (TS) {

    // check if notes lib is loaded
    if (!TDS.Notes) {
        TS.Comments = {
            init: function () {
                console.warn('The notes library was not installed');
            }
        };
        return;
    }

    TS.Comments = {
        Type: {
            //DB Mapping to defaults.
            None: 0,
            DropDown: 1,
            TextArea: 2,
            ScratchPad: 3
        },

        init: function () {
            //Setup the configuration that is later used by the TDS.Notes.Factory
            TDS.Config.NotesConfig = TS.Comments.parseConfiguration();

            //Setup the event listeners for dealing with load & Save events.
            TS.Comments.setupEvents();
        },

        parseConfiguration: function () {
            return {
                // TODO: This needs to actually allow us to configure notes on the global level
                GlobalClass: TDS.Notes.Types.TextArea, //Same as current implementation
                GlobalLabel: Messages.getAlt('TestShell.Comments.Global', 'Global Notes'),
                DefaultClass: TS.Comments.getType(),
                DefaultLabel: ContentManager.getCommentLabel()
            };
        },

        setupEvents: function () {
            TDS.Notes.Events.Load.subscribe(TS.Comments.load);
            TDS.Notes.Events.Save.subscribe(TS.Comments.save);

            //Ensure that each page detects its own default comments / notes functionality
            //for the item level.  Note that GLOBAL notes are global and only can be
            //initialized one time.
            ContentManager.onPageEvent('show', function () {
                var cfg = TDS.Notes.getFactory().getConfig();
                cfg.DefaultClass = TS.Comments.getType();
                cfg.DefaultLabel = ContentManager.getCommentLabel();
            });
        },

        load: function (type, args) {
            //Note that there is no load function for the item level notes, they save but there is 
            //not a load function available?
            TDS.Notes.Debug && console.log("Attempting to load saved notes: (type, args)", type, args);
            args = args && args.length ? args[0] : null;

            // show progress screen (TODO, test)
            TS.xhrManager.getOppComment(function (id, response) {
                if (response && response.data) {
                    args.cb(response.data);
                }
            });
        },

        saveGlobal: function (args) {
            var testee = TDS.Student.Storage.getTestee();
            var commentData = {
                testeeKey: testee.key,
                testeeToken: testee.token,
                type: args.data.type,
                comment: args.data.comment
            };
            TS.xhrManager.recordOppComment(commentData, args.cb);
        },

        /*
        EXAMPLE:
        {
            data: {
                comment 'Misspelled word in question',
                type: 'DropDown'
            },
            id: '1_notes',
            cb: function() {}
        */
        saveItem: function (args) {

            // parse the position out of the id (TODO: we should rethink why we need to do this?) 
            var position = (args.id.replace('_notes', '') * 1);
            var text = args.data.comment;
            var testee = TDS.Student.Storage.getTestee();

            // submit data to server
            var commentData = {
                position: position,
                comment: text,
                testeeKey: testee.key,
                testeeToken: testee.token
            };

            TS.xhrManager.recordItemComment(commentData, args.cb);
        },

        save: function (type, args) {
            args = args && args.length ? args[0] : null;
            if (!args) {
                console.error("Cannot save notes without information (type, args)", type, args);
                return;
            }

            // check if the comment is global or item
            if (args.id == TDS.Notes.Types.Global) {
                TS.Comments.saveGlobal(args);
            } else {
                TS.Comments.saveItem(args);
            }
        },

        showGlobal: function () {
            var notes = TDS.Notes.open(TDS.Notes.Types.Global);
            notes.load();
        },

        hide: function () {
            TDS.Notes.closeAll();
        },

        isShowing: function () {
            //Called from UI, deprecate
        },

        getType: function () {
            var commentCode = ContentManager.getCommentCode();
            if (commentCode != null) {
                if (commentCode == 'TDS_SCDropDown') {
                    return TDS.Notes.Types.DropDown;
                } else if (commentCode == 'TDS_SCTextArea' || commentCode == 'TDS_SCNotepad') {
                    return TDS.Notes.Types.TextArea;
                } else if (commentCode == 'TDS_SCScratchpad') {
                    return TDS.Notes.Types.ScratchPad;
                }
            }
            return TDS.Notes.Types.None;
        }
    };

    ContentManager.onPageEvent('beforeHide', function () {
        TS.Comments.hide();
    });

    function load() {

        // intialize comment input
        TS.Comments.init();

        TS.UI.addClick('btnGlobalNotes', function() {
            TS.Comments.showGlobal();
        });
    }

    TS.registerModule({
        name: 'comments',
        load: load
    });

})(TestShell);
