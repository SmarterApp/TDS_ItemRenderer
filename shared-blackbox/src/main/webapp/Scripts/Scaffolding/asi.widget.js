//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
﻿/*
This module is used for loading Alt Scaffolding items (QTI).
*/

(function(CM) {

    function match(page, item, content) {
        var id = 'ScaffoldingContainer_' + item.position;
        var el = document.getElementById(id);
        if (el) {
            return new CM.WidgetConfig(id, el);
        }
        return false;
    }

    CM.registerWidget('scaffolding', Widget_ASI, match);

    function Widget_ASI() {
        this.scaffolding = null;
    }

    // NOTE: Need to use init because of audio links
    Widget_ASI.prototype.init = function () {

        var page = this.page;
        var item = this.entity;
        var containerEl = this.element;

        // check voice guide
        var accProps = page.getAccommodationProperties();
        var hasASIVoiceGuidance = accProps.hasASIVoiceGuidance();
        // If Voice Guidance is OFF then the scaffolding items continue to work the same with the exception that there is no audio playback on the items (no-auto queuing of audio and no speaker buttons anywhere).  The teacher is going to use their own voice (like they would on the paper/pencil assessment) to instruct the student on what to do.
        // I believe that when this is turned off then the item will need to be presented in its entirety (stem with all options) immediately because there is no audio to wait for for presentation OR we just cycle through like we did before, but without playing the audio (whichever is easier).

        // remove exitAudio from stem 
        var stem = item.getStemElement();
        if (stem) {
            var exitAudioCue = this._processExitAudioLink(stem, hasASIVoiceGuidance);
            var exitAudioPlayer = new AsiItem.AudioInterface();
            if (exitAudioCue) { // If there is an exit audio cue for this item
                var exitAudioPlayerId = 'asi-' + item.position + 'exitAudio';
                exitAudioPlayer.add(exitAudioCue, exitAudioPlayerId);
            }
        }

        var onTerminate = function(type, args, instance) {

            // Find 'theQuestions' node in the DOM
            var itemContainer = containerEl;

            while (itemContainer) {
                if ($(itemContainer).hasClass('itemContainer')) {
                    break;
                } else {
                    itemContainer = itemContainer.parentNode;
                }
            }

            // As a bit of a hack, we need to put a class on a specific part of the 
            // container in order to show when the question is done.  The reason we put it
            // on the 'questions' part of the div has to do with the MC baggage which we've 
            // inherited.
            if (itemContainer) {
                var completeDiv = document.createElement('div');
                YUD.addClass(completeDiv, 'asi-complete-span');
                itemContainer.appendChild(completeDiv);

                // The big 'complete' button should advance to the next item
                var nextFunction = ContentManager.setItemCompleted;
                if (nextFunction && item) {
                    YUE.addListener(completeDiv, 'click', function() { nextFunction(item); });
                }
            }
            exitAudioPlayer.start();
        };

        CM.log('ASI: Processing item. ');
        var asi = new AsiItem.Parse(item);
        asi.createAsiChoices();

        // get the container and create ASI
        var html = new AsiItem.Html(asi, containerEl);
        this.scaffolding = new AsiItem.Interaction(html, asi, hasASIVoiceGuidance);
        this.scaffolding.isReadOnly = item.isReadOnly;
        this.scaffolding.onTerminate(onTerminate);

        // build html before restoring response.            
        // Bug 117669 - restore the response after starting the interaction
        this.scaffolding.startInteraction(item.value);
    };

    Widget_ASI.prototype.show = function () {
        if (this.scaffolding) {
            AsiItem.Audio.onReady(function () {
                // play audio queue
                this.scaffolding.playStory();
            }.bind(this));
        }
    };

    Widget_ASI.prototype.hide = function() {
        if (this.scaffolding) {
            // quiet the item and normalize the state variables.
            this.scaffolding.hidePage();
        }
    };

    Widget_ASI.prototype._processExitAudioLink = function(parentSpan, hasVoiceGuide) {
        var anchors = parentSpan.getElementsByTagName('a');
        for (var i = 0; i < anchors.length; i++) {
            var anchor = anchors[i];
            var source = AsiItem.Audio.getPlayableSource(anchor);
            var anchorExitAudioAttr = YUD.getAttribute(anchor, 'data-its-exitaudio');
            if (anchorExitAudioAttr == 'true' && source != null) {
                anchor.parentNode.removeChild(anchor);
                return hasVoiceGuide ? source.url : null;
            }
        }
        return null;
    };

    Widget_ASI.prototype.getResponse = function() {

        var value = '';
        var empty = true;
        var valid = false;

        if (this.scaffolding) {
            value = this.scaffolding.getResponse();
            empty = (!value || value.length == 0);
            valid = (!empty && this.scaffolding.complete);
        }

        return this.createResponse(value, valid, empty);
    };

    // response handler for ASI questions
    Widget_ASI.prototype.setResponse = function(value) {
        if (this.scaffolding) {
            this.scaffolding.setResponse(value);
        }
    };

})(window.ContentManager);