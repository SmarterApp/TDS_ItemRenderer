//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
Grid.Canvas = function(grid)
{
    this.grid = grid;
    this.view = grid.view;
    this.model = grid.model;

    // currently hovered data object
    this._currentHover = null;

    // currently focused data object
    this._currentFocus = null;

    // current action
    this._currentAction = null;

    if (Grid.Utils.hasSVGWeb())
    {
        ErrorHandler.wrapFunctions(this,
        [
            'finalizePoint', 'finalizeLines', 'processMouseEvent', 'processKeyEvent', 'subscribeToModelEvents'
        ]);
    }

    this.init();
};

/* 
CANVAS EVENTS
onBeforeHover: Occurs right before an entity is going to get hovered over (you can cancel this)
onHover: Occurs when entity gets hovered over
onHoverOut: Occurs when hovering away from entity
onBeforeFocus: Occurs right before an entity is going to receive focus (you can cancel this)
onFocus: Occurs when entity recieves focus
onFocusOut: Occurs when focus leaves entity
onActionStart: Performing an action (e.x., move)
onActionEnd: Action finishes or is cancelled
*/
YAHOO.lang.augmentProto(Grid.Canvas, EventLazyProvider); // scope = Grid.Canvas

Grid.Canvas.prototype.init = function()
{
    var canvas = this;
    var view = this.view;

    var onEntityEvent = function(name, entity)
    {
        logger.debug('EVENT - {name} ({id})', { name: name, id: entity.getID() });
        entity.updateElement(view);
    };

    this.subscribe('onHover', function(entity) { onEntityEvent('onHover', entity); });
    this.subscribe('onHoverOut', function(entity) { onEntityEvent('onHoverOut', entity); });
    this.subscribe('onFocus', function(entity) { onEntityEvent('onFocus', entity); });
    this.subscribe('onFocusOut', function(entity) { onEntityEvent('onFocusOut', entity); });

    /*var onActionEvent = function(name, entity)
    {
    var mode = this.grid.getMode();
    logger.debug('ACTION - {name} ({mode})', { name: name, mode: mode });
    };

    this.subscribe('onActionStart', function(action) { onActionEvent('onActionStart', action); });
    this.subscribe('onActionEnd', function(action) { onActionEvent('onActionEnd', action); });*/

    // we determine if an entity gets selected once an action gets triggered on it when in move mode
    this.subscribe('onActionStart', function(action)
    {
        var mode = this.grid.getMode();

        // check if we are in move mode and something is focused
        var focusedEntity = canvas.getFocused();

        if (mode == 'move' && focusedEntity != null)
        {
            // NOTE: the entity might not be selectable but that is ok calling select() will get rejected
            if (focusedEntity.isSelected()) focusedEntity.deselect();
            else focusedEntity.select();
        }
    });

};

// get the current hovered object
Grid.Canvas.prototype.getHovering = function() { return this._currentHover; };

Grid.Canvas.prototype.clearHovering = function()
{
    // check if anything is selected
    if (this._currentHover == null) return false;

    var entity = this._currentHover;
    this._currentHover = null;
    entity.setHovering(false);
    this.fireLazy('onHoverOut', entity);

    // check for auto hover
    if (entity.isFocusable() === Grid.Model.Focusable.Auto) this.clearFocused(entity);
    
    return true;
};

Grid.Canvas.prototype.setHovering = function(entity)
{
    // check if already hovering
    if (this._currentHover == entity) return false;

    // clear current hover
    this.clearHovering();

    // check if exists
    if (entity == null) return false;

    // check if hoverable
    if (!entity.isHoverable()) return false;

    // check if we are performing an action (hovering is not allowed in this case)
    if (this.performingAction()) return false;

    var allowHover = this.fireLazy('onBeforeHover', entity);

    if (allowHover)
    {
        // set new hover
        this._currentHover = entity;
        entity.setHovering(true);
        this.fireLazy('onHover', entity);

        // if entity supports auto focus then set focus on hover
        if (entity.isFocusable() === Grid.Model.Focusable.Auto) this.setFocused(entity);
    }

    return allowHover;
};

// get the current focused object
Grid.Canvas.prototype.getFocused = function() { return this._currentFocus; };

