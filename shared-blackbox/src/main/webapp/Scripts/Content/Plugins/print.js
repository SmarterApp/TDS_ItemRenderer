/*
Page print menu.
TODO: Not sure why all the other print functions are in BB. They really should be in student.
*/

(function(CM) {

    function match(page, entity) {

        // check if TDS page print function is found
        if (typeof (window.tdsPagePrint) != 'function') {
            return false;
        }

        // if there is no proctor then we can't print
        if (YUD.hasClass(document.body, 'unproctored')) {
            return false;
        }

        return true;
    }

    function Plugin() { }

    CM.registerEntityPlugin('pageprint', Plugin, match);

    Plugin.prototype.showMenu = function(menu, evt) {
        
        // If the UI button is visible, add to menu
        if (!ContentManager.isVisible('btnPagePrint')) {
            return;
        }

        var menuText = Messages.get('TDSContentEventsJS.Label.PrintPage');
        var menuItem = {
            text: menuText,
            classname: 'printPage',
            onclick: { fn: window.tdsPagePrint }
        };

        menu.addMenuItem('entity', menuItem);

    }

})(window.ContentManager);