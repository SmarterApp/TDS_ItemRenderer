TTS.Status = {
    NotSupported: 'NotSupported', //tts initialization failed.
    Uninitialized: 'Uninitialized', // tts is not initialized
    Initializing: 'Initializing',  // tts initialization in progress
    Stopped: 'Stopped', // tts is initialized and there is nothing playing
    Playing: 'Playing', // playing is in progress
    Paused: 'Paused', // playing was paused
    Unknown: 'Unknown' // unknown status
};

/**
 * TTS Language Packs 
 * voicename is the ending with keys. because the actual representation of the voice name
 * in Windows is the full registry path we will be checking for ending with.
 *   
 */
TTS.VoicePack = function(voicename, priority, language, available, isDefault){   
    this.Voicename = voicename;
    this.Priority = priority; //lower the number, higher is the priority.
    this.Language = language;
    this.Available = available;
    this.IsDefault = isDefault;
};
// TTS manager singleton.. all public calls go through here
TTS.Manager ={
    Events: {
	    // when the TTS service provider is available to the TTS manager for initialization and use
	    onServiceLoad: new YAHOO.util.CustomEvent('onServiceLoad', TTS.Manager, false, YAHOO.util.CustomEvent.FLAT),
	    
	    // when the TTS manager gets successfully initialized (NOTE: if java applet then could take a while)
	    onInitSuccess: new YAHOO.util.CustomEvent('onInitSuccess', TTS.Manager, false, YAHOO.util.CustomEvent.FLAT),
	    
	    // when the TTS manager fails to initialize because there are no service providers or they had an error
	    onInitFailure: new YAHOO.util.CustomEvent('onInitFailure', TTS.Manager, false, YAHOO.util.CustomEvent.FLAT),
	    
	    // when the tts status gets changed
	    onStatusChange: new YAHOO.util.CustomEvent('onStatusChange', TTS.Manager, false, YAHOO.util.CustomEvent.FLAT),

	    // when the volume level is changed (NOTE: this is fired on init)
	    onVolumeChange: new YAHOO.util.CustomEvent('onVolumeChange', TTS.Manager, false, YAHOO.util.CustomEvent.FLAT),
	    
	    // when the pitch level is changed (NOTE: this is fired on init)
	    onPitchChange: new YAHOO.util.CustomEvent('onPitchChange', TTS.Manager, false, YAHOO.util.CustomEvent.FLAT),

	    // when the rate level is changed (NOTE: this is fired on init)
	    onRateChange: new YAHOO.util.CustomEvent('onRateChange', TTS.Manager, false, YAHOO.util.CustomEvent.FLAT),
	    
	    // when a new voice is selected (NOTE: this is fired on init)
	    onVoiceChange: new YAHOO.util.CustomEvent('onVoiceChange', TTS.Manager, false, YAHOO.util.CustomEvent.FLAT),
	    
	    // when a error occurs
	    onError: new YAHOO.util.CustomEvent('onError', TTS.Manager, false, YAHOO.util.CustomEvent.FLAT),
	    
	    // Each time a word boundary is reached by the speech engine.
	    onWord: new YAHOO.util.CustomEvent('onWord', TTS.Manager, false, YAHOO.util.CustomEvent.FLAT),

	    // if interested in logging..
	    onLog: new YAHOO.util.CustomEvent('onLog', TTS.Manager, false, YAHOO.util.CustomEvent.FLAT)
	},
    
    _debugging: false,
    _service: null, // TTS service API reference

    // keep previous states (so we know when something changes)
    _lastStatus: TTS.Status.Uninitialized,
    _lastVolume: -1,
    _lastPitch: -1,
    _lastRate: -1,
    _lastVoice: null,
    _lastVoiceLanguage: null, // the last language we switched the voice pack to

    // functions that throw events (this is more used for logging right now)
    _serviceEvents: ['play', 'pause', 'resume', 'stop', 'setVolume', 'setVoice'],
	
	// status check config:
    _statusPollingTimer: null,
	_statusPollingInterval: 0, // current interval
	_statusPollingIntervalActive: 500, // playing interval
	_statusPollingIntervalIdle: 30000, // stopped interval
	_statusPollingMinActive: 3000, // the min amount of time before going to idle interval even if stop is sooner
	_statusPollingDateActive: null, // the date the status interval last went to active
	
	// check if volume fix has been applied
	_volumeFix: false,

	_knownVoicePacks: [],

  _knownLanguages: {}, //see comment for TTS.Manager.isKnownLanguage

  _initialized: false
	
};

