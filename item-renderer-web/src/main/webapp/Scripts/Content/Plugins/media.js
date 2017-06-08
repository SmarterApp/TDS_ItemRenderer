//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
﻿/*
This is used to swap out images with different media data:
- MathML
- SVG
- Base64
NOTE: For this to work you need to be using ITSUrlResolver2
*/

(function(CM) {

    // get all the media resources in the content json
    var getMediaResources = function(content) {

        // check if the media files are already part of this object
        if (content.media) {
            return content.media;
        }

        // find all the media files
        var mediaResources = [];

        if (content.passage && content.passage.media) {
            mediaResources = Util.Array.concat(mediaResources, content.passage.media);
        }

        if (content.items) {
            for (var i = 0; i < content.items.length; i++) {
                var item = content.items[i];
                if (item.media) {
                    mediaResources = Util.Array.concat(mediaResources, item.media);
                }
            }
        }

        return mediaResources;
    };

    // searches the contents meda for a matching url resource
    var findMediaResource = function(content, url) {

        var mediaResources = getMediaResources(content);
        
        for (var i = 0; i < mediaResources.length; i++) {
            var mediaResource = mediaResources[i];
            if (url.indexOf(mediaResource.file) != -1) {
                return mediaResource;
            }
        }

        return null;
    };

    // this cleans up xml for parsing
    var cleanXml = function(xmlStr) {
        xmlStr = xmlStr.replace('<?xml version="1.0" encoding="UTF-8"?>', '');
        return xmlStr;
    };

    // this cleans up mathml string for parsing
    var cleanMathML = function(mathMLStr) {
        mathMLStr = mathMLStr.replace('<!DOCTYPE math:math PUBLIC "-//OpenOffice.org//DTD Modified W3C MathML 1.01//EN" "math.dtd">', '');
        mathMLStr = mathMLStr.replace(/math:/g, ''); // remove namespaced elements
        mathMLStr = mathMLStr.replace(/:math/g, ''); // remove namespaced elements
        return mathMLStr;
    };

    // if this is true then this is a special math character
    var isMathMLSymbol = function(text) {
        if (text) {
            var code = text.charCodeAt(0);
            // Ranges: http://jrgraphix.net/research/unicode_blocks.php
            // Lookup://unicodelookup.com/
            // Symbols: http://www.johndcook.com/math_symbols.html
            if (code >= 0x00A0 && code <= 0x00FF) { // Latin-1 Supplement
                return true;
            }
            else if (code >= 0x2190 && code <= 0x21FF) { // Arrows
                return true;
            }
            else if (code >= 0x2300 && code <= 0x23FF) { // Misc Technical
                return true;
            }
            else if (code >= 0x2022 && code <= 0x22FF) { // Math Operators
                return true;
            }
            else if (code >= 0x25A0 && code <= 0x25FF) { // Geometric Shapes
                return true;
            }
            else if (code >= 0x0391 && code <= 0x03C9) { // Greek alphabets http://unicode-table.com/en/blocks/greek-coptic/
                return true;
            }            
        }
        return false;
    };
    
    /*
    JAWS HTML support:
    If you wrap the <math> in a <span> and make it aria-hidden=true then it won’t play. 
    On the first <span> the role=math is useless, but since all specs say to add it I went ahead. 
    And the role=group/aria-label combo does not work if you hide things inside of it (bug?). 
    We are left with an additional <span> which we have to move off the screen.
    <body>
        This is some math: 
        <span role="math">
            <span class="hidden">READ THIS</span>
            <span role="presentation" aria-hidden="true">
                <math xmlns="http://www.w3.org/1998/Math/MathML">
                    <mtext>DON'T READ THIS</mtext>
                </math>
            </span>
        </span>
    </body>
    */

    // this cleans up mathml dom object
    var processMathML = function (mathMLDoc) {

        // get math elements we want to check for special chars
        Util.Dom.querySelectorBatch('mi, mo', mathMLDoc, function(el) {

            // check if special char
            var text = Util.Dom.getTextContent(el);
            if (isMathMLSymbol(text)) {

                // add symbol class
                YUD.addClass(el, 'symbol');
                YUD.addClass(el, 'symbol_' + text.charCodeAt(0));

                // remove special styling
                if (el.getAttribute('lspace')) {
                    el.removeAttribute('lspace');
                }
                if (el.getAttribute('rspace')) {
                    el.removeAttribute('rspace');
                }

                /*
                <mrow><mi></mi></mrow>
                Replaced with 
                <mspace> </mspace>
                */
            }
        });
    };

    // process a image node that is going to be replaced by xml
    var processPageImageXml = function (page, pageXmlDoc, imgNode, mediaResource) {

        var mediaData = mediaResource.data;

        // check if MathML and fix raw xml string
        if (mediaData.indexOf('MathML') != -1) {

            // check if browser supports MathML
            if (!Util.Browser.supportsMathML()) {
                return false;
            }

            // we need to disable MathML if we think they are using a screen reader (e.x., JAWS)
            var pageAccs = page.getAccProps();
            if (pageAccs) {
                // in braille mode they are probably using a screen reader and braille display
                if (pageAccs.hasBraille()) {
                    return false;
                }
                // in streamlined mode and permissive mode we assume they are allowing a screen reader to run
                if (pageAccs.isStreamlinedMode() &&
                    pageAccs.isPermissiveModeEnabled()) {
                    return false;
                }
                // TODO: How about an actual screen reader accommodation?
            }

            // cleanup MathML
            mediaData = cleanMathML(mediaData);
        }

        // cleanup xml
        mediaData = cleanXml(mediaData);
        
        // parse media xml document
        var mediaDoc = Util.Xml.parseFromString(mediaData);

        // check if MathML and process data
        if (mediaData.indexOf('MathML') != -1) {
            processMathML(mediaDoc);
        }

        // import the new root into the html dom 
        var mediaNode = pageXmlDoc.importNode(mediaDoc.documentElement, true);

        // set alt tag for TTS
        var imgAlt = imgNode.getAttribute('alt');
        if (imgAlt) {
            mediaNode.setAttribute('alt', imgAlt);
        }

        YUD.insertBefore(mediaNode, imgNode);
        Util.Dom.removeNode(imgNode);

        return true;
    };
    
    var processPageImageBase64 = function (page, pageXmlDoc, imgNode, mediaResource) {

        // set the images base64 data
        imgNode.src = 'data:' + mediaResource.type + ';base64,' + mediaResource.data;
        return true;
    };

    // call this to process the media on any xml document
    var processImages = function (page, content, xmlDoc) {

        // find all the images
        var imageNodes = xmlDoc.getElementsByTagName('img');

        // NOTE: node collection is an iterator so we need to clone it or it will shrink during removal of images
        imageNodes = Util.Array.slice(imageNodes);

        var changed = false;

        for (var i = 0; i < imageNodes.length; i++) {

            var imgNode = imageNodes[i];

            // lookup image resource data
            var imgUrl = imgNode.getAttribute('src');
            var mediaResource = findMediaResource(content, imgUrl);

            // check if valid resource data
            if (mediaResource == null ||
                mediaResource.data == null) continue;

            // process xml
            if (mediaResource.type == 'application/mathml+xml') {
                if (processPageImageXml(page, xmlDoc, imgNode, mediaResource)) {
                    changed = true;
                }
            }
            else if (mediaResource.type == 'image/png') {
                if (processPageImageBase64(page, xmlDoc, imgNode, mediaResource)) {
                    changed = true;
                }
            }
        }

        return changed;

    };

    // add image transform
    CM.addTransform({
        match: function (page, content, xmlStr) {
            // ignore IE for now (issues..)
            if (YAHOO.env.ua.ie) return false;

            // check if this page has any media resources
            return getMediaResources(content).length > 0;
        },
        execute: processImages
    });

    // add audio transform
    CM.addTransform({
        match: function (page, content, xmlStr) {
            return xmlStr.indexOf('<audio') != -1;
        },
        execute: function (page, content, xmlDoc) {
            $('audio', xmlDoc).each(function (idx, audioNode) {
                var newEl = Util.Dom.renameTag(audioNode, 'div');
                var currentClass = newEl.getAttribute('class');
                if (!currentClass) {
                    newEl.setAttribute('class', 'tds-audio');
                }  else if (currentClass.indexOf('tds-audio') === -1) {
                    newEl.setAttribute('class', currentClass + ' tds-audio');
                }
            });
            return true;
        }
    });

})(window.ContentManager);

