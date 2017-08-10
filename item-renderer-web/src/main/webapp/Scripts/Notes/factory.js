//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
/**
 *  The default factory configuration for the Dialog windows, simply override as needed.
 */
TDS.Notes.TypeConfig = TDS.Notes.TypeConfig || {
    Default: {
        width: '450px',
        height: '150px'
    },
    ScratchPad: {
        width: '790px',
        height: '780px'
    },
    Equation: {
        width: '500px',
        height: '331px',
        label: 'Equation Editor'
    }
};

/** 
 *  Internal factory class that looks up the configuration of the site and 
 *  attempts to actually create the correct windows.   Also will provide
 *  override configuration.
 *
 *  cfg
 *   -GlobalClass: One of TDS.Notes.Types
 *   -GlobalLabel: "A string for the comment header"
 *
 *   -DefaultClass: One of TDS.Notes.Types
 *   -DefaultLabel: "A string for the comment header"
 */
TDS.Notes.Factory = function(cfg) {
    this.setConfig(cfg);
};

/** 
 *  Initialiaze the global configuration along with any modifiers in the app
 */
TDS.Notes.Factory.prototype.setConfig = function(cfg) {
    cfg = cfg || {}; //Things like override the default note type etc.

    cfg.GlobalClass = cfg.GlobalClass || TDS.Notes.Types.TextArea;
    cfg.GlobalLabel = cfg.GlobalLabel || "Global Comments";
    TDS.Notes['global'] = TDS.Notes[cfg.GlobalClass]; //Note that "None" will be a null, thus not create instances

    cfg.DefaultClass = cfg.DefaultClass || TDS.Notes.Types.TextArea;
    cfg.DefaultLabel = cfg.DefaultLabel || "Comments";

    TDS.Notes.Debug && console.log("Setting the Notes Factory config with cfg:", cfg);
    this.cfg = cfg;
};

TDS.Notes.Factory.prototype.getConfig = function() {
    return this.cfg;
};
/**
 *  Get the configuration for the particular dialog window type that we want to open up.
 */
TDS.Notes.Factory.prototype.getDialogConfigForType = function(type) {
    var cfg = JSON.parse(JSON.stringify(TDS.Notes.TypeConfig[type] || TDS.Notes.TypeConfig.Default));
    cfg.label = (type == TDS.Notes.Types.Global) ? this.cfg.GlobalLabel : (cfg.label ? cfg.label : this.cfg.DefaultLabel);
    return cfg;
};

/**
 *  Looks up the type of notes for an object or item, references the test level,
 *  item level configuration to figure out what to actually use.
 */
TDS.Notes.Factory.prototype.getNotesType = function(obj) {
    //If this is an item that actually specifies the type of notes to use.
    if (obj && obj.NotesType && TDS.Notes.Types[obj.NotesType]) {
        return TDS.Notes.Types[obj.NotesType];
    }
    //TODO: Implement the factory cfg(and accompanying db info for per item notes types)
    //look in this.cfg, return the mapping.

    //Fallback to being just the default types
    return this.cfg.DefaultClass || TDS.Notes.Types.TextArea;
};


/**
 *  Build the actual notes implementation and return it to the primary interface.
 */
TDS.Notes.Factory.prototype.buildNotes = function(obj, id) {
    var type = null;
    if(!obj){
        type = TDS.Notes.Types.Global;
    }else if(typeof obj == 'string') {
        type = obj;
    }else if (obj) {
        type = this.getNotesType(obj);
    }
    if (typeof TDS.Notes[type] == 'function') {
        TDS.Notes.Debug && console.log("Building notes for (obj, id, type)", id, type);
        return this.createNotesType(id, type);
    }else{
        console.error("Cannot build notes with this type: ", type);
    }
};

/**
 *  Create an instance of the type with the specified ID
 *  NOTE: Do not change this function without tests _inside_ of blackbox.  YUI2 dialogs are _bad_  
 */
TDS.Notes.Factory.prototype.createNotesType = function(id, type) {
    var dom = this.getContainer(id, type);

    //Create a new dialog with the root element being the container (notes MUST get a ref to the proper dom
    //object before creating the YUI dialog.  The YUI dialog does some bad / strange things.
    var notes = new TDS.Notes[type]({ dom: dom });
    notes.saveState(''); //Initialize the save state.
    var dialog = new TDS.Notes.Dialog({
        cfg: this.getDialogConfigForType(type),
        dom: dom,
        impl: notes
    });
    TDS.Notes.Debug && console.log("Creating an instance of this notes (id, type, dialog, notes)", id, type, dialog, notes);
    dialog.create();
    notes.create(); //Actually build the item, you must do this AFTER creating the dialog or things go wrong.
    return dialog;
};

/**
 *  Creates a form element that can be used by the YUI Dialog, along with an internal dom element that you
 *  can render content into.   Rendering directly into the form goes badly beacuse of how YUI2 modifies
 *  the HTML when putting it in a dialog.
 */
TDS.Notes.Factory.prototype.getContainer = function(id, type) { //Move into the implementation base vs the dialog?
    var dom = document.getElementById(id);
    if (!dom) {
        dom = document.createElement('form');
        dom.id = id;
        dom.className += 'notes_dialog_form notes_dialog_form_' + type;
        document.body.appendChild(dom);
    }

    var cId = 'note_container_' + id;
    var c = document.getElementById(cId);
    if (!c) {
        c = document.createElement('div');
        c.className = 'notes_dialog_container bd';
        c.id = cId;
        dom.appendChild(c);
    }
    return dom;
};
