//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
﻿// This object wraps the spell checking functionality
// built into Mozilla
function MozSpellChecker(language) {
    this._lang = (language.length > 2) ? language.substr(0, 2) : language; //language to use for looking up the dictionary (2 letter lang code)
    this._spellCheckEngine = null;  //Ref to the XPCom spell check impl
    this._dictionaryLoaded = false; //Set once we have located and loaded the appropriate dictionary 

    // Initializes the spell checker. Must be done prior to using this spell checker
    this._init = function() {
        try {
            if (typeof (Components) != "object") {
                // This is not a mozilla browser!!
                this._spellCheckEngine = null;
                return;
            }

            // Different versions of Firefox have different contract IDs
            // We only want to check if this browser has hunspell or not
            // We stopped looking for the other options to keep it consistent
            // with the server side hunspell checker.
            // Note: Hunspell is default in FF3.5 which is what SB4.0 is based on
            var spellclass = "@mozilla.org/spellchecker/engine;1";    // Available on FF3.0 and onwards only. SB3.5 uses server side spell check since that only comes with MySpell
            
            // Instantiate our XPCom bridge
            this._spellCheckEngine = Components.classes[spellclass].createInstance(Components.interfaces.mozISpellCheckingEngine);

        } catch (ex) {
            this._spellCheckEngine = null;
        }
    }

    //Locate a suitable dictionary for this language
    //It returns the name of the dictionary that matches
    this._findDictionary = function(lang) {
        if (this._spellCheckEngine != null && lang != null) {
            var dictList = new Array();
            var dictListLength = new Object();

            this._spellCheckEngine.getDictionaryList(dictList, dictListLength);
            //Tries to find the exact dictionary for the culture
            for (var d = 0; d < dictListLength.value; d++) {
                if (dictList.value[d] == lang)
                    return dictList.value[d];
            }

            var shortLang
            if (lang.indexOf("-") > -1) {
                shortLang = lang.substring(0, lang.indexOf("-"));
            } else {
                shortLang = lang;
            }

            //As a last resort, settle for a dictionary of the same language but different culture
            for (var d = 0; d < dictListLength.value; d++) {
                var shortLangDict
                if (dictList.value[d].indexOf("-") > -1) {
                    shortLangDict = dictList.value[d].substring(0, dictList.value[d].indexOf("-"));
                } else {
                    shortLangDict = dictList.value[d]
                }

                if (shortLangDict == shortLang)
                    return dictList.value[d];
            }
        }
        return null;
    }


    // Initialize and load the dictionary for 
    // the language of choice. Returns true or sucess, false otherwise
    this._load = function() {    
        this._init()

        var dict = this._findDictionary(this._lang);

        if (dict != null && this._spellCheckEngine != null) {
            this._spellCheckEngine.dictionary = dict;
            this._dictionaryLoaded = true;
            return true;
        }

        return false;

    }

    //Public function to see if this instance is usable for word checks
    this.availableForUse = function() {
        return this._dictionaryLoaded;
    }

    //Main routine to check the spelling and return a list of 
    //words that are misspelt with alternate suggestions
    this.checkSpelling = function(wordList, provideSuggestions) {
        var errors = new Array();
        var numErrors = 0, wordsChecked = 0;
        var status = "ERROR";
        var len = (wordList != null) ? wordList.length : 0;
        if (this._dictionaryLoaded) {
            status = "SUCCESS";
            for (var i = 0; i < len; i++) {
                var word = wordList[i];
                // TODO: We need to check if this condition is really needed or not
                //if (word.length > 3) {
                wordsChecked++;
                if (!this._spellCheckEngine.check(word)) {
                    var suggestions = {};
                    if (provideSuggestions) {
                        this._spellCheckEngine.suggest(word, suggestions, {});   
                    }
                    errors[numErrors] = { "word": word, "suggestions": suggestions.value };
                    numErrors++;
                }
                //}
            }
        }
        return errors;
        //        return {
        //            'status': status,
        //            'wordsChecked': wordsChecked,
        //            'numErrors': numErrors,
        //            'errors': errors
        //        };

    }

    this._load();
}