/*
Sortable lists interaction block.
*/

(function(TDS) {

    // order group
    function OG(parentInteraction, responseIdentifier, element) {
        this._parentInteraction = parentInteraction;
        this._lookup = {};
        this._list = [];
        OG.superclass.constructor.call(this, responseIdentifier, element);
    }

    YAHOO.extend(OG, TDS.Choice);

    OG.prototype.getParentInteraction = function() {
        return this._parentInteraction;
    };

    // bug 132516: if we are on multi-touch display user can initiate multiple 
    // drag events.  Prevent it.  We can't use built-in lock b/c this prevents
    // drag-over events from being received.
    OG.prototype.toggleLockDrag = function (identifier, lock) {
        for (var i = 0; i < this._list.length; ++i) {
            var choice = this._list[i];
            if (choice._identifier != identifier) {
                choice._preventDrag = lock;
            }
        }
    };

    OG.prototype.createChoice = function(id, el) {
        var choice = new TDS.OrderChoice(this, id, el);
        this._lookup[id] = choice;
        this._list.push(choice);
        return choice;
    };

    // get all the choices (optionally sort them by dom order)
    OG.prototype.getChoices = function(sort) {
        var choices = this._list.concat();
        if (sort) {
            Util.Array.sort(choices, TDS.Interaction.compareOrder);
        }
        return choices;
    };
    OG.prototype.getIdentifiers = function(sort) {
        var choices = this.getChoices(sort);
        return choices.map(function(choice) {
            return choice.getIdentifier();
        });
    };

    // get choice by response identifier
    OG.prototype.getChoice = function(id) {
        return this._lookup[id];
    };

    OG.prototype.removeChoice = function(id) {
        var choice = this.getChoice(id);
        if (choice) {
            delete this._lookup[id];
            Util.Array.remove(this._list, choice);
        }
    };

    OG.prototype._syncDom = function() {
        var choices = this.getChoices();
        var elements = choices.map(function(choice) {
            return choice.getElement();
        });
        var groupEl = this.getElement();
        $(groupEl).append(elements);
    };

    OG.prototype.sort = function(identifiers) {
        Util.Array.sort(this._list, function(recA, recB) {
            var idxA = identifiers.indexOf(recA.getIdentifier());
            var idxB = identifiers.indexOf(recB.getIdentifier());
            return idxA > idxB ? 1 : idxA < idxB ? -1 : 0;
        });
        this._syncDom();
    };

    OG.prototype.dispose = function() {

        this._parentInteraction = null;

        this.getChoices().forEach(function(choice) {
            choice.dispose();
        });

        // this._choices.clear();
        // this._elements.clear();
    };

    TDS.OrderGroup = OG;

})(TDS);