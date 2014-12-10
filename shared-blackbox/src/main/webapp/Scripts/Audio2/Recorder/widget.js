/*
This code takes the <div> audio recorder and makes them widgets.
*/

(function(Audio, CM) {

    var Player = Audio.Player;
    var Recorder = Audio.Recorder;
    var Widget = Audio.Widget;

    function Recorder_Widget(page, item, config) {
    }

    CM.registerWidget('audio.recorder', Recorder_Widget, function (page, item) {
        var id = 'elicited_' + item.position;
        var el = document.getElementById(id);
        if (el) {
            return new CM.WidgetConfig(id, el, {
            });
        }
        return false;
    });

    Recorder_Widget.prototype.init = function () {

    };

    Recorder_Widget.prototype.load = function () {

        var item = this.entity,
            recorderID = this.id;

        // if the recorder has not been initialized then call it
        if (!Recorder.isInitialized()) {
            Recorder.initialize();
        }

        var duration = (item.format.toUpperCase() == 'SER') ? 120 : 30; // SER is 2 mins, anything else is 30 secs
        var recorder = Widget.createRecorder(recorderID, duration);
        item.recorder = recorderID;

        recorder.controls.forEach(function (el) {
            item.addComponent(el);
        });

        // load an existing response once the device is ready
        if (item.value && item.value.length > 0) {
            Recorder.onDeviceReady.subscribe(function () {
                Recorder.loadBase64Audio(recorderID, item.value);
            });
        }
    };

    Recorder_Widget.prototype.showMenu = function (contentMenu, evt, pageSelection) {

        var menu = contentMenu,
            item = this.entity;

        // if audio is playing then don't show any recorder menu options
        if (Player.isPlaying()) {
            return;
        }

        // get recorder widget
        var micDiv = YUD.get(this.id);
        var id = micDiv.id;

        var recorderMenuItems = [];

        // check if we are recording
        if (Recorder.isCapturing()) {
            var menuLabel = Messages.get('TDSAudioJS.Label.StopRecording');
            recorderMenuItems.push({
                text: menuLabel, classname: 'stoprecording', onclick: {
                    fn: function () {
                        Recorder.stopCapture(id);
                    }
                }
            });
        } else {
            // check if something is playing
            if (Recorder.isPlaying()) {
                // check if this recorder is playing
                if (YUD.hasClass(micDiv, 'playing_start')) {
                    var menuLabel = Messages.get('TDSAudioJS.Label.StopPlayRecording');
                    recorderMenuItems.push({
                        text: menuLabel, classname: 'stopquestion', onclick: {
                            fn: function () {
                                Recorder.stopAudio(id);
                            }
                        }
                    });
                }
            } else {
                var menuLabel = Messages.get('TDSAudioJS.Label.StartRecording');
                recorderMenuItems.push({
                    text: menuLabel, classname: 'startrecording', onclick: {
                        fn: function () {
                            Recorder.startCapture(id);
                        }
                    }
                });

                // check if audio was ever loaded into this recorder
                if (YUD.hasClass(micDiv, 'decode_complete') ||
                    YUD.hasClass(micDiv, 'recording_done') ||
                    YUD.hasClass(micDiv, 'playing_done') ||
                    YUD.hasClass(micDiv, 'playing_stopped')) {
                    var menuLabel = Messages.get('TDSAudioJS.Label.PlayRecording');
                    recorderMenuItems.push({
                        text: menuLabel, classname: 'playrecording', onclick: {
                            fn: function () {
                                Recorder.playAudio(id);
                            }
                        }
                    });
                }
            }
        }

        // add each menu item
        for (var i = 0; i < recorderMenuItems.length; i++) {
            menu._entity.push(recorderMenuItems[i]);
        }
    };

    Recorder_Widget.prototype.hide = function () {

        // if we are capturing audio stop it
        if (Recorder.isPlaying()) {
            Recorder.stopAudio();
        }

        // if we are playing back captured audio stop it
        if (Recorder.isCapturing()) {
            Recorder.stopCapture();
        }

    };

    Recorder_Widget.prototype.getResponse = function () {
        var value = Recorder.retrieveBase64Audio(this.id) || '',
            haveSound = value.length > 0;

        return this.createResponse(value, haveSound, haveSound);
    };

    Recorder_Widget.prototype.setResponse = function (value) {
        Recorder.loadBase64Audio(this.id, value);
    };

})(TDS.Audio, window.ContentManager);
