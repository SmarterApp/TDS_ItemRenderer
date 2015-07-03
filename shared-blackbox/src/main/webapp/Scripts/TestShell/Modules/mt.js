//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
/*
This test shell module is used for the ruler and protractor button.
*/

(function (TS) {

    // call these toggle functions to toggle measurement tool on and off
    function toggleRuler() {
        var contentPage = ContentManager.getCurrentPage();
        if (contentPage) {
            TDS.MT_toggleRuler(null, ContentManager.getCurrentPage());
        }
    }

    function toggleProtractor() {
        var contentPage = ContentManager.getCurrentPage();
        if (contentPage) {
            TDS.MT_toggleProtractor(null, ContentManager.getCurrentPage());
        }
    }
    
    function showRulerButton() {
        YUD.setStyle('btnRuler', 'display', 'block');
    }

    function hideRulerButton() {
        YUD.setStyle('btnRuler', 'display', 'none');
    }

    function showProtractorButton() {
        YUD.setStyle('btnProtractor', 'display', 'block');
    }

    function hideProtractorButton() {
        YUD.setStyle('btnProtractor', 'display', 'none');
    }

    function load() {

        var accProps = TDS.getAccommodationProperties();

        // create ruler button
        if (accProps.isSelected('Ruler', 'TDS_Ruler1')) {

            TestShell.UI.addButtonTool({
                id: 'btnRuler',
                className: 'mt_ruler',
                i18n: 'TestShell.Link.Ruler',
                label: 'Ruler',
                fn: toggleRuler
            });

            hideRulerButton();

            // when page shows check if we should show ruler button
            ContentManager.onPageEvent('show', function (page) {
                if (page.MT_toggleRuler) {
                    showRulerButton();
                }
            });

            ContentManager.onPageEvent('hide', function (page) {
                if (page.MT_toggleRuler) {
                    hideRulerButton();
                }
            });

        }

        // create protractor button
        if (accProps.isSelected('Protractor', 'TDS_Protractor1')) {

            TestShell.UI.addButtonTool({
                id: 'btnProtractor',
                className: 'mt_protractor',
                i18n: 'TestShell.Link.Protractor',
                label: 'Protractor',
                fn: toggleProtractor
            });

            hideProtractorButton();

            // when page shows check if we should show protractor button
            ContentManager.onPageEvent('show', function (page) {
                if (page.MT_toggleProtractor) {
                    showProtractorButton();
                }
            });

            ContentManager.onPageEvent('hide', function (page) {
                if (page.MT_toggleProtractor) {
                    hideProtractorButton();
                }
            });

        }

    }

    TS.registerModule({
        name: 'mt',
        load: load
    });

})(TestShell);

