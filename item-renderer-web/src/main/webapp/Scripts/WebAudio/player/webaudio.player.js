//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
﻿(function (window, webAudio) {
    "use strict";

    function Player(continuousPlay) {
        this.playlist = new webAudio.Playlist();

        this.context = webAudio.context;

        this.pauseInfo = {
            lastStartTime: null,
            elapsedTime: 0,
            track: null
        };

        this.playing = false;
        this.hasStarted = false;

        this._continuousPlay = !!continuousPlay;
    }

    Player.prototype.handleEvent = function (event) {
        var handler = this['on' + event.type];

        if (typeof handler === 'function') {
            return handler.call(this, event);
        }
    };

    Player.prototype.getCurrentTrack = function () {
        return this.playlist.getCurrentTrack();
    };

    Player.prototype.play = function () {

        if (this.playing) {
            return;
        }

        // always need to recreate the input; re-starting old one is not allowed
        this.changeTrack(this.getCurrentTrack(), false);

        this.playing = true;

        this._input.start(this.context.currentTime, this.pauseInfo.elapsedTime);

        this.pauseInfo.lastStartTime = this.context.currentTime;
    };

    Player.prototype._stopInput = function () {
        if (this._input) {
            this._input.onended = null;
            this._input.stop();
            this._input.disconnect();
            this._input = null;
        }
    };

    Player.prototype.pause = function () {

        this._stopInput();

        this.pauseInfo.elapsedTime += this.context.currentTime - this.pauseInfo.lastStartTime;

        this.playing = false;
    };

    Player.prototype.stop = function () {

        this._stopInput();

        this.pauseInfo.elapsedTime = 0;

        this.playing = false;
    };

    Player.prototype.seek = function (time) {
    };

    Player.prototype.volume = function (volume) {
    };

    Player.prototype.createInput = function (buffer) {
        this._input = this.context.createBufferSource();
        this._input.connect(this.context.destination);
        this._input.buffer = buffer;
    };

    Player.prototype.changeTrack = function (track, autoPlay) {
        var wasPlaying = this.playing,
            self = this,
            onended, buffer;

        if (typeof track === 'number') {
            track = this.playlist.getTrack(track);
        }

        if (track === null) {
            return;
        }

        this.playlist.setTrack(track);

        buffer = track.toAudioBuffer(this.context);

        if (typeof autoPlay !== 'boolean') {
            autoPlay = true;
        }

        if (wasPlaying && this.pauseInfo.elapsedTime === 0) {
            this.stop();
        }

        this.createInput(buffer);

        this._input.onended = function (e) {
            if (typeof self.ontrackend === 'function') {
                self.ontrackend(track);
            }
            self.stop();
            self.advanceTrack();
        };

        if (autoPlay) {
            this.play();
        }
    };

    Player.prototype.advanceTrack = function () {
        var track = this.playlist.advanceTrack();

        if (track === null) {
            if (typeof this.onplaylistend === 'function') {
                this.onplaylistend();
            }
        } else if (this._continuousPlay) {
            this.changeTrack(track);
        }
    };

    Player.prototype.ontrackend = null;

    Player.prototype.onplaylistend = null;

    // exports
    webAudio.Player = Player;

})(window, webAudio);
