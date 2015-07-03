//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
﻿/*
This code is used for HTML5 animations.
*/

(function() {

    var CSS_FRAME_ANIMATION = 'frame-anim-html5';

    var AnimationManager = {};

    // if this returns true then this browser is able to play HTML5 animations (SVG, canvas, etc)
    AnimationManager.canPlayHTML5 = function (pageLink) {
    
       var animData = VideoManager.SWF.parseData(pageLink);

        // check if can play animation in HTML 5
        if (animData.html5) {

            // if IE older than IE 9
            if (YAHOO.env.ua.ie > 0 &&
                YAHOO.env.ua.ie < 9) {
                return false;
            }

            // if FF older than FF 4.0
            if (Util.Browser.getFirefoxVersion() > 0 &&
                Util.Browser.getFirefoxVersion() < 4) {
                return false;
            }

            return true;
        }

        // not HTML5 compatible for animations
        return false;
    };

    // reaplces a swf animations with an HTML5 animation
    AnimationManager.injectHTML5 = function (pageLink, scriptUrl) {
    
        // get swiffy data
        var animData = VideoManager.SWF.parseData(pageLink);
        var animUrl = animData.url.replace('.swf', '.html');

        // add build version to url
        if (animUrl.indexOf('?') != -1) {
            var id = Util.Date.now();
            if (typeof TDS == 'object') {
                if (TDS.buildNumber) {
                    id = TDS.buildNumber; // build #
                } else if (TDS.Cache && TDS.Cache.id) {
                    id = TDS.Cache.id; // cache id
                }
            }
            animUrl = animUrl.replace('?', '?cid=' + id + '&');
        }
    
        // add the base script url if included (used for animations to resolve scripts)
        if (scriptUrl && animUrl.indexOf('?') != -1) {
            scriptUrl = encodeURIComponent(scriptUrl);
            animUrl = animUrl.replace('?', '?scriptUrl=' + scriptUrl + '&');
        }

        var animWidth = (animData.width || 400);
        var animHeight = (animData.height || 400);

        // create frame
        var animDoc = Util.Dom.getOwnerDocument(pageLink);
        var animFrame = animDoc.createElement('iframe');
        animFrame.className = CSS_FRAME_ANIMATION;
        animFrame.setAttribute('width', animWidth + 'px');
        animFrame.setAttribute('height', animHeight + 'px');
        animFrame.setAttribute('src', animUrl);
        pageLink.parentNode.replaceChild(animFrame, pageLink);

        // return the frame if anyone wants to use it
        return animFrame;
    };

    // reloads the animation to play from start
    AnimationManager.reloadHTML5 = function(currentFrame) {

        // For some reason swiffy files to not replay when asked.  You have to
        // reload them.  So copy the information from the old iframe and do that.
    
        var animUrl = YUD.getAttribute(currentFrame, 'src');
        var animWidth = YUD.getAttribute(currentFrame, 'width'); // already has px
        var animHeight = YUD.getAttribute(currentFrame, 'height'); // already has px

        // create frame
        var animDoc = Util.Dom.getOwnerDocument(currentFrame);
        var animFrame = animDoc.createElement('iframe');
        animFrame.className = CSS_FRAME_ANIMATION;
        animFrame.setAttribute('width', animWidth);
        animFrame.setAttribute('height', animHeight);
        animFrame.setAttribute('src', animUrl);
        currentFrame.parentNode.replaceChild(animFrame, currentFrame);
    
        // return the new frame if anyone wants to use it
        return animFrame;
    }; 

    // get all the animations frames for an element
    AnimationManager.getHTML5Frames = function(el) {

        var animFrames = [],
            frames = el.getElementsByTagName('iframe');

        YUD.batch(frames, function(frame) {
            if (YUD.hasClass(frame, CSS_FRAME_ANIMATION)) {
                animFrames.push(frame);
            }
        });

        return animFrames;
    };

    // this is called when a dialog with a html5 animation is closed
    AnimationManager.stop = function(animFrame) {
        console.log('Content Dialog: Stop HTML5 animation');
        var animWin = Util.Dom.getFrameContentWindow(animFrame);
        if (animWin) {
            if (typeof animWin.stopAnimation == 'function') {
                animWin.stopAnimation();
            } else {
                // other animation?
            }
        }
    };

    // this is called when a dialog with a html5 animation is repopened
    AnimationManager.resume = function(animFrame) {
        console.log('Content Dialog: Resume HTML5 animation');
        var animWin = Util.Dom.getFrameContentWindow(animFrame);
        if (animWin) {
            if (typeof animWin.playAnimation == 'function') {
                // if we don't delay then we get renderer error
                setTimeout(function() {
                    animWin.playAnimation();
                }, 30);
            } else {
                // other animation?
            }
        }
    };

    window.AnimationManager = AnimationManager;

})();

