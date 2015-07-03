//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
/**
 *  TTS.Menu  This class creates the menu options associated with TTS
 *  
 *  When the context menu pops up each module adds the options associated with it.  The TTSMenu recieves calls from module_tts to kick-off establishing 
 *  menu options.  The configuration object contains the labels and functions to be called when selected. 
 *  
 *  the menu options that have call back functions are the ones that will get shown.  
 *  
 *  getMenuConfig figures out what can be spoken (and hence belongs on the menu), and creates a  parseNode to be spoken (seeTTSParse). It then packages that 
 *  parseNode in a callback function that calls playParseNode when that menu item is selected.  Most of the work is done by assembleLanguageContent (called once
 *  for each language on the test)
 *
 */
var YUD = YAHOO.util.Dom;

var CFG = {
    PRI: {
        Label: 'TDSTTS.Label.Speak',
        cb: false
    },
    SEC: {
        Label: 'TDSTTS.Label.Speak',
        cb: false
    },
    PRI_OP: {
        Label: 'TDSTTS.Label.SpeakStemAndOptionsPrimary',
        cb: false
    },
    SEC_OP: {
        Label: 'TDSTTS.Label.SpeakStemAndOptionsSecondary',
        cb: false
    },
    SEL_PRI: {
        Label: 'TDSTTS.Label.SpeakTextPrimary', //Why no selection option...
        cb: false
    },
    SEL_SEC: {
        Label: 'TDSTTS.Label.SpeakTextSecondary',
        cb: false
    },
    STOP: {
        Label: 'TDSTTS.Label.StopSpeaking',
        css: 'stopspeaking',
        //allowDisabled: true, //Enable if you want the button to show up, even if func not avail
        cb: false
    },
    PAUSE: {
        Label: 'TDSTTS.Label.PauseSpeaking',
        css: 'pausespeaking',
        cb: false
    },
    RESUME: {
        Label: 'TDSTTS.Label.ResumeSpeaking',
        css: 'resumespeaking',
        cb: false
    },
    MODE: {
        Label: 'TDSTTS.Label.SpeakOption',
        cb: false
    },
    ORDER: [ //Order in which they should be added to the menu, / happy iterator support.
        'PRI', 'SEC', 'PRI_OP', 'SEC_OP', 'SEL_PRI', 'SEL_SEC', 'STOP', 'PAUSE', 'RESUME', 'MODE'
    ]
};

//Menu class for determining what exactly can be spoken at any moment.
TTS.Menu = function() {

    //Set  this to enable pause support, based on browser.
    this.hasPauseSupport = !Util.Browser.isChrome() && // Pause is not working on chrome books
        !Util.Browser.isIOS() && // Bug 120767 - Balaji recommended disabling TTS pause due to iOS bug
        !(Util.Browser.osxVersionIsAtLeast(10, 9) && Util.Browser.getSecureVersion() < 6.5) && //OSX 10.9 requires SB6.5 or above as we fixed a bug in the SB that prevents pause from working  
        !Util.Browser.isAndroid();  // TTS pause and resume are not supported on Android Browser

    this.assembleContent = function(cfg, node) {

        if (!node) {
            return;
        }

        var ctrl = TTS.getInstance();
        if (ctrl.isPlaying()) {
            return;
        }

        //force it to tag the language on the nodes.  This checks a node, if it is not tagged, the language manager will tag everything    
        var anyNode = YAHOO.lang.isArray(node) ? node[0] : node;
        var lang = ctrl.getMarkedLanguage(anyNode); //Remember the getPlayFunction will restrict parsing to only supported langs by default,

        //forcing the container to accept that ESN content is required since you can have a spanish
        //test but only ENU voice packs
        this.assembleLanguageContent(node, cfg.PRI, cfg.PRI_OP, tds.language.getITSDefault());
        this.assembleLanguageContent(node, cfg.SEC, cfg.SEC_OP, tds.language.getITSAlt());
    };

    this.assembleLanguageContent = function (node, cfgLangOb, cfgLangOpOb, language) {

        var ctrl = TTS.getInstance();
        var pnResponseArea = null;
        var pnContent = null;
        cfgLangOb.cb = false;
        cfgLangOb.Label = this.getDomTitle(node, cfgLangOb.Label, language);
        cfgLangOb.contain = null;

        cfgLangOpOb.cb = false;
        cfgLangOpOb.Label = this.getDomTitle(null, cfgLangOpOb.Label, language);
        cfgLangOpOb.contain = null;

        if (ctrl.isLanguageSupported(language)) {
            if (language && ctrl.isLanguageSupported(language)) {
                pnContent = new TTS.Parse.ParseNode(language, node);
                cfgLangOb.cb = this.getPlayFunction(pnContent, language);
                cfgLangOb.contain = pnContent;
                if (TTS.getInstance().getCurrentDomEntity() instanceof ContentItem) {
                    var raNode = ctrl.getCurrentDomEntity().getResponseTTS();
                    if (raNode) {
                        raNode.splice(0, 0, node);
                        pnResponseArea = new TTS.Parse.ParseNode(language, raNode);
                        cfgLangOpOb.cb = this.getPlayFunction(pnResponseArea, language);
                        cfgLangOpOb.contain = pnResponseArea;
                    }
                }
            }
        }
    };
    this.reset();
};

