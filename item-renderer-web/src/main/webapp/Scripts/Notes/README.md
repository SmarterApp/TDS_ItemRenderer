Overview
================================================================================================
The notes class is a place where the student is able to write down information, or think through
a problem.  Currently only the "global" notes are accessible across a session, and is the only
thing saved into the database.

The system is able to configure the default "type" of notes by providing information in 
TDS.Config.NotesConfig, this information is populated by database entries that tell the type of
notes for a particular instance.

The goal of this is to provide a more flexible system for note taking, for example different
notepad types poping up based on item.   Having a text area pop up on a free writing section
is not terribly useful so perhaps they should open scratchpads etc.

When open notes for a TDS Item, you can pass either a full object, a string that represents the
type you want opening, or nothing (Global notes)

For example:
  TDS.Notes.open(); //Global Notes
  TDS.Notes.open(TDS.Notes.Types.ScratchPad); //Open the "scratchpad" notes instance
  TDS.Notes.open({id: 'SomeId}); //Default note type, but distinct and tied to that id
  TDS.Notes.open({id: 'SomeId2, NotesType: TDS.Notes.Types.TextArea}); //etc

The Notes Classes
================================================================================================
  TDS.Notes             //User API & Events.
    TDS.Notes.Events    //Saving and loading events
    TDS.Notes.Factory   //Creates the notes and dialogs
    TDS.Notes.Store     //All notes class instances of Dialog are stored in here by id => Class
      TDS.Notes.Dialog  //Contains an instance of TDS.Notes.Types class (wraps YUI Dialog)
      -TDS.Notes.ScratchPad
      -TDS.Notes.TextArea
      -TDS.Notes.DropDown

Design
================================================================================================
The only really important and strange detail in that class heirarchy is that a save an load store
is not provided in the default library.   That information only comes from the TestShell if it 
subscribes to the Save and Load events and actually does something with it.

A Callback is provided for when the work is done, and you want to update / modify the dialog state

For Example So the typical behavior is going to be:

TDS.Notes.Events.Load.subscribe(function(type, evt){
   if(args){
       var data = args[0];
       var callback = args.cb;
       var id       = args.id;
       var data     = args.data; //{type: X, id: "This notes instance id"}

       //Do your work to actually load saved content.
       callback('The serialized save information you want it to load, json for scratchpad, etc');
   }
});

Events
================================================================================================
TDS.Notes.Events.Save //YUI Event system, events are generated from Dialog
TDS.Notes.Events.Load //YUI Event system, events are generated from Dialog


Tests
================================================================================================
The test cases in test/index.html will simply try to load up a new list of dialogs for each of
the types, and then ensure their save and load operations work.

You should see a bunch of dialogs (missing some css) load up and then have data populated into 
them.  In ScratchPad's case a bunch of drawn information should load.  Test data comes from within
test/test data.js


