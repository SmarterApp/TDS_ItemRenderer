//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
﻿var SpellCheckManager =
{
    _language: 'ENU',
    _lookupInProgress: false, // in process of looking up words
    _unknownWords: [], // words we currently don't know
    _cache: {}, // words we know

    onDictionaryReady: new YAHOO.util.CustomEvent('onDictionaryReady', SpellCheckManager, false, YAHOO.util.CustomEvent.FLAT),

    _mozDictionary: null,   
    
    _cacheHolder: [],   //Holds the language specific caches
    _dictionaryHolder: [] //Holds the 
};

SpellCheckManager.getLanguage = function() 
{
    return this._language;
};

SpellCheckManager.setLanguage = function(lang) {
    this._language = lang;

    if (this._cacheHolder[lang.toLowerCase()] == null) {
        this._cacheHolder[lang.toLowerCase()] = {};
    }

    if (this._dictionaryHolder[lang.toLowerCase()] == null) {
        this._dictionaryHolder[lang.toLowerCase()] = new MozSpellChecker(lang.toLowerCase());
    }

    this._mozDictionary = this._dictionaryHolder[lang.toLowerCase()];
    this._cache = this._cacheHolder[lang.toLowerCase()];
};

// get cached word status and suggestions
SpellCheckManager._getCachedWord = function(word)
{
    // safe way to test an object for presence of key
    if (YAHOO.lang.hasOwnProperty(this._cache, word))
    {
        return this._cache[word];
    }

    return null;
};

SpellCheckManager.getSuggestions = function(word)
{
    var cacheEntry = this._getCachedWord(word);

    if (cacheEntry)
    {
        return cacheEntry['suggestions'];
    }

    return null;
};

SpellCheckManager.checkWord = function(word)
{
    var cacheEntry = this._getCachedWord(word);

    if (!cacheEntry)
    {
        this._unknownWords.push(word);
        return SpellCheck.WordStatus.UNKNOWN;
    }

    return cacheEntry['status'];
};

SpellCheckManager.lookupWords = function(words)
{
    // get unique words
    words = Util.Array.unique(words);
    
    // check for words we don't know
    for (var i = 0; i < words.length; i++)
    {
        var word = words[i];
        var status = this.checkWord(word); // <-- this adds to unknown words if it is not found
    }
    
    // process unknown words
    if (this._unknownWords.length > 0)
    {
        this._lookupInProgress = true;
        this.processWords();
        return true;
    }
    
    this.onDictionaryReady.fire();
    return false;
};

// process any unknown words
SpellCheckManager.processWords = function()
{
    // Check if mozilla dictionary can be used
    // WARNING: Firefox 2.0 on mac seems to use a different dictionary and shows numbers as being misspelled
    
    // Because the HunSpell dictionaries shipping with the browser have not been
    // sanitized to remove profanity, we are temporarily (until we deploy updated browsers) going
    // to use server side spell checking for all spell check requests. 
    /*    
    if (Util.Browser.getSecureVersion() >= 4)
    {
        if (this._mozDictionary == null)
        {
            this.setLanguage(this._language);  // This will initialize the language specific dictionary and cache it
        }

        // TODO: Add logic in availableForUse to only return true if hunspell dict is included
        if (this._mozDictionary.availableForUse())
        {
            var spellingErrors = this._mozDictionary.checkSpelling(this._unknownWords, true);

            // simulate receiving words event
            setTimeout(function() { SpellCheckManager._receivedWordErrors(spellingErrors) }, 0);

            return;
        }
    }
    */

    // submit xhr request
    var text = this._unknownWords.join(' ');

    SpellCheck.XHR.getErrors(this._language, text, function(spellingErrors)
    {
        SpellCheckManager._receivedWordErrors(spellingErrors);
    });

    /*
    SpellCheck.XHR.checkText(text, function(words)
    {
    SpellCheckManager._receivedWords(words);
    });
    */
};

// received words from xhr
SpellCheckManager._receivedWords = function(misspelledWords)
{
    if (misspelledWords)
    {
        // go through all our current unknown words
        for (var i = 0; i < this._unknownWords.length; i++)
        {
            var unknownWord = this._unknownWords[i];

            var isMisspelled = false;

            // check if one of the misspelled words matches our unknown words
            for (var j = 0; j < misspelledWords.length; j++)
            {
                var misspelledWord = misspelledWords[j];

                if (unknownWord == misspelledWord)
                {
                    isMisspelled = true;
                    break;
                }
            }

            // set word in cache
            this._cache[unknownWord] =
            {
                status: isMisspelled ? SpellCheck.WordStatus.INVALID : SpellCheck.WordStatus.VALID
            };
        }
    }

    // reset
    this._lookupInProgress = false;
    this._unknownWords = [];

    this.onDictionaryReady.fire();
};

// received word errors from xhr
SpellCheckManager._receivedWordErrors = function(spellingErrors)
{
    if (spellingErrors)
    {
        // go through all our current unknown words
        for (var i = 0; i < this._unknownWords.length; i++)
        {
            var unknownWord = this._unknownWords[i];

            var isMisspelled = false;
            var spellingError = null;

            // check if one of the misspelled words matches our unknown words
            for (var j = 0; j < spellingErrors.length; j++)
            {
                spellingError = spellingErrors[j];

                if (unknownWord == spellingError.word)
                {
                    isMisspelled = true;
                    break;
                }
            }

            // set word in cache
            if (isMisspelled)
            {
                this._cache[unknownWord] =
                {
                    status: SpellCheck.WordStatus.INVALID,
                    suggestions: spellingError.suggestions
                };
            }
            else
            {
                this._cache[unknownWord] =
                {
                    status: SpellCheck.WordStatus.VALID,
                    suggestions: null
                };
            }
        }
    }

    // reset
    this._lookupInProgress = false;
    this._unknownWords = [];

    this.onDictionaryReady.fire();
};



