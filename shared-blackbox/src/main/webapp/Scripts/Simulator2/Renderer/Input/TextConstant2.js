/** **************************************************************************
* @class TextConstant
* @superclass StaticElement
* @param none
* @return TextConstant instance
* Creates a new TextConstant class.
*****************************************************************************
*/
Simulator.Input.TextConstant = function (sim, panel, theSection, container) {

    Simulator.Input.StaticElement.call(this, sim); // Inherit Instance variables

    var source = 'TextConstant';  // variable used in debug
    
    var dbg = function () { return sim.getDebug(); };
    var utils = function() { return sim.getUtils(); };
    var simDocument = function() { return sim.getSimDocument(); };
    var transDictionary = function () { return sim.getTranslationDictionary(); };

    if(sim) {
        this.setPanel(panel);
        this.setSection(theSection);
    }
    
    var text = '';
    var heavy = false;
   
    this.setText = function(newText) {
        text = newText;
    };
    
    this.getText = function () {
        // retrieve translated text
        return transDictionary().translate(text);
    };
    
    this.setHeavy = function(newHeavy) {
        if(newHeavy == 'yes') heavy = true;
        else heavy = false;
    };
    
    this.getHeavy = function() {
        return heavy;
    };

    this.setAttributes = function (attr, node) {
    	if (node) attr = utils().getAttributes(node);
        Simulator.Input.TextConstant.prototype.setAttributes(attr);
        for (var i in attr) {
            switch (i) {
                case 'text':
                    this.setText(attr[i]);
                    break;
                case 'heavy':
                    this.setHeavy(attr[i]);
                    break;
            }
        }
    };

    this.render = function () {
    	var panelHtml =container;
        var divElement = simDocument().createElement('div');
        if (this.getSpaceAbove() > 0) utils().appendBlankVertcalSpace(divElement, this.getSpaceAbove());
        if (theSection.getSectionSettings().elementorientation === "horizontal") {
            divElement.classList.add("inputpanelcell");
        }
        panelHtml.appendChild(divElement);
        if (this.getHeavy()) divElement.innerHTML = '<b>' + this.getText() + '</b>';
        else divElement.innerHTML = this.getText();
        if (this.getSpaceBelow() > 0) utils().appendBlankVertcalSpace(divElement, this.getSpaceBelow());

        this.setFocusable(false);
        this.mapHTML2JS(divElement);
    };
    
    this.getSourceName = function() {
        return source;
    };

    this.inspect = function (embedded, force) {
        var buff = [];
        var sep = '\n\n';
        buff.push('Inspecting TextElement');
        buff.push(sep);
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
Simulator.Input.TextConstant.prototype = new Simulator.Input.StaticElement();
Simulator.Input.TextConstant.parent = Simulator.Input.StaticElement;
Simulator.Input.TextConstant.prototype.constructor = Simulator.Input.TextConstant; // Reset the prototype
                                                        // to point to the superclass