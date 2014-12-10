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