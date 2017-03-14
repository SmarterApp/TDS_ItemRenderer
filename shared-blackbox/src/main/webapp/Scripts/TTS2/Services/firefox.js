//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
/*
This is the Firefox API for SB.
*/

// TTS service: Secure Browser
function TTSService_SB()
{
    
    this.runtime = null;
    this.wordBoundaryRegex = new RegExp(/<[^>]+>|[\s,.;]+|[^<^ ]+/g); // Our word boundary detection logic. We add sync tags around these boundaries if there is speakable text in them
    this.isSpeakable = new RegExp(/[A-Za-z0-9_]+/);  // This regex checks if a match has any speakable characters in it. Only those get a sync tag around them
	this.BOOKMARK_TAG = '<bookmark mark="start"/> ';  // This is our sync tag - WINDOWS ONLY!!! This is OS specific
    this.bookmarks = []; // our registry of sync tags added

    this.supportsVolumeControl = function() {
        return true;
    };

    this.supportsPitchControl = function () {
        return true;
    };

    this.supportsRateControl = function() {
        return true;
    };

    this.isSupported = function ()
    {
    	// SB-1506-Intelligent-Muting. Use enableComponents to support both SB 8.1 and 9.0
        var components = Mozilla.enableComponents();
        if (!components) {
            return false;
        }
        return components.classes["@mozilla.org/securebrowser;1"];
    };

    this.load = function () {
        try {
            if (!this.isSupported()) {
                return false;
            }
            
            var success = Mozilla.execPrivileged(function() {
                var sbClass = Components.classes["@mozilla.org/securebrowser;1"];
                if (sbClass) {
                    this.runtime = sbClass.createInstance(Components.interfaces.mozISecureBrowser);
                 }
            }.bind(this));
            if (!success) {
                    console.log('SB runtime component failed to load');
            }
            

            // check if this was a SB and we got the runtime
            if (!this.runtime) {
                return false;
            }

            // dispose of runtime. Neospeech voice is finicky
            // and we need to make sure that it gets closed out correctly before we try to use it
            // again. Specifically, we are trying to address an issue with VW Julie where page reloads 
            // can cause TTS to stop working while Julie is reestablishing
            YUE.on(window, 'beforeunload', this.dispose.bind(this));            

            this.runtime.initialize();

            this.osHacks();
            // HACK: If the TTS gets reinitialized you have to play something then set volume
            // NOTE: This fix is lazily done the first time playing occurs now
            // this.play(' ');
            // this.setVolume(10);
            setTimeout(function() { TTS.Manager.Events.onServiceLoad.fire(); }, 0);
            return true;
        }
        catch (ex) {
            return false;
        }
    };

    this.dispose = function () {
        console.log('Disposing TTS Runtime...');
        if (this.runtime != null) {
            delete this.runtime;
            this.runtime = null;
        }
    };

    this.osHacks = function () {
      this.pluginWordBoundaryFunction = null;
      if(Util.Browser.isLinux()){
        this.pluginWordBoundaryFunction = null;
        return;
      }else if(Util.Browser.isWindows() && Util.Browser.getSecureVersion() >= 6.4){  // 6.4+ reports the character position and lenght of the native word boundary event
        this.pluginWordBoundaryFunction = 'SPEI_WORD_BOUNDARY';
	  }else if(Util.Browser.isWindows()){
        this.pluginWordBoundaryFunction = 'SPEI_TTS_BOOKMARK';  // We have to emulate word boundaries ourselves since the word start index was NOT coming through in SB6.3 and before
      }else if(Util.Browser.isMac()){
        this.pluginWordBoundaryFunction = 'soWordCallBack';
      }
    };


    /**
     * Remember that observers added like this are _not_ cleaned up on refresh, you are leaking 
     * memory unless you remove them.   It might only be in earlier FF with Firebug (aka SB 6.0)
     */
    this.subscribe = function(EventManager){
      try{
          if(!EventManager) return;
          this.unregisterAll();
          this.eM = EventManager;

          var os = Components.classes["@mozilla.org/observer-service;1"].getService(
            Components.interfaces.nsIObserverService
          );
          os.addObserver(this, 'sb-word-speak', false);
          this.runtime.initializeListener(this.pluginWordBoundaryFunction);

        }catch(e){
          console.error("Failed to subscribe to EventManager firefox tts events", e);
        }
    };

    /**
     * If you don't do this, then it leaks listeners into firefox and your console
     * will show that you are adding a listener for _each_ page refresh.  
     */
    this.unregisterAll = function(){
        try{
            var os = Components.classes["@mozilla.org/observer-service;1"].getService(
              Components.interfaces.nsIObserverService
            );

            var deadButNotTruly = os.enumerateObservers('sb-word-speak');
            while(deadButNotTruly.hasMoreElements()){
                os.removeObserver(deadButNotTruly.getNext(), 'sb-word-speak');
            }
        }catch(e){
          console.error("Remove listeners that may actually be listening.", e);
        }
    };

    //Clean up a single reference
    this.unregister = function(ref){
      var os = Components.classes["@mozilla.org/observer-service;1"].getService(
        Components.interfaces.nsIObserverService
      );
      os.removeObserver(ref || this, 'sb-word-speak', false);
    };


    //Notifiy any listeners that a new word boundary event has occured.
    this.observe = function (subject, topic, data) {
        if (topic == 'sb-word-speak' && this.eM) {
			//Now to decide if these are true word boundary events or bookmark events (for which we emulate the word boundary events)
			if(this.pluginWordBoundaryFunction == 'SPEI_TTS_BOOKMARK') {
			    var syncpoint = this.bookmarks.shift();
			    if (!syncpoint || syncpoint.indexOf("-1") > 0)
			        return;
			    data = syncpoint;				
			}
            // Bug 111824 - data is a string in the format "WordStart:x, WordLength:y"
            // event handler requires parameter "index" to have the value of "WordStart"
            // parse data string and return index = parsedData.WordStart
            var dataArray = data.split(',');
            var parsedData = {};
            for (var i = 0; i < dataArray.length; i++) {
                var dataField = dataArray[i].split(':');
                parsedData[dataField[0]] = parseInt(dataField[1]);
            }
            var index = parsedData.WordStart ? parsedData.WordStart : null;
            this.eM.fire({subject: subject, topic: topic, data: data, index: index});
      }
    };

    // get the SB status converted into a nice enum
    this.getStatus = function()
    {
        if (this.runtime)
        {
            var currentStatus = this.runtime.status;
            if (currentStatus == 'Stopped') return TTS.Status.Stopped;
            else if (currentStatus == 'Playing') return TTS.Status.Playing;
            else if (currentStatus == 'Paused') return TTS.Status.Paused;
            else if (currentStatus == null || currentStatus == '') return TTS.Status.Unknown; 
        }

        return TTS.Status.Uninitialized;
    };

    this.play = function(text)
    {
        if (!this.runtime) return false;
		
        // If we have to rely on sync tags on this platform, inject them and build up a list of tags injected and their character positions
		if(this.pluginWordBoundaryFunction == 'SPEI_TTS_BOOKMARK') {
			text = this._injectSyncTags(text);
		}
		
        this.runtime.play(text);
        return true;
    };

    this.pause = function()
    {
        if (!this.runtime) return false;
        this.runtime.pause();
        return true;
    };

    this.resume = function()
    {
        if (!this.runtime) return false;
        this.runtime.resume();
        return true;
    };

    this.stop = function()
    {
        if (!this.runtime) return false;

        this.runtime.stop();

        return true;
    };

    // get the current volume
    this.getVolume = function()
    {
        if (!this.runtime) return -1;
        return Math.min(this.runtime.volume, 10);
    };

    this.setVolume = function(level)
    {
        if (!this.runtime) return false;
        if (typeof(level) != 'number') return false; // validate type
        if (level < 0 || level > 10) return false; // validate range
        if (this.runtime.volume == level) return false; // check if difference
        this.runtime.volume = level;
        return true;
    };
    
    // get the current pitch
    this.getPitch = function()
    {
        if (!this.runtime) return -1;
        return Math.min(this.runtime.pitch, 20);
    };

    // set pitch to a new value
    this.setPitch = function (level) {
        if (!this.runtime) return false;
        if (typeof (level) != 'number') return false; // validate type
        if (level < 0 || level > 20) return false; // validate range
        /*
        * we had the following line:
        *
        * if (this.runtime.pitch == level) return false; // check if difference
        *
        * somehow there is a bug in OS X - setting pitch would not work.
        * In TTS.js at line 282 we set the voice pack. We do this on every "play".
        * This is what causes the pitch to get messed up. The problem is the pitch 
        * is set once but on clicking "play" we reset the voice pack. We maintain the 
        * "existing" pitch information in a different data structure as compared to what we do for voice packs.
        * The line quoted above blocks unwittingly blocks resetting the pitch because the pitch
        * information in inconsistent.
        * 
        * so we will fix the quoted line. we will reset pitch in all cases but return "true" only 
        * if the old pitch is different from the new pitch. false otherwise.
        */
        var oldPitch = this.runtime.pitch;
        //set to the new pitch.
        this.runtime.pitch = level;
        //return true if old pitch and level are different.
        if (oldPitch != level)
            return true;
        //false in all other cases.
        return false;
    };
    
    // get the current rate
    this.getRate = function()
    {
        if (!this.runtime) return -1;
        return Math.min(this.runtime.rate, 20);
    };

    // set rate to a new value
    this.setRate = function (level)
    {
        if (!this.runtime) return false;
        if (typeof (level) != 'number') return false; // validate type
        if (level < 0 || level > 20) return false; // validate range
        var oldRate = this.runtime.rate;
        //set to the new rate.
        this.runtime.rate = level;
        //return true if old rate and level are different.
        if (oldRate != level)
            return true;
        //false in all other cases.
        return false;
    };

    this.getVoices = function()
    {
        if (!this.runtime) return null;
        
        // get voice string
        var voicesData = this.runtime.voices;
        
        // make sure we got returned something
        if (voicesData == null || voicesData.length == 0) return [];
        
        // split voices and return array
        return voicesData.split(',');
    };

    // get the current system voice
    this.getVoice = function()
    {
        if (!this.runtime) return null;
        return this.runtime.voiceName;
    };

    this.setVoice = function (voice) {
        if (!this.runtime){return false;}
        this.runtime.voiceName = voice;
        return true;
    };

    // This injects sync tags into the text. The tagged up text is then used for speech synthesis 
    // and the sync events coming from the native TTS engine is used to determine the "word boundary" events we emulate
    this._injectSyncTags = function(inputText) {        
        
        var text = inputText.indexOf(this.BOOKMARK_TAG) == 0 ? 
            inputText.substring(this.BOOKMARK_TAG.length)  // Dropping the leading <bookmark> tag
            : inputText;

        this.bookmarks = [];
        var pos = this.BOOKMARK_TAG.length;				
		var matches = text.match(this.wordBoundaryRegex);
		var newText = "";
        
        for (var i = 0; matches != null && i < matches.length; i++) {
            var match = matches[i];
            
            if (match.trim().length > 0 && match.indexOf('<') < 0 && this.isSpeakable.test(match)) {
                newText += this.BOOKMARK_TAG;
                this.bookmarks.push("WordStart:" + pos + ", WordLength:" + match.length);				
            }
            
            pos += match.length;
            newText += match;
        }
        
        return this.BOOKMARK_TAG + newText;
    };
  
}
