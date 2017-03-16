//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
/*
Contains all the SVG code for the canvas area.
*/

// get the width/height of the canvas
Grid.View.prototype.getCanvasResolution = function() 
{
	var backgroundCanvas = this.getElementById('backgroundCanvas');
	
	return {
		width: backgroundCanvas.getAttribute("width") * 1,
		height: backgroundCanvas.getAttribute("height") * 1
	};
};

Grid.View.prototype.createGridLines = function(spacing)
{
    // clear any existing lines
    this.clearGridLines();

    // make sure spacing is a # and greater than 0
    if (!YAHOO.lang.isNumber(spacing) || spacing == 0) return false;

    var gridLines = this.getElementById('gridlines');

    // create function for building lines
    var createLine = function(x1, y1, x2, y2)
    {
        var lineElement = this.createElement('line', {
            'x1': x1,
            'y1': y1,
            'x2': x2,
            'y2': y2
        });

        gridLines.appendChild(lineElement);
    };

    var res = this.getCanvasResolution();

    // draw vertical lines
    for (var x = 0; x <= res.width; x += spacing)
    {
        createLine.call(this, x, 0, x, res.height);
    }

    // draw horizontal lines
    for (var y = 0; y <= res.height; y += spacing)
    {
        createLine.call(this, 0, y, res.width, y);
    }

    return true;
};

// removes all the grid lines
Grid.View.prototype.clearGridLines = function()
{
	this.removeChildren('gridlines');
};

// set the canvas cursor (http://www.w3.org/TR/SVG11/interact.html#CursorProperty)
Grid.View.prototype.setCanvasCursor = function(type)
{
    var groupCanvas = this.getElementById('groupCanvas');

    this.setAttributes(groupCanvas, {
        'cursor': type
    });
};

Grid.View.prototype.setCanvasCustomCursor = function(url, x, y)
{
    var groupCanvas = this.getElementById('groupCanvas');
    x = x || 0;
    y = y || 0;

    this.setAttributes(groupCanvas, {
        'cursor': 'url(\'' + url + '\') ' + x + ' ' + y + ' , crosshair'
    });
};
