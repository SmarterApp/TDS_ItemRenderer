// Namespace
if (typeof(MeasurementTool) == "undefined") {
    MeasurementTool = {};
}

MeasurementTool.Canvas = MeasurementTool.Set.extend();

MeasurementTool.Canvas.prototype.init = function(config) {

    // BUG: PIObject calls init() when extending classes:
    // For a ruler this actually renders it and it appears on the screen. 
    // As a hack we check if the config is not defined as it is when called from extend().
    if (typeof config == 'undefined') {
        return;
    }

    config = config || {};
    config.window = config.window || window;
    MeasurementTool.Canvas.parent.init.apply(this, arguments);
    this.addListener('window', this.initRaphael);
    this.addFilter('node', this.createNode);
    this.addListener('node', this.initNode);
};

MeasurementTool.Canvas.prototype.defaultConfig = function(object, property, oldConfig, newConfig) {
    MeasurementTool.Canvas.parent.defaultConfig.apply(this, arguments);
    newConfig.width = newConfig.width || 620;
    newConfig.height = newConfig.height || 420;
    newConfig.r = newConfig.r || 0;
    newConfig.stroke = newConfig.stroke || 'none';
    newConfig.fill = newConfig.fill || 'none';
    newConfig.scale = newConfig.scale || 1;
};

MeasurementTool.Canvas.prototype.initRaphael = function(object, property, oldWindow, newWindow) {
    Raphael.setWindow(newWindow);
};

MeasurementTool.Canvas.prototype.createNode = function(object, property, node) {
    var doc = this.get('window').document;
    if (doc.body) {
        this.removeFilter(property, this.createNode);
        if (node == "") {
            node = doc.createElement('div');
            node.id = this.get('id');
            node.className = this.get('classname');
            var parent = this.exists('parent') ? this.get('parent') : doc.body;
            var box = parent.getBoundingClientRect();
            var width = this.get('width');
            var height = this.get('height');
            parent.appendChild(node);
            // center object
            node.style.cssText = [
                'width:' + width,
                'height:' + height
            ].join(';');
            if (!this.exists('x')) {
                this.set('x', box.left + box.width / 2 - width / 2);
            }
            if (!this.exists('y')) {
                this.set('y', box.top + box.height / 2 - height / 2);
            }
            node.style.visibility = this.exists('visibility') ? this.get('visibility') : 'visible';
            this.set('node', node);
        }
    }
};

MeasurementTool.Canvas.prototype.initNode = function(object, property, oldNode, newNode) {

    if (typeof (newNode) == "string") {
        newNode = Raphael._g.doc.getElementById(this.set('id', newNode));
    } else {
        this.set('id', newNode.id);
    }

    if (newNode.ownerDocument && newNode.ownerDocument != Raphael._g.doc && newNode.ownerDocument.defaultView) {
        Raphael.setWindow(newNode.ownerDocument.defaultView);
    }

    if (newNode.childNodes) {
        while (newNode.hasChildNodes()) {
            if (newNode.firstChild.tagName == "IMG") {
                var src = newNode.firstChild.src;
                if (src.charAt(0) != '/' && src.indexOf('://') == -1) {
                    // When inside iframes, relative src URLs on images often do not load, so convert to full URL.
                    // Often this can happen because the iframe has its src set to nothing, or it doesn't have a src attribute.
                    // As a result, the document object points to the "about:" page of the browser, making relative links have an incorrect starting place.
                    // Warning, do not use the Raphael internal doc object, since it will point to the document object of the iframe.  (See note above.)
                    var href = window.document.location.href;
                    var last = href.split('/').pop();
                    if (last.indexOf('.')) {
                        var dir = href.substr(0, href.length - last.length);
                    } else {
                        var dir = href;
                    }
                    if (dir.charAt(dir.length - 1) != '/') {
                        dir += '/';
                    }
                    src = dir + src;
                }
                // WARNING: SVG images MUST have a width and a height!  If they don't, we must assign something to them, or else they get assigned a value of 0!
                var img = {
                    type: 'image',
                    src: src,
                    width: this.get('width'),
                    height: this.get('height'),
                    x: 0,
                    y: 0
                };
                for (var i = 0; i < newNode.firstChild.attributes.length; i++) {
                    switch (newNode.firstChild.attributes[i].name) {
                        case 'width':
                            var value = +newNode.firstChild.attributes[i].value;
                            if (value) {
                                img.width = value;
                                img.x = (this.get('width') - value) / 2;
                            }
                            break;
                        case 'height':
                            var value = +newNode.firstChild.attributes[i].value;
                            if (value) {
                                img.height = value;
                                img.y = (this.get('height') - value) / 2;
                            }
                            break;
                    }
                }
            }
            newNode.removeChild(newNode.firstChild);
        }
    }

    this.set('raphael', Raphael);
    this.set('canvas', Raphael(
        newNode,
        this.get('width'),
        this.get('height')
    ));

    // Add outline before rendering all the children
    this.addListener('r', this.outline, false);
    this.addListener('stroke', this.outline, false);
    this.addListener('fill', this.outline, false);
    this.outline(); // only execute this once

    // If an image existed, render inside the canvas.
    if (img) {
        this.get('children').insertAt(0, img);
    }

    // Get offset
    this.addFilter('transformProperty', this.getTransformProperty);
    this.addFilter('transformMatrix', this.getTransformMatrix);

    // Render children
    this.get('children').addListener(this, this.initChildren);

    // Track translation movements for outer DIV.
    this.addListener('x', this.moveNode);
    this.addListener('y', this.moveNode);
    return newNode;
};