// clear the currently focused object
// @entity This is optional and if provided then only will this entity be cleared if it is currently selected
Grid.Canvas.prototype.clearFocused = function(entity)
{
    // check if anything is selected
    if (this._currentFocus == null) return false;

    // check if a specific entity was requested for deselection and if it is currently selected
    if (entity != null && entity != this._currentFocus) return false;

    // clear focus
    entity = this._currentFocus;
    this._currentFocus = null;
    entity.setFocused(false);
    this.fireLazy('onFocusOut', entity);

    return true;
};

// set an object to be focused
Grid.Canvas.prototype.setFocused = function(entity)
{
    // check if object is already focused
    if (entity == this._currentFocus) return false;

    // clear current focus
    this.clearFocused();

    // make sure valid entity before focusing on it
    if (entity == null) return false;

    // BUG 14216: Dragging one palette object on another palette object in the grid selects the earlier object
    if (this.grid.palette.moving == true) return false;

    // check if this is focusable
    if (!entity.isFocusable()) return false;

    // fire before focus event (which can be canceled)
    var allowFocus = this.fireLazy('onBeforeFocus', entity);

    // set new focus
    if (allowFocus)
    {
        this._currentFocus = entity;
        entity.setFocused(true);
        this.fireLazy('onFocus', entity);
    }

    return allowFocus;
};

// are we currently performing an action?
Grid.Canvas.prototype.performingAction = function() { return (this._currentAction != null); };

Grid.Canvas.prototype.startAction = function()
{
    // check if we are in middle of an existing action
    if (this._currentAction != null) return false;

    // clear hover when starting action
    var focusedEntity = this.getFocused();
    
    if (focusedEntity != null && focusedEntity.isMoveable())
    {
        this.clearHovering();
    }

    // get action class
    var mode = this.grid.getMode();
    var actionClass = Grid.Action.actions[mode];
    if (actionClass == null) return false;

    // create instance of the action class
    this._currentAction = new actionClass(this.grid);

    // fire event
    this.fireLazy('onActionStart', this._currentAction);

    return true;
};

// cancels the current action (finalize)
Grid.Canvas.prototype.stopAction = function()
{
    if (this._currentAction == null) return false; // no action to cancel
    if (!this._currentAction.isCompleted()) this._currentAction.finalize(); // not completed? finish it up

    // reset mode hint
    this.grid.setModeHint();
    
    // clear action and fire event
    var action = this._currentAction;
    this._currentAction = null; // destroy action
    this.fireLazy('onActionEnd', action);

    return true;
};

// find the closest point to x,y
Grid.Canvas.prototype.getNearestPoint = function (x, y, tolerance) {
    tolerance = tolerance > 0 ? tolerance : this.model.options.selectionTolerance;
    var targetPoint = new Point2D(x, y);
    var closestPoint = null;
    var closestDistance = +Infinity;
    var points = this.model.getPoints();
    for (var i = 0; i < points.length; i++) {
        var point = points[i];
        var distance = targetPoint.distanceFrom(point);
        if (distance <= tolerance &&
            distance < closestDistance) {
            closestDistance = distance;
            closestPoint = point;
        }
    }
    return closestPoint;
};

Grid.Canvas.prototype.getNearestPointFromEvent = function (evt) {
    var x = evt.clickedPosition.x,
        y = evt.clickedPosition.y;
    return this.getNearestPoint(x, y);
};

// find the closest line to x,y
Grid.Canvas.prototype.getNearestLine = function (x, y, tolerance) {
    tolerance = tolerance > 0 ? tolerance : this.model.options.selectionTolerance;
    var targetPoint = new Point2D(x, y);
    var closestLine = null;
    var closestDistance = +Infinity;
    var lines = this.model.getLines();
    for (var i = 0; i < lines.length; i++) {
        var line = lines[i];
        var distance = line.distanceFromPoint(targetPoint);
        if (distance <= tolerance &&
            distance < closestDistance) {
            closestDistance = distance;
            closestLine = line;
        }
    }
    return closestLine;
};

Grid.Canvas.prototype.getNearestLineFromEvent = function (evt) {
    var x = evt.clickedPosition.x,
        y = evt.clickedPosition.y;
    return this.getNearestLine(x, y);
};


