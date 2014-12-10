// holds a collection of accommodations and has a current accommodations set at any one time
Accommodations.Manager =
{
    _mapOfAccommodations: new Util.Structs.Map(),
    _current: null, // the current ID
    onChange: new YAHOO.util.CustomEvent('onChange', Accommodations.Manager, false, YAHOO.util.CustomEvent.FLAT)
};

Accommodations.Manager.clear = function() {
    this._mapOfAccommodations.clear();
    this._current = null;
};

Accommodations.Manager.add = function(accommodations) {
    var id = accommodations.getId();
    this._mapOfAccommodations.set(id, accommodations);

    // if this is the first accommodations set added then set it as the current
    if (this._current == null) {
        this.setDefault(id);
        this.setCurrent(id);
    }
};

Accommodations.Manager.get = function(id) {
    return this._mapOfAccommodations.get(id);
};

// get the properties
Accommodations.Manager.getProperties = function(id) {
    var accommodations = this.get(id);
    return new Accommodations.Properties(accommodations);
};

Accommodations.Manager.setDefault = function(id) {
    if (YAHOO.lang.isString(id)) {
        this._default = id;
    }
};

Accommodations.Manager.getDefault = function() {
    return this.get(this._default);
};

Accommodations.Manager.getDefaultProperties = function() {
    var accommodations = this.getDefault();
    return new Accommodations.Properties(accommodations);
};

Accommodations.Manager.getDefaultProps = Accommodations.Manager.getDefaultProperties;

Accommodations.Manager.setCurrent = function (id) {

    if (!YAHOO.lang.isString(id)) return; // check valid ID
    if (id == this._current) return; // check for change
    if (this.get(id) == null) return; // check if accs exist

    var accsPrevious = this.getCurrent(); // can be null the first time
    this._current = id;
    var accsCurrent = this.getCurrent();

    // fire event
    this.onChange.fire({
        previous: accsPrevious,
        current: accsCurrent
    });
};

// get the current accommodations
Accommodations.Manager.getCurrent = function() {
    return this.get(this._current);
};

// get the current properties
Accommodations.Manager.getCurrentProperties = function() {
    var accommodations = this.getCurrent();
    return new Accommodations.Properties(accommodations);
};

Accommodations.Manager.getCurrentProps = Accommodations.Manager.getCurrentProperties;

Accommodations.Manager.addJson = function(json) {
    if (YAHOO.lang.isArray(json)) {
        Util.Array.each(json, Accommodations.Manager.addJson, this);
    } else {
        var accommodations = Accommodations.create(json);
        accommodations.selectAll(); // we only have acc's that we use, so select them all
        this.add(accommodations);
    }
};

Accommodations.Manager.updateCSS = function(el, newId) {

    var newAccs = Accommodations.Manager.get(newId);
    if (newAccs == null) return;

    // get current accs id
    var currentId = el.getAttribute(Accommodations.DOM_ID);

    // check if accs have changed
    if (currentId != newId) {

        // remove old accs css
        if (currentId != null) {
            var currentAccs = Accommodations.Manager.get(currentId);
            if (currentAccs) {
                currentAccs.removeCSS(el);
            }
        }

        // apply new accs css
        newAccs.applyCSS(el);
    }

};