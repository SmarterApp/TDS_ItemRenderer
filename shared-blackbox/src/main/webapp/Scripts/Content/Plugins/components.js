/*
Add general entity components (e.x., stem)
*/

(function (CM) {

    function match(page, entity, content) {
        return true;
    }

    function Plugin_Comp(page, entity, config) {
    }

    CM.registerEntityPlugin('components', Plugin_Comp, match);

    Plugin_Comp.prototype.findPassageComponents = function(passage) {
        var passageEl = passage.getElement();
        if (passageEl != null) {
            passage.addComponent(passageEl);
        }
    }

    Plugin_Comp.prototype.findItemComponents = function (item) {
        var itemEl = item.getElement();
        item.addComponent(itemEl);
    }

    Plugin_Comp.prototype.load = function () {

        var entity = this.entity;

        if (entity instanceof ContentItem) {
            this.findItemComponents(entity);
        } else if (entity instanceof ContentPassage) {
            this.findPassageComponents(entity);
        }

        // when component has focus add class
        entity.on('focusComponent', function(component) {
            if (ContentManager.isElement(component)) {
                YUD.addClass(component, 'contextAreaFocus');
            }
        });

        // when component loses focus remove class
        entity.on('blurComponent', function (component) {
            if (ContentManager.isElement(component)) {
                YUD.removeClass(component, 'contextAreaFocus');
            }
            ContentManager.enableCaretMode(false);
        });

    }

})(ContentManager);
