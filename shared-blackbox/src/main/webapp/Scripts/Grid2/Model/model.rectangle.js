//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
/* RECTANGLE CLASS */

Grid.Model.Rectangle = function(model, x, y, width, height)
{
    Grid.Model.Rectangle.superclass.constructor.call(this, model, x, y);
	this.width = width || 0;
	this.height = height || 0;
    
    // set default behavior
    this.setHoverable(false);
    this.setFocusable(Grid.Model.Focusable.Manual);
    this.setMoveable(true);
    this.setSelectable(false);
};

// inherit from position
Lang.extend(Grid.Model.Rectangle, Grid.Model.Position);

// get the image rect size
Grid.Model.Rectangle.prototype.getSize = function() { return this.width * this.height; };

// get the bounding rect coordinates
Grid.Model.Rectangle.prototype.getBoundingRect = function(x, y)
{
    if (!YAHOO.lang.isNumber(x)) x = this.x;
    if (!YAHOO.lang.isNumber(y)) y = this.y;

    // get bounding rect
    var topLeftX = x;
    var topLeftY = y;
    var bottomRightX = (topLeftX + this.width);
    var bottomRightY = (topLeftY + this.height);

    return {
        width: this.width,
        height: this.height,
        left: topLeftX,
        top: topLeftY,
        right: bottomRightX,
        bottom: bottomRightY
    };
};

// get fixed coords (based on top/left x,y)
Grid.Model.Rectangle.prototype.getFixedCoords = function(moveX, moveY)
{
    // get bounding rect
    var rect = this.getBoundingRect(moveX, moveY);

    // get canvas info
    var canvasWidth = this.model.options.canvasWidth;
    var canvasHeight = this.model.options.canvasHeight;

    // fix any out of bounds coordinates to be within bounds
    if (rect.left < 0) moveX = 0;
    if (rect.top < 0) moveY = 0;
    if (rect.right > canvasWidth) moveX = (canvasWidth - this.width);
    if (rect.bottom > canvasHeight) moveY = (canvasHeight - this.height);

    return { x: moveX, y: moveY };
};

Grid.Model.Rectangle.prototype.setCoords = function(coords)
{
    coords = coords.split(',');
    for (var i = 0; i < coords.length; i++) { coords[i] = (coords[i] * 1); }

    var x1 = coords[0];
    var y1 = coords[1];
    var x2 = coords[2];
    var y2 = coords[3];

    this.x = x1;
    this.y = y1;
    this.width = (x2 - x1);
    this.height = (y2 - y1);
    
    this.update();
};

Grid.Model.Rectangle.prototype.getCoords = function()
{
    var boundingRect = this.getBoundingRect();
    return YAHOO.lang.substitute('{left}, {top}, {right}, {bottom}', boundingRect);
};

/******************************************************************************************/
/* RECTANGLE VIEW */

Grid.Model.Rectangle.prototype.createElement = function(view)
{
    var id = this.getID();
    var element = view.createElement('rect', { 'id': id });
    this.appendElement(view, element);
    return element;
};

Grid.Model.Rectangle.prototype.updateElement = function(view)
{
    var element = this.getElement(view);
    var boundingRect = this.getBoundingRect();

    view.setAttributes(element, {
        'x': boundingRect.left,
        'y': boundingRect.top,
        'width': boundingRect.width,
        'height': boundingRect.height
    });
    
    Grid.Model.Rectangle.superclass.updateElement.call(this, view);
};

Grid.Model.Rectangle.prototype.moveElement = function(view)
{
    var element = this.getElement(view);
    var boundingRect = this.getBoundingRect();
    
    view.setAttributes(element,
    {
        'x': boundingRect.left,
        'y': boundingRect.top
    });
};
