(function(TS) {

    // configure save options
    // set saving options
    // allowImplicitSave: allow navigate away and save automatically
    // allowExplicitSave: allow save button to show
    function setSaveOptions(contentItem, options) {

        var type = contentItem.responseType.toLowerCase();
        var format = contentItem.format.toLowerCase();

        if (type == 'grid' || type == 'simulator' || type == 'scratchpad') {
            options.auto = false;
            options.implicit = true;
            options.explicit = true;
        } else if (type == 'microphone') {
            options.auto = false;
            options.implicit = true;
            options.explicit = true;
        } else if (format == 'mc' || format == 'si' /* scoring entry */) {
            options.auto = false;
            options.implicit = false;
            options.explicit = false;
        } else if (format == 'eq' /* equation editor */) {
            options.auto = false;
            options.implicit = true;
            options.explicit = true;
        } else if (format == 'asi' /* scaffolding */) {
            options.auto = false;
            options.implicit = true;
            options.explicit = false;
        } else if (type == 'na') { /* no response type specified so nothing to save */
            options.auto = false;
            options.implicit = false;
            options.explicit = false;
        } else {
            options.auto = true;
            options.implicit = true;
            options.explicit = true;
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
        this.prefetched = false;

        this.value = null;
        this.comment = '';
    };

    // get the content item
    Item.prototype.getContentItem = function () {
        var contentPage = this.page.getContentPage();
        if (contentPage) {
            return contentPage.getItem(this.position);
        }
        return null;
    };

    // get the save options for this item type
    Item.prototype.getSaveOptions = function () {
        var options = {
            auto: false,
            implicit: false,
            explicit: false
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
        this.sequence = 0;
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

        // if the response has never been saved the handler has empty string (empty textarea) and the items original value is null, then nothing has changed
        if (lastValue == null && (currentValue == null || currentValue.length == 0 || !response.isValid)) {
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

