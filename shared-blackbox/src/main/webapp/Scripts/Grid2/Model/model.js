// NAMING CONVENTIONS: http://www.graphviz.org/doc/info/attrs.html
// Physics: https://github.com/jwagner/box2d2-js
// Numerical analysis in javascript: http://www.numericjs.com/numeric/doc/symbols/numeric.html
// 2D lib for canvas: https://bitbucket.org/imcdowall/drawlib2dv

Grid.Model = function(id, options)
{
    this.id = id || '';
    this.options = options || new Grid.Model.Options();
    this._uuid = 0;

    // the part of the its item where the question is located
    this.questionPartID = 1;

    this.description = '';

    // the default radius of a point if none is provided
    this.defaultRadius = 5;

    // cache objects for easy id based lookup
    this._collection = [];
    this._cache = {};
    this._addCache = function(id, obj) { this._cache[id] = obj; };
    this._removeCache = function(id) { this._cache[id] = null; };

    // collections
    this._points = [];
    this._snappoints = [];
    this._lines = [];
    this._paletteimages = [];
    this._canvasimages = [];
    this._staticimages = [];
    this._backgroundimages = [];

    this._labels = [];
    this._rectangles = [];
    this._circles = [];
    
    this._regions = [];
    this._regionGroups = [];
    
    // is the model working with the answer space (importing == true) or response?
    this.importing = false;

    this._listenForCacheEvents();

    this._instance = ++Grid.Model._instances;
};

/* 
MODEL EVENTS
onAdd: Added a new entity to the model
onDelete: Removed a entity from the model
onMove: Moved an entities position
onUpdate: An entity was selected, dimensions were changed or a style update was requested
*/
YAHOO.lang.augmentProto(Grid.Model, EventLazyProvider);

Grid.Model.arrayRemoveAt = function(arr, i)
{
    return (Array.prototype.splice.call(arr, i, 1).length == 1);
};

Grid.Model.arrayRemove = function(arr, obj)
{
    var i = arr.indexOf(obj);
    var rv;
    if ((rv = i >= 0))
    {
        Grid.Model.arrayRemoveAt(arr, i);
    }
    return rv;
};

Grid.Model._instances = 0;

Grid.Model.getEmptyStyles = function()
{
    return {
       'fill': 'white',
       'fill-opacity': '0',
       'stroke': 'white',
       'stroke-width': '0',
       'stroke-opacity': '',
       'stroke-dasharray': ''
    };
};

Grid.Model.getDefaultStyles = function()
{
    return {
       'fill': 'white',
       'fill-opacity': '0',
       'stroke': 'red',
       'stroke-width': '1',
       'stroke-opacity': '',
       'stroke-dasharray': ''
   };
};

Grid.Model.prototype._createUUID = function()
{
    var t = new Date().getTime();
    var r = Math.random().toString().split('.')[1] * 1;

    ++this._uuid;
    return this._uuid; // + '_' + rnd;
};

Grid.Model.prototype._listenForCacheEvents = function()
{
    var model = this;

    this.subscribe('onAdd', function(entity)
    {
        // add to generic lookups
        var id = entity.getID();
        model._cache[id] = entity;
        model._collection.push(entity);

        // fire show/hide events (which also updates styles)
        // if (entity.isVisible()) entity.show();
        // else entity.hide();
    });

    this.subscribe('onDelete', function(entity)
    {
        // remove from generic lookups
        var id = entity.getID();
        delete model._cache[id];
        Grid.Model.arrayRemove(model._collection, entity);
    });
};

// check if a string and has something
Grid.Model.prototype._hasString = function(id) { return (Lang.isString(id) && id.length > 0); };

/* PUBLIC API */

// generic delete function
Grid.Model.prototype.deleteEntity = function(entityToDelete)
{
    var type = entityToDelete.getType();
    var collectionName = '_' + type + 's';
    var collection = this[collectionName];

    // try and delete entity from an existing collection
    if (collection != null)
    {
        Grid.Model.arrayRemove(this[collectionName], entityToDelete);

        /*for (var i = 0; i < collection.length; i++)
        {
            // get entity
            var entity = collection[i];

            // check if entity is the one that was passed in
            if (entity != entityToDelete) continue;

            // remove from array
            this._remove(this[collectionName], i);
        }*/
    }

    // fire event
    this.fireLazy('onDelete', entityToDelete);
};

