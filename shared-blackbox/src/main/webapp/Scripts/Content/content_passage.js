var ContentPassage = function(page, bankKey, itemKey, filePath) {
    ContentPassage.superclass.constructor.call(this, page, bankKey, itemKey, filePath);
};

YAHOO.lang.extend(ContentPassage, ContentEntity);

ContentPassage.prototype.getID = function() {
    return 'G-' + this.bankKey + '-' + this.itemKey;
};

// get passage container element
ContentPassage.prototype.getElement = function() {
    var pageElement = this.getPage().getElement();
    return Util.Dom.getElementByClassName('thePassage', 'div', pageElement);
};

// get the container element for the tools
ContentPassage.prototype.getToolsElement = function () {
    var pageElement = this.getPage().getElement();
    return Util.Dom.getElementByClassName('passageTools', 'div', pageElement);
};

// call this function when setting removing focus on an item
ContentPassage.prototype.clearActive = function() {
    var itemElement = this.getElement();

    // remove css
    YUD.removeClass(itemElement, 'activePassage');

    ContentPassage.superclass.clearActive.call(this);
};

// this gets called when making a passage active
ContentPassage.prototype.setActive = function(domEvent, force) // parameters optional
{
    var activated = ContentPassage.superclass.setActive.call(this, domEvent, force);

    // add css
    if (activated) {
        var element = this.getElement();
        YUD.addClass(element, 'activePassage');
    }

    // set focus to question element container
    // if (activated) ContentManager.focus(element);

    return activated;
};

ContentPassage.prototype._log = function(message) {
    if (ContentManager._debug) {
        ContentManager.log('PASSAGE G-' + this.bankKey + '-' + this.itemKey + ': ' + message);
    }
};

ContentPassage.prototype.toString = function() {
    return 'Passage G-' + this.bankKey + '-' + this.itemKey;
};