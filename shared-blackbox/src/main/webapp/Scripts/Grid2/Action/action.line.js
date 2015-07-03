//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
// MODE: CREATE LINE
Grid.Action.Line = function(grid)
{
    Grid.Action.Line.superclass.constructor.call(this, grid);

    this.pointType = 'none';
    this.sourcePoint = null;
    this.targetPoint = null;
    this.line = null;
    this.moved = false;
};

YAHOO.lang.extend(Grid.Action.Line, Grid.Action.Base);

Grid.Action.Line.prototype.dispose = function()
{
	if (this.pointType == 'source')
	{
		this.canvas.finalizePoint(this.sourcePoint);
	}
	else if (this.pointType == 'target')
	{
		this.targetPoint = this.canvas.finalizePoint(this.targetPoint);
		
		// if the source and target are the same then delete the line
		if (this.sourcePoint == this.targetPoint)
		{
			this.model.deleteLine(this.line);
		}
	}
};

// get the current point type element we are working with (source or target)
Grid.Action.Line.prototype.getPoint = function() { return this[this.pointType + 'Point']; };

// set the current point types element
Grid.Action.Line.prototype.setPoint = function(point) { this[this.pointType + 'Point'] = point; };

Grid.Action.Line.prototype.movePoint = function(x, y)
{
	var currentPoint = this.getPoint();
	currentPoint.moveTo(x, y);
};

Grid.Action.Line.prototype.createLine = function()
{
	this.line = this.model.addLine(this.sourcePoint, this.targetPoint);
};

// check if the line can be finalized
Grid.Action.Line.prototype.canLineBeFinalized = function()
{
    // make sure there are source and target points
    if (this.sourcePoint == null || this.targetPoint == null) return false;

    // if the target isn't moveable then we can stop here
    if (!this.targetPoint.isMoveable()) return true;

    if (!this.moved) return false; // has the user moved mouse at all?

    // check if the target point intersects with the source, if it does then don't let them do this
    var intersectedPoints = this.targetPoint.getIntersections();

    for (var i = 0; i < intersectedPoints.length; i++)
    {
        if (this.sourcePoint == intersectedPoints[i]) return false;
    }

    return true;
};

Grid.Action.Line.prototype.onMouseEvent = function(evt) 
{
	var x = evt.currentPosition.x,
		y = evt.currentPosition.y;
	
	if (evt.name == 'mousedown')
	{
		var clickedEntity = this.model.getEntity(evt.target.id);

		// make sure the clicked on target point is not already the source point
		if (this.sourcePoint && this.sourcePoint == clickedEntity) return;
		
		// create source point
		if (this.sourcePoint == null)
		{
			this.pointType = 'source';
			
			// check if clicked on an existing point
			if (clickedEntity && clickedEntity.getType == 'point')
			{
				this.setPoint(clickedEntity); // use existing point
			}
			else
			{
				this.setPoint(this.model.addPoint(x, y)); // create new point
				this.sourcePoint = this.canvas.finalizePoint(this.sourcePoint);
			}
		}
		
		if (this.targetPoint == null)
		{
			this.pointType = 'target';
			this.setPoint(this.model.addPoint(x, y));
			this.createLine();
		}
		
		if (this.canLineBeFinalized()) this.finalize();
	}
	
	if ((evt.name == 'mousemove' || evt.name == 'drag') && this.targetPoint.isMoveable())
	{
		this.moved = true;
		this.movePoint(x, y);
		// this.getPoint().snapToGrid();
	}
	
	if (evt.name == 'dragend')
	{
		if (this.canLineBeFinalized()) this.finalize();
	}

};

Grid.Action.Line.prototype.onKeyEvent = function(evt)
{
    var selected = this.canvas.getFocused();

    // if there is already a point selected then lets use that as our source
    if (selected && this.pointType == 'none')
    {
        this.pointType = 'source';
        this.setPoint(selected);
    }

    // create a new point as the source
    if (!selected && this.pointType == 'none')
    {
        this.pointType = 'source';
        this.setPoint(this.model.addPoint(30, 30));
    }
        // finalize source, create a new point as the target and add line
    else if (this.pointType == 'source')
    {
        this.sourcePoint = this.canvas.finalizePoint(this.sourcePoint);
        this.pointType = 'target';
        this.setPoint(this.model.addPoint(this.sourcePoint.x, this.sourcePoint.y));
        this.createLine();
    }
        // finalize target
    else
    {
        this.targetPoint = this.canvas.finalizePoint(this.targetPoint);

        // if the source and target are the same then delete the line
        if (this.sourcePoint == this.targetPoint)
        {
            this.model.deleteLine(this.line);
        }

        this.finalize();
    }
};

// MODE: CREATE DASHED LINE
Grid.Action.LineDash = function(grid)
{
    Grid.Action.LineDash.superclass.constructor.call(this, grid);
};

YAHOO.lang.extend(Grid.Action.LineDash, Grid.Action.Line);

Grid.Action.LineDash.prototype.createLine = function()
{
	this.line = this.model.addLine(this.sourcePoint, this.targetPoint, 'none', 'dashed');
};	