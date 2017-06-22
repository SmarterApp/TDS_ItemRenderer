//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
/*
Code used for showing rubric popup.
*/

(function (TS, TM) {

    function getRubricType() {
        var contentPage = ContentManager.getCurrentPage();
        if (contentPage) {
            var accProps = contentPage.getAccProps();
            return accProps.getSelectedCode('Rubrics');
        }
        return null;
    }

    function toggle() {

        // get tool code
        var rubricType = getRubricType();
        var id = 'tool-' + rubricType;

        var panel = TM.get(id);

        if (panel == null) {
            var headerText = window.Messages.getAlt('TestShell.Label.Rubric', 'Rubric');
            panel = TM.createPanel(id, 'rubric', headerText, null, rubricType);
        }

        TM.toggle(panel);
    }

    function load() {
        TestShell.UI.addButtonTool({
            id: 'btnRubric',
            className: 'rubric',
            i18n: 'TestShell.Link.Rubric',
            label: 'Rubric',
            fn: toggle
        });
    }

    TS.registerModule({
        name: 'rubric',
        load: load
    });

})(TestShell, TDS.ToolManager);
