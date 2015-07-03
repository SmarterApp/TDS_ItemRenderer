//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
﻿TTS = window.TTS || {};
TTS.Parse = window.TTS.Parse || {};

//this manages languages. Right now, it assumes only one or two languages
//It currently contains functionality to add language tags to tag a node and its children, assuming that the node passed in is a "top level" node as far as language
//is concerned. So, the node should be an item or a passage node.
TTS.Parse.LanguageManager = function() {
    var chk = Accommodations.Manager;

    this.getOtherLanguage = function (lang, standardNames) {
        var defaultLang = ContentManager.getLanguage();
        return (lang == defaultLang) ? this.getAltLanguage(standardNames) : (standardNames) ? standardNames(defaultLang) : defaultLang;
    };
    this.getDefaultLanguage = function(standardNames) {
        var defaultLang = ContentManager.getLanguage();
        return (standardNames) ? standardNames(defaultLang) : defaultLang;
    };
    this.getAltLanguage = function (standardNames) {
        var defaultLang = ContentManager.getLanguage();
        return (defaultLang == 'ENU') ? null : 'ENU';
    };
    var standardNames = function(langString) {
        switch (langString) {
        case 'ENU':
            return 'en-us';
        case 'ESN':
            return 'es-mx';
        default:
            return langString;
        }
    };
};
//marks a particular node as being in the designated language
TTS.Parse.LanguageManager.prototype.markLanguage= function(node, lang){
    if (node && ((node.nodeType != 3) && (node.nodeType != 4) && (node.nodeType != 8)) && lang && !TTS.Util.hasLanguageAttr(node)) {
        node.setAttribute('lang',lang);
    }
};
//this runs through the domNode's children marking lanuages.  Assume that the domNode is the current item or passage, otherwise the
// language-marking may be off. Languages are currently maked using a simple divider, alternating between default and secondary language.
TTS.Parse.LanguageManager.prototype.addLanguageTags = function (domNode, currentLanguage) {
    if (currentLanguage == null) currentLanguage = this.getDefaultLanguage(false);
    //Contrary to earlier code, even if there is a tag on the node, re-tag it. A change in accommodations could cause a change in the default language.
    this.markLanguage(domNode, currentLanguage);
    for (var i = 0; i < domNode.childNodes.length; ++i) {
        var child = domNode.childNodes[i];

        //If this is a boundary node, the following content is another language.
        if (TTS.Util.hasLanguageAttr(child)) {
            currentLanguage = this.getOtherLanguage(currentLanguage);
        } else {
            this.addLanguageTags(child, currentLanguage);
        }
    }
};