//Reset all the defaults in between play operations.
TTS.Menu.prototype.reset = function() {
    this.cfg = JSON.parse(JSON.stringify(CFG));
    return this.cfg;
};

//This is used to determine what is available when a user right clicks.
///Jon: make this work.
// Balaji: TTS.Menu.prototype.getMenuCfg = function(dom, selection, win, text) I killed the text at the end. It seemed to be text to replace the node (stemTTS), but if so, I would 
//expect that we would use a speak-as tag.  Please confirm. I found no examples of stemTTS

TTS.Menu.prototype.getMenuCfg = function(dom, selection, win, explicitText, page, entity) {
    var cfg = this.reset();
    var ctrl = TTS.getInstance();

    if (!ctrl.isPlaying()) {
        ctrl.setCurrentDomEntity(entity);
        this.assembleContent(cfg, dom);

        //Check the language settings to see if we should bother with ESN
        this.checkSelection(cfg, dom, selection, win || window);

        //Check the selection options to see if there is a selection with options
    }

    //Check the service status (not in the isPlaying check, have to support resume or pause?
    this.checkServiceStates(cfg);

    return cfg;
};

/**
 *  Alt text only allows primary text.
 */
TTS.Menu.prototype.checkAlt = function(cfg, text) {
    var ctrl = TTS.getInstance();
    cfg.PRI.cb = this.getPlayFunction(text, TTS.Parser.Types.HTML, this.pri);
};

//Global menu vs the right click.
TTS.Menu.prototype.getGlobalMenuCfg = function(dom, selection) {
    //Can only currently be accessed in student, here be BUGS galor (probably)
};

//Check if a range is present, and if so setup the play functions
//The play function will default to playing the selection if one is present.
// NOTE: there may be a selection on the page in a section that does not allow speech.  The logic that screens this out
//       is in module.tts. Therefore, this code only considers the selection that is passed in by module_tts
TTS.Menu.prototype.checkSelection = function (cfg, dom, sel, win) {

    var ctrl = TTS.getInstance(); //TODO: Handle all the iFrame stuff?
    var win = win && win.document ? win.document : win;
    // var sel = rangy.getSelection(win)
    if (!dom || !sel || (sel.rangeCount == 0) || sel.getRangeAt(0).collapsed) {
        return;
    }

    var priLang = tds.language.getITSDefault();
    var secLang = tds.language.getITSAlt();
    var priSelector = new TTS.Parse.Selector(sel, priLang);
    var pnPrimary = (priSelector) ? priSelector.collectNodes() : null;
    var pnSecondary = null;

    if (secLang) {
        var secSelector = new TTS.Parse.Selector(sel, secLang);
        pnSecondary = (secSelector) ? secSelector.collectNodes() : null;
    }

    cfg.SEL_PRI.cb = this.getPlayFunction(pnPrimary, priLang);
    cfg.SEL_SEC.cb = this.getPlayFunction(pnSecondary, secLang);
};

// Add TTS Mode "Speak Option" to menu
TTS.Menu.prototype.addMode = function(cfg, cb) {

    cfg = cfg || this.cfg;

    var ctrl = TTS.getInstance();
    if (ctrl.isPlaying()) {
        return;
    }

    cfg.MODE.cb = cb;
    return cfg;
};

