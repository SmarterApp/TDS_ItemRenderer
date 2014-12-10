/*
This is the xml container for <interactions>.
*/

(function (CM) {

    function Container() {

    }

    CM.registerResponseContainer('Interactions', Container);

    // this creates the response container
    Container.prototype.create = function (responses) {

        // create the <itemResponse> xml
        var xmlDoc = Util.Xml.parseFromString('<interactions></interactions>');
        var rootNode = xmlDoc.documentElement;

        // iterate over the widget responses
        responses.forEach(function (response) {
            var interactionDoc = response.value;
            var interactionNode = interactionDoc.documentElement;
            rootNode.appendChild(interactionNode);
        });

        return Util.Xml.serializeToString(xmlDoc);
    }

    // this loads an existing response container
    Container.prototype.load = function (value, widgets) {

        // parse the <interactions> xml
        var xmlDoc = Util.Xml.parseFromString(value);
        var rootNode = xmlDoc.documentElement;

        // look through all the <interaction> nodes
        $('interaction', rootNode).each(function (idx, node) {
            var id = node.getAttribute('identifier');
            var widget = Util.Array.find(widgets, function (widget) {
                return widget.id == id;
            });
            if (widget) {
                widget.setResponse(node);
            }
        });

    }

    CM.mapResponseContainer('HT', 'Interactions');
    CM.mapResponseContainer('HTQ', 'QTI');

})(window.ContentManager);