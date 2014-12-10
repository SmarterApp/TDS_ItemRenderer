/*
Strikethrough mode for MC/MS.
In the future I want to add "strikeable" as a class
to any elements that can be striked through. 
*/

(function(CM, Modes) {

    var CSS_STRIKETHROUGH = 'strikethrough';
    var SELECTOR_STRIKEABLE = 'div.optionContainer';

    // get an array of strikeable elements
    function getStrikeables(entity) {
        var entityEl = entity.getElement();
        return $(SELECTOR_STRIKEABLE, entityEl).get();
    }

    // check if the element can be striked through
    function isStrikeable(el) {
        return $(el).is(SELECTOR_STRIKEABLE);
    }

    // check if the element has been striked through
    function hasStrikethrough(el) {
        return $(el).hasClass(CSS_STRIKETHROUGH);
    }

    // toggle strikethrough on an element
    function toggleStrikethrough(el) {
        $(el).toggleClass(CSS_STRIKETHROUGH);
    }

    // create mode
    function Mode_Strike() {}

    Modes.register('strikethrough', Mode_Strike);

    // this is called when someone clicks on an option
    Mode_Strike.prototype.select = function (el) {
        toggleStrikethrough(el);
    };

    // this is called when enabling strikethrough mode
    Mode_Strike.prototype.enable = function () {
        // if for some reason there are no stikeable elements then mode will not be enabled
        return getStrikeables(this.entity);
    };

    /////////////////////////////////////////////////////////

    // create plugin
    function match(page, entity) {
        if (entity instanceof ContentItem) {
            var accProps = page.getAccommodationProperties();
            if (accProps.hasStrikethrough()) {
                // check for widgets we support
                return ['mc', 'ebsr', 'qti.choice'].some(function (widgetName) {
                    return entity.widgets.has(widgetName);
                });
            }
        }
        return false;
    }

    function Plugin_Strike(page, entity) {}

    CM.registerEntityPlugin('strikethrough', Plugin_Strike, match, {
        priority: 300
    });

    // this is called when someone requests showing a menu
    Plugin_Strike.prototype.showMenu = function (menu, evt) {

        var component = this.entity.getActiveComponent();
        var accProps = this.page.getAccProps();
        var hasMenuButton = accProps.showItemToolsMenu();

        // check if component is strikeable and right click was used
        if (isStrikeable(component) && CM.Menu.isContextEvent(evt)) {
            // toggle individual option stikethrough
            var striked = hasStrikethrough(component);
            var strikeText = striked ? Messages.get('TDSMC.MenuLabel.UndoStrikethrough') : Messages.get('TDSMC.MenuLabel.Strikethrough');
            var menuLabel = {
                text: strikeText,
                classname: CSS_STRIKETHROUGH
            };
            menu.addMenuItem('component', menuLabel, function() {
                toggleStrikethrough(component);
            });
        } else if (hasMenuButton) {
            // enter into stikethrough mode
            var menuLabel = {
                text: Messages.get('TDSMC.MenuLabel.Strikethrough'),
                classname: CSS_STRIKETHROUGH
            };
            menu.addMenuItem('component', menuLabel, function () {
                CM.Modes.enable('strikethrough');
            });
        }
    };

})(window.ContentManager, window.ContentManager.Modes);