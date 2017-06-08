//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
﻿(function(TS) {

    // configure save options
    // set saving options
    // allowImplicitSave: allow navigate away and save automatically
    // allowExplicitSave: allow save button to show
    function setSaveOptions(contentItem, options) {

        var type = contentItem.responseType.toLowerCase();
        var format = contentItem.format.toLowerCase();

        /*
        Options:
        auto = timer
        implicit = next/back
        explicit = manual
        focusChange = item change
        */

        if (type == 'grid' || type == 'scratchpad') {
            options.auto = false;
            options.implicit = true;
            options.explicit = true;
            options.focusChange = true;
        } else if (type == 'simulator') {
            options.auto = false;
            options.implicit = true;
            options.explicit = true;
            options.focusChange = false;
        } else if (type == 'microphone') {
            options.auto = false;
            options.implicit = true;
            options.explicit = true;
            options.focusChange = false;
        } else if (format == 'mc' || format == 'si' /* scoring entry */) {
            // NOTE: MC sends responses in real time
            options.auto = false;
            options.implicit = false;
            options.explicit = false;
            options.focusChange = false;
        } else if (format == 'eq' /* equation editor */) {
            options.auto = false;
            options.implicit = true;
            options.explicit = true;
            options.focusChange = true;
        } else if (format == 'asi' /* scaffolding */) {
            options.auto = false;
            options.implicit = true;
            options.explicit = false;
            options.focusChange = true;
        } else if (format == 'generic instruction') { // instructional item
            options.auto = false;
            options.implicit = true;
            options.explicit = false;
            options.focusChange = true;
        } else if (type == 'na') { /* no response type specified so nothing to save */
            options.auto = false;
            options.implicit = false;
            options.explicit = false;
            options.focusChange = false;
        } else {
            options.auto = true;
            options.implicit = true;
            options.explicit = true;
            options.focusChange = true;
        }
    }

    var Item = function (page) {
        this.page = page;
        this.id = null;
        this.bankKey = 0;
        this.itemKey = 0;
        this.position = 0;
        this.sequence = 0;
        this.mark = false;
        this.isSelected = false;
        this.isRequired = false;
        this.isValid = false;
        this.value = null;
        this.comment = '';
    };

    // get the content item
    Item.prototype.getContentItem = function () {
        if (this.page) {
            var contentPage = this.page.getContentPage();
            if (contentPage) {
                return contentPage.getItem(this.position);
            }
        }
        return null;
    };

    // get the save options for this item type
    Item.prototype.getSaveOptions = function () {
        var options = {
            auto: false,
            implicit: false,
            explicit: false,
            focusChange: false
        };
        var contentItem = this.getContentItem();
        if (contentItem) {
            setSaveOptions(contentItem, options);
        }
        return options;
    }

    // Reset the response data structure.
    // NOTE: this should get called only after this has been done on the server.
    Item.prototype.reset = function () {
        // in the database, reset:
        //   1) flags existing responses as removed
        //   2) inserts a new response with a NULL value
        // we need to increment sequence to reflect the new NULL response value
        ++this.sequence;

        this.value = null;
        this.isSelected = false;
        this.isValid = false;
        this.mark = false;
        this.comment = '';
    };

    // manually set the students response
    Item.prototype.setValue = function (data) {
        this.value = data;
        this.isValid = true;
        this.isSelected = true;
    };

    // gets the last response saved (NULL means never responded)
    Item.prototype.getLastValue = function () {

        // last response for this item attempted to be sent to the server
        if (this.value != null) {
            return this.value;
        }

        // original response for this item when it was first loaded
        var contentItem = this.getContentItem();
        if (contentItem) {
            return contentItem.value;
        }
        return null;
    };

    // checks if this resposne has been answered
    Item.prototype.isAnswered = function () {
        return (this.isSelected && this.isValid);
    };

    // checks if this item has a response to save
    Item.prototype.isDirty = function () {

        // make sure we have an item
        var contentItem = this.getContentItem();
        if (!contentItem) {
            return false;
        }

        // HACK: MC
        if (contentItem.format.toLowerCase() == 'mc') {
            return false;
        }

        // HACK: audio recorder
        if (contentItem.recorder) {
            var recorderObj = TDS.Audio.Widget.getRecorder(contentItem.recorder);
            if (recorderObj) {
                return recorderObj.dirty;
            }
        }

        // get the widgets response handler
        var response = contentItem.getResponse();
        if (!response) {
            return false;
        }

        // get responses
        var currentValue = response.value; // current response for this item that the student has made
        var lastValue = this.getLastValue(); // last response

        // check if isselected has changed
        if (response.isSelected != this.isSelected) {
            return true;
        }

        // if we never responded and the response is empty then don't save anything
        if (lastValue == null && response.empty) {
            return false;
        }

        // check if the current response is different than the previous response
        return (currentValue != lastValue);
    };

    // attempt to undo a response made (NOTE: only recorded audio is supported, this should go in ContentManager at some point)
    Item.prototype.undo = function () {

        var contentItem = this.getContentItem();
        if (!contentItem || !contentItem.recorder) {
            return false;
        }

        var previousResponse = this.getLastValue(); // last response

        // if there is a previous response then unload current one and load the previous one
        if (previousResponse != null) {
            Util.log('recorder: undo - loadBase64Audio');
            TDS.Audio.Recorder.loadBase64Audio(contentItem.recorder.id, previousResponse);
            // item.recorder.unloadAudioClip();
            // item.recorder.loadBase64Audio(previousResponse);
        }

        return true;
    };

    Item.prototype.toString = function () {
        return (this.position != null) ? this.position.toString() : '';
    };

    // ItemResponseUpdate.cs
    Item.Status = function () {
        this.position = 0;
        this.sequence = 0;
        this.status = ''; // success == 'updated'
        this.reason = '';
    };

    TS.Item = Item;

    // TODO: Why do we have this global??
    window.getResponseIDs = function(responses) {
        return Util.Array.reduce(responses, '', function(text, response) {
            return text + ((text.length == 0) ? '' : ', ') + response.position;
        });
    };

})(TestShell);

