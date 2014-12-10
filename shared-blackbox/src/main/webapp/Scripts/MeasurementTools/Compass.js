// Namespace
if (typeof(MeasurementTool) == "undefined") {
    MeasurementTool = {};
}

MeasurementTool.Compass = MeasurementTool.Set.extend();

MeasurementTool.Compass.prototype.init = function(config) {
    // Apply parent function
    MeasurementTool.Compass.parent.init.apply(this, arguments);
    this.set('arcs', new PiObject()).addListener(MeasurementTool.Compass.prototype.removeArc);
    this.addListener('set', this.addPivotArm);
    this.addListener('set', this.addPencilArm);
    this.addListener('set', this.addPencil);
    this.addListener('set', this.addHandle);
};

MeasurementTool.Compass.prototype.defaultConfig = function(object, property, oldConfig, newConfig) {
    newConfig.angle = newConfig.angle || 0;
    newConfig.radius = newConfig.radius || 16;
    newConfig.width = newConfig.width || 32;
    newConfig.height = newConfig.height || 220;
    newConfig.center = { x: 8, y: 220 };
    newConfig.joint = { x: 24, y: 67 };
    MeasurementTool.Compass.parent.defaultConfig.apply(this, arguments);
};

MeasurementTool.Compass.prototype.setVisibility = function(object, property, oldValue, newValue) {
    if (newValue == 'hidden') {
        this.set({
            'angle': 0,
            'radius': 16
        }).get('children').each(function(children, index, child) {
            child.get('transforms').remove('translation', 'rotation');
        });
    }
    MeasurementTool.Compass.parent.setVisibility.apply(this, arguments);
};

MeasurementTool.Compass.prototype.addHandle = function(object, property, oldSet, newSet) {
    var canvas = this.get('canvas').get('canvas');
    // Handle
    newSet.push(
        this.get('children').set('handle',
            new MeasurementTool.Set({
                set: canvas.set([
                    canvas.rect(13.5, 20, 5, 10).attr({
                        "fill": "#808285",
                        "stroke": "#6D6E71",
                        "stroke-miterlimit": "10"
                    }),
                    canvas.rect(11, 0, 10, 20).attr({
                        "fill": "#D1D3D4",
                        "stroke": "#808285",
                        "stroke-miterlimit": "10"
                    }),
                    canvas.rect(0, 25, 32, 50, 6).attr({
                        "fill": "#808285",
                        "stroke": "#6D6E71",
                        "stroke-miterlimit": "10"
                    }),
                    canvas.path("M12.5,44 l7,0 l3,6 l-3,6 l-7,0 l-3,-6 z").attr({
                        "fill": "#F1F2F2",
                        "stroke": "#BCBEC0",
                        "stroke-miterlimit": "10"
                    }),
                    canvas.circle(16, 50, 2.33).attr({
                        "fill": "#F1F2F2",
                        "stroke": "#BCBEC0",
                        "stroke-miterlimit": "10"
                    })
                ]).attr({
                    "cursor": "move"
                }).drag(this.rotation.drag, this.rotation.start, this.rotation.stop, this, this, this)
                //.drag( this.translation.drag, this.translation.start, this.translation.stop, this, this, this )
            })
        ).get('set')
    );
};

