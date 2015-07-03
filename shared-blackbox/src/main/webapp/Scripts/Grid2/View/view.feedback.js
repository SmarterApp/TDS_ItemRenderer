//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
/*
Contains all the SVG code for the feedback area.
*/


Grid.View.prototype.setFeedbackText = function(text)
{
    this.setText('feedback', text);
};

Grid.View.prototype.setCoordinatesText = function(text)
{
    this.setText('coordinates', text);
};

Grid.View.prototype.showFeedback = function() {
    this.setAttributes('groupFeedback', { 'display': 'inline' });
};

Grid.View.prototype.hideFeedback = function() {
    this.setAttributes('groupFeedback', { 'display': 'none' });
};