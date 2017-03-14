//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
﻿/*
These are fixes for YUI 2. Most of them have to do with touch support.
*/

// Fix for YUI2 dragdrop to allow for a scroll container
(function(YAHOO) {

    var DD = YAHOO.util.DD;
    var DDM = YAHOO.util.DragDropMgr;

    // draw a box for debugging purposes
    function drawBox(id, x, y, h, w) {

        var el = document.getElementById(id);

        if (el == null) {
            el = document.createElement('box');
            el.setAttribute('id', id);
            el.style.position = 'absolute';
            el.style.border = '3px solid red';
            el.style.zIndex = '99999';
            el.style.pointerEvents = 'none';
            document.body.appendChild(el);
        }

        el.style.left = x + 'px';
        el.style.top = y + 'px';
        el.style.height = h + 'px';
        el.style.width = w + 'px';
    }

    // remove a box
    function removeBox(id) {
        var el = document.getElementById(id);
        if (el == null) {
            Util.Dom.removeNode(el);
        }
    }

    // returns the appropriate document.
    function getElDoc(element) {
        return (element['nodeType'] === 9) ? element : // element === document
            element['ownerDocument'] || // element === DOM node
            element.document || // element === window
            document; // default
    }

    /**
     * Amount page has been scroll horizontally 
     * @method docScrollX
     * @return {Number} The current amount the screen is scrolled horizontally.
     */
    function docScrollX(node, doc) {
        doc = doc || (node) ? getElDoc(node) : document; // Y.config.doc; // perf optimization
        var dv = doc.defaultView,
            pageOffset = (dv) ? dv.pageXOffset : 0;
        return Math.max(doc['documentElement'].scrollLeft, doc.body.scrollLeft, pageOffset);
    }

    /**
     * Amount page has been scroll vertically 
     * @method docScrollY
     * @return {Number} The current amount the screen is scrolled vertically.
     */
    function docScrollY(node, doc) {
        doc = doc || (node) ? getElDoc(node) : document; // Y.config.doc; // perf optimization
        var dv = doc.defaultView,
            pageOffset = (dv) ? dv.pageYOffset : 0;
        return Math.max(doc['documentElement'].scrollTop, doc.body.scrollTop, pageOffset);
    }

    // get the scrollLeft for an element
    function getScrollLeft(node) {
        return ('scrollLeft' in node) ? node.scrollLeft : docScrollX(node);
    }

    // get the scrollTop for an element
    function getScrollTop(node) {
        return ('scrollTop' in node) ? node.scrollTop : docScrollY(node);
    }

    // The number of pixels from the edge of the screen to turn on scrolling. Default: 30
    DD.prototype.setScrollBuffer = function (value) {
        this._scrollBuffer = value;
    }

    DD.prototype.getScrollBuffer = function () {
        return this._scrollBuffer || 20;
    }

    // The number of milliseconds delay to pass to the auto scroller. Default: 235
    DD.prototype.setScrollDelay = function (value) {
        this._scrollDelay = value;
    }

    DD.prototype.getScrollDelay = function () {
        return this._scrollDelay || 150;
    }

    DD.prototype.setScrollDirection = function (horizontal, vertical) {
        this._scrollHorizontal = horizontal;
        this._scrollVertical = vertical;
    }

    DD.prototype.isScrollHorizontal = function () {
        return this._scrollHorizontal || false;
    }

    DD.prototype.isScrollVertical = function () {
        return this._scrollVertical || false;
    }

    DD.prototype.isWindowScroll = function() {
        return this._parentScroll == null || this._parentScroll == window;
    };

    /**
    *  Internal set and get, not used by top level clients to preserve compat with pure YUI2 libs or
    * cases where util_mobile.js is not pulled in for some reason.
    */
    DD.prototype.getParentScroll = function() {
        return this._parentScroll || window;
    };

    DD.prototype.setParentScroll = function(element) {
        this._parentScroll = element;
    };

    // return the region dimensions of the scroll viewport (_getVPRegion)
    DD.prototype._getVPRegion = function() {

        var el = this.getParentScroll(), // window or element
            b = this.getScrollBuffer(),
            ws = this.isWindowScroll(),
            xy = ((ws) ? [] : YUD.getXY(el)),
            width = ((ws) ? YUD.getViewportWidth() : el.offsetWidth),
            height = ((ws) ? YUD.getViewportHeight() : el.offsetHeight),
            top = ((ws) ? getScrollTop(el) : xy[1]),
            left = ((ws) ? getScrollLeft(el) : xy[0]);

        return {
            top: top + b,
            right: (width + left) - b,
            bottom: (height + top) - b,
            left: left + b
        };
    };

    DD.prototype._initScroll = function() {
        var scrollDelay = this.getScrollDelay();
        this._cancelScroll();
        this._scrollTimer = YAHOO.lang.later(scrollDelay, this, this._checkWinScroll, [true], true);
    };

    DD.prototype._cancelScroll = function() {
        if (this._scrollTimer) {
            this._scrollTimer.cancel();
            delete this._scrollTimer;
        }
    };

    DD.prototype._checkWinScroll = function(move) {

        // if we aren't currently dragging then stop our timer
        if (this != DDM.dragCurrent) {
            this._cancelScroll();
            return;
        }

        // get drag element region
        var dragEl = this.getDragEl(),
            dragHeight = dragEl.offsetHeight,
            dragWidth = dragEl.offsetWidth,
            dragXY = YUD.getXY(dragEl),
            dragBottom = dragXY[1] + dragHeight,
            dragTop = dragXY[1],
            dragRight = dragXY[0] + dragWidth,
            dragLeft = dragXY[0];

        // get viewport element region
        var parentRegion = this._getVPRegion(),
            parentEl = this.getParentScroll(), // get the scroll container (window or an element)
            parentScrollTop = getScrollTop(parentEl),
            parentScrollLeft = getScrollLeft(parentEl),
            ws = this.isWindowScroll(),
            scroll = false, // should we perform scrolling?
            b = this.getScrollBuffer(), // how much of a buffer before we scroll?
            nt = dragTop, // where to move element top
            nl = dragLeft, // where to move element left
            st = parentScrollTop, // how much to scroll container top
            sl = parentScrollLeft; // how much to scroll container left

        // check if we are scrolling horizontally 
        if (this.isScrollHorizontal()) {
            if (dragLeft <= parentRegion.left) {
                scroll = true;
                nl = dragXY[0] - ((ws) ? b : 0);
                sl = parentScrollLeft - b;
            }
            if (dragRight >= parentRegion.right) {
                scroll = true;
                nl = dragXY[0] + ((ws) ? b : 0);
                sl = parentScrollLeft + b;
            }
        }

        // check if we are scrolling vertically 
        if (this.isScrollVertical()) {
            if (dragBottom >= parentRegion.bottom) {
                scroll = true;
                nt = dragXY[1] + ((ws) ? b : 0);
                st = parentScrollTop + b;
            }
            if (dragTop <= parentRegion.top) {
                scroll = true;
                nt = dragXY[1] - ((ws) ? b : 0);
                st = parentScrollTop - b;
            }
        }

        if (st < 0) {
            st = 0;
            nt = dragXY[1];
        }
        if (sl < 0) {
            sl = 0;
            nl = dragXY[0];
        }
        if (nt < 0) {
            nt = dragXY[1];
        }
        if (nl < 0) {
            nl = dragXY[0];
        }

        if (move) {

            // adjust element
            this.alignElWithMouse(dragEl, nl, nt);

            // perform scrolling
            if (parentEl == window) {
                parentEl.scrollTo(sl, st);
            } else {
                parentEl.scrollTop = st;
                parentEl.scrollLeft = sl;
            }

            // console.log('scroll: x=%d y=%d nl=%d nt=%d sl=%d st=%d', dragXY[0], dragXY[1], nl, nt, sl, st);

            // if scrolling for left/top is at zero then no need to check anymore
            if (!st && !sl) {
                this._cancelScroll();
            }
        } else {
            if (scroll) {
                this._initScroll();
            } else {
                this._cancelScroll();
            }
        }
    };

    // noop the existing YUI2 auto scroll
    DD.prototype.autoScroll = function(x, y, h, w) {};

    // replace the before drag and include our scroll timer
    DD.prototype.b4Drag = function(e) {

        // set the drag element position (original code)
        this.setDragElPos(YAHOO.util.Event.getPageX(e), YAHOO.util.Event.getPageY(e));

        // check if scrolling is enabled (new code)
        if (this.scroll) {
            if (this._scrollTimer) {
                this._cancelScroll();
            }
            this._checkWinScroll();
        }
    };

})(YAHOO);

