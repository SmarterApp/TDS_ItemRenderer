//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
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
            $(panel.close).attr('href', '#');
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
