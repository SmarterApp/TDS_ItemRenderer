AsiItem = (typeof (AsiItem) == "undefined") ? {} : AsiItem;

AsiItem.EventLog = function(str) {
    if (AsiItem.EventLog.enabled) {
        ContentManager.log('ASI: ' + str);
    }
};

AsiItem.EventLog.enabled = true;

// Renderer.  Render the html in the document and start the 
// animation/audio
AsiItem.Html = function (parser, parentDiv) {
    this._parentDiv = parentDiv;
    this._parser = parser;
    this._stemCell = parser.stem;// document.createElement('div');
    this.setSpanId(this._stemCell, 'asiStem');
};

AsiItem.Html.prototype.getStemCell = function () {
    return this._stemCell;
};

AsiItem.Html.prototype.getParentDiv = function() {
    return this._parentDiv;
};
//////////////////////////////
// This section of the file contains true HTML code, that does 
// things with DOM or content.
////////////////////////////////////////

// Hide any showing responses as if they had never been shown.
AsiItem.Html.prototype.resetInteractions = function(responseSpanIds) {
    for (var i = 0; i < responseSpanIds.length; ++i) {
        YUD.addClass(responseSpanIds, 'asi-response-hidden');
        YUD.removeClass(responseSpanIds, 'asi-response-shown');
        YUD.removeClass(responseSpanIds, 'asi-response-subdued');
    }
};

// The logic has picked a response.  Hide it and show the feedback span.
AsiItem.Html.prototype.showFeedbackHideResponse = function (fSpan, rSpan) {
    var region = YUD.getRegion(rSpan);
    YUD.removeClass(rSpan, 'asi-response-shown');
    YUD.removeClass(fSpan, 'asi-response-hidden');
    YUD.addClass(rSpan, 'asi-response-hidden');
    YUD.addClass(fSpan, 'asi-feedback-shown');
    YUD.setStyle(fSpan, 'width', region.width.toString() + 'px');
    YUD.setStyle(fSpan, 'height', region.height.toString() + 'px');
};

// Create the audio button widget for this item.
AsiItem.Html.prototype.createAudioButton = function () {
    var audioWidget = document.createElement('button');
    audioWidget.type = 'button';
    this.setPlayIcon(audioWidget);
    YUD.addClass(audioWidget, 'asi-playback-span');
    // Don't show the sound waves until the sound plays
    // YUD.addClass(audioWidget, 'asi-stop-button');
    return audioWidget;
};

// Put the big 'play' button on the stem.
AsiItem.Html.prototype.allowInteractiveGui = function () {
    YUD.addClass(this._stemCell, 'stemContainer contextAreaFocus asi-stem');
};

// Logic to toggle the play/stop button status.
AsiItem.Html.prototype.setPlayIcon = function (widget) {
    // fix closed branch
    AsiItem.EventLog('setPlayIcon');
    YUD.removeClass(widget, 'asi-stop-button');
    YUD.addClass(widget, 'asi-playback-button');
    YUD.removeClass(widget, 'asi-response-subdued');
};

// Sometimes student can't control audio, disable the 
// play button and try to make it less confusing
AsiItem.Html.prototype.subduePlayIcon = function (widget) {
    AsiItem.EventLog('subduePlayIcon');
    YUD.addClass(widget, 'asi-response-subdued');
};

// Logic to toggle the play/stop button status.
AsiItem.Html.prototype.setStopIcon = function (widget) {
    AsiItem.EventLog('setStopIcon');
    YUD.removeClass(widget, 'asi-playback-button');
    YUD.addClass(widget, 'asi-stop-button');
    YUD.removeClass(widget, 'asi-response-subdued');
};

// Add the 'enabled' classes to all the responses.
AsiItem.Html.prototype.enableResponses = function (responseArray) {
    AsiItem.EventLog('enableResponses');
    for (var i = 0; i < responseArray.length; ++i) {
        var span = YUD.get(responseArray[i]);
        AsiItem.EventLog('enableResponses span ' + YUD.getAttribute(span, 'id'));
        YUD.removeClass(span, 'asi-response-subdued');
        YUD.removeClass(span, 'asi-response-emphasis');
        YUD.addClass(span, 'asi-response-enabled');

        // Enable play button if it has been greyed out.
        var audioResponse = this.getAudioSpanFromResponseSpan(span);
        if (audioResponse) {
            YUD.removeClass(audioResponse, 'asi-response-subdued');
            YUD.removeClass(audioResponse, 'asi-stop-button');
            YUD.addClass(audioResponse, 'asi-playback-button');
        }
        
        // Restore play buttons to quiet state
        
    }
};

