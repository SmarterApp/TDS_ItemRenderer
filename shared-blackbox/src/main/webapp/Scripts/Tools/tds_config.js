// configs holds the raw json data that comes from the server
TDS.Config = (function(TDS, Config) {

    // set defaults
    YAHOO.lang.augmentObject(Config, {
        styles: [],
        accs_global: null,
        accs_segments: null,
        messages: null,
        appSettings: null // client app settings
    });
    
    // set CSS styles
    function setStyles() {
        if (Config.styles) {
            Util.Array.each(Config.styles, function(style) {
                YUD.addClass(document.body, style);
            });
        }
    }

    // load global accommodations
    function loadGlobalAccs() {

        // check if accommodations objects exists
        if (typeof Accommodations != 'function') {
            return;
        }

        TDS.globalAccommodations = new Accommodations('global');

        if (Config.accs_global) {
            TDS.globalAccommodations.importJson(Config.accs_global);
            TDS.globalAccommodations.selectDefaults();
        }
    }

    // load test and segment accommodations
    function loadTestAccs() {

        // check if accommodations objects exists
        if (typeof Accommodations != 'function') {
            return;
        }

        // check for newer namespace which uses sessionStorage
        if (typeof TDS.Student == 'object') {
            Config.accs_segments = TDS.Student.Storage.getAccJson();
        }

        // check if config exists
        if (Config.accs_segments) {
            Config.accs_segments.forEach(function(json) {
                var accommodations = Accommodations.create(json);
                Accommodations.Manager.add(accommodations);
            });
        }
    }

    // load new messages system
    function loadMessages() {

        // check if messages lib is available
        if (typeof TDS.Messages != 'object') {
            return;
        }

        // load messages json
        var messageLoader = new TDS.Messages.MessageLoader();
        if (Config.messages) {
            messageLoader.load(Config.messages);
        }

        // save message system and process template replacements
        // messageLoader.buildIndex();
        TDS.messages = messageLoader.getMessageSystem();
    };

    Config.load = function() {

        // load config
        setStyles();

        // load accommodations
        loadGlobalAccs();
        loadTestAccs();

        // loads messages
        loadMessages();
    };

    return Config;

})(window.TDS, window.TDS.Config || {});