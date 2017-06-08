//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
﻿/** **************************************************************************
* @class TranslationDictionary
* @superclass Dictionary
* @param none
* @return TranslationDictionary instance
* Creates a new TranslationDictionary class.
*
* This class manages tag-to-text translation required for internationalization.
*****************************************************************************
*/
Simulator.Utils.TranslationDictionary = function (sim) {
    Simulator.Utils.Dictionary.call(this, sim);

    var source = 'TranslationDictionary';  // variable used in debug

    var dbg = function () { return sim.getDebug(); };

    var ENGLISH = 0;
    var CURRENT = 1;
    var supportedLanguages = [];
    supportedLanguages[ENGLISH] = 'english';
    supportedLanguages[CURRENT] = 'current';

    var currentLanguage = 'current';
    var dictionaryLoaded = false;

    // public functions

    this.loadTranslations = function (translationNodes) {
        // <languageElement id="[tag]" value="[english value]" ... >[current lang value]</languageElement>
        // (there may be other attributes (resource="true", etc.) but we don't worry about them)
        // (also, value="[english value]" is not always supplied; we only need it so we can translate animation input/output to english, so things like resources (images/animations) won't have it)

        var langElements = translationNodes[0].getElementsByTagName('languageElement');
        for (var j = 0; j < langElements.length; j++) {
            var tag = langElements[j].getAttribute('id');
            var engText = langElements[j].getAttribute('value') || '';
            var currText = (langElements[j].childNodes[0]) ? (langElements[j].childNodes[0].nodeValue || '') : '';
            var valueArray;
            if (this.keyExists(tag)) {
                valueArray = this.lookup(tag); // if we already have tag defined, retrieve value array
            } else {
                valueArray = []; // else, start with blank array
            }
            valueArray[ENGLISH] = engText;
            valueArray[CURRENT] = currText;
            this.setValue(tag, valueArray);
        }

        /*
        var transUnits = translationNodes[0].getElementsByTagName('language');
        for (var i = 0; i < transUnits.length; i++) {
            var thisLanguage = transUnits[i].getAttribute('lang');
            supportedLanguages[i] = thisLanguage;
            debug('Found translation support for language: ' + thisLanguage);
            var langElements = transUnits[i].getElementsByTagName('languageElement');
            for (var j = 0; j < langElements.length; j++) {
                var tag = langElements[j].getAttribute('id');
                var valueText = langElements[j].getAttribute('value');
                var valueArray;
                if (this.keyExists(tag)) {
                    valueArray = this.lookup(tag); // if we already have tag defined, retrieve value array
                } else {
                    valueArray = []; // else, start with blank array
                }
                valueArray[i] = valueText; // and place text at appropriate index, according to language
                this.setValue(tag, valueArray);
            }
        }
        */
        dictionaryLoaded = true;
        this.validateTranslations();
    };

    this.getLanguageCount = function () {
        return supportedLanguages.length;
    };

    /*
    this.setCurrentLanguage = function (languageString) {
        if (getLanguageIndex(languageString) > -1) {
            currentLanguage = languageString;
            debug('Language set to ' + languageString);
        } else
            languageNotFoundAction(languageString);
    }

    this.getCurrentLanguage = function () {
        return currentLanguage; // alternatively, this could live in the main Simulator class...
    }
    */

    // this is the predominant function, used in rendering translations
    this.translate = function (tag) {
        // for now, if translation dictionary not loaded, or tag not found, simply pass through
        if (!dictionaryLoaded || !this.keyExists(tag))
            return tag;
        // otherwise, return translation
        return this.translateToLanguage(tag, CURRENT); // get 'current' language
    };

    this.translateToEnglish = function (tag) {
        // for now, if translation dictionary not loaded, or tag not found, simply pass through
        if (!dictionaryLoaded || !this.keyExists(tag))
            return tag;
        // otherwise, return translation
        return this.translateToLanguage(tag, ENGLISH); // get 'english'
    };

    this.translateToLanguage = function (tag, lang) {
        // can pass in language index (integer)
        if (!isNaN(lang)) {
            return this.lookup(tag)[lang];
        } else { // or tag ("english", "current")
            return this.lookup(tag)[getLanguageIndex(lang)];
        }
    };

    this.toString = function () {
        var buff = new StringBuffer();
        var transBuff = [];
        for (var key in this.getElements()) {
            if (key !== undefined && key !== null) {
                for (var i = 0; i < this.translationsAvailableCount(key) ; i++) {
                    transBuff[i] = supportedLanguages[i] + ':' + this.translateToLanguage(key, i);
                }
                buff.append('key = ').append(key).append(', value = ').append(transBuff.join(' ; ')).append('\n');
            }
        }
        return buff.toString();
    };

    this.inspect = function (embedded, forced) {
        var buff = [];
        var sep = '\n\n';
        buff.push('Inspecting Translation Dictionary'); buff.push(sep);
        buff.push(this.toString()); buff.push(sep);
        if (!embedded) {
            (forced) ? debugf(buff.join('')) : debug(buff.join(''));
        }
        return buff.join('');
    };

    this.translationsAvailableCount = function (key) {
        var count = 0;
        if (this.keyExists(key)) {
            var transSet = this.lookup(key);
            for (var transStrings in transSet) {
                if (transStrings !== undefined) {
                    ++count;
                }
            }
        }
        return count;
    };

    this.validateTranslations = function () {
        // check that each tag is defined for all languages
        var valid = true;
        for (var key in this.getElements()) {
            if (this.translationsAvailableCount(key) != this.getLanguageCount()) {
                valid = false;
                debugf('Error: Tag is missing translation(s): ' + key);
            }
        }
        if (valid)
            debug('Translation Dictionary validated: translations are available for all tags.');
        return valid;
    };

    this.isLoaded = function () {
        return dictionaryLoaded;
    };

    // translate internationalization tags in evaluation output into english strings (for animation)
    this.translateEvaluationOutput = function (data) {
        var oldData = data;
        if (data !== null && this.isLoaded()) { // if translation dictionary is dormant, simply bypass
            var translatedData = [];
            data = data.split(Simulator.Constants.PAIR_DELIMITTER);
            if (data !== undefined && data !== null && data !== '') {
                for (var i = 0; i < data.length; i++) {
                    var parts = data[i].split(Simulator.Constants.KEY_VALUE_DELIMITTER);
                    if (parts[1]) {
                        var quoted = (parts[1][0] == '"' && parts[1][parts[1].length - 1] == '"');
                        if (quoted)
                            parts[1] = parts[1].substring(1, parts[1].length - 1);
                        parts[1] = this.translateToEnglish(parts[1]); // translate here
                        if (quoted)
                            parts[1] = '"' + parts[1] + '"';
                    }
                    translatedData.push(parts.join(Simulator.Constants.KEY_VALUE_DELIMITTER));
                }
            }
            data = translatedData.join(Simulator.Constants.PAIR_DELIMITTER);
        }
        //for testing:
        //if (!this.isLoaded()) // safety check - if translation dictionary is dormant, data should look the same as when it came in
        //    if (oldData != data)
        //        dbg.logError(source, 'Evaluation output data may have been corrupted.  If translation dictionary is not loaded, animation output should have passed through internationalization step intact, but the strings are not equal.\nBefore: ' + oldData + ' After: ' + data);
        return data;
    };

    // replace strings in animation output with internationalization tags
    this.internationalizePreparsedAnimationOutput = function (data) {
        var oldData = data;
        if (data !== null) {
            var translatedData = [];
            data = data.split(Simulator.Constants.PAIR_DELIMITTER);
            if (data !== undefined && data !== null && data !== '') {
                for (var i = 0; i < data.length; i++) {
                    var parts = data[i].split(Simulator.Constants.KEY_VALUE_DELIMITTER);
                    if (parts[1]) parts[1] = this.internationalizeAnimationOutputPart(parts[1]); // create tag here
                    translatedData.push(parts.join(Simulator.Constants.KEY_VALUE_DELIMITTER));
                }
            }
            data = translatedData.join(Simulator.Constants.PAIR_DELIMITTER);
        }
        if (!this.isLoaded()) // safety check - if translation dictionary is dormant, data should look the same as when it came in
            if (oldData != data)
                dbg.logError(source, 'Animation output data may have been corrupted.  If translation dictionary is not loaded, animation output should have passed through internationalization step intact, but the strings are not equal.\nBefore: ' + oldData + ' After: ' + data);
        return data;
    };

    // create tag for animation output - if it is not in the dictionary, we add the english version at least
    this.internationalizeAnimationOutputPart = function (outputValue) {
        if (!this.isLoaded())
            return outputValue;
        if (!isNaN(outputValue))
            return outputValue;
        // else, make translation tag!
        var value = outputValue.trim();
        var tag = 'trans.animation.output.' + value;
        if (!this.keyExists(tag)) {
            // if this is not in our translation dictionary, note it, but at least we can store the english version
            dbg.logWarning('Unable to match animation output with translation dictionary entry: ' + value + '\nAdding the English version to the dictionary...');
            var newEntry = [];
            newEntry[ENGLISH] = value;
            newEntry[CURRENT] = value;
            // if it turns out we are not in english mode, that's a problem
            //if (!this.getCurrentLanguage() != 'ENU') {
            //    dbg.logError('Unable to translate unrecognized animation output into desired language. Falling back to English value');
            //    newEntry[getLanguageIndex(this.getCurrentLanguage())] = value; // put english in current language's slot for now...
            //}
            this.setValue(tag, newEntry);
        }
        return tag;
    };

    // private functions

    function getLanguageIndex(languageString) {
        for (var i = 0; i < supportedLanguages.length; i++) {
            if (languageString.toLowerCase() == supportedLanguages[i].toLowerCase())
                return i;
        }
        return -1;
    }

    function languageNotFoundAction(lang) {
        // put some error/debug message here
        debugf('Error: requested language not found: ' + lang);
        this.setCurrentLanguage('ENU'); // default, for now...
    }



    // Convenience functions for debugging
    function debug(str1, str2, trace) {
        dbg().debug(source, str1, str2, trace);
    }

    function debugf(str1, str2, trace) {
        dbg().debugf(source, str1, str2, trace);
    }
};


// Inherit methods and class variables
Simulator.Utils.TranslationDictionary.prototype = new Simulator.Utils.Dictionary();
Simulator.Utils.TranslationDictionary.parent = Simulator.Utils.Dictionary;
Simulator.Utils.TranslationDictionary.prototype.constructor = Simulator.Utils.TranslationDictionary; // Reset the prototype to point to the current class