//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
﻿////////////////////////////////
// Program logic.  Handles all the interactions that ASI item supports.
////////////////////////////////

AsiItem.Interaction = function (asiHtmlObject, parser, voiceGuidance) {
    this._html = asiHtmlObject;
    this._parser = parser;

    this._voiceGuidance = voiceGuidance;
    
    this._playSourceFromResponse = false;

    // AsiItem.AudioInterface
    this._player = null;
    this._responsePlayer = null;

    this._isPlaying = false;
    this._isResponsePlaying = false;
    this._isFeedbackPlaying = false;
    
    this._attempts = [];

    this._terminateEvent = new YAHOO.util.CustomEvent('onTerminate', this);

    this._responseSpanIds = [];

    this.complete = false;
    this.responsesLeft = parser.maxAttempts;


    // provide a default
    this.isReadOnly = function() { return false; };

    this._html.setSpanId(this._stemCell, 'asiStem');

    this._playbackInfo = {
        stemId: YUD.getAttribute(this._html.getStemCell(), 'id'),
        stemAudio: parser.asiContent.stem.audioCue,
        playStemAudio: true,
        responseAudio: []
    };

    // Span IDs in the rendered document, to be filled in later.
    this._terminalSpanIds = [];
    this._spanToIdentifierMap = [];

    this.audioWidget = null;
    this._responseButtons = [];

    // We treat the first time we play this item differently
    this.hasPlayedOnce = false;

    // Audio for the feedback responses
    this._feedbackCues = {};

    // Actual response Identifiers
    this._responseIdentifiers = [];

    //instance of Factory
    this._audioFactory = new AsiItem.AudioPlayerFactory();
};

//////////////////////////////////
// These functions interact with the test shell (module).
//////////////////////////////

// The page is being hidden. Stop any audio and 
// reset the GUI to a non-audio state.
AsiItem.Interaction.prototype.hidePage = function () {
    if (this.complete)
        return;
    if (this._isPlaying && this._player) {
        this._player.stop();
        this._player.dispose();
        this._player = null;
        this._isPlaying = false;
    }
    if (this._isResponsePlaying && this._responsePlayer) {
        this._responsePlayer.stop();
        this._responsePlayer.dispose();
        this._responsePlayer = null;
        this._isResponsePlaying = false;
    }

    // If we have never heard the complete audio, just reset the 
    // question to its original state.
    if (this._voiceGuidance) {
        if (this.hasPlayedOnce) {
            this._html.enableResponses(this._responseSpanIds);
        } else {
            this._html.resetInteractions(this._responseSpanIds);
        }
        this._html.setPlayIcon(this.audioWidget);
    }
};

// The item has been loaded.  Allow student interaction.
// Called by the module when the item is parsed and ready.
AsiItem.Interaction.prototype.startInteraction = function (valueToRestore) {

    //ensure audio is preloaded
    if (this._voiceGuidance) {
        //Collect all audio references for the current item such as Stem, Response and Feedback
        var playerContent = [];

        //insert stem audio
        var stemId = YUD.getAttribute(this._html.getStemCell(), 'id');
        var stemAudio = this._parser.asiContent.stem.audioCue;
        var track = {
            id: stemId,
            url: stemAudio,
            audioData: null
        };
        playerContent.push(track);

        //insert response and feedback audio
        var choiceContent = this._parser.asiContent.choices;
        for (var i = 0; i < choiceContent.length; i++) {

            var respSpanId = this._html.createSpanId('response-' + String.fromCharCode(65 + i));
            track = {
                id: respSpanId,
                url: choiceContent[i].audioCue,
                audioData: null
            };

            //push the new track
            playerContent.push(track);

            //add feedback if any
            // Bug 162614: add the feedback audio to the feedback span, not the 
            // cue audio a second time.
            if (choiceContent[i].feedback &&
                choiceContent[i].feedback.audioCue) {
                var feedbackSpanId = this._html.createSpanId('feedback-' + i.toString());
                track = {
                    id: feedbackSpanId,
                    url: choiceContent[i].feedback.audioCue,
                    audioData: null
                };
                playerContent.push(track);
            }
        }

        //if audio is all loaded then build item html
        var self = this;
        this._audioFactory.onReady(playerContent, function () {
            //start interaction
            self.constructAudioTag(self._html.getStemCell());

            self.populateResponses(self._parentDiv);
            self._html.allowInteractiveGui();
            self._playSourceFromResponse = false;

            // Bug 117669 - restore after item has been rendered, and sounds have been downloaded.
            if (valueToRestore) {
                self.setResponse(valueToRestore);
            }
        });
    } else {
        //if no Audio then start interaction        
        this.populateResponses(this._parentDiv);
        this._html.allowInteractiveGui();

        // Bug 117669 - restore after item has been rendered, and sounds have been downloaded.
        if (valueToRestore) {
            this.setResponse(valueToRestore);
        }
    }
};

