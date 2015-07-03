//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
﻿/*

This is the generic API for SB's. Right now the only
browsers that implement this are:
- iOS (2.0+)
- Android (1.0+)

NOTE: Check with Han on the specific versions.

*/

// TTS service: Generic Browser.
function TTSService_Generic() {

    var that = this;
    this.status = TTS.Status.Uninitialized;
    this.browserComponent = null;
    this.rate = 20;
    this.pitch = 20;
    this.currentVolume = 10;
    this.voicepacks = [];
    this.currentVoice = '';
    /*SB-1287: Removed check for SB version and checking android and IOS*/
    this.pauseEnabled = (Util.Browser.isAndroid() || Util.Browser.isIOS()) ? false : true; // pause and resume are not supported on Android Browser

    function convertDeviceStatusToTTStatus(deviceStatus) {
        if ('idle' == deviceStatus)
            return TTS.Status.Stopped;
        else if ('playing' == deviceStatus)
            return TTS.Status.Playing;
        else if ('unavailable' == deviceStatus)
            return TTS.Status.NotSupported;
        else
            return TTS.Status.Unknown;
    };

    this.supportsVolumeControl = function () {
        // we only allow volume control for TTS on iOS browser later than version 3.0
        return (Util.Browser.isIOS() && Util.Browser.getSecureVersion() > 3);
    };

    this.supportsPitchControl = function () {
        // we only allow pitch control for TTS on iOS browser later than version 3.0
        return (Util.Browser.isIOS() && Util.Browser.getSecureVersion() > 3);
    };

    this.supportsRateControl = function () {
        // we only allow rate control for TTS on iOS browser later than version 3.0
        return (Util.Browser.isIOS() && Util.Browser.getSecureVersion() > 3);
    };

    this.isSupported = function () {
        if (this.status != TTS.Status.NotSupported)
            return true;
        else
            return false;
    };

    this.subscribe = function(EventManager){
      //For subscribing to word events
    };

    this.loadVoices = function () {
        this.voicepacks = [];
        var voices = AIRMobile.tts.getVoices();
        if (voices) {
            for (var i = 0; i < voices.length; i++) {
                var voice = voices[i];
                if (voice.language) {
                    this.voicepacks.push(voice.language);
                }
            }
        }
    };

    // check if the voice packs supports a specified language
    this.hasVoicepack = function (language) {
        if (this.voicepacks.length == 0) return false;
        for (var i = 0; i < this.voicepacks.length; i++) {
            if (this.voicepacks[i] == language) {
                return true;
            }
        }
        return false;
    };

    this.load = function () {

        this.browserComponent = Util.SecureBrowser.getRunTime();
        // check if tts is enabled
        this.browserComponent.checkTextToSpeechStatus(null, (function () {
            var service = that;
            return function (statusData) {
                if (statusData.ttsEngineStatus == 'idle') {
                    service.status = TTS.Status.Stopped;
                    service.loadVoices();
                } else {
                    service.status = TTS.Status.NotSupported;
                }
                //we are now done with loading the service. tell others.
                TTS.Manager.Events.onServiceLoad.fire();
            };
        })());

        this.browserComponent.listen(this.browserComponent.EVENT_TTS_CHANGED, document, function () {
            var service = that;
            var deviceStatus = service.browserComponent.device.ttsEngineStatus;
            service.status = convertDeviceStatusToTTStatus(deviceStatus);
        });
        return true;
    };

    // get the SB status converted into a nice enum
    this.getStatus = function () {
        return this.status;
    };

    // subscribe for word tracking event
    this.subscribe = function (EventManager) {
        try {
            if (!EventManager) return;
            // this.unregisterAll();
            this.eM = EventManager;

            this.browserComponent.listen(this.browserComponent.EVENT_TTS_SYNCHRONIZED, document, function (result) {

                service = that;
                if ((result) && (result.data)) {
                    service.eM.fire({ index: result.data.location, length: result.data.length });
                }
            });

        } catch (e) {
            console.error("Failed to subscribe to EventManager MSB tts events", e);
        }
    };

    this.play = function (text) {
        try {
            var options = {
                language: this.currentVoice
            };
            if (this.browserComponent.tts.getVoices() == null) {
                // if there is no voice pack, do not pass it to the API call
                options = null;
            }
            this.browserComponent.tts.speak(text, options, function () {
                var service = that;
                // update tts status while playing back text
                service.status = convertDeviceStatusToTTStatus(service.browserComponent.device.ttsEngineStatus);
            });
        }
        catch (ex) {
            this.status = TTS.Status.Unknown;
            return false;
        }
        return true;
    };

    this.pause = function () {
        if (this.pauseEnabled) {
            this.browserComponent.tts.pause();
            this.status = TTS.Status.Paused;
            return true;
        } else {
            this.stop();
        }
    };

    this.resume = function () {
        if (this.pauseEnabled) {
            this.browserComponent.tts.resume();
            this.status = TTS.Status.Playing;
            return true;
        } else {
            return false;
        }
    };

    this.stop = function () {
        try {
            this.browserComponent.tts.stop(null, (function () {
                var service = that;
                return function (data) {
                    service.status = convertDeviceStatusToTTStatus(data.ttsEngineStatus);
                };
            })());
        }
        catch (ex) {
            this.status = TTS.Status.Stopped;
            return false;
        }
        return true;
    };

    // get the current volume
    this.getVolume = function () {
        // return this.currentVolume;
        return Math.min(this.browserComponent.tts.getVolume(), 10);
    };

    this.setVolume = function (level) {
        // this.currentVolume = level;
        if (typeof (level) != 'number') return false; // validate type
        if (level < 0 || level > 10) return false; // validate range
        if (this.getVolume() == level) return false;    // no need to change
        this.browserComponent.tts.setVolume(level);
        return true;
    };

    // get the current pitch
    this.getPitch = function () {
        // return this.pitch;
        return Math.min(this.browserComponent.tts.getPitch(), 20);
    };

    // set pitch to a new value
    this.setPitch = function (level) {
        // this.pitch = level;
        if (typeof (level) != 'number') return false; // validate type
        if (level < 0 || level > 20) return false; // validate range
        if (this.getPitch() == level) return false;    // no need to change
        this.browserComponent.tts.setPitch(level);
        return true;
    };

    // get the current rate
    this.getRate = function () {
        // return this.rate;
        return Math.min(this.browserComponent.tts.getRate(), 20);
    };

    // set rate to a new value
    this.setRate = function (level) {
        // this.rate = level;
        if (typeof (level) != 'number') return false; // validate type
        if (level < 0 || level > 20) return false; // validate range
        if (this.getRate() == level) return false;    // no need to change
        this.browserComponent.tts.setRate(level);
        return true;
    };

    this.getVoices = function () {
        if (this.voicepacks.length == 0) { // if there is no voice pack, return the default 'eng'
            return ['eng'];
        } else {
            return this.voicepacks;
        }
    };

    // get the current system voice
    this.getVoice = function () {
        return this.currentVoice;
    };

    this.setVoice = function (voice) {
        this.currentVoice = voice;
        return true;
    };
}
