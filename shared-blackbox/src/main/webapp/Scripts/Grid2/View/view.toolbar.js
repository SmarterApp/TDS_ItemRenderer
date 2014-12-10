/*
Contains some of the SVG code for the toolbar area.
*/

Grid.View.prototype.showToolbar = function() {
    this.setAttributes('groupToolbar', { 'display': 'inline' });
};

Grid.View.prototype.hideToolbar = function() {
    this.setAttributes('groupToolbar', { 'display': 'none' });
};
