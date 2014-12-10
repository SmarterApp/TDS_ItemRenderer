// this is a selectable choice
TDS.SelectChoice = function(identifier, element, config) {

    // set properties
    this._selected = false;

    // call base constructor
    TDS.SelectChoice.superclass.constructor.call(this, identifier, element, config);

    // create events
    this.createEvent('beforeSelectEvent');
    this.createEvent('selectEvent');
    this.createEvent('deselectEvent');
};

YAHOO.extend(TDS.SelectChoice, TDS.Choice);

TDS.SelectChoice.prototype.isSelected = function() {
    return this._selected;
};

// get the group id for this select choice
TDS.SelectChoice.prototype.getGroupIdentifier = function() {
    return this._element.getAttribute('data-its-group');
};

// try to select the choice
TDS.SelectChoice.prototype.select = function() {

    if (this._selected) {
        return false;
    }

    // fire before select event 
    var b4result = this.fireEvent('beforeSelectEvent', this._identifier);

    // check if nobody cancelled the selection
    if (b4result !== false) {
        this._selected = true;
        this.onSelect();
        this.fireEvent('selectEvent', this._identifier);
        return true;
    }

    return false;
};

// deselect the choice
TDS.SelectChoice.prototype.deselect = function() {
    if (!this._selected) {
        return false;
    }
    this._selected = false;
    this.onDeselect();
    this.fireEvent('deselectEvent', this._identifier);
    return true;
};

// this is called when the choice has been selected
TDS.SelectChoice.prototype.onSelect = function() {
    YUD.addClass(this._element, 'selected');
    this._element.setAttribute('aria-checked', 'true');
};

// this is called when the choice has been deselected
TDS.SelectChoice.prototype.onDeselect = function() {
    YUD.removeClass(this._element, 'selected');
    this._element.setAttribute('aria-checked', 'false');
};

// this is called when the choice is clicked
TDS.SelectChoice.prototype.onClick = function(ev) {
    if (this.isSelected()) {
        this.deselect();
    } else {
        this.select();
    }
};

TDS.SelectChoice.prototype.init = function() {
    var el = this._element;
    el.setAttribute('tabindex', '0');
    el.setAttribute('role', 'checkbox');
    el.setAttribute('aria-checked', 'false');

    // listen for mouse click
    YAHOO.util.Event.on(el, 'click', this.onClick, this, true);

    // listen for enter key
    new YAHOO.util.KeyListener(el, {
        keys: [13]
    }, {
        fn: this.onClick,
        scope: this,
        correctScope: true
    }).enable();
};