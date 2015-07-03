//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
/*
 * This is the main grid class and the entry point for everything.
 */

// An instance of the grid
// @element The grid will load into this div
// @svgFile The grid svg file to load
var Grid = function(element, svgFile)
{
    this._element = YAHOO.util.Dom.get(element);
    this._svgFile = svgFile;

    // reference to the grid view (svg)
    this.view = null;
    this.ui = null; // alias

    // reference to the model
    this.model = null;
    this.question = null; // alias

    // reference to the import/export module
    this.importexport = null;

    // reference to the palette panel
    this.palette = null;

    // reference to the toolbar panel
    this.toolbar = null;

    // reference to the feedback panel
    this.feedback = null;

    // reference to the canvas panel
    this.canvas = null;

    // the current panel
    this._currentPanel = null;

    this._currentMode = null;

    this._state = Grid.State.Uninitialized;

    // collection of registered components
    this._canvasComponents = [];

    this.showCoordinates = false;

    // allow the tab key to toggle between panels
    this.allowTab = true;

    this._debug = false;

    // create objects
    this.view = this.ui = new Grid.View(this._svgFile);
    this.model = this.question = new Grid.Model();
    this.importexport = new Grid.ImportExport(this.model);
    this.palette = new Grid.Palette(this);
    this.toolbar = new Grid.Toolbar(this);
    this.canvas = new Grid.Canvas(this);

    // add error logging to public functions (NOTE: firebug doesn't report <object> exceptions..)
    if (Grid.Utils.hasSVGWeb())
    {
        ErrorHandler.wrapFunctions(this, ['_svgRendered', 'init', 'update', 'loadItemXml', 'loadResponseXml', 'getResponseXml']);
    }

    // fire grid create event
    Grid.Events.fireLazy('onNew', this);
};

// grid static events: onNew, onDispose
Grid.Events = new EventLazyProvider();

// grid instance events: onStateChange, onAreaChange, onModeChange
YAHOO.lang.augmentProto(Grid, EventLazyProvider);

Grid.State =
{
    Error: -1, // error in any of the grid states
    Uninitialized: 0, // initial grid state
    Initialized: 1, // grid initialization process started, getting SVG
    Created: 2, // grid svg has loaded but events are hooked up yet
    Ready: 3, // all events are hooked up and the grid is ready to have data loaded into it
    Loading: 4, // in process of loading the answer space and response xml
    Loaded: 5 // all xml has loaded and the student can use the grid now
};

GridState = Grid.State; // alias

// check if the grid is read-only mode
Grid.prototype.isReadOnly = function() { return false; };

Grid.prototype._setState = function(state, data)
{
    this._state = state;

    var stateName = 'Unknown';

    switch (this._state)
    {
        case Grid.State.Error: stateName = 'Error'; break;
        case Grid.State.Uninitialized: stateName = 'Uninitialized'; break;
        case Grid.State.Initialized: stateName = 'Initialized'; break;
        case Grid.State.Created: stateName = 'Created'; break;
        case Grid.State.Ready: stateName = 'Ready'; break;
        case Grid.State.Loading: stateName = 'Loading'; break;
        case Grid.State.Loaded: stateName = 'Loaded'; break;
    }

    this.fireLazy('onStateChange', { grid: this, state: state, name: stateName, data: data });
};

Grid.prototype.getState = function() { return this._state; };

// call this function to report an error
Grid.prototype.reportError = function(msg, ex, silent)
{
    this.fireLazy('onError', { message: msg, exception: ex });
    if (ex && !silent) throw ex; // rethrow
};