MeasurementTool.Compass.prototype.addPivotArm = function(object, property, oldSet, newSet) {
    var canvas = this.get('canvas').get('canvas');
    newSet.push(
        this.get('children').set('pivot_arm',
            new MeasurementTool.Set({
                rotation: 0,
                center: { x: 8, y: 220 },
                set: canvas.set([
                    canvas.path("M7,205 l2,0 l-1,15 z").attr({
                        "fill": "none",
                        "stroke": "#BCBEC0",
                        "stroke-miterlimit": "10"
                    }),
                    canvas.rect(3, 65, 10, 140).attr({
                        "fill": "#D1D3D4",
                        "stroke": "#808285",
                        "stroke-miterlimit": "10"
                    }),
                    canvas.circle(8, 195, 7).attr({
                        "fill": "#F1F2F2",
                        "stroke": "#BCBEC0",
                        "stroke-miterlimit": "10"
                    }),
                    canvas.circle(8, 195, 2.5).attr({
                        "fill": "#F1F2F2",
                        "stroke": "#BCBEC0",
                        "stroke-miterlimit": "10"
                    }),
                    canvas.rect(-3, 65, 22, 155).attr(this.get('dragHandleAttributes'))
                ]).attr({
                    "cursor": "move"
                }).drag(
                    function(dx, dy, canvasX, canvasY) {
                        // this.rotation.drag.apply(this, arguments);
                        this.translation.drag.apply(this, arguments);

                    },
                    function(canvasX, canvasY, event) {
                        // this.rotation.drag.apply(this, arguments);
                        this.translation.start.apply(this, arguments);

                    },
                    function(canvasX, canvasY, event) {
                        // this.rotation.drag.apply(this, arguments);
                        this.translation.stop.apply(this, arguments);

                    },
                    this,
                    this,
                    this
                )
            })
        ).get('set')
    );
};

