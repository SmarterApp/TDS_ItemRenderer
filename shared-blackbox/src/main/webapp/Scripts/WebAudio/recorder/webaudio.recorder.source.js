(function (window, webAudio) {
    'use strict';

    function StreamContainer(stream) {
        this.stream = stream;
        this.streamSourceNode = webAudio.context.createMediaStreamSource(stream);
    }

    function RecorderSource(device) {

        device = device || {
            deviceId: null,
            label: ''
        };

        this.deviceId = device.deviceId;
        this.label = device.label;

        this._streamContainer = null;
    }

    RecorderSource.prototype.getStreamContainer = function (successCallback, errorCallback) {

        // constraints tested as of Crome 34, FF 29
        var constraints = {
            audio: {
                //samepleRate: webAudio.context.sampleRate, // not supported (Chrome exception, FF silence)
                //echoCancelation: true                     // not supported (Chrome exception, FF no effect)
            }
        };

        if (this.deviceId !== null) {
            constraints.audio.sourceId = this.deviceId;
        }

        // when calling get user media we need to wait for approval, on SB we need to do this with the API
        var self = this;
        window.navigator.getUserMedia(constraints, function (stream) {
            self._streamContainer = new StreamContainer(stream);
            successCallback(self._streamContainer);
        }, function (error) {
            // firefox passes a string
            // chrome passes an object with a name property
            if (typeof error !== 'string') {
                error = error.name;
            }
            if (typeof error !== 'string') {
                error = 'Unkown error';
            }
            errorCallback(error);
        });
    };

    // static

    RecorderSource.getAudioSources = function (callback) {

        if (typeof window.navigator.getMediaDevices !== 'function') {
            console.warn('device enumeration is not supported on this browser');
            callback([ new RecorderSource() ]);
            return;
        }

        window.navigator.getMediaDevices(function (devices) {
            var recorderSources, i = 0;

            recorderSources = devices.filter(function (d) {
                return d.kind === 'audioinput';
            }).map(function (d) {

                if (!d.label) {
                    d.label = 'audioinput' + (i++);
                }

                return new RecorderSource(d);
            });

            callback(recorderSources);
        });
    }

    // exports

    webAudio.RecorderSource = RecorderSource;

})(window, webAudio);
