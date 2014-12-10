/*
This contains general content manager keyboard subscriptions. 
*/

(function(CM) {

    // call this function when any keyboard event gets fired
    function onKeyEvent(evt) {

        // FB 146275 - hardware keyboards act different under iOS >= 7 so we're going to disallow Ctrl key shortcuts because
        //  Caps-Lock on sets Ctrl key flag to true for all subsequent key presses
        //  Ctrl-key sets Meta = true and only generates a key up event
        //  Shift/Alt keys works fine
        if (evt.ctrlKey && !Util.Browser.supportsModifierKeys()) {
            return;
        }

        // BUG #15461: Able to open the context menu using Ctl M in the background while warning dialog box is open
        if (CM.isDialogShowing()) return;

        // CTRL-M (this check must be before isMenuShowing())
        if (evt.ctrlKey && evt.keyCode == 77) {
            YUE.stopEvent(evt);
            if (evt.type == 'keydown') {
                CM.Menu.show({ evt: evt });
            }
        };

        // if the menu is showing then don't process key events (menu deals with its own key events)
        if (CM.Menu.isShowing()) return;
        if (CM.isDialogShowing()) return;

        // need to stop tab or it will tab to different elements (inputs, links)
        if (evt.keyCode == 9) {
            YUE.stopEvent(evt);
        }

        var currentPage = CM.getCurrentPage();
        if (currentPage == null) return;

        var currentEntity = currentPage.getActiveEntity();
        if (currentEntity == null) return;

        // assign some DOM3 key names to the event if they don't exist
        if (!evt.key) {
            switch (evt.keyCode) {
                case 9: evt.key = 'Tab'; break;
                case 13: evt.key = 'Enter'; break;
                case 27: evt.key = 'Esc'; break;
                case 32: evt.key = 'Space'; break;
                case 37: evt.key = 'Left'; break;
                case 38: evt.key = 'Up'; break;
                case 39: evt.key = 'Right'; break;
                case 40: evt.key = 'Down'; break;
            }
        }

        // fire events
        currentPage.fire('keyevent', evt);
        currentEntity.fire('keyevent', evt);
    }

    // attach event listeners to a documentframe for key events
    CM.addKeyEvents = function (keyEventObj) {
        if (!CM.enableKeyEvents) return false;
        if (keyEventObj == null) return false;
        if (keyEventObj.__tds_keyEventsEnabled === true) return false;

        YUE.addListener(keyEventObj, "keydown", onKeyEvent);
        YUE.addListener(keyEventObj, "keypress", onKeyEvent);
        YUE.addListener(keyEventObj, "keyup", onKeyEvent);

        keyEventObj.__tds_keyEventsEnabled = true;
        return true;
    };

    ////////////////////////////////////////////////////////////////////

    function processTab(page, evt) {

        // move back or forward
        var moveBack = evt && evt.shiftKey;

        // get a list of entity/components
        var mapping = page.getComponents();
        var currentEntity = page.getActiveEntity();
        var currentComponent = currentEntity.getActiveComponent();

        // find the current itemComponent object
        var currentIC = Util.Array.find(mapping, function (ic) {
            return ic.entity == currentEntity && ic.component == currentComponent;
        });

        // figure out what the next itemComponent is in the tab order
        var nextIC;
        var iter = Util.Iterator(mapping);
        iter.jumpTo(currentIC);
        if (moveBack) {
            nextIC = iter.prev();
        } else {
            nextIC = iter.next();
        }

        var nextEntity = nextIC.entity;
        var nextComponent = nextIC.component;

        // check if entity has changed
        if (nextEntity && nextEntity != currentEntity) {
            nextEntity.setActive(evt);
        }

        // set new component
        if (nextComponent && nextComponent != currentComponent) {
            nextEntity.setActiveComponent(nextComponent);
        }

    }

    CM.onPageEvent('keyevent', function (page, evt) {

        if (evt.type != 'keydown') return;

        // entity focus (items and passage)
        if (evt.key == 'Tab' && !evt.ctrlKey && !evt.altKey) {
            processTab(page, evt);
        }
    });
    
    // listen for up/down keys
    // listen for item/passage key events
    CM.onPageEvent('keyevent', function (page, evt) {

        var keyCode = evt.keyCode;

        // make sure an arrow key
        var arrowKeys = (keyCode >= 37 && keyCode <= 40);
        if (!arrowKeys) return;

        // make sure no other keys are held down
        if (Util.Event.hasModifier(evt)) return;

        // make sure not in caret mode
        if (Mozilla.inCaretMode()) return;

        var targetEl = YAHOO.util.Event.getTarget(evt);

        // if we are in an text area then lets leave here
        if (Util.Event.inTextInput(evt)) return;

        // make sure not on a form element
        if (Util.Dom.isFormElement(targetEl)) return;

        // make sure not in grid
        if (targetEl.tagName == 'svg') return;

        // stop event
        YUE.stopEvent(evt);

        // only scroll on ctrl and keydown
        if (evt.type != 'keydown') return; // !evt.domEvent.ctrlKey

        // scroll page
        page.scroll(evt.key); // up/down/left/right
    });
    
    // this function is for fixing for when the cursor goes out of a selected components container
    var lastRange = null;

    CM.onEntityEvent('keyevent', function (page, entity, evt) {

        // ignore up/down while in caret mode
        if (!Mozilla.inCaretMode()) return;

        var caretMoveKey = (evt.key == 'Up' || evt.key == 'Down' || evt.key == 'Left' || evt.key == 'Right');
        if (!caretMoveKey) return;

        // get selection range elements
        var pageWin = entity.getPage().getWin();
        var selection = pageWin.getSelection();
        var range;

        try {
            range = selection.getRangeAt(0);
        }
        catch (ex) { return; } // "Component returned failure code: 0x80070057 (NS_ERROR_ILLEGAL_VALUE) [nsISelection.getRangeAt]" nsresult: "0x80070057 (NS_ERROR_ILLEGAL_VALUE)"

        // make sure we got a range
        if (!range) return;

        // check if the start/end elements of this range are out of bounds
        var activeElement = entity.getActiveComponent();
        var startElement = range.startContainer;
        var endElement = range.endContainer;

        var outOfBounds = (CM.getAncestor(startElement, [activeElement]) == null);
        if (!outOfBounds) outOfBounds = (CM.getAncestor(endElement, [activeElement]) == null);

        // if the cursor is out of bounds and we have a last know good range then select that
        if (outOfBounds) {
            // make sure we have a last known in bounds range
            if (!lastRange) return;

            try {
                // reselect last known in bounds range
                selection.collapseToStart();
                selection.removeAllRanges();
                selection.addRange(lastRange);
            }
            catch (ex) { return; } // possible component returned exception
        }
        else {
            lastRange = range.cloneRange();
        }
    });
    
})(ContentManager);

