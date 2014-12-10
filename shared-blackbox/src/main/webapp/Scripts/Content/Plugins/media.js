/*
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
            else if (code == 0x03C0) { // Pi symbol
                return true;
            }
        }
        return false;
    };
    
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

    // Call this to check if browser supports MathML.
    // Summary of Browser Support for MathML: https://vismor.com/documents/site_implementation/viewing_mathematics/S1.SS2.php
    var supportsMathML = function() {

        // if we are using ipad or android SB then disable MathML
        if (Util.Browser.isSecure() && (YAHOO.env.ua.android || YAHOO.env.ua.ios)) {
            return false;
        }

        // check firefox
        if (Util.Browser.getFirefoxVersion() > 0) {
            return (Util.Browser.getFirefoxVersion() >= 4.0); // Firefox 4.0+
        }
        
        // check chrome
        if (YAHOO.env.ua.chrome > 0) {
            // Chrome 24 added MathML but Chrome 25+ disabled it...
            // https://code.google.com/p/chromium/issues/detail?id=174455
            return false; 
        }
        
        // check safari
        if (YAHOO.env.ua.webkit >= 534) {
            return true; // Safari 5.1+
        }

        // no browsers match
        return false;
    };

    // process a image node that is going to be replaced by xml
    var processPageImageXml = function(pageXmlDoc, imgNode, mediaResource) {

        var mediaData = mediaResource.data;

        // check if MathML and fix raw xml string
        if (mediaData.indexOf('MathML') != -1) {

            // check if browser supports MathML
            if (!supportsMathML()) return false;

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

        // insert resource data and remove image
        YUD.insertBefore(mediaNode, imgNode);
        Util.Dom.removeNode(imgNode);

        return true;
    };
    
    var processPageImageBase64 = function(pageXmlDoc, imgNode, mediaResource) {

        // set the images base64 data
        imgNode.src = 'data:' + mediaResource.type + ';base64,' + mediaResource.data;
        return true;
    };

    // This serializes to HTML.
    // Use this in place of serializeToString otherwise some browsers collapse <span>'s.
    var serializeToHtmlString = function(node) {
        var div = document.createElement('div');
        div.appendChild(node);
        return div.innerHTML;
    };

    // call this to process the media on any xml document
    var processXml = function (xmlDoc, content) {

        // find all the images
        var imageNodes = xmlDoc.getElementsByTagName('img');

        // NOTE: node collection is an iterator so we need to clone it or it will shrink during removal of images
        imageNodes = Util.Array.slice(imageNodes);

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
                processPageImageXml(xmlDoc, imgNode, mediaResource);
            }
            else if (mediaResource.type == 'image/png') {
                processPageImageBase64(xmlDoc, imgNode, mediaResource);
            }
        }

    };

    // call this on a page you want to process the pages html media resources
    var processPageMedia = function(page, content) {

        // ignore IE for now (issues..)
        if (YAHOO.env.ua.ie) return;

        // check if this page has any media resources
        if (getMediaResources(content).length == 0) return;

        // get the pages current html (hasn't been rendered yet)
        var pageRenderer = page.getRenderer();
        var pageHtml = pageRenderer.getHtml();
        pageHtml = YAHOO.lang.trim(pageHtml);

        // parse html into a xmldoc object 
        var pageXmlDoc = null;

        try {
            pageXmlDoc = Util.Xml.parseFromString(pageHtml, 'application/xml');
        } catch(ex) {
            console.error(ex);
            return;
        }

        processXml(pageXmlDoc, content);

        // NOTE: This didn't work very well:
        // var importedDiv = document.importNode(pageXmlDoc.documentElement, true);
        // page.setHtml(importedDiv);

        // write html back
        pageHtml = serializeToHtmlString(pageXmlDoc.documentElement);
        pageRenderer.setHtml(pageHtml);
    };

    var processQTI = function(qti, content) {

        // ignore IE for now (issues..)
        if (YAHOO.env.ua.ie) return;

        // check if this page has any media resources
        if (getMediaResources(content).length == 0) return;

        // parse html into a xmldoc object 
        var qtiXmlDoc = null;

        try {
            qtiXmlDoc = Util.Xml.parseFromString(qti.xml, 'application/xml');
        } catch (ex) {
            console.error(ex);
            return;
        }

        processXml(qtiXmlDoc, content);

        // write xml back
        qti.xml = Util.Xml.serializeToString(qtiXmlDoc.documentElement);
    };

    // call this on a item you want to process the widgets resources
    var processItemMedia = function(page, item, content) {
        if (item.qti && item.qti.xml) {
            processQTI(item.qti, content);
        }
    };

    CM.onPageEvent('init', processPageMedia);
    CM.onItemEvent('init', processItemMedia);



})(window.ContentManager);

