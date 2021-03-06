//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
/* POINT CLASS */

Grid.Model.Point = function(model, x, y, radius)
{
    Grid.Model.Point.superclass.constructor.call(this, model, x, y, radius);
    this.radius = radius;
    this._transparent = false;
};

// inherit from circle
Lang.extend(Grid.Model.Point, Grid.Model.Circle);

Grid.Model.Point.prototype.makeTransparent = function(transparent) {
    this._transparent = transparent;
    this.update();
};

Grid.Model.Point.prototype.isTransparent = function () {
    return this._transparent;
};

// get the bounding rect coordinates
Grid.Model.Point.prototype.getBoundingRect = function(x, y)
{
    var rect = Grid.Model.Point.superclass.getBoundingRect.call(this, x, y);
    
    // NOTE: I am not sure why we did this for point but this simulates previous point object code
    rect.top -= this.radius;
    rect.bottom -= this.radius;

    return rect;
};

// get fixed coords (based on center x,y) and snap to center of borders
Grid.Model.Point.prototype.getFixedCoords = function(moveX, moveY)
{
    // get bounding rect
    var rect = this.getBoundingRect(moveX, moveY);

    // get canvas info
    var canvasWidth = this.model.options.canvasWidth;
    var canvasHeight = this.model.options.canvasHeight;

    // make any out of bounds coordinates within bounds
    if (rect.left < 0) moveX = 0;
    if (rect.top < 0) moveY = 0;
    if (rect.right > canvasWidth) moveX = canvasWidth;
    if (rect.bottom > canvasHeight) moveY = canvasHeight;

    return { x: moveX, y: moveY };
};

// move point
Grid.Model.Point.prototype.moveTo = function(moveX, moveY, preventSnap)
{
    // call superclass method
    var moved = Grid.Model.Point.superclass.moveTo.call(this, moveX, moveY, preventSnap);

    if (moved)
    {
        // check if has any lines that need updating
        var lines = this.getLines();
        for (var i = 0; i < lines.length; i++) this.model.fireLazy('onMove', lines[i]);
    }

    return moved;
};

Grid.Model.Point.prototype.getLines = function()
{
	var pointLines = [];
	var lines = this.model.getLines();
	
	for(var i = 0; i < lines.length; i++)
	{
		var line = lines[i];
		
		if (this == line.source || this == line.target) 
		{
			pointLines.push(line);
		}
	}
	
	return pointLines;
};
	
// Move all the lines from this point to another point
Grid.Model.Point.prototype.moveLines = function(toPoint)
{
	if (!toPoint) return false;
	
	// get all this points lines
	var fromLines = this.getLines();

	// check if there are any lines on our current point we need to move to the final point
	for(var i = 0; i < fromLines.length; i++)
	{
		var fromLine = fromLines[i];
		
		// is the from point the source or the target (we need to know to create the new line properly)
		var isSource = (fromLine.source == this);
		
		// remove line on from point
		this.model.deleteLine(fromLine);
		
		// add line to new point
		if (isSource) this.model.addLine(toPoint, fromLine.target, fromLine.dirType);
		else this.model.addLine(fromLine.source, toPoint, fromLine.dirType);
	}
	
	return true;
};

// check if this point intersects with a line
Grid.Model.Point.prototype._intersectLine = function(line)
{
    var c = this.get2D(),
		r = this.radius,
		a1 = line.source.get2D(),
		a2 = line.target.get2D();

    return (Intersection.intersectCircleLine(c, r, a1, a2).source != 'Outside');
};

// what is the distance from this position to the line
// TODO: Remove this function in favor of line.distancefromPoint()
Grid.Model.Point.prototype.distanceFromLine = function(line)
{
    var px = this.x,
		py = this.y,
		x1 = line.source.x,
		y1 = line.source.y,
		x2 = line.target.x,
		y2 = line.target.y;

    var nearestPoint = Grid.Utils.getNearestPointAlongLine(px, py, x1, y1, x2, y2);
    return this.get2D().distanceFrom(nearestPoint);
};

Grid.Model.Point.prototype.getStyles = function()
{
    // fill:red;stroke:black;stroke-width:0;opacity:1

    // define default styles
    var styles =
    {
        'fill': 'red',
        'stroke': 'blue',
        'stroke-width': '0',
        'stroke-dasharray': ''
    };

    if (this.isFocused())
    {
        styles['stroke-width'] = '1';
    }
    else
    {
        styles['stroke-width'] = '0';
    }
    
    if (this._transparent) {
        styles['opacity'] = '0';
    }
    return styles;
};

/******************************************************************************************/
/* POINT VIEW */

Grid.Model.Point.prototype.getElementGroup = function() { return 'points'; };

Grid.Model.Point.prototype.updateElement = function(view)
{
	var pointElement = this.getElement(view);

	if (this.isFocused())
	{
	    view.bringToFront(pointElement);
    }
    
    Grid.Model.Point.superclass.updateElement.call(this, view);
};