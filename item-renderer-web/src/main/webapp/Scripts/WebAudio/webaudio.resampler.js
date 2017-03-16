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

    function resample(channelData, sampleRate, encodeRate, numberOfChannels, callback) {

        if (sampleRate === encodeRate) {
            callback(channelData);
            return;
        }

        var length = channelData[0].length * (encodeRate / sampleRate),
            buffer, input, channel, context;

        context = new OfflineAudioContext(numberOfChannels, length, sampleRate);

        buffer = context.createBuffer(numberOfChannels, length, sampleRate);
        for (channel = 0; channel < numberOfChannels; ++channel) {
            buffer.getChannelData(channel).set(channelData[channel], 0);
        }

        input = context.createBufferSource();
        input.buffer = buffer;
        input.connect(context.destination);

        context.oncomplete = function (event) {
            var channelData = [],
                channel;

            for (channel = 0; channel < numberOfChannels; ++channel) {
                channelData[channel] = new Float32Array(event.renderedBuffer.getChannelData(channel));
            }

            callback(channelData);
        };

        input.start(context.currentTime);
        context.startRendering();
    }

    // exports

    webAudio.Resampler = {
        resample: resample
    };

})(window, webAudio);
