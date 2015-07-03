//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
// MODE: DELETE POINT AND IMAGE
Grid.Action.Delete = function(grid)
{
    Grid.Action.Delete.superclass.constructor.call(this, grid);
    this.deletedPoint = null;
};

YAHOO.lang.extend(Grid.Action.Delete, Grid.Action.Base);

Grid.Action.Delete.prototype.onMouseEvent = function(evt) 
{
	// delete when you click on something and then release mouse
	if (evt.name == 'mouseup')
	{
		var selected = this.canvas.getFocused();
		
		if (selected)
		{
			var type = selected.getType();

			switch(type)
			{
				case 'point': this.model.deletePoint(selected); break;
				case 'canvasimage': this.model.deleteImage(selected); break;
				case 'circle': this.model.deleteEntity(selected); break;
			}

			this.finalize();
		}
		else
		{
			// check if someone clicked on a line directly
			var targetEntity = this.model.getEntity(evt.target.id);
			if (targetEntity && targetEntity.getType() == 'line') {
			    this.model.deleteLine(targetEntity);
			} else if (evt.touch) {
                // check if someone touched near a line
			    var closestLine = this.canvas.getNearestLineFromEvent(evt);
                if (closestLine) {
                    this.model.deleteLine(closestLine);
                }
			}

		}
	}

	if (evt.name == 'mouseup' || evt.name == 'dragend') this.finalize();
};

Grid.Action.Delete.prototype.onKeyEvent = function(evt)
{
    var selected = this.canvas.getFocused();

    if (selected)
    {
        var type = selected.getType();

        switch (type)
        {
            case 'point': this.model.deletePoint(selected); break;
            case 'canvasimage': this.model.deleteImage(selected); break;
        }

        this.finalize();
    }
};

