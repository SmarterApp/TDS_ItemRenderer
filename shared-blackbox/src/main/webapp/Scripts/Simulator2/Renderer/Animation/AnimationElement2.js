//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
/** **************************************************************************
* @class AnimationElement
* @superclass SimElement
* @param none
* @return AnimationElement instance
* Creates a new AnimationElement class.
*****************************************************************************
*/
Simulator.Animation.AnimationElement = function (sim) {

    Simulator.SimElement.call(this, sim);

    //#region private variables
    var source = 'AnimationElement';
    var controls = '';
    var src = '';
    var altSrc = '';
    var altSrcType = '';
    var altText = '';
    var behavior = 'timeline';
    var inlineDataID = '';
    var interactive = false;

    //#endregion
    //#region function calls in the constructor
    this.setEname(source);

    //#endregion
    //#region private functions

    var util = function () { return sim.getUtils(); };
    var simDocument = function () { return sim.getSimDocument(); };
    var dbg = function () { return sim.getDebug(); };
    var simMgr = function () { return sim.getSimulationManager(); };
    var transDictionary = function () { return sim.getTranslationDictionary(); };

    //#endregion
    //#region public functions
    this.getControls = function () {
        return controls;
    };

    this.setControls = function (newControls) {
        controls = newControls == 'yes' ? 'controls' : '';
        return this;
    };

    this.getSrc = function () {
        var transSrc = transDictionary().translate(src);
        return transSrc;
    };

    this.setSrc = function (newSrc) {
        var filename = util().getFileName(transDictionary().translate(newSrc), true);
        if (filename == 'inlineData') src = '';
        else src = newSrc;
        return this;
    };

    this.getAltSrc = function () {
        var transAltSrc = transDictionary().translate(altSrc);
        return transAltSrc;
    };

    this.setAltSrc = function (newAltSrc) {
        var filename = util().getFileName(transDictionary().translate(newAltSrc), true);
        if (filename == 'inlineData') altSrc = '';
        else altSrc = newAltSrc;
        return this;
    };

    this.getAltSrcType = function () {
        return altSrcType;
    };

    this.setAltSrcType = function (newAltSrcType) {
        altSrcType = newAltSrcType;
        return this;
    };

    this.setAltText = function (newAltText) {
        altText = newAltText;
        return this;
    };

    this.getAltText = function () {
        return altText;
    };

    this.setInteractive = function (newInteractive) {
        interactive = (newInteractive == "yes") ? true : false;
        if (interactive) behavior = Simulator.Constants.INTERACTIVE_ANIMATION;
        return this;
    };

    this.getInteractive = function () {
        return interactive;
    };

    this.getBehavior = function () {
        return behavior;
    };

    this.setBehavior = function (newBehavior) {
        behavior = newBehavior;
        if (behavior === Simulator.Constants.INTERACTIVE_ANIMATION) interaction = true;
        return this;
    };

    this.setInlineDataID = function (newInlineDataID) {
        inlineDataID = newInlineDataID;
        return this;
    };

    this.getInlineDataID = function () {
        return inlineDataID;
    };

    this.setAttributes = function (attr, node) {
        if (node) attr = util().getAttributes(node);
        Simulator.Animation.AnimationElement.prototype.setAttributes.call(this, attr, node);
        for (var i in attr) {
            switch (i) {
                case 'controls':
                    this.setControls(attr[i]);
                    break;
                case 'src':
                    this.setSrc(attr[i]);
                    break;
                case 'altSrc':
                    this.setAltSrc(attr[i]);
                    break;
                case 'altSrcType':
                    this.setAltSrcType(attr[i]);
                    break;
                case 'altText':
                    this.setAltText(attr[i]);
                    break;
                case 'behavior':
                    this.setBehavior(attr[i]);
                    break;
                case "interactive":  // DEPRICATED USE 'behavior="interactive' INSTEAD
                    this.setInteractive(attr[i]);
                    break;
                default:
                    continue;
            }
        }
    };

    this.getSourceName = function () {
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
        if (embedded) return buff.join('');
        else force == null ? debug(buff.join('')) : debugf(buff.join(''));

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
Simulator.Animation.AnimationElement.prototype = new Simulator.SimElement();
Simulator.Animation.AnimationElement.parent = Simulator.SimElement;
Simulator.Animation.AnimationElement.prototype.constructor = Simulator.Animation.AnimationElement; // Reset the prototype to point to the current class
