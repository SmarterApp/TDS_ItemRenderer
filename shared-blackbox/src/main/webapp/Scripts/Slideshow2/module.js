ContentManager.onPageEvent('loaded', function(page) {
    if (page && window.slideshows) {
        var doc = page.getElement();
        if (doc) {
            slideshows.findAndBuildSlideshows(doc);
        }
    }
});

ContentManager.onPageEvent('hide', function(page) {
    if (page && window.slideshows) {
        slideshows.stopAll();
    }
});
