var crToolMouseDownPoint = {x: -1,y: -1};
var crToolMouseDragPoint = {x: -1,y: -1};
var crToolMouseUpPoint = {x: -1,y: -1};

var CRToolMode =
{
    Test: 0, //TDS test mode
	Question: 1, //Grid Tool Question 
	Dot: 2,
	Rectangle: 3,
	Circle: 4,
	NoAction: 5,
    Hotspots: 6
};

function CRTool(grid, mode)
{
    this.grid = grid;
    this._selectedBackgroundImage = null;
    if (mode) this.mode = mode;
    else this.mode = CRToolMode.Test;
    this.resetCRToolData();
    this.grid.showCoordinates = true;
};

CRTool.prototype.setMode = function(mode)
{
    this.mode = mode;
    this.resetCRToolData();

    this.clearCRToolUI();
    this.paletteAndSnapPointUIControl();

}

CRTool.prototype.getMode = function()
{
    return this.mode;
}

CRTool.prototype.processBackgroundImage = function(evt)
{
    if (evt.name == 'mousedown' && evt.target != null)
    {
        var entity = this.grid.model.getEntity(evt.target.id);
        
        if (entity && entity.getType() == 'backgroundimage')
        {
            // select element
            this.grid.canvas.setFocused(entity);
            var id = this.grid.canvas._currentFocus.getID();
            //this.grid.view.selectImage(id); 
            this._selectedBackgroundImage = this.grid.canvas._currentFocus;
            return true;
        }
        else
        {
            this.grid.canvas.clearFocused();
            return false;
        }
    } 
    else if (evt.name == 'drag')
    {
        if (this._selectedBackgroundImage)
        {
            var x = evt.currentPosition.x, y = evt.currentPosition.y;
            //Grid.Model.Image.superclass.moveTo.call(this, moveX, moveY, preventSnap); 
            //logger.debug('drag bkg to: ' + x + ',' + y);
            this._selectedBackgroundImage.moveTo(x, y, true); //prevent snap to grid
            var id = this._selectedBackgroundImage.getID();
            var entity = this._selectedBackgroundImage;
            this.grid.view.moveImage(id, entity.x, entity.y, entity.width, entity.height, true);
            return true;
        }

    } 
    else if (evt.name == 'dragend')
    {
        //this.grid.canvas.clearSelected();
        //need clear the border
        if (this._selectedBackgroundImage)
        {
            var id = this._selectedBackgroundImage.getID();
            this.grid.view.deselectImage(id);

            //reset x,y to left upper corner
            this._selectedBackgroundImage.x = this._selectedBackgroundImage.x - this._selectedBackgroundImage.width / 2;
            this._selectedBackgroundImage.y = this._selectedBackgroundImage.y - this._selectedBackgroundImage.height;

            this._selectedBackgroundImage = null;
            return true;
        }
    }

    return false;
};

CRTool.prototype.resetCRToolData = function()
{
    crToolMouseUpPoint.x = -1;
	crToolMouseUpPoint.y = -1;
	        
    crToolMouseDragPoint.x = -1;
	crToolMouseDragPoint.y = -1;

    crToolMouseDownPoint.x = -1;
	crToolMouseDownPoint.y = -1;	
}

CRTool.prototype.clearCRToolUI = function()
{

    var crtoolShapes = ['crtool_rectangle', 'crtool_circle'];
    for (var i=0; i<crtoolShapes.length; i++) removeChildren(crtoolShapes[i]);
}

function removeChildren(id) {
    var crtoolNode = this.grid.view.getElementById(id);
        
    var len = crtoolNode.childNodes.length;
    var centerIDs = [];
        
    for (var i=0; i<len; i++)
    {
        centerIDs.push(crtoolNode.childNodes[i].id);
    }
    for (var j=0; j<len; j++)
    {
        this.grid.view.removeElement(centerIDs[j]);
    }
}

CRTool.prototype.paletteAndSnapPointUIControl = function()
{
    if (this.getMode() == CRToolMode.Question) {
        if (this.grid.model.options.paletteWidth > 0 && 
                !this.grid.model.options.showPalette) this.grid.view.showPalette();
    } else {
        this.clearSnapPointsUI();
        if (this.grid.model.options.showPalette) this.grid.view.showPalette();
        else this.grid.view.hidePalette();
    }
    if (this.getMode() != CRToolMode.Test) this.showSnapPoints();
}

