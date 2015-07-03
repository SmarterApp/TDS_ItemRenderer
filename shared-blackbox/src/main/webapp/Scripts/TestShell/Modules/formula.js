//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
/*
Code used for showing formula popup.
*/

(function (TS, TM) {

    function toggle() {
        var contentPage = ContentManager.getCurrentPage();
        var accProps = contentPage.getAccommodationProperties();

        // check if we have the tool
        if (!accProps.hasFormula()) return;

        // get tool code
        var key = accProps.getFormula();
        var id = 'tool-' + key;

        var panel = TM.get(id);

        if (panel == null) {
            var headerText = window.Messages.getAlt('TestShell.Label.Formulas', 'Formula');
            panel = TM.createPanel(id, 'formula', headerText, null, key);
        }

        TM.toggle(panel);
    }

    function load() {
        TS.UI.addClick('btnFormula', toggle);
    }

    TS.registerModule({
        name: 'formula',
        load: load
    });

})(TestShell, TDS.ToolManager);
