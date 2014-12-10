(function (audio, webAudio) {

    function initWebAudio() {
        webAudio.init({
            workerFactory: Util.workerFactory,
            encodingWorkerUrl: TDS.resolveBaseUrl('Scripts/combined/webaudio-worker.js')
        });
    }

    var RecorderSingleton = audio.Recorder;

    var _recorders = {},
        _sources = [],
        _sourceDevice = null,
        _player;

    function createAndAddRecorder(id) {

        if (_recorders[id]) {
            return _recorders[id];
        }

        var recorder = new webAudio.Recorder({
            source: new webAudio.RecorderSource(_sourceDevice),
            streamingEncoderFormat: webAudio.encoding.format.opus
        });

        // store the wrapped recorder
        var wrapper = _recorders[id] = {
            id: id,
            recorder: recorder,
            timeout: null,
            encodedData: null
        };

        recorder.onbeforestop = function () {
            // pad with silence so that the old SB6.X recorder doesn't cut off the end of the recording
            recorder.encoder.appendSilence(1.0);
        };

        recorder.oncomplete = function (buffer) {
            var bytes = new Uint8Array(buffer),
                base64 = base64js.fromByteArray(bytes);

            wrapper.encodedData = base64;
            wrapper.track = null;

            // notify Recorder singleton that audio capture has completed
            RecorderSingleton.onCaptureStop.fire(id);
        };

        recorder.onerror = function (error) {
            // notify Recorder singleton that an error occurred with the recording
            // TODO: this is not a device error, but no other mechanism exists for error handling
            RecorderSingleton.onDeviceError.fire(id, error);
        };

        return wrapper;
    }

    function decodeBase64OggOpus(wrapper, callback, errorCallback) {

        if (wrapper.track instanceof webAudio.Track) {
            callback(wrapper.track);
            return;
        }

        var bytes;

        try {
            bytes = base64js.toByteArray(wrapper.encodedData);
        } catch (error) {
            errorCallback(error.toString());
            return;
        }

        webAudio.Track.fromArrayBuffer(bytes.buffer, webAudio.context, webAudio.encoding.format.opus, function (track) {
            if (track === null) {
                return;
            }

            track.name = wrapper.id;

            wrapper.track = track;

            callback(track);
        }, function (error) {
            errorCallback(error);
        });
    }

    var webAudioService = {

        getName: function () {
            return 'webaudio';
        },

        isSupported: function () {
            initWebAudio();
            return webAudio.isReady();
        },

        getLogs: function () {
            return [];
        },

        initialize: function () {
            initWebAudio();

            var isReady = webAudio.isReady();

            if (!isReady) {
                return;
            }

            _player = new webAudio.Player();

            _player.ontrackend = function (track) {
                var id = track.name;

                // notify Recorder singleton that an audio clip has finished playing
                RecorderSingleton.onPlayStop.fire(id);
            };

            RecorderSingleton.onDeviceReady.fire();
        },

        isReady: function () {
            return webAudio.isReady();
        },

        startCapture: function (id, duration) {

            var service = this,
                wrapper = createAndAddRecorder(id),
                recorder = wrapper.recorder;

            recorder.startRecording(function () {

                if (typeof duration !== 'number') {
                    // a default maximum duration
                    duration = 30;
                }

                wrapper.timeout = setTimeout(function () {
                    service.stopCapture();
                }, 1000 * duration);

                // notify Recorder singleton that audio capture has commenced
                RecorderSingleton.onCaptureStart.fire(id);

            }, function (error) {
                // notify Recorder singleton that an error occurred with the recording hardware
                RecorderSingleton.onDeviceError.fire(id, 'error starting capture:\n' + error.toString());
            }, function (error) {
                // notify Recorder singleton that an error occurred with the recording hardware
                RecorderSingleton.onDeviceError.fire(id, 'error acquiring capture device:\n' + error.toString());
            });

            // TODO: startCapture is an async API, it really should return a promise...
            return true;
        },

        stopCapture: function () {

            // get all of the recorder instances, then 
            var wrappers = Object.keys(_recorders).map(function (id) {
                return _recorders[id];
            });

            wrappers.forEach(function (wrapper) {

                var recorder = wrapper.recorder,
                    id = wrapper.id;

                if (recorder.isRecording()) {
                    // no longer need the timeout (either it was just fired, or we stopped before the timer limit is up)
                    if (wrapper.timeout !== null) {
                        clearTimeout(wrapper.timeout);
                        wrapper.timeout = null;
                    }

                    // stop the recording
                    recorder.stopRecording();
                }

                // notify Recorder singleton that audio capture has completed
                //RecorderSingleton.onCaptureStop.fire(id);
            });

            return true;
        },

        playAudio: function (id) {
            var wrapper = _recorders[id];

            if (wrapper.encodedData === null) {
                return false;
            }

            // decode the recording, then play it
            decodeBase64OggOpus(wrapper, function (track) {
                // change track, and pass true for autoPlay
                _player.changeTrack(track, true);

                RecorderSingleton.onPlayStart.fire(id);
            }, function (error) {
                RecorderSingleton.onDeviceError.fire(id, (error || 'unknown error').toString());
            });

            return true;
        },

        stopAudio: function () {
            var track = _player.getCurrentTrack(),
                id = track.name;

            _player.stop();

            // notify Recorder singleton that we have stopped playing an audio clip
            RecorderSingleton.onPlayStop.fire(id);

            return true;
        },

        loadBase64Audio: function (id, data) {
            var wrapper = createAndAddRecorder(id);

            wrapper.encodedData = data;
            wrapper.track = null;

            if (data.length === 0) {
                // there's no data, don't bother trying to decode it
                wrapper.encodedData = null;
                RecorderSingleton.onCaptureLoad.fire(id);
                return;
            }

            decodeBase64OggOpus(wrapper, function (track) {

                // we need to analyse the audio quality before this sound is ready
                var analyser = new webAudio.VoiceActivityDetector(track.sampleRate),
                    pcm = track.toPCM().channelData[0];

                analyser.processData(pcm, true);

                wrapper.loadedQuality = analyser.getQuality();

                // notify Recorder singleton that we have loaded and decoded an audio recording
                RecorderSingleton.onCaptureLoad.fire(id);
            }, function (error) {
                RecorderSingleton.onDeviceError.fire(id, (error || 'unknown error').toString());
            });
        },

        retrieveBase64Audio: function (id) {
            var wrapper = _recorders[id];

            return (wrapper && wrapper.encodedData) || null;
        },

        retrieveQuality: function (id) {
            var wrapper = _recorders[id];

            var quality = wrapper.recorder.getQuality();

            if (!quality) {
                // if the recording was loaded from base64, and we have not re-recorded anything yet
                // then we need to fallback to the quality of the loaded audio
                quality = wrapper.loadedQuality;
            }

            return quality;
        },

        getSources: function (callback) {
            if (typeof callback !== 'function') {
                return;
            }

            webAudio.RecorderSource.getAudioSources(function (sources) {
                // cache the sources for future reference in setSource
                _sources = sources.slice();

                callback(sources);
            });
        },

        setSource: function (deviceId) {
            var sources = _sources.filter(function (source) {
                return source.deviceId === deviceId;
            });

            if (sources.length === 0) {
                console.warn('invalid audio source device id "' + deviceId + '"');
                _sourceDevice = null;
                return;
            }

            var device = sources[0];

            _sourceDevice = {
                deviceId: device.deviceId,
                label: device.label
            };

            // change the source for all active recorders
            Object.keys(_recorders).forEach(function (key) {
                _recorders[key].recorder.setSourceDevice(_sourceDevice);
            });
        }
    };

    audio.Recorder.register(webAudioService);

})(TDS.Audio, webAudio);
