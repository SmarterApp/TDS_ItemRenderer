//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
﻿/*
Audio player abstraction implementation for createjs.
NOTE: Do not call initializeDefaultPlugins() in a IIFE. This causes problems with recorder. 
*/

(function (audio) {

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

    function WebAudioTimeUpdateNode(inputNode, soundId, sound) {

        var context = inputNode.context,
            createScriptProcessor = context.createScriptProcessor || context.createJavaScriptNode,
            lastPosition = null;

        // some old implementations of Web Audio API don't have channelCount, so we need
        // to get it from the sound's AudioBuffer
        var inputChannelCount = inputNode.channelCount || sound.sourceNode.buffer.numberOfChannels,
            outputChannelCount = 1;

        this._processor = createScriptProcessor.call(context, this._selectBufferSize(context.sampleRate), inputChannelCount, outputChannelCount);

        this._processor.onaudioprocess = function (event) {
            var eventEmitter = player.onTimeUpdate[soundId];
            var position = sound.getPosition() / 1000;
            if (eventEmitter && lastPosition !== position) {
                eventEmitter.fire(position);
                lastPosition = position;
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

    WebAudioTimeUpdateNode.prototype.start = function (sourceNode) {
        this._sourceNode = sourceNode;
        this._sourceNode.connect(this._inputNode);
        this._inputNode.connect(this._processor);
        this._processor.connect(this._processor.context.destination);
    };

    WebAudioTimeUpdateNode.prototype.stop = function () {
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

            // mark the sound as loaded
            sound.air_loading = false;

            var self = this;

            // bind to its succeeded (onPlayStart) and complete (onPlayFinished) events
            sound.on('succeeded', function (event, id) {

                // bind the timeupdate event to this sound
                // the sound's webaudio nodes are not initialized until the sounds starts playing
                sound.timeupdateNode = new WebAudioTimeUpdateNode(sound.panNode, id, sound);

                // the sound is playing, so fire the onPlay event
                // NOTE: this must happen after setting up the timeupdateNode; one of the onPlay events uses timeupdateNode
                this.onPlay.fire(id);
                this.onStart.fire(id);
            }, this, false, id);

            sound.on('complete', function (event, id) {
                this.onTimeUpdate[id].fire(this.getDuration(id));
                this.onFinish.fire(id);
                this.onIdle.fire(id);
                sound.air_playState = '';
            }, this, false, id);

            // execute commands which were invoked for this sound prior to it being loaded by createjs
            for (var i = 0; i < commands.length; ++i) {
                var command = commands[i];

                if (!command.name) {
                    // build command from simplified command-name
                    command = { name: command, arguments: [] }
                }

                // add id as first argument
                command.arguments.unshift(id);

                // execute command
                this[command.name].apply(this, command.arguments);
            }
        },

        _onSoundLoadError: function (event) {
            var id = event.id;

            this.onFail.fire(id);
        },

        _initializeTimeUpdateEvent: function () {
            var self = this;

            function startTimeUpdate(id) {
                var sound = self._sounds[id];
                sound.timeupdateNode.start(sound.sourceNode);
            }

            function stopTimeUpdate(id) {
                var sound = self._sounds[id];
                sound.timeupdateNode.stop();
            }

            // start (play and resume) stop and finish (idle) and pause (pause)
            this.onPlay.subscribe(startTimeUpdate);
            this.onResume.subscribe(startTimeUpdate);
            this.onIdle.subscribe(stopTimeUpdate);
            this.onPause.subscribe(stopTimeUpdate);
        },

        // this function is mainly for isolation during unit testing
        teardown: function () {

            if (createjs.Sound.activePlugin) {
                createjs.Sound.removeAllSounds();
            }

            createjs.Sound.removeAllEventListeners();

            this.onBeforePlay.unsubscribeAll();
            this.onPlay.unsubscribeAll();
            this.onPause.unsubscribeAll();
            this.onBeforeResume.unsubscribeAll();
            this.onResume.unsubscribeAll();
            this.onStart.unsubscribeAll();
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

        // check if web audio api is supported
        isSupported: function () {
            return !!(window.AudioContext || window.webkitAudioContext);
        },

        play: function (id) {
            var sound = this._sounds[id];

            if (!sound) {
                return false;
            }

            if (sound.air_loading) {
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

        _stop: function (sound, onStop) {
            // stop always returns true, but we need to know if sound was actually playing (for firing events below)
            // pause only returns true if the sound was playing and it succeeds
            wasPlaying = sound.air_playState === 'playing' && sound.pause();
            wasPaused = sound.air_playState === 'paused';

            // createjs does not safely stop a WebAudio sound when it is already paused
            // we force the sound to play so that we can stop it and leave it in a consistent state
            // note: this proplem appears to be fixed in soundjs 0.6.0

            (wasPlaying || wasPaused) && (sound.resume(), sound.stop());

            typeof onStop === 'function' && onStop(wasPlaying, wasPaused);

            return wasPlaying;
        },

        stop: function (id) {
            var sound = this._sounds[id];

            if (!sound) {
                return false;
            }

            var wasPlaying, wasPaused;

            if (sound.air_loading) {
                var lastCommand = sound.commands[sound.commands.length - 1];
                wasPlaying = lastCommand === 'play' || lastCommand === 'resume';
                sound.commands.push('stop');
            } else {
                wasPlaying = this._stop(sound, function (wasPlaying, wasPaused) {
                    this.onTimeUpdate[id].fire(0);

                    if (wasPlaying || wasPaused) {
                        this.onStop.fire(id);
                        this.onIdle.fire(id);
                    }
                }.bind(this));
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

            if (sound.air_loading) {
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
                    this.onStart.fire(id);
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

            if (sound.air_loading) {
                var lastCommand = sound.commands[sound.commands.length - 1];
                wasPlaying = lastCommand === 'play' || lastCommand === 'resume';
                sound.commands.push('pause');
            } else {
                wasPlaying = sound.pause();

                if (wasPlaying) {
                    this.onPause.fire(id);
                }
            }

            sound.air_playState = 'paused';

            return wasPlaying;
        },

        isPlaying: function () {
            var self = this,
                ids = Object.keys(self._sounds);
            return !!ids.length && ids.some(function(id) {
                var sound = self._sounds[id];
                return (sound.air_loading ? sound.commands[sound.commands.length - 1] === 'play' : sound.air_playState === 'playing');
            });
        },

        isPaused: function () {
            // AKV - this API is not well-defined, and shouldn't be here; why are you trying to use this method, and what is your intent?
            // MM - I don't see anyone using this. If you can confirm this as well I think we should get rid of it. 
        },

        getDuration: function (id) {
            var sound = this._sounds[id];
            return sound && !sound.air_loading ? (sound.getDuration() / 1000) : 0;
        },

        setPosition: function (id, time) {
            var sound = this._sounds[id];

            if (!sound) {
                return;
            }

            if (sound.air_loading) {
                sound.commands.push({ name: 'setPosition:', arguments: [time] });
            } else {
                // createjs poorly handles seeking when audio is paused, so our best
                // option is to always make sure the audio is stopped; we can resume
                // playback after seeking, if necessary
                this._stop(sound, function (wasPlaying, wasPaused) {
                    sound.setPosition(Math.floor(time * 1000));

                    if (wasPaused) {
                        // need to return it to the paused state, which we can only do from the playing state
                        // unfortunately, this causes a lot superfluous events to be fired
                        // note: this proplem appears to be fixed in soundjs 0.6.0
                        this.play(id);
                        this.pause(id);
                    } else if (wasPlaying) {
                        sound.play();
                        this.onTimeUpdate[id].fire(time);
                    }
                }.bind(this));
            }
        },

        getPosition: function (id) {
            var sound = this._sounds[id];
            return sound && !sound.air_loading ? (sound.getPosition() / 1000) : 0;
        },

        canPlaySource: function (source) {

            // regex will help treat mime types and file extensions the same way
            // optional handling of RFC4281 "codecs parameter"
            var m = source.type.match(/^(?:(?:audio|video)\/)?(\w+)(?:; codecs\*?=[\"%'\., \w]+)?$/);

            if (!m) {
                return false;
            }

            // initialize plugins (which generates capabilities) and check media type
            return createjs.Sound.initializeDefaultPlugins() && 
                   createjs.Sound.getCapability(m[1]);
        },

        // create sound from source element
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
                air_loading: true,
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

        onStart: new Util.Event.Custom(),

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