/*
 * we have two different cases
 * 1. we are dealing with a language for which a voice pack is not available
 * on THIS machine.
 * 2. we are dealing with a language for which there are no voice packs 
 * at all e.g. Hawaii.
 * in the first case we want to show the menu but disable it.
 * in the second case we do not want to show the menu at all.
 * TTS.Manager already has a isLanguageSupported() method. however, using 
 * that we cannot handle the second case. So we will use this alternate 
 * method to handle case 2.
 */
TTS.Manager._addKnownLanguage = function(languageCode) {
    languageCode = languageCode.toUpperCase();
    TTS.Manager._knownLanguages[languageCode] = languageCode;
};


TTS.Manager.isKnownLanguage = function(languageCode) {
    languageCode = languageCode.toUpperCase();
    if (TTS.Manager._knownLanguages[languageCode] != null) {
        return true;
    }
  
    return false;
};

// call this to log important messages that we might want to see in TDS logs
TTS.Manager.log = function(message) {
    if (TTS.Manager._debugging) {
        Util.log(message);
    }
    TTS.Manager.Events.onLog.fire(message);
};

// This function will load up the proper TTS service for this browser and initialize the TTS engine
TTS.Manager.init = function (forceInit) { //set forceInit to true if this is a re-initialization

    TTS.Manager.Events.onServiceLoad.subscribe(function(service){
        var initSuccess = false;
        initSuccess = TTS.Manager._initService(service);
        // check if init failed
        if (!initSuccess){
            TTS.Manager._lastStatus = TTS.Status.NotSupported;
            TTS.Manager.Events.onInitFailure.fire();
        }else{
            TTS.Manager._initialized = true;
        }
    });

    if (forceInit != true){
        // check if TTS has already been initialized
        if (TTS.Manager.getStatus() != TTS.Status.Uninitialized) {
            return;
        }
    }else{
        //nullify and delete TTS services, and un-initialize TTS manager
        TTS.Manager._service = null;
        delete TTS.Manager._service;
        TTS.Manager._changeStatus(TTS.Status.Uninitialized);

        //unsubscribe from all services
        TTS.Manager.Events.onServiceLoad.unsubscribeAll();
    }


    try{
        // create the SB service and initialize it.
        // If you are running in SB, use the SB's native TTS capabilities. Otherwise, rely on the applet based TTS
        var service = null;


        // check for native SB and SB service exists
        if (Util.Browser.isSecure() && Util.Browser.getSecureVersion() > 0 &&
            YAHOO.lang.isFunction(TTSService_SB) && !Util.Browser.isMobile()) {
            service = new TTSService_SB();
        }// check for java service (this also requires java)
        else if (typeof TTSService_Applet != 'undefined' && YAHOO.lang.isFunction(TTSService_Applet)){
            service = new TTSService_Applet();
        } // check for mobile secure browser
        else if (Util.Browser.isSecure() && (Util.Browser.isAndroid() || (Util.Browser.isIOS() && (Util.Browser.getSecureVersion() >= 2)))) {
            service = new TTSService_Generic();
        } // if we are in chrome, we might be running an extension or packaged app. Even if we are not, the load will not succeed but we can still go ahead and setup the servicce.
        else if (Util.Browser.isSecure() && Util.Browser.isChrome()) {
            service = new TTSService_Chrome();
        }

        // check if TTS is supported and load it
        if (!service || !service.isSupported()){
            TTS.Manager._changeStatus(TTS.Status.NotSupported);
            return false;
        }


        // save service reference
        TTS.Manager._service = service;
        TTS.Manager.log('initializing');
        TTS.Manager._changeStatus(TTS.Status.Initializing);

        // try and load service
        if (!service || !service.load()) {
            return false;
        }
    } catch (ex) {
        // init threw an exception
        console.error("Failed to load a service.", ex);
        TTS.Manager.log(ex);
    }

    return;
};