MeasurementTool.Canvas.prototype.moveNode = function(object, property, oldValue, newValue) {
    if (this.exists('node')) {
        switch (property) {
            case 'x':
                this.get('node').style.left = newValue + 'px';
                break;
            case 'y':
                this.get('node').style.top = newValue + 'px';
                break;
        }
    }
};

MeasurementTool.Canvas.prototype.resetTransforms = function(object, property, oldValue, newValue) {
    MeasurementTool.Canvas.parent.resetTransforms.apply(this, arguments);

};

// Override parent function
MeasurementTool.Canvas.prototype.getPosition = function(object, property, transforms) {
    if (!transforms.exists('translation')) {
        // Default position for a canvas is different than for an object within a canvas.
        // Within a canvas, we default objects to the center of the canvas.  For the canvas itself,
        // we default to where [0,0] which means to start wherever the browser originally renders the canvas.
        transforms.set('translation', { x: 0, y: 0 });
    }
};

MeasurementTool.Canvas.prototype.getOffset = function(object, property, offset) {

    if (this.exists('node')) {
        // We have to use a modified version of the Raphael getOffset() function, since the bounding rectangle is modified by rotation.
        var node = this.get('node'),
            height = this.get('height'),
            width = this.get('width'),
            box = node.getBoundingClientRect();
        offset = getOffset(node, this.get('raphael')); //here is the getOffset() function from Raphael, which in raphael.js is not public.
        if (box.height != height || box.width != width) {
            // the bounding box already takes into account the translation
            // BUT, use the total translation, including rotation-based translation (i.e. when not rotating about the center).
            var translation = this.get('transformMatrix');
            // step 1: assume center rotation
            offset.x = offset.x + (box.right - box.left) / 2 - width / 2 - translation.e;
            offset.y = offset.y + (box.bottom - box.top) / 2 - height / 2 - translation.f;
        }
        return offset;
    }

    // same getOffset() function with Raphael.js, in which, it is private.
    function getOffset(elem, raphael) {
        var thisbox = elem.getBoundingClientRect(),
            doc = elem.ownerDocument,
            body = doc.body,
            docElem = doc.documentElement,
            clientTop = docElem.clientTop || body.clientTop || 0,
            clientLeft = docElem.clientLeft || body.clientLeft || 0,
            top = thisbox.top + (raphael._g.win.pageYOffset || docElem.scrollTop || body.scrollTop) - clientTop,
            left = thisbox.left + (raphael._g.win.pageXOffset || docElem.scrollLeft || body.scrollLeft) - clientLeft;
        return {
            y: top,
            x: left
        };
    };

};

MeasurementTool.Canvas.prototype.setVisibility = function(object, property, oldValue, newValue) {
    if (this.exists('node')) {
        this.get('node').style['visibility'] = this.get('visibility');
    }
};

MeasurementTool.Canvas.prototype.getTransformProperty = function(object, property, value) {
    var node = this.get('node');
    // Note that in some versions of IE9 it is critical that
    // msTransform appear in this list before MozTransform
    var properties = [
        'transform',
        'WebkitTransform',
        'msTransform',
        'MozTransform',
        'OTransform',
        'filters'
    ];
    for (var i = 0; i < properties.length; i++) {
        value = properties[i];
        if (typeof(node.style[value]) != 'undefined') {
            break;
        }
    }
    if (value != 'filters' || typeof(document.body.filters) != "undefined") {
        this.removeFilter(property, this.getTransformProperty);
        return this.set(property, value);
    }
};

