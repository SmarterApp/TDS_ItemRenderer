AsiItem = (typeof (AsiItem) == "undefined") ? {} : AsiItem;

// This object acts as an interface to the Audio2 logic.  It just 
// handles the audio q-ing logic and handles the callbacks.
AsiItem.AudioInterface = function () {
    this._tracksToPlay = [];
    this._lastPlayed = 0;
    this._audioQ = AsiItem.Audio.createQueue();
    var self = this;
    this.disposed = false;

    // Add an audio to the queue.
    this.add = function (url, id, startFunction, stopFunction, instance) {
        // Server now handles audio tags for us, no need to substitute.
        // if ((/Safari/.test(navigator.userAgent)) && (!/Chrome/.test(navigator.userAgent)) && (/\.ogg/.test(url))) {
        //     url = url.replace('\.ogg', '\.m4a');
        // }
        var obj = {
            url: url,
            id: id,
            startFunction: startFunction,
            stopFunction: stopFunction,
            instance: instance
        };
        this._tracksToPlay.push(obj);

        // Create audio data
        var audioData = AsiItem.AudioInterface.audioData[id];
        if (audioData == null) {
            audioData = AsiItem.Audio.createSound(id, url);
            AsiItem.AudioInterface.audioData[id] = audioData;
        }

        // Add the callbacks
        audioData.onPlay.subscribe(function () {
            // Avoid late callback events.
            if (self.disposed)
                return;
            self.onStart();
        });

        audioData.onIdle.subscribe(function () {
            // Avoid late callback events.
            if (self.disposed)
                return;
            self.onStop();
        });

        // Add the data to the audio queue
        this._audioQ.add(audioData);

    };
};

AsiItem.AudioInterface.prototype.dispose = function () {
    AsiItem.EventLog('AudioInterface - dispose');
    this._audioQ.dispose();
    this.disposed = true;
};

// User driven start the audio sequence.
AsiItem.AudioInterface.prototype.start = function () {
    this._audioQ.start();
};

// User driven stop the audio sequence
AsiItem.AudioInterface.prototype.stop = function () {
    this._audioQ.stop();
};

// Event: An audio in the sequence has completed.
AsiItem.AudioInterface.prototype.onStop = function () {
    if ((this._lastPlayed > 0) && (this._tracksToPlay.length > this._lastPlayed - 1)) {
        var current = this._tracksToPlay[this._lastPlayed - 1];
        var spid = current.id;
        var instance = current.instance;
        if (current.stopFunction)
            current.stopFunction(spid, instance);
    }    
};

// Event: An audio in the sequence is about to start
AsiItem.AudioInterface.prototype.onStart = function () {
    if (this._tracksToPlay.length > this._lastPlayed) {
        var current = this._tracksToPlay[this._lastPlayed];
        var spid = current.id;
        var instance = current.instance;
        if (current.startFunction) {
            current.startFunction(spid, instance);
        }
    }
    this._lastPlayed++;
};

AsiItem.AudioInterface.audioData = [];


