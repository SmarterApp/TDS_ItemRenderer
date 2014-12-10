/** **************************************************************************
* @class AnimationThreadElement
* @superclass SimElement
* @param sim, panel, section, animationSet, animationThread
* @return AnimationThreadElement instance
* Creates a new AnimationThreadElement class.
*****************************************************************************
*/

Simulator.Animation.AnimationThreadElement = function (sim, panel, section, animationSet, animationThread) {

    Simulator.SimElement.call(this, sim);

    //#region private variables
    
    var source = 'AnimationThreadElement';
    var selectionCriteria = [];
    var prevInputs = [];
    var currentInputs = [];
    var maxTime = -1;

    //#endregion

    //#region function calls in the constructor

    this.setEname(source);

    //#endregion

    //#region private functions

    var util = function () { return sim.getUtils(); };
    var whiteboard = function() { sim.getWhiteboard(); };
    var dbg = function () { return sim.getDebug(); };
    var simDocument = function() { return sim.getSimDocument(); };

    function storeInputs(backupInputs) {
        var inputs = whiteboard.getCategory('dataInputs');
        setPrevInputs();
        if (Object.size(inputs) > 0) {
            setPrevInputs();
            for (var r in inputs) {
                currentInputs[r] = inputs[r];
            }
        }
    }

    function setPrevInputs() {
        for (var p in currentInputs) {
            prevInputs[p] = currentInputs[p];
        }
    }

    function onChangeToSpecified(criteria) {
        if (criteria['onChangeTo']) {
            if (criteria['onChangeTo'] == 'yes') return true;
            else return false;
        } else return false;
    }

    function changeOccurred(criteria) {
        var prevVal = animationSet.getPrevInputs()[criteria['variable']];
        var curVarName = criteria['variable'];
        var currentVal = animationSet.getCurrentInputs()[curVarName];
        if (currentVal != prevVal) {
            if (criteria['value'] == '*') return true;
            else return (currentVal == criteria['value']);
        } else return false;
    }

    function inspectSelectionCriteria (criteria, embedded, force) {
        var buff = [];
        var sep = '\n\n';
        buff.push('Inspecting Selection Criteria:');
        buff.push(sep);
        for (var l in criteria) {
            buff.push('selectionCriteria[');
            buff.push(l);
            buff.push(']: '); buff.push(sep);
            for (var p in criteria[l]) {
                buff.push('['); buff.push(p); buff.push('] = '); buff.push(criteria[l][p]); buff.push(sep);
            }
        }
        buff.push('End of selectionCriteria');
        buff.push(sep);
        if (!embedded)
            (force == null) ? debug(buff.join('')) : debugf(buff.join(''));
        return buff.join('');
    };

    //#endregion

    //#region public functions

    this.getMaxTime = function () {
        return maxTime;
    };

    this.setMaxTime = function (newMaxTime) {
        maxTime = newMaxTime;
    };

    this.getAnimationThread = function () {
        return animationThread;
    };

    this.getAnimationSet = function () {
        return animationSet;
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
        var scSize = Object.size(sc);
        var inputSize = Object.size(animationSet.getCurrentInputs());
        if (scSize == 0) result = true;  // no selection criteria specified evaluated to 'true'
        else if (scSize != inputSize) result = false;
        else {
            for (var i = 0; i < inputSize; i++) {
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
                    }
                }
            }
        }
        return result;
    };
    
    this.getSourceName = function() {
        return source;
    };

    this.inspect = function (embedded, force) {
        var buff = [];
        var sep = '\n\n';
        buff.push('Inspecting ');
        buff.push(this.getEname());
        buff.push(': ');
        buff.push(this.getName());
        buff.push(sep);

        for (var i in this) {
            if (i.substr(0, 3) == 'get') {
                buff.push(i);
                buff.push(' = ');
                buff.push(eval('this.' + i + '()'));
                buff.push(sep);
            }
        }
        buff.push(inspectSelectionCriteria(selectionCriteria, true));
        buff.push(sep);
        buff.push('end of AnimationThreadElement Inspection'); buff.push(sep);
        if (!embedded)
            (force == null) ? debug(buff.join('')) : debugf(buff.join(''));
        return buff.join('');
    };

    this.setAttributes = function (attr, node) {
        if (node) attr = util().getAttributes(node);
        Simulator.Animation.AnimationThreadElement.prototype.setAttributes.call(this, attr, node);
        for (var i in attr) {
            switch (i) {
               case 'maxTime':
                    this.setMaxTime(attr[i]);
                    break;
                default:
                    continue;
            }
        }
        var threadElements = node.childNodes;
        for (var i = 0; i < threadElements.length; i++) {
            if (threadElements[i].nodeName[0] != '#') {
                switch (threadElements[i].nodeName) {
                    case 'selectionClause':
                        var clauseElements = threadElements[i].childNodes;
                        for (var j = 0; j < clauseElements.length; j++) {
                            if (clauseElements[j].nodeName[0] != '#') this.addSelectionCriteria(clauseElements[j].attributes);
                        }
                        break;
                }
            }
        }
    };

   this.render = function (panelName, currentElementName, maxTime, thread) {
        var aThread = this.getAnimationThread();
        var element = aThread.getAnimationElement(this.getName());
        debug('In render - Attempting to render element "' + (element === null) ? null : element.getName() + '"');
        element.render(panelName, currentElementName, maxTime, thread);
    };

    //#endregion

    //#region Convenience functions for debugging
    function debug(str1, str2, trace) {
        dbg().debug(source, str1, str2, trace);
    }

    function debugf(str1, str2, trace) {
        dbg().debugf(source, str1, str2, trace);
    }
    //#endregion 
};

//Inherit methods and class variables
Simulator.Animation.AnimationThreadElement.prototype = new Simulator.SimElement();
Simulator.Animation.AnimationThreadElement.parent = Simulator.SimElement;
Simulator.Animation.AnimationThreadElement.prototype.constructor = Simulator.Animation.AnimationThreadElement; // Reset the prototype to point to the current class