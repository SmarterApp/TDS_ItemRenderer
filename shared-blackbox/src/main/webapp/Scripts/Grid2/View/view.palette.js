/*
Contains all the SVG code for the palette area.
*/

Grid.View.prototype._updatePaletteImgIndex = function(panup)
{
    if (panup)
    {
        this.paletteImgIndex--;
    }
    else this.paletteImgIndex++;
    this._updatePalettePaning();
};

Grid.View.prototype._getPaletteContainerWidth = function()
{
    var paletteContainer = this.getElementById('backgroundPalette');
    var paletteContainerXY = Grid.Utils.parseElementXY(paletteContainer);
    return paletteContainerXY.width;
};

Grid.View.prototype.updateCenterScaleImage = function(paletteCenter, paletteScale)
{
    this.paletteCenter = paletteCenter;
    this.paletteScale = paletteScale;
    this._updatePaletteLayout();
};

// this function will organize the current palette images based on height
Grid.View.prototype._updatePaletteLayout = function()
{
	var paletteContainer = this.getElementById('backgroundPalette');
	var paletteContainerXY = Grid.Utils.parseElementXY(paletteContainer);
	var paletteImages = this.getElementById('paletteImages').childNodes;
    var paletteWidth = paletteContainerXY.width;
    var x = 2;

	var spacing = this.getPaletteSpacing();

	var y = spacing;
		
	for(var i = 0; i < paletteImages.length; i++)
	{
		var paletteImage = paletteImages[i];
		var imageXY = Grid.Utils.parseElementXY(paletteImage);
        
        // check if we should center image
        if (this.paletteCenter) 
        {
            //calculation x to center image
            if ((paletteWidth - imageXY.width) >= 0)
                x = (paletteWidth - imageXY.width)/2;
            else {
                if (this.paletteScale) x = 0; //we will scale image to fit palette container
                else x = (paletteWidth - imageXY.width)/2;
            }
        } 
        
        // set location
		this.setAttributes(paletteImage, {
			'x': x,
			'y': y
		}, 0);

        // set image scale based on current palette width
        paletteImage.scale = paletteWidth / imageXY.width;
		
        // check if we should scale image to fit palette
		if (this.paletteScale && paletteImage.scale < 1.0) {

            paletteImage.scaled = true;

            var transform = 'matrix(' + paletteImage.scale + ',0,0,' + paletteImage.scale + ',0,' + y * (1 - paletteImage.scale) + ')';
            paletteImage.setAttribute('transform', transform);

    	} else if (paletteImage.scaled) {

    	    // the image was previously scaled we need to reset it
    	    paletteImage.scaled = false;
            var transform = 'matrix(1,0,0,1,0,0)';
            paletteImage.setAttribute('transform', transform);
    	}
    	
		// set the starting position for the next image
	    // var imageXY = Grid.Utils.parseElementXY(paletteImage);
		if (this.paletteScale) {
		    y = y + imageXY.height * paletteImage.scale + spacing;
		} else {
			y = y + imageXY.height + spacing;
		} 
	}
	
	this._updatePalettePaning();

};

// this function will organize the current palette images based on height
/*Grid.View.prototype._updatePaletteLayout_OLD = function()
{
	var paletteContainer = this.getElementById('backgroundPalette');
	var paletteContainerXY = Grid.Utils.parseElementXY(paletteContainer);
	var paletteImages = this.getElementById('paletteImages').childNodes;

	var spacing = 3;
	var x = 2;
	var y = spacing;
		
	for(var i = 0; i < paletteImages.length; i++)
	{
		var paletteImage = paletteImages[i];
		
		this.setAttributes(paletteImage, {
			'x': x,
			'y': y
		}, 0);
		
		// set the starting position for the next image
		var imageXY = Grid.Utils.parseElementXY(paletteImage);
		y = y + imageXY.height + spacing;				
	}
};*/

Grid.View.prototype._updatePalettePaning = function()
{
    var panYoffset = this.getPalettePanOffset();

    //paning
    this.setAttributes(this.getElementById('paletteImages'),
    {
        'transform': 'translate(0, ' + (0 - panYoffset) + ')'
    }, 0);

    //set clip region
    this.setAttributes(this.getElementById('palettecliprect'),
    {
        'x': 0,
        'y': this.getPaletteClipOffset(panYoffset),
        'height': this.getPaletteClipHeight()
    }, 0);
};

Grid.View.prototype.getPaletteClipOffset = function(panYoffset)
{
    var topClipAdjust = this.getPalettePanHeight();
    if (panYoffset == 0) topClipAdjust = 0;
    return (panYoffset + topClipAdjust);

};

// calculate pan offset, how much we have to pan up
// the button could
Grid.View.prototype.getPalettePanOffset = function()
{
	var paletteContainer = this.getElementById('backgroundPalette');
	var paletteContainerXY = Grid.Utils.parseElementXY(paletteContainer);
	var paletteImages = this.getElementById('paletteImages').childNodes;
    
    var panYoffset = 0; //starting with 0
    
    if (this.paletteImgIndex > 0) {
        //this means we've paned image and we need to show panup button
        this.getElementById('panup').style.display = 'block';
        
        //one image always includes one spacing
        for (var i=0; i<this.paletteImgIndex; i++) {
	        var paletteImage = paletteImages[i];
	        var imageXY = Grid.Utils.parseElementXY(paletteImage);
	        if (this.paletteScale) 
                panYoffset += imageXY.height * paletteImage.scale + this.getPaletteSpacing();      
            else
                panYoffset += imageXY.height + this.getPaletteSpacing();  
        }
        //since we have panup button, we pan less of the button height
        panYoffset -=  this.getPalettePanHeight();
        
    } else {
        this.getElementById('panup').style.display = 'none';
    }
    
    return panYoffset;
};

