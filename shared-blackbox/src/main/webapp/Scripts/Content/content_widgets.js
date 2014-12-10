/*
Widgets collection.
*/

ContentManager.Widgets = (function () {

    function Widgets() {
        this._list = []; // list of widgets
        this._groups = {}; // group of widgets by name
        Util.Event.Emitter(this);
    }
    
    Widgets.prototype.add = function(name, widget) { // addWidget
        if (this._list.indexOf(widget) != -1) {
            throw new Error('The widget \'' + widget.id + '\' is already added');
        }
        this._list.push(widget);
        var group = this._groups[name];
        if (!group) {
            group = [];
            this._groups[name] = group;
        }
        group.push(widget);
        // order widgets by dom position
        this._list.sort(function(w1, w2) {
            var e1 = w1.element;
            var e2 = w2.element;
            return e1.compareDocumentPosition(e2) & 2 ? 1 : -1;
        });
        this.fire('add', widget);
    };

    // get widget groups flattened
    Widgets.prototype.getAll = function () { // getWidgets
        return this._list;
    };

    // get all the widget names
    Widgets.prototype.getNames = function() { // getWidgetNames
        return Util.Object.keys(this._groups);
    };

    Widgets.prototype.has = function(name) {
        return !!this._groups[name];
    };

    // get a widget
    Widgets.prototype.get = function(name, id) { // getWidgetGroup
        var group = this._groups[name] || [];
        if (typeof id == 'string') {
            return Util.Array.find(group, function (widget) {
                return widget.id == id;
            });
        } else if (typeof id == 'number') {
            return group[id];
        } else {
            return group;
        }
    };

    Widgets.prototype.remove = function (widget) { // removeWidget
        // remove from array
        var removed = Util.Array.remove(this._list, widget);
        // remove in groups
        Util.Object.each(this._groups, function (widgets, name) {
            if (Util.Array.remove(widgets, widget)) {
                // remove group if empty
                if (!widgets.length) {
                    delete this._groups[name];
                }
            }
        }, this);
        // fire event if removed
        if (removed) {
            this.fire('remove', widget);
        }
        return removed;
    };

    Widgets.prototype.clear = function () {
        Util.Array.clear(this._list);
        Object.keys(this._groups).forEach(function (group) {
            Util.Array.clear(group);
        });
        Util.Object.clear(this._groups);
    };

    return Widgets;

})();
