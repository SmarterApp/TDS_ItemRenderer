(function (window, webAudio) {
    var devicesAvailable = false,
        deviceCache,
        requestsForDevice = [];

    // this is called by the SB once the SecureBrowser.audioDevices array is loaded
    // this will happen every time getUserMedia is invoked
    window.AIRAudioRecorder = {
        audioDevicesAvailable: function () {
            devicesAvailable = true;

            // sometimes, SecureBrowser.audioDevices is cleared without notification
            // we keep a copy of it around just in case
            deviceCache = SecureBrowser.audioDevices.slice();

            if (requestsForDevice.length) {
                // we need to follow up by automatically granting permission to the requested device
                // this should be FIFO-like behavior, where the first request gets granted first
                // any other pending requests will be granted permission the next time this callback is invoked
                var request = requestsForDevice.shift();
                grantPermissionForDevice(request.constraints, request.device);
            }
        }
    };

    function getDeviceList() {
        var deviceList = SecureBrowser.audioDevices.length ? SecureBrowser.audioDevices :
                         deviceCache && deviceCache.length ? deviceCache :
                         [];

        return deviceList;
    }

    function grantPermissionForDevice(constraints, device) {
        // if they didn't request a device, we will give them the first by default
        if (!device) {
            var kind = constraints.video ? 'video' : 'audio';

            var devices = getDeviceList().filter(function (device) {
                return device.type === kind;
            });

            // try to find devices with 'default' or 'usb' in the name
            var preferredDevices = devices.map(function (device) {
                var match = device.name.match(/(default|usb)/i);
                return {
                    match: match,
                    device: device
                };
            }).filter(function (obj) {
                return !!obj.match;
            }).sort(function (obj1, obj2) {
                // we prefer devices marked as default over ones marked as usb
                if (obj1.match[1] === obj2.match[1]) {
                    return 0;
                } else if (obj1.match[1].toLowerCase() === 'default') {
                    return -1;
                } else if (obj2.match[1].toLowerCase() === 'default') {
                    return 1;
                }

                throw new Error('invalid matched value in device name');
            }).map(function (obj) {
                return obj.device;
            });

            // pick the first preferred device, if availabe; if not available, just pick the first device
            device = preferredDevices.length ? preferredDevices[0] : devices[0];
        }

        // grant permission to the selected device
        // this takes the place of the dialog prompting the user to allow the webpage to use the microphone
        SecureBrowser.selectAudioDevice(device);
    }

    function checkForAudioDevices(callback, timeout) {

        // we are polling for the device enumeration to be complete
        if (!devicesAvailable) {
            setTimeout(checkForAudioDevices.bind(null, callback, timeout), timeout);
            return;
        }

        var devices = getDeviceList().map(function (d) {
            return {
                deviceId: d.id,
                kind: d.type + 'input',
                label: d.name,
                groupId: null
            };
        });

        callback(devices);
    }

    webAudio.addPolyfill('navigator.getUserMedia', {
        fixesApi: true,
        bindToSelf: true,
        isSupported: function (normalize, native) {
            if (typeof SecureBrowser !== 'undefined' && SecureBrowser.audioDevices && SecureBrowser.selectAudioDevice) {
                this.getUserMedia = native;
                return true;
            }

            return false;
        },
        polyfill: function (constraints, successCallback, errorCallback) {

            var device = null;

            if (constraints.audio && constraints.audio.sourceId) {
                // grab the first device which has a matching id
                device = getDeviceList().filter(function (device) {
                    return device.id === constraints.audio.sourceId;
                })[0];

                if (!device) {
                    console.warn('unknown device requested, deviceId: "' + constraints.audio.sourceId + '"');
                }

                delete constraints.audio.sourceId;
            }

            // getUserMedia starts some async stuff, so we can't immediately grant permission to the device
            // instead, we store the device and later grant permission in the AIRAudioRecorder.audioDevicesAvailable callback
            requestsForDevice.push({
                constraints: constraints,
                device: device
            });

            this.getUserMedia.call(navigator, constraints, successCallback, errorCallback);
        }
    });

    webAudio.addPolyfill('navigator.getMediaDevices', {
        fixesApi: false,
        bindToSelf: false,
        isSupported: function (normalize) {
            if (typeof SecureBrowser !== 'undefined' && SecureBrowser.audioDevices) {
                return true;
            }

            return false;
        },
        polyfill: function (callback) {

            // first, we initiate population of SecureBrowser.audioDevices by calling navigator.getUserMedia
            window.navigator.getUserMedia({ audio: true }, function (stream) {
                // NOTE: This callback is not invoked until you call SecureBrowser.selectAudioDevice(device).
                // We don't actually want to capture audio right now, so stop the stream.
                stream.stop();
            }, function (error) {
                console.error('error enumerating devices for navigator.getUserMedia: ', error);
                // the SB will never call audioDevicesAvailable at this point so we fake it
                devicesAvailable = true;
                deviceCache = [];
            });

            // it can take a few seconds for FF to enumerate the devices, so we will asynchronously poll the SB object for devices
            // when ready, we will invoke the callback
            checkForAudioDevices(callback, 1000);
        }
    });

})(window, webAudio);
