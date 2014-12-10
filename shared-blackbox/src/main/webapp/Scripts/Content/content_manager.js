(function() {
    
    // The goal of the content manager is to collect events and hand them off to the widgets. It also keeps state about the current pages.
    var CM = {

        // events fired from content manager
        // _events: new Util.EventManager(CM),

        accessibilityEnabled: false,
        enableKeyEvents: true, // enable shortcuts
        enableMouseEvents: true, // enable mouse clicks (including context menu)
        enableARIA: false, // enable ARIA fixes

        _readOnly: false, // is the UI in read only mode

        // show more console logs
        _debug: true,

        // ContentZoom object
        _zoom: null
    };

    Util.Event.Emitter(CM);

    // toggle if read-only is enabled for all items
    CM.setReadOnly = function (value) {
        this._readOnly = value;
    };

    // check if read-only is enabled globally
    CM.isReadOnly = function () {
        return this._readOnly;
    };

    // the base url for looking up scripts and styles
    CM._baseUrl = '';

    CM.getBaseUrl = function () {
        return this._baseUrl;
    };

    CM.setBaseUrl = function (baseUrl) {
        this._baseUrl = baseUrl;
    };

    CM.resolveBaseUrl = function (url) {
        // check if url is already resolved
        if (Util.String.isHttpProtocol(url)) {
            return url;
        }

        // combine url
        return this._baseUrl + url;
    };

    // enables accessibility features
    CM.enableAccessibility = function () {
        this.accessibilityEnabled = true;
        this.enableKeyEvents = false;
        this.enableMouseEvents = false;
        this.enableARIA = true;
    };

    // if this is true then the content manager accessibility features are enabled 
    CM.isAccessibilityEnabled = function () {
        return this.accessibilityEnabled;
    };

    // call this before using the content manager to set things up
    CM.init = function (baseUrl) {

        // set custom base url if provided
        if (YAHOO.lang.isString(baseUrl)) {
            CM.setBaseUrl(baseUrl);
        }

        // listen for keyboard events on main document
        if (typeof CM.addKeyEvents == 'function') {
            CM.addKeyEvents(document);
        }

        // add yui menu fix to parent (mostly for item preview dev)
        if (window != parent) {
            try {
                CM.addKeyEvents(parent.document);
                CM.Menu.applyDocFix(parent);
            } catch (ex) {
                // Permission denied if cross-domain parent
            }
        }

        // create context menu instance if it does not exist
        CM.Menu.init();

        // check if this is mobile device
        if (Util.Browser.isTouchDevice()) {
            CM.listenForFocus(document);
        }

        // create zoom
        var defaultZoom = null;
        var accProps = ContentManager.getAccProps();
        if (accProps) {
            defaultZoom = accProps.getPrintSize();
        }
        CM._zoom = new ContentZoom(defaultZoom);
        CM._zoom.addDocument(document, {
            includeElements: false
        });

        // let folks know CM is ready
        CM.fire('init');
    };

    CM.getZoom = function () {
        return this._zoom;
    };

    CM.getZoomFactor = function () {
        var zoomInfo = CM.getZoom();
        return (zoomInfo) ? zoomInfo.getFactor() : 1;
    };

    CM.getAccommodations = function () {
        return Accommodations.Manager.getDefault();
    };

    CM.getAccs = CM.getAccommodations;

    CM.getAccommodationProperties = function () {
        var accommodations = this.getAccommodations();
        return new Accommodations.Properties(accommodations);
    };

    CM.getAccProps = CM.getAccommodationProperties;

    // a helper function for getting the current language from accommodations
    CM.getLanguage = function () {
        var accProps = this.getAccommodationProperties();
        var language = accProps.getSelectedCode('Language');
        return (language) ? language : 'ENU';
    };
    
    /******************************************************************************************/

    // response type support
    var supportHandlerLookup = {};

    CM.registerSupportHandler = function (responseType, check) {
        supportHandlerLookup[responseType.toLowerCase()] = check;
    };

    CM.getSupportHandler = function (responseType) {
        return supportHandlerLookup[responseType.toLowerCase()];
    };

    CM.getSupportHandlers = function () {
        return Util.Object.getValues(supportHandlerLookup);
    };

    CM.removeSupportHandler = function (responseType) {
        return Util.Object.remove(supportHandlerLookup, responseType);
    };

    CM.removeSupportHandlers = function () {
        var responseTypes = Util.Object.keys(supportHandlerLookup);
        for (var i = 0; i < responseTypes.length; i++) {
            CM.removeSupportHandler(responseTypes[i]);
        }
    };

    /******************************************************************************************/

    // attach mouse events to an element for a specific item
    CM.addMouseEvents = function (entity, element) {

        if (!this.enableMouseEvents) {
            return false;
        }
        if (element == null) {
            return false;
        }
        if (element.__tds_mouseEventsEnabled === true) {
            return false;
        }

        function setActive(evt) {

            // ignore setting active element if we are editing
            // if (Util.Dom.isTextInput(document.activeElement)) return;

            // set focus to this entity
            var entityChanged = entity.setActive(evt);

            // get the clicked component
            var targetEl = YUE.getTarget(evt);
            var clickedComponent = entity.findComponent(targetEl);

            // if a component was found then set it as active
            if (clickedComponent) {
                entity.setActiveComponent(clickedComponent);
            }

            // if no component is set then use the default
            if (entity.getActiveComponent() == null) {
                entity.resetComponent();
            }
        }

        // listen for html events on the item
        function checkForMenu(evt) {

            // check if context menu was activated
            if (Util.Browser.isSecure() && Util.Browser.isMac()) {
                // BUG: In SB on OS X the 'contextmenu' event does not fire so we 
                // need to check if right click button was pressed on 'mousedown'
                if (evt.type == 'mousedown' && evt.button == 2) {
                    // BUG: must be scheduled or menu closes right away after showing
                    setTimeout(function () {
                        CM.Menu.show({ evt: evt });
                    }, 0);
                }
            } else if (evt.type == 'contextmenu') {
                CM.Menu.show({ evt: evt });
            }
        };

        // Set entity as focused when clicked.
        // BUG 119445: for iOS, use touchstart, otherwise touch-hold won't properly select text
        var activeElementEvent = Util.Browser.isIOS() ? 'touchstart' : 'mousedown';
        YUE.on(element, activeElementEvent, setActive, this, true);

        // set entity as focused when clicked
        YUE.on(element, 'mousedown', checkForMenu, this, true);
        YUE.on(element, 'contextmenu', checkForMenu, this, true);

        element.__tds_mouseEventsEnabled = true;
        return true;
    };
    
    // CSS CLASSES
    CM.CSS = {
        CONTEXT_AREA: 'contextArea',
        CONTEXT_AREA_ALT: 'contextArea-hasalt',
        CONTEXT_AREA_FOCUS: 'contextArea-focused',
        CONTEXT_BODY_FOCUS: 'contextBody-focused',
        CONTEXT_AREA_SELECT: 'contextArea-selected',
        CONTEXT_BODY_SELECT: 'contextBody-selected',
        MARK_REVIEW_OFF: 'markReview',
        MARK_REVIEW_ON: 'markReviewMarked',
        HIGHLIGHT: 'highlight'
    };

    // LABELS
    CM._labels = {};
    CM._labels['TTS_SPEAKTEXT'] = { classname: 'speaktext', text: 'TDSContentJS.Label.SpeakSelected' };
    CM._labels['TTS_SPEAKSECTION'] = { classname: 'speaksection', text: 'Speak {title}' };
    CM._labels['TTS_SPEAKSECTION_ALT'] = { classname: 'speaksection', text: 'Speak {title}' }; // (Alt)
    CM._labels['TTS_STOP'] = { classname: 'speakstop', text: 'TDSContentJS.Label.StopSpeaking' };
    CM._labels['HIGHLIGHT_TEXT'] = { classname: 'highlighttext', text: 'TDSContentJS.Label.Highlight' };
    CM._labels['HIGHLIGHT_CLEAR'] = { classname: 'highlightclear', text: 'TDSContentJS.Label.ResetHighlight' };

    CM.getLabel = function (id) {
        var label = CM._labels[id.toUpperCase()];
        if (label) {
            return { classname: label.classname, text: Messages.get(label.text) };
        }
        return null;
    };

    /*
    TDS_SC0	None	            1   Student comments feature is disabled
    TDS_SCDropDown	DropDown	0	Student comments rendered as dropdown
    TDS_SCNotepad	Notepad	    0   Students comments rendered as a notepad
    TDS_SCTextArea	TextArea	0	Student comments rendered as a textarea
    */
    CM.getCommentCode = function () {
        var accProps = Accommodations.Manager.getCurrentProperties();
        return accProps.getStudentComments();
    };

    // get comments dialog header
    CM.getCommentLabel = function () {
        var commentCode = CM.getCommentCode();
        var label = 'Comments';
        if (commentCode == 'TDS_SCDropDown') {
            label = Messages.getAlt('TestShell.Comments.DropDown', 'Comments');
        } else if (commentCode == 'TDS_SCNotepad') {
            label = Messages.getAlt('TestShell.Comments.Notepad', 'Notepad');
        } else if (commentCode == 'TDS_SCTextArea') {
            label = Messages.getAlt('TestShell.Comments.TextArea', 'Comments');
        }
        return label;
    };

    // Clear CM of any plugins or widgets. This is helpful for unit testing. 
    CM.clear = function () {
        CM._zoom.setLevel(CM._zoom.defaultLevel);
        CM.clearPagePlugins();
        CM.clearEntityPlugins(); // plugins and item widgets
    }

    window.ContentManager = CM;

})();