Grid.prototype._processKeyEvent = function(evt)
{
    evt.preventDefault();
    // evt.stopPropagation();

    // skip processing any keys with a modifier held down
    // if (evt.ctrlKey || evt.altKey || evt.metaKey) return;

    if (this.isReadOnly()) return;

    var key = '';

    switch (evt.keyCode)
    {
        case 9: key = 'tab'; break;
        case 13: key = 'enter'; break;
        case 27: key = 'esc'; break;
        case 32: key = 'space'; break;
        case 37: key = 'left'; break;
        case 38: key = 'up'; break;
        case 39: key = 'right'; break;
        case 40: key = 'down'; break;
    }

    var keyEvent =
	{
	    dom: evt,
	    key: key
	};

    var area = this.getArea();

    // ctrl-tab moves to different panel
    if (this.allowTab && evt.ctrlKey && key == 'tab')
    {
        this.view._svgWin.focus();

        if (area == 'canvas')
        {
            if (this.model.options.showPalette) this.setArea('palette');
            else if (this.model.options.showButtons.length > 0) this.setArea('toolbar');
        }
        else if (area == 'palette') this.setArea('toolbar');
        else if (area == 'toolbar') this.setArea('canvas');

        return;
    }

    if (area == 'canvas' && typeof this.canvas.processKeyEvent == 'function') this.canvas.processKeyEvent(keyEvent);
    else if (area == 'palette' && typeof this.palette.processKeyEvent == 'function') this.palette.processKeyEvent(keyEvent);
    else if (area == 'toolbar' && typeof this.toolbar.processKeyEvent == 'function') this.toolbar.processKeyEvent(keyEvent);

};

// this function gets called when the svg is loaded and rendered
Grid.prototype._svgRendered = function()
{
    var grid = this;

    // listen to group clicks for setting the panel current panel
    var groupPalette = this.view.getElementById('groupPalette');
    var groupToolbar = this.view.getElementById('groupToolbar');
    var groupCanvas = this.view.getElementById('groupCanvas');

    if (groupPalette) {
        Grid.Utils.addMouseListener(groupPalette, 'mousedown', function (evt) {
            if (!grid.isReadOnly()) {
                grid.setArea('palette');
            }
        });
    }

    if (groupToolbar) {
        Grid.Utils.addMouseListener(groupToolbar, 'mousedown', function (evt) {
            if (!grid.isReadOnly()) {
                grid.setArea('toolbar');
            }
        });
    }

    Grid.Utils.addMouseListener(groupCanvas, 'mousedown', function (evt) {
        if (!grid.isReadOnly()) {
            grid.setArea('canvas');
        }
    });

    // attach key handler
    this.view._svgRoot.addEventListener("keyup", function(evt) { evt.preventDefault(); }, false);
    this.view._svgRoot.addEventListener("keypress", function(evt) { evt.preventDefault(); }, false);

    this.view._svgRoot.addEventListener("keydown", function(evt)
    {
        try { grid._processKeyEvent(evt); }
        catch (ex) { grid.reportError('Error processing key event', ex); }

    }, false);

    // prevent context menu
    grid.view._svgRoot.addEventListener('contextmenu', function(evt) {
        evt.preventDefault();
    }, false);

    // attach mouse handler for notifying canvas component registrations
    this.addMouseListener('groupCanvas', function(evt)
    {
        if (grid.isReadOnly()) return;
        
        try
        {
            var i = grid._canvasComponents.length;

            // process array as a stack
            while (i--)
            {
                var canvasComponent = grid._canvasComponents[i];

                var success;

                // execute mouse event function on component
                if (typeof canvasComponent.processMouseEvent == 'function')
                {
                    success = canvasComponent.processMouseEvent(evt);
                }

                // check if component processing was cancelled
                if (success === false) return;
            }
        }
        catch (ex) { grid.reportError('Error processing canvas mouse event', ex); }
    });

    // register canvas component
    this.registerCanvasComponent(grid.canvas);

    // attach palette mouse handler
    this.addMouseListener('groupWrapper', function(evt)
    {
        if (grid.isReadOnly()) return;

        try { grid.palette.processMouseEvent(evt); }
        catch (ex) { grid.reportError('Error processing palette mouse event', ex); }
    });

    // show coordinates
    this.addMouseListener('groupCanvas', function(evt)
    {
        if (grid.showCoordinates)
        {
            // grid.view.setCoordinatesText('(' + evt.currentPosition.x + ',' + evt.currentPosition.x + ')');
            //grid.view.setCoordinatesText('(' + Math.round(evt.currentPosition.x) + ',' + Math.round(evt.currentPosition.x) + ')');
            grid.view.setCoordinatesText('(' + evt.currentPosition.x + ',' + (grid.model.options.canvasHeight - evt.currentPosition.y) + ')');
        }
    });

    // process model notifications
    grid.palette.subscribeToModelEvents();
    grid.canvas.subscribeToModelEvents();

    // initialize toolbar
    if (groupToolbar)
    {
        this.toolbar.init();
    }

    // set the default area and mode
    // this.setArea('canvas');
    this.setMode('move');

    // turn on rendering enhancements only if browser is older than Firefox 3.5
    if (YAHOO.env.ua.gecko < 1.91)
    {
        this.view._suspendRedrawEnabled = true;
        this.view._attributeBatchEnabled = true;
    }

    // fire ready event
    setTimeout(function()
    {
        grid._setState(Grid.State.Ready);
    }, 0);
};