// internal function for service init logic
TTS.Manager._initService = function() {
    // load voices
    TTS.Manager._initializeAvailableVoices();

    // get latest status
    TTS.Manager._updateStatus();

    //Attempt to load any user prefernces that might exist.
    TTS.Manager.loadUserSettings();

    // fire init success
    TTS.Manager.Events.onInitSuccess.fire();

    // fire volume event
    TTS.Manager._lastVolume = TTS.Manager.getVolume();
    TTS.Manager.Events.onVolumeChange.fire(TTS.Manager._lastVolume);

    // fire pitch event
    TTS.Manager._lastPitch = TTS.Manager.getPitch();
    TTS.Manager.Events.onPitchChange.fire(TTS.Manager._lastPitch);

    // fire rate event
    TTS.Manager._lastRate = TTS.Manager.getRate();
    TTS.Manager.Events.onRateChange.fire(TTS.Manager._lastRate);

    // fire voice event
    TTS.Manager._lastVoice = TTS.Manager.getVoice();
    TTS.Manager.Events.onVoiceChange.fire(TTS.Manager._lastVoice);


    var service = TTS.Manager._service;
    if(service && service.subscribe){
        TTS.Manager._service.subscribe(TTS.Manager.Events.onWord);
    }
    return true;
};

/****************/
/* SERVICE API */
/****************/

// check if the service and a function of that service exist
TTS.Manager._serviceFuncExists = function (functionName){
    if (TTS.Manager._service == null) {
        return false;
    }
    return (typeof(TTS.Manager._service[functionName]) == 'function');
};
TTS.Manager.getStatus = function(){
    if (!TTS.Manager._serviceFuncExists('getStatus')) {
        return TTS.Manager._lastStatus;
    }
    try{
        return TTS.Manager._service.getStatus();
    }catch (ex){
        return TTS.Status.Unknown;
    }
};

TTS.Manager.supportsVolumeControl = function () {
    if (!TTS.Manager._serviceFuncExists('supportsVolumeControl')) {
        return false;
    } else {
        return TTS.Manager._service.supportsVolumeControl();
    }
};

TTS.Manager.supportsPitchControl = function () {
    if (!TTS.Manager._serviceFuncExists('supportsPitchControl')) {
        return false;
    } else {
        return TTS.Manager._service.supportsPitchControl();
    }
};

TTS.Manager.supportsRateControl = function () {
    if (!TTS.Manager._serviceFuncExists('supportsRateControl')) {
        return false;
    } else {
        return TTS.Manager._service.supportsRateControl();
    }
};

/**
 *  Send the text string off to the service to be played.
 */
TTS.Manager.play = function (text, language){
  language = language || 'ENU';

  var played = false;
  try{
    if (text == null || text.length == 0){
      return false;
    }

    if(!TTS.Manager._serviceFuncExists('play')){ 
      return false;
    }
    if(!TTS.Manager.isLanguageSupported(language)){ 
      return false;
    }

    //for linux we want to always call stop before playing the next one.
    //on windows it does not queue, just finishes playing the current one before moving on to the next one.
    var currentStatus = TTS.Manager.getStatus();
    if (currentStatus == TTS.Status.Playing){ 
      return false;
    }
    if (currentStatus == TTS.Status.Unknown) {
        TTS.Manager.stop();
    }

    // set the voice pack for this language
    TTS.Manager.setVoiceForLanguage(language);
    played = TTS.Manager._service.play(text);

    // start up status timer if we are able to get a status other than unknown
    if (currentStatus != TTS.Status.Unknown) {
        TTS.Manager._statusPollingDateActive = new Date();
        TTS.Manager._statusPollingInterval = TTS.Manager._statusPollingIntervalActive;
        TTS.Manager._updateStatus();
    }
  }catch(ex) {
      console.error("Failed to play the sound.", ex);
      TTS.Manager.log(ex);
  }
  return played;
};