MeasurementTool.Compass.prototype.addPencilArm = function(object, property, oldSet, newSet) {
    var start;
    var canvas = this.get('canvas').get('canvas');
    newSet.push(
        this.get('children').set('pencil_arm',
            new MeasurementTool.Set({
                rotation: 0,
                center: { x: 24, y: 67 },
                set: canvas.set([
                    /* Hiding this superfluous physical adjustment wheel, to make it easier to flip entire compass across the vertical.
					canvas.rect(29, 149, 2, 6).attr({
						"fill" : "#F1F2F2",
						"stroke" : "#BCBEC0",
						"stroke-miterlimit" : "10"
					}),
					canvas.rect(31, 145, 3, 14, 1).attr({
						"fill" : "#F1F2F2",
						"stroke" : "#BCBEC0",
						"stroke-miterlimit" : "10"
					}),
					*/
                    canvas.rect(19, 65, 10, 100).attr({
                        "fill": "#D1D3D4",
                        "stroke": "#808285",
                        "stroke-miterlimit": "10"
                    }),
                    canvas.rect(13, 65, 22, 100).attr(this.get('dragHandleAttributes'))
                ]).attr({
                    "cursor": "e-resize"
                }).drag(
                    function(dx, dy, canvasX, canvasY) {
                        // this.rotation.drag.apply(this, arguments);
                        my = {};
                        my.offset = this.get('offset');
                        my.children = this.get('children');
                        my.transforms = this.get('transforms');
                        my.translation = my.transforms.get('translation');
                        my.rotation = my.transforms.get('rotation');
                        my.P1 = my.children.get('pivot_arm').get('transforms').get('rotation');
                        my.P2 = my.children.get('pencil_arm').get('transforms').get('rotation');

                        /* 
							                _		Assuming that point X moves from the vertical to its position on the right side of the triangle...
							|               |dy		Given known values of dx, h1, h2, and h3...
							|               - 		1. 	x3^2 + y3^2 = h3^2
							|h3   /|\       |		2.	dx + x2 = 2*x3
							|    / | \h1    |y1		3.	x3 = (dx +x2)/2
							X h3/  |  \     |		4.	( (dx + x2)/2 )^2 + y3^2 = h3^2
							|  / y3|   X    -		5.	sin(A) = y3/h3 = y2/h2
							| /    |   |\h2 |y2		6.	y3 = y2*h3/h2
							|/)A   |   | \  |		7.	( (dx+x2)/2 )^2 + ( y2*h3/h2 )^2 = h3^2
							--------------- -		8.	x2^2 + y2^2 = h2^2
							|----------|--|  		9.	y2^2 = h2^2 - x2^2
							  dx - gap  x2   		10.	( (dx+x2)/2 )^2 + ( h3*sqrt(h2^2 - x2^2)/h2 )^2 = h3^2
							|------|---|--|  		11. (x2^2 + 2*dx*x2 + dx^2)/4 + h3^2 - (h3^2/h2^2)*x2^2 = h3^2
							  x3     x1 x2    		12. (1/4 - h3^2/h2^2)*x2^2 + (dx/2)*x2 + dx^2/4 = 0
													13.	x2 = ( -dx/2 + sqrt( (dx/2)^2 - dx^2*(1/4 - h3^2/h2^2) ) ) / ( 2*(1/4 - h3^2/h2^2) )  // quadratic equation
						*/
                        my.triangle = this.set('mouse', { x: canvasX, y: canvasY });

                        // gap is the distance between the two arms
                        // we delete the gap to create an isosceles triangle
                        // we also subtract half the width of the arm to find its center
                        my.triangle.gap = 16 + 5;
                        if (my.triangle.dx < 0) {
                            my.triangle.gap = -my.triangle.gap;
                        }

                        // reset the following to start parameters
                        my.triangle.h1 = start.h1;
                        my.triangle.h2 = start.h2;

                        // Calculate current delta
                        my.LIMIT = my.triangle.h3 + my.triangle.h1 + Math.abs(my.triangle.gap); // total extension of the compass

                        /*
						if (Math.abs(my.triangle.dx) < Math.abs(my.triangle.gap))
							my.triangle.dx = my.triangle.gap;
						*/
                        if (my.triangle.dx < -my.LIMIT) {
                            my.triangle.dx = -my.LIMIT;
                        } else if (my.triangle.dx > my.LIMIT) {
                            my.triangle.dx = my.LIMIT;
                        }

                        // Calculate portions of the quadratic equation
                        var a = 0.25 - Math.pow(my.triangle.h3 / my.triangle.h2, 2);
                        var b = Math.abs(my.triangle.dx - my.triangle.gap) / 2;
                        var c = Math.pow(Math.abs(my.triangle.dx - my.triangle.gap), 2) / 4;
                        my.triangle.x2 = (-b - Math.sqrt(Math.pow(b, 2) - 4 * a * c)) / (2 * a);

                        if (my.triangle.x2 < 0) {
                            my.triangle.x2 = (-b + Math.sqrt(Math.pow(b, 2) - 4 * a * c)) / (2 * a);
                        }

                        if (my.triangle.dx < 0) {
                            my.triangle.x2 = -my.triangle.x2;
                        }

                        my.triangle.x3 = (my.triangle.dx - my.triangle.gap + my.triangle.x2) / 2;
                        my.triangle.A = Math.acos(my.triangle.x3 / my.triangle.h3);
                        my.triangle.y3 = my.triangle.h3 * Math.sin(my.triangle.A);
                        my.triangle.dy = my.triangle.h3 - my.triangle.y3;

                        // pivot angle is the opposite angle from A.
                        my.pivot_angle = this.set('angle', 90 - Raphael.deg(my.triangle.A));

                        // use a negative radius to denote that the arc should be drawn on the reverse side.
                        this.set('radius', 2 * my.triangle.x3 + (my.triangle.dx >= 0 ? 16 : -16)); // 16 => gap between arm pivot points

                        // Set transformations
                        my.children.get('pivot_arm').get('transforms').set({
                            'rotation': {
                                angle: my.pivot_angle,
                                x: my.P1.x,
                                y: my.P1.y
                            }
                        });

                        my.children.get('handle').get('transforms').set({
                            'translation': {
                                x: (my.triangle.dx < 0) ? my.triangle.x3 - 16 : my.triangle.x3,
                                y: my.triangle.dy
                            }
                        });

                        my.children.get('pencil_arm').get('transforms').set({
                            'rotation': {
                                angle: -my.pivot_angle,
                                x: my.P2.x,
                                y: my.P2.y
                            },
                            'translation': {
                                x: (my.triangle.dx < 0) ? my.triangle.x3 - 32 : my.triangle.x3,
                                y: my.triangle.dy
                            }
                        });

                        my.children.get('pencil').get('transforms').set({
                            'rotation': {
                                angle: -my.pivot_angle,
                                x: my.P2.x,
                                y: my.P2.y
                            },
                            'translation': {
                                x: (my.triangle.dx < 0) ? my.triangle.x3 - 32 : my.triangle.x3,
                                y: my.triangle.dy
                            }
                        });

                        // Don't rotate during flipping
                        if (Math.abs(my.triangle.dx) > Math.abs(my.triangle.gap)) {
                            // calculate rotation
                            if (my.triangle.x2 == 0) {
                                my.triangle.y2 = my.triangle.h2;
                            } else {
                                my.triangle.y2 = my.triangle.x2 * Math.tan(my.triangle.A);
                            }
                            my.delta = {
                                angle: Raphael.rad((start.rotation.angle - (my.triangle.dx < 0 ? 180 : 0)) % 360) - Math.atan(Math.abs(my.triangle.y2) / my.triangle.dx),
                                h: Math.sqrt(Math.pow(my.triangle.y2, 2) + Math.pow(my.triangle.dx, 2))
                            };
                            my.delta.x = my.offset.x + my.translation.x + start.rotation.x + my.delta.h * Math.cos(my.delta.angle);
                            my.delta.y = my.offset.y + my.translation.y + start.rotation.y + my.delta.h * Math.sin(my.delta.angle);
                            my.delta.rotation = Raphael.angle(canvasX, canvasY, my.delta.x, my.delta.y, my.offset.x + start.rotation.x + my.translation.x, my.offset.y + start.rotation.y + my.translation.y);
                            my.rotation.angle = start.rotation.angle + my.delta.rotation;
                        }

                        // Set global rotation, even if we don't rotate, so that it will apply the global transformation to all objects.
                        my.transforms.set('rotation', my.rotation);

                        // calculate the appropriate resize handle
                        var angle = my.rotation.angle + my.pivot_angle;
                        angle = (my.triangle.dx >= 0) ? angle % 360 : (angle - 90) % 360;
                        angle = (angle >= 0) ? angle : (angle + 360);
                        if (angle >= 0 && angle <= 90) {
                            var cursor = "e-resize";
                        } else if (angle > 90 && angle < 180) {
                            var cursor = "s-resize";
                        } else if (angle >= 180 && angle <= 270) {
                            var cursor = "w-resize";
                        } else if (angle > 270 && angle < 360) {
                            var cursor = "n-resize";
                        }
                        my.children.get('pencil_arm').get('set').attr({
                            "cursor": cursor
                        });
                    },
                    function(canvasX, canvasY, event) {
                        // this.rotation.start.apply(this, arguments);
                        this.addListener('mouse', this.setMouse);
                        start = this.set('mouse', { x: canvasX, y: canvasY });
                    },
                    function(canvasX, canvasY, event) {
                        // this.rotation.stop.apply(this, arguments);
                        this.removeListener('mouse', this.setMouse);
                    },
                    this,
                    this,
                    null
                )
            })
        ).get('set')
    );
};

