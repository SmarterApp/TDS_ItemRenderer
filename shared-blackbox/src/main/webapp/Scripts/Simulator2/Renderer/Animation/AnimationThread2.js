/** **************************************************************************
* @class AnimationThread
* @superclass SimElement
* @param none
* @return AnimationThread instance
* Creates a new AnimationThread class.
*****************************************************************************
*/

Simulator.Animation.AnimationThread = function (sim, panel, section, animationSet) {

    Simulator.SimElement.call(this);

    //#region private variables

    var source = 'AnimationThread';  // global variable used in debug
    var theSet = animationSet;
    var threadElements = [];
    var currentThreadElementIndex = 0;
    var selectionCriteria = [];
    var requiresInput = 'no';
    var currentElement = null;
    var currentThread = null;
    var lastExecutedAnimationElement = null;

    //#endregion

    //#region function calls in the constructor

    this.setEname(source);

    if (animationSet)
        animationSet.addThread(this);

    //#endregion

    //#region private functions

    var util = function () { return sim.getUtils(); };

    var dbg = function () { return sim.getDebug(); };

    var eventMgr = function () { return sim.getEventManager(); };

    var renderer = function () { return animationSet.getRenderer(); };

    var simDocument = function () { return sim.getSimDocument(); };

    function onChangeToSpecified(criteria) {
        if (criteria['onChangeTo']) {
            if (criteria['onChangeTo'] == 'yes') return true;
            else return false;
        } else return false;
    }

    function changeOccurred(criteria) {
        var val = criteria['variable'];
        var prevVal = animationSet.getPrevInputs()[val];
        var curVarName = criteria['variable'];
        var currentVal = animationSet.getCurrentInputs()[curVarName];
        if (currentVal != prevVal) {
            if (criteria['value'] == '*') return true;
            else return (currentVal == criteria['value']);
        } else return false;
    }

    function inspectSelectionCriteria(sc, embedded, force) {
        var buff = [];
        var sep = '\n';
        for (var l in sc) {
            buff.push('selectionCriteria[');
            buff.push(l);
            buff.push('] = ');
            buff.push(sc[l]);
            buff.push(sep);
        }
        if (embedded) return buff.join('');
        else force == null ? debug(buff.join('')) : debugf(buff.join(''));
    }

    //#endregion

    //#region public functions

    this.getAnimationSet = function () {
        return animationSet;
    };

    this.addAnimationThreadElement = function (element) {
        threadElements.push(element);
        return this;
    };

    this.getAnimationElement = function (id) {
        return animationSet.getAnimationElement(id);
    };

    this.getFirstAnimationThreadElement = function () {
        return threadElements[0];
    };

    this.nextAnimationThreadElement = function (reset) {
        if (reset)
            this.resetCurrentThreadElementIndex();
        else this.incrementCurrentThreadElementIndex();
        if (this.getCurrentThreadElementIndex() >= threadElements.length) return null;
        else {
            var nextElement = threadElements[this.getCurrentThreadElementIndex()];
            return nextElement;
        }
    };

    this.getCurrentThreadElementIndex = function () {
        return currentThreadElementIndex;
    };

    this.setCurrentThreadElementIndex = function (num) {
        currentThreadElementIndex = Math.min(Math.max(0, num), threadElements.length);
    };

    this.incrementCurrentThreadElementIndex = function () {
        currentThreadElementIndex++;
    };

    this.resetCurrentThreadElementIndex = function () {
        currentThreadElementIndex = 0;
    };

    this.getRequiresInput = function () {
        return requiresInput;
    };

    this.setRequiresInput = function (newRequiresInput) {
        requiresInput = newRequiresInput;
    };

    this.addSelectionCriteria = function (attributes) {
        var criteriaAttr = [];
        for (var i = 0; i < attributes.length; i++) {
            criteriaAttr[attributes[i].nodeName] = attributes[i].nodeValue;
        }
        selectionCriteria.push(criteriaAttr);
    };

    this.getSelectionCriteria = function () {
        return selectionCriteria;
    };

    this.isSelected = function () {
        var result = true;
        var sc = this.getSelectionCriteria();
        if (Object.size(sc) == 0) result = true;  // no selection criteria specified evaluated to 'true'
        else {
            for (var i = 0; i < sc.length; i++) {
                var criterium = sc[i];
                if (onChangeToSpecified(criterium)) {
                    if (changeOccurred(criterium)) {  // changeOccurred returns true of false
                        if (!(criterium['variable'] in animationSet.getCurrentInputs()) || criterium['value'] != animationSet.getCurrentInputs()[criterium['variable']]) {
                            result = false;
                            break;
                        }
                    } else {
                        result = false;
                        break;
                    }
                }
                else {
                    if (!(criterium['variable'] in animationSet.getCurrentInputs()) || criterium['value'] != animationSet.getCurrentInputs()[criterium['variable']]) {
                        result = false;
                        break;
                    } else result = true;
                }
            }
        }
        return result;
    };

    this.startSimulation = function () {
        theSet.setCurrentThread(this);
        this.resetCurrentThreadElementIndex();
        this.renderNextThreadElement(true);
    };

    this.getSourceName = function () {
        return source;
    };


    this.renderNextThreadElement = function (startAtBeginning) {
        debug('In renderNextThreadElement -startAtBeginning = ' + startAtBeginning);
        if (startAtBeginning) currentThreadElement = this.getFirstAnimationThreadElement();
        else {
            currentThreadElement = this.nextAnimationThreadElement(false);
            if (!currentThreadElement) {
                dbg().logError(source, 'Could not get next AnimationThreadElement for currentThread = ' + this.getName());
                return null;
            }
        }
        debug('In renderNextThreadElement - currentThreadElement = ' + currentThreadElement.getName());
        currentElement = animationSet.getAnimationElement(currentThreadElement.getName());
        if (!currentElement) {
            dbg().logError(source, 'Could not get new current AnimationElement for currentThreadElement = ' + currentThreadElement.getName());
            return null;
        }
        else {
            debug('In renderNextThreadElement - currentElement = ' + currentElement.getName());
            currentElementName = currentElement.getName();
            if (!currentElementName) dbg().logWarning(source, 'Name is null for current AnimationElement in AnimationThread = ' + this.getName());
            switch (currentElement.getType()) {
                case Simulator.Constants.IMAGE_ANIMATION:
                    debug('In renderNextThreadElement - rendering image ' + currentElement.getSrc());
                    renderer().renderImage(currentElement, 'animationPanel', currentElement.getSrc(),
                                    currentElementName, currentThreadElement.getMaxTime(), this);
                    break;
                case 'animation':  // Deprecated! use Simulator.Constants.HTML5_ANIMATION instead
                case Simulator.Constants.HTML5_ANIMATION:
                    //if html5 playable
                    if (util().canPlayHtml5()) {
                        renderer().renderAnimation(currentElement, 'animationPanel', currentElement.getSrc(),
                                    util().getFileName(currentElement.getSrc()), currentThreadElement.getMaxTime(), this);
                    }
                    else if (currentElement.getAltSrcType() == Simulator.Constants.FLASH_ANIMATION) { // html5 not playable alt src provided
                        renderer().renderFlash(currentElement, 'animationPanel', currentElement.getAltSrc(),
                                    util().getFileName(currentElement.getAltSrc()), currentElement.getControls(),
                                    currentElementName, currentThreadElement.getMaxTime(), this);
                    }
                    break;
                case Simulator.Constants.FLASH_ANIMATION:
                    renderer().renderFlash(currentElement, 'animationPanel', currentElement.getSrc(),
                                    util().getFileName(currentElement.getSrc()), currentElement.getControls(),
                                    currentElementName, currentThreadElement.getMaxTime(), this);
                    break;
                case Simulator.Constants.HOTTEXT_ANIMATION:
                    renderer().renderHotText(currentElement, 'animationPanel', currentElement.getSrc(),
                                    '', currentElement.getControls(),
                                    currentElementName, currentThreadElement.getMaxTime(), this);
                    break;
            }
        }
        debug('In renderNextThreadElement - returning currentElement = ' + currentElement.getName());
        return currentElement;
    };


    this.inspect = function (embedded, force) {
        var buff = [];
        var sep = '\n\n';
        buff.push('Inspecting AnimationThread "'); buff.push(this.getName()); buff.push('"');
        buff.push(sep);
        for (var i in this) {
            if (i.substr(0, 3) == 'get') {
                buff.push(i);
                buff.push(' = ');
                buff.push(eval('this.' + i + '()'));
                buff.push(sep);
            }
        }
        buff.push(inspectSelectionCriteria(this.getSelectionCriteria(), true, force));
        buff.push('End of selectionCriteria');
        buff.push(sep);
        for (var i = 0; i < threadElements.length; i++) {
            switch (getConstructorName(threadElements[i].constructor.toString())) {
                case 'AnimationThreadElement':
                    buff.push(threadElements[i].inspect(true)); buff.push(sep);
                    break;
            }
        }
        buff.push('End of AnimationThread inspection');
        buff.push(sep);
        if (embedded) return buff.join('');
        else force == null ? debug(buff.join('')) : debugf(buff.join(''));
    };

    this.getCurrentElement = function () {
        debug('In getCurrentElement - returning ' + ((currentElement === null) ? null : currentElement.getName()));
        return currentElement;
    };

    this.setCurrentElement = function (element) {
        debug('In setCurrentElement - setting lastExecutedAnimationElement to currentElement: ' + ((currentElement === null) ? 'null' : currentElement.getName()));
        lastExecutedAnimationElement = currentElement;
        debug('In setCurrentElement - setting currentElement to ' + ((element === null) ? 'null' : element.getName()));
        currentElement = element;
    };

    this.getLastExecutedAnimationElement = function () {
        return lastExecutedAnimationElement;
    };

    this.setAttributes = function (attr, node) {
        if (node) attr = util().getAttributes(node);
        Simulator.Animation.AnimationThread.prototype.setAttributes.call(this, attr, node);
        for (var i in attr) {
            switch (i) {
                case 'maxTime':
                    this.setmaxTime(attr[i]);
                    break;
                case 'requiresInput':
                    this.setRequiresInput(attr[i]);
                    break;
                case 'completionPendingOnOutput':
                    this.setCompletionPendingOnOutput(attr[i]);
                    break;
            }
        }
        var threadElements = node.childNodes;
        for (var i = 0; i < threadElements.length; i++) {
            switch (threadElements[i].nodeName) {
                case 'selectionClause':
                    var clauseElements = threadElements[i].childNodes;
                    for (var j = 0; j < clauseElements.length; j++) {
                        if (clauseElements[j].nodeName[0] != '#') this.addSelectionCriteria(clauseElements[j].attributes);
                    }
                    break;
            }
        }
    };

    //#endregion

    //#region Convenience functions for debugging
    function debug(str1, str2, trace) {
        dbg().debug(source, str1, str2, trace);
    }

    function debugf(str1, str2) {
        dbg().debugf(source, str1, str2, trace);
    }
    //#endregion 

};

// Inherit methods and class variables
Simulator.Animation.AnimationThread.prototype = new Simulator.SimElement();
Simulator.Animation.AnimationThread.parent = Simulator.SimElement;
Simulator.Animation.AnimationThread.prototype.constructor = Simulator.Animation.AnimationThread; // Reset the prototype to point to the current class