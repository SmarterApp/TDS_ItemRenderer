/* LINE CLASS */

Grid.Model.Line = function(model, source, target, dirType, style, transparent)
{
	Grid.Model.Line.superclass.constructor.call(this, model);
	this.source = source;
	this.target = target;
    this.style = style || 'solid'; // or 'dashed'

    // set the direction of the line
	if (Lang.isBoolean(dirType)) {
	    // boolean provided, if true then set as forward
	    dirType = dirType ? 'forward' : 'none'; 
	}
	else if (Lang.isString(dirType)) {
	    // string provided, verify
	    dirType = dirType.toLowerCase();

	    if (dirType != 'none' && dirType != 'forward' && dirType != 'back' && dirType != 'both') {
	        throw new Error('Invalid line direction');
	    }
	} else {
	    // no direction provided default to none
	    dirType = 'none'; 
	}
    
    // check if we should hide the points on the line
    if (transparent) {
        // types of lines: http://etc.usf.edu/clipart/76000/76057/76057_defn_lg.gif
        source.makeTransparent(dirType == 'both' || dirType == 'back');
        target.makeTransparent(dirType == 'both' || dirType == 'forward');
    }

    this.dirType = dirType; // none, forward, back, both
};

Lang.extend(Grid.Model.Line, Grid.Model.Base);

// Grid.Model.Line.prototype.toString = function() { return '(' + this.source + '),(' + this.target + ')'; };

// get line length
Grid.Model.Line.prototype.getLength = function()
{
	var p1 = this.source.get2D();
	var p2 = this.target.get2D();
	return p1.distanceFrom(p2);
};

// check if this line intersects with another line
Grid.Model.Line.prototype.intersect = function(line)
{
	var a1 = this.source.get2D(),
		a2 = this.target.get2D(),
		b1 = line.source.get2D(),
		b2 = line.target.get2D();
		
	return (Intersection.intersectLineLine(a1, a2, b1, b2).status == 'Intersection');
};

// get the distance from this line to another line
Grid.Model.Line.prototype.distanceFrom = function(line)
{
	// if the lines intersect then the distance is 0
	if (this.intersect(line)) return 0;
	
	// try each of the four points vertices with the other segment
	var distances = [];
	distances.push(this.source.distanceFromLine(line));
	distances.push(this.target.distanceFromLine(line));
	distances.push(line.source.distanceFromLine(this));
	distances.push(line.target.distanceFromLine(this));
	
	return Math.min.apply(Math, distances); // return shortest distance
};

// Get the slope of the line.
// NOTE: Undefined Slope and Zero Slope - http://mathforum.org/library/drmath/view/57310.html
Grid.Model.Line.prototype.getSlope = function()
{
    var denom = this.target.x - this.source.x;
    var num = this.target.y - this.source.y;

    if (denom == 0) return Infinity; // A vertical line does not have a slope.
    else if (num == 0) return 0.0; // A horizontal line has a slope which is the number zero.
    else return num / denom;
};

// Get the angle of the line.
Grid.Model.Line.prototype.getAngle = function()
{
    var x1 = this.source.x,
        y1 = this.source.y,
        x2 = this.target.x,
        y2 = this.target.y;

    return Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
};

// Get the angle of the line always from left to right.
Grid.Model.Line.prototype.getAngle2 = function()
{
    var x1 = this.source.x,
        y1 = this.source.y,
        x2 = this.target.x,
        y2 = this.target.y;

    // make sure x is increasing to the right, and y increasing up the page
    var radians = (x1 <= x2) ? Math.atan2(y2 - y1, x2 - x1) : Math.atan2(y1 - y2, x1 - x2);
    var degrees = (radians * 180 / Math.PI);
    return degrees;
};

/**
 * returns true if this line is parallel to the other line, within tolerance. Tolerance allows a difference of <tolerance>
 * over the length of the second line.
 * @param line - line to compare
 * @param tolerance - allowable total discrepancy from parallel across length of line
 * @return true if parallel within tolerance, false otherwise
 */
