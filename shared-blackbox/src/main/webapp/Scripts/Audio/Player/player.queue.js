//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
// A queue for creating audio data to play back to back
(function(Player) {

    // keep track of how many instances of queue we have created
    var numInstances = 0;

    var Queue = function() {

        this._instance = ++numInstances;
        this._isStarted = false;
        this._playerIDs = []; // all player ids for this queue
        this._currentID = null; // current playing id
        
        // fired when the first audio file of the queue begins to play
        this.onStart = new Util.Event.Custom(this);
        
        // fired when the last audio file of the queue stops or someone manually stops the queue
        this.onStop = new Util.Event.Custom(this);
    };

    Queue.prototype._log = function(name, id) {
        var msg = 'AUDIO QUEUE ' + this._instance + ': ' + name;
        if (id) {
            msg += ' - ' + id;
        }
        console.log(msg);
    };

    // this is called internally to indicate queue has started playing
    Queue.prototype._setStarted = function(id) {
        if (this._isStarted) return; // already started
        this._log('Start', id);
        this._isStarted = true;
        Player.onStop.subscribe(this._onStop, this, true);
        Player.onIdle.subscribe(this._onIdle, this, true);
        this.onStart.fire(this);
    };

    // this is called internally to indicate the queue has stopped playing
    Queue.prototype._setStopped = function(id) {
        if (!this._isStarted) return; // already stopped
        this._log('Stop', id);
        this._isStarted = false;
        Player.onStop.unsubscribe(this._onStop, this, true);
        Player.onIdle.unsubscribe(this._onIdle, this, true);
        this.onStop.fire(this);
    };

    // called to start playing
    Queue.prototype._play = function(id) {
        if (Player.play(id)) {
            this._currentID = id;
            return true;
        } else {
            return false;
        }
    };

    // this is called from player api event
    Queue.prototype._onStop = function(id) {
        // we need to check if the audio playing matches our queue
        if (this._currentID == id) {
            this._currentID = null; // remove current id
            this._setStopped(id);
        }
    };

    // this gets called when audio is done
    Queue.prototype._onIdle = function(id) {

        // check if queue is playing
        if (!this._isStarted) return;

        this._currentID = null; // remove current id

        // figure out what the next audio is
        var inactiveIdx = this._playerIDs.indexOf(id);
        if (inactiveIdx == -1) return; // data does not belong to this queue
        var nextID = this._playerIDs[inactiveIdx + 1];

        // check if there is new audio to play
        if (nextID) {
            if (!this._play(nextID)) {
                // the next audio file failed to play
                this._setStopped(id);
            }
        } else {
            // there was no more audio to play
            this._setStopped(id);
        }

    };

    // check if the queue is started
    Queue.prototype.isStarted = function() {
        return this._isStarted;
    };

    // call this to begin playing the queue
    Queue.prototype.start = function() {

        if (this._playerIDs.length == 0) {
            return false;
        }

        var firstID = this._playerIDs[0];
        if (this._play(firstID)) {
            this._setStarted();
            return true;
        }

        return false;
    };

    // call this to stop playing the queue
    Queue.prototype.stop = function() {
        // check if we have started the queue
        if (this.isStarted()) {
            Player.stop(this._currentID);
        }
    };

    // insert an a
    Queue.prototype.insert = function(id, pos) {
        Util.Array.insertAt(this._playerIDs, id, (pos || 0));
    };

    // append an audio file to the end of the list
    Queue.prototype.append = function(id) {
        this._playerIDs.push(id);
    };

    // remove an audio file from the list
    Queue.prototype.remove = function(id) {
        Util.Array.remove(this._playerIDs, id);
    };

    // removes all the audio from the queue
    Queue.prototype.clear = function () {
        // copy the array so that we aren't modifying as we iterate over it
        var ids = this._playerIDs.slice();

        for (var i = 0; i < ids.length; i++) {
            this.remove(ids[i]);
        }
    };

    // dispose of this queue
    Queue.prototype.dispose = function() {
        
        // stop and clear out ids
        this.stop();
        this.clear();
        
        // unsubscribe everyone listening to queue
        this.onStart.unsubscribeAll();
        this.onStop.unsubscribeAll();
    };

    Player.createQueue = function(ids) {
        var queue = new Queue();
        
        if (ids) {
            for (var i = 0; i < ids.length; i++) {
                queue.append(ids[i]);
            }
        }

        return queue;
    };

})(TDS.Audio.Player);