// register a component to the grid to listen for mouse and key events
Grid.prototype.registerCanvasComponent = function(obj)
{
    this._canvasComponents.push(obj);
};

Grid.prototype.getArea = function() { return this._currentPanel; };

// set a panel as being active (pass in NULL to turn them all off)
Grid.prototype.setArea = function(panelName)
{
    if (this._currentPanel == panelName) return false;

    // cancel any actions (moving lines) and deselect points/images
    this.canvas.stopAction();
    this.canvas.clearFocused();

    // remove focus style
    if (this._currentPanel != null)
    {
        switch (this._currentPanel)
        {
            case 'canvas': this.view.setAttributes('backgroundCanvas', { 'stroke': 'black' }); break;
            case 'palette': this.view.setAttributes('backgroundPalette', { 'stroke': 'black' }); break;
            case 'toolbar': this.view.setAttributes('backgroundToolbar', { 'stroke': 'white' }); break;
        }
    }
    
    // set current panel name
    this._currentPanel = panelName;

    // add focus style
    if (this._currentPanel != null)
    {
        switch (this._currentPanel)
        {
            case 'canvas': this.view.setAttributes('backgroundCanvas', { 'stroke': 'blue' }); break;
            case 'palette': this.view.setAttributes('backgroundPalette', { 'stroke': 'blue' }); break;
            case 'toolbar': this.view.setAttributes('backgroundToolbar', { 'stroke': 'blue' }); break;
        }
    }

    this.fireLazy('onAreaChange', { grid: this, name: panelName });
    return true;
};

Grid.prototype.getMode = function() { return this._currentMode; };

// set the current grid mode ('move', 'delete', 'point', 'connect', 'arrow', 'arrw2')
Grid.prototype.setMode = function(mode)
{
    // BUG 14229: Mouse selects both object and delete action at the same time
    if (this.palette.moving) return;

    // check if anything to change
    if (this._currentMode != null && mode == this._currentMode && mode == 'move') return;

    // check if we are toggling on current mode
    if (mode == this._currentMode)
    {
        // reset to move
        mode = 'move';
    }

    var currentButton;

    if (this._currentMode)
    {
        currentButton = this.toolbar.getButton(this._currentMode);
        if (currentButton) currentButton.deselect(); // set button 'up'
    }
    
    this._currentMode = mode;

    currentButton = this.toolbar.getButton(this._currentMode);
    if (currentButton) currentButton.select(); // set button 'selected'

    this.canvas.stopAction();
    this.setModeCursor();
    this.setModeHint();

    this.fireLazy('onModeChange', { grid: this, name: mode });
};

