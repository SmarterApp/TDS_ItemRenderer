(function(CM, Entity) {

    function Item(page, bankKey, itemKey, filePath, format, responseType, grade, subject, position) {

        this.format = format;
        this.responseType = responseType;
        this.grade = grade;
        this.subject = subject;
        this.position = position;
        this.isDirty = false;
        this.value = null;
        this.disabled = false;

        // TTS
        this.stemTTS = null;
        this.illustrationTTS = null;

        // content
        this.gridAnswerSpace = null;
        this.tutorial = null;
        this.gtr = null;

        Item.superclass.constructor.call(this, page, bankKey, itemKey, filePath);

        // widgets collection
        this.widgets = new CM.Widgets();

        // track order of plugins added
        this.widgets.on('add', function (widget) {
            this.orderedPlugins.push(widget);
        }.bind(this));
        this.widgets.on('remove', function (widget) {
            Util.Array.remove(this.orderedPlugins, widget);
        }.bind(this));

    }

    YAHOO.lang.extend(Item, Entity);

    Item.prototype.getParentPage = function() {
        return this._page;
    };

    Item.prototype.getID = function () {
        return 'I-' + this.bankKey + '-' + this.itemKey;
    };

    // this function gets called when a new instance of content item is created
    Item.prototype.init = function () {};

    // check if read-only is enabled for this item
    Item.prototype.isReadOnly = function () {
        // check global flag
        if (CM.isReadOnly()) {
            return true;
        }
        // check item flag
        return this.disabled;
    };

    // check if the response type of the item matches what is passed in
    Item.prototype.isResponseType = function (type) {
        return type.toLowerCase() == this.responseType.toLowerCase();
    };

    // get item container element
    Item.prototype.getElement = function () {

        // if we used compound layout we want to get the wrapper used on stem/items
        var compoundEl = this._page.getCompoundElement();
        if (compoundEl) {
            return compoundEl;
        } else { // return the item container div
            var doc = this._page.getDoc();
            if (doc) {
                return doc.getElementById('Item_' + this.position);
            }
        }

        return null;
    };

    // get item illustration element
    Item.prototype.getIllustrationElement = function () {
        var doc = this._page.getDoc();
        return doc ? doc.getElementById('Illustration_' + this.position) : null;
    };

    // get item stem element
    Item.prototype.getStemElement = function () {
        var doc = this._page.getDoc();
        return doc ? doc.getElementById('Stem_' + this.position) : null;
    };

    // get the response container
    // Bug 113503 return an array of elements instead of container
    Item.prototype.getResponseArea = function () {

        var doc = this._page.getDoc();
        if (!doc) return null;

        // Commenting this out for now since this is interfering with the tags that the taggers have provided. 
        // They have added tagged descriptions for these to the end of the stem so TTS attempting to read these new elements causes problems
        /*
        // check for response types we know about
        var responseType = this.responseType.toLowerCase();
        switch (responseType) {
            case 'tableinput':
                return doc.getElementById('TableContainer_' + this.position);
            case 'tablematch':
                return doc.getElementById('MatchContainer_' + this.position);
            case 'simulator':
                return doc.getElementById('SimContainer_' + this.position);
        }
        */

        var pageEl = this._page.getElement();

        // check for mc parent
        var mcWidgets = this.widgets.get('mc');
        if (mcWidgets.length) {
            var mcWidget = mcWidgets[0];
            var optionGroup = mcWidget._group;
            var options = optionGroup.getOptions();
            var optionElements = [];
            if (options && options.length > 0) {
                for (var i = 0; i < options.length; i++) {
                    var optionEl = options[i].getElement();
                    if (optionEl) {
                        optionElements.push(optionEl);
                    }
                }
            }
            return optionElements;
        }

        return null;
    };
    
    // call this function when setting removing focus on an item
    Item.prototype.clearActive = function () {
        // remove css
        var itemElement = this.getElement();
        YUD.removeClass(itemElement, 'activeItem');
        Item.superclass.clearActive.call(this);
    };

    // this gets called when making an item active
    Item.prototype.setActive = function (opts) {

        var activated = Item.superclass.setActive.call(this, opts);

        // add css
        if (activated) {
            var element = this.getElement();
            YUD.addClass(element, 'activeItem');
        }

        // set focus to question element container
        // if (activated) CM.focus(element);

        // only scroll the question into view if using keyboard
        // if (typeof (domEvent) == 'undefined') element.scrollIntoView(true);

        return activated;
    };

    Item.prototype.showFeedback = function () {
        var itemEl = this.getElement();
        if (itemEl) {
            YUD.addClass(itemEl, 'showFeedback');
        }
    };

    Item.prototype.hideFeedback = function () {
        var itemEl = this.getElement();
        if (itemEl) {
            YUD.removeClass(itemEl, 'showFeedback');
        }
    };

    // get the container element for the tools
    Item.prototype.getToolsElement = function () {
        return $('.itemTools', this.getElement()).get(0);
    };
    
    Item.prototype._log = function (message) {
        if (CM._debug) {
            console.log('ITEM I-' + this.bankKey + '-' + this.itemKey + ' (' + this.position + '): ' + message);
        }
    };

    Item.prototype.toString = function () {
        return 'Item I-' + this.bankKey + '-' + this.itemKey;
    };

    window.ContentItem = Item;

})(ContentManager, ContentEntity);
