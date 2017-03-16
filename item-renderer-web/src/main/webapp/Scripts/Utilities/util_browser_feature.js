//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
﻿/*
This is used for a generic way of detecting browser features
*/
(function(Browser) {

    var lookup = {};

    function add(name, fn) {
        lookup[name] = fn;
    }

    function parseFeature(str) {
        var data = str.split('(');
        var name = data[0];
        var version = data[1] ? (data[1].replace(')', '') * 1) : 0;
        return {
            name: name,
            version: version
        };
    }
    
    function parseFeatures(str) {
        var features = [];
        var groups = str.split('|');
        for (var i = 0; i < groups.length; i++) {
            features.push(parseFeature(groups[i]));
        }
        return features;
    }

    function checkSupported(feature) {
        if (lookup[feature.name]) {
            return lookup[feature.name](feature);
        } else {
            return false;
        }
    }

    /* input: 'Flash(10)|Audio|SVG' */
    /* output: supported/unsupported */
    function supports(data) {

        var features;
        if (YAHOO.lang.isString(data)) {
            features = parseFeatures(data);
        } else if (YAHOO.lang.isArray(data)) {
            features = data;
        } else {
            throw new Error('Invalid data provided for checking supported features.');
        }
        
        var supported = [];
        var unsupported = [];

        for (var i = 0; i < features.length; i++) {

            var feature = features[i];
            
            // if feature is just a string convert it into object
            if (YAHOO.lang.isString(feature)) {
                feature = {
                    name: feature,
                    version: 0
                };
            }
            
            // check if feature is supported
            if (checkSupported(feature)) {
                supported.push(feature.name);
            } else {
                unsupported.push(feature.name);
            }
        }

        return {
            supported: supported,
            unsupported: unsupported
        };
    }

    // expose public api
    Browser.Feature = {        
        add: add,
        supports: supports
    };

})(Util.Browser);

// We add some commonly used features here. If you have more
// custom usages then add them from your application and not here.
(function(Feature) {

    Feature.add('Flash', function(feature) {
        var flashVer = Util.Browser.getFlashVersion();
        return (flashVer >= feature.version);
    });

    Feature.add('SVG', function(feature) {
        return Util.Browser.supportsSVG();
    });

    Feature.add('Audio', function(feature) {
        return soundManager.canPlayMIME('audio/ogg') || 
               soundManager.canPlayMIME('audio/m4a');
    });

    Feature.add('Recorder', function(feature) {
        var recorder = TDS.SecureBrowser.getRecorder();
        return recorder != null;
    });

})(Util.Browser.Feature);

// testing...
/*
YUE.on(window, 'load', function() {
    console.log('Browser supports features: ', Util.Browser.Feature.supports('Flash(10)|Audio|SVG|Test'));
});
*/



