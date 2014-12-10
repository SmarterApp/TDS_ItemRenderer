Grid.Layout = function() {

    var containerPaddingTop = 0;
    var containerPaddingRight = 0;
    var containerPaddingBottom = 0;
    var containerPaddingLeft = 0;

    var canvasWidth = 0;
    var canvasHeight = 0;
    var canvasBorderOffset = 0;

    var paletteWidth = 0;
    var toolbarHeight = 0;
    var feedbackHeight = 0;

    var paletteGutter = 0; // canvas <----> palette
    var toolbarGutter = 0; // toolbar <----> canvas
    var feedbackGutter = 0; // canvas <----> feedback

    /*******/

    this.setContainerPadding = function(top, right, bottom, left) {
        containerPaddingTop = top;
        containerPaddingRight = right;
        containerPaddingBottom = bottom;
        containerPaddingLeft = left;
    };

    this.setCanvasWidth = function(width) {
        canvasWidth = width;
    };

    this.setCanvasHeight = function(height) {
        canvasHeight = height;
    };

    this.setCanvasBorderOffset = function(offset) {
        canvasBorderOffset = offset;
    };

    this.setPaletteWidth = function(width, gutter) {
        paletteWidth = width;
        paletteGutter = gutter;
    };

    this.setToolbarHeight = function(height, gutter) {
        toolbarHeight = height;
        toolbarGutter = gutter;
    };

    this.setFeedbackHeight = function(height, gutter) {
        feedbackHeight = height;
        feedbackGutter = gutter;
    };

    /*******/

    this.getCanvasWidth = function() {
        return canvasWidth;
    };

    this.getCanvasHeight = function() {
        return canvasHeight;
    };

    this.getCanvasBorderOffset = function() {
        return canvasBorderOffset;
    };

    this.getToolbarWidth = function() {
        return this.getToolbarHeight() > 0 ? this.getCanvasWidth() : 0;
    };

    this.getToolbarHeight = function() {
        return toolbarHeight;
    };

    this.getToolbarGutter = function() {
        return (toolbarHeight > 0) ? toolbarGutter : 0;
    };

    this.getFeedbackWidth = function() {
        return this.getFeedbackHeight() > 0 ? this.getCanvasWidth() : 0;
    };

    this.getFeedbackHeight = function() {
        return feedbackHeight;
    };

    this.getFeedbackGutter = function() {
        return (feedbackHeight > 0) ? feedbackGutter : 0;
    };

    // get the internal width
    this._getWidth = function() {
        return this.getPaletteWidth() + this.getPaletteGutter() + this.getCanvasWidth();
    };

    // get the internal height
    this._getHeight = function() {
        return this.getToolbarHeight() + this.getToolbarGutter() + this.getCanvasHeight() + 
               this.getFeedbackGutter() + this.getFeedbackHeight();
    };

    this.getPaletteWidth = function() {
        return paletteWidth;
    };

    this.getPaletteHeight = function() {
        return this._getHeight();
    };

    this.getPaletteGutter = function() {
        return (paletteWidth > 0) ? paletteGutter : 0;
    };

    this.getGridWidth = function() {
        return this._getWidth() + containerPaddingLeft + containerPaddingRight;
    };

    this.getGridHeight = function() {
        return this._getHeight() + containerPaddingTop  + containerPaddingBottom;
    };

    /*******/

    this.getContainerPaddingTop = function() {
        return containerPaddingTop;
    };

    this.getContainerPaddingLeft = function() {
        return containerPaddingLeft;
    };

    this.getContainerPaddingBottom = function() {
        return containerPaddingBottom;
    };

    this.getContainerPaddingRight = function() {
        return containerPaddingRight;
    };

    this.getPaletteX = function() {
        return 0;
    };

    this.getPaletteY = function() {
        return 0;
    };

    this.getToolbarX = function() {
        return this.getPaletteWidth() + this.getPaletteGutter();
    };

    this.getToolbarY = function() {
        return 0;
    };

    this.getCanvasX = function() {
        return this.getPaletteWidth() + this.getPaletteGutter();
    };

    this.getCanvasY = function() {
        return this.getToolbarHeight() + this.getToolbarGutter();
    };

    this.getFeedbackX = function() {
        return this.getPaletteWidth() + this.getPaletteGutter();
    };

    this.getFeedbackY = function() {
        return this.getToolbarHeight() + this.getToolbarGutter() + this.getCanvasHeight() + this.getFeedbackGutter();
    };

};

Grid.Layout.debug = function(layout) {

    console.log('Palette: width=%d height=%d x=%d y=%d visible=%s', 
        layout.getPaletteWidth(), layout.getPaletteHeight(), layout.getPaletteX(), layout.getPaletteY());

    console.log('Toolbar: width=%d height=%d x=%d y=%d visible=%s', 
        layout.getToolbarWidth(), layout.getToolbarHeight(), layout.getToolbarX(), layout.getToolbarY());

    console.log('Canvas: width=%d height=%d x=%d y=%d', 
        layout.getCanvasWidth(), layout.getCanvasHeight(), layout.getCanvasX(), layout.getCanvasY());

    console.log('Feedback: width=%d height=%d x=%d y=%d visible=%s', 
        layout.getFeedbackWidth(), layout.getFeedbackHeight(), layout.getFeedbackX(), layout.getFeedbackY());
};

/**********************************************************************/

// update the svg layout
Grid.View.prototype.updateLayout = function(layout) {

    // set palette element
    this.setAttribute('groupPalette', 'transform', 'translate(' + 
        layout.getPaletteX() + ',' + 
        layout.getPaletteY() + ')');

    this.setAttributes('backgroundPalette', {
       'width': layout.getPaletteWidth(),
       'height': layout.getPaletteHeight()
    });

    // set toolbar element
    this.setAttribute('groupToolbar', 'transform', 'translate(' + 
        layout.getToolbarX() + ',' + 
        layout.getToolbarY() + ')');

    this.setAttributes('backgroundToolbar', {
       'width': layout.getToolbarWidth(),
       'height': layout.getToolbarHeight()
    });

    // set canvas element
    this.setAttribute('groupCanvas', 'transform', 'translate(' + 
        layout.getCanvasX() + ',' + 
        layout.getCanvasY() + ')');

    this.setAttributes('backgroundCanvas', {
       'width': layout.getCanvasWidth(),
       'height': layout.getCanvasHeight(),
       'x': layout.getCanvasBorderOffset(),
       'y': layout.getCanvasBorderOffset()
    });

    // set feedback element
    this.setAttribute('groupFeedback', 'transform', 'translate(' + 
        layout.getFeedbackX() + ',' + 
        layout.getFeedbackY() + ')');

    this.setAttributes('backgroundFeedback', {
       'width': layout.getFeedbackWidth(),
       'height': layout.getFeedbackHeight()
    });

    // set container offset
    this.setAttribute('groupWrapper', 'transform', 'translate(' + 
        (layout.getContainerPaddingLeft() + 0.5) + ',' + 
        (layout.getContainerPaddingTop() + 0.5) + ')');

    // set container element
    this.width = layout.getGridWidth();
    this.height = layout.getGridHeight();
    this.zoom();
};