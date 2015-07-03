//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
﻿/*

This is the generic API for certified SB's. Right now the only
browsers that implement this are:
- Certified

*/

// TTS service: certified browsers
function TTSService_Certified() {

    var that = this;
    this.browserComponent = null;
    this.rate = 20;
    this.pitch = 20;
    this.currentVolume = 10;
    this.voicepacks = [];
    this.currentVoice = '';
    this.pauseEnabled = true;

    this.supportsVolumeControl = function () {
        return false;
    };

    this.supportsPitchControl = function () {
        return false;
    };

    this.supportsRateControl = function () {
        return false;
    };

    this.isSupported = function () {
        if (this.getStatus() != TTS.Status.NotSupported) {
            return true;
        } else {
            return false;
        }
    };

    this.subscribe = function (EventManager) {
        //For subscribing to word events
    };

    this.loadVoices = function () {
        this.voicepacks = [];
        var voices = browser.tts.getVoices();

        if (voices) {
            for (var i = 0; i < voices.length; i++) {
                var voice = voices[i];
                // the eng and spa voice packs are added to database
                this.voicepacks.push(voice);
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
        // assume TTS is always enabled in Certified device/browser
        var status = this.getStatus();
        if (status == TTS.Status.Stopped) {
            this.loadVoices();
        }
        TTS.Manager.Events.onServiceLoad.fire();

        // ToDo? Amplify doesn't have EVENT_TTS_CHANGED to indicate when TTS being enabled/disabled changes 
        //this.browserComponent.listen(this.browserComponent.EVENT_TTS_CHANGED, document, function () {
        //    var service0 = that;
        //    var deviceStatus = service0.browserComponent.device.ttsEngineStatus;
        //    service0.status = convertDeviceStatusToTTStatus(deviceStatus);
        //});
        return true;
    };

    // Device Certification Required API #13
    this.getStatus = function () {
        if (browser && browser.tts && browser.tts.getStatus && (typeof browser.tts.getStatus == 'function')) {
            var currentStatus = browser.tts.getStatus();
            console.log('TTS certified.js currentStatus = ' + currentStatus);
            if (currentStatus == 'IDLE') return TTS.Status.Stopped;
            else if (currentStatus == 'SPEAKING') return TTS.Status.Playing;
            else if (currentStatus == 'UNAVAILABLE') return TTS.Status.NotSupported;
            else if (currentStatus == null || currentStatus == '') return TTS.Status.Unknown;
        }

        return TTS.Status.Uninitialized;
    };

    // subscribe for word tracking event
    this.subscribe = function (EventManager) {
        try {
            if (!EventManager) return;
            // this.unregisterAll();
            this.eM = EventManager;
            //ToDo #2: certified device/browser needs to define EVENT_TTS_SYNCHRONIZED to allow TTS pause/resume 
            //this.browserComponent.listen(this.browserComponent.EVENT_TTS_SYNCHRONIZED, document, function (result) {
            //    var service = that;
            //    if ((result) && (result.data)) {
            //        service.eM.fire({ index: result.data.location, length: result.data.length });
            //    }
            //});

        } catch (e) {
            console.error("Failed to subscribe to EventManager MSB tts events", e);
        }
    };

    // Device Certification Required API #11
    this.play = function (text) {
        try {
            var options = {
                'voicename': this.currentVoice,
                'volume': 1.0,
                'pitch': 1.0,
                'rate': 1.0
            };
            if (browser.tts.getVoices() == null) {
                // if there is no voice pack, do not pass it to the API call
                options = null;
            }
            browser.tts.speak(text, options, this.getStatus);
        }
        catch (ex) {
            return false;
        }
        return true;
    };

    // Device Certification Required API #15
    this.pause = function () {
        if (this.pauseEnabled) {
            browser.tts.pause();
            return true;
        } else {
            this.stop();
        }
    };

    // Device Certification Required API #16
    this.resume = function () {
        if (this.pauseEnabled) {
            browser.tts.resume();
            return true;
        } else {
            return false;
        }
    };

    // Device Certification Required API #12
    this.stop = function () {
        try {
            browser.tts.stop();
        }
        catch (ex) {
            return false;
        }
        return true;
    };

    // get the current volume
    this.getVolume = function () {
        return this.currentVolume;
    };

    this.setVolume = function (level) {
        this.currentVolume = level;
        return true;
    };

    // get the current pitch
    this.getPitch = function () {
        return this.pitch;
    };

    // set pitch to a new value
    this.setPitch = function (level) {
        this.pitch = level;
        return true;
    };

    // get the current rate
    this.getRate = function () {
        return this.rate;
    };

    // set rate to a new value
    this.setRate = function (level) {
        this.rate = level;
        return true;
    };

    // Device Certification Required API #14
    this.getVoices = function () {
        console.log('certified.js, line 225 - voicepacks.length: ' + this.voicepacks.length);
        if (this.voicepacks.length == 0) { // if there is no voice pack, return the default 'eng'
            return ['eng'];
        } else {
            return this.voicepacks;
        }
    };

    // get the current system voice
    this.getVoice = function () {
        console.log('certified.js, line 235 - currentVoice: ' + this.currentVoice);
        return this.currentVoice;
    };

    this.setVoice = function (voice) {
        this.currentVoice = voice;
        return true;
    };
}
