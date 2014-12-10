/** **************************************************************************
* @class HorizontalLine
* @superclass StaticElement
* @param none
* @return HorizontalLine instance
* Creates a new HorizontalLine class.
*****************************************************************************
*/
Simulator.Input.HorizontalLine = function (sim, panel, theSection, container) {

    Simulator.Input.StaticElement.call(this, sim); // Inherit Instance variables

    var source = 'HorizontalLine';  // variable used in debug

    var dbg = function () { return sim.getDebug(); };

    var utils = function () { return sim.getUtils(); };

    var simDocument = function () { return sim.getSimDocument(); };

    if (sim) {
        this.setPanel(panel);
        this.setSection(theSection);
    }

    var height = 0;
    this.setHeight = function (newHeight) {
        height = parseInt(newHeight);
    };

    this.getHeight = function () {
        return height;
    };

    var width = 1;
    this.setWidth = function (newWidth) {
        width = parseInt(newWidth);
    };

    this.getWidth = function () {
        return width;
    };

    var alignment = 'absolute'; //'center';
    this.setAlignment = function (newAlignment) {
        alignment = newAlignment;
    };

    this.getAlignment = function () {
        return alignment;
    };

    var distance = 0;
    this.setDistance = function (newDistance) {  // newDIstance is a percentage - ex '37%'
        distance = newDistance;
    };

    this.getDistance = function () {
        return distance;
    };

    var ownSpace = true;
    this.setOwnSpace = function (newOwnSpace) {
        ownSpace = newOwnSpace == 'yes' ? true : false;
    };

    this.getOwnSpace = function () {
        return ownSpace;
    };

    this.setAttributes = function (attr, node) {
        if (node) attr = utils().getAttributes(node);
        Simulator.Input.HorizontalLine.prototype.setAttributes(attr);
        for (var i in attr) {
            switch (i) {
                case 'name':
                    this.setName(attr[i]);
                    break;
                case 'width':
                    this.setWidth(attr[i]);
                    break;
                case 'height':
                    this.setHeight(attr[i]);
                    break;
                case 'alignment':
                    this.setAlignment(attr[i]);
                    break;
                case 'distance':
                    this.setDistance(attr[i]);
                    break;
                case 'ownSpace':
                    this.setOwnSpace(attr[i]);
                    break;
            }
        }
    };


    this.render = function () {

        var panelHtml = container;

        // create a span element
        spanElement = simDocument().createElement('span');
        spanElement.id = 'horizontalLine';

        // set the class based on the alignment
        if (this.getAlignment() == 'left') {
            spanElement.setAttribute('class', 'sim_divider sim_divider_left');
            if (this.getDistance() != null) spanElement.style.marginLeft = this.getDistance() + 'px'; // set the margin
        } else if (this.getAlignment() == 'right') {
            spanElement.setAttribute('class', 'sim_divider sim_divider_right');
            if (this.getDistance() != null) spanElement.style.marginRight = this.getDistance() + 'px'; // set the margin
        } else {  // center is the default alignment
            spanElement.setAttribute('class', 'sim_divider sim_divider_center');
        }

        // set the width and height
        if (this.getWidth() != null) spanElement.style.width = this.getWidth() + "px";
        if (this.getHeight() != null) spanElement.style.height = this.getHeight() + "px";

        // use the attribute 'ownSpace' to determine whether the element needs its own horizontal space
        if (this.getOwnSpace()) spanElement.style.clear = 'both';

        panelHtml.appendChild(spanElement);

        this.setFocusable(false); // no focus for horizontal line
        this.mapHTML2JS(spanElement);
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
Simulator.Input.HorizontalLine.prototype = new Simulator.Input.StaticElement();
Simulator.Input.HorizontalLine.parent = Simulator.Input.StaticElement;
Simulator.Input.HorizontalLine.prototype.constructor = Simulator.Input.HorizontalLine; // Reset the prototype	// to point to the superclass