// This originally auto-played the story.  But since IPad doesn't 
// autoplay we disabled it all around.
AsiItem.Interaction.prototype.playStory = function () {
    AsiItem.EventLog('AsiItem.Interaction.prototype.playStory');

    // Since IOS doesn't autoplay, we just don't autoplay on any platform.
    this._html.setPlayIcon(this.audioWidget);
    // this.playAudio(this._playbackInfo);
};

// Get the responses that the user has picked so far.
AsiItem.Interaction.prototype.getResponse = function () {
    return this._responseIdentifiers.join(' ');
};

// Restore the GUI to reflect the saved responses.
AsiItem.Interaction.prototype.setResponse = function (value) {
    var values = value.split(' ');

    // We have some saved responses.  Deal.
    this.hasPlayedOnce = true;
    this.displayResponses(this._responseSpanIds);
    this._html.enableResponses(this._responseSpanIds);

    for (var i = 0; i < values.length; ++i) {
        var span = this._html.getResponseSpanFromIdentifier(values[i]);
        if (span) {
            // Store the response for future getters
            this._responseIdentifiers.push(values[i]);

            var fSpan = this._html.getRelatedFeedbackSpan(span);
            if (fSpan) {
                this.responsesLeft--;

                this._html.showFeedbackHideResponse(fSpan, span);
                if (this._terminalSpanIds[YUD.getAttribute(span, 'id')] || this.responsesLeft == 0) {
                    this.complete = true;
                    this.terminateInteraction();
                }
            }
        }
    }
};

AsiItem.Interaction.prototype.onTerminate = function (callback) {
    this._terminateEvent.subscribe(callback, this);
};

// The item is complete.  Make it so the user can't interact with the item anymore.
AsiItem.Interaction.prototype.terminateInteraction = function () {
    this._html.subdueResponses(this._responseSpanIds);
    this._html.disableResponses(this._responseSpanIds);
    this._html.subduePlayIcon(this.audioWidget);
    this._terminateEvent.fire();

    // This free's the audio buffers that are preloaded by the Web Audio API
    if (this._player && this._player._tracksToPlay) {
        var tracks = this._player._tracksToPlay;
        for (var i = 0; i < tracks.length; i ++) {
            var track = tracks[i];
            if (AsiItem.WAPIAudioInterface.audioDataHash[track.url]) {
                delete AsiItem.WAPIAudioInterface.audioDataHash[track.url];
            }
        }
    }
};

// Add the play button to the document.
AsiItem.Interaction.prototype.constructAudioTag = function (parentDiv) {
    var audioWidgetSpan = document.createElement('span');
    this.audioWidget = this._html.createAudioButton();
    audioWidgetSpan.appendChild(this.audioWidget);
    parentDiv.appendChild(audioWidgetSpan);

    YUE.addListener(audioWidgetSpan, 'click', AsiItem.Interaction.handlePlayAudioButton, this);
};

// The user has clicked on one of the answers, process the response.
AsiItem.Interaction.prototype.processResponse = function (span) {

    if (this._isPlaying || this._isResponsePlaying || this._isFeedbackPlaying) {
        return;
    }

    this.responsesLeft--;

    // Find the span that was clicked.
    var spid = YUD.getAttribute(span, 'id');
    this._responseIdentifiers.push(this._spanToIdentifierMap[spid]);

    // Is this the right answer?  If so we're done.
    if (this._terminalSpanIds[spid]) {
        this.complete = true;
        this.terminateInteraction();
    } else if ((this.complete == false) && (this.responsesLeft == 0)) {
        // User has chosen all the incorrect responses.  Don't allow any more
        // interaction per the requirements.
        this.complete = true;
        this.terminateInteraction();
    }

    // Otherwise, provide the feedback for this span.

    var fspan = this._html.getRelatedFeedbackSpan(span);
    if (fspan && (this.complete != true)) {
        var fid = YUD.getAttribute(fspan, 'id');
        this._html.showFeedbackHideResponse(fspan, span);

        // Play the audio for the span, then replay the base audio.
        if (this._feedbackCues[fid]) {
            this._isFeedbackPlaying = true;
            this._html.subdueResponses(this._responseSpanIds);
            this._html.disableResponses(this._responseSpanIds);
            this._html.subduePlayIcon(this.audioWidget);
            var hap = this._audioFactory.createAudioInterface();
            hap.add(this._feedbackCues[fid], fid, function() {}, AsiItem.Interaction.handleEndFeedbackAudio, this);
            hap.start();
        } else {
            AsiItem.Interaction.handleEndFeedbackAudio(fid, this);
        }
    }
};