// called externally to initialize the grid
Grid.prototype.init = function()
{
    var grid = this;

    // check if we are uninitialized
    if (this.getState() != Grid.State.Uninitialized)
    {
        throw Error('Grid has already been initialized.');
    }
    
    // subscribe to the UI event for when SVG file is loaded
    this.view.subscribe('loaded', function()
    {
        grid._setState(Grid.State.Created);
        grid._svgRendered();
    });

    this._setState(Grid.State.Initialized);
    this.view.render(this._element);
};

Grid.prototype.getLayout = function() {
    if (this.model == null || this.model.options == null) return null;
    var options = this.model.options;
    
    var layout = new Grid.Layout();
    
    layout.setContainerPadding(
        options.containerPaddingTop,
        options.containerPaddingRight,
        options.containerPaddingBottom,
        options.containerPaddingLeft);

    layout.setPaletteWidth(options.paletteWidth, options.paletteGutter);
    layout.setToolbarHeight(options.toolbarHeight, options.toolbarGutter);
    layout.setCanvasWidth(options.canvasWidth + options.canvasWidthExt);
    layout.setCanvasHeight(options.canvasHeight + options.canvasHeightExt);
    layout.setCanvasBorderOffset(options.canvasBorderOffset);
    layout.setFeedbackHeight(options.feedbackHeight, options.feedbackGutter);
    return layout;
};

// call this when you want to sync the models options to the grid UI
Grid.prototype.update = function()
{
    var options = this.model.options;

    // update the size of the grid dimensions
    if (options.updateLayout) {
        var layout = this.getLayout();
        this.view.updateLayout(layout);
    }

    // check if showing grid lines
    if (options.showGridLines) this.view.createGridLines(options.gridSpacing);
    else this.view.clearGridLines();

    // check if showing palette
    if (options.showPalette) this.view.showPalette();
    else this.view.hidePalette();

    // check if showing feedback
    if (options.showFeedback) this.view.showFeedback();
    else this.view.hideFeedback();

    // check if we need to add toolbar buttons
    if (options.showToolbar && options.showButtons.length > 0)
    {
        // show the toolbar
        this.view.showToolbar();
    
        var buttonNames = ['move']; // add move manually since it doesn't come in xml
        
        // add buttons in xml
        for (var i = 0; i < options.showButtons.length; i++)
        {
            var buttonName = options.showButtons[i];
            buttonNames.push(buttonName);
        }

        this.toolbar.enableButtons(buttonNames);
    }
    else
    {
        this.view.hideToolbar();
        this.toolbar.resetButtons();
    }

    this.view.updateCenterScaleImage(options.paletteCenter, options.paletteScale);

    // set mode
    this.setMode('move');
};

// load the grid answer space and response
Grid.prototype.loadXml = function(itemXml, responseXml)
{
    if (this._debug) logger.info('LOAD ITEM XML = ' + itemXml);

    // check if we are ready
    if (this.getState() < Grid.State.Ready)
    {
        throw Error('Grid is not ready to load (make sure to call init first).');
    }

    this._setState(Grid.State.Loading);

    var grid = this;

    // callback for when there is an error
    var callbackFailure = function(message, values)
    {
        grid._setState(Grid.State.Error, { message: message, values: values });
    };

    // callback for when the item is created
    var callbackCreated = function()
    {
        // get all the images on the grid
        var svgImages = grid.view.getElementsByTagName('image');

        // if there are any images we need to wait for them to load
        if (YAHOO.env.ua.gecko &&
            typeof ResourceLoader == 'function' &&
            (svgImages && svgImages.length > 0))
        {
            var imageLoader = new ResourceLoader.ImageCollection();

            for (var i = 0; i < svgImages.length; i++)
            {
                imageLoader.addImage(svgImages[i]);
            }

            imageLoader.load(callbackLoaded, function()
            {
                var imageErrors = imageLoader.getErrors();
                callbackFailure('Error loading SVG images', imageErrors);
            });
        }
        else
        {
            callbackLoaded();
        }
    };

    // callback when the item is loaded and ready
    var callbackLoaded = function()
    {
        // update grid options
        grid.update();

        // load response if any
        if (responseXml)
        {
            if (grid._debug) logger.info('LOAD RESPONSE XML = ' + responseXml);
            grid.importexport.loadAnswer(responseXml);
        }

        grid._setState(Grid.State.Loaded);
        grid.view.zoom(1);
    };

    // load item xml and wait for load callback
    this.importexport.loadItem(itemXml, callbackCreated, callbackFailure);
};

