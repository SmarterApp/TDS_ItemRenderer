/*
Widget for simulator.
*/

(function (CM, TS) {

    // create the simulator
    function create(page, item, containerEl, simXml) {
        
        var simulator = null;

        // begins loading the simulators resources (images and flash)
        var simImageFiles = SimulationLoader.parseImages(simXml /*, translationXml*/);

        // FOR TESTING: when translations are appended to simXml
        // !! make sure URL redirects are set-up for this: set "testMode = true" in UrlResolver.ResolveSpecXmlUrls(), found in TDS.ItemRenderer\Processing\ITSUrlResolver.cs
        // var simImageFiles = SimulationLoader.parseImages(simXml, 'TEST MODE');


        // add resources to loader
        for (var i = 0; i < simImageFiles.length; i++) {
            var loaderImage = new ResourceLoader.Image(simImageFiles[i]);
            page.addResourceLoader(loaderImage);
        }

        var simSWFFiles = SimulationLoader.parseFlash(simXml);

        for (var i = 0; i < simSWFFiles.length; i++) {
            var loaderBinary = new ResourceLoader.Binary(simSWFFiles[i]);
            page.addResourceLoader(loaderBinary);
        }

        var responseXml;

        // if this is ran within TDS then ask TDS for the response..
        if (TS && TS.PageManager) {
            var response = TS.PageManager.getResponse(item.position);
            responseXml = response.getLastValue();
        }
        // otherwise use whatever the item has..
        else {
            responseXml = item.value;
        }

        // load sim xml
        simulator = new Simulator.Simulator(containerEl, CM.isAccessibilityEnabled());
        Simulator.Animation.FlashAnimationInterface.MapInstance(simulator);
        simulator.setAnimationShellPath(CM.resolveBaseUrl('Scripts/Simulator2/Renderer/SWF/SimulationShell.swf'));
        simulator.setAnimationExternalScriptsPath(CM.resolveBaseUrl('Scripts/Libraries'));
        simulator.presetLanguage(CM.getLanguage()); // set language to display
        
        simulator.loadXml(simXml, responseXml/*, translationXml*/);


        // NOTE: This is hack for student code.
        item.simulator = simulator;

        // add TDS specific features to sim doc
        var simWin = simulator.getWin();
        var simDoc = simulator.getDoc();

        /****** removed per fb-145454 ******
        // (focus was making dropDowns inoperable in
        // SB version based on Firefox 10)

        // create sim component
        var simComponent = {
            id: 'SIM_' + item.position,
            focus: function () { Util.Dom.focus(containerEl); },
            blur: function () { Util.Dom.blur(containerEl); }
        };

        item.addComponent(simComponent); // simDoc.body

        YUE.on(containerEl, 'click', function () {
            item.setActiveComponent(simComponent);
        });

        ************************************/

        var zoomImage = function (img) {
            var zoom = page.getZoom();
            if (zoom) {
                zoom.updateElement(img);
            }
        };

        // dynamically loaded images need to be re-zoomed; this updates the zoom level of all images within the simulator
        var updateZoom = function () {
            var zoom = page.getZoom();
            if (zoom) {
                zoom.updateElements(containerEl);
            }
        };

        // Check all images.
        YUD.batch(simDoc.getElementsByTagName('img'), function (img) {
            // Check if image has loaded already.
            // (If it is cached or fast enough this will be true.)
            if (Util.Dom.isImgLoaded(img)) {
                zoomImage(img);
            }
            else {
                // Wait for image to load.
                // (We have to wait otherwise the width/height will be the
                // dimensions of the inline DOM element and not the image.)
                YUE.on(img, 'load', function () {
                    zoomImage(img);
                });
            }
        });

        // check for when flash gets added
        simulator.subscribe('info', 'animationEmbedded', function (evt) {
            VideoManager.SWF.stopRightClick(evt.data);
        });

        // check for images that get added after instantiation (post-animation posters...)
        simulator.subscribe('info', 'imageEmbedded', function (evt) {
            updateZoom();
        });

        // check for state changes
        simulator.subscribe('info', 'simulatorStateChange', function (evt) {
            // console.info('simulatorStateChange: ' + evt.data);

            if (YAHOO.lang.isString(evt.data)) {
                var eventType = evt.data.toUpperCase();

                // check if sim is ready
                if (eventType == "READY") {

                    // if we are in read only mode then set sim as locked
                    if (item.isReadOnly()) {
                        simulator.setReadOnlyState(true);
                    }

                    // remove loading screen
                    YUD.removeClass(containerEl, 'loading');
                }
                    // check if sim has an error
                else if (eventType == "ERROR") {
                    // add error screen
                    YUD.addClass(containerEl, 'failed');
                }
            }
        });

        // subscribe to sim window onerror
        if (typeof TDS.Diagnostics == 'object') {
            TDS.Diagnostics.addErrorHandler(simWin);
        }

        return simulator;

    }

    function Widget_Sim(page, item, config) {
        this.simulator = null;
    }

    function match(page, item, content) {
        var id = 'SimContainer_' + item.position;
        var el = document.getElementById(id);
        if (el && item.rendererSpec) {
            return new CM.WidgetConfig(id, el, item.rendererSpec);
        }
        return false;
    }

    CM.registerWidget('simulator', Widget_Sim, match);

    Widget_Sim.prototype.load = function() {
        this.simulator = create(this.page, this.entity, this.element, this.config);
    }

    Widget_Sim.prototype.zoom = function(level) {
        this.simulator.zoom(level);
    }

    Widget_Sim.prototype.show = function() {
        this.simulator.setVisibilityAndAttachEvents(true);
    }

    Widget_Sim.prototype.hide = function () {
        this.simulator.setVisibilityAndAttachEvents(false);
        this.simulator.hide();
    }

    Widget_Sim.prototype.focus = function () {
        this.simulator.focus();
    }

    Widget_Sim.prototype.blur = function () {
        this.simulator.blur();
    }

    Widget_Sim.prototype.isResponseAvailable = function () {
        return this.simulator && this.simulator.isLoaded();
    }

    Widget_Sim.prototype.getResponse = function () {
        var value = this.simulator.getResponseXml();
        var isValid = this.simulator.isValid();
        return this.createResponse(value, isValid);
    }

    Widget_Sim.prototype.setResponse = function (value) {
        this.simulator.loadResponseXml(value);
    }

})(window.ContentManager, window.TestShell);


