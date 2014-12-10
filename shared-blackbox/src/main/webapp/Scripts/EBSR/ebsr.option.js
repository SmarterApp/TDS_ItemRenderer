/**********************/
/* EBSR OPTION          */
/**********************/

(function() {
    // get the container div around the option
    var getElement = function () {
        var item = this._options.getItem();
        var doc = item.getPage().getDoc();
        return doc.getElementById('Item_OptionContainer_Response_EBSR_' +
            item.position + '_Part' + this._interactionKey + '_' + this.key);
    };

    // get form radio button element
    var getInputElement = function () {
        var item = this._options.getItem();
        var doc = item.getPage().getDoc();
        return doc.getElementById('Item_Response_EBSR_' + item.position + '_Part' + this._interactionKey +
            '_' + this.key);
    };

    // get sound anchor tag element
    var getSoundLink = function () {
        var item = this._options.getItem();
        var doc = item.getPage().getDoc();

        var soundDIV = doc.getElementById('Item_OptionSound_Response_EBSR_' + item.position +
            '_Part' + this._interactionKey + '_' + this.key);
        if (soundDIV == null) return null;

        var soundLink = soundDIV.getElementsByTagName('a')[0];
        return soundLink;
    };

    /**********************/
    /*EBSR MC OPTION      */
    /**********************/

    // Single EBSR MC option
    EBSR.MCOption = function (options, key, interactionKey) {
        EBSR.MCOption.superclass.constructor.call(this, options, key);
        this._interactionKey = interactionKey;
    };

    YAHOO.lang.extend(EBSR.MCOption, ContentMCOption);

    EBSR.MCOption.prototype.getElement = getElement;
    EBSR.MCOption.prototype.getInputElement = getInputElement;
    EBSR.MCOption.prototype.getSoundLink = getSoundLink;

    /**********************/
    /* EBSR MS OPTION     */
    /**********************/

    EBSR.MSOption = function (options, key, interactionKey) {
        EBSR.MSOption.superclass.constructor.call(this, options, key, interactionKey);
        this._interactionKey = interactionKey;
    };

    YAHOO.lang.extend(EBSR.MSOption, ContentMSOption);

    EBSR.MSOption.prototype.getElement = getElement;
    EBSR.MSOption.prototype.getInputElement = getInputElement;
    EBSR.MSOption.prototype.getSoundLink = getSoundLink;

})();