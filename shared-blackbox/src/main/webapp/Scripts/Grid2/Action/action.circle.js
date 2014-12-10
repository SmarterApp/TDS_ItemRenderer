// MODE: CREATE CIRCLE
Grid.Action.Circle = function(grid)
{
    Grid.Action.Circle.superclass.constructor.call(this, grid);
    this.createdCircle = null;
};

YAHOO.lang.extend(Grid.Action.Circle, Grid.Action.Base);
	
Grid.Action.Circle.prototype.create = function(x, y)
{
	var circle = this.model.createCircle(x, y, 10);
	this.model.addCircle(circle);
    return circle;
};

Grid.Action.Circle.prototype.dispose = function () {
    this.createdCircle.snap();
    this.createdCircle = null;
};

Grid.Action.Circle.prototype.onMouseEvent = function(evt) 
{
	var x = evt.currentPosition.x,
		y = evt.currentPosition.y;
	
	if (evt.name == 'mousedown')
	{
		var entity = this.model.getEntity(evt.target.id);
		
		if (entity && entity.getType() == 'circle')
		{
			this.createdCircle = entity;
		}
		else
		{
			this.createdCircle = this.create(x, y);
		}
		
		// check if point was created before continuing
		if (this.createdCircle == null) this.finalize();
	}
	
	if (evt.name == 'drag') {
	    var radius = evt.currentPosition.x - evt.clickedPosition.x;
		this.createdCircle.radius = (radius < 10) ? this.createdCircle.radius : radius;
	    this.createdCircle.update();
	}
	
	if (evt.name == 'mouseup' || evt.name == 'dragend')
	{
		this.finalize();
	}
};

Grid.Action.Circle.prototype.onKeyEvent = function(evt)
{
    // check if a point is created
    if (!this.createdPoint)
    {
        this.createdPoint = this.create(30, 30);
        this.createdPoint.snapToGrid();
    }
    else
    {
        this.finalize();
    }
};