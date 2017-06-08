//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
/**
 *  Create the configuration helpers for setting up various slider settings.
 *  requires the TTS tree and should only call the init() function AFTER
 *  tts has actually fired its initialized event.
 */
TTS = window.TTS || {};  
TTS.Config = TTS.Config || {};

TTS.Config.UI = function(cfg){
    this.cfg = TTS.Config.UserSet || {}; //Note we set the defaults, then APPLY in the passed in cfg
    this.setCfg(cfg);

    this.DOM = {}; //References to the various dom elements of the TTS configuration pages.

    this.next = null; //If set to a function it will be called when sound check isOk
    this.back = null; //If set to a function it is called when the sound check is failed
};

TTS.Config.UI.prototype.getCfg = function(){
    return this.cfg;
};

//Override the defaults with anything passed in by the TTS Section
TTS.Config.UI.prototype.setCfg = function(cfg){
    if(!cfg){return;}
    for(var key in cfg){
        if(typeof cfg[key] != 'undefined' && typeof cfg[key] != 'function'){
            this.cfg[key] = cfg[key];
        }
    }
};

//Load up the sections and build dom references
TTS.Config.UI.prototype.init = function(){
    var YUD = YAHOO.util.Dom;

    //Initial section to select (the langs should be built by looking up CSS in the page to find sections
    this.section = TTS.Config.Lang.ENU.Code;

    //Alas, cannot chain like jQuery, these are used as references to add and remove 
    //the hidden class.  Need to detect if TTS failed to load and show the error msg only
    this.DOM = {
      ENU:    YUD.get('englishTTSTest'),
      ESN:    YUD.get('spanishTTSTest'),
      ERROR:  YUD.get('checkErrorDiv'),
      NONE:   YUD.get('ttsNotAvailable'),
      ADJUST: YUD.get('TTS_Adjustments'),
      RATE:   YUD.get('TTS_Adjust_Rate'), 
      VOLUME: YUD.get('TTS_Adjust_Volume'),
      PITCH:  YUD.get('TTS_Adjust_Pitch'),

      //Voice is if selection is enabled, Name is if you just want to display the friendly name
      VOICE:      YUD.get('TTS_Select_VoicePack'),
      VOICE_NAME: YUD.get('TTS_Voice_Name'),

      //For when the language is enabled, but not supported on this platform
      NO_SUP: YUD.get('checkErrorDiv'),
      NO_ESN: YUD.get('ESNVoicePack'),
      NO_ENU: YUD.get('ENUVoicePack'),

      //Checkbox for reset defaults.
      DEFAULTS: YUD.get('TTS_Set_Defaults')
    };
    this.connectEvents(); //Setup all the click and change handlers
    this.buildSliders();  //Build the various rate selection sliders

    this.render();//Actually set various visibilities in the UI
};

TTS.Config.UI.prototype.connectEvents = function(){
    var YUE = YAHOO.util.Event;
    YUE.addListener('clickToHearEnglish', 'click',    this.runSpeechEnglish.bind(this));
    YUE.addListener('btnSoundEnglishYes', 'click',    this.soundOK.bind(this));
    YUE.addListener('btnSoundEnglishNo', 'click',     this.noSound.bind(this));
    YUE.addListener('skipEnglish', 'click',           this.soundOK.bind(this));
    YUE.addListener('logoutOnErrorButton', 'click',   this.gotoLogin.bind(this));
    YUE.addListener('btnErrorTryAgain', 'click',      this.tryAgain.bind(this));
    YUE.addListener('noAudioLogout', 'click',         this.gotoLogin.bind(this));
    YUE.addListener('clickToHearSpanish', 'click',    this.runSpeechSpanish.bind(this));
    YUE.addListener('btnSoundSpanishYes', 'click',    this.soundOK.bind(this));
    YUE.addListener('btnSoundSpanishNo', 'click',     this.noSound.bind(this));
    YUE.addListener('skipSpanish', 'click',           this.soundOK.bind(this));
    YUE.addListener('continueNoAudio', 'click',       this.gotoInstructions.bind(this));
    YUE.addListener('continueError', 'click',         this.soundOK.bind(this));
    YUE.addListener('TTS_Set_Defaults', 'click',          this.reset.bind(this));
    YUE.addListener('TTS_Select_VoicePack', 'change',     this.setVoicePack.bind(this));
};


