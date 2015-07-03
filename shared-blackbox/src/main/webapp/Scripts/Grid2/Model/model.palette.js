//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
/* CLASS: Palette Image */

Grid.Model.PaletteImage = function(model, name, url, width, height)
{
	Grid.Model.PaletteImage.superclass.constructor.call(this, model);
	this.name = name;
	this.url = url;
	this.width = width || 0;
	this.height = height || 0;
	this.loaded = false; // is the image loaded?
};

Lang.extend(Grid.Model.PaletteImage, Grid.Model.Base);

// get all the canvas images associated to this palette image
Grid.Model.PaletteImage.prototype.getImages = function()
{
	var paletteCanvasImages = [];
	var images = this.model.getImages();
	
	for(var i = 0; i < images.length; i++)
	{
		var image = images[i];
		
		if (image.name == this.name)
		{
			paletteCanvasImages.push(image);
		}
	}
	
	return paletteCanvasImages;
};

Grid.Model.PaletteImage.prototype.toString = function() { return this.name; };