// Sets the position of the mouse relative to the pivot point, after adjusting for the current rotation of the entire compass.
MeasurementTool.Compass.prototype.setMouse = function (object, property, oldMouse, newMouse) {

    // Calculate current position of mouse, relative to the object's total rotation.
    var offset = this.get('offset');
    var transforms = this.get('transforms');
    var translation = transforms.get('translation');
    var rotation = transforms.get('rotation');
    var pivot = Raphael.rad(90 - this.get('children').get('pivot_arm').get('transforms').get('rotation').angle);

    newMouse.rotation = rotation;

    // Use 360 instead of 0, so current rotation is always the higher number.
    newMouse.dAngle = Raphael.rad(Raphael.angle(newMouse.x, newMouse.y, offset.x + rotation.x + translation.x, offset.y + rotation.y + translation.y) - (rotation.angle || 360));
    if (newMouse.x < offset.x + rotation.x + translation.x) {
        newMouse.dAngle = -newMouse.dAngle;
    }

    // dh is always negative because we always open in the negative direction
    newMouse.dh = Math.sqrt(Math.pow(newMouse.x - (offset.x + rotation.x + translation.x), 2) + Math.pow((offset.y + rotation.y + translation.y) - newMouse.y, 2));
    newMouse.dx = newMouse.dh * Math.cos(newMouse.dAngle);
    newMouse.dy = newMouse.dh * Math.sin(newMouse.dAngle);
    newMouse.y2 = newMouse.dy;
    newMouse.h2 = Math.abs(newMouse.y2 / Math.sin(pivot)); // length of arm below start position
    newMouse.x2 = Math.abs(newMouse.y2 / Math.tan(pivot));
    newMouse.h3 = 153; // total length of arm
    newMouse.h1 = newMouse.h3 - newMouse.h2; // length of arm above start position

};

