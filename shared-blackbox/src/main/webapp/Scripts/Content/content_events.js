/*
The global events. We need to remove usages of this at some point.
*/

(function (CM) {

    var pageEvents = new Util.Event.Emitter(CM);
    var entityEvents = new Util.Event.Emitter(CM);
    var itemEvents = new Util.Event.Emitter(CM);
    var passageEvents = new Util.Event.Emitter(CM);
    var componentEvents = new Util.Event.Emitter(CM);

    CM.onPageEvent = function (name, callback) {
        pageEvents.on(name, callback, null, false);
    };

    CM.oncePageEvent = function (name, callback) {
        pageEvents.once(name, callback, null, true);
    };

    CM.removePageEvent = function(name, callback) {
        pageEvents.removeListener(name, callback);
    }

    CM.onEntityEvent = function (name, callback) {
        entityEvents.on(name, callback, null, false);
    };

    CM.onceEntityEvent = function (name, callback) {
        entityEvents.once(name, callback, null, true);
    };

    CM.removeEntityEvent = function (name, callback) {
        entityEvents.removeListener(name, callback);
    };

    CM.onItemEvent = function (name, callback) {
        itemEvents.on(name, callback, null, false);
    };

    CM.onceItemEvent = function (name, callback) {
        itemEvents.once(name, callback, null, true);
    };

    CM.removeItemEvent = function (name, callback) {
        itemEvents.removeListener(name, callback);
    };

    CM.onPassageEvent = function (name, callback) {
        passageEvents.on(name, callback, null, false);
    };

    CM.oncePassageEvent = function (name, callback) {
        passageEvents.once(name, callback, null, true);
    };

    CM.removePassageEvent = function (name, callback) {
        passageEvents.removeListener(name, callback);
    };

    CM.onComponentEvent = function (name, callback) {
        componentEvents.on(name, callback, null, false);
    };

    CM.onceComponentEvent = function (name, callback) {
        componentEvents.once(name, callback, null, true);
    };

    CM.removeComponentEvent = function (name, callback) {
        componentEvents.removeListener(name, callback);
    };

    // fire an event for the page and each passage/items
    CM.firePageEvent = function (name, page, args, fireEntityEvents) {

        // if the page argument is a string then lookup the page
        if (typeof page == 'string') {
            page = CM.getPage(page);
        }

        // check if there is a page
        Util.Assert.isString(name);
        Util.Assert.isInstanceOf(ContentPage, page);

        // fire event for page (return value will be NULL if there are no subscribers)
        var pageArgs = [page].concat(args || []);
        var ret = pageEvents.fireArgs(name, pageArgs);

        // check if firing entity events is allowed and the page events didn't get cancelled
        // note: event can only be cancelled if when subscribe() was called cancellable param was set to 'true'
        if (fireEntityEvents === true && ret !== false) {

            // fire event for passage if any
            var passage = page.getPassage();

            if (passage) {
                CM.fireEntityEvent(name, passage, args);
            }

            // fire event for each item
            var items = page.getItems();

            for (var i = 0; i < items.length; i++) {
                CM.fireEntityEvent(name, items[i], args);
            }
        }

        return ret;
    };

    // fire an entity event (if this returns true then the event was cancelled)
    CM.fireEntityEvent = function (name, entity, args) {

        Util.Assert.isString(name);
        Util.Assert.isInstanceOf(ContentEntity, entity);

        var page = entity.getPage();
        var entityArgs = [page, entity].concat(args || []);

        // first fire entity event
        entityEvents.fireArgs(name, entityArgs);

        // then fire item or passage event
        if (entity instanceof ContentItem) {
            itemEvents.fireArgs(name, entityArgs);
        } else if (entity instanceof ContentPassage) {
            passageEvents.fireArgs(name, entityArgs);
        }
    };

    CM.fireComponentEvent = function (name, entity, component, args) {
        var page = entity.getPage();
        var componentArgs = [page, entity, component].concat(args || []);
        componentEvents.fireArgs(name, componentArgs);
    };

    function onEntityCreated(entity, content) {

        entity.on('show', function () {
            return CM.fireEntityEvent('show', entity);
        });

        entity.on('hide', function () {
            return CM.fireEntityEvent('hide', entity);
        });

        entity.on('focus', function (previousEntity) {
            return CM.fireEntityEvent('focus', entity, previousEntity);
        });

        entity.on('blur', function () {
            return CM.fireEntityEvent('blur', entity);
        });

        entity.on('menushow', function(contentMenu, evt, pageSelection) {
            return CM.fireEntityEvent('menushow', entity, [contentMenu, evt, pageSelection]);
        });

        // fire entity created
        return CM.fireEntityEvent('init', entity, [content]);
    }

    function onPageCreated(page, content) {
        
        // subscribe to rendering events
        var stateNames = CM.Renderer.getStateNames();
        stateNames.forEach(function pageEvent(status) {
            page.once(status, function() {
                return CM.firePageEvent(status, page, null, true);
            });
        });

        page.on('passageCreated', onEntityCreated);
        page.on('itemCreated', onEntityCreated);

        page.on('beforeShow', function () {
            return CM.firePageEvent('beforeShow', page);
        });

        page.on('show', function () {
            return CM.firePageEvent('show', page);
        });

        page.on('afterShow', function () {
            return CM.firePageEvent('afterShow', page);
        });

        page.on('beforeHide', function () {
            return CM.firePageEvent('beforeHide', page);
        });

        page.on('hide', function () {
            return CM.firePageEvent('hide', page);
        });

        page.on('beforeZoom', function (level) {
            return CM.firePageEvent('beforeZoom', page, [level], true);
        });

        page.on('zoom', function (level) {
            return CM.firePageEvent('zoom', page, [level], true);
        });

        page.on('keyevent', function (evt) {
            return CM.firePageEvent('keyevent', page, [evt], true);
        });

        // fire page created
        return CM.firePageEvent('init', page, [content], false);
    }

    CM.on('pagesCreated', function (pages) {
        pages.on('pageCreated', onPageCreated);
    });

})(ContentManager);