// MODE: MOVE POINT AND IMAGE
Grid.Action.Move = function(grid)
{
    Grid.Action.Move.superclass.constructor.call(this, grid);

    // point we are moving
    this.moveObject = null;
};

YAHOO.lang.extend(Grid.Action.Move, Grid.Action.Base);

Grid.Action.Move.prototype.dispose = function()
{
	if (this.moveObject instanceof Grid.Model.Point) this.canvas.finalizePoint(this.moveObject);
	else if (this.moveObject instanceof Grid.Model.Image) this.canvas.finalizeImage(this.moveObject);
};

Grid.Action.Move.prototype.onMouseEvent = function(evt)
{
    var focusedObject = this.canvas.getFocused();

    // clicked while moving
    if (evt.name == 'mousedown')
    {
        // finalize this action if we are already moving something, nothing is focused or object is not moveable
        if (this.moveObject || focusedObject == null || !focusedObject.isMoveable())
        {
            this.finalize();
        }
        else
        {
            this.moveObject = focusedObject;
            this.grid.setHint('DraggingObject');
        }
    }

    // check if we are moving anything
    if (this.moveObject == null) return;

    // check if we are dragging mouse
    if (evt.name == 'mousemove' || evt.name == 'drag')
    {
        var x = evt.currentPosition.x,
			y = evt.currentPosition.y;

        if (typeof this.moveObject.moveTo == 'function')
        {
            this.moveObject.moveTo(x, y);
        }
    }

    // on dragend end action
    if (evt.name == 'dragend')
    {
        this.finalize();
    }

    // for points finalize action when release mouse
    if (evt.name == 'mouseup' && focusedObject instanceof Grid.Model.Point)
    {
        this.finalize();
    }
};

Grid.Action.Move.prototype.onKeyEvent = function(evt)
{
    // check if we are currently moving an object
    if (this.moveObject != null)
    {
        // stop moving object..
        this.canvas.clearFocused();
        this.finalize();
    }
    else
    {
        // start moving object
        var focusedObject = this.canvas.getFocused();

        // check if we can move object
        if (focusedObject != null && focusedObject.isMoveable())
        {
            this.moveObject = focusedObject;
        }
        else
        {
            this.finalize();
        }
    }
};
