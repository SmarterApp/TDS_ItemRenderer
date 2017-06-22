//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
// MODE: CREATE POINT
Grid.Action.Point = function(grid)
{
    Grid.Action.Point.superclass.constructor.call(this, grid);
    this.createdPoint = null;
};

YAHOO.lang.extend(Grid.Action.Point, Grid.Action.Base);
	
Grid.Action.Point.prototype.dispose = function()
{
	if (this.createdPoint)
	{
		this.createdPoint = this.canvas.finalizePoint(this.createdPoint);
	}
};

Grid.Action.Point.prototype.onMouseEvent = function(evt) 
{
	var x = evt.currentPosition.x,
		y = evt.currentPosition.y;
	
	if (evt.name == 'mousedown')
	{
		var entity = this.model.getEntity(evt.target.id);
		
		if (entity && entity.getType() == 'point')
		{
			this.createdPoint = entity;
		}
		else
		{
			this.createdPoint = this.model.addPoint(x, y);
		}
		
		// check if point was created before continuing
		if (this.createdPoint == null) this.finalize();
	}
	
	if (evt.name == 'drag' && this.createdPoint.isMoveable())
	{
		this.createdPoint.moveTo(x, y);
	}
	
	if (evt.name == 'mouseup' || evt.name == 'dragend')
	{
		this.finalize();
	}
};

Grid.Action.Point.prototype.onKeyEvent = function(evt)
{
    // check if a point is created
    if (!this.createdPoint)
    {
        this.createdPoint = this.model.addPoint(30, 30);
        this.createdPoint.snapToGrid();
    }
    else
    {
        this.finalize();
    }
};