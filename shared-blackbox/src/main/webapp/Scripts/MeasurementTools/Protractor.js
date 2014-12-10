// Namespace
if (typeof(MeasurementTool) == "undefined")
	MeasurementTool = {};

MeasurementTool.Protractor = MeasurementTool.Ruler.extend();
MeasurementTool.Protractor.prototype.init = function(config) {
    // Apply parent function
    MeasurementTool.Protractor.parent.init.apply(this, arguments);
    this.addListener('set', this.adjustPosition);
};
MeasurementTool.Protractor.prototype.defaultConfig = function(object, property, oldConfig, newConfig) {
    newConfig.min = newConfig.min || -5;
    newConfig.max = newConfig.max || 5;
    MeasurementTool.Protractor.parent.defaultConfig.apply(this, arguments);
    newConfig.thickness = newConfig.height;
    newConfig.height = newConfig.width / 2 + newConfig.thickness;
    newConfig.origin = {
        x: newConfig.width / 2,
        y: newConfig.width / 2
    }
    newConfig.outline = newConfig.stroke;
    delete newConfig.stroke;
};
// Override parent getRotation function
MeasurementTool.Protractor.prototype.getRotation = function(object, property, transforms) {
    // CAUTION: Skip the parent, and call the parent's parent!
    var width = this.get('width');
    var origin = this.get('origin');
    if (!transforms.exists('rotation'))
        transforms.set('rotation', {
            type: 'rotation',
            angle: 0,
            x: origin.x,
            y: origin.y
        });
    MeasurementTool.Ruler.parent.getRotation.apply(this, arguments);
};

//adjusting initial position for protractor
MeasurementTool.Protractor.prototype.adjustPosition = function () {

    var protractorLeft = (window.innerWidth - this.get('canvas').width) / 2,
        protractorTop = (window.innerHeight - this.get('canvas').height) / 2;

    //set initial position for both the container and the canvas
    this.moveNode(this.get('node'), 'x', 0, protractorLeft);
    this.moveNode(this.get('node'), 'y', 0, protractorTop);
    this.set('x', protractorLeft);
    this.set('y', protractorTop);
};

MeasurementTool.Protractor.prototype.addOutline = function(object, property, oldSet, newSet) {
    var canvas = this.get('canvas');
    var width = +this.get('width');
    var height = +this.get('height');
    var thickness = +this.get('thickness');
    var stroke = this.get('outline');

    var outer = {
        radius: width / 2,
        top: 0,
        bottom: height - thickness,
        left: 0,
        right: width
    };
    var inner = {
        radius: outer.radius - thickness,
        bottom: height - thickness,
        left: outer.left + thickness,
        right: outer.right - thickness
    };
    /*
	inner.left = thickness + inner.radius - inner.radius * Math.cos( Math.asin(thickness/inner.radius) );
	inner.right = outer.right - (inner.left - outer.left);
	*/

    var outline = canvas.set([
        canvas.rect(0, width / 2, width, thickness).attr({
            stroke: stroke
        }),
        canvas.path([
            "M",
            0, width / 2, //start coordinates
            "A",
            outer.radius, outer.radius, // x and y radii
            0, // rotation
            1, // large arc
            1, // clockwise
            outer.right, outer.bottom, // end coordinates
            "Z"
        ].join(" ")).attr({
            stroke: stroke
        })
    ]);
    this.set('outline', outline);   //set outline as protractor's outline, instead of the config.outline, which is just a color string.
    newSet.push(this.get('children').set('outline', outline));
};

MeasurementTool.Protractor.prototype.addTickMarks = function(object, property, oldSet, newSet) {
    MeasurementTool.Protractor.parent.addTickMarks.apply(this, arguments);
    var canvas = this.get('canvas');
    var raphael = this.get('raphael');
    var config = this.get('config');
    var tickmarks = canvas.set();
    var center = {
        x: config.width / 2,
        y: config.width / 2
    }
    var offset = {};
    var path;

    for (var a = 1; a < 180; a++) {
        offset.angle = raphael.rad(-a);
        offset.x = config.width / 2 * Math.cos(offset.angle);
        offset.y = config.width / 2 * Math.sin(offset.angle);
        path = [];
        if (a % 10 == 0) {
            path.push(
                "M",
                center.x + 0.10 * offset.x,
                center.y + 0.10 * offset.y,
                "L",
                center.x + 0.70 * offset.x,
                center.y + 0.70 * offset.y,
                "M",
                center.x + 0.90 * offset.x,
                center.y + 0.90 * offset.y,
                "L",
                center.x + offset.x,
                center.y + offset.y
            );
            tickmarks.push(canvas.text(center.x + 0.75 * offset.x, center.y + 0.75 * offset.y, a).transform('R' + (-a + 90)));
            tickmarks.push(canvas.text(center.x + 0.85 * offset.x, center.y + 0.85 * offset.y, 180 - a).transform('R' + (-a + 90)));
        } else if (a % 5 == 0) {
            path.push(
                "M",
                center.x + 0.95 * offset.x,
                center.y + 0.95 * offset.y,
                "L",
                center.x + offset.x,
                center.y + offset.y
            );
        } else {
            path.push(
                "M",
                center.x + 0.975 * offset.x,
                center.y + 0.975 * offset.y,
                "L",
                center.x + offset.x,
                center.y + offset.y
            );
        }
        tickmarks.push(
            canvas.path(path.join(" ")).attr({
                stroke: config.outline
            })
        );
    }

    newSet.push(this.get('children').set('tickmarks', tickmarks));
};
MeasurementTool.Protractor.prototype.addDragHandles = function(object, property, oldSet, newSet) {
    var canvas = this.get('canvas');
    var width = +this.get('width');
    var height = +this.get('height');
    var thickness = +this.get('thickness');
    var config = this.get('config');
    var children = this.get('children');
    // Rotation drag handle
    var outer = {
        left: 0,
        right: width,
        top: 0,
        bottom: height - thickness,
        radius: width / 2
    };
    newSet.push(
        children.set('rotate',
            canvas.set([
                canvas.rect(outer.left, outer.bottom, 2 * outer.radius, thickness),
                canvas.path([
                    "M",
                    outer.left, outer.bottom, // start coordinates
                    "A",
                    outer.radius, outer.radius, // x and y radii
                    0, // rotation
                    0, // small arc
                    1, // clockwise
                    outer.right, outer.bottom, // end coordinates
                    "Z"
                ].join(" "))
            ]).attr(this.get('dragHandleAttributes')).attr({
                cursor: 'rotate'
            }).drag(
                this.rotation.drag,
                this.rotation.start,
                this.rotation.stop,
                this,
                this,
                this
            )
        )
    );
    // Move drag handles
    var inner = {
        left: thickness,
        right: width - thickness,
        top: 0,
        bottom: height - thickness,
        radius: width / 2 - thickness
    };
    newSet.push(
        children.set('drag',
            canvas.set([
                canvas.rect(inner.left, inner.bottom, 2 * inner.radius, thickness),
                canvas.path([
                    "M",
                    inner.left, inner.bottom, // start coordinates
                    "A",
                    inner.radius, inner.radius, // x and y radii
                    0, // rotation
                    0, // small arc
                    1, // clockwise
                    inner.right, inner.bottom, // end coordinates
                    "Z"
                ].join(" "))
            ]).attr(this.get('dragHandleAttributes')).attr({
                "cursor": "move"
            }).drag(
                this.translation.drag,
                this.translation.start,
                this.translation.stop,
                this,
                this,
                this
            )
        )
    );
};