/**
 *  Build the various YUI sliders for this element
 */
TTS.Config.UI.prototype.buildSliders = function(){
    TTS.Config.Debug && console.log("TTS: Build the sliders", this.cfg);
    //=================================================
    // INIT VOLUME SLIDER
    //=================================================
    this.volumeSlider = YAHOO.widget.Slider.getHorizSlider(
        'TTS_Adjust_Volume', 
        'volumeThumb', 
        0,
        this.cfg.LengthInPixels, 
        this.cfg.TickSize
    );
    this.subscribeToEvents('Volume', this.volumeSlider);


    //=================================================
    // INIT PITCH SLIDER
    //=================================================
    this.pitchSlider = YAHOO.widget.Slider.getHorizSlider(
        'TTS_Adjust_Pitch', 
        'pitchThumb', 
        0, 
        this.cfg.LengthInPixels,
        this.cfg.TickSize
    );
    this.subscribeToEvents('Pitch', this.pitchSlider); 

    //=================================================
    // INIT RATE SLIDER
    //=================================================
    this.rateSlider = YAHOO.widget.Slider.getHorizSlider(
        'TTS_Adjust_Rate', 
        'rateThumb', 
        0, 
        this.cfg.LengthInPixels, 
        this.cfg.TickSize
    );
    this.subscribeToEvents('Rate', this.rateSlider);
};

/**
 *  Subscribe to the various events that come from the YUI elements
 */
TTS.Config.UI.prototype.subscribeToEvents = function (property, thisSlider) {

    // subscribe slider to slide event
    thisSlider.subscribe('change', function (newOffset) {
        var val = this.calculateValue(property, newOffset);
        document.getElementById(property + '_Value').innerHTML = val;
    }.bind(this));

    // subscribe slider to end event
    thisSlider.subscribe('slideEnd', function () {
      try{
        var language = this.getLangCode();
        var value = (TTS.Config.User['get' + property])(language);
        if (thisSlider.valueChangeSource == 1 || thisSlider.valueChangeSource == 3) { // 1 means UI event, don't know what 3 means
            value = this.calculateValue(property, thisSlider.getValue());
            var func = TTS.Config.User['set' + property];
            if(typeof func == 'function'){
                func(value, language);
                this.changed();
            }
        }
        document.getElementById(property + '_Value').innerHTML = value.toString();
      }catch(e){
          console.error('Slider Error: (property, value)', property, value, e);
      }
    }.bind(this));

};

// Converts between slider input values (0-200) and Volume (2-10) / Pitch (1-20) / Rate (1-20) values
TTS.Config.UI.prototype.calculateValue = function (property, inputValue){
    var returnValue = inputValue;
    switch (property) {
        case 'Volume':
            returnValue = parseInt(inputValue / this.cfg.TickSize); // volume has a range from 0-10
            break;
        case 'Pitch':
            returnValue = parseInt(inputValue / this.cfg.TickSize * 2); // divide by 2 because the rate has a range from 0-20
            break;
        case 'Rate':
            returnValue = parseInt(inputValue / this.cfg.TickSize * 2); // divide by 2 because the rate has a range from 0-20
            break;
        default:
            break;
    }
    return returnValue;
};

//What section is currently active
TTS.Config.UI.prototype.getLangCode = function(){
    return YAHOO.util.Dom.hasClass(this.DOM.ESN, 'hidden') ? 'ENU' : 'ESN';
};


TTS.Config.UI.prototype.reset = function(){
    //Reset all the config
    TTS.Config.User.reset();
    this.section = 'ENU';
    this.changed(true);
    this.render();
};

