/** **************************************************************************
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

    var supportedLanguages = ['en'];
    var currentLanguage = 'en';
    var dictionaryLoaded = false;

    // public functions

    this.loadTranslations = function (translationNodes) {
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
        dictionaryLoaded = true;
        this.validateTranslations();
    }

    this.getLanguageCount = function () {
        return supportedLanguages.length;
    }

    this.setCurrentLanguage = function (languageString) {
        if (getLanguageIndex(languageString) > -1) {
            currentLanguage = languageString;
        } else
            languageNotFoundAction(languageString);
    }

    this.getCurrentLanguage = function () {
        return currentLanguage; // alternatively, this could live in the main Simulator class...
    }

    // this is the predominant function, used in rendering translations
    this.translate = function (tag) {
        // for now, if translation dictionary not loaded, or tag not found, simply pass through
        if (!dictionaryLoaded || !this.keyExists(tag))
            return tag;
        // otherwise, return translation
        var langIndex = getLanguageIndex(this.getCurrentLanguage())
        return this.translateToLanguage(tag, langIndex);
    }

    this.translateToLanguage = function (tag, lang) {
        // can pass in language index (integer) (for testing purposes, at least)
        if (!isNaN(lang)) {
            return this.lookup(tag)[lang];
        } else { // or tag ("en", "es", etc.)
            return this.lookup(tag)[getLanguageIndex(lang)];
        }
    }

    this.toString = function () {
        var buff = new StringBuffer();
        var transBuff = [];
        for (key in this.getElements()) {
            if (key != undefined && key != null) {
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
        if (!embedded) (forced) ? debugf(buff.join('')) : debug(buff.join(''));
        return buff.join('');
    };

    this.translationsAvailableCount = function (key) {
        var count = 0;
        if (this.keyExists(key)) {
            var transSet = this.lookup(key);
            for (var transStrings in transSet) {
                if (transStrings != undefined) ++count;
            }
        }
        return count;
    }

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
    }


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
        this.setCurrentLanguage('en'); // default, for now...
    }



    // Convenience functions for debugging
    function debug(str1, str2, trace) {
        dbg().debug(source, str1, str2, trace);
    }

    function debugf(str1, str2, trace) {
        dbg().debugf(source, str1, str2, trace);
    }
}


// Inherit methods and class variables
Simulator.Utils.TranslationDictionary.prototype = new Simulator.Utils.Dictionary();
Simulator.Utils.TranslationDictionary.parent = Simulator.Utils.Dictionary;
Simulator.Utils.TranslationDictionary.prototype.constructor = Simulator.Utils.TranslationDictionary; // Reset the prototype to point to the current class