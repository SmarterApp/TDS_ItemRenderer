
/**
 * *****************************************************************************
 * @class SimSlider 
 * @superclass FieldSet
 * @param sim - The Simulator instance
 * @param node -
 * @param panel - 
 * @return - instance of a SimSlider
 *******************************************************************************
 */
Simulator.Input.SimSlider = function (sim, node, panel, theSection, container) {

    Simulator.Input.FieldSet.call(this, sim); // Inherit Instance variables

    var that = this;
    var source = 'SimSlider';
    var instance = this;
    var HTMLId = null;
    var textAreaId = null;
    var sliderBackgroundImage = 'http://yui.yahooapis.com/2.9.0/build/slider/assets/bg-h.gif';
    var sliderImage = 'Scripts/Simulator/renderer/images/slider_thumb.png';
    var theSlider = null;
    var setValues = [];
    var orientation = 'horizontal';
    var reportMovement = false;
    // The slider can move (in pixels) from its start position toward the minimum value
    var startConstraint = 0;
    // The amount the slider can move (in pxels) from the start to the maximum value    
    // Note: I added 5 for the width of the guide, to fix a bug where 100 can't be reached.
    var endConstraint = 210; // this is the width of the background bitmap 

    var dbg = function () { return sim.getDebug(); };
    var utils = function () { return sim.getUtils(); };
    var simMgr = function () { return sim.getSimulationManager(); };
    var scoringTable = function () { return sim.getScoringTable(); }; // get scoring table instance
    var keyboardInput = function () { return sim.getKeyboardInput(); };  // get keyboard input instance
    var simDocument = function () { return sim.getSimDocument(); };

    if (sim) {
        this.setPanel(panel);
        this.setSection(theSection);
    }

    this.setHTMLId = function (newHTMLId) {
        HTMLId = newHTMLId;
    };

    this.getHTMLId = function () {
        return HTMLId;
    };

    this.setTextAreaId = function (newTextAreaId) {
        textAreaId = newTextAreaId;
    };

    this.getTextAreaId = function () {
        return textAreaId;
    };

    this.getSetValues = function () {
        return setValues;
    };

    this.setSetValues = function (newSetValues) {
        setValues = newSetValues;
        return this;
    };

    this.getSliderBackgroundImage = function () {
        return sliderBackgroundImage;
    };

    this.setSliderBackgroundImage = function (newSliderBackgroundImage) {
        sliderBackgroundImage = newSliderBackgroundImage;
        return this;
    };

    this.getSliderImage = function () {
        return 'Scripts/Simulator/renderer/images/slider_thumb.png';
    };

    this.setSliderImage = function (newSliderImage) {
        sliderImage = newSliderImage;
        return this;
    };

    this.getOrientation = function () {
        return orientation;
    };

    this.setOrientation = function (newOrientation) {
        orientation = newOrientation;
        return this;
    };

    this.getReportMovement = function () {
        return reportMovement;
    };

    this.setReportMovement = function (newReportMovement) {
        reportMovement = newReportMovement == 'yes' ? true : false;
        return this;
    };

    this.handleEvent = function (event) {
        switch (event.type) {
            case 'inputReq':
                this.recordInput(this);
                break;
            case 'info':
                switch (event.context) {
                    case 'sliderValue':
                        this.setData(this.getModifiedValue(event.data.toString()));
                        this.onChange(this.getNodeID());
                        break;
                    case 'simulatorStateChange':

                        break;
                }
            default:
                dbg().logWarning(source, 'Unhandled event type received: ' + event.toString());
                return;
        }

    };

    this.keyboardNavigateTo = function (elementID, itemID, index) {
        if (this.getTextAreaId()) {
            var element = simDocument().getElementById(this.getTextAreaId());
            if (element) {
                var className = element.getAttribute('class');
                className = className + ' ' + 'simAreaFocus';
                element.setAttribute('class', className);
                element.focus();
            }
        }
    };

    this.keyboardNavigateAwayFrom = function (elementID, itemID, index) {
        if (this.getTextAreaId()) {
            var element = simDocument().getElementById(this.getTextAreaId());
            if (element) {
                // remove "simAreaFocus" from the list of classes for this element
                var className = element.getAttribute('class');
                var index = className.indexOf('simAreaFocus');
                if (index > 0)
                    className = className.substring(0, index - 1);
                element.setAttribute('class', className);
                element.blur();
            }
        }
    };

    this.recordKeyboardSelection = function (elementID, itemID, itemIndex) {
        /* if (theSlider != null) {
        RecordChange(theSlider);
        } */
        if ((this.getTextAreaId()) && (theSlider != null)) {
            var element = simDocument().getElementById(this.getTextAreaId());
            // this.setData(element.value);
            if (element) {
                var currentValue = element.value;
                if (!isNaN(currentValue)) {
                    // currentValue = Math.round(currentValue);
                    var actualValue = theSlider.jsSlider.getMinValue() - 0;
                    theSlider.setValue(actualValue + (currentValue / theSlider.scaleFactor));
                    RecordChange(theSlider);
                }
                // remove "simAreaFocus" from the list of classes for this element
                /*var className = element.getAttribute('class');
                var index = className.indexOf('simAreaFocus');
                if (index > 0)
                className = className.substring(0,index - 1);
                element.setAttribute('class', className);*/
                // this.setSelectStateViaKeyboard(elementID, itemID);
                // this.onChange(elementID);
                element.blur();
            }
        }
    };

    this.disableInput = function () {
        var element = simDocument().getElementById(this.getNodeID() + 'sliderHolder');
        element.disabled = true;
        var txtField = simDocument().getElementById(this.getNodeID() + 'slider-value');
        txtField.disabled = true;
        this.setState('disabled');
        if (this.mySlider) {
            this.mySlider.lock();
        }
    };

    this.enableInput = function () {
        var element = simDocument().getElementById(this.getNodeID() + 'sliderHolder');
        element.disabled = false;
        var txtField = simDocument().getElementById(this.getNodeID() + 'slider-value');
        txtField.disabled = false;
        this.setState('enabled');
        if (this.mySlider) {
            this.mySlider.unlock();
        }
    };

    this.render = function () {
        var panelHtml = container;
        var labelledByID = this.getSectionID(); // default aria-labelledby to containing section (WCAG) 
        
        // Create the container for the entire slider apparatus
        var holderDiv = simDocument().createElement('div');
        holderDiv.id = this.getNodeID() + 'sliderHolder';
        if (this.getOrientation() == 'horizontal') holderDiv.setAttribute('class', 'slider sliderHorizontal');
        else holderDiv.setAttribute('class', 'slider sliderVertical');
        holderDiv.setAttribute('role', 'group'); // WCAG

        if (theSection.getSectionSettings().elementorientation === "horizontal") {
            holderDiv.classList.add("inputpanelcell");
        }

        // The value and text decorations of this slider
        var label = '';
        if (sim.getSpeechEnabled()) {
            label = this.getSpeechLabel();  // if there is a speechLabel defined in the xml use that
            if (!label) {
                label = this.getLabel();
                if (!label) label = Simulator.Constants.SPEECH_LABEL_PREFIX + label;  // else use the element's label if there is one
                else {
                    label = Section.GetCurrentSectionLabel();
                    if (!label) label = Simulator.Constants.SPEECH_LABEL_PREFIX + label;   // else if there is label for the enclosing section
                    else {
                        dbg().logFatalError(source, 'Item is speech enabled but no speechLabel, element label, or enclosing section label is specified for ' + this.getName());
                        return;
                    }
                }
            }
        }
        else {
            label = this.getLabel();
            if (!label) {
                label = ' ';
            } else {
                label = label + ':';
            }
        }
        var labelElem = simDocument().createElement('span');
        labelElem.innerHTML = label;
        if (this.getLabel()) {
            var labelID = this.createLabelID();
            labelElem.id = labelID; // ID for WCAG
            labelledByID = labelledByID + ' ' + labelID; // if there is an element label, add to the aria-laballedby attribute (WCAG)
            labelElem.setAttribute('aria-label', this.getLabel()); // WCAG (don't read colon)
        }

        // This is the text field for the converted slider value
        var txtAreaDiv = simDocument().createElement('div');
        txtAreaDiv.setAttribute('class', 'slider-label-area');
        var txtAreaInput = simDocument().createElement('input');
        txtAreaInput.id = this.getNodeID() + 'slider-value';
        this.txtAreaId = txtAreaInput.id;
        this.setTextAreaId(txtAreaInput.id);
        txtAreaInput.type = 'text';
        txtAreaInput.size = utils().getNumberLength(this.getMaxValue());
        txtAreaInput.maxlength = txtAreaInput.size;
        txtAreaInput.autocomplete = 'off';
        txtAreaInput.value = this.getDefaultValue();
        txtAreaInput.setAttribute('class', 'slider-text-area');

        txtAreaInput.setAttribute('aria-labelledby', labelledByID);  // WCAG

        utils().bindEvent(txtAreaInput, 'change', function () {
            var currentValue = txtAreaInput.value;
            if (!isNaN(currentValue)) {
                // currentValue = Math.round(currentValue);
                var actualValue = theSlider.jsSlider.getMinValue() - 0;
                theSlider.setValue(actualValue + Math.round(currentValue / theSlider.scaleFactor));
                RecordChange(theSlider);
            }
        });

        utils().bindEvent(txtAreaInput, 'keypress', function (event) {
            var key = event.keyCode;
            // check if the "enter" key is pressed
            if (key == 13) {
                var currentValue = txtAreaInput.value;
                if (!isNaN(currentValue)) {
                    // currentValue = Math.round(currentValue);
                    var actualValue = theSlider.jsSlider.getMinValue() - 0;
                    theSlider.setValue(actualValue + Math.round(currentValue / theSlider.scaleFactor));
                    RecordChange(theSlider);
                }
            } else {
                var validKey = that.onKeyPressHandler(event);
                if (!validKey) {
                    if (event.preventDefault) {
                        event.preventDefault();
                    } else {
                        event.returnValue = false;
                    }
                }
            }
        });

        // label the value with UoM
        var txtAreaUM = null;
        if (this.getUnits()) {
            txtAreaUM = simDocument().createElement('label');
            txtAreaUM.setAttribute('for', txtAreaInput.id);
            txtAreaUM.innerHTML = this.getUnits();

            var unitsID = this.createUnitsID();
            txtAreaUM.id = unitsID; // WCAG
            txtAreaInput.setAttribute('aria-describedby', unitsID);  // WCAG
        }

        // Register the element items for keyboard input
        if (this.isFocusable()) keyboardInput().addFocusableElementItem(this, this.getNodeID(), txtAreaInput.id);

        // The min-max labels for the slider 
        var minMaxDiv = simDocument().createElement('div');
        minMaxDiv.setAttribute('class', 'slider-min-max');
        var minValSpan = simDocument().createElement('span');
        minMaxDiv.appendChild(minValSpan);
        minValSpan.innerHTML = this.getMinValue() + '  ';
        minValSpan.setAttribute('class', 'yui-slider-min');
        minValSpan.setAttribute('role', 'presentation'); // WCAG
        var maxValSpan = simDocument().createElement('span');
        minMaxDiv.appendChild(maxValSpan);
        maxValSpan.setAttribute('class', 'yui-slider-max');
        maxValSpan.setAttribute('role', 'presentation'); // WCAG
        maxValSpan.innerHTML = '  ' + this.getMaxValue();

        var image = this.getImage();
        var imageDiv = null;
        if (image != null && image != undefined) {
            imageDiv = simDocument().createElement('div');
            imageDiv.setAttribute('class', 'slider withImages');
            imageDiv.setAttribute('id', this.getName());

            var imageHolder = simDocument().createElement('span');
            imageHolder.setAttribute('class', 'holderImage');

            var imageElement = simDocument().createElement('img');
            imageElement.setAttribute('src', image);

            imageHolder.appendChild(imageElement);
            imageDiv.appendChild(imageHolder);
        }


        // This is the element that should contain background 
        var bgDivId = this.getNodeID() + 'DivBG';
        var sliderDiv = simDocument().createElement('div');
        sliderDiv.id = bgDivId;
        sliderDiv.setAttribute('class', 'yui-h-slider');
        sliderDiv.tabindex = '-1';
        sliderDiv.title = 'Slider';

        // Now make the thumbnail
        this.setHTMLId(sliderDiv.id);
        var sliderThumbDiv = simDocument().createElement('div');
        var thumbDivId = this.getNodeID() + 'ThumbDiv';
        sliderThumbDiv.id = thumbDivId;

        // thumb image is part of yui-slider-thumb.  So no need to add image tag.
        sliderThumbDiv.setAttribute("class", "yui-slider-thumb");

        sliderThumbDiv.setAttribute('class', 'yui-slider-thumb');
        
        sliderThumbDiv.setAttribute('aria-labelledby', labelledByID);  // WCAG
        sliderThumbDiv.setAttribute('aria-valuenow', this.getDefaultValue()); // WCAG
        sliderThumbDiv.setAttribute('aria-valuemax', this.getMaxValue()); // WCAG
        sliderThumbDiv.setAttribute('aria-valuemin', this.getMinValue()); // WCAG
        sliderThumbDiv.setAttribute('role', 'slider'); // WCAG
        sliderThumbDiv.setAttribute('tabindex', 0); // (hopefully) force focus on separate options (WCAG)

        //		 var sliderThumbImg = simDocument().createElement('img');
        //		 sliderThumbImg.src = this.getSliderImage();
        //		 var sliderBGImg = simDocument().createElement('img');
        //		 sliderBGImg.src = this.getSliderBackgroundImage();

        // Now insert the elements.  We want 3 rows: one for text and one for 
        //   min/max values, one for slider itself.
        panelHtml.appendChild(holderDiv);
        //		sliderThumbDiv.appendChild(sliderThumbImg);
        txtAreaDiv.appendChild(labelElem);
        txtAreaDiv.appendChild(txtAreaInput);
        if (txtAreaUM) {
            txtAreaDiv.appendChild(txtAreaUM);
        }
        // sliderDiv.appendChild(sliderBGImg);  we use CSS to do this....
        sliderDiv.appendChild(sliderThumbDiv);

        holderDiv.appendChild(txtAreaDiv);
        holderDiv.appendChild(minMaxDiv);
        holderDiv.appendChild(sliderDiv);
        if (imageDiv != null) {
            holderDiv.appendChild(imageDiv);
        }


        // Store things we will need during event handling
        this.sliderDiv = sliderDiv.id;
        this.sliderThumbDiv = sliderThumbDiv.id;
        this.startConstraint = startConstraint;
        this.endConstraint = endConstraint;
        this.sliderDivId = sliderDiv.id;
        this.sliderThumbDivId = sliderThumbDiv.id;

        // defer YUI binding until container is complete
        sim.getSliderPreRenderQueue().add(this);

        // Store the default values on the whiteboard.  We need to do this in case someone tries to run the simulation
        // before the slider has been moved for the first time.
        this.recordInput(this, true);
        this.setPrevValue(this.getDefaultValue());
        this.mapHTML2JS(holderDiv);
    };

    this.onKeyPressHandler = function (event) {
        var char = null, match = null;
        if (event.which == null) {
            char = String.fromCharCode(event.keyCode);    // old IE
            //console.log(source, 'Key Pressed :' + char);
        }
        else if (event.which != 0 && event.charCode != 0) {
            char = String.fromCharCode(event.which);   // All others
            //console.log(source, 'Key Pressed :' + char);
        }
        else {
            //console.log(source, 'Key Pressed : Special Key');
            return true;
        }
        match = char.match(/[0-9]/);
        return !!match;
    };

    /*
    * Override the superclass's implementation since sliders use a 
    * variation on the element - HTML element mapping scheme
    */
    this.getHTMLElement = function (id) {
        return simDocument().getElementById(this.getNodeID() + 'DivBG');  // Default action is to use the standard mapping scheme
    };



    this.getHTMLSlider = function () {
        return theSlider;
    };

    this.setFocusable(true, true);

    // if(this.isFocusable()) keyboardInput.addFocusableElementItem(this, this.getNodeID(), txtAreaID);  // Register the element items for keyboard input

    // YUI has issue with creating YUI element before container is rendered, so do it now.
    this.postContainerRender = function () {

        // Normalize the size of the increment to the width of the bitmap.
        var inc = this.getIncrement();
        var scaleFactor = (this.getMaxValue() - this.getMinValue()) / endConstraint;
        inc = inc / scaleFactor;

        // squirrel away scale for conversion on silder events
        this.scaleFactor = scaleFactor;

        if (this.getOrientation() == 'horizontal') {
            theSlider = YAHOO.widget.Slider.getHorizSlider(this.sliderDivId,
					this.sliderThumbDivId, startConstraint, endConstraint, inc);
        } else {
            theSlider = YAHOO.widget.Slider.getVertSlider(this.sliderDivId,
					this.sliderThumbDivId, startConstraint, endConstraint, inc);
        }

        this.mySlider = theSlider;
        this.prevValue = this.getDefaultValue();

        // WCAG - set the keyIncrement (the 'step' used by the keyboard arrow keys) to inc (the quantization enforced when using mouse)
        // this ensures same functionality when dragging slider with mouse or changing value with keyboard
        theSlider.keyIncrement = inc;

        theSlider.setValue(Math.abs(this.getDefaultValue() - this.getMinValue()) / scaleFactor, false, true, true);
        theSlider.valTxtField = this.txtAreaInput;
        theSlider.jsSlider = this;
        theSlider.scaleFactor = this.scaleFactor;

        theSlider.subscribe('change', function () { RecordChange(theSlider); });

        theSlider.subscribe('slideEnd', function () { SliderEnd(theSlider); });

        theSlider.animate = false;

        var id = this.txtAreaId;
        var node = simDocument().getElementById(id);
        node.value = this.getDefaultValue();
    };

    this.setAttributes = function (attr, node) {
        if (node) attr = utils().getAttributes(node);
        Simulator.Input.SimSlider.prototype.setAttributes.call(this, attr, node);
        for (var i in attr) {
            switch (i) {
                case 'orientation':
                    this.setOrientation(attr[i]);
                    break;
                case 'sliderBackgroundImage':
                    this.setSliderBackgroundImage(attr[i]);
                    break;
                case 'sliderImage':
                    this.setSliderImage(attr[i]);
                    break;
                case 'imagePath':
                    this.setSliderImagePath(attr[i]);
                    break;
                case 'multModifier':
                    this.setMultModifier(attr[i]);
                    break;
                case 'addModifier':
                    this.setAddModifier(attr[i]);
                    break;
                case 'valueModifier':
                    this.setValueModifier(attr[i]);
                    break;
                case 'reportMovement':
                    this.setReportMovement(attr[i]);
                    break;

            }
        }
        if (this.getScoreable()) scoringTable().addElement(this.getName(), 'input');
        //this.setOptions();
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

    // Try to make slider location end up on 'increment' boundary
    var SSFixRoundError = function (val, inc) {
        if (inc) {
            var rem = val % inc;
            if (rem) {
                val = val + (inc - rem);
            }
        }
        return val;
    };

    var RecordChange = function (slider) {
        // use the scale factor to convert the pixel offset into actual value
        var jsSlider = slider.jsSlider;
        var actualValue = Math.round(slider.getValue());
        actualValue = actualValue * slider.scaleFactor;
        if (actualValue < 0)
            actualValue = 0;
        var offset = jsSlider.getMinValue() - 0; // convert to num from string

        actualValue = actualValue + offset;

        actualValue = SSFixRoundError(actualValue, jsSlider.getIncrement());

        var id = jsSlider.txtAreaId;
        var node = simDocument().getElementById(id);
        node.value = actualValue;
        var sliderNode = simDocument().getElementById(jsSlider.sliderThumbDivId);
        sliderNode.setAttribute('aria-valuenow', actualValue); // WCAG
        if (jsSlider.getReportMovement()) {
            jsSlider.setData(actualValue);  // coerce the value to a string
            jsSlider.recordInput(jsSlider);
            instance.onChange(jsSlider.getNodeID());
        }
    };

    var SliderEnd = function (slider) {
        var jsSlider = slider.jsSlider;
        var actualValue = Math.round(slider.getValue() * slider.scaleFactor);
        if (actualValue < 0)
            actualValue = 0;
        var offset = slider.jsSlider.getMinValue() - 0; // convert to num from string

        actualValue = actualValue + offset;

        actualValue = SSFixRoundError(actualValue, jsSlider.getIncrement());

        var id = jsSlider.txtAreaId;
        var node = simDocument().getElementById(id);
        node.value = actualValue;
        if (jsSlider.prevValue != actualValue) {
            jsSlider.setData(jsSlider.getModifiedValue(actualValue) + '');  // coerce the value to a string
            jsSlider.recordInput(jsSlider);
            instance.onChange(jsSlider.getNodeID());
            jsSlider.prevValue = actualValue;
        }
    };

    this.setElementSelectState = function(state, contents) {
        var value = parseFloat(contents);
        if(value >= this.getMinValue() && value <= this.getMaxValue() && value % this.getIncrement() == 0) {
            this.setData(contents);
            this.setDefaultValue(contents);
            setHTMLValue(this.getNodeID(), this.getData());
            this.recordInput(this, true);
        }
    };

    var setHTMLValue = function(id, value) {
        var htmlElement = simDocument().getElementById(id);
        if (!htmlElement) htmlElement = simDocument().getElementById(id + 'slider-value'); // for textfield in sliders
        if (htmlElement) htmlElement.value = value;
        // reposition the slider bar according to the value
        if (!isNaN(value)) {
            var actualValue = theSlider.jsSlider.getMinValue() - 0;
            theSlider.setValue(actualValue + Math.round(value / theSlider.scaleFactor));
            RecordChange(theSlider);
        }
    };

    // Convenience function for the most frequently used Debug methods
    var debug = function (str1, str2, trace) {
        dbg().debug(source, str1, str2, trace);
    };

    var debugf = function (str1, str2, trace) {
        dbg().debugf(source, str1, str2, trace);
    };
}

//Inherit methods and class variables
Simulator.Input.SimSlider.prototype = new Simulator.Input.FieldSet();
Simulator.Input.SimSlider.parent = Simulator.Input.FieldSet;
Simulator.Input.SimSlider.prototype.constructor = Simulator.Input.SimSlider; // Reset the prototype to point to


 




