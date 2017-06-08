//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
﻿/*
 * QTI Hotspot Import/Export from the Grid model
 */

Grid.QtiImportExport = function(model) {

    var gridquestion = model;
    var answerSpaceXml;
    var defaultEvents = [
        {
            name: "select",
            styles: {
                'fill': "white",
                'fill-opacity': "0",
                'stroke': "red",
                'stroke-dasharray': "",
                'stroke-opacity': "",
                'stroke-width': "6"
            },
            image: null,
            label: null
        },
        {
            name: "hover",
            styles: {
                'fill': "white",
                'fill-opacity': "0",
                'stroke': "blue",
                'stroke-dasharray': "",
                'stroke-opacity': "",
                'stroke-width': "4"
            },
            image: null,
            label: null
        }
    ];

    this._importexport = new Grid.ImportExport(model);

    // public APIs - match Grid.ImportExport so that we can reuse Grid functionality to support Hotspot

    // getAnswerXml(): get student's response from SVG grid
    // loadItem (answerSpaceXml): load QTI Hotspot item question to SVG grid
    // loadAnswer(response): load a response into SVG grid
    // isStudentResponseValid(answerSpaceXml): check if student makes any response on item

    this.loadItem = function(qtiXmlStr, callbackCreated, callbackFailure) {
        // get all the image files in the xml
        var imageFiles = parseImageFiles(qtiXmlStr);
        var imageLoader = new Grid.ImportExport.ImageLoader();

        // if there are no images then begin parsing xml now
        if (imageFiles.length == 0) {
            loadItem2(qtiXmlStr, callbackCreated, imageLoader, imageFiles);
            return;
        }

        // add image file names to loader
        for (var i = 0; i < imageFiles.length; i++) {
            var url = Grid.ImportExport.resolveUrl(imageFiles[i].url);
            imageLoader.addImage(url);
        }

        // begin loading images and when finished call _loadItem2
        var self = this;

        imageLoader.load(function() {
            var imageErrors = imageLoader.getErrors();

            if (imageErrors.length == 0) {
                loadItem2.call(self, qtiXmlStr, callbackCreated, imageLoader, imageFiles);
            } else {
                callbackFailure('Error loading DOM images', imageErrors);
            }
        });

    };

    this.loadAnswer = function(response, gridq) {
        this._importexport.loadAnswer.call(this, response, gridq);
    };

    this.getAnswerXml = function() {
        this._importexport.getAnswerXml.call(this);
    };

    this.isStudentResponseValid = function() {
        this._importexport.isStudentResponseValid.call(this);
    };

    var parseImageFiles = function(qtiXmlStr) {
        var imageFiles = [];
        var xmlDoc = Grid.ImportExport.parseFromString(qtiXmlStr);

        // get all <object> elements

        var nodes = xmlDoc.getElementsByTagName('object');
        Grid.ImportExport.eachNode(nodes, function(node) {
            var nodeType = node.getAttribute('type');
            if (nodeType.indexOf('image') != -1) {
                var imageFile = {
                    url: node.getAttribute('data'),
                    height: node.getAttribute('height'),
                    width: node.getAttribute('width')
                };
                if (imageFiles.indexOf(imageFile) == -1) {
                    imageFiles.push(imageFile);
                }
            }
        });

        return imageFiles;
    };

    var addBackgroundImage = function(imageFiles, imageLoader) {
        for (var i = 0; i < imageFiles.length; i++) {
            var img = imageFiles[i];
            var url = Grid.ImportExport.resolveUrl(img.url);
            var htmlImage = imageLoader.getImage(url);

            if ((htmlImage != null) && (img.height != null) && (img.width != null)) {
                gridquestion.addBackgroundImage(htmlImage.src, 0, 0, htmlImage.width, htmlImage.height);
            }
        }
    };

    var parseHotspotChoice = function(regionNode) {
        var region = {
            name: regionNode.getAttribute('identifier'),
            shape: regionNode.getAttribute('shape'),
            coords: regionNode.getAttribute('coords'),
            // hotspot events not part of QTI spec, so we will load default events
            events: defaultEvents
        };

        return region;
    };

    var loadHotspots = function(xmlDoc, localModel, imageLoader) {
        var hotspots = [];

        // Create regionGroup of all hotspotChoices
        // apply minChoice and maxChoice to regionGroup
        // - QTI has no concept of regionGroup, but we use Grid regionGroup
        //   to handle min and max
        var qtiObject = xmlDoc.getElementsByTagName('hotspotInteraction')[0];
        var minChoices = qtiObject.getAttribute('minChoices');
        var maxChoices = qtiObject.getAttribute('maxChoices');
        var regionGroup = localModel.createRegionGroup('All', minChoices, maxChoices);

        // Parse hotspotChoices into region JSON
        var regionNodes = xmlDoc.getElementsByTagName('hotspotChoice');
        Grid.ImportExport.eachNode(regionNodes, function(regionNode) {
            var regionJson = parseHotspotChoice(regionNode);
            hotspots.push(regionJson);
        });

        // Import regions into grid item
        Grid.ImportExport.eachNode(hotspots, function(regionJson) {

            // create region from hotspotChoice
            // i.e. shape="circle" coords="77,115,8" identifier="A"
            var region = localModel.createRegion(regionJson.name, regionJson.shape, regionJson.coords);
            if (region == null) return; // this can happen when shape is unknown

            // add region to regionGroup 'All'
            regionGroup.addRegion(region);

            if (regionJson.events == null) regionJson.events = defaultEvents;
            Grid.ImportExport.eachNode(regionJson.events, function(eventJson) {
                // create region event
                var event = region.createEvent(eventJson.name);
                event.setStyles(eventJson.styles);

                // create region label
                if (eventJson.label != null) {
                    event.setLabel(eventJson.label.x, eventJson.label.y, eventJson.label.text);
                }

                // create region image
                if (eventJson.image != null) {
                    var url = Grid.ImportExport.resolveUrl(eventJson.image.src);
                    var htmlImage = imageLoader.getImage(url);

                    if (htmlImage != null) {
                        event.setImage(url, eventJson.image.x, eventJson.image.y, htmlImage.width, htmlImage.height);
                    }
                }
            });

            // this will set default region style
            region.update();
        });
    };

    /*
    function removeQuotes(str) {
        var first = str.indexOf('"');
        if (first == -1) return str;
        str = str.substring(first + 1);
        var second = str.lastIndexOf('"');
        if (second == -1) return str;
        return str.substring(0, second);
    }
    */

    var loadItem2 = function(qtiXmlStr, callback, imageLoader, imageFiles) {
        answerSpaceXml = qtiXmlStr;
        var xmlDoc = Grid.ImportExport.parseFromString(qtiXmlStr);

        // Background Images
        addBackgroundImage(imageFiles, imageLoader);

        // Hotspots
        loadHotspots(xmlDoc, gridquestion, imageLoader);

        //fire callback
        if (typeof callback == 'function') callback();

    };
};