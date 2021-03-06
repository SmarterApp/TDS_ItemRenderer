//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
// https://github.com/cjohansen/Sinon.JS

// stubs:
TDS.Audio = {};
TDS.Audio.isActive = function() {
    return false;
};

TDS.Audio.Player = {};
TDS.Audio.Player.createQueue = function() {
    return null;
};

var Messages = {
    has: function() {
        return false;
    }
}

// run tests sequentially, you cannot run them atomically
QUnit.config.autostart = false;
QUnit.config.reorder = false;

// load content for testing
var contents = {};
var files = ['sample1.js', 'sample2.js', 'sample3.js', 'sample4.js' /* single item */];
var requests = files.map(function (file) {
    return $.getJSON(file).then(function (content) {
        console.info('Parsed json for ' + content.id, content);
        contents[content.id] = content;
    });
});

function onContentLoaded() {
    QUnit.start();
}

// wait for all requests to come back
Q.all(requests).then(onContentLoaded);

// initialize
var UserAction = YAHOO.util.UserAction;
var CM = ContentManager;
CM.init();

var pages = null;

QUnit.testStart(function() {
    pages = CM.createPages('contents');
});

QUnit.testDone(function() {
    CM.clear();
    pages.dispose();
    pages = null;
});

//////////////////////////////////////////////////////////////////////////////////

// Helper functions

function addPlugin(name, onMatch, onLoad, order) {
    function Plugin() { }
    CM.registerEntityPlugin(name, Plugin, function (page, item) {
        if (onMatch) {
            onMatch(page, item);
        }
        return true;
    }, order);
    if (onLoad) {
        Plugin.prototype.load = function () {
            onLoad(this.page, this.entity);
        };
    }
}

function addWidget(name, onMatch, onLoad, order) {
    function Widget() { }
    CM.registerWidget(name, Widget, function (page, item) {
        if (onMatch) {
            onMatch(page, item);
        }
        return new CM.WidgetConfig(name + '-' + 'id', item.getElement());
    }, order);
    if (onLoad) {
        Widget.prototype.load = function () {
            onLoad(this.page, this.entity);
        };
    }
}

//////////////////////////////////////////////////////////////////////////////////

test('Checking empty pages object', function () {
	ok(pages, 'Created');
	deepEqual(pages.list(), [], 'Collection empty');
	equal(pages.getCurrent(), null, 'Current empty');
	equal(pages.getElement(), document.getElementById('contents'), 'Root element');
});

test('Creating content from json', function () {

    var eventPage, globalPage;

    function checkPage() {
        ok(eventPage, 'Created');
        equal(eventPage, globalPage, 'Same page for events');
        equal(eventPage, pages.list()[0], 'Found in list');
        equal(eventPage, pages.get('sample1'), 'Found in lookup');
        equal(eventPage.id, 'sample1', 'Matching id');
        equal(eventPage.layout, '1', 'Correct layout');
        equal(eventPage.isShowing(), false, 'Not showing');
    }

    pages.once('pageCreated', function (page) {
        eventPage = page;
        if (eventPage && globalPage) {
            checkPage();
        }
    });

    CM.oncePageEvent('init', function (page) {
        globalPage = page;
        if (eventPage && globalPage) {
            checkPage();
        }
    }, true);

    pages.create(contents['sample1']);

});

asyncTest('Rendering content and checking events', function () {

    expect(4);

    var page = pages.create(contents['sample1']);

	var rendering = 0; 
	var rendered = 0;
	var available = 0;
	var loaded = 0;

	function onRendering() {
	    rendering++;
	}

	function onRendered() {
		rendered++;
	}

	function onAvailable() {
		available++;
	}

	function onLoaded() {
		loaded++;
	    if (loaded == 1) return;
		equal(rendering, 2, 'Rendering');
		equal(rendered, 2, 'Rendered');
		equal(available, 2, 'Available');
		equal(loaded, 2, 'Loaded');

		start();
	}

	page.once('rendering', onRendering);
	page.once('rendered', onRendered);
	page.once('available', onAvailable);
	page.once('loaded', onLoaded);

    CM.oncePageEvent('rendering', onRendering, true);
    CM.oncePageEvent('rendered', onRendered, true);
    CM.oncePageEvent('available', onAvailable, true);
    CM.oncePageEvent('loaded', onLoaded, true);

	page.render();

});

