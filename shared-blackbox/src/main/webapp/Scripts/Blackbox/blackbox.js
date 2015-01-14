/* The internal blackbox API */

var Blackbox = {};

// EVENTS: init, available, ready
Blackbox.fireEvent = function(name, obj) {
    
    Util.log('BLACKBOX EVENT: ' + name);

    // try and get blackbox event on current page
    if (typeof(window.blackboxEvent) == 'function') {
        window.blackboxEvent(window, name, obj);
    }

    var parentBlackboxFunc;

    // try and get parent blackbox event func (this will throw exception if cross domain)
    try {
        if (window != parent && typeof(parent.blackboxEvent) == 'function') {
            parentBlackboxFunc = parent.blackboxEvent;
        }
    } catch(ex) {
        Util.log('BLACKBOX ERROR: Parent frame is cross domain.');
    }

    if (parentBlackboxFunc) {
        parentBlackboxFunc(window, name, obj);
    }
};

Blackbox.getConfig = function() {
    return (typeof blackboxConfig == 'object') ? blackboxConfig : {};
};

// get the shell name (modern, classic or accessibility)
Blackbox.getShell = function() {
    var queryObj = this._getQueryObject();
    var shell = queryObj.getValue('shell');

    // cleanup shell value
    if (shell != null) {
        shell = shell.toLowerCase(); // make lowercase
        shell = shell.replace('shell', ''); // remove 'shell' from name
    } else {
        shell = 'universal';
    }

    return shell;
};

// this function gets called when the blackbox DOM and scripts are available
Blackbox.init = function() {
    
    Blackbox.fireEvent('init');

    // get querystring
    var queryObj = this._getQueryObject();

    // Initialize TDS data structures (messages)
    // BUG #60631: Required because DOM ready in tds.js sometimes does not fire
    TDS.init();

    // clear out contents div
    var contentsEl = document.getElementById('contents');
    if (contentsEl) {
        contentsEl.innerHTML = '';
    }

    // add empty accommodations
    var accs = new Accommodations();
    Accommodations.Manager.add(accs);
    
    // let everyone know the blackbox is available
    Blackbox.fireEvent('available');

    // set the base URL for the player and recorder initialization
    ContentManager.setBaseUrl(TDS.baseUrl);

    // setup audio
    var flashPath = ContentManager.resolveBaseUrl('Scripts/Libraries/soundmanager2/swf/');
    TDS.Audio.Player.setup(flashPath);
    TDS.Audio.Recorder.initialize();

    // get the blackbox config
    var config = Blackbox.getConfig();

    ContentManager.onPageEvent('loaded', function (page) {

        /*
        // get zoom
        var accProps = Accommodations.Manager.getCurrentProperties();
        var zoomLevel = accProps.getPrintSize();

        // set zoom
        var zoomObj = page.getZoom();
        if (zoomLevel) {
            zoomObj.setLevel(zoomLevel);
        } // use accommodation
        else {
            zoomObj.reset();
        } // use default
        */

        // show a page when it is loaded
        if (config.preventShowOnLoad !== true) {
            page.show();
        }
    });

    ContentManager.onPageEvent('show', function(page) {
        TDS.Dialog.hideProgress();

        // start playing any audio that is set to auto play
        page.autoPlayQueue.start();
    });
    
    // set accommodations from url (NOTE: leave this after blackboxInitializing)
    Blackbox.setAccommodationsFromUrl();

    // check if enabling accessibility
    var accProps = Accommodations.Manager.getCurrentProps();
    if (accProps.isStreamlinedMode()) {
        TDS.Shell.allowFocus = true;
        ContentManager.enableAccessibility();
    }

    // load buttons
    TDS.Shell.name = 'universal';
    TDS.Shell.processConfig(config.testShellToolbars);
    TDS.Shell.showButton('btnItemScore');

    // hook up event handlers
    Blackbox.bindUIEvents();

    // initialize content manager
    if (TDS.baseUrl && TDS.baseUrl.length > 0) {
        ContentManager.init(TDS.baseUrl);
    } else {
        ContentManager.init();
    }

    Blackbox.fireEvent('ready');

};

// use this function to bind any events to the UI
Blackbox.bindUIEvents = function() {

    // subscribe to zoom
    YUE.on('btnZoomIn', 'click', function(ev) {
        var currentPage = ContentManager.getCurrentPage();
        if (currentPage) {
            currentPage.zoomIn();
        }
    });

    YUE.on('btnZoomOut', 'click', function(ev) {
        var currentPage = ContentManager.getCurrentPage();
        if (currentPage) {
            currentPage.zoomOut();
        }
    });

    // subscribe to measurement tools
    YUE.on('btnProtractor', 'click', function(ev) {
        var currentPage = ContentManager.getCurrentPage();
        if (currentPage && currentPage.MT_toggleProtractor) {
            currentPage.MT_toggleProtractor(null, currentPage);
        }
    });

    YUE.on('btnRuler', 'click', function(ev) {
        var currentPage = ContentManager.getCurrentPage();
        if (currentPage && currentPage.MT_toggleRuler) {
            currentPage.MT_toggleRuler(null, currentPage);
        }
    });
};