CRTool.prototype.setMouseDownPoint = function(x,y)
{
    //reset crToolMode points
    crToolMouseUpPoint.x = -1;
	crToolMouseUpPoint.y = -1;
	        
    crToolMouseDragPoint.x = -1;
	crToolMouseDragPoint.y = -1;

    // need to add snap to grid later
	crToolMouseDownPoint.x = x;
	crToolMouseDownPoint.y = y;
}

CRTool.prototype.setMouseDragPoint = function(x,y)
{
    crToolMouseDragPoint.x = x;
	crToolMouseDragPoint.y = y;
}

CRTool.prototype.setMouseUpPoint = function(x,y)
{
//  crToolMouseDragPoint.x = -1;
//	crToolMouseDragPoint.y = -1;
	    
    crToolMouseUpPoint.x = x;
	crToolMouseUpPoint.y = y;
}

CRTool.prototype.getCRToolData = function(type)
{
    if (type == 'mousedown') return crToolMouseDownPoint.x + ',' + crToolMouseDownPoint.y;
    if (type == 'drag')      return crToolMouseDragPoint.x + ',' + crToolMouseDragPoint.y;
    if (type == 'dragend')   return crToolMouseUpPoint.x + ',' + crToolMouseUpPoint.y;
    return '-1,-1';
}

CRTool.prototype.setCRToolMouseLocation = function(evt) 
{
	var x = Math.round(evt.currentPosition.x),
		y = Math.round(evt.currentPosition.y);
	
	if (evt.name == 'mousedown')
	{
        this.setMouseDownPoint(x,y);
	} else
	
	if (evt.name == 'drag')
	{
	    this.setMouseDragPoint(x,y);
	} else
	
	if (evt.name == 'mouseup' || evt.name == 'dragend')
	{
		this.setMouseUpPoint(x,y);
	}
    //logger.debug('CRTool-Mode:' + this.getMode() + ' ' + this.getCRToolData('mousedown') + ' ' + this.getCRToolData('drag') +' ' + this.getCRToolData('dragend'));
};

CRTool.prototype.updateCRToolUI = function(evt)
{
    if (evt.name == 'mousemove') return;
    //var container = 'crtool'; //change to crTool later
    if (this.mode == CRToolMode.Rectangle) {
        
        if (this.dataReady('mousedown') && this.dataReady('mouseup')) {
            this.drawCRToolRectangle(crToolMouseDownPoint.x, crToolMouseDownPoint.y, crToolMouseUpPoint.x, crToolMouseUpPoint.y);
        } else {
            if (this.dataReady('mousedown') && this.dataReady('drag')) {
                this.drawCRToolRectangle(crToolMouseDownPoint.x, crToolMouseDownPoint.y,crToolMouseDragPoint.x, crToolMouseDragPoint.y);
            }
        }
    } else
   
    if (this.mode == CRToolMode.Circle) {
        
        if (this.dataReady('mousedown') && this.dataReady('mouseup')) {
            var r = Math.sqrt( Math.pow((crToolMouseDownPoint.x-crToolMouseUpPoint.x),2) + Math.pow((crToolMouseDownPoint.y-crToolMouseUpPoint.y),2));
            this.drawCRToolCircle(crToolMouseDownPoint.x, crToolMouseDownPoint.y,r);
        } else {
            if (this.dataReady('mousedown') && this.dataReady('drag')) {
                var r = Math.sqrt( Math.pow((crToolMouseDownPoint.x-crToolMouseDragPoint.x),2) + Math.pow((crToolMouseDownPoint.y-crToolMouseDragPoint.y),2));
                this.drawCRToolCircle(crToolMouseDownPoint.x, crToolMouseDownPoint.y,r);
            }
        }
    } else
    
    if (this.mode == CRToolMode.Question) {
        if (!this.getSnapToPointFlag()) return;
        if (this.dataReady('mousedown') && this.dataReady('mouseup')) {
            if ( (crToolMouseDownPoint.x == crToolMouseUpPoint.x) && (crToolMouseDownPoint.y == crToolMouseUpPoint.y) ) {
                var snapPoint = this.grid.model.addSnapPoint(crToolMouseDownPoint.x, crToolMouseDownPoint.y, this.getSnapToPointRadius());
                this.resetCRToolData();
                this.showSnapPoints();
            }
       }
    }
}

