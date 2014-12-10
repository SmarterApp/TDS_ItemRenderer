/*
Code for caret browsing in Firefox SB
What is it? http://superuser.com/questions/58569/what-is-caret-browsing-mode-in-firefox
*/

(function (CM) {

    // check if the entity currently allows caret browsing
    function allowCaret(page, entity) {

        // get entity info
        var isPassage = (entity instanceof ContentPassage);
        var isStem = (entity instanceof ContentItem) && (entity.getStemElement() == entity.getActiveComponent());

        // only allow passage/stem to get caret mode
        if (!isPassage && !isStem) {
            return false;
        }

        // check if there is an accommodation that requires caret mode
        var allowedAccommodation = false;

        var accProps = page.getAccommodationProperties();
        if (accProps.hasHighlighting()) {
            allowedAccommodation = true;
        } else if (isPassage && accProps.hasTTSStimulus()) {
            allowedAccommodation = true;
        } else if (isStem && accProps.hasTTSItem()) {
            allowedAccommodation = true;
        }

        return allowedAccommodation;

    }

    // find attachment links
    function match(page) {
        return Mozilla.execPrivileged();
    }

    function Plugin(page) { }

    CM.registerEntityPlugin('caretbrowser', Plugin, match);

    Plugin.prototype.showMenu = function(menu, evt) {

        var page = this.page;
        var entity = this.entity;

        // don't enable for mouse clicks
        if (!evt.keyCode || !allowCaret(page, entity)) {
            return;
        }

        var menuFunc, menuItem;

        if (Mozilla.inCaretMode()) {

            menuFunc = function () {
                // disable caret mode
                ContentManager.enableCaretMode(false);
            };

            menuItem = {
                text: Messages.get('TDSContentEventsJS.Link.DisableTextSelection'),
                classname: 'caretMode',
                onclick: { fn: menuFunc }
            };

        } else {

            menuFunc = function () {
                // BUG: Need to refocus component to reset caret
                var focusedComponent = entity.getActiveComponent();

                // make sure DOM element
                if (focusedComponent && focusedComponent.focus) {
                    entity.clearComponent();
                    entity.setActiveComponent(focusedComponent);

                    // enable caret mode
                    ContentManager.enableCaretMode(true);
                }
            };

            menuItem = {
                text: Messages.get('TDSContentEventsJS.Link.EnableTextSelection'),
                classname: 'caretMode',
                onclick: { fn: menuFunc }
            };

        }

        menu.addMenuItem('entity', menuItem);

    }

})(window.ContentManager);