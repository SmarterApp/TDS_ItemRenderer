/*
This contains helper functions for dealing with SM2.
*/

if (typeof AsiItem != 'object') AsiItem = {};
if (typeof AsiItem.Audio != 'object') AsiItem.Audio = {};
    
// some helper functions if you want to work with sound manager natively
(function(SM, Audio) {
    
    // this allows Flash to be disabled (it has to be set as early as possible..)
    // BUG: https://bugz.airws.org/default.asp?73094
    SM.audioFormats.mp3.required = false;

    // if this is true we had to reboot SM2 because Flash failed 
    var rebooted = false;

    function setup(flashPath) {

        SM.setup({
            url: flashPath,
            flashVersion: 9, // plays more modern audio
            preferFlash: false, // setting this to false prefers HTML5
            useHTML5Audio: true // the default is true but just to be clear
        });
        
        // this gets fired when SM has loaded
        SM.ontimeout(function() {
            console.warn('AudioManager Error: SM2 timeout');
            if (!rebooted) {
                rebooted = true;
                setTimeout(function() {
                    SM.reboot();
                }, 1000);
            }
        });
    }

    // parse the audio urls of an element
    function parseSources(el) {

        var sources = [];

        if (el.nodeName == 'A') {
            sources.push({
                url: decodeURIComponent(el.href),
                type: el.getAttribute('type')
            });
        } else if (el.nodeName == 'AUDIO') {
            for (var i = 0; i < el.children.length; ++i) {
                var source = el.children[i];
                sources.push({
                    url: decodeURIComponent(source.src),
                    type: source.type
                });
            }
        }

        return sources;
    };
    
    // get a playable source from the element
    function getPlayableSource(el) {

        var sources = parseSources(el);
        
        for (var i = 0; i < sources.length; i++) {

            var source = sources[i]; 
            var url = source.url ? source.url : null;

            // check if this browser can play the url
            if (url && SM.canPlayURL(url)) {
                return source;
            }
        }

        return null;
    }
    
    // create a SM2 sound object
    function createSound(id, url) {

        var config = {
            id: id,
            url: url
        };

        // create sound
        var sound = new Audio.Sound(config);
        return sound;
    }

    // create a SM2 sound object from an element
    function createSoundFromElement(id, el, config) {

        var source = getPlayableSource(el);
        if (source == null) return null;
        
        // create the config
        config = config || {};
        config.id = id;
        config = YAHOO.lang.augmentObject(config, source);

        // create sound
        // var sound = SM.createSound(config);
        var sound = new Audio.Sound(config);
        return sound;
    }

    // create public functions
    Audio.setup = setup;
    Audio.onReady = SM.onready;
    Audio.stopAll = SM.stopAll;
    Audio.getPlayableSource = getPlayableSource;
    Audio.createSound = createSound;
    Audio.createSoundFromElement = createSoundFromElement;

})(soundManager, AsiItem.Audio);
