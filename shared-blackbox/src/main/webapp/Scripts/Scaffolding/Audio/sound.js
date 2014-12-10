/*
This contains an abstrction of SM2 sound object.
*/

/*
SoundManager2 Help

API:
- load()
- play()
- stop()
- pause()
- setPosition()
- position
- durationEstimate
- playState
- paused

EVENTS:
- onplay
- whileplaying
- onpause
- onstop
- onfinish
- onfailed
*/

(function(SM, Audio) {

    var Sound = function(settings) {

        // fired when playing sound
        this.onPlay = new YAHOO.util.CustomEvent('onPlay', this, false, YAHOO.util.CustomEvent.FLAT);
        
        // fired when sound is manually stopped
        this.onStop = new YAHOO.util.CustomEvent('onStop', this, false, YAHOO.util.CustomEvent.FLAT);
        
        // fired when sound finishes on its own
        this.onFinish = new YAHOO.util.CustomEvent('onFinish', this, false, YAHOO.util.CustomEvent.FLAT);
        
        // fired when sound is stopped mnually or finishes
        this.onIdle = new YAHOO.util.CustomEvent('onIdle', this, false, YAHOO.util.CustomEvent.FLAT);
        
        // fired when audio fails to load
        this.onFailure = new YAHOO.util.CustomEvent('onFailure', this, false, YAHOO.util.CustomEvent.FLAT);

        // create internal SM2 sound object
        settings.onload = this._onLoad.bind(this);
        settings.onplay = this._onPlay.bind(this);
        settings.onstop = this._onStop.bind(this);
        settings.onfinish = this._onFinish.bind(this);
        settings.onfailure = this._onFailure.bind(this);
        this._service = SM.createSound(settings);
    };

    Sound.prototype.getId = function() {
        return this._service.id;
    };

    Sound.prototype.isPlaying = function() {
        return (this._service.playState === 1);
    };

    Sound.prototype.play = function() {
        
        // play SM2 sound
        var result = this._service.play();
        
        // if the result object was returned and the ready state is not 2 then we are ok
        if (result && result.readyState !== 2) {
            return true;
        } else {
            return false;
        }
    };

    Sound.prototype.stop = function() {
        return this._service.stop();
    };

    Sound.prototype._onLoad = function(success) {
        if (success === false) {
            console.log('AUDIO FAILED: ' + this.getId());
            YAHOO.lang.later(0, this.onFailure, this.onFailure.fire, this);
        }
    };

    Sound.prototype._onPlay = function() {
        console.log('AUDIO PLAY: ' + this.getId());
        YAHOO.lang.later(0, this.onPlay, this.onPlay.fire, this);
    };

    Sound.prototype._onStop = function() {
        console.log('AUDIO STOP: ' + this.getId());
        YAHOO.lang.later(0, this.onStop, this.onStop.fire, this);
        YAHOO.lang.later(0, this.onIdle, this.onIdle.fire, this);
    };

    Sound.prototype._onFinish = function() {
        console.log('AUDIO FINISH: ' + this.getId());
        YAHOO.lang.later(0, this.onFinish, this.onFinish.fire, this);
        YAHOO.lang.later(0, this.onIdle, this.onIdle.fire, this);
    };

    Sound.prototype._onFailure = function() {
        console.log('AUDIO FAILURE: ' + this.getId());
        YAHOO.lang.later(0, this.onFailure, this.onFailure.fire, this);
    };

    Audio.Sound = Sound;

})(soundManager, AsiItem.Audio);
   