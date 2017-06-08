//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
/* STATIC IMAGE CLASS */

Grid.Model.StaticImage = function(model, url, x, y, width, height)
{
	Grid.Model.StaticImage.superclass.constructor.call(this, model, x, y, width, height);
	this.url = url;
    
    this.setHoverable(false);
    this.setFocusable(Grid.Model.Focusable.None);
    this.setMoveable(false);
    this.setSelectable(false);
};

Lang.extend(Grid.Model.StaticImage, Grid.Model.Rectangle);

Grid.Model.StaticImage.prototype.getStyles = function()
{
    return null; // images don't have styles
};

Grid.Model.BackgroundImage = function(model, url, x, y, width, height)
{
	Grid.Model.BackgroundImage.superclass.constructor.call(this, model, url, x, y, width, height);
};

Lang.extend(Grid.Model.BackgroundImage, Grid.Model.StaticImage);

/******************************************************************************************/
/* STATIC IMAGE VIEW */

Grid.Model.StaticImage.prototype.getElementGroup = function() { return 'staticimages'; };

Grid.Model.StaticImage.prototype.createElement = function(view)
{
    var id = this.getID();

    var element = view.createElement('image', {
        'id': id,
        'transform': 'translate(-0.5, -0.5)'
    });

    // set url
    element.setAttributeNS(XLINK_NS, 'xlink:href', this.url);

    // add element to dom
    this.appendElement(view, element);
    
    return element;
};