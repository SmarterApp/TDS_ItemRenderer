// this script is a bootstrap; loading the rest of the worker scripts in order is important
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
