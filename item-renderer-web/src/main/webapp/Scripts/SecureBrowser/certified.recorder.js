//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
﻿/*
This is AIR's API for certified browser API. Refer to mobile.recorder.js
*/

(function (SB) {

    function Recorder() {
        Recorder.superclass.constructor.call(this);

        var SBEvent = TDS.SecureBrowser.Base.Recorder.Event;
        SBEvent.DEVICE_READY = "IDLE";
        SBEvent.CAPTURE_START = SBEvent.CAPTURE_INPROGRESS;
        SBEvent.CAPTURE_END = "IDLE";
        SBEvent.PLAYBACK_STOPPED = "IDLE";
    }

    YAHOO.lang.extend(Recorder, TDS.SecureBrowser.Base.Recorder);

    Recorder.prototype.initialize = function (eventListener) {
        browser.recorder.initialize(function (event) {
            // Amplify device returns status as string in event, not in event.type, as required
            eventListener({ type: event });
        });
    };

    Recorder.prototype.getCapabilities = function () {
        var str = window.browser.recorder.getCapabilities(); // Device Certification Required API #19
        if (str && str.length > 0) {
            return JSON.parse(JSON.stringify(eval("(" + str + ")")));
        } else {
            return null;
        }
    };

    Recorder.prototype.getDefaultOptions = function () {
        var capabilities = this.getCapabilities();
        var devices = capabilities.supportedInputDevices;
        if (devices == null || devices.length == 0) {
            throw new Error('There are no supported input devices.');
        }
        var device = devices[0]; // first device is system default
        var channelCount = device.channelCounts;
        var sampleRate = device.sampleRates[0];
        var sampleSize = device.sampleSizes[0];
        var encodingFormat = device.formats[0];

        return {
            captureDevice: device.id, // id
            sampleRate: sampleRate,
            channelCount: channelCount,
            sampleSize: sampleSize,
            encodingFormat: encodingFormat,
            qualityIndicator: false,
            'progressFrequency': {
                size: 30,
                time: 2
            },
            'captureLimit': {
                'duration': 30,
                'size': 50
            }
        };
    };

    Recorder.prototype.getStatus = function () {
        return window.browser.recorder.getStatus(); // Device Certification Required API #18
    };

    Recorder.prototype.startCapture = function (options, eventListener) {
        options = YAHOO.lang.augmentObject(this.getDefaultOptions(), (options || {}));
        window.browser.recorder.startCapture(options, function (event) {
            // Amplify device returns status as string in event, not in event.type, as required
            eventListener({ type: event });
        }); // Device Certification Required API #20
    };

    Recorder.prototype.stopCapture = function () {
        window.browser.recorder.stopCapture(); // Device Certification Required API #21
    };

    Recorder.prototype.play = function (audioData, eventListener) {
        var b64audio = browser.recorder.retrieveAudio();
        browser.recorder.playback(b64audio, function (event) {
            // Amplify device returns status as string in event, not in event.type, as required
            eventListener({ type: event });
        });
    };

    Recorder.prototype.stopPlay = function () {
        window.browser.recorder.stopPlayback();
    };

    Recorder.prototype.pausePlay = function () {
        window.browser.recorder.pausePlayback();
    };

    Recorder.prototype.resumePlay = function () {
        window.browser.recorder.resumePlayback();
    };

    Recorder.prototype.retrieveAudioFileList = function (callback) {

        if (!callback) {
            throw new Error('This recorder does not support sync api call.');
        }
        window.browser.recorder.retrieveAudioFileList(function (event) {
            callback(event.files);
        });
    };

    Recorder.prototype.retrieveAudioFile = function (fileIdentifier, callback) {
        if (!callback) {
            throw new Error('This recorder does not supportsync api call.');
        }
        // we remove the DOM event to be consistent with Firefox
        window.browser.recorder.retrieveAudio(function (event) {
            callback(event.audioInfo);
        }); // Device Certification Required API #22
    };

    // public api
    SB.Certified.Recorder = Recorder;

})(TDS.SecureBrowser);


