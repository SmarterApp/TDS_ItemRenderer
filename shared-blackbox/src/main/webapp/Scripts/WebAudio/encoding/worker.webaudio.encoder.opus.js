//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
(function (worker) {
    'use strict';

    // concatenate each buffer into a single byte array:
    //   [[b1, b2, b3, b4], [b5, b6, b7, b8]] => [b1, b2, b3, b4, b5, b6, b7, b8]
    function concat(buffers) {
        // calculate the total length of all buffers
        var totalLength = buffers.reduce(function (length, buffer) {
            return length + buffer.byteLength;
        }, 0);

        // create new, large buffer to hold concatenated data
        var concatenation = new ArrayBuffer(totalLength),
            view = new Uint8Array(concatenation);

        // copy original data into new buffer
        buffers.reduce(function (offset, buffer) {
            view.set(new Uint8Array(buffer), offset);
            return offset + buffer.byteLength;
        }, 0);

        return concatenation;
    }

    // opus requires a compatible sample rate, so we pick one that most closely
    // matches the sample rate of our audio data
    function getOpusEncodingRate(sampleRate) {
        var encodeRate;

        if (sampleRate > 24000) {
            encodeRate = 48000 | 0;
        } else if (sampleRate > 16000) {
            encodeRate = 24000 | 0;
        } else if (sampleRate > 12000) {
            encodeRate = 16000 | 0;
        } else if (sampleRate > 8000) {
            encodeRate = 12000 | 0;
        } else {
            encodeRate = 8000 | 0;
        }

        return encodeRate;
    }

    //#region Encoding

    var OPUS_APPLICATION = {
        VOIP: 2048,                 // voice
        AUDIO: 2049,                // non-voice
        RESTRICTED_LOWDELAY: 2051   // low-latency voice
    };

    var OPUS_RESULT = {
        OK: 0 | 0,
        BAD_ARG: -1 | 0,
        BUFFER_TOO_SMALL: -2 | 0,
        INTERNAL_ERROR: -3 | 0,
        INVALID_PACKET: -4 | 0,
        UNIMPLEMENTED: -5 | 0,
        INVALID_STATE: -6 | 0,
        ALLOC_FAIL: -7 | 0
    };

    function validate(result) {
        var msg;
        switch (result) {
            case OPUS_RESULT.OK:
                msg = null;
                break;
            case OPUS_RESULT.BAD_ARG:
                msg = "bad_arg";
                break;
            case OPUS_RESULT.BUFFER_TOO_SMALL:
                msg = "buffer_too_small";
                break;
            case OPUS_RESULT.INTERNAL_ERROR:
                msg = "internal_error";
                break;
            case OPUS_RESULT.INVALID_PACKET:
                msg = "invalid_packet";
                break;
            case OPUS_RESULT.UNIMPLEMENTED:
                msg = "unimplemented";
                break;
            case OPUS_RESULT.INVALID_STATE:
                msg = "invalid_state";
                break;
            case OPUS_RESULT.ALLOC_FAIL:
                msg = "alloc_fail";
                break;
            default:
                if (result < 0) {
                    msg = "unknown_error";
                }
                break;
        }

        if (msg) {
            return 'opus encoding error: ' + msg;
        }
    }

    // interleaves buffers:
    // [[a1, a2, a3], [b1, b2, b3]] => [a1, b1, a2, b2, a2, b3]
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

    // deinterleaves buffers:
    // [a1, b1, a2, b2, a2, b3] => [[a1, a2, a3], [b1, b2, b3]]
    function deinterleave(interleavedSamples, numberOfChannels) {
        var channelData = [],
            interleavedIndex, sampleIndex, channel,
            sampleCount = interleavedSamples.length / numberOfChannels;

        for (interleavedIndex = 0, sampleIndex = 0; sampleIndex < interleavedSamples.length; ++sampleIndex) {
            for (channel = 0; channel < numberOfChannels; ++interleavedIndex, ++channel) {

                if (!channelData[channel]) {
                    channelData[channel] = new Float32Array(sampleCount);
                }

                channelData[channel][sampleIndex] = interleavedSamples[interleavedIndex];
            }
        }

        return channelData;
    }

    function convertType(source, destArrayType) {

        if (destArrayType !== Float32Array && destArrayType !== Int16Array) {
            throw new Error('unsupported OPUS input-PCM format');
        }

        if (source instanceof destArrayType) {
            return source;
        }

        var dest = new destArrayType(source.length),
            length = source.length,
            i;

        if (destArrayType === Int16Array) {
            // float -> int16
            for (i = 0; i < length; ++i) {
                dest[i] = source[i] * 0x7fff;
            }
        } else if (destArrayType === Float32Array) {
            // int16 -> float
            for (i = 0; i < length; ++i) {
                dest[i] = (source[i] * 1.0) / 0x7fff;
            }
        }

        return dest;
    }

    // creates an opus encoder instance
    function createEncoder(sampleRate, numberOfChannels) {
        var returnCode = _malloc(4 | 0);
        setValue(returnCode, 0, 'i32');

        var encoder = _opus_encoder_create(sampleRate | 0, numberOfChannels | 0, OPUS_APPLICATION.VOIP, /*out*/returnCode);

        var errorMessage = validate(getValue(returnCode, 'i32'));
        if (errorMessage) {
            throw new Error(errorMessage);
        }

        _free(returnCode);

        return encoder;
    }

    // streaming encoding, using a deque to get sample frames of a certain length
    // if the deque doesn't have enough bytes, this method returns what packets it
    // encoded and can be called again to resume encoding when more data is available
    function encodePackets(encoder, deque, inBuf, outBuf, samplesInFrame, maxPacketSize, padFrame) {

        var opusPackets = [],
            totalLength = deque.length,
            bytesWritten = 0,
            errorMessage;

        while (true) {
            // try to get enough bytes to fill an opus sample frame
            var frameSamples = deque.tryDequeue(samplesInFrame, padFrame);

            if (!frameSamples) {
                // there weren't enough bytes
                break;
            }

            if (frameSamples instanceof Float32Array) {

                // copy the frameSamples to the asm.js heap
                HEAPF32.set(frameSamples, inBuf >> 2);
                bytesWritten = _opus_encode_float(encoder, inBuf, samplesInFrame, outBuf, maxPacketSize);

            } else if (frameSamples instanceof Int16Array) {

                // copy the frameSamples to the asm.js heap
                HEAP16.set(frameSamples, inBuf >> 1);
                bytesWritten = _opus_encode(encoder, inBuf, samplesInFrame, outBuf, maxPacketSize);

            }

            errorMessage = validate(bytesWritten);
            if (errorMessage) {
                throw new Error(errorMessage);
            }

            // get a coput of the output, create an OpusPacket and add it to the list
            var result = HEAPU8.buffer.slice(outBuf, outBuf + bytesWritten);
            opusPackets[opusPackets.length] = new OpusPacket(result, true);
        }

        return opusPackets;
    }

    // encoding entire audio file at once
    function encodeOpusPackets(track) {

        // create an encoder
        var numberOfChannels = track.channelData.length | 0,
            sampleRate = track.sampleRate | 0,
            encoder = createEncoder(sampleRate, numberOfChannels);

        // prepare encoder parameters
        var samplesInFrame = (960 / Math.floor(48000 / sampleRate)) | 0;
        var maxPacketSize = 4000 | 0,
            inputBufferSize = (samplesInFrame * numberOfChannels * Float32Array.BYTES_PER_ELEMENT) | 0;

        // create a deque that will help provide sample frames for the encoder
        // we have all of the audio data upfront; we will not have to append data for 'streaming' encoding later
        var deque = new SampleDeque(numberOfChannels, Float32Array);
        var interleaved = interleave(track.channelData);
        deque.enqueue(interleaved);

        try {
            // allocate space for the input and output buffers
            var outBuf = _malloc(maxPacketSize),
                inBuf = _malloc(inputBufferSize);

            // encode all audio data
            var opusPackets = encodePackets(encoder, deque, inBuf, outBuf, samplesInFrame, maxPacketSize, true);
        } catch (error) {
            throw error;
        }
        finally {
            _free(outBuf);
            _free(inBuf);
            _opus_encoder_destroy(encoder);
        }

        return {
            samplesPerPacket: samplesInFrame,
            packets: opusPackets
        };
    }

    //#endregion

    //#region Decoding

    function createDecoder(encodeRate, numberOfChannels) {

        var returnCode = _malloc(4 | 0);
        setValue(returnCode, 0, 'i32');

        var decoder = _opus_decoder_create(encodeRate, numberOfChannels, returnCode);

        var errorMessage = validate(getValue(returnCode, 'i32'));
        if (errorMessage) {
            throw new Error(errorMessage);
        }

        _free(returnCode);

        return decoder;
    }

    // TODO: try/catch to avoid memory leaks
    function decodeOpusPackets(header, encodeRate, packets) {

        var numberOfChannels = header.numberOfChannels | 0,
            sampleRate = header.sampleRate | 0;

        var decoder = createDecoder(encodeRate, numberOfChannels);

        var maxFrameSize = (120 * encodeRate / 1000) | 0;
        var maxPacketSize = 4000 | 0,
            outputBufferSize = (maxFrameSize * numberOfChannels * Float32Array.BYTES_PER_ELEMENT) | 0;

        // input and output buffers for decoding opus packets
        var inBuf = _malloc(maxPacketSize);
        var outBuf = _malloc(outputBufferSize);

        // storage for decoded audio samples
        var channelData = [], channel;

        // channelData is a list of channels:         [ left channel, right channel, ... ]
        //   each channel is a list of sample frames: [ sampleFrame1, sampleFrame2, sampleFrame3, ... ]
        //   each sample frame is a list of samples:  [ sample1, sample2, sample3, ... ]
        // this data structure allows us to append decoded audio samples to channelData quickly,
        // and handle each channel of audio separately while reconstructing the full audio file

        var decodedSampleCount, decodedBuffer, decodedSamples, decodedChannelData;
        for (var i = 0; i < packets.length; ++i) {
            // copy the packet to the asm.js heap
            var data = packets[i].buffer;
            HEAPU8.set(new Uint8Array(data), inBuf);

            // decode the packet
            decodedSampleCount = _opus_decode_float(decoder, inBuf, data.byteLength, outBuf, maxFrameSize, 0);

            var error = validate(decodedSampleCount);
            if (error) {
                throw new Error(error);
            }

            // copy the decoded sample frame bytes, wrap in a Float32 array, and deinterleave the samples
            decodedBuffer = HEAPU8.buffer.slice(outBuf, outBuf + (decodedSampleCount * numberOfChannels * Float32Array.BYTES_PER_ELEMENT));
            decodedSamples = new Float32Array(decodedBuffer);
            decodedChannelData = deinterleave(decodedSamples, numberOfChannels);

            // append the decoded audio samples to channelData quickly
            for (channel = 0; channel < numberOfChannels; ++channel) {
                if (!channelData[channel]) {
                    channelData[channel] = [];
                }

                channelData[channel].push(decodedChannelData[channel]);
            }
        }

        _free(outBuf);
        _free(inBuf);
        _opus_decoder_destroy(decoder);

        // reconstruct the full audio file
        for (channel = 0; channel < numberOfChannels; ++channel) {

            // get this channel's audio bytes
            var buffers = channelData[channel].map(function (typedArray, index) {
                return typedArray.buffer;
            });

            channelData[channel] = concat(buffers);
        }

        return channelData;
    }

    //#endregion

    //#region Container format (OggOpus)

    var PAGE_TYPE = {
        CONTINUED_PACKET: 0x01,
        BEGINNING_OF_STREAM: 0x02,
        END_OF_STREAM: 0x04
    };

    //#region CRC32

    var crcLookup = [
        0x00000000, 0x04c11db7, 0x09823b6e, 0x0d4326d9,
        0x130476dc, 0x17c56b6b, 0x1a864db2, 0x1e475005,
        0x2608edb8, 0x22c9f00f, 0x2f8ad6d6, 0x2b4bcb61,
        0x350c9b64, 0x31cd86d3, 0x3c8ea00a, 0x384fbdbd,
        0x4c11db70, 0x48d0c6c7, 0x4593e01e, 0x4152fda9,
        0x5f15adac, 0x5bd4b01b, 0x569796c2, 0x52568b75,
        0x6a1936c8, 0x6ed82b7f, 0x639b0da6, 0x675a1011,
        0x791d4014, 0x7ddc5da3, 0x709f7b7a, 0x745e66cd,
        0x9823b6e0, 0x9ce2ab57, 0x91a18d8e, 0x95609039,
        0x8b27c03c, 0x8fe6dd8b, 0x82a5fb52, 0x8664e6e5,
        0xbe2b5b58, 0xbaea46ef, 0xb7a96036, 0xb3687d81,
        0xad2f2d84, 0xa9ee3033, 0xa4ad16ea, 0xa06c0b5d,
        0xd4326d90, 0xd0f37027, 0xddb056fe, 0xd9714b49,
        0xc7361b4c, 0xc3f706fb, 0xceb42022, 0xca753d95,
        0xf23a8028, 0xf6fb9d9f, 0xfbb8bb46, 0xff79a6f1,
        0xe13ef6f4, 0xe5ffeb43, 0xe8bccd9a, 0xec7dd02d,
        0x34867077, 0x30476dc0, 0x3d044b19, 0x39c556ae,
        0x278206ab, 0x23431b1c, 0x2e003dc5, 0x2ac12072,
        0x128e9dcf, 0x164f8078, 0x1b0ca6a1, 0x1fcdbb16,
        0x018aeb13, 0x054bf6a4, 0x0808d07d, 0x0cc9cdca,
        0x7897ab07, 0x7c56b6b0, 0x71159069, 0x75d48dde,
        0x6b93dddb, 0x6f52c06c, 0x6211e6b5, 0x66d0fb02,
        0x5e9f46bf, 0x5a5e5b08, 0x571d7dd1, 0x53dc6066,
        0x4d9b3063, 0x495a2dd4, 0x44190b0d, 0x40d816ba,
        0xaca5c697, 0xa864db20, 0xa527fdf9, 0xa1e6e04e,
        0xbfa1b04b, 0xbb60adfc, 0xb6238b25, 0xb2e29692,
        0x8aad2b2f, 0x8e6c3698, 0x832f1041, 0x87ee0df6,
        0x99a95df3, 0x9d684044, 0x902b669d, 0x94ea7b2a,
        0xe0b41de7, 0xe4750050, 0xe9362689, 0xedf73b3e,
        0xf3b06b3b, 0xf771768c, 0xfa325055, 0xfef34de2,
        0xc6bcf05f, 0xc27dede8, 0xcf3ecb31, 0xcbffd686,
        0xd5b88683, 0xd1799b34, 0xdc3abded, 0xd8fba05a,
        0x690ce0ee, 0x6dcdfd59, 0x608edb80, 0x644fc637,
        0x7a089632, 0x7ec98b85, 0x738aad5c, 0x774bb0eb,
        0x4f040d56, 0x4bc510e1, 0x46863638, 0x42472b8f,
        0x5c007b8a, 0x58c1663d, 0x558240e4, 0x51435d53,
        0x251d3b9e, 0x21dc2629, 0x2c9f00f0, 0x285e1d47,
        0x36194d42, 0x32d850f5, 0x3f9b762c, 0x3b5a6b9b,
        0x0315d626, 0x07d4cb91, 0x0a97ed48, 0x0e56f0ff,
        0x1011a0fa, 0x14d0bd4d, 0x19939b94, 0x1d528623,
        0xf12f560e, 0xf5ee4bb9, 0xf8ad6d60, 0xfc6c70d7,
        0xe22b20d2, 0xe6ea3d65, 0xeba91bbc, 0xef68060b,
        0xd727bbb6, 0xd3e6a601, 0xdea580d8, 0xda649d6f,
        0xc423cd6a, 0xc0e2d0dd, 0xcda1f604, 0xc960ebb3,
        0xbd3e8d7e, 0xb9ff90c9, 0xb4bcb610, 0xb07daba7,
        0xae3afba2, 0xaafbe615, 0xa7b8c0cc, 0xa379dd7b,
        0x9b3660c6, 0x9ff77d71, 0x92b45ba8, 0x9675461f,
        0x8832161a, 0x8cf30bad, 0x81b02d74, 0x857130c3,
        0x5d8a9099, 0x594b8d2e, 0x5408abf7, 0x50c9b640,
        0x4e8ee645, 0x4a4ffbf2, 0x470cdd2b, 0x43cdc09c,
        0x7b827d21, 0x7f436096, 0x7200464f, 0x76c15bf8,
        0x68860bfd, 0x6c47164a, 0x61043093, 0x65c52d24,
        0x119b4be9, 0x155a565e, 0x18197087, 0x1cd86d30,
        0x029f3d35, 0x065e2082, 0x0b1d065b, 0x0fdc1bec,
        0x3793a651, 0x3352bbe6, 0x3e119d3f, 0x3ad08088,
        0x2497d08d, 0x2056cd3a, 0x2d15ebe3, 0x29d4f654,
        0xc5a92679, 0xc1683bce, 0xcc2b1d17, 0xc8ea00a0,
        0xd6ad50a5, 0xd26c4d12, 0xdf2f6bcb, 0xdbee767c,
        0xe3a1cbc1, 0xe760d676, 0xea23f0af, 0xeee2ed18,
        0xf0a5bd1d, 0xf464a0aa, 0xf9278673, 0xfde69bc4,
        0x89b8fd09, 0x8d79e0be, 0x803ac667, 0x84fbdbd0,
        0x9abc8bd5, 0x9e7d9662, 0x933eb0bb, 0x97ffad0c,
        0xafb010b1, 0xab710d06, 0xa6322bdf, 0xa2f33668,
        0xbcb4666d, 0xb8757bda, 0xb5365d03, 0xb1f740b4
    ];

    function crc32(bytes) {
        var i, crc = 0;

        for(i = 0; i < bytes.length; ++i) {
            crc= (crc << 8) ^ crcLookup[((crc >> 24) & 0xff) ^ bytes[i]];
        }

        return crc;
    }

    //#endregion

    //#region class OggStream

    // a collection of OggPages
    function OggStream(buffer) {
        this.view = new DataView(buffer);
        this.offset = 0;
    }

    // read all OggPackets from all OggPages in the stream
    OggStream.prototype.getPackets = function () {
        var packets = [],
            pageIterator = new OggPageIterator(this),
            packetIterator = new OggPacketIterator(pageIterator),
            i;

        while (packetIterator.next()) {
            packets[packets.length] = packetIterator.current();
        }

        return packets;
    };

    // returns a maximum number of OpusPackets, which contain a maximum number of OggSegments
    function getPackets(packets, offset, maxPacketCount, maxSegmentCount) {
        var packetCount = 0, segmentCount = 0, i = offset;

        // starting with the nth packet
        // count how many packets we have traversed
        // count how many segments each page we have traversed contains
        // when there are no more packets OR we have exceeded either maxPacketCount or maxSegmentCount,
        //   return [packets[n], packets[n + 1], ..., packets[n + packet count]]

        for (; i < packets.length && packetCount < maxPacketCount && segmentCount < maxSegmentCount; ++i) {
            ++packetCount;
            segmentCount += packets[i].toSegments().length;
        }

        return packets.slice(offset, offset + packetCount);
    }

    // get all of the OggSegments from the provided OggPackets
    function getSegments(packets) {
        var pagePacketsSegments, pageSegments;

        // get the corresponding segments
        pagePacketsSegments = packets.map(function (packet) {
            return packet.toSegments();
        });

        // flatten the segment arrats into one array
        pageSegments = [].concat.apply([], pagePacketsSegments);

        return pageSegments;
    }

    // construct a new Opus OggStream using Opus headers and packets
    OggStream.build = function (identificationHeader, commentHeader, packets, samplesPerPacket) {

        var serialNumber = 1234;

        var pages = [],
            sampleRate = 48000,
            previousGranulePosition = goog.math.Long.ZERO,
            page, offset, i, j, maxPacketsPerPage, maxSegmentsPerPage;

        // create pages which are at most 255 segments long, but should contain about 1 second of audio
        maxSegmentsPerPage = 255;
        maxPacketsPerPage = Math.min(maxSegmentsPerPage, sampleRate / samplesPerPacket);

        // attempt to pre-allocate space for our pages, starting with space for 1 header, 1 tags header, and enough OggPages to store all of our packets
        pages.length = 1 + 1 + Math.ceil(packets.length / maxPacketsPerPage);

        // the firest two pages are headers
        pages[0] = OggPage.build(serialNumber, 0, false, null, samplesPerPacket, new OpusPacket(identificationHeader.toArrayBuffer(), false).toSegments());
        pages[1] = OggPage.build(serialNumber, 1, false, null, samplesPerPacket, new OpusPacket(commentHeader.toArrayBuffer(), false).toSegments());

        for (i = 2, offset = 0; i < pages.length; ++i) {
            // get as many segments as will fit into a page
            var pagePackets = getPackets(packets, offset, maxPacketsPerPage, maxSegmentsPerPage),
                pageSegments = getSegments(pagePackets);

            offset += pagePackets.length;

            if (pagePackets.length < maxPacketsPerPage && offset < packets.length) {
                // we read fewer packets than expected, and there are more packets
                // this means that one or more our packets couldn't fit in the current page,
                // and we will need an additional page to store it
                ++pages.length;
            }

            // create an OggPage, put the packets into it
            page = pages[i] = OggPage.build(serialNumber, i, i === pages.length - 1, previousGranulePosition, samplesPerPacket, pageSegments);

            // update the granule position (Ogg's timing mechanism)
            if (page.hasCompletedPackets()) {
                previousGranulePosition = page.granulePosition;
            }
        }

        // concatenate all page's bytes into a single buffer
        var pageBuffers = pages.map(function (page) {
            return page.toArrayBuffer();
        });

        var buffer = concat(pageBuffers);

        // create a stream from the buffer
        return new OggStream(buffer);
    };

    //#endregion

    //#region class OggPageIterator

    // an iterator for pages in an OggStream
    function OggPageIterator(oggStream) {
        this.oggStream = oggStream;
        this._current = null;
    }

    // returns the current page
    OggPageIterator.prototype.current = function () {
        return this._current;
    };

    // advances to the next page
    // if there aren't any more pages to advance to, returns false; otherwise returns true
    OggPageIterator.prototype.next = function () {
        if (this.oggStream.offset >= this.oggStream.view.byteLength) {
            this._current = null;
            return false;
        }

        this._current = OggPage.fromStream(this.oggStream);

        return true;
    };

    //#endregion

    //#region class OggPacketIterator

    // an iterator for packets in an OggStream
    function OggPacketIterator(pageIterator) {
        this._pageIterator = pageIterator;

        this._currentSegmentIndex = 0;
        this._currentSegmentOffset = 0;
        this._current = null;
    }

    // returns the current packet
    OggPacketIterator.prototype.current = function () {
        return this._current;
    };

    // advances to the next packet
    // if there aren't any more packets to advance to, returns false; otherwise returns true
    OggPacketIterator.prototype.next = function () {
        var packetLength = 0, segmentLength = 0,
            currentPage,
            maxBytesInSegment = 255;

        // a packet is a collection of segments
        // each segment can up to 255 bytes long
        // each page contains 
        // a packet ends on a segment with a length less that 255

        // the page's segment table identifies a packet's length and location:
        /*
         * an example segment table:
         * [ 255,   3, 255, 255, 255,  42,  51, 255, 255, 211 ]
         *  |    0    |         1         | 2  |      3      |
         * 
         * from this example, we know that there are 10 segments; the segment table is 10 elements long
         * we also know that there are 4 packets; there are 4 elements in the segment table which are less than 255 (elements 1, 5, 6, and 9)
         *   packet 0 is composed of 2 segments, and is 258 bytes long (255 + 3),       and begins at byte    0 in the page body
         *   packet 1 is composed of 4 segments, and is 807 bytes long (255 * 3 + 42),  and begins at byte  258 in the page body
         *   packet 2 is composed of 1 segment,  and is  51 bytes long (51),            and begins at byte 1065 in the page body
         *   packet 3 is composed of 3 segments, and is 721 bytes long (255 * 2 + 211), and begins at byte 1116 in the page body
         */

        // _currentSegmentIndex tells us the current segment's location in the segment table
        // segmentLength is the value in that location

        // _currentSegmentOffset tells us the current packet's location in the body
        // packetLength is how many bytes the packet contains

        var segments = [];

        while (true) {

            if (this._pageIterator.current() && this._currentSegmentIndex >= this._pageIterator.current().segmentCount) {
                // reached last segment in page; continue reading this packet from the next page
                this._pageIterator.next()
                this._currentSegmentIndex = 0;
                this._currentSegmentOffset = 0;
            }

            if (!this._pageIterator.current() && !this._pageIterator.next()) {
                // we aren't on a page, and there are no more to read from
                break;
            }

            currentPage = this._pageIterator.current();

            // get the length of the current segment
            segmentLength = currentPage.segmentTable[this._currentSegmentIndex];
            packetLength += segmentLength;

            // a segment's data is just a view of a range of bytes in the page's body
            segments[segments.length] = new Uint8Array(currentPage.body.buffer, currentPage.body.byteOffset + this._currentSegmentOffset, segmentLength);

            // advance iterator to next segment
            this._currentSegmentIndex += 1;
            this._currentSegmentOffset += segmentLength;

            if (segmentLength < maxBytesInSegment) {
                // reached the end of the packet
                break;
            }
        }

        if (segments.length === 0) {
            // we didn't find any segments, so we obviously can't make a packet
            this._current = null;
            return false;
        }

        // create a buffer to hold the packet
        var bytes = new Uint8Array(new ArrayBuffer(packetLength)),
            packetOffset = 0,
            segment, i;

        // copy each segment into the packet buffer
        // we can't just bulk copy, because we may be reading from multiple pages (and each page has a separate buffer)
        for (i = 0; i < segments.length; ++i) {
            segment = segments[i];

            bytes.set(segment, packetOffset);
            packetOffset += segment.length;
        }

        this._current = new OpusPacket(bytes.buffer);

        return true;
    };

    //#endregion

    //#region class OpusPacket

    function OpusPacket(buffer, containsAudioData) {
        this.buffer = buffer;
        this._containsAudioData = !!containsAudioData;
    }

    // get the segments that makeup the packet
    OpusPacket.prototype.toSegments = function () {

        // memoized result for maximum laziness (this function is called many times on the same instance)
        if (this._segments) {
            return this._segments;
        }

        var offset, i, numberOfSaturatedSegments,
            segments = [];

        // calculate the number of segments we have
        // when a packet saturates all of its segments with data, it will look like this in the segment table:
        //   [ 255, 255, 255 ]
        // which means that we won't be able to tell where this packet ends, and the next begins
        // therfore, we must insert a 0-length segment to mark the end of a saturated packet
        // this allows us to determine that there wasn't just one big packet, but three separate ones:
        //   [ 255,   0, 255,   0, 255,   0 ]

        numberOfSaturatedSegments = Math.floor(this.buffer.byteLength / 255);
        segments.length = numberOfSaturatedSegments + 1;

        // split the packet into segments
        for (i = 0, offset = 0; i < segments.length; ++i, offset += 255) {
            segments[i] = {
                data: new Uint8Array(this.buffer, offset, Math.min(255, this.buffer.byteLength - offset)),
                first: false,
                last: false
            };
        }

        // mark first and last segment of the packet (necessary for when we add segments to an OggPage)
        segments[0].first = true;
        segments[segments.length - 1].last = true;

        // memoize the segments, then return them
        return this._segments = segments;
    };

    // indicates whether the packet holds audio data
    OpusPacket.prototype.isAudio = function () {
        return this._containsAudioData;
    };

    //#endregion

    //#region class OggPage

    function OggPage() {
        this.magic = 'OggS';
        this.version = 0;
        this.typeFlags = 0;
        this.granulePosition = goog.math.Long.ZERO;
        this.serialNumber = 0;
        this.sequenceNumber = 0;
        this.checksum = 0;
        this.segmentCount = 0;
        this.segmentTable = null;
        this.body = null;
    }

    // reads an OggPage from the OggStream's current position
    OggPage.fromStream = function (oggStream) {
        var page = new OggPage(),
            bodyLength;

        page.magic = 'OggS'; oggStream.offset += 4; // TODO: read from page
        page.version = oggStream.view.getUint8(oggStream.offset); oggStream.offset += 1;
        page.typeFlags = oggStream.view.getUint8(oggStream.offset); oggStream.offset += 1;

        var lowBits = oggStream.view.getUint32(oggStream.offset, true); oggStream.offset += 4;
        var highBits = oggStream.view.getUint32(oggStream.offset + 4, true); oggStream.offset += 4;
        page.granulePosition = new goog.math.Long(lowBits, highBits);

        page.serialNumber = oggStream.view.getUint32(oggStream.offset, true); oggStream.offset += 4;
        page.sequenceNumber = oggStream.view.getUint32(oggStream.offset, true); oggStream.offset += 4;
        page.checksum = oggStream.view.getUint32(oggStream.offset, true); oggStream.offset += 4;
        page.segmentCount = oggStream.view.getUint8(oggStream.offset); oggStream.offset += 1;
        page.segmentTable = new Uint8Array(oggStream.view.buffer, oggStream.offset, page.segmentCount); oggStream.offset += page.segmentCount;

        // calculate the body length using the segment table's values:
        // [255, 255, 42, 255, 51] => 255 + 255 + 42 + 255 + 51
        bodyLength = Array.prototype.reduce.call(page.segmentTable, function (length, segmentLength) {
            return length + segmentLength;
        }, 0);

        page.body = new Uint8Array(oggStream.view.buffer, oggStream.offset, bodyLength); oggStream.offset += bodyLength;

        return page;
    };

    // indicates whether the granulePosition should be advanced for the next page
    OggPage.prototype.hasCompletedPackets = function () {
        // NEG_ONE means that there is a single packet on this page, but it continues on the next page
        // ZERO means that there are no audio packets on this page
        return this.granulePosition.notEquals(goog.math.Long.NEG_ONE) && this.granulePosition.notEquals(goog.math.Long.ZERO);
    };

    OggPage.determineFlags = function (segments, sequenceNumber, isEndOfStream) {
        var flags = 0 | 0;

        if (!segments[0].first) {
            flags |= PAGE_TYPE.CONTINUED_PACKET;
        }

        if (sequenceNumber === 0) {
            flags |= PAGE_TYPE.BEGINNING_OF_STREAM;
        }

        if (isEndOfStream) {
            flags |= PAGE_TYPE.END_OF_STREAM;
        }

        return flags;
    };

    // computes a granule position, based on whether any packets were completed on this page and the number of samples per packet
    OggPage.determineGranulePosition = function (previousGranulePosition, samplesPerPacket, segments) {
        var numberOfCompletedPackets,
            samplesInPage,
            granulePosition;

        // the granule position is used for timing and synchronization
        // it represents the number of audio samples that have been completed on this and all previous pages

        // PS
        // knowing sample rate and a time, you can use granule position to seek through audio data quickly
        // e.g. if a user wants to seek to the 10th second of audio at 48 kHz,
        // then a decoder should look for the page with the highest sequence number with a granule position less than (48 kHz * 10 s =) 48,000,000

        if (previousGranulePosition === null) {
            // the current page is not audio data
            return goog.math.Long.ZERO;
        }

        numberOfCompletedPackets = segments.filter(function (segment) {
            return segment.last;
        }).length;

        if (numberOfCompletedPackets === 0) {
            // no audio data is completed on this page, special flag of 0xFFFFFFFFFFFFFFFF
            return goog.math.Long.NEG_ONE;
        }

        samplesInPage = goog.math.Long.fromNumber(numberOfCompletedPackets * samplesPerPacket);
        granulePosition = previousGranulePosition.add(samplesInPage);

        return granulePosition;
    };

    // fills the OggPage's segment table and body with data
    OggPage.prototype.fill = function (segments) {

        // calculate the body length using the segment table's values:
        // [255, 255, 42, 255, 51] => 255 + 255 + 42 + 255 + 51
        var bodyLength = segments.reduce(function (sum, segment) {
            return sum + segment.data.byteLength;
        }, 0);

        this.segmentCount = segments.length;
        this.segmentTable = new Uint8Array(new ArrayBuffer(segments.length));
        this.body = new Uint8Array(new ArrayBuffer(bodyLength));

        var segment;
        for (var i = 0, offset = 0; i < segments.length; ++i, offset += segment.length) {
            segment = segments[i].data;

            // set the segment table value
            this.segmentTable[i] = segment.length;
            // copy the segment data into the table body
            this.body.set(segment, offset);
        }
    };

    // converts the page (header + body) to an array buffer
    OggPage.prototype.toArrayBuffer = function () {

        var sizeOfMagic = 4,
            sizeOfVersion = 1,
            sizeOfFlags = 1,
            sizeOfGranulePosition = 8,
            sizeOfSerialNumber = 4,
            sizeOfSequenceNumber = 4,
            sizeOfChecksum = 4,
            sizeOfSegmentCount = 1,
            sizeOfSegmentTable = this.segmentTable.length,
            sizeOfBody = this.body.length;

        // allocate space for the header + body
        var buffer = new ArrayBuffer(sizeOfMagic + sizeOfVersion + sizeOfFlags + sizeOfGranulePosition + sizeOfSerialNumber +
                                     sizeOfSequenceNumber + sizeOfChecksum + sizeOfSegmentCount + sizeOfSegmentTable + sizeOfBody);

        // use a DataView to set the header values, and a Uint8Array to set the body values
        var dataView = new DataView(buffer),
            byteView = new Uint8Array(buffer),
            offset = 0, checksumOffset;

        // set the page data
        writeUTFBytes(dataView, offset, this.magic); offset += sizeOfMagic;
        dataView.setUint8(offset, this.version); offset += sizeOfVersion;
        dataView.setUint8(offset, this.typeFlags); offset += sizeOfFlags;
        dataView.setUint32(offset, this.granulePosition.getLowBits(), true); offset += sizeOfGranulePosition/2;
        dataView.setUint32(offset, this.granulePosition.getHighBits(), true); offset += sizeOfGranulePosition/2;
        dataView.setUint32(offset, this.serialNumber, true); offset += sizeOfSerialNumber;
        dataView.setUint32(offset, this.sequenceNumber, true); offset += sizeOfSequenceNumber;
        dataView.setUint32(offset, this.checksum, true); checksumOffset = offset, offset += sizeOfChecksum;
        dataView.setUint8(offset, this.segmentCount); offset += sizeOfSegmentCount;
        byteView.set(this.segmentTable, offset); offset += sizeOfSegmentTable;
        byteView.set(this.body, offset); offset += sizeOfBody;

        // the checksum is computed across the entire buffer, with the checksum itself initialized to 0
        this.checksum = crc32(byteView);
        dataView.setUint32(checksumOffset, this.checksum, true);

        return buffer;
    };

    // create a new OggPage using the supplied header info and data
    OggPage.build = function (streamSerialNumber, pageSequenceNumber, isLastPage, previousGranule, samplesPerPacket, segments) {

        var page = new OggPage();

        page.typeFlags = OggPage.determineFlags(segments, pageSequenceNumber, isLastPage);
        page.granulePosition = OggPage.determineGranulePosition(previousGranule, samplesPerPacket, segments);
        page.serialNumber = streamSerialNumber;
        page.sequenceNumber = pageSequenceNumber;
        page.fill(segments);

        return page;
    };

    //#endregion

    // write a string as UTF8 to a DataView
    function writeUTFBytes(view, offset, str) {
        var length = str.length;
        for (var i = 0; i < length; ++i) {
            view.setUint8(offset + i, str.charCodeAt(i));
        }
    }

    //#region class OpusIdentificationHeader

    // identifies an OggStream as opus audio
    function OpusIdentificationHeader() {
        this.magic = 'OpusHead';
        this.version = 1;
        this.numberOfChannels = 0;
        this.preSkip = 0;
        this.sampleRate = 0;
        this.gain = 0;
        this.channelMappingFamily = 0;
    }

    // allocate a buffer write the header values into it
    OpusIdentificationHeader.prototype.toArrayBuffer = function () {
        var buffer = new ArrayBuffer(8 + 1 + 1 + 2 + 4 + 2 + 1),
            view = new DataView(buffer);

        writeUTFBytes(view, 0, this.magic);
        view.setUint8(8, this.version);
        view.setUint8(9, this.numberOfChannels);
        view.setUint16(10, this.preSkip, true);
        view.setUint32(12, this.sampleRate, true);
        view.setUint16(16, this.gain, true);   // should actually be 16bit signed fixed point with 8 fractional bits...
        view.setUint8(18, this.channelMappingFamily, true);

        return buffer;
    };

    // create a new header with the specified values
    OpusIdentificationHeader.build = function (sampleRate, numberOfChannels, samplesPerPacket) {
        var header = new OpusIdentificationHeader();

        header.magic = 'OpusHead';
        header.version = 1;
        header.numberOfChannels = numberOfChannels;
        header.preSkip = samplesPerPacket * 2;
        header.sampleRate = sampleRate;        // original sample rate, just as metadata... not used for playback
        header.gain = 0;                       // logarimic gain; 0 -> no gain
        header.channelMappingFamily = 0;       // how to decode the output channel streams

        return header;
    };

    // read a new header from the contents of an OggPage
    OpusIdentificationHeader.fromPage = function (oggPage) {
        var header = new OpusIdentificationHeader(),
            view = new DataView(oggPage.body.buffer, oggPage.body.byteOffset, oggPage.body.byteLength),
            offset = 0;

        header.magic = 'OpusHead'; offset += 8; // TODO: read from page
        header.version = view.getUint8(offset); offset += 1;
        header.numberOfChannels = view.getUint8(offset); offset += 1;
        header.preSkip = view.getUint16(offset, true); offset += 2;
        header.sampleRate = view.getUint32(offset, true); offset += 4;
        header.gain = view.getUint16(offset, true); offset += 2;
        header.channelMappingFamily = view.getUint8(offset); offset += 1;

        return header;
    };

    //#endregion

    //#region class OpusCommentHeader

    // stores metadata for an opus OggStream
    function OpusCommentHeader() {
        this.magic = 'OpusTags';
        this.vendor = '';
        this.comments = [];
    }

    // allocate a buffer write the header values into it
    OpusCommentHeader.prototype.toArrayBuffer = function () {
        var totalCommentLength = this.comments.reduce(function (sum, comment) {
            return sum + comment.length;
        }, 0);

        var buffer = new ArrayBuffer(8 + 4 + this.vendor.length + 4 + (this.comments.length * 4) + totalCommentLength),
            view = new DataView(buffer);

        var offset = 0;
        writeUTFBytes(view, offset, this.magic); offset += 8;

        view.setUint32(offset, this.vendor.length, true); offset += 4;
        writeUTFBytes(view, offset, this.vendor); offset += this.vendor.length;

        view.setUint32(offset, this.comments.length, true); offset += this.comments.length;
        this.comments.forEach(function (comment) {
            view.setUint32(offset, comment.length, true); offset += 4;
            writeUTFBytes(view, offset, comment); offset += comment.length;
        });

        return buffer;
    };

    // create a new header with the specified values
    OpusCommentHeader.build = function (vendor, comments) {

        if (typeof vendor !== 'string') {
            vendor = '';
        }

        if (!Array.isArray(comments)) {
            comments = [];
        }

        var header = new OpusCommentHeader();

        header.vendor = vendor;
        header.comments = comments;

        return header;
    };

    // read a new header from the contents of an OggPage
    OpusCommentHeader.fromPage = function (oggPage) {
        var header = new OpusCommentHeader(),
            view = new DataView(oggPage.body.buffer, oggPage.body.byteOffset, oggPage.body.byteLength),
            offset = 0;

        // TODO: read from page

        return header;
    };

    //#endregion

    //#endregion

    var _container = {};

    // begin a encoding a stream
    function startOggOpus(id, sampleRate, numberOfChannels, format) {

        var encodeRate = getOpusEncodingRate(sampleRate);

        var maxPacketSize = 4000 | 0,
            samplesPerPacket = (20 * encodeRate / 1000) | 0;

        if (format !== 'float' && format !== 'int16') {
            throw new Error('unsupported opus input-PCM format');
        }

        var arrayType = format === 'int16' ? Int16Array : Float32Array;

        var instance = {
            id: id,
            sampleRate: sampleRate,
            encodeRate: encodeRate,
            numberOfChannels: numberOfChannels,
            samplesPerPacket: samplesPerPacket,
            arrayType: arrayType,
            deque: new SampleDeque(numberOfChannels, arrayType),
            encoder: createEncoder(encodeRate, numberOfChannels),
            maxPacketSize: maxPacketSize,
            outBuf: _malloc(maxPacketSize),
            inBuf: _malloc((samplesPerPacket * numberOfChannels * arrayType.BYTES_PER_ELEMENT) | 0),
            packets: [],
            resampler: new Resampler(sampleRate, encodeRate, numberOfChannels, encodeRate * numberOfChannels, false)
        };

        // store this encoder instance so that we may resume when more data is posted from the main thread
        _container[id] = instance;
    }

    function encodeAvailableAudioData(instance, padFrame) {
        // encode all available data, and store the resulting packets
        var packets = encodePackets(instance.encoder, instance.deque, instance.inBuf, instance.outBuf, instance.samplesPerPacket, instance.maxPacketSize, padFrame);
        instance.packets = instance.packets.concat(packets);
    }

    // continue encoding a stream
    function appendOggOpus(id, channelData) {

        var instance = _container[id];

        // interleave the sample, then resample it for opus
        // the resampler only works on floats, so we resample before converting
        var interleaved = interleave(channelData),
            resampled = new Float32Array(instance.resampler.resampler(interleaved));    // make a copy, because the resampler reuses it's buffer

        var converted = convertType(resampled, instance.arrayType);

        // enqueue the samples, then begin encoding them
        instance.deque.enqueue(converted);
        encodeAvailableAudioData(instance, false);
    }

    // end encoding a stream
    function endOggOpus(id) {

        // here we finish encoding the stream

        var instance = _container[id];
        delete _container[id];

        try {
            encodeAvailableAudioData(instance, true);
        } catch (error) {
            throw error;
        } finally {
            // cleanup
            _free(instance.outBuf);
            _free(instance.inBuf);
            _opus_encoder_destroy(instance.encoder);
        }

        // create opus headers
        var identificationHeader = OpusIdentificationHeader.build(instance.encodeRate, instance.numberOfChannels, instance.samplesPerPacket),
            commentHeader = OpusCommentHeader.build('libopus.js + WebAudio API');

        // create an opus stream
        var stream = OggStream.build(identificationHeader, commentHeader, instance.packets, instance.samplesPerPacket, null);

        return stream.view.buffer;
    }

    // encode a fixed amount of audio buffer
    function encodeOggOpus(track) {

        // encode the packets
        var encodedPackets = encodeOpusPackets(track),

            // create opus headers
            identificationHeader = OpusIdentificationHeader.build(track.sampleRate, track.channelData.length, encodedPackets.samplesPerPacket),
            commentHeader = OpusCommentHeader.build('libopus.js + WebAudio API');

        var stream = OggStream.build(identificationHeader, commentHeader, encodedPackets.packets, encodedPackets.samplesPerPacket);

        return stream.view.buffer;
    }

    function decodeOggOpus(buffer) {
        var stream = new OggStream(buffer),
            pageIterator = new OggPageIterator(stream),
            identificationHeader, commentHeader,
            packetIterator, encodeRate, sampleRate;

        pageIterator.next();
        identificationHeader = OpusIdentificationHeader.fromPage(pageIterator.current());

        pageIterator.next();
        commentHeader = OpusCommentHeader.fromPage(pageIterator.current());

        sampleRate = identificationHeader.sampleRate;
        encodeRate = getOpusEncodingRate(sampleRate);

        var channelData = decodeOpusPackets(identificationHeader, encodeRate, stream.getPackets()).map(function (buffer) {
            return new Float32Array(buffer);
        });

        return {
            channelData: channelData,
            sampleRate: sampleRate
        };
    }

    // exports
    worker.encoding.opus = {
        encode: encodeOggOpus,

        start: startOggOpus,
        append: appendOggOpus,
        end: endOggOpus,

        decode: decodeOggOpus
    };

})(self);
