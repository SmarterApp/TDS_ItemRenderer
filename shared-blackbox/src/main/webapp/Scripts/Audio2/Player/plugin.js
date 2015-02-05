
/*
This code takes the <a> audio links and makes them widgets.
*/

(function (Audio, CM) {

    var Player = Audio.Player;
    var Recorder = Audio.Recorder;
    var Widget = Audio.Widget;

    function Player_Plugin(page, config) {}

    function match(page, entity, content) {
        var entityEl = entity.getElement();
        if (entityEl) {
            var audioElements = $('audio, div.tds-audio', entityEl) // get <audio> elements
                             .not('.slides_audio')                  // which aren't slideshow audio
                             .add('a.sound_explicit, a.sound_repeat, a.sound_cue', entityEl)    // include <a> which are configured with audio data
                             .get();

            if (audioElements.length > 0) {
                return audioElements;
            };
        }
        return false;
    }

    CM.registerEntityPlugin('audio.player', Player_Plugin, match, {
        priority: 300,
        defer: true
    });

    Player_Plugin.prototype.load = function () {

        var page = this.page,
            entity = this.entity,
            audioElements = this.config;

        audioElements.forEach(function (audioEl) {

            var $audio = $(audioEl);

            // HACK: There is only styles for 'sound_repeat' and if we do try and target 'sound_explicit' 
            // with CSS we might affect sound icons in options which use 'sound_explicit'
            if ($audio.hasClass('sound_explicit')) {
                $audio.addClass('sound_repeat');
            }

            // get auto play info
            var autoplay = audioEl.getAttribute('autoplay');
            autoplay = (autoplay) ? (autoplay.toLowerCase() == 'true') : false;

            // create audio widget
            var audio,
                isMCOption = $audio.closest('.optionSound').length > 0,
                accProps = page.getAccommodationProperties();

            if (!isMCOption && accProps && accProps.isAudioScrubberEnabled()) {
                // widget has play/pause and scrubber
                audio = Widget.createPlayerScrubber(audioEl);
            } else if (!isMCOption && accProps && accProps.isAudioRewindEnabled()) {
                // widget has play/pause and rewind
                audio = Widget.createPlayerRewind(audioEl);
            } else {
                // widget only has play/pause
                audio = Widget.createPlayer(audioEl);
            }

            // add all tabbable components
            audio.controls.forEach(function (el) {
                entity.addComponent(el);
            });

            // check if widget was created
            if (audio) {

                // track widget id created for this entity (not really used)
                entity.audioLinks.push(audio.id);

                // if autoplay is set true then add into queue
                // BUG 119152: Don't autoplay in accessibility shell
                if (autoplay && !CM.isAccessibilityEnabled()) {
                    page.autoPlayQueue.append(audio.id);
                }

            } else {
                $audio.addClass('disabled');
            }
        });
    };
    
    Player_Plugin.prototype.hide = function () {
        // if we are playing audio stop it
        if (Player.isPlaying()) {
            Player.stopAll();
        }
    };

})(TDS.Audio, window.ContentManager);
