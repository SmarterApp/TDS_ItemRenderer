

/**
 * **************************************
 * @class Panel
 * @superclass Canvas 
 * param sim - Simulator instance
 * @param paneNum - a unique number assigned to a panel
 * @return instance of Panel
 * Each Panel manages its own ioElements
 *****************************************
 */

Simulator.Display.Panel = function (sim, panelNum) {

    Simulator.Display.Canvas.call(this, sim);    // Inherit instance variables

    // Private Instance variables
    var source = 'Panel';
    var instance = this;
    var headerText = '';  // Text at the top of the panel
    var headerTextSize = '';  // Header text size in pixels
    var float = '';  // Instance Variable declaration format
    var initialFocus = false;
    var display = 'hidden';  // default is to hide panels until their absolute dimensions can be determined
    var borderColor = '';
    var dialogAttr = [];  // Attributes for dependent DialogPanel
    var panelNumber = panelNum;
    var panelID = '';
    var dialogPanel = null;
    var ioElements = [];
    var dialogButtonLabel = "";

    var originalWidth = null;
    var originalHeight = null;

    // Get required services
    var dbg = function () { return sim.getDebug(); };
    var utils = function () { return sim.getUtils(); };
    var simDocument = function () { return sim.getSimDocument(); };

    // Instance methods
    this.registerIOElement = function (inputElement) {
        ioElements.push(inputElement);
    };

    this.getOriginalHeight = function () {
        return originalHeight;
    }

    this.getOriginalWidth = function () {
        return originalWidth;
    }

    this.recordOriginalWidthAndHeight = function () {
        if (this.getName() == 'animationPanel' && !(originalWidth > 0 && originalHeight > 0)) {
            originalWidth = this.getWidth();
            originalHeight = this.getHeight();
            debugf(source, 'Recording Original Width =' + originalWidth + ' Original Heigth =' + originalHeight);
        }
    }

    this.getHeaderText = function () {
        return headerText;
    };

    this.setHeaderText = function (newHeaderText) {
        headerText = newHeaderText;
        return this;
    };

    this.getHeaderTextSize = function () {
        return headerTextSize;
    };

    this.setHeaderTextSize = function (textSize) {
        headerTextSize = textSize == 'small' || textSize == 'medium' | textSize == 'large' | textSize == 'x-Large' ? textSize : null;
        if (!headerTextSize) {
            dbg().logError(source, 'Invalid value for headerTextSize attribute: ' + textSize);
            headerTextSize = '';
        }
        return this;
    };

    this.getFloat = function () {
        return float;
    };

    this.setFloat = function (newFloat) {
        float = newFloat == 'left' | newFloat == 'right' || newFloat == 'none' ? newFloat : null;
        if (!float) {
            dbg().logError(source, 'Invalid value for float attribute: ' + newFloat);
            newFloat = '';
        }
        return this;
    };

    this.getInitialFocus = function () {
        return initialFocus;
    };

    this.setInitialFocus = function (newInitialFocus) {
        initialFocus = newInitialFocus == 'yes' ? true : false;
        return this;
    };

    this.setDialogButtonLabel = function (newLabel) {
        dialogButtonLabel = newLabel;
    };

    this.getDialogButtonLabel = function () {
        return dialogButtonLabel;
    };

    this.getDisplay = function () {
        return display;
    };

    this.setDisplay = function (newDisplay) {
        display = (newDisplay == 'inline' || newDisplay == 'block' || newDisplay == 'none' || newDisplay == 'hidden' || newDisplay == 'visible') ? newDisplay : null;
        if (!display) {
            dbg().logError(source, 'Invalid value for display attribute: ' + newDisplay);
            display = 'hidden';
        }
        return this;
    };

    this.resize = function (zoom) {
        if (this.getName() == 'animationPanel') {
            sim.getAnimationSet().getRenderer().resizeAnimationElements(this, zoom);
        }
    };

    this.getBorderColor = function () {
        return borderColor;
    };

    this.setBorderColor = function (newBorderColor) {
        borderColor = newBorderColor;
        return this;
    };


    this.appendStr = function (str) {
        var hElement = this.getHTMLElement();
        hElement.innerHTML = hElement.innerHTML + str;
    };


    this.setStr = function (str) {
        var hElement = this.getHTMLElement();
        hElement.innerHTML = str;
    };


    this.resetStr = function (str) {
        var hElement = this.getHTMLElement();
        hElement.innerHTML = this.getHeaderText() + str;
    };


    this.disableAllInput = function () {
        for (var i = 0; i < ioElements.length; i++) {
            ioElements[i].disableInput();
        }
    };

    this.enableAllInput = function () {
        for (var i = 0; i < ioElements.length; i++) {
            ioElements[i].enableInput();
        }
    };

    this.saveInputs = function (forcedSave) {
        for (var i = 0; i < ioElements.length; i++) {
            if (ioElements[i].recordInput)
                ioElements[i].recordInput(null, null, null, forcedSave);
        }
    };

    this.saveInputElementStates = function (indent, preface, nameStr, valStr, suffix) {
        var stateStr = '';
        for (var i = 0; i < ioElements.length; i++) {
            if (ioElements[i].saveState) {
                stateStr = stateStr + indent + ioElements[i].saveState(indent, preface, nameStr, valStr, suffix);
            }
        }
        return stateStr;
    };

    this.setElementSelectState = function (elementID, contents) {
        var iElement = null;
        for (var i = 0; i < ioElements.length; i++) {
            iElement = ioElements[i];
            if (iElement.getName() == elementID) iElement.setElementSelectState('true', contents);
        }
    };

    this.setLiveAttribute = function (liveValue) { // set aria-live to enable announcements of live regions (WCAG)
        if (!liveValue)
            this.getHTMLElement().setAttribute('aria-live', 'off'); // default value
        else
            this.getHTMLElement().setAttribute('aria-live', liveValue);
    }

    // check if there is any choice list selection that is left empty (i.e., no option selected)
    this.hasEmptyChoiceListSelection = function () {
        var iElement = null;
        for (var i = 0; i < ioElements.length; i++) {
            iElement = ioElements[i];
            if (iElement.getType() === 'choiceList') {
                var choiceSelection = iElement.getData();
                if (choiceSelection.length == 0) {
                    // alert("choice list " + iElement.getName() + " has empty value!!");
                    var sectionLabel = iElement.getSectionLabel();
                    if ((sectionLabel != null) && (sectionLabel != '')) {
                        dbg().logFatalError(iElement.getName(), 'you must make a selection for "' + sectionLabel + '"!');
                    } else {
                        dbg().logFatalError(iElement.getName(), 'you must make a selection for a choice element!');
                    }
                    return true;
                }
            }
        }
        return false;
    };

    this.getHTMLPanel = function () {
        return simDocument().getElementById(this.getName());
    };

    this.setAttributes = function (panel, attr) {
        Simulator.Display.Panel.prototype.setAttributes.call(this, attr);
        for (var i in attr) {
            switch (i) {
                case 'headerText':
                    this.setHeaderText(attr[i]);
                    break;
                case 'headerTextSize':
                    this.setHeaderTextSize(attr[i]);
                    break;
                case 'float':
                    this.setFloat(attr[i]);
                    break;
                case 'display':
                    this.setDisplay(attr[i]);
                    break;
                case 'border':
                    this.setBorder(attr[i]);
                    break;
                case 'initialFocus':
                    this.setInitialFocus(attr[i]);
                    break;
                case 'instructions':
                    dialogAttr[i] = attr[i];
                    break;
                case 'button':
                    this.setDialogButtonLabel(attr[i]);
                    break;
                case 'borderColor':
                    this.setBorderColor(attr[i]);
                    break;
                case 'title':
                    this.setTitle(attr[i]);
                    break;
            }
        }
        if (!utils().assocArrayIsEmpty(dialogAttr)) dialogPanel = new Simulator.Display.DialogPanel(sim, instance, panelID, this.getDialogButtonLabel(), dialogAttr);
    };


    this.render = function () {
        var div = simDocument().createElement('div');
        //        if (this.getDisplay()) {
        //            div.style.visibility = this.getDisplay();
        //        }
        if (this.getFloat()) {
            div.style.display = this.getFloat();
        }
        if (this.getHeightPercentage()) {
            div.style.height = this.getHeightPercentage();
        }
        if (this.getWidthPercentage()) {
            div.style.width = this.getWidthPercentage();
        }
        if (this.getTop()) {
            div.style.top = this.getTop();
        }
        if (this.getLeft()) {
            div.style.left = this.getLeft();
        }
        div.id = this.getNodeID();
        div.setAttribute('class', 'panel' + panelNumber + ' panelSingle ' + this.getName());
        div.setAttribute('role', 'region'); // WCAG
        div.setAttribute('aria-live', 'off'); // WCAG (default)
        if (this.getHeaderText()) {
            var div2 = simDocument().createElement('div');
            div2.setAttribute('class', 'holderInfo');
            div2.innerHTML = this.getHeaderText();
            div.appendChild(div2);
        }
        var container = simDocument().getElementById(Simulator.Constants.SIM_CONTAINER_NAME + sim.getSimID());
        container.appendChild(div);
        this.setHTMLElement(div);

        if ('instructions' in dialogAttr) {
            if ('button' in dialogAttr) dialogPanel.render();
            else div.innerHTML = this.getDialogAttr()['instructions'];
        }
        this.mapHTML2JS(div);
        //debug('Completed rendering ' + this.getName());
    };

    this.getSourceName = function () {
        return source;
    };

    this.inspect = function (embedded, forced) {
        var buff = [];
        var sep = '\n';
        if (!embedded)
            buff.push('Inspecting ' + this.getName() + ' panel');
        buff.push(sep);
        for (var i in this) {
            if (i.substr(0, 3) == 'get') {
                buff.push(i);
                buff.push(' = ');
                buff.push(eval('this.' + i + '()'));
                buff.push(sep);
            }
        }
        if (!embedded) forced === null ? debug(buff.join('')) : debugf(buff.join(''));
        else return buff.join('');
    };

    this.addPanelClass = function (className) {
        var htmlPanel = simDocument().getElementById(this.getNodeID());
        if (htmlPanel) {
            var classNames = htmlPanel.getAttribute('class');
            if (classNames.indexOf(className) != -1) {
                return;
            }
            if (classNames != '') {
                className = ' ' + className;
            }
            classNames = classNames + className;
            htmlPanel.setAttribute('class', classNames);
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

//Inherit methods and class variables
Simulator.Display.Panel.prototype = new Simulator.Display.Canvas();
Simulator.Display.Panel.prototype.constructor = Simulator.Display.Panel;  // Reset the prototype to point to the current class

