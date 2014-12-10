// Namespace
if (typeof(MeasurementTool) == "undefined") {
    MeasurementTool = {};
}

MeasurementTool.Arc = PiObject.extend();

MeasurementTool.Arc.prototype.init = function(config) {
    config = config || {};
    config.radius = Math.abs(config.radius);
    config['stroke-width'] = config['stroke-width'] || 13;
    // Apply parent function
    MeasurementTool.Arc.parent.init.apply(this, arguments);
    this.addListener('radius', this.positiveRadius, false);
    this.addListener('canvas', this.addCanvas); // keep this separate for consistency.
};

MeasurementTool.Arc.prototype.positiveRadius = function (object, property, oldValue, newValue) {
    if (newValue < 0) {
        return Math.abs(newValue);
    }
};

MeasurementTool.Arc.prototype.addCanvas = function (object, property, oldCanvas, newCanvas) {
    // Whenever anything changes, reapply the render function.
    this.addListener('center', this.render, false);
    this.addListener('start', this.render, false);
    this.addListener('end', this.render, false);
    this.render(); // Only execute once at the start.
};

MeasurementTool.Arc.prototype.render = function (object, property, oldValue, newValue) {

    if (property == "node") {
        return;
    }

    var large_arc_flag,
        sweep_flag = this.get('direction'),
        center = this.get('center'),
        radius = this.get('radius'),
        start = this.get('start'),
        end = this.get('end');

    if (sweep_flag == "") {
        if (start < end) {
            sweep_flag = "1";
        } // clockwise
        else if (start > end) {
            sweep_flag = "0";
        } // counter-clockwise
        // WARNING: This function intentionally does not set the direction when the start and end angles are equal.
        if (sweep_flag != "") {
            this.set('direction', sweep_flag);
        } else {
            sweep_flag = "0";
        } // default
    }

    if (Math.abs(end - start) >= 180) {
        large_arc_flag = 1;
    } else {
        large_arc_flag = 0;
    }

    // Remove old node
    if (this.exists('node')) {
        this.get('node').remove();
    }

    // Create new node
    if (Math.abs(end - start) >= 360) {
        var node = this.get('canvas').get('canvas').circle(center.x, center.y, radius);
    } else {
        start = parseInt(start) * Math.PI / 180.0;
        start = [center.x + radius * Math.cos(start), center.y + radius * Math.sin(start)].join(',');
        end = parseInt(end) * Math.PI / 180.0;
        end = [center.x + radius * Math.cos(end), center.y + radius * Math.sin(end)].join(',');
        var path = [
            "M",
            start,
            "A",
            [radius, radius].join(','),
            "0",
            [large_arc_flag, sweep_flag].join(','),
            end
        ].join(' ');
        var node = this.get('canvas').get('canvas').path(path);
    }

    node.attr(this.get('config'));
    this.set('node', node);
};