//Display all the various components of the UI based on settings, browser config etc
TTS.Config.UI.prototype.render = function(){
    this.hideAll();

    if(!this.renderErrors()){
        this.renderSections();
        this.renderSliders();
        this.renderVoice(); //Need to change available voices based on language section
        this.show(this.DOM.DEFAULTS);
    }
};

/**
 *  Check if there are errors, if so return that we found some and hide all
 *  other parts of the UI.
 */
TTS.Config.UI.prototype.renderErrors = function(){

    var state = TTS.getInstance().getStatus();
    if(state == TTS.Status.NotSupported){
        this.hideAll();
        this.show(this.DOM.NONE); //None supported
        return true;
    }

    var lang = this.section;
    if(!TTS.getInstance().isLanguageSupported(lang)){
        this.hideAll();
        this.show(this.DOM.NO_SUP);
        this.show(this.DOM['NO_' + lang]);
        return true;
    }
}

//note a hide all probably occurred before this
TTS.Config.UI.prototype.renderSections = function(){
    this.show(this.DOM[this.section]); //Language sections

    //Controls
    this.cfg.ShowAdjust ? this.show(this.DOM.ADJUST) : this.hide(this.DOM.ADJUST);
};

TTS.Config.UI.prototype.changed = function(checked){
    this.DOM.DEFAULTS.checked = checked;
};

/**
*  Render the various bits of slider information.
*/
TTS.Config.UI.prototype.renderSliders = function(){
    var YUD = YAHOO.util.Dom;

    var ctn = this.DOM.ADJUST;
    this.cfg.ShowAdjustments ? this.show(ctn) : this.hide(ctn);

    //The entire HTML slide container (show just the slider vs all the content information)
    this.cfg.ShowVolume ? this.show(this.DOM.VOLUME) : this.hide(this.DOM.VOLUME.parentNode);
    this.cfg.ShowRate   ? this.show(this.DOM.RATE)   : this.hide(this.DOM.RATE.parentNode);
    this.cfg.ShowPitch  ? this.show(this.DOM.PITCH)  : this.hide(this.DOM.PITCH.parentNode);

    //Determine if I have to re-calculate these?
    var language = this.getLangCode();
    var volume = TTS.Config.User.getVolume(language);
    var rate = TTS.Config.User.getRate(language);
    var pitch = TTS.Config.User.getPitch(language);

    TTS.Manager.setVolume(volume);
    TTS.Manager.setPitch(pitch);
    TTS.Manager.setRate(rate);

    //This positions the sliders correctly.
    this.volumeSlider && this.volumeSlider.setValue(parseInt((volume - 2) * (this.cfg.LengthInPixels / 8)));
    this.rateSlider && this.rateSlider.setValue(parseInt(rate * (this.cfg.LengthInPixels / 20)));
    this.pitchSlider && this.pitchSlider.setValue(parseInt(pitch * (this.cfg.LengthInPixels / 20)));
};


/**
 *  This should be what is called when the TTS Section of the code base calls the load operation.
 */
TTS.Config.UI.prototype.show = function(els) {
  if(!els){return;}
  var YUD = YAHOO.util.Dom;
  if(!YAHOO.lang.isArray(els)){
      els = [els];   
  }
  for(var key in els){
    if(els[key] && typeof els[key] != 'function'){
      YUD.removeClass(els[key], 'hidden');
    }
  }
};

//Hide all the components of TTS
TTS.Config.UI.prototype.hide = function(els) {
  if(!els){return;}
  var YUD = YAHOO.util.Dom;
  if(!YAHOO.lang.isArray(els)){
      els = [els];   
  }
  for(var key in els){
    if(els[key] && typeof els[key] != 'function'){
      YUD.addClass(els[key], 'hidden');
    }
  }
};

TTS.Config.UI.prototype.hideAll = function(){
    for(key in this.DOM){
        YUD.addClass(this.DOM[key], 'hidden');
    }
};

TTS.Config.UI.prototype.error = function(){
    this.hideAll();
    this.show(this.DOM.ERROR);
};


