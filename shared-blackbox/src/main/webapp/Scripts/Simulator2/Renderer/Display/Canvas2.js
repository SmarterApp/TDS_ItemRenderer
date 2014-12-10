/**
 * **************************************
 * @class Canvas
 * @abstract
 * @superclass SimElement
 * @param sim - Simulator instance
 * @return Canvas instance
 * The Canvas is the superclass of all panels
 * Note: THis is an abstract class
 ****************************************
 */
Simulator.Display.Canvas = function(sim) { 
    
    Simulator.SimElement.call(this, sim);    // Inherit instance variables
    
    //Private Instance Variables
    var source = 'Canvas';
    var instance = this;
    var hTMLElement = '';  // the HTML element associated with this Canvas instance
    var top = 0;  // dimension or % of container for top of this instance
    var left = 0;   // dimension or % of container for left edge of this instance
    var height = 0;  // dimension or % of container for height of this instance
    var width = 0;  // dimension or % of container for width of this instance
    var backgroundColor = '';

    // Get required services
    var dbg = function() {return sim.getDebug();};
    var simulationMgr = function() {return sim.getSimulationManager();};
    var simDocument = function() { return sim.getSimDocument(); };

    // Instance Methods
    
    this.getHTMLElement = function() {
        return hTMLElement;
    };
    
    
    this.setHTMLElement = function(newHTMLElement) {
        hTMLElement = newHTMLElement;
        return this;
    };
    
    this.getTop = function() {
        return top;
    };
    
    this.setTop = function(newTop) {
        top = newTop;
        return this;
    };   

    this.getLeft = function() {
        return left;
    };
    
    this.setLeft = function(newLeft) {
        left = newLeft;
        return this;
    };
    
    this.getHeight = function() {
        if(simulationMgr()) {
//            debug(this.getName() + ' height = ' + (parseFloat(height)/100)*(simulationMgr().getSimulatorHeight()));
            return (parseFloat(height)/100)*(simulationMgr().getSimulatorHeight());
        }
        else return 0;
    };
    
    this.getHeightPercentage = function() {
        return height;
    };
    
    this.setHeight = function(newHeight) {
        height = newHeight;
        return this;
    };

    this.getWidth = function() {
        if(simulationMgr()) {
//            debug(this.getName() + ' width = ' + (parseFloat(width)/100)*(simulationMgr().getSimulatorWidth()));
            return (parseFloat(width)/100)*(simulationMgr().getSimulatorWidth());
        }
        else return 0;
    };
    
    this.getWidthPercentage = function() {
        return width;
    };
    
    this.setWidth = function(newWidth) {
        width = newWidth;
       return this;
    };
    
    this.getBackgroundColor = function() {
        return backgroundColor;
    };
    
    this.setBackgroundColor = function(newBackgroundColor) {
        backgroundColor = newBackgroundColor;
        return this;
    };
    
    this.containsElement = function(elementID) {
        var children = hTMLElement.childNodes;
        for(var i = 0; i < children.length; i++) {
            if(children[i].nodeName[0] != '#') {
                if(children[i].nodeValue == elementID) return true;
            }
        }
        return false;
    };
    
    this.containsElementWithAttribute = function(elementID, attributeName, attributeValue) {
        var attributes = null;
        var children = hTMLElement.childNodes;
        for(var i = 0; i < children.length; i++) {
            if(children[i].nodeName[0] != '#') {
                if(children[i].nodeValue == elementID) {
                    attributes = children[i].attributes;
                    if(attributes) {
                        if(attributeName in attributes) {
                            if(attributeValue) return attributes[attributeName] == attributeValue;
                            else return true;
                        }
                    } else return false;
                } else return false;
            }
        }
        return false;
    };
    
    this.setEname('Canvas');

    this.setAttributes = function(attr, node) {
        Simulator.Display.Canvas.prototype.setAttributes.call(this, attr, node);
        for (var i in attr) {
            switch (i) {
                case 'top':
                    this.setTop(attr[i]);
                    break;
                case 'left':
                    this.setLeft(attr[i]);
                    break;
                case 'height':
                    this.setHeight(attr[i]);
                    break;
                case 'width':
                    this.setWidth(attr[i]);
                    break;
                case 'backgroundColor':
                    this.setBackgroundColor(attr[i]);
                    break;
            }
        }
    };
    
    this.getSourceName = function() {
        return source;
    };
    
    
    // Convenience function for the most frequently used Debug methods
    function debug(str1, str2, trace) {
        dbg().debug(source, str1, str2, trace);
    }
    
    function debugf(str1, str2, trace) {
        dbg().debugf(source, str1, str2, trace);
    }

};

//Inherit methods and class variables
Simulator.Display.Canvas.prototype = new Simulator.SimElement();
Simulator.Display.Canvas.prototype.constructor = Simulator.Display.Canvas;  // Reset the prototype to point to the current class