//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
/**
 *  Try and sanitize some of the actual configuration for TTS into a testable module.
 */
TTS = window.TTS || {};
TTS.Config = {
  PlayDelay: 200,               //Hack for how long it should pause before trying to play
  DefaultManager: 'TTS.Manager', //The standard TTS Manager
  DefaultToSelection: true,     //If the user has highlighted text, default to speaking that
  DefaultLanguage: 'ENU',       //Default language for selection parsing.
  NoInit: false,                //Should it try to initialize listeners etc instantly
  Debug: false,                 //Allow debug messages.
  
  i18n: {
    ESN:{
      option: 'opción'
    },
    ENU: {
      option: 'option'
    }
  },
  
  isTrackingEnabled: function() {    // NOTE: This function can get overriden based on context within which TTS is being invoked
      return false;
  },
  
  shouldSanitizeTextForTTS: function() {
      // For Minnesota, no unicode allowed. MAC TTS does not do well with unicode characters in text    
      // All MN biz rules start with TDS_TTX_M*
      var ttxRule = TDS.getAccommodationProperties() != null ? TDS.getAccommodationProperties().getTTXBusinessRules() : null;
      if (ttxRule != null && ttxRule.indexOf("TDS_TTX_M") != -1) {
          return true;
      }
      return false;
  },
  getText: function(key, lang){
    lang = lang || 'ENU';
    return TTS.Config.i18n[lang] ? TTS.Config.i18n[lang][key] : key;
  },
  User: {
    reset: function () {
      var langs = [TTS.Config.Lang.ESN.Code, TTS.Config.Lang.ENU.Code];
      langs.forEach(function (lang) {
          TTS.Config.User.setVolume(TTS.Config.UserSet.Volume, lang);
          TTS.Config.User.setRate(TTS.Config.UserSet.Rate, lang);
          TTS.Config.User.setPitch(TTS.Config.UserSet.Pitch, lang);
      });
      TTS.Config.User.setVoice('', langs);
    },
    getVoice: function(lang){
      return TTS.Config.User.getLocalStorage('Voice', lang);
    },
    setVoice: function(val, langs){
      langs = langs || [TTS.Config.Lang.ENU.Code];
      for(var k in langs){
        var lang = langs[k];
        TTS.getInstance().setVoice(val, lang);
      }
      TTS.Config.User.setLocalStorage('Voice', val, langs);
    },
    getRate: function (lang) {
      lang = lang || TTS.Config.Lang.ENU.Code;
      return TTS.Config.User.getLocalStorage('Rate', lang);
    },
    setRate: function(val, lang){
      lang = lang || TTS.Config.Lang.ENU.Code;
      TTS.getInstance().setRate(val);
      TTS.Config.User.setLocalStorage('Rate', val, lang);
    },
    getPitch: function(lang){
      lang = lang || TTS.Config.Lang.ENU.Code;
      return TTS.Config.User.getLocalStorage('Pitch', lang);
    },
    setPitch: function(val, lang){
      lang = lang || TTS.Config.Lang.ENU.Code;
      TTS.getInstance().setPitch(val);
      TTS.Config.User.setLocalStorage('Pitch', val, lang);
    },
    getVolume: function(lang){
      lang = lang || TTS.Config.Lang.ENU.Code;
      return TTS.Config.User.getLocalStorage('Volume', lang);
    },
    setVolume: function(val, lang){
      lang = lang || TTS.Config.Lang.ENU.Code;
      TTS.getInstance().setVolume(val);
      TTS.Config.User.setLocalStorage('Volume', val, lang);
    },
    resetToDefaults: function(cfg, lang){
        lang = lang || TTS.Config.Lang.ENU.Code;
        cfg = cfg || TTS.Config.UserSet;
        TTS.Config.User.setVolume(cfg.Volume, lang);
        TTS.Config.User.setRate(cfg.Rate, lang);
        TTS.Config.User.setPitch(cfg.Pitch, lang);
    },
    getKey: function(val, lang){
        lang = lang || TTS.Config.Lang.ENU.Code; //Default to english.
        return 'TTS_' + val + '_' + lang;
    },
    getLocalStorage: function(str, lang){
        lang = lang || TTS.Config.Lang.ENU.Code; //Default to english.
        var key = TTS.Config.User.getKey(str, lang); 
        var ret = null;
        if(window.Util && Util.Storage){ //User has set this value
            ret = Util.Storage.get(key);
        } 
        if(typeof ret == 'undefined' || ret == null){//No local storage?  Possible just test cases?
            ret = TTS.Config.User.Store[key];
        }
        if(typeof ret == 'undefined' || ret == null){//Defaults
            ret = TTS.Config.UserSet[str];
        }
        TTS.Config.Debug && console.log("TTS: Get this value (str, lang, key, ret)", str, lang, key, ret);
        return ret;
    },
    setLocalStorage: function(str, val, langs){
      if(typeof langs == 'string'){
        langs = [langs];
      }else if(!langs){
        langs = [TTS.Config.Lang.ENU.Code];
      }
      for(var i = 0; i < langs.length; ++i){
        var lang = langs[i];
        var key  = TTS.Config.User.getKey(str, lang);
        TTS.Config.Debug && console.log("TTS: SET this local store value (str, lang, key)", str, lang, key, val);
        if(window.Util && Util.Storage){
            Util.Storage.set(key, val);
        }else{
            TTS.Config.User.Store[key] = val;
        }
      }
    },
    Store: {} //If util storage is not present, just use local js config
  },
  UserSet: { //These are values that can be modified by the confiugration UI.
    ShowVoicePacks: true, //Can the user choose a different voice.

    ShowAdjustments: true,
    ShowVolume: true, //Alter the volume
    MinVolume: 0,
    MaxVolume: 10,
    Volume: 10, //Default

    ShowPitch: true, //Alter pitch
    MinPitch: 0,
    MaxPitch: 20,
    Pitch: 10, // 20 gets too screechy

    ShowRate: true,
    MinRate: 0,
    MaxRate: 20,
    Rate: 10, //Default

    //Component modifications
    TickSize: 20,
    LengthInPixels: 200
  },
  Lang:{ 
    ENU: { //Language configuration for the application
      Code: 'ENU',
      Enabled: true,
      Label: 'English'
    },
    ESN: {
      Code: 'ESN',
      Enabled: true, //Enabled by looking at global accom settings vs page default test
      Label: 'Español'
    }
  },
  /*
   The rationale behind this priority assignment is the following, at least for ENU:
   1.  All common voice packs e.g. sam, mike, have the lowest priority.
   2.  All third party voice packs have a priority of 1.
   3.  The rare MS voice packs e.g. Michelle and Michael have an intermediate priority.
  */
  DefaultVoices: [
    { name: "MS_EN-US_DAVID", priority: 3, language: "ENU" },
    { name: "MS_EN-US_ZIRA", priority: 3, language: "ENU" },
 
    //because hazel is a UK-EN voice pack lets give it a  lower priority than other defaults.
    { name: "MS_EN-GB_HAZEL", priority: 4, language: "ENU" },
    { name: "MSSam", priority: 3, language: "ENU" },
    { name: "MSAnna", priority: 3, language: "ENU" },
    { name: "MS-Anna", priority: 3, language: "ENU" },
    { name: "MSMike", priority: 3, language: "ENU" },
    { name: "MSMary", priority: 3, language: "ENU" },
    { name: "MICHAEL", priority: 2, language: "ENU" },
    { name: "MICHELLE", priority: 2, language: "ENU" },
    { name: "VW Julie", priority: 1, language: "ENU" },
    { name: "Julie", priority: 1, language: "ENU" },
    { name: "Kate", priority: 1, language: "ENU" },
    { name: "Paul", priority: 1, language: "ENU" },
    { name: "Cepstral_Marta", priority: 1, language: "ESN" },
    { name: "Cepstral_David", priority: 1, language: "ENU" },
    { name: "Cepstral_Miguel", priority: 2, language: "ESN" },
    { name: "Violeta", priority: 2, language: "ESN" },
 
    // Linux voice packs
    { name: "kal_diphone", priority: 3, language: "ENU" },
    { name: "el_diphone",  priority: 3, language: "ESN" },
    { name: "ked_diphone", priority: 4, language: "ENU" },
    { name: "cmu_us_awb_arctic_hts", priority: 5, language: "ENU" },
    { name: "cmu_us_slt_arctic_hts", priority: 6, language: "ENU" },
    { name: "cmu_us_jmk_arctic_hts", priority: 7, language: "ENU" },
    { name: "cmu_us_bdl_arctic_hts", priority: 8, language: "ENU" },
 
    //Mac voice packs
    { name: "Agnes", priority: 9, language: "ENU" },
    { name: "Alex", priority: 11, language: "ENU" },
    { name: "Bruce", priority: 16, language: "ENU" },
    { name: "Fred", priority: 20, language: "ENU" },
    { name: "Junior", priority: 23, language: "ENU" },
    { name: "Kathy", priority: 24, language: "ENU" },
    { name: "Princess", priority: 26, language: "ENU" },
    { name: "Ralph", priority: 27, language: "ENU" },
    { name: "Vicki", priority: 29, language: "ENU" },
    { name: "Victoria", priority: 30, language: "ENU" },
    { name: "Rosa Infovox iVox HQ", priority: 1, language: "ESN" },
    { name: "Heather Infovox iVox HQ", priority: 1, language: "ENU" },
    { name: "Javier", priority: 9, language: "ESN" },
    { name: "Monica", priority: 9, language: "ESN" },
    { name: "Paulina", priority: 9, language: "ESN" },
 
    //Chrome OS voice packs
    { name: "US English Female TTS (by google)", priority: 9, language: "ENU" },
    { name: "Chrome OS US English Voice", priority: 9, language: "ENU" }, // version 25 and above have this
    { name: "native", priority: 9, language: "ENU" },       // version 23 has this
    { name: "Chrome OS US English", priority: 9, language: "ENU" }, // version 25 and above have this  
 
    //Android voice pack
    { name: "android", priority: 9, language: "ENU" },
    //iOS voice pack
    { name: "julie", priority: 9, language: "ENU" },
    { name: "violeta", priority: 9, language: "ESN" },
    { name: "en-US", priority: 9, language: "ENU" },
    { name: "es-ES", priority: 9, language: "ESN" },
    { name: "eng", priority: 9, language: "ENU" },
    { name: "spa", priority: 9, language: "ESN" }
  ],
  getVoices: function () { //NOTE that not all these voices are valid, they are filtered by the speech app
      if (window.TDS && TDS.Config && TDS.Config.voicePacks && TDS.Config.voicePacks.length) {
          return TDS.Config.voicePacks;
      } else {
          return TTS.Config.DefaultVoices; //Note TTS vs TDS
      }
  }
};

