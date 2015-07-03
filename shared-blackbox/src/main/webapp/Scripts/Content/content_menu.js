//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
﻿(function(CM) {

    // this class is created once per context menu request
    function MenuCollection() {
        this._global = []; // global menu 
        this._entity = []; // item/passage menu
        this._component = []; // item/passage component menu (e.x., MC option)

        // set this to true to cancel a menu show from within a menu event
        this.cancel = false;
    };

    MenuCollection.prototype.getMenuItems = function() {
        if (this._entity.length > 0 || this._component.length > 0) {
            return Util.Array.concat(this._entity, this._component);
        } else if (this._global.length > 0) {
            return this._global;
        }
        return [];
    };

    // helper function for adding new menu items to YUI menu structure
    // @level The menu level (global, entity, component)
    // @label The menu text
    // @fn The function triggered when clicking on the menu
    MenuCollection.prototype.addMenuItem = function(level, label, fn, disabled, checked, insert) {
        var menuItem;

        if (YAHOO.lang.isString(label)) {
            menuItem = { text: label };
        } else if (YAHOO.lang.isObject(label)) {
            // label is actually a pre-ready YUI json structure in this case
            menuItem = label;
        } else {
            return;
        }

        if (YAHOO.lang.isFunction(fn)) {
            if (YAHOO.env.ua.gecko) {
                // HACK: Balaji said this code is required for fixing SB TTS issues.
                // NOTE: Don't try this on anything other than Firefox.
                var scheduledFunc = function() {
                    YAHOO.lang.later(0, this, fn);
                };

                menuItem.onclick = { fn: scheduledFunc };
            } else {
                menuItem.onclick = { fn: fn };
            }
        }

        if (YAHOO.lang.isBoolean(disabled)) {
            menuItem.disabled = disabled;
        }
        if (YAHOO.lang.isBoolean(checked)) {
            menuItem.checked = checked;
        }

        var collection = this['_' + level];

        if (collection) {
            if (insert) {
                collection.unshift(menuItem);
            } else {
                collection.push(menuItem);
            }
        }
    };

    MenuCollection.prototype.insertMenuItem = function(level, label, fn, disabled, checked) {
        this.addMenuItem(level, label, fn, disabled, checked, true);
    };

    //////////////////////////////////////////////////////////////

    // YUI ContextMenu instance
    var menuInstance = null;

    var MenuManager = {};

    MenuManager.getInstance = function() {
        return menuInstance;
    };

    // create an internal instance of the context menu
    MenuManager.init = function() {

        // create context menu for this frame
        var menuId = "menu_" + Math.random().toString().split('.')[1];
        var contextMenu = new YAHOO.widget.ContextMenu(menuId, {
            zindex: 1000, // NOTE: the highest z-index in elpa.css is 4
            iframe: false,
            shadow: false,
            usearia: true
        });

        // save context menu instance
        menuInstance = contextMenu;

        // check if the focus left
        function checkFocusLeft(evt) {
            var targetEl = YUE.getTarget(evt);
            if (!YUD.hasClass(targetEl, 'yuimenuitemlabel')) {
                MenuManager.hide();
            }
        }

        // event handler for when menu is shown
        contextMenu.showEvent.subscribe(function() {
            // this delay is to fix menu closing on ipad
            setTimeout(function() {
                this.cfg.setProperty('clicktohide', true);
                // listen for focus to close menu
                YUE.onFocus(document, checkFocusLeft);
            }.bind(this), 500);
        });

        // event handler for before menu is hidden
        contextMenu.beforeHideEvent.subscribe(function() {

            // When hiding menu clearActiveItem() won't blur() <a> because menu is hidden
            if (contextMenu.activeItem &&
                contextMenu.activeItem._oAnchor) {
                Util.Dom.blur(contextMenu.activeItem._oAnchor);
            }

            // The above code doesn't always work so if the focused element is the menu then blur() it this way
            if (document.activeElement &&
                YUD.hasClass(document.activeElement, 'yuimenuitemlabel')) {
                Util.Dom.blur(document.activeElement);
            }

            // BUG: #12357 and maybe #12285 
            // Clear all menu items once menu is hiding so keyboard shortcuts don't work on them (some YUI bug??)
            contextMenu.clearActiveItem();
        });

        // event handler for menu is hidden
        contextMenu.hideEvent.subscribe(function () {
            // disable click to hide until we show the menu again
            this.cfg.setProperty('clicktohide', false);
            // listen for focus to close menu
            YUE.removeFocusListener(document, checkFocusLeft);
        });

        // apply text select fix
        MenuManager.applyTextSelectionFix(contextMenu);

        // for touch devices don't set initial focus
        if (Util.Browser.isOnlyTouchDevice()) {
            menuInstance.setInitialFocus = function () { };
            menuInstance.setInitialSelection = function () { };
        }

    };

    // is the context menu showing
    MenuManager.isShowing = function() {
        return (menuInstance && menuInstance.cfg.getProperty('visible'));
    };

    // call this function when an event (mouse or key) should trigger the context menu to open
    MenuManager.show = function (opts) {

        // menuItems, menuXY
        opts = opts || {};
        YAHOO.lang.augmentObject(opts, {
            custom: [], // provide custom list of menu options and don't fire event
            xy: null, // xy coordinates of menu
            location: 'top', // if using element where do we put menu?
            target: null, // get the xy of this element,
            evt: null, // dom event
            entity: null, // fire event on this entity
            component: null // use this component
        });

        // get menu items
        var menuItems = opts.custom;

        // check if there is an instance of YUI menu created
        if (!menuInstance) {
            return false;
        }

        // hide context menu
        if (MenuManager.hide()) {
            return false;
        }

        // if we are in read only mode then hide the 
        // menu if no explicit menu items were passed in
        if (menuItems.length == 0 && CM.isReadOnly()) {
            return false;
        }

        // get item/passage
        var entity = opts.entity;
        if (!entity) {
            var page = CM.getCurrentPage();
            if (page) {
                entity = page.getActiveEntity();
            }
        }

        // get component
        var component = opts.component;
        if (!component && entity) {
            component = entity.getActiveComponent();
        }

        // get menu location
        var targetEl = opts.target;
        var domEvent = opts.evt;
        var menuXY = opts.xy;
        if (!menuXY) {
            var fromElement = null;
            // NOTE: There is a very specific order to how we get the xy so don't change it.
            if (targetEl) {
                // get xy from the target element
                fromElement = targetEl;
            } else if (component && component.getXY) {
                // get xy from the custom component function
                menuXY = component.getXY();
            } else if (domEvent && !domEvent.keyCode) {
                // get xy from click event
                menuXY = CM.getEventXY(domEvent);
            } else if (Util.Dom.isElement(component)) {
                // get xy from the component element
                fromElement = component;
            } else if (entity) {
                // get xy from the entity
                fromElement = entity.getElement();
            }
            if (fromElement) {
                menuXY = YUD.getXY(fromElement);
                if (opts.location == 'bottom') {
                    var region = YUD.getRegion(fromElement);
                    menuXY[1] += region.height;
                }
            }
        }

        // if this page is in a frame we need to adjust menu position to compensate
        if (entity) {
            var frameEl = entity.getPage().getFrameElement();
            if (frameEl) {
                var frameXY = YUD.getXY(frameEl);
                menuXY = [menuXY[0] + frameXY[0], menuXY[1] + frameXY[1]];
            }
        }

        // if no menu items were passed in then fire event to collect them from the widgets
        if (menuItems.length == 0) {

            // create new context menu collection
            var contentMenu = new MenuCollection();

            // get current text selection
            var selection = CM.getSelection(document);

            // fire event
            entity.fire('menushow', contentMenu, domEvent, selection);

            // check if someone cancelled showing the menu
            if (contentMenu.cancel) {
                return false;
            }

            menuItems = contentMenu.getMenuItems();
        }

        // if no menu items then show empty button
        if (menuItems.length == 0) {
            menuItems.push({
                text: Messages.getAlt('TDSContentEventsJS.Label.EmptyMenu', 'Empty'),
                disabled: !CM.isAccessibilityEnabled() // BUG #163484
            });
        }

        // NOTE: For 2014 accessibility stuff I am commenting this out
        // Util.Dom.focusWindow(); // (BUG #26524)

        // clear current menu
        menuInstance.clearContent();

        // set context target of menu
        menuInstance.contextEventTarget = targetEl;

        // set position of menu
        menuInstance.cfg.setProperty('xy', menuXY);
        // Bug 167033 - supressInitialFocus breaks keyboard navigation of Context Menu
        //menuInstance.cfg.addProperty('suppressInitialFocus', { value: true });

        // add the new menu items
        menuInstance.addItems(menuItems);

        // get menu container.. for accessibility use tools container so tabbing works
        var menuContainer = (CM.isAccessibilityEnabled() && entity && entity.getToolsElement()) || document.body;

        // render and show menu
        menuInstance.render(menuContainer);
        menuInstance.show();

        return true;
    };

    // hide context menu
    MenuManager.hide = function() {
        if (menuInstance && MenuManager.isShowing()) {
            menuInstance.hide();
            return true;
        }

        return false;
    };

    // Fixes issues with YUI menu by assigning menu events to iframe
    MenuManager.applyDocFix = function(contentDoc) {
        // make sure the content doc is not the same as the host doc
        if (document == contentDoc) {
            return;
        }

        // must load YUI menu at least once for the below code to work (it is lazy loaded)
        new YAHOO.widget.Menu('preload');

        // get all current documents listeners (it has YUI events)
        var docListeners = YAHOO.util.Event.getListeners(document);

        // BUG: In IE this returns null
        if (docListeners == null) {
            return;
        }

        var focusBlurAssigned = false;

        // look for all listeners assigned to the menu manager
        for (var i = 0; i < docListeners.length; i++) {
            var listener = docListeners[i];

            if (listener.obj == YAHOO.widget.MenuManager) {
                // assign all the same events as the main document gets
                YUE.on(contentDoc, listener.type, listener.fn, YAHOO.widget.MenuManager, true);

                // must assign focus/blur with specific function, just do this once
                if (!focusBlurAssigned) {
                    YUE.onFocus(contentDoc, listener.fn, YAHOO.widget.MenuManager, true);
                    YUE.onBlur(contentDoc, listener.fn, YAHOO.widget.MenuManager, true);
                    focusBlurAssigned = true;
                }
            }
        }
    };

    // this function takes a YUI context menu and fixes issue 
    // where any selected text gets deselected when opening it
    MenuManager.applyTextSelectionFix = function(contextMenu) {

        // this fix doesn't support IE but that browser doesn't need it
        if (YAHOO.env.ua.ie) {
            return;
        }

        var makeSelection = function(rangeData) {

            var range = document.createRange();

            if (range) {

                // create selection range
                range.setStart(rangeData.anchorNode, rangeData.anchorOffset);
                range.setEnd(rangeData.focusNode, rangeData.focusOffset);

                // get selection
                var selection = window.getSelection();

                // check if selection exists
                if (selection) {

                    // clear current selection
                    if (selection.removeAllRanges) {
                        selection.removeAllRanges();
                    } // Mozilla
                    else if (selection.empty) {
                        selection.empty();
                    } // IE, Safari

                    // add range to current selection
                    selection.addRange(range);
                }
            }
        };

        var onFocus = function(type, args, rangeData) {

            this.unsubscribe('focus', onFocus);

            setTimeout(function() {
                try {
                    makeSelection(rangeData);
                } catch (ex) {
                }
            }, 0);
        };

        var onBeforeShow = function() {

            var selection = window.getSelection(),
                rangeData;

            // check if there is a selection object and it is not collapsed
            if (selection && !selection.isCollapsed) {

                rangeData = {
                    anchorNode: selection.anchorNode,
                    anchorOffset: selection.anchorOffset,
                    focusNode: selection.focusNode,
                    focusOffset: selection.focusOffset
                };

                this.subscribe('focus', onFocus, rangeData);
            }
        };

        contextMenu.subscribe('beforeShow', onBeforeShow);
    };

    // this is used to determine if someone right clicked (or simulated) to open context menu
    MenuManager.isContextEvent = function (evt) {

        // check if context menu button (only shown on touch devices)
        var target = evt.currentTarget || YUE.getTarget(evt);
        if (target.id == 'btnContext') {
            return true;
        }

        // check if right click or key to open context menu
        return (evt.type == 'contextmenu') ||
               (evt.type == 'mousedown' && evt.button == 2) ||
               (evt.type == 'keydown' && evt.ctrlKey && evt.keyCode == 77);
    };

    CM.Menu = MenuManager;
    CM.Menu.Collection = MenuCollection;

})(window.ContentManager);