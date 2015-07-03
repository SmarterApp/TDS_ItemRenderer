//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
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