// REQUIRES: util.js

(function(Util) {

    var E = {};
    
    E.hasModifier = function(ev) {
        return (ev.ctrlKey || ev.altKey || ev.metaKey);
    };

    // did this key event occur in a text area
    E.inTextInput = function(ev) {
        var target = YAHOO.util.Event.getTarget(ev);
        return Util.Dom.isTextInput(target);
    };
    
    // normalized mouse events for desktop/mobile
    E.Mouse = (function() {
        if ('ontouchstart' in window) {
            return {
                start: 'touchstart',
                end: 'touchend',
                move: 'touchmove',
                click: 'click',
                enter: 'touchenter',
                leave: 'touchleave',
                touchScreen: true
            };
        } else {
            return {
                start: 'mousedown',
                end: 'mouseup',
                move: 'mousemove',
                click: 'click',
                enter: 'mouseenter',
                leave: 'mouseleave',
                touchScreen: false
            };
        }
    })();

    // normalize a touch event into mouse event
    E.normalize = function(evt) {

        // check if touch screen
        if ('ontouchstart' in window && evt.changedTouches) {

            var touches = evt.changedTouches;

            // find touch event that matches dom event
            for (var i = 0, ii = touches.length; i < ii; i++) {
                if (touches[i].target == evt.target) {
                    // save original event
                    var oldevt = evt;

                    // replace mouse event with touch event
                    evt = touches[i];
                    evt.preventDefault = function() { return oldevt.preventDefault(); };
                    evt.stopPropagation = function() { return oldevt.stopPropagation(); };
                    break;
                }
            }
        }

        return evt;
    };

    var EventMap = {
        'start': Hammer.INPUT_START,
        'move': Hammer.INPUT_MOVE,
        'end': Hammer.INPUT_END
    };

    // a hammerjs recognizer for determing when input event starts
    // INPUT_START, INPUT_MOVE, INPUT_END
    function DOMRecognizer(inputType, options) {
        this.inputType = inputType;
        Hammer.Recognizer.call(this, options);
    }

    Hammer.inherit(DOMRecognizer, Hammer.Recognizer);

    DOMRecognizer.prototype.process = function (input) {
        // check if the input matches and the target hasn't changed
        if (input.eventType & this.inputType) {
            return Hammer.STATE_RECOGNIZED;
        }
        return Hammer.STATE_FAILED;
    };
    
    // listen for event on element (start, move, end)
    E.addTouchMouse = function(name, el, callback) {
        var manager = new Hammer.Manager(el);
        var events = name.split(' ');
        events.forEach(function(event) {
            var inputType = EventMap[event];
            if (inputType) {
                manager.add(new DOMRecognizer(inputType, { event: event }));
            }
        });
        manager.on(name, function (evt) {
            var normalizedEvent = E.normalize(evt.srcEvent);
            callback(normalizedEvent);
        });
        return manager;
    };

    Util.Event = E;

})(Util);