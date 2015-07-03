//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
﻿(function(CM) {

    function Entity(page, bankKey, itemKey, filePath) {

        this._errors = [];
        this._page = page;
        this._showing = false;
        this.bankKey = bankKey;
        this.itemKey = itemKey;
        this.filePath = filePath;
        this.audioLinks = [];
        this.printed = false;

        // TODO: replace with ID's
        this._components = []; // collection of DOM elements that make up the components of the entity
        this._activeComponent = null; // the currently focused DOM element

        // plugins collection
        this.plugins = new CM.Plugins();

        // track order of plugins added
        this.orderedPlugins = [];
        this.plugins.on('add', function (plugin) {
            this.orderedPlugins.push(plugin);
        }.bind(this));
        this.plugins.on('remove', function (plugin) {
            Util.Array.remove(this.orderedPlugins, plugin);
        }.bind(this));

        Util.Event.Emitter(this);

        this.init();
    }

    Entity.prototype.init = function () { };

    Entity.prototype.addError = function(ex, details) {
        this._errors.push({
            ex: ex,
            details: details
        });
    };

    Entity.prototype.getErrors = function () {
        return this._errors;
    };

    Entity.prototype.clearErrors = function () {
        Util.Array.clear(this._errors);
    };

    Entity.prototype.getElement = function() {
        return undefined;
    };

    // get the container element for the tools
    Entity.prototype.getToolsElement = function () {
        return undefined;
    };

    // get element for a tool
    Entity.prototype.getToolElement = function (name) {
        var toolsEl = this.getToolsElement();
        if (toolsEl) {
            return $('.' + name, toolsEl).get(0);
        }
    };

    // Add element for a tool. 
    // If this returns undefined then the tools container could not be found.
    Entity.prototype.addToolElement = function (obj) {

        Util.Assert.isObject(obj);
        Util.Assert.isString(obj.classname);

        // check if tools container exists
        var toolsEl = this.getToolsElement();
        if (!toolsEl) return undefined;

        // check if tool already exists
        var toolEl = this.getToolElement(obj.classname);
        if (toolEl) return toolEl;

        // create tool
        toolEl = document.createElement('a');
        $(toolEl).addClass('toolButton');
        $(toolEl).addClass(obj.classname);
        toolEl.setAttribute('href', '#');
        toolEl.setAttribute('tabindex', '0');

        // add text
        if (obj.text) {
            toolEl.setAttribute('aria-label', obj.text);
        }

        // add aria
        toolEl.setAttribute('role', 'button');
        if (obj.hasPopup) {
            toolEl.setAttribute('aria-haspopup', 'true');
        }

        // check for listener
        if (obj.fn) {

            var callback = function(evt) {
                // Prevent the tool from getting focused if the menu is on the current item.
                // 1. Would lose text selection.
                // 2. Component would be selected.
                var currentPage = this.getPage().getParent().getCurrent();
                if (currentPage) {
                    var currentEntity = currentPage.getActiveEntity();
                    if (currentEntity == this) {
                        YUE.stopEvent(evt);
                    }
                }
                function execTool() {
                    obj.fn.call(this, toolEl, evt);
                }
                if (obj.delay) {
                    var timeout = (obj.delay === true) ? 0 : obj.delay;
                    setTimeout(execTool.bind(this), timeout);
                } else {
                    execTool();
                }
            }.bind(this);

            // add mouse listener
            // YUE.on(toolEl, 'mousedown', callback);
            toolEl.addEventListener('pointerdown', callback);

            // add key listener
            (new YAHOO.util.KeyListener(toolEl, {
                keys: [32, 13]
            }, {
                fn: callback
            })).enable();
        }

        toolsEl.appendChild(toolEl);
        this.addComponent(toolEl);
        return toolEl;
    };

    // get the elements plain text (no html)
    Entity.prototype.getText = function() {
        var el = this.getElement();
        var text = $(el).text();
        text = $.trim(text);
        return text;
    };

    // does this entity have any viewable content
    Entity.prototype.isEmpty = function() {
        // check if there is any text
        if (this.getText().length === 0) {
            // make sure no viewable elements
            return !$(this.getElement()).has('img, audio, video').length;
        }
        return false;
    };

    // get this entity parent page
    Entity.prototype.getPage = function() {
        return this._page;
    };

    // get a resource types bank/item keys
    Entity.prototype.getResource = function(type) {
        return (this.resources) ? this.resources[type] : null;
    };

    // is this entity visible in the DOM
    Entity.prototype.isVisible = function() {
        var element = this.getElement();
        return Util.Dom.isVisible(element);
    };

    Entity.prototype.isShowing = function () {
        return this._showing;
    }

    Entity.prototype.show = function () {
        if (this.isShowing()) {
            return false;
        }
        // console.info('Showing item: ', this.position, this);
        this._showing = true;
        var entityEl = this.getElement();
        CM.Renderer.show(entityEl);
        this.fire('show');
        return true;
    }

    Entity.prototype.hide = function () {
        if (!this.isShowing()) {
            return false;
        }
        // console.info('Hiding item: ', this.position, this);
        this._showing = false;
        var entityEl = this.getElement();
        CM.Renderer.hide(entityEl);
        this.fire('hide');
        return true;
    }

    // check if this entity is active (focused)
    Entity.prototype.isActive = function() {
        return this == this._page._activeEntity;
    };

    // remove focus
    Entity.prototype.clearActive = function () {

        var activeEntity = this._page.getActiveEntity();

        // check if the page we are blurring really is focused
        if (!activeEntity || activeEntity != this) return false;

        this._log('ENTITY INACTIVE');

        var element = activeEntity.getElement();

        // remove focus
        CM.blur(element);

        // BUG #63088 fix: Clear any selected text
        this._page.collapseSelection();

        // remove active entity
        this._page._activeEntity = null;

        // when leaving item remove focus from component
        this.clearComponent();

        // fire event
        this.fire('blur');
        return true;
    };

    var ActiveOptions = {
        component: true, // set default component
        force: false // for making this item active even it already is
    };

    // make this entity active 
    // (set force to true to force the focus regardless if it already focused)
    Entity.prototype.setActive = function (opts) {

        // set options
        opts = YAHOO.lang.augmentObject(opts || {}, ActiveOptions);

        // check if this entity is already active
        var previousEntity = this._page.getActiveEntity() || null;
        if (!opts.force && this == previousEntity) {
            return false;
        }

        // clear active entity
        this._page.clearEntity();

        this._log('ENTITY ACTIVE');

        // set new entity
        this._page._activeEntity = this;
        this._page._lastEntity = this;

        // set focus to the first component if not a dom event or key press
        if (opts.component) {
            if (opts.component === true) {
                // set the first component
                this.resetComponent();
            } else if (typeof opts.component == 'object') {
                // set specific component as default
                this.setActiveComponent(opts.component);
            }
        }

        // fire event
        this.fire('focus', previousEntity);
        return true;
    };

    // this scrolls to the item/passage so it is in view
    Entity.prototype.scrollTo = function() {
        var element = this.getElement();
        // var container = this._page.getScrollableElement();

        // TODO: Switch to the new scroll into view function which bases scrolling on a container:
        // Util.Style.scrollIntoContainerView(element, container);
        element.scrollIntoView(false);
    };

    // add a component
    Entity.prototype.addComponent = function (el) {

        if (!el) {
            return false;
        }

        // if dom element add tabindex
        if (Util.Dom.isElement(el)) {
            el.setAttribute('tabindex', '0');
        }

        // make sure this component is set when it gets focus
        if (el.addEventListener) {
            // NOTE: at some point we should just enable this for everyone
            var page = this.getPage();
            var accProps = page.getAccProps();
            if (accProps && accProps.isStreamlinedMode()) {
                el.addEventListener('focus', function (evt) {
                    YUE.stopPropagation(evt);
                    this.setActiveComponent(el);
                }.bind(this));
                el.addEventListener('blur', function (evt) {
                    YUE.stopPropagation(evt);
                    this.clearComponent();
                }.bind(this));
            }
        }

        // add component
        if (this._components) {
            this._components.push(el);
            return true;
        }
        return false;
    };

    // get all the components
    Entity.prototype.getComponents = function (visible) {

        var components;
        if (visible) {
            // filter for visible components only
            components = Util.Array.filter(this._components, function (component) {
                if (typeof component.isVisible == 'function') {
                    return component.isVisible();
                } else if (Util.Dom.isElement(component)) {
                    return Util.Dom.isVisible(component);
                }
                return true;
            });
        } else {
            // clone array
            components = Util.Array.clone(this._components);
        }

        // sort by dom order
        Util.Dom.sort(components);
        return components;
    };

    // look to see if an element is a child of one of the components of this entity
    Entity.prototype.findComponent = function(element) {
        return CM.getAncestor(element, this._components);
    };

    // get the currently focused component
    Entity.prototype.getActiveComponent = function() {
        return this._activeComponent;
    };

    // set an entities component as being active
    Entity.prototype.setActiveComponent = function (component, force) {

        // check if component is already focused
        if (!force && this._activeComponent == component) {
            return;
        }

        // remove current component
        if (this._activeComponent) {

            this._log('COMPONENT BLUR: ' + this._activeComponent.id + ' (' + this._activeComponent.className + ')');

            // remove focus from the active component (blur)
            CM.blur(this._activeComponent);

            // fire component focus event
            // NOTE: You might see a double blur when selecting something other than stem. This
            // is because when you first focus on an entity the first component gets focused.
            // Then your click is registered and the stem gets blurred and whatever other component
            // you selected (e.x., MC option) will get focus. 
            CM.fireComponentEvent('blur', this, this._activeComponent);
            this.fire('blurComponent', this._activeComponent);
            this._activeComponent = null;
        }
    
        // check if there is any element
        if (!component) {
            return;
        }

        // make sure this entity has focus
        if (!this.isActive()) {
            this.setActive({
                component: false // do not set component
            });
        }

        // make sure this component belongs to this entity
        var componentFound = this.getComponents().indexOf(component) != -1;
        if (!componentFound) {
            throw new Error('Component not found for this item.');
        }

        // set element to active
        this._activeComponent = component;

        this._log('COMPONENT FOCUS: ' + this._activeComponent.id + ' (' + this._activeComponent.className + ')');

        // try to set focus on the component
        // NOTE: If YUI dialog is open it will prevent focus (container.js line 5879)
        CM.focus(this._activeComponent);

        // fire component focus event
        CM.fireComponentEvent('focus', this, this._activeComponent);
        this.fire('focusComponent', this._activeComponent);

    };

    // clear the active component
    Entity.prototype.clearComponent = function() {
        this.setActiveComponent(null);
    };

    // set the active component to the first one
    Entity.prototype.resetComponent = function () {
        var firstComponent = Util.Array.pick(this.getComponents());
        if (firstComponent) {
            this.setActiveComponent(firstComponent);
        }
    };

    // set the caret position on the active components first text node
    Entity.prototype.resetCaretPosition = function () {

        var page = this.getPage();
        var pageWin = page.getWin();
        var pageDoc = page.getDoc();
        var element = this.getActiveComponent();

        // make sure the component is an element
        if (!CM.isElement(element)) {
            return false;
        }

        // make sure the element is in this pages document
        if (!YUD.inDocument(element, pageDoc)) {
            return false;
        }

        // set focus on the page window and then the element
        CM.focus(pageWin);

        // get all text nodes of this element
        var xPathResult = pageDoc.evaluate(".//text()", element, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);

        var textNode = null;

        // iterate on all the text nodes and find one that has some text
        for (var i = 0, l = xPathResult.snapshotLength; i < l; i++) {
            var node = xPathResult.snapshotItem(i);
            var text = node.textContent;

            // remove whitespace
            text = text.replace(/\s+/g, ' '); // replace
            text = text.replace(/^\s+|\s+$/g, ''); // trim

            textNode = node;

            // if text was found then stop here
            if (text.length > 0) {
                break;
            }
        }

        // make sure there was a textnode found
        if (!textNode) {
            return false;
        }

        // set cursor on first text node

        // HELPFUL:
        // * http://stackoverflow.com/questions/1181700/set-cursor-position-on-contenteditable-div
        // * http://www.timdown.co.uk/code/selections/selectionutil.js
        var selection = pageWin.getSelection();
        selection.removeAllRanges();

        // set the range on the text node
        var range = pageDoc.createRange();
        //range.selectNode(textNode);
        range.setStart(textNode, 0);
        range.setEnd(textNode, 0);

        // make browser selection of text range
        selection.addRange(range);

        // collapse range so there is no selection and caret is at the beginning of the text
        selection.collapseToStart();

        return true;
    };

    Entity.prototype.dispose = function () {

        this.plugins.getAll().forEach(function (plugin) {
            plugin.dispose();
        });

        this.plugins.clear();

        this._activeComponent = null;

        if (this._components) {
            for (var i = 0; i < this._components.length; i++) {
                if (this._components[i].dispose) {
                    this._components[i].dispose();
                }

                delete this._components[i];
            }
        }

        this._components = null;

        this._page = null;
        this.bankKey = null;
        this.itemKey = null;
        this.audioLinks = null; // TODO: dispose these?

        this.fire('dispose');
        this.removeAllListeners();
    };

    window.ContentEntity = Entity;

})(ContentManager);
