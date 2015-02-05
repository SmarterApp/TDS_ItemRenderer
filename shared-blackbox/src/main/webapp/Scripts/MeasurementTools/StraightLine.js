// Namespace
if (typeof(MeasurementTool) == "undefined") {
    MeasurementTool = {};
}

MeasurementTool.StraightLine = MeasurementTool.Set.extend();

MeasurementTool.StraightLine.prototype.init = function(config) {
    MeasurementTool.StraightLine.parent.init.apply(this, arguments);
    this.set('lines', new PiObject()).addListener(MeasurementTool.StraightLine.prototype.removeLine);
    this.addListener('set', this.addPencil);
    this.transform();
};

MeasurementTool.StraightLine.prototype.defaultConfig = function(object, property, oldConfig, newConfig) {
    newConfig.width = newConfig.width || 18;
    newConfig.height = newConfig.height || 62;
    newConfig.origin = {
        x: newConfig.width / 2,
        y: newConfig.height
    };
    MeasurementTool.StraightLine.parent.defaultConfig.apply(this, arguments);
};

MeasurementTool.StraightLine.prototype.setVisibility = function(object, property, oldValue, newValue) {
    if (this.exists('canvas')) {
        var canvasHolder = this.get('canvas').get('canvas'),
            canvas = canvasHolder.canvas;
        var moveStraightLine = function (event) {
            /*
            * offset is based on canvasHolder.bottom.node which is the exact image object
            * in Firefox, when compass drawing a big circle larger than the canvas/viewport (image size) boader
            * size of canvas will extend with the circle goes
            * which may cause the values (left/top) of canvas.getBoundingClientRect() not work for straightline tool drawing
            * while the image object, aka, canvasHolder.bottom.node, will not extend with those drawing, so using image object's getBoundingClientRect()
            */ 
            var offset = canvas.getBoundingClientRect(),
                zoomFactor = straightline.get('zoomFactor');

            if (canvasHolder.bottom.node) {
                offset = canvasHolder.bottom.node.getBoundingClientRect();
            }

            //including zoomFactor in this straight line tool locating calculation to make sure the tool still work after page zoomed
            straightline.get('transforms').set('translation', {
                //based on the zooming strategy, the position data need to be divided by zoomFactor, while the 15 and 5 are adjustment data, which need to multiple the zoomFactor
                x: (event.clientX - offset.left) / zoomFactor - (15 * zoomFactor),  // The 15 is so that even after rotation, the object is still positioned under the mouse.  CAUTION: This is especially important in Firefox 3.5, which handles rotated objects slightly differently than later versions of Firefox!
                y: (event.clientY - offset.top - straightline.get('height')) / zoomFactor + (5 * zoomFactor)    // The 5 is to give the mouse some padding so we don't see the cursor flutter so much.
            });
        };
        if (newValue == 'hidden') {
            canvas.style.cursor = 'inherit';
            canvas.removeEventListener('mousemove', moveStraightLine, false);

            // for mobile devices, remove touchdown listener to relocate the pencil
            if ('ontouchstart' in window) {
                canvas.removeEventListener('mousedown', moveStraightLine, false);
            }
            this.get('set').hide();
        } else {
            var straightline = this;
            straightline.addMouseListener(canvas, 'mousemove', moveStraightLine);

            // for mobile devices, add touchdown listener to relocate the pencil, otherwise, user has to use 'touchmove'(drag) to relocate pencil, which doesn't make too much sense.
            if ('ontouchstart' in window) {
                straightline.addMouseListener(canvas, 'mousedown', moveStraightLine);
            }
            straightline.get('set').show();
            canvas.style.cursor = 'none';
        }
    }
};

