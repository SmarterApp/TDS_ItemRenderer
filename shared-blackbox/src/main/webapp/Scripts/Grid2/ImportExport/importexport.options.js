Grid.ImportExport.removeQuotes = function(str) {
    var first = str.indexOf('"');
    if (first == -1) return str;
    str = str.substring(first + 1);
    var second = str.lastIndexOf('"');
    if (second == -1) return str;
    return str.substring(0, second);
};

// check if an element exists and it has a value
Grid.ImportExport.hasElementValue = function(xml, id) {
    var el = xml.getElementsByTagName(id);
    return (el && el[0] && el[0].childNodes[0]);
};

// finds a xml element and returns node string
Grid.ImportExport.getElementString = function(xml, id) {
    var el = xml.getElementsByTagName(id);
    
    if (el && el[0] && el[0].childNodes[0]) {
        return this.removeQuotes(el[0].childNodes[0].nodeValue);
    }

    return null;
};

// get the boolean value for an element
Grid.ImportExport.getElementBool = function(xml, id) {
    var value = Grid.ImportExport.getElementString(xml, id);
    return (value && value === 'true');
};

Grid.ImportExport.getElementInt = function(xml, id) {
    var value = Grid.ImportExport.getElementString(xml, id);
    return (value) ? parseInt(value) : 0;
};

