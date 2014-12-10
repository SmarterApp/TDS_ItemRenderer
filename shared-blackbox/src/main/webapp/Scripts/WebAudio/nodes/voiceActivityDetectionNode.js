(function () {
    'use strict';

    function getPeakLevel(buffer) {
        var max = 0,
            i = buffer.length;

        for (; i--;) {
            var sample = Math.abs(buffer[i]);

            if (sample > max) {
                max = sample;
            }
        }

        return max;
    }

    function VoiceActivityDetector(sampleRate) {
        this._sampleRate = sampleRate;
        this._ended = true;

        this.start();
    }

    VoiceActivityDetector.prototype.processData = function (samples, singleSampleSet) {
        if (singleSampleSet) {
            this.start();
            this.end();
        }

        this._sampleDeque.enqueue(new Float32Array(samples));
        this._processData();
    };

    VoiceActivityDetector.prototype._processData = function () {
        while (true) {
            // try to get enough bytes to fill a half second
            var chunkSamples = this._sampleDeque.tryDequeue(this._samplesPerChunk, this._ended);

            if (!chunkSamples) {
                // there weren't enough bytes
                break;
            }

            var peakLevel = getPeakLevel(chunkSamples);

            if (this._haveFloor) {
                this.chunkCount++;
                if (peakLevel > this._noiseFloor) {
                    this.chunkOverFloorCount++;
                }
            } else {
                this._haveFloor = true;
                this._noiseFloor = peakLevel * 2;
            }
        }
    };

    VoiceActivityDetector.prototype.getQuality = function () {
        // make sure we have processed all available audio data
        this._processData();

        // if the number of 500ms "good" chunks is greater than 15% of total, then we are good
        // we are also OK if we have 15 seconds worth of chunks over Noise floor
        if (this.chunkOverFloorCount > 30 || (this.chunkOverFloorCount / this.chunkCount > 0.15)) {
            return 'GOOD';
        } else {
            return 'POOR';
        }
    };

    VoiceActivityDetector.prototype.start = function () {
        this._sampleDeque = new SampleDeque(1, Float32Array);

        this._haveFloor = false;
        this._noiseFloor = 0;

        this._samplesPerChunk = this._sampleRate / 2,

        this.chunkCount = 0;
        this.chunkOverFloorCount = 0;
        this._ended = false;
    };

    VoiceActivityDetector.prototype.end = function () {
        this._ended = true;
    };

    function VoiceActivityDetectionNode(context) {

        var downmixer = context.createGain(),
            filter = context.createBiquadFilter(),
            scriptProcessor = context.createScriptProcessor(1024, 1, 1);

        var self = this;

        self._detector = new VoiceActivityDetector(context.sampleRate);

        // downmix to mono
        downmixer.channelCount = 1;

        // filter non-vocal frequencies out
        // bandpass does the best job of filtering
        // it doesn't sound the best, but we aren't recording from this part of the graph
        filter.type = 'bandpass';
        filter.frequency.value = 2750;  // center of the frequency band to keep
        filter.Q.value = 2;             // inversely proportional to bandwidth

        scriptProcessor.onaudioprocess = function (event) {
            var buffer = event.inputBuffer.getChannelData(0);
            self._detector.processData(buffer, false);
        };

        this._downmixer = downmixer;
        this._filter = filter;
        this._scriptProcessor = scriptProcessor;

        Object.defineProperties(this, {
            context: { value: context, writeable: false, enumerable: true, configurable: false },
            numberOfInputs: { value: 1, writeable: false, enumerable: true, configurable: false },
            numberOfOutputs: { value: 0, writeable: false, enumerable: true, configurable: false },
            head: { value: downmixer, writeable: false, enumerable: true, configurable: false },
            tail: { value: scriptProcessor, writeable: false, enumerable: true, configurable: false }
        });

        this.connect(null);

        this.volume = 0;
    }

    VoiceActivityDetectionNode.prototype.getQuality = function () {
        return this._detector.getQuality();
    };

    VoiceActivityDetectionNode.prototype.connect = function (next) {
        // we have no output, so do nothing with next

        this._downmixer.connect(this._filter);
        this._filter.connect(this._scriptProcessor);
        this._scriptProcessor.connect(this.context.destination);

        this._detector.start();
    };

    VoiceActivityDetectionNode.prototype.disconnect = function () {
        this._scriptProcessor.disconnect();
        this._filter.disconnect();
        this._downmixer.disconnect();

        this._detector.end();
    };

    // exports

    ['AudioContext.prototype.createVoiceActivityDetector', 'OfflineAudioContext.prototype.createVoiceActivityDetector'].forEach(function (api) {
        webAudio.addPolyfill(api, {
            fixesApi: false,
            isSupported: function () {
                return true;
            },
            polyfill: function () {
                return new VoiceActivityDetectionNode(this);
            }
        });
    });

    webAudio.VoiceActivityDetector = VoiceActivityDetector;

})();
