//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
﻿(function (exports) {
    'use strict';

    // deque of interleaved sample arrays; reads a sample array of arbitrary length by combining multiple smaller byte arrays
    function SampleDeque(numberOfChannels, TypedArrayConstructor) {
        this.numberOfChannels = numberOfChannels;
        this.length = 0;

        this.TypedArray = TypedArrayConstructor;

        this._queue = [];
    }

    // add interleaved samples to the deque
    SampleDeque.prototype.enqueue = function (samples) {
        this._queue.push(samples);
        this.length += samples.length / this.numberOfChannels;
    };

    // attempt to dequeue a number of interleaved samples
    // when usePadding is false: if there are enough samples in the deque, returns a typedarray with those samples, otherwise returns false
    // when usePadding is true:  returns a typed array with as many samples are available, plus enough 0-padded samples to satisfy the request
    SampleDeque.prototype.tryDequeue = function (numberOfSamples, usePadding) {
        if (typeof usePadding !== 'boolean') {
            usePadding = false;
        }

        if (this.length <= 0 || (numberOfSamples > this.length && !usePadding)) {
            // not enough samples
            return false;
        }

        var TypedArray = this.TypedArray,
            sampleTotal = numberOfSamples * this.numberOfChannels,
            lengthTotal = this.length * this.numberOfChannels,
            samples = new TypedArray(sampleTotal),
            count = 0,
            length,
            current,
            n, segment;

        do {
            n = sampleTotal - count;    // the number of samples we still need
            current = this._queue[0];   // the buffer we are currently dequeueing from
            length = current.length;    // the length of the current buffer

            if (length <= n) {

                // the current sample frame will be consumed entirely
                segment = current;
                this._queue.shift();

            } else /*if (length > n)*/ {
                // get n samples, and advance the current buffer ahead n samples
                segment = current.subarray(0, n);
                this._queue[0] = current.subarray(n);
            }

            // copy from segment into samples; count is an offset, and is incremented at the end of each iteration
            samples.set(segment, count);

            // decrement length by number of samples read, increment count by same
            lengthTotal -= segment.length;
            count += segment.length;

        } while (count < sampleTotal && lengthTotal > 0);

        this.length = lengthTotal / this.numberOfChannels;

        // the rest of the returned buffer is implicitly padded with silence (it is initialized with 0s)

        return samples;
    };

    // exports

    exports.SampleDeque = SampleDeque;

})(typeof window !== 'undefined' ? window : self);
