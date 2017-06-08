//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
﻿// this script is a bootstrap; loading the rest of the worker scripts in order is important
importScripts(
    'worker.webaudio.js',

    'webaudio.sampledeque.js',
    'webaudio.messagequeue.js',
    '../lib/resampler.js',

    'worker.webaudio.encoder.wav.js',

    '../lib/libopus.js',
    '../lib/goog.math.Long.js',
    'worker.webaudio.encoder.opus.js'
);
