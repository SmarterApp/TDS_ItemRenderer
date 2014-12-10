/*
Contains the TDS module code for hooking up EBSR widget.
*/

(function(CM) {

    function match(page, item, content) {
        var id = 'EBSR_' + item.position;
        var el = document.getElementById(id);
        if (el) {
            return new CM.WidgetConfig(id, el, item.qti.xml);
        }
        return false;
    }

    function Widget_EBSR(page, item, config) {
        this.ebsr = null;
    }

    CM.registerWidget('ebsr', Widget_EBSR, match);

    Widget_EBSR.prototype.load = function () {

        var item = this.entity;
        var ebsrEl = this.element;
        var qtiXml = this.config;

        // create EBSR Item
        var ebsr = new EBSR(qtiXml, item);
        this.ebsr = ebsr;

        // Instantiate EBSR DOM
        ebsr.generateHTML(ebsrEl);
        ebsr.populateStem();

        // add components for kb navigation
        var componentList = ebsr.getAllComponentLists();
        if (componentList && componentList.length) {
            for (var i = 0; i < componentList.length; i++) {
                item.addComponent(componentList[i]);
            }
        }

        // If there is an existing (saved) value, update the item content
        if (item.value) {
            ebsr.setValue(item.value);
        }
    }

    Widget_EBSR.prototype.keyEvent = function(evt) {

        var item = this.entity;
        var ebsr = this.ebsr;

        // ignore keys we are not interested in
        if (evt.type != 'keydown') return;
        if (evt.ctrlKey || evt.altKey) return;

        if (evt.key == 'Enter') {

            // ignore key events if in read-only mode
            if (item.isReadOnly()) return;

            var focusedComponent = item.getActiveComponent();
            if (focusedComponent) {
                var option = ebsr.getFocusedOption(focusedComponent);
                if (option) {
                    option.select();
                }
            }
        }

    }
    
    // show TTS options in menu
    function onMenuShowTTS(page, item, menu, ebsr, interaction, selection) {
        // check to see if TTS Item is enabled
        var accProps = page.getAccommodationProperties();
        if (!accProps.hasTTSItem()) return;

        // Set up TTS for EBSR - based off of hack for MC in module_tts.js
        // Create the text to speech menu defaults
        var pageWin = page.getActiveWin(); //for determining user highlight selection
        var languages = CM.getLanguage() == 'ESN' ? ['ESN', 'ENU'] : ['ENU'];

        var focusedComponent = item.getActiveComponent();
        var focusedOption = ebsr.getFocusedOption(focusedComponent);

        //Actually load up the menu configuration plus hard coded stemTTS hacks.
        var domToParse = [];
        domToParse.push(interaction.getHeader()[0]); // <- include header in TTS spoken blocks
        domToParse.push(interaction.getPrompt()[0]);
        var ttsMenu = new TTS.Menu(languages);
        var menuCfg = ttsMenu.getMenuCfg(domToParse, selection, pageWin, item.stemTTS, page, item);

        // Determine if interaction options contain speakable text. If they do, add them to domToParse
        for (var i = 0; i < interaction.getOptions().length; ++i) {
            var element = (interaction.getOptions())[i].getElement();
            var testCfg = null;
            var testMenu = new TTS.Menu(languages);
            testCfg = testMenu.addFocusedOption(testCfg, element);
            
            // option contains speakable text if testCfg.PRI.cb exists
            if (testCfg && testCfg.PRI.cb) {
                domToParse.push(element);
            }
        }

        //If domToParse contains more than Header and Prompt (longer than 2)
        //add "Speak question and options" selection to context menu.
        if (domToParse.length > 2) {
            ttsMenu.addOptions(menuCfg, domToParse);
        }

        //If we focused only the option, speak only the option (note this stomps other menu options)
        if (focusedOption && focusedOption.key) { //If options are focused then we disable selections
            menuCfg.SEL_PRI = false; //Disables the two selection options if focused
            menuCfg.SEL_SEC = false;

            //Hacky, but if a component level menu shows up, it stomps anything except component level.
            //Not a fan of this model....  You have no idea if something else has altered the 'level'
            //of the menu that is passed in so we have to hack it based on types that do.
            //WHY ISN"T IT IN A LOOP or config setting Justin?  Because only _some_ of these need to
            //show up in the MC hacks, this is that list.
            menuCfg.PRI.level = 'component';
            menuCfg.SEC.level = 'component';
            menuCfg.STOP.level = 'component';
            menuCfg.PAUSE.level = 'component';
            menuCfg.RESUME.level = 'component';

            ttsMenu.addFocusedOption(menuCfg, item.getActiveComponent());
        }

        TTS.MenuSystem.addMenuSetup(menu, menuCfg);
        TTS.Config.Debug && console.log("TTS On Item Menushow config", menuCfg);
    }

    // At this point we know that user has clicked in EBSR regions somewhere.
    function onMenuShowASL(page, item, menu, ebsr, interaction) {
        
        // Get all the ASL attachments on this item.
        var attachments = item.getAslAttachments();
        if (attachments && attachments.length > 0) {
            for (var i = 0; i < attachments.length; ++i) {
                var at = attachments[i];
                
                // Only consider targeted attachments...
                if (at.subType.toLowerCase() == 'targeted') {
                    var target = at.target;
                    // ... where the target is this interaction
                    if (interaction.responseId == target) {
                        // Add menu option for this movie
                        var menuItem = {
                            text: Messages.get('TDSContentEventJS.Label.ASLItem'),
                            classname: 'ASL',
                            onclick: {
                                fn: function () {
                                    AslModule.showImageDialog(at.url, page.getZoomFactor());
                                }
                            }                                
                        };
                        menu.addMenuItem('component', menuItem);
                        return;
                    }
                }
            }
        }
    }

    // show Stem TTS options in menu
    function onMenuShowStemTTS(page, item, menu, ebsr, stem, selection) {
        // check to see if TTS Item is enabled
        var accProps = page.getAccommodationProperties();
        if (!accProps.hasTTSItem()) return;

        // Create the text to speech menu defaults
        var pageWin = page.getActiveWin(); //for determining user highlight selection
        var languages = CM.getLanguage() == 'ESN' ? ['ESN', 'ENU'] : ['ENU'];

        var domToParse = [];
        domToParse.push(stem);
        var ttsMenu = new TTS.Menu(languages);
        var menuCfg = ttsMenu.getMenuCfg(domToParse, selection, pageWin, item.stemTTS, page, item);
        
        // Change menu label to Directions

        var interactions = ebsr.getInteractions();
        for (var i = 0; i < interactions.length; i++) {
            var interaction = interactions[i];
            domToParse.push(interaction.getHeader()[0]); // <- include header in TTS spoken blocks
            domToParse.push(interaction.getPrompt()[0]);

            for (var j = 0; j < interaction.getOptions().length; ++j) {
                domToParse.push((interaction.getOptions())[j].getElement());
            }
        }

        //Play question and options selection.
        ttsMenu.addOptions(menuCfg, domToParse);

        TTS.MenuSystem.addMenuSetup(menu, menuCfg);
        TTS.Config.Debug && console.log("TTS On Item Menushow config", menuCfg);
    }

    Widget_EBSR.prototype.showMenu = function (menu, evt, selection) {

        var page = this.page;
        var item = this.entity;
        var ebsr = this.ebsr;

        function getClosestInteraction(target) {
            var pageEl = page.getElement();
            var $closestInteraction = $(target).closest('div.interactionContainer', pageEl);
            return $closestInteraction;
        };

        // get the EBSR parent container element for this click
        var interaction = null;
        var $interactionContainer = getClosestInteraction(evt.target);

        // set $interactionContainer based on source of context menu trigger (ctrl-m, button, or right click)
        if ($interactionContainer && $interactionContainer.length == 0) {
            // If ctrl-m or context menu button triggered menu, find interaction associated with active component
            var componentEl = item.getActiveComponent();
            $interactionContainer = getClosestInteraction(componentEl);
        }

        if ($interactionContainer.length > 0) {
            var interactionId = $interactionContainer.attr('id');
            if (interactionId) { // check for id
                var interactionKey = interactionId.split('_').pop();
                if (interactionKey) { // check parsed key
                    interaction = ebsr.getInteractionByKey(interactionKey);
                }
            }
        }

        // run functions that deal with an interaction context menu
        if (interaction != null) {
            onMenuShowTTS(page, item, menu, ebsr, interaction, selection); // tts
            onMenuShowASL(page, item, menu, ebsr, interaction); // asl
        }

        // Speak stem
        var $stemContainer = $(evt.target).closest('div.stemContainer');
        if ($stemContainer.length > 0) {
            onMenuShowStemTTS(page, item, menu, ebsr, $stemContainer[0], selection);
        }

    }

    // Handled by ItemPlugin_TTS.prototype.hide() for all other widgets
    Widget_EBSR.prototype.hide = function () {
        // if we are playing audio stop it
        TTS.getInstance().stop();
    }

    Widget_EBSR.prototype.isResponseAvailable = function () {
        return this.ebsr != null;
    }

    Widget_EBSR.prototype.getResponse = function() {
        var ebsr = this.ebsr;
        var value = ebsr.getResponse();
        var isValid = ebsr.isValid();
        return this.createResponse(value, isValid);
    }

    Widget_EBSR.prototype.setResponse = function(value) {
        var ebsr = this.ebsr;
        ebsr.setValue(value);
    }

})(window.ContentManager);


