(function () {

    var cmdName = 'a11yHelp';   // reusing the a11yHelp module
    var pluginName = 'keymaphelp';
    // initialize the CKEditor a11yhelp plugin (called for each editor instance)
    function initPlugin(editor) {

        // add a button that runs our custom command
        var button = editor.ui.addButton('KeyMapHelp', {
            label: 'KeyMapHelp',
            icon: 'keymaphelp',
            command: cmdName, // calls a11yhelp's command exec
            toolbar: 'keymaphelp,11'
        });

    }

    CKEDITOR.plugins.add(pluginName, {
        requires: 'dialog',
        init: initPlugin
    });

})();