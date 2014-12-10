TDS = window.TDS || {};
TDS.Audio = TDS.Audio || {};

(function (Audio) {

    var SM = window.soundManager;

    // this allows Flash to be disabled (it has to be set as early as possible..)
    // BUG: https://bugz.airws.org/default.asp?73094
    SM.audioFormats.mp3.required = false;

    // if this is true we had to reboot SM2 because Flash failed 
    var rebooted = false;

    var Player = {};

    function createEvent() {
        return new Util.Event.Custom(this);
    }

    // fired right before playing sound
    Player.onBeforePlay = createEvent();

    // fired when playing sound
    Player.onPlay = createEvent();

    // fired when audio pauses
    Player.onPause = createEvent();

    // fired right before audio resumes
    Player.onBeforeResume = createEvent();

    // fired when audio resume
    Player.onResume = createEvent();

    // fired when sound is manually stopped
    Player.onStop = createEvent();

    // fired when sound finishes on its own
    Player.onFinish = createEvent();

    // fired when sound is stopped explicitly or finishes playing
    Player.onIdle = createEvent();

    // fired when audio fails to load
    Player.onFail = createEvent();

    function setup(flashPath) {

        SM.setup({
            url: flashPath,
            flashVersion: 9, // plays more modern audio
            preferFlash: false, // setting this to false prefers HTML5
            useHTML5Audio: true // the default is true but just to be clear
        });

        // this gets fired when SM has loaded
        SM.ontimeout(function () {
            console.warn('AudioManager Error: SM2 timeout');
            if (!rebooted) {
                rebooted = true;
                setTimeout(function () {
                    SM.reboot();
                }, 1000);
            }
        });
    }

    function _onLoad(success) {
        if (success === false) {
            console.log('AUDIO FAILED: ' + this.id);
            YAHOO.lang.later(0, Player.onFail, Player.onFail.fire, this.id);
        }
    }

    function _onPlay() {
        console.log('AUDIO PLAY: ' + this.id);
        YAHOO.lang.later(0, Player.onPlay, Player.onPlay.fire, this.id);
    }

    function _onPause() {
        console.log('AUDIO PAUSE: ' + this.id);
        YAHOO.lang.later(0, Player.onPause, Player.onPause.fire, this.id);
    };

    function _onResume() {
        console.log('AUDIO RESUME: ' + this.id);
        YAHOO.lang.later(0, Player.onResume, Player.onResume.fire, this.id);
    };

    function _onStop() {
        console.log('AUDIO STOP: ' + this.id);
        YAHOO.lang.later(0, Player.onStop, Player.onStop.fire, this.id);
        YAHOO.lang.later(0, Player.onIdle, Player.onIdle.fire, this.id);
    }

    function _onFinish() {
        console.log('AUDIO FINISH: ' + this.id);
        YAHOO.lang.later(0, Player.onFinish, Player.onFinish.fire, this.id);
        YAHOO.lang.later(0, Player.onIdle, Player.onIdle.fire, this.id);
    };

    function _onFailure() {
        console.log('AUDIO FAILURE: ' + this.id);
        YAHOO.lang.later(0, Player.onFail, Player.onFail.fire, this.id);
    };

    // process a sm2 sound object
    function attachEvents(options) {
        options.onload = _onLoad;
        options.onplay = _onPlay;
        options.onpause = _onPause;
        options.onresume = _onResume;
        options.onstop = _onStop;
        options.onfinish = _onFinish;
        options.onfailure = _onFailure;
    }

    // parse audio MIME type from url
    function parseMIMEType(url) {
        if (url) {
            if (Util.String.contains(url, '.mp3')) {
                return 'audio/mpeg';
            } else if (Util.String.contains(url, '.m4a')) {
                return 'audio/mp4';
            } else if (Util.String.contains(url, '.ogg')) {
                return 'audio/ogg';
            } else if (Util.String.contains(url, '.oga')) {
                return 'audio/ogg';
            } else if (Util.String.contains(url, '.webma')) {
                return 'audio/webm';
            } else if (Util.String.contains(url, '.wav')) {
                return 'audio/wav';
            }
        }
        return '';
    }

    // parse all the audio url's from an element
    function parseSources(el) {

        var sources = [];

        if (el.nodeName == 'A') {
            var url = decodeURIComponent(el.href);
            var type = parseMIMEType(url) || el.getAttribute('type'); // NOTE: Can't use 'type' attribute doesn't get updated for m4a, breaks IE 10
            sources.push({
                url: url,
                type: type
            });
        } else if (el.nodeName == 'AUDIO') {
            for (var i = 0; i < el.children.length; ++i) {
                var source = el.children[i];
                sources.push({
                    url: decodeURIComponent(source.src),
                    type: source.type
                });
            }
        }

        return sources;
    };

    // parse all the audio url's from an element and 
    // return only the one that can be played on this browser
    function findPlayableSource(el) {

        var sources = parseSources(el);

        for (var i = 0; i < sources.length; i++) {

            var source = sources[i];

            // check if this browser can play the url or type
            if (SM.canPlayURL(source.url) ||
                SM.canPlayMIME(source.type)) {
                return source;
            }
        }

        return null;
    }

    // create sm2 sound
    function createSound(id, url) {

        if (SM.getSoundById(id)) {
            return false;
        }

        var options = {
            id: id,
            url: url
        };

        attachEvents(options);
        SM.createSound(options);
        return id;
    }

    // create sm2 sound using information from dom element
    function createSoundFromElement(id, options) {

        // check if sound is already created
        if (SM.getSoundById(id, true)) {
            return false;
        }

        // get the element
        var el = YUD.get(id);
        if (el == null) return false;

        // if a string id was not passed in then try and get elements id
        if (!YAHOO.lang.isString(id)) {
            if (el.id && el.id != '') {
                id = el.id;
            } else {
                return false;
            }
        }

        // find a playable url
        var source = findPlayableSource(el);
        if (source == null) return false;

        // create the config
        options = options || {};
        if (!options.id) {
            options.id = id; // <-- use id passed in for dom el
        }
        options = YAHOO.lang.augmentObject(options, source); // <-- merge in url/type

        // create sm2 sound
        attachEvents(options);
        SM.createSound(options);
        
        // BUG 92438: force playback for an iota of time to allow the sound to preload
        if (Util.Browser.isMacPPC()){
            SM.play(id);
            SM.stop(id);
        }

        return id;
    }

    Player.onReady = SM.onready;
    Player.setup = setup;
    Player.createSound = createSound;
    Player.createSoundFromElement = createSoundFromElement;

    Player.play = function (id) {

        // fire before play event (which can be cancelled)
        var success = Player.onBeforePlay.fire(id);
        if (success === false) {
            return false;
        }
        
        var sound = SM.play(id);
        return (sound !== false); // returns object if success, false if fails
    };

    Player.stop = function (id) {
        var sound = SM.stop(id);
        return (sound !== false); // returns object if success, false if fails
    };

    Player.pause = function (id) {
        var sound = SM.pause(id);
        return (sound !== false); // returns object if success, false if fails
    };

    Player.resume = function (id) {

        // fire before resume event (which can be cancelled)
        var success = Player.onBeforeResume.fire(id);
        if (success === false) {
            return false;
        }

        var sound = SM.resume(id);
        return (sound !== false); // returns object if success, false if fails
    };

    // if this is true then audio is paused
    Player.isPaused = function () {

        var ids = SM.soundIDs;
        for (var i = 0; i < ids.length; i++) {
            var sound = SM.sounds[ids[i]];
            // make sure not paused and playState is playing
            if (sound.paused) {
                return true;
            }
        }

        return false;

    };

    // if this is true then audio is playing
    Player.isPlaying = function () {

        var ids = SM.soundIDs;
        for (var i = 0; i < ids.length; i++) {
            var sound = SM.sounds[ids[i]];
            // make sure not paused and playState is playing
            if (!sound.paused && sound.playState > 0) {
                return true;
            }
        }

        return false;

    };

    Player.stopAll = function () {
        SM.stopAll();
    };

    // add player api externally
    Audio.Player = Player;

})(TDS.Audio);