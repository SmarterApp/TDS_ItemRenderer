//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
// TTS service: Secure Browser
function TTSService_Chrome()
{
    this.runtime = null;
    this.voices = [];
    this.status = TTS.Status.unknown;
    this.currentVoice = '';
    this.volume = 10;
    this.rate = 10;    // Max 20
    this.pitch = 10;   // Max 20 

    this.supportsVolumeControl = function () {
        return true;
    };

    this.supportsPitchControl = function () {
        return true;
    };

    this.supportsRateControl = function () {
        return true;
    };


    this.isSupported = function()
    {
        return Util.Browser.isChrome();
    };

    this.load = function()
    {
        if (!this.isSupported()) return false;

        var thisObj = this;
        this.status = TTS.Status.Initializing;

        window.addEventListener("message", function (event) {
          //console.log("Message Listener", event.data, event.data.command);
          try{
            if (event.data.type && (event.data.type == "CHROME RESPONSE" && event.data.status == "OK")) {
                switch (event.data.command) {
                    case 'TTS INIT':                        
                        if (thisObj.status == TTS.Status.Initializing) {  // Only if we are waiting to initialize. We may have posted multiple requests to chrome to initialiaze so may get back multiple responses
                            thisObj.voices = event.data.result.split(',');                            
                            thisObj.status = TTS.Status.Stopped;
                            setTimeout(function() { TTS.Manager.Events.onServiceLoad.fire(); }, 2);
                        }
                        break;
                    case 'TTS STATUS':
                        //TTS.Config.Debug && console.log("TTS Chrome event Status.", event.data.type, event);
                        // We get status updates from the background telling us about speech progress
                        thisObj.status = event.data.result;
                        if (thisObj.status == TTS.Status.Playing) {
                            clearTimeout(thisObj.showingProgress);
                            TTS.Manager.Events.onHideProgress.fire();
                        }
                        break;
                    case 'TTS WORD':
                        //TTS.Config.Debug && console.log("TTS Chrome event WORD.", event.data.type, event);
                        thisObj.EventManager && thisObj.EventManager.fire({subject: 'TTS WORD', index: event.data.result});
                        break;
                }
            }
          }catch(e){
            console.error("Failed to add a message listener.", e);
          }
        }, false);

        var nativeInit = function () {
            if (this.status == TTS.Status.Initializing) {
                // Post a message to setup the content
                TDS.AppWindow.postMessage({ type: "CHROME COMMAND", command: "TTS INIT", params: "" }, "*");                
            } else {
                if(timer) clearInterval(timer);
            }
        };

        nativeInit();
        //Now put this into a timer in case our previous call to nativeInit did not succeed. This can happen 
        // as for the chrome packaged app (for the chrome extension, this won't happen), 
        // the TDS.AppWindow does not get set until DOMLoad is done and we could get into a case
        // where init() is invoked too soon (possibly on DOMReady)
        var timer = setInterval(nativeInit.bind(this), 1000);  
        
        return true;
    };

    this.subscribe = function(EventManager){//Subscribe to the word boundary events.
      this.EventManager = EventManager;
    };

    // get the SB status converted into a nice enum
    this.getStatus = function () {
        
        // If we are still initialzing, lets not send anything to the native engine until this completes
        if (this.status == TTS.Status.Initializing)
            return this.status;

        // Post a message to refresh the status
        var params = { type: "CHROME COMMAND", command: "TTS STATUS", params: "" };
        TDS.AppWindow.postMessage(params, "*");
        //console.log("TTSChrome.getStatus(), Posting a message to the plugin with: ", params, this.status);
        return this.status;
    };

    this.play = function(text)
    {
        console.log("We never actually get to the play?.", text, this.currentVoice);
        // rate: 1.0 is the default rate, normally around 180 to 220 words per minute. 2.0 is twice as fast, and 0.5 is half as fast
        // pitch: between 0 and 2 inclusive, with 0 being lowest and 2 being highest. 1.0 corresponds to a voice's default pitch. 
        // volume: between 0 and 1 inclusive, with 0 being lowest and 1 being highest, with a default of 1.0.         
        var param = [text, {
          rate: (this.rate / 10) * 1, 
          voiceName: this.currentVoice,
          lang: this._extractLangCode(this.currentVoice),  // This is a hack. Chromebook does not seem to honor voiceName but does honor lang
          pitch: (this.pitch / 10) * 1, 
          volume: (this.volume / 10) * 1 
        }];
        TDS.AppWindow.postMessage({ type: "CHROME COMMAND", command: "TTS SPEAK", params: param }, "*");
        if (Util.Browser.isChromeOS()) {
            if (Util.Browser.getChromeVersion() < 34) {
                this.status = TTS.Status.Playing; // HACK! We really dont need to do this because we are listening for STATUS but on chrome books, we are not getting 'start' event on speech start
            } else {
                // Bug 133270 Chromebook v34 doesn't generate interrupt for first word
                this.EventManager && this.EventManager.fire({ subject: 'TTS WORD', index: 0 }); 
            }
        }
        clearTimeout(this.showingProgress);
        this.showingProgress = setTimeout(function () {
            TTS.Manager.Events.onShowProgress.fire(Messages.getAlt('TDSTTS.Label.TTSwait', 'Waiting for Text-to-Speech'));
        }, 1000);
        return true;
    };

    this.pause = function()
    {
        TDS.AppWindow.postMessage({ type: "CHROME COMMAND", command: "TTS PAUSE", params: "" }, "*");
        return true;
    };

    this.resume = function()
    {
        TDS.AppWindow.postMessage({ type: "CHROME COMMAND", command: "TTS RESUME", params: "" }, "*");
        return true;
    };

    this.stop = function()
    {
        TDS.AppWindow.postMessage({ type: "CHROME COMMAND", command: "TTS STOP", params: "" }, "*");
        return true;
    };

    // get the current volume
    this.getVolume = function()
    {
        return this.volume;
    };

    this.setVolume = function(level)
    {
        this.volume = level;
        return true;
    };
    
    // get the current pitch
    this.getPitch = function()
    {
        return this.pitch;
    };

    // set pitch to a new value
    this.setPitch = function (level) {
        this.pitch = level;
        return true;
    };
    
    // get the current rate
    this.getRate = function()
    {
        return this.rate;
    };

    // set rate to a new value
    this.setRate = function (level)
    {
        this.rate = level;
        return true;
    };

    this.getVoices = function()
    {
        return this.voices; //Setup and assigned by listening for the init call.
    };

    // get the current system voice
    this.getVoice = function()
    {
        return this.currentVoice;
    };

    this.setVoice = function (voice) {
        this.currentVoice = voice;
        return true;
    };

    // This is a hack. We need to figure out the lang codes from the chrome voice name
    // This is needed because chromebooks are not honoring the voice name but honor the lang attribute
    // for chrome.tts.speak()
    this._extractLangCode = function (voiceName) {
        if (voiceName && voiceName == 'native') return '';  // This is a hack for our extension/app running in desktop chrome!!!
        if (voiceName && voiceName.indexOf("Spanish") >= 0) return 'es-ES';
        return 'en-US';
    };
}
