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