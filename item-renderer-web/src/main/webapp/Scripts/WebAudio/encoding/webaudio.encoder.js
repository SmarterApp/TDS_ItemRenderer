//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
﻿(function (webAudio) {
    'use strict';

    function Encoder(id, format, worker) {
        this._worker = worker;

        this.format = format;
        this.id = id;

        this._processor = null;
        this._disconnected = true;

        this._channelCount = null;
        this._sampleRate = null;
        this._durationOfSilenceToAppend = null;
    }

    Encoder.prototype.start = function (audioNode) {

        this._disconnected = false;
        this._channelCount = audioNode.channelCount;
        this._sampleRate = audioNode.context.sampleRate;

        this._worker.start(this.id, this._sampleRate, this._channelCount);

        this._processor = audioNode.context.createScriptProcessor(16384, this._channelCount, 1);

        var self = this;
        this._processor.onaudioprocess = function (e) {
            var input = e.inputBuffer;

            var channelData = [],
                channel, buffer;

            for (channel = 0; channel < e.inputBuffer.numberOfChannels; ++channel) {
                // copy the data to a new buffer, some browsers will reuse the underlying
                // buffer for ScriptProcessorNode's input and output buffers
                channelData[channel] = new Float32Array(e.inputBuffer.getChannelData(channel));
            }

            self._append(channelData);

            if (self._disconnected) {
                self._end();
                self._processor.disconnect();
                audioNode.disconnect();
            }
        };

        audioNode.connect(this._processor);
        this._processor.connect(audioNode.context.destination);
    };

    Encoder.prototype.appendSilence = function (duration) {
        this._durationOfSilenceToAppend = duration;
    };

    Encoder.prototype._appendSilence = function () {
        var duration = this._durationOfSilenceToAppend,
            channelData = [],
            samples = duration * this._sampleRate,
            i;

        // fill each channel with a buffer than holds all 0s (silence)
        for (i = 0; i < this._channelCount; ++i) {
            channelData[channelData.length] = new Float32Array(samples);
        }

        this._append(channelData);
    };

    Encoder.prototype._append = function (channelData) {
        this._worker.append(this.id, channelData);
    };

    Encoder.prototype._end = function () {
        if (this._durationOfSilenceToAppend !== null) {
            this._appendSilence();
        }

        this._worker.end(this.id);
    };

    Encoder.prototype.stop = function () {
        this._disconnected = true;
    };

    Encoder.prototype._notify = function (buffer) {
        if (buffer instanceof ArrayBuffer) {
            this.onencodingcomplete(buffer, this.format);
        } else {
            this.onencodingerror(buffer);
        }
    };

    Encoder.prototype.onencodingcomplete = function (buffer, format) {

    };

    Encoder.prototype.onencodingerror = function (error) {

    };

    // exports

    webAudio.Encoder = Encoder;

})(webAudio);
