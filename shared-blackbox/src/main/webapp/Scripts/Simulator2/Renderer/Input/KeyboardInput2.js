
/*******************************************************************************
 * @class KeyboardInput 
 * @superclass none
 * @param none
 * @return KeyboardInput instance
 * 
 * This class supports the keyboard shortcut feature for simulation items.
 *
 ******************************************************************************/
Simulator.Input.KeyboardInput = function (sim) {

    // instance specific constants
    var KEY = 0;
    var ELEMENT = 1;
    var ITEM = 2;

    // instance variables
    var source = 'KeyboardInput';
    var dbg = function () { return sim.getDebug(); };
    var eventMgr = function () { return sim.getEventManager(); };
    var simMgr = function () { return sim.getSimulationManager(); };
    var elementSelected = false; // indicates whether there is an element is being selected
    var focusableElements = [];  // contains the list of elements currently being focused
    var inputIndex = 0;    // initialize the index of input element and input item being focused
    var itemIndex = -1;

    // these variables are obsolete in Simulator 2.0
    // var keyboardInput;  // global    
    // KeyboardInput.Instance = this;
    // keyboardInput = this;

    // add an element that can be focused (called when the KeyboardInput instance is initialized)
    this.addFocusableElement = function (element, elementID, itemID) {
        focusableElements.push([]);
        focusableElements[focusableElements.length - 1][KEY] = elementID;
        focusableElements[focusableElements.length - 1][ELEMENT] = element;
        focusableElements[focusableElements.length - 1][ITEM] = [];
    };

    // add an item that can be focused (called when the KeyboardInput instance is initialized)
    this.addFocusableElementItem = function (element, elementID, itemID, position) {
        var index = elementInDB(elementID);
        if (index == -1) {
            // if the element is not added to the list yet, add the element first
            this.addFocusableElement(element, elementID, itemID);
            // add the item to the list of items for the element
            var items = [];
            items.push(itemID);
            focusableElements[focusableElements.length - 1][ITEM] = items;
        }
        else {
            var items = focusableElements[index][ITEM];
            if (items == null) {
                items = [];
                items.push(itemID);
            }
            else if ((items.length == 0) || (!position) || (items.length <= position))
                items.push(itemID);
            else
                items.splice(position, 0, itemID);
        }
    };

    this.inspect = function (force) {
        var buff = [];
        buff.push("Inspecting focusableElements:");
        for (var i = 0; i < focusableElements.length; i++) {
            buff.push("[" + i + "] = " + focusableElements[i][KEY] + ", " + focusableElements[i][ELEMENT].getName() + ", " + focusableElements[i][ITEM]);
        }
        buff.push("End inspecting focusableElements");
        force == null ? debug(source, buff.join('\n')) : debugf(source, buff.join('\n'));
    };

    // move the focus to the next element within the list of focusable elements
    var advanceToNextElement = function () {
        inputIndex++;
        if (inputIndex >= focusableElements.length)
            inputIndex = -1; //  Wrap around
    };

    // move the focus to the next item within the list of focusable items
    var advanceToNextItem = function () {
        elementSelected = false;
        itemIndex++;
        if ((inputIndex == -1) || (focusableElements[inputIndex][ITEM].length <= itemIndex)) {
            advanceToNextElement();
            itemIndex = 0;
        }
    };

    // move the focus to the previous element within the list of focusable elements
    var advanceToPreviousElement = function () {
        inputIndex--;
        if (inputIndex < 0)
            inputIndex = focusableElements.length - 1;    // Wrap around
        if (inputIndex >= 0) {
            itemIndex = focusableElements[inputIndex][ITEM].length - 1;
            if (itemIndex < 0)
                itemIndex = 0;
        }
    };

    // move the focus to the previous item within the list of focusable items
    var advanceToPreviousItem = function () {
        if (itemIndex <= 0) // previously ==, which caused an error if the first input was ctrl+shift+tab or shift+tab: wrap rather than decrement negative itemIndex
            advanceToPreviousElement();
        else
            itemIndex--;
    };

    // return the index of the element in the focusable element list
    var elementInDB = function (elementID) {
        for (var i = 0; i < focusableElements.length; i++) {
            if (focusableElements[i][KEY] == elementID) return i;
        }
        return -1;
    };

    // return the focusable object given by the element and item index
    var getInputObjectFromList = function (inputIndex, itemIndex) {
        if ((inputIndex != -1) && (inputIndex < focusableElements.length)) {
            var parts = [];
            parts[KEY] = focusableElements[inputIndex][KEY];
            parts[ELEMENT] = focusableElements[inputIndex][ELEMENT];
            var items = [];
            items = focusableElements[inputIndex][ITEM];
            parts[ITEM] = items[itemIndex];
            return parts;
        }
    };

    // third party code
    shortcut = {
        'all_shortcuts': {}, //All the shortcuts are stored in this array
        'add': function (shortcut_combination, callback, simDoc, opt) {
            //Provide a set of default options
            var default_options = {
                'type': 'keydown',
                'propagate': true,
                'disable_in_input': false,
                'target': simDoc,
                'keycode': false
            };
            if (!opt) opt = default_options;
            else {
                for (var dfo in default_options) {
                    if (typeof opt[dfo] == 'undefined') opt[dfo] = default_options[dfo];
                }
            }

            var ele = opt.target;
            if (typeof opt.target == 'string') ele = document.getElementById(opt.target);

            shortcut_combination = shortcut_combination.toLowerCase();

            // The function to be called at keypress
            var func = function (e) {
                e = e || window.event;

                if (opt['disable_in_input']) { //Don't enable shortcut keys in Input, Textarea fields
                    var element = null;
                    if (e.target) element = e.target;
                    else if (e.srcElement) element = e.srcElement;
                    if (element.nodeType == 3) element = element.parentNode;

                    if (element.tagName == 'INPUT' || element.tagName == 'TEXTAREA') return;
                }

                //Find Which key is pressed
                if (e.keyCode) code = e.keyCode;
                else if (e.which) code = e.which;
                var character = String.fromCharCode(code).toLowerCase();

                if (code == 188) character = ","; //If the user presses , when the type is onkeydown
                if (code == 190) character = "."; //If the user presses , when the type is onkeydown

                var keys = shortcut_combination.split("+");
                //Key Pressed - counts the number of valid keypresses - if it is same as the number of keys, the shortcut function is invoked
                var kp = 0;

                // Work around for stupid Shift key bug created by using lowercase - as a result the shift+num combination was broken
                var shift_nums = {
                    "`": "~",
                    "1": "!",
                    "2": "@",
                    "3": "#",
                    "4": "$",
                    "5": "%",
                    "6": "^",
                    "7": "&",
                    "8": "*",
                    "9": "(",
                    "0": ")",
                    "-": "_",
                    "=": "+",
                    ";": ":",
                    "'": "\"",
                    ",": "<",
                    ".": ">",
                    "/": "?",
                    "\\": "|"
                };
                //Special Keys - and their codes
                var special_keys = {
                    'esc': 27,
                    'escape': 27,
                    'tab': 9,
                    'space': 32,
                    'return': 13,
                    'enter': 13,
                    'backspace': 8,

                    'scrolllock': 145,
                    'scroll_lock': 145,
                    'scroll': 145,
                    'capslock': 20,
                    'caps_lock': 20,
                    'caps': 20,
                    'numlock': 144,
                    'num_lock': 144,
                    'num': 144,

                    'pause': 19,
                    'break': 19,

                    'insert': 45,
                    'home': 36,
                    'delete': 46,
                    'end': 35,

                    'pageup': 33,
                    'page_up': 33,
                    'pu': 33,

                    'pagedown': 34,
                    'page_down': 34,
                    'pd': 34,

                    'left': 37,
                    'up': 38,
                    'right': 39,
                    'down': 40,

                    'f1': 112,
                    'f2': 113,
                    'f3': 114,
                    'f4': 115,
                    'f5': 116,
                    'f6': 117,
                    'f7': 118,
                    'f8': 119,
                    'f9': 120,
                    'f10': 121,
                    'f11': 122,
                    'f12': 123
                };

                var modifiers = {
                    shift: { wanted: false, pressed: false },
                    ctrl: { wanted: false, pressed: false },
                    alt: { wanted: false, pressed: false },
                    meta: { wanted: false, pressed: false}    //Meta is Mac specific
                };

                if (e.ctrlKey) modifiers.ctrl.pressed = true;
                if (e.shiftKey) modifiers.shift.pressed = true;
                if (e.altKey) modifiers.alt.pressed = true;
                if (e.metaKey) modifiers.meta.pressed = true;

                for (var i = 0; k = keys[i], i < keys.length; i++) {
                    //Modifiers
                    if (k == 'ctrl' || k == 'control') {
                        kp++;
                        modifiers.ctrl.wanted = true;

                    } else if (k == 'shift') {
                        kp++;
                        modifiers.shift.wanted = true;

                    } else if (k == 'alt') {
                        kp++;
                        modifiers.alt.wanted = true;
                    } else if (k == 'meta') {
                        kp++;
                        modifiers.meta.wanted = true;
                    } else if (k.length > 1) { //If it is a special key
                        if (special_keys[k] == code) kp++;

                    } else if (opt['keycode']) {
                        if (opt['keycode'] == code) kp++;

                    } else { //The special keys did not match
                        if (character == k) kp++;
                        else {
                            if (shift_nums[character] && e.shiftKey) { //Stupid Shift key bug created by using lowercase
                                character = shift_nums[character];
                                if (character == k) kp++;
                            }
                        }
                    }
                }

                if (kp == keys.length &&
                            modifiers.ctrl.pressed == modifiers.ctrl.wanted &&
                            modifiers.shift.pressed == modifiers.shift.wanted &&
                            modifiers.alt.pressed == modifiers.alt.wanted &&
                            modifiers.meta.pressed == modifiers.meta.wanted) {
                    callback(e);

                    if (!opt['propagate']) { //Stop the event
                        //e.cancelBubble is supported by IE - this will kill the bubbling process.
                        e.cancelBubble = true;
                        e.returnValue = false;

                        //e.stopPropagation works in Firefox.
                        if (e.stopPropagation) {
                            e.stopPropagation();
                            e.preventDefault();
                        }
                        return false;
                    }
                }
            };
            this.all_shortcuts[shortcut_combination] = {
                'callback': func,
                'target': ele,
                'event': opt['type']
            };
            //Attach the function with the event
            if (ele.addEventListener) ele.addEventListener(opt['type'], func, false);
            else if (ele.attachEvent) ele.attachEvent('on' + opt['type'], func);
            else ele['on' + opt['type']] = func;
        },

        //Remove the shortcut - just specify the shortcut and I will remove the binding
        'remove': function (shortcut_combination) {
            shortcut_combination = shortcut_combination.toLowerCase();
            var binding = this.all_shortcuts[shortcut_combination];
            delete (this.all_shortcuts[shortcut_combination]);
            if (!binding) return;
            var type = binding['event'];
            var ele = binding['target'];
            var callback = binding['callback'];

            if (ele.detachEvent) ele.detachEvent('on' + type, callback);
            else if (ele.removeEventListener) ele.removeEventListener(type, callback, false);
            else ele['on' + type] = false;
        }
    };

    // add entries for shortcut keys
    this.initializeKeyboardShortcuts = function () {
        shortcut.add('tab', function () { handleKeyBoardInput('tab', '', ''); }, sim.getSimDocument());
        shortcut.add('ctrl+tab', function () { handleKeyBoardInput('ctrl', 'tab', ''); }, sim.getSimDocument());
        shortcut.add('shift+tab', function () { handleKeyBoardInput('shift', 'tab', ''); }, sim.getSimDocument());
        shortcut.add('ctrl+shift+tab', function () { handleKeyBoardInput('ctrl', 'shift', 'tab'); }, sim.getSimDocument());
        shortcut.add('enter', function () { handleKeyBoardInput('enter', '', ''); }, sim.getSimDocument());
        // shortcut.add('ctrl+d', function() {handleKeyBoardInput('ctrl', 'd', '');});
        // shortcut.add('ctrl+i', function() {handleKeyBoardInput('ctrl', 'i', '');});

    };

    // remove entries for shortcut keys
    this.removeKeyboardShortcuts = function () {
        shortcut.remove('tab');
        shortcut.remove('ctrl+tab');
        shortcut.remove('shift+tab');
        shortcut.remove('ctrl+shift+tab');
        shortcut.remove('enter');
    };

    this.resetKeyboardFocusState = function () {
        // if there is any previously focused item, call the corresponding item's method to move focus away from the item
        if (prevInputObjectInfo[ELEMENT]) {
            prevInputObjectInfo[ELEMENT].keyboardNavigateAwayFrom(prevInputObjectInfo[KEY], prevInputObjectInfo[ITEM], itemIndex);
        }

        // reset focus
        inputIndex = 0;
        itemIndex = -1;

        // clear out previously focused object
        prevInputObjectInfo = [];
    }

    // initialize the object that is previously focused on to empty
    var prevInputObjectInfo = [];

    // main function to handle key input events
    var handleKeyBoardInput = function (firstKey, secondKey, thirdKey) {

        // check if the animation is running, if yes, do not handle keyboard
        if (simMgr().isPlaying()) return;

        var parts = null;
        // if there is any previously focused item, call the corresponding item's method to move focus away from the item
        if (prevInputObjectInfo[ELEMENT]) {
            prevInputObjectInfo[ELEMENT].keyboardNavigateAwayFrom(prevInputObjectInfo[KEY], prevInputObjectInfo[ITEM], itemIndex);
        }

        switch (firstKey) {
            case 'ctrl':
                switch (secondKey) {
                    case 'tab':
                        // 'Ctrl+tab' moves the focus to the next focusable item
                        if (elementSelected) advanceToNextElement();
                        else advanceToNextItem();
                        // retrieve the next item
                        parts = getInputObjectFromList(inputIndex, itemIndex);
                        if (parts) {
                            // itemIndex = prevInputObjectInfo[KEY] != parts[KEY] ? 0 : itemIndex + 1;
                            // call the corresponding item's method to move focus to the item
                            parts[ELEMENT].keyboardNavigateTo(parts[KEY], parts[ITEM], itemIndex);
                        } else {
                            // has reached the end of the focusable item list, post the event to the blackboard
                            eventMgr().postEvent(new Simulator.Event(this, 'info', 'lastfocusableSimulatorElementReached', null, false));
                            inputIndex = -1;
                        }
                        break;
                    case 'shift':
                        switch (thirdKey) {
                            case 'tab':
                                // 'Ctrl+Shift+tab' moves the focus to the previous focusable item
                                if (elementSelected) advanceToPreviousElement();
                                else advanceToPreviousItem();
                                // retrieve the previous item
                                parts = getInputObjectFromList(inputIndex, itemIndex);
                                if (parts) {
                                    // itemIndex = prevInputObjectInfo[KEY] != parts[KEY] ? 0 : itemIndex - 1;
                                    // call the corresponding item's method to move focus to the item
                                    parts[ELEMENT].keyboardNavigateTo(parts[KEY], parts[ITEM], itemIndex);
                                } else {
                                    // has reached the beginning of the focusable item list, post the event to the blackboard
                                    eventMgr().postEvent(new Simulator.Event(this, 'info', 'firstfocusableSimulatorElementReached', null, false));
                                    inputIndex = -1;
                                }
                                break;
                        }
                        break;
                    /* case 'd':
                    // 'left' key to move slider position left
                    // retrieve the item
                    parts = getInputObjectFromList(inputIndex, itemIndex);
                    //debug(source, "parts in enter key:\nparts[", + KEY + "] = " + parts[KEY] + "\nparts[" + ELEMENT + "] = " + parts[ELEMENT].getName() + "\nparts[" + ITEM + "] = " + parts[ITEM]);
                    if(parts[ELEMENT]) {
                    // call the corresponding item's method to record item selection
                    parts[ELEMENT].moveMin();
                    }
                    break;
                    case 'i':
                    // 'right' key to move slider position right
                    // retrieve the item
                    parts = getInputObjectFromList(inputIndex, itemIndex);
                    //debug(source, "parts in enter key:\nparts[", + KEY + "] = " + parts[KEY] + "\nparts[" + ELEMENT + "] = " + parts[ELEMENT].getName() + "\nparts[" + ITEM + "] = " + parts[ITEM]);
                    if(parts[ELEMENT]) {
                    // call the corresponding item's method to record item selection
                    parts[ELEMENT].moveMax();
                    }
                    break; */ 
                }
                break;
            case 'shift':
                switch (secondKey) {
                    case 'tab':
                        // 'Shift+tab' moves the focus to the previous focusable item
                        if (elementSelected) advanceToPreviousElement();
                        else advanceToPreviousItem();
                        // retrieve the previous item
                        parts = getInputObjectFromList(inputIndex, itemIndex);
                        if (parts) {
                            // itemIndex = prevInputObjectInfo[KEY] != parts[KEY] ? 0 : itemIndex - 1;
                            // call the corresponding item's method to move focus to the item
                            parts[ELEMENT].keyboardNavigateTo(parts[KEY], parts[ITEM], itemIndex);
                        } else {
                            // has reached the beginning of the focusable item list, post the event to the blackboard
                            eventMgr().postEvent(new Simulator.Event(this, 'info', 'firstfocusableSimulatorElementReached', null, false));
                            inputIndex = -1;
                        }
                        break;
                }
                break;
            case 'tab':
                // do nothing for 'tab' key
                break;
            case 'enter':
                // 'enter' key to select an item
                // retrieve the item
                parts = getInputObjectFromList(inputIndex, itemIndex);
                //debug(source, "parts in enter key:\nparts[", + KEY + "] = " + parts[KEY] + "\nparts[" + ELEMENT + "] = " + parts[ELEMENT].getName() + "\nparts[" + ITEM + "] = " + parts[ITEM]);
                if (parts) {
                    // call the corresponding item's method to record item selection
                    parts[ELEMENT].recordKeyboardSelection(parts[KEY], parts[ITEM], itemIndex);
                    // for option and choice lists, keep focus on current element
                    if (parts[ELEMENT].getType() == 'optionList' || parts[ELEMENT].getType() == 'choiceList')
                        parts[ELEMENT].keyboardNavigateTo(parts[KEY], parts[ITEM], itemIndex);
                    // for droplist, move the focus to the next element once the "enter" key is pressed
                    if (parts[ELEMENT].getType() === 'dropList') {
                        itemIndex = focusableElements[inputIndex][ITEM].length - 1;
                    }
                    // elementSelected = true;
                }
                break;
        }
        // store the currently focused item as the previously selected one (will be retrieved when focus is moved to another item later on)
        if (parts) {
            prevInputObjectInfo[KEY] = parts[KEY];
            prevInputObjectInfo[ELEMENT] = parts[ELEMENT];
            prevInputObjectInfo[ITEM] = parts[ITEM];
        }
        else {
            prevInputObjectInfo[KEY] = null;
            prevInputObjectInfo[ELEMENT] = null;
            prevInputObjectInfo[ITEM] = null;
        }
    };

    this.closeDropList = function () {
        handleKeyBoardInput('enter');
    }

    // Convenience function for the most frequently used Debug methods
    var debug = function (str1, str2, trace) {
        dbg().debug(source, str1, str2, trace);
    };

    var debugf = function (str1, str2, trace) {
        dbg().debugf(source, str1, str2, trace);
    };

};




