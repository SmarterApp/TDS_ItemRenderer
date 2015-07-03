//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
/*
Plugin/Widget manager for passage and items
*/

(function (CM) {

    // list of plugins and widgets
    var regCount = 0;
    var registrations = [];

    // sort plugins and widgets by priority
    function sort(arr) {
        Util.Array.sort(arr, function (obj1, obj2) {
            return (obj1.priority - obj2.priority) || (obj1.order - obj2.order);
        });
    }

    // add a plugin/widget registration to array
    function addRegistration(name, cls, match, opts, defaults) {
        var reg = {
            name: name,
            cls: cls,
            match: match,
            order: regCount++
        }
        // set options
        if (opts) {
            YAHOO.util.Lang.augmentObject(reg, opts);
        }
        // set missing defaults
        if (defaults) {
            YAHOO.util.Lang.augmentObject(reg, defaults);
        }
        registrations.push(reg);
        sort(registrations);
    }

    // TODO: this summer, make override behavior default
    function extend(cls, supercls, prototypeHasOverrides) {
        YAHOO.lang.extend(cls, supercls, prototypeHasOverrides === true ? cls.prototype : undefined);
    }

    function extendPlugin(cls, prototypeHasOverrides) {
        // check if already extended
        if (typeof cls.superclass != 'object' ||
            typeof cls.superclass.constructor != 'function') {
            extend(cls, CM.EntityPlugin, prototypeHasOverrides);
        }
    }

    function extendWidget(cls, prototypeHasOverrides) {
        extend(cls, CM.ItemWidget, prototypeHasOverrides);
    }

    function registerPlugin(name, cls, match, opts) {
        extendPlugin(cls, opts && opts.prototypeHasOverrides);
        addRegistration(name, cls, match, opts, {
            widget: false,
            priority: 100,
            defer: false
        });
    }

    function registerWidget(name, cls, match, opts) {
        extendWidget(cls, opts && opts.prototypeHasOverrides);
        addRegistration(name, cls, match, opts, {
            widget: true,
            priority: 200,
            defer: false
        });
    }

    function create(cls, page, entity, config) {

        // create instance of plugin/widget
        var instance = new cls(page, entity, config);

        // call base constructor
        cls.superclass.constructor.call(instance, page, entity, config);

        return instance;
    }

    // this function can perform any postprocessing on the widget config
    function processWidgetConfig(reg, config) {
        // make non-input a role of group
        if (!Util.Dom.isTextInput(config.element)) {
            // check for existing role
            var existingRole = config.element.getAttribute('role');
            if (!existingRole) {
                // add new role
                config.element.setAttribute('role', 'group');
            }
        }
        // check for existing label
        var label = config.element.getAttribute('aria-label');
        if (!label) {
            // add aria-label
            var labelKey = 'cm.widget.label.' + reg.name;
            if (Messages.has(labelKey)) {
                label = Messages.get(labelKey);
            } else {
                label = reg.name;
            }
            config.element.setAttribute('aria-label', label);
        }
    }
    
    // find plugin/widget matches in a registration list
    // return instances of the matches created
    function findMatches(page, entity, content, list) {

        var errors = [],
            instances = [], // plugins and widgets found
            entityEl = entity.getElement(),
            isItem = (entity instanceof ContentItem);

        // make sure has an element or we will get weird side effects when matching
        if (!entityEl) return instances;

        // configure the widget match
        function configure(reg, config) {
            // make sure widgets get a special config
            if (reg.widget) {
                Util.Assert.isInstanceOf(CM.WidgetConfig, config, 'The match() function must return a WidgetConfig.');
                processWidgetConfig(reg, config);
            }
            var instance = create(reg.cls, page, entity, config);
            instances.push(instance);
            if (instance instanceof CM.ItemWidget) {
                entity.widgets.add(reg.name, instance);
            } else {
                entity.plugins.add(reg.name, instance);
            }
        }

        // find all matching plugins
        list.forEach(function (reg) {
            // ignore widgets if this isn't an item
            if (reg.widget && !isItem) {
                return;
            }
            // look for match
            var configs;
            try {
                configs = reg.match(page, entity, content);
            } catch (ex) {
                errors.push(ex);
            }
            if (configs) {
                // for widgets we support multiple matches
                if (reg.widget && $.isArray(configs)) {
                    configs.forEach(function (config) {
                        // create instance
                        configure(reg, config);
                    });
                } else {
                    // create instance
                    configure(reg, configs);
                }
            }
        });
        
        // log all the errors
        errors.forEach(function (ex) {
            entity.addError(ex);
            console.error(ex);
        });

        // log all the plugins
        var pluginNames = entity.plugins.getNames();
        if (pluginNames.length > 0) {
            console.log('Entity Plugins: ' + pluginNames.join(', '));
        }

        // log all the widgets
        if (isItem) {
            var widgetNames = entity.widgets.getNames();
            if (widgetNames.length > 0) {
                var sbWidget = new Util.StringBuilder('Item Widgets: ');
                widgetNames.forEach(function (name, widx) {
                    if (widx > 0) {
                        sbWidget.append(', ');
                    }
                    sbWidget.append(name);
                    var widgets = entity.widgets.get(name);
                    if (widgets) {
                        sbWidget.append(' [');
                        widgets.forEach(function (widget, idx) {
                            if (idx > 0) {
                                sbWidget.append(', ');
                            }
                            sbWidget.append(widget.id);
                        });
                        sbWidget.append(']');
                    }
                });
                console.log(sbWidget.toString());
            }
        }

        return instances;

    }

    // load plugin/widget instances that have been matched to an entity
    function loadInstances(page, entity, instances) {
        var errors = [];
        instances.forEach(function (instance) {
            // try and load the object
            var result;
            try {
                result = instance.load();
            } catch (ex) {
                errors.push(ex);
                Util.Array.remove(entity.orderedPlugins, instance);
                if (instance instanceof CM.ItemWidget) {
                    entity.widgets.remove(instance);
                } else {
                    entity.plugins.remove(instance);
                }
                return;
            }
            // if a promise was returned then add that as something we need to wait for
            if (Util.Promise.isPromise(result)) {
                var rlp = new ResourceLoader.Promise(result);
                page.addResourceLoader(rlp);
            }
            // add components
            var components = instance.getComponents();
            components.forEach(function (component) {
                entity.addComponent(component);
            });
        });
        // log all the errors
        errors.forEach(function (ex) {
            entity.addError(ex);
            console.error(ex);
        });
    }

    // get plugins and widgets and execute callback
    function eachPlugin(entity, callback) {
        entity.orderedPlugins.forEach(callback);
    }

    function onEntityCreated(entity, content) {

        entity.on('rendered', function () {
            var filteredRegs = registrations.filter(function(reg) {
                return !reg.defer;
            });
            findMatches(this, entity, content, filteredRegs);
        }.bind(this));

        entity.on('show', function () {
            eachPlugin(entity, function (obj) {
                obj.show();
            });
        });

        entity.on('hide', function () {
            eachPlugin(entity, function (obj) {
                obj.hide();
            });
        });

        entity.on('focus', function (previousEntity, domEvent) {
            eachPlugin(entity, function (obj) {
                obj.focus(previousEntity, domEvent);
            });
        });

        entity.on('blur', function () {
            eachPlugin(entity, function (obj) {
                obj.blur();
            });
        });

        // This fixes widget level keyevent handlers
        // TODO: move widget level keyevent handlers deeper into code 
        entity.on('keyevent', function (evt) {
            eachPlugin(entity, function (obj) {
                obj.keyEvent(evt);
            });
        });

        entity.on('menushow', function (contentMenu, evt, pageSelection) {
            eachPlugin(entity, function (obj) {
                obj.showMenu(contentMenu, evt, pageSelection);
            });
        });

    }
    
    function onPageCreated(page, content) {

        page.on('passageCreated', onEntityCreated);
        page.on('itemCreated', onEntityCreated);
        
        page.on('available', function () {

            // load plugins/widgets
            page.getEntities().forEach(function (entity) {
                // process matches we found during 'rendered'
                loadInstances(page, entity, entity.orderedPlugins);
                // find all registrations that were deferred
                var deferredRegs = registrations.filter(function (reg) {
                    return reg.defer;
                });
                // get all plugin/widget instances for deferred matches
                var deferredInstances = findMatches(page, entity, content, deferredRegs);
                // process deferred instances
                loadInstances(page, entity, deferredInstances);
            });

        });

        // load responses for any widget that supports autoLoad setting 
        page.on('loaded', function () {
            page.getItems().forEach(function (item) {
                if (item.value) {
                    item.setResponse(item.value, true);
                }
            });
        });

        // check zoom level on page show
        page.on('beforeShow', function () {
            // check if zoom level has changed since we last visited the page
            var zoom = CM.getZoom();
            var factor = zoom.getFactor();
            if (!zoom || factor == this.zoomFactor) {
                return;
            }
            // update zoom level on widgets
            page.getEntities().forEach(function (entity) {
                eachPlugin(entity, function (obj) {
                    obj.zoom(factor);
                });
            });
        });

        // set zoom level
        page.on('zoom', function (level) {
            page.getEntities().forEach(function (entity) {
                eachPlugin(entity, function (obj) {
                    obj.zoom(level);
                });
            });
        });

    }

    CM.on('pagesCreated', function (pages) {
        pages.on('pageCreated', onPageCreated);
    });

    ////////////////////////////////

    // add entity plugin

    CM.extendEntityPlugin = extendPlugin;
    CM.registerEntityPlugin = registerPlugin;

    CM.extendWidget = extendWidget;
    CM.registerWidget = registerWidget;
    CM.createWidget = create;

    // get plugins and widgets (mostly for debugging)
    CM.getEntityPlugins = function () {
        return registrations;
    };

    // get plugins and widgets (mostly for unit tests)
    CM.clearEntityPlugins = function () {
        Util.Array.clear(registrations);
    };

})(ContentManager);