//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
﻿/*
Code for dealing with TDS languages.
Requires: Accommodations.Manager
*/

tds.language = (function () {

    var xmlLookup = {};
    var itsLookup = {};

    var DEFAULT_XML = "en-us";
    var DEFAULT_ITS = "ENU";

    // add xml/its language
    function add(xmlLang, itsLang) {
        xmlLookup[xmlLang] = itsLang;
        itsLookup[itsLang] = xmlLang;
    }

    // get ITS language from Xml language
    // TODO: What about looking up just 'es'?
    function getITSFromXml(xmlLang) {
        // xmlLang = xmlLang.split('-')[0];
        if (xmlLang) {
            xmlLang = xmlLang.toLowerCase();
        }
        return xmlLookup[xmlLang];
    }

    // get Xml language from ITS language
    function getXmlFromITS(itsLang) {
        if (itsLang) {
            itsLang = itsLang.toUpperCase();
        }
        return itsLookup[itsLang];
    }
    
    // add default languages
    add('en-us', 'ENU');
    add('es-mx', 'ESN');
    add('haw', 'HAW');

    // get the ITS default language
    function getITSDefault() {
        var accProps = Accommodations.Manager.getDefaultProperties();
        var language = accProps.getSelectedCode('Language');
        return (language) ? language : DEFAULT_ITS;
    }

    function getDefault() {
        return getXmlFromITS(getITSDefault());
    }

    // get the ITS alternate language (null if default is English)
    function getITSAlt() {
        var defaultLang = getITSDefault();
        return (defaultLang == DEFAULT_ITS) ? null : DEFAULT_ITS;
    }

    function getAlt() {
        return getXmlFromITS(getITSAlt());
    }

    /* DOM operations */

    // check if the element has lang attribute directly
    function hasAttribute(el) {
        return (el && el.nodeType == 1 && el.lang);
    }

    // get the language attribute for an element
    function getAttribute(el) {
        while (el) {
            if (hasAttribute(el)) {
                return el.lang;
            }
            el = el.parentElement;
        }
        return ''; // NOTE: default for lang is empty string
    }

    // get the ITS language from an element
    function getITSAttribute(el) {
        var xmlLang = getAttribute(el);
        return xmlLang ? getITSFromXml(xmlLang) : xmlLang;
    };

    // Check to see if there is a language divider element
    function isDividerElement(el) {
        return el && $(el).hasClass('languagedivider');
    }

    function setAttribute(el, lang) {
        if (el && lang != null) {
            el.setAttribute('lang', lang);
        }
    };

    // set the ITS language on an element
    function setITSAttribute(el, itsLang) {
        setAttribute(el, getXmlFromITS(itsLang));
    };
    
    function getDocumentAttribute() {
        return document.documentElement.lang;
    }

    function getITSDocumentAttribute() {
        var lang = getDocumentAttribute();
        return lang ? getITSFromXml(lang) : lang;
    }

    function setDocumentAttribute(lang) {
        if (lang != null) {
            document.documentElement.lang = lang;
        }
    }

    function setITSDocumentAttribute(itsLang) {
        var lang = getXmlFromITS(itsLang);
        if (lang) {
            setDocumentAttribute(lang);
        }
    }

    // tag dom element and children with ITS language attribute
    function tagElements(el, lang) {

        // get languages
        var defaultLang = getITSDefault();
        var altLang = getITSAlt();

        // make sure we have a language to start off with
        if (!lang) {
            // use language from accomodations
            lang = defaultLang;
        }

        // swap default/alt languages
        function swap(currentLang) {
            return (currentLang == defaultLang) ? altLang : defaultLang;
        }

        function process(currentEl, currentLang) {

            // Contrary to earlier code, even if there is a tag on the node, re-tag it. 
            // A change in accommodations could cause a change in the default language.
            setITSAttribute(currentEl, currentLang);

            // process child elements
            $(currentEl).children().each(function (idx, childEl) {
                // If this is a boundary node, the following content is another language.
                if (isDividerElement(childEl)) {
                    currentLang = swap(currentLang);
                } else {
                    process(childEl, currentLang);
                }
            });

        }

        process(el, lang);

    }

    // public api
    return {
        getITSFromXml: getITSFromXml,
        getXmlFromITS: getXmlFromITS,
        getDefault: getDefault,
        getITSDefault: getITSDefault, // TTS.Parse.LanguageManager.prototype.getDefaultLanguage
        getAlt: getAlt,
        getITSAlt: getITSAlt, // TTS.Parse.LanguageManager.prototype.getAltLanguage
        getAttribute: getAttribute,
        getITSAttribute: getITSAttribute, // TTS.Util.getLang
        setAttribute: setAttribute,
        setITSAttribute: setITSAttribute, // TTS.Parse.LanguageManager.prototype.markLanguage
        getDocumentAttribute: getDocumentAttribute,
        getITSDocumentAttribute: getITSDocumentAttribute,
        setDocumentAttribute: setDocumentAttribute,
        setITSDocumentAttribute: setITSDocumentAttribute,
        tagElements: tagElements // TTS.Parse.LanguageManager.prototype.addLanguageTags
    };

})();
