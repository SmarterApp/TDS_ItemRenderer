/*
Passage print menu.
*/

(function(CM) {

    function match(page, entity) {

        // check if TDS passage print function is found
        if (typeof (window.tdsPassagePrint) != 'function') {
            return false;
        }

        // if there is no proctor then we can't print
        if (YUD.hasClass(document.body, 'unproctored')) {
            return false;
        }

        // check if passage
        if (entity instanceof ContentPassage) {
            // check if the print acc is enabled
            var accProps = page.getAccProps();
            return accProps.hasPrintStimulus();
        }
        return false;
    }

    function Plugin() { }

    CM.registerEntityPlugin('passage.print', Plugin, match);

    Plugin.prototype.showMenu = function(menu, evt) {
        
        var menuText = Messages.get('TDSContentEventsJS.Label.PrintPassage');
        var menuItem = {
            text: menuText,
            classname: 'printPassage',
            onclick: { fn: window.tdsPassagePrint }
        };

        menu.addMenuItem('entity', menuItem);

    }

})(window.ContentManager);