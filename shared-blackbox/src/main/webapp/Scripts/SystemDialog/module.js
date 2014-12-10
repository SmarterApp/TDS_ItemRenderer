/*
Hooks up the system dialog into TDS.
*/

// This module is for TestShell
(function(TS) {

    // check if test shell is available
    if (!TS) return;

    function isSupported() {
        var accProps = TDS.getAccommodationProperties();
        return (accProps && accProps.hasSystemVolumeControl() && TDS.SystemDialog.isSupported());
    }

    function open() {
        TDS.SystemDialog.open();
    }

    function load() {
        var btnId = 'btnSettings';
        if (isSupported()) {
            YUD.setStyle(btnId, 'display', 'block');
            TS.UI.addClick(btnId, open);
            TS.Menu.registerLink({
                id: btnId,
                classname: 'systemdialog',
                text: Messages.getAlt('TestShell.Link.SystemSettings', 'Settings')
            });
            
        } else {
            YUD.setStyle(btnId, 'display', 'none');
        }
    }

    TS.registerModule({
        name: 'systemdialog',
        load: load
    });

})(window.TestShell);