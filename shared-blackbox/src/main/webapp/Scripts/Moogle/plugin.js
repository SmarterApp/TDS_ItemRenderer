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