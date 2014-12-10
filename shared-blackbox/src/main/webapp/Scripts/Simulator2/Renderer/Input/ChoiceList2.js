/**
 * *****************************************************************************
 * @class ChoiceList 
 * @superclass GroupList
 * @param sim - The Simulator instance
 * @return - instance of a ChoiceList
 *******************************************************************************
 */
Simulator.Input.ChoiceList = function(sim, node, panel, theSection, container) {

    Simulator.Input.GroupList.call(this, sim); // Inherit Instance variables
    
    var that = this;
    var source = 'ChoiceList';
    var dbg = function() { return sim.getDebug(); };
    var utils = function() { return sim.getUtils(); };
    var simMgr = function() { return sim.getSimulationManager(); };
    var keyboardInput = function () { return sim.getKeyboardInput(); };  // get keyboard input instance
    var scoringTable = function () { return sim.getScoringTable(); }; // get scoring table instance
    var simDocument = function() { return sim.getSimDocument(); };
    var transDictionary = function () { return sim.getTranslationDictionary(); };

    if(sim) {
        this.setPanel(panel);
        this.setSection(theSection);
    }

    // Instance variables are all inherited

    this.formatEventData = function() {
        var buff = [];
        var data = this.getData();
        for(var i = 0; i < data.length; i++) {
            if(data[i]) {
                buff.push(data[i]);
                if(i < data.length - 1) buff.push(',');
            }
        }
        return buff.join('');
    };
    
    this.formatForAnimationInput = function(value) {
        var output = [];
        output[0] = value.join(Simulator.Constants.MULTIPLE_VALUE_DELIMITTER);
        return output;
    };
    
    this.formatForTableInput = function(value) {
        var output = [];
        output[0] = value.join(Simulator.Constants.MULTIPLE_VALUE_DELIMITTER + ' ');
        return output;
    };

    this.getData = function(inputScope) {
        var checkedItems = [];
        var k = 0;
        var item = null;
        var proxy = null;
        var items = this.getItems();
        for(var i = 0; i < items.length; i++) {
            var labelFor = simDocument().getElementById(items[i].lookup('labelForID'));
            item = simDocument().getElementById(items[i]['itemID']);
            if(item.checked) {
                if(inputScope == 'dataInput') proxy = this.getDataProxy(i);
                else if(inputScope == 'evaluationInput') proxy = this.getEvaluationProxy(i);
                else if(inputScope == 'animationInput') proxy = this.getAnimationProxy(i);
                if(proxy != undefined && proxy != null) checkedItems[k] = proxy;
                else checkedItems[k] = items[i].lookup('val');
                labelFor.setAttribute('class', 'inputChecked');
                k++;
            }
            else labelFor.removeAttribute('class');
        }
        
    this.setData(checkedItems);
        return checkedItems;
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
            dbg().logWarning(sourde, 'Unhandled event type received: ' + event.toString());
            return;
        }
        
    };

    this.setElementSelectState = function (state, contents) {
        var htmlElement = null;
        selectedItem = -1;
        var items = this.getItems();
        var parts = contents.split(',');
        for (var i = 0; i < parts.length; i++) {
            if (parts[i] != null) parts[i] = parts[i].trim();
        }
        var proxy = null;
        var value = null;
        for (var i = 0; i < items.length; i++) {
            var labelFor = simDocument().getElementById(items[i].lookup('labelForID'));
            proxy = items[i].lookup('dataProxy');
            if (proxy) value = proxy;
            else value = items[i].lookup('val');
            if (state == 'true') {
                if (utils().elementInArray(parts, value)) {
                    items[i].setValue('selected', 'checked');
                    if (selectedItem == '') selectedItem = value;  // selectedItem defined in the superclass
                    else selectedItem = ', ' + value;
                    htmlElement = simDocument().getElementById(items[i].itemID);
                    htmlElement.checked = 'checked';
                    labelFor.setAttribute('class', 'inputChecked');
                    this.recordInput(this, true);
                }
                else if ((items[i].lookup('selected')) || (items[i].lookup('default') == 'yes')) {
                    htmlElement = simDocument().getElementById(items[i].itemID);
                    if(htmlElement) htmlElement.checked = false;
                    labelFor.removeAttribute('class');
                    items[i].remove('selected');
                }
            } else {
                if (value == contents && items[i].lookup('selected')) {
                    htmlElement = simDocument().getElementById(items[i].itemID);
                    if(htmlElement) htmlElement.checked = false;
                    labelFor.removeAttribute('class');
                    items[i].remove('selected');
                }
            }
        }
    };
        
    this.keyboardNavigateTo = function(elementID, itemID, index) {
        var element = simDocument().getElementById(elementID);
        var nodes = element.getElementsByTagName('li');
        var item = nodes[index];
        if(element) element.selectedIndex = index;            
        if(item) item.setAttribute('class', 'simAreaFocus');
    };
    
    this.keyboardNavigateAwayFrom = function(elementID, itemID, index) {
        var element = simDocument().getElementById(elementID);
        var nodes = element.getElementsByTagName('li');
        var item = nodes[index];
        item.removeAttribute('class');
    };
    
    this.disableInput = function() {
        this.disableItems();
    };
    
    this.enableInput = function() {
        this.enableItems();
    };

    this.setAttributes = function(attr, node) {
        Simulator.Input.ChoiceList.prototype.setAttributes.call(this, attr);  // All attributes inherited
        if(this.getScoreable()) scoringTable().addElement(this.getName(), 'input');
        this.setItems(node);
    };

    this.doOnClick = function(id) {
    	this.onChange(id);
    };
    
    this.render = function() {
    	var nodeID = this.getNodeID();
        var itemID = null;
        var items = this.getItems();
        var nextNum = utils().getNextSequenceNumber();
        var image = null;
        var labelledByID = this.getSectionID(); // default aria-labelledby to containing section (WCAG) 
        var panelHtml = container;
        var outerDiv = simDocument().createElement("div");
        outerDiv.className = "inputChoiceList";

        this.setFocusable(true, true); // Don't set the element itself to accept keyboard input
        
/*        if(simMgr().getSpeechEnabled()) {
            var label = this.getSpeechLabel();  // if there is a speechLabel defined in the xml use that
            if(label == '') {
                label = this.getLabel();
                if(label == '')  {
                    label = aSection.getLabel();
                    if(label == '') {
                        dbg().logFatalError(source, 'Item is speech enabled but no speechLabel, element label, or enclosing section label is specified for ' + this.getName());
                        return;
                    }
                }
            }
            buff.push(Simulator.Constants.SPEECH_LABEL_PREFIX + label); buff.push('<br>');
        }
        else 
*/      

        if (this.getLabel()) {
            var h5LabelElement = simDocument().createElement('h5'); // using h5 rather than simple text node (WCAG)
            var h5ID = this.createLabelID();
            h5LabelElement.id = h5ID; // ID for WCAG
            labelledByID = labelledByID + ' ' + h5ID; // if there is an element label, add to the aria-laballedby attribute (WCAG)
            h5LabelElement.innerHTML = this.getLabel();
            panelHtml.appendChild(h5LabelElement);
            /*
            var textLabelEl = simDocument().createTextNode(this.getLabel());
        	panelHtml.appendChild(textLabelEl);
        	var brElement = simDocument().createElement('br'); 
        	panelHtml.appendChild(brElement); */
        }        
        
        for ( var x = 0; x < items.length; x++) {
            var itemIDReset = x == 0 ? true : false;
            itemID = this.createItemID(itemIDReset);
            items[x]['itemID'] = itemID;
            image = (items[x]).lookup('image');
            if(x == 0) {
                if (image != null && image != undefined) {
                	var ulElement = simDocument().createElement('ul');
                	ulElement.id = nodeID;
                	ulElement.setAttribute('class', 'multiSelect withImages');
                } else {
                	ulElement = simDocument().createElement('ul');
                	ulElement.id = nodeID;
                	ulElement.setAttribute('class', 'multiSelect');
                	ulElement.setAttribute('role', 'group'); // WCAG
                	ulElement.setAttribute('aria-labelledby', labelledByID); // WCAG
                }
                if (theSection.getSectionSettings().elementorientation === "horizontal") {
                    outerDiv.classList.add("inputpanelcell");
                }
                outerDiv.appendChild(ulElement);
            }
            var labelForID = 'labelFor' + itemID;
            items[x].setValue('labelForID', labelForID);
            if ((items[x]).lookup('val') != undefined) {
            	var listElement = simDocument().createElement('li');
            	var inputEl = simDocument().createElement('input');
            	inputEl.id = itemID;
            	inputEl.setAttribute('type', 'checkbox');
            	inputEl.setAttribute('name', 'ChoiceButtonGroup' + nodeID + nextNum);
            	inputEl.setAttribute('value', (items[x]).lookup('val'));
            	if(this.getSaveOnChange()) {
            	    utils().bindEvent(inputEl, 'click', function () {
                        that.doOnClick(nodeID);
                    });
            	}
            	if(items[x].lookup('default') == 'yes') {
            		inputEl.setAttribute('checked', '');
            	}
            	listElement.appendChild(inputEl);
            	var labelForID = 'labelFor' + itemID;
                items[x].setValue('labelForID', labelForID);
                var labelEl = simDocument().createElement('label');
            	labelEl.id = labelForID;
            	labelEl.setAttribute('for', itemID);
            	if(items[x].lookup('default') == 'yes') {
            		labelEl.setAttribute('class', 'inputChecked');
            	}
            	if (image != null && image != undefined) {
            		var imageSpanEl = simDocument().createElement('span');
            		imageSpanEl.setAttribute('class', 'holderImage');
            		var imageEl = simDocument().createElement('img');
            		imageEl.setAttribute('src', image);
            		imageEl.setAttribute('alt', (items[x]).lookup('val'));
            		imageSpanEl.appendChild(imageEl);
            		labelEl.appendChild(imageSpanEl);
            	}
            	var listLabelSpanEl = simDocument().createElement('span');
            	listLabelSpanEl.setAttribute('class', 'listLabel');
                // retrieve translated text
            	var innerHTMLtag = (items[x]).lookup('val');
            	listLabelSpanEl.innerHTML = transDictionary().translate(innerHTMLtag);
            	labelEl.appendChild(listLabelSpanEl);
            	listElement.appendChild(labelEl);
            	ulElement.appendChild(listElement);
            }
            
            // Register the element items for keyboard input
            if (this.isFocusable()) {
            	keyboardInput().addFocusableElementItem(this, this.getNodeID(), itemID);
            }
        }
        panelHtml.appendChild(outerDiv);
        this.setDefaultSelections();
        this.mapHTML2JS(ulElement);
    };
    
    this.getSourceName = function() {
        return source;
    };


    this.inspect = function(embedded, forced) {
        var buff = [];
        var sep = '\n\n';
        buff.push('Inspecting ');
        buff.push(this.getName());
        buff.push(sep);
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
        if(!embedded) forced == true ? dbg().debugf(buff.join('')) : dbg().debug(buff.join(''));
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
Simulator.Input.ChoiceList.prototype = new Simulator.Input.GroupList();
Simulator.Input.ChoiceList.prototype.constructor = Simulator.Input.ChoiceList; // Reset the prototype to point
                                                // to the current class

