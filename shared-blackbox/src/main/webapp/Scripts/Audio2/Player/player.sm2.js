(function (audio) {

    var SM = window.soundManager;

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

    // fired when audio play or resume
    Player.onStart = createEvent();

    // fired when sound is manually stopped
    Player.onStop = createEvent();

    // fired when sound finishes on its own
    Player.onFinish = createEvent();

    // fired when sound is stopped explicitly or finishes playing
    Player.onIdle = createEvent();

    // fired when audio fails to load
    Player.onFail = createEvent();

    // fired when certain amount of time has elapsed
    Player.onTimeUpdate = {};

    function setup(flashPath) {

        // this allows Flash to be disabled (it has to be set as early as possible..)
        // BUG: https://bugz.airws.org/default.asp?73094
        SM.audioFormats.mp3.required = false;

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
        YAHOO.lang.later(0, Player.onStart, Player.onStart.fire, this.id);
    }

    function _onPause() {
        console.log('AUDIO PAUSE: ' + this.id);
        YAHOO.lang.later(0, Player.onPause, Player.onPause.fire, this.id);
    };

    function _onResume() {
        console.log('AUDIO RESUME: ' + this.id);
        YAHOO.lang.later(0, Player.onResume, Player.onResume.fire, this.id);
        YAHOO.lang.later(0, Player.onStart, Player.onStart.fire, this.id);
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

    function _onTimeUpdate() {
        var position = SM.getSoundById(this.id).position / 1000; // playback position, in ms
        Player.onTimeUpdate[this.id].fire(position);  // this event may be time sensitive, so we will forego the timeout
    }

    // process a sm2 sound object
    function attachEvents(options) {
        options.onload = _onLoad;
        options.onplay = _onPlay;
        options.onpause = _onPause;
        options.onresume = _onResume;
        options.onstop = _onStop;
        options.onfinish = _onFinish;
        options.onfailure = _onFailure;
        options.whileplaying = _onTimeUpdate;
    }

    function createSoundFromSource(id, source, options) {

        // check if sound is already created
        if (SM.getSoundById(id, true)) {
            return false;
        }

        if (source == null) {
            return false;
        }

        if (!canPlaySource(source)) {
            return false;
        }

        // create the config
        options = options || {};
        if (!options.id) {
            options.id = id; // <-- use id passed in for dom el
        }
        options = YAHOO.lang.augmentObject(options, source); // <-- merge in url/type

        // create sm2 sound
        attachEvents(options);
        SM.createSound(options);

        Player.onTimeUpdate[id] = createEvent();

        // BUG 92438: force playback for an iota of time to allow the sound to preload
        if (Util.Browser.isMacPPC()) {
            SM.play(id);
            SM.stop(id);
        }

        return id;
    }

    function canPlaySource(source) {
        return SM.canPlayURL(source.url) || SM.canPlayMIME(source.type);
    }

    Player.onReady = SM.onready;
    Player.canPlaySource = canPlaySource;
    Player.createSoundFromSource = createSoundFromSource;

    Player.play = function (id) {

        // fire before play event (which can be cancelled)
        var success = Player.onBeforePlay.fire(id);
        if (success === false) {
            return false;
        }

        var sound = SM.play(id);
        return sound && sound.playState !== 0;
    };

    Player.stop = function (id) {
        var sound = SM.stop(id);
        return (sound !== false); // returns object if success, false if fails
    };

    Player.pause = function (id) {
        var sound = SM.pause(id);
        return sound && sound.paused;
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

    Player.getDuration = function (id) {
        // convert msec to sec
        return SM.getSoundById(id).durationEstimate / 1000;
    };

    Player.setPosition = function (id, time) {
        SM.setPosition(id, Math.floor(time * 1000));
    };

    Player.getPosition = function (id) {
        var sound = SM.getSoundById(id);

        return sound
            ? sound.position / 1000
            : 0;
    };

    Player.isSupported = function () {
        return !!SM;
    };

    Player.initialize = function () {
        var flashPath = TDS.resolveBaseUrl('Scripts/Libraries/soundmanager2/swf/');
        setup(flashPath);
    };

    Player.teardown = function () {
        Player.stopAll();

        var ids = SM.soundIDs.slice();
        for (var i = 0; i < ids.length; i++) {
            SM.unload(ids[i]);
        }

        Player.onBeforePlay.unsubscribeAll();
        Player.onPlay.unsubscribeAll();
        Player.onPause.unsubscribeAll();
        Player.onBeforeResume.unsubscribeAll();
        Player.onResume.unsubscribeAll();
        Player.onStop.unsubscribeAll();
        Player.onFinish.unsubscribeAll();
        Player.onFail.unsubscribeAll();
        Player.onIdle.unsubscribeAll();

        Object.keys(Player.onTimeUpdate).forEach(function (key) {
            Player.onTimeUpdate[key].unsubscribeAll();
            delete Player.onTimeUpdate[key];
        });
    };

    Player.getName = function () {
        return 'sm2';
    };

    // exports

    // first an 'internal' export, so that the player object can be augmented to extend the API
    audio._soundManager = audio._soundManager || {};
    Object.defineProperty(audio._soundManager, 'player', { value: Player, writeable: false, enumerable: false, configurable: false });

    audio.Player.register(Player);

})(window.TDS.Audio);
