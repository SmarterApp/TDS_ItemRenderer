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

    function Recorder(options) {
        this._options = options || {};
        this._initialized = false;

        this._context = webAudio.context;

        this._input = null;
        this._inputMediaStream = null;
        this._active = false;

        this._channelBuffers = [];
        this._bufferCount = 0;

        this.encoder = null;

        this._isRecording = false;

        this._initOptions();
    }

    Recorder.prototype.handleEvent = function (event) {
        var handler = this['on' + event.type];

        if (typeof handler === 'function') {
            return handler.call(this, event);
        }
    };

    var defaultOptions = {
        bufferSize: 16384   // largest allowed by spec; should give smoothest audio (at the expense of latency, but since we don't output audio latency doesn't matter)
    };

    Recorder.prototype._initOptions = function () {
        this._options.bufferSize = this._options.bufferSize || defaultOptions.bufferSize;

        this.setSource(this._options.source);
    };

    Recorder.prototype.setSource = function (source) {
        this._options.source = source instanceof webAudio.RecorderSource ? source : new webAudio.RecorderSource();

        this._initialized = false;
        this._inputMediaStream && this._inputMediaStream.stop && this._inputMediaStream.stop();
        this._input && this._input.disconnect();
    };

    Recorder.prototype.setSourceDevice = function (device) {
        this.setSource(new webAudio.RecorderSource(device));
    };

    Recorder.prototype.startRecording = function (callback, errorCallback, mediaDeviceErrorCallback) {
        try {
            if (!this._initialized) {
                this.initiateRecording(callback, mediaDeviceErrorCallback);
                return;
            }

            if (this._active) {
                return;
            }

            // this lowpass filter should remove high-pitched sounds, like electronic whines
            this.filter = this._context.createBiquadFilter();
            this.filter.type = 'lowpass';
            this.filter.frequency.value = 4000;

            // we also use it to convert to mono audio
            this.filter.channelCount = 1;

            this._vadNode = this._context.createVoiceActivityDetector();

            this._input.connect(this.filter);
            this._input.connect(this._vadNode.head);

            this._active = true;
            this._initiateStreamingEncoder(this._options.streamingEncoderFormat);

            this._isRecording = true;

            if (typeof callback === 'function') {
                callback();
            }

        } catch (error) {
            errorCallback(error.stack || error.message || error.toString());
        }
    };

    Recorder.prototype._initiateStreamingEncoder = function (format) {
        this.encoder = webAudio.encoding.createEncoder(this._options.streamingEncoderFormat);

        var self = this;

        this.encoder.onencodingcomplete = function (buffer) {
            self._oncomplete(buffer);
        };

        this.encoder.onencodingerror = function (error) {
            self._onerror(error);
        };

        this.encoder.start(this.filter);
    };

    Recorder.prototype.initiateRecording = function (callback, errorCallback) {
        var self = this;
        this._options.source.getStreamContainer(function (streamContainer) {
            self._inputMediaStream = streamContainer.stream;
            self._input = streamContainer.streamSourceNode;

            self._inputMediaStream.enabled = false;

            self._initialized = true;

            self.startRecording(callback);
        }, errorCallback);
    };

    Recorder.prototype.stopRecording = function () {
        this._active = false;
        this._vadNode.disconnect();

        if (typeof this.onbeforestop === 'function') {
            this.onbeforestop();
        }

        this.encoder.stop();
        this.encoder = null;

        this._isRecording = false;
    };

    Recorder.prototype.getQuality = function () {
        return (this._vadNode && this._vadNode.getQuality()) || null;
    };

    Recorder.prototype.isRecording = function () {
        return this._isRecording;
    };

    Recorder.prototype.onbeforestop = function () {
    };

    Recorder.prototype._oncomplete = function (buffer) {
        this._input.disconnect();

        if (typeof this.oncomplete === 'function') {
            this.oncomplete(buffer);
        }
    };

    Recorder.prototype.oncomplete = function () {
    };

    Recorder.prototype._onerror = function (error) {
        this._input.disconnect();
        this._vadNode.disconnect();

        if (typeof this.onerror === 'function') {
            this.onerror(error);
        }
    };

    Recorder.prototype.onerror = function () {
    };

    // polyfills
    webAudio.addPolyfill('AudioContext.prototype.createScriptProcessor', {
        fixesApi: false,
        bindToSelf: false,
        isSupported: function (normalize) {
            var normalized = normalize('AudioContext.prototype.createJavaScriptNode');
            this.polyfill = normalized.obj;
            return normalized.supported;
        }
    });

    // exports

    webAudio.Recorder = Recorder;

})(window, webAudio);
