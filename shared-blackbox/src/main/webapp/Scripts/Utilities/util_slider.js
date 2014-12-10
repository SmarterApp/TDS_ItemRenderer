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

    Slider.prototype.getValue = function () {
        if (this._instance) {
            var rawValue = this._instance.getValue();
            return Math.floor((rawValue / this._tickSize) + this._min);
        }
        return -1;
    };

    Slider.prototype.setValue = function (realValue) {
        if (this._instance) {
            this._instance.setValue((realValue - this._min) * this._tickSize, true);
        }
    };

    // increment the current value (moves right)
    Slider.prototype.increment = function () {
        if (this._instance) {
            var value = this._instance.getValue() + this._tickSize;
            this._instance.setValue(value);
        }
    };

    // decrement the current value (moves left)
    Slider.prototype.decrement = function () {
        if (this._instance) {
            var value = this._instance.getValue() - this._tickSize;
            this._instance.setValue(value);
        }
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
        bgSlider.setAttribute('tabindex', 0); // adds keyboard support
        container.appendChild(bgSlider);

        // Slider thumb
        var thumbSlider = document.createElement('span');
        thumbSlider.id = 'slider_image_' + this._id;
        thumbSlider.className = 'slide_controls_img';
        bgSlider.appendChild(thumbSlider);

        // Create YUI slider control
        this._element = container;
        this._tickSize = Math.floor(maxThumbPos / (this._max - this._min));
        this._instance = YAHOO.widget.Slider.getHorizSlider(bgSlider, thumbSlider, 0, maxThumbPos, this._tickSize);
        this._instance.keyIncrement = this._tickSize; // number of pixels the arrow keys will move the slider

        // subscribe to events
        this._instance.subscribe('slideStart', function () {
            this.onStart.fire(this.getValue());
        }.bind(this));

        this._instance.subscribe('change', function () {
            this.onChange.fire(this.getValue());
        }.bind(this));

        this._instance.subscribe('slideEnd', function () {
            this.onEnd.fire(this.getValue());
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
