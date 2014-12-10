/**
 * The UserAction object provides functions that simulate events occurring in
 * the browser. Since these are simulated events, they do not behave exactly
 * as regular, user-initiated events do, but can be used to test simple
 * user interactions safely.
 *
 * @namespace YAHOO.util
 * @class UserAction
 * @static
 */
YAHOO.util.UserAction = {
    //--------------------------------------------------------------------------
    // Generic event methods
    //--------------------------------------------------------------------------

    /**
    * Simulates a key event using the given event information to populate
    * the generated event object. This method does browser-equalizing
    * calculations to account for differences in the DOM and IE event models
    * as well as different browser quirks. Note: keydown causes Safari 2.x to
    * crash.
    * @method simulateKeyEvent
    * @private
    * @static
    * @param {HTMLElement} target The target of the given event.
    * @param {String} type The type of event to fire. This can be any one of
    *      the following: keyup, keydown, and keypress.
    * @param {Boolean} bubbles (Optional) Indicates if the event can be
    *      bubbled up. DOM Level 3 specifies that all key events bubble by
    *      default. The default is true.
    * @param {Boolean} cancelable (Optional) Indicates if the event can be
    *      canceled using preventDefault(). DOM Level 3 specifies that all
    *      key events can be cancelled. The default
    *      is true.
    * @param {Window} view (Optional) The view containing the target. This is
    *      typically the window object. The default is window.
    * @param {Boolean} ctrlKey (Optional) Indicates if one of the CTRL keys
    *      is pressed while the event is firing. The default is false.
    * @param {Boolean} altKey (Optional) Indicates if one of the ALT keys
    *      is pressed while the event is firing. The default is false.
    * @param {Boolean} shiftKey (Optional) Indicates if one of the SHIFT keys
    *      is pressed while the event is firing. The default is false.
    * @param {Boolean} metaKey (Optional) Indicates if one of the META keys
    *      is pressed while the event is firing. The default is false.
    * @param {int} keyCode (Optional) The code for the key that is in use.
    *      The default is 0.
    * @param {int} charCode (Optional) The Unicode code for the character
    *      associated with the key being used. The default is 0.
    */
    simulateKeyEvent: function(target /*:HTMLElement*/, type /*:String*/,
        bubbles /*:Boolean*/, cancelable /*:Boolean*/,
        view /*:Window*/,
        ctrlKey /*:Boolean*/, altKey /*:Boolean*/,
        shiftKey /*:Boolean*/, metaKey /*:Boolean*/,
                                 keyCode /*:int*/, charCode /*:int*/) /*:Void*/
    {
        //check target
        target = YAHOO.util.Dom.get(target);
        if (!target) {
            throw new Error("simulateKeyEvent(): Invalid target.");
        }

        //check event type
        if (YAHOO.lang.isString(type)) {
            type = type.toLowerCase();
            switch (type) {
            case "keyup":
            case "keydown":
            case "keypress":
                break;
                case "textevent": //DOM Level 3
                type = "keypress";
                break;
            // @TODO was the fallthrough intentional, if so throw error 
            default:
                throw new Error("simulateKeyEvent(): Event type '" + type + "' not supported.");
            }
        } else {
            throw new Error("simulateKeyEvent(): Event type must be a string.");
        }

        //setup default values
        if (!YAHOO.lang.isBoolean(bubbles)) {
            bubbles = true; //all key events bubble
        }
        if (!YAHOO.lang.isBoolean(cancelable)) {
            cancelable = true; //all key events can be cancelled
        }
        if (!YAHOO.lang.isObject(view)) {
            view = window; //view is typically window
        }
        if (!YAHOO.lang.isBoolean(ctrlKey)) {
            ctrlKey = false;
        }
        if (!YAHOO.lang.isBoolean(altKey)) {
            altKey = false;
        }
        if (!YAHOO.lang.isBoolean(shiftKey)) {
            shiftKey = false;
        }
        if (!YAHOO.lang.isBoolean(metaKey)) {
            metaKey = false;
        }
        if (!YAHOO.lang.isNumber(keyCode)) {
            keyCode = 0;
        }
        if (!YAHOO.lang.isNumber(charCode)) {
            charCode = 0;
        }

        //try to create a mouse event
        var customEvent /*:MouseEvent*/ = null;

        //check for DOM-compliant browsers first
        if (YAHOO.lang.isFunction(document.createEvent)) {

            try {

                //try to create key event
                customEvent = document.createEvent("KeyEvents");

                /*
                * Interesting problem: Firefox implemented a non-standard
                * version of initKeyEvent() based on DOM Level 2 specs.
                * Key event was removed from DOM Level 2 and re-introduced
                * in DOM Level 3 with a different interface. Firefox is the
                * only browser with any implementation of Key Events, so for
                * now, assume it's Firefox if the above line doesn't error.
                */
                //TODO: Decipher between Firefox's implementation and a correct one.
                customEvent.initKeyEvent(type, bubbles, cancelable, view, ctrlKey,
                    altKey, shiftKey, metaKey, keyCode, charCode);

            } catch(ex /*:Error*/) {

                /*
                * If it got here, that means key events aren't officially supported.
                * Safari/WebKit is a real problem now. WebKit 522 won't let you
                * set keyCode, charCode, or other properties if you use a
                * UIEvent, so we first must try to create a generic event. The
                * fun part is that this will throw an error on Safari 2.x. The
                * end result is that we need another try...catch statement just to
                * deal with this mess.
                */
                try {

                    //try to create generic event - will fail in Safari 2.x
                    customEvent = document.createEvent("Events");

                } catch(uierror /*:Error*/) {

                    //the above failed, so create a UIEvent for Safari 2.x
                    customEvent = document.createEvent("UIEvents");

                } finally {

                    customEvent.initEvent(type, bubbles, cancelable);

                    //initialize
                    customEvent.view = view;
                    customEvent.altKey = altKey;
                    customEvent.ctrlKey = ctrlKey;
                    customEvent.shiftKey = shiftKey;
                    customEvent.metaKey = metaKey;
                    customEvent.keyCode = keyCode;
                    customEvent.charCode = charCode;

                }

            }

            //fire the event
            target.dispatchEvent(customEvent);

        } else if (YAHOO.lang.isObject(document.createEventObject)) { //IE

            //create an IE event object
            customEvent = document.createEventObject();

            //assign available properties
            customEvent.bubbles = bubbles;
            customEvent.cancelable = cancelable;
            customEvent.view = view;
            customEvent.ctrlKey = ctrlKey;
            customEvent.altKey = altKey;
            customEvent.shiftKey = shiftKey;
            customEvent.metaKey = metaKey;

            /*
            * IE doesn't support charCode explicitly. CharCode should
            * take precedence over any keyCode value for accurate
            * representation.
            */
            customEvent.keyCode = (charCode > 0) ? charCode : keyCode;

            //fire the event
            target.fireEvent("on" + type, customEvent);

        } else {
            throw new Error("simulateKeyEvent(): No event simulation framework present.");
        }
    }
};