Grid.View.prototype.getPaletteClipHeight = function()
{
    var paletteContainer = this.getElementById('backgroundPalette');
    var paletteContainerXY = Grid.Utils.parseElementXY(paletteContainer);
    var paletteImages = this.getElementById('paletteImages').childNodes;

    var availableHeight = paletteContainerXY.height;
    if (this.paletteImgIndex > 0) availableHeight -= this.getPalettePanHeight();

    var totalHeight = 0;

    //images start from ImgIndex
    for (var i = this.paletteImgIndex; i < paletteImages.length; i++)
    {
        var paletteImage = paletteImages[i];
        var scale = 1;
        if (this.paletteScale) scale = paletteImage.scale;
        // set the starting position for the next image
        var imageXY = Grid.Utils.parseElementXY(paletteImage);
        if (i == paletteImages.length - 1) totalHeight += imageXY.height * scale;
        else totalHeight += imageXY.height * scale + this.getPaletteSpacing();

        if (availableHeight < totalHeight)
        {
            availableHeight -= this.getPalettePanHeight();
            this.getElementById('pandown').style.display = 'block';
            var j = i;
            while (totalHeight > availableHeight)
            { //'remove' images from bottom until we have enough space
                var preimage = paletteImages[j--];
                var preXY = Grid.Utils.parseElementXY(preimage);
                var increase;
                if (this.paletteScale)
                    increase = preXY.height * preimage.scale + this.getPaletteSpacing();
                else
                    increase = preXY.height + this.getPaletteSpacing();

                totalHeight -= increase;
            }
            return totalHeight;
        }
    }
    this.getElementById('pandown').style.display = 'none';
    return availableHeight;
};

Grid.View.prototype.getPalettePanHeight = function()
{
    return 15;
};

Grid.View.prototype.getPaletteSpacing = function()
{
    return 3;
};

Grid.View.prototype.showPalette = function() {
    this.setAttributes('groupPalette', { 'display': 'inline' });
};

Grid.View.prototype.hidePalette = function() {
    this.setAttributes('groupPalette', { 'display': 'none' });
};

Grid.View.prototype.createPaletteImage = function(id, width, height, url)
{
	var paletteElement = this.createElement('image', {
		'id': id,
		'width': width,
		'height': height,
		'transform': 'translate(-0.5, -0.5)'
	});
	
	paletteElement.setAttributeNS(XLINK_NS, 'xlink:href', url);

    /*
    paletteElement.scale = 1.0;
    var paletteContainerWidth = this._getPaletteContainerWidth();

	if (width > paletteContainerWidth) {
	    paletteElement.scale = paletteContainerWidth / width;
	}
	
	paletteElement.scaled = false;
    */
		
	this.appendChild('paletteImages', paletteElement);
	this._updatePaletteLayout();
	
	return paletteElement;
};

// clone a palette image for dragging
Grid.View.prototype.clonePaletteImage = function(id, cloneID)
{
	var paletteElement = this.getElementById(id);
	var clonedElement = paletteElement.cloneNode(true);
	clonedElement.id = cloneID;

	this.appendChild('paletteDragging', clonedElement);

    //rescale cloned image
    if (paletteElement.scaled) {
        var x = paletteElement.getAttribute("x");
        var y = paletteElement.getAttribute("y");
        
        var s = "matrix(1,0,0,1,0,0)";
        clonedElement.setAttribute("transform", s);	
    }
	return clonedElement;
};

// call this when dragging the palette image
Grid.View.prototype.movePaletteImage = function(id, x, y)
{
	var clonedElement = this.getElementById(id);

	this.setAttributes(clonedElement,
    {
        'x': x,
        'y': y
    });
};

Grid.View.prototype.removePaletteImage = function(id)
{
	this.removeElement(id);
	this._updatePaletteLayout();
};

Grid.View.prototype.selectPaletteImage = function(paletteID)
{
    var paletteElement = this.getElementById(paletteID);
    var imageXY = Grid.Utils.parseElementXY(paletteElement);

    var selectedPalette = this.getElementById('selectedPalette'); // rect used for selection
    
    var height = imageXY.height + 4;
    if (this.paletteScale) height = imageXY.height * paletteElement.scale + 4;
    
    this.setAttributes(selectedPalette,
    {
		'x': 0, //imageXY.x,
		'y': imageXY.y - this.getPalettePanOffset(),
		'width': 75,
		'height': height //imageXY.height * paletteElement.scale + 4
    }, 0);
    
    selectedPalette.style.display = '';
};

/*Grid.View.prototype.selectPaletteImage_OLD = function(paletteID)
{
    var paletteElement = this.getElementById(paletteID);
    var imageXY = Grid.Utils.parseElementXY(paletteElement);

    var selectedPalette = this.getElementById('selectedPalette'); // rect used for selection

    this.setAttributes(selectedPalette,
    {
		'x': imageXY.x - 2,
		'y': imageXY.y - 2,
		'width': 75,
		'height': imageXY.height + 4
    }, 0);
    
    selectedPalette.style.display = '';
};*/

// remove selected style
Grid.View.prototype.deselectPaletteImage = function()
{
    var selectedPalette = this.getElementById('selectedPalette'); // rect used for selection
    selectedPalette.style.display = 'none';
};