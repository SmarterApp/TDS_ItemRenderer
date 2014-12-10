// Namespace
if (typeof(MeasurementTool) == "undefined") {
    MeasurementTool = {};
}

MeasurementTool.Ruler = MeasurementTool.Canvas.extend();

MeasurementTool.Ruler.prototype.init = function (config) {
    // Apply parent function
    MeasurementTool.Ruler.parent.init.apply(this, arguments);
    this.addListener('set', this.addOutline);
    this.addListener('set', this.addTickMarks);
    this.addListener('set', this.addLabel);
    this.addListener('set', this.addDragHandles);
    this.addListener('set', this.adjustPosition);
    this.get('node');
    this.transform();
};

MeasurementTool.Ruler.prototype.defaultConfig = function (object, property, oldConfig, newConfig) {
    newConfig.origin = newConfig.origin || { x: 0, y: 0 };
    newConfig.stroke = newConfig.stroke || '#000';
    newConfig['font-size'] = newConfig['font-size'] || '10pt';
    newConfig['line-height'] = parseInt(newConfig['font-size']);
    newConfig.type = newConfig.type || 'rect'; // we'll give the tool a boundary rectangle, though it is concievable that with an object like a compass you could use a triangle.
    newConfig.cursor = newConfig.cursor || 'move';
    newConfig.thickness = newConfig.thickness || newConfig.height || 5 * newConfig['line-height'];
    newConfig.height = newConfig.height || newConfig.thickness;
    if (newConfig.length) {
        newConfig.width = newConfig.length;
    } else if (newConfig.parent) {
        newConfig.width = newConfig.parent.offsetWidth * 0.60;
    } else {
        newConfig.width = 400;
    }
    MeasurementTool.Ruler.parent.defaultConfig.apply(this, arguments);
};

// Override parent getRotation function
MeasurementTool.Ruler.prototype.getRotation = function(object, property, transforms) {
    MeasurementTool.Ruler.parent.getRotation.apply(this, arguments);
    if (!transforms.exists('left_rotation')) {
        transforms.set('left_rotation', {
            type: 'rotation',
            angle: 0,
            x: this.get('width'),
            y: 0
        });
    }
    if (!transforms.exists('right_rotation')) {
        transforms.set('right_rotation', {
            type: 'rotation',
            angle: 0,
            x: 0,
            y: 0
        });
    }
};

MeasurementTool.Ruler.prototype.addOutline = function(object, property, oldSet, newSet) {
    var canvas = this.get('canvas');
    this.get('children').set('outline',
        canvas.rect(0, 0, this.get('width'), this.get('height')).attr({
            stroke: this.get('stroke')
        })
    );
};

//adjusting initial position for ruler
MeasurementTool.Ruler.prototype.adjustPosition = function () {

    var rulerLeft = (window.innerWidth - this.get('canvas').width) / 2,
        rulerTop = (window.innerHeight - this.get('canvas').height) / 2;

    //set initial position for both the container and the canvas
    this.moveNode(this.get('node'), 'x', 0, rulerLeft);
    this.moveNode(this.get('node'), 'y', 0, rulerTop);
    this.set('x', rulerLeft);
    this.set('y', rulerTop);
};