// get entity by dom event
Grid.Canvas.prototype.getFocusableEntity = function (evt) {

    // get entity directly by id
    var entity = this.model.getEntity(evt.target.id);
    if (entity && entity.isFocusable()) {
        return entity;
    }

    // if touch event then look for nearest point
    if (evt.touch) {
        return this.getNearestPointFromEvent(evt);
    }

    return null;
};

// call this function when a point stops moving
Grid.Canvas.prototype.finalizePoint = function(point)
{
    var lines = point.getLines();

    // snap to closest snap point and if none then the try the grid
    point.snap();

    // check if this point intersects with any other points
    var intersectedPoints = point.getIntersections();

    if (intersectedPoints.length == 0)
    {
        // no point intersections
        this.finalizeLines(lines);
        return point;
    }

    // get the first intersected point to merge with
    var mergePoint = intersectedPoints[0];

    // move lines from the current point to the existing intersecting point
    point.moveLines(mergePoint);

    // if the current point was focused then focus on the new one
    if (point == this.getFocused()) this.setFocused(mergePoint);

    // delete current point
    this.model.deletePoint(point);

    this.finalizeLines(mergePoint.getLines());
    return mergePoint;
};

// determines if a line merge occurs and merges
// EdgeDB.java - line 341 combineOverlappingLineSegments(jLine line, int tolerance)
Grid.Canvas.prototype.finalizeLines = function(pointLines)
{
    // HACK: If we are just starting a line the first point will get finalized and it 
    // might merge with an existing point. If that existing point has a line attached 
    // to it and that line can be merged with a nearby line then the source point could 
    // possibly get deleted (rightfully so). So visually you would see yourself moving
    // a line without a source point. So in this case we need to not do line merging. 
    if (this._currentAction instanceof Grid.Action.Line && this._currentAction.targetPoint == null) return;

    var toleranceParallel = 10; // java was 10 (using slope)
    var toleranceDistance = 4; // the max distance between two lines before merging

    // loop through all lines that were being moved
    for (var i = 0; i < pointLines.length; i++)
    {
        var pointLine = pointLines[i];

        var lines = this.model.getLinesByDir(pointLine.dirType);

        // loop through all the lines on the grid
        for (var j = 0; j < lines.length; j++)
        {
            var line = lines[j];
            if (pointLine == line) continue;

            // check if the lines are parallel with a certain tolerance
            var isParallel = pointLine.isParallelTo(line, toleranceParallel);
            if (!isParallel) continue;

            // check if the point line is within a certain distance from this line
            var distance = pointLine.distanceFrom(line);
            if (distance > toleranceDistance) continue;

            // begin line merge process
            var newLine = pointLine.getLongestLine(line);
            this.model.deleteLine(line);
            this.model.deleteLine(pointLine);
            var mergedLine = this.model.addLine(newLine.source, newLine.target, pointLine.dirType, pointLine.style);

            // delete empty points that got removed
            if (line.source.getLines().length == 0) this.model.deletePoint(line.source);
            if (line.target.getLines().length == 0) this.model.deletePoint(line.target);
            if (pointLine.source.getLines().length == 0) this.model.deletePoint(pointLine.source);
            if (pointLine.target.getLines().length == 0) this.model.deletePoint(pointLine.target);

            // bug #54739 - Improve line merge
            // create an array of newly created merged lines
            // finalize these lines in case additional merges are required
            var mergedLines = [];
            mergedLines.push(mergedLine);
            this.finalizeLines(mergedLines);
            
            return; //break out of nested for loops, stop processing lines, and return
        }
    }
};

// call this function when a point stops moving
Grid.Canvas.prototype.finalizeImage = function(image)
{
    // snap to closest snap point and if none then the try the grid
    image.snap();
};

/***********************************************************************************************/

/* MOUSE EVENTS */

Grid.Canvas.prototype.processMouseEvent = function(evt)
{
    this._checkForMouseHover(evt); // mouse over/out
    this._checkForMouseFocus(evt); // mouse click
	this._processMouseAction(evt); // action start/end
};

// check if we should hover on this element
Grid.Canvas.prototype._checkForMouseHover = function(evt)
{
    // only support hover when moving mouse in move mode and when there is no current action
    if (evt.name != 'mousemove' || this.performingAction()) return; // this.grid.getMode() != 'move'

    // check if target is an element and has id
    if (evt.target == null || evt.target.id == null) return;

    // get mouse event object
    var entity = this.model.getEntity(evt.target.id);

    // check if allows hover
    if (entity && entity.isHoverable()) this.setHovering(entity);
    else this.clearHovering();
};