// Fix for YUI2 container to support h2 header
(function (YAHOO) {

    // fix headers
    var m_oHeaderTemplate;
    function createHeader() {
        if (!m_oHeaderTemplate) {
            var m_oModuleTemplate = document.createElement('div');
            m_oModuleTemplate.innerHTML = '<h2 class=\"' + YAHOO.widget.Module.CSS_HEADER + '\"></h2>';
            m_oHeaderTemplate = m_oModuleTemplate.firstChild;
        }
        return (m_oHeaderTemplate.cloneNode(false));
    }

    // same code as container.js (line 1508) except custom createHeader() function
    YAHOO.widget.Module.prototype.setHeader = function (headerContent) {
        var oHeader = this.header || (this.header = createHeader());

        if (headerContent.nodeName) {
            oHeader.innerHTML = "";
            oHeader.appendChild(headerContent);
        } else {
            oHeader.innerHTML = headerContent;
        }

        if (this._rendered) {
            this._renderHeader();
        }

        this.changeHeaderEvent.fire(headerContent);
        this.changeContentEvent.fire();
    };

})(YAHOO);

/*
 Fix for loss of selection when context menus open
*/
(function (YAHOO) {
    YAHOO.widget.ContextMenu.prototype.focus = function () {
        if (!this.hasFocus() && !this.cfg.getProperty('suppressInitialFocus')) {
            this.setInitialFocus();
            /* SB-1505 : Initial selection was not default for menu item when user uses enter or space key */
            this.setInitialSelection();
        }
    };
})(window.YAHOO);

