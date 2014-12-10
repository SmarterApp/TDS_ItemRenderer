/*
This code takes the <div> audio recorder and makes them widgets.
*/

(function(Audio, CM) {

    if (!CM) return;

    var Player = Audio.Player;
    var Recorder = Audio.Recorder;
    var Widget = Audio.Widget;

    // subscribe to when a microphone response type loads (we need look to setup microphone div)
    function _onItemRecorderAvailable(page, item) {
        
        if (!item.isResponseType('microphone')) {
            return;
        }
        
        // if the recorder has not been initialized then call it
        if (!Recorder.isInitialized()) {
            Recorder.initialize();
        }

        // get recorder div
        // var micDiv = item.element.ownerDocument.getElementById('elicited_' + item.position);
        var recorderID = 'elicited_' + item.position;
        var duration = (item.format.toUpperCase() == 'SER') ? 120 : 30; // SER is 2 mins, anything else is 30 secs
        var recorder = Widget.createRecorder(recorderID, duration);
        item.recorder = recorderID;

        recorder.controls.forEach(function (el) {
            item.addComponent(el);
        });

        // load an existing response once the device is ready
        if (item.value && item.value.length > 0) {
            Recorder.onDeviceReady.subscribeOnce(function() {
                Recorder.loadBase64Audio(recorderID, item.value);
            });
        }
    }

    // this is called when the context menu is requested
    function _onItemAudioContextMenuRecorder(page, item, menu) {
        
        // check if item is microphone response type
        if (!item.isResponseType('microphone')) {
            return;
        }
        
        // if audio is playing then don't show any recorder menu options
        if (Player.isPlaying()) {
            return;
        }

        // get recorder widget
        var micDiv = YUD.get('elicited_' + item.position);
        var id = micDiv.id;

        var recorderMenuItems = [];

        // check if we are recording
        if (Recorder.isCapturing()) {
            var menuLabel = Messages.get('TDSAudioJS.Label.StopRecording');
            recorderMenuItems.push({ text: menuLabel, classname: 'stoprecording', onclick: {
                fn: function() {
                    Recorder.stopCapture(id);
                }
            }});
        } else {
            // check if something is playing
            if (Recorder.isPlaying()) {
                // check if this recorder is playing
                if (YUD.hasClass(micDiv, 'playing_start')) {
                    var menuLabel = Messages.get('TDSAudioJS.Label.StopPlayRecording');
                    recorderMenuItems.push({ text: menuLabel, classname: 'stopquestion', onclick: {
                        fn: function() {
                            Recorder.stopAudio(id);
                        }
                    }});
                }
            } else {
                var menuLabel = Messages.get('TDSAudioJS.Label.StartRecording');
                recorderMenuItems.push({ text: menuLabel, classname: 'startrecording', onclick: {
                    fn: function() {
                        Recorder.startCapture(id);
                    }
                }});

                // check if audio was ever loaded into this recorder
                if (YUD.hasClass(micDiv, 'decode_complete') || 
                    YUD.hasClass(micDiv, 'recording_done') || 
                    YUD.hasClass(micDiv, 'playing_done') || 
                    YUD.hasClass(micDiv, 'playing_stopped')) {
                    var menuLabel = Messages.get('TDSAudioJS.Label.PlayRecording');
                    recorderMenuItems.push({ text: menuLabel, classname: 'playrecording', onclick: {
                        fn: function() {
                            Recorder.playAudio(id);
                        }
                    }});
                }
            }
        }

        // add each menu item
        for (var i = 0; i < recorderMenuItems.length; i++) {
            menu._entity.push(recorderMenuItems[i]);
        }
    }

    // apply event handlers for audio (NOTE: use passage/item instead of entity due to ordering issues) 
    CM.onItemEvent('available', _onItemRecorderAvailable);
    CM.onItemEvent('menushow', _onItemAudioContextMenuRecorder);

    // listen for when page is hidden
    CM.onPageEvent('hide', function (page) {
        
        // if we are capturing audio stop it
        if (Recorder.isPlaying()) {
            Recorder.stopAudio();
        }

        // if we are playing back captured audio stop it
        if (Recorder.isCapturing()) {
            Recorder.stopCapture();
        }

    });


})(TDS.Audio, window.ContentManager);

// RESPONSE HANDLER: Microphone
(function(Recorder, CM) {

    if (!CM) return;

    var getter = function(item, response) {

        var id = 'elicited_' + item.position;
        response.isAvailable = true;
        response.value = Recorder.retrieveBase64Audio(id);

        if (response.value != null) {
            response.isSelected = (response.value.length > 0);
            response.isValid = response.isSelected;
        }

        return response;
    };

    var setter = function(item, value) {
        var id = 'elicited_' + item.position;
        Recorder.loadBase64Audio(id, value);
    };

    // This is gone...
    // CM.registerResponseHandler('microphone', getter, setter);

})(window.TDS.Audio.Recorder, window.ContentManager);