MeasurementTool.Canvas.prototype.getTransformMatrix = function(object, property, value) {
    // Order is important in the collection of transforms.
    // We expect translation first, which is then added to each subsequent transformation.
    // We expect rotation second, which is then added to each subsequent rotation.
    value = Raphael.matrix(1, 0, 0, 1, 0, 0);
    this.get('transforms').each(this, function(transforms, index, transform) {
        if (transform != "") {
            var current = value.split();
        }
        switch (transform.type) {
            case 'rotation':
                if (transform.angle % 360) {
                    // Rotation around a point is the same thing as rotation, plus a translation.
                    // The translation represents the movement of the center of rotation through 
                    // the angle of rotation in relation to the center of the object (the original point of rotation). 
                    var raphael = this.get('raphael');
                    var scale = this.get('scale');

                    // If we already have rotation, then the dimensions of the bounding rectangle have changed.

                    var delta = {
                        x: (transform.x - this.get('width') / 2) * scale,
                        y: (transform.y - this.get('height') / 2) * scale
                    };
                    delta.h = Math.sqrt(Math.pow(delta.x, 2) + Math.pow(delta.y, 2));
                    delta.angle = raphael.rad(raphael.angle(transform.x, transform.y, this.get('width') / 2, this.get('height') / 2) + transform.angle);
                    value.translate(delta.x - delta.h * Math.cos(delta.angle), delta.y - delta.h * Math.sin(delta.angle));
                }
                value.rotate(transform.angle);
                break;
            case 'translation':
                value.translate(transform.x, transform.y);
                break;
            case 'scale':
                value.scale(transform.scale);
                break;
        }
    });
    return value;
};

MeasurementTool.Canvas.prototype.transform = function(transforms, index, oldTransform, newTransform) {
    if (this.exists('node') && this.exists('canvas')) {
        var node = this.get('node');
        var transforms = this.get('transforms');
        var property = this.get('transformProperty');
        var matrix = this.get('transformMatrix');
        if (this.exists('scale')) {
            var scale = this.get('scale');

            // comment these two line out because these sizing is not working, especially for FF3.6
            //node.setAttribute('width', scale * this.get('width'));
            //node.setAttribute('height', scale * this.get('height'));

            // var box = this.get('canvas').getBBox();
            var canvas = this.get('canvas').canvas;
            canvas.setAttribute('width', scale * this.get('width'));
            canvas.setAttribute('height', scale * this.get('height'));
            // WARNING: DON'T USE SETVIEWBOX()!  It messes up the mouse coordinates, dragging, etc.
            // this.get('canvas').setViewBox(0, 0, this.get('width'), this.get('height'));

            this.get('children').each(function(children, index, child) {
                if (child.transform) {
                    child.transform();
                }
            });
        }
        if (property == "filters") {
            var filter = node.filters.item('DXImageTransform.Microsoft.Matrix');
            filter.M11 = matrix[0][0];
            filter.M12 = matrix[0][1];
            filter.M21 = matrix[1][0];
            filter.M22 = matrix[1][1];
        } else if (node.style[property] != null) {
            node.style[property] = matrix.toString();
        }
    }
};

MeasurementTool.Canvas.prototype.initChildren = function(object, property, oldChild, newChild) {
    if (oldChild != newChild) {
        if (oldChild != '') {
            if (oldChild instanceof MeasurementTool.Set) {
                oldChild.remove('canvas');
            } else {
                oldChild.remove();
            }
        }
        if (newChild != '') {
            var newRaphaelObject;
            if (newChild instanceof MeasurementTool.Set) {
                // 1st) Set canvas, which creates the set and its children.
                // NOTE: I'm setting the canvas by config object so that it returns a reference to child, not a reference to the canvas.
                // 2nd) Get the set and add it to the global canvas set.
                newRaphaelObject = newChild.set({
                    'canvas': this
                }).get('set');
            }
            // NOTE: Raphael does not provide a reference to the constructor, so we have to check if it's a Raphael object by looking for the paper property.
            else if (!newChild.paper) {
                // 1st) Add the item to the canvas.
                // 2nd) Add the item to the global canvas set.
                newRaphaelObject = this.get('canvas').add(
                    (newChild.constructor == Array) ? newChild : [newChild]
                );
            }
            // Add everything to a single set within the canvas so we can do global transforms!
            this.get('set').push(newRaphaelObject);
        }
    }
};

MeasurementTool.Canvas.prototype.outline = function(object, property, oldValue, newValue) {
    if (this.exists('outline')) {
        var outline = this.get('outline');
        outline[property] = newValue;
        this.get('children').set(0, outline);
    } else {
        var config = this.get('config');
        config.type = 'rect';
        this.get('children').insertAt(0, this.set('outline', config));
    }
};

MeasurementTool.Canvas.prototype.translation = (function() {
    var start;

    return {
        'drag': function (dx, dy, x, y) {
            // divided by 2 because at least half-size of those tools should be allowed to be dragged out of the border to work with items really close to border.
            var newX = start.x + dx,
                newY = start.y + dy,
                toolHeight = this.get('height') / 2,
                toolWidth = this.get('width') / 2;

            if(newX + toolWidth <= this.get('rightBoundary') && 
               newY + toolHeight <= this.get('bottomBoundary') && 
               newX + toolWidth >= 0 && 
               newY + toolHeight >= 0) {
                this.set('x', newX);
                this.set('y', newY);
            }
            
        },
        'start': function(x, y, event) {
            start = {
                x: this.get('x'),
                y: this.get('y')
            };
        },
        'stop': function(x, y, event) {}
    };
})();