// Namespace
if (typeof(MeasurementTool) == "undefined") {
    MeasurementTool = {};
}

MeasurementTool.Set = PiObject.extend();

MeasurementTool.Set.prototype.init = function (config) {

    config = this.set('config', config || {});
    this.addListener('config', this.defaultConfig);

    // Apply parent function
    MeasurementTool.Set.parent.init.apply(this, arguments);

    if (!this.exists('children')) {
        var children = this.set('children', new PiObject());
    } else {
        var children = this.get('children');
    }

    this.addListener('children', this.initCollection);
    children.addListener(this, this.transformChildren, false);

    // Initialize Transformations
    if (!this.exists('transforms')) {
        var transforms = this.set('transforms', new PiObject());
    } else {
        var transforms = this.get('transforms');
    }

    // Initialize Transformations
    transforms.addListener(this, this.defineTransform);
    transforms.addListener(this, this.transform);
    this.addFilter('transform', this.getTransform); // Shortcut to get aggregate transform string

    // Add default children
    this.addFilter('transforms', this.getPosition);
    this.addFilter('transforms', this.getRotation);

    // render
    this.addFilter('dragHandleAttributes', this.getDragHandleAttributes);
    this.addListener('canvas', this.addSet); // keep this separate for consistency.
    this.addFilter('offset', this.getOffset);
    this.addListener('scale', this.setScale);
    this.addListener('visibility', this.setVisibility);
    this.addListener('visibility', this.resetTransforms);
};

MeasurementTool.Set.prototype.defaultConfig = function (object, property, oldConfig, newConfig) {
    this.removeListener(property, this.defaultConfig);
    newConfig = typeof(newConfig) == "object" ? newConfig : {};
    //newConfig.visibility = newConfig.visibility || 'visible';
};

MeasurementTool.Set.prototype.initCollection = function (object, property, oldValue, newValue) {
    if (newValue != '') {
        if (newValue.constructor == Array || newValue.constructor == Object) {
            return new PiObject(newValue);
        }
    }
};

MeasurementTool.Set.prototype.setVisibility = function (object, property, oldValue, newValue) {
    if (this.exists('set')) {
        if (this.get('visibility') == 'hidden') {
            this.get('set').hide();
        } else {
            this.get('set').show();
        }
    }
};

MeasurementTool.Set.prototype.resetTransforms = function (object, property, oldValue, newValue) {
    if (newValue == 'hidden') {
        this.get('transforms').removeAll();
        this.transform(); // handles application of hide/show
        this.setVisibility(this, 'visibility', '', this.get('visibility'));
    }
};

MeasurementTool.Set.prototype.setScale = function (object, property, oldValue, newValue) {
    if (oldValue != "" && newValue == "") {
        this.get('transforms').remove('scale');
    }
    if (newValue != "") {
        this.get('transforms').set('scale', { scale: newValue });
    }
};

MeasurementTool.Set.prototype.defineTransform = function (transforms, index, oldTransform, newTransform) {
    if (newTransform != "") {
        switch (index) {
            case 'rotation':
                newTransform.type = newTransform.type || 'r';
                break;
            case 'translation':
                newTransform.type = newTransform.type || 't';
                break;
            case 'scale':
                newTransform.type = newTransform.type || 's';
                break;
        }
        switch (newTransform.type) {
            case 'r':
            case 'R':
            case 'rotate':
            case 'rotation':
                if (typeof(newTransform) != "object") {
                    newTransform = {
                        type: 'r',
                        angle: +newTransform // the + sign will convert an empty string to a zero.
                    };
                }
                newTransform.svg = newTransform.type.charAt(0); // first letter only
                newTransform.type = 'rotation';
                newTransform.css = "rotate";
                newTransform.angle = newTransform.angle || 0;
                newTransform.x = typeof(newTransform.x) != "undefined" ? newTransform.x : (this.exists('center') ? +this.get('center').x : this.exists('width') ? this.get('width') / 2 : 0);
                newTransform.y = typeof(newTransform.y) != "undefined" ? newTransform.y : (this.exists('center') ? +this.get('center').y : this.exists('height') ? this.get('height') / 2 : 0);
                newTransform.h = Math.sqrt(Math.pow(newTransform.x, 2) + Math.pow(newTransform.y, 2));
                break;
            case 't':
            case 'T':
            case 'translate':
            case 'translation':
                newTransform.svg = newTransform.type.charAt(0); // first letter only
                newTransform.type = 'translation';
                newTransform.css = "translate";
                newTransform.x = typeof(newTransform.x) != "undefined" ? newTransform.x : 0;
                newTransform.y = typeof(newTransform.y) != "undefined" ? newTransform.y : 0;
                break;
            case 's':
            case 'S':
            case 'scale':
                newTransform.svg = newTransform.type.charAt(0); // first letter only
                newTransform.type = 'scale';
                newTransform.css = 'scale';
                newTransform.scale = typeof(newTransform.scale) != "undefined" ? newTransform.scale : 1;
                break;
        }
    }
};