asyncTest('Show/hide a page', function () {

    expect(9);

    var page = pages.create(contents['sample2']);
    
	function onAvailable() {

        // prevent showing
	    page.once('beforeShow', function () {
	        return false;
	    });
	    ok(!page.show(), 'Removed beforeShow event from the page');
	    ok(!page.isShowing(), 'Local beforeShow cancelled showing page');

        // show normally
	    var showCount = 0;
	    var hideCount = 0;

	    page.on('show', function () {
	        showCount++;
	    });

	    var entities = page.getEntities();

        // show events

	    entities.forEach(function (entity) {
	        entity.on('show', function () {
	            showCount++;
	        });
	    });

	    CM.oncePageEvent('show', function() {
	        showCount++;
	    });

        function onShowItem() {
            showCount++;
        }

        CM.onItemEvent('show', onShowItem);

	    ok(page.show(), 'Show page');
	    ok(page.isShowing(), 'Showing page');
        
	    equal(showCount, 7, 'Fired show events');

	    equal(entities.filter(function(entity) {
	        return (entity.isShowing());
	    }).length, 3, 'Three entities showing');

	    CM.removeItemEvent('show', onShowItem);

        // hide events

	    page.on('hide', function () {
	        hideCount++;
	    });

	    entities.forEach(function (entity) {
	        entity.on('hide', function () {
	            hideCount++;
	        });
	    });

	    CM.oncePageEvent('hide', function () {
	        hideCount++;
	    });

	    function onHideItem() {
	        hideCount++;
	    }

	    CM.onItemEvent('hide', onHideItem);

	    page.hide();
	    ok(!page.isShowing(), 'Hiding page');
	    equal(hideCount, 7, 'Fired hide events');

	    equal(entities.filter(function (entity) {
	        return (!entity.isShowing());
	    }).length, 3, 'Three entities hiding');

	    CM.removeItemEvent('hide', onHideItem);

	    start();
	}

	page.render();
    page.once('available', onAvailable);

});

asyncTest('Mouse', function () {

    expect(2);

    var page = pages.create(contents['sample1']);

    function onAvailable() {
        page.show();
        var item1 = page.getItems()[0];
        var item2 = page.getItems()[1];
        equal(page.getActiveEntity(), item1, 'First item is active');
        UserAction.mousedown(item2.getElement(), { button: 0 });
        equal(page.getActiveEntity(), item2, 'Second item is active');
        start();
    }

    page.render();
    page.once('available', onAvailable);

});

/*asyncTest('Keyboard', function () {

    var page = pages.create(contents['sample1']);

    function onKeyEvent() {
        console.info('AAAAAAAAAAAAAAAAAAAAA');
    }

    function onAvailable() {
        page.show();
        page.on('keyevent', onKeyEvent);

        UserAction.keydown(document, {
            keyCode: 9
        });

    }

	page.render().done(onAvailable);

});*/

asyncTest('Show/hide multiple pages', function () {

    expect(8);

    var page1 = pages.create(contents['sample1']);
    page1.render();

    var page2 = pages.create(contents['sample2']);
    page2.render();

    Q.when([page1.wait('available'), page2.wait('available')]).done(function () {
        ok(page1 != page2, 'Pages are different');
        equal(pages.list().length, 2, "Two pages loaded");

        var pageShowing = page1.show();
        ok(pageShowing, 'Page1 show() returned true');
        ok(page1.isShowing(), 'Page1 is showing');
        ok(!page2.isShowing(), 'Page2 is hidden');

        pageShowing = page2.show();
        ok(pageShowing, 'Page2 show() returned true');
        ok(!page1.isShowing(), 'Page1 is hidden');
        ok(page2.isShowing(), 'Page2 is showing');

        start();
    });

});

