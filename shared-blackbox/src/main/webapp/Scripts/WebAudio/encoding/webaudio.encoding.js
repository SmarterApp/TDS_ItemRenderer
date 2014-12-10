(function (window, webAudio) {
    "use strict";

    var containerFormats = {
        wav: {
            name: 'wav',
            extension: 'wav',
            type: 'audio/wav',
            format: 'int16'
        },
        opus: {
            name: 'opus',
            extension: 'ogg',   // spec recommends '.opus', but players don't know what that is
            type: 'audio/ogg; codecs="opus"',
            format: 'int16'
        }
    };

    var encodingWorker,
        nextId = 0,
        callbacks = {};

    function encode(track, encoder, options, complete, error, progress) {

        var id = nextId++;

        if (typeof options === 'function') {
            progress = error;
            error = complete;
            complete = options;
            options = {};
        }

        callbacks[id] = {
            complete: complete,
            encoder: encoder,
            error: error,
            progress: progress
        };

        var pcm = track.toPCM();
        var transferrable = pcm.channelData.map(function (typed) {
            return typed.buffer;
        });

        encodingWorker.postMessage({ command: 'encode', encoderName: encoder.name, track: pcm, options: options, id: id }, transferrable);
    }

    function createEncoder(format) {
        var id = nextId++;

        var encoder = new webAudio.Encoder(id, format, {
            start: startEncoding,
            append: appendData,
            end: endEncoding
        });

        callbacks[id] = encoder;

        return encoder;
    }

    function startEncoding(id, sampleRate, numberOfChannels) {
        var encoder = callbacks[id];

        encodingWorker.postMessage({
            command: 'start',
            encoderName: encoder.format.name,
            format: encoder.format.format,
            id: id,
            sampleRate: sampleRate,
            numberOfChannels: numberOfChannels
        });
    }

    function appendData(id, channelData) {
        var encoder = callbacks[id];

        var buffers = channelData.map(function (typedArray) {
            return typedArray.buffer;
        });

        encodingWorker.postMessage({
            command: 'append',
            encoderName: encoder.format.name,
            id: id,
            channelData: channelData
        }, buffers);
    }

    function endEncoding(id) {
        var encoder = callbacks[id];

        encodingWorker.postMessage({
            command: 'end',
            encoderName: encoder.format.name,
            id: id
        });
    }

    function decode(buffer, encoding, options, complete, error, progress) {

        var id = nextId++;

        if (typeof options === 'function') {
            progress = error;
            error = complete;
            complete = options;
            options = {};
        }

        callbacks[id] = {
            complete: complete,
            encoder: encoding,
            error: error,
            progress: progress
        };

        encodingWorker.postMessage({ command: 'decode', encoderName: encoding.name, track: buffer, options: options, id: id }, [buffer]);
    }

    function init(workerFactory, workerUrl) {
        encodingWorker = workerFactory.create(workerUrl);

        encodingWorker.addEventListener('message', function (event) {
            switch (event.data.command) {
                case 'log':
                    console.log(event.data.message);
                    break;

                case 'encode':
                case 'end':
                    switch (event.data.status) {
                        case 'complete':
                            encodingComplete(event.data.result, event.data.id, event.data.time);
                            break;
                        case 'error':
                            encodingError(event.data.error, event.data.id);
                            break;
                    }
                    break;

                case 'decode':
                    switch (event.data.status) {
                        case 'complete':
                            decodingComplete(event.data.result, event.data.id, event.data.time);
                            break;
                        case 'error':
                            decodingError(event.data.error, event.data.id);
                            break;
                    }
                    break;

                case 'resamplerequest':

                    var channelData = event.data.channelData,
                        sampleRate = event.data.sampleRate,
                        encodeRate = event.data.encodeRate,
                        numberOfChannels = event.data.numberOfChannels;

                    webAudio.Resampler.resample(channelData, sampleRate, encodeRate, numberOfChannels, function (channelData) {
                        var transferrables = channelData.map(function (typedArray) {
                            return typedArray.buffer;
                        });

                        encodingWorker.postMessage({ command: 'resampleresult', id: event.data.id, channelData: channelData }, transferrables);
                    });
                    break;
            }
        });

        encodingWorker.addEventListener('error', function (event) {
            console.log('encodingWorker error: ', event);
        });
    }

    function encodingComplete(buffer, id, time) {
        var callbackInfo;

        callbackInfo = callbacks[id];

        if (callbackInfo instanceof webAudio.Encoder) {
            callbackInfo._notify(buffer);
        } else {
            callbackInfo.complete(buffer, callbackInfo.encoder);
            delete callbacks[id];
        }
    }

    function encodingError(error, id) {
        var callbackInfo = callbacks[id];
        delete callbacks[id];

        if (callbackInfo instanceof webAudio.Encoder) {
            callbackInfo._notify(error);
        } else if (typeof callbackInfo.error === 'function') {
            callbackInfo.error(error);
        } else {
            console.error(error);
        }
    }

    function decodingComplete(track, id, time) {

        var callbackInfo,
            track = new webAudio.Track.fromPCM(track.channelData, track.sampleRate, webAudio.context);

        callbackInfo = callbacks[id];
        delete callbacks[id];

        callbackInfo.complete(track, callbackInfo.encoder);
    }

    function decodingError(error, id) {
        var callbackInfo = callbacks[id];
        delete callbacks[id];

        if (typeof callbackInfo.error === 'function') {
            callbackInfo.error(error);
        } else {
            console.error(error);
        }
    }

    function saveAs(filename) {
        return function (buffer, format) {
            var blob = new Blob([buffer], { type: format.type }),
                url = (window.URL || window.webkitURL).createObjectURL(blob),
                link = window.document.createElement('a'),
                click = document.createEvent("MouseEvents");

            link.href = url;
            link.download = filename + '.' + format.extension;
            click.initMouseEvent("click", true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
            link.dispatchEvent(click);
        };
    }

    // exports
    webAudio.encoding = {
        encode: encode,
        createEncoder: createEncoder,
        decode: decode,
        saveAs: saveAs,
        format: containerFormats,

        init: init
    };

})(window, webAudio);