// check if we should focus on this element
Grid.Canvas.prototype._checkForMouseFocus = function(evt)
{
    if (evt.name != 'mousedown') return;

    // check if target is an element
    if (evt.target == null) return;

    // get mouse event object
    var entity = this.getFocusableEntity(evt);

    // check if allows focus
    if (entity && entity.isFocusable()) {
        this.setFocused(entity);
    } else {
        this.clearFocused();
    }
};

// this function is responsible for figuring out if the mouse event should trigger an action
Grid.Canvas.prototype._processMouseAction = function(evt /* Mouse Event */)
{
    var mode = this.grid.getMode();

    // check if there is a current action going on
    if (this._currentAction == null)
    {
        if (evt.name != 'mousedown') return;
        
        // if there is no current action then create one based on the mode
        this.startAction();
    }

    // fire mouse event
    try
    {
        this._currentAction.onMouseEvent(evt);
    }
    catch (ex)
    {
        this._currentAction = null;
        throw ex;
    }

    // if the action is completed then clear it
    if (this._currentAction != null && this._currentAction.isCompleted()) this.stopAction();
};

/***********************************************************************************************/

/* KEYBOARD EVENTS */

Grid.Canvas.prototype.getFocusableObjects = function(typeFilter)
{
    var focusableEntities = [];
    var entities = this.model.getEntities();

    for (var i = 0; i < entities.length; i++)
    {
        var entity = entities[i];

        if ((typeof typeFilter != 'function' || entity instanceof typeFilter) && entity.isFocusable())
        {
            focusableEntities.push(entities[i]);
        }
    }

    return focusableEntities;
};

Grid.Canvas.prototype.processKeyEvent = function(evt)
{
    var focusedObject = this.getFocused();

    if (evt.key == 'esc')
    {
        this.clearFocused();
        this.stopAction();
    }
    
    // SELECT
    if (evt.key == 'enter' && this._currentAction == null)
    {
        var objects;

        // check if we are in move/delete mode
        if (this.grid.getMode() == 'move' || this.grid.getMode() == 'delete')
        {
            // include all focusable objects
            objects = this.getFocusableObjects(Grid.Model.Base);
        }
        else
        {
            // only include points
            objects = this.getFocusableObjects(Grid.Model.Point);
        }

        var nextObject = this._nextObjectInFocusableOrder(focusedObject, objects);

        if (focusedObject != nextObject)
        {
            this.stopAction();
        }

        this.setFocused(nextObject);
        return;
    };

    // ACTION
    if (evt.key == 'space')
    {
        /*if (focusedObject)
        {
            // set style on point to look like its being moved
            this.view.movePoint(focusedObject.getID(), focusedObject.x, focusedObject.y);
        }*/

        this._processKeyAction('keydown', evt);
    };

    // only allow moving something if an action is currently taking place
    if (this._currentAction == null) return;

    // MOVE
    var moveKey = (!evt.dom.ctrlKey && (evt.key == 'left' || evt.key == 'right' || evt.key == 'up' || evt.key == 'down'));

    // move object
    if (focusedObject && moveKey)
    {
        var x = focusedObject.x,
			y = focusedObject.y;

        var moveSize = evt.dom.shiftKey ? 1 : 10;
        if (evt.key == 'left') focusedObject.moveLeft(moveSize);
        if (evt.key == 'right') focusedObject.moveRight(moveSize);
        if (evt.key == 'up') focusedObject.moveUp(moveSize);
        if (evt.key == 'down') focusedObject.moveDown(moveSize);
    }

};

// action keyboard mapping
Grid.Canvas.prototype._processKeyAction = function(name, evt)
{
	// console.log('keypress: ' + evt.keyCode);
	
	var mode = this.grid.getMode();
	
	// if there is no current action then create one based on the mode
	if (this._currentAction == null) this.startAction();
	
	// fire mouse event
	try
	{
		this._currentAction.onKeyEvent(evt);
	}
	catch(ex)
	{
		this._currentAction.finalize();
		this._currentAction = null;
		throw ex;
	}
	
	// if the action is completed then remove it
	if (this._currentAction.isCompleted())
	{
		this._currentAction = null;
		logger.debug('Action - {mode} completed', { mode: mode });
	}
	
};

