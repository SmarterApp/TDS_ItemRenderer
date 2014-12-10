/*
Used to create the container for passage controls
*/

(function (CM) {

    // check for passage and element
    function match(page, entity, content) {
        if (entity instanceof ContentPassage) {
            var passageEl = entity.getElement();
            if (passageEl) {
                // check if div is already in the layout
                if (entity.getToolsElement()) {
                    return false;
                }
                // check for padding div
                var paddingEl = Util.Dom.getElementByClassName('padding', 'div', passageEl);
                if (paddingEl) {
                    return paddingEl;
                }
            }
        }
        return false;
    }

    function Plugin_PTools(page, entity, el) {
        this.el = el;
    }

    CM.registerEntityPlugin('passage.tools', Plugin_PTools, match);

    Plugin_PTools.prototype.load = function () {

        var passage = this.entity;
        var passageEl = passage.getElement();
        var controlsEl = document.createElement('div');
        controlsEl.className = 'passageTools';
        // $(passageEl).before(controlsEl); (append
        $(passageEl).prepend(controlsEl);

        /*
        var paddingEl = this.el;
        var paddingChildEl = YUD.getFirstChild(paddingEl);
        if (paddingChildEl) {
            YUD.insertBefore(controlsEl, paddingChildEl);
        } else {
            paddingEl.appendChild(controlsEl);
        }
        */
    }

})(window.ContentManager);