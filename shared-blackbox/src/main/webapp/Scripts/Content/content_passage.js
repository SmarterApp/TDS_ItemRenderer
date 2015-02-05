(function(CM) {

    function Passage(page, bankKey, itemKey, filePath) {
        Passage.superclass.constructor.call(this, page, bankKey, itemKey, filePath);
    }

    YAHOO.lang.extend(Passage, ContentEntity);

    Passage.prototype.getID = function() {
        return 'G-' + this.bankKey + '-' + this.itemKey;
    };

    // get passage container element
    Passage.prototype.getElement = function() {
        var pageElement = this.getPage().getElement();
        return Util.Dom.getElementByClassName('thePassage', 'div', pageElement);
    };

    // get the container element for the tools
    Passage.prototype.getToolsElement = function() {
        var pageElement = this.getPage().getElement();
        return Util.Dom.getElementByClassName('passageTools', 'div', pageElement);
    };

    // call this function when setting removing focus on an item
    Passage.prototype.clearActive = function() {
        var itemElement = this.getElement();

        // remove css
        YUD.removeClass(itemElement, 'activePassage');

        Passage.superclass.clearActive.call(this);
    };

    // this gets called when making a passage active
    Passage.prototype.setActive = function (opts) {

        var activated = Passage.superclass.setActive.call(this, opts);

        // add css
        if (activated) {
            var element = this.getElement();
            YUD.addClass(element, 'activePassage');
        }

        return activated;
    };

    Passage.prototype._log = function(message) {
        if (CM._debug) {
            CM.log('PASSAGE G-' + this.bankKey + '-' + this.itemKey + ': ' + message);
        }
    };

    Passage.prototype.toString = function() {
        return 'Passage G-' + this.bankKey + '-' + this.itemKey;
    };

    window.ContentPassage = Passage;

})(window.ContentManager);