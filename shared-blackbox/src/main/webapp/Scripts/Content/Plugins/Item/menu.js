/*
Item Menu
*/

(function (CM) {

    function match(page, entity, content) {
        if (entity instanceof ContentItem) {
            var accProps = page.getAccProps();
            return accProps.showItemToolsMenu();
        }
        return false;
    }

    function Plugin_Menu(page, entity, el) {
        this.el = el; // tools container element
    }

    CM.registerEntityPlugin('item.menu', Plugin_Menu, match);

    Plugin_Menu.prototype.load = function () {

        var entity = this.entity;
        var messageKey = 'TDSContentEventsJS.Label.ContextMenu';
        entity.addToolElement({
            classname: 'itemMenu',
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