TTS.Manager.stop = function() {
    if (!TTS.Manager._serviceFuncExists('stop')) {
        return false;
    }

    var currentStatus = TTS.Manager.getStatus();
    if (currentStatus != TTS.Status.Playing && currentStatus != TTS.Status.Unknown && currentStatus != TTS.Status.Paused) {
        return false;
    }
    
    // call stop
    try {
        return TTS.Manager._service.stop();
    } catch(ex) {
        TTS.Manager.log(ex);
        return false;
    }
};

TTS.Manager.pause = function(){
    if (!TTS.Manager._serviceFuncExists('pause')) {
        return false;
    }
    if (TTS.Manager.getStatus() != TTS.Status.Playing) {
        return false;
    }
    return TTS.Manager._service.pause();
};

TTS.Manager.resume = function () {
    if (!TTS.Manager._serviceFuncExists('resume')) {
        return false;
    }
    if (TTS.Manager.getStatus() != TTS.Status.Paused) {
        return false;
    }
    
    // Reset polling interval to active duration
    if (TTS.Manager.getStatus() != TTS.Status.Unknown) {
        TTS.Manager._statusPollingDateActive = new Date();
        TTS.Manager._statusPollingInterval = TTS.Manager._statusPollingIntervalActive;
        TTS.Manager._updateStatus();
    }
    return TTS.Manager._service.resume();
};

TTS.Manager.getVoices = function(){
    if (!TTS.Manager._serviceFuncExists('getVoices')) {
        return [];
    }
    var voices = TTS.Manager._service.getVoices();
    TTS.Config.Debug && console.log("getVoice call returned.", voices, TTS.Manager._service);
    return voices;
};

TTS.Manager.getVoice = function(){
    if (!TTS.Manager._serviceFuncExists('getVoice')) {
        return null;
    }
    return TTS.Manager._service.getVoice();
};


/**
 *  Attempt to load the user settings.  This is required because people load broken voice
 *  packs into their OS.  They show up as "voices" but playing with them fails.
 */
TTS.Manager.loadUserSettings = function(){
    try{
        if (!Util || !Util.Storage) {
            return;
        }

        //Setup the user selected volume, pitch and rate - this happens both when TTS sound check is initialized and when a test is initialized.
        var curLang;
        var curVoicePack = TTS.Manager.getCurrentVoicePack();
        if (curVoicePack) {
            curLang = curVoicePack.Language;
        }
        TTS.Manager.setVolume(TTS.Config.User.getVolume(curLang));
        TTS.Manager.setPitch(TTS.Config.User.getPitch(curLang));
        TTS.Manager.setRate(TTS.Config.User.getRate(curLang));

        // Set the prefferred voices for each language using the value that may have been configured
        // in the TTS configuration page
        var langCodes = TTS.Manager.getKnownLanguageCodes();
        for (var i = 0; i < langCodes.length; i++) {
            var langVoicePref = TTS.Config.User.getVoice(langCodes[i]);
            if(langVoicePref) {
                TTS.Config.Debug && console.log("Setting a user preference for the language.", langVoicePref);
                var voicePacks = TTS.Manager.getVoicesForLanguage(langCodes[i]);
                for (var j = 0; j < voicePacks.length; j++) {
                    var voicePack = voicePacks[j];
                    if (voicePack.ServiceVoiceName == langVoicePref){
                        TTS.Manager.setAsPreferredVoicePack(voicePack);
                        TTS.Manager.setVoice(voicePack.ServiceVoiceName);
                    }
                }
            }
        }
    }catch(e){
      console.error("Failed to load user settings.", e);
    }
};

TTS.Manager.setVoice = function (name) {
    if (!TTS.Manager._serviceFuncExists('setVoice')) {
        return null;
    }
    if (!YAHOO.util.Lang.isString(name)) {
        throw new Error('Invalid voice name');
    }

    try {
        TTS.Manager._service.setVoice(name);
        TTS.Manager.Events.onVoiceChange.fire(name);
    } catch(ex) {
        console.error("Failed to set the voice.", name);
    }
};

TTS.Manager.getVolume = function() {
    if (!TTS.Manager._serviceFuncExists('getVolume')) {
        return -1;
    }
    return TTS.Manager._service.getVolume();
};