// The user has clicked on one of the anwers, process the response.
AsiItem.Interaction.prototype.processResponse_noVoiceGuidance = function (span) {
    this.responsesLeft--;

    // Find the span that was clicked.
    //var fspan = this._html.getRelatedFeedbackSpan(span);
    var spid = YUD.getAttribute(span, 'id');
    this._responseIdentifiers.push(this._spanToIdentifierMap[spid]);

    // Is this the right answer?  If so we're done.
    if (this._terminalSpanIds[spid]) {
        this.complete = true;
        this.terminateInteraction();
    } else if ((this.complete == false) && (this.responsesLeft == 0)) {
        // User has chosen all the incorrect resposnes.  Don't allow any more
        // interaction per the requirements.
        this.complete = true;
        this.terminateInteraction();
    } else { // Otherwise, hide this response span
        YUD.removeClass(span, 'asi-response-shown');
        YUD.removeClass(span, 'asi-response-enabled');
        YUD.addClass(span, 'asi-response-hidden');
    }
};

// User clicked on a span.  Ignore if complete or we are playing an
// audio sequence.
AsiItem.Interaction.handleResponseCallback = function (ev, instance) {
    // This is a callback so we need to use self for this...
    if (instance.isReadOnly() || instance._isPlaying || instance._isFeedbackPlaying || instance._isResponsePlaying)
        return; // ignore events when playing the story

    if (instance.complete)
        return;

    var span = this;
    instance._playSourceFromResponse = true;
    instance.processResponse(span);
};


// In the case of no voice guidance: User clicked on a span.  Ignore if complete.
AsiItem.Interaction.handleResponseCallback_noVoiceGuidance = function (ev, instance) {
    if (instance.isReadOnly() || instance.complete)
        return;
    var span = this;
    instance.processResponse_noVoiceGuidance(span);
};


// Feedback audio has compeleted.  Restart main audio.
AsiItem.Interaction.handleEndFeedbackAudio = function (spid, instance) {
    AsiItem.EventLog('handleEndFeedbackAudio');
    instance._isFeedbackPlaying = false;

    if (!instance.complete && (instance.responsesLeft > 0)) {
        instance.populateResponseAudio(instance._playbackInfo);
        instance._html.setStopIcon(instance.audioWidget);
        instance.playAudio(instance._playbackInfo);
    } else if ((instance.complete == false) && (instance.responsesLeft == 0)) {
        // User has chosen all the incorrect resposnes.  Don't allow any more
        // interaction per the requirements.
        instance.complete = true;
        instance.terminateInteraction();
    }
};

// Show all the responses
AsiItem.Interaction.prototype.displayResponses = function (responseArray) {
    AsiItem.EventLog('subdueResponses');
    for (var i = 0; i < responseArray.length; ++i) {
        var span = YUD.get(responseArray[i]);
        AsiItem.EventLog('display span ' + YUD.getAttribute(span, 'id'));
        YUD.addClass(span, 'asi-response-shown');
        YUD.removeClass(span, 'asi-response-hidden');
    }
};

// Play the whole story based on button click.
AsiItem.Interaction.handlePlayAudioButton = function (ev, instance) {
    if (instance.isReadOnly()) return;
    AsiItem.EventLog('Main story button pressed');
    instance._playSourceFromResponse = false;
    instance.playAudio(instance._playbackInfo);
};

