/* 
This is the service layer for the AIR java applet recorder.
*/

(function(Audio) {

    var Recorder = Audio.Recorder;
    var JavaAPI = Audio.Java; // the applet API
    var JavaService = {}; // the service binding

    var defaultFormat = JavaAPI.Format.SPX;
    var defaultType = JavaAPI.Type.STUDENTRECORDING;
    var defaultDuration = 30;

    JavaService.getName = function() {
        return 'java';
    };

    JavaService.isSupported = function() {
        return true;
    };

    JavaService.initialize = function() {
        return JavaAPI.initialize(function() {
            Recorder.onDeviceReady.fire();
        });
    };

    JavaService.isReady = function() {
        return JavaAPI.isReady();
    };

    JavaService.startCapture = function(id, duration) {
        duration = duration || defaultDuration;
        return JavaAPI.startCapture(id, duration, defaultFormat, function(id, type, data) {
            if (type == JavaAPI.Event.RECORDING_START) {
                Recorder.onCaptureStart.fire(id);
            } else if (type == JavaAPI.Event.RECORDING_PROGRESS) {
                Recorder.onCaptureProgress.fire(id, data);
            } else if (type == JavaAPI.Event.RECORDING_DONE) {
                Recorder.onCaptureStop.fire(id);
            } else if (type == JavaAPI.Event.RECORDING_FAIL) {
                Recorder.onDeviceException.fire(id); // fatal..
            }
        });
    };

    JavaService.stopCapture = function() {
        return JavaAPI.stopCapture();
    };

    JavaService.playAudio = function(id) {
        return JavaAPI.playAudioClip(id, defaultFormat, defaultType, function(id, type, data) {
            if (type == JavaAPI.Event.PLAYING_START) {
                Recorder.onPlayStart.fire(id);
            } else if (type == JavaAPI.Event.PLAYING_DONE || 
                       type == JavaAPI.Event.PLAYING_STOPPED) {
                Recorder.onPlayStop.fire(id);
            } else if (type == JavaAPI.Event.PLAYING_FAIL) {
                Recorder.onDeviceException.fire(id); // fatal..
            }
        });
    };

    JavaService.stopAudio = function() {
        return JavaAPI.stopAudioClip();
    };

    JavaService.loadBase64Audio = function(id, base64) {
        return JavaAPI.loadBase64Audio(id, defaultFormat, defaultType, base64, function(id, type) {
            if (type == JavaAPI.Event.DECODE_COMPLETE) {
                Recorder.onCaptureLoad.fire(id);
            }
        });
    };

    // This method is called to retrieve the audio data as base64 encoded in the format requested
    JavaService.retrieveBase64Audio = function(id) {
        return JavaAPI.retrieveBase64Audio(id, defaultFormat); // WAVE, SPX
    };

    JavaService.retrieveQuality = function (id) {
        return JavaAPI.estimateQuality(id);
    };

    // register recorder with audio manager
    Recorder.register(JavaService);

})(TDS.Audio);

