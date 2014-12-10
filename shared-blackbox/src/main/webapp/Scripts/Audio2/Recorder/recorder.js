TDS = window.TDS || {};
TDS.Audio = TDS.Audio || {};

(function(Audio) {

    var services = new TDS.Audio.Services();
    var service = null;
    
    var Recorder = {};

    function createEvent(fireOnce) {
        return new Util.Event.Custom(Recorder, fireOnce);
    }

    // CREATE EVENTS

    // this is fired after initialize is called
    Recorder.onDeviceInit = createEvent();

    // this is fired when the device is ready
    Recorder.onDeviceReady = createEvent(true);
    
    // this is fired anytime there is an error
    Recorder.onDeviceError = createEvent(); // id, detail
    
    // this is fired when an exception is thrown
    Recorder.onDeviceException = createEvent(); // id, exception
    
    // load the base64 data for a recording
    Recorder.onCaptureLoad = createEvent(); // id
    
    // capturing audio starts
    Recorder.onCaptureStart = createEvent(); // id
    
    // the current sound level when capturing is in progress 
    Recorder.onCaptureProgress = createEvent(); // id, level
    
    // capturing audio stops
    Recorder.onCaptureStop = createEvent(); // id
    
    // playback of captured audio starts
    Recorder.onPlayStart = createEvent(); // id
    
    // playback of captured audio stops
    Recorder.onPlayStop = createEvent(); // id

    var capturing = false;
    var playing = false;
    
    // LISTEN FOR EVENTS

    Recorder.onCaptureStop.subscribe(function() {
        capturing = false;
    });

    Recorder.onPlayStop.subscribe(function() {
        playing = false;
    });

    Recorder.onDeviceError.subscribe(function(id, detail) {
        capturing = false;
        playing = false;
        reinitialize();
    });

    // call this to process an exception
    function processException(id, ex, fatal) {
        setTimeout(function() {
            Recorder.onDeviceException.fire(id, ex, fatal);
        }, 0);
    }

    var deviceBroken = false;

    // if this is true then the device is broken and can no longer play
    Recorder.isDeviceBroken = function() {
        return deviceBroken;
    };

    Recorder.onDeviceException.subscribe(function(id, ex, fatal) {

        capturing = false;
        playing = false;

        // log console
        if (ex) {
            console.error(ex);
        }

        capturing = false;
        playing = false;

        // only try and reinitialize if the exception isn't fatal
        if (fatal) {
            deviceBroken = true;
        }
        else {
            reinitialize();
        }
    });

    // CREATE API

    Recorder.getServices = function() {
        return services;
    };

    Recorder.getSupportedService = function() {
        return service;
    };

    Recorder.isCapturing = function() {
        return capturing;
    };

    Recorder.isPlaying = function() {
        return playing;
    };

    // add a recorder service
    Recorder.register = services.register.bind(services);

    // has someone called initialize yet
    Recorder.isInitialized = function() {
        return service && service.isReady();
    };

    Recorder.initialize = function() {

        // SB7+ -> webaudio
        // SB6- -> sb
        services.prioritize(['webaudio', 'sb']);

        // get the first supported service
        service = services.getSupported();

        if (service) {
            console.info('Recorder service initializing: ' + service.getName());
            service.initialize();

            // get from session storage the selected input device
            Recorder.loadSourceFromSessionStorage();

            return true;
        } else {
            console.warn('Recorder service not found');
            return false;
        }
    };
    
    // call this internally to reinitialize if something fails
    function reinitialize() {
        setTimeout(function() {
            try {
                Recorder.initialize();
            } catch(ex) {
                processException(id, ex, true);
            }
        }, 0);
    }
    
    Recorder.isReady = function() {
        return service && service.isReady();
    };

    // start capturing audio for a specific ID
    Recorder.startCapture = function(id, duration) {

        // check if we are already capturing
        if (capturing || playing) return false;
        
        if (Recorder.isReady()) {
            try {
                return service.startCapture(id, duration) && (capturing = true);
            } catch(ex) {
                processException(id, ex);
            }
        }
        
        return false;
    };

    // stop capturing any audio
    Recorder.stopCapture = function() {
        
        if (Recorder.isReady() && capturing) {
            try {
                return service.stopCapture() && (capturing = false);
            } catch(ex) {
                processException(null, ex);
            }
        }
        
        return false;
    };

    Recorder.playAudio = function(id) {
        
        // check if we are already playing
        if (capturing || playing) return false;

        if (Recorder.isReady()) {
            try {
                return service.playAudio(id) && (playing = true);
            } catch(ex) {
                processException(id, ex);
            }
        }
        
        return false;
    };

    Recorder.stopAudio = function() {
        
        if (Recorder.isReady() && playing) {
            try {
                return service.stopAudio() && (playing = false);
            } catch(ex) {
                processException(null, ex);
            }
        }

        return false;
    };

    // load a previous base64 recording into recorder
    Recorder.loadBase64Audio = function(id, base64) {
        return (Recorder.isReady() && service.loadBase64Audio(id, base64));
    };

    // get captured audio as base64
    Recorder.retrieveBase64Audio = function(id, eventListener) {
        return (Recorder.isReady() && service.retrieveBase64Audio(id, eventListener));
    };

    Recorder.retrieveQuality = function (id, eventListener) {
        return (Recorder.isReady() && service.retrieveQuality(id, eventListener));
    };

    Recorder.getSources = function (callback) {
        return (Recorder.isReady() && service.getSources(callback)) || [];
    };

    Recorder.setSource = function (deviceId) {
        return Recorder.isReady() && service.setSource(deviceId);
    };

    var sessionStorageKey = 'Recorder-deviceId';

    Recorder.saveSourceInSessionStorage = function (deviceId) {
        Util.Storage.set(sessionStorageKey, deviceId);
    };

    Recorder.loadSourceFromSessionStorage = function () {
        // we need to make sure that the sources are enumerated before attempting to set the source to use
        Recorder.getSources(function () {
            var deviceId = Util.Storage.get(sessionStorageKey);
            Recorder.setSource(deviceId);
        });
    };

    Recorder.removeSourceFromSessionStorage = function () {
        Util.Storage.remove(sessionStorageKey);
    };

    Audio.Recorder = Recorder;

})(TDS.Audio);

// add error logging (note: need to put this in a better place)
(function(Diagnostics, Recorder) {

    if (!Diagnostics) return;

    function getLogs() {

        var logFormatter = [];

        var service = Recorder.getSupportedService();
        if (service && service.getName() == 'sb') {
            var logs = service.getLogs();
            for (var i = 0; i < logs.length; i++) {
                var log = logs[i];
                logFormatter.push(Util.Date.formatTime(log.timestamp));
                logFormatter.push(' - ');
                logFormatter.push(log.message);
                logFormatter.push('\n');
            }
        }

        return logFormatter.join('');
    }

    Recorder.onDeviceError.subscribe(function(id, detail) {
        var message = 'Recorder Error: ' + detail;
        if (id) {
            message += ' (' + id + ')';
        }
        Diagnostics.logServerError(message, getLogs());
    });

    Recorder.onDeviceException.subscribe(function(id, ex) {
        if (ex) {
            Diagnostics.report(ex);
        }
    });

})(TDS.Diagnostics, TDS.Audio.Recorder);