// This is legacy code that is currently only used for the EBSR item type. Probably should be replaced there, too. Regular MC options are handled in
// assembleLanguageContent when it calls getResponseArea.
// addOptions passes a set of dom nodes that represent the stem and the options of the currently focused piece of the EBSR
TTS.Menu.prototype.addOptions = function (cfg, dom) {

    cfg = cfg || this.cfg; //This is hard since MC items have all sorts of stuff on them.

    var ctrl = TTS.getInstance();
    if (ctrl.isPlaying()) {
        return;
    }

    var priLang = tds.language.getITSDefault();
    var pnPrimary = new TTS.Parse.ParseNode(priLang, dom);
    var pnSecondary = null;
    var secLang = tds.language.getITSAlt();
    if (secLang) {
        pnSecondary = new TTS.Parse.ParseNode(secLang, dom);
    }

    cfg.PRI_OP.cb = this.getPlayFunction(pnPrimary, priLang);
    cfg.PRI_OP.Label = this.getDomTitle(null, cfg.PRI_OP.Label, priLang);
    cfg.PRI_OP.contain = pnPrimary;

    cfg.SEC_OP.cb = this.getPlayFunction(pnSecondary, secLang);
    cfg.SEC_OP.Label = this.getDomTitle(null, cfg.SEC_OP.Label, secLang);
    cfg.SEC_OP.contain = pnSecondary;
};


//this code implements a special case when the user clicks on a specific multiple choice option. The logic is handled in module_tts, which also makes sure that
//it is the only tts option offered (or whatever). 
TTS.Menu.prototype.addFocusedOption = function (cfg, dom, language) {

    if (!dom) {
        return;
    }

    cfg = cfg || this.cfg;

    var ctrl = TTS.getInstance();
    if (ctrl.isPlaying()) {
        return;
    }

    var priLang = language || tds.language.getITSDefault();
    var pnPrimary = new TTS.Parse.ParseNode(priLang, dom);
    var pnSecondary = null;
    var secLang = tds.language.getITSAlt();
    if (secLang) {
        pnSecondary = new TTS.Parse.ParseNode(secLang, dom);
    }

    cfg.PRI.cb = this.getPlayFunction(pnPrimary, priLang);
    cfg.PRI.Label = this.getDomTitle(dom, cfg.PRI.Label, priLang);
    cfg.PRI.contain = pnPrimary;

    cfg.SEC.cb = this.getPlayFunction(pnSecondary, secLang);
    cfg.SEC.Label = this.getDomTitle(dom, cfg.SEC.Label, secLang);
    cfg.SEC.contain = pnSecondary;
    return cfg;
};

/**
* Creates a callback under 2 conditions: there is something real to play in the specified language, and the language is supported.
* 
*/
TTS.Menu.prototype.getPlayFunction = function(parseNode, language) {
    var ctrl = TTS.getInstance();
    if (parseNode && ctrl.isLanguageSupported(language)) {
        if (parseNode.containsSpeakableText()) {
            return function() {
                ctrl.playParseNode(parseNode, language);
            };
        } else {
            return false;
        }
    }
    return false;
};

//Check to see if the service is playing already or not.
TTS.Menu.prototype.checkServiceStates = function (cfg) {

    var ctrl = TTS.getInstance();
    if (ctrl.isPlaying()) {
        cfg.STOP.cb = function() { TTS.getInstance().stop(); };
    }

    //Pause and resume support
    if (this.hasPauseSupport) {
        if (ctrl.isPlaying()) {
            cfg.PAUSE.cb = function() { TTS.getInstance().pause(); };
        } else if (ctrl.getStatus() == TTS.Status.Paused && ctrl.canResume()) {
            cfg.RESUME.cb = function() { TTS.getInstance().resume(); };
        }
    }
};

// we need to create a key to lookup the label of the menu
TTS.Menu.prototype.getDomTitle = function (dom, label, lang) {

    // NOTE: This code is for MC/MS items

    if (!dom) {
        return label;
    }

    // sometimes an array, in that case use the first element.
    if (YAHOO.lang.isArray(dom) && dom.length > 0) {
        dom = dom[0];
    }

    // NOTE: Logs showed error: "dom.getAttribute is not a function".. so this object wasn't an element, why?
    if (!Util.Dom.isElement(dom)) {
        return label;
    }

    // try and get key from special attribute
    var key = dom.getAttribute('data-menu-prefix');

    // if there are no key then set default
    if (!key) {
        key = 'TDSTTS.Label.Speak';
        if (dom.title) { // remove whitespace from title (e.x., "Option A" => "OptionA")
            key += dom.title.replace(/\s+/g, '');
        } else {
            key += 'Question';
        }
    }

    // add the current language
    key += lang;
    return key;
};
