/* BASE CLASS */
Grid.Model.Base = function(model)
{
    if (!(model instanceof Grid.Model))
    {
        throw new Error('The base class does not have a valid model.');
    }

    this.model = model;
    this._id = model._instance + '_' + model._createUUID();

    this._visible = true;

    this._hoverable = false;
    this._hovering = false;

    this._focusable = Grid.Model.Focusable.Never;
    this._focused = false;

    this._moveable = false;
    this._deletable = false;

    this._selectable = false;
    this._selected = false;
};

Grid.Model.Focusable =
{
    Never: 0,
    Manual: 1,
    Auto: 2
};

// Get the type string name
// TODO: try and remove the need for this function
Grid.Model.Base.prototype.getType = function()
{
    if (this instanceof Grid.Model.BackgroundImage) return 'backgroundimage';
    if (this instanceof Grid.Model.StaticImage) return 'staticimage';
    if (this instanceof Grid.Model.PaletteImage) return 'paletteimage';
    if (this instanceof Grid.Model.Image) return 'canvasimage';
    if (this instanceof Grid.Model.Line) return 'line';
    if (this instanceof Grid.Model.SnapPoint) return 'snappoint';
    if (this instanceof Grid.Model.Point) return 'point';
    if (this instanceof Grid.Model.Circle) return 'circle';
    if (this instanceof Grid.Model.Rectangle) return 'rect';
    if (this instanceof Grid.Model.Polygon) return 'poly';
    if (this instanceof Grid.Model.Path) return 'path';
    if (this instanceof Grid.Model.Base) return 'base';
    return 'unknown';
};

// get unique id for this entity
Grid.Model.Base.prototype.getID = function()
{
	return this.getType() + '_' + this._id;
};

// This gets set from the model to determine if this object is visible for interaction.
Grid.Model.Base.prototype.setVisible = function(visible) { this._visible = visible; };

// If this returns true then this object is currently visible.
Grid.Model.Base.prototype.isVisible = function() { return this._visible; };

// This will show the object.
Grid.Model.Base.prototype.show = function()
{
    this.setVisible(true);
    this.update();
};

// This will hide the object.
Grid.Model.Base.prototype.hide = function()
{
    this.setVisible(false);
    this.update();
};

// This gets set from the model to determine if this object can receive hover events.
Grid.Model.Base.prototype.setHoverable = function(hoverable) { this._hoverable = hoverable; };

// If this is true then this object is capable of firing hover event.
Grid.Model.Base.prototype.isHoverable = function()
{
    return this.isVisible() ? this._hoverable : false;
};

// This gets called from the canvas when an object gets a hover event.
// NOTE: Don't set this externally!
Grid.Model.Base.prototype.setHovering = function(hovering) { this._hovering = hovering; };

// If this returns true then this object is being hovered over.
Grid.Model.Base.prototype.isHovering = function() { return this._hovering; };

// This gets sets from the model to determine of this object can receive focus events.
Grid.Model.Base.prototype.setFocusable = function(focusable) { this._focusable = focusable; };

// If this is true then this object is capable of firing focus events.
Grid.Model.Base.prototype.isFocusable = function()
{
    return this.isVisible() ? this._focusable : false;
};

// This gets called from the canvas when an object has successfully received focus.
// NOTE: Don't set this externally!
Grid.Model.Base.prototype.setFocused = function(focused) { this._focused = focused; };

// If this returns true then this object has the current focus.
// NOTE: Only one object can have focus at a time. 
Grid.Model.Base.prototype.isFocused = function() { return this._focused; };

// This gets called from the model to determine if this object can be selected.
Grid.Model.Base.prototype.setSelectable = function(selectable) { this._selectable = selectable; };

// If this is true then this object can be selected. 
Grid.Model.Base.prototype.isSelectable = function() { return this._selectable; };

// If this returns true then this object is currently selected.
Grid.Model.Base.prototype.isSelected = function() { return this._selected; };

// Call this function to make this object selected.
Grid.Model.Base.prototype.select = function()
{
    // check if already selected
    if (this.isSelected()) return false;

    // check if we allow this to be selected
    if (!this.isSelectable()) return false;

    // set as selected
    this._selected = true;
    this.update();
    return true;
};

// Call this function to deselect a previously selected object.
Grid.Model.Base.prototype.deselect = function()
{
    // make sure currently selected
    if (!this.isSelected()) return false;
    
    // unset selected
    this._selected = false;
    this.update();
    return true;
};

// This gets set from the model to determine if this object can be moved.
Grid.Model.Base.prototype.setMoveable = function(moveable) { this._moveable = moveable; };

// If this returns true then this object can be moved.
Grid.Model.Base.prototype.isMoveable = function() { return this._moveable; };

// This gets set from the model to determine if this object can be deleted from the canvas.
Grid.Model.Base.prototype.setDeletable = function(deletable) { this._deletable = deletable; };

// If this returns true then this object can be deleted from the canvas.
Grid.Model.Base.prototype.isDeletable = function() { return this._deletable; };

// Call this to request a redraw of this object on the grid.
Grid.Model.Base.prototype.update = function()
{
    this.model.fireLazy('onUpdate', this);
};

Grid.Model.Base.prototype.setCoords = function() {};

// This returns the objects SVG style attributes as a JSON object.
Grid.Model.Base.prototype.getStyles = function()
{
    return Grid.Model.getDefaultStyles();
};

/******************************************************************************************/
/* BASE VIEW */

Grid.Model.Base.prototype.getElement = function(view)
{
    var id = this.getID();
	return view.getElementById(id);
};

// create and the DOM element
Grid.Model.Base.prototype.createElement = function(view) { return null; }; 

// get the group this element will get added to
// by default add elements to the shapes group
Grid.Model.Base.prototype.getElementGroup = function() { return 'shapes'; };

// add the DOM element
Grid.Model.Base.prototype.appendElement = function(view, element)
{
    // by default add elements to the shapes group
    var groupId = this.getElementGroup();
    view.appendChild(groupId, element);
};

// move DOM element
Grid.Model.Base.prototype.moveElement = function(view) {}; 

// remove DOM element
Grid.Model.Base.prototype.removeElement = function(view)
{
    var id = this.getID();
    view.removeElement(id);
};

// update DOM element styles
Grid.Model.Base.prototype.updateElement = function(view)
{
    var element = this.getElement(view);
    if (element == null) return;

    // set styles
    var styles = this.getStyles();
    view.setAttributes(element, styles);

    var visible = this.isVisible();

    // set visibility
    // 'visibility': visible ? 'visible' : 'hidden' (fails in IE)
    // http://www.w3.org/TR/SVG/painting.html#VisibilityControl
    // https://bugzilla.mozilla.org/show_bug.cgi?format=multiple&id=612118
    view.setAttributes(element,
    {
        'display': visible ? 'inline' : 'none'
    });
};