//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
﻿
// HTML Retagger algorithm.  Retag HTML so that word list open/close
// spans don't have overlapping tags.  In the simplest case:
// <wl-start/>
// <p1/>
// <p2/>
// <wl-end/>
// becomes
// <wl-start><p1/> <p2/> </wl-start>
//
// cases where wl-end is child of sibling, or
// where wl-end is sibling of parent node make it more complicated.
//
// Usage: var ret = new Retagger(startElement, "data-end-str");
//        ret.retag();
// astartElement - an element
// endAttribute - string of attribute that marks end
function Retagger(astartElement) {    
    var endSibling = null;
    var _startElement = astartElement;

    // This actually performs the verb of retagging.
    this.Retag = function () {
        debugLog(0, _startElement, "Retagging entry")
        RetagSiblings(astartElement, false, 0);
    };

    // Make elements contained in innerElements child nodes of startElement.
    // Before callng, they are siblings.
    var consumeInners = function (startElement, innerElements, level) {
        if ((startElement == null) ||
            (innerElements.length == 0)) {
            return;
        }
        debugLog(level, startElement, "consumeInners: make sibs children of ");
        
        for (var i = 0; i < innerElements.length; ++i) {
            var newNode = innerElements[i].cloneNode(true);
            debugLog(level, newNode, "consumeInners: adding child ");
            startElement.appendChild(newNode);
            innerElements[i].parentNode.removeChild(innerElements[i]);
        }
    };

    // Recursive treasure hunt.  Look in the children of peerElement.  
    // If a child  (or child of child etc.) contains the end attribute 
    // passed into the constructor, return true.  Else return false.
    var doesChildContainEnd = function (startElement,peerElement) {
        var child = YUD.getFirstChild(peerElement);
        if (child == null)
            return false;

        while (child) {
            if (isEndElement(startElement, child)) {
                return true;
            }
            
            // recursively look for end tag in the child element
            if (doesChildContainEnd(startElement, child)) {
                return true;
            }
            child = child.nextSibling;
        }
        return false;
    };

    // Debugging.  If global debugging flag is not set (default), don't do anything.
    // It's handy to be able to debug recursive functions.  But it's expensive so it is 
    // off by default.
    var debugLog = function (level, obj, str) {
        if (Retagger.verboseDebug) {
            var props = ["outerHTML", "nodeType", "nodeName", "nodeValue"];
            var op = "";

            if ((typeof(obj) == "object") && (obj != null)) {
                for (var i = 0; i < props.length; ++i) {
                    var pp = props[i];
                    if ((obj[pp] != undefined) && (obj[pp] != null)) {
                        op = op + " " + pp + ":" + obj[pp];
                    }
                }
            }
            if (str != null) {
                op = str + ":" + op;
            }
            console.log("lvl: " + level + " " + op);
        }
    };

    var isEndElement = function (startElement, endElementTest) {
        if ((YUD.getAttribute(endElementTest,"data-tag-boundary") == "end") &&
            (YUD.getAttribute(endElementTest,"data-tag-ref") == YUD.getAttribute(startElement,"id"))) {
            return true;
        }
        return false;
    };

    ///////// Main recursive entry point //////    
    var RetagSiblings = function (startElement, endFound, level) {
        var isParentElement = false;
        var innerElements = [];

        if (startElement == null)
            return;

        var sib = startElement.nextSibling;

        while (sib != null) {
            debugLog(level, sib, "Iterating");

            // Is this the end span?
            if (isEndElement(startElement,sib)) {
                debugLog(level, sib, "Found end span in sib");
                endSibling = sib;
                break;
            }

            // Is this end span in a child node of a sibling?
            if ((level >= 0) && (doesChildContainEnd(startElement,sib))) {
                debugLog(level, sib, "Found end span in child");
                isParentElement = true;
                endSibling = sib;
                break;
            }

            debugLog(level, sib, "Sib neither child nor parent, pushing");
            innerElements.push(sib);

            sib = sib.nextSibling;
        }

        // End sibling is siblings of start, or a child of sibling.
        if (endSibling != null) {
            // End sibling is a sibling of a child of my sibling.  Recursivly
            // retag the children.
            if (isParentElement) {
                var newStartElem = startElement.cloneNode(false);
                var child = endSibling.firstChild;
                endSibling.insertBefore(newStartElem, child);
                debugLog(level, newStartElem, "recursively calling retag on child");
                RetagSiblings(newStartElem, true, level + 1);
            }
            consumeInners(startElement, innerElements, level);
            if (!isParentElement) {
                debugLog(level, endSibling, "End tag found at this level, removing.");
                endSibling.parentNode.removeChild(endSibling);
            }
        }
        // End sibling is a sibling of a parent of mine, so keep retagging
        // until the end is found.
        else if (endFound == false) {
            consumeInners(startElement, innerElements, level);
            sib = startElement.parentNode;
            // Sanity check - is the end node missing altogether?
            if ((sib == null) || (sib.parentNode == null) || 
                ((sib.nodeName != undefined && (sib.nodeName == 'FORM') ||
                                               (sib.nodeName == 'BODY'))
                )
               ){
                debugLog(level, sib, " endtag not found");
                return;
            }
            newStartElem = startElement.cloneNode(false);
            sib.parentNode.insertBefore(newStartElem,sib.nextSibling);
            debugLog(level, sib, "End tag not found, looking in sibling of parent");
            RetagSiblings(newStartElem, false, level - 1);
        }
    };
}

Retagger.verboseDebug = false;