CRTool.prototype.showSnapPoints = function()
{
    //var container = 'crtool';
    var snapPnts = this.grid.model.getSnapPoints();
    this.clearSnapPointsUI();
    if ((snapPnts) && (snapPnts.length > 0)) {
        for (var i=0; i<snapPnts.length; i++) {
            var id = snapPnts[i].getID();
            this.grid.view.createSnapToPointAndCircle(snapPnts[i].x, snapPnts[i].y, this.getSnapToPointRadius(), id);        
        }
    }
}

CRTool.prototype.clearSnapPointsUI = function()
{
    removeChildren('crtool_snapcenter');
    removeChildren('crtool_snapcircle');
}

CRTool.prototype.drawCRToolCircle = function(x,y,r)
{
    this.clearCRToolUI();
    this.grid.view.createCRToolCircle(x,y,r);
}

CRTool.prototype.drawCRToolRectangle = function(x1,y1,x2,y2)
{
    this.clearCRToolUI();
    this.grid.view.createCRToolRectangle(x1,y1,x2,y2);
}

CRTool.prototype.crToolDrawDot = function(x,y)
{
}

CRTool.prototype.getSnapToPointFlag = function()
{
    return (document.getElementById('snapToPoint').checked);
}

CRTool.prototype.getSnapToPointRadius = function()
{
    return (document.getElementById('snapPointRadius').value);
}

CRTool.prototype.deleteSnapPoint = function(evt)
{
    var snapPoints = this.grid.model.getSnapPoints();
    for (var i=0; i<snapPoints.length; i++) {
        if (('snapPointCenter_snappoint_' + snapPoints[i]._id) == evt.target.id) {
            this.grid.view.removeElement(evt.target.id);
            this.grid.view.removeElement('snapPointCircle_snappoint_' + snapPoints[i]._id);
            this.grid.model.deleteSnapPoint(snapPoints[i]);
            this.showSnapPoints();
            return true;        
        }
    }
    return false;    
}

CRTool.prototype.dataReady = function (type)
{
    if ((type == 'mousedown') && (crToolMouseDownPoint.x >=0) && (crToolMouseDownPoint.y >=0)) return true;
    if ((type == 'drag') && (crToolMouseDragPoint.x >=0) && (crToolMouseDragPoint.y >=0)) return true;
    if ((type == 'mouseup') && (crToolMouseUpPoint.x >=0) && (crToolMouseUpPoint.y >=0)) return true;
    return false;
}

//CRTool.prototype.getCircleParameters = function()
//{
//    return 'circle';
//}

//CRTool.prototype.getRectangleParameters = function()
//{
//    return 'rectangle';
//}



CRTool.prototype.listStaticGridImages = function()
{

    function removePath(urlFile) 
    {
        if (urlFile.indexOf('localhost') == -1)
        {
            //var pathname = window.location.pathname;
            var index = urlFile.lastIndexOf("/");
            var file = '../NET/WebGraphicReview/'+ urlFile.substring(index + 1);
            return file;
        } else {
            var pathname = window.location.pathname;
            var index = pathname.lastIndexOf("/");
            pathname = pathname.substring(0, index);
            pathname = window.location.protocol + "//" + window.location.host + pathname;
            index = urlFile.indexOf(pathname);
            if (index != -1) return urlFile.substring(pathname.length+1);
            else return urlFile;        
        }
    }    

    //format imagename|20,20;image2|30,30
    var bkgImages = this.grid.model.getBackgroundImages();
    var imageList = '';
    for (var i=0; i<bkgImages.length; i++) {
//        if (bkgImages[i].locationUpdate == null) {
//            bkgImages[i].locationUpdate = true;
//            imageList += translateImageLinkToDisplayName(removePath(bkgImages[i].url) + '|' + 
//                (bkgImages[i].x - bkgImages[i].width/2)  + ',' + 
//                (bkgImages[i].y - bkgImages[i].height));
//        } else 
//        {
//            imageList += translateImageLinkToDisplayName(removePath(bkgImages[i].url) + '|' + 
//                bkgImages[i].x  + ',' + bkgImages[i].y);            
//        }

        imageList += translateImageLinkToDisplayName(removePath(bkgImages[i].url) + '|' + 
                bkgImages[i].x  + ',' + bkgImages[i].y);      
        if (i != bkgImages.length-1) imageList += ';';
    }
    return imageList;
}




