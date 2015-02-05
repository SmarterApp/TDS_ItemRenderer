(function (exports) {

    function SlideshowManager() {
        this._labels = {
            play: 'Play Slideshow',
            stop: 'Stop Slideshow',
            prev: 'Previous Slide',
            next: 'Next Slide'
        };

        // for building slideshows
        this._slideshowFactory = new SlideshowFactory(this);

        this._slideshows = [];
    }

    SlideshowManager.prototype.setAriaLabels = function (labels) {
        this._labels = labels;
    };

    SlideshowManager.prototype.getAriaLabels = function () {
        return this._labels;
    };

    SlideshowManager.prototype.getFactory = function () {
        return this._slideshowFactory;
    };

    SlideshowManager.prototype.findAndBuildSlideshows = function (elementOrId) {
        var slideshows = this.getFactory().findAndBuildSlideshows(elementOrId);

        Array.prototype.push.apply(this._slideshows, slideshows);

        return slideshows;
    };

    SlideshowManager.prototype.stopAll = function () {
        this._slideshows.forEach(function (slideshow) {
            slideshow.stop();
        });
    };

    SlideshowManager.prototype.api = {
        SlideshowManager: SlideshowManager,
        SlideshowFactory: SlideshowFactory,
        Slide: Slide,
        Slideshow: Slideshow
    };



    function SlideshowFactory(slideshowManager) {
        this._slideshowManager = slideshowManager;
    }

    SlideshowFactory.prototype.findSlideshowNodes = function (elementOrId) {
        // select by element if the parameter is a string
        var element = typeof elementOrId === 'string'
                        ? document.getElementById(elementOrId)
                        : elementOrId;

        // if we don't have an element, use the document root
        element = element instanceof Element
                        ? element
                        : document;

        var nodes = element.querySelectorAll('.slides_config');

        return Array.prototype.slice.call(nodes);
    };

    SlideshowFactory.prototype.findSlideNodes = function (slideshowElement) {
        var nodes = slideshowElement.querySelectorAll('.slide');

        return Array.prototype.slice.call(nodes);
    };

    SlideshowFactory.prototype.findSlideshowAudio = function (slideshowElement) {
        var node = slideshowElement.querySelector('.slides_audio');

        return node || null;
    };

    SlideshowFactory.prototype.parseBeginTime = function (beginTime) {

        var seconds = 0;

        if (beginTime.length === 6) {
            // try to parse "hhmmss" format
            var ss = parseInt(beginTime.substring(4, 6), 10),
                mm = parseInt(beginTime.substring(2, 4), 10),
                hh = parseInt(beginTime.substring(0, 2), 10);

            if (ss < 60 && mm < 60) {
                seconds = hh * 3600 + mm * 60 + ss;
            }
        }

        if (seconds === 0) {
            // time must just be the number of seconds
            seconds = parseInt(beginTime, 10)
        }
        return seconds;
    };

    SlideshowFactory.prototype.buildSlideshow = function (slideshowElement) {
        var slideElements = this.findSlideNodes(slideshowElement),
            audioElement = this.findSlideshowAudio(slideshowElement),

            self = this;

        var slideshow = new Slideshow(this._slideshowManager, slideshowElement, audioElement);

        slideElements.forEach(function (slideElement) {
            var beginTime = self.parseBeginTime(slideElement.getAttribute('data-begin'));

            slideshow.addSlide(beginTime, slideElement);
        })

        return slideshow;
    };

    SlideshowFactory.prototype.findAndBuildSlideshows = function (elementOrId) {
        var slideshowElements = this.findSlideshowNodes(elementOrId),
            self = this;

        var slideshows = slideshowElements.map(function (slideshowElement) {
            return self.buildSlideshow(slideshowElement);
        });
        
        slideshows.forEach(function (slideshow) {
            slideshow.render();
        });

        return slideshows;
    };


    function Slide(slideshow, beginTime, content) {
        this.slideshow = slideshow;
        this.beginTime = beginTime;
        this.content = content;
    }

    Slide.prototype.show = function () {
        this.content.classList.remove('hidden');
    };

    Slide.prototype.hide = function () {
        this.content.classList.add('hidden');
    };

    Slide.prototype.isVisible = function () {
        return !this.content.classList.contains('hidden');
    };



    var _slideshowId = 0;

    function Slideshow(slideshowManager, configElement, audioElement) {
        this.id = 'slideshow' + ++_slideshowId;

        this.slideshowManager = slideshowManager;
        this.element = configElement;

        this.slides = [];
        this._currentIndex = 0;

        if (audioElement) {
            this.audioId = audioElement.id = audioElement.id || (this.id + '_audio');
            if (TDS.Audio.Player.createSoundFromElement(this.audioId)) {
                TDS.Audio.Player.onTimeUpdate[this.audioId].subscribe(function (time) {
                    this._updateSlideForTime(time);
                }.bind(this));
            }
        }

        this._isRendered = false;
        this._isPlaying = false;
    }

    Slideshow.prototype._updateSlideForTime = function (time) {

        var i = 0;
        for (; i < this.slides.length && this.slides[i].beginTime <= time; ++i);

        var newIndex = Math.max(0, Math.min(i - 1, this.slides.length - 1)),
            willChange = newIndex != this._currentIndex,
            newSlide = this.slides[newIndex];

        if (willChange && time >= newSlide.beginTime) {
            this._setSlideByIndex(newIndex, false);
        }
    };

    Slideshow.prototype.getDuration = function () {
        return TDS.Audio.Player.getDuration(this.audioId);
    };

    Slideshow.prototype.addSlide = function (beginTime, content) {

        if (this._isRendered) {
            throw new Error('slideshow has already been rendered');
        }

        var slide = new Slide(this, beginTime, content),
            index, i;

        // advance index to the spot where we want to insert the new slide
        for (i = 0; i < this.slides.length && this.slides[i].beginTime <= beginTime; index = ++i);

        this.slides.splice(index, 0, slide);

        return slide;
    };

    Slideshow.prototype.render = function () {

        if (this._isRendered) {
            return;
        }

        this._isRendered = true;

        // show the slideshow
        this.element.classList.remove('hidden');

        // show the first slide to start
        if (this.slides.length) {
            this.hideAll();
            this.slides[0].show();
        }

        // create the controls
        var container = document.createElement('span');
        container.className = 'slide_controls_contain';
        container.setAttribute('aria-controls', this.id);
        this.element.appendChild(container);

        this._createControls(container);
        this._createSlider(container);
    };

    Slideshow.prototype._createControls = function (container) {
        var labels = this.slideshowManager.getAriaLabels();

        var prev = document.createElement('span');
        prev.className = 'slide_controls_btn slide_controls_prev_btn';
        prev.setAttribute('aria-label', labels.prev);
        container.appendChild(prev);

        var play = document.createElement('span');
        play.className = 'slide_controls_btn slide_controls_play_btn';
        play.setAttribute('aria-label', labels.play);
        container.appendChild(play);

        var pause = document.createElement('span');
        pause.className = 'slide_controls_btn slide_controls_stop_btn hidden';
        pause.setAttribute('aria-label', labels.stop);
        container.appendChild(pause);

        var next = document.createElement('span');
        next.className = 'slide_controls_btn slide_controls_next_btn';
        next.setAttribute('aria-label', labels.next);
        container.appendChild(next);

        var self = this;

        if (this.audioId) {
            TDS.Audio.Player.onFinish.subscribe(function (id) {
                if (id == this.audioId) {
                    pause.classList.add('hidden');
                    play.classList.remove('hidden');
                }
            }.bind(this));
        }

        prev.addEventListener('click', function () {
            self.goPrev();
        });

        play.addEventListener('click', function () {
            self.play();

            pause.classList.remove('hidden');
            play.classList.add('hidden');
        });

        pause.addEventListener('click', function () {
            self.pause();

            pause.classList.add('hidden');
            play.classList.remove('hidden');
        });

        next.addEventListener('click', function () {
            self.goNext();
        });
    };

    Slideshow.prototype._createSlider = function (container) {

        this.slider = TDS.Audio.Widget.createScrubber(this.audioId);
        this.slider.render(container, 190);

        this.slider.onChange.subscribe(function (time) {
            this._updateSlideForTime(time);
        }.bind(this));
    };

    Slideshow.prototype.hideAll = function () {
        this.slides.forEach(function (slide) {
            slide.hide();
        });
    };

    Slideshow.prototype.play = function () {
        if (this.audioId) {
            if (this._isPaused) {
                TDS.Audio.Player.resume(this.audioId);
            } else {
                TDS.Audio.Player.play(this.audioId);
            }
        }

        this._isPlaying = true;
        this._isPaused = false;
    };

    Slideshow.prototype.pause = function () {
        if (this.audioId) {
            TDS.Audio.Player.pause(this.audioId);
        }

        this._isPlaying = false;
        this._isPaused = true;
    };

    Slideshow.prototype.stop = function () {
        if (this.audioId) {
            TDS.Audio.Player.stop(this.audioId);
        }

        this._isPlaying = false;
        this._isPaused = false;
    };

    Slideshow.prototype.getCurrent = function () {
        return this.slides[this._currentIndex];
    };

    Slideshow.prototype._setSlideByIndex = function (index, seekAudio) {
        if (typeof index !== 'number') {
            return;
        }

        this._currentIndex = index;

        this.hideAll();

        var currentSlide = this.getCurrent();
        currentSlide.show();

        if (seekAudio) {
            this._setPosition(currentSlide.beginTime);
        }
    };

    Slideshow.prototype._setPosition = function (time) {
        TDS.Audio.Player.setPosition(this.audioId, time);
    };

    Slideshow.prototype.setSlide = function (index, resetIfCurrentSlide) {
        index = Math.min(index, this.slides.length - 1);
        index = Math.max(index, 0);

        if (index !== this._currentIndex || resetIfCurrentSlide) {
            this._setSlideByIndex(index, true);
        }
    };

    Slideshow.prototype.goPrev = function () {

        var position = TDS.Audio.Player.getPosition(this.audioId),
            startTime = this.getCurrent().beginTime,
            slideIndex;

        if (startTime + 2 < position) {
            // more than 2 seconds, seek to the beginning of the current slide
            slideIndex = this._currentIndex;
        } else {
            // less than 2 seconds, seek to previous slide
            slideIndex = this._currentIndex - 1;
        }

        this.setSlide(slideIndex, true);
    };

    Slideshow.prototype.goNext = function () {
        this.setSlide(this._currentIndex + 1, false);
    };

    exports.slideshows = new SlideshowManager();

})(window);
