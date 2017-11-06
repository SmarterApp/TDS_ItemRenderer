//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
/**
 *  This control is an attempt to provide a simple clean interface to using the TTS library.
 *    See README for basic code structure of the TTS application at large
 *  
 * The control manages the voices and higlighting. It is instantiated as a singleton. It knows:
 * playSelection, which plays a selection
 * play, which plays a node, and
 * playParseNode, which plays a TTS parseNode. This is the method used by the TTS framework (embodied in menu.js) to play stuff
 * 
 * also contains code for managing voices and interfacing with the TTS.Manager
 */
TDS = window.TDS || {}; 
TTS = window.TTS || {};
TTS.version = 2.0;

//Contains references so you can more easily debug in a page that is loaded.
TTS.Store = TTS.Store || {
    count: 0,
    Instances: {}
};

//Provide an easy way of accessing a single instance of the control.
TTS.Singleton = null;

// Create Singleton
TTS.createSingleton = function (NoInit) {
    if (!TTS.Singleton) {
        var cfg = JSON.parse(JSON.stringify(TTS.Config));
        cfg.NoInit = NoInit;
        TTS.Singleton = new TTS.Control(cfg);
        TTS.Singleton.init();
    }
}

TTS.getInstance = function (NoInit) { 
    if (!TTS.Singleton) {
        TTS.createSingleton(NoInit);
    }
    return TTS.Singleton;
};

/**
    *  Initialize with your own config, or it makes a copy per instance.  Sadly the TTS.Manager
    *  is a somewhat ugly global namespace so we can only do so much.
    */
TTS.Control = function(cfg) {
    var _cfg = cfg || JSON.parse(JSON.stringify(TTS.Config));
    var _eM = this.getEventManager();
    var _highObj = new TTS.Parse.Highlighter();
    var _manager = null;
    var _currentDomEntity = null; //hacked here... need to put switch back in   
    _highObj.subscribe(_eM);
    
    this.getConfig = function(){
        return _cfg;
    };
    this.getHighlighter = function() {
        return _highObj;
    };
    var getManager = function () {
        if (!_manager) {
          if(typeof window[_cfg.DefaultManager] === "object") {
            _manager = window[_cfg.DefaultManager];
          } else {
            _manager = window.TTS.Manager;
          }
        }
        return _manager;
    }; //the currentDomEntity is the item or passage (set by menu.js) that is to be read, in whole or in part.
    this.getCurrentDomEntity = function(){
        return _currentDomEntity;
    };
    this.setCurrentDomEntity = function(node) {
        _currentDomEntity = node;
    };
    ///this gets the language with which the HTML node is tagged. if the HTML node is not tagged, it prompts languageManager to tag it, then retries. 
    ///if the retry does not find a tagged language, it returns null
    this.getMarkedLanguage = function (node, failIfNotFound) {
        if (!node) {
            return null; // No node was passed into function, so lang is unknown
        }
        
        if ((node.nodeType == 3) || (node.nodeType == 4) || (node.nodeType == 8)) {
            return this.getMarkedLanguage(node.parentNode);
        }
        var language = tds.language.getITSAttribute(node);
        if (language) {
            return language;
        } else {
            if (failIfNotFound) {
                return null;
            }
            var entity = this.getCurrentDomEntity();
            if (entity) {
                tds.language.tagElements(entity.getElement());
            }
            return this.getMarkedLanguage(node, true);
        }
    }; /**
    *  Initialize various event subscribers and try to setup text to speech if available.
    */
    this.init = function (cb) {
        if (_cfg.NoInit) return; //Listen to all the different events that prove that it is up and running
        this.eventSubscribe(cb);

        //Deal with all the random strange bits of suffering.
        this.OSHacks();

        //Setup the voices that are used by tts
        this.registerVoices(TTS.Config.getVoices());

        //Init the TTS.Manager
        getManager().init();
    }; /**
    * Going to remove this highlighter and the events associated with it.
    */
    var removeHighlighter = function () {
        if (_highObj) {
            _highObj.unsubscribe();
            _highObj = null;
        }
    }; //    Keep a reference to all the instances for debugging
    TTS.Store.Instances[TTS.Store.count++] = this;
};
/**
    *  Helper method for running on initialization.
    * //jdc: looks like this is only used in some test functions
    */
