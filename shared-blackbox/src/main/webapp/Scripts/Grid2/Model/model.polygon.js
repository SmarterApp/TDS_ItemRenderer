//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
/* POLYGON CLASS */

// represents a point in a polygon
Grid.Model.PolygonPoint = function(model, x, y)
{
	Grid.Model.PolygonPoint.superclass.constructor.call(this, model, x, y);
};

Lang.extend(Grid.Model.PolygonPoint, Grid.Model.Position);

// represents a polygon
Grid.Model.PolygonPoint.prototype.toString = function()
{
    return this.x + ',' + this.y;
};

Grid.Model.Polygon = function(model)
{
	Grid.Model.Polygon.superclass.constructor.call(this, model, 0, 0);
	this._points = [];
    
    this._focusable = Grid.Model.Focusable.Manual;
    this._moveable = true;
};

Lang.extend(Grid.Model.Polygon, Grid.Model.Position);

Grid.Model.Polygon.prototype.getPoints = function() { return this._points; };

Grid.Model.Polygon.prototype.addPoint = function(x, y)
{
    var point = new Grid.Model.PolygonPoint(this.model, x, y);
    this._points.push(point);
};

Grid.Model.Polygon.prototype.getCoords = function()
{
    return this._points.join(' ');
};

// regex for parsing groups of x,y
Grid.Model.Polygon._path_regexp = (function()
{
    var number = '-?[0-9.]+';
    var comma = '\s*[, \t]\s*';
    var xy = number + comma + number;
    return new RegExp(xy, 'ig');
})();

// parse a string for x,y pairs (e.x, "10,10 50,10 80,200")
Grid.Model.Polygon._parsePath = function(path)
{
    var points = [];
    var tokens = path.match(Grid.Model.Polygon._path_regexp);

    if (YAHOO.lang.isArray(tokens))
    {
        for (var i = 0; i < tokens.length; i++)
        {
            var token = tokens[i].replace(/^\s+|\s+$/g, ''); // trim string

            var xy = token.split(/[, \t]+/);
            var x = parseFloat(xy[0]);
            var y = parseFloat(xy[1]);
            points.push([x, y]);
        }
    }

    return points;
};

// set the coordinates for a polygon (e.x., '10,10 20,20 40,20')
Grid.Model.Polygon.prototype.setCoords = function(coords)
{
    // clear current points
    this._points = [];
    
    // parse x,y coordinates
    var parsedPoints = Grid.Model.Polygon._parsePath(coords);
    
    // add points
    for (var i = 0; i < parsedPoints.length; i++)
    {
        var parsedPoint = parsedPoints[i];
        this.addPoint(parsedPoint[0], parsedPoint[1]);
    }

    // manually set x,y for position base
    if (this._points.length > 0)
    {
        this.x = parsedPoints[0][0];
        this.y = parsedPoints[0][1];
    }
    
    this.update();
};

/******************************************************************************************/
/* POLYGON VIEW */

Grid.Model.Polygon.prototype.createElement = function(view)
{
    var id = this.getID();

    // create element
    var polyElement = view.createElement('polygon', {
        'id': id,
        'points': this._points.join(' ')
    });

    this.appendElement(view, polyElement);
    
    return polyElement;
};

Grid.Model.Polygon.prototype.moveElement = function(view)
{
    var polyElement = this.getElement(view);

    var xDiff = 0;
    var yDiff = 0;

    for (var i = 0; i < this._points.length; i++)
    {
        var point = this._points[i];

        if (i == 0)
        {
            xDiff = this.x - point.x;
            yDiff = this.y - point.y;
            
            point.x = this.x;
            point.y = this.y;
        }
        else
        {
            point.x += xDiff;
            point.y += yDiff ;
        }
    }

    view.setAttributes(polyElement, {
        'points': this._points.join(' ')
    });
};

Grid.Model.Polygon.prototype.updateElement = function(view)
{
    this.moveElement(view);
    Grid.Model.Polygon.superclass.updateElement.call(this, view);
};
