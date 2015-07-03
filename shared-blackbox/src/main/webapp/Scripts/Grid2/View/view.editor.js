//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
/*
Contains all the grid tool SVG rendering code.
*/

/* CR Tool */

Grid.View.prototype.createSnapToPointAndCircle = function(x, y, r, id) //id is needed for multiple snapPoints
{
	var center = this.createElement("circle", {
		"id": 'snapPointCenter_' + id,
		"cx": x,
		"cy": y,
		"r": 4
	});
	this.appendChild('crtool_snapcenter', center);

	var circle = this.createElement("circle", {
		"id": 'snapPointCircle_' + id,
		"cx": x,
		"cy": y,
		"r": r
	});
	this.appendChild('crtool_snapcircle', circle);
};

Grid.View.prototype.createCRToolCircle = function(x, y, r)
{

    var container = 'crtool_circle';
    var centerId = 'crToolCircleCenter';
    var circleId = 'crToolCircle';

	var center = this.createElement("circle", {
		"id": centerId,
		"cx": x,
		"cy": y,
		"r": 4
	});
	this.appendChild(container, center);

	var circle = this.createElement("circle", {
		"id": circleId,
		"cx": x,
		"cy": y,
		"r": r
	});
	this.appendChild(container, circle);
};

Grid.View.prototype.createCRToolRectangle = function(x1,y1,x2,y2)
{
    var container = 'crtool_rectangle';
    
    var rect = this.createElement("rect", {
		"id": 'crToolRectangle',
		"x": x1,
		"y": y1,
		"width": x2-x1,
		"height": y2-y1
	});
	
	this.appendChild(container, rect);    
};

// a dotted line used for helping
Grid.View.prototype.updateHelperLine = function(id, x1, y1, x2, y2)
{
    var mergeLine = this.getElementById(id);

    if (!mergeLine)
    {
        // create element
        mergeLine = this.createElement('line', {
            'id': id,
            'fill': 'none',
            'stroke': 'green',
            'stroke-width': '1',
            'opacity': '0.7',
            'stroke-dasharray': '3, 3'
        });

        this.appendChild('mergeLines', mergeLine);
    }

    this.setAttributes(mergeLine, 
    {
        'x1': x1,
        'y1': y1,
        'x2': x2,
        'y2': y2
    });
};