/*
Grid.Model.Line.prototype.isParallelTo_Old = function(line, tolerance)
{
    // TODO: Review this http://code.google.com/p/boundary-generator/source/browse/trunk/src/geom/Vector.cs#80

    var tol = tolerance / line.getLength();
    var s1 = this.getSlope();
    var s2 = line.getSlope();

    if (s1 == Infinity)
    {
        if (s2 == Infinity) return true;
        if (Math.abs(line.target.x - line.source.x) < tolerance) return true;
        return false;
    }

    if (Math.abs(s1 - s2) <= tol) return true;

    return false;
};
*/

Grid.Model.Line.prototype.isParallelTo = function(line, tolerance) {
    
    var angleTolerance = 0.05;
    var line1Vertical = false;
    var line1Horizontal = false;
    var line2Vertical = false;
    var line2Horizontal = false;

    var line1 = this;
    var line2 = line;

    //checking if vertical
    //checking line1
    if (line1.source.x >= line1.target.x) {
        if (Math.abs(line1.source.x - line1.target.x) < .25) {
            line1Vertical = true;
        }
    } else if (Math.abs(line1.target.x - line1.source.x) < .25) {
        line1Vertical = true;
    }

    //checking line2
    if (line2.source.x >= line2.target.x) {
        if (Math.abs(line2.source.x - line2.target.x) < .25) {
            line2Vertical = true;
        }
    } else if (Math.abs(line2.target.x - line2.source.x) < .25) {
        line2Vertical = true;
    }

    //checking if horizontal
    //checking line1
    if (line1.source.y >= line1.target.y) {
        if (Math.abs(line1.source.y - line1.target.y) < .25) {
            line1Horizontal = true;
        }
    } else if (Math.abs(line1.target.y - line1.source.y) < .25) {
        line1Horizontal = true;
    }

    //checking line2
    if (line2.source.y >= line2.target.y) {
        if (Math.abs(line2.source.y - line2.target.y) < .25) {
            line2Horizontal = true;
        }
    } else if (Math.abs(line2.target.y - line2.source.y) < .25) {
        line2Horizontal = true;
    }

    if ((line1Vertical && line2Vertical) || (line1Horizontal && line2Horizontal)) {
        return true;
    }
    
    //making sure no 0's or infinity in denominator
    if (!line1Vertical && !line2Vertical) {
        var slope1 = (line1.target.y - line1.source.y) / (line1.target.x - line1.source.x);
        var slope2 = (line2.target.y - line2.source.y) / (line2.target.x - line2.source.x);
        if (slope1 == slope2) return true;
    }

    var distance = function(x, y) {
        return (Math.sqrt(Math.pow((x), 2) + Math.pow((y), 2)));
    };
    
    // turning line segments into vectors
    var newX1 = line1.target.x - line1.source.x;
    var newY1 = line1.target.y - line1.source.y;
    var newX2 = line2.target.x - line2.source.x;
    var newY2 = line2.target.y - line2.source.y;
    var dotProd = newX1 * newX2 + newY1 * newY2;
    var distance1 = distance(newX1, newY1);
    var distance2 = distance(newX2, newY2);
    var lengthProd = distance1 * distance2;
    if (Math.abs(dotProd) == Math.abs(lengthProd)) return true;

    var theta = angleTolerance + 1;
    if (lengthProd != 0) theta = Math.acos(Math.abs(dotProd / lengthProd));

    if (theta <= angleTolerance) return true;
    return false;

};

/*
Grid.Model.Line.prototype.isParallelTo = function(line, tolerance)
{
    var s1 = this.getAngle2();
    var s2 = line.getAngle2();
    var diff = Math.abs(s1 - s2);
    var isParallel = (diff <= tolerance);

    // console.log('parallel: ' + line.getID() + ' s1=' + s1 + ' s2=' + s2 + ' diff: ' + diff);
    return isParallel;
};
*/