TTS.Control.prototype.runOnInit = function(cb){
    if(typeof cb != 'function'){return;}

    var state = TTS.Manager.getStatus();
    if(TTS.Manager._initialized ||state == TTS.Status.NotSupported){
        cb(state);
    }else{
        this.getEventManager().onInitSuccess.subscribe(cb);
    }
};


/**
    *   Checking if something like ESN (espanol) is supported
    */
TTS.Control.prototype.isLanguageSupported = function(langCode){
    return TTS.Manager.isLanguageSupported(langCode);
};


/**
    *   getVoices for Language returns an array of config information along with
    *   helpful friendly names and exact names.  getVoice and getVoices return only
    *   the actual OS level key (aka non-user facing)
    */
TTS.Control.prototype.getVoicesForLanguage = function(lang){
    lang = lang || TTS.Config.Lang.ENU.Code;
    return TTS.Manager.getVoicesForLanguage(lang);
};

TTS.Control.prototype.getVoiceForLanguage = function(lang){
    lang = lang || TTS.Config.Lang.ENU.Code;
    return TTS.Manager.getVoiceForLanguage(lang);
};

TTS.Control.prototype.getStatus = function(){
    return TTS.Manager.getStatus();
};
/**
    *  This will get the active voices that are supported on the OS, this is not a 
    *  user friendly key.  See this.getVoicesForLanguage() ^
    */
TTS.Control.prototype.getVoice = function(){ //currently active voice
    return TTS.Manager.getVoice();
};
TTS.Control.prototype.getVoices = function(){ //Service call level
    return TTS.Manager.getVoices();
};


/**
    * If you call this method after initialization, you MUST then call this.getManager().init()
    */
TTS.Control.prototype.registerVoices = function (voices) {
    voices = voices || TTS.Config.getVoices();
    if (!voices || !voices.length) { return; }

    TTS.Manager.clearVoicePacks();
    for (var i = 0; i < voices.length; i++) {
        var voicePack = voices[i];
        TTS.Manager.registerVoicePack(voicePack.name, voicePack.priority, voicePack.language);
    }

    //Step by step...
    if (TTS.Manager._initialized) {
        TTS.Manager._initializeAvailableVoices();
    }
};


/**
    * Allow the user to specify a manager, but by default it is going to use the 
    * standard TTS.Manager.
    */
TTS.Control.prototype.setManager = function (manager) {
    this._manager = manager;
};




TTS.Control.prototype.OSHacks = function () {
    if (Util.Browser.isLinux()) {
        this.speak = function (text, language){
            TTS.Manager.play(text, language);
        };
    } else {
        this.speak = function (text, language){
            setTimeout(function () {
                TTS.Manager.play(text, language);
            }, this.getConfig().PlayDelay || 0);
        };
    }
};
/** Placeholder:
    *
    * Attempt to speak the current text or information
    * This is re-assigned in the init block based on the OS hacks required.
    *If you want to override it you will need to override _after_ intialization
    */
TTS.Control.prototype.speak = function (dom, parseType, language, selection) {
    //overriden in OSHacks
    this.Error(new Error("If this is in the message, then the TTS.Manager did not init correctly."));
};

/**
    * Subscribe to the various TTS events.
    */
TTS.Control.prototype.eventSubscribe = function (cb) {
    var eventManager = this.getEventManager();
    eventManager.onStatusChange.subscribe(function (newStatus) {
        TTS.Config.Debug && console.log("TTS Status Change.", newStatus);
    }.bind(this));

    //listen to status change events from now on.
    eventManager.onInitSuccess.subscribe(function (cb) {
        TTS.Config.Debug && console.log("Initializing TTS: Success.");
        if (typeof cb == 'function') cb();
        this.initSuccess();
    }.bind(this, cb));

    eventManager.onInitFailure.subscribe(function (cb) {
        console.error("Initializing TTS: Failed.");
        if (typeof cb == 'function') cb();
    }.bind(this, cb));
};



