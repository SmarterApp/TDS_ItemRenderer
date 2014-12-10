/*
This file is used for any general QTI utilities or parsers.
*/

(function (CM) {

    var QTI = {};

    var validHtmlTags = [

        // Section 6.2.1. Text Elements
        'abbr', 'acronym', 'address', 'blockquote', 'br', 'cite', 'code', 'dfn', 'div', 'em',
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'kbd', 'p', 'pre', 'q', 'samp', 'span', 'strong', 'var',

        // Section 6.2.2. List Elements
        'dl', 'dlElement', 'dt', 'dd', 'ol', 'ul', 'li',

        // Section 6.2.3. Object Elements
        //'object', 'param',

        // Section 6.2.4. Presentation Elements
        'b', 'big', 'hr', 'i', 'small', 'sub', 'sup', 'tt',

        // Section 6.2.5. Table Elements
        'caption', 'col', 'colgroup', 'table', 'tableCell', ' tableCellScope', 'tbody', 'td', 'tfoot',
        'th', 'thead', 'tr',

        // Section 6.2.6. Image Element
        'img',

        // Section 6.2.7. Hypertext Element
        'a'
    ];

    function adopt(oldParent, newParent) {
        if (oldParent && newParent) {
            var orphans = YUD.getChildren(oldParent);
            if (orphans && orphans.length) {
                var orphanCount = orphans.length;
                for (var j = 0; j < orphanCount; j++) {
                    var orphan = orphans[j];
                    newParent.appendChild(oldParent.removeChild(orphan));
                }
            }
        }
    };

    function pruneNonHtml(doc) {

        // List that will contain all nodes from XML
        var allNodes = [];

        // Recursively traverse entire XML tree, building list of all nodes in allNodes[]
        var traverseTreeRecursive = function (parentNode) {
            if (parentNode) {
                allNodes.push(parentNode);
                var children = YUD.getChildren(parentNode);
                if (children) {
                    for (var i = 0; i < children.length; i++) {
                        traverseTreeRecursive(children[i]);
                    }
                }
            }
        };

        var itemNode = doc.documentElement;
        traverseTreeRecursive(itemNode);
        var nodeCount = allNodes.length;

        // Run through list of all nodes, deleting nodes that are not valid HTML
        // before deleting a node, promote any valid children to its parent
        for (var i = 0; i < nodeCount; i++) {
            var currentNode = allNodes.pop();
            if ((validHtmlTags.indexOf(currentNode.nodeName) < 0) &&
                (currentNode.parentNode != doc)) {
                var grandParentNode = currentNode.parentNode;
                adopt(currentNode, grandParentNode);
                grandParentNode.removeChild(currentNode);
            };
        }
    };

    // takes item qti and loads what it can into the stem element
    function loadStem(item) {

        // get stem container
        var stemEl = item.getStemElement();

        // get XML and convert <prompt> tags to <p>
        var xmlString = item.qti.xml;
        xmlString = xmlString.replace(/<prompt/g, '<p');
        xmlString = xmlString.replace(/<\/prompt/g, '<\/p');

        // Load XML and prune all non-valid HTML
        var xmlDoc = Util.Xml.parseFromString(xmlString);
        pruneNonHtml(xmlDoc);

        // Place HTML in stem container
        adopt(xmlDoc.documentElement, stemEl);
    };

    // expose public functions
    QTI.validHtmlTags = validHtmlTags;
    QTI.loadStem = loadStem;

    /*
    function mapInteractionsToWidgetConfigs (item, type) {
        var qtiDoc = Util.Xml.parseFromString(item.qti.xml);
        return $(type, qtiDoc).map(function (idx, node) {
            var stemEl = item.getStemElement();
            var id = node.getAttribute('responseIdentifier');
            var selector = '*[data-qti-identifier=' + id + ']';
            var el = $(selector, stemEl).get(0);
            return new CM.WidgetConfig(id, el, node);
        }).get();
    }
    */

    function mapInteractionsToWidgetConfigs(item, type, custom) {
        var stemEl = item.getStemElement();
        var selector = '*[data-qti-type=' + type + ']';
        if (custom) {
            selector += '[data-qti-custom=' + custom + ']';
        }
        return $(selector, stemEl).map(function(idx, interactionEl) {
            var scriptEl = $(interactionEl).children().get(0);
            var interactionId = interactionEl.getAttribute('data-qti-identifier');
            var interactionXml = scriptEl.innerHTML;
            var interactionDoc = Util.Xml.parseFromString(interactionXml);
            var interactionNode = interactionDoc.documentElement;
            return new CM.WidgetConfig(interactionId, interactionEl, interactionNode);
        }).get();
    }

    QTI.createWidgetMatch = function (type, custom) {
        return function(page, item, content) {
            if (item.isResponseType('QTI')) {
                return mapInteractionsToWidgetConfigs(item, type, custom);
            }
            return false;
        }
    }
    
    // Move all the content child nodes from one node to another
    QTI.moveContents = function(fromNode, toNode) {
        $(fromNode).contents().each(function (idx, childNode) {
            $(toNode).append(childNode);
        });
    }

    /*
    Replace all the nodes matching the selector with new nodes. 
    This also copies all the child nodes into the new nodes. 
    If removeNode is true then it will be removed from the document
    once the newNode is created. You would use this in combination
    with the returned results.
    Returns all the new nodes that were created.
    */
    QTI.replaceNodes = function (parentNode, selector, replacer) {
        return $(selector, parentNode).map(function (idx, currentNode) {
            // create new node
            var newNode = replacer(currentNode);
            // copy children over to the new node
            QTI.moveContents(currentNode, newNode);
            // check if we should remove old node
            $(currentNode).replaceWith(newNode);
            return newNode;
        }).get();
    }

    // Replace the <prompt> with a <div>
    QTI.replacePrompt = function (parentNode) {
        var doc = parentNode.ownerDocument;
        var prompts = QTI.replaceNodes(parentNode, 'prompt', function(promptNode) {
            var promptEl = doc.createElement('div');
            promptEl.setAttribute('class', 'interactionPrompt');
            return promptEl;
        });
        if (prompts.length > 0) {
            return prompts[0];
        } else {
            return null;
        }
    }

    // Take an interaction node and create an html container. 
    QTI.createInteractionElement = function (interactionNode, nodeName) {
        var interactionEl = document.createElement(nodeName || 'div');
        interactionEl.innerHTML = Util.Xml.innerHTML(interactionNode);
        return interactionEl;
    }

    CM.QTI = QTI;

})(window.ContentManager);