// parse the options out of the xml and load them into the model
Grid.ImportExport.loadOptions = function(gridXml, model) {

    var options = model.options;
    
    if (this.hasElementValue(gridXml, 'UpdateLayout')) {
        options.updateLayout = this.getElementBool(gridXml, 'UpdateLayout');
    }

    /* Container */

    if (this.hasElementValue(gridXml, 'ContainerPaddingTop')) {
        options.containerPaddingTop = this.getElementInt(gridXml, 'ContainerPaddingTop');
    }

    if (this.hasElementValue(gridXml, 'ContainerPaddingRight')) {
        options.containerPaddingRight = this.getElementInt(gridXml, 'ContainerPaddingRight');
    }

    if (this.hasElementValue(gridXml, 'ContainerPaddingBottom')) {
        options.containerPaddingBottom = this.getElementInt(gridXml, 'ContainerPaddingBottom');
    }

    if (this.hasElementValue(gridXml, 'ContainerPaddingLeft')) {
        options.containerPaddingLeft = this.getElementInt(gridXml, 'ContainerPaddingLeft');
    }

    /* PALETTE */

    // the business rules in importexport.js (line 821) makes this code unused
    /*if (this.hasElementValue(gridXml, 'ShowPalette')) {
        options.showPalette = this.getElementBool(gridXml, 'ShowPalette');
    }*/

    if (this.hasElementValue(gridXml, 'PaletteWidth')) {
        options.paletteWidth = this.getElementInt(gridXml, 'PaletteWidth');
    }
    
    if (this.hasElementValue(gridXml, 'PaletteGutter')) {
        options.paletteGutter = this.getElementInt(gridXml, 'PaletteGutter');
    }
    
    // check if centering palette images
    var centerImageNode = gridXml.getElementsByTagName("CenterImage");
    if ((centerImageNode) && (centerImageNode[0]) && (centerImageNode[0].childNodes[0])) {
        options.paletteCenter = (centerImageNode[0].childNodes[0].nodeValue == 'true') ? true : false;
    }

    // check if scalling palette images
    var scaleImageNode = gridXml.getElementsByTagName("ScaleImage");
    if ((scaleImageNode) && (scaleImageNode[0]) && (scaleImageNode[0].childNodes[0])) {
        options.paletteScale = (scaleImageNode[0].childNodes[0].nodeValue == 'true') ? true : false;
    }

    /* TOOLBAR */

    if (this.hasElementValue(gridXml, 'ShowToolbar')) {
        options.showToolbar = this.getElementBool(gridXml, 'ShowToolbar');
    }

    if (this.hasElementValue(gridXml, 'ToolbarHeight')) {
        options.toolbarHeight = this.getElementInt(gridXml, 'ToolbarHeight');
    }

    if (this.hasElementValue(gridXml, 'ToolbarGutter')) {
        options.toolbarGutter = this.getElementInt(gridXml, 'ToolbarGutter');
    }
    
    // parse buttons
    var buttonNode = gridXml.getElementsByTagName("ShowButtons");
    if ((buttonNode) && (buttonNode[0]) && (buttonNode[0].childNodes[0]) && (buttonNode[0].childNodes[0].nodeValue)) {
        
        var buttons = this.removeQuotes(buttonNode[0].childNodes[0].nodeValue).split(",");
        for (var i = 0; i < buttons.length; i++) {
            options.addButton(buttons[i]);
        }
    }

    /* CANVAS */

    if (this.hasElementValue(gridXml, 'CanvasWidth')) {
        options.canvasWidth = this.getElementInt(gridXml, 'CanvasWidth');
    }

    if (this.hasElementValue(gridXml, 'CanvasWidthExt')) {
        options.canvasWidthExt = this.getElementInt(gridXml, 'CanvasWidthExt');
    }

    if (this.hasElementValue(gridXml, 'CanvasHeight')) {
        options.canvasHeight = this.getElementInt(gridXml, 'CanvasHeight');
    }

    if (this.hasElementValue(gridXml, 'CanvasHeightExt')) {
        options.canvasHeightExt = this.getElementInt(gridXml, 'CanvasHeightExt');
    }

    if (this.hasElementValue(gridXml, 'CanvasBorderOffset')) {
        options.canvasBorderOffset = this.getElementInt(gridXml, 'CanvasBorderOffset');
    }
    
    if (this.hasElementValue(gridXml, 'ProperLineGeometry')) {
        options.properLineGeometry = this.getElementBool(gridXml, 'ProperLineGeometry');
    }
    
    // parse selection tolerance
    var selectionToleranceNode = gridXml.getElementsByTagName("SelectionTolerance");
    if ((selectionToleranceNode) && (selectionToleranceNode[0]) && (selectionToleranceNode[0].childNodes[0])) {
        options.selectionTolerance = parseInt(this.removeQuotes(selectionToleranceNode[0].childNodes[0].nodeValue));
    }

    // parse grid spacing and snap to grid
    var gridSpacingNode = gridXml.getElementsByTagName("GridSpacing");
    if ((gridSpacingNode) && (gridSpacingNode[0]) && (gridSpacingNode[0].childNodes[0])) {

        var spacingStr = gridSpacingNode[0].childNodes[0].nodeValue;
        spacingStr = this.removeQuotes(spacingStr.replace(/^\s+|\s+$/g, ""));
        var strSplit = spacingStr.split(",");
        options.gridSpacing = parseInt(strSplit[0].replace(/^\s+|\s+$/g, ""));
        if (strSplit[1].replace(/^\s+|\s+$/g, "") == "Y") options.snapToGrid = true;
        else options.snapToGrid = false;
    }

    // parse grid color and if we should show grid lines
    var gridColorNode = gridXml.getElementsByTagName("GridColor");
    if ((gridColorNode) && (gridColorNode[0]) && (gridColorNode[0].childNodes[0])) {

        options.gridColor = this.removeQuotes(gridColorNode[0].childNodes[0].nodeValue);

        // NOTE: If the grid lines is not set to "None" then show the grid lines
        options.showGridLines = (options.gridColor != 'None');
    }

    /* FEEDBACK */

    if (this.hasElementValue(gridXml, 'ShowFeedback')) {
        options.showFeedback = this.getElementBool(gridXml, 'ShowFeedback');
    }

    if (this.hasElementValue(gridXml, 'FeedbackHeight')) {
        options.feedbackHeight = this.getElementInt(gridXml, 'FeedbackHeight');
    }

    if (this.hasElementValue(gridXml, 'FeedbackGutter')) {
        options.feedbackGutter = this.getElementInt(gridXml, 'FeedbackGutter');
    }


};