//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
﻿/*
This module is used for loading Swiffy animations.
*/

(function () 
{
    // find all the animation links and replace with iframe
    function processLinks(parentEl) {
        var processed = false;
        var scriptUrl = ContentManager.resolveBaseUrl('Scripts/Libraries/');
        var pageLinks = parentEl.getElementsByTagName('a');
        pageLinks = Array.prototype.slice.call(pageLinks); // Convert from HTMLCollection to Array
        YUD.batch(pageLinks, function (pageLink) {
            if (AnimationManager.canPlayHTML5(pageLink)) {
                AnimationManager.injectHTML5(pageLink, scriptUrl);
                processed = true;
            }
        });
        return processed;
    }

    // this event checks when page is ready and checks if there are any animations that use swiffy frame
    ContentManager.onPageEvent('available', function (page) {
        var pageEl = page.getElement();
        processLinks(pageEl);
    });

    // Handle the case where an item is being shown again.
    ContentManager.onPageEvent('show', function (page) {

        var pageEl = page.getElement();

        // reload animation frame
        var animFrames = AnimationManager.getHTML5Frames(pageEl);
        if (animFrames.length > 0) {
            AnimationManager.reloadHTML5(animFrames[0]);
        }
    });

    // Listen for help tutorial to load
    ContentManager.Dialog.onLoad.subscribe(function(frame) {
        var frameDoc = frame.getDocument();
        if (Util.String.contains(frame.id, 'help')) {
            processLinks(frameDoc);
        } 
    });

    // right before the dialog is hidden stop the animation
    ContentManager.Dialog.onBeforeHide.subscribe(function(frame) {
        var dialogFrame = frame.getDocument();
        if (dialogFrame) {
            var animFrames = AnimationManager.getHTML5Frames(dialogFrame);
            if (animFrames.length > 0) {
                AnimationManager.stop(animFrames[0]);
            }
        }
    });

    // when the dialog is shown resume the animation
    ContentManager.Dialog.onShow.subscribe(function(frame) {
        var dialogFrame = frame.getDocument();
        if (dialogFrame) {
            var animFrames = AnimationManager.getHTML5Frames(dialogFrame);
            if (animFrames.length > 0) {
                AnimationManager.resume(animFrames[0]);
            }
        }
    });

})();