asyncTest('Adding a plugin', function () {

    expect(7);

    var pluginInit = false;
    var pluginExec = false;
    var pluginShow = false;
    var pluginHide = false;
    var pluginZoom = 0;

    // setup plugin

    function match(page, content) {
        if (content.id == 'sample1') {
            return 'OK';
        } else {
            return false;
        }
    }

    function Plugin(page, config) {
    }
    
    CM.registerPagePlugin('plugin_test', Plugin, match);

    Plugin.prototype.init = function () {
        pluginInit = this.config;
    }

    Plugin.prototype.load = function () {
        pluginExec = true;
    }

    Plugin.prototype.show = function () {
        pluginShow = true;
    }

    Plugin.prototype.hide = function () {
        pluginHide = true;
    }

    Plugin.prototype.zoom = function (level) {
        pluginZoom = level;
    }

    // create and render page

    var page = pages.create(contents['sample1']);

    function onShow() {
        this.once('hide', onHide);
        this.hide();
    }

    function onHide() {
        this.once('zoom', onZoom);
        this.zoomIn();
    }

    function onZoom() {
        onDone();
    }

    function onDone() {
        equal(pluginInit, 'OK', 'Plugin created');
        ok(pluginExec, 'Plugin executed');
        ok(pluginShow, 'Plugin show');
        ok(pluginHide, 'Plugin hide');
        equal(pluginZoom, 1.25, 'Plugin zoom');
        equal(page.plugins.getAll().length, 1, 'One plugin was in collection');
        ok(page.plugins.get('plugin_test') instanceof Plugin);
        start();
    }

    function onAvailable() {
        page.once('show', onShow);
        page.show();
    }

    page.render();
    page.once('available', onAvailable);

});

asyncTest('Adding a widget', function () {

    expect(7);

    var widgetInit = false;
    var widgetExec = false;
    var widgetShow = false;
    var widgetHide = false;
    var widgetZoom = 0;

    // setup widget

    function match(page, item, content) {
        if (item.getID() == 'I-1-3') {
            return new CM.WidgetConfig('test', item.getElement(), 'OK');
        } else {
            return false;
        }
    }

    function Widget(page, item, config) {
    }

    CM.registerWidget('widget_test', Widget, match);

    Widget.prototype.init = function () {
        widgetInit = this.config;
    }

    Widget.prototype.load = function () {
        widgetExec = true;
    }

    Widget.prototype.show = function () {
        widgetShow = true;
    }

    Widget.prototype.hide = function () {
        widgetHide = true;
    }

    Widget.prototype.zoom = function (level) {
        widgetZoom = level;
    }

    // create and render page

    var page = pages.create(contents['sample2']);

    function onShow() {
        this.once('hide', onHide);
        setTimeout(function() {
            this.hide();
        }.bind(this), 0);
    }

    function onHide() {
        this.once('zoom', onZoom);
        setTimeout(function () {
            this.zoomIn();
        }.bind(this), 0);
    }

    function onZoom() {
        onDone();
    }

    function onDone() {
        var item = page.getItems()[0];
        equal(widgetInit, 'OK', 'Widget created');
        ok(widgetExec, 'Widget executed');
        ok(widgetShow, 'Widget show');
        ok(widgetHide, 'Widget hide');
        equal(widgetZoom, 1.25, 'Widget zoom');
        equal(item.widgets.getAll().length, 1);
        ok(item.widgets.has('widget_test'));
        start();
    }

    function onAvailable() {
        page.once('show', onShow);
        page.show();
    }

    page.render();
    page.once('available', onAvailable);

});

asyncTest('Widget match throws an error it should be ignored', function () {

    // create widget
    function Widget() {}

    CM.registerWidget('widget_test', Widget, function() {
        throw new Error('Widget match error');
    });

    // create page
    var page = pages.create(contents['sample2']);

    function onShow() {
        var items = page.getItems();
        var widgets = items[0].widgets.getAll();
        equal(widgets.length, 0, 'No widgets should be found');
        equal(items[0].getErrors().length, 1, 'One error recorded');
        start();
    }

    function onAvailable() {
        page.once('show', onShow);
        page.show();
    }

    page.render();
    page.once('available', onAvailable);

});

