//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
/** **************************************************************************
* @class ImageElement
* @superclass StaticElement
* @param none
* @return ImageElement instance
* Creates a new ImageElement class.
*****************************************************************************
*/
Simulator.Input.ImageElement = function (sim, panel, theSection, container) {

    Simulator.Input.StaticElement.call(this, sim); // Inherit Instance variables

    var source = 'ImageElement';  // variable used in debug
    var simID = null;

    var dbg = function () {return sim.getDebug();};
    var utils = function () { return sim.getUtils(); };
    var simDocument = function () { return sim.getSimDocument(); };

    if (sim) {
        simID = sim.getSimID();
    }

    this.setAttributes = function (attr, node) {
        if (node) attr = utils().getAttributes(node);
        Simulator.Input.ImageElement.prototype.setAttributes(attr);
        for (var i in attr) {
            switch (i) {
                case 'name':
                    this.setName(attr[i]);
                    break;
                case 'image':
                    this.setImage(attr[i]);
                    break;
                case 'type':
                    this.setType(attr[i]);
                    break;
            }
        }
    };

    this.render = function () {
        var inputPanel = container;
        div = simDocument().createElement('div');
        div.id = 'imageHolder' + simID;
        if (theSection.getSectionSettings().elementorientation === "horizontal") {
            div.classList.add("inputpanelcell");
        }
        inputPanel.appendChild(div);
        var span = simDocument().createElement('span');
        span.id = 'holdingSpan' + simID;
        div.appendChild(span);
        var img = simDocument().createElement('img');
        img.id = this.getEname() + sim.getSimID();
        img.src = this.getImage();
        span.appendChild(img);

        this.setFocusable(false);
        this.mapHTML2JS(div);
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
Simulator.Input.ImageElement.prototype = new Simulator.Input.StaticElement();
Simulator.Input.ImageElement.parent = Simulator.Input.StaticElement;
Simulator.Input.ImageElement.prototype.constructor = Simulator.Input.ImageElement; // Reset the prototype to point to the superclass