TTS.Control.prototype.initSuccess = function () {
    //Initialize voice packs etc, shouldn't that be done by TTS.Manager?
    try {
        this.INIT_SUCCESS = true;
    } catch (e) {
        this.Error(e);
    }
};


TTS.Control.prototype.play = function (domNode,language) {
    var speakString = null;
    try {
        this.stop();//Stop any playing that might be in progress
        
        if (!language) language = this.getMarkedLanguage(domNode);
        if (!language) language = tds.language.getITSDefault();
        this.pn = new TTS.Parse.ParseNode(language, domNode);
        this.playParseNode(this.pn,language);
    } catch (e) {
        this.Error(e);
    }
    return speakString;
};

TTS.Control.prototype.playSelection = function(sel,language){
    var speakString = null;
    try {
        this.stop();//Stop any playing that might be in progress

        if (!language) language = tds.language.getITSDefault();
        var selector = new TTS.Parse.Selector(sel, language);
        if (selector == null) return null;
        
        if (sel && typeof sel.collapseToStart == "function") {
            sel.collapseToStart(); // Bug 165805 Remove highlight from selected range
        }

        this.pn = selector.collectNodes();
        this.playParseNode(this.pn, language);
    } catch (e) {
        this.Error(e);
    }
    return speakString;
};

//jon: add try/catch block
TTS.Control.prototype.playParseNode = function (pn, language) {
    try {
        this.stop(); //Bug 170112/16 - Stop any playing that might be in progress

        var speakString = pn.CompileSpeakString();
        this.pn = pn;
        speakString = TTS.Util.replaceLeadDirectives(speakString);
        // Bug 114921 Shorten back-to-back silences by reducing them to 1msec duration
        speakString = TTS.Util.shortenSilence(speakString);

        this.getHighlighter().setSpeakString(speakString, pn);
        this.speak(speakString, language);
    } catch (e) {
        this.Error(e);
    }
};
TTS.Control.prototype.hasActualWords = function (text) {
    if (!text) return false;
    var rslt = text.search(/[\S]/g); //Ensure there are actually words...
    return (rslt > -1);
};


TTS.Control.prototype.isPlaying = function(){
    var state = TTS.Manager.getStatus();
    if(state == TTS.Status.NotSupported){
    return false;
    }
    return  state == TTS.Status.Playing || state == TTS.Status.Unknown;
};

TTS.Control.prototype.isAvailable = function(){
    return TTS.Manager.isAvailable();
};

TTS.Control.prototype.canResume = function() {
    return TTS.Manager.canResume();
};

TTS.Control.prototype.resume = function(){ //Resume the audio
    var lang = this.pn.getLanguage();
    var node = this.pn.getNode();
    
    // Bug 159933 - Reparse the node before resuming in case DOM was modified, which breaks tracking
    this.pn = new TTS.Parse.ParseNode(lang, node); 
    this.getHighlighter().setParseNodeRoot(this.pn);
    TTS.Manager.resume();
};

TTS.Control.prototype.stop = function () //Stops the audio
{
    TTS.Manager.stop();
};

TTS.Control.prototype.pause = function () { //Pause
    TTS.Manager.pause();
};

//Use the existing TTS.Manager Events but add in any subscribes you desire based on those events
TTS.Control.prototype.getEventManager = function(){
    return TTS.Manager.Events;
};

TTS.Control.prototype.setVoice = function(val, langs){
    TTS.Manager.setVoice(val);
};
TTS.Control.prototype.setVolume = function(val){
    TTS.Manager.setVolume(val);
};

TTS.Control.prototype.setRate = function(val){
    TTS.Manager.setRate(val);
};

TTS.Control.prototype.setPitch = function(val){
    TTS.Manager.setPitch(val);
};

TTS.Control.prototype.Error = function(exception) {
    if (TTS.Config.Debug) {
        console.log(exception);
    }
    TDS.Diagnostics.report(exception);
};




