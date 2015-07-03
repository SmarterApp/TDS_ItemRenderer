//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
/*
 * Grid Import/Export from the model
 */

Grid.ImportExport = function(gquestion)
{
    var gridquestion = gquestion;
    var answerSpaceXml;
    //public APIs

    //getAnswerXml(): get student's response from SVG grid
    //loadItem (answerSpaceXml): load item question to SVG grid
    //loadAnswer(response): load a response into SVG grid
    //isStudentResponseValid(answerSpaceXml): check if student makes any response on the item

    this.isStudentResponseValid = function()
    {
        if (answerSpaceXml == null) return false;

        // get original answer space xmldoc
        var xmlobject = Grid.ImportExport.parseFromString(answerSpaceXml);

        // create a model used to represent the original question and preset answers for comparison
        var originalquestion = new Grid.Model();

        // copy palette images
        originalquestion._paletteimages = gridquestion._paletteimages;

        // load hotspots
        var imageLoader = new Grid.ImportExport.ImageLoader(); // empty
        Grid.ImportExport.loadHotspots(xmlobject, originalquestion, imageLoader);

        // load preset answers
        var presetAnswerList = xmlobject.getElementsByTagName("PreSetAnswerPart");
        if ((presetAnswerList) && (presetAnswerList[0]) && (presetAnswerList[0].childNodes[0]))
        {
            var presetAnswerXml = Grid.ImportExport.serializeToString(presetAnswerList[0]);
            this.loadAnswer(presetAnswerXml, originalquestion);
        }

        // check if anything has changed since the original question was loaded
        if (!pointsEqual(originalquestion.getPoints(), gridquestion.getPoints())) return true;
        if (!edgesEqual(originalquestion.getLines(), gridquestion.getLines())) return true;
        if (!imagesEqual(originalquestion.getImages(), gridquestion.getImages())) return true;
        if (!arrowEqual(originalquestion.getLinesByDir("forward"), gridquestion.getLinesByDir("forward"))) return true;
        if (!doubleArrowEqual(originalquestion.getLinesByDir("both"), gridquestion.getLinesByDir("both"))) return true;

        // check if any region at all is selected
        // TODO: compare the original preset answer to the grids new answer
        var regions = gridquestion.getRegions();

        for (var i = 0; i < regions.length; i++)
        {
            var originalRegion = originalquestion.getRegion(regions[i].name);
            if (originalRegion) {
                if (regions[i].isSelected() != originalRegion.isSelected()) return true;
            }
        }

        return false;

        function pointsEqual(points1, points2)
        {
            if (points1.length != points2.length) return false;
            if (points1.length == 0) return true;
            for (var i = 0; i < points1.length; i++)
            {
                var found = false;
                for (var j = 0; j < points2.length; j++)
                {
                    if ((points1[i].x == points2[j].x) && (points1[i].y == points2[j].y)) found = true;
                }
                if (!found) return false;
            }
            return true;
        }

        function edgesEqual(edges1, edges2)
        {
            //alert (edges1.length + ':' + edges2.length);
            if (edges1.length != edges2.length) return false;
            if (edges1.length == 0) return true;
            for (var i = 0; i < edges1.length; i++)
            {
                var found = false;
                for (var j = 0; j < edges2.length; j++)
                {
                    if (((edges1[i].source.x == edges2[j].source.x) && (edges1[i].source.y == edges2[j].source.y)
                        && (edges1[i].target.x == edges2[j].target.x) && (edges1[i].target.y == edges2[j].target.y)) ||
                            ((edges1[i].source.x == edges2[j].target.x) && (edges1[i].source.y == edges2[j].target.y)
                                && (edges1[i].target.x == edges2[j].source.x) && (edges1[i].target.y == edges2[j].source.y))
                        ) found = true;
                }
                if (!found) return false;
            }
            return true;
        }

        function imagesEqual(images1, images2)
        {
            if (images1.length != images2.length) return false;
            if (images1.length == 0) return true;
            for (var i = 0; i < images1.length; i++)
            {
                var found = false;
                for (var j = 0; j < images2.length; j++)
                {
                    if ((images1[i].name == images2[j].name) && (images1[i].x == images2[j].x)
                        && (images1[i].y == images2[j].y)) found = true;
                }
                if (!found) return false;
            }
            return true;
        }

        function arrowEqual(arrows1, arrows2)
        {
            if (arrows1.length != arrows2.length) return false;
            if (arrows1.length == 0) return true;
            for (var i = 0; i < arrows1.length; i++)
            {
                var found = false;
                for (var j = 0; j < arrows2.length; j++)
                {
                    if (((arrows1[i].source.x == arrows2[j].source.x) && (arrows1[i].source.y == arrows2[j].source.y)
                        && (arrows1[i].target.x == arrows2[j].target.x) && (arrows1[i].target.y == arrows2[j].target.y)))
                        found = true;
                }
                if (!found) return false;
            }
            return true;

        }

        function doubleArrowEqual(da1, da2)
        {
            return edgesEqual(da1, da2);
        }

    };

    //export response from model
    this.getAnswerXml = function()
    {
        function getSnapPoints(xmlDoc, QuestionPartNode)
        {
            var SnapPointNode = xmlDoc.createElement('SnapPoint');
            var snapPoints = gridquestion.getSnapPoints();
            var str = "";
            for (var i = 0; i < snapPoints.length; i++)
            {
                if (i == 0) str = snapPoints[0].snapRadius + "@";
                str += snapPoints[i].x + "," + snapPoints[i].y;
                if (i != snapPoints.length - 1) str += ";";
            }
            var textNode = xmlDoc.createTextNode(str);
            SnapPointNode.appendChild(textNode);
            QuestionPartNode.appendChild(SnapPointNode);
        }

        function getTerminatedEdgeObjects(xmlDoc, ObjectSetNode)
        {

            var arrows = gridquestion.getLinesByDir("forward");
            for (var i = 0; i < arrows.length; i++)
            {
                //var tNode = document.createElement('TerminatedEdgeObject');
                var tNode = xmlDoc.createElement('TerminatedEdgeObject');

                var sourceXY = arrows[i].source.x + ',' + translateCoordinate(arrows[i].source.y);
                var targetXY = arrows[i].target.x + ',' + translateCoordinate(arrows[i].target.y);
                var str = "(" + sourceXY + "),(" + targetXY + "),Type-1";

                var textNode = xmlDoc.createTextNode(str);
                tNode.appendChild(textNode);
                ObjectSetNode.appendChild(tNode);
            }

            var doubleArrows = gridquestion.getLinesByDir("both");
            for (var i = 0; i < doubleArrows.length; i++)
            {
                var tNode = xmlDoc.createElement('TerminatedEdgeObject');

                var sourceXY = doubleArrows[i].source.x + ',' + translateCoordinate(doubleArrows[i].source.y);
                var targetXY = doubleArrows[i].target.x + ',' + translateCoordinate(doubleArrows[i].target.y);
                var str = "(" + sourceXY + "),(" + targetXY + "),Type-2";

                var textNode = xmlDoc.createTextNode(str);
                tNode.appendChild(textNode);
                ObjectSetNode.appendChild(tNode);
            }
        }

        function createAtomicObject(xmlDoc, ObjectSetNode)
        {
            var images = gridquestion.getImages();
            for (var i = 0; i < images.length; i++)
            {
                var AtomicObjectNode = xmlDoc.createElement('AtomicObject');

                // NOTE: Images need to be saved from the bottom/middle xy
                var pointXY = images[i].x + "," + translateCoordinate(images[i].y);
                var str = "{" + images[i].name + "(" + pointXY + ")}";

                var TextNode = xmlDoc.createTextNode(str);
                AtomicObjectNode.appendChild(TextNode);
                ObjectSetNode.appendChild(AtomicObjectNode);
            }
        }

        // Get each region group and associated regions and serialize to XML
        function createRegionGroupObjects(xmlDoc, ObjectSetNode)
        {
            var regionGroupsList = gridquestion.getRegionGroups();
            for (var i = 0; i < regionGroupsList.length; i++)
            {
                // Create a region group node
                var regionGroupObj = regionGroupsList[i];
                var regionGroupNode = xmlDoc.createElement('RegionGroupObject');
                regionGroupNode.setAttribute('name', regionGroupObj.name);
                regionGroupNode.setAttribute('numselected', regionGroupObj.getSelectedRegions().length);

                // Add all the regions within that group as children
                var regionsList = regionGroupObj.getRegions();
                for (var j = 0; j < regionsList.length; j++)
                {
                    var regionObj = regionsList[j];
                    var regionNode = xmlDoc.createElement('RegionObject');
                    regionNode.setAttribute('name', regionObj.name);
                    regionNode.setAttribute('isselected', regionObj.isSelected().toString());
                    regionGroupNode.appendChild(regionNode);
                }

                // Add the region group to the main document
                ObjectSetNode.appendChild(regionGroupNode);
            }
        }

        function createPointObject(xmlDoc, ObjectSetNode, points)
        {
            if (!(points)) return;

            for (var i = 0; i < points.length; i++)
            {

                var ObjectNode = xmlDoc.createElement('Object');
                var PointVectorNode = xmlDoc.createElement('PointVector');
                var EdgeVectorNode = xmlDoc.createElement('EdgeVector');
                var LabelListNode = xmlDoc.createElement('LabelList');
                var ValueListNode = xmlDoc.createElement('ValueList');

                var pointStr = "{(" + points[i].x + ',' + translateCoordinate(points[i].y) + ")}";
                var PointTextNode = xmlDoc.createTextNode(pointStr);
                PointVectorNode.appendChild(PointTextNode);

                var edgeStr = " {} ";
                var EdgeTextNode = xmlDoc.createTextNode(edgeStr);
                EdgeVectorNode.appendChild(EdgeTextNode);

                var labelStr = " {} ";
                var LabelTextNode = xmlDoc.createTextNode(labelStr);
                LabelListNode.appendChild(LabelTextNode);

                var valueStr = " {} ";
                var ValueTextNode = xmlDoc.createTextNode(valueStr);
                ValueListNode.appendChild(ValueTextNode);

                ObjectNode.appendChild(PointVectorNode);
                ObjectNode.appendChild(EdgeVectorNode);
                ObjectNode.appendChild(LabelListNode);
                ObjectNode.appendChild(ValueListNode);

                ObjectSetNode.appendChild(ObjectNode);

            }
        }

        function createConnectedLinesObj(xmlDoc, ObjectSetNode, thisWorkingLines)
        {
            var ObjectNode = xmlDoc.createElement('Object');
            var PointVectorNode = xmlDoc.createElement('PointVector');
            var EdgeVectorNode = xmlDoc.createElement('EdgeVector');
            var LabelListNode = xmlDoc.createElement('LabelList');
            var ValueListNode = xmlDoc.createElement('ValueList');

            var pointsStr = "{";
            var linesStr = "{";
            var previousLeftPoint = "";
            var linePoints = [];
            for (var i = 0; i < thisWorkingLines.length; i++)
            {
                var sourceXY = thisWorkingLines[i].source.x + ',' + translateCoordinate(thisWorkingLines[i].source.y);
                var targetXY = thisWorkingLines[i].target.x + ',' + translateCoordinate(thisWorkingLines[i].target.y);

                linesStr += " {(" + sourceXY + '),(' + targetXY + ")}";

                if (i == 0)
                {
                    linePoints.push(sourceXY);
                    linePoints.push(targetXY);
                } else
                {
                    if (!findExistingItem(linePoints, sourceXY)) linePoints.push(sourceXY);
                    if (!findExistingItem(linePoints, targetXY)) linePoints.push(targetXY);
                }

            }

            //if (previousLeftPoint!="") pointsStr += "(" + previousLeftPoint + ")";
            //PointVectorNode.innerHTML = pointsStr + "}";
            for (var i = 0; i < linePoints.length; i++)
            {
                pointsStr += "(" + linePoints[i] + ")";
            }
            pointsStr += "}";

            var PointVectorTextNode = xmlDoc.createTextNode(pointsStr);
            PointVectorNode.appendChild(PointVectorTextNode);

            //EdgeVectorNode.innerHTML = linesStr + "}";
            linesStr += "}";
            var EdgeVectorTextNode = xmlDoc.createTextNode(linesStr);
            // EdgeVectorNode.setAttribute('style', thisWorkingLines[0].style);
            EdgeVectorNode.appendChild(EdgeVectorTextNode);


            var labelStr = " {} ";
            var LabelTextNode = xmlDoc.createTextNode(labelStr);
            LabelListNode.appendChild(LabelTextNode);

            var valueStr = " {} ";
            var ValueTextNode = xmlDoc.createTextNode(valueStr);
            ValueListNode.appendChild(ValueTextNode);


            ObjectNode.appendChild(PointVectorNode);
            ObjectNode.appendChild(EdgeVectorNode);
            ObjectNode.appendChild(LabelListNode);
            ObjectNode.appendChild(ValueListNode);

            ObjectSetNode.appendChild(ObjectNode);

        }

        function findExistingItem(array, item)
        {
            for (var i = 0; i < array.length; i++)
            {
                //alert (item + " vs " + array[i]);
                if (item == array[i]) return true;
            }
            return false;
        }

        function addLinePointsToQueue(pointQueue, line)
        {
            var rtnPointQueue = pointQueue;
            if (!pointExistsInQueue(pointQueue, line.source)) rtnPointQueue.push(line.source);
            if (!pointExistsInQueue(pointQueue, line.target)) rtnPointQueue.push(line.target);
            return rtnPointQueue;
        }

        function pointExistsInQueue(pointQueue, point)
        {
            for (var i = 0; i < pointQueue.length; i++)
            {
                if (point == pointQueue[i]) return true;
            }
            return false;
        }

        function getNewLinesConnectedToPoint(remainingLines, workingLines, pointQueue, point)
        {
            var newLines = [];
            for (var i = 0; i < remainingLines.length; i++)
            {
                if ((remainingLines[i].source == point) || (remainingLines[i].target == point))
                {
                    //if line not in workingLines
                    var found = false;
                    for (var j = 0; j < workingLines.length; j++)
                    {
                        if (workingLines[j] == remainingLines[i])
                        {
                            //alert ("found=true " + workingLines[j] + "==" + remainingLines[i]);
                            found = true;
                            break;
                        }
                    }
                    //alert ("found = " + found);
                    if (!found) newLines.push(remainingLines[i]);
                }
            }

            return newLines;
        }

        function getRemainingLines(remainingLines, thisWorkingLines)
        {
            var rLines = [];
            for (var i = 0; i < remainingLines.length; i++)
            {
                var found = false;
                for (var j = 0; j < thisWorkingLines.length; j++)
                {
                    if (remainingLines[i] == thisWorkingLines[j])
                    {
                        found = true;
                        break;
                    }
                }
                if (!found) rLines.push(remainingLines[i]);
            }
            //alert ("----------- remaining Lines: " + rLines);
            return rLines;

        }

        function identifyObjects(xmlDoc, ObjectSetNode)
        {
            var lines = gridquestion.getLinesByDir("none");
            var points = gridquestion.getPoints();

            //identify connected lines
            var remainingLines = gridquestion.getLinesByDir("none");

            while (remainingLines.length > 0)
            {

                var thisWorkingLines = [];
                var thisPointQueue = [];

                thisWorkingLines.push(remainingLines[0]);
                var newQueue = addLinePointsToQueue(thisPointQueue, remainingLines[0]);
                thisPointQueue = newQueue;

                while ((thisPointQueue) && (thisPointQueue.length > 0))
                {
                    var newPoint = thisPointQueue.shift();
                    var newLines = getNewLinesConnectedToPoint(remainingLines, thisWorkingLines, thisPointQueue, newPoint);
                    if (newLines)
                    {
                        for (var i = 0; i < newLines.length; i++)
                        {
                            thisWorkingLines.push(newLines[i]);
                            addLinePointsToQueue(thisPointQueue, newLines[i]);
                        }
                    }
                }
                var rLines = getRemainingLines(remainingLines, thisWorkingLines);
                remainingLines = rLines;

                if (thisWorkingLines.length > 0)
                {
                    createConnectedLinesObj(xmlDoc, ObjectSetNode, thisWorkingLines);
                }
            }

            //identify isolated points: points not associated with any lines including arrows

            var iPoints = getIsolatedPoints();
            if (iPoints.length > 0) createPointObject(xmlDoc, ObjectSetNode, iPoints);

            createAtomicObject(xmlDoc, ObjectSetNode);
            createRegionGroupObjects(xmlDoc, ObjectSetNode);

        }

        function getIsolatedPoints()
        {
            var lines = gridquestion.getLines();
            var points = gridquestion.getPoints();
            var iPoints = [];

            for (var i = 0; i < points.length; i++)
            {
                var found = false;
                for (var j = 0; j < lines.length; j++)
                {
                    if ((points[i] == lines[j].source) || (points[i] == lines[j].target)) //all lines including directed lines
                    {
                        found = true;
                        break;
                    }
                }
                //alert ("iPoints: found="+found);
                if (!found) iPoints.push(points[i]);
            }
            return iPoints;
        }

        function getIndent(depth)
        {
            var str = "";
            for (var i = 0; i < depth * 3; i++)
            {
                str += " ";
            }
            return str;
        }

        function getIndentedText(xNode, depth)
        {
            var alignedText = '';

            if (xNode.nodeType == 3)
            {
                if (xNode.nodeValue)
                    return (alignedText + xNode.nodeValue);
                else
                    return (alignedText);
            }
            alignedText = getIndent(depth) + '<' + xNode.nodeName + '>';

            var length = alignedText.length;
            for (var i = 0; i < xNode.childNodes.length; i++)
            {
                //if (xNode.nodeName == 'SnapPoint') alert ("snpaPoint nodeType: " + xNode.childNodes[i].nodeType);
                if (xNode.childNodes[i].nodeType == 3)
                    alignedText += getIndentedText(xNode.childNodes[i], depth + 1);
                else
                    alignedText += '\n' + getIndentedText(xNode.childNodes[i], depth + 1);
            }

            var trimedText = alignedText.replace(/^\s+|\s+$/g, "");
            if ((trimedText.charAt(trimedText.length - 1) == '}') || (xNode.nodeName == 'TerminatedEdgeObject') || (alignedText.length == length))
            {
                return (alignedText + '</' + xNode.nodeName + '>');
            } else
            {
                return (alignedText + '\n' + getIndent(depth) + '</' + xNode.nodeName + '>');
            }
        }

        var xmlDoc = Grid.ImportExport.parseFromString("<root></root>");

        var AnswerSetNode = xmlDoc.createElement('AnswerSet');
        
		// Balaji said to remove response versioning
		// AnswerSetNode.setAttribute('version', 2); // NOTE: Ver 2 has <Circles> and <Lines>
        
		var QuestionNode = xmlDoc.createElement('Question');

        QuestionNode.setAttribute('id', gridquestion.id);
        AnswerSetNode.appendChild(QuestionNode);

        var QuestionPartNode = xmlDoc.createElement('QuestionPart');
        QuestionPartNode.setAttribute('id', 1);
        QuestionNode.appendChild(QuestionPartNode);

        var ObjectSetNode = xmlDoc.createElement('ObjectSet');
        QuestionPartNode.appendChild(ObjectSetNode);
        identifyObjects(xmlDoc, ObjectSetNode);

        var TerminatedEdgeObjectNode = xmlDoc.createElement('TerminatedEdgeObject');
        getTerminatedEdgeObjects(xmlDoc, ObjectSetNode);

        getSnapPoints(xmlDoc, QuestionPartNode);

        // write out other shapes (e.x., circles)
        Grid.ImportExport.writeShapes(QuestionPartNode, gridquestion);

        var header = '<?xml version="1.0" encoding="UTF-8"?>';

        if (typeof XMLSerializer != 'undefined')
        {
            // serialize xmldoc into a xml string
            var serializer = new XMLSerializer();
            var answerXml = serializer.serializeToString(AnswerSetNode);
            return (header + answerXml);
        }
        else if (AnswerSetNode.xml)
        {
            return (header + AnswerSetNode.xml);
        }
        else
        {
            throw Error('This browser does not support serializing XML nodes');
        }
    };

    // parse all the images paths from the xml
    var parseImageFiles = function(questionXml)
    {
        var getTextContent = function(node)
        {
            if (node && node.childNodes && node.childNodes.length)
                return node.childNodes[0].nodeValue;
            return null;
        };

        var imageFiles = [];
        var xmlDoc = Grid.ImportExport.parseFromString(questionXml);

        // get all <FileSpec> elements
        var imageNodes = xmlDoc.getElementsByTagName('FileSpec');

        Grid.ImportExport.eachNode(imageNodes, function(imageNode)
        {
            var imageFile = getTextContent(imageNode);
            if (imageFiles.indexOf(imageFile) == -1) imageFiles.push(imageFile);
        });

        // get all <Image> elements
        imageNodes = xmlDoc.getElementsByTagName('Image');

        Grid.ImportExport.eachNode(imageNodes, function(imageNode)
        {
            var imageFile = imageNode.getAttribute('src');
            if (imageFiles.indexOf(imageFile) == -1) imageFiles.push(imageFile);
        });

        return imageFiles;
    };

    // load Question (loads images)
    this.loadItem = function(questionXml, callbackCreated, callbackFailure)
    {
        // get all the image file names in the xml
        var imageFiles = parseImageFiles(questionXml);
        var imageLoader = new Grid.ImportExport.ImageLoader();

        // if there are no images then begin parsing xml right away
        if (imageFiles.length == 0)
        {
            this.loadItem2(questionXml, callbackCreated, imageLoader);
            return;
        }

        // add file names to loader
        for (var i = 0; i < imageFiles.length; i++)
        {
            var url = Grid.ImportExport.resolveUrl(imageFiles[i]);
            imageLoader.addImage(url);
        }

        // begin loading images and when finished call loadItem2
        var self = this;

        imageLoader.load(function()
        {
            var imageErrors = imageLoader.getErrors();

            if (imageErrors.length == 0)
            {
                self.loadItem2.call(self, questionXml, callbackCreated, imageLoader);
            }
            else
            {
                callbackFailure('Error loading DOM images', imageErrors);
            }
        });
    };

    // load Question (loads xml)
    this.loadItem2 = function(questionXml, callback, imageLoader)
    {
        answerSpaceXml = questionXml;

        function removeQuotes(str)
        {
            var first = str.indexOf('"');
            if (first == -1) return str;
            str = str.substring(first + 1);
            var second = str.lastIndexOf('"');
            if (second == -1) return str;
            return str.substring(0, second);
        }

        function addBackgroundImage(bkgNode)
        {
            var node = bkgNode.firstChild;
            var fileSpec = "";
            var position = "";

            while (node)
            {
                if (node.nodeName == "FileSpec")
                {
                    fileSpec = removeQuotes(node.childNodes[0].nodeValue);
                }
                else if (node.nodeName == "Position")
                {
                    position = removeQuotes(node.childNodes[0].nodeValue);
                }

                if ((fileSpec != "") && (position != ""))
                {
                    var xy = position.split(','); //100,200 relative to upper-left cornor
                    var url = Grid.ImportExport.resolveUrl(fileSpec);
                    var htmlImage = imageLoader.getImage(url);

                    if (htmlImage != null)
                    {
                        gridquestion.addBackgroundImage(htmlImage.src, xy[0] * 1, xy[1] * 1, htmlImage.width, htmlImage.height);
                    }

                    return;
                }

                node = node.nextSibling;
            }
        }

        function addPalleteImage(palleteNode)
        {
            var node = palleteNode.firstChild;

            var labelName = "";
            var fileName = "";

            while (node)
            {
                if (node.nodeName == "FileSpec")
                {
                    fileName = removeQuotes(node.childNodes[0].nodeValue);

                }
                else if (node.nodeName == "Label")
                {
                    labelName = removeQuotes(node.childNodes[0].nodeValue);
                    labelName = YAHOO.lang.trim(labelName);
                }

                if ((fileName != "") && (labelName != ""))
                {
                    var url = Grid.ImportExport.resolveUrl(fileName);
                    var htmlImage = imageLoader.getImage(url);

                    if (htmlImage != null)
                    {
                        gridquestion.addPaletteImage(labelName, htmlImage.src, htmlImage.width, htmlImage.height);
                    }

                    return;
                }

                node = node.nextSibling;
            }
        }

        //note to check quotes

        gridquestion.clearQuestion();
        var xmlobject = Grid.ImportExport.parseFromString(questionXml);

        // LOAD OPTIONS
        Grid.ImportExport.loadOptions(xmlobject, gridquestion);

        // BACKGROUND IMAGES
        var backgroundImageList = xmlobject.getElementsByTagName("ImageSpec");
        if ((backgroundImageList) && (backgroundImageList[0]) && (backgroundImageList[0].childNodes[0]))
        {
            for (var i = 0; i < backgroundImageList.length; i++)
            {
                addBackgroundImage(backgroundImageList[i]);
            }
        }

        // PALETTE IMAGES
        var palleteImageList = xmlobject.getElementsByTagName("IconSpec");
        if ((palleteImageList) && (palleteImageList[0]) && (palleteImageList[0].childNodes[0]))
        {
            for (var i = 0; i < palleteImageList.length; i++)
            {
                addPalleteImage(palleteImageList[i]);
            }
        }

        // HOTSPOTS
        Grid.ImportExport.loadHotspots(xmlobject, gridquestion, imageLoader);

        // PRESET ANSWER
        var presetAnswerList = xmlobject.getElementsByTagName("PreSetAnswerPart");
        if ((presetAnswerList) && (presetAnswerList[0]) && (presetAnswerList[0].childNodes[0]))
        {
            this.loadAnswer(Grid.ImportExport.serializeToString(presetAnswerList[0]));
        }
        
        // NOTE: Balaji said only if the palette has images and the 
        // preset answer does not have points/images do we show the palette.
        if (gridquestion.getPaletteImages().length > 0 &&
            gridquestion.getPoints().length == 0 &&
            gridquestion.getImages().length == 0) {
            gridquestion.options.showPalette = true;
        } else {
            gridquestion.options.showPalette = false;
        }

        // fire call back
        if (typeof callback == 'function') callback();
    };

    //load student response
    this.loadAnswer = function(response, gridq)
    {
        function addSnapPoint(snapPoint, gridq)
        {
            // check if there are any snap points
            if (snapPoint.childNodes.length == 0) return;

            var snapStr = snapPoint.childNodes[0].nodeValue;
            //alert ("snapStr: " + snapStr);
            var first = snapStr.indexOf("@");
            var snapRadius = parseInt(snapStr.substring(0, first));
            //alert ("radius: " + snapRadius);
            snapStr = snapStr.substring(first + 1) + ";";
            //alert ("second part of snapStr: " + snapStr); 
            var index = snapStr.indexOf(";");
            while (index != -1)
            {
                var pntStr = snapStr.substring(0, index);
                var indexComma = pntStr.indexOf(",");
                var x = parseInt(pntStr.substring(0, indexComma));
                var y = parseInt(pntStr.substring(indexComma + 1));
                //alert ("snap Point: x-y: " + x + "-" + y);
                //if (gridquestion.getSnapPointByXY(x,y)==null) 
                if (gridq == null) gridquestion.addSnapPoint(x, y, snapRadius);
                else gridq.addSnapPoint(x, y, snapRadius);
                snapStr = snapStr.substring(index + 1);
                index = snapStr.indexOf(";");
            }
        }

        function addAtomicObj(obj, gridq)
        {
            var atomicStr = obj.childNodes[0].nodeValue;
            //atomicStr = atomicStr.replace(" ", "");
            var first = atomicStr.indexOf("{");
            var second = atomicStr.indexOf("(");
            var third = atomicStr.indexOf(")");
            var labelName = atomicStr.substring(first + 1, second);
            //alert ("labelName=" + labelName);
            var pntStr = atomicStr.substring(second + 1, third);
            //alert ("image Position = " + pntStr);

            var indexComma = pntStr.indexOf(",");
            var x = parseInt(pntStr.substring(0, indexComma));
            var y = parseInt(pntStr.substring(indexComma + 1));
            //alert ("image Position: x-y: " + x + "-" + y);
            if (gridq == null)
                gridquestion.addImage(YAHOO.lang.trim(labelName), x, translateCoordinate(y)); // HTML IMAGE
            else
                gridq.addImage(YAHOO.lang.trim(labelName), x, translateCoordinate(y));

        }

        function addTerminatedEdgeObj(obj, gridq)
        {
            var arrowStr = obj.childNodes[0].nodeValue;
            var index = arrowStr.indexOf(",Type-");
            var type = arrowStr.substring(index + 6);

            // need to decide type: 0,1,2
            var dirType = "both";
            if (type == "1") dirType = "forward";
            parseSingleLine(arrowStr.substring(0, index), dirType, gridq);
        }

        function addObj(obj, gridq)
        {
            var node = obj.firstChild;
            while (node)
            {
                if (node.nodeName == "PointVector")
                {
                    parsePointVectorString(node.childNodes[0].nodeValue, gridq);
                }
                else if (node.nodeName == "EdgeVector")
                {
                    //alert (" EdgeVector: " + node.childNodes[0].nodeValue);
                    parseEdgeVectorString(node.childNodes[0].nodeValue, gridq);
                }
                node = node.nextSibling;
            }
        }

        function parsePointVectorString(pointsStr, gridq)
        {

            var indexLeft = pointsStr.indexOf("(");
            var indexRight = pointsStr.indexOf(")");
            while ((indexLeft != -1) && (indexRight != -1))
            {
                var pntStr = pointsStr.substring(indexLeft + 1, indexRight);
                pointsStr = pointsStr.substring(indexRight + 1);
                //alert (pntStr);

                var indexComma = pntStr.indexOf(",");
                var x = parseInt(pntStr.substring(0, indexComma));
                var y = parseInt(pntStr.substring(indexComma + 1));
                if (gridq == null)
                    gridquestion.addPoint(x, translateCoordinate(y));
                else
                {
                    gridq.addPoint(x, translateCoordinate(y));
                }
                indexLeft = pointsStr.indexOf("(");
                indexRight = pointsStr.indexOf(")");
            }
        }

        function parseEdgeVectorString(edgesStr, gridq)
        {

            var firstLeft = edgesStr.indexOf("{");
            var lastRight = edgesStr.lastIndexOf("}");
            edgesStr = edgesStr.substring(firstLeft + 1, lastRight);

            var indexLeft = edgesStr.indexOf("{");
            var indexRight = edgesStr.indexOf("}");

            while ((indexLeft != -1) && (indexRight != -1))
            {
                var eStr = edgesStr.substring(indexLeft + 1, indexRight);
                parseSingleLine(eStr, "none", gridq);
                edgesStr = edgesStr.substring(indexRight + 1);
                indexLeft = edgesStr.indexOf("{");
                indexRight = edgesStr.indexOf("}");
            }
        }

        function parseSingleLine(eStr, dirType, gridq)
        {
            //alert ("eStr: " + eStr);
            var indexLeft = eStr.indexOf("(");
            var indexRight = eStr.indexOf(")");
            var pntStr = eStr.substring(indexLeft + 1, indexRight);
            //alert ("first Point: " + pntStr);
            var indexComma = pntStr.indexOf(",");
            var x = parseInt(pntStr.substring(0, indexComma));
            var y = parseInt(pntStr.substring(indexComma + 1));
            var point1;

            if (gridq == null)
            {
                if (dirType != "none")
                    point1 = gridquestion.addPoint(x, translateCoordinate(y));
                else
                    point1 = getExistingPoint(x, translateCoordinate(y), gridq);
            } else
            {
                if (dirType != "none")
                    point1 = gridq.addPoint(x, translateCoordinate(y));
                else
                    point1 = getExistingPoint(x, translateCoordinate(y), gridq);
            }

            pntStr = eStr.substring(indexRight + 1);
            indexLeft = pntStr.indexOf("(");
            indexRight = pntStr.indexOf(")");
            pntStr = pntStr.substring(indexLeft + 1, indexRight);
            //alert ("second Point: " + pntStr);
            indexComma = pntStr.indexOf(",");
            x = parseInt(pntStr.substring(0, indexComma));
            y = parseInt(pntStr.substring(indexComma + 1));
            //alert ("Line: x,y=" + x + " " + y);
            var point2;

            if (gridq == null)
            {
                if (dirType != "none")
                    point2 = gridquestion.addPoint(x, translateCoordinate(y));
                else
                    point2 = getExistingPoint(x, translateCoordinate(y), gridq);

                if ((point1) && (point2))
                {
                    gridquestion.addLine(point1, point2, dirType);
                }
            }
            else
            {
                if (dirType != "none")
                    point2 = gridq.addPoint(x, translateCoordinate(y));
                else
                    point2 = getExistingPoint(x, translateCoordinate(y), gridq);

                if ((point1) && (point2))
                {
                    gridq.addLine(point1, point2, dirType);
                }

            }
        }

        function getExistingPoint(x, y, gridq)
        {
            var points;
            if (gridq == null)
                points = gridquestion.getPoints();
            else
                points = gridq.getPoints();

            for (var i = 0; i < points.length; i++)
            {
                if ((points[i].x == x) && (points[i].y == y))
                    return points[i];

            }
            return null;
        }

        // loadAnswer main

        if (gridq == null) gridquestion.clearResponse();
        else gridq.clearResponse();

        var xmlobject = Grid.ImportExport.parseFromString(response);


        var objectList = xmlobject.getElementsByTagName("Object");
        if ((objectList) && (objectList[0]) && (objectList[0].childNodes[0]))
        {
            for (var i = 0; i < objectList.length; i++)
            {
                addObj(objectList[i], gridq);
            }
        }

        var atomicObjList = xmlobject.getElementsByTagName("AtomicObject");
        if ((atomicObjList) && (atomicObjList[0]) && (atomicObjList[0].childNodes[0]))
        {
            for (var i = 0; i < atomicObjList.length; i++)
            {
                addAtomicObj(atomicObjList[i], gridq);
            }
        }

        var terminatedEdgeList = xmlobject.getElementsByTagName("TerminatedEdgeObject");
        if ((terminatedEdgeList) && (terminatedEdgeList[0]) && (terminatedEdgeList[0].childNodes[0]))
        {
            for (var i = 0; i < terminatedEdgeList.length; i++)
            {
                addTerminatedEdgeObj(terminatedEdgeList[i], gridq);
            }
        }

        var snapPointList = xmlobject.getElementsByTagName("SnapPoint");
        if ((snapPointList) && (snapPointList[0]) && (snapPointList[0].childNodes[0]))
        {
            for (var i = 0; i < snapPointList.length; i++)
            {
                addSnapPoint(snapPointList[i], gridq);
            }
        }

        var model = ((gridq != null) ? gridq : gridquestion);

        // region responses
        Grid.ImportExport.loadRegionGroupObjects(xmlobject, model);

        // shapes
        Grid.ImportExport.loadShapes(xmlobject, model);

        if (gridq == null) gridquestion.importing = true;
    };

    function translateCoordinate(y)
    {
        return (gridquestion.options.canvasHeight - y);
    }
};