// clear response
Grid.Model.prototype.clearResponse = function()
{
    while (this._snappoints.length > 0) this.deleteSnapPoint(this._snappoints[0]);
    while (this._points.length > 0) this.deletePoint(this._points[0]);
    while (this._canvasimages.length > 0) this.deleteImage(this._canvasimages[0]);
    while (this._circles.length > 0) this.deleteCircle(this._circles[0]);

    // deselect all regions
    for (var i = 0; i < this._regions.length; i++)
    {
        var region = this._regions[i];
        if (region.isSelected()) region.deselect();
    }
};

//clear question
Grid.Model.prototype.clearQuestion = function()
{
    this.clearResponse();

    while (this._snappoints.length > 0) this.deleteSnapPoint(this._snappoints[0]);
    while (this._paletteimages.length > 0) this.deletePaletteImage(this._paletteimages[0]);
    while (this._backgroundimages.length > 0) this.deleteBackgroundImage(this._backgroundimages[0]);
    while (this._staticimages.length > 0) this.deleteStaticImage(this._staticimages[0]);

    // delete region groups
    while (this._regionGroups.length > 0) this.deleteRegionGroup(this._regionGroups[0], true);

    this.options = new Grid.Model.Options();
};

// get any entity (e.x., point, line) by ID
Grid.Model.prototype.getEntity = function(id)
{
    // check if valid ID
    if (id == null || id == '') return null;
    
    // check cache
    return this._cache[id] || null;
};

// get all the entities on the grid
Grid.Model.prototype.getEntities = function() { return this._collection; };

Grid.Model.prototype.addEntity = function(entity)
{
	this.fireLazy('onAdd', entity);
};

/* points */

// add a new point
Grid.Model.prototype.addPoint = function(x, y)
{
	var radius = (arguments[2] > 0) ? arguments[2] : this.defaultRadius; // selectionTolerance
	
	var point = new Grid.Model.Point(this, x, y, radius);
	// point.snapToGrid();
	
	this._points.push(point);
	this.fireLazy('onAdd', point);
	
	return point;
};

// get a collection of all the points
Grid.Model.prototype.getPoints = function() { return this._points; };

// delete an existing point
Grid.Model.prototype.deletePoint = function(point)
{
    // remove point
    for (var i = 0; i < this._points.length; i++)
    {
        if (point != this._points[i]) continue;

        // remove any lines associated to this point
        var pointLines = point.getLines();

        for (var j = 0; j < pointLines.length; j++)
        {
            var line = pointLines[j];
            this.deleteLine(line);
        }

        // remove point from array
        // this._remove(this._points, i);
        Grid.Model.arrayRemoveAt(this._points, i);
        this.fireLazy('onDelete', point);
        return true;
    }

    return false;
};

/* lines */

// get a collection of all the lines
Grid.Model.prototype.getLines = function() { return this._lines; };

// Add a new line using an existing source and target point
// @source The starting point
// @target The ending point
// @dirType The direction of the line (none, forward, back, both) MORE INFO: http://www.graphviz.org/doc/info/attrs.html#k:dirType
// @style The style of the line (solid, dashed)
Grid.Model.prototype.addLine = function(source, target, dirType, style)
{
	if (!source || !target) throw new Error('Invalid source or target point');

	// check if source and target are the same
	if (source == target) return null;
	
	// check if these points already have a line connected
	for(var i = 0; i < this._lines.length; i++)
	{
		var existingLine = this._lines[i];
		if (source == existingLine.source && target == existingLine.target) return existingLine; // exact duplicate
		if (target == existingLine.source && source == existingLine.target) return existingLine; // reversed duplicate
	}
	
	var line = new Grid.Model.Line(this, source, target, dirType, style, this.options.properLineGeometry);
	this._lines.push(line);
	this.fireLazy('onAdd', line);

	return line;
};

// get all lines for a direction (none, forward, back, both)
Grid.Model.prototype.getLinesByDir = function(dirType)
{
	var lineDirections = [];
	
	for (var i = 0; i < this._lines.length; i++)
	{
		var line = this._lines[i];
		if (line.dirType == dirType) lineDirections.push(line);
	}
	
	return lineDirections;
};

Grid.Model.prototype.deleteLine = function(line)
{
    return this.deleteEntity(line);
};

/* snap points */

