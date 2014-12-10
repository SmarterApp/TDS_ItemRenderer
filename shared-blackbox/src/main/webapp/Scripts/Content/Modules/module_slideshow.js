ContentManager.onPageEvent('loaded', function(page) {
    if (page && window.slide && window.slide.scanAndBuild) {
        var doc = page.getElement();
        if (doc) {
            soundManager.onready(slide.scanAndBuild.bind(slide, doc.body || doc));
        }
    }
});

ContentManager.onPageEvent('hide', function(page) {
    if (page && window.slide) {
        slide.pauseAll();
    }
});