/**
 *  Determine the active voice and render either a dropdown, or a simple text display.
 */
TTS.Config.UI.prototype.renderVoice = function(){
    var langCode = this.getLangCode();
    var ctrl     = TTS.getInstance();
    var voices   = ctrl.getVoicesForLanguage(langCode);
    var vPack    = ctrl.getVoiceForLanguage(langCode);
    var voice = vPack ? vPack.ServiceVoiceName : null;

    if (this.cfg.ShowVoicePacks) { //build a selection tool
      this.renderVoicePacks(voices, voice, langCode);
    }else{  //Only set one vs
      this.renderVoiceName(vPack, voice, langCode);
    }
};

//Render a single voice pack.
TTS.Config.UI.prototype.renderVoiceName = function(vPack, voice, langCode){
    this.show(this.DOM.VOICE_NAME);
    this.DOM.VOICE_NAME.innerHTML = vPack ? vPack.Voicename : '';
    TTS.Config.User.setVoice(voice, langCode);
};
/**
 *  
 */ 
TTS.Config.UI.prototype.renderVoicePacks = function(voices, voice, langCode){
  try{
    //Get the dom container for the selection box, empty it and then ensure we select the active voice
    var sel = this.DOM.VOICE;
        sel.innerHTML = '';
    this.show(this.DOM.VOICE);
        
    //Empty the select
    for(var i=0; i<voices.length; ++i){
        var vConfig = voices[i];
        if(vConfig && vConfig.Available){
          var option = document.createElement('option');
          option.value     = vConfig.ServiceVoiceName;
          option.innerHTML = vConfig.Voicename || vConfig.ServiceVoiceName;

          if(voice == vConfig.ServiceVoiceName){
              option.selected  = true;
              TTS.Config.User.setVoice(voice, langCode);
          }
          sel.appendChild(option);
        }
    }
  }catch(e){
      console.error("failed to render the voice packs.", e);
  }
};


// init voice pack selection control
TTS.Config.UI.prototype.setVoicePack = function(evt) {
    this.changed();
    TTS.Config.User.setVoice(this.DOM.VOICE.value);
};


TTS.Config.UI.prototype.runSpeechEnglish = function(){
    TTS.Config.Debug && console.log("TTS: Run speech english");
    TTS.getInstance().play(document.getElementById('englishMessageDiv'),"ENU");
};

TTS.Config.UI.prototype.runSpeechSpanish = function(){
   TTS.Config.Debug && console.log("TTS: Run speech Spanish");
    TTS.getInstance().play(document.getElementById('spanishMessageDiv'), 'ESN');
};

TTS.Config.UI.prototype.stopSpeech = function(){
    TTS.Config.Debug && console.log("TTS: Stop speech Spanish");
    TTS.getInstance().stop();
};

/**
 *  Do a better job with many langs, but this is a lot of accommodation code to tweak..
 *  TODO:  clean up "sections"
 */
TTS.Config.UI.prototype.nextLang = function(){
  if(this.section == 'ENU' && TTS.Config.Lang.ESN.Enabled){
      this.section  = 'ESN';
      this.render();
      return true;
  }
};

TTS.Config.UI.prototype.prevLang = function(){
  if(this.section == 'ESN'){
      this.section  = 'ENU';
      this.render();
      return true;
  }
};

TTS.Config.UI.prototype.soundOK = function(){ 
    TTS.getInstance().stop();
    if(!this.nextLang()){
        this.gotoInstructions();
    }
};

TTS.Config.UI.prototype.noSound = function() {
    console.log("No sound playing");
    this.error();
};

TTS.Config.UI.prototype.tryAgain = function(){//Try and make the language visible
    this.reset();
};

TTS.Config.UI.prototype.gotoInstructions = function(){
    if(typeof this.next == 'function'){
        this.next();
    }
};

TTS.Config.UI.prototype.gotoLogin = function() {
    console.log("Go to the login?");
    if(typeof this.back == 'function'){
        this.back();
    }
};