MeasurementTool.Compass.prototype.addPencil = function(object, property, oldSet, newSet) {
    var canvas = this.get('canvas').get('canvas');
    var arc;
    newSet.push(
        this.get('children').set('pencil',
            new MeasurementTool.Set({
                rotation: 0,
                center: { x: 24, y: 67 },
                set: canvas.set([
                    canvas.rect(23.5, 205, 1, 15).attr({
                        "fill": "none",
                        "stroke": "#231F20",
                        "stroke-miterlimit": "10"
                    }),
                    canvas.rect(23, 165, 2, 12).attr({
                        "fill": "#D1D3D4",
                        "stroke": "#808285",
                        "stroke-miterlimit": "10"
                    }),
                    canvas.rect(20.5, 177, 7, 10).attr({
                        "fill": "#D1D3D4",
                        "stroke": "#808285",
                        "stroke-miterlimit": "10"
                    }),
                    canvas.rect(22.5, 187, 3.5, 3).attr({
                        "fill": "#D1D3D4",
                        "stroke": "#808285",
                        "stroke-miterlimit": "10"
                    }),
                    canvas.path("M22,190 l4,0 l-1,15 l-2,0 l-1,-15").attr({
                        "fill": "#D1D3D4",
                        "stroke": "#808285",
                        "stroke-miterlimit": "10"
                    }),
                    canvas.rect(13, 165, 22, 55).attr(this.get('dragHandleAttributes'))
                ]).drag(
                    function(dx, dy, canvasX, canvasY) {
                        this.rotation.drag.apply(this, arguments);
                        var radius = this.get('radius');
                        var angle = this.get('transforms').get('rotation').angle - (radius < 0 ? 180 : 0);
                        var start = arc.get('start');
                        var end = arc.get('end');
                        if (angle < start) {
                            arc.set('start', angle);
                        } else if (angle > end) {
                            arc.set('end', angle);
                        }
                        // we intentionally don't change either if we're within our existing arc.
                    },
                    function(canvasX, canvasY, event) {
                        this.rotation.start.apply(this, arguments);
                        var radius = this.get('radius');
                        var transforms = this.get('transforms');
                        var translation = transforms.get('translation');
                        var rotation = transforms.get('rotation');
                        var angle = rotation.angle - (radius < 0 ? 180 : 0);
                        this.get('arcs').add(arc = new MeasurementTool.Arc({
                            canvas: this.get('canvas'),
                            center: { x: rotation.x + translation.x, y: rotation.y + translation.y },
                            radius: Math.abs(radius),
                            start: angle,
                            end: angle
                        }));
                    },
                    null,
                    this,
                    this,
                    null
                )
            })
        ).get('set')
    );
};

MeasurementTool.Compass.prototype.removeArc = function(arcs, index, oldArc, newArc) {
    if (oldArc != "") {
        oldArc.get('node').remove();
        oldArc.destroy();
    }
};