// between this line and another line create a new line which is equal length (used for merging)
// NOTE: code taken from the java applet.. jLine.java line 204 jLine getLongestLine(jLine line)
Grid.Model.Line.prototype.getLongestLine = function(line)
{
	var lines = [];
	
	var d1 = this.source.distanceFrom(line.source);
	var d2 = this.source.distanceFrom(line.target);
	
	var start, end; // points
	
	if (d1 < d2)
	{
		start = line.source;
		end = line.target;
	} 
	else 
	{
		start = line.target;
		end = line.source;
	}
    
    lines[0] = new Grid.Model.Line(this.model, start, end);
    lines[1] = new Grid.Model.Line(this.model, this.source, end);
    lines[2] = new Grid.Model.Line(this.model, start, this.target);
    lines[3] = new Grid.Model.Line(this.model, end, this.target);

	var length = this.getLength();
	var longest = this;
	
	for (var i = 0; i < 4; i++)
	{
		var l = lines[i].getLength(); 
		
		if (lines[i].getLength() > length)
		{
			longest = lines[i];
			length = l;
		}
    }
	
	return longest;
};

// get line info used for drawing (x1, y1, x2, y2, angle)
Grid.Model.Line.prototype.getInfo = function()
{
	// get the x, y, radius and thickness of the source and target
	var x1 = this.source.x, 
		y1 = this.source.y, 
		r1 = this.source.radius, 
		t1 = 1;
	var x2 = this.target.x, 
		y2 = this.target.y,
		r2 = this.target.radius, 
		t2 = 1;
	
	// skip below if this line doesn't have an arrow (uncomment this out for maybe slight performance gain?)
	// if (!line.directed) return {x1: x1, y1: y1, x2: x2, y2: y2, angle: null };
	
	// determine intersection of connecting line with circles
	// angle from circle two origin to circle one origin
	var radians = Math.atan2(y2 - y1, x2 - x1);

	// locate intersection by displacing circle origin to perimeter
	// by half the diameter +/- the thickness [1] of the perimeter line circle one
	// EXAMPLE RESULT: ---->*
	var sourceOffset = -2;
	var targetOffset = (this.dirType == 'none') ? -2 : -1;

	// check if we should shorten the arrow to match the source point
    if (!this.source.isTransparent()) {
	    x1 = x1 + (Math.cos(radians) * ((r1 + t1) + sourceOffset));
	    y1 = y1 + (Math.sin(radians) * ((r1 + t1) + sourceOffset));
	}
	
    // check if we should shorten the arrow to match the target point
    if (!this.target.isTransparent()) {
	    x2 = x2 - (Math.cos(radians) * ((r2 + t2) + targetOffset));
	    y2 = y2 - (Math.sin(radians) * ((r2 + t2) + targetOffset));
	}

    var angle = (radians / (2 * Math.PI)) * 360; // radians to degrees
	return {x1: x1, y1: y1, x2: x2, y2: y2, angle: angle };
};

Grid.Model.Line.prototype.getStyles = function()
{
    // <g id="lines" style="fill:none;stroke:red;stroke-width:1"></g>
    
    return {
       'fill': 'none',
       'stroke': 'red',
       'stroke-width': '1',
       'stroke-dasharray': (this.style == 'dashed') ? '5, 5' : ''
   };
};

Grid.Model.Line.prototype.getArrowStyles = function()
{
    // <g id="arrows" style="fill:none;stroke:red;stroke-width:1.3"></g>
    
    return {
       'stroke-width': '1.3'
   };
};

/**********************************************************************/
// SVG CODE:

Grid.Model.Line.prototype.getElementGroup = function() { return 'lines'; };

