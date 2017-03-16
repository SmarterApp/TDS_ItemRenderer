//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
/*
This is used for the ELPA player and recorder widgets.
*/

(function (Audio) {

    /*
    elpa.css:

    load_start
    load_fail
    load_complete

    decode_start
    decode_fail

    recording_fail *
    recording_start *
    recording_ready
    recording_stopping
    recording_done *

    playing_fail *
    playing_start *
    playing_done *
    playing_stopped
    playing_paused

    disabled 
    */

    // TODO: Map these as titles
    var eventMap = {
        'playing_start': {
            playPause: '',
            rewind: ''
        },
        'playing_pause': {
            playPause: '',
            rewind: ''
        },
        'playing_resume': {
            playPause: '',
            rewind: ''
        },
        'playing_done': {
            playPause: '',
            rewind: ''
        },
        'playing_fail': {
            playPause: '',
            rewind: ''
        }
    };

    var CSS_DISABLED = 'disabled';

    var Recorder = Audio.Recorder;
    var Player = Audio.Player;
    
    // a list of all the dom ids (player/recorder) that we have setup
    var widgetList = [];
    var recorderList = [];
    var recorderLookup = {};
    var playerList = [];
    var playerLookup = {};
    
    // set the progress level
    function updateProgressLevel(id, level) {
        var micDiv = YUD.get(id);

        // check if valid #
        if (!YAHOO.lang.isNumber(level)) return;

        // fix string into int
        level = level * 1;

        if (micDiv) {
            // find and set level height % on level indicator div
            var soundLevelWrapEl = YUD.getFirstChild(micDiv);
            var soundLevelIndicatorEl = YUD.getFirstChild(soundLevelWrapEl);
            soundLevelIndicatorEl.style.width = (level + '%');
        }
    };

    function enableAll() {
        for (var i = 0; i < widgetList.length; i++) {
            var el = YUD.get(widgetList[i]);
            YUD.removeClass(el, CSS_DISABLED);
        }
    }

    function disableAll(id) {
        for (var i = 0; i < widgetList.length; i++) {
            if (widgetList[i] != id) {
                var el = YUD.get(widgetList[i]);
                YUD.addClass(el, CSS_DISABLED);
            }
        }
    }

    var ATTRIB_AUDIO_EVENT = 'data-audio-event';

    // set event class
    function setEventClass(id, type) {

        var el = YUD.get(id);
        if (el == null) return;
        type = type.toLowerCase();

        // get the last audio element event
        var lastEvent = el.getAttribute(ATTRIB_AUDIO_EVENT);

        // remove existing state
        if (lastEvent) {
            YUD.removeClass(el, lastEvent);
        }

        // set new event
        el.setAttribute(ATTRIB_AUDIO_EVENT, type);
        YUD.addClass(el, type);
    }

    function setEventClassAll(type) {
        for (var i = 0; i < recorderList.length; i++) {
            setEventClass(recorderList[i].id, type);
        }
    }

    function setupRecorderEvents() {

        Recorder.onDeviceInit.subscribe(function () {
            enableAll();
            setEventClassAll('load_start');
        });

        Recorder.onDeviceReady.subscribe(function () {

            // remove disable
            enableAll();

            // reset class
            for (var i = 0; i < recorderList.length; i++) {
                if (recorderList[i].loaded) {
                    setEventClass(recorderList[i].id, 'recording_done');
                } else {
                    setEventClass(recorderList[i].id, 'recording_ready');
                }
            }
        });

        // if device fires an error then let's assume it is ok to continue 
        Recorder.onDeviceError.subscribe(function (id) {
            enableAll();
            setEventClassAll('recording_fail');
        });

        // if device throws an exception then
        Recorder.onDeviceException.subscribe(function (id) {
            enableAll();
            setEventClassAll('recording_fail');
        });

        Recorder.onCaptureLoad.subscribe(function (id) {

            if (recorderLookup[id]) {
                recorderLookup[id].loaded = true;
            }

            setEventClass(id, 'recording_done');
        });

        Recorder.onCaptureStart.subscribe(function (id) {
            // updateProgressLevel(id, 0);
            disableAll(id);
            setEventClass(id, 'recording_start');
        });

        /*
        Recorder.onCaptureProgress.subscribe(function(id, data) {
            updateProgressLevel(id, data);
        });
        */

        Recorder.onCaptureStop.subscribe(function (id) {

            // mark recording as dirty (if someone saves this then they will mark as false)
            if (recorderLookup[id]) {
                recorderLookup[id].loaded = true;
                recorderLookup[id].dirty = true;
            }

            enableAll();
            setEventClass(id, 'recording_done');
            
            // BUG 92438: force playback for an iota of time to clear the static noise issue
            if (Util.Browser.isMacPPC()){
                Recorder.playAudio(id);
                Recorder.stopAudio();
            }
            
        });

        Recorder.onPlayStart.subscribe(function (id) {
            disableAll(id);
            setEventClass(id, 'playing_start');
        });

        Recorder.onPlayStop.subscribe(function (id) {
            enableAll();
            setEventClass(id, 'playing_done');
        });

    }

    function createRecorderWidget(id, duration) {

        var recorderEl = YUD.get(id);
        if (!recorderEl) {
            console.warn('Could not find recorder id \'' + id + '\'');
            return;
        }

        id = recorderEl.id; // save the id back
        widgetList.push(id);

        // save recorder info
        recorderList.push(
            recorderLookup[id] = {
                id: id,
                el: recorderEl,
                loaded: false, // if this is true then this recorder has captured/loaded audio
                dirty: false // if this is true then audio is not saved
            }
        );

        // set recording ready as current event
        recorderEl.setAttribute(ATTRIB_AUDIO_EVENT, 'recording_ready');

        // create widget
        var btnRecord = YUD.getElementsByClassName('btnRecord', 'a', recorderEl)[0]; // record button
        var btnPlayPause = YUD.getElementsByClassName('btnPlayPause', 'a', recorderEl)[0]; // play/stop button

        // begin/stop recording
        YUE.addListener(btnRecord, 'click', function (evt) {

            YUE.stopEvent(evt);

            // don't do anything if widget is disabled
            if (YUD.hasClass(recorderEl, CSS_DISABLED)) return;

            // don't do anything if an audio file is playing
            if (Player.isPlaying()) return;

            // check if recorder is capturing
            if (YUD.hasClass(recorderEl, 'recording_start')) {
                Recorder.stopCapture();
            } else {   
                Recorder.startCapture(id, duration);
            }

        });

        // play/stop recorded audio
        YUE.addListener(btnPlayPause, 'click', function (evt) {

            YUE.stopEvent(evt);

            // don't do anything if widget is disabled
            if (YUD.hasClass(recorderEl, CSS_DISABLED)) return;

            // don't do anything if an audio file is playing
            if (Player.isPlaying()) return;

            // check if recorder is playing
            if (YUD.hasClass(recorderEl, 'playing_start')) {
                Recorder.stopAudio();
            } else {
                Recorder.playAudio(id);
            }
        });

        // check if the device is broken
        if (Recorder.isDeviceBroken()) {
            YUD.addClass(recorderEl, 'recording_fail');
        }
            // if the recorder is ready and we aren't recording/playing then remove disabled class
        else if (Recorder.isReady() && !Audio.isActive()) {
            YUD.removeClass(recorderEl, CSS_DISABLED);
        }

        return {
            id: id,
            controls: [btnRecord, btnPlayPause]
        };
    }

    function setupPlayerEvents() {

        Player.onPlay.subscribe(function (id) {            
            disableAll(id);
            setEventClass(id, 'playing_start');
        });

        Player.onPause.subscribe(function (id) {
            enableAll();
            setEventClass(id, 'playing_pause');
        });

        Player.onResume.subscribe(function (id) {
            disableAll(id);
            setEventClass(id, 'playing_start'); // simpler not to use 'playing_resume'
        });

        Player.onIdle.subscribe(function (id) {
            enableAll();
            setEventClass(id, 'playing_done');
        });

        Player.onFail.subscribe(function (id) {
            enableAll();
            setEventClass(id, 'playing_fail');
        });

    }

    var playerCount = 0;

    // create a widget from an audio tag and return the id
    function createPlayerWidget(id) {

        // check if element exists
        var linkEl = YUD.get(id);
        if (!linkEl) return null;

        // create unique id for this sound
        var id;
        if (linkEl.id) {
            id = linkEl.id;
        } else {
            id = 'sound-' + (++playerCount);
            linkEl.id = id;
        }

        // create play/stop button
        var playStopEl = document.createElement('a');
        playStopEl.id = id;
        playStopEl.className = 'playPause';
        playStopEl.setAttribute('href', '#');
        playStopEl.className = linkEl.className + ' ' + CSS_DISABLED;
        playStopEl.setAttribute('tabindex', '0');

        // BUG 119152: add title
        playStopEl.setAttribute('title', 'Play or pause recorded audio.');

        // set link events to play/stop sound
        YUE.addListener(playStopEl, 'click', function (ev) {

            // stop the click
            YUE.stopEvent(ev);

            // don't do anything if widget is disabled
            if (YUD.hasClass(playStopEl, CSS_DISABLED)) return;

            // don't do anything if recorder is capturing/playing
            if (Recorder.isCapturing() || Recorder.isPlaying()) return;

            // check if audio is playing
            if (YUD.hasClass(playStopEl, 'playing_start')) {
                Player.stop(playStopEl.id);
            } else {
                Player.play(playStopEl.id);
            }

        });


        // make link disabled until player is ready 
        YUD.addClass(playStopEl, CSS_DISABLED);

        // BUG 119152: add title
        playStopEl.setAttribute('title', 'Play or stop recorded audio.');

        // wait for player to be ready
        Player.onReady(function () {
            // create sound
            if (Player.createSoundFromElement(linkEl)) {
                // add to list and remove disabled
                widgetList.push(linkEl.id);
                YUD.removeClass(linkEl, CSS_DISABLED);
            }
        });

        // replace <a> or <audio> with new <div> 
        $(linkEl).replaceWith(playStopEl);

        return {
            id: playStopEl.id,
            controls: [playStopEl]
        };
    }

    // create a audio player with rewind widget from an audio tag and return the id
    function createPlayerRewindWidget(target) {

        // check if element exists
        var linkEl = YUD.get(target);
        if (!linkEl) return null;

        // create unique id for this sound
        var id;
        if (linkEl.id) {
            id = linkEl.id;
        } else {
            id = 'sound-' + (++playerCount);
            linkEl.id = id;
        }

        // create container
        var audioControlsEl = document.createElement('div');
        audioControlsEl.id = id;
        audioControlsEl.className = 'audioControls ' + CSS_DISABLED;

        // create play/pause button
        var playPauseEl = document.createElement('a');
        playPauseEl.className = 'playPause';
        playPauseEl.setAttribute('href', '#');
        playPauseEl.setAttribute('tabindex', '0');

        // BUG 119152: add title
        playPauseEl.setAttribute('title', 'Play or pause recorded audio.');

        YUE.addListener(playPauseEl, 'click', function (ev) {

            // stop the click
            YUE.stopEvent(ev);

            // don't do anything if widget is disabled
            if (YUD.hasClass(audioControlsEl, CSS_DISABLED)) return;

            // don't do anything if recorder is capturing/playing
            if (Recorder.isCapturing() || Recorder.isPlaying()) return;

            //Player is playing/paused
            if (YUD.hasClass(audioControlsEl, 'playing_start') ||
                YUD.hasClass(audioControlsEl, 'playing_resume')) {
                Player.pause(id);
            }
            else if (YUD.hasClass(audioControlsEl, 'playing_pause')) {
                Player.resume(id);
            }
            else if (YUD.hasClass(audioControlsEl, 'playing_done') ||
                    (!YUD.hasClass(audioControlsEl, 'playing_start') || !YUD.hasClass(audioControlsEl, 'playing_resume'))) {
                Player.play(id);
            }
            else {
                Player.stop(id);
            }
        });

        audioControlsEl.appendChild(playPauseEl);

        // create rewind button
        var rewindEl = document.createElement('a');
        rewindEl.className = 'rewind';
        rewindEl.setAttribute('href', '#');
        rewindEl.setAttribute('tabindex', '0');

        // BUG 119152: add title
        rewindEl.setAttribute('title', 'Go back to the beginning of the audio.');

        YUE.addListener(rewindEl, 'click', function (ev) {
            YUE.stopEvent(ev);
            if (!YUD.hasClass(audioControlsEl, 'playing_done')) {
                Player.stop(id);
            }
        });

        audioControlsEl.appendChild(rewindEl);

        // wait for player to be ready
        Player.onReady(function () {
            // create sound from original link
            if (Player.createSoundFromElement(linkEl)) {
                // add to list and remove disabled
                widgetList.push(id);
                YUD.removeClass(audioControlsEl, CSS_DISABLED);
            }
        });

        // replace <a> with new <div> 
        $(linkEl).replaceWith(audioControlsEl);

        return {
            id: id,
            controls: [playPauseEl, rewindEl]
        };
    }

    TDS.Audio.Widget = {};

    if (Recorder) {
        setupRecorderEvents();
        TDS.Audio.Widget.createRecorder = createRecorderWidget;
        TDS.Audio.Widget.getRecorder = function (id) {
            return recorderLookup[id];
        };
    }

    if (Player) {
        setupPlayerEvents();        
        TDS.Audio.Widget.createPlayer = createPlayerWidget;        
        TDS.Audio.Widget.createPlayerRewind = createPlayerRewindWidget;
        TDS.Audio.Widget.getPlayer = function (id) {
            return playerLookup[id];
        };
    }
    
    TDS.Audio.Widget.getIDs = function () {
        return widgetList;
    };

})(TDS.Audio);