//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
/*******************************************************************************
 * @class Layout 
 * @superclass none
 * @param sim - instance of Simulator
 * Layout creates and manages the collection of Panels used in the simulation item
 * Note: Layout is a singleton class
 ******************************************************************************/
Simulator.Display.Layout = function (sim, container) {

    //Instance variables
    var source = 'Layout';
    var panelList = [];

    // Get required services
    var dbg = function () { return sim.getDebug(); };
    var eventMgr = function () { return sim.getEventManager(); };
    var simDocument = function () { return sim.getSimDocument(); };
    var utils = function () { return sim.getUtils(); };
    var simDocument = function () { return sim.getSimDocument(); };

    this.specifyLayout = function (layout) {
        var format = null;
        var attr = layout[0].attributes;
        var div = simDocument().createElement('div');
        div.setAttribute('id', Simulator.Constants.SIM_CONTAINER_NAME + sim.getSimID());
        if (utils().isInternetExplorer()) {
            format = attr.getNamedItem('format').value;
        }
        else format = attr['format'].nodeValue;
        if (format) {
            div.setAttribute('class', format);
            container.appendChild(div);
            //debug('Created layout');
        }
        else dbg().logError(source, 'Could not get layout format attribute.');
    };


    this.createPanels = function (node) {
        var aPanel;
        var panelSpec;
        var panelNum = 0;
        for (var i = 0; i < node.length; i++) {
            if (node[i].nodeName[0] != '#') {
                aPanel = new Simulator.Display.Panel(sim, panelNum++);
                for (var j = 0; j < node[i].childNodes.length; j++) {
                    if (node[i].childNodes[j].nodeName[0] != '#') {
                        panelSpec = node[i].childNodes[j];
                        aPanel.setAttributes(aPanel, utils().getAttributes(panelSpec));
                    }
                }
                var attr = node[i].attributes;
                if (utils().isInternetExplorer()) aPanel.setAttributes(utils().getAttributes(node[i]));
                else if (Object.size(attr) > 0) aPanel.setAttributes(utils().getAttributes(node[i]));
                aPanel.setName(node[i].nodeName);
                var id = aPanel.getNodeID();
                if (!panelList[id]) panelList[id] = aPanel;
                aPanel.render();
            }
        }
    };


    this.getPanelInstance = function (panelType) {
        for (var panel in panelList)
            if (panel.indexOf(panelType) > -1) return panelList[panel];
        return null;
    };


    this.resizeAllPanels = function (zoom) {
        debug(source, 'In Layout Panel Resize All Panels for simID=' + sim.getSimID());
        var aPanel = null;
        for (var name in panelList) {
            aPanel = panelList[name];
            if (aPanel.resize) {
                aPanel.resize(zoom);
            } else dbg().logError(source, 'unknown panel name: ' + name);
        }
    };

    this.recordPanelSizes = function (zoom) {
        debug(source, 'In Record Panel Sizes for simID=' + sim.getSimID());
        var aPanel = null;
        for (var name in panelList) {
            aPanel = panelList[name];
            if (aPanel.recordOriginalWidthAndHeight) {
                aPanel.recordOriginalWidthAndHeight();
            } else dbg().logError(source, 'unknown panel name: ' + name);
        }
    };

    this.makeAllPanelsVisible = function () {
        var aPanel = null;
        for (var name in panelList) {
            aPanel = panelList[name];
            aPanel.setDisplay('visible');
            var HTMLPanel = simDocument().getElementById(name);
            if (HTMLPanel) {
                HTMLPanel.style.visibility = 'visible';
                debug(name + '.style.visibility = ' + HTMLPanel.style.visibility);
            }
            else dbg().logError(source, 'Could not get HTML ' + name + ' panel element. Could not make panel visible');

        }
    };


    this.getContainerWidth = function () {
        var width = 0;
        var container = simDocument().getElementById(Simulator.Constants.SIM_CONTAINER_NAME + sim.getSimID());
        if (container) {
            width = container.offsetWidth;
            if (width === 0) {
                dbg().logError(source, 'Simulator container offsetWidth is 0');
            }
            //            debugf('Containing div width = ' + container.offsetWidth);
            return container.offsetWidth;
        } else {
            dbg().logError(source, 'Simulator\'s container with id = "' + id + '" is null');
            return FAILURE;
        }
    };


    this.getContainerHeight = function () {
        var height = 0;
        var container = simDocument().getElementById(Simulator.Constants.SIM_CONTAINER_NAME + sim.getSimID());
        if (container) {
            height = container.offsetHeight;
            if (height === 0) {
                dbg().logError(source, 'Simuator container offsetHeight is 0');
            }
            //            debugf('Containing div height = ' + container.offsetHeight);
            return container.offsetHeight;
        } else {
            dbg().logError(source, 'Simulator\'s container with id = "' + id + '" is null.');
            return FAILURE;
        }
    };

    this.handleEvent = function (event) {
        switch (event.type) {
            case 'info':
                switch (event.context) {
                    case 'simulatorStateChange':
                        switch (event.data) {
                            case 'ReadOnly': this.disableAllInput();
                                break;
                            case 'Playing': this.disableAllInput();
                                break;
                            case 'Ready': this.enableAllInput();
                                break;
                        }
                        break;
                }
        }
    };

    this.enableAllInput = function () {
        for (var panel in panelList) {
            if (panel) {
                var panelObj = panelList[panel];
                if (panelObj.enableAllInput)
                    panelObj.enableAllInput();
            }
        }
    };

    this.enableStartButton = function () {
        for (var panel in panelList) {
            if (panel) {
                var panelObj = panelList[panel];
                if (panelObj.enableStartButton)
                    panelObj.enableStartButton();
            }
        }
    };

    this.disableAllInput = function () {
        for (var panel in panelList) {
            if (panel) {
                var panelObj = panelList[panel];
                if (panelObj.disableAllInput)
                    panelObj.disableAllInput();
            }
        }
    };

    this.saveInputs = function (forcedSave) {
        for (var panel in panelList) {
            if (panel) {
                var panelObj = panelList[panel];
                if (panelObj.saveInputs)
                    panelObj.saveInputs(forcedSave);
            }
        }
    };

    // check if there is any choice list selection that is left empty (i.e., no option selected)
    this.hasEmptyChoiceListSelection = function () {
        for (var panel in panelList) {
            if (panel) {
                var panelObj = panelList[panel];
                if (panelObj.hasEmptyChoiceListSelection) {
                    if (panelObj.hasEmptyChoiceListSelection()) {
                        return true;
                    }
                }
            }
        }
        return false;
    };

    this.getSourceName = function () {
        return source;
    };

    if (sim) eventMgr().registerEvent(new Simulator.Event(this, 'info', 'simulatorStateChange'));

    // Convenience function for the most frequently used Debug methods
    function debug(str1, str2, trace) {
        dbg().debug(source, str1, str2, trace);
    }

    function debugf(str1, str2, trace) {
        dbg().debugf(source, str1, str2, trace);
    }

};





