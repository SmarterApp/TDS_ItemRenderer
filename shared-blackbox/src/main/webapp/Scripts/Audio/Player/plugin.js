/*
This code takes the <a> audio links and makes them widgets.
*/

(function (Audio, CM) {

    var Player = Audio.Player;
    var Widget = Audio.Widget;

    function match(page, entity) {

        // get entity element
        var entityEl = entity.getElement();
        if (!entityEl) {
            return false;
        }

        // look for audio links
        return $('a.sound_explicit, a.sound_repeat, a.sound_cue, audio', entityEl).get();

    }

    function Plugin_Audio() {}

    CM.registerEntityPlugin('audio.player', Plugin_Audio, match);

    Plugin_Audio.prototype.load = function() {

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
            var isMCOption = $audio.closest('.optionSound').length > 0;
            var parentEl = audioEl.parentNode;
            var audio;
            var accProps = page.getAccommodationProperties();
            if (!isMCOption && accProps && accProps.isAudioRewindEnabled()) {
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

    Plugin_Audio.prototype.hide = function () {
        // if we are playing audio stop it
        if (Player.isPlaying()) {
            Player.stopAll();
        }
    };
    
})(TDS.Audio, window.ContentManager);
