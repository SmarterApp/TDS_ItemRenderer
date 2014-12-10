/*
Used for zooming the html, images and other media for content manager.
*/

(function (CM) {

    var ORIG_WIDTH = 'data-width';
    var ORIG_HEIGHT = 'data-height';
    var ZOOM_LEVEL = 'data-zoom';

    // the zoom CSS and factor for each level
    var LEVELS = [
        { css: 'TDS_PS_L0', factor: 1 }, // TDS_PS_Normal
        { css: 'TDS_PS_L1', factor: 1.25 }, // TDS_PS_Larger
        { css: 'TDS_PS_L2', factor: 1.5 }, // TDS_PS_Largest
        { css: 'TDS_PS_L3', factor: 1.75 },
        { css: 'TDS_PS_L4', factor: 2 }
    ];
    
    // get the css class for a level
    function getLevelClass(level) {
        if (LEVELS[level]) {
            return LEVELS[level].css;
        }
        return undefined;
    };

    // get the zoom factor for a level
    function getFactor(level) {
        if (LEVELS[level]) {
            return LEVELS[level].factor;
        }
        return -1; // use this it ignore
    };

    // parse the level from css class
    function parseLevelFromEl(el, defaultValue) {
        if (Util.Dom.isDocument(el)) {
            el = el.body;
        }
        if (hasAttribute(el, ZOOM_LEVEL)) {
            return el.getAttribute(ZOOM_LEVEL) * 1;
        }
        return typeof defaultValue == 'number' ? defaultValue : -1;
    }

    function parseLevelFromClass(name, defaultValue) {
        for (var i = 0; i < LEVELS.length; i++) {
            if (LEVELS[i].css == name) {
                return i;
            }
        }
        return typeof defaultValue == 'number' ? defaultValue : - 1;
    }

    // used to tell if an element has a specific attribute 
    // (since this DOM2 function and IE does not support, use this method instead)
    function hasAttribute(ele, attr) {
        if (ele.hasAttribute) {
            return ele.hasAttribute(attr);
        } else {
            return ele.getAttribute(attr) != null;
        }
    }

    function removeClasses(el) {
        LEVELS.forEach(function (level) {
            $(el).removeClass(level.css);
        });
    }

    // get all the zoomable images
    function getImages(parentEl) {
        if (!parentEl) return [];
        return $('img', parentEl).toArray();
    }

    // get all the zoomable flash objects
    function getFlashObjects(parentEl) {
        if (!parentEl) return [];
        return $('embed, object', parentEl).filter(function (idx, el) {
            if (el.type == 'application/x-shockwave-flash') {
                // ignore jwplayer
                if (el.nodeName == 'OBJECT' && el.data && el.data.indexOf('jwplayer') != -1) {
                    return false;
                }
                return true;
            }
        }).map(function (idx, el) {
            if (el.nodeName == 'EMBED') {
                // the container is important part for zooming embed
                return el.parentNode;
            } else {
                return el;
            }
        }).toArray();
    }

    // get all zoomable elements
    function getElements(parentEl) {
        return Util.Array.concat(
            getImages(parentEl),
            getFlashObjects(parentEl));
    }

    function saveImageDimensions(image) {

        if (!image) {
            return;
        }

        // if we already know height skip this image
        if (hasAttribute(image, ORIG_HEIGHT)) {
            return;
        }

        // save original image dimensions only if they are greater than 0
        if (image.width > 0 && image.height > 0) {
            image.setAttribute(ORIG_WIDTH, image.width);
            image.setAttribute(ORIG_HEIGHT, image.height);
        }
    };

    function saveElementDimensions(el) {

        if (!el) {
            return;
        }

        // if we already know height skip this image
        if (hasAttribute(el, ORIG_HEIGHT)) {
            return;
        }

        var width, height;

        // check if element explictly defines width/height
        if (hasAttribute(el, 'width') &&
            hasAttribute(el, 'height')) {
            width = el.getAttribute('width') * 1;
            height = el.getAttribute('height') * 1;
        } else {
            // get elements region info
            width = $(el).width();
            height = $(el).height();
        }

        // save original element dimensions only if they are greater than 0
        if (width > 0 && height > 0) {
            el.setAttribute(ORIG_WIDTH, width);
            el.setAttribute(ORIG_HEIGHT, height);
        }
    }

    // save dimensions on all the child elements of the parent
    function saveDimensions(parentEl) {

        if (!parentEl) {
            return;
        }

        // loops through each image and save original dimensions
        getImages(parentEl).forEach(function (el) {
            saveImageDimensions(el);
        });

        // loops through each flash object and save original dimensions
        getFlashObjects(parentEl).forEach(function (el) {
            saveElementDimensions(el);
        });

    }

    // set the css classes for zooming on an element
    function styleElement(el, level) {
        var className = getLevelClass(level);
        if (className && !$(el).hasClass(className)) {
            removeClasses(el); // remove previous zoom class
            $(el).addClass(className);
            return true;
        } else {
            return false;
        }
    }

    // zoom the dimensions of an element
    function zoomElement(el, level) {

        // if we don't know the original width/height don't perform zooming
        if (!hasAttribute(el, ORIG_WIDTH)) {
            return false;
        }

        var factor = getFactor(level);
        if (!(factor > 0)) {
            return false;
        }

        // get dimensions
        var zoomWidth = el.getAttribute(ORIG_WIDTH) * factor;
        var zoomHeight = el.getAttribute(ORIG_HEIGHT) * factor;

        if (el.nodeName == 'IMG') {
            // set dimensions using property
            el.width = zoomWidth;
            el.height = zoomHeight;
        } else {
            // set dimensions using css (flash itself should already be 100% and fill container)
            $(el).css('width', zoomWidth + 'px');
            $(el).css('height', zoomHeight + 'px');
        }

        return true;
    }

    // zoom all the child elements of the parent
    function zoomElements(parentEl, level) {
        // check if this element is already zoomed
        var prevLevel = parseLevelFromEl(parentEl);
        if (prevLevel === level) return false;
        // makes sure the dimensions are saved before performing any zooming
        saveDimensions(parentEl);
        // zoom elements
        getElements(parentEl).forEach(function (el) {
            zoomElement(el, level);
        });
        // set the element new zoom level
        parentEl.setAttribute(ZOOM_LEVEL, level);
        return true;
    }

    //////////////////////////////////////////////////////////////////////////////////////////////////
    
    // Zoom class
    function Zoom(defaultZoomCSS) {

        Util.Event.Emitter(this);

        // objects to perform zooming on
        this._zoomables = [];

        this.previousLevel = -1;

        // set default level
        this.defaultLevel = parseLevelFromClass(defaultZoomCSS, 0);

        // set current level
        this.currentLevel = this.defaultLevel;
    }
    
    // get the current css
    Zoom.prototype.getCSS = function () {
        return LEVELS[this.currentLevel].css;
    };

    Zoom.prototype.getFactor = function() {
        return LEVELS[this.currentLevel].factor;
    };
    
    Zoom.prototype.addDocument = function (doc, options) {

        // set default document
        doc = doc || document;

        // set default values if missing
        options = options || {};
        YAHOO.lang.augmentObject(options, {
            cleanClasses: true,
            includeElements: true
        });

        // check if document is already added
        if (this._zoomables.some(function (obj) {
            return (obj.document == doc);
        })) {
            return false;
        }

        // make sure document being added doesn't have zoom current zoom class since we did not 
        // add it from zoom class and if it is already added then refresh() will not zoom images
        if (options.cleanClasses) {
            removeClasses(doc);
        }

        var obj = {
            document: doc,
            options: options
        };

        // add to list
        this._zoomables.push(obj);

        // update document
        this._updateLevel(obj);

        return true;
    };

    Zoom.prototype._updateLevel = function(obj) {

        var level = this.currentLevel;
        var el = obj.document.body;

        // set class
        styleElement(el, level);

        // zoom elements
        if (obj.options.includeElements) {
            zoomElements(el, level);
        }

    };

    // set the zoom level
    Zoom.prototype.setLevel = function (level, force) {

        if (typeof level == 'string') {
            level = parseLevelFromClass(level, 0);
        } else if (typeof level != 'number') {
            return false;
        }

        // check if level is already set
        if (!force && this.currentLevel === level) {
            return false;
        }

        this.previousLevel = this.currentLevel;
        this.currentLevel = level;

        // go over each stored element and zoom children
        this._zoomables.forEach(this._updateLevel.bind(this));

        // fire event
        this.fire('change', level);

        return true;
    };

    // Used to zoom in a level.
    Zoom.prototype.zoomIn = function () {
        if (this.currentLevel < LEVELS.length - 1) {
            return this.setLevel(this.currentLevel + 1);
        } else {
            return false;
        }
    };

    // Used to zoom out a level. 
    Zoom.prototype.zoomOut = function () {
        if (this.currentLevel > 0) {
            return this.setLevel(this.currentLevel - 1);
        } else {
            return false;
        }
    };

    // reset zoom back to default
    Zoom.prototype.reset = function (force) {
        this.setLevel(this.defaultLevel, force);
    };

    // force refresh 
    Zoom.prototype.refresh = function () {
        return this.setLevel(this.currentLevel, true);
    };

    // update elements based on current zoom level
    Zoom.prototype.updateElements = function(parentEl) {
        zoomElements(parentEl, this.currentLevel);
    };

    Zoom.prototype.updateElement = function(el) {
        zoomElement(el, this.currentLevel);
    };

    window.ContentZoom = Zoom;
    
})(window.ContentManager);

// content manager events
(function(CM) {

    if (!CM) return;

    // right before showing the page make sure everything is zoomed
    CM.onPageEvent('beforeShow', function (page) {
        page.updateElementsZoom();
    });

    // when zooming a page we are on update elements
    CM.onPageEvent('zoom', function (page, level) {
        if (page == CM.getCurrentPage()) {
            page.zoomLevel = level;
            page.updateElementsZoom();
        }
    });

})(window.ContentManager);