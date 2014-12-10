/**
 * *****************************************************************************
 * @class UpDownCounter 
 * @superclass FieldSet
 * @param sim - The Simulator instance
 * @param node - the DOM node of the element
 * @param panel - The panel the element is in
 * @param theSection - The Section element containing the element
 * @return - instance of an UpDownCounter
 *******************************************************************************
 */

Simulator.Input.UpDownCounter = function (sim, node, panel, theSection, container) {

    Simulator.Input.FieldSet.call(this, sim); // Inherit Instance variables

    var that = this;

    var source = 'UpDownCounter';
    var setValues = [];
    var interButtonDelay = true;
    var interButtonDelay = true;
    var setValues = [];
    var actOnChangeWithMouseout = false;

    var dbg = function () { return sim.getDebug(); };
    var utils = function () { return sim.getUtils(); };
    var simDocument = function () { return sim.getSimDocument(); };

    var scoringTable = function () { return sim.getScoringTable(); }; // get scoring table instance
    var keyboardInput = function () { return sim.getKeyboardInput(); };  // get keyboard input instance

    if (sim) {
        this.setPanel(panel);
        this.setSection(theSection);
    }

    this.getSetValues = function () {
        return setValues;
    };

    this.setsetValues = function (newsetValues) {
        setValues = newsetValues;
        return this;
    };

    this.setInterButtonDelay = function (newInterButtonDelay) {
        interButtonDelay = newInterButtonDelay == true || newInterButtonDelay == 'yes' ? true : false;
        return this;
    };

    this.getInterButtonDelay = function () {
        return interButtonDelay;
    };

    this.handleEvent = function (event) {
        switch (event.type) {
            case 'inputReq':
                this.recordInput(this);
                break;
            case 'info':
                switch (event.context) {
                    case 'simulatorStateChange':
                        break;
                }
                break;
            default:
                dbg().logWarning(source, 'Unhandled event type received: ' + event.toString());
                return;
        }
    };

    this.setActOnChangeWithMouseout = function (newActOnChangeWithMouseout) {
        actOnChangeWithMouseout = newActOnChangeWithMouseout == 'yes' ? true : false;
    };

    this.getActOnChangeWithMouseout = function () {
        return actOnChangeWithMouseout;
    };

    this.keyboardNavigateTo = function (elementID, itemID, index) {
        var element = simDocument().getElementById(elementID);
        var spanElement = element.getElementsByTagName('span')[0];
        var upDownSpanElement = spanElement.getElementsByClassName('upDown')[0];
        var item = element.getElementsByClassName(itemID)[0];
        if (item) item.setAttribute('class', itemID + ' simAreaFocus');
    }

    this.keyboardNavigateAwayFrom = function (elementID, itemID, index) {
        var element = simDocument().getElementById(elementID);
        var spanElement = element.getElementsByTagName('span')[0];
        var upDownSpanElement = spanElement.getElementsByClassName('upDown')[0];
        var item = element.getElementsByClassName(itemID)[0];
        if (item) item.setAttribute('class', itemID);
    }


    /*
    this.keyboardNavigateTo = function (elementID, itemID, index) {
        var element = simDocument().getElementsByClassName(elementID)[0];
        var item = element.getElementsByClassName(itemID)[0];
        if (item) item.setAttribute('class', itemID + ' simAreaFocus');
    };

    this.keyboardNavigateAwayFrom = function (elementID, itemID, index) {
        var element = simDocument().getElementsByClassName(elementID)[0];
        var item = element.getElementsByClassName(itemID)[0];
        if (item) item.setAttribute('class', itemID);
    };
    */

    this.recordKeyboardSelection = function (elementID, itemID, itemIndex) {

        if ((itemID) && (elementID)) {
            if (itemIndex == 0) {
                this.incrementValue(this.getNodeID(), this.getMaxValue(), this.getIncrement());
            }
            else if (itemIndex == 1) {
                this.decrementValue(this.getNodeID(), this.getMinValue(), this.getIncrement());
            }
        }
    };

    this.receivedSpeechFocus = function () {
        debug(this.getName() + ' received speech focus');
        var node = simDocument().getElementById('incrementalWrapper' + this.getNodeID());
        node.style.border = 'thin solid #ff0000';
    };

    this.removeSpeechFocus = function (value) {
        debug(this.getName() + ' lost speech focus');
        var node = simDocument().getElementById('incrementalWrapper' + this.getNodeID());
        prevBorders = node.borders;
        node.style.border = 'none';
    };

    this.disableInput = function () {
        var component = simDocument().getElementById('goingUp' + this.getNodeID());
        component.disabled = true;
        component = simDocument().getElementById('goingDown' + this.getNodeID());
        component.disabled = true;
    };

    this.enableInput = function () {
        var component = simDocument().getElementById('goingUp' + this.getNodeID());
        component.disabled = false;
        component = simDocument().getElementById('goingDown' + this.getNodeID());
        component.disabled = false;
    };

    this.speechActivated = function (value) {
        if (value == 1) this.incrementValue(this.getNodeID(), parseFloat(this.getMaxValue()), parseFloat(this.getIncrement()));
        else if (value == -1) this.decrementValue(this.getNodeID(), this.getMinValue(), this.getIncrement());
        this.onChange(this.getNodeID());
    };

    this.setAttributes = function (attr, node) {
        if (node) attr = utils().getAttributes(node);
        Simulator.Input.UpDownCounter.prototype.setAttributes.call(this, attr, node);
        for (var i in attr) {
            switch (i) {
                case 'actOnChange':
                    this.setActOnChange(attr[i]);
                    break;
                case 'actOnChangeWithMouseout':
                    this.setActOnChangeWithMouseout(attr[i]);
                    break;
                case 'interButtonDelay':
                    this.setInterButtonDelay(attr[i]);
                    break;
                case 'multModifier':
                    this.setMultModifier(attr[i]);
                    break;
                case 'addModifier':
                    this.setAddModifier(attr[i]);
                    break;
            }
        }
        if (this.getScoreable()) scoringTable().addElement(this.getName(), 'input'); //TODO: replace after scoring table insertion
        //this.setItems(node);
    };

    this.render = function () {
        var nodeID = this.getNodeID();
        var panelHtml = container;
        var labelledByID = this.getSectionID(); // default aria-labelledby to containing section (WCAG) 

        this.setFocusable(true, true);

        var nextNum = utils().getNextSequenceNumber();
        var image = this.getImage();

        if (this.getSpaceAbove()) {
            utils().appendBlankVertcalSpace(panelHtml, this.getSpaceAbove);
        }

        var needtoShowLabelBelow = false; // indicate whether a label need to be put after the updown counter is rendered
        /*        if(sim.getSpeechEnabled()) {
        var label = this.getSpeechLabel();  // if there is a speechLabel defined in the xml use that
        if(!label) {
        label = this.getLabel(); // else use the element's label if there is one
        if(!label) {
        label = this.getSectionLabel();  // else use the enclosing section label if there is one
        if(!label) {
        dbg().logFatalError(source, 'Item is speech enabled but no speechLabel, element label, or enclosing section label is specified for ' + this.getName());
        return;
        }
        }
        }
        var textLabelElement3 = simDocument().createTextNode(Simulator.Constants.SPEECH_LABEL_PREFIX + label);
        panelHtml.appendChild(textLabelElement3);
        // buff.unshift(Simulator.Constants.SPEECH_LABEL_PREFIX + label);
        sim.getSpeechGrammarBldr().createUpDownCounterGrammarRule(this.getName(), label, this, label);
        }
        else {
        */
        needtoShowLabelBelow = true;
        //        }
        var divElement = null;
        if (image != null && image != undefined) {
            divElement = simDocument().createElement('div');
            divElement.id = 'incrementalWrapper' + nodeID;
            divElement.setAttribute('class', 'incrementalWrapper withImages');
            divElement.setAttribute('role', 'group'); // WCAG
            var spanElement = simDocument().createElement('span');
            spanElement.setAttribute('class', 'holderImage');
            var imageElement = simDocument().createElement('img');
            imageElement.setAttribute('src', image);
            imageElement.setAttribute('alt', this.getName());
            spanElement.appendChild(imageElement);
            divElement.appendChild(spanElement);
        }
        else {
            divElement = simDocument().createElement('div');
            divElement.id = 'incrementalWrapper' + nodeID;
            divElement.setAttribute('class', 'incrementalWrapper');
            divElement.setAttribute('role', 'group'); // WCAG
            if (sim.getSpeechEnabled()) {
                divElement.setAttribute('style', 'padding-bottom: 40px');
            }
        }

        var containerSpanElement = simDocument().createElement('span');
        containerSpanElement.setAttribute('class', 'incrementalContainer');
        var inputElement = simDocument().createElement('input');
        inputElement.id = nodeID;
        inputElement.setAttribute('readonly', 'readonly');
        inputElement.setAttribute('name', 'number' + nodeID);
        inputElement.setAttribute('value', this.getDefaultValue());
        inputElement.setAttribute('type', 'text');
        containerSpanElement.appendChild(inputElement);
        var labelElement = simDocument().createElement('label');
        labelElement.setAttribute('for', nextNum);
        labelElement.innerHTML = this.getUnits();
        containerSpanElement.appendChild(labelElement);
        var upDownSpanElement = simDocument().createElement('span');
        upDownSpanElement.setAttribute('class', 'upDown');
        var inputGoingUpElement = simDocument().createElement('input');
        inputGoingUpElement.id = 'goingUp' + nodeID;
        inputGoingUpElement.setAttribute('class', 'goingUp');
        utils().bindEvent(inputGoingUpElement, 'click', function () {
            that.incrementValue(nodeID, that.getMaxValue(), that.getIncrement());
        });
        if (this.getActOnChangeWithMouseout()) {
            utils().bindEvent(inputGoingUpElement, 'mouseout', function () {
                that.PotentialChangeInValue(nodeID);
            });
            if (this.getInterButtonDelay()) {
                utils().bindEvent(inputGoingUpElement, 'mouseover', function () {
                    that.CancelNoChange(nodeID);
                });
            }
        }
        inputGoingUpElement.setAttribute('type', 'button');
        inputGoingUpElement.setAttribute('title', 'increase count');
        upDownSpanElement.appendChild(inputGoingUpElement);
        if (sim.getSpeechEnabled()) {
            var textLabelElement1 = simDocument().createTextNode(' Increment');
            upDownSpanElement.appendChild(textLabelElement1);
        }
        var inputGoingDownElement = simDocument().createElement('input');
        inputGoingDownElement.id = 'goingDown' + nodeID;
        inputGoingDownElement.setAttribute('class', 'goingDown');
        utils().bindEvent(inputGoingDownElement, 'click', function () {
            that.decrementValue(nodeID, that.getMinValue(), that.getIncrement());
        });
        if (this.getActOnChangeWithMouseout()) {
            utils().bindEvent(inputGoingDownElement, 'mouseout', function () {
                that.PotentialChangeInValue(nodeID);
            });
            if (this.getInterButtonDelay()) {
                utils().bindEvent(inputGoingDownElement, 'mouseover', function () {
                    that.CancelNoChange(nodeID);
                });
            }
        }
        inputGoingDownElement.setAttribute('type', 'button');
        inputGoingDownElement.setAttribute('title', 'decrease count');
        upDownSpanElement.appendChild(inputGoingDownElement);
        if (sim.getSpeechEnabled()) {
            var textLabelElement2 = simDocument().createTextNode(' Decrement');
            upDownSpanElement.appendChild(textLabelElement2);
        }
        containerSpanElement.appendChild(upDownSpanElement);
        divElement.appendChild(containerSpanElement);
        if (theSection.getSectionSettings().elementorientation === "horizontal") {
            divElement.classList.add("inputpanelcell");
        }
        panelHtml.appendChild(divElement);

        if (needtoShowLabelBelow) {
            if (this.getLabel()) {
                var h5LabelElement = simDocument().createElement('h5'); // using h5 rather than simple text node (WCAG)
                var h5ID = this.createLabelID();
                h5LabelElement.id = h5ID; // ID for WCAG
                labelledByID = labelledByID + ' ' + h5ID; // if there is an element label, add to the aria-laballedby attribute (WCAG)
                h5LabelElement.innerHTML = this.getLabel();
                divElement.appendChild(h5LabelElement);
            }
            /*
            var textLabelElement3 = simDocument().createTextNode(this.getLabel());
            divElement.appendChild(textLabelElement3); */
        }

        inputElement.setAttribute('aria-labelledby', labelledByID); // WCAG
        inputGoingUpElement.setAttribute('aria-labelledby', labelledByID); // WCAG
        inputGoingDownElement.setAttribute('aria-labelledby', labelledByID); // WCAG

        inputGoingUpElement.setAttribute('aria-valuenow', this.getDefaultValue()); // WCAG
        inputGoingUpElement.setAttribute('aria-valuemax', this.getMaxValue()); // WCAG
        inputGoingUpElement.setAttribute('aria-valuemin', this.getMinValue()); // WCAG

        inputGoingDownElement.setAttribute('aria-valuenow', this.getDefaultValue()); // WCAG
        inputGoingDownElement.setAttribute('aria-valuemax', this.getMaxValue()); // WCAG
        inputGoingDownElement.setAttribute('aria-valuemin', this.getMinValue()); // WCAG

        if (this.isFocusable()) {
            // Register the element items for keyboard input
            /*         
            keyboardInput().addFocusableElementItem(this, 'upDown', 'goingUp');
            keyboardInput().addFocusableElementItem(this, 'upDown', 'goingDown');
            */
            keyboardInput().addFocusableElementItem(this, divElement.id, 'goingUp');
            keyboardInput().addFocusableElementItem(this, divElement.id, 'goingDown');
        }

        // panel.appendStr(buff.join(''));
        if (this.getSpaceBelow()) {
            utils().appendBlankVertcalSpace(panelHtml, this.getSpaceBelow());
            // appendBlankVertcalSpace(HTMLPanel, this.getSpaceBelow());
        }

        this.recordInput(this, true);  // true -> setting defaults
        this.setPrevValue(this.getDefaultValue());
        this.mapHTML2JS(divElement);
    };

    var theCounterID = null;
    var prevCounterID = null;
    var movementInterval = 50;   //ms
    var t = null;
    this.PotentialChangeInValue = function (id) {
        var element = simDocument().getElementById(id);
        prevCounterID = theCounterID == null ? id : theCounterID;
        theCounterID = id;
        if (this.getInterButtonDelay()) {
            t = setTimeout(function () { that.ChangeInValue(); }, movementInterval);
        } else this.ChangeInValue();
    };

    this.CancelNoChange = function () {
        if (theCounterID == prevCounterID) clearTimeout(t);
    };

    this.ChangeInValue = function () {
        if (theCounterID) {
            var htmlElement = simDocument().getElementById(theCounterID);
            if (this.getPrevValue() != htmlElement.value) {
                this.setPrevValue(this.getData());
                this.onChange(theCounterID);
            }
            theCounterID = null;
        }
    };

    this.incrementValue = function (id, maxValue, increment) {
        var htmlElement = simDocument().getElementById(id);
        var upElement = htmlElement.parentNode.getElementsByTagName('span')[0].getElementsByClassName('goingUp')[0];
        var downElement = htmlElement.parentNode.getElementsByTagName('span')[0].getElementsByClassName('goingDown')[0];
        currentValue = parseFloat(htmlElement.value);

        if ((currentValue + parseFloat(increment)) <= maxValue) {
            currentValue = parseFloat((currentValue + parseFloat(increment)).toFixed(10));
        }
        htmlElement.value = currentValue;
        currentValue = this.getModifiedValue(currentValue);
        currentValue = currentValue.toString();
        upElement.setAttribute('aria-valuenow', currentValue); // WCAG
        downElement.setAttribute('aria-valuenow', currentValue); // WCAG
        this.setData(currentValue);
        valueChanged = true;
        if (this.getSaveOnChange()) this.onChange(this.getNodeID());
    };

    this.decrementValue = function (id, minValue, decrement) {
        var htmlElement = simDocument().getElementById(id);
        var upElement = htmlElement.parentNode.getElementsByTagName('span')[0].getElementsByClassName('goingUp')[0];
        var downElement = htmlElement.parentNode.getElementsByTagName('span')[0].getElementsByClassName('goingDown')[0];
        currentValue = parseFloat(htmlElement.value);

        if ((currentValue - parseFloat(decrement)) >= minValue) {
            currentValue = parseFloat((currentValue - parseFloat(decrement)).toFixed(10));
        }
        htmlElement.value = currentValue;
        currentValue = this.getModifiedValue(currentValue);
        currentValue = currentValue.toString();
        upElement.setAttribute('aria-valuenow', currentValue); // WCAG
        downElement.setAttribute('aria-valuenow', currentValue); // WCAG
        this.setData(currentValue);
        valueChanged = true;
        if (this.getSaveOnChange()) this.onChange(this.getNodeID());
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
Simulator.Input.UpDownCounter.prototype = new Simulator.Input.FieldSet();
Simulator.Input.UpDownCounter.parent = Simulator.Input.FieldSet;
Simulator.Input.UpDownCounter.prototype.constructor = Simulator.Input.UpDownCounter; // Reset the prototype to point to

