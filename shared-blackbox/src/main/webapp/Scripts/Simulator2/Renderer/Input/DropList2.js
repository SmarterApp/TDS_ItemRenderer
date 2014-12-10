
/**
 * *****************************************************************************
 * @class DropList 
 * @superclass GroupList
 * @param sim - The Simulator instance
 * @return - instance of a DropList
 *******************************************************************************
 */
Simulator.Input.DropList = function (sim, node, panel, theSection, container) {

    Simulator.Input.GroupList.call(this, sim); // Inherit Instance variables
    var dbg = function() { return sim.getDebug(); };
    var utils = function() { return sim.getUtils(); };
    var keyboardInput = function () { return sim.getKeyboardInput(); };
    var scoringTable = function () { return sim.getScoringTable(); };
    var simMgr = function () { return sim.getSimulationManager(); };
    var simDocument = function () { return sim.getSimDocument(); };
    var transDictionary = function () { return sim.getTranslationDictionary(); };
    
    var instance = this;
    var selectType = 'single'; // Instance Variable declaration format
    var listExpanded = false;   // indicate whether the list is being expanded
    
    if(sim) {
        this.setPanel(panel);
        this.setSection(theSection);
    }

    this.getSelectType = function() {
        return selectType;
    };
    
    this.getElementData = function(id) {
        
    };
    
    this.getKeyboardInput = function() {
    	return keyboardInput();
    };
    
    this.setSelectType = function(newSelectType) {
        selectType = newSelectType;
        return this;
    };
    
    this.getListExpanded = function() {
    	return listExpanded;
    };
    
    this.getData = function(inputScope) {
        var data = [];
        var proxy = null;
        var select = simDocument().getElementById(this.getNodeID());
        var value = select.value;
        this.setData(value);
        if(inputScope == 'dataInput') proxy = this.getDataProxy(select.selectedIndex);
        else if(inputScope == 'animationInput') proxy = this.getAnimationProxy(select.selectedIndex);
        else if(inputScope == 'evaluationInput') proxy = this.getEvaluationProxy(select.selectedIndex);
        if(proxy != undefined && proxy != null) data[0] = proxy;
        else data[0] = value;
        
        return data;
    };
    
    this.handleEvent = function(event) {
        switch (event.type) {
        case 'inputReq':
            this.recordInput(this);
            break;        
        case 'info':
            switch(event.context) {
            case 'simulatorStateChange':
                    
                break;
            }
            break;
        default:
            dbg().logWarning(source, 'Unhandled event type received: ' + event.toString());
            return;
        }
        
    };
    
    this.setElementSelectState = function(state, contents) {
        var items = this.getItems();
        var proxy = null;
        var value = null;
        for(var i = 0; i < items.length; i++) {
            proxy = items[i].lookup('dataProxy');
            if(proxy) value = proxy;
            else value = items[i].lookup('val');
            var htmlElement = simDocument().getElementById(items[i].itemID);
            if(state == 'true') {
                if(value == contents) {
                    items[i].setValue('selected', 'selected');
                    selectedItem = value;  // selectedItem defined in the superclass
                    htmlElement.selected = true;
                    this.recordInput(this, true);
                }
                else if(items[i].lookup('selected') == 'selected') htmlElement.removeAttribute('selected'); //items[i].removeAttribute('selected');
            } else {
                if(value == contents && items[i].lookup('selected') == 'selected') htmlElement.removeAttribute('selected'); //items[i].removeAttribute('selected');
            }
        }
    };
    
    this.receivedSpeechFocus = function() {
        debug(this.getName() + ' received speech focus');
        var element = simDocument().getElementById(this.getNodeID());
        var node = simDocument().getElementById(Simulator.Constants.INPUT_PANEL_NAME);
        var outline = simDocument().getElementById('dropHolder' + this.getName());
        if(outline) outline.setAttribute('class', 'dropHolder simAreaFocus');
        outline.size = this.getItems().length;
        element.size = this.getItems().length;
        node = simDocument().getElementById(this.getName());
        node.style.border='thin solid #ff0000';
    };
    
    this.speechActivated = function(value) {        
        this.setSelectStateViaSpeech(this.getNodeID(), value);
        InputElement.onChange(this.getNodeID());
    };
    
    this.removeSpeechFocus = function() {
        debug(this.getName() + ' lost speech focus');
        var element = simDocument().getElementById(this.getNodeID());
        element.size = 1;
        var node = simDocument().getElementById(Simulator.Constants.INPUT_PANEL_NAME);
        var element = getElementsByClassName('dropHolder', node)[0];
        node = simDocument().getElementById(this.getName());
        node.style.border='none';
        if(element) element.setAttribute('class', 'dropHolder');        
    };
    
    this.keyboardNavigateTo = function(elementID, itemID, index) {
        var element = simDocument().getElementById(elementID);
		// var node = simDocument().getElementById("inputPanel");
		// var outline = getElementsByClassName("dropHolder", node)[0];
		var outline = element.parentNode; // fixed
		// element.selectedIndex = index;					
		if(outline) outline.setAttribute("class", "dropHolder simAreaFocus");
		var item = null;
		item = simDocument().getElementById(itemID);
		if (item) {
			item.setAttribute("focused", "focused");
		}
		// expand the droplist
		if (!listExpanded) {
			this.expandList();
			listExpanded = true;
		}
    };
    
    this.keyboardNavigateAwayFrom = function(elementID, itemID, index) {
		// var node = simDocument().getElementById("inputPanel");
		var element = simDocument().getElementById(elementID);
		// var element = getElementsByClassName("dropHolder", node)[0];
		var outline = element.parentNode; // fixed
		if(outline) outline.setAttribute("class", "dropHolder");
		var item = null;
		item = simDocument().getElementById(itemID);
		if (item) {
			item.setAttribute("focused", "");
		}
		// close the droplist
		if (listExpanded) {
			this.closeList();
		    listExpanded = false;
		}		
    };
    
    this.disableInput = function() {
        this.disableItems();
    };
    
    this.enableInput = function() {
        this.enableItems();
    };
	// expand the drop list
	this.expandList = function() {
		var dlist = simDocument().getElementById(this.getNodeID());
		// add a new span element as grandparent of the current select element
		var newspan = simDocument().createElement('span');
		newspan.setAttribute('id', "selectholderspan");
		newspan.setAttribute('class', "selectHolder selectOpened");
		dlist.parentNode.parentNode.appendChild(newspan);
		newspan.appendChild(dlist.parentNode);
		// set the height of the dropdown list as well as the number of visible item on the list once expanded,
		/* if (this.getItems().length >= 5) {
			dlist.setAttribute('size', 5);
			dlist.style.height = '7em';
		}
		else { */
		dlist.setAttribute('size', this.getItems().length);
		var visibleHeight = 1.2 * this.getItems().length;
		dlist.style.height = visibleHeight.toString() + 'em';
		// }
		// add the event to the div container to close the droplist after mouse click on the item page
		var container = simDocument().getElementById(Simulator.Constants.SIM_CONTAINER_NAME + sim.getSimID());
		if (container) {
		    utils().bindEvent(container, 'click', function () {
	            if ((instance) && (instance.getListExpanded())) {
	            	// instance.getinstance.closeList();
	            	instance.getKeyboardInput().closeDropList();
	            }
	        });
		}
	};
	// close the droplist to return to its original state
	this.closeList = function() {
    
		// reset the height and number of visible items of the droplist
		var dlist = simDocument().getElementById(this.getNodeID());
		dlist.style.height = "";
		dlist.setAttribute('size', 0);
		// remove the span element that was created when the list was expanded
		var spanRemoved = dlist.parentNode.parentNode;
		spanRemoved.parentNode.appendChild(dlist.parentNode);
		spanRemoved.parentNode.removeChild(spanRemoved);

	};
	this.recordKeyboardSelection = function(elementID, itemID, itemIndex) {
		var element = null;
		var item = null;
		if((itemID) && (elementID)) {
			item = simDocument().getElementById(itemID);
			element = simDocument().getElementById(elementID);
			if(!item) {
				if(element) item = element.getElementsByClassName(itemID)[0];
			}
			if(item) {
				// de-select previously selected option item
				if ((element.selectedIndex != null) && (element.selectedIndex >= 0))
					element.options[element.selectedIndex].setAttribute("selected", "");					
				item.selected = true;
				item.setAttribute("selected", "selected");
				if (element)
					element.selectedIndex = itemIndex;
				this.setSelectStateViaKeyboard(elementID, itemID);
				this.onChange(elementID);
			}
		}
		if (listExpanded) {
			this.closeList();
			listExpanded = false;
		}
	};

	this.setAttributes = function(attr, node) {
        Simulator.Input.DropList.prototype.setAttributes.call(this, attr);
        for ( var i in attr) {
            switch (i) {
            case 'selectType':
                this.setSelectType(attr[i]);
                break;
            }
        }
        if(instance.getScoreable()) scoringTable().addElement(instance.getName(), 'input');
        this.setItems(node);
    };
    
    this.doOnChange = function() {
        // alert('Got it');
        instance.onChange(instance.getNodeID());
    };

    this.render = function() {
        var items = this.getItems();
        var itemID = null;
        var labelledByID = this.getSectionID(); // default aria-labelledby to containing section (WCAG) 
        
        this.setFocusable(true, true); // Don't set the element itself to accept keyboard input
        var image = this.getImage();
        if (image != undefined && image != null) {
            var dropDiv = simDocument().createElement('div');
            dropDiv.setAttribute('class', 'dropDown withImages');
            dropDiv.id = this.getName();
            var holderSpan = simDocument().createElement('span');
            holderSpan.setAttribute('class', 'holderImage');
            dropDiv.appendChild(holderSpan);
            var img = simDocument().createElement('img');
            img.src = image;
            img.alt = this.getName() + ' image';
            holderSpan.appendChild(img);
            dropDiv.appendChild(holderSpan);
        }
        else {
            var dropDiv = simDocument().createElement('div');
            dropDiv.setAttribute('class', 'dropDown');
            dropDiv.id = this.getName();            
        }
        var form = simDocument().createElement('form');
        dropDiv.appendChild(form);
        form.name = this.getName();
        var formSpan = simDocument().createElement('span');
        formSpan.setAttribute('class', 'dropHolder');
        formSpan.id = 'dropHolder' + this.getName();
        form.appendChild(formSpan);
        
/*        if(simMgr().getSpeechEnabled()) {
            var label = this.getSpeechLabel();  // if there is a speechLabel defined in the xml use that
            if(!label) {
                label = this.getLabel();
                if(!label)  {
                    label = Section.GetCurrentSectionLabel();
                    if(!label) {
                        dbg().logFatalError(source, 'Item is speech enabled but no speechLabel, element label, or enclosing section label is specified for ' + this.getName(), true);
                        return;
                    }
                }
            }
            buff.push(SimElement.SPEECH_LABEL_PREFIX + label); buff.push('<br>');
        }
        else if(this.getLabel()) {
*/      if(this.getLabel()) {   // TESTING ONLY - UNCOMMENT ABOVE LINE AND REMOVE THIS ONE AFTER TESTING
            var labelSpan = simDocument().createElement('span');
            labelSpan.style.padding.top = '15px'; 
            labelSpan.style.padding.top = '15px';
            // labelSpan.label = this.getLabel();
            labelSpan.innerHTML = this.getLabel();
            var labelSpanID = this.createLabelID();
            labelSpan.id = labelSpanID; // ID for WCAG
            labelledByID = labelledByID + ' ' + labelSpanID; // if there is an element label, add to the aria-laballedby attribute (WCAG)
            formSpan.appendChild(labelSpan);
        }
        var select = simDocument().createElement('select');
        select.id = this.getNodeID();
        select.setAttribute('aria-labelledby', labelledByID); // WCAG
        // select.innerHTML =  + this.getName(); // not sure what this was doing... it's broken anyway
        var item = null;
        for ( var x = 0; x < items.length; x++) {
            var itemIDReset = x == 0 ? true : false;
            itemID = this.createItemID(itemIDReset);
            items[x]['itemID'] = itemID;
            if ((items[x]).lookup('val') != undefined) {
                item = simDocument().createElement('option');
                item.id = itemID;
                item.value = (items[x]).lookup('val');
            }
            if(items[x].lookup('default') == 'yes') item.selected = 'selected';
            // retrieve translated text
            var innerHTMLtag = (items[x]).lookup('val');
            item.innerHTML = transDictionary().translate(innerHTMLtag);
            select.appendChild(item);
            // Register the element items for keyboard input
            if(this.isFocusable()) {
            	keyboardInput().addFocusableElementItem(this, this.getNodeID(), itemID);
            }
        }
        formSpan.appendChild(select);
        var arrowSpan = simDocument().createElement('span');
        arrowSpan.setAttribute('class', 'dropArrow');
        formSpan.appendChild(arrowSpan);
        htmlPanel = container;
        if (theSection.getSectionSettings().elementorientation === "horizontal") {
            dropDiv.classList.add("inputpanelcell");
        }
        htmlPanel.appendChild(dropDiv);
        var dropList = simDocument().getElementById(this.getNodeID());
        if(instance.getSaveOnChange()) 
            utils().bindEvent(dropList, 'change', function() {
                instance.doOnChange();
                }); 
         utils().appendBlankVertcalSpace(simDocument().getElementById(panel.getNodeID()), 2);
        this.setDefaultSelections();
        this.mapHTML2JS(dropList);
    };
    
    this.getSourceName = function() {
        return source;
    };

    this.inspect = function(embedded, forced) {
        var buff = [];
        var sep = '\n\n';
        if(!embedded) {
            buff.push('Inspecting ');
            buff.push(this.getName());
            buff.push(sep);
        }
        for ( var i in this) {
            if (i == 'items') {
                buff.push(this.parent.inspect());
            } else {
                if (i.substr(0, 3) == 'get') {
                    buff.push(i);
                    buff.push(' = ');
                    buff.push(eval('this.' + i + '()'));
                    buff.push(sep);
                }
            }
        }
        if(!embedded) forced === true ? dbg().debugf(buff.join('')) : dbg().debug(buff.join(''));
        else return buff.join('');
    };

    // Convenience function for the most frequently used Debug methods
    function debug(str1, str2, trace) {
        dbg().debug(source, str1, str2, trace);
    }

    function debugf(str1, str2, trace) {
        dbg().debugf(source, str1, str2, trace);
    }
};

// Inherit methods and class variables
Simulator.Input.DropList.prototype = new Simulator.Input.GroupList();
Simulator.Input.DropList.prototype.constructor = Simulator.Input.DropList; // Reset the prototype to point to

