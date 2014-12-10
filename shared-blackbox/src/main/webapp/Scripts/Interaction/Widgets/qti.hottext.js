/*
Widget for matching QTI hottext interactions.
*/
(function (CM) {

    var QTI = CM.QTI;
    var match = QTI.createWidgetMatch('hottextInteraction');

    function Widget_HT(page, item, config) {
        this.dataType = CM.DataType.Array;
        this.options = {
            autoLoad: true
        }
        this.interaction = null;
    }

    CM.registerWidget('qti.hottext', Widget_HT, match);

    Widget_HT.prototype.load = function() {
        
        var containerEl = this.element; // dom element
        var interactionNode = this.config; // qti element
        var interactionDoc = interactionNode.ownerDocument;
        var interactionId = this.id;

        // replace all the <hottext> nodes with <span>'s
        QTI.replaceNodes(interactionNode, 'hottext', function(htNode) {
            var span = interactionDoc.createElement('span');
            span.setAttribute('class', 'interaction selectable');
            span.setAttribute('data-its-group', interactionId);
            span.setAttribute('data-its-identifier', htNode.getAttribute('identifier'));
            return span;
        });

        // add html to dom element
        var interactionEl = QTI.createInteractionElement(interactionNode);

        // load select interaction
        this.interaction = new TDS.SelectInteraction('select-' + this.id);
        this.interaction.load(interactionEl);

        // add element to the dom
        containerEl.appendChild(interactionEl);
    }

    Widget_HT.prototype.getResponse = function () {
        var values = this.interaction.getResponseArray();
        var isValid = this.interaction.validateResponse();
        return this.createResponse(values, isValid);
    }

    Widget_HT.prototype.setResponse = function (values) {
        this.interaction.loadResponseIDs(values);
    }

})(window.ContentManager);