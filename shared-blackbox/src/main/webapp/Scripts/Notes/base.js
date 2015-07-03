//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
TDS.Notes.Base = function(){
    this._saveState = ' '; //Preserve each save state operation, or successful 
};

TDS.Notes.Base.prototype.create = function(){ //Create the html dom
    TDS.Notes.Debug && console.log("Notes.Base class method, should be overriden: create");
};
TDS.Notes.Base.prototype.serialize   = function(){ //Return a save state
    TDS.Notes.Debug && console.log("Notes.Base class method, should be overriden: serialize");
};
TDS.Notes.Base.prototype.unserialize = function(response){ //Process the save state
    TDS.Notes.Debug && console.log("Notes.Base class method, should be overriden: unserialize");
};

TDS.Notes.Base.prototype.saveState = function(state){
    this._saveState = state; //Now preserve that information
};

TDS.Notes.Base.prototype.getState = function(){
    return this._saveState;
};

TDS.Notes.Base.prototype.revertState = function(){
    this.unserialize(this.getState());
};

//For focus once you open the notes elements.
TDS.Notes.Base.prototype.focus = function(){
    //Only some subclasses like HTML editor and 
};

TDS.Notes.Base.prototype.unfocus = function(){
    //Only some subclasses like HTML editor implement it, remove keyboard focus etc
};
