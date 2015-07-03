//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
﻿/*
Contains the TDS module code for hooking up WordList widget.
*/

(function(CM) {

    // process an entities word list tags
    function processEntity(page, entity) {

        // CM.log("Word List: processing " + entity.getID());

        // Global WL accommodation not enabled, don't tag spans.
        if (WordListPanel.IsWordListEnabled() == false) {
            return;
        }

        // get word list resource
        var wordListResource = entity.getResource('wordList');
        if (wordListResource == null) {
            return;
        }

        var inst = new WordListItem();
        inst.wl_res = wordListResource; // we need to do this for event handlers that don't have item context
        entity.wordList = inst;
        var elements = entity.getElement();
        //inst.TagSpans(page, entity);
        inst.TagSpans(elements);

        // Create the word list placeholder if it does not exist.  This only needs to be 
        // done once, after the test shell page is rendered.
        if (WordListPanel.toolDiv == null) {
            WordListPanel.InitializePane();
        }
    }

    // Listen for when passage and items become available.
    // Bug #111668: We need to listen for passage/item individually since entity is before some items render
    CM.onPassageEvent('available', processEntity);
    CM.onItemEvent('available', processEntity);

    // Allow user to tab through the word list options.  Ctrl-x selects
    // words and tabs through them, once an item has the focus release
    // displays the word list.
    CM.onEntityEvent('keyevent', function (page, entity, evt) {
        var inst = entity.wordList;
        if (inst) {
            if (inst.HandleKey(evt)) {
                // stop event so we don't get 2.
                YUE.stopEvent(evt);
            }
        }
    });

    // If we are showing a new page, hide any showing word list pane since
    // it probably doesn't apply to the current page.
    CM.onEntityEvent('hide', function (page, entity) {
        if (WordListPanel && WordListPanel.panel) {
            WordListPanel.panel.hide();
        }
    });

})(ContentManager);

