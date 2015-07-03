//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
﻿(function (window) {
    "use strict";

    var defaultOptions = {
            recording: true,
            recordingSources: false,
            processing: true
        },
        _missingApis,
        _error,
        _options,
        _requirements = [],
        _polyfills = {},
        _ready;

    function normalize(name) {

        var prefixes = ['webkit', 'moz', 'ms'],
            obj;

        if (!name) {
            obj = window;
        } else {
            obj = name.split('.').reduce(function (current, next) {
                if (!current) {
                    return undefined;
                }

                var name = next.charAt(0).toUpperCase() + next.substr(1),
                    ret = current[next], i;

                if (!ret) {

                    for (i = 0; i < prefixes.length && !ret; ++i) {
                        if (ret = current[prefixes[i] + name])
                            break;
                    }

                    current[next] = ret
                }

                return ret;
            }, window);
        }

        return {
            supported: !!obj,
            api: name,
            obj: obj
        };
    }

    function addRequirement(api, required) {
        var polyfills, requirement;

        if (typeof required !== 'boolean') {
            required = true;
        }

        polyfills = _polyfills[api] || [];

        requirement = normalize(api);

        // if the API is supported, only look at polyfills which fix that API
        polyfills = polyfills.filter(function (polyfill) {
            return !requirement.supported || !!polyfill.fixesApi;
        });

        if (polyfills.length > 0) {
            var tokens = api.split('.'),
                ownerName = tokens.slice(0, tokens.length - 1).join('.'),
                owner = normalize(ownerName);

            if (owner.supported) {
                var name = tokens[tokens.length - 1],
                    i, polyfillInfo;

                for (i = 0; i < polyfills.length; ++i) {

                    polyfillInfo = polyfills[i];

                    if (polyfillInfo.isSupported(normalize, requirement.obj)) {
                        var polyfill = polyfillInfo.bindToSelf ? polyfillInfo.polyfill.bind(polyfillInfo) : polyfillInfo.polyfill;
                        owner.obj[name] = polyfill;
                        break;
                    }
                }

                requirement = normalize(api);
            }
        }

        requirement.required = required;
        _requirements[_requirements.length] = requirement;
    }

    var webAudio = {
        init: function (settings) {

            if (_ready) {
                return;
            }

            _ready = true;

            try
            {
                _options = defaultOptions;

                addRequirement('Worker');
                addRequirement('AudioContext');
                addRequirement('AudioContext.prototype.decodeAudioData');
                addRequirement('OfflineAudioContext', _options.processing || _options.recording);
                addRequirement('AudioContext.prototype.createBiquadFilter', _options.recording);
                addRequirement('AudioContext.prototype.createScriptProcessor', _options.recording);
                addRequirement('Blob', _options.recording);
                addRequirement('ArrayBuffer', _options.recording);
                addRequirement('Float32Array', _options.recording);
                addRequirement('Uint8Array', _options.recording);
                addRequirement('navigator.getUserMedia', _options.recording);
                addRequirement('navigator.getMediaDevices', _options.recording && _options.recordingSources);

                addRequirement('AudioContext.prototype.createVolumeAnalyser', false);
                addRequirement('AudioContext.prototype.createVoiceActivityDetector', _options.recording);
            }
            catch (error)
            {
                console.error(error.message, error.stack);
                _error = error;
                _ready = false;
            }

            _missingApis = _requirements.filter(function (r) {
                return r.required && !r.supported;
            }).map(function (r) {
                return r.api;
            }).sort();

            _ready = _ready && _missingApis.length === 0;

            if (!_ready) {
                return;
            }

            this.context = new AudioContext();

            if (webAudio.encoding) {
                webAudio.encoding.init(settings.workerFactory, settings.encodingWorkerUrl);
            }
        },
        isReady: function () {
            return !!_ready;
        },
        getStatus: function (endl) {
            if (this.isReady()) {
                return 'ready';
            }

            endl = endl || '\n';

            if (_missingApis.length > 0) {
                return ['not supported: missing apis'].concat(_missingApis).join(endl);
            } else if (_error) {
                return 'not supported: ' + _error.message + endl + _error.stack.replace(/\n/g, endl);
            } else {
                return 'not supported: unkown error';
            }
        },
        addPolyfill: function (api, polyfill) {
            var polyfills = _polyfills[api];

            if (!polyfills) {
                polyfills = [];
                _polyfills[api] = polyfills;
            }

            polyfills[polyfills.length] = polyfill;
        }
    };

    // exports
    window.webAudio = webAudio;

})(window);
