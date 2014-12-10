

/*******************************************************************************
 * @class Section
 * @superclass SimElement
 * @param sim - the Simulator instance
 * @param panel - the instance of the enclosing panel
 * @return Section Instance
 * 
 * Creates a section from the xml file
 ******************************************************************************/
Simulator.Input.Section = function (sim, thePanel, count) {
    Simulator.SimElement.call(this, sim); // Instance Variable inheritance declaration

    // Private Instance Variables
    var source = 'Section';
    var instance = this;
    var sectionNumber = 1;
    var divider = 'no';
    var sectionLabel = '';
    var panel = thePanel;
    var simID = null;
    var sectionCount = (!count) ? 0 : count; // to create unique section IDs (WCAG)
    var orientation = "vertical";
    var numberOfColumns = "1";

    this.getSectionSettings = function () {
        var sectionSettings = {
            'elementorientation': orientation,
            'numberofcolumns' : numberOfColumns
        }
        return sectionSettings;
    }

    var dbg = function () { return sim.getDebug(); };
    var utils = function () { return sim.getUtils(); };
    var simMgr = function () { return sim.getSimulationManager(); };
    var simDocument = function () { return sim.getSimDocument(); };
    var transDictionary = function () { return sim.getTranslationDictionary(); };
    this.getSimDocument = function () {
        return simDocument();
    }

    if (sim) {
        simID = sim.getSimID();
    }

    //Instance Methods
    this.setDivider = function (newDivider) {
        divider = newDivider;
    };

    this.getDivider = function () {
        return divider;
    };

    this.setLabel = function (newLabel) {
        sectionLabel = newLabel;
        return this;
    };

    this.getLabel = function () {
        // retrieve translated text
        return transDictionary().translate(sectionLabel);
    };

    this.getSectionID = function () {
        return 'inputSection' + simID + sectionCount;
    }

    this.render = function () {
        var inputPanel = panel;
        var label = this.getLabel();
        var HTMLPanel = simDocument().getElementById(panel.getNodeID());
        var space = this.getSpaceAbove();
        if (space > 0) utils().appendBlankVertcalSpace(HTMLPanel, space);
        if (label) {
            var h4Element = simDocument().createElement('h4'); // change form h2 to h4 per Dan
            h4Element.id = this.getSectionID(); // WCAG
            h4Element.innerHTML = label;
            HTMLPanel.appendChild(h4Element);
            //if(simMgr().getSpeechEnabled()) inputPanel.appendStr('<br>');
        }
        var image = this.getImage();
        if (image) {
            div = simDocument().createElement('div');
            div.id = 'imageHolder' + simID;
            HTMLPanel.appendChild(div);
            var span = simDocument().createElement('span');
            span.id = 'holdingSpan' + simID;
            div.appendChild(span);
            var img = simDocument().createElement('img');
            img.id = this.getEname() + SimItem.NextForNumber();
            img.src = image;
            span.appendChild(img);
        }
        if (this.getDivider() == 'yes') HTMLPanel.appendChild(simDocument().createElement('hr'));
        space = this.getSpaceBelow();
        if (space > 0) utils().appendBlankVertcalSpace(HTMLPanel, space);
    };

    this.setAttributes = function (attr, node) {
        Simulator.Input.Section.prototype.setAttributes.call(this, attr, node);
        for (var i in attr) {
            switch (i) {
                case 'divider':
                    instance.setDivider(attr[i]);
                    break;
                case 'orientation':
                    orientation = attr[i];
                    break;
                case 'columns':
                    numberOfColumns = attr[i];
                    break;
            }
        }
    };


    // Private functions
    // Convenience function for the most frequently used Debug methods
    function debug(str1, str2, trace) {
        dbg().debug(source + ': ' + str1, str2, trace);
    }

    function debugf(str1, str2, trace) {
        dbg().debugf(source + ': ' + str1, str2, trace);
    }
};

// Inherit methods and class variables
Simulator.Input.Section.prototype = new Simulator.SimElement();
Simulator.Input.Section.prototype.constructor = Simulator.Input.Section; // Reset the prototype to point to the current class