MeasurementTool.Ruler.prototype.addTickMarks = function (object, property, oldSet, newSet) {

    var canvas = this.get('canvas');
    var config = this.get('config');
    var system = this.get('system');
    var tickmarks = canvas.set();

    // We need to work with whole numbers
    config.max = Math.ceil(config.max) || 10;
    config.min = Math.floor(config.min) || 0;

    // Now calculate the major sections
    // Assume the highest absolute number is the widest
    var widest = (Math.abs(config.max) > Math.abs(config.min)) ? Math.abs(config.max) : Math.abs(config.min);
    var span = config.max - config.min;
    var temp = canvas.text(10, 10, widest + 'W').attr({ opacity: 0 });
    var scale = Math.ceil((temp[0].getComputedTextLength() * (span + 1)) / config.width);
    var width = config.width / (span / scale);
    var lineHeight = config['line-height'];
    var subscale;
    temp.remove();

    var origin = this.get('origin');
    if (origin.y >= config.height) {
        lineHeight = -lineHeight;
    }

    var labelY = origin.y + lineHeight * 5 / 2;

    if (system!=null && system.toLowerCase() == 'metric') {
        if (scale <= 2) {
            subscale = 2;
        } else if (scale > 2 && scale <= 5) {
            scale = 5;
            subscale = 5;
        } else {
            scale = Math.ceil(scale / 10) * 10;
            while (scale < (span - 10) && span % scale) {
                scale += 10;
            }
            subscale = 10;
        }
        width = config.width / (span / scale);
    } else {
        subscale = Math.min(4, scale);
    }

    for (var i = 0, label, x, half; config.min + i * scale <= config.max; i++) {
        // Add major line
        line = canvas.path("M" + (width * i) + "," + origin.y + "v" + (lineHeight * 2));
        tickmarks.push(line);
        // Add half lines
        if (scale == 1) {
            if (system!=null && system.toLowerCase() == 'metric') {
                for (var j = 1; j < 10; j++) {
                    x = width * i + j * width / 10;
                    h = 1.5;
                    if (j % 5) {
                        h -= 0.5;
                    }
                    if (x < config.width) {
                        tickmarks.push(canvas.path("M" + x + "," + origin.y + "v" + (lineHeight * h)));
                    }
                }
            } else {
                for (var j = 1; j < 8; j++) {
                    x = width * i + j * width / 8;
                    h = 2;
                    if (j % 8) {
                        h -= 0.5;
                    }
                    if (j % 4) {
                        h -= 0.5;
                    }
                    if (j % 2) {
                        h -= 0.5;
                    }
                    if (x < config.width) {
                        tickmarks.push(canvas.path("M" + x + "," + origin.y + "v" + (lineHeight * h)));
                    }
                }
            }
        } else {
            // Add 3/4 lines
            for (var j = 1; j < subscale; j++) {
                x = width * i + j * width / subscale;
                if (x < config.width) {
                    tickmarks.push(canvas.path("M" + x + "," + origin.y + "v" + (lineHeight * 3 / 2)));
                }
            }
        }
        // Add label
        label = canvas.text(width * i, labelY, config.min + scale * i);
        x = parseInt(label.attr('x'));
        half = label[0].getComputedTextLength() / 2;
        if ((x - half) < 0) // Adjust first Label
        {
            label.attr('x', half + config['line-height'] / 4);
        } else if ((x + half) > config.width) // Adjust last label
        {
            label.attr('x', config.width - half - config['line-height'] / 4);
        }
        tickmarks.push(label);
    }

    // Add minor tick labels, using tickmarksR to distinguish with Protractor's tickmarks since both tickmarksR and tickmarks exist in Protractor
    this.get('children').set('tickmarksR', tickmarks);
};

MeasurementTool.Ruler.prototype.addDragHandles = function(object, property, oldSet, newSet) {
    var canvas = this.get('canvas');
    var config = this.get('config');
    var children = this.get('children');
    var y = this.get('origin').y;
    if (y >= config.height - config.thickness) {
        y = config.height - config.thickness;
    }
    children.add(
            canvas.rect(
                0,
                y,
                config.width,
                config.thickness
            ).attr(this.get('dragHandleAttributes')).attr({
                "cursor": "move"
            }).drag(
                this.translation.drag,
                this.translation.start,
                this.translation.stop,
                this,
                this,
                this
            )
        ),
        children.add(
            canvas.set([
                canvas.rect(
                    0,
                    y,
                    config.thickness,
                    config.thickness
                ).attr(this.get('dragHandleAttributes'))
            ]).attr({
                "cursor": "rotate"
            }).drag(
                function(dx, dy, canvasX, canvasY) {
                    this.rotation.drag.apply(this, arguments);
                },
                function(canvasX, canvasY, event) {
                    // Having trouble with rotation about more than one point!
                    // Each subsequent point must be manually translated with respect to each previous rotation!
                    // this.get('transforms').move('left_rotation','rotation');
                    this.rotation.start.apply(this, arguments);
                },
                function(canvasX, canvasY, event) {
                    // this.get('transforms').move('rotation','left_rotation');
                    this.rotation.start.apply(this, arguments);
                },
                this,
                this,
                this
            )
        ),
        children.add(
            canvas.set([
                canvas.rect(
                    (config.width - config.thickness),
                    y,
                    config.thickness,
                    config.thickness
                ).attr(this.get('dragHandleAttributes'))
            ]).attr({
                "cursor": "rotate"
            }).drag(
                function(dx, dy, canvasX, canvasY) {
                    this.rotation.drag.apply(this, arguments);
                },
                function(canvasX, canvasY, event) {
                    // Having trouble with rotation about more than one point!
                    // Each subsequent point must be manually translated with respect to each previous rotation!
                    // this.get('transforms').move('right_rotation','rotation');
                    this.rotation.start.apply(this, arguments);
                },
                function(canvasX, canvasY, event) {
                    // this.get('transforms').move('rotation','right_rotation');
                    this.rotation.start.apply(this, arguments);
                },
                this,
                this,
                this
            )
        );
};

MeasurementTool.Ruler.prototype.addLabel = function(object, property, oldSet, newSet) {
    var canvas = this.get('canvas');
    if (this.exists('label')) {
        this.get('children').set('label', canvas.text(
            this.get('width') / 2, // x
            this.get('height') - this.get('line-height'), // y
            this.get('label') // text
        ));
    }
};