asyncTest('Widget load throws an error and widget is removed', function () {

    // create widget
    function Widget() {}

    CM.registerWidget('widget_test', Widget, function(page, item) {
        return new CM.WidgetConfig('test', item.getElement());
    });

    Widget.prototype.load = function() {
        throw new Error('Widget load error');
    };

    // create page
    var page = pages.create(contents['sample2']);

    function onShow() {
        var items = page.getItems();
        var widgets = items[0].widgets.getAll();
        equal(widgets.length, 0, 'Widget should be removed');
        equal(items[0].getErrors().length, 1, 'One error recorded');
        start();
    }

    function onAvailable() {
        page.once('show', onShow);
        page.show();
    }

    page.render();
    page.once('available', onAvailable);

});

asyncTest('Plugin/Widget unordered', function () {

    var matchOrder = [];
    var loadOrder = [];

    addPlugin('plugin', function () {
            matchOrder.push('plugin');
        }, function () {
            loadOrder.push('plugin');
        }
    );

    addWidget('widget1', function () {
            matchOrder.push('widget1');
        }, function () {
            loadOrder.push('widget1');
        }
    );

    addWidget('widget2', function () {
            matchOrder.push('widget2');
        }, function () {
            loadOrder.push('widget2');
        }
    );
    
    // create page
    var page = pages.create(contents['sample4']);

    function onShow() {

        // check match order
        equal(matchOrder.length, 3, 'Three match attempts');
        equal(matchOrder[0], 'plugin', 'Plugin matched 1st');
        equal(matchOrder[1], 'widget1', 'Widget1 matched 2nd');
        equal(matchOrder[2], 'widget2', 'Widget2 matched 3rd');

        // check load order
        equal(loadOrder.length, 3, 'Three load attempts');
        equal(loadOrder[0], 'plugin', 'Plugin loaded 1st');
        equal(loadOrder[1], 'widget1', 'Widget1 loaded 2nd');
        equal(loadOrder[2], 'widget2', 'Widget2 loaded 3rd');

        start();
    }

    function onAvailable() {
        page.once('show', onShow);
        page.show();
    }

    page.render();
    page.once('available', onAvailable);

});

asyncTest('Plugin/Widget ordered', function () {

    var matchOrder = [];
    var loadOrder = [];

    addPlugin('plugin', function () {
            matchOrder.push('plugin');
        }, function () {
            loadOrder.push('plugin');
        }, {
            priority: 20
        }
    );

    addWidget('widget1', function () {
            matchOrder.push('widget1');
        }, function () {
            loadOrder.push('widget1');
        }, {
            priority: 10
        }
    );

    addWidget('widget2', function () {
            matchOrder.push('widget2');
        }, function () {
            loadOrder.push('widget2');
        }, {
            priority: 40
        }
    );

    addWidget('widget3', function () {
            matchOrder.push('widget3');
        }, function () {
            loadOrder.push('widget3');
        }, {
            priority: 30
        }
    );
    
    // create page
    var page = pages.create(contents['sample4']);

    function onShow() {

        // check match order
        equal(matchOrder.length, 4, 'Three match attempts');
        equal(matchOrder[0], 'widget1', 'Widget1 match 1');
        equal(matchOrder[1], 'plugin', 'Plugin match 2');
        equal(matchOrder[2], 'widget3', 'Widget3 match 3');
        equal(matchOrder[3], 'widget2', 'Widget2 match 4');

        // check load order
        equal(loadOrder.length, 4, 'Three load attempts');
        equal(loadOrder[0], 'widget1', 'Widget1 load 1');
        equal(loadOrder[1], 'plugin', 'Plugin load 2');
        equal(loadOrder[2], 'widget3', 'Widget3 load 3');
        equal(loadOrder[3], 'widget2', 'Widget2 load 4');

        start();
    }

    function onAvailable() {
        page.once('show', onShow);
        page.show();
    }

    page.render();
    page.once('available', onAvailable);

});

asyncTest('Transform html', function () {

    CM.addTransform({
        match: function(page, content, xmlStr) {
            return xmlStr.indexOf('Page_sample1') != -1;
        },
        execute: function (page, content, xmlDoc) {
            $('div#Item_1', xmlDoc).text('ITEM 100');
            return true;
        }
    });

    var page = pages.create(contents['sample1']);

    function onAvailable() {
        var value = $('div#Item_1').text();
        equal(value, 'ITEM 100');
        start();
    }

    page.render();
    page.once('available', onAvailable);

});
