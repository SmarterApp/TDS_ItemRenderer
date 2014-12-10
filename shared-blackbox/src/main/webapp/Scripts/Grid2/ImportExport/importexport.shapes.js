/*
This is the new code for parsing shapes.
*/

Grid.ImportExport.translateCoordinate = function(model, y)
{
    return (model.options.canvasHeight - y);
};

Grid.ImportExport.writeShapes = function(rootNode, model) {

    var xmlDoc = rootNode.ownerDocument;

    // CIRCLES
    var circles = model.getCircles();
    if (circles && circles.length > 0) {
        var circlesNode = this.createCirclesElement(xmlDoc, circles);
        rootNode.appendChild(circlesNode);
    }

    // LINES
    var lines = model.getLines();
    if (lines && lines.length > 0) {
        var linesNode = this.createLinesElement(xmlDoc, lines);
        rootNode.appendChild(linesNode);
    }
};

Grid.ImportExport.createCirclesElement = function(xmlDoc, circles) {

    // create <Circles> container
    var circlesNode = xmlDoc.createElement('Circles');

    for (var i = 0; i < circles.length; i++) {

        var circle = circles[i];
        
        // create <Circle>
        var circleNode = xmlDoc.createElement('Circle');
        circleNode.setAttribute('x', circle.x);
        circleNode.setAttribute('y', circle.y);
        circleNode.setAttribute('r', circle.radius);
        circlesNode.appendChild(circleNode);
    }

    return circlesNode;
};

Grid.ImportExport.createLinesElement = function(xmlDoc, lines) {

    // create <Lines> container
    var linesNode = xmlDoc.createElement('Lines');

    for (var i = 0; i < lines.length; i++) {

        var line = lines[i];
        
        // create <Line>
        var lineNode = xmlDoc.createElement('Line');
        lineNode.setAttribute('sourceX', line.source.x);
        lineNode.setAttribute('sourceY', line.source.y);
        lineNode.setAttribute('targetX', line.target.x);
        lineNode.setAttribute('targetY', line.target.y);
        lineNode.setAttribute('dir', line.dirType);
        lineNode.setAttribute('style', line.style);
        linesNode.appendChild(lineNode);
    }

    return linesNode;
};

Grid.ImportExport.loadShapes = function(xmlDoc, model) {
    
    // CIRCLES
    var circlesNode = xmlDoc.getElementsByTagName('Circles')[0];
    if (circlesNode) this.loadCircles(circlesNode, model);

    var linesNode = xmlDoc.getElementsByTagName('Lines')[0];
    if (linesNode) this.loadLines(linesNode, model);
};

Grid.ImportExport.loadCircles = function(circlesNode, model) {

    var circleList = circlesNode.getElementsByTagName('Circle');

    for (var i = 0; i < circleList.length; i++) {
        
        var circleNode = circleList[i];

        var x = parseInt(circleNode.getAttribute('x'));
        var y = parseInt(circleNode.getAttribute('y'));
        var r = parseInt(circleNode.getAttribute('r'));
        var circle = model.createCircle(x, y, r);
        model.addCircle(circle);
    }

};

Grid.ImportExport.loadLines = function(linesNode, model) {

    var lineList = linesNode.getElementsByTagName('Line');
    var lines = model.getLines();

    for (var i = 0; i < lineList.length; i++) {
        
        var lineNode = lineList[i];

        // get line node info
        var sourceX = parseInt(lineNode.getAttribute('sourceX'));
        var sourceY = parseInt(lineNode.getAttribute('sourceY'));
        var targetX = parseInt(lineNode.getAttribute('targetX'));
        var targetY = parseInt(lineNode.getAttribute('targetY'));
        var dir = lineNode.getAttribute('dir');
        var style = lineNode.getAttribute('style');

        // check if dashed line
        if (style != 'dashed') continue;

        // find a matching existing line (loaded using older code)
        for (var j = 0; j < lines.length; j++) {
            var line = lines[j];
            
            // check if matching line
            if (sourceX == line.source.x &&
                sourceY == line.source.y &&
                targetX == line.target.x &&
                targetY == line.target.y && 
                dir == line.dirType) {
                
                // update existing line style
                line.style = style;
                line.update();
            }
        }
    }

};

