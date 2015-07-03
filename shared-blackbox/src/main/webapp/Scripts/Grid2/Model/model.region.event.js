//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
/* EVENT CLASS */

Grid.Model.RegionEvent = function(region, name)
{
    this.region = region;
    this.name = name;
    this._image = null;
    this._label = null;

    // set empty styles
    this._styles = Grid.Model.getEmptyStyles();
};

// get shape style
Grid.Model.RegionEvent.prototype.getStyles = function() { return this._styles; };

// set style
Grid.Model.RegionEvent.prototype.setStyles = function(newStyles)
{
    YAHOO.lang.augmentObject(this._styles, newStyles, true);
};

// get all entities assigned to this event
Grid.Model.RegionEvent.prototype.getEntities = function()
{
    var entities = [];
    if (this._image != null) entities.push(this._image);
    if (this._label != null) entities.push(this._label);
    return entities;
};

Grid.Model.RegionEvent.prototype.getImage = function() { return this._image; };

Grid.Model.RegionEvent.prototype.setImage = function(url, x, y, width, height)
{
    if (this._image != null) this.deleteImage();
    this._image = this.region.model.addStaticImage(url, x, y, width, height);
    this._image.hide();
};

Grid.Model.RegionEvent.prototype.deleteImage = function()
{
    if (this._image == null) return false;
    this.region.model.deleteStaticImage(this._image);
    this._image = null;
    return true;
};

Grid.Model.RegionEvent.prototype.getLabel = function() { return this._label; };

Grid.Model.RegionEvent.prototype.setLabel = function(x, y, text)
{
    if (this._label != null) this.deleteLabel();
    this._label = this.region.model.addLabel(x, y, text);
    this._label.hide();
};

Grid.Model.RegionEvent.prototype.deleteLabel = function()
{
    if (this._label == null) return false;
    this.region.model.deleteEntity(this._label);
    this._label = null;
    return true;
};

// BUG 61679,61266,61413,67446,61607: Using Chrome 18 or Safari (Android) grid hotspots shows white borders on regions.
(function()
{
    // don't apply this fix on Firefox
    if (YAHOO.env.ua.gecko > 0) return;

    Grid.Model.getEmptyStyles = function()
    {
        return {
           'fill': 'white',
           'fill-opacity': '0',
           'stroke': 'white',
           'stroke-width': '0',
           'stroke-opacity': '0', // <-- required
           'stroke-dasharray': ''
        };
    };

    Grid.Model.getDefaultStyles = function()
    {
        return {
           'fill': 'white',
           'fill-opacity': '0',
           'stroke': 'red',
           'stroke-width': '1',
           'stroke-opacity': '1', // <-- required
           'stroke-dasharray': ''
       };
    };

    var fixStyles = function(styles)
    {
        // check of opacity is empty
        if (styles['stroke-opacity'] == null || 
            styles['stroke-opacity'] == '')
        {
            var strokeWidth = parseInt(styles['stroke-width']);
            if (strokeWidth > 0) styles['stroke-opacity'] = '1';
            else if (strokeWidth === 0) styles['stroke-opacity'] = '0';
        }
    };
    
    Grid.Model.RegionEvent.prototype.setStyles = function(newStyles)
    {
        YAHOO.lang.augmentObject(this._styles, newStyles, true);
        fixStyles(this._styles); // <-- fix imported styles
    };

})();