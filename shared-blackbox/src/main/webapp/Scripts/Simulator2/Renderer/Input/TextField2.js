//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************

/**
 * *****************************************************************************
 * @class TextField 
 * @superclass InputElement
 * @param sim - The Simulator instance
 * @param node -
 * @param panel - 
 * @return - instance of a TextField
 *******************************************************************************
 */
Simulator.Input.TextField = function(sim, node, panel, theSection, container) {

	Simulator.Input.InputElement.call(this, sim); // Inherit Instance variables

	// Instance variables
    var that = this;	
	var source = 'TextField';
    var userEditable = true;
    var prevStyle = {};  
    var displayLabel = true;
    var text = '';
    var typeInputAllowed = 'textOnly';
    var fieldLength = 7; 
    var textCache = '';

    var dbg = function() { return sim.getDebug(); };
    var utils = function() { return sim.getUtils(); };
    var eventMgr = function () { return sim.getEventManager(); };
    var simDocument = function () { return sim.getSimDocument(); };
    var keyboardInput = function () { return sim.getKeyboardInput(); };
    var transDictionary = function () { return sim.getTranslationDictionary(); };


    var scoringTable = function () { return sim.getScoringTable(); }; // get scoring table instance
    
    if(sim) {
        this.setPanel(panel);
        this.setSection(theSection);
    }

    eventMgr().registerEvent(new Simulator.Event(this, 'info', 'animationThreadFinished'), 'to');

    this.getUserEditable = function () {
        return userEditable;
    };

    this.setUserEditable = function (newUserEditable) {
        userEditable = newUserEditable == 'yes' ? true : false;
        return this;
    };

    this.getDisplayLabel = function () {
        return displayLabel;
    };

    this.setDisplayLabel = function (newDisplayLabel) {
        displayLabel = newDisplayLabel == 'yes' ? true : false;
        return this;
    };

    this.getText = function () {
        // retrieve translated text
        return transDictionary().translate(text);
    }; 

    this.setText = function (newText) {
        text = newText;
        this.setData(newText);
        return this;
    };

    this.setTypeInputAllowed = function (typeInput) {
        typeInputAllowed = typeInput;
    };

    this.getTypeInputAllowed = function () {
        return typeInputAllowed;
    };

    this.getFieldLength = function () {
        return fieldLength;
    };

    this.setFieldLength = function (newLength) {
        fieldLength = parseInt(newLength);
        return this;
    };

    this.saveState = function (indent, preface, nameStr, valStr, suffix) {
        var data = this.getData();
        if (data != '') return indent + preface + nameStr + this.getName() + valStr + data + suffix;
        else return '';
    };

    this.setElementSelectState = function (state, contents) {
        this.setData(contents);
        this.recordInput(this, true);
    };

    this.disableInput = function () {
        var element = simDocument().getElementById(this.getNodeID());
        element.disabled = true;
        this.setState('disabled');
    };

    this.enableInput = function () {
        var element = simDocument().getElementById(this.getNodeID());
        element.disabled = false;
        this.setState('enabled');
    };

    this.setTextCache = function (cacheText) {
        textCache = cacheText;
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
                    case 'animationThreadFinished':
                        this.setData(textCache);
                        this.recordInput();
                        textCache = '';
                        //eventMgr().postEvent(new Simulator.Event(this, 'info', 'inputAvailable'));
                        break;
                }
                break;
            default:
                dbg().logWarning(source, 'Unhandled event type received: ' + event.toString());
                return;
        }

    };

    this.keyboardNavigateTo = function (elementID, itemID, index) {
        var element = simDocument().getElementById(elementID);
        if (element) {
            prevStyle.color = element.style.borderColor;
            prevStyle.width = element.style.borderWidth;
            prevStyle.style = element.style.borderStyle;
            element.style.borderStyle = 'solid';
            element.style.borderWidth = '2px';
            element.style.borderColor = '#FF9100';
        }
        element.focus();
    };

    this.keyboardNavigateAwayFrom = function (elementID, itemID, index) {
        var element = simDocument().getElementById(elementID);
        if (element) {
            element.style.borderStyle = prevStyle.style;
            element.style.borderWidth = prevStyle.width;
            element.style.borderColor = prevStyle.color;
            element.blur();
        }
    };

    this.recordKeyboardSelection = function (elementID, itemID, itemIndex) {
        var element = null;
        element = simDocument().getElementById(elementID);
        if (element) {
            element.style.borderStyle = prevStyle.style;
            element.style.borderWidth = prevStyle.width;
            element.style.borderColor = prevStyle.color;
            element.isSelected = true;
            this.setSelectStateViaKeyboard(elementID, itemID);
            this.onChange(elementID);
            element.blur();
        }
    };

    this.setAttributes = function (attr, node) {
        if (node) attr = utils().getAttributes(node);
        Simulator.Input.TextField.prototype.setAttributes.call(this, attr, node);
		for ( var i in attr) {
			try {	
				switch (i) {
				case 'initialText':
					this.setText(attr[i]);
					break;
				case 'userEditable':
					this.setUserEditable(attr[i]);
					break;
				case 'displayLabel':
					this.setDisplayLabel(attr[i]);
					break;
				case 'fieldLength':
					this.setFieldLength(attr[i]);
					break;
				case 'typeInputAllowed':
					this.setTypeInputAllowed(attr[i]);
					break;
				}
			} catch(err) {
				dbg().logError(source, 'Error occurred getting TextField attribute ' + i + ': ' + err.message);
			}
		}
		if(this.getScoreable()) {
			sim.getScoringTable().addElement(this.getName(), 'input');
		}
	};

	this.render = function() {		
		var nodeID = this.getNodeID();
		var panelHtml = container;
        var brElement1 = simDocument().createElement('br');
    	panelHtml.appendChild(brElement1);
    	var brElement2 = simDocument().createElement('br');
    	panelHtml.appendChild(brElement2);
    	
    	var divElement = simDocument().createElement('div');
    	divElement.setAttribute('class', 'textFieldWrapper withImages');
    	var image = this.getImage();
		if (image != null && image != undefined) {
			var spanElement1 = simDocument().createElement('span');
			spanElement1.setAttribute('class', 'holderImage');
			var imgElement = simDocument().createElement('img');
			imgElement.setAttribute('src', image);
			imgElement.setAttribute('alt', this.getName());
			spanElement1.appendChild(imgElement);
			divElement.appendChild(spanElement1);
		}
        var spanElement2 = simDocument().createElement('span');
        spanElement2.setAttribute('class', 'textFieldContainer');
        spanElement2.innerHTML = this.getLabel();
        var inputEl = simDocument().createElement('input');
        inputEl.setAttribute('type', 'text');
        inputEl.id = nodeID;
        inputEl.setAttribute('value', this.getText());
        inputEl.onkeydown = 'return false;';
        utils().bindEvent(inputEl, 'keypress', function (event) {
            var validKey = that.onKeyPressHandler(nodeID, event);
            if (!validKey) {
                if (event.preventDefault) {
                    event.preventDefault();
                } else {
                    event.returnValue = false;
                }
            }
        });
        utils().bindEvent(inputEl, 'change', function () {
            that.changeInValue(nodeID);
        });
        inputEl.setAttribute('size', this.getFieldLength());
        inputEl.setAttribute('maxlength', this.getFieldLength());
        spanElement2.appendChild(inputEl);
        divElement.appendChild(spanElement2);
        if (theSection.getSectionSettings().elementorientation === "horizontal") {
            divElement.classList.add("inputpanelcell");
        }
        panelHtml.appendChild(divElement);

        this.recordInput(this, true);  // true -> setting a default value

        this.setFocusable(true, true);
        if(this.isFocusable()) {
        	keyboardInput().addFocusableElementItem(this, nodeID);
        }
        this.mapHTML2JS(divElement);
	};
	
	this.changeInValue = function(id) {
		if(id) {
	        // var txtField = this.getHTMLElement(id);
			// var txtField = GetJSObjFromHTML(id);
			var htmlElement = simDocument().getElementById(id);
			// if(txtField) {
				this.setData(htmlElement.value);
				this.recordInput();
				// EventManager.postEvent(new Simulator.Event(txtField, 'info', 'inputAvailable'));
				eventMgr().postEvent(new Simulator.Event(this, 'info', 'inputAvailable', null, false));
			// }
		}
	};
	
	var numLockKeyCode = 144;
	var numLockPressed = false;
    this.onKeyPressHandler = function (id, event) {
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
		switch(this.getTypeInputAllowed()) {
		case 'alphaOnly':
                match = char.match(/[a-z\.]/i);
                return !!match;
                break;
            case 'numericOnly':
                match = char.match(/[0-9\.\+\-]/);
                return !!match;
			break;
		case 'alphaNumericOnly':
                match = char.match(/[a-z0-9\.\+\-]/i);
                return !!match;
			break;
		case 'textOnly':
                return true;
			break;
		default:
			return true;  // allow all characters
			break;
		}
	};
    
    this.getSourceName = function() {
        return source;
    };

	this.inspect = function(embedded, force) {
		var buff = [];
		var sep = '\n\n';
		if (!embedded) {
			buff.push('Inspecting ');
			buff.push(this.getName());
			buff.push(sep);
		}
		for ( var i in this) {
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
	
    // Convenience function for the most frequently used Debug methods
    var debug = function(str1, str2, trace) {
        dbg().debug(source, str1, str2, trace);
    };

    var debugf = function(str1, str2, trace) {
        dbg().debugf(source, str1, str2, trace);
    };
};

// Inherit methods and class variables
Simulator.Input.TextField.prototype = new Simulator.Input.InputElement();
Simulator.Input.TextField.parent = Simulator.Input.InputElement;
Simulator.Input.TextField.prototype.constructor = Simulator.Input.TextField; // Reset the prototype to point to the current class