// get the response xml
Grid.prototype.getResponseXml = function()
{
    if (!this.isLoaded()) return null;
    return this.importexport.getAnswerXml();
};

// has the grid finished loading?
Grid.prototype.isLoaded = function()
{
    return (this.getState() == Grid.State.Loaded);
};

//  Check if xml passed in is different than what is the current response in the grid
Grid.prototype.hasChanged = function(xml)
{
    if (!this.isLoaded()) return false;

    // parse out just the response without the date for comparison purposes (DO NOT SAVE THIS TO DB)
    var cleanXml = function(xml)
    {
        if (xml == null) return '';
        var values = xml.split('DOCTYPE');
        // Bug 95512 Remove CarriageReturn characters to resolve Chrome comparison
        if (values.length > 1) return values[1].split(' ').join('').split('\r').join('');
        else return xml;
    };
    
    var currentAnswerXml = this.getResponseXml();
    return (cleanXml(currentAnswerXml) != cleanXml(xml));
};

// TODO: This function should validate if the current grid response is valid
Grid.prototype.isValid = function()
{
    // isStudentResponseValid?
    if (this.isLoaded())
    {
        if (this.importexport && this.importexport.isStudentResponseValid()) return true;
    }

    return false;
};

Grid.Hints =
{
    'SetPoint': 'Select locations of points',
    'Connect': 'Select 2 points to connect or press & drag to create & connect points.',
    'Arrow': 'Select 2 points to connect with arrow.',
    'DoubleArrow': 'Select 2 points to connect with double arrow.',
    'Delete': 'Select object to delete.',
    'AddValue': 'Select point or edge to add value',
    'AddLabel': 'Select location of label',
    'AddComponent': '',
    'MotionPending': 'Move object to new location and click where you want it.',
    'DraggingObject': 'Release the mouse button to drop it where you want it.',
    'WaitForDropDragging': 'Release the mouse button to drop it where you want it.',
    'WaitForDrop': 'Click to drop the object where you want it.',
    'None': ' '
};

// get feedback label
Grid.getHint = function(key) 
{ 
    if(typeof(window.Messages) == 'object')
    {
        // We have internationalized messages
        // The prefix here is match up with the keys used for internationalization
        return window.Messages.get("GridJS.Label.Hint"+key); 
    }
    return Grid.Hints[key] || ''; 
};

// set feedback label
Grid.prototype.setHint = function(key) { this.view.setFeedbackText(Grid.getHint(key)); };

Grid.prototype.setModeHint = function()
{
    var mode = this.getMode();

    switch(mode)
    {
        case 'move': this.setHint('None'); break;
        case 'delete': this.setHint('Delete'); break;
        case 'point': this.setHint('SetPoint'); break;
        case 'connect': this.setHint('Connect'); break;
        case 'arrow': this.setHint('Arrow'); break;
        case 'arrw2': this.setHint('DoubleArrow'); break;
        default: this.setHint('');
    }
};

Grid.prototype.setModeCursor = function()
{
    var mode = this.getMode();

    switch(mode)
    {
        case 'move': this.view.setCanvasCursor('default'); break;                
        case 'delete': this.view.setCanvasCursor('crosshair'); break;
        case 'arrow': this.view.setCanvasCursor('pointer'); break; // alias
        case 'arrw2': this.view.setCanvasCursor('pointer'); break; // alias
        case 'point': this.view.setCanvasCursor('pointer'); break; // pointer
        case 'connect': this.view.setCanvasCursor('pointer'); break;
        default: this.view.setCanvasCursor('default');
    }
};

