/** **************************************************************************
* @class SectionDivider
* @superclass StaticElement
* @param none
* @return SectionDivider instance
* Creates a new SectionDivider class.
*****************************************************************************
*/
Simulator.Input.SectionDivider = function (sim, panel, theSection, container) {

    Simulator.Input.StaticElement.call(this, sim); // Inherit Instance variables

    var source = 'SectionDivider';  // variable used in debug

    var dbg = function () { return sim.getDebug(); };

    var utils = function () { return sim.getUtils(); };

    var simDocument = function () { return sim.getSimDocument(); };

    if (sim) {
        this.setPanel(panel);
        this.setSection(theSection);
    }

    this.setAttributes = function (attr, node) {
        if (node) attr = utils().getAttributes(node);
        Simulator.Input.SectionDivider.prototype.setAttributes(attr);
        for (var i in attr) {
            switch (i) {
                case 'name':
                    this.setName(attr[i]);
                    break;
            }
        }
    };


    this.render = function () {

        var panelHtml = container;

        divElement = simDocument().createElement('div');
        divElement.id = 'hrHolder';
        divElement.setAttribute('class', 'hrHolder');
        var hrElement = simDocument().createElement('hr');
        divElement.appendChild(hrElement);
        panelHtml.appendChild(divElement);

        this.setFocusable(false); // cannot focus on this element
        this.mapHTML2JS(divElement);
    };

    this.getSourceName = function () {
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
        if (!embedded) (force == null) ? debug(buff.join('')) : debugf(buff.join(''));
        return buff.join('');
    }

    // Convenience functions for debugging
    function debug(str1, str2, trace) {
        dbg().debug(source, str1, str2, trace);
    }

    function debugf(str1, str2, trace) {
        dbg().debugf(source, str1, str2, trace);
    }
}

//Inherit methods and class variables
Simulator.Input.SectionDivider.prototype = new Simulator.Input.StaticElement();
Simulator.Input.SectionDivider.parent = Simulator.Input.StaticElement;
Simulator.Input.SectionDivider.prototype.constructor = Simulator.Input.SectionDivider; // Reset the prototype	// to point to the superclass