/* OPTIONS CLASS */
// XML: <Question> <QuestionPart> <Options>
Grid.Model.Options = function()
{
    this.updateLayout = true; // if true then update grid svg layout

    // CONTAINER:
    this.containerPaddingTop = 0;
    this.containerPaddingRight = 1;
    this.containerPaddingBottom = 1;
    this.containerPaddingLeft = 0;

    // PALETTE:
    this.showPalette = false; // was an object or atomic object loaded as part of the answer space?
    this.paletteWidth = 75;
    this.paletteGutter = 5; // canvas <----> palette
    this.paletteCenter = false; //will place image at the center of palette holder
    this.paletteScale = false; //will scale image to fit palette image holder

    // TOOLBAR:
    this.showToolbar = true;
    this.toolbarHeight = 21;
    this.toolbarGutter = 4; // toolbar <----> canvas
    this.showButtons = []; // collection buttons to show (delete, point, connect, arrow, arrw2)

    // CANVAS:
    this.canvasWidth = 500; // used in model
    this.canvasWidthExt = 2;
    this.canvasHeight = 410; // used in model
    this.canvasHeightExt = 1;
    this.canvasBorderOffset = -1; // NOTE: for some reason the x/y of border was set to this by default
    this.properLineGeometry = false; // Enables transparent objects on canvas.  Transparent objects are invisible, but can be manipulated

    this.showGridLines = false; // this is true if grid color is 'None'
    this.gridColor = 'None'; // NOTE: This will be 'None' or 'LightBlue' always
    this.gridSpacing = 0; // the spacing in between the grid lines
    this.snapToGrid = false; // snap to the grid spacing?
    this.snapRadius = 0;
    this.selectionTolerance = 0; // NOTE: this is not used
    
    // FEEDBACK:
    this.showFeedback = true;
    this.feedbackHeight = 30;
    this.feedbackGutter = 4; // canvas <----> feedback
};

Grid.Model.Options.prototype.addButton = function(button)
{
    if (button == 'delete' || 
        button == 'point' || 
        button == 'connect' || 
        button == 'arrow' || 
        button == 'arrw2' || 
        button == 'dash' || 
        button == 'circle') {
        this.showButtons.push(button);
    }
};

Grid.Model.Options.prototype.clearButtons = function() {
    this.showButtons = [];
};