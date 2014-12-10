/** **************************************************************************
* @class SimElement
* @superclass SimItem
* @param sim - instance of Simulator
* @return SimItem instance
* Creates a new SimElement Abstract class.
*****************************************************************************
*/
Simulator.SimElement = function (sim) {

    Simulator.SimItem.call(this, sim); // Inherit instance variables


    //Instance variables
    var source = 'SimElement';
    var name = ''; // The name of the element
    var focusable = false;  // If true, the element can receive keyboard focus
    var nodeID = null;  // A unique id identifying the HTML node for this element
    var type = null;  // the type of element
    var label = '';  // the label associated and displayed with the element
    var scoreable = true;
    var spaceAbove = 0;  // blank space (in lines) placed above the element
    var spaceBelow = 0;  // blank space (in lines) placed below the element
    var image = null;  // The image associated and displayed with the element
    var speechLabel = '';  // the label shown when the element is enabled for speech
    var toEvents = new Simulator.EventDB(sim, 'toEvents');  // the database containing the events the element receives
    var fromEvents = new Simulator.EventDB(sim, 'fromEvents');  // the database containing the events the element generates
    var theSimulator = null;
    var keyboardInput = function () { sim.getKeyboardInput(); };  // get keyboard input instance
    var html2jsMap = function() { return sim.getHTML2JSMap(); };

    if(sim) {
        theSimulator = sim;
    }
    
    var eventMgr = function () { return theSimulator.getEventManager(); };    
    var dbg = function() {return theSimulator.getDebug();};
    var simDocument = function () { return sim.getSimDocument(); };
    var transDictionary = function () { return sim.getTranslationDictionary(); }

    // Instance Methods
    this.getEname = function() {
        return source;
    };
    
    this.addEvent = function (theEvent, dir) {
        switch (dir) {
            case 'to':
                toEvents.addEvent(theEvent);
                eventMgr().registerEvent(theEvent);   // Register events we wish to receive from the EventManager
                break;
            case 'from':
                fromEvents.addEvent(theEvent);
                break;
            default:
                dbg().logError(source, 'Unknown event direction ' + dir + ' passed to ' + this.getName());
                break;
        }
        return this;
    };

    this.setFocusable = function (flag, noRegister) {
        if (flag == true) {
            focusable = true;
            //if (!noRegister) keyboardInput().addFocusableElement(this, this.getNodeID());
        }
        else focusable = false;
    };

    this.isFocusable = function () {
        return focusable;
    };

    this.nextEvent = function (reset) {
        return fromEvents.nextEvent(reset);
    };

    this.getName = function () {
        return name;
    };

    this.setName = function (newName) {
        name = newName.trim();
        nodeID = this.createItemID(true, -1);
        return this;
    };

    this.getType = function () {
        return type;
    };

    this.setType = function (newType) {
        type = newType;
        return this;
    };

    this.getLabel = function () {
        // retrieve translated text
        return transDictionary().translate(label);
    };

    this.setLabel = function (newLabel) {
        label = newLabel;
        return this;
    };

    this.getScoreable = function () {
        return scoreable;
    };

    this.setSpaceAbove = function (newSpaceAbove) {
        spaceAbove = parseInt(newSpaceAbove);
    };

    this.getSpaceAbove = function () {
        return spaceAbove;
    };

    this.setSpaceBelow = function (newSpaceBelow) {
        spaceBelow = parseInt(newSpaceBelow);
    };

    this.getSpaceBelow = function () {
        return spaceBelow;
    };

    this.getImage = function () {
        // retrieve language-specific version of image
        var translatedImage = transDictionary().translate(image);
        debug("Getting an image using SimElement2.js method: " + translatedImage);
        return translatedImage;
    };

    this.setImage = function (newImage) {
        // right now, this sets image tag (pre-translation)
        debug("SETTING an image using SimElement2.js method: " + newImage);
        image = newImage;
        return this;
    };

    this.getData = function () {  // do nothing superclass method implementation
        return '';
    };

    this.setSpeechLabel = function (newSpeechLabel) {
        speechLabel = newSpeechLabel;
    };

    this.getSpeechLabel = function () {
        return speechLabel;
    };

    this.formatEventData = function () {  // default superclass method implementation
        return this.getData();
    };

    this.postOnChangeEnabled = function () { // check if the element has postonchange events
        var theEvent = this.nextEvent('true');
        while (theEvent != null) {
            if (theEvent.postOnChange == 'yes') {
                return true;
            }
            theEvent = this.nextEvent();
        }
        return false;
    };

    this.postOnChangeEvents = function () {
        var theEvent = this.nextEvent('true');
        while (theEvent != null) {
            if (theEvent.postOnChange == 'yes') {
                theEvent.data = this.formatEventData();
                eventMgr().postEvent(theEvent);
            }
            theEvent = this.nextEvent();
        }
    };

    this.postStaticEvents = function () {
        var theEvent = this.nextEvent('true');
        while (theEvent != null) {
            if (theEvent.postOnChange != 'yes') {
                theEvent.data = this.formatEventData();
                theEvent.postEvent();
            }
            theEvent = this.nextEvent();
        }
    };

    this.getNodeID = function () {
        return nodeID;
    };
    
    this.mapHTML2JS = function(htmlElement) {
        html2jsMap().mapJSFromHTML(this, htmlElement);
    };

    this.inspect = function(embedded, force) {
        var buff = [];
        var sep = '\n';
        buff.push('Inspecting ' + source + sep);
        var str = Simulator.SimElement.prototype.inspect.call(this, true, force);
        if (str) {
            buff.push(str);
            buff.push(fromEvents.inspect(true, force));
            buff.push(toEvents.inspect(true, force));
            return buff.join('');
        }
        else {
            for ( var i in this) {
                if (i.substr(0, 3) == 'get') {
                    buff.push(i.charAt(3).toLowerCase() + i.slice(4));
                    buff.push(' = ');
                    buff.push(eval('this.' + i + '()'));
                    buff.push(sep);
                }
            }
            buff.push(fromEvents.inspect(true, force));
            buff.push(toEvents.inspect(true, force));
            buff.push('End Inspecting ' + source + sep + sep);
            if(!embedded) force == true ? debugf(buff.join('')) : debug(buff.join(''));
            else return buff.join('');
        }
   };

    this.selectViaKeyboard = function (itemIndex) { Simulator.showAlert('Error','"selectViaKeyboard" must be inplemented by subclass'); };

    if(sim) this.setEname('SimElement');

    this.setAttributes = function (attr) {
        Simulator.SimElement.prototype.setAttributes.call(this, attr);
        for (var i in attr) {
            switch (i) {
                case 'name':
                    this.setName(attr[i]);
                    break;
                case 'image':
                    this.setImage(attr[i]);
                    break;
                case 'label':
                    this.setLabel(attr[i]);
                    break;
                case 'type':
                    this.setType(attr[i]);
                    break;
                case 'spaceAbove':
                    this.setSpaceAbove(attr[i]);
                    break;
                case 'spaceBelow':
                    this.setSpaceBelow(attr[i]);
                    break;
                case 'speechLabel':
                    this.setSpeechLabel(attr[i]);
                    break;
            }
        }
    };

    // Convenience functions for debugging
    function debug(str1, str2, trace) {
        dbg().debug(source, str1, str2, trace);
    }

    function debugf(str1, str2, trace) {
        dbg().debugf(source, str1, str2, trace);
    }

};

// Inherit methods and class variables
Simulator.SimElement.prototype = new Simulator.SimItem();
Simulator.SimElement.prototype.constructor = Simulator.SimElement; // Reset the prototype to point
