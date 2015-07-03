//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
/*
Used for creating a slider.
Internally this uses YUI but in the future can change. So try not to expose any YUI specific stuff.
TODO: Add support for vertical.
*/

(function (Util) {

    function Slider(id, min, max) {
        this._id = id;
        this._min = min;
        this._max = max;
        this._element = null; // container element
        this._instance = null; // YUI instance
        this._value = this._min;
        this._tickSize = 0;

        this.onStart = new Util.Event.Custom(this);
        this.onChange = new Util.Event.Custom(this);
        this.onEnd = new Util.Event.Custom(this);
    }

    Slider.prototype.getId = function () {
        return this._id;
    };

    // get the container element
    Slider.prototype.getEl = function () {
        return this._element;
    };

    Slider.prototype.getValue = function (fromUserInterface) {
        return fromUserInterface
            ? this._instance.getValue() / this._tickSize + this._min
            : this._value;
    };

    // set internal value
    Slider.prototype._setValue = function (realValue) {
        realValue = Math.min(realValue, this._max);
        realValue = Math.max(realValue, this._min);
        this._value = realValue;
        return realValue;
    };

    // set slider value
    Slider.prototype.setValue = function (realValue) {
        realValue = this._setValue(realValue);
        if (this._instance) {
            this._instance.setValue((realValue - this._min) * this._tickSize, true);
        }
    };

    // increment the current value (moves right)
    Slider.prototype.increment = function () {
        this.setValue(this.getValue() + this._tickSize);
    };

    // decrement the current value (moves left)
    Slider.prototype.decrement = function () {
        this.setValue(this.getValue() - this._tickSize);
    };

    Slider.prototype.render = function (sliderWidth, thumbWidth) {

        // set default widths
        sliderWidth = sliderWidth || 195;
        thumbWidth = thumbWidth || 23;
        var maxThumbPos = sliderWidth - thumbWidth;

        // Create container for slider
        var container = document.createElement('div');
        container.className = 'slide_controls_slider yui-h-slider';
        container.style.width = sliderWidth + 'px';

        // Slider background
        var bgSlider = document.createElement('div');
        bgSlider.id = 'slider_bg_' + this._id;
        bgSlider.className = 'slide_controls_slider_bg';
        bgSlider.style.width = sliderWidth + 'px';
        bgSlider.setAttribute('tabindex', 0); // adds keyboard support
        container.appendChild(bgSlider);

        var timelineContainer = document.createElement('div');
        timelineContainer.id = 'slider_timeline_' + this._id;
        timelineContainer.className = 'slide_controls_slider_timeline';
        timelineContainer.style.width = sliderWidth - thumbWidth + 'px';
        timelineContainer.style.marginLeft = (thumbWidth * .5) + 'px';
        timelineContainer.style.marginRight = (thumbWidth * .5) + 'px';
        container.appendChild(timelineContainer);

        // Slider thumb
        var thumbSlider = document.createElement('span');
        thumbSlider.id = 'slider_image_' + this._id;
        thumbSlider.className = 'slide_controls_img';
        thumbSlider.style.position= 'absolute';
        bgSlider.appendChild(thumbSlider);

        // Create YUI slider control
        this._element = container;
        this._tickSize = maxThumbPos / (this._max - this._min);

        this._instance = YAHOO.widget.Slider.getHorizSlider(bgSlider, thumbSlider, 0, maxThumbPos, this._tickSize);
        this._instance.keyIncrement = this._tickSize; // number of pixels the arrow keys will move the slider

        // the animation is glitchy
        this._instance.animate = false;

        // override tick pixel-position calculation to be more tolerant of floating point rounding errors
        this._instance.getThumb().setXTicks = function (iStartX, iTickSize) {
            this.xTicks = [];
            this.xTickSize = iTickSize;

            var range = Math.max(this.maxX, this.minX) - Math.min(this.maxX, this.minX),
                tickCount = range / iTickSize;

            for (var i = 0, x = this.minX; i < tickCount; ++i, x += iTickSize) {
                this.xTicks[this.xTicks.length] = x;
            }

            this.xTicks[this.xTicks.length] = this.maxX;
        };

        // subscribe to events
        var isDragging = false;

        var sliderBeginMove = function () {
            if (!isDragging) {
                var fromUserInterface = this._instance.valueChangeSource === 1;
                this.onStart.fire(this.getValue(fromUserInterface), fromUserInterface);
                isDragging = true;
            }
        }.bind(this);

        // for clicking thumb
        this._instance.thumb.subscribe('mouseDownEvent', sliderBeginMove);

        // for clicking on the slider bar outside the thumb
        this._instance.subscribe('slideStart', sliderBeginMove);

        var sliderMoved = function (event) {
            var fromUserInterface = this._instance.valueChangeSource === 1;
            var value = this.getValue(fromUserInterface);
            value = this._setValue(value);
            event.fire(value, fromUserInterface);
        }.bind(this);

        // for dragging or moving the thumb
        this._instance.subscribe('change', function () {
            sliderMoved(this.onChange);
        }.bind(this));

        // for releasing the thumb
        this._instance.subscribe('slideEnd', function () {
            sliderMoved(this.onEnd);
            isDragging = false;
        }.bind(this));

        return container;
    };

    // factory function for creating and rendering
    Slider.create = function (id, min, max, width) {
        var slider = new Slider(id, min, max);
        slider.render(width);
        return slider;
    };

    Util.Slider = Slider;

})(Util);