TTS.Manager.setVolume = function(level) {
    if (!TTS.Manager._serviceFuncExists('setVolume')) {
        return false;
    }
    if (!YAHOO.util.Lang.isNumber(level)) {
        throw new Error('Invalid volume level: value=' + level + ' type=' + typeof level);
    }
    try{
        TTS.Manager._service.setVolume(level);
        TTS.Manager.Events.onVolumeChange.fire(level);
    }catch (ex){
        console.error("Failed to set the volume.", ex, level);
    }
};

// helper functions for increasing/descreasing volume
TTS.Manager.increaseVolume = function() {
    var current = TTS.Manager.getVolume();
    if (current == 10) {
        return false;
    } else {
        TTS.Manager.setVolume(current + 1);
    }
    return true;
};

TTS.Manager.decreaseVolume = function() {
    var current = TTS.Manager.getVolume();
    if (current == 0) {
        return false;
    } else {
        TTS.Manager.setVolume(current - 1);
    }
    return true;
};

TTS.Manager.getPitch = function() {
    if (!TTS.Manager._serviceFuncExists('getPitch')) {
        return -1;
    }
    return TTS.Manager._service.getPitch();
};

TTS.Manager.setPitch = function(level) {
    if (!TTS.Manager._serviceFuncExists('setPitch')) {
        return false;
    }
    if (!YAHOO.util.Lang.isNumber(level)) {
        throw new Error('Invalid pitch level: value=' + level + ' type=' + typeof level);
    }

    try{
        TTS.Manager._service.setPitch(level);
        TTS.Manager.Events.onPitchChange.fire(level);
    } catch(ex) {
        console.error("Failed to set the pitch", ex, level);
        TTS.Manager.log(ex);
    }
};

TTS.Manager.getRate = function() {
    if (!TTS.Manager._serviceFuncExists('getRate')) {
        return -1;
    }
    return TTS.Manager._service.getRate();
};

TTS.Manager.setRate = function(level) {
    if (!TTS.Manager._serviceFuncExists('setRate')) {
        return false;
    }
    if (!YAHOO.util.Lang.isNumber(level)) {
        throw new Error('Invalid rate level: value=' + level + ' type=' + typeof level);
    }

    try{
        TTS.Manager._service.setRate(level);
        TTS.Manager.Events.onRateChange.fire(level);
    }catch(ex){
        console.error("Failed to set the TTS Manager Rate information.", ex, level);
        TTS.Manager.log(ex);
    }
};

TTS.Manager.isAvailable = function() {
    var ttsStatus = TTS.Manager.getStatus();
    return ttsStatus == TTS.Status.Stopped || ttsStatus == TTS.Status.Playing || ttsStatus == TTS.Status.Paused;
};


/**********************************************************************************************/

// get the latest TTS engine status and throw any events if it has changed
TTS.Manager._updateStatus = function() {
    // make sure any current timers are cancelled
    if (TTS.Manager._statusPollingTimer != null) {
        TTS.Manager._statusPollingTimer.cancel();
    }

    // get the TTS current status
    var currentStatus = TTS.Manager.getStatus();

    // check if a status change occured
    if (currentStatus != TTS.Manager._lastStatus) {
        this._changeStatus(currentStatus);
    }

    // figure out polling interval:
    if (currentStatus == TTS.Status.Playing) {
        // this is just for good measure
        TTS.Manager._statusPollingInterval = TTS.Manager._statusPollingIntervalActive;
    } else if (currentStatus == TTS.Status.Stopped || currentStatus == TTS.Status.Paused) {
        // get how many milliseconds have occured since active polling started
        var diffPollingActive = (new Date() - (TTS.Manager._statusPollingDateActive || 0));

        // check if the min polling time has occured for active
        if (TTS.Manager._statusPollingMinActive == 0 || diffPollingActive > TTS.Manager._statusPollingMinActive) {
            TTS.Manager._statusPollingDateActive = null;
            TTS.Manager._statusPollingInterval = TTS.Manager._statusPollingIntervalIdle;
        }
    }

    // check status in a timer loop if interval is greater than 0
    if (this._statusPollingInterval > 0) {
        TTS.Manager._statusPollingTimer = YAHOO.lang.later(this._statusPollingInterval, TTS.Manager, TTS.Manager._updateStatus);
    }
};