/**
 * Finds the top left most point in the point vector
 * @return the top left most point
 */
Grid.Canvas.prototype._firstObjectInFocusableOrder = function(positions) 
{
	var firstPosition = null;
	
	for (var i = 0; i < positions.length; i++) 
	{
		var existingPosition = positions[i];

		if (firstPosition == null) 
		{
			firstPosition = existingPosition;
		}
		else if (existingPosition.y < firstPosition.y || (existingPosition.y == firstPosition.y && existingPosition.x < firstPosition.x))
		{
			firstPosition = existingPosition;
		}
	}

	return firstPosition;
};

/**
 * returns the next object in the selection order, or null if this is the only point in the vector.
 * If this is at the end of the selection order it returns the first point in the selection order.
 * The selection order begins at the top, left and moves towards the bottom, right  
 * @param p - the current point
 * @return next point in the selection order or null 
 */
Grid.Canvas.prototype._nextObjectInFocusableOrder = function(currentPosition, positions)
{
	if (currentPosition == null) return this._firstObjectInFocusableOrder(positions);

	var nextPosition = null;
	
	for (var i = 0; i < positions.length; i++)
	{
		var existingPosition = positions[i];
		
		if (existingPosition.y < currentPosition.y || (existingPosition.y == currentPosition.y && existingPosition.x <= currentPosition.x))
		{
			continue; // this was a previous point 
		}
		
		if (nextPosition == null) 
		{
			nextPosition = existingPosition;
		}
		else if (existingPosition.y < nextPosition.y || (existingPosition.y == nextPosition.y && existingPosition.x < nextPosition.x))
		{
			nextPosition = existingPosition;
		}
	}
	
	if (nextPosition == null) nextPosition = this._firstObjectInFocusableOrder(positions);		
	return nextPosition;
};

/***********************************************************************************************/

/* MODEL EVENTS */

// resorts all the images on the canvas by size
/*Grid.Canvas.prototype.reorderImages = function()
{
    var images = this.model.getImages();

    // remove all images
    for (var i = 0; i < images.length; i++)
    {
        var image = images[i];
        this.view.removeElement(image.getID());
    }

    // sorts images from largest to smallest
    var imageSorter = function(imageA, imageB)
    {
        var sizeA = imageA.getSize();
        var sizeB = imageB.getSize();
        return sizeA > sizeB ? -1 : sizeA < sizeB ? 1 : 0;
    };

    images.sort(imageSorter);

    // add all images back
    for (var i = 0; i < images.length; i++)
    {
        var image = images[i];
        image.createElement(this.view);
        image.updateElement(this.view);
    }
};*/

// resorts all the images on the canvas by size
Grid.Canvas.prototype.reorderImages = function()
{
    // function for sorting images from largest to smallest
    var imageSorter = function(imageA, imageB)
    {
        var sizeA = imageA.getSize();
        var sizeB = imageB.getSize();
        return sizeA > sizeB ? -1 : sizeA < sizeB ? 1 : 0;
    };

    // sort images
    var images = this.model.getImages();
    images.sort(imageSorter);

    // push images to the front in the new sort order
    for (var i = 0; i < images.length; i++)
    {
        var image = images[i];
        this.view.bringToFront(image.getID());
    }
};

Grid.Canvas.prototype.subscribeToModelEvents = function()
{
    var canvas = this;
    var view = this.view;

    // ADD
    this.model.subscribe('onAdd', function(entity)
    {
        // create DOM element and update style
        entity.createElement(view);
        entity.updateElement(view);

        // auto focus on points
        if (entity instanceof Grid.Model.Point) canvas.setFocused(entity);

        // reorder images
        if (entity instanceof Grid.Model.Image) canvas.reorderImages();
    });

    // DELETE
    this.model.subscribe('onDelete', function(entity)
    {
        // clear any hover/focus styles
        canvas.clearHovering();
        canvas.clearFocused(entity);

        // remove DOM element
        entity.removeElement(view);
    });

    // MOVE
    this.model.subscribe('onMove', function(entity) { entity.moveElement(view); });
    this.model.subscribe('onUpdate', function(entity) { entity.updateElement(view); });
};