// Allow the user to click and play only a single response.
AsiItem.Interaction.handleResponseAudioButton = function (ev, instance) {
    if (instance.isReadOnly())
        return;
    YUE.stopEvent(ev);
    if (instance._isResponsePlaying && instance._responsePlayer) {
        AsiItem.EventLog('handleResponseAudioButton - playing, treat like stop');
        instance._responsePlayer.stop();
        return;
    }

    if (instance.complete)
        return;

    AsiItem.EventLog('handleResponseAudioButton');
    var playbackInfo = {
        stemId: null,
        stemAudio: null,
        responseAudio: []
    };

    // Set up the audio cue where the audio manager expects it.
    var responseChoice = instance._html.getResponseChoice(this);
    var responseIndex = -1;
    var choices = instance._parser.asiContent.choices;
    for (var i = 0; i < choices.length; ++i) {
        var choice = choices[i];
        if (choice.identifier == responseChoice) {
            responseIndex = i;
            break;
        }
    }

    if (responseIndex < 0) {
        AsiItem.EventLog('handleResponseAudioButton - Error: Could not find responseIndex for choice ' + responseChoice);
        return;
    }

    var audioObject = {
        audioCue: instance._parser.asiContent.choices[responseIndex].audioCue,
        spanId: YUD.getAttribute(this, 'id')
    };

    playbackInfo.responseAudio[responseIndex] = audioObject;
    instance._html.subdueResponses(instance._responseSpanIds);
    instance._html.subduePlayIcon(instance.audioWidget);

    // Subdue the other responses so the student knows what we are doing.
    var responseId = instance._html.createSpanId('response-' + responseChoice);
    YUD.addClass(responseId, 'asi-response-emphasis');
    YUD.removeClass(responseId, 'asi-response-subdued');

    instance.populateResponseAudio(playbackInfo, responseChoice);
    instance.playAudioResponse(playbackInfo);
};

// Play only a single audio response.
AsiItem.Interaction.prototype.playAudioResponse = function (audioArray) {
    if ((this._isPlaying === true) || (this._isResponsePlaying) || (this._isFeedbackPlaying)) {
        AsiItem.EventLog('no audio response - playing already');
        return;
    }
    if (this.complete === true) {
        AsiItem.EventLog('complete');
        return;
    }
    this._responsePlayer = this._audioFactory.createAudioInterface();
    var self = this;
    var startPlaying = function () {
        AsiItem.EventLog('playAudioResponse - startPlaying');
        self._isResponsePlaying = true;
        self._html.setStopIcon(responseSpan);
    };
    var stopPlaying = function () {
        AsiItem.EventLog('playAudioResponse - stopPlaying');
        self._isResponsePlaying = false;
        self._html.setPlayIcon(responseSpan);
        self._html.enableResponses(self._responseSpanIds);
        self._html.setPlayIcon(self.audioWidget);
    };

    AsiItem.EventLog('playAudioResponse - setting up audio');
    for (var i = 0; i < audioArray.responseAudio.length; ++i) {
        var responseInfo = audioArray.responseAudio[i];
        if (responseInfo.audioCue) {
            var responseSpan = YUD.get(responseInfo.spanId);
            if (responseSpan && (YUD.getStyle(responseSpan, 'display') != 'none')) {
                this._responsePlayer.add(responseInfo.audioCue, responseInfo.spanId, startPlaying, stopPlaying);
            }
        }
    }

    this._responsePlayer.start();
};

