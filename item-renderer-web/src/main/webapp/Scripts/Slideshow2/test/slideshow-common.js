//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
﻿(function (exports) {

    var Slide = slideshows.api.Slide,
        Slideshow = slideshows.api.Slideshow,
        SlideshowFactory = slideshows.api.SlideshowFactory,
        SlideshowManager = slideshows.api.SlideshowManager;


    function createSlideshowElement(id, rootNode) {
        var slideshow = document.createElement('div');
        slideshow.id = id;
        slideshow.className = 'slides_config';

        rootNode = rootNode || document.getElementById('qunit-fixture');

        rootNode.appendChild(slideshow);

        return slideshow;
    }

    // @beginTime - hhmmss
    function createSlideElement(slideshowElement, beginTime) {
        var slide = document.createElement('div');
        slide.setAttribute('data-begin', beginTime);
        slide.className = 'slide';

        slideshowElement.appendChild(slide);

        return slide;
    }

    function createSoundElement(slideshowElement, url) {
        var sound = document.createElement('audio');
        sound.className = 'slides_audio';

        var source = document.createElement('source');
        source.src = url;

        slideshowElement.appendChild(sound);
        sound.appendChild(source);

        return sound;
    }



    function createSlideshow(id, rootNode, slides, soundUrl) {

        if (!(rootNode instanceof Node)) {
            soundUrl = slides;
            slides = rootNode;
            rootNode = undefined;
        }

        if (!(slides instanceof Array)) {
            soundUrl = slides;
            slides = undefined;
        }

        rootNode = rootNode || document.getElementById('qunit-fixture');
        slides = slides || [];
        soundUrl = soundUrl || '';

        var slideshowConfig = createSlideshowElement(id, rootNode),
            slideshowAudio = createSoundElement(slideshowConfig, soundUrl);

        var slideshowManager = new SlideshowManager(),
            slideshow = new Slideshow(slideshowManager, slideshowConfig, slideshowAudio);

        slides.forEach(function (beginTime) {
            var slideContent = createSlideElement(slideshowConfig, beginTime);

            slideshow.addSlide(beginTime, slideContent);
        });

        return slideshow;
    }

    function createSandboxedPlayer() {
        var sandbox = sinon.sandbox.create();

        window.TDS = window.TDS || {};

        window.TDS.Audio = {
            Player: {
                createSoundFromElement: sandbox.spy(function (id) {
                    window.TDS.Audio.Player.onTimeUpdate[id] = new Util.Event.Custom();
                }),

                setPosition: sandbox.spy(),
                getDuration: sandbox.spy(function () {
                    return 0;
                }),
                play: sandbox.spy(),
                pause: sandbox.spy(),
                stop: sandbox.spy(),

                onFinish: {
                    subscribe: sandbox.spy()
                },

                onTimeUpdate: {}
            }
        };

        return {
            restore: function () {
                sandbox.restore();

                delete window.TDS.Audio;
            },

            triggerTimeUpdate: function (slideshow, time) {
                window.TDS.Audio.Player.onTimeUpdate[slideshow.audioId].fire(time);
            }
        };
    }

    var sandboxPlayer = {
        setup: function () {
            this.mockPlayer = createSandboxedPlayer();
        },
        teardown: function () {
            this.mockPlayer = createSandboxedPlayer();
        }
    };



    function createFactory() {
        return new SlideshowFactory(new SlideshowManager());
    }


    exports.slideshowTest = {
        createSlideshow: createSlideshow,
        sandboxPlayer: sandboxPlayer,

        createFactory: createFactory,
        createSlideshowElement: createSlideshowElement,
        createSlideElement: createSlideElement,
        createSoundElement: createSoundElement
    };

})(window);
