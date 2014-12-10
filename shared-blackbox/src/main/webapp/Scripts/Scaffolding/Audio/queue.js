// A queue for creating audio sounds to play back to back
(function(YAHOO, Audio) {

    // keep track of how many instances of queue we have created
    var numInstances = 0;

    var Queue = function() {

        this._instance = ++numInstances;
        this._isStarted = false;
        this._sounds = [];
        this._current = null;
        
        // fired when the first audio file of the queue begins to play
        this.onStart = new YAHOO.util.CustomEvent('onStart', this, false, YAHOO.util.CustomEvent.FLAT);
        
        // fired when the last audio file of the queue stops or someone manually stops the queue
        this.onStop = new YAHOO.util.CustomEvent('onStop', this, false, YAHOO.util.CustomEvent.FLAT);
    };

    // get all the sounds added to this queue
    Queue.prototype.getSounds = function() {
        return this._sounds;
    };

    // add a sound to the queue
    Queue.prototype.add = function(sound) {
        this._log('Add', sound);
        sound.onFailure.subscribe(this._onStop, this, true);
        sound.onStop.subscribe(this._onStop, this, true);
        sound.onIdle.subscribe(this._onFinish, this, true);
        this._sounds.push(sound);
    };

    // remove a sound from the queue
    Queue.prototype.remove = function(sound) {
        sound.onFailure.subscribe(this._onStop, this, true);
        sound.onStop.unsubscribe(this._onStop, this, true);
        sound.onIdle.unsubscribe(this._onFinish, this, true);
        Util.Array.remove(this._sounds, sound);
    };

    // removes all the audio data from the queue
    Queue.prototype.clear = function() {
        for (var i = 0; i < this._sounds.length; i++) {
            this.remove(this._sounds[i]);
        }
    };

    // dispose of this queue
    Queue.prototype.dispose = function() {
        this._log('Dispose');
        this.stop();
        this.clear();
        this.onStart.unsubscribeAll();
        this.onStop.unsubscribeAll();
    };

    // check if the queue is started
    Queue.prototype.isStarted = function() {
        return this._isStarted;
    };

    Queue.prototype.getCurrent = function() {
        return this._current;
    };
    
    // call this to begin playing the queue
    Queue.prototype.start = function() {

        // check if already started
        if (this._isStarted) {
            return false;
        }
        
        // check if any audio to play
        if (this._sounds.length == 0) {
            return false;
        }
        
        // play first sound
        var played = this._play(this._sounds[0]);
        
        // check if we played and fire event
        if (played) {
            this._log('Start');
            this._isStarted = true;
            this.onStart.fire(this);
        }
        
        return played;
    };
    
    // call this to stop playing the queue
    Queue.prototype.stop = function() {
        if (this._current) {
            this._current.stop();
        }
    };

    // call this internally to play a sound
    Queue.prototype._play = function(sound) {
        if (sound.play()) {
            this._current = sound;
            return true;
        } else {
            return false;
        }
    };
    
    // this is called when someone manually stops the audio from playing
    Queue.prototype._onStop = function(sound) {
        
        // check if the queue is started
        if (!this._isStarted) return;
        
        // check if the current sound was the one that stopped
        if (this._current != sound) return;
        
        // set queue as stopped
        this._setStopped();
    };

    // this gets called when audio finishes on its own
    Queue.prototype._onFinish = function(sound) {

        // check if queue is started
        if (!this._isStarted) return;

        // check if the current sound was the one that finished
        if (this._current != sound) return;

        // figure out what the next audio is
        var inactiveIdx = this._sounds.indexOf(sound);
        if (inactiveIdx == -1) return; // data does not belong to this queue
        var nextSound = this._sounds[inactiveIdx + 1];

        // check if there is new audio to play
        if (nextSound) {
            if (!this._play(nextSound)) {
                // the next audio file failed to play
                this._setStopped();
            }
        } else {
            // there was no more audio to play
            this._setStopped();
        }

    };

    // this is called internally to indicate the queue has stopped playing
    Queue.prototype._setStopped = function() {
        if (!this._isStarted) return; // already stopped
        this._log('Stop');
        this._isStarted = false;
        this._current = null;
        this.onStop.fire(this);
    };
    
    Queue.prototype._log = function(name, sound) {
        var msg = 'AUDIO QUEUE ' + this._instance + ': ' + name;
        if (sound) {
            msg += ' - ' + sound.getId();
        }
        console.log(msg);
    };

    // create a new queue object (you need to keep a reference to this yourself)
    Audio.createQueue = function() {
        return new Queue();
    };

})(YAHOO, AsiItem.Audio);