// Emphasize the resposne while we are playing some audio
AsiItem.Html.prototype.emphasizeResponse = function(span) {
    YUD.addClass(span, 'asi-response-emphasis');
    YUD.addClass(span, 'asi-response-shown');
    YUD.removeClass(span, 'asi-response-subdued');
    YUD.removeClass(span, 'asi-response-hidden');
};

// Add the 'disabled' classes to all the responses.
AsiItem.Html.prototype.disableResponses = function (responseArray) {
    AsiItem.EventLog('disableResponses');
    for (var i = 0; i < responseArray.length; ++i) {
        var span = YUD.get(responseArray[i]);
        AsiItem.EventLog('disableResponses span ' + YUD.getAttribute(span, 'id'));
        YUD.removeClass(span, 'asi-response-enabled');
        YUD.removeClass(span, 'asi-response-emphasis');
    }
};

// Grey out a span to indicate that you can't interact with it.
AsiItem.Html.prototype.subdueSpan = function (span) {
    YUD.addClass(span, 'asi-response-subdued');
    YUD.removeClass(span, 'asi-response-emphasis');
};

// Grey out the responses.
AsiItem.Html.prototype.subdueResponses = function (responseArray) {
    AsiItem.EventLog('subdueResponses');
    for (var i = 0; i < responseArray.length; ++i) {
        var span = YUD.get(responseArray[i]);
        AsiItem.EventLog('subdue span ' + YUD.getAttribute(span, 'id'));
        this.subdueSpan(span);
    }
};

/////////////////////////////////
// Code that looks things up in the DOM, or creates spans in the DOM.
/////////////////////////////////

// Utility so that spans have a correct naming conventions.
AsiItem.Html.prototype.createSpanId = function (purpose) {
    return AsiItem.Html.createSpanId(this._parser.mid, purpose);
};

// Utility so that spans have a correct naming conventions.
AsiItem.Html.prototype.setSpanId = function (stemDiv, purpose) {
    AsiItem.Html.setSpanId(stemDiv, this._parser.mid, purpose);
};

// Static version of the same thing, can be used outside of html
AsiItem.Html.createSpanId = function (itemId, purpose) {
    return 'asi-' + itemId.toString() + '-' + purpose;
};

// Static version of the same thing, can be used outside of html
AsiItem.Html.setSpanId = function (spanId, itemId, purpose) {
    YUD.setAttribute(spanId, 'id', AsiItem.Html.createSpanId(itemId, purpose));
};

// Response span looks like this:
// asi-4-response-0 where the last number is the 
// response index.
AsiItem.Html.prototype.getResponseIndex = function (span) {
    var id = '';
    if (typeof (span) == "string") {
        id = span;
    } else {
        id = YUD.getAttribute(span, 'id');
    }
    var idSplit = id.split('-');

    if (idSplit.length >= 4) {
        return idSplit[3];
    }
    return '';
};

// Given a response span, return the feedback span, if any.
// Based on the span ID naming convention.
AsiItem.Html.prototype.getRelatedFeedbackSpan = function (span) {
    var fid = AsiItem.Html.createSpanId(this._parser.mid, 'feedback-' + this.getResponseIndex(span));
    var fspan = YUD.get(fid);
    return fspan;
};

// Get the span associated with a certain identifier (A, B etc.) since this 
// is esentially a MC question format.
AsiItem.Html.prototype.getResponseSpanFromIdentifier = function (identifier) {
    var choiceContent = this._parser.asiContent.choices;
    for (var i = 0; i < choiceContent.length; i++) {
        var choice = choiceContent[i];
        if (choice.identifier == identifier) {
            var spid = this.createSpanId('response-' + i.toString());
            return YUD.get(spid);
        }
    }
    return null;
};

// Get the audio span (play button) from the response span to change it's css
AsiItem.Html.prototype.getAudioSpanFromResponseSpan = function (responseSpan) {
    var id = responseSpan;
    if (typeof (responseSpan) == 'object') {
        id = responseSpan.id;
    }
    var rindex = this.getResponseIndex(id);
    var responseAudioSpanIndex = this.createSpanId('audioResponse-' + rindex);
    var responseAudioSpan = YUD.get(responseAudioSpanIndex);
    return responseAudioSpan;
};