Grid.Model.Line.prototype.createElement = function(view)
{
    var id = this.getID();
    var lineInfo = this.getInfo();

    // create line
    var lineElement = view.createElement('line', {
        'id': id,
        'x1': lineInfo.x1,
        'y1': lineInfo.y1,
        'x2': lineInfo.x2,
        'y2': lineInfo.y2
    });

    // add line
    this.appendElement(view, lineElement);

    // create arrows
    if (this.dirType == 'forward' || this.dirType == 'both')
    {
        this._createArrowElement(view, id + '_arrow1', lineInfo.x2, lineInfo.y2, lineInfo.angle);
    }

    if (this.dirType == 'both')
    {
         this._createArrowElement(view, id + '_arrow2', lineInfo.x1, lineInfo.y1, (lineInfo.angle - 180));
    }
    
    /*
    var angle = entity.getAngle();
    var angle2 = entity.getAngle2();
    var slope = entity.getSlope();
    console.log('line \'' + id + '\' - angle: ' + angle + ' angle2: ' + angle2 + ' slope: ' + slope);
    */

    return lineElement;
};

// get the SVG path for the arrow (start where point is, draw top, to bottom, to where point is
Grid.Model.Line.prototype._getArrowPath = function(x, y)
{
	var size = 6;
	return 'M' + x + ' ' + y + ' L' + (x - size) + ' ' + (y - size) + ' M' + (x - size) + ' ' + (y + size) + ' L' + x + ' ' + y;
};

Grid.Model.Line.prototype._createArrowElement = function(view, id, x, y, angle)
{
    var path = this._getArrowPath(x, y);

    var arrowElement = view.createElement('path', {
        'id': id,
        'd': path,
        'transform': 'rotate(' + angle + ', ' + x + ', ' + y + ')'
    });

    // set arrow styles
    var lineStyles = this.getStyles();
    var arrowStyles = this.getArrowStyles();
    YAHOO.lang.augmentObject(arrowStyles, lineStyles, false); // <-- merge any missing arrow styles from line styles
    view.setAttributes(arrowElement, arrowStyles);

    // add arrow to dom
    view.appendChild('arrows', arrowElement);

    return arrowElement;
};

Grid.Model.Line.prototype.moveElement = function(view)
{
    var id = this.getID();
    var lineInfo = this.getInfo();

	var lineElement = view.getElementById(id);
	if (!lineElement) throw new Error('Cannot move the line ' + id + ' because it does not exist');

	// move line
    view.setAttributes(lineElement, {
		'x1': lineInfo.x1,
		'y1': lineInfo.y1,
		'x2': lineInfo.x2,
		'y2': lineInfo.y2
    });
    
    // move arrows
    if (this.dirType == 'forward' || this.dirType == 'both')
    {
        this._updateArrowElement(view, id + '_arrow1', lineInfo.x2, lineInfo.y2, lineInfo.angle);
    }

    if (this.dirType == 'both')
    {
         this._updateArrowElement(view, id + '_arrow2', lineInfo.x1, lineInfo.y1, (lineInfo.angle - 180));
    }
};

Grid.Model.Line.prototype._updateArrowElement = function(view, id, x, y, angle)
{
    var arrowElement = view.getElementById(id);
    if (!arrowElement) throw new Error('Cannot move the arrow ' + id + ' because it does not exist');

    var path = this._getArrowPath(x, y);

    // move arrow
    view.setAttributes(arrowElement, {
        'd': path,
        'transform': 'rotate(' + angle + ', ' + x + ', ' + y + ')'
    });
};

Grid.Model.Line.prototype.removeElement = function(view)
{
    var id = this.getID();

    // call base
    Grid.Model.Line.superclass.removeElement.call(this, view);

    // remove arrows
    if (this.dirType == 'forward' || this.dirType == 'both') view.removeElement(id + '_arrow1');
    if (this.dirType == 'both') view.removeElement(id + '_arrow2');
};

/******************************************************************************************/
/* LINE VIEW */

Grid.Model.Line.prototype.getElementGroup = function() { return 'lines'; };