// this function is called to request content to get loaded
Blackbox.loadContent = function (contentRequest, forceReload) {

    // get the current page
    var currentPage = ContentManager.getCurrentPage();

    // check if the content is being shown
    if (currentPage) {
        currentPage.hide();
    }

    var page = ContentManager.getPage(contentRequest.id);

    if (page) {
        if (forceReload) {
            ContentManager.removePage(page);
        } else {
            return Q.resolve(page);
        }
    }

    var deferred = Util.Promise.defer();
    TDS.Dialog.showProgress();

    // update latest accommodations for this request
    var accommodations = Accommodations.Manager.getCurrent();
    contentRequest.accommodations = accommodations.getSelectedJson();

    // called when config fails to load
    function onContentFail(xhrData) {
        TDS.Dialog.hideProgress();
        TDS.Dialog.showWarning('Blackbox Error: ' + xhrData.statusText);
        deferred.reject();
    };

    // called when the config is loaded
    function onContentReady(xhrData) {

        // check if right status was returned
        if (xhrData.status != 200) {
            onContentFail(xhrData);
            return;
        }

        // create array of content json from the xml
        var contents = ContentManager.Xml.create(xhrData.responseXML);

        // check if any content
        if (!contents || contents.length == 0) {
            onContentFail(xhrData);
            return;
        }

        // create page and render
        var content = contents[0];
        page = ContentManager.createPage(content);
        page.render();
        page.once('loaded', function() {
            deferred.fulfill(page);
        });

    };

    var callback = {
        success: onContentReady,
        failure: onContentFail,
        timeout: 120000
    };

    // CORS: https://developer.mozilla.org/en-US/docs/HTTP_access_control

    // NOTE: We need to use 'text/plain' or request will be preflighted
    YAHOO.util.Connect.setDefaultPostHeader(false); // allow custom 'Content-Type'
    YAHOO.util.Connect.initHeader('Content-Type', 'text/plain');

    // NOTE: Don't send custom headers ('X-Requested-With') or request will be preflighted
    YAHOO.util.Connect.setDefaultXhrHeader(false); // 

    // send xhr request
    var requestUrl = TDS.resolveBaseUrl('Pages/API/ContentRequest.axd/load');
    var postData = YAHOO.lang.JSON.stringify(contentRequest);
    YAHOO.util.Connect.asyncRequest('POST', requestUrl, callback, postData);

    // return promise to load
    return deferred.promise;
};

// returns a content object based on the values in the query string
// NOTE: Used by ITS
Blackbox.getContentRequestFromUrl = function() {

    console.warn('The function Blackbox.getContentRequestFromUrl() is deprecated and will be removed soon. Please load content manually using Blackbox.loadContent().');

    var queryObj = this._getQueryObject();

    // create request object
    var content = {
        token: queryObj.getValue('auth_token'),
        client: queryObj.getValue('client'),
        mode: queryObj.getValue('mode'),
        language: queryObj.getValue('language'),
        layoutFile: queryObj.getValue('layoutFile'),
        layoutName: queryObj.getValue('layoutName'),
        items: [],
        accommodations: this.getAccommodationsFromUrl()
    };

    // get passage from url
    var passagePath = queryObj.getValue('passage');
    content.passage = (passagePath != null) ? { file: passagePath } : null;

    // get items from url
    var items = queryObj.getValues('item');

    if (items != null) {
        // check if all items should be marked as disabled
        var disabled = queryObj.getValue('disabled');
        if (disabled == null) {
            disabled = false;
        }

        // create items
        for (var i = 0; i < items.length; i++) {
            var itemPath = items[i];
            content.items.push({ file: itemPath, disabled: disabled, response: null });
        }
    }

    if (content.passage == null && content.items.length == 0) {
        return null;
    }
    
    return content;
};

// an helper object with the querystring values which you can access with getValue(name) or getValues(name).
Blackbox._getQueryObject = function(win /* a browser window obj */) {
    var decode = function(s) {
        try {
            return decodeURIComponent(s).replace(/\r\n|\r|\n/g, "\r\n");
        } catch(e) {
            return "";
        }
    };

    win = win || window;
    var qs = win.location.search;
    var multimap = {};

    if (qs.length > 1) {
        qs = qs.substr(1);
        qs.replace(/([^=&]+)=([^&]*)/g, function(match, hfname, hfvalue) {
            var name = decode(hfname);
            var value = decode(hfvalue);

            if (name && name.length > 0) {
                name = name.toLowerCase();

                if (!multimap.hasOwnProperty(name)) {
                    multimap[name] = [];
                }

                multimap[name].push(value);
            }
        });
    }

    var getValues = function(name) {
        name = name.toLowerCase();
        var values = multimap[name];
        if (!YAHOO.util.Lang.isArray(values)) {
            return null;
        }
        return values;
    };

    var getValue = function(name) {
        var values = getValues(name);
        if (values == null || values.length == 0) {
            return null;
        }
        return values[0];
    };

    return { getValue: getValue, getValues: getValues };
};

