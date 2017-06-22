//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
/****************************************
 * DialogPanel Class Specification
 * Superclass: None
 ****************************************/
Simulator.Display.DialogPanel = function(sim, enclosingPanel, panelID, buttonLabel, attr) {
    
    // Private Instance Variables
    var source = 'DialogPanel';
    var HTMLDialogPanel = null;
    var title = '';
    var instructions = '';
    var id = '';
    var dialogAttr = [];  // Holds the attributes for a dialog panel
    
    var dbg = function() { return sim.getDebug(); };
    var simDocument = function() { return sim.getSimDocument(); };
    
    // Instance Methods
    this.getTitle = function() {
        return title;
    };
    
    this.getInstructions = function() {
        return instructions;
    };
    
    this.getID = function() {
        return id;
    };
    
    this.setClass = function(newClass) {
        HTMLDialogPanel.setAttribute('class', newClass);
    };
    
    
    this.setInstructions = function(newInstructions) {
        dialogAttr['instructions'] = newInstructions;
    };
  
    this.setTitle = function(newTitle) {
        dialogAttr['title'] = newITitle;
    };
    
    this.getDialogAttr = function() {
        return dialogAttr;
    };
    

    
    this.render = function(enclosingPanel, attr, panelID, buttonLabel) {
        
        dialogButton = dialogPanel.createButton(panelID + 'button', panelID, buttonLabel);
        var htmlButton = simDocument().getElementById(dialogButton.getNodeID());
        HTMLPanel = simDocument().getElementById(panelID);
        dialogPanel.innerHTML = dialogAttr['instructions'];
        dialogPanel.display = 'none';
        HTMLPanel.appendChild(htmlButton);
    };
    
    this.getDialogButton = function() {
        return dialogButton;
    };
    
    // Private Functions
    function setAttributes(attr) {
        for(var i in attr) {
            switch (i) {
            case 'title':
                title = attr[i];
                break;
            case 'instructions':
                instructions = attr[i];
                break;
            default:
                dbg().logError(source, 'Unknown DialogPanel attribute seen: ' + i + 'with value "' + attr[i] + '"');
            }
        }
        setStructure();
    }
    
    function setStructure() {
        HTMLDialogPanel = simDocument().createElement('div');
        HTMLDialogPanel.setAttribute('class', 'infoWrapper');
        HTMLDialogPanel.style.display = 'none';
        var titleDiv = simDocument().createElement('div');
        titleDiv.setAttribute('class', 'instructionsTitle');
        var header = simDocument().createElement('h2');
        header.innerHTML = title;
        titleDiv.appendChild(header);
        var anchor = simDocument().createElement('a');
        anchor.href = '#';
        anchor.setAttribute('class', 'close instructions');
        anchor.innerHTML = 'Close';
        titleDiv.appendChild(anchor);
        HTMLDialogPanel.appendChild(titleDiv);
        var instrDiv = simDocument().createElement('div');
        instrDiv.setAttribute('class', 'holderInfo');
        instrDiv.innerHTML = instructions;
        HTMLDialogPanel.appendChild(instrDiv);
    }
    
    this.createButton = function(htmlID, panelName, buttonLabel) {
        var theButton = new Button();
        var attr = [];
        attr['implication'] = 'neutral';
        attr['label'] = buttonLabel;
        attr['name'] = htmlID;
        attr['type'] = 'text';
        attr['alwaysEnabled'] = 'yes';
        attr['handler'] = 'ShowDialog';
        attr['handlerParameters'] = panelName;
        
        theButton.setAttributes(attr, null);
        theButton.render(panelName);
        return theButton;
    };

    
    // Convenience function for the most frequently used Debug methods
    function debug(str1, str2, tace) {
        dbg().debug(source + ': ' + str1, str2, trace);
    }
    
    function debugf(str1, str2, trace) {
        dbg().debugf(source + ': ' + str1, str2, trace);
    }

    setAttributes(attr);
};

