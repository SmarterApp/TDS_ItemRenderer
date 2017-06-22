//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
/* LABEL CLASS */

Grid.Model.Label = function(model, x, y, text, fontSize, fontFamily)
{
    Grid.Model.Label.superclass.constructor.call(this, model, x, y);
    this.text = text;
    this.fontSize = fontSize || '12';
    this.fontFamily = fontFamily || 'Arial';
};

Lang.extend(Grid.Model.Label, Grid.Model.Position);

Grid.Model.Label.prototype.getStyles = function()
{
    return {
        "font-size": this.fontSize,
        "font-family": this.fontFamily,
        "fill": "black"
   };
};

/******************************************************************************************/
/* LABEL VIEW */

Grid.Model.Label.prototype.getElementGroup = function() { return 'labels'; };

Grid.Model.Label.prototype.createElement = function(view)
{
    var id = this.getID();

    // create text element
    var label = view.createElement('text', {
        'id': id,
        'x': this.x,
        'y': this.y
    });

    this.appendElement(view, label);
};

Grid.Model.Label.prototype.updateElement = function(view)
{
    var labelElement = this.getElement(view);

    // set text
    view.setText(labelElement.id, this.text);
    
    // call base
    Grid.Model.Label.superclass.updateElement.call(this, view);
};