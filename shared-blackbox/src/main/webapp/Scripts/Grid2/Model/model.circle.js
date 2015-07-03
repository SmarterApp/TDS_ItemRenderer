//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
/* CIRCLE CLASS */

Grid.Model.Circle = function(model, x, y, radius)
{
    Grid.Model.Circle.superclass.constructor.call(this, model, x, y);
    this.radius = radius;
    
    // set default behavior
    this.setHoverable(false);
    this.setFocusable(Grid.Model.Focusable.Manual);
    this.setMoveable(true);
    this.setSelectable(false);
};

// inherit from position
Lang.extend(Grid.Model.Circle, Grid.Model.Position);

// get all circles
Grid.Model.Circle.prototype.getList = function()
{
    return this.model.getPoints();
};

// get the bounding rect coordinates
Grid.Model.Circle.prototype.getBoundingRect = function(x, y)
{
    if (!YAHOO.lang.isNumber(x)) x = this.x;
    if (!YAHOO.lang.isNumber(y)) y = this.y;

    var width = (this.radius * 2);
    var height = (this.radius * 2);

    // get bounding rect
    var topLeftX = (x - this.radius); // OLD: (x - Math.round(width / 2));
    var topLeftY = (y - this.radius);
    var bottomRightX = (topLeftX + width);
    var bottomRightY = (topLeftY + height);

    return {
        width: width,
        height: height,
        left: topLeftX,
        top: topLeftY,
        right: bottomRightX,
        bottom: bottomRightY
    };
};

// get fixed coords (based on top/left x,y) 
Grid.Model.Circle.prototype.getFixedCoords = function(moveX, moveY)
{
    // get bounding rect
    var rect = this.getBoundingRect(moveX, moveY);

    // get canvas info
    var canvasWidth = this.model.options.canvasWidth;
    var canvasHeight = this.model.options.canvasHeight;

    // make any out of bounds coordinates within bounds
    if (rect.left < 0) moveX = this.radius;
    if (rect.top < 0) moveY = this.radius;
    if (rect.right > canvasWidth) moveX = (canvasWidth - this.radius);
    if (rect.bottom > canvasHeight) moveY = (canvasHeight - this.radius);

    return { x: moveX, y: moveY };
};

// check if this point intersects another circle
Grid.Model.Circle.prototype.intersect = function(that)
{
	var c1 = this.get2D(),
		r1 = this.radius,
		c2 = that.get2D(),
		r2 = that.radius;
	
	return (Intersection.intersectCircleCircle(c1, r1, c2, r2).status != 'Outside');
};

// get all the circles that intersect with this circle
Grid.Model.Circle.prototype.getIntersections = function()
{
	var intersectingPoints = [];
	var points = this.getList();
	
	for(var i = 0; i < points.length; i++)
	{
		var point = points[i];
		
		if (this != point && this.intersect(point))
		{
			intersectingPoints.push(point);
		}
	}
	
	return intersectingPoints;
};

Grid.Model.Circle.prototype.setCoords = function(coords)
{
    coords = coords.split(',');
    for (var i = 0; i < coords.length; i++) { coords[i] = (coords[i] * 1); }

    this.x = coords[0];
    this.y = coords[1];
    this.radius = coords[2];
    
    this.update();
};

Grid.Model.Circle.prototype.getCoords = function()
{
    return YAHOO.lang.substitute('{x}, {y}, {radius}', this);
};

/******************************************************************************************/
/* CIRCLE VIEW */

Grid.Model.Circle.prototype.createElement = function(view)
{
    var id = this.getID();

    // create element
    var circleElement = view.createElement('circle', { 'id': id });
    this.appendElement(view, circleElement);
    return circleElement;
};

Grid.Model.Circle.prototype.updateElement = function(view)
{
    var circleElement = this.getElement(view);

    view.setAttributes(circleElement, {
        'cx': this.x,
        'cy': this.y,
        'r':  (this.radius - 0.4) // NOTE: The variable 'this.radius' use to be hard coded to be 4.6 in v1
    });
    
    Grid.Model.Circle.superclass.updateElement.call(this, view);
};

Grid.Model.Circle.prototype.moveElement = function(view)
{
    var circleElement = this.getElement(view);

    view.setAttributes(circleElement, {
        'cx': this.x,
        'cy': this.y
    });
};

