//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
/* TOOLBAR ACTIONS */

Grid.Action = {};

// collection of actions
Grid.Action.actions = {};

// register an action for a mode name
Grid.Action.registerAction = function(modeName, action) { Grid.Action.actions[modeName] = action; };

Grid.Action.Base = function(grid)
{
	this.grid = grid;
	this.canvas = grid.canvas;
	this.model = grid.model;
	this._completed = false;
};

// is the action completed
Grid.Action.Base.prototype.isCompleted = function() { return this._completed; };

// override these events in inherited classes to create behavior
Grid.Action.Base.prototype.onMouseEvent = function(evt) {};
Grid.Action.Base.prototype.onKeyEvent = function(evt) {};

// override this to cleanup action when it is being finalized
Grid.Action.Base.prototype.dispose = function() {};

// call this to finalize the action when it is finished
Grid.Action.Base.prototype.finalize = function() 
{ 
	this.dispose();
	this._completed = true; 
};