// Play the story associated with this instance.  Handle both the
// animation and the audio.
AsiItem.Interaction.prototype.playAudio = function (audioArray) {
    var self = this;
    if ((this._isResponsePlaying) || (this._isFeedbackPlaying)) {
        AsiItem.EventLog('playAudio - already playing response');
        return;
    }
    if (this.hasPlayedOnce == false && this._isPlaying === true) {
        AsiItem.EventLog('playAudio - already playing first time, replay entire story ');
        // this.setStopIcon(instance.audioWidget);
        // audioArray = this._playbackInfo;
    }
    if ((this._isPlaying === true) && (this._player)) {
        AsiItem.EventLog('playAudio - already playing, treat like stop');
        this._player.stop();
        this._player.dispose();
        this._player = null;
        this._isPlaying = false;
        this._html.setPlayIcon(this.audioWidget);
        this._html.enableResponses(this._responseSpanIds);

        // Stem has to play all the way through the first time.
        if (this.hasPlayedOnce == false) {
            setTimeout(function () {
                self.populateResponseAudio(audioArray);
                self.playAudio(audioArray);
            }, 1);
        }
        return;
    }

    if (this._player) {
        this._player.stop();
        this._player.dispose();
        this._player = null;
    }
    if (this.complete === true) {
        AsiItem.EventLog('playAudio - complete');
        return;
    }
    this._player = this._audioFactory.createAudioInterface();

    this._html.subdueResponses(this._responseSpanIds);

    var startAudioCallback = function (id) {
        var span = YUD.get(id);
        if (/asiStem/.test(id)) {
            AsiItem.EventLog('playAudio - starting stem');
            return;
        }
        AsiItem.EventLog('playAudio - starting a response ' + id);
        if (span) {
            self._html.emphasizeResponse(span);

            var responseAudioSpan = self._html.getAudioSpanFromResponseSpan(span);
            if (responseAudioSpan) {
                self._html.subduePlayIcon(responseAudioSpan);
            }
        }
    };

    var stopAudioCallback = function (id) {
        if (self._isPlaying == false) {
            // Race condition, don't do anything just stop playing
            AsiItem.EventLog('playAudio - stopAudioCallback late stop event, enabling');
            self._html.enableResponses(self._responseSpanIds);
            return;
        }
        AsiItem.EventLog('playAudio - stopAudioCallback');
        if (/asiStem/.test(id)) {
            if (audioArray.responseAudio.length == 0) {
                AsiItem.EventLog('playAudio - finished playing stem and no responses');
                self._isPlaying = false;
                self._html.enableResponses(self._responseSpanIds);
                self._html.setPlayIcon(self.audioWidget);
            }
            AsiItem.EventLog('playAudio - finished playing stem');
            return;
        }

        var span = YUD.get(id);
        if (span) {
            AsiItem.EventLog('playAudio - finished playing response ' + id + ', remove emphasis');
            YUD.removeClass(span, 'asi-response-emphasis');
        }

        if (audioArray.lastChoiceToPlay == self._html.getResponseChoice(id)) {
            AsiItem.EventLog('playAudio - playing last response ' + id + ', enabling');
            self._isPlaying = false;
            self._html.enableResponses(self._responseSpanIds);
            self._html.setPlayIcon(self.audioWidget);
            self.hasPlayedOnce = true;
        } else {
            AsiItem.EventLog('playAudio - finished playing response ' + id + ', subdue');
            YUD.addClass(span, 'asi-response-subdued');
        }
    };

    // Bug 97363: Only play stem the first time if there are feedback spans 
    // Only play responses that have not been chosen yet
    AsiItem.EventLog('playAudio - populating player');
    if ((audioArray.playStemAudio) || (self._playSourceFromResponse == false)) {
        this._player.add(audioArray.stemAudio, audioArray.stemId, startAudioCallback, stopAudioCallback);
    }
    for (var i = 0; i < audioArray.responseAudio.length; ++i) {
        var responseInfo = audioArray.responseAudio[i];
        if (responseInfo.audioCue) {
            var responseSpan = YUD.get(responseInfo.spanId);
            if (responseSpan && ((this.hasPlayedOnce == false) || YUD.getStyle(responseSpan, 'display') != 'none')) {
                this._player.add(responseInfo.audioCue, responseInfo.spanId, startAudioCallback, stopAudioCallback);
            }
        }
    }
    this._isPlaying = true;

    // First time through no interaction is allowed, subsequent times allow user to stop.
    if (this.hasPlayedOnce == false) {
        // We want to show the sound waves (stop icon) 
        this._html.setStopIcon(this.audioWidget);
        this._html.subduePlayIcon(this.audioWidget);
    } else {
        this._html.setStopIcon(this.audioWidget);
    }
    this._player.start();
};

AsiItem.Interaction.prototype.hasResponseBeenChosen = function (spid) {
    for (var i = 0; i < this._responseIdentifiers.length; ++i) {
        var responseSpan = this._html.getResponseSpanFromIdentifier(this._responseIdentifiers[i]);
        if (responseSpan != null && responseSpan.id == spid) {
            return true;
        }
    }
    return false;
};

// Repopulate the response audio with the options that are left.
AsiItem.Interaction.prototype.populateResponseAudio = function (audioObject, responseId) {
    var ar = [];
    audioObject.lastChoiceToPlay = 'A';
    for (var i = 0; i < this._responseSpanIds.length; ++i) {
        var spid = this._responseSpanIds[i];
        //var span = YUD.get(spid);
        var choice = this._html.getResponseChoice(spid);
        if ((responseId == null) || (responseId == choice)) {
            if (!this.hasResponseBeenChosen(spid)) {
                if (audioObject.responseAudio[i]) {
                    ar.push(audioObject.responseAudio[i]);
                    if (choice > audioObject.lastChoiceToPlay) {
                        audioObject.lastChoiceToPlay = choice;
                    }
                }
            }
        }
    }

    audioObject.responseAudio = ar;
};

