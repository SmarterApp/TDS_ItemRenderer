/** **************************************************************************
* @class CommandElement
* @superclass SimElement
* @param sim
* @return CommandElement instance
* Abstract base class for all command elements.
*****************************************************************************
*/
Simulator.Control.CommandElement = function (sim) {

    Simulator.SimElement.call(this, sim);

    var source = 'CommandElement';
    var parent = Simulator.SimElement.prototype;
    var cmdElementImages = ['image_Trashcan'];
    var handler = null;
    var state = 'enabled';
    var handlerParameters = '';
    var alwaysEnabled = false;
    var eventsRegistered = false;
    var panel = null;

    //private functions - start here
    var util = function () { return sim.getUtils(); };

    var simMgr = function () { return sim.getSimulationManager(); };

    var eventMgr = function () { return sim.getEventManager(); };

    var dbg = function () { return sim.getDebug(); };

    var simDocument = function() { return sim.getSimDocument(); };

    var registerClassEvents = function (instance) {
        if (!eventsRegistered) {
            eventMgr().registerEvent(new Simulator.Event(instance, 'info', 'simulatorStateChange'));
            eventsRegistered = true;
        }
    };

    //private functions - end here

    //function calls in the constructor -- start here 
    this.setEname(source);
    
    //function calls in the constructor -- start here 
    
    //public functions -- start here
    this.isAPredefinedCmdElementImage = function (imageName) {
        return util().elementInArray(cmdElementImages, imageName);
    };

    // Privileged accessor for 'state'
    this.getState = function () {
        return state;
    };

    // Privileged mutator for 'state'
    this.setState = function (newState) {
        if (simMgr().isPlaying() || simMgr().isReadOnly()) state = 'disabled';
        else if (newState == 'disabled') {
            if (this.getAlwaysEnabled()) state = 'enabled';   // If alwaysEnambled, ignore disable request
            else state = newState;
        }
        else if (newState == 'enabled') {
            state = newState;
        } else dbg().logFatalError(source, 'Invalid state passed to CommandElement.setState()'); //add source
        return this;
    };

    this.keyboardNavigateTo = function (elementID, itemID, index) {
        var element = simDocument().getElementById(elementID);
        if (element) element.setAttribute('class', element.getAttribute('class') + ' simAreaFocus');
    };

    this.keyboardNavigateAwayFrom = function (elementID, itemID, index) {
        var element = simDocument().getElementById(elementID);
        if (element) {
            var className = element.getAttribute('class');
            var index = className.indexOf('simAreaFocus');
            // this is to fix the bug 63948, in which the command element may lose all previous "class" attributes if "enter" or "space" key is pressed
			// on focused buttons (in this case, "simAreaFocus" is already removed from the class list, so index is zero, and all classes will be removed) 
			if (index > 0)
            className = className.substring(0, index - 1);
            element.setAttribute('class', className);
        }
    };

    this.getHandler = function () {
        return handler;
    };

    this.setHandler = function (newHandler) {
        handler = newHandler;
        return this;
    };

    this.getHandlerParameters = function () {
        return handlerParameters;
    };

    this.setHandlerParameters = function (newHandlerParameters) {
        handlerParameters = newHandlerParameters;
        return this;
    };

    this.setPredefinedImage = function (newImage) {
        this.setImage(newImage);
    };

    this.getAlwaysEnabled = function () {
        return alwaysEnabled;
    };

    this.setAlwaysEnabled = function (newAlwaysEnabled) {
        alwaysEnabled = newAlwaysEnabled == 'yes' ? true : false;
        return this;
    };

    this.isDisabled = function () {
        return state == 'disabled';
    };

    this.setPanel = function (thePanel) {
        panel = thePanel;
        panel.registerIOElement(this);
        return this;
    };
 
    this.saveState = function(indent, preface, nameStr, valStr, suffix) {
        return '';  // By default we do not retain the state of command elements
    };
    
    
    this.getSourceName = function() {
        return source;
    };

    this.inspect = function(embedded, force) {
        var buff = [];
        var sep = '\n';
        buff.push('Inspecting ' + source + sep);
        var str = Simulator.Control.CommandElement.prototype.inspect.call(this, true, force);
        if (str) return str;
        else {
            for ( var i in this) {
                if (i.substr(0, 3) == 'get') {
                    buff.push(i.charAt(3).toLowerCase() + i.slice(4));
                    buff.push(' = ');
                    buff.push(eval('this.' + i + '()'));
                    buff.push(sep);
                }
            }
            buff.push('End Inspecting ' + source + sep + sep);
            if(!embedded) force == true ? dbg().debugf(source, buff.join('')) : dbg().debug(source, buff.join(''));
            else return buff.join('');
        }
    };

    this.setAttributes = function (attr, node) {
        Simulator.Control.CommandElement.prototype.setAttributes.call(this, attr, node);
        for (var i in attr) {
            switch (i) {
                case 'predefinedImage':
                    this.setPredefinedImage(attr[i]);
                    break;
                case 'handler':
                    this.setHandler(attr[i]);
                    break;
                case 'handlerParameters':
                    this.setHandlerParameters(attr[i]);
                    break;
                case 'alwaysEnabled':
                    this.setAlwaysEnabled(attr[i]);
                    break;
                case 'speechLabel':
                    this.setSpeechLabel(attr[i]);
                    break;
            }
        }
    };
    //public functions -- end here

    //prototype functions - start here
    
    //prototype functions - end here
    
    //delay registration until this class is instantiated with not null 'sim' parameter
    if (sim) {
        registerClassEvents(this);
    }
};

//Inherit methods and class variables
Simulator.Control.CommandElement.prototype = new Simulator.SimElement();
Simulator.Control.CommandElement.parent = Simulator.SimElement;
Simulator.Control.CommandElement.prototype.constructor = Simulator.Control.CommandElement;  // Reset the prototype to point to the current class


