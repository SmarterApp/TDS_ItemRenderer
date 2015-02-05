// QUnit.config.autostart = false;
// QUnit.config.reorder = false;

var grid = null;

// use this function to create a grid for a test
function createGrid(callback) {
    var el = document.getElementById('gridContainer');
    grid = new Grid(el, '../grid.svg');
    grid.init();
    grid.subscribe('onStateChange', function (evt) {
        if (evt.state == GridState.Ready) {
            if (callback() !== false) {
                start();
            }
        }
    });
    return grid;
}

QUnit.testStart(function() {
});

QUnit.testDone(function () {
    if (grid) {
        grid.dispose();
        grid = null;
    }
});

asyncTest('Check if grid is ready', function () {
    var grid = createGrid(ready);
    function ready() {
        ok(grid.getState() == Grid.State.Ready);
    }
});

//#region Points
module('Points');

asyncTest('Add', function () {
    var grid = createGrid(ready);
    function ready() {
        var point = grid.model.addPoint(10, 10);
        grid.canvas.finalizePoint(point);
        equal(point.x, 10);
        equal(point.y, 10);
        equal(point.isVisible(), true);
        equal(point.isFocused(), true);
        equal(point.isMoveable(), true);
        equal(point.isDeletable(), false);
        equal(point.isHoverable(), false);
        equal(point.isSelectable(), false);
        equal(point.isSelected(), false);
    }
});

asyncTest('Add near each other', function () {
    var grid = createGrid(function() {
        var point1 = grid.model.addPoint(10, 10);
        grid.canvas.finalizePoint(point1);
        var point2 = grid.model.addPoint(10, 11);
        grid.canvas.finalizePoint(point2);
        var points = grid.model.getPoints();
        equal(points.length, 1);
        equal(points[0], point1);
    });
});

asyncTest('Add then hide', function () {
    var grid = createGrid(ready);
    function ready() {
        var point = grid.model.addPoint(10, 10);
        grid.canvas.finalizePoint(point);
        point.hide();
        equal(point.isVisible(), false);
    }
});

//#endregion

