AsiItem = (typeof (AsiItem) == "undefined") ? {} : AsiItem;

//WAPIAudioInterface is used for browsers having support for Web Audio API, context is provided by AudioFactory
AsiItem.WAPIAudioInterface = function (context) {

    this._tracksToPlay = [];
    this._currentTrack = 0;
    this.disposed = false;

    this._context = context; //context is provided by factory
    this._source = null;
    this._isPlaying = false;
    
    this._timer = null; //timer id
};

// Add an audio track to the playlist. When this is called the audio data has already
// been loaded.
AsiItem.WAPIAudioInterface.prototype.add = function (url, id, startFunction, stopFunction, instance) {

    // Check that audio data has been loaded for this track
    var buffer = AsiItem.WAPIAudioInterface.audioDataHash[url];
    if (buffer === 'undefined') {
        AsiItem.EventLog("WAPIAudioInterface.add - Audio is not preloaded.");

        return;
    }

    // Create an object for this audio track
    var track = {
        url: url,
        id: id,
        startFunction: startFunction,
        stopFunction: stopFunction,
        instance: instance,
        audioData: buffer
    };

    this._tracksToPlay.push(track);
};

//start track
AsiItem.WAPIAudioInterface.prototype.start = function () {

    //if player is running then stop it
    if (this._isPlaying) {
        this.stop();
    }

    AsiItem.EventLog("WAPI Interface start - Intialize player for playing");

    // initialize player run component
    this._currentTrack = 0;
    this._isPlaying = true;

    //call playCurrentTrack to play the first track on the playlist
    this.playCurrentTrack();
};

//create audio source using given buffer
AsiItem.WAPIAudioInterface.prototype.createSource = function (buffer) {

    // Version without gain node
    var source = this._context.createBufferSource();
    source.buffer = buffer;
    source.connect(this._context.destination);

    return source;
};

// Plays the current track as dictated by '_currentTrack' and, once completed, automatically advances and
//  plays the next track.
AsiItem.WAPIAudioInterface.prototype.playCurrentTrack = function () {

    var audioData = AsiItem.WAPIAudioInterface.audioDataHash[this._tracksToPlay[this._currentTrack].url];
    if (!audioData) {
        AsiItem.EventLog("WAPIAudioInterface.playCurrentTrack - audioData no longer available.");

        while (this._currentTrack < this._tracksToPlay.length) {
            var current = this._tracksToPlay[this._currentTrack];
            current.startFunction(current.id, current.instance);
            current.stopFunction(current.id, current.instance);
            this._currentTrack += 1;
        }

        return;
    }

    // Version without gain node
    var source = this.createSource(audioData);
    var duration = audioData.duration;

    this._source = source;

    // Play the playNow track.Safari does not support start/stop,It supports deprecated noteOn/noteOff
    source.start ? source.start(0) : source.noteOn(0);
    this.onTrackStarted();

    // Set an event to trigger once the current track has completed playing so that the next
    //  track can be played OR we can stop the audio and reactivate user input
    var self = this;
    var recurse = arguments.callee;
    var delayInSeconds = 1; // Delay in seconds between audio tracks

    this._timer = setTimeout(function() {

        self.onTrackEnded();
        self._currentTrack += 1; // Next track

        if (self._currentTrack < self._tracksToPlay.length) {
            recurse.call(self); // Call playCurrentTrack to play the next track in _tracksToPlay
        } else {
            self.stop(); // Done with all tracks
        }
    },
    (duration + delayInSeconds) * 1000);
};

// Stop playing the current track NOW
AsiItem.WAPIAudioInterface.prototype.stop = function () {

    clearTimeout(this._timer);

    //Safari does not support start/stop,It supports deprecated noteOn/noteOff    
    if (this._source && this._isPlaying) {
        this._source.stop ? this._source.stop(0) : this._source.noteOff(0);
    }

    this._isPlaying = false;
};

//dispose; reset player
AsiItem.WAPIAudioInterface.prototype.dispose = function () {

    this._tracksToPlay = [];
    this.disposed = true;

    this._context = null;
    this._source = null;
    this._isPlaying = false;

    this._timer = null;

    this.audioDataHash = {};
};

// onTrackStarted function fires when an audio track begins to play and
//  calls the startFunction for this audio track
AsiItem.WAPIAudioInterface.prototype.onTrackStarted = function () {
    if (this._currentTrack < this._tracksToPlay.length) {
        var current = this._tracksToPlay[this._currentTrack];
        if (current.startFunction) {
            current.startFunction(current.id, current.instance);
        }
    }
};

// onTrackEnded function fires when a track has completed playback and
//  calls the stopFunction for this audio track
AsiItem.WAPIAudioInterface.prototype.onTrackEnded = function () {

    if (this._currentTrack < this._tracksToPlay.length && this._isPlaying) {
        var current = this._tracksToPlay[this._currentTrack];
        if (current.stopFunction) {
            current.stopFunction(current.id, current.instance);
        }
    }
};

//global audio cache for the item
AsiItem.WAPIAudioInterface.audioDataHash = {};
