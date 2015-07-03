//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
/** **************************************************************************
* @class Utils
* @superclass none
* @param none
* @return Utils instance
* Note: Singleton Class - instantiated only in the Simulator.Simulator's constructor.
*****************************************************************************
*/

Simulator.Utils.Utils = function (sim) {
    var source = 'Utils';

    var timeMark = 0;
    var IE = 'Microsoft Internet Explorer';
    var MSIE = 'MSIE';
    var FIREFOX = 'Firefox';
    var CHROME = 'Chrome';
    var OPERA = 'Opera';
    var SAFARI = 'Safari';
    var sequenceNumber = 0;

    var dbg = function () { return sim.getDebug(); };

    this.getChildElement = function (id, numChild) {
        var HTMLElement = document.getElementById(id);
        var num = 0;
        var child = null;
        if (HTMLElement) {
            var children = HTMLElement.childNodes;
            if (chldren.length > 0) {
                for (var i = 0; i < children.length; i++) {
                    child = children[i];
                    if (child.nodeName[0] != '#') {
                        if (num == numChild) return child;
                        else num++;
                    }
                }
                return null;  // could not find child numChild
            } else return HTMLElement;
        } else dbg().logError(source, 'Could not get HTMLElement');
    };

    this.applyFilter = function (functionName, data) {
        var result = null;
        var elements = [];
        switch (functionName) {
            case 'max':
                result = Math.max.apply(Math, data);
                break;
            case 'min':
                result = Math.min.apply(Math, data);
                break;
            case 'first':
                result = data[0];
                break;
            case 'last':
                result = data[data.length - 1];
                break;
            case 'average':
                var sum = 0;
                for (var i = 0; i < data.length; i++) {
                    sum += parseFloat(data[i]);
                }
                result = sum / data.length;
                break;
            case 'sum':
                var sum = 0;
                for (var i = 0; i < data.length; i++) {
                    sum += parseFloat(data[i]);
                }
                result = sum;
                break;
            case 'numNonZero':
                var num = 0;
                for (var i = 0; i < data.length; i++) {
                    if (data[i] !== 0) num++;
                }
                result = num;
                break;
            case 'zeroNotNull':
                if (data[0] == 'null') result = '0';
                else result = data[0];
                break;
            case 'blankNotNull':
                if (data[0] === 'null') result = Simulator.Constants.NO_DATA_INDICATOR;
                else result = data[0];
                break;
            case 'blankNotZero':
                if (parseFloat(data[0]) == 0) result = Simulator.Constants.NO_DATA_INDICATOR;
                else result = data[0];
                break;
            default:
                if (functionName.substr(0, 4) == 'set[') {
                    var resultArray = [];
                    elements = functionName.replace(/set\s*\[/, '');
                    elements = elements.replace(/\s*\]$/, '');
                    //parts = elements.split(',');
                    var parts = functionName.substr(4).split(',');
                    for (var i = 0; i < parts.length; i++) {
                        resultArray.push(data[parseInt(parts[i])]);
                    }
                    result = resultArray.join(',');
                }
        }
        return result;
    };

    this.getFileName = function (path, includeExtension) {
        var filename = path.substring(path.lastIndexOf('/') + 1);
        var index = filename.lastIndexOf('.');
        if (!includeExtension) filename = filename.substring(0, index);
        return filename;
    };

    this.getElementsByClassName = function (classname, node) {
        if (!node) node = document.getElementsByTagName('body')[0];
        var a = [];
        var re = new RegExp('\\b' + classname + '\\b');
        var els = node.getElementsByTagName('*');
        for (var i = 0, j = els.length; i < j; i++)
            if (re.test(els[i].className)) a.push(els[i]);
        return a;
    };

    this.getElementsByTagValue = function (node, tagName, tagValue) {
        if (!node) node = document.getElementsByTagName('body')[0];
        var a = [];
        var els = node.getElementsByTagName(tagName);
        for (var i = 0; j < els.length; i++)
            if (els[i].nodeValue == tagValue) a.push(els[i]);
        return a;
    };

    this.associationStoreToString = function (associationStore, sep) {
        buff = [];
        num = 0;
        for (var i in associationStore) {
            if (associationStore.hasOwnProperty(i)) {
                if (num > 0) buff.push(', ');
                if (sep) buff.push('\n');
                buff.push(i); buff.push(': '); buff.push(associationStore[i]);
                num++;
            }
        }

        return buff.join('');
    };

    this.assocArrayIsEmpty = function (theArray) {
        for (var i in theArray) {
            if (i) {
                if (theArray.hasOwnProperty(i))
                    return false;
            }
        }
        return true;
    };

    this.appendText = function (node, txt, noBreak) {
        if (!noBreak) {
            node.innerHTML = node.innerHTML + '<br>';
        }
        node.appendChild(document.createTextNode(txt));
        if (!noBreak) {
            node.innerHTML = node.innerHTML + '<br>';
        }
    };

    this.appendBlankVertcalSpace = function (parentElement, theNum) {
        var num = 1;
        var newBreak = null;
        if (theNum) num = theNum;
        for (var i = 0; i < num; i++) {
            newBreak = document.createElement('br');
            newBreak.style.border = 'none';
            parentElement.appendChild(newBreak);
        }
    };

    this.appendElement = function (node, tag, id, htm) {
        var ne = document.createElement(tag);
        if (id) ne.id = id;
        if (htm) ne.innerHTML = htm;
        node.appendChild(ne);
    };

    this.getNextSequenceNumber = function () {
        return ++sequenceNumber;
    };

    this.replaceAll = function (inThisString, replaceThis, withThis) {
        var re = new RegExp('[' + replaceThis + ']', 'g');
        return inThisString.replace(re, withThis);
    };

    this.setObjectDimensions = function (governingObject, subjectObject) {
        var dimensions = setDimensions(governingObject.height, governingObject.width, subjectObject.height, subjectObject.width);
        subjectObject.height = dimensions.height;
        subjectObject.width = dimensions.width;
    };

    this.removeHeadingAndTrailingQuotes = function (theString, theTypeOfQuotes) {
        var fIndex, lIndex, strLength;
        var typeOfQuotes = 'both';
        if (theTypeOfQuotes) typeOfQuotes = theTypeOfQuotes;
        if (theString) theString = theString.trim();
        if (typeOfQuotes === 'double' || typeOfQuotes === 'both') {
            fIndex = theString.indexOf('"');
            lIndex = theString.lastIndexOf('"');
            strLength = theString.length;
            if (fIndex == 0 && lIndex == strLength - 1)
                theString = theString.substr(1, lIndex - 1);
        }
        if (typeOfQuotes === 'single' || typeOfQuotes === 'both') {
            fIndex = theString.indexOf("'");
            lIndex = theString.lastIndexOf("'");
            strLength = theString.length;
            if (fIndex == 0 && lIndex == strLength - 1)
                theString = theString.substr(1, lIndex - 1);
        }
        return theString;
    };


    this.setDimensions = function (governingObjectHeight, governingObjectWidth, subjectObjectHeight, subjectObjectWidth, padding) {
        var x = subjectObjectHeight / governingObjectHeight;
        var y = subjectObjectWidth / governingObjectWidth;
        var z = subjectObjectHeight / subjectObjectWidth;    // Get proportion
        if (!padding)
            padding = 0;
        if (x >= y) {   // height is the constraining dimension for the subject image
            subjectObjectHeight = governingObjectHeight;
            subjectObjectWidth = subjectObjectHeight / z;
        } else {       // width is the constraining dimension for the subject image
            subjectObjectWidth = governingObjectWidth;
            subjectObjectHeight = subjectObjectWidth * z;
        }

        var dimensions = {};
        if (z > 1) {  // if the image height is larger than width, set the final width for padding , then height
            dimensions.width = subjectObjectWidth - padding;
            dimensions.height = dimensions.width * z;
        } else {  // otherwise, set the final heigth for padding, then width
            dimensions.height = subjectObjectHeight - padding;
            dimensions.width = dimensions.height / z;
        }
        return dimensions;
    };


    this.elementInArray = function (array, element, isSubstring) {
        for (var i = 0; i < array.length; i++) {
            if (!isSubstring) if (array[i] == element) return true;
            else if (array[i].indexOf(element) != -1) return true;
        }
        return false;
    };

    // Get all attributes associated with the element 
    this.getAttributes = function (node) {
        var attr = [];
        var attributes = node.attributes;
        if (attributes != null && attributes != undefined) {
            for (var j = 0; j < attributes.length; j++) {
                var id = attributes[j].nodeName;
                attr[id] = attributes[j].nodeValue;
            }
        }
        return attr;
    };


    this.getNumberLength = function (num) {
        var str = num + '';
        return str.length;
    };

    this.isInternetExplorer = function () {
        return navigator.userAgent.indexOf(MSIE) != -1;
    };

    this.isIE8orBelow = function () {
        var info = this.getBrowserInfo(['name', 'major version'], null);  // if sep parameter is null -> return the array
        return (info['name'] === IE && parseInt(info['major version']) < 9);
    };

    this.isFireFox = function () {
        return navigator.userAgent.indexOf(FIREFOX) != -1;
    };

    this.isChrome = function () {
        return navigator.userAgent.indexOf(CHROME) != -1;
    };

    this.isOpera = function () {
        return navigator.userAgent.indexOf(OPERA) !== -1;
    };

    this.isSafari = function () {
        return navigator.userAgent.indexOf(SAFARI) !== -1;
    };

    this.getBrowserInfo = function (infoArray, sep) {
        var nVer = navigator.appVersion;
        var nAgt = navigator.userAgent;
        var browserName = navigator.appName;
        var fullVersion = '' + parseFloat(navigator.appVersion);
        var majorVersion = parseInt(navigator.appVersion, 10);
        var nameOffset, verOffset, ix;

        // In Opera, the true version is after 'Opera' or after 'Version'
        if ((verOffset = nAgt.indexOf(OPERA)) !== -1) {
            browserName = opera;
            fullVersion = nAgt.substring(verOffset + 6);
            if ((verOffset = nAgt.indexOf('Version')) !== -1)
                fullVersion = nAgt.substring(verOffset + 8);
        }
        // In MSIE, the true version is after 'MSIE' in userAgent
        else if ((verOffset = nAgt.indexOf(MSIE)) !== -1) {
            browserName = IE;
            fullVersion = nAgt.substring(verOffset + 5);
        }
        // In Chrome, the true version is after 'Chrome'
        else if ((verOffset = nAgt.indexOf(CHROME)) !== -1) {
            browserName = CHROME;
            fullVersion = nAgt.substring(verOffset + 7);
        }
        // In Safari, the true version is after 'Safari' or after 'Version'
        else if ((verOffset = nAgt.indexOf(SAFARI)) !== -1) {
            browserName = SAFARI;
            fullVersion = nAgt.substring(verOffset + 7);
            if ((verOffset = nAgt.indexOf('Version')) !== -1)
                fullVersion = nAgt.substring(verOffset + 8);
        }
        // In Firefox, the true version is after 'Firefox'
        else if ((verOffset = nAgt.indexOf(FIREFOX)) !== -1) {
            browserName = FIREFOX;
            fullVersion = nAgt.substring(verOffset + 8);
        }
        // In most other browsers, 'name/version' is at the end of userAgent
        else if ((nameOffset = nAgt.lastIndexOf(' ') + 1) <
            (verOffset = nAgt.lastIndexOf('/'))) {
            browserName = nAgt.substring(nameOffset, verOffset);
            fullVersion = nAgt.substring(verOffset + 1);
            if (browserName.toLowerCase() === browserName.toUpperCase()) {
                browserName = navigator.appName;
            }
        }
        // trim the fullVersion string at semicolon/space if present
        if ((ix = fullVersion.indexOf(';')) !== -1)
            fullVersion = fullVersion.substring(0, ix);
        if ((ix = fullVersion.indexOf(' ')) !== -1)
            fullVersion = fullVersion.substring(0, ix);

        majorVersion = parseInt('' + fullVersion, 10);
        if (isNaN(majorVersion)) {
            fullVersion = '' + parseFloat(navigator.appVersion);
            majorVersion = parseInt(navigator.appVersion, 10);
        }

        buff = [];
        if (!sep) sep = ' ';
        for (var i = 0; i < infoArray.length; i++) {
            switch (infoArray[i]) {
                case 'name': buff.push('Name  = ' + browserName);
                    break;
                case 'major version': buff.push('Major version = ' + majorVersion);
                    break;
                case 'full version': buff.push('Full version = ' + fullVersion);
                    break;
                case 'appName': buff.push('App Name = ' + navigator.appName);
                    break;
                case 'agent': buff.push('User Agent = ' + navigator.userAgent);
                    break;
                case 'platform': buff.push('Platform = ' + navigator.platform);
                    break;
            }
        }

        return buff.join(sep);
    };

    this.markTime = function () {
        var d = new Date;
        timeMark = d.getTime();
    };

    this.getElapsedTime = function () {
        var d = new Date;
        var nowTime = d.getTime();
        return nowTime - timeMark;
    };

    this.getClass = function (obj) {
        if (typeof obj === "undefined")
            return "undefined";
        if (obj === null)
            return "null";
        else return Object.prototype.toString.call(obj).match(/^\[object\s(.*)\]$/)[1];
    };

    this.getJSObjName = function (obj) {
        if (!obj) return null;
        else if (obj.getName) return obj.getName();
        else if (obj.name) return obj.name;
        else return this.getJSObjNameViaConstructor(obj);
    };

    this.getJSObjNameViaConstructor = function (obj) {
        var str = obj.constructor.name;
        if (!str) str = obj.constructor.toString();
        var index = str.indexOf('(');
        if (index > -1) {
            str = str.substring(0, index);
            index = str.indexOf('function');
            if (index == 0) str = str.substring('function'.length);
        }
        return str.trim();
    };

    this.createTimeOutCallbackStr = function (obj, fctn, args) {
        var buff = [];
        buff.push(obj);
        buff.push('.');
        buff.push(fctn);
        buff.push('(\'');
        buff.push(args);
        buff.push('\')');
        return buff.join('');
    };

    this.bindEvent = function (el, event, handler) {
        if (el.addEventListener)
            el.addEventListener(event, handler, false);

        else if (el.attachEvent)
            el.attachEvent("on" + event, handler);
    }

    this.canPlayHtml5 = function () {
        // if IE older than IE 9, can not play Swiffy
        if (YAHOO.env.ua.ie > 0 &&
            YAHOO.env.ua.ie < 9) return false;

        // if FF older than FF 4.0, can not play Swiffy
        if (Util.Browser.getFirefoxVersion() > 0 &&
            Util.Browser.getFirefoxVersion() < 4) return false;

        return true;
    }

    // Convenience functions for debugging
    function debug(str1, str2, trace) {
        dbg().debug(source, str1, str2, trace);
    }

    function debugf(str1, str2, trace) {
        dbg().debugf(source, str1, str2, trace);
    };

};
