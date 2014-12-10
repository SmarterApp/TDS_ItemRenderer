(function (tds) {

    var _services = new TDS.Audio.Services(),
        player = new Player(),
        _plugins = [],
        _impl;

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

        var sources = [],
            source;

        function parseSourceWithPlugins(source) {
            _plugins.forEach(function (plugin) {
                plugin.parseSource(el, source);
            });
        }

        if (el.nodeName == 'A') {
            source = {
                url: decodeURIComponent(el.href),
            };

            source.type = parseMIMEType(source.url) || el.getAttribute('type') || '';   // NOTE: Can't use 'type' attribute doesn't get updated for m4a, breaks IE 10

            parseSourceWithPlugins(source);

            sources.push(source);
        } else if (el.nodeName == 'AUDIO') {
            var sourceElements = el.getElementsByTagName('source'),
                sourceElement;

            for (var i = 0; i < sourceElements.length; ++i) {
                sourceElement = sourceElements[i];

                source = {
                    url: decodeURIComponent(sourceElement.src),
                    type: sourceElement.type
                };

                parseSourceWithPlugins(source);

                sources.push(source);
            }
        }

        return sources;
    };

    function Player() {
    }

    YAHOO.lang.augmentObject(Player.prototype, {

        setup: function (servicePriorities) {

            if (_impl) {
                // second and subsequent calls to setup should return immediately
                return true;
            }

            if (!Array.isArray(servicePriorities)) {
                servicePriorities = ['createjs', 'sm2'];
            }

            _services.prioritize(servicePriorities);

            // get the first supported service
            _impl = _services.getSupported();

            if (_impl) {
                console.info('Player service initializing: ' + _impl.getName());

                _impl.initialize();
                this._initializePlugins();

                // we freeze the player so that nobody can manipulate it
                Object.freeze(player);

                return true;
            } else {
                console.warn('Player service not found');
                return false;
            }
        },

        _initializePlugins: function () {
            _plugins.forEach(function (plugin) {
                plugin.initialize(player);

                plugin.publicApi.forEach(function (api) {

                    if (api.isFunction) {
                        player[api.publicName] = function () {
                            return api.plugin[api.name].apply(api.plugin, Array.prototype.slice.apply(arguments));
                        };
                    } else {
                        Object.defineProperty(player, api.publicName, {
                            get: function () {
                                return api.plugin[api.name];
                            }
                        });
                    }

                });
            });
        },

        teardown: function () {
            if (_impl) {
                _impl.teardown();
                _impl = null;
            }
        },

        register: function (service) {
            if (service instanceof tds.Audio.PlayerPlugin) {
                _plugins.push(service);
            } else {
                _services.register(service);
            }
        },

        // this should only be used for debugging
        getServices: function () {
            return _services;
        },

        // parse all the audio url's from an element and 
        // return only the one that can be played on this browser
        _findPlayableSource: function (el) {

            var sources = parseSources(el);

            for (var i = 0; i < sources.length; i++) {

                var source = sources[i];

                // check if this browser can play the url or type
                if (this.canPlaySource(source)) {
                    return source;
                }
            }

            return null;
        },

        _createSoundFromSource: function (id, source) {
            var result = this.createSoundFromSource(id, source);

            if (result !== false) {
                _plugins.forEach(function (plugin) {
                    plugin.onSoundCreated(id, source);
                });
            }

            return result;
        },

        createSound: function (id, url) {

            var source = {
                url: url,
                type: parseMIMEType(url)
            };

            return this._createSoundFromSource(id, source);
        },

        createSoundFromElement: function (id, options) {

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
            var source = this._findPlayableSource(el);

            if (!source) {
                return false;
            }

            return this._createSoundFromSource(id, source, options);
        }
    });

    //#region Delegation of public API

    // the player singleton delegates all of its work to the _impl singleton;
    // we will expose wrappers for each function and property

    var delegatedFunctions = [
        'onReady',
        'play', 'stop', 'pause', 'resume', 'stopAll',
        'isPlaying', 'isPaused',
        'canPlaySource', 'createSoundFromSource'
    ];

    delegatedFunctions.forEach(function (api) {
        Player.prototype[api] = function () {
            if (_impl) {
                return _impl[api].apply(_impl, Array.prototype.slice.apply(arguments));
            } else {
                console.warn('Player service not found');
                return null;
            }
        }
    });

    var delegatedProperties = [
        'onBeforePlay', 'onPlay', 'onStop', 'onPause', 'onBeforeResume', 'onResume', 'onFinish', 'onIdle', 'onFail', 'onTimeUpdate'
    ];

    delegatedProperties.forEach(function (api) {
        Object.defineProperty(Player.prototype, api, {
            get: function () {
                if (_impl) {
                    return _impl[api];
                } else {
                    console.warn('Player service not found');
                    return null;
                }
            }
        });
    });

    //#endregion

    // we freeze the player singleton's prototype so that nobody can manipulate it
    Object.freeze(Player.prototype);

    // exports

    tds.Audio = tds.Audio || {};

    Object.defineProperty(tds.Audio, 'Player', {
        value: player,
        writable: false,
        enumerable: true,
        configurable: false
    });

})(window.TDS);