// Populate the responses part of the ASI item.
AsiItem.Interaction.prototype.populateResponses = function (parentDiv) {

    var choices = this._parser.asiContent.choices;

    //var answerCell = document.createElement('div');
    //this._html.setSpanId(answerCell, 'responses');

    this._playbackInfo.lastChoiceToPlay = 'A';

    for (var i = 0; i < choices.length; i++) {

        var choice = choices[i];

        // Find the span that contains this choice's response
        var responseSpan = document.getElementById(choice.id); //document.createElement('div');
        if (!this._voiceGuidance) {
            YUD.addClass(responseSpan, 'asi-response-shown');
            YUD.removeClass(responseSpan, 'asi-response-hidden');
        }
        //var spanId = this._html.createSpanId('response-' + choice.identifier);
        this._spanToIdentifierMap[choice.id] = choice.identifier;

        // Store the response span ids for easy enable/disable while playing.
        this._responseSpanIds.push(choice.id);

        // Store the audio tags in the responses for the 'auto-play' feature.
        var audioTag = choice.audioCue;
        if (audioTag) {
            var audioObject = {
                audioCue: audioTag,
                spanId: choice.id
            };
            this._playbackInfo.responseAudio.push(audioObject);

            if (choice.identifier > this._playbackInfo.lastChoiceToPlay) {
                this._playbackInfo.lastChoiceToPlay = choice.identifier;
            }
        }

        // Indicate if this is the 'correct' answer that completes the question.
        if (choice.complete) { // if (/true/i.test(choice.complete)) {
            this._terminalSpanIds[choice.id] = true;
        }

        // Populate the initial response part.
        //this._html.setSpanId(responseSpan, 'response-' + i.toString());
        //responseSpan.innerHTML = Util.Xml.serializeToString(choice.content.htmlContent);
        //YUD.setAttribute(responseSpan, 'tabIndex', '0');
        if (this._voiceGuidance) {
            YUD.addClass(responseSpan, 'asi-response-hidden');
        }

        // Add playback button for the response audio per requirements
        if (this._voiceGuidance) {
            var responseAudioButton = this._html.createAudioButton();
            this._html.setPlayIcon(responseAudioButton);
            this._html.setSpanId(responseAudioButton, 'audioResponse-' + choice.identifier);
            YUE.addListener(responseAudioButton, 'click', AsiItem.Interaction.handleResponseAudioButton, this);
            responseSpan.appendChild(responseAudioButton);
            this._responseButtons.push(responseAudioButton);
        }

        // Create the feedback span (might be empty) and make it hidden after the response part.
        var feedbackContent = choice.feedback; // feedback of choice
        var feedbackSpan = document.getElementById(this._html.createSpanId('feedback-' + choice.identifier)); // document.createElement('div');
        YUD.addClass(feedbackSpan, 'asi-feedback-hidden');
        //this._html.setSpanId(feedbackSpan, 'feedback-' + i.toString());

        // Feedback might have an audio cue.  Save the cue so we can play it
        // if we end up displaying this feedback span.
        if (feedbackContent.audioCue) {
            var spanId = this._html.createSpanId('feedback-' + choice.identifier);
            this._feedbackCues[spanId] = feedbackContent.audioCue;
            this._playbackInfo.playStemAudio = false;
        }

        // Populate the feedback span with content, if it exsists.
        //if (feedbackContent.feedbackContainer) {
        //    feedbackSpan.innerHTML = Util.Xml.serializeToString(feedbackContent.feedbackContainer);
        //}

        // Add them to the layout
        //answerCell.appendChild(responseSpan);
        //answerCell.appendChild(feedbackSpan);

        // Set the callback on the response
        if (this._voiceGuidance) {
            YUE.addListener(responseSpan, 'click', AsiItem.Interaction.handleResponseCallback, this);
        } else {
            YUE.addListener(responseSpan, 'click', AsiItem.Interaction.handleResponseCallback_noVoiceGuidance, this);
        }
    }
    //this._html.getParentDiv().appendChild(answerCell);
};
