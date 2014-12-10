/*
Text To Speach mode for MC/MS.
When Mode is active, modal window covers everything except interaction options
Selecting an interaction option will invoke TTS on that option, and exit mode
*/

(function (CM, Modes) {

    var CSS_TTSOPTION = 'speaksection';
    var SELECTOR_TTSOPTION = 'div.optionContainer';

    // get an array of TTS option elements
    function getSpeakables(entity) {
        var entityEl = entity.getElement();
        return $(SELECTOR_TTSOPTION, entityEl).get();
    }

    // check if the element can be spoken
    function isSpeakable(el) {
        return $(el).is(SELECTOR_TTSOPTION);
    }

    // check if TTS is available
    function isTTSAvailable() {
        // return false if TTS not supported
        var ctrl = TTS.getInstance();
        if (!ctrl.isAvailable()) {
            return false;
        } else {
            return true;
        }
    }

    // create mode
    function Mode_TTSOption() { }

    Modes.register('tts-option', Mode_TTSOption);

    // this is called when someone clicks on an option
    Mode_TTSOption.prototype.select = function (el) {
        var languages = CM.getLanguage() == 'ESN' ? ['ESN', 'ENU'] : ['ENU'];
        var ttsMenu = new TTS.Menu(languages);
        var menuCfg = ttsMenu.addFocusedOption(null, el);
        if (menuCfg && menuCfg.PRI && menuCfg.PRI.cb) {
            menuCfg.PRI.cb();
        }

        // Delay of mode disable prevents mode selection from bleeding through to option selection
        CM.Modes.disable('tts-option');
    };

    // this is called when enabling TTS option mode
    Mode_TTSOption.prototype.enable = function () {
        // if for some reason there are no speakable elements then mode will not be enabled
        if (isTTSAvailable()) {
            return getSpeakables(this.entity);
        } else {
            return null;
        }
    };

    /////////////////////////////////////////////////////////
    // create plugin

    function match(page, entity) {
        // return if TTS not supported
        if (entity instanceof ContentItem) {
            var accProps = page.getAccommodationProperties();
            if (accProps.hasTTSItem()) {
                // check for widgets we support
                return ['mc', 'ebsr', 'choice'].some(function (widgetName) {
                    return entity.widgets.has(widgetName);
                });
            }
        }
        return false;
    }

    function Plugin_TTSOption(page, entity) { }

    CM.registerEntityPlugin('tts-option', Plugin_TTSOption, match, {
        priority: 299 // right before strikethrough
    });

    // this is called when someone requests showing a menu
    Plugin_TTSOption.prototype.showMenu = function (menu, evt) {

        // TODO: Follow the right click rules in my email about strikethrough
        var component = this.entity.getActiveComponent();
        var accProps = this.page.getAccProps();
        var hasMenuButton = accProps.showItemToolsMenu();

        if (component && isSpeakable(component)) { //If options are focused then we disable selections
        }

        var languages = CM.getLanguage() != 'ENU' ? ['ESN', 'ENU'] : ['ENU'];
        var ttsMenu = new TTS.Menu(languages);
        var menuCfg;

        // check if component is speakable and right click was used
        if (component && isSpeakable(component) && CM.Menu.isContextEvent(evt)) {
            // toggle individual option TTS
            menuCfg = ttsMenu.addFocusedOption(null, component);
        } else if (hasMenuButton) {
            // enter into TTS Speak Option mode
            menuCfg = ttsMenu.addMode(null, function() {
                CM.Modes.enable('tts-option');
            });
        }
        TTS.MenuSystem.addMenuSetup(menu, menuCfg);
    };

})(window.ContentManager, window.ContentManager.Modes);