//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
/*
Code used for showing calculator popup.
*/

(function (TS, TM) {

    var calcMapping = {};
    calcMapping['Basic'] = 'TDS_CalcBasic';
    calcMapping['StandardMem'] = 'TDS_CalcStdMem';
    calcMapping['Standard'] = 'TDS_CalcStd';
    calcMapping['Scientific'] = 'TDS_CalcSci';
    calcMapping['ScientificInv'] = 'TDS_CalcSciInv';
    calcMapping['Graphing'] = 'TDS_CalcGraphing';
    calcMapping['GraphingInv'] = 'TDS_CalcGraphingInv';
    calcMapping['Matrices'] = 'TDS_CalcMatrices';
    calcMapping['Regression'] = 'TDS_CalcRegress';

    // get a calc acc code using a calc type name
    function getCode(calcType) {
        return calcMapping[calcType];
    };

    function getCodes() {
        return Util.Object.keys(calcMapping);
    }

    // a helper function for safely getting the current calc instance
    function getInstance(id) {

        var frameCalc = document.getElementById('frame-' + id);

        // make sure frame exists
        if (!frameCalc || !frameCalc.contentWindow) {
            return null;
        }

        // get calc window
        var winCalc = frameCalc.contentWindow;

        // make sure calc functions exists
        if (!YAHOO.lang.isFunction(winCalc.getWorkingCalcInstance)) {
            return null;
        }

        // get calc instance
        var calcInstance = winCalc.getWorkingCalcInstance();
        if (calcInstance != null && YAHOO.lang.isFunction(calcInstance.setInitKeyboardElement)) {
            return calcInstance;
        }

        return null;
    };

    // sets the panel style for the current calc instance
    function setStyle(panel, calcInstance) {

        // clear all CSS
        getCodes().forEach(function (name) {
            var code = calcMapping[name];
            YUD.removeClass(panel.element, code);
        });

        // add css for calc instance
        var currentCalcCode = getCode(calcInstance.config.name);

        if (currentCalcCode) {
            YUD.addClass(panel.element, currentCalcCode);
        }

        // update dimensions
        panel.refresh();
    };

    // create a calc dialog panel
    function create(id, calcUrl) {

        var headerText = window.Messages.getAlt('TestShell.Label.Calculator', 'Calculator');

        // create calc panel
        var panel = TM.createPanel(id, 'calculator', headerText, null);

        // load calculator into panel
        TM.loadUrl(panel, calcUrl, function () {
            //add the client_<clientStylePath> to the body of the frame.
            YUD.addClass(panel.getFrame().contentDocument.body, 'client_' + TDS.clientStylePath);

            // subscribe to calculator mode change
            var calcInstance = getInstance(id);

            if (calcInstance && calcInstance.parent) {
                // give javascript on the page time to init so there is a calc instance ready
                setTimeout(function () {
                    setStyle(panel, calcInstance);
                }, 0);

                // listen for when someone changes the current calc instance
                calcInstance.parent.CalcModeChange.subscribe(function (ev, arr) {
                    var oldCalc = arr[0], newCalc = arr[1];
                    setStyle(panel, newCalc);

                    // make sure we are not out of bounds
                    var panelX = panel.cfg.getProperty('x');
                    var panelY = panel.cfg.getProperty('y');
                    panel.moveTo(panelX, panelY);
                });
            }
        });

        // When the calculator is shown, we need to make sure that focus is on the right element
        // NOTE: this event might not get fired the first time the calc shows it seems..
        panel.showEvent.subscribe(function () {
            var calcInstance = getInstance(id);
            if (calcInstance) {
                // clear remaining focus visual indication (blue border)
                calcInstance.clearFocus(calcInstance.config.keyboardRegionDivs);
                // focus on panel. I have to put this into a timeout since the overlayMgr 
                // is going to be assinging focus to the panel on this event (look at tds_toolManager.js)
                setTimeout(function () { calcInstance.setInitKeyboardElement(); }, 1);
            }
        });

        return panel;
    };

    // clear calculator
    ContentManager.onPageEvent('hide', function (contentPage) {
        var tools = TDS.ToolManager.getAll();

        for (var i = 0; i < tools.length; i++) {
            try {
                // Reset all calculator panels
                if (tools[i].id.toLowerCase().indexOf('calculator') > 0) {

                    var frameCalc = document.getElementById('frame-' + tools[i].id);
                    // make sure frame exists
                    if (!frameCalc || !frameCalc.contentWindow) continue;

                    // make sure function exists
                    var winCalc = frameCalc.contentWindow;
                    if (typeof winCalc.resetTDSCalc != 'function') continue;

                    // call clear on calc
                    winCalc.resetTDSCalc();
                }
            }
            catch (ex) { Util.log(ex); } // Permission denied for to get property Window.clearCalc
        }
    });

    function toggle() {

        var contentPage = ContentManager.getCurrentPage();
        if (contentPage == null) return;

        // check if we have the calculator tool
        var accProps = contentPage.getAccommodationProperties();
        if (accProps == null || !accProps.hasCalculator()) return;

        // take the calc accs and them to calc types
        var calcModes = accProps.getCalculator();

        getCodes().forEach(function (name) {
            var code = calcMapping[name];
            calcModes = calcModes.replace(code, name);
        });

        // create calc url
        var id = 'tool-calculator-' + calcModes.replace(/&/g, "-");
        var calcUrl = "../Scripts/Calculator/TDSCalculator.aspx?mode=" + calcModes.replace(/&/g, ",");

        var panel = TM.get(id);

        // check if calc panel exists
        if (panel == null) {
            panel = create(id, calcUrl);
        }

        TM.toggle(panel);
    };

    function load() {
        TS.UI.addClick('btnCalculator', toggle);
    }

    TS.registerModule({
        name: 'calculator',
        load: load
    });

})(TestShell, TDS.ToolManager);

