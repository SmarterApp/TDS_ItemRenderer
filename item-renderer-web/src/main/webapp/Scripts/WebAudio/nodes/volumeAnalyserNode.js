//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
﻿(function (window, webAudio) {
    'use strict';

    function VolumeAnalyserNode(context) {

        var analyser = context.createAnalyser(),
            scriptProcessor = context.createScriptProcessor(2048, 1, 1),
            frequencyData;

        analyser.channelCount = 1;
        analyser.smoothingTimeConstant = 0.60;
        analyser.fftSize = 512;

        frequencyData = new Uint8Array(analyser.frequencyBinCount);

        var self = this,
            max = Math.sqrt(255) * Math.LN2;

        scriptProcessor.onaudioprocess = function () {

            var length = frequencyData.length,
                i = length,
                volumeSum = 0,
                volumeAverage;

            analyser.getByteFrequencyData(frequencyData);

            for (; i--;) {
                volumeSum += frequencyData[i];
            }

            volumeAverage = Math.sqrt(volumeSum / length) * Math.LN2 / max;

            if (typeof self.onvolumeprocess === 'function' && self.onvolumeprocess !== VolumeAnalyserNode.prototype.onvolumeprocess) {
                // no callback attached, don't waste time invoking it
                self.onvolumeprocess(volumeAverage);
            }

            self.volume = volumeAverage;
        };

        this._analyser = analyser;
        this._scriptProcessor = scriptProcessor;

        Object.defineProperties(this, {
            context: { value: context, writeable: false, enumerable: true, configurable: false },
            numberOfInputs: { value: 1, writeable: false, enumerable: true, configurable: false },
            numberOfOutputs: { value: 0, writeable: false, enumerable: true, configurable: false },
            head: { value: analyser, writeable: false, enumerable: true, configurable: false },
            tail: { value: analyser, writeable: false, enumerable: true, configurable: false }
        });

        this.connect(null);

        this.volume = 0;
    }

    VolumeAnalyserNode.prototype.onvolumeprocess = function (averageVolume) {
    };

    VolumeAnalyserNode.prototype.connect = function (next) {
        // we have no output, so do nothing with next

        this._analyser.connect(this._scriptProcessor);
        this._scriptProcessor.connect(this.context.destination);
    };

    VolumeAnalyserNode.prototype.disconnect = function () {
        this._analyser.disconnect();
        this._scriptProcessor.disconnect();
    };

    webAudio.addPolyfill('AudioContext.prototype.createVolumeAnalyser', {
        fixesApi: false,
        isSupported: function () {
            return true;
        },
        polyfill: function () {
            return new VolumeAnalyserNode(this);
        }
    });

})(window, webAudio);
