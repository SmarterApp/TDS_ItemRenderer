/*
Passage Menu
*/

(function (CM) {

    function match(page, entity, content) {

        // TODO: Ignore layouts with "layoutSingleMulti"

        if (entity instanceof ContentPassage) {
            var accProps = page.getAccProps();
            return accProps.showItemToolsMenu(); // NOTE: passageControl div is not created yet
        }
        return false;
    }

    function Plugin_Menu(page, entity, el) {
        this.el = el; // tools container element
    }

    CM.registerEntityPlugin('passage.menu', Plugin_Menu, match);

    Plugin_Menu.prototype.load = function () {
        
        var entity = this.entity;
        var messageKey = 'TDSContentEventsJS.Label.ContextMenu';
        entity.addToolElement({
            classname: 'passageMenu',
            text: Messages.getAlt(messageKey, 'Menu'),
            stopEvent: true,
            hasPopup: true,
            delay: true,
            fn: function (menuEl, evt) {
                CM.Menu.show({
                    entity: entity,
                    evt: evt,
                    target: menuEl,
                    location: 'bottom'
                });
            }
        });

    }

})(window.ContentManager);