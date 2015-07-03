//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
// MODE: CREATE SINGLE ARROW
Grid.Action.ArrowSingle = function(grid)
{
    Grid.Action.ArrowSingle.superclass.constructor.call(this, grid);
};

YAHOO.lang.extend(Grid.Action.ArrowSingle, Grid.Action.Line);

Grid.Action.ArrowSingle.prototype.createLine = function()
{
    this.line = this.model.addLine(this.sourcePoint, this.targetPoint, 'forward');
};	

// MODE: CREATE ARROWS
Grid.Action.ArrowDouble = function(grid)
{
    Grid.Action.ArrowDouble.superclass.constructor.call(this, grid);
};

YAHOO.lang.extend(Grid.Action.ArrowDouble, Grid.Action.Line);

Grid.Action.ArrowDouble.prototype.createLine = function()
{
	this.line = this.model.addLine(this.sourcePoint, this.targetPoint, 'both');
};
