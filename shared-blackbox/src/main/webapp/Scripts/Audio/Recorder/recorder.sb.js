/* 
This is the service layer for the AIR SB audio recorders:
- TDS.SecureBrowser.Firefox.Recorder
- TDS.SecureBrowser.Mobile.Recorder
*/

(function(Audio) {

    var Recorder = Audio.Recorder;
    var SBEvent = TDS.SecureBrowser.Base.Recorder.Event;
    var SBAPI = null; // the sb API
    var SBService = {}; // the service binding

    var ready = false;
    var defaultDuration = 30;
    var defaultOptions = null;

    function setDefaultOptions() {
        
        var capabilities = SBAPI.getCapabilities();
        var devices = capabilities.supportedInputDevices;
        if (devices == null || devices.length == 0) {
            throw new Error('There are no supported input devices.');
        }
        var device = devices[0]; // first device is system default
        var channelCount = device.channelCounts[0];
        var sampleRate = device.sampleRates[0];
        var sampleSize = device.sampleSizes[0];

        defaultOptions = {
            captureDevice: device.id, // id
            channelCount: channelCount,
            sampleRate: sampleRate,
            sampleSize: sampleSize,
            encodingFormat: 'OPUS',
            qualityIndicator: true
        };
        
        console.log('SB Recorder Device: ', device);
    }
    
    SBService.getName = function() {
        return 'sb';
    };

    SBService.isSupported = function() {
        return (TDS.SecureBrowser.getRecorder() != null);
    };

    SBService.getLogs = function() {
        return SBAPI.getLogs();
    };

    SBService.initialize = function() {

        ready = false;
        SBAPI = TDS.SecureBrowser.getRecorder();

        Recorder.onDeviceInit.fire();

        // assign a global event
        SBAPI.initialize(function(event) {

            if (event.type == SBEvent.DEVICE_READY) {
                try {
                    // get capabilities and set the default options
                    ready = true;
                    Recorder.onDeviceReady.fire();
                } catch(ex) {
                    Recorder.onDeviceException.fire(null, ex, true); // fatal exception...
                }
            }
            // check for initialize error
            else if (event.type == SBEvent.DEVICE_ERROR && Util.String.contains(event.data, 'Error during initialize')) {
                // Recorder.onDeviceError.fire(null, 'Failed to initialize - ' + event.data);
                Recorder.onDeviceException.fire(null, null, true); // fatal exception...
            }
        });
    };

    SBService.isReady = function() {
        return ready;
    };

    SBService.startCapture = function(id, duration) {

        // check if default options are set
        if (defaultOptions == null) {
            setDefaultOptions();
        }

        // build capture options
        var options = JSON.parse(JSON.stringify(defaultOptions)); // clone
        options = YAHOO.lang.augmentObject(options, {
            filename: id,
            captureLimit: {
                duration: (YAHOO.lang.isNumber(duration) ? duration : defaultDuration)
            },
            progressFrequency: { // get error in debug mode if we don't include this...
                type: 'time',
                interval: 99999
            }
        });

        console.log('SB Recorder Capture: ', options);

        // call SB API to begin capture
        SBAPI.startCapture(options, function(event) {
            if (event.type == SBEvent.CAPTURE_START) {
                Recorder.onCaptureStart.fire(id);
            } else if (event.type == SBEvent.CAPTURE_END) {
                Recorder.onCaptureStop.fire(id);
            } else if (event.type == SBEvent.DEVICE_ERROR) {
                Recorder.onDeviceError.fire(id, event.data);
            }
        });

        return true;
    };

    SBService.stopCapture = function() {
        SBAPI.stopCapture();
        return true;
    };

    SBService.playAudio = function(id) {

        var audioData = {            
            type: 'filename',
            filename: id
        };
        
        SBAPI.play(audioData, function(event) {
            if (event.type == SBEvent.PLAYBACK_START) {
                Recorder.onPlayStart.fire(id);
            } else if (event.type == SBEvent.PLAYBACK_STOPPED) {
                Recorder.onPlayStop.fire(id);
            } else if (event.type == SBEvent.DEVICE_ERROR) {
                Recorder.onDeviceError.fire(id, event.data);
            }
        });

        return true;
    };

    SBService.stopAudio = function() {
        SBAPI.stopPlay();
        return true;
    };

    SBService.loadBase64Audio = function(id, base64) {
        return SBAPI.loadAudioFile(id, base64, function() {
            Recorder.onCaptureLoad.fire(id);
        });
    };

    // This method is called to retrieve the audio data as base64 encoded in the format requested
    SBService.retrieveBase64Audio = function(id) {
        var data = SBAPI.retrieveAudioFile(id); // passing in no callback means use sync
        if (data && data.base64) {
            return data.base64;
        }
        return null;
    };

    SBService.retrieveQuality = function (id) {
        var data = SBAPI.retrieveAudioFile(id); // passing in no callback means use sync
        if (data && data.qualityIndicator) {
            return data.qualityIndicator;
        }
        return null;
    };

    SBService.getSources = function (callback) {
        if (typeof callback === 'function') {
            callback([defaultOptions.captureDevice.toString()]);
        }
    };

    SBService.getSources = function (deviceId) {
        return defaultOptions.captureDevice.toString() === deviceId;
    };

    // register recorder with audio manager
    Recorder.register(SBService);

})(TDS.Audio);

