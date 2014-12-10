/* POSITION CLASS */

Grid.Model.Position = function(model, x, y)
{
    Grid.Model.Position.superclass.constructor.call(this, model);
    this.x = x;
    this.y = y;

    this._boundsEnabled = true;
    this._snapEnabled = true;
};

Lang.extend(Grid.Model.Position, Grid.Model.Base);

// get a Point2D object for use with 2D.js library
Grid.Model.Position.prototype.get2D = function() { return new Point2D(this.x, this.y); };

// if this is true then keep the entity within the bounds of the canvas
Grid.Model.Position.prototype.isBoundsEnabled = function() { return this._boundsEnabled; };
Grid.Model.Position.prototype.setBoundsEnabled = function(boundsEnabled) { this._boundsEnabled = boundsEnabled; };

// if this is true then snap the x,y to the canvas grid lines
Grid.Model.Position.prototype.isSnapEnabled = function() { return this._snapEnabled; };
Grid.Model.Position.prototype.setSnapEnabled = function(snapEnabled) { this._snapEnabled = snapEnabled; };

// manually set position (not used)
/*Grid.Model.Position.prototype.setXY = function(x, y)
{
    // set changes
    this.x = x;
    this.y = y;

    this.model.fireLazy('onMove', this);
};*/

// check if object is out of bounds of the grid and fix coordinates if needed
Grid.Model.Position.prototype.getFixedCoords = function(x, y)
{
    return { x: x, y: y };
};

// Set the XY and throw an event.
// Pass in true for preventSnap to stop grid snapping from occuring.
Grid.Model.Position.prototype.moveTo = function(moveX, moveY, preventSnap /*optional*/)
{
    // fix object if out of bounds
    if (this.isBoundsEnabled())
    {
        var fixedCoords = this.getFixedCoords(moveX, moveY);
        moveX = fixedCoords.x;
        moveY = fixedCoords.y;
    }

    // check if anything has changed
    if (moveX == this.x && moveY == this.y) return false;

    this.x = moveX;
    this.y = moveY;

    // check if we should perform snap to grid for this move
    if (this.isSnapEnabled() && !preventSnap) this.snapToGrid();

    this.model.fireLazy('onMove', this);

    return true;
};

Grid.Model.Position.prototype._moveBy = function(moveSize)
{
    var options = this.model.options;

    // if grid snapping is enabled then move by the grid spacing
    if (options.snapToGrid && options.gridSpacing > 0)
    {
        return options.gridSpacing;
    }
    
    return moveSize;
};
	
Grid.Model.Position.prototype.moveLeft = function(moveSize)
{
    return this.moveTo(this.x - this._moveBy(moveSize), this.y);
};

Grid.Model.Position.prototype.moveUp = function(moveSize)
{
    return this.moveTo(this.x, this.y - this._moveBy(moveSize));
};

Grid.Model.Position.prototype.moveRight = function(moveSize)
{
    return this.moveTo(this.x + this._moveBy(moveSize), this.y);
};

Grid.Model.Position.prototype.moveDown = function(moveSize)
{
    return this.moveTo(this.x, this.y + this._moveBy(moveSize));
};

// get the distance from this position to another
Grid.Model.Position.prototype.distanceFrom = function(that)
{
    var p1 = this.get2D(),
        p2 = that.get2D();
    
    return p1.distanceFrom(p2);
};

// get the closest snap point that this position intersects with
Grid.Model.Position.prototype._getNearestSnapPoint = function()
{
	var snapPoints = this.model.getSnapPoints();
    
    var closestSnapPoint = null;
    var closestDistance = +Infinity;
    
	for(var i = 0; i < snapPoints.length; i++)
	{
		var snapPoint = snapPoints[i];
		
		// get the distance from this point to the snap point
		var distance = this.distanceFrom(snapPoint);
		
		// see if this point is within the snap radius and if it is then see if 
		// it is closer than any previous snap point we have found
		if (distance <= snapPoint.snapRadius && distance < closestDistance)
		{
		    closestDistance = distance;
		    closestSnapPoint = snapPoint;		    
		}
	}
	
	return closestSnapPoint;
};

// Snap to snap point.
Grid.Model.Position.prototype.snapToPoint = function()
{
    var snapPoint = this._getNearestSnapPoint();

    if (snapPoint != null)
    {
        // move to the nearest snap point
        return this.moveTo(snapPoint.x, snapPoint.y, true);
    }

    return false;
};

// Snap to grid.
// SCORING NOTE: When snapping to the grid with an image you need to use the top/left corner. However
// the image position is stored using the bottom/middle. So to get the left most side we divide the width 
// by two and then subract that from the current x. Dividing the width though could leave you with a fractional
// x coordinate and this will get rounded since drawing an SVG image on a fractional coordinate can render an 
// image blurry. This means during rounding the actual left of the image might be a pixel off. I had some concerns
// that this would cause issues in the scoring engine but I spoke to Xiaohui and he had similar issues. He said that 
// in the scoring engine if a point is near a snap point within a certain tollerance then the scoring engine fixes 
// this to be in the snap point. I explained this scenerio and he said I would be ok.
Grid.Model.Position.prototype.snapToGrid = function()
{
    var spacing = 1; // default spacing even if snapping is off
    var options = this.model.options;

    if (options.snapToGrid && options.gridSpacing > 0)
    {
        spacing = options.gridSpacing;
    }

    // start with X/Y as provided
    var fixedX = this.x;
    var fixedY = this.y;

    // HACK: set X/Y to top/left for images
    if (this instanceof Grid.Model.Image)
    {
        fixedX = (fixedX - Math.round(this.width / 2)); // NOTE: JAVA floored this value
        fixedY = (fixedY - this.height);
    }

    // perform grid snapping
    var snappedX = Math.round(fixedX / spacing) * spacing;
    var snappedY = Math.round(fixedY / spacing) * spacing;

    // HACK: set X/Y back to bottom/middle
    if (this instanceof Grid.Model.Image)
    {
        snappedX = (snappedX + Math.round(this.width / 2)); // NOTE: JAVA floored this value
        snappedY = (snappedY + this.height);
    }

    // move to the snapped grid spacing
    return this.moveTo(snappedX, snappedY, true);
};

// snap to closest snap point and if none then the try the grid
Grid.Model.Position.prototype.snap = function () {
    if (!this.snapToPoint()) {
        this.snapToGrid();
    }
};

// Grid.Model.Position.prototype.toString = function() { this.x + ',' + this.y; };

/******************************************************************************************/
/* POSITION VIEW */

Grid.Model.Position.prototype.moveElement = function(view)
{
    var element = this.getElement(view);

    view.setAttributes(element,
	{
	    'x': this.x,
	    'y': this.y
	});
};