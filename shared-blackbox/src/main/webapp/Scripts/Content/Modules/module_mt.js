/*
This module is used for setting up Measurement Tools.
*/

(function(CM) {

    // check if raphael is included
    if (typeof Raphael != 'function') {
        return;
    }

    // check if MT API is included
    if (typeof MeasurementTool != 'object') {
        return;
    }

    // set visibility attributes of the tool
    function MT_setVisibility(value) {

        // toolContainer is for containers of page scale tool (ruler/protractor), in iOS 6.x, we need to 'hide' them by code when tools are hidden
        var toolContainer = this.get('canvas').canvas && Util.Browser.isIOS() && Util.Browser.getIOSVersion() < 7 ? this.get('canvas').canvas.parentNode : null;

        // NOTE: 'this' is one of the tool objects
        if (value == 'hidden' || this.get('visibility') == 'visible') {
            if (toolContainer) {
                YUD.addClass(toolContainer, 'hideMeasuring');   // hideMeasuring will apply the styles to the svg canvas when tool is hidden
            }
            return this.set('visibility', 'hidden');
        } else {
            if (toolContainer) {
                YUD.removeClass(toolContainer, 'hideMeasuring');
            }
            return this.set('visibility', 'visible');
        }
    };

    // toggle ruler
    TDS.MT_toggleRuler = function (event, page) {

        // NOTE: 'this' is ContentPage
        if (!page.ruler) {
            return false;
        }

        // get current zoom factor
        var zoomFactor = page.getZoomFactor();

        if (MT_setVisibility.call(page.ruler) == 'visible') {
            //keeping scale for ruler
            page.ruler.setScale(0, 0, 0, zoomFactor);
            this.className = 'on';
        } else {
            this.className = 'off';
        }
        return true;
    };

    // toggle protractor
    TDS.MT_toggleProtractor = function (event, page) {

        // NOTE: 'this' is ContentPage
        if (!page.protractor) {
            return false;
        }

        // get current zoom factor
        var zoomFactor = page.getZoomFactor();

        if (MT_setVisibility.call(page.protractor) == 'visible') {
            //keeping scale for ruler
            page.protractor.setScale(0, 0, 0, zoomFactor);
            this.className = 'on';
        } else {
            this.className = 'off';
        }
        return true;
    };

    function MTApplication(arg) {

        var page = arg.page,
            imgItem = arg.imgItem,
            mtIndex = arg.mtIndex,
            lineEnabled = arg.lineEnabled,
            compassEnabled = arg.compassEnabled,
            zoomFactor = arg.zoomFactor;

        // mtElem is the node going to be replaced by .measuring <div>, mtContainer is .measuring's parent
        var mtContainer = imgItem.parentNode.parentNode,
            mtElem = imgItem.parentNode;

        // width and height of canvas, default 500 x 300
        var dataMTConfigWidth = YUD.getAttribute(imgItem, 'data-mt-config-width') || 500,
            dataMTConfigHeight = YUD.getAttribute(imgItem, 'data-mt-config-height') || 300;

        this.dataMTConfigWidth = dataMTConfigWidth;
        this.dataMTConfigHeight = dataMTConfigHeight;

        var imgSrc = YUD.getAttribute(imgItem, 'src');

        // tool id to identify each tool (straight line/compass)
        var toolID = page.id + "_" + mtIndex;

        // this toolBox is for initiating canvas
        var toolBox = [];

        // use as document object
        var doc = page.getDoc();

        //creating measurment tool (straight line, compass) canvas element and replace the original <img> element
        var imgElem = doc.createElement('img'),
            imgParents = doc.createElement('div'),
            buttonContainer = doc.createElement('div'),
            measuringElem = doc.createElement('div');

        //add straight line tool button, click listener, and initiate straight line tool
        if (lineEnabled) {
            var lineButton = doc.createElement('button');
            lineButton.setAttribute('id', 'ToggleStraightLine_' + toolID);
            YUD.addClass(lineButton, 'measure_straight off');

            //add click event listener
            YUE.addListener(lineButton, 'click', function (e) {
                YUE.stopEvent(e);
                // if compass was enabled, hide it nomatter it's showing up or not
                if (compassEnabled) {
                    MT_setVisibility.call(page.mt[mtIndex].compass, 'hidden');
                    compassButton.className = 'measure_compass off';
                }

                var lineToolStatus = MT_setVisibility.call(page.mt[mtIndex].line);
                if (lineToolStatus == 'visible') {
                    this.className = 'measure_straight on';
                } else {
                    this.className = 'measure_straight off';
                }
            });
            
            buttonContainer.appendChild(lineButton);    //add line button to button container

            // initiate line tool for canvas initialization
            var line_mt = new MeasurementTool.StraightLine({
                visibility: 'hidden'
            });

            line_mt.set('zoomFactor', zoomFactor);  // zoomFactor for straight line tool positioning

            // push initialed line tool into toolBox for canvas initialization
            toolBox.push(line_mt);
            this.line = line_mt;
        }

        //add compass tool button, click listener, and initiate compass tool
        if (compassEnabled) {
            var compassButton = doc.createElement('button');
            compassButton.setAttribute('id', 'ToggleCompass_' + toolID);
            YUD.addClass(compassButton, 'measure_compass off');

            //add click listener
            YUE.addListener(compassButton, 'click', function (e) {
                YUE.stopEvent(e);
                // if line was enabled, hide it nomatter it's showing up or not
                if (lineEnabled) {
                    MT_setVisibility.call(page.mt[mtIndex].line, 'hidden');
                    lineButton.className = 'measure_straight off';
                }
                var compassToolStatus = MT_setVisibility.call(page.mt[mtIndex].compass);
                if (compassToolStatus == 'visible') {
                    this.className = 'measure_compass on';
                } else {
                    this.className = 'measure_compass off';
                }
            });
            
            buttonContainer.appendChild(compassButton); //add compass button to button container

            // initiate compass tool for canvas initialization
            var compass_mt = new MeasurementTool.Compass({
                visibility: 'hidden'
            });

            // push initialed compass tool into toolBox for canvas initialization
            toolBox.push(compass_mt);
            this.compass = compass_mt;
        }

        // add reset button (no straight line/compass tool, no reset button needed)
        if (lineEnabled || compassEnabled) {
            var resetButton = doc.createElement('button');
            resetButton.setAttribute('id', 'RestCanvas_' + toolID);
            YUD.addClass(resetButton, 'measure_reset off');

            //add click listener
            YUE.addListener(resetButton, 'click', function (e) {

                YUE.stopEvent(e);

                // hide tools, switch buttons, erase lines and arcs
                if (lineEnabled) {
                    MT_setVisibility.call(page.mt[mtIndex].line, 'hidden');
                    lineButton.className = 'measure_straight off';
                    page.mt[mtIndex].line.get('lines').removeAll();
                }

                if (compassEnabled) {
                    MT_setVisibility.call(page.mt[mtIndex].compass, 'hidden');
                    compassButton.className = 'measure_compass off';
                    page.mt[mtIndex].compass.get('arcs').removeAll();
                }

            });
            buttonContainer.appendChild(resetButton);
        }

        //construct image, canvas container and button html
        imgElem.setAttribute('src', imgSrc);
        imgElem.setAttribute('alt', 'line segments');
        imgParents.setAttribute('id', 'measurement_' + toolID);

        // set inline style for width and height, because that's the way 'width' and 'height' suppose to work, especially for (ff3.6)
        YUD.setStyle(imgParents, 'width', dataMTConfigWidth + 'px');
        YUD.setStyle(imgParents, 'height', dataMTConfigHeight + 'px');

        YUD.addClass(imgParents, 'contextArea illustrationContainer');
        YUD.addClass(buttonContainer, 'tools_measure');
        YUD.addClass(measuringElem, 'measuring');

        imgParents.appendChild(imgElem);
        measuringElem.appendChild(imgParents);
        measuringElem.appendChild(buttonContainer);

        mtContainer.replaceChild(measuringElem, mtElem);

        // initiate Canvas
        var s_canvas = new MeasurementTool.Canvas({
            node: imgParents,
            width: dataMTConfigWidth,
            height: dataMTConfigHeight,
            r: 20,
            //stroke: '#000',   // border of canvas
            children: new PiObject(toolBox)
        });

        // get rid of the style, to show the top and left border of canvas
        var canvasStyle = s_canvas.get('canvas').canvas.style;
        canvasStyle.removeProperty('left');
        canvasStyle.removeProperty('top');

        this.canvas = s_canvas;

        // zoom canvas/line/compass/image according to the page zoom
        var zoomMt = function (zoomfacor) {
            var curCanvas = this.canvas,
                curSvgElem = curCanvas.get('canvas').canvas;

            var zoomCtnWidth = dataMTConfigWidth * zoomfacor,
                zoomCtnHeight = dataMTConfigHeight * zoomfacor;

            // for line tool drawing use
            if (this.line) {
                this.line.set('zoomFactor', zoomfacor);
            }

            //zooming with viewbox attribute
            if (curCanvas) {
                curCanvas.get('canvas').setViewBox(0, 0, dataMTConfigWidth, dataMTConfigHeight);

                // zoom canvas container accordingly
                YUD.setStyle(imgParents, 'width', zoomCtnWidth + 'px');
                YUD.setStyle(imgParents, 'height', zoomCtnHeight + 'px');

                YUD.setAttribute(curSvgElem, 'width', zoomCtnWidth);
                YUD.setAttribute(curSvgElem, 'height', zoomCtnHeight);
            }
        };

        this.zoomMt = zoomMt;
    }

    // while page is available, instanciate the page scale tools for once, and initiate image scale tools one by one.
    CM.onPageEvent('available', function(page) {

        var pageEl = page.getElement(),
            doc = page.getDoc(),
            ruler = null,
            protractor = null,
            zoomFactor = page.getZoomFactor(),
            imgElements = Util.Array.slice(pageEl.getElementsByTagName('img')), // get all images on current page into an array
            mtIndex = 0, //for image scale measurement tool (line/compass, aka, page.mt) counts
            rightBoundary = doc.body.clientWidth,
            bottomBoundary = doc.body.clientHeight - doc.getElementById('topBar').clientHeight;   //height of '.content'
         
        // measurement tools array for straight line and compass
        page.mt = [];

        YUD.batch(imgElements, function (imgItem) {

            var rulerEnabled = YUD.getAttribute(imgItem, 'data-mt-ruler-enabled'),
                protractorEnabled = YUD.getAttribute(imgItem, 'data-mt-protractor-enabled'),
                lineEnabled = YUD.getAttribute(imgItem, 'data-mt-line-enabled'),
                compassEnabled = YUD.getAttribute(imgItem, 'data-mt-compass-enabled'),
                pageScaleToolClassName = Util.Browser.isIOS() && Util.Browser.getIOSVersion() < 7 ? 'mtPageScaleTools hideMeasuring' : 'mtPageScaleTools';   // if in iOS 6.x, apply 'hideMeasuring' class for svg canvas hiding

            // initiate ruler if there is no one on current page
            if (rulerEnabled && ruler == null) {

                // retrieve configration for ruler from <img> attributes
                var rulerMin = YUD.getAttribute(imgItem, 'data-mt-ruler-min');
                var rulerMax = YUD.getAttribute(imgItem, 'data-mt-ruler-max');
                var rulerSystem = YUD.getAttribute(imgItem, 'data-mt-ruler-system');
                var rulerLabel = YUD.getAttribute(imgItem, 'data-mt-ruler-label');
                // instanciate ruler
                ruler = new MeasurementTool.Ruler({
                    id: 'Ruler_' + page.id,
                    parent: pageEl,
                    visibility: 'hidden',
                    classname: pageScaleToolClassName,
                    min: rulerMin,
                    max: rulerMax,
                    system: rulerSystem,
                    label: rulerLabel
                });

                // get current page's right and bottom boundray for dragging ruler, doing this here because we need height of '#topBar' to make this accurate.
                ruler.set('rightBoundary', rightBoundary);
                ruler.set('bottomBoundary', bottomBoundary);

                page.ruler = ruler; // bind ruler to the page
                page.MT_toggleRuler = TDS.MT_toggleRuler;
            }

            // initiate protractor if there is no one on current page
            if (protractorEnabled && protractor == null) {

                // retrieve configration for protractor from <img> attributes
                var protractorSystem = YUD.getAttribute(imgItem, 'data-mt-protractor-system');
                var protractorLabel = YUD.getAttribute(imgItem, 'data-mt-protractor-label');

                // instanciate protractor
                protractor = new MeasurementTool.Protractor({
                    id: 'Protractor_' + page.id,
                    parent: pageEl,
                    visibility: 'hidden',
                    classname: pageScaleToolClassName,
                    system: protractorSystem,
                    label: protractorLabel
                });

                //get current page's right and bottom boundray for dragging protractor, doing this here because we need height of '#topBar' to make this accurate.
                protractor.set('rightBoundary', rightBoundary);
                protractor.set('bottomBoundary', bottomBoundary);

                page.protractor = protractor;
                page.MT_toggleProtractor = TDS.MT_toggleProtractor;
            }

            if (lineEnabled || compassEnabled) {
                //arguments for straight line and compass tool
                var mtArg = {
                    'page': page,
                    'imgItem': imgItem,
                    'mtIndex': mtIndex,
                    'lineEnabled': lineEnabled,
                    'compassEnabled': compassEnabled,
                    'zoomFactor': zoomFactor
                };
                page.mt[mtIndex] = new MTApplication(mtArg);
                mtIndex++;
            }

        }, this, true);

    });

    // when page show, get current color scheme and change the ruler/protractor stroke color accordingly
    CM.onPageEvent('show', function (page) {
        
        if (!page.ruler && !page.protractor) {
            return;
        }

        var accProps = TDS.getAccommodationProperties();
        if (accProps && accProps.hasReverseContrast()) {

            var color = '#808080';  //stroke color for reverse contrast color scheme

            if (page.ruler) {
                var rulerEls = page.ruler.get('children');

                rulerEls.get('tickmarksR').forEach(function (element) {
                    element.attr('stroke', color);
                });
                rulerEls.get('outline').attr('stroke', color);
                rulerEls.get('label').attr('stroke', color);
            }

            if (page.protractor) {
                var protractorEls = page.protractor.get('children');

                protractorEls.get('tickmarksR').forEach(function (element) {
                    element.attr('stroke', color);
                });
                protractorEls.get('tickmarks').forEach(function (element) {
                    element.attr('stroke', color);
                });
                protractorEls.get('outline').forEach(function (element) {
                    element.attr('stroke', color);
                });
                protractorEls.get('label').attr('stroke', color);

            }

        }
    });

    // scale MT when page zooms
    CM.onPageEvent('zoom', function(page, item) {
        if (!page.mt && !page.ruler && !page.protractor) {
            return;
        }
        // get current zoom factor
        var zoomFactor = page.getZoomFactor();

        // zoom straight line and compass
        if (page.mt) {
            for (var i = 0; i < page.mt.length; i++) {
                var curMt = page.mt[i];
                curMt.zoomMt(zoomFactor);
            }
        }
        
        // zoom ruler and protractor
        if (page.ruler) {
            page.ruler.setScale(0, 0, 0, zoomFactor);
        }

        if (page.protractor) {
            page.protractor.setScale(0, 0, 0, zoomFactor);
        }
    });

    // hide MT's when leaving the page
    CM.onPageEvent('hide', function (page) {

        // hide ruler
        if (page.ruler && page.ruler.get('visibility') == 'visible') {
            page.ruler.set('visibility', 'hidden');
        }

        // hide protractor
        if (page.protractor && page.protractor.get('visibility') == 'visible') {
            page.protractor.set('visibility', 'hidden');
        }
    });

})(ContentManager);