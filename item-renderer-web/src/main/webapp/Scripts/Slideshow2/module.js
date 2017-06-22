//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
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