MeasurementTool.Set.prototype.getPosition = function(object, property, transforms) {
    if (!transforms.exists('translation')) {
        transforms.set('translation', {
            x: this.exists('x') ? this.get('x') : this.exists('width') && this.exists('canvas') ? this.get('canvas').get('width') / 2 - this.get('width') / 2 : 0,
            y: this.exists('y') ? this.get('y') : this.exists('height') && this.exists('canvas') ? this.get('canvas').get('height') / 2 - this.get('height') / 2 : 0
        });
    }
};

MeasurementTool.Set.prototype.getRotation = function (object, property, transforms) {
    if (!transforms.exists('rotation')) {
        transforms.set('rotation', {
            angle: this.get('rotation')
        });
    }
};

MeasurementTool.Set.prototype.getDragHandleAttributes = function (object, property, value) {
    this.removeFilter(property, this.getDragHandleAttributes);
    if (value == "") {
        return this.set(property, {
            stroke: 'none',
            fill: '#00F',
            'fill-opacity': 0
        });
    }
};

MeasurementTool.Set.prototype.addSet = function (object, property, oldCanvas, newCanvas) {
    if (!this.exists('set')) {
        this.set('set', (newCanvas instanceof PiObject) ? newCanvas.get('canvas').set() : newCanvas.set());
        this.transform();
        this.setVisibility(this, 'visibility', '', this.get('visibility'));
    }
};

MeasurementTool.Set.prototype.getOffset = function (object, property, offset) {
    if (this.exists('canvas')) {
        return this.get('canvas').get('offset');
    }
};

MeasurementTool.Set.prototype.getTransform = function (object, property, transform) {
    // Order is important in the collection of transforms.
    // We expect translation first, which is then added to each subsequent transformation.
    // We expect rotation second, which is then added to each subsequent rotation.
    var result = [];
    var translation = [];
    var transforms = this.get('transforms'); // Get reference so we can call this function directly
    transforms.each(function(transforms, index, transform) {
        if (transform != "") {
            switch (transform.type) {
                case 'rotation':
                    result.push([transform.svg, transform.angle, transform.x, transform.y].join(" "));
                    break;
                case 'translation':
                    result.push([transform.svg, transform.x, transform.y].join(" "));
                    break;
                case 'scale':
                    result.push([transform.svg, transform.scale].join(" "));
            }
        }
    });
    return result.join(" ");
};

MeasurementTool.Set.prototype.transformChildren = function(children, index, oldChild, newChild) {
    if (oldChild != "") {
        if (oldChild instanceof PiObject) {
            oldChild.removeFilter('transform', this, this.addParentTransform);
        }
    }
    if (newChild != "") {
        if (newChild instanceof PiObject) {
            newChild.addFilter('transform', this, this.addParentTransform);
        }
    }
};

MeasurementTool.Set.prototype.addParentTransform = function(child, property, transform) {
    return [this.get('transform'), transform].join(" ");
};

MeasurementTool.Set.prototype.transform = function(transforms, index, oldTransform, newTransform) {
    if (this.exists('set')) {
        var set = this.get('set');
        if (set.transform) {
            set.transform(this.get('transform'));
        }
        this.get('children').each(function(children, index, child) {
            if (child.transform) {
                child.transform();
            }
        });
    }
};

MeasurementTool.Set.prototype.translation = (function() {
    var start;
    return {
        'drag': function(dx, dy, x, y) {
            this.get('transforms').set('translation', {
                x: start.x + dx,
                y: start.y + dy
            });
        },
        'start': function(x, y, event) {
            start = this.get('transforms').get('translation');
        },
        'stop': function(x, y, event) {}
    };
})();

MeasurementTool.Set.prototype.rotation = (function() {
    var last;
    return {
        'drag': function(dx, dy, canvasX, canvasY) {
            var offset = this.get('offset');
            var transforms = this.get('transforms');
            var translation = transforms.get('translation');
            var rotation = transforms.get('rotation');
            var current = Raphael.angle(canvasX, canvasY, offset.x + rotation.x + translation.x, offset.y + rotation.y + translation.y);
            var delta = current - last;
            if (delta < -180) {
                delta += 360;
            } else if (delta > 180) {
                delta -= 360;
            }
            last = current;
            // last.mr = mr;
            rotation.angle += delta;
            transforms.set('rotation', rotation); // trigger the listener
            return;
        },
        'start': function(canvasX, canvasY, event) {
            var offset = this.get('offset');
            var transforms = this.get('transforms');
            var translation = transforms.get('translation');
            var rotation = transforms.get('rotation');
            last = Raphael.angle(canvasX, canvasY, offset.x + rotation.x + translation.x, offset.y + rotation.y + translation.y);
        },
        'stop': function(x, y, event) {}
    };
})();