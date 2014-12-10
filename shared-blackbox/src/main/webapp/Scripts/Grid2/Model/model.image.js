/* IMAGE CLASS */

Grid.Model.Image = function(model, name, x, y, width, height)
{
	Grid.Model.Image.superclass.constructor.call(this, model, x, y, width, height);
	this.name = name;
    
    // set default behavior
    this.setHoverable(false);
    this.setFocusable(Grid.Model.Focusable.Manual);
    this.setMoveable(true);
    this.setSelectable(false);
};

// inherit from rectangle
Lang.extend(Grid.Model.Image, Grid.Model.Rectangle);

// get the bounding rect coordinates
Grid.Model.Image.prototype.getBoundingRect = function(x, y)
{
    if (!YAHOO.lang.isNumber(x)) x = this.x;
    if (!YAHOO.lang.isNumber(y)) y = this.y;

    // get bounding rect
    var topLeftX = (x - Math.round(this.width / 2));
    var topLeftY = (y - this.height);
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

// get fixed coords (based on bottom/middle xy) and check if existing image in same place
Grid.Model.Image.prototype.getFixedCoords = function(moveX, moveY)
{
    // get bounding rect
    var rect = this.getBoundingRect(moveX, moveY);

    // get canvas info
    var canvasWidth = this.model.options.canvasWidth;
    var canvasHeight = this.model.options.canvasHeight;

    // fix any out of bounds coordinates to be within bounds
    if (rect.left < 0) moveX = Math.round(this.width / 2);
    if (rect.top < 0) moveY = this.height;
    if (rect.right > canvasWidth) moveX = (canvasWidth - Math.round(this.width / 2));
    if (rect.bottom > canvasHeight) moveY = canvasHeight;

    // check if image is stacked on another image
    var tolerance = 4;
    var rec = this.otherImageInSamePlace(moveX, moveY, tolerance);

    while (rec != null)
    {
        moveX = rec.x + tolerance;
        moveY = rec.y + tolerance;
        rec = this.otherImageInSamePlace(moveX, moveY, tolerance);
    }

    return { x: moveX, y: moveY };
};

// get the palette image associated to this canvas image
Grid.Model.Image.prototype.getPaletteImage = function()
{
    var paletteImages = this.model.getPaletteImages();

    for (var i = 0; i < paletteImages.length; i++)
    {
        var paletteImage = paletteImages[i];
        if (paletteImage.name == this.name) return paletteImage;
    }

    return null;
};

/**
 * find images that might be obscured by this image. That is those that are the same or nearly the same size
 * at nearly the same location
 * @param thisRec - the record that might do the obscuring
 * @param locx - location x coordinate
 * @param locy - location y coordinate
 * @param tolerance - locations within this distance are considered nearly the same
 * @return
 */
Grid.Model.Image.prototype.otherImageInSamePlace = function(realX, realY, tolerance)
{
    // NOTE: This code is taking from the java applet (ImageDB.java - line 254)
    var p = new Point2D(realX, realY);
    var size = this.getSize();
    
    // get all images to look through
    var images = this.model.getImages();
    
    for(var i = 0; i < images.length; i++)
    {
        var rec = images[i];
        if (rec == this) continue;
        
        var distance = rec.get2D().distanceFrom(p);
        
        if (distance < tolerance)
        {
            var sizeDif = Math.abs(rec.getSize() - size);
            if (sizeDif < (.15 * size)) return rec;
        }        
    }
    
    return null;
};

// NOTE: This does not seem to be used anywhere..
/*Grid.Model.Image.prototype.getBottomMiddle = function()
{
	return {
	    x: this.x + Math.round(this.width / 2),
	    y: this.y + this.height
	};
};*/

Grid.Model.Image.prototype.getStyles = function()
{
    return null; // images don't have styles
};

Grid.Model.Image.prototype.getBorderStyles = function()
{
    return {
        'stroke': 'blue',
        'stroke-width': '2',
        'fill': 'none'
    };
};

Grid.Model.Image.prototype.toString = function() { return this.name; };

/******************************************************************************************/
/* IMAGE VIEW */

Grid.Model.Image.prototype.getElementGroup = function() { return 'images'; };

Grid.Model.Image.prototype.createElement = function(view)
{
    var id = this.getID();

    var imageElement = view.createElement('image', {
	    'id': id,
	    'transform': 'translate(-0.5, -0.5)'
	});

    // set url
    var paletteImage = this.getPaletteImage();
    imageElement.setAttributeNS(XLINK_NS, 'xlink:href', paletteImage.url);

    // add element to dom
    this.appendElement(view, imageElement);

    return imageElement;
};

Grid.Model.Image.prototype.moveElement = function(view)
{
    // move image
    Grid.Model.Image.superclass.moveElement.call(this, view);
    
    // update border position when moving
    if (this.isFocused()) this._updateBorderElement(view);
};

Grid.Model.Image.prototype.updateElement = function(view)
{
    Grid.Model.Image.superclass.updateElement.call(this, view);

    if (this.isFocused()) this._updateBorderElement(view);
    else this._removeBorderElement(view);
};

Grid.Model.Image.prototype.removeElement = function(view)
{
    // remove border
    if (this.isFocused()) this._removeBorderElement(view);

    // call base
    Grid.Model.Image.superclass.removeElement.call(this, view);
};

// style a canvas image to look selected
Grid.Model.Image.prototype._updateBorderElement = function(view)
{
    var id = this.getID();
    var imageElement = view.getElementById(id);

    // get bounding rect
    var rect = this.getBoundingRect();

    var borderID = imageElement.id + '_border';
    var borderElement = view.getElementById(borderID);

    // check if image border exists
    if (borderElement == null)
    {
        // create image border
        borderElement = view.createElement('rect', { 'id': borderID });

        // set border styles
        var borderStyles = this.getBorderStyles();
        view.setAttributes(borderElement, borderStyles);

        // add border to DOM
        view.appendChild('imageborders', borderElement);
    }

    // update border
    view.setAttributes(borderElement,
	{
	    'x': rect.left - 2,
	    'y': rect.top - 2,
	    'width': rect.width + 4,
	    'height': rect.height + 4
	});
};

Grid.Model.Image.prototype._removeBorderElement = function(view)
{
    var id = this.getID();
	view.removeElement(id + '_border');
};
