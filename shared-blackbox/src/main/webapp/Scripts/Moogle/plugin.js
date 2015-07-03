//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
// This module is used for setting up moogle

(function(CM) {

    function match(page, entity) {
        if (entity.specs && entity.specs.length > 0) {
            // try and find moogle xml
            var results = Util.Array.find(entity.specs, function(spec) {
                return spec.nodeName == 'search';
            });
            // if moogle was found then begin loading search ui
            if (results) {
                return results;
            }
        }
        return false;
    }

    function Plugin_Moogle(page, entity, config) {
    }

    CM.registerEntityPlugin('moogle', Plugin_Moogle, match);

    Plugin_Moogle.prototype.load = function () {
        var passage = this.entity;
        var results = this.config;
        var moogle = new TDS.Moogle('moogle' + passage.getID());
        var passageContainer = passage.getElement();
        moogle.load(passageContainer, results);
    };

})(window.ContentManager);