// Use this to assign normalized mouse handlers to an element
// HANDLER OBJECT:
// - name (mousedown, mouseup, mousemove, dragstart, drag, dragend)
// - clickedPosition (remembers original click for drag start)
// - currentPosition
// - raw (dom event)
// - target (element)
Grid.prototype.addMouseListener = function(id, handler)
{
    // get group and check if it exists
    var group = this.view.getElementById(id);
    if (!group) return false;

    // state variables
    var grid = this;
    var isClicked = false; // have we clicked and not released?
    var isDragging = false; // are we dragging something?
    var clickedPosition = null; // what was original click position

    // define function used to assign to mouse events
    var mouseEventHandler = function(name /*event name*/, evt /*DOMEvent*/)
    {
        // stop browser event
        evt.preventDefault();
        
        var clientX = evt.clientX - 0.5;
        var clientY = evt.clientY - 0.5;

        // get position
        var currentPosition = grid.view.translateElement(group, clientX, clientY);
        // console.log('mouseEventHandler: ' + id + ' (' + currentPosition.x + ',' + currentPosition.y + ')');

        // NOTE: on IE I guess with flash that the clientX/Y is already an integer..
        // Bug 87590: iPads with Retina displays can have clientX/Y with fractional positions
        // https://developer.apple.com/library/ios/documentation/windowsviews/conceptual/viewpg_iphoneos/WindowsandViews/WindowsandViews.html#//apple_ref/doc/uid/TP40009503-CH2-SW15
        if (YAHOO.env.ua.ie || YAHOO.env.ua.ios)
        {
            currentPosition.x = Math.round(currentPosition.x);
            currentPosition.y = Math.round(currentPosition.y);
        }

        // if mousing down then save this as the clicked point
        if (name == 'mousedown') clickedPosition = currentPosition;

        var callHandler = function(eventName) {
            // create fake event
            var svgEvent = {
                name: eventName,
                target: evt.target,
                raw: evt,
                currentPosition: currentPosition,
                clickedPosition: clickedPosition,
                touch: evt.touch === true
            };
            // call event handler
            handler(svgEvent);
        };

        if (name == 'mousedown') // click
        {
            if (isDragging)
            {
                // NOTE: this is for if you start dragging, move your mouse off the screen, release mouse button, then move mouse back to canvas and click
                callHandler('dragend');
                isClicked = false;
                isDragging = false;
            }
            else
            {
                isClicked = true;
                callHandler('mousedown');
            }
        }
        else if (name == 'mousemove') // movement 
        {
            if (isClicked) {

                // check if we should begin the drag event 
                if (!isDragging) {

                    // check if the mouse actually moved
                    var hasMoved = (clickedPosition.x != currentPosition.x || 
                                    clickedPosition.y != currentPosition.y);

                    // fire drag begin event and mark as dragging
                    if (hasMoved) {
                        callHandler('dragbegin');
                        isDragging = true;
                    }
                }

                // fire the drag event 
                if (isDragging) {
                    callHandler('drag');
                }
            } else {
                callHandler('mousemove');
            }

        }
        else if (name == 'mouseup') // click release
        {
            if (isDragging)
            {
                callHandler('dragend');
                isDragging = false;
            }
            else if (isClicked)
            {
                callHandler('mouseup');
            }

            isClicked = false;
            clickedPosition = null;
        }

        // make sure to focus on svg when a click occurs
        if (name == 'mousedown') {
            grid.view._svgWin.focus();
        }
    };

    // subscribe to browsers real dom events
    Grid.Utils.addMouseListener(group, 'mousedown', function(evt) {
        mouseEventHandler('mousedown', evt);
    });

    Grid.Utils.addMouseListener(group, 'mousemove', function(evt) {
        mouseEventHandler('mousemove', evt);
    });

    Grid.Utils.addMouseListener(group, 'mouseup', function(evt) {
        mouseEventHandler('mouseup', evt);
    });
    
    // group.addEventListener('mouseover', function(evt) { mouseEventHandler.call(grid, 'mouseover', evt); }, false);
    // group.addEventListener('mouseout', function(evt) { mouseEventHandler.call(grid, 'mouseout', evt); }, false);

    return true;
};

