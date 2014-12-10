(function (audio) {

    createjs.Sound.initializeDefaultPlugins();


    function _parseSources(el) {

        var sources = [];

        if (el.nodeName == 'A') {
            var url = decodeURIComponent(el.href);
            sources.push(url);
        } else if (el.nodeName == 'AUDIO') {
            for (var i = 0; i < el.children.length; ++i) {
                var source = el.children[i];
                sources.push(decodeURIComponent(source.src));
            }
        }

        return sources;
    };

    function _findPlayableSource(element) {

        var sources = _parseSources(element);

        for (var i = 0; i < sources.length; i++) {

            var source = sources[i];

            // check if this browser can play the url or type
            if (source) {
                return source;
            }
        }

        return null;
    };

    //#region createjs error notification extensions

    // createjs doesn't notify when loading or decoding audio data fails, so we monkey patch that functionality here
    createjs.WebAudioPlugin.Loader.prototype.onerror = function (m) {
        createjs.Sound._sendFileLoadError(this.src, m);
    };

    // TODO: error handling for createjs's HTML5 plugin

    createjs.Sound._sendFileLoadError = function (a) {
        if (createjs.Sound._preloadHash[a]) {
            for (var b = 0, c = createjs.Sound._preloadHash[a].length; c > b; b++) {
                var d = createjs.Sound._preloadHash[a][b];
                if (createjs.Sound._preloadHash[a][b] = !0, createjs.Sound.hasEventListener("error")) {
                    var f = new createjs.Event("error");
                    f.src = d.src, f.id = d.id, f.data = 'error', createjs.Sound.dispatchEvent(f)
                }
            }
        }
    };

    //#endregion

    //#region createjs timeupdate extensions

    function WebAudioTimeUpdateNode(inputNode, soundId) {

        var context = inputNode.context,
            createScriptProcessor = context.createScriptProcessor || context.createJavaScriptNode,
            self = this;

        // to correctly determine current position, we need to track the position of each pause
        // initialized to null, but maintained in start/stop and used in calculations in the
        // onaudioprocess event
        this._lastStopPosition = null;

        this._processor = createScriptProcessor.call(context, this._selectBufferSize(context.sampleRate), inputNode.channelCount, 1);

        this._processor.onaudioprocess = function (event) {
            var eventEmitter = player.onTimeUpdate[soundId];
            if (eventEmitter) {
                var timeSinceStarted = context.currentTime - self._startTime;   // playback position, in seconds
                eventEmitter.fire(self._lastStopPosition + timeSinceStarted);
            }
        };

        // this gain node will be our entry point into the audio processing graph
        // we can connect and disconnect it as much as we want without disrupting other segments of the graph
        this._inputNode = context.createGain();

        // expose a node which can be used to connect a source to this audio processing graph
        this.head = this._processor;

        // the source node represents the source of the audio
        // it is only available once the sound has started playing
        this._sourceNode = null;
    }

    WebAudioTimeUpdateNode.prototype._selectBufferSize = function (sampleRate) {
        var maxTimeBetweenUpdates = .250; // seconds

        // ScriptProcessorNode.onaudioprocess is called whenever it's buffer can be filled
        // we need to know how much time a single buffer represents - this is [number of samples] / [samples rate]
        // start with all valid buffer sizes, then
        // we filter out all sizes which would exceed our chose interval duration, then pick the largest
        var size = [256, 512, 1024, 2048, 4096, 8192, 16384].filter(function (s) {
            return (s / sampleRate) < maxTimeBetweenUpdates;
        }).pop();

        return size;
    };

    WebAudioTimeUpdateNode.prototype.start = function (sourceNode, resume) {
        this._sourceNode = sourceNode;
        this._startTime = this._processor.context.currentTime;
        if (!resume || !this._lastStopPosition) {
            this._lastStopPosition = 0;
        }
        this._sourceNode.connect(this._inputNode);
        this._inputNode.connect(this._processor);
        this._processor.connect(this._processor.context.destination);
    };

    WebAudioTimeUpdateNode.prototype.stop = function () {
        this._lastStopPosition = this._lastStopPosition + this._processor.context.currentTime - this._startTime;

        this._processor.disconnect();
        this._inputNode.disconnect();

        // we don't own the source node (createjs does)
        // so we can't disconnect it without potentially clobbering the audio graph
        this._sourceNode = null;
    };

    //#endregion

    var player = {

        _sounds: {},

        getName: function () {
            return 'createjs';
        },

        _initialized: false,

        initialize: function () {
            this._initialized = true;
            // the resulting match should be { protocol:$1, domain:$2, path:$3, file:$4, extension:$5, query:$6 }
            // unfortunately, since file and extension are passed in the query string, we would need to start capturing group $6 before $4
            // that's impossible though (it would change their numbers, thus their mapping)
            // however, only groups $4 and $5 are ever used, so we'll use a pattern which just ignores $1, $2, $3, and $6
            createjs.Sound.FILE_PATTERN = /()()().*\??.*(?:file=|\/|^)([^&]+\.(\w+))()/;

            createjs.Sound.on('fileload', this._onSoundLoad, this, false);
            createjs.Sound.on('error', this._onSoundLoadError, this, false);

            this._initializeTimeUpdateEvent();

            // execute the onReady callback later (avoid exceptions here)
            var self = this;
            setTimeout(function () {
                self._onReady.fire();
            }, 1);
        },

        _onSoundLoad: function (event) {
            var id = event.id,
                sound = this._sounds[id],
                commands = sound.commands;

            // create a sound instance to allow control of playback
            this._sounds[id] = sound = createjs.Sound.createInstance(id);

            var self = this;

            // bind to its succeeded (onPlayStart) and complete (onPlayFinished) events
            sound.on('succeeded', function (event, id) {

                // bind the timeupdate event to this sound
                // the sound's webaudio nodes are initialized until the sounds starts playing
                sound.timeupdateNode = new WebAudioTimeUpdateNode(sound.panNode, id);

                // the sound is playing, so fire the onPlay event
                // NOTE: this must happen after setting up the timeupdateNode; one of the onPlay events uses timeupdateNode
                this.onPlay.fire(id);
            }, this, false, id);

            sound.on('complete', function (event, id) {
                this.onFinish.fire(id);
                this.onIdle.fire(id);
                sound.air_playState = '';
            }, this, false, id);

            // execute commands which were invoked for this sound prior to it being loaded by createjs
            for (var i = 0; i < commands.length; ++i) {
                this[commands[i]](id);
            }
        },

        _onSoundLoadError: function (event) {
            var id = event.id;

            this.onFail.fire(id);
        },

        _initializeTimeUpdateEvent: function () {
            var self = this;

            function makeStartTimeUpdateCallback(resume) {
                return function startTimeUpdate(id) {
                    var sound = self._sounds[id];
                    sound.timeupdateNode.start(sound.sourceNode, resume);
                };
            }

            function stopTimeUpdate(id) {
                var sound = self._sounds[id];
                sound.timeupdateNode.stop();
            }

            // start (play and resume) stop and finish (idle) and pause (pause)
            this.onPlay.subscribe(makeStartTimeUpdateCallback(false));
            this.onResume.subscribe(makeStartTimeUpdateCallback(true));
            this.onIdle.subscribe(stopTimeUpdate);
            this.onPause.subscribe(stopTimeUpdate);
        },

        teardown: function () {
            // this function is mainly for isolation during unit testing

            createjs.Sound.removeAllSounds();
            createjs.Sound.removeAllEventListeners();

            this.onBeforePlay.unsubscribeAll();
            this.onPlay.unsubscribeAll();
            this.onPause.unsubscribeAll();
            this.onBeforeResume.unsubscribeAll();
            this.onResume.unsubscribeAll();
            this.onStop.unsubscribeAll();
            this.onFinish.unsubscribeAll();
            this.onFail.unsubscribeAll();
            this.onIdle.unsubscribeAll();

            var self = this;
            Object.keys(this.onTimeUpdate).forEach(function (key) {
                self.onTimeUpdate[key].unsubscribeAll();
                delete self.onTimeUpdate[key];
            });

            this._onReady.unsubscribeAll();

            this._initialized = false;
        },

        _onReady: new Util.Event.Custom(null, true),

        onReady: function (callback) {
            this._onReady.subscribe(callback);
        },

        isSupported: function () {
            // createjs is missing error handling for file load/parse with <audio>, so we will only use createjs when webaudio is available
            return createjs.Sound.isReady() && createjs.Sound.activePlugin instanceof createjs.WebAudioPlugin;
        },

        play: function (id) {
            var sound = this._sounds[id];

            if (!sound) {
                return false;
            }

            if (sound.loading) {
                sound.commands.push('play');
            } else {
                // fire before play event (which can be cancelled by the event handler)
                var success = this.onBeforePlay.fire(id);
                if (success === false) {
                    return false;
                }

                sound.play();
            }

            sound.air_playState = 'playing';

            return true;
        },

        stop: function (id) {
            var sound = this._sounds[id];

            if (!sound) {
                return false;
            }

            var wasPlaying;

            if (sound.loading) {
                var lastCommand = sound.commands[sound.commands.length - 1];
                wasPlaying = lastCommand === 'play' || lastCommand === 'resume';
                sound.commands.push('stop');
            } else {
                // stop always returns true if it succeeds
                // pause only returns true if the sound was playing and it succeeds
                wasPlaying = sound.pause();
                sound.stop();

                if (wasPlaying) {
                    this.onStop.fire(id);
                    this.onIdle.fire(id);
                }
            }

            sound.air_playState = '';

            //return wasPlaying;    // TODO: new, better api
            return true;
        },

        stopAll: function () {
            var self = this;
            Object.keys(this._sounds).forEach(function (id) {
                self.stop(id);
            });
        },

        resume: function (id) {
            var sound = this._sounds[id];

            if (!sound) {
                return false;
            }

            var ret;

            if (sound.loading) {
                ret = sound.commands[sound.commands.length - 1] === 'pause';
                sound.commands.push('resume');
            } else {
                // fire before resume event (which can be cancelled by event handler)
                var success = this.onBeforeResume.fire(id);
                if (success === false) {
                    return false;
                }

                ret = sound.resume();

                if (ret) {
                    this.onResume.fire(id);
                }
            }

            sound.air_playState = 'playing';

            //return ret;   // TODO: new, better api
            return true;
        },

        pause: function (id) {
            var sound = this._sounds[id];

            if (!sound) {
                return false;
            }

            var wasPlaying;

            if (sound.loading) {
                var lastCommand = sound.commands[sound.commands.length - 1];
                wasPlaying = lastCommand === 'play' || lastCommand === 'resume';
                sound.commands.push('pause');
            } else {
                wasPlaying = sound.pause();

                if (wasPlaying) {
                    this.onPause.fire(id);
                }
            }

            sound.air_playState = '';

            return wasPlaying;
        },

        isPlaying: function () {
            var self = this,
                ids = Object.keys(self._sounds);
            return !!ids.length && ids.some(function(id) {
                var sound = self._sounds[id];
                return (sound.loading ? sound.commands[sound.commands.length - 1] === 'play' : sound.air_playState === 'playing');
            });
        },

        isPaused: function () {
            // AKV - this API is not well-defined, and shouldn't be here; why are you trying to use this method, and what is your intent?
            // MM - I don't see anyone using this. If you can confirm this as well I think we should get rid of it. 
        },

        canPlaySource: function (source) {
            // regex will help treat mime types and file extensions the same way
            var m = source.type.match(/^(?:(?:audio|video)\/)?(\w+)$/);

            if (!m) {
                return false;
            }

            return createjs.Sound.getCapability(m[1]);
        },

        createSoundFromSource: function (id, source, options) {

            if (this._sounds[id]) {
                // sound has already been created, but may still be loading
                return false;
            }

            if (!this.canPlaySource(source)) {
                return false;
            }

            // it may be better to use preloadjs to load sounds, but we don't get as much feedback (ie it won't tell us if the file extension is supported)

            var sound = createjs.Sound.registerSound(source.url, id, null, true);

            if (sound === true) {
                // sound has already been loaded, this is a duplicate url with a new id
                // createjs uses the url as the unique identifier for all sounds, and we are not allowed to create a new sound at the same url with a different id

                // by appending something to the url, we can make a new url which retrieves the same data
                // we use the fragment identifier because:
                //  1) the server doesn't use it, ensuring we don't alter what the server sends us
                //  2) the cache doesn't use the it, giving us a chance to grab a cached copy of the data from the previous sounds' creation
                source.url += (source.url.match(/#/) ? (source.url.match(/#.*\?/) ? '&' : '?') : '#?') + 'createjsuniqueid=' + id;

                sound = createjs.Sound.registerSound(source.url, id, null, true);
            }

            if (sound === false) {  // invalid options, or no plugin found for this file
                return false;
            }

            this._sounds[id] = {
                loading: true,
                air_playState: '',  // createjs's playState indicates playing and paused as the same state; we'll keep track for ourself
                commands: []
            };

            this.onTimeUpdate[id] = new Util.Event.Custom();

            return id;
        },

        onBeforePlay: new Util.Event.Custom(),

        onPlay: new Util.Event.Custom(),

        onPause: new Util.Event.Custom(),

        onBeforeResume: new Util.Event.Custom(),

        onResume: new Util.Event.Custom(),

        onStop: new Util.Event.Custom(),

        onFinish: new Util.Event.Custom(),

        onIdle: new Util.Event.Custom(),

        onFail: new Util.Event.Custom(),

        onTimeUpdate: {}

    };

    // exports

    // first an 'internal' export, so that the player object can be augmented to extend the API
    audio._createjs = audio._createjs || {};
    Object.defineProperty(audio._createjs, 'player', { value: player, writeable: false, enumerable: false, configurable: false });

    // register the player with the player provider
    audio.Player.register(player);

})(window.TDS.Audio);
