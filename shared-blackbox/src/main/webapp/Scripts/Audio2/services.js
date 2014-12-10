/*
This is used for creating a collection of generic services.
*/

TDS = window.TDS || {};
TDS.Audio = TDS.Audio || {};

TDS.Audio.Services = function() {
    this._initialized = false;
    this._list = [];
    this._lookup = {};
};

// register a recorder service
TDS.Audio.Services.prototype.register = function(service) {
    var name = service.getName();
    console.info('AudioService Register: ' + name);
    this._list.push(service);
    this._lookup[name] = service;
};

TDS.Audio.Services.prototype.getList = function() {
    return this._list;
};

TDS.Audio.Services.prototype.get = function(name) {
    return this._lookup[name];
};

TDS.Audio.Services.prototype.remove = function(name) {
    var service = this.getService(name);
    Util.Array.remove(this._list, service);
    delete this._lookup[name];
};

// reorder the priority of the registered audio recorders
TDS.Audio.Services.prototype.prioritize = function(names /*Array*/) {

    names = names || [];
    
    // make sure names array has all the players
    for (var i = 0; i < this._list.length; i++) {
        var name = this._list[i].getName();
        if (names.indexOf(name) == -1) {
            names.push(name);
        }
    }

    Util.Array.sort(this._list, function(recA, recB) {
        var idxA = names.indexOf(recA.getName());
        var idxB = names.indexOf(recB.getName());
        return idxA > idxB ? 1 : idxA < idxB ? -1 : 0;
    });

    return this._list;
};

// Get the first service that is supported on this browser.
TDS.Audio.Services.prototype.getSupported = function() {
    
    var services = this.getList();
    for (var i = 0; i < services.length; i++) {
        var service = services[i];
        if (service.isSupported()) {
            return service;
        }
    }

    return null;
};