MeasurementTool.StraightLine.prototype.addMouseListener = function (target, name, fn) {

    var touchScreen = 'ontouchstart' in window;

    var touchEvents = {
        'mousedown': 'touchstart',
        'mouseup': 'touchend',
        'mousemove': 'touchmove'
    };

    var mouseEvents = {
        'mousedown': 'mousedown',
        'mouseup': 'mouseup',
        'mousemove': 'mousemove'
    };

    // Get the windows nt version
    var getWindowsNTVersion = function () {
        var matches = navigator.userAgent.match(/Windows NT (\d+\.\d+)/);
        var value;
        if (matches && matches[1]) {
            value = parseFloat(matches[1]);
        }
        return value || 0;
    };

    // if this is true then we need to support both mouse/touch, win8 and chromebook with touchscreen
    var supportsTouchAndMouse = function () {
        return (touchScreen && (getWindowsNTVersion() >= 6.1 || window.navigator.userAgent.indexOf('CrOS') > -1));
    };

    // this fixes a touch event to look like a mouse event
    var normalizeTouchEvent = function (evt) {

        if (evt.changedTouches) {

            var touches = evt.changedTouches;

            // find touch event that matches dom event
            for (var i = 0, ii = touches.length; i < ii; i++) {

                if (touches[i].target == evt.target) {

                    // save original event
                    var oldevt = evt;

                    // replace DOM event with touch event
                    evt = touches[i];

                    evt.preventDefault = function () {
                        return oldevt.preventDefault();
                    };

                    evt.stopPropagation = function () {
                        return oldevt.stopPropagation();
                    };

                    return evt;
                }
            }
        }

        return evt;
    };

    // check if browser supports both touch and mouse
    var touchAndMouse = supportsTouchAndMouse();

    // figure out the event name and alt event name
    var eventName, altEventName;
    if (touchScreen) {
        eventName = (touchEvents[name] || name);
        if (touchAndMouse) {
            altEventName = (mouseEvents[name] || name);
        }
    } else {
        eventName = (mouseEvents[name] || name);
    }

    // perform some processing on the dom event (http://www.html5rocks.com/en/mobile/touchandmouse/)
    var processEvent = function (evt) {

        // prevents default mouse-emulation
        if (touchAndMouse) {
            evt.preventDefault();
        }

        // normalize event to look like mouse
        if (touchScreen) {
            evt = normalizeTouchEvent(evt);
        }

        fn(evt);
    };

    // add event listener
    if (eventName) {
        target.addEventListener(eventName, processEvent, false);
        if (altEventName) {
            target.addEventListener(altEventName, processEvent, false);
        }
    }
};

MeasurementTool.StraightLine.prototype.getRotation = function(object, property, transforms) {
    // CAUTION: Skip the parent, and call the parent's parent!
    var origin = this.get('origin');
    if (!transforms.exists('rotation')) {
        transforms.set('rotation', {
            type: 'rotation',
            angle: 30,
            x: origin.x,
            y: origin.y
        });
    }
    MeasurementTool.StraightLine.parent.getRotation.apply(this, arguments);
};

MeasurementTool.StraightLine.prototype.addPencil = function (object, property, oldSet, newSet) {

    var canvas = this.get('canvas').get('canvas');
    var width = this.get('width');
    var height = this.get('height');
    var start, click, line;

    newSet.push(
        this.get('children').set('pencil',
            canvas.set([
                canvas.rect(0, 0, 18, 20, 7).attr({
                    'fill': '#DB4652',
                    'stroke-miterlimit': '10',
                    'stroke': '#C1272D'
                }),
                canvas.rect(0, 17, 18, 32).attr({
                    'fill': '#FBB03B'
                }),
                canvas.rect(5.5, 17.5, 9, 32).attr({
                    'fill': '#F2B96D',
                    'stroke': '#D68A25',
                    'stroke-miterlimit': '10'
                }),
                canvas.rect(0.5, 8.5, 17, 5).attr({
                    'fill': '#E6E6E6',
                    'stroke': '#B3B3B3',
                    'stroke-miterlimit': '10'
                }),
                canvas.rect(0.5, 12.5, 17, 5).attr({
                    'fill': '#E6E6E6',
                    'stroke': '#B3B3B3',
                    'stroke-miterlimit': '10'
                }),
                canvas.path('M0,49 l9,13 l9,-13 Z').attr({
                    'fill': '#C7B299'
                }),
                canvas.path('M6,58 l6,0 l-3,4 z').attr({
                    'fill': '#000'
                }),
                canvas.rect(0, 0, width, height).attr(this.get('dragHandleAttributes'))
            ]).drag(
                function(dx, dy, canvasX, canvasY) {
                    var origin = this.get('origin');
                    var translation = this.get('transforms').get('translation');
                    var path = [
                        'M',
                        start.x,
                        start.y,
                        'L',
                        origin.x + translation.x,
                        origin.y + translation.y
                    ].join(" ");
                    if (!line) {
                        this.get('lines').add(line = canvas.path(path));
                    } else {
                        line.attr('path', path);
                    }
                },
                function(canvasX, canvasY, event) {
                    var origin = this.get('origin');
                    var translation = this.get('transforms').get('translation');
                    start = {
                        x: origin.x + translation.x,
                        y: origin.y + translation.y
                    };
                },
                function(event) {
                    // releasing a drag also issues a click event.
                    // so to continue tracking the pencil, remove 'active' so it's
                    // that automatically readded during the following click event.
                    if (line) {
                        line = null;
                    }
                },
                this,
                this,
                this
            )
        )
    );
};

MeasurementTool.StraightLine.prototype.removeLine = function(arcs, index, oldLine, newLine) {
    if (oldLine != "") {
        oldLine.remove();
    }
};