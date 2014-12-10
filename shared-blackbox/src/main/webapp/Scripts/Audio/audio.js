TDS = window.TDS || {};
TDS.Audio = TDS.Audio || {};

(function(Audio) {

    // is something playing or recording?
    Audio.isActive = function() {

        if (Audio.Player && Audio.Player.isPlaying()) {
            return true;
        }

        if (Audio.Recorder && (Audio.Recorder.isCapturing() || Audio.Recorder.isPlaying())) {
            return true;
        }

        return false;

    };

    // stop all playing and recording
    Audio.stopAll = function() {

        if (Audio.Player && Audio.Player.isPlaying()) {
            Audio.Player.stopAll();
        }
        
        if (Audio.Recorder) {
            
            if (Audio.Recorder.isCapturing()) {
                Audio.Recorder.stopCapture();
            }
            else if (Audio.Recorder.isPlaying()) {
                Audio.Recorder.stopAudio();
            }
        }
        
    };

})(TDS.Audio);