//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
/* PATH CLASS */

// represents a complex path
// TODO: http://www.kevlindev.com/dom/path_parser/index.htm
Grid.Model.Path = function(model, pathData)
{
	Grid.Model.Path.superclass.constructor.call(this, model);
	this.pathData = pathData;
    this._focusable = Grid.Model.Focusable.Manual;
};

Lang.extend(Grid.Model.Path, Grid.Model.Base);

/******************************************************************************************/
/* PATH VIEW */

Grid.Model.Path.prototype.createElement = function(view)
{
    var id = this.getID();

    // create element
    var polyElement = view.createElement('path', { 'id': id });
    this.appendElement(view, polyElement);

    // set data path
    this.updateElement(view);

    return polyElement;
};

Grid.Model.Path.prototype.updateElement = function(view)
{
    var polyElement = this.getElement(view);
    view.setAttributes(polyElement, { 'd': this.pathData });

    Grid.Model.Path.superclass.updateElement.call(this, view);
};