// this is called when a status change occurs
TTS.Manager._changeStatus = function(currentStatus) {
    TTS.Manager._lastStatus = currentStatus;

    // if this is the first time we are playing we need to fix the volume (for issues on OS X 10.4?)
    if (currentStatus == TTS.Status.Playing && !TTS.Manager._volumeFix) {
        if (!TTS.Manager._volumeFix) {
            var volume = TTS.Manager._lastVolume > 0 ? TTS.Manager._lastVolume : 10;
            TTS.Manager.setVolume(volume);
            TTS.Manager._volumeFix = true;
        }
    }

    // notify subscribers
    TTS.Manager.Events.onStatusChange.fire(currentStatus);
};

/*
 * We will only set the "Available" attribute of the voice packs. All other 
 * lets see what voice packs are available with the service.this method is internally 
 * called from _loadService(). attributes need to be set from server side. 
 * SB-06212010: For the time being these voices are hard coded.
 */
TTS.Manager._initializeAvailableVoices = function () {
    var availableVoices = TTS.Manager.getVoices();
    TTS.Config.Debug && console.log("TTS.Manager Available Voices: ", availableVoices);
    if (availableVoices == null || typeof (availableVoices) == 'undefined') {
        return;
    }
    for (var counter1 = 0; counter1 < TTS.Manager._knownVoicePacks.length; ++counter1) {
        var voicePackElement = TTS.Manager._knownVoicePacks[counter1];
        for (var counter2 = 0; counter2 < availableVoices.length; ++counter2) {
            var availableVoice = availableVoices[counter2];
            var availableVoiceLower = availableVoice.toLowerCase();
            var voicePackVoiceNameLower = voicePackElement.Voicename.toLowerCase();
            if (availableVoiceLower.indexOf(voicePackVoiceNameLower, 0) >= 0) {
                voicePackElement.Available = true;
                voicePackElement.ServiceVoiceName = availableVoice;
                break;
            }
        }
    }

    var defaultVoice = TTS.Manager.getVoice();
    /*
    * we will now need to loop through and adjust priorities.
    * we actually do not care about language because priorities are all relative.
    */
    for (var counter1 = 0; counter1 < TTS.Manager._knownVoicePacks.length; ++counter1) {
        var voicePackElement = TTS.Manager._knownVoicePacks[counter1];
        if (defaultVoice.indexOf(voicePackElement.Voicename, 0) >= 0) {
            voicePackElement.IsDefault = true;
            voicePackElement.Priority = 1;
        } else {
            voicePackElement.IsDefault = false;
            voicePackElement.Priority = voicePackElement.Priority + 1;
        }
    }
};
TTS.Manager.clearVoicePacks = function() {
    TTS.Manager._knownVoicePacks = [];
};
TTS.Manager.registerVoicePack = function (voicename, priority, language) {
    //add a new voice pack.
    TTS.Manager._knownVoicePacks.push(new TTS.VoicePack(voicename, priority, language, false, false));    
    //add the language to the list of languages for which we know we have voice packs.
    TTS.Manager._addKnownLanguage(language);
};
TTS.Manager.getVoicesForLanguage = function (language) {
    var availableVoices = TTS.Manager.getVoices();
    var availableVoicesForLanguage = [];

    if (availableVoices == null || typeof (availableVoices) == 'undefined') {
        return;
    }

    for (var counter = 0; counter < TTS.Manager._knownVoicePacks.length; ++counter) {
        var voicePackElement = TTS.Manager._knownVoicePacks[counter];
        if (voicePackElement.Language == language && voicePackElement.Available) {
            availableVoicesForLanguage.push(voicePackElement);
        }
    }
    return availableVoicesForLanguage;
};
/*
 * we will try to find the highest priority available voice pack for this language.
 * if nothing works out then we will return default.
 */ 
