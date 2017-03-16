//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
﻿// REQUIRES: util.js

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

    function addEventListener(type, el, listener, useCapture) {

        // event event listener
        el.addEventListener(type, listener, useCapture);

        // return object to remove event
        return {
            destroy: function () {
                el.removeEventListener(type, listener, useCapture);
            }
        }
        
    }

    // generic event listener
    E.on = function (type, el, listener, useCapture) {

        el = Util.Dom.get(el);

        if (!el) {
            throw new Error('Element not found');
        }

        useCapture = useCapture || false;

        return addEventListener(type, el, listener, useCapture);

    };

    var EventMap = {
        'start': 'pointerdown',
        'move': 'pointermove',
        'end': 'pointerend'
    };

    // add event listener to element
    // TODO: This uses pointer events.. once this is working well remove this function
    E.addTouchMouse = function (name, el, listener) {

        var type = EventMap[name];

        if (!type) {
            throw new Error('Unknown event name: ' + name);
        }

        return E.on(type, el, listener);

    };

    Util.Event = E;

})(Util);