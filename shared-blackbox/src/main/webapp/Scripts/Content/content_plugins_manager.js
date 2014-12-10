/*
Plugin manager for pages.
*/

// Look for events and match plugins
(function (CM) {

    // registered classes
    var lookup = new Util.Structs.Map();

    function getValues() {
        return lookup.getValues();
    }

    function get(name) {
        return lookup.get(name);
    }

    function clear() {
        lookup.clear();
    }

    // add registered class
    function register(name, cls, match) {
        Util.Assert.isString(name, 'Name should be a string.');
        Util.Assert.isFunction(cls);
        Util.Assert.isFunction(match);
        // check if already extended
        if (typeof cls.superclass != 'object' ||
            typeof cls.superclass.constructor != 'function') {
            YAHOO.lang.extend(cls, CM.PagePlugin);
        }
        lookup.set(name, {
            name: name,
            cls: cls,
            match: match
        });
    }

    function create(reg, page, config) {

        // create instance of plugin
        var instance = new reg.cls(page, config);

        // call base constructor
        reg.cls.superclass.constructor.call(instance, page, config);

        return instance;
    }

    function findMatches(page, content) {

        // configure the widget match
        function configure(reg, config) {
            var instance = create(reg, page, config);
            page.plugins.add(reg.name, instance);
        }

        // go through registrations
        getValues().forEach(function (reg) {
            if (typeof reg.match != 'function') return; // no match function
            var configs = reg.match(page, content);
            if (configs) {
                configure(reg, configs);
            }
        });

        var pluginNames = page.plugins.getNames();
        if (pluginNames.length > 0) {
            console.log('Page Plugins: ' + pluginNames.join(', '));
        }
    }
    
    function eachPlugin(page, callback) {
        page.plugins.getAll().forEach(callback);
    }

    function onPageCreated(page, content) {

        page.on('rendered', function () {
            findMatches(page, content);
        });

        page.on('available', function () {
            eachPlugin(page, function (plugin) {
                if (!plugin.delay) {
                    plugin.load();
                }
            });
        });

        page.on('loaded', function () {
            eachPlugin(page, function (plugin) {
                if (plugin.delay) {
                    plugin.load();
                }
            });
        });

        page.on('show', function () {
            eachPlugin(page, function (plugin) {
                plugin.show();
            });
        });

        page.on('beforeShow', function () {
            eachPlugin(page, function (plugin) {
                plugin.beforeShow();
            });
        });

        page.on('beforeHide', function () {
            eachPlugin(page, function (plugin) {
                plugin.beforeHide();
            });
        });

        page.on('hide', function () {
            eachPlugin(page, function (plugin) {
                plugin.hide();
            });
        });

        page.on('zoom', function (level) {
            eachPlugin(page, function (plugin) {
                plugin.zoom(level);
            });
        });

    }

    CM.on('pagesCreated', function (pages) {
        pages.on('pageCreated', onPageCreated);
    });
    
    // add a widget definition
    CM.registerPagePlugin = register;
    CM.getPagePlugin = get;
    CM.getPagePlugins = getValues;
    CM.clearPagePlugins = clear;

})(ContentManager);
