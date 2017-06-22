//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
(function(Audio) {

    var appletEl = null;
    
    var Mixer = {
        onLoaded: new Util.Event.Custom(),
        onFailed: new Util.Event.Custom()
    };

    Mixer.getApplet = function() {
        return appletEl;
    };

    Mixer.init = function() {
        
        var appletConfig =
        {
            id: 'AIRMixer',
            codebase: window.javaFolder + 'AIRMixer/', // (e.x., "/student/Shared/Applets/AIRMixer/")
            code: 'air/org/mixer/AudioMixerApplet.class',
            archive: 'AIRAudioMixerApplet.jar',
            callback: 'TDS.Audio.Mixer.ready'
        };

        Util.Frame.injectApplet('mixerFrame', appletConfig);
    };

    // gets called when the applet is ready
    Mixer.ready = function(applet, event, data) {
        if (event == 'LOADED') {
            // initialize and fire event
            if (applet.initialize()) {
                appletEl = applet;
                Mixer.onLoaded.fire();
            } else {
                Mixer.onFailed.fire();
            }
        }
    };

    // is the mixer applet available
    Mixer.isAvailable = function() {
        return (appletEl != null);
    };

    // is the computer muted
    Mixer.isMuted = function() {
        if (this.isAvailable()) {
            return appletEl.isMuted();
        }
        return false;
    };

    // mute computer
    Mixer.mute = function() {
        if (this.isAvailable()) {
            appletEl.setMute(true);
        }
    };

    // unmute computer
    Mixer.unmute = function() {
        if (this.isAvailable()) {
            appletEl.setMute(false);
        }
    };

    TDS.Audio.Mixer = Mixer;

})(TDS.Audio);