TTS.Manager.getVoiceForLanguage = function(language) {
    var defaultVoice = null;
    var selectedVoice = new TTS.VoicePack(null, 100, null, false, false);   

    for (var counter1 = 0; counter1 < TTS.Manager._knownVoicePacks.length; ++counter1) {
        var thisVoice = TTS.Manager._knownVoicePacks[counter1];

        if (thisVoice.IsDefault) {
            defaultVoice = thisVoice;
		}

        if (thisVoice.Language == language && thisVoice.Available) {
            if (selectedVoice.Priority > thisVoice.Priority) {
                selectedVoice = thisVoice;
			}
        } 
    }
    
    // check if we did not find a suitable voice pack
    if (!selectedVoice.Available) {
		// use default voice
        selectedVoice = defaultVoice;
	}
        
    return selectedVoice;
};
/*
 * we will try to set the highest priority available voice pack for this language.
 * if nothing works out then we will use default.
 */
TTS.Manager.setVoiceForLanguage = function (language) {
    // check if the language has changed since the last time we set it
    // if (TTS.Manager._lastVoiceLanguage == language) return;

    // switch voice
    var selectedVoice = TTS.Manager.getVoiceForLanguage(language);
    var currentVoicePack = TTS.Manager.getCurrentVoicePack();
    if (!selectedVoice || selectedVoice == currentVoicePack) {
        return;
    } else {        
        if (currentVoicePack && (selectedVoice.Language == currentVoicePack.Language)) {
            if (selectedVoice.ServiceVoiceName != TTS.Manager.getCurrentVoicePack().ServiceVoiceName) {
                selectedVoice = TTS.Manager.getCurrentVoicePack();
            }
        }
    }
    TTS.Manager.setVoice(selectedVoice.ServiceVoiceName);
    TTS.Manager.setVolume(TTS.Config.User.getVolume(language));
    TTS.Manager.setPitch(TTS.Config.User.getPitch(language));
    TTS.Manager.setRate(TTS.Config.User.getRate(language));

    // keep track of language
    TTS.Manager._lastVoiceLanguage = language;
};
TTS.Manager.getCurrentVoicePack = function () {
    var voiceName = TTS.Manager.getVoice();
    for (var i = 0; i < TTS.Manager._knownVoicePacks.length; i++) {
        var voicePack = TTS.Manager._knownVoicePacks[i];
        if (voiceName.toLowerCase().indexOf(voicePack.Voicename.toLowerCase()) >= 0) {
            // found a match
            return voicePack;
        }
    }
    return null;
};

// go through all voice packs and check if at least one voice is available for this language.
// NOTE: must have called initializeAvailableVoices() first before using this
TTS.Manager.isLanguageSupported = function(languageCode) {
    for (var counter1 = 0; counter1 < TTS.Manager._knownVoicePacks.length; ++counter1) {
        var thisVoice = TTS.Manager._knownVoicePacks[counter1];
        if (thisVoice.Language == languageCode && thisVoice.Available) {
            return true;
        }
    }
    return false;
};

// Get the list of known/supported languages
TTS.Manager.getKnownLanguageCodes = function() {
    var languages = [];
    for (var lang in TTS.Manager._knownLanguages) {
        languages.push(lang);
    }
    return languages;
};

TTS.Manager.setAsPreferredVoicePack = function(voicePack) {
    if (voicePack.Available) {
        voicePack.Priority = 0; // The lowest Priority voice is always picked for a given language
    }
};


/**********************************************************************************************/
// listen to events for logging (you can comment these out safely if noisy)
TTS.Manager.Events.onStatusChange.subscribe(function(currentStatus){
    // get a string name for status
    var getStatusName = function(status){
        if (status == TTS.Status.Stopped) {
            return 'Stopped';
        } else if (status == TTS.Status.Playing) {
            return 'Playing';
        } else if (status == TTS.Status.Paused) {
            return 'Paused';
        }
        return 'Uninitialized';
    };
    TTS.Manager.log('status change: \'' + getStatusName(currentStatus) + '\'');
});

TTS.Manager.Events.onVolumeChange.subscribe(function(volume) {
    TTS.Manager.log('volume change - ' + volume);
});

TTS.Manager.Events.onVoiceChange.subscribe(function(voice) {
    TTS.Manager.log('voice change - \'' + voice + '\'');
});

// legacy alias
TTSManager = TTS.Manager;
TTSStatus = TTS.Status;