Grid.Model.Line.prototype.createElement = function(view)
{
    var id = this.getID();
    var lineInfo = this.getInfo();

    // create line
    var lineElement = view.createElement('line', {
        'id': id,
        'x1': lineInfo.x1,
        'y1': lineInfo.y1,
        'x2': lineInfo.x2,
        'y2': lineInfo.y2
    });

    // add line
    this.appendElement(view, lineElement);

    // create arrows
    if (this.dirType == 'forward' || this.dirType == 'both')
    {
        this._createArrowElement(view, id + '_arrow1', lineInfo.x2, lineInfo.y2, lineInfo.angle);
    }

    if (this.dirType == 'both')
    {
         this._createArrowElement(view, id + '_arrow2', lineInfo.x1, lineInfo.y1, (lineInfo.angle - 180));
    }
    
    /*
    var angle = entity.getAngle();
    var angle2 = entity.getAngle2();
    var slope = entity.getSlope();
    console.log('line \'' + id + '\' - angle: ' + angle + ' angle2: ' + angle2 + ' slope: ' + slope);
    */

    return lineElement;
};

// get the SVG path for the arrow (start where point is, draw top, to bottom, to where point is
Grid.Model.Line.prototype._getArrowPath = function(x, y)
{
	var size = 6;
	return 'M' + x + ' ' + y + ' L' + (x - size) + ' ' + (y - size) + ' M' + (x - size) + ' ' + (y + size) + ' L' + x + ' ' + y;
};

Grid.Model.Line.prototype._createArrowElement = function(view, id, x, y, angle)
{
    var path = this._getArrowPath(x, y);

    var arrowElement = view.createElement('path', {
        'id': id,
        'd': path,
        'transform': 'rotate(' + angle + ', ' + x + ', ' + y + ')'
    });

    // set arrow styles
    var lineStyles = this.getStyles();
    var arrowStyles = this.getArrowStyles();
    YAHOO.lang.augmentObject(arrowStyles, lineStyles, false); // <-- merge any missing arrow styles from line styles
    view.setAttributes(arrowElement, arrowStyles);

    // add arrow to dom
    view.appendChild('arrows', arrowElement);

    return arrowElement;
};

Grid.Model.Line.prototype.moveElement = function(view)
{
    var id = this.getID();
    var lineInfo = this.getInfo();

	var lineElement = view.getElementById(id);
	if (!lineElement) throw new Error('Cannot move the line ' + id + ' because it does not exist');

	// move line
    view.setAttributes(lineElement, {
		'x1': lineInfo.x1,
		'y1': lineInfo.y1,
		'x2': lineInfo.x2,
		'y2': lineInfo.y2
    });
    
    // move arrows
    if (this.dirType == 'forward' || this.dirType == 'both')
    {
        this._updateArrowElement(view, id + '_arrow1', lineInfo.x2, lineInfo.y2, lineInfo.angle);
    }

    if (this.dirType == 'both')
    {
         this._updateArrowElement(view, id + '_arrow2', lineInfo.x1, lineInfo.y1, (lineInfo.angle - 180));
    }
};

Grid.Model.Line.prototype._updateArrowElement = function(view, id, x, y, angle)
{
    var arrowElement = view.getElementById(id);
    if (!arrowElement) throw new Error('Cannot move the arrow ' + id + ' because it does not exist');

    var path = this._getArrowPath(x, y);

    // move arrow
    view.setAttributes(arrowElement, {
        'd': path,
        'transform': 'rotate(' + angle + ', ' + x + ', ' + y + ')'
    });
};

Grid.Model.Line.prototype.removeElement = function(view)
{
    var id = this.getID();

    // call base
    Grid.Model.Line.superclass.removeElement.call(this, view);

    // remove arrows
    if (this.dirType == 'forward' || this.dirType == 'both') view.removeElement(id + '_arrow1');
    if (this.dirType == 'both') view.removeElement(id + '_arrow2');
};