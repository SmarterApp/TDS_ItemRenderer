/*
Allows for setting different interaction modes.
Modes work at then entity level (so passage or item).
*/

// Modes registration
ContentManager.Modes = (function(CM) {

    /* Mode class */
    function Mode(entity) {
        this.entity = entity;
    }

    // select element
    Mode.prototype.select = function() {};

    // start mode logic
    Mode.prototype.enable = function() {};

    // when a mode a ends we dispose of it
    Mode.prototype.dispose = function() {};

    /* Modes API */
    var Modes = {};

    // list of mode classes
    var lookup = new Util.Structs.Map();

    // the current active mode
    var current = null,
        mouseListener;

    var keyListener = new YAHOO.util.KeyListener(document, {
        keys: 27
    }, {
        fn: disableMode
    });

    // add events api
    Util.Event.Emitter(Modes);

    // register the mode class
    function registerMode(name, cls) {
        if (typeof cls.superclass != 'object' ||
            typeof cls.superclass.constructor != 'function') {
            YAHOO.lang.extend(cls, Mode);
        }
        lookup.set(name, cls);
    }

    // create mode instance
    function createInstance(cls, entity) {
        var instance = new cls(entity);
        cls.superclass.constructor.call(instance, entity);
        return instance;
    }

    // is there a mode enabled?
    function isModeEnabled() {
        return current != null;
    }

    // this is called when someone selects an element when a mode is enabled
    function onSelect(mode, el, evt) {
        YUE.stopEvent(evt); // prevent document listener from cancelling
        mode.select(el, evt);
    }

    // attach click listeners to elements
    function addListeners(mode, elements) {
        return elements.map(function (element) {
            return Util.Event.addTouchMouse('start', element, onSelect.bind(null, mode, element));
        });
    }

    // enable a mode
    function enableMode(name, entity) {

        // disable any current modes
        disableMode();

        // check for required data
        entity = entity || CM.getCurrentEntity();
        var cls = lookup.get(name);
        if (!entity || !cls) {
            return null;
        }

        // create mode object
        var mode = createInstance(cls, entity);
        var elements = mode.enable();
        if (!elements || !elements.length) {
            return null;
        }

        console.log('mode enabled: ' + name);

        CM.setReadOnly(true);
        
        // assign event listeners
        var listeners = addListeners(mode, elements);
        current = {
            name: name,
            entity: entity,
            mode: mode,
            listeners: listeners
        };

        // listen for document click
        mouseListener = Util.Event.addTouchMouse('start', document.body, function (evt) {
            YUE.stopEvent(evt);
            disableMode();
        });

        // listen for esc key
        keyListener.enable();

        // add styles
        $(document.body).addClass('modeEnabled');
        $(entity.getElement()).addClass('mode-' + name);

        // fire event
        Modes.fire('enabled', name, mode);
        return mode;
    }

    // disable the current mode
    function disableMode() {
        if (!current) return false;

        console.log('mode disabled: ' + current.name);
        
        // remove styles
        $(document.body).removeClass('modeEnabled');
        $(current.entity.getElement()).removeClass('mode-' + current.name);

        // remove event listeners
        current.listeners.forEach(function (listener) {
            listener.destroy();
        });

        // don't listen for document click
        if (mouseListener) {
            mouseListener.destroy();
            mouseListener = null;
        }

        // don't listen for esc key
        keyListener.disable();

        // destroy mode object
        current.mode.dispose();
        current = null;

        // we need to delay this so any clicks won't be registered
        setTimeout(function() {
            CM.setReadOnly(false);
        }, 250);

        return true;
    }
    
    // create public api
    $.extend(Modes, {
        register: registerMode, 
        isEnabled: isModeEnabled,
        enable: enableMode,
        disable: disableMode
    });

    // BUG 147652: when hiding item turn off modes
    CM.onEntityEvent('hide', function() {
        disableMode();
    });

    return Modes;

})(window.ContentManager);