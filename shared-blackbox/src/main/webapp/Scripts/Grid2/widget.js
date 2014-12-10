/*
This module hooks up the grid renderer. 
*/

(function(CM) {

    // returns true if this is a grid item
    function isGrid(item) {
        return item.isResponseType('grid');
    }

    // returns true if a qti item that requires grid
    function isQTI(item) {
        return item.isResponseType('hotspot');
    }
    
    // call this function when you find a grid item
    function create(page, item, containerEl, gridAnswerSpace) {

        var doc = page.getDoc();

        // make sure container exists
        if (containerEl == null) {
            return null;
        }

        // create grid object
        var gridSvg = CM.resolveBaseUrl('Scripts/Grid2/grid.svg');
        var grid = new Grid(containerEl, gridSvg);

        // if this is a qti item then use the QTI importer
        if (isQTI(item)) {
            CM.QTI.loadStem(item);
            grid.importexport = new Grid.QtiImportExport(grid.model);
        };

        // NOTE: This is hack for student code.
        item.grid = grid;

        // add loading screen
        YUD.addClass(containerEl, 'loading');

        // disable internal tabbing
        grid.allowTab = false;

        // set read-only
        grid.isReadOnly = item.isReadOnly;

        // class for representing a grid component
        var GridComponent = function(panelName) {
            this.id = panelName;
            this.getXY = function() { return [0, 0]; };

            this.focus = function() {
                grid.setArea(panelName);
                Util.Dom.focus(grid.ui._svgWin);
            };

            this.blur = function() {
                grid.setArea(null);

                // BUG #91417: Browser flickers or minimizes when interacting with Grid and navigating to other pages
                if (!Util.Browser.isIE()) {
                    // TODO: Do we even need this code?
                    Util.Dom.blur(grid.ui._svgWin);
                }
            };

            this.toString = function() { return panelName; };
        };

        // hash of grid components
        var gridComponents = {};
        gridComponents['canvas'] = new GridComponent('canvas');
        gridComponents['palette'] = new GridComponent('palette');
        gridComponents['toolbar'] = new GridComponent('toolbar');

        // state changes
        grid.subscribe('onStateChange', function(gridEvt) {

            // svg is ready
            if (gridEvt.state == GridState.Ready) {

                // add content manager key events
                CM.addKeyEvents(grid.ui._svgRoot);

                // add student shell key events
                if (typeof (KeyManager) == 'object') {
                    KeyManager.attachListener(grid.ui._svgRoot);
                }

                // load the gridanswerspace and response
                setTimeout(function() {

                    var gridResponse = null;

                    // HACK: if this is ran within student test shell then ask page manager for the response..
                    if (typeof (window.TestShell) == 'object' &&
                        typeof (window.TestShell.PageManager) == 'object') {
                        var response = window.TestShell.PageManager.getResponse(item.position);
                        gridResponse = response.getLastValue();
                    } else {
                        // use whatever the item has..
                        gridResponse = item.value;
                    }

                    // check if qti loader was used
                    if (Grid.QtiImportExport && grid.importexport instanceof Grid.QtiImportExport) {
                        grid.loadXml(item.qti.xml, gridResponse);
                    } else {
                        grid.loadXml(gridAnswerSpace, gridResponse);
                    }

                }, 0);
            }

            // answerspace/response is loaded
            if (gridEvt.state == GridState.Loaded) {

                // remove loading screen
                YUD.removeClass(containerEl, 'loading');

                // add components of the grid
                if (grid.question.options.showPalette) {
                    item.addComponent(gridComponents['palette']);
                }
                if (grid.question.options.showButtons.length > 0) {
                    item.addComponent(gridComponents['toolbar']);
                }
                item.addComponent(gridComponents['canvas']);

                // get current zoom factor
                var zoomFactor = page.getZoomFactor();

                // zooming doesn't seem to work unless it is scheduled
                setTimeout(function() {
                    grid.ui.zoom(zoomFactor);
                }, 0);

                // fix offset
                if (page.isShowing()) {
                    grid.ui._fixOffset();
                }
            }

            // Error loading the grid (missing images, failed svg load)
            if (gridEvt.state == GridState.Error) {

                // remove loading screen
                YUD.removeClass(containerEl, 'loading');

                // show grid error icon
                YUD.addClass(containerEl, 'failed');

                // hide grid object
                if (grid.ui && grid.ui._svgObject) {
                    YUD.setStyle(grid.ui._svgObject, 'display', 'none');
                }
            }

            CM.log('GRID ' + item.position + ': STATE - ' + gridEvt.name);
        });

        // logging
        grid.subscribe('onModeChange', function(gridEvt) {
            CM.log('GRID ' + item.position + ': MODE - ' + gridEvt.name);
        });

        // tell content manager about new active component
        grid.subscribe('onAreaChange', function(gridEvt) {

            if (gridEvt.name != null) {
                item.setActive(gridEvt); // NOTE: Must pass in object or scrollTo get triggered on page
                item.setActiveComponent(gridComponents[gridEvt.name]);
            }

            CM.log('GRID ' + item.position + ': AREA - ' + gridEvt.name);
        });

        // check if we should send error logs
        if (typeof TDS.Diagnostics == 'object') {

            // subscribe to state changes
            grid.subscribe('onStateChange', function(gridEvt) {

                // check if svg object has been created
                if (gridEvt.state == GridState.Created) {
                    // subscribe to svg window onerror
                    TDS.Diagnostics.addErrorHandler(grid.view._svgWin);
                }
            });

            // subscribe to exceptions
            grid.subscribe('onError', function(evt) {
                if (evt.exception) {
                    TDS.Diagnostics.report(evt.exception);
                }
            });
        }

        // initialize grid
        grid.init();

        return grid;
    }

    function match_ITS(page, item, content) {
        var id = 'GridContainer_' + item.position;
        var el = document.getElementById(id);
        if (el) {
            return new CM.WidgetConfig(id, el, item.gridAnswerSpace);
        }
        return false;
    }

    function Widget_Grid(page, item, config) {
        this.grid = null;
    }

    // register ITS grid answer space
    CM.registerWidget('grid', Widget_Grid, match_ITS);

    // register QTI custom interaction
    var match_QTI = CM.QTI.createWidgetMatch('customInteraction', 'grid');
    CM.registerWidget('qti.grid', Widget_Grid, match_QTI);

    Widget_Grid.prototype.init = function() {
        // find all grid images and add them to page load
        Grid.Utils.loadImageFiles(this.page, this.config);
    }

    Widget_Grid.prototype.load = function () {
        this.grid = create(this.page, this.entity, this.element, this.config);
    }

    Widget_Grid.prototype.show = function() {
        // fix offset
        if (this.grid.ui._svgObject) {
            this.grid.ui._fixOffset();
        }
    }

    Widget_Grid.prototype.zoom = function (level) {
        this.grid.ui.zoom(level);
    }

    Widget_Grid.prototype.isResponseAvailable = function() {
        return this.grid && this.grid.isLoaded();
    }

    Widget_Grid.prototype.getResponse = function () {
        var value = this.grid.getResponseXml();
        var isValid = this.grid.isValid();
        return this.createResponse(value, isValid);
    }

    Widget_Grid.prototype.setResponse = function (value) {
        this.grid.importexport.loadAnswer(value);
    }

})(window.ContentManager);

