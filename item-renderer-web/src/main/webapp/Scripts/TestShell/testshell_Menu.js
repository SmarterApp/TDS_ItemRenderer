//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
/*
TestShell global menu code.
*/

(function (TS) {

    var UI = TS.UI;

    // get elements text
    function getText(id) {
        var el = YUD.get(id);
        var label = el.getAttribute('aria-label');
        if (label) {
            return label;
        } else {
            return Util.Dom.getTextContent(el);
        }
    };

    function createMenuItemFromLink(link, menuClass, alternateText) { // addLinkToMenu

        link = YUD.get(link);

        if (link == null) return null;

        if ($(link).is(':hidden')) return null;// don't show hidden links
        if (YUD.hasClass(link, 'excludeMenu')) return null; // skip links with this class

        function menuFunc() {
            setTimeout(function() {
                // TODO: Why do we need to do this again?
                //$(link).trigger('click');
                YAHOO.util.UserAction.click(link);  // Using YAHOO instead of jQuery because we have some tools (Dictionary, MT, Masking, Rubric) attaching event listener with YUE.on(), this does not work well with $(link).trigger(click).
            }, 0);
        };

        return {
            text: YAHOO.lang.isString(alternateText) ? alternateText : getText(link.id),
            classname: menuClass,
            onclick: { fn: menuFunc }
        };
    };

    function addMenuItemFromLink(collection, link, menuClass, alternateText) {
        var menuItem = createMenuItemFromLink(link, menuClass, alternateText);
        collection.addMenuItem('global', menuItem);
    }

    function createMenuItemsFromLinks(parentID) { // addLinksToMenu
        var parent = YUD.get(parentID);
        var links = Util.Dom.getElementsByTagName('a', parent);
        return links.map(function (link) {
            return createMenuItemFromLink(link, link.className);
        });
    }

    function addMenuItemsFromLinks(collection, parentID) {
        createMenuItemsFromLinks(parentID).forEach(function(menuItem) {
            collection.addMenuItem('global', menuItem);
        });
    }

    var registeredLinks = [];
    var registeredCreators = [];

    // register a function that returns a menu item
    function register(fn) {
        registeredCreators.push(fn);
    };

    // { id, classname, text }
    function registerLink(obj) {
        if (typeof obj == 'string') {
            obj = {
                id: obj
            };
        }
        registeredLinks.push(obj);
    };

    // register known links into a context menu object
    function addKnownLinks(collection) {

        // add a link for the sound cue in the global context menu if available
        var currentPage = ContentManager.getCurrentPage();

        // register soundcue
        if (currentPage && currentPage.soundCue) {
            var linkEl = YUD.get(currentPage.soundCue.id);
            if (linkEl != null && !TDS.Audio.isActive()) {
                var soundCueLabel = Messages.getAlt('TDSAudioJS.Label.AddMenuPlayInstruction', 'Play Instructions');
                addMenuItemFromLink(collection, linkEl, 'sound_instructions', soundCueLabel);
            }
        }

        // add menu items
        addMenuItemsFromLinks(collection, UI.Nodes.controls);
        addMenuItemsFromLinks(collection, UI.Nodes.tools);
        addMenuItemFromLink(collection, UI.Nodes.btnHelp, 'help');
        
    }

    // show global shortcuts menu
    function show(evt) {

        // check if we can open menu?
        // TODO: check for if dialog is open 
        if (TestShell.Comments.isShowing()) return;

        // addMenuItem = function(level, label, fn, disabled, checked, insert)
        var collection = new ContentManager.Menu.Collection();

        registeredLinks.forEach(function(obj) {
            addMenuItemFromLink(collection, obj.id, obj.classname, obj.text);
        });

        registeredCreators.forEach(function (fn) {
            collection.addMenuItem('global', fn());
        });

        // add known links
        addKnownLinks(collection);

        // show global shortcuts menu
        var menuItems = collection.getMenuItems();
        ContentManager.Menu.show({
            target: YUD.get('contents'),
            custom: menuItems
        });

    };

    // this hooks up the context menu button in the toolbar
    function enableButton() { 

        var btnContext = YUD.get('btnContext');
        if (btnContext == null) return;

        var showContextMenu = function (evt) {

            // prevent click through
            YUE.stopEvent(evt);

            // open menu right below button
            var btnRegion = YUD.getRegion(btnContext);
            ContentManager.Menu.show({
                evt: evt,
                xy: [btnRegion.left, btnRegion.bottom]
            });
        };

        // listen for menu button
        Util.Event.addTouchMouse('start', btnContext, showContextMenu);
    };

    // menu api
    TS.Menu = {
        register: register,
        registerLink: registerLink,
        enableButton: enableButton,
        show: show
    };

    // legacy api
    UI.enableContextMenuButton = enableButton;
    UI.showGlobalContextMenu = show;

})(TestShell);