CRTool.prototype.crToolGetGridPoint = function()
{
    var CanvasHeight = this.grid.model.options.canvasHeight;
    if ((crToolMouseDownPoint.x == -1) || (crToolMouseUpPoint.x == -1)) return '0,0';
    if ((crToolMouseDownPoint.x == crToolMouseUpPoint.x) && (crToolMouseDownPoint.y == crToolMouseUpPoint.y))
        return (crToolMouseDownPoint.x + ',' + (CanvasHeight - crToolMouseDownPoint.y));
    return '0,0';

}

CRTool.prototype.crToolGetCenterAndTolerance = function()
{

    var CanvasHeight = this.grid.model.options.canvasHeight;
    if ((crToolMouseDownPoint.x != -1) && (crToolMouseUpPoint.x != -1)) 
    {
        var tol = Math.sqrt(Math.pow((crToolMouseDownPoint.x - crToolMouseUpPoint.x),2) + Math.pow((crToolMouseDownPoint.y - crToolMouseUpPoint.y),2));
        tol = Math.round(tol);
        return  (Math.round(crToolMouseDownPoint.x) + ',' + (CanvasHeight - Math.round(crToolMouseDownPoint.y)) + ',' + tol);
    }
    return '0,0,0';    

}

CRTool.prototype.crToolGetArea = function()
{
    //return '10,10,50,50';
    var CanvasHeight = this.grid.model.options.canvasHeight;
    if ((crToolMouseDownPoint.x != -1) && (crToolMouseUpPoint.x != -1)) 
    {
        var area = crToolMouseDownPoint.x + ',' + (CanvasHeight-crToolMouseDownPoint.y) + ',' + crToolMouseUpPoint.x + ',' + (CanvasHeight - crToolMouseUpPoint.y);
        return area;
    }
    return '0,0,0,0';
}

CRTool.prototype.SetSnapToPointRadius = function(radius)
{
    //update snapToPointRadius
    var snapPoints = this.grid.model.getSnapPoints();
    for (var i = 0; i < snapPoints.length; i++)
    {
        snapPoints[i].snapRadius = radius;
    }
}

CRTool.prototype.setCenterImage = function(onoff)
{
    this.grid.view.paletteCenter = onoff;
    this.grid.model.options.paletteCenter = onoff;
    this.grid.view._updatePaletteLayout();
}

CRTool.prototype.setScaleImage = function(onoff)
{
    this.grid.view.paletteScale = onoff;
    this.grid.model.options.paletteScale = onoff;
    this.grid.view._updatePaletteLayout();
}

// NOTE: in grid tool this object gets registered using grid.registerCanvasComponent()
var crToolCanvsComponent =
{
    processMouseEvent: function(evt)
    {
        var crtool = getGridCRtoolObject();
        if (crtool == null) return;

        // We know we are not at CRToolMode.Test
        if (crtool.getMode() == CRToolMode.Question)
        {
            var btnMode = getGridObject().getMode();

            if (btnMode == 'move') //no Button is selected
            {
                //mouse-click -> snap point process
                //bkg image is click -> select and move

                if (crtool.getSnapToPointFlag())
                {
                    // snap to point process
                    crtool.setCRToolMouseLocation(evt);
                    crtool.updateCRToolUI(evt);
                }
                else
                {
                    // mouse Release should select response object or BKG image
                    // crtool.processBackgroundImage(evt);
                    // return true;
                }
            }
            else if (btnMode == 'delete')
            {
                // delete snap to point if available
                // delete response if available
                if (evt.name == 'mousedown') crtool.deleteSnapPoint(evt);
            }
        }
        else
        {
            crtool.setCRToolMouseLocation(evt);
            crtool.updateCRToolUI(evt);
        }
    }
}