// takes a xml string and returns a xml document
Grid.ImportExport.parseFromString = function(text)
{
    if (typeof text != 'string') {
        return text;
    }

    var xmlDoc;
    
    if (window.DOMParser) {
        xmlDoc = (new window.DOMParser()).parseFromString(text, "text/xml");
    } else {
        xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
        xmlDoc.async = "false";
        xmlDoc.validateOnParse = "false";
        xmlDoc.loadXML(text);
    }

    // check for errors
    var errorMsg = null;
    if (xmlDoc.parseError && xmlDoc.parseError.errorCode != 0) {
        errorMsg = "XML Parsing Error: " + xmlDoc.parseError.reason
            + " at line " + xmlDoc.parseError.line
            + " at position " + xmlDoc.parseError.linepos;
    } else {
        if (xmlDoc.documentElement) {
            if (xmlDoc.documentElement.nodeName == "parsererror") {
                errorMsg = xmlDoc.documentElement.childNodes[0].nodeValue;
            }
        } else {
            errorMsg = "XML Parsing Error";
        }
    }

    // throw exception if there was an error
    if (errorMsg) {
        throw new Error(errorMsg);
    }
    
    return xmlDoc;
};

// takes a xml node and returns it as a string
Grid.ImportExport.serializeToString = function(node)
{
    return node.xml || (new XMLSerializer()).serializeToString(node);
};

/************************************************************************************/

Grid.ImportExport.eachNode = function(nodeList, func)
{
    var nodes = [];

    for (var i = 0; i < nodeList.length; i++)
    {
        var node = nodeList[i] || nodeList.item(i);
        nodes.push(node);
    }

    YAHOO.util.Dom.batch(nodes, func);
};

Grid.ImportExport.resolveUrl = function(url)
{
    // change any html ampersand entities into the ampersand character
    url = url.replace(/&amp;/g, '&');

    // escape url
    url = url.split('&').join('&amp;').split('<').join('&lt;').split('"').join('&quot;');

    // cross browser compatible (even in IE 6) way of qualifying a url
    // http://stackoverflow.com/questions/470832/getting-an-absolute-url-from-a-relative-one-ie6-issue
    var el = document.createElement('div');
    el.innerHTML = '<a href="' + url + '">x</a>';
    return el.firstChild.href;
};

/*
Grid.ImportExport.resolveUrl = function(fileName)
{
    // if this is already a fully qualified url then just return it as is
    if (fileName.startsWith("http") || fileName.startsWith("https")) return fileName;

    // get root of the site
    var pathname = window.location.pathname;
    var index = pathname.lastIndexOf("/");
    pathname = pathname.substring(0, index);
    var url = window.location.protocol + "//" + window.location.host + pathname;

    // add file name
    if (fileName.startsWith("/")) url += fileName;
    else url += "/" + fileName;

    // change any html ampersand entities into the ampersand character
    url = url.replace(/&amp;/g, '&');

    return url;
};
*/

