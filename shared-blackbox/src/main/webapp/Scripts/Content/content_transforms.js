//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
/*
Provides the ability to change the content html or qti xml before it gets rendered.
*/
(function (CM) {

    // This serializes to HTML.
    // Use this in place of serializeToString otherwise some browsers collapse <span>'s.
    // NOTE: This didn't work very well:
    // var importedDiv = document.importNode(pageXmlDoc.documentElement, true);
    // page.setHtml(importedDiv);
    function serializeToHtmlString(node) {
        var div = document.createElement('div');
        div.appendChild(node);
        return div.innerHTML;
    }

    var transforms = [];

    // add transform { match: function() {}, execute: function() {] }
    CM.addTransform = function (transform) {
        transforms.push(transform);
    }

    CM.clearTransforms = function() {
        Util.Array.clear(transforms);
    }
    
    function processTransformers(page, content, xmlStr, isHtml) {

        // find matching transformers
        var matches = transforms.filter(function (transform) {
            return transform.match(page, content, xmlStr);
        });

        // check if any matching transforms
        if (!matches.length) {
            return null;
        }

        // parse xml into document
        var xmlDoc;
        try {
            xmlDoc = Util.Xml.parseFromString(xmlStr, 'application/xml');
        } catch (ex) {
            console.error(ex);
            return null;
        }

        // process transformers
        var results = matches.map(function (transform) {
            return transform.execute(page, content, xmlDoc);
        });

        // check if anything was changed
        var changes = results.some(function(changed) {
            return !!changed;
        });

        // serialize changes
        if (changes) {
            if (isHtml) {
                xmlStr = serializeToHtmlString(xmlDoc.documentElement);
            } else {
                xmlStr = Util.Xml.serializeToString(xmlDoc.documentElement);
            }
        }

        return xmlStr;
    }

    // process layout html through transformers
    CM.onPageEvent('init', function (page, content) {
        if (transforms.length && content.html) {
            var xmlStr = processTransformers(page, content, content.html, true);
            if (xmlStr && xmlStr != content.html) {
                var pageRenderer = page.getRenderer();
                pageRenderer.setHtml(xmlStr);
            }
        }
    });

    // process qti xml through transformers
    CM.onItemEvent('init', function (page, item, content) {
        if (transforms.length && item.qti) {
            var xmlStr = processTransformers(page, content, item.qti.xml, false);
            if (xmlStr && xmlStr != item.qti.xml) {
                item.qti.xml = xmlStr;
            }
        }
    });

})(window.ContentManager);