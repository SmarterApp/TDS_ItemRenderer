/**
 *  This file represents the  interface that should be used in blackbox dropdowns, typically you will want to just
 *  use the open and close methods in this namespace.
 *
 *  Examples of opening notes.
 *     TSD.Notes.open();     //The global notes
 *     TDS.Notes.open(item); //An item preview instance
 *     TDS.Notes.open(TDS.Notes.Types.ScratchPad); //Open the scratchpad notes
 *
 *  The saving of user events is handled by window events using the YUI Event objects (TODO: impl);
 *     TDS.Notes.Events.Load.fire({
          id: this.getId(), 
          data: toLoad, //{type: TDS.Notes.Types[Option], id: X}, 
          cb: this.loadCb.bind(this)}
       );
 *     TDS.Notes.Events.Save.fire({
          id: this.getId(), 
          data: toSave, //{type: TDS.Notes.Types[Option], comment: Instance.serialize()}
          cb: this.saveCb.bind(this)
       });
 *
 *  Overrides on configuration can be done by calling setFactoryConfig OR defining TDS.Config.NotesConfig
 */
TDS = window.TDS || {};
TDS.Notes = {
    Store: {}, //Container for constructed notes instances.
    Debug: true, //Set to false in the module by the module_notes
    Sequence: { id: 0 }, //Not used, only in test cases should this be accessed
    _Factory:  null,
    Events: { //Events called when the dialog is opened, or a save operation is called.
      Load: new YAHOO.util.CustomEvent('load'), 
      Save: new YAHOO.util.CustomEvent('save')
    },
    Types: {
        /**
         *  Actual defined classes of notes.
         */
        Global: 'global', //Set to one of the following defined classes based on config
        DropDown: 'DropDown',
        TextArea: 'TextArea',
        ScratchPad: 'ScratchPad',
        Equation: 'Equation'
        /* EquationEditor: 'EquationEditor', //Good idea or bad idea? (horrible idea?)
         * HTMLEditor: 'HTMLEditor',
         */
    },
    close: function(obj){
        var id = TDS.Notes.getIdFromObj(obj);
        if(id){
            var notes = TDS.Notes.Store[id];
            if(notes){
                notes.close();
            }
        }
    },
    get: function(id){
        return TDS.Notes.Store[id];
    },
    open: function(obj){
        var id = TDS.Notes.getIdFromObj(obj);
        var notes = null;
        if(id){
            notes = TDS.Notes.Store[id];
            if(!notes){
                notes = TDS.Notes.getInstance(obj, id);
                TDS.Notes.Store[id] = notes;
            }
            if(notes){
                notes.open();
            }else{
                console.error('This object type could note create a valid notes instance?', obj);
            }
        }
        return notes;
    },
    closeAll: function(){
        for(var key in TDS.Notes.Store){
            var notes = TDS.Notes.Store[key];
            if(notes && notes.close && typeof notes == 'object'){
                notes.close();
            }
        }
    },
    getInstance: function(obj, id){
        return TDS.Notes.getFactory().buildNotes(obj, id);  
    },
    setFactoryConfig: function(cfg){
        this.getFactory().setConfig(cfg);
    },
    getFactory: function(){
        if(!TDS.Notes._Factory){
            TDS.Config = window.TDS.Config || {}; //Note defines the global namespace for test purposes

            var fact   = new TDS.Notes.Factory(); 
                fact.setConfig(TDS.Config.NotesConfig);

            //Assign the basic instance
            TDS.Notes._Factory = fact;
        }
        return TDS.Notes._Factory;
    },
    setFactory: function(factory){
        TDS.Notes._Factory = factory;
    },
    getIdFromObj: function(obj){
        if(!obj){
            return TDS.Notes.Types.Global;
        }else if(typeof obj == 'string'){
            return obj;
        }else if (typeof obj == 'number'){
            return obj + '';
        }else if(obj.id){
            return obj.id + '_notes';
        }else if(obj.position){
            return obj.position + '_notes';
        }
    }
};