Grid.Model.prototype.getSnapPoints = function() { return this._snappoints; };

// add a new snap point
Grid.Model.prototype.addSnapPoint = function(x, y, snapRadius)
{
	var snapPoint = new Grid.Model.SnapPoint(this, x, y, this.defaultRadius, snapRadius);
	
	this._snappoints.push(snapPoint);
	this.fireLazy('onAdd', snapPoint);
	return snapPoint;
};

Grid.Model.prototype.deleteSnapPoint = function(snapPoint)
{
    return this.deleteEntity(snapPoint);
};

/* palette images */

Grid.Model.prototype.getPaletteImages = function() { return this._paletteimages; };

// Add an image to the palette
// XML: <ObjectMenuIcons> <IconSpec>
Grid.Model.prototype.addPaletteImage = function(name /* <Label> */, url /* <FileSpec> */, width, height)
{
	var paletteImage = new Grid.Model.PaletteImage(this, name, url, width, height);
	
	this._paletteimages.push(paletteImage);
	this.fireLazy('onAdd', paletteImage);
	
	return paletteImage;
};

Grid.Model.prototype.deletePaletteImage = function(paletteImage)
{
    // get canvas images
    var canvasImages = paletteImage.getImages();

    // delete palette image
    this.deleteEntity(paletteImage);

    // delete canvas images
    for (var i = 0; i < canvasImages.length; i++)
    {
        this.deleteEntity(canvasImages[0]);
    }
};

/* images */

Grid.Model.prototype.getImages = function() { return this._canvasimages; };

// Add an image to the canvas
// XML: <AtomicObject> {CarA(64,268)} </AtomicObject>
Grid.Model.prototype.addImage = function(name, x, y)
{
    if (!Lang.isString(name) || name.length == 0) return null;

    var paletteImage = null;

    for (var i = 0; i < this._paletteimages.length; i++)
    {
        if (name == this._paletteimages[i].name)
        {
            paletteImage = this._paletteimages[i];
            break;
        }
    }

    if (paletteImage == null) throw new Error('Cannot add the image ' + name + ' because the palette image does not exist.');

    var image = new Grid.Model.Image(this, name, x, y, paletteImage.width, paletteImage.height);
    this._canvasimages.push(image);
    this.fireLazy('onAdd', image);

    return image;
};

Grid.Model.prototype.deleteImage = function(image)
{
    return this.deleteEntity(image);
};

/* static images */

Grid.Model.prototype.getStaticImages = function() { return this._staticimages; };

// Add an image to the canvas which cannot be moved
Grid.Model.prototype.addStaticImage = function(url /* <FileSpec> */, x, y, width, height)
{
    var staticImage = new Grid.Model.StaticImage(this, url, x, y, width, height);

    this._staticimages.push(staticImage);
    this.fireLazy('onAdd', staticImage);
    return staticImage;
};

Grid.Model.prototype.deleteStaticImage = function(staticImage)
{
    return this.deleteEntity(staticImage);
};

/* background images */

Grid.Model.prototype.getBackgroundImages = function() { return this._backgroundimages; };

// Add an image to the background of the canvas which cannot be moved
// XML: <ImageSpec>
Grid.Model.prototype.addBackgroundImage = function(url /* <FileSpec> */, x, y, width, height)
{
    var backgroundImage = new Grid.Model.BackgroundImage(this, url, x, y, width, height);

    this._backgroundimages.push(backgroundImage);
    this.fireLazy('onAdd', backgroundImage);
    return backgroundImage;
};

Grid.Model.prototype.deleteBackgroundImage = function(backgroundImage)
{
    return this.deleteEntity(backgroundImage);
};

/* Rectangles */

Grid.Model.prototype.getRectangles = function() { return this._rectangles; };

Grid.Model.prototype.createRectangle = function(x1, y1, x2, y2)
{
    var width = (x2 - x1);
    var height = (y2 - y1);
    return new Grid.Model.Rectangle(this, x1, y1, width, height);
};

Grid.Model.prototype.addRectangle = function(rect)
{
    if (!(rect instanceof Grid.Model.Rectangle)) throw new Error('Can only add valid rectangle objects.'); 
    this._rectangles.push(rect);

    this.fireLazy('onAdd', rect);
    return rect;
};

/* Circles */

Grid.Model.prototype.getCircles = function() { return this._circles; };

