//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
﻿(function (worker) {
    "use strict";

    function encodeWav(track) {
        var channelData = track.channelData,
            sampleRate = track.sampleRate,

            interleaved, buffer, view,
            length, index, volume;

        // we interleave both channels together
        interleaved = interleave(track.channelData);

        // we create our wav file
        buffer = new ArrayBuffer(44 + interleaved.length * 2);
        view = new DataView(buffer);

        writeHeader(view, interleaved, track);

        // write the PCM samples
        length = interleaved.length;
        index = 44;
        volume = 1;
        for (var i = 0; i < length; i++) {
            view.setInt16(index, interleaved[i] * (0x7FFF * volume), true);
            index += 2;
        }

        return buffer;
    }

    function writeHeader(view, interleaved, track) {

        var subChunk2Size = interleaved.length * 2,
            subChunk1Size = 16, // for PCM
            chunkSize = 4 + (8 + subChunk1Size) + (8 + subChunk2Size),

            audioFormat = 1,    // Linear quantization (uncompressed)
            numChannels = track.channelData.length,
            sampleRate = track.sampleRate,
            bitsPerSample = 16,
            byteRate = sampleRate * numChannels * bitsPerSample / 8,
            blockAlign = numChannels * bitsPerSample / 8;

        // RIFF chunk descriptor
        writeUTFBytes(view, 0, 'RIFF');
        view.setUint32(4, chunkSize, true);
        writeUTFBytes(view, 8, 'WAVE');
        // FMT sub-chunk
        writeUTFBytes(view, 12, 'fmt ');
        view.setUint32(16, subChunk1Size, true);
        view.setUint16(20, audioFormat, true);
        // stereo (2 channels)
        view.setUint16(22, numChannels, true);
        view.setUint32(24, sampleRate, true);
        view.setUint32(28, byteRate, true);
        view.setUint16(32, blockAlign, true);
        view.setUint16(34, bitsPerSample, true);
        // data sub-chunk
        writeUTFBytes(view, 36, 'data');
        view.setUint32(40, subChunk2Size, true);
    }

    function writeUTFBytes(view, offset, str) {
        var length = str.length;
        for (var i = 0; i < length; ++i) {
            view.setUint8(offset + i, str.charCodeAt(i));
        }
    }

    function interleave(channelData) {
        var inputIndex = 0,
            inputLength = channelData[0].length,
            numberOfChannels = channelData.length, channel,
            outputIndex = 0,
            output = new Float32Array(inputLength * numberOfChannels);

        for (; inputIndex < inputLength; ++inputIndex) {
            for (channel = 0; channel < numberOfChannels; ++channel) {
                output[outputIndex++] = channelData[channel][inputIndex];
            }
        }

        return output;
    }

    // exports
    worker.encoding.wav = {
        encode: encodeWav,
        decode: null
    };

})(self);