// parse accommodations from a string into a hash data structure
// e.x., Language:ENU;TTS:TDS_TTS_Item;TTS:TDS_TTS_Stim
// NOTE: Used by ITS
Blackbox.parseAccommodations = function(accommodationString) {
    
    // check if any accommodations
    if (accommodationString == null || accommodationString.length == 0) {
        return null;
    }

    var accPairs = accommodationString.split(';');

    // create hash table
    var accHash = {};

    for (var i = 0; i < accPairs.length; i++) {
        var accPair = accPairs[i];
        var accData = accPair.split(':');
        var type = accData[0];
        var value = accData[1];

        var values = accHash[type];

        if (values == null) {
            accHash[type] = [];
            values = accHash[type];
        }

        values.push(value);
    }

    // create json
    var accJson = [];

    Util.Array.each(Util.Object.keys(accHash), function(name) {
        accJson.push({ type: name, codes: accHash[name] });
    });

    return accJson;
};

// get the accommodation string in the url and parse it into json
Blackbox.getAccommodationsFromUrl = function() {
    // get accommodations from itempreview querystring
    var queryObj = this._getQueryObject();
    var accommodationString = queryObj.getValue('accommodations');
    var accommodations = this.parseAccommodations(accommodationString);
    return accommodations;
};

// get the accommodations in the url and add them to the accommodations manager
Blackbox.setAccommodationsFromUrl = function() {
    var accArray = this.getAccommodationsFromUrl();
    this.setAccommodations(accArray);
};

// add accommodation in json format into the accommodations manager and make them selected
Blackbox.setAccommodations = function(typeList) {
    
    if (typeList == null) {
        return false;
    }

    var accommodations = Accommodations.Manager.getCurrent();

    Util.Array.each(typeList, function(typeData) {
        var typeName = typeData.type;
        var typeCodes = typeData.codes;

        // load accommodation type/codes into accommodations manager if they don't alread exist
        var accType = accommodations.getType(typeName);

        if (accType == null) {
            accType = accommodations.createType(typeName, null, true, true, true, true);
        }

        Util.Array.each(typeCodes, function(typeCode) {
            var accValue = accommodations.getValue(typeCode);

            if (accValue == null) {
                accValue = accType.createValue(typeCode, typeCode, null, false, true, null);
            }
        });

        // set codes as selected
        accommodations.selectCodes(typeName, typeCodes);
    });

    return true;
};

// once you have added accommodations
Blackbox.changeAccommodations = function(callback) {
    
    if (!YAHOO.lang.isFunction(callback)) {
        throw new Error('Must pass in function that will change accommodations object.');
    }

    var accommodations = Accommodations.Manager.getCurrent();

    var pages = ContentManager.getPages();

    for (var i = 0; i < pages.length; i++) {
        var page = pages[i];
        var body = page.getBody();
        accommodations.removeCSS(body);
    }

    callback(accommodations);

    for (var i = 0; i < pages.length; i++) {
        var page = pages[i];
        var body = page.getBody();
        accommodations.applyCSS(body);
    }
};

// enable a button on the shell and assign functionality
Blackbox.showButton = function(name, handler, shouldEnable) {
    
    var button = document.getElementById(name);
    if (button == null) {
        return false;
    }

    YUD.setStyle(button.parentNode, 'display', '');

    if (YAHOO.lang.isFunction(handler)) {
        YUE.addListener(button, 'click', handler);
    }

    Blackbox.enableButton(name, shouldEnable);

    return true;
};

Blackbox.enableButton = function(name, shouldEnable) {
    
    var button = YUD.get(name);

    if (button == null) {
        return false;
    }

    if (shouldEnable) {
        YUD.removeClass(button.parentNode, 'inactive');
    } else {
        YUD.addClass(button.parentNode, 'inactive');
    }

    return true;
};

// add a button to the top bar tool section 
Blackbox.createButtonTool = function(id, label, fn) {
    TDS.Shell.addTool({
        id: id,
        label: label,
        fn: fn
    });
};

// add a button to the top bar controls section 
Blackbox.createButtonControl = function(id, label, fn) {
    TDS.Shell.addControl({
        id: id,
        label: label,
        fn: fn
    });
};

function log(message) {
    try {
        if (typeof top.console == 'object' && typeof top.console.log == 'function') {
            console.log(message);
        }
    } catch(e) {
    }
}

function dump(obj) {
    try {
        if (typeof top.console == 'object' && typeof top.console.dir == 'function') {
            console.dir(obj);
        }
    } catch(e) {
    }
}

// when the window for blackbox loads then run the init
// YUE.on(window, 'load', Blackbox.init, Blackbox, true);