Grid.Model.prototype.createCircle = function(x, y, radius)
{
    return new Grid.Model.Circle(this, x, y, radius);
};

Grid.Model.prototype.addCircle = function(circle)
{
    if (!(circle instanceof Grid.Model.Circle)) throw new Error('Can only add valid circle objects.'); 
    this._circles.push(circle);
    
    this.fireLazy('onAdd', circle);
    return circle;
};

Grid.Model.prototype.deleteCircle = function (circle)
{
    return this.deleteEntity(circle);
};

/* Labels */

Grid.Model.prototype.getLabels = function() { return this._labels; };

Grid.Model.prototype.addLabel = function(x, y, text, fontSize, fontFamily)
{
    var label = new Grid.Model.Label(this, x, y, text, fontSize, fontFamily);
    this._labels.push(label);
    
    this.fireLazy('onAdd', label);
    return label;
};

/* Region Groups */

Grid.Model.prototype.getRegionGroups = function() { return this._regionGroups; };

Grid.Model.prototype.getRegionGroup = function(name)
{
    var regionGroups = grid.model.getRegionGroups();

    for (var i = 0; i < regionGroups.length; i++)
    {
        var group = regionGroups[i];
        if (group.name == name) return group;
    }

    return null;
};

Grid.Model.prototype.createRegionGroup = function(name, min, max)
{
    var regionGroup = new Grid.Model.RegionGroup(this, name, min, max);
    this._regionGroups.push(regionGroup);
    return regionGroup;
};

// delete a region group 
Grid.Model.prototype.deleteRegionGroup = function(group, deleteOrphans)
{
    var regions = group.getRegions();

    // delete each region in the group
    while (regions.length > 0)
    {
        group.removeRegion(regions[0], deleteOrphans);
    }

    // delete the group
    Grid.Model.arrayRemove(this._regionGroups, group);
};

/* Regions */

Grid.Model.prototype.createRegion = function(name /*string*/, shape /*string*/, coords /*string*/)
{
    // create region
    var region = null;

    // create shape
    switch (shape)
    {
        case 'rect': region = this._buildRegionRect(name); break;
        case 'circle': region = this._buildRegionCircle(name); break;
        case 'poly': region = this._buildRegionPolygon(name); break;
    }

    // configure shape
    if (region != null)
    {
        region.setHoverable(true);
        region.setFocusable(Grid.Model.Focusable.Auto);
        region.setSelectable(true);
        region.setMoveable(false);

        // add shape to canvas
        this.addEntity(region);
        this._regions.push(region);

        // set coordinates
        if (YAHOO.lang.isString(coords))
        {
            region.setCoords(coords);
        }
    }

    return region;
};

Grid.Model.prototype._buildRegionRect = function(name)
{
    var regionClass = Grid.Model.buildRegion(Grid.Model.Rectangle, name);
    return new regionClass(this, 0, 0, 0, 0);
};

Grid.Model.prototype._buildRegionCircle = function(name)
{
    var regionClass = Grid.Model.buildRegion(Grid.Model.Circle, name);
    return new regionClass(this, 0, 0, 0);
};

Grid.Model.prototype._buildRegionPolygon = function(name)
{
    var regionClass = Grid.Model.buildRegion(Grid.Model.Polygon, name);
    return new regionClass(this);
};

Grid.Model.prototype.deleteRegion = function(region)
{
    var events = region.getEvents();

    for (var i = 0; i < events.length; i++)
    {
        var event = events[i];
        region.deleteEvent(event);
    }

    Grid.Model.arrayRemove(this._regions, region);
    this.deleteEntity(region);
};

Grid.Model.prototype.getRegions = function() { return this._regions; };

Grid.Model.prototype.getRegion = function(name)
{
    for (var i = 0; i < this._regions.length; i++)
    {
        var region = this._regions[i];
        if (region.name == name) return region;
    }

    return null;
};

// get all the images for all the regions (mostly a helper method)
Grid.Model.prototype.getRegionsImages = function()
{
    var regionImages = [];
    var regions = this.getRegions();

    for (var i = 0; i < regions.length; i++)
    {
        var regionEvents = regions[i].getEvents();

        for (var j = 0; j < regionEvents.length; j++)
        {
            var eventImage = regionEvents[j].getImage();
            if (eventImage != null) regionImages.push(eventImage);
        }
    }

    return regionImages;
};