Grid.prototype.dispose = function()
{
    if (this.view) this.view.dispose();

    // TODO: dispose all events

    // fire grid create event
    Grid.Events.fireLazy('onDispose', this);
};

// Call this function to validate the grids model and config
// Usage: BlackboxLoader.getContentManager().getCurrentPage().getItems()[0].grid.validate()
Grid.prototype.validate = function()
{
    // only perform validation on Firefox browsers
    if (YAHOO.env.ua.gecko == 0) return true;
    
    // create a helper function for logging an image error
    var setError = Util.bind(function(msg, modelImage) 
    {
        if (typeof console == 'object') console.error('GRID: ' + msg);
        this._setState(GridState.Error, { message: msg, values: [ modelImage ] });
        return false;
    }, this);
    
    var modelImages = [];

    // get all background images
    modelImages = modelImages.concat(this.model.getBackgroundImages());

    // get all canvas images
    modelImages = modelImages.concat(this.model.getImages());

    // get all regions images
    modelImages = modelImages.concat(this.model.getRegionsImages());

    for (var i = 0; i < modelImages.length; i++)
    {
        // get the model and bounding rectangle used for positioning
        var modelImage = modelImages[i];
        var modelRect = modelImage.getBoundingRect();

        // check if in bounds of the grid (a bit of tolerence for older items)
        var inBounds = (modelRect.left >= -1 && modelRect.left <= this.view.width &&
                        modelRect.top >= -1 && modelRect.top <= this.view.height);

        if (!inBounds) return setError('Error with position of image out of bounds', modelImage);

        // get the svg image
        var svgImage = this.view.getElementById(modelImage.getID());
        if (!svgImage) return setError('Error finding the svg image', modelImage);

        // check visibility
        if (modelImage.isVisible())
        {
            if (svgImage.getAttribute('display') == 'none')
            {
                return setError('Error with image it should be visible but it is hidden', modelImage);
            }
        }
        else
        {
            if (svgImage.getAttribute('display') != 'none')
            {
                return setError('Error with image it should be hidden but it is visible', modelImage);
            }
        }
        
        // get svg attributes
        var imgAttribs = {
            x: svgImage.getAttribute('x') * 1,
            y: svgImage.getAttribute('y') * 1,
            width: svgImage.getAttribute('width') * 1,
            height: svgImage.getAttribute('height') * 1
        };

        // check dimension attributes
        if (modelRect.width != imgAttribs.width ||
            modelRect.height != imgAttribs.height)
        {
            return setError('Error with the attributes width/height of image', modelImage);
        }

        // check position attributes
        if (modelRect.left != imgAttribs.x ||
            modelRect.top != imgAttribs.y)
        {
            return setError('Error with the attributes position of image', modelImage);
        }

        // get bounding box of image (this will return an error if element is hidden)
        var imgRect = null;

        if (modelImage.isVisible() && typeof svgImage.getBBox == 'function')
        {
            try { imgRect = svgImage.getBBox(); }
            catch (ex)
            {
                // REVIEW: debatable if we should set error screen here..
                return setError('Error with image bounding box', modelImage);
            }
        }

        // check if bounding box matches model
        if (imgRect)
        {
            // check dimension of bounding box
            if (modelRect.width != imgRect.width ||
                modelRect.height != imgRect.height)
            {
                return setError('Error with the bounding box width/height of image', modelImage);
            }

            // check position of bounding box
            if (modelRect.left != imgRect.x ||
                modelRect.top != imgRect.y)
            {
                return setError('Error with the bounding box position of image', modelImage);
            }
        }
    }

    return true;
};