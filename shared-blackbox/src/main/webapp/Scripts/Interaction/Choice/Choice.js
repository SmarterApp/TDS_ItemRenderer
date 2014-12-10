// abstract class for creating choices
TDS.Choice = function(identifier, element, config)
{
    this._identifier = identifier || '';
    this._element = element || null;
    this._config = config || {};

    this.init();
};

YAHOO.lang.augmentProto(TDS.Choice, YAHOO.util.EventProvider);

TDS.Choice.prototype.getIdentifier = function() { return this._identifier; };

// get the element for this choice
TDS.Choice.prototype.getElement = function() { return this._element; };

// get the document object for this element
TDS.Choice.prototype.getDoc = function()
{
    var element = this.getElement();
    return Util.Dom.getOwnerDocument(element);
};

// get the window object for this element
TDS.Choice.prototype.getWin = function()
{
    var elementDoc = this.getDoc();
    return Util.Dom.getWindow(elementDoc);
};

// return all the regions for this DOM element
TDS.Choice.prototype.getRegions = function() {
    var choiceEl = this.getElement();
    return Util.Dom.getElementRegions(choiceEl);
};

TDS.Choice.prototype.init = function() { };

TDS.Choice.prototype.toString = function()
{
    return this.getIdentifier();
};
