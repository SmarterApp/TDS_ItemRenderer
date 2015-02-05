(function (slideshowTest) {

    var Slide = slideshows.api.Slide,
        Slideshow = slideshows.api.Slideshow,
        SlideshowManager = slideshows.api.SlideshowManager;

    var createSlideshow = slideshowTest.createSlideshow,
        sandboxPlayer = slideshowTest.sandboxPlayer;

    module('Slideshow.addSlide', sandboxPlayer);

    test('returns the new slide', function (assert) {
        var slideshow = createSlideshow('foo');

        var slide = slideshow.addSlide(0, null);

        assert.ok(slide);
        assert.ok(slide instanceof Slide);
    });

    test('adds the slide to the slides array', function (assert) {
        var slideshow = createSlideshow('foo');

        var slide = slideshow.addSlide(0, null);

        assert.strictEqual(1, slideshow.slides.length);
        assert.strictEqual(slide, slideshow.slides[0]);
    });

    test('adds the slide to the slides array in the ascending order wrt beginTime', function (assert) {
        var slideshow = createSlideshow('foo', [0, 2]);

        var slide = slideshow.addSlide(1, null);

        assert.strictEqual(slide, slideshow.slides[1]);
    });

    test('sets the slide\'s slideshow property', function (assert) {
        var slideshow = createSlideshow('foo');

        var slide = slideshow.addSlide(0, null);

        assert.strictEqual(slideshow, slide.slideshow);
    });

    test('throws after slideshow has been rendered', function (assert) {
        var slideshow = createSlideshow('foo');

        slideshow.render();

        assert.throws(function () {
            slideshow.addSlide(0, null);
        });
    });

    module('Slideshow.render', sandboxPlayer);

    test('shows slides_config element', function (assert) {
        var slideshow = createSlideshow('foo'),
            config = document.getElementById('foo');

        config.style.display = 'none';

        slideshow.render();

        assert.ok(!config.classList.contains('hidden'));
    });

    test('adds slide_controls_contain element', function (assert) {
        var slideshow = createSlideshow('foo'),
            config = document.getElementById('foo');

        slideshow.render();

        assert.ok(config.querySelector('.slide_controls_contain'));
    });

    test('adds slide_controls_prev_btn button', function (assert) {
        var slideshow = createSlideshow('foo'),
            config = document.getElementById('foo');

        slideshow.render();

        assert.ok(config.querySelector('.slide_controls_prev_btn'));
    });

    test('adds slide_controls_play_btn button', function (assert) {
        var slideshow = createSlideshow('foo'),
            config = document.getElementById('foo');

        slideshow.render();

        assert.ok(config.querySelector('.slide_controls_play_btn'));
    });

    test('adds slide_controls_stop_btn button', function (assert) {
        var slideshow = createSlideshow('foo'),
            config = document.getElementById('foo');

        slideshow.render();

        assert.ok(config.querySelector('.slide_controls_stop_btn'));
    });

    test('adds slide_controls_next_btn button', function (assert) {
        var slideshow = createSlideshow('foo'),
            config = document.getElementById('foo');

        slideshow.render();

        assert.ok(config.querySelector('.slide_controls_next_btn'));
    });

    test('adds slide_controls_slider slider', function (assert) {
        var slideshow = createSlideshow('foo'),
            config = document.getElementById('foo');

        slideshow.render();

        assert.ok(config.querySelector('.slide_controls_slider'));
    });

    test('shows the first slide', function (assert) {
        var slideshow = createSlideshow('foo', [0, 1, 2]),
            slides = document.querySelectorAll('#foo .slide');

        slideshow.render();

        assert.ok(!slides[0].classList.contains('hidden'));
    });

    test('hides slides after the first', function (assert) {
        var slideshow = createSlideshow('foo', [0, 1, 2]),
            slides = document.querySelectorAll('#foo .slide');

        slideshow.render();

        assert.ok(slides[1].classList.contains('hidden'));
        assert.ok(slides[2].classList.contains('hidden'));
    });

    module('Slideshow.play', sandboxPlayer);

    test('plays sound with TDS.Audio.Player', function (assert) {
        var slideshow = createSlideshow('foo', 'foo.ogg');

        slideshow.play();

        // we are mocking the player via sandboxPlayer
        assert.ok(TDS.Audio.Player.play.calledOnce);
    });

    module('Slideshow.pause', sandboxPlayer);

    test('pauses sound with TDS.Audio.Player', function (assert) {
        var slideshow = createSlideshow('foo', 'foo.ogg');

        slideshow.pause();

        // we are mocking the player via sandboxPlayer
        assert.ok(TDS.Audio.Player.pause.calledOnce);
    });

    module('Slideshow.getCurrent', sandboxPlayer);

    test('returns the first slide before slideshow has started', function (assert) {
        var slideshow = createSlideshow('foo', [0, 1, 2], 'foo.ogg');

        var currentSlide = slideshow.getCurrent();

        assert.strictEqual(0, currentSlide.beginTime);
    });

    test('returns the second slide after seeking with goNext', function (assert) {
        var slideshow = createSlideshow('foo', [0, 1, 2], 'foo.ogg');
        slideshow.render();

        slideshow.goNext();
        var currentSlide = slideshow.getCurrent();

        assert.strictEqual(1, currentSlide.beginTime);
    });

    test('returns the first slide after seeking with goPrev', function (assert) {
        var slideshow = createSlideshow('foo', [0, 1, 2], 'foo.ogg');
        slideshow.render();

        slideshow.goPrev();
        var currentSlide = slideshow.getCurrent();

        assert.strictEqual(0, currentSlide.beginTime);
    });

    test('returns the first slide after seeking with goNext, then goPrev', function (assert) {
        var slideshow = createSlideshow('foo', [0, 1, 2], 'foo.ogg');
        slideshow.render();

        slideshow.goNext();
        slideshow.goPrev();
        var currentSlide = slideshow.getCurrent();

        assert.strictEqual(0, currentSlide.beginTime);
    });

    module('Slideshow.setSlide', sandboxPlayer);

    test('changes the current slide by index', function (assert) {
        var slideshow = createSlideshow('foo', [0, 5, 10], 'foo.ogg');
        slideshow.render();

        slideshow.setSlide(1);

        var currentSlide = slideshow.getCurrent();
        assert.strictEqual(5, currentSlide.beginTime);
    });

    test('constrains the slide index to valid indices', function (assert) {
        var slideshow = createSlideshow('foo', [0, 5, 10], 'foo.ogg');
        slideshow.render();

        slideshow.setSlide(-1);

        var currentSlide = slideshow.getCurrent();
        assert.strictEqual(0, currentSlide.beginTime);

        slideshow.setSlide(3);

        var currentSlide = slideshow.getCurrent();
        assert.strictEqual(10, currentSlide.beginTime);
    });

    test('changes the slide visibility', function (assert) {
        var slideshow = createSlideshow('foo', [0, 5, 10], 'foo.ogg');
        slideshow.render();

        slideshow.setSlide(1);

        assert.ok(!slideshow.slides[0].isVisible());
        assert.ok(slideshow.slides[1].isVisible());
        assert.ok(!slideshow.slides[2].isVisible());

        slideshow.setSlide(2);

        assert.ok(!slideshow.slides[0].isVisible());
        assert.ok(!slideshow.slides[1].isVisible());
        assert.ok(slideshow.slides[2].isVisible());
    });

    test('is called after the player\' timeUpdate event fires with a time that is for the next slide', function (assert) {
        var slideshow = createSlideshow('foo', [0, 5, 10], 'foo.ogg');
        slideshow.render();

        this.mockPlayer.triggerTimeUpdate(slideshow, 5);

        var currentSlide = slideshow.getCurrent();
        assert.strictEqual(5, currentSlide.beginTime);
    });

    module('Slideshow.goNext', sandboxPlayer);

    test('advances to the next slide', function (assert) {
        var slideshow = createSlideshow('foo', [0, 1, 2], 'foo.ogg');
        slideshow.render();

        slideshow.goNext();
        var currentSlide = slideshow.getCurrent();

        assert.strictEqual(1, currentSlide.beginTime);
    });

    test('doesn\'t advance the slideshow past the last slide', function (assert) {
        var slideshow = createSlideshow('foo', [0], 'foo.ogg');
        slideshow.render();

        slideshow.goNext();
        var currentSlide = slideshow.getCurrent();

        assert.strictEqual(0, currentSlide.beginTime);
    });

    module('Slideshow.goPrev', sandboxPlayer);

    test('advances to the previous slide', function (assert) {
        var slideshow = createSlideshow('foo', [0, 1, 2], 'foo.ogg');
        slideshow.render();

        // start by skipping to the second slide
        slideshow.goNext();
        var currentSlide = slideshow.getCurrent();
        assert.strictEqual(1, currentSlide.beginTime);

        slideshow.goPrev();
        currentSlide = slideshow.getCurrent();

        assert.strictEqual(0, currentSlide.beginTime);
    });

    test('doesn\'t advance the slideshow past the first slide', function (assert) {
        var slideshow = createSlideshow('foo', [0], 'foo.ogg');
        slideshow.render();

        slideshow.goPrev();
        var currentSlide = slideshow.getCurrent();

        assert.strictEqual(0, currentSlide.beginTime);
    });

})(window.slideshowTest);
