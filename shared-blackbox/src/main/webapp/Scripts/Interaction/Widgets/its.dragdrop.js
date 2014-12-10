/*
Widget for matching ITS selectables.
*/
(function (CM) {

    function match(page, item) {

        // check if hottext item
        if (!item.isResponseType('Hottext')) return false;

        // look for draggables
        var stemEl = item.getStemElement();
        var $draggables = $('span.interaction.draggable', stemEl);

        if ($draggables.length > 0) {
            var id = 'dd-' + item.getID();
            return new CM.WidgetConfig(id, stemEl);
        }

        return false;
    }

    function Widget_DD(page, item, config) {
        this.dataType = CM.DataType.Xml;
        this.options = {
            autoLoad: true
        }
        this.interaction = null;
    }

    CM.registerWidget('dragdrop', Widget_DD, match);

    Widget_DD.prototype.load = function () {

        var page = this.page;
        var stemEl = this.element; // stem element
        
        var dd = new TDS.DDInteraction(this.id);
        this.interaction = dd;
        dd.load(stemEl);

        // get draggables
        var draggables = dd.getDraggables();
        if (draggables.length > 0) {

            // tell each DD proxy what the scroll container is
            var pageElement = page.getElement();
            var scrollContainer = Util.Dom.getElementByClassName('theQuestions', 'div', pageElement);
            if (scrollContainer) {
                for (var i = 0; i < draggables.length; i++) {
                    var ddProxy = draggables[i].getProxy();
                    ddProxy.setScrollDirection(true, true);
                    ddProxy.setParentScroll(scrollContainer);
                }
            }
        }

    }

    // get <interaction> doc
    Widget_DD.prototype.getResponse = function () {
        var data = this.interaction.getResponseXml();
        var isValid = this.interaction.validateResponse();
        return this.createResponse(data, isValid);
    }

    // set <interaction> node
    Widget_DD.prototype.setResponse = function (data) {
        this.interaction.loadResponseXml(data);
    }

})(window.ContentManager);