/*******************************************************************************/

if (typeof (Grid.Utils) == 'undefined') {
    Grid.Utils = {};
}

// parse all the image file names out of grid answer space xml
Grid.Utils.parseImageFiles = function(xmlStr) {
    var eachNode = function(nodeList, func) {
        var nodes = [];

        for (var i = 0; i < nodeList.length; i++) {
            nodes.push(nodeList[i] || nodeList.item(i));
        }

        YAHOO.util.Dom.batch(nodes, func);
    };

    var getTextContent = function(node) {
        if (node && node.childNodes && node.childNodes.length) {
            return node.childNodes[0].nodeValue;
        }
        return null;
    };

    var imageFiles = [];
    var xmlDoc;
    if (typeof xmlStr == 'string') {
        xmlDoc = Util.Xml.parseFromString(xmlStr);
    } else {
        xmlDoc = xmlStr;
    }

    // get all <FileSpec> elements
    var imageNodes = xmlDoc.getElementsByTagName('FileSpec');
    
    eachNode(imageNodes, function(imageNode) {
        var imageFile = getTextContent(imageNode);
        if (imageFiles.indexOf(imageFile) == -1) {
            imageFiles.push(imageFile);
        }
    });

    // get all <Image> elements
    imageNodes = xmlDoc.getElementsByTagName('Image');

    eachNode(imageNodes, function(imageNode) {
        var imageFile = imageNode.getAttribute('src');
        if (imageFiles.indexOf(imageFile) == -1) {
            imageFiles.push(imageFile);
        }
    });

    return imageFiles;
};

// load image files from the grid into the page collection
Grid.Utils.loadImageFiles = function(page, questionXml) {
    // get all the image file names out of the grid answer space xml
    var imageFiles = Grid.Utils.parseImageFiles(questionXml);

    for (var i = 0; i < imageFiles.length; i++) {
        var imageFile = imageFiles[i];

        // we need to resolve the url in the same we do for
        // grid so we use same file name and it gets cached
        var imageUrl = Grid.ImportExport.resolveUrl(imageFile);

        // create image and add it to the pages collection
        var img = new Image();
        page.getRenderer().addImage(img);
        img.src = imageUrl;
    }
};