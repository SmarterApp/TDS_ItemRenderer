//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
/* SNAPPOINT CLASS */

Grid.Model.SnapPoint = function(model, x, y, radius, snapRadius)
{
    Grid.Model.SnapPoint.superclass.constructor.call(this, model, x, y, radius);
    this.snapRadius = snapRadius;
    
    // set default behavior
    this.setHoverable(false);
    this.setFocusable(Grid.Model.Focusable.Never);
    this.setMoveable(false);
    this.setSelectable(false);
    this.setVisible(false);
};

Lang.extend(Grid.Model.SnapPoint, Grid.Model.Circle);

// get all snap points
Grid.Model.SnapPoint.prototype.getList = function()
{
    return this.model.getSnapPoints();
};

Grid.Model.SnapPoint.prototype.getStyles = function()
{
    // style="fill:none;stroke:blue;stroke-width:1;opacity:0.5;stroke-dasharray: 2, 5;"
    return Grid.Model.getEmptyStyles();
}