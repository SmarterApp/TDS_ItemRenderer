//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
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