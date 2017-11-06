// *******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2017 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
// *******************************************************************************
// TTS service: Webspeech API
// https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API/Using_the_Web_Speech_API

function TTSService_WebSpeech()
{
  this.speechSynthesisInstance = null;
  this.voices = [];
  this.currentVoice = null;
  this.volume = 10;  // 0-10
  this.rate = 10;    // Max 20
  this.pitch = 10;   // Max 20
  this._utterances = []; // A hack. Chrome stops firing progress events if
  /*
   * the utterances sent to the speech engine are garbage collected.
   * https://gist.github.com/woollsta/2d146f13878a301b36d7#file-chunkify-js
   */  
  this._utterancePrefix = '';
  this._utterancePostfix = '';

  this.wordBoundaryRegex = new RegExp(/<[^>]+>|\x5b\x5b[^\5d]+\x5d\x5d|[\s,.;]+|[^<^ ]+/g); // Our
  /*
   * word boundary detection logic. We use this regex to chunk text into "words"
   */
  this.isSpeakable = new RegExp(/[A-Za-z0-9_]+/);  // This regex checks if a
  /*
   * match has any speakable characters in it. Only those get counted as "words"
   */


  this.supportsVolumeControl = function () {
    return true;
  };

  this.supportsPitchControl = function () {
    return true;
  };

  this.supportsRateControl = function () {
    return true;
  };

  this.isSupported = function() {
    return 'speechSynthesis' in window;
  };

  this.load = function()
  {
    if (!this.isSupported()) return false;
    this.speechSynthesisInstance = window.speechSynthesis;

    var loadVoices = function () {
      this.voices = this.speechSynthesisInstance.getVoices();
      if (!this.currentVoice) {
        this.currentVoice = this.voices.find(function (element) {
          return element.lang == 'en-US';
        });

        // Once we get a voice then indicate this is done loading
        if (this.currentVoice) {
          TTS.Manager.Events.onServiceLoad.fire();
        }
      }
    }.bind(this);

    setTimeout('', 2000);

    /*
     * Web Speech voices load asynchronously and onvoiceschanged notifies us of
     * this... we need this so we know when this module is fully initialized
     * http://stackoverflow.com/questions/21513706/getting-the-list-of-voices-in-speechsynthesis-of-chrome-web-speech-api
     */    
    if (this.speechSynthesisInstance.onvoiceschanged !== undefined) {
      this.speechSynthesisInstance.onvoiceschanged = loadVoices;
    }

    loadVoices(); 
     /*
       * Call now in the event that onvoicechanged has already fired and we have
       * our voices
       */

    if (TTS.Util.supportsSSML()) {
      this._utterancePrefix = '<?xml version="1.0"?><speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" ' +
      'xsi:schemaLocation="http://www.w3.org/2001/10/synthesis  http://www.w3.org/TR/speech-synthesis/synthesis.xsd" xml:lang="en-US">';
      this._utterancePostfix = '</speak>';
    }

    return true;
  };


  // Subscribe to the word boundary events.
  this.subscribe = function(EventManager) {
    this.EventManager = EventManager;
  };

  // get the SB status converted into a nice enum
  this.getStatus = function () {
    if (!this.isSupported()) return TTS.Status.NotSupported;
    if (this.speechSynthesisInstance.paused) return TTS.Status.Paused;
    if (this.speechSynthesisInstance.pending || this.speechSynthesisInstance.speaking) return TTS.Status.Playing;
    return TTS.Status.Stopped;
  };

  this.play = function (text) {

    this.stop(); // Make sure we're not playing anything

    this._utterances = [];

    var chunks;
    if (Util.Browser.isChrome()) {
       /*
         * Chrome has an issue with garbling text for longer strings so we break
         * it into smaller chunks divided at word boundaries
         */
      var maxwordsperchunk = 25;
      chunks = this.chunkText(text, maxwordsperchunk);
    } else {
      chunks = [text];
    }

    var charOffset = 0;

    chunks.forEach(function (chunk) {
      var utter = new SpeechSynthesisUtterance();
     /* if (!Util.Browser.isChrome() || !Util.Browser.isWindows()) { */
        /*
         * Note: If you set this, voice does not play on Windows Chrome Update:
         * What I am seeing on Win 7/Chrome 53 is that it plays, but a) it reads
         * the <bookmark>s we insert b) Tracking stops working OSX Chrome works
         * fine with this
         */
        utter.voice = this.currentVoice;
      /* } */
      utter.volume = (this.volume / 10) * 1; // 0 to 1
      utter.rate = (this.rate / 10) * 1; // 0.1 to 10
      utter.pitch = (this.pitch / 10) * 1; // 0 to 2
      utter.text = this._utterancePrefix + chunk + this._utterancePostfix;
      utter.lang = this.currentVoice.lang;

      utter.onboundary = function (offset) {
        return function (e) {
          if (e.name == 'word') {
            var charIndex = this._normalizeCharIndex(e.charIndex, chunk) + offset - this._utterancePrefix.length;
            this.EventManager && this.EventManager.fire({ subject: 'TTS WORD', index: charIndex });
            // console.log('word boundary ' + charIndex);
          } else {
            // console.log(e.name + ' boundary ' + e.charIndex);
          }
        }.bind(this);
      }.bind(this)(charOffset);

      charOffset += chunk.length;
      this._utterances.push(utter);
    }, this);

    this._utterances.forEach(function (utterance) {
      this.speechSynthesisInstance.speak(utterance);
    }, this);

    this.speechSynthesisInstance.speaking = true;
    this.speechSynthesisInstance.resume(); // Ensure that we're not paused

    return true;
  };

  this.pause = function() {
    this.speechSynthesisInstance.pause();
    this.speechSynthesisInstance.paused = true;
    return true;
  };

  this.resume = function()
  {
    this.speechSynthesisInstance.resume();
    this.speechSynthesisInstance.speaking = true;
    return true;
  };

  this.stop = function()
  {
    /*
     * TDS-633: FireFox WebSpeech doesn't seem to like having cancel() called
     * when the speech engine is paused so ensure that it isn't paused This
     * FireFox bug was fixed in FF V49+
     */
    if (Util.Browser.isFirefox() && Util.Browser.getFirefoxVersion() < 49 && this.speechSynthesisInstance.paused) {
      this.speechSynthesisInstance.resume();
    }

    this.speechSynthesisInstance.cancel();
    delete this._utterances;
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
    if (this.voices.length == 0) {
      // if there is no voice pack, return the default 'eng'
      console.log("webspeech.getVoices() - no voices - returning ['eng']...");
      return ['eng'];
    } else {
      return this.voices.map(function (voice) { return voice.name; });
    }
  };

  // get the current system voice
  this.getVoice = function()
  {
    return this.currentVoice.name;
  };

  this.setVoice = function (voice) {
    this.currentVoice = this.voices.find(function (element) { return element.name === voice; }) || this.currentVoice;
    return this.currentVoice != null;
  };

  this.chunkText = function (text, wordsPerChunk) {
    var chunks = [];
    var matches = text.match(this.wordBoundaryRegex);

    var chunkStart = 0;
    var chunkEnd = 0;

    var wordCount = 0;
    for (var i = 0; matches != null && i < matches.length; i++) {
      var match = matches[i];
      chunkEnd = chunkEnd + match.length;
      if (match.trim().length == 0 || match.indexOf('<') > 0 || !this.isSpeakable.test(match)) continue;
      wordCount++;
      if (wordCount > 0 && wordCount % wordsPerChunk == 0) {
        /*
         * console.log('Chunk ' + chunks.length + '=' +
         * text.substring(chunkStart, chunkEnd))
         */
        chunks.push(text.substring(chunkStart, chunkEnd));
        chunkStart = chunkEnd;
      }
    }
    if (chunkStart != chunkEnd) {
      chunks.push(text.substring(chunkStart, chunkEnd));
    }
    return chunks;
  };

  this._normalizeCharIndex = function (charIndex, chunkText) {
    if (!Util.Browser.isChromeOS()) return charIndex;

    // console.log('*** charIndex=' + charIndex + ' chunkText=' +
    // chunkText);

    // chromebooks are special!
    // charIndex is the last character of the word not the first
    // contiguous spaces are collapsed into 1 and

    // step 1 - find the length of the current word. We have the last char
    // index, walk backwards
    var chromesStr = chunkText.replace(/\s+/g, ' ');  // collapse all
     /* contiguous whitespace */
    var currWordLength = 0;
    for (var i = charIndex; i >= 0; i--) {
      if (chromesStr[i] == ' ') break;
      currWordLength++;
    }
    var firstCharIndex = charIndex - currWordLength + 1;

    // console.log('*** chromesStr=' + chromesStr + ' currWordLength=' +
    // currWordLength + ' firstCharIndex=' + firstCharIndex);

    // step 2 - Add 1 back to the index for each pair of adjacent whitespace
    // chars
    for (i = 1; i <= firstCharIndex; i++) {
      if (this._isWhiteSpace(chunkText.charCodeAt(i)) && this._isWhiteSpace(chunkText.charCodeAt(i - 1))) {
        // this is a contiguous space, chrome wont have seen it
        firstCharIndex++;
      }
    }

    // console.log('*** firstCharIndex=' + firstCharIndex);

    return firstCharIndex;
  };

  this._isWhiteSpace = function (charCode) {
    switch (charCode) {
    case 32:
    case 160:
      return true;
    default:
      return false;
    }
  };  
}