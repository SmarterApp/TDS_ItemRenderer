(function () {

    var SlideshowManager = slideshows.api.SlideshowManager;

    var createSlideshowElement = slideshowTest.createSlideshowElement,
        createSlideElement = slideshowTest.createSlideElement,
        createSoundElement = slideshowTest.createSoundElement;

    var sandboxPlayer = slideshowTest.sandboxPlayer;

    module('SlideshowManager.stopAll', sandboxPlayer)

    test('stops slideshows which have been added via findAndBuildSlideshows', function (assert) {
        var slideshowConfig = createSlideshowElement('foo'),
            slideElement = createSlideElement(slideshowConfig, '000000'),
            soundElement = createSoundElement(slideshowConfig, 'foo.ogg');

        var manager = new SlideshowManager();

        var slideshows = manager.findAndBuildSlideshows('qunit-fixture'),
            slideshow = slideshows[0];

        // mock the slideshow's stop method, so we are able to tell when it has been called
        var slideshowStop = sinon.spy(slideshow, 'stop');

        // now execute the test
        slideshow.play();
        manager.stopAll();

        assert.ok(slideshowStop.calledOnce);
    });

})();
