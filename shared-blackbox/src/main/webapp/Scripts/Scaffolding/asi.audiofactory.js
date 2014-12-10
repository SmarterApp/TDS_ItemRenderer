AsiItem = (typeof (AsiItem) == "undefined") ? {} : AsiItem;

//######################################################################################
//###############Factory Pattern (WAPIAudioInterface, AudioInterface)###################
//######################################################################################

//AudioPlayerFactory manages creation of audio interfaces
AsiItem.AudioPlayerFactory = function () {

    if (AsiItem.AudioPlayerFactory.Context === undefined) {

        AsiItem.AudioPlayerFactory.Context = null;

        // Establish browser independent AudioContext if available
        window.AudioContext = window.AudioContext || window.webkitAudioContext;

        // Check for AudioContext (Web Audio) support
        if (!window.AudioContext) {
            AsiItem.EventLog('Web Audio API is not supported in this browser.');
        } else {
            try {
                var audioContext = new window.AudioContext();
                AsiItem.AudioPlayerFactory.Context = audioContext;
            } catch (e) {
                AsiItem.EventLog('Web Audio API not supported on this browser');
            }
        }
    }

    if (AsiItem.AudioPlayerFactory.Context !== null) {
        this.context = AsiItem.AudioPlayerFactory.Context;
        this.EnvSupportsWebAPI = true;
    } else {
        this.EnvSupportsWebAPI = false;
    }
};

// Create audio interface for ASI items
AsiItem.AudioPlayerFactory.prototype.createAudioInterface = function () {

    // Use WebAPI audio if supported, otherwise use SoundManager 2 Audio
    if (this.EnvSupportsWebAPI) {
        return new AsiItem.WAPIAudioInterface(this.context);
    } else {
        return new AsiItem.AudioInterface();
    }
};

//called to preload data
AsiItem.AudioPlayerFactory.prototype.onReady = function (playerContent, onReady) {

    if (!this.EnvSupportsWebAPI) {
        onReady();
        return;
    }

    try {
        // Preload audio data using async XHR calls
        var loader = new AsiItem.AudioPlayerFactory.BufferLoader(
            this.context,
            playerContent,
            function() {
                //player is ready
                AsiItem.EventLog('onReady - ASI audio content loaded');

                // Callback to notify that we're done loading audio
                onReady();
            });
    } catch (e) {

        AsiItem.EventLog('Failed to load audio tracks for Web Audio API... reverting to SM2 audio');
        this.EnvSupportsWebAPI = false;

        //call the callback function because audio will be played using SM API
        onReady();
    }
};

// BufferLoader object - Ultimately what this object does is populate the playerContent
//  object that is passed into the constructor AND fill in the
//  AsiItem.WAPIAudioInterface.audioDataHash with the tracks needed for this object's
//  audio

// API to preload audio asynchronously
AsiItem.AudioPlayerFactory.BufferLoader = function (context, playerContent, callback) {

    this.context = context;
    this.onLoadComplete = callback;
    this.loadCount = 0;

    // Load audio tracks in playerContent
    var len = playerContent ? playerContent.length : 0;
    var loadInitiated = {};
    for (var i = 0; i < len; ++i) {
        if (typeof loadInitiated[playerContent[i].url] === 'undefined') {
            loadInitiated[playerContent[i].url] = true;
            this.loadBuffer(playerContent[i], playerContent.length);
        } else {
            this.loadCount += 1;
        }
    }
};

// Load a single track 'url' into position 'index' in the loader.playerContent array and,
//  once the load is complete, decode the track.
AsiItem.AudioPlayerFactory.BufferLoader.prototype.loadBuffer = function (track, numTracks) {

    // Load buffer asynchronously
    var request = new XMLHttpRequest();
    request.open("GET", track.url, true);
    request.responseType = "arraybuffer";

    var self = this;

    request.onload = function() {
        // Asynchronously decode the audio file data from the XHR stored in request.response
        self.context.decodeAudioData(
            request.response,
            function(decodedBuffer) {
                if (!decodedBuffer) {
                    AsiItem.EventLog('BufferLoader.loadBuffer: Error decoding file data');
                    return;
                }
                AsiItem.EventLog('BufferLoader.loadBuffer: Buffer decoded successfully (' + self.loadCount + ')');

                // Add to hash track lookup
                if (typeof AsiItem.WAPIAudioInterface.audioDataHash[track.url] !== 'undefined') {
                    AsiItem.EventLog('BufferLoader.loadBuffer: Track ' + track.url + ' already loaded');         
                }
                AsiItem.WAPIAudioInterface.audioDataHash[track.url] = decodedBuffer;

                // Is everything loaded?
                self.loadCount += 1;
                if (self.loadCount === numTracks) {
                    self.onLoadComplete();
                }
            },
            function(error) {
                AsiItem.EventLog('BufferLoader.loadBuffer: decodeAudioData error');
            }
        );
    };

    request.onerror = function () {
        AsiItem.EventLog('BufferLoader.loadBuffer: XHR error');
    };

    request.send();
};
