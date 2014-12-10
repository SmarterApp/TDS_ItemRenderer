/*
Code used for showing help popup.
*/

(function (TS, TM) {

    function toggle() {
        // get the tools path
        var key = TDS.Help.getKey();
        var id = 'tool-' + key;

        var panel = TM.get(id);

        if (panel == null) {
            var headerText = window.Messages.getAlt('TestShell.Label.HelpGuide', 'Help');
            panel = TM.createPanel(id, 'helpguide', headerText, null, key);
        }

        TM.toggle(panel);
    }

    function load() {
        TS.UI.addClick('btnHelp', toggle);
    }

    TS.registerModule({
        name: 'help',
        load: load
    });

})(TestShell, TDS.ToolManager);
