(function (window, webAudio) {
    'use strict';

    // https://code.google.com/p/chromium/issues/detail?id=338511
    webAudio.addPolyfill('navigator.getUserMedia', {
        fixesApi: true,
        bindToSelf: true,
        isSupported: function (normalize, native) {
            if (normalize('MediaStreamTrack.getSources').supported) {
                this.getUserMedia = native;
                return true;
            }

            return false;
        },
        polyfill: function (constraints, successCallback, errorCallback) {

            // audio: { sourceId: ... }
            //  changes to
            // audio: { optional: [{ sourceId: ... }] }
            if (typeof constraints.audio === 'object' && constraints.audio.sourceId) {
                constraints.audio.optional = constraints.audio.optional || [];
                constraints.audio.optional.push({ sourceId: constraints.audio.sourceId });
                delete constraints.audio.sourceId;
            }

            this.getUserMedia.call(navigator, constraints, successCallback, errorCallback);
        }
    });

    // https://code.google.com/p/chromium/issues/detail?id=338511
    webAudio.addPolyfill('navigator.getMediaDevices', {
        fixesApi: false,
        bindToSelf: false,
        isSupported: function (normalize) {
            return normalize('MediaStreamTrack.getSources').supported;
        },
        polyfill: function (callback) {
            window.MediaStreamTrack.getSources(function (devices) {
                devices = devices.map(function (d) {
                    return {
                        deviceId: d.id,
                        kind: d.kind + 'input',
                        label: d.label,
                        groupId: null
                    };
                });
                callback(devices);
            });
        }
    });

})(window, webAudio);