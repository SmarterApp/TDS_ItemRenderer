//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
(function (Audio) {

    function AudioScrubber(audioId) {
        this.audioId = audioId;
        this._isPlaying = false;

        this.onChange = new Util.Event.Custom(this);

        TDS.Audio.Player.onTimeUpdate[this.audioId].subscribe(function (time) {
            this.setTime(time);
        }.bind(this));

        TDS.Audio.Player.onStart.subscribe(function (id) {
            if (id === this.audioId) {
                this._isPlaying = true;
            }
        }.bind(this));

        TDS.Audio.Player.onPause.subscribe(function (id) {
            if (id === this.audioId) {
                this._isPlaying = false;
            }
        }.bind(this));

        TDS.Audio.Player.onIdle.subscribe(function (id) {
            if (id === this.audioId) {
                this._isPlaying = false;
            }
        }.bind(this));
    }

    AudioScrubber.prototype.setTime = function (time) {
        this._slider.setValue(time / this.getDuration() * 100);
    };

    AudioScrubber.prototype.getDuration = function () {
        return TDS.Audio.Player.getDuration(this.audioId);
    };

    AudioScrubber.prototype.render = function (container, width) {
        var self = this,
            sliderMax = 100,
            wasPlayingAtStart;

        this._slider = Util.Slider.create(this.audioId + '_slider', 0, sliderMax, width);
        container.appendChild(this._slider.getEl());

        function toTime(sliderValue) {
            return sliderValue / sliderMax * self.getDuration();
        }

        this._slider.onStart.subscribe(function (sliderValue, fromUserInterface) {
            if (fromUserInterface) {
                wasPlayingAtStart = this._isPlaying;

                if (wasPlayingAtStart) {
                    TDS.Audio.Player.pause(this.audioId);
                }
            }
        }.bind(this));

        this._slider.onChange.subscribe(function (sliderValue, fromUserInterface) {
            if (fromUserInterface) {
                this.onChange.fire(toTime(sliderValue));
            }
        }.bind(this));

        this._slider.onEnd.subscribe(function (sliderValue, fromUserInterface) {
            if (fromUserInterface) {
                TDS.Audio.Player.setPosition(this.audioId, toTime(sliderValue));

                if (wasPlayingAtStart) {
                    TDS.Audio.Player.resume(this.audioId);
                }
            }
        }.bind(this));
    };

    AudioScrubber.prototype.getElement = function () {
        return this._slider.getEl();
    };

    Audio.Widget.createScrubber = function (audioId) {
        return new AudioScrubber(audioId);
    };

})(window.TDS.Audio);
