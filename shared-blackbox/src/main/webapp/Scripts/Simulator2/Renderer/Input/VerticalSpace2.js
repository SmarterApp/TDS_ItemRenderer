//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
/** **************************************************************************
* @class VerticalSpace
* @superclass StaticElement
* @param none
* @return VerticalSpace instance
* Creates a new VerticalSpace class.
*****************************************************************************
*/
Simulator.Input.VerticalSpace = function (sim, panel, theSection, container) {

    Simulator.Input.StaticElement.call(this, sim); // Inherit Instance variables

    var source = 'VerticalSpace';  // variable used in debug
    var lines = 0;

    var dbg = function () { return sim.getDebug(); };
    var utils = function() { return sim.getUtils(); };
    var simDocument = function() { return sim.getSimDocument(); };
    
    if(sim) {
        this.setPanel(panel);
        this.setSection(theSection);
    }
        
    this.setLines = function(newLines) {
        lines = parseInt(newLines);
    };
    
    this.getLines = function() {
        return lines;
    };

    this.setAttributes = function (attr, node) {
    	if (node) attr = utils().getAttributes(node);
        Simulator.Input.VerticalSpace.prototype.setAttributes(attr);
        for (var i in attr) {
            switch (i) {
                case 'lines':
                    this.setLines(attr[i]);
                    break;
            }
        }
    };

    this.render = function () {
        var panelHtml = container;
        var divElement = simDocument().createElement('div');
        divElement.style.paddingBottom = 20 * this.getLines() + 'px';
        panelHtml.appendChild(divElement);
        //appendBlankVertcalSpace(div, this.getLines());
        this.setFocusable(false);
        this.mapHTML2JS(divElement);
    };
    
    this.getSourceName = function() {
        return source;
    };

    this.inspect = function (embedded, force) {
        var buff = [];
        var sep = '\n\n';
        if (!embedded) {
            buff.push('Inspecting ');
            buff.push(this.getName());
            buff.push(sep);
        }
        for (var i in this) {
            if (i.substr(0, 3) == 'get') {
                buff.push(i);
                buff.push(' = ');
                buff.push(eval('this.' + i + '()'));
                buff.push(sep);
            }
        }
        if (!embedded) (force === null) ? debug(buff.join('')) : debugf(buff.join(''));
        return buff.join('');
    };

    // Convenience functions for debugging
    function debug(str1, str2, trace) {
        dbg().debug(source, str1, str2, trace);
    }

    function debugf(str1, str2, trace) {
        dbg().debugf(source, str1, str2, trace);
    }
    
};

//Inherit methods and class variables
Simulator.Input.VerticalSpace.prototype = new Simulator.Input.StaticElement();
Simulator.Input.VerticalSpace.parent = Simulator.Input.StaticElement;
Simulator.Input.VerticalSpace.prototype.constructor = Simulator.Input.VerticalSpace; // Reset the prototype
                                                        // to point to the superclass

