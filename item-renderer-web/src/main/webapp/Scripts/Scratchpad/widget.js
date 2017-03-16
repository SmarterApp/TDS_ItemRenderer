//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
﻿/*
 *  This is a copy of the TestShell.Comments code, will try and register it and 
 * make it work for ItemPreview.
 */
(function(CM, ScratchPad) {
    
    //Ensure that the javascript is loaded / enabled
    if (!ScratchPad) {
        return;
    } 
    
    function editListener(nodeId, node) {

        //Need to get the data that may already exist in this data and ensure we can open a valid
        //notes object (unserialize)
        console.log("what is this?", this, nodeId);

        var isNew = (typeof node.properties.data === 'object') ? false : true;
        var wnd = SPEquations.init(this.id, node);
        wnd.show();

        //save handler
        wnd.preSave = function (args, eqWnd) {
            console.log("$$$$equation item save", this);

            //get the data out of the notes comments.
            var data = args.data ? args.data.comment : {};
            data.isNew = isNew; //to flag new requests

            //Fires off the updateDomListener / convert-dom-request event.
            this.setItemProperty(nodeId, 'data', data);

            return false;//Prevent ajax save in the notes framework
        }.bind(this);

        //cancel handler
        wnd.preClose = function () {
            console.log("$$$$equation item cancel", this);

            if (isNew) {
                this.app.view.eventSource.emit("menu.undo", {});
            }

            return false;
        }.bind(this);
    }

    /*
    // This is used for updating the equation editor
    function updateDomListener(data, nodeId) {

        console.log("Update dom listener?", this, data, nodeId);

        data = data || {};
        data.navigation = false;
        data.tabs = false;

        var node = this.app.view.doc.getNode(nodeId);

        var me = new MathJax.Editor.Widget(data);
        var div = me.getContainerDom();
        div.parentNode.removeChild(div); //Remove from the current page, add to canvas

        //delete old widget ref if exists
        if (typeof node.widgetId !== 'undefined') {
            MathJax.Editor.Store.remove(node.widgetId);
        }
        node.widgetId = me.id; //widget id wrt to store, to clear unused objs

        //Hmm, this is a little scary
        this.setDomElement(nodeId, div);

    }
    */

    // parse all the image file names out of SP answer space xml
    function parseImageFiles(questionXml) {

        var eachNode = function (nodeList, func) {
            var nodes = [];

            for (var i = 0; i < nodeList.length; i++) {
                nodes.push(nodeList[i] || nodeList.item(i));
            }

            YAHOO.util.Dom.batch(nodes, func);
        };

        var getTextContent = function (node) {
            if (node && node.childNodes && node.childNodes.length)
                return node.childNodes[0].nodeValue;
            return null;
        };

        var imageFiles = [];
        var xmlDoc = Util.Xml.parseFromString(questionXml);

        // get all <backgroundImage> elements
        var imageNodes = xmlDoc.getElementsByTagName('backgroundImage');

        eachNode(imageNodes, function (imageNode) {
            var imageFile = getTextContent(imageNode);
            if (imageFiles.indexOf(imageFile) == -1) imageFiles.push(imageFile);
        });

        return imageFiles;
    };

    // load image files from the SP into the page collection
    function loadImageFiles(page, questionXml) {
        // get all the image file names out of the SP answer space xml
        var imageFiles = parseImageFiles(questionXml);

        for (var i = 0; i < imageFiles.length; i++) {
            var imageFile = imageFiles[i];

            // we need to resolve the url in the same we do for
            // SP so we use same file name and it gets cached
            var imageUrl = resolveUrl(imageFile);
            // create image and add it to the pages collection
            var img = new Image();
            page.getRenderer().addImage(img);
            img.src = imageUrl;
        }
    };

    function resolveUrl(url) {
        // change any html ampersand entities into the ampersand character
        url = url.replace(/&amp;/g, '&');

        // escape url
        url = url.split('&').join('&amp;').split('<').join('&lt;').split('"').join('&quot;');

        var el = document.createElement('div');
        el.innerHTML = '<a href="' + url + '">x</a>';
        return el.firstChild.href;
    };

    /////////////////////////////////////////////////////

    //Setup some configuration that is based purely on ItemPreview / Blackbox
    ScratchPad.Config = ScratchPad.Config || {};
    ScratchPad.Config.DefaultLabel = CM.getCommentLabel();
    ScratchPad.Config.CommentCode = 'ScratchPad';

    function match(page, item, config) {
        var id = 'ScratchPad_' + item.position;
        var el = document.getElementById(id);
        if (el && item.rendererSpec) {
            return new CM.WidgetConfig(id, el, item.rendererSpec);
        }
        return false;
    }

    function Widget_SP(page, item, content) {
        this.scratchpad = null;
    }

    CM.registerWidget('scratchpad', Widget_SP, match);

    // find all SP images and add them to page load
    Widget_SP.prototype.init = function () {
        loadImageFiles(this.page, this.entity.rendererSpec);
    }
    
    Widget_SP.prototype.load = function() {

        var item = this.entity;

        // Build or retrieve the scratchpad
        var sp = ScratchPad.Factory.getInstance().createScratchPad(this.id, this.config);
        this.scratchpad = sp;

        // Define a format for the Zwibbler item
        setTimeout(function () {
            sp.app.resizeCanvas();
            sp.app.view.draw();
            if (item.value) {
                sp.setResponseXml(item.value);
            }
        }, 100); // Have to delay the size check when dealing with IE

        // listen for events
        sp.on('math.edit', editListener.bind(sp));
        // sp.on('convert-dom-request', updateDomListener.bind(sp));

        // set readonly function
        sp.isReadOnly = item.isReadOnly;

        //Initial page settings for the mathjax lib, changes will be made on zoom
        /*
        MathJax.Editor.Config.DEBUG = false;
        MathJax.Hub.Config({
            showMathMenu: false,
            "HTML-CSS": {
                availableFonts: ["TeX"],
                imageFont: null, //work with webfonts only
                scale: MathJax.Editor.Config.Scale || 150
            }
        });
        */
    }

    Widget_SP.prototype.zoom = function(level) {
        this.scratchpad.app.zoom(level);
    }

    Widget_SP.prototype.getResponse = function () {
        var value = this.scratchpad.getResponseXml();
        var isValid = this.scratchpad.isValid();
        return this.createResponse(value, isValid);
    }

    Widget_SP.prototype.setResponse = function (value) {
        this.scratchpad.setResponseXml(value);
    }
    
})(window.ContentManager, window.ScratchPad);