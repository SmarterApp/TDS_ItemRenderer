/**
 * *****************************************************************************
 * @class GroupList 
 * @superclass InputElement
 * @param sim - The Simulator instance
 * @return - instance of a GroupList which is only used as an abstract class
 * Note - This is a singleton class
 *******************************************************************************
 */
Simulator.Input.GroupList = function(sim) {

    Simulator.Input.InputElement.call(this, sim); // Inherit Instance variables

    var items = []; 
    //var keyboardInput = KeyboardInput.GetInstance();

    var dbg = function() { return sim.getDebug(); };
    var eventMgr = function() { return sim.getEventManager(); };
    var utils = function() { return sim.getUtils(); };
    var simulationMgr = function() { return sim.getSimulationManager(); };
    var simDocument = function() { return sim.getSimDocument(); };
    
    // Instance Variables
    this.getItems = function() {
        return items;
    };
    

    // Privileged mutator for 'items'
    this.setItems = function(node) {
        var id;
        var ruleName = null;
        var elementName = '';
        try {
            if(utils().isInternetExplorer()) elementName = node.attributes.getNamedItem('name').value;
            else elementName = node.attributes['name'].nodeValue;
        } catch(err) {
            dbg().logError(source, 'Error occurred getting element name: ' + err.message);
            elementName = '';
        }
        var attr = [];
        var theItem;
        var itemID = null;
        var itemNum = 0;
        if (node.childNodes != null) {
            for ( var j = 0; j < node.childNodes.length; j++) {
                id = node.childNodes[j].nodeName;
                if (id[0] != '#') {
                    if (id == 'item' || id == 'ITEM') { // uppercase version required for re-created nodes (accessibility/streamlined mode: e.g., counters --> dropLists)
                        theItem = node.childNodes[j];
                        attr = theItem.attributes;
                        var attributes = new Simulator.Utils.Dictionary(sim);
                        items[itemNum] = attributes;
                        for ( var i = 0; i < attr.length; i++) {
                            var attribute = attr[i];
                            var nodeName = attribute.nodeName;
                            if(attribute.nodeName == 'image') {
                                attributes.setValue(nodeName, attribute.nodeValue);
                            }
                            else attributes.setValue(nodeName, attribute.nodeValue);
                        }
                        itemID = j == 0 ? this.createItemID(true, itemNum) : this.createItemID(false, itemNum);
                        attributes.setValue('itemID', itemID);
/*                        if(simulationMgr().getSpeechEnabled()) {
                            var speechLabel = attributes.lookup('speechLabel');  // if there is a speechLabel defined in the xml use that
                            if(!speechLabel) {
                                speechLabel = attributes.lookup('val');  // else if there is a value defined use that
                                if(!speechLabel) {
                                    speechLabel = this.getDataProxy(itemNum);  // else if there is a dataProxy defined use that
                                    if(!speechLabel)  {
                                        logFatalError('Item is speech enabled but no speechLabel, value, or dataProxy is specified for ' + itemID + ' in ' + this.getName(), true);
                                        return;
                                    }
                                }
                            }
                            //ruleName = speechGrammarBldr.createGroupListValueGrammarRule(elementName, speechLabel, itemID, itemNum == 0 ? true: false, 
                           //         this, speechLabel);
                            attributes.setValue('val', Constants.SPEECH_ITEM_VALUE_PREFIX + speechLabel);
                        }
*/                        itemNum++;
                    }
                }
            }
            //if(ruleName) speechGrammarBldr.completeGroupListValueGrammar(ruleName);
        }
    };
    
    this.disableItems = function() {
        for(var i = 0; i < items.length; i++) {
            var element = simDocument().getElementById(items[i].itemID);
            element.disabled = true;
        }
    };
    
    this.enableItems = function() {
        for(var i = 0; i < items.length; i++) {
            var element = simDocument().getElementById(items[i].itemID);
            element.disabled = false;
        }
    };
    
    this.getDefaultSelection = function() {
        var defaults = [];
        for(var i = 0; i < items.length; i++) {
            if(items[i].keyExists('default')) {
                if(items[i].lookup('default') == 'yes') {
                    defaults.push(items[i].lookup('val'));
                }
            }
        }
        return defaults;
    };
    
    this.setDefaultSelections = function() {
        var defaults = this.getDefaultSelection();
        if(defaults.length > 0) {
            selectedItem = defaults;
            this.setData(defaults);
        }
    };
    
    this.getDataProxy = function(itemNum) {
        if(itemNum != undefined && itemNum != null) return  items[itemNum].lookup('dataProxy');
        else return null;
    };
    
    this.getAnimationProxy = function(itemNum) {
        if(itemNum != undefined && itemNum != null) return  items[itemNum].lookup('animationProxy');
        else return null;
    };

    this.getEvaluationProxy = function(itemNum) {
        if(itemNum != undefined && itemNum != null) return  items[itemNum].lookup('evaluationProxy');
        else return null;
    };
    
    this.extractItemValue = function(itemIndex) {
        var value = null;
        var inputScope = this.getInputScope();
        if(isNaN(itemIndex)) {
            for(var i = 0; i < items.length; i++) {
                if(items[i].itemID == itemIndex) {
                    itemIndex = i; // convert from an itemID to an itemNum
                    break;
                }
            }
        }
        if(itemIndex >= 0) {
            if(inputScope == 'dataInput') value = this.getDataProxy(itemIndex);
            else if(inputScope == 'evaluationInput') value = this.getEvaluationProxy(itemIndex);
            else if(inputScope == 'animationInput') value = this.getAnimationProxy(itemIndex);
            if(value == undefined || value == null) value = items[itemIndex].lookup('val');
            return value;
        } else {
            dbg().logError(source, 'itemIndex = "' + itemIndex + '". Could not extract item value');
            return null;
        }
    };

    this.saveState = function(indent, preface, nameStr, valStr, suffix) {
        var checkedItems = '';
        for(var i = 0; i < items.length; i++) {
            var id = items[i].itemID;
            var value = items[i].lookup('val');
            if(value == undefined || value == null || value == '') value = items[i].lookup('dataProxy');
            var htmlElement = simDocument().getElementById(id);
            if(htmlElement.checked != undefined) {            
                if(htmlElement.checked) {
                    if(checkedItems == '') checkedItems = checkedItems + value;
                    else checkedItems = checkedItems + ', ' + value;
                }
            } else if(htmlElement.selected != undefined) {   // Dropdowns use 'selected'
                if(htmlElement.selected) {
                     this.selectedIndex = value;
                     checkedItems = value;  // Use checkedItems to record selected value for dropDowns as a convenience in the method
                }
            }
        }
        if(checkedItems != '') return indent + preface + nameStr + this.getName() + valStr + checkedItems + suffix;
        else return '';
    };
    
    this.setSelectStateViaKeyboard = function(elementID, itemID) {
        var HTMLItem = null;
        // var element = GetJSObjFromHTML(elementID);
        if(itemID) HTMLItem = simDocument().getElementById(itemID);
        else HTMLItem = simDocument().getElementById(elementID);
        if(HTMLItem) {
            if(this.getType() == 'dropList') {
                if(HTMLItem.selected) HTMLItem.removeAttribute('selected');
                else {
                    HTMLItem.selected = 'selected';
                }
            } else {
                if (HTMLItem.checked) HTMLItem.checked = false;
//                if (HTMLItem.checked) HTMLItem.removeAttribute('checked');
                else {
                    HTMLItem.checked = 'checked';
                    this.recordInput(this);
                }
            }
        }
    };
    
    this.setSelectStateViaSpeech = function(elementID, itemID) {
        this.recordKeyboardSelection(elementID, itemID);    // We do the same thing for keyboard selection
    };
    
    this.recordKeyboardSelection = function(elementID, itemID, itemIndex) {
        var element = null;
        var item = null;
        if(itemID) {
            item = simDocument().getElementById(itemID);
            if(!item) {
                element = simDocument().getElementById(elementID);
                if(element) item = element.getElementsByClassName(itemID)[0];
            }
            if(item) {
                item.isSelected = true;
                this.setSelectStateViaKeyboard(elementID, itemID);
                this.onChange(elementID);
            }
        }
    };

    this.inspect = function(embedded, forced) {
        buff = [];
        if (!embedded)
            buff.push('Inspecting GroupList');
        var items = this.getItems();
        for ( var i in items) {
            buff.push(i);
            buff.push(' = ');
            buff.push(items[i]);
            buff.push('\n\n');
        }
        if(!embedded) forced == true ? dbg().debugf(buff.join('')) : dbg().debug(buff.join());
        else return buff.join('');
    };
    
    this.setAttributes = function(attr) {
        Simulator.Input.GroupList.prototype.setAttributes.call(this, attr);
        for ( var i in attr) {
            switch (i) {
            case 'items':
                this.setItems(attr[i]);
                break;
            }
        }

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
Simulator.Input.GroupList.prototype = new Simulator.Input.InputElement();
Simulator.Input.GroupList.prototype.constructor = Simulator.Input.GroupList; // Reset the prototype to point
                                                // to the current class


