(function (slideshowTest) {

    var SlideshowManager = slideshows.api.SlideshowManager,
        SlideshowFactory = slideshows.api.SlideshowFactory,
        Slideshow = slideshows.api.Slideshow;

    var createFactory = slideshowTest.createFactory,
        createSlideshowElement = slideshowTest.createSlideshowElement,
        createSlideElement = slideshowTest.createSlideElement,
        createSoundElement = slideshowTest.createSoundElement;

    module('SlideshowFactory.findSlideshowNodes');

    test('returns array with nodes that have the slides_config class', function (assert) {
        var slideshow = createSlideshowElement('foo'),

            factory = createFactory();

        var slideshowElements = factory.findSlideshowNodes();

        assert.strictEqual(1, slideshowElements.length);
        assert.strictEqual(slideshow, slideshowElements[0]);
    });

    test('when no elements have slides_config class, returns empty array', function (assert) {
        var factory = createFactory();

        var slideshowElements = factory.findSlideshowNodes();

        assert.strictEqual(0, slideshowElements.length);
    });

    test('when no argument passed, returns array with nodes selected from document root', function (assert) {
        var slideshow = createSlideshowElement('foo'),sss

            factory = createFactory();

        var slideshowElements = factory.findSlideshowNodes();

        // as long as it found any, this test is good enough
        assert.strictEqual(1, slideshowElements.length);
        assert.strictEqual(slideshow, slideshowElements[0]);
    });

    test('when node passed, returns array with nodes selected from passed node', function (assert) {
        // put one slideshow in the root, and the second in a child element
        // when we select from the child, the slideshow in the root should not be returned
        var rootSlideshow = createSlideshowElement('foo'),

            child = document.createElement('div'),
            childSlideshow = createSlideshowElement('bar', child),

            factory = createFactory();

        document.getElementById('qunit-fixture').appendChild(child);

        var slideshowElements = factory.findSlideshowNodes(child);

        assert.strictEqual(1, slideshowElements.length);
        assert.strictEqual(childSlideshow, slideshowElements[0]);
    });

    test('when id of node passed, returns array with nodes selected from the node selected by passed id', function (assert) {
        // put one slideshow in the root, and the second in a child element
        // when we select from the child, the slideshow in the root should not be returned
        var rootSlideshow = createSlideshowElement('foo'),

            child = document.createElement('div'),
            childSlideshow = createSlideshowElement('bar', child),

            factory = createFactory();

        child.id = 'slideshow-test-child';
        document.getElementById('qunit-fixture').appendChild(child);

        var slideshowElements = factory.findSlideshowNodes(child.id);

        assert.strictEqual(1, slideshowElements.length);
        assert.strictEqual(childSlideshow, slideshowElements[0]);
    });

    module('SlideshowFactory.findSlideNodes');

    test('when no slides exist, returns empty array', function (assert) {
        var slideshow = createSlideshowElement('foo'),

            factory = createFactory();

        var slides = factory.findSlideNodes(slideshow);

        assert.strictEqual(0, slides.length);
    });

    test('if no element has the slide class, returns empty array', function (assert) {
        var slideshow = createSlideshowElement('foo'),
            notSlide = document.createElement('div'),

            factory = createFactory();

        slideshow.appendChild(notSlide);

        var slides = factory.findSlideNodes(slideshow);

        assert.strictEqual(0, slides.length);
    });

    test('returns array of nodes that have the slide class', function (assert) {
        var slideshow = createSlideshowElement('foo'),
            slide = createSlideElement(slideshow, '000000'),

            factory = createFactory();

        var slides = factory.findSlideNodes(slideshow);

        assert.strictEqual(1, slides.length);
        assert.strictEqual(slide, slides[0]);
    });

    module('SlideshowFactory.findSlideshowAudio');

    test('when no audio exists, returns null', function (assert) {
        var slideshowElement = createSlideshowElement('foo'),

            factory = createFactory();

        var audio = factory.findSlideshowAudio(slideshowElement);

        assert.strictEqual(null, audio);
    });

    test('returns the src attribute from the source node in the audio node which has the slides_audio class', function (assert) {
        var url = 'file.ogg',
            slideshowElement = createSlideshowElement('foo'),
            soundElement = createSoundElement(slideshowElement, url),

            factory = createFactory();

        var soundUrl = factory.findSlideshowAudio(slideshowElement);

        assert.strictEqual(soundElement, soundUrl);
    });

    module('SlideshowFactory.buildSlideshow');

    test('returns a Slideshow object', function (assert) {
        var slideshowElement = createSlideshowElement('foo'),

            factory = createFactory();

        var slideshow = factory.buildSlideshow(slideshowElement);

        assert.ok(slideshow instanceof Slideshow);
    });

    test('adds each slide node to the slideshow', function (assert) {
        var slideshowElement = createSlideshowElement('foo'),
            slide1 = createSlideElement(slideshowElement, '000000', '<img src="img1.png" />'),
            slide2 = createSlideElement(slideshowElement, '000001', '<img src="img2.png" />'),

            factory = createFactory();

        var stub_addSlide = sinon.stub(Slideshow.prototype, 'addSlide');

        var slideshow = factory.buildSlideshow(slideshowElement);

        assert.strictEqual(2, stub_addSlide.callCount);

        stub_addSlide.restore();
    });

    module('SlideshowFactory.parseBeginTime');

    test('parses seconds in base 10', function (assert) {
        var factory = createFactory();

        var seconds1 = factory.parseBeginTime('000009'),
            seconds2 = factory.parseBeginTime('000050');

        assert.strictEqual(9, seconds1);
        assert.strictEqual(50, seconds2);
    });

    test('parses minutes in base 10', function (assert) {
        var factory = createFactory();

        var minutes1 = factory.parseBeginTime('000900'),
            minutes2 = factory.parseBeginTime('005900');

        assert.strictEqual(9 * 60, minutes1);
        assert.strictEqual(59 * 60, minutes2);
    });

    test('parses hours in base 10', function (assert) {
        var factory = createFactory();

        var hours1 = factory.parseBeginTime('090000'),
            hours2 = factory.parseBeginTime('590000');

        assert.strictEqual(9 * 3600, hours1);
        assert.strictEqual(59 * 3600, hours2);
    });

    module('SlideshowFactory.findAndBuildSlideshows');

    test('when no slides_config elements exist, returns an empty array', function (assert) {
        var factory = createFactory();

        var slideshows = factory.findAndBuildSlideshows();

        assert.strictEqual(0, slideshows.length);
    });

    test('returns a slideshow per slides_config element', function (assert) {
        var factory = createFactory();

        createSlideshowElement('foo');
        createSlideshowElement('bar');

        var slideshows = factory.findAndBuildSlideshows();

        assert.strictEqual(2, slideshows.length);
    });

})(slideshowTest);
