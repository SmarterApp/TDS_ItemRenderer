//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
(function(CM) {

    function match(page, entity, content) {

        var item = entity;
        var id = 'OptionsContainer_' + item.position;
        var optionsEl = document.getElementById(id);
        if (optionsEl && content.options) {
            return new CM.WidgetConfig('choice', optionsEl, {
                options: content.options, // options data
                constraints: content.optionsConfig // constraints
            });
        } else {
            return false;
        }

    }
    
    // Widget Class
    function Widget_MC(page, entity, config) {
        this._ready = false;
        this._group = null; // MC/MS group object
    }

    CM.registerWidget('mc', Widget_MC, match);

    Widget_MC.prototype.init = function (config) {

        var item = this.entity,
            group = null;

        if (item.format != null && item.format.toUpperCase() == 'MS') {
            group = new ContentMSGroup(item);
            if (config.constraints) {
                group.setMinChoices(config.constraints.minChoices);
                group.setMaxChoices(config.constraints.maxChoices);
            }
        } else {
            group = new ContentMCGroup(item);
            group.autoRespond = true;
        }

        config.options.forEach(function (configOption) {

            // get option key
            var optionKey = configOption.key.toUpperCase();

            // create option class
            var option;
            if (item.format != null && item.format.toUpperCase() == 'MS') {
                option = new ContentMSOption(group, optionKey);
            } else {
                option = new ContentMCOption(group, optionKey);
            }

            group.addOption(option);

            // get any extra option data
            option.tts = configOption.tts;
            option.feedback = configOption.feedback;

        }.bind(this));

        // attach option group to the item
        this._group = group;

    }

    Widget_MC.prototype.load = function () {

        // Bug 97306, 118785 - put format_ms on MS items in Wai layout because 
        // page wrapper doesn't.
        if (this.page.layout == 'wai') {
            var item = this.entity;
            var itemEl = item.getElement();
            YUD.addClass(itemEl, 'multipleChoiceItem');
            if (item.format == 'MS') {
                YUD.addClass(itemEl, 'format_ms');
            } else {
                YUD.addClass(itemEl, 'format_mc');
            }
        }

        // render elements/attributes
        this._group.render(this.element);
        this._ready = true;
    }
/*
    
    Widget_MC.prototype.menuTTS = function (menu, evt, selection) {
        var page = this.page;
        var item = this.entity;

        // check if tts is enabled
        var accProps = page.getAccommodationProperties();
        if (!accProps.hasTTSItem()) return;

        //Actually load up the menu configuration plus hard coded stemTTS hacks.
        var pageWin = page.getActiveWin(); //for determining user highlight selection
        var languages = CM.getLanguage() != 'ENU' ? ['ESN', 'ENU'] : ['ENU'];
        var domToParse = [];

        //Add in major dom elements that will make up TTS parsing / play info
        var stem = item.getStemElement();
        if (stem) {
            domToParse.push(stem);
        }

        var illustration = item.getIllustrationElement();
        if (illustration) {
            domToParse.push(illustration);
        }

        var ttsMenu = new TTS.Menu(languages);
        var menuCfg = ttsMenu.getMenuCfg(domToParse, selection, pageWin, item.stemTTS, page, item);

        // HACK: specific to only multiple choice objects. (LEGACY CODE)
        var mcWidgets = item.widgets.get('mc');
        var mcWidget = mcWidgets[0];
        var optionGroup = mcWidget._group;

        //If we focused only the option, speak only the option (note this stomps other menu options)
        var focusedOption = optionGroup.getFocusedOption();
        if (focusedOption && focusedOption.key) { //If options are focused then we disable selections
            menuCfg.SEL_PRI = false; //Disables the two selection options if focused
            menuCfg.SEL_SEC = false;

            // Remove "Speak Question and Options" from menu
            menuCfg.PRI_OP.cb = false;
            menuCfg.SEC_OP.cb = false;

            ttsMenu.addFocusedOption(menuCfg, item.getActiveComponent());
        }

        TTS.MenuSystem.addMenuSetup(menu, menuCfg);
        TTS.Config.Debug && console.log("TTS On Item Menushow config", menuCfg);
    }
    
    Widget_MC.prototype.showMenu = function (menu, evt, selection) {
        this.menuTTS(menu, evt, selection);
    }
        */

    Widget_MC.prototype.getComponents = function () {
        return this._group.getOptions().map(function (option) {
            return option.getElement();
        });
    }

    // is the widget done rendering
    Widget_MC.prototype.isReady = function() {
        return this._ready;
    }

    // is the widget busy rendering or user is interacting with it
    Widget_MC.prototype.isBusy = function() {
        return this.isReady();
    }

    // What do we return if the response is not loaded?
    Widget_MC.prototype.getResponse = function() {
        var value = this._group.getValue();
        if (value) {
            return this.createResponse(value, true);
        } else {
            return this.createResponse(null, false);
        }
    }

    Widget_MC.prototype.setResponse = function (value) {
        return this._group.setValue(value);
    }

    Widget_MC.prototype.toString = function() {
        return 'widget-mc';
    }

})(ContentManager);