/* 
This code is responsible for loading the audio applet. Once everything
is ready and working the onReady event will fire. Any events from the applet
from playing/recording will be fired on the onEvent event property. 
*/

TDS = window.TDS || {};
TDS.Audio = TDS.Audio || {};

(function(Audio) {

    var appletPath = null;
    var initialized = false; // has someone called the initialize() function?
    var setupDelay = 1000;
    var appletEl = null; // applet dom element is set
    var appletTimer = null; // polling timer instance
    var appletInterval = 5000; // how often to poll the applet (milliseconds)
    var processTimer = null; // process timer instance
    var processTimeout = 30000; // when to check if the java process is loaded (milliseconds)
    var processFailed = false; // if this is true the process was not found
    var socketTimeout = 90; // applet http timeout (seconds)

    var playing = false; // if this is true then we started playing audio
    var recording = false; // if this is true then we started recording audio
    var activeID = null; // if we are playing/recording then this the current id

    var callbacks = {}; // event listeners for play/record functions
    var initCallbacks = []; // event listeners for initialize
    var loadCallbacks = [];

    function isReady() {
        return (appletEl != null);
    }

    // set the native applet player
    function setApplet(applet) {
        
        // check if already ready
        if (isReady()) return;

        // cancel timers
        if (appletTimer) {
            appletTimer.cancel();
        }

        if (processTimer) {
            processTimer.cancel();
        }

        // set applet
        appletEl = applet;

        // schedule the configuring of the socket timeout in case it fails
        var timeoutMillis = socketTimeout * 1000;
        setTimeout(function() {
            applet.setSocketParameters(timeoutMillis, timeoutMillis);
        }, 0);
        
        // fire callbacks
        for (var i = 0; i < initCallbacks.length; i++) {
            initCallbacks[i]();
        }
    }

    function getAppletFrame() {
        return document.getElementById('audioFrame');
    }

    // this will look in the DOM for the applet if it has been injected
    function getApplet() {
        var audioFrame = getAppletFrame();
        if (audioFrame) {
            var frameDoc = Util.Dom.getFrameContentDocument(audioFrame);
            if (frameDoc) {
                return frameDoc.getElementById('AIRAudio');
            }
        }

        return null;
    }

    // inject applet into the DOM
    function injectApplet() {

        var appletConfig = {
            id: 'AIRAudio',
            codebase: appletPath + 'AIRAudio',
            code: 'AIRAudio/AudioApplet.class',
            archive: 'AIRAudio_Combined.jar',
            callback: 'tdsFireAudioEvent'
        };

        // NOTE: Be warned the function setNative can be called right away while in this function.
        return Util.Frame.injectApplet('audioFrame', appletConfig);
    }

    // remove the audio frame and applet
    function removeApplet() {
        var audioFrame = getAppletFrame();
        Util.Dom.removeNode(audioFrame);
    };

    // check if the applet is ready
    function checkApplet() {

        // check if we are already ready (this will happen if the event fired)
        if (isReady()) return;

        // manually check if the audio applet is ready
        try {
            var applet = getApplet();
            if (applet && typeof applet.getCurrentState == 'function') {
                if (applet.getCurrentState() == 'READY') {
                    console.log('AUDIO APPLET POLLING READY');
                    setApplet(applet);
                }
            }
        } catch(ex) {
            // ignore errors so we can keep polling
            console.error(ex);
        }
        
        // if we are not ready then start timer again
        if (!isReady()) {
            startAppletTimer();
        }
    }

    // check if java process is loaded
    function checkProcess() {
        
        if (isReady()) return;

        var javaRequired = false;
        var javaFound = false;
        
        // check if Windows SB and java process is found
        if (Util.Browser.isWindows() && Util.Browser.isSecure()) {
            javaRequired = true;
            var processList = Util.SecureBrowser.getProcessList();
            if (processList.length > 0) {
                for (var i = 0; i < processList.length; i++) {
                    if (processList[i] == 'java.exe') {
                        javaFound = true;
                        break;
                    }
                }
            }
        }
        
        // if java is required but it was not loaded yet then lets reload applet
        if (javaRequired && !javaFound) {
            processFailed = true;
            removeApplet();
            injectApplet();
        }
    };
    
    // start the timer for checking if the applet is ready
    function startAppletTimer() {
        appletTimer = window.YAHOO.lang.later(appletInterval, this, checkApplet);
    }

    // start the timer for checking if the java proccess is loaded
    function startProcessTimer() {
        processTimer = window.YAHOO.lang.later(processTimeout, this, checkProcess);
    }

    var Java = {};
    
    // \JavaApps\AIRAudio\src\AIRAudio\AudioType.java
    Java.Type = {
        SOUNDCUE: 'SOUNDCUE', // use this when playing sound cues
        CONTENTAUDIO: 'CONTENTAUDIO', // use this for regular audio
        STUDENTRECORDING: 'STUDENTRECORDING', // use this for audio recording
        UNKNOWN: 'UNKNOWN'
    };

    // \JavaApps\AIRAudio\src\AIRAudio\AudioStatus.java
    Java.Status = {
        INITIALIZING: 'INITIALIZING',
        READY: 'READY',
        PLAYINPROGRESS: 'PLAYINPROGRESS',
        CAPTUREINPROGRESS: 'CAPTUREINPROGRESS',
        STOPPINGCAPTURE: 'STOPPINGCAPTURE',
        PAUSED: 'PAUSED',
        UNDEFINED: 'UNDEFINED'
    };
    
    // \JavaApps\AIRAudio\src\AIRAudio\codecs\AIRCodecRegistry.java
    Java.Format = {
        SPX: 'SPX',
        OGG: 'OGG',
        WAVE: 'WAVE'
    };
    
    // \JavaApps\AIRAudio\src\AIRAudio\AudioEvent.java
    Java.Event = {
        INITIALIZED: 'INITIALIZED',
        LOAD_START: 'LOAD_START',
        LOAD_COMPLETE: 'LOAD_COMPLETE',
        LOAD_FAIL: 'LOAD_FAIL',
        DECODE_START: 'DECODE_START',
        DECODE_COMPLETE: 'DECODE_COMPLETE',
        DECODE_FAIL: 'DECODE_FAIL',
        RECORDING_START: 'RECORDING_START',
        RECORDING_PROGRESS: 'RECORDING_PROGRESS',
        RECORDING_STOPPING: 'RECORDING_STOPPING',
        RECORDING_DONE: 'RECORDING_DONE',
        RECORDING_FAIL: 'RECORDING_FAIL',
        PLAYING_START: 'PLAYING_START',
        PLAYING_FAIL: 'PLAYING_FAIL',
        PLAYING_PROGRESS: 'PLAYING_PROGRESS',
        PLAYING_DONE: 'PLAYING_DONE',
        PLAYING_STOPPED: 'PLAYING_STOPPED',
        PLAYING_PAUSED: 'PLAYING_PAUSED'
    };

    Java.setAppletPath = function(path) {
        appletPath = path; 
    };

    Java.initialize = function(eventListener) {

        if (typeof eventListener == 'function') {
            initCallbacks.push(eventListener);
        }

        // check if already called
        if (initialized) return false;

        // try and get the folder where the applet is
        appletPath = appletPath || window.javaFolder; // NOTE: javaFolder is legacy code...
        if (typeof appletPath != 'string') {
            console.warn('Could not initialize java audio applet. No applet path set.');
            return false;
        }

        // set timer to wait for applet
        YAHOO.lang.later(setupDelay, this, function() {
            startAppletTimer();
            startProcessTimer();
            injectApplet();
        });

        initialized = true;
        return true;
    };
    
    // check if someone has tried to initialize
    Java.isInitialized = function() {
        return initialized;
    };

    Java.isReady = isReady;

    // destroy audio iframe
    Java.dispose = function() {
    
        var audioFrame = document.getElementById('audioFrame');

        // get audio applet
        if (audioFrame == null) return;

        // hide applet frame
        YUD.setStyle(audioFrame, 'display', 'none');

        // remove applet from DOM
        if (appletEl && appletEl.parentNode) {
            appletEl.parentNode.removeChild(appletEl);
        }
    };

    function processEvent(id, type) {

        // check the applet event id
        if (id == null) {
            console.warn('AudioApplet: Invalid event audio ID');
            return;
        }

        // this is for any data we want to pass the event
        var data = null;

        // the id is actually progress level value
        if (type == Java.Event.RECORDING_PROGRESS) {
            data = id;
            id = activeID;
        } else {
            console.log('AudioApplet: processEvent', arguments);
        }

        // check events
        var failEvent = (type.indexOf('_FAIL') != -1);
        var terminalEvent = (failEvent || 
            type == Java.Event.PLAYING_DONE || 
            type == Java.Event.PLAYING_STOPPED || 
            type == Java.Event.RECORDING_DONE);

        // check for load listener
        var loadListener = loadCallbacks[id];
        if (loadListener) {
            
            // fire event
            loadListener(id, type);
            
            // check if we are done with this event
            if (failEvent || type == Java.Event.DECODE_COMPLETE) {
                delete loadListener[id];
            }
            return; // don't need to check eventListener
        }

        // check for event listener
        var eventListener = callbacks[id];
        if (eventListener) {
            eventListener(id, type, data);
        }

        // check if terminal event
        if (terminalEvent) {
            
            // clear active id
            if (id == activeID) {
                playing = false;
                recording = false;
                activeID = null;
            }

            delete callbacks[id];
        }
    }

    // this function is used to listen for events that are fired from the java applet
    window.tdsFireAudioEvent = function(applet, event, data, sequenceNumber, logSeqNumber) {

        // check if applet is reporting it is ready
        if (event == Java.Event.INITIALIZED) {

            // check if java player is already ready (this will happen if the polling worked)
            if (isReady()) return;

            // check if applet has a valid external function 
            if (applet != null && typeof applet.getCurrentState == 'function') {
                // check if the applet current state says it is ready 
                if (applet.getCurrentState() == 'READY') {
                    console.log('AUDIO APPLET EVENT READY');
                    setApplet(applet);
                }
            }
        } else {
            processEvent(data, event); // , sequenceNumber, logSeqNumber
        }
    };

    /*************/
    /* AUDIO API */
    /*************/

    Java.isPlaying = function() {
        return playing;
    };

    Java.isRecording = function() {
        return recording;
    };

    Java.getState = function() {
        return appletEl.getCurrentState();
    };
    
    // @appletID = audio url
    /*Java.loadAudioClip = function(audioID, format, type) {
        if (!isReady()) return false;
        return appletEl.loadAudioClip(audioID, format, type);
    };*/

    Java.playAudioClip = function(audioID, format, type, eventListener) {
        if (!isReady() || playing || recording) return false;
        if (appletEl.playAudioClip(audioID, format, type)) {
            playing = true;
            activeID = audioID;
            if (typeof eventListener == 'function') {
                callbacks[audioID] = eventListener;
            }
            return true;
        } else {
            return false;
        }
    };

    Java.stopAudioClip = function() {
        if (!isReady()) return false;
        return appletEl.stopAudioClip();
    };

    /*Java.pauseAudioClip = function() {
        if (!isReady()) return false;
        return appletEl.pauseAudioClip();
    };

    Java.resumeAudioClip = function() {
        if (!isReady()) return false;
        return appletEl.resumeAudioClip();
    };*/

    Java.startCapture = function(audioID, duration, format, eventListener) {
        if (!isReady() || playing || recording) return false;
        if (appletEl.startCapture(audioID, duration, format)) {
            recording = true;
            activeID = audioID;
            if (typeof eventListener == 'function') {
                callbacks[audioID] = eventListener;
            }
            return true;
        } else {
            return false;
        }
    };

    Java.stopCapture = function() {
        if (!isReady()) return false;
        return appletEl.stopCapture();
    };

    Java.loadBase64Audio = function(audioID, format, type, base64, eventListener) {
        if (!isReady()) return false;

        appletEl.loadBase64Audio(audioID, format, type, base64);

        if (typeof eventListener == 'function') {
            loadCallbacks[audioID] = eventListener;
        }

        return true;
    };

    // This method is called to retrieve the audio data as base64 encoded in the format requested
    Java.retrieveBase64Audio = function(audioID, format) {
        
        if (!isReady()) return null;
        
        // get base64
        var base64 = appletEl.retrieveBase64Audio(audioID, format); // WAVE, SPX
        
        // make sure it is a javascript string (a not a java string)
        if (base64 != null && typeof (base64) == 'object') {
            base64 = new String(base64).toString();
        }
        
        return base64;
    };

    Java.estimateQuality = function (audioID) {
        if (!isReady()) return null;
        return appletEl.estimateQuality(audioID);
    };

    /*Java.unloadAudioClip = function(audioID) {
        if (!isReady()) return false;
        appletEl.unloadAudioClip(audioID);
        return true;
    };*/

    Audio.Java = Java;

})(TDS.Audio);