// parse the filename from a url path
Grid.ImportExport.getFilename = function(path)
{
    return path.substr(path.lastIndexOf('/') + 1);
};

// class used for async loading images
Grid.ImportExport.ImageLoader = function()
{
    this._requests = [];
    this._completedCount = 0;
    this._completedCallback = null;

    this.getRequests = function() { return this._requests; };

    this.addImage = function(url, callback, label)
    {
        // create request
        var request = { url: url, callback: callback, image: null, label: label };

        // add request
        this._requests.push(request);
    };

    this.getImage = function(url)
    {
        for (var i = 0; i < this._requests.length; i++)
        {
            var request = this._requests[i];
            if (request.url == url) return request.image;
        }

        return null;
    };

    this.isCompleted = function()
    {
        return (this._completedCount == this._requests.length);
    };

    this.getErrors = function()
    {
        var imageErrors = [];

        for (var i = 0; i < this._requests.length; i++)
        {
            var request = this._requests[i];

            if (request.image.state != 1)
            {
                imageErrors.push(request.image);
            }
        }

        return imageErrors;
    };

    // load all images and fire the callback when completed
    this.load = function(callback)
    {
        this._completedCallback = callback;

        for (var i = 0; i < this._requests.length; i++)
        {
            var request = this._requests[i];
            this._requestImage(request);
        }
    };

    this._requestImage = function(request)
    {
        var self = this;

        // create html image
        request.image = new Image();
        request.image.state = 0;
        request.image.name = request.label;

        var completed = function()
        {
            if (typeof (request.callback) == 'function')
            {
                request.callback(request.image);
            }

            self._requestCompleted();
        };

        // image load success
        request.image.onload = function()
        {
            request.image.state = 1;
            completed();
        };

        // image load failed
        request.image.onerror = function()
        {
            request.image.state = -1;
            completed();
        };

        // image load aborted
        request.image.onabort = function()
        {
            request.image.state = -1;
            completed();
        };

        // tells browser to request image
        request.image.src = request.url;
    };

    // call this when an image is completed (success, failed, aborted)
    this._requestCompleted = function()
    {
        this._completedCount++;

        // check if we are done waiting for images and fire completed callback
        if (this._completedCount == this._requests.length && typeof (this._completedCallback) == 'function')
        {
            var images = [];

            for (var i = 0; i < this._requests.length; i++)
            {
                images.push(this._requests[i].image);
            }

            this._completedCallback(images);
        }
    };

};

String.prototype.startsWith = function(str)
{return (this.match("^"+str)==str);
};