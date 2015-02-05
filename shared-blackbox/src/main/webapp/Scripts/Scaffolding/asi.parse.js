AsiItem = (typeof (AsiItem) == "undefined") ? {} : AsiItem;

// Parser.  Parse the asiItem xml text and create an object that
// we pass to the renderer.  
AsiItem.Parse = function (item) {

    var YUD = YAHOO.util.Dom;
    var YUE = YAHOO.util.Event;

    // Unique ID for container to apply the asi to
    this.mid = item.position;

    // Student app sends us a structure similar to MC item.
    // We remove and re-render the HTML.  THis is a little odd/inefficient but
    // we had already completed rendering and ITS changed the format.
    this.createAsiChoices = function () {

        var stem = item.getStemElement();

        // THe answer space is in this DIV, put there by server
        var answers = YUD.get('ScaffoldingContainer_' + this.mid);

        // all other in-line attribute of the asiInteraction
        this.identifier = 'ScaffoldingItemId_' + this.mid;
        
        // This is an interactive item where the stem is part of the item
        this.stem = stem;

        // Process the choices and associated feedback spans.
        this.asiContent = this.processNodes(this.mid, stem, answers);
        
        // THis is a unique item type.  We assume for now that there is only one
        // correct answser that completes the question, and n-1 possible wrong answers.
        // Ideally this would be passed in the item format but for now ITS doesn't have a place
        // for it.
        this.minSelection = 1; 
        this.maxAttempts = this.asiContent.choices.length - 1;
        
        // Wipe out the entire div, because the renderer is going to re-render it
        // in the div.  This is pretty inefficient and eventually we should get rid of
        // it.
        //answers.innerHTML = '';
    };
};

// Process the HTML and return an object that contains the stem and
//  various provided choices that the student can select.
AsiItem.Parse.prototype.processNodes = function (itemId, aStem, aAnswers) {

    // Get the stem's audio file
    aStem.audioCue = this.processSoundLinks(this.stem);

    // Process the HTML to gather feedback info
    var choiceAr = [];
    var choiceElems = aAnswers.childNodes; //getElementsByTagName('div');
    for (var j = 0; j < choiceElems.length; ++j) {
        var choiceNode = choiceElems[j];
        if (choiceNode.nodeType == Util.Dom.NodeType.ELEMENT) {
            var id = YUD.getAttribute(choiceNode, 'data-asi-identifier');
            // Process <div> elements with a 'data-asi-identifier' attribute
            if (id && id.length > 0) {
                var audioCue = this.processSoundLinks(choiceNode);

                // Ignore responses with no audio for this item type
                if (audioCue != null) {
                    var choiceContent = {
                        id: 'asi-' + itemId + '-response-' + id,
                        identifier: id,
                        complete: /true/i.test(choiceNode.getAttribute('data-asi-complete')),
                        audioCue: audioCue,
                        //    htmlContent: this.readChoiceContent(choiceNode, j),
                        feedback: this.readFeedbackContent(choiceElems, j)
                    };
                    choiceAr.push(choiceContent);
                }
            }
        }
    }
    
    return {
        stem: this.stem,
        choices: choiceAr
    };
};


// Sound links are handled specially in this item.  We don't just autoplay.  
// Find the first sound link in this parentSpan, remove the link's anchors and return the url
//  or return null if no sound link is found.
AsiItem.Parse.prototype.processSoundLinks = function (parentSpan) {
    var anchors = parentSpan.getElementsByTagName('a');
    for (var i = 0; i < anchors.length; ++i) {
        var anchor = anchors[i];
        var source = AsiItem.Audio.getPlayableSource(anchor);
        if (source != null) {
            anchor.parentNode.removeChild(anchor);
            return source.url;
        }
    }

    return null;
};

// Parse the choice (similar to a multiple choice question) and return it as an HTML document fragment
AsiItem.Parse.prototype.readChoiceContent = function (choiceNode, index) {

    // Read the content of a choice

    var htmlContent;
    var htmlContentString = '';

    // Build a string with the HTML from all childNodes that do NOT have a 'data-feedback-identifier' attribute
    /*
    var choiceChildNodes = choiceNode.childNodes;
    for (var k = 0; k < choiceChildNodes.length; ++k) {
        if (choiceChildNodes[k].nodeType == Util.Dom.NodeType.ELEMENT) {
            var childNode = choiceChildNodes[k];
            var feedbackId = YUD.getAttribute(childNode, 'data-feedback-identifier');
            if (!(feedbackId && feedbackId.length > 0)) { // Skip data-feedback-identifier nodes
                htmlContentString = htmlContentString + Util.Xml.serializeToString(childNode);
            }
        }
    }
    */
    // The 'choice content' is the node's child's child's child's child
    var choiceChildNodes = choiceNode.getElementById('');
    for (var k = 0; k < choiceChildNodes.length; ++k) {
        var childNode = choiceChildNodes[k];
        if (choiceNode.nodeType == Util.Dom.NodeType.ELEMENT) {
            htmlContentString = htmlContentString + Util.Xml.serializeToString(childNode);
        }
    }

    // Response span looks like this:
    // <div id='asi-4-response-0' /> where the last number is the index of the response
    // Renderer and interaction logic looks for this span by this name.        
    htmlContent = document.createElement('div');
    AsiItem.Html.setSpanId(htmlContent, this.mid, index);

    htmlContent.innerHTML = htmlContentString;

    return htmlContent;
};

// Find the 'data-feedback-identifier' node and return an object with its info
AsiItem.Parse.prototype.readFeedbackContent = function (nodes, index) {

    for (var k = index; k < nodes.length; ++k) {
        if (nodes[k].nodeType == Util.Dom.NodeType.ELEMENT) {
            var childNode = nodes[k];
            var feedbackId = YUD.getAttribute(childNode, 'data-feedback-identifier');
            if (feedbackId && feedbackId.length > 0) { // Only include 'data-feedback'identifier' nodes
                //var feedbackContainer = document.createElement('div');
                //feedbackContainer.appendChild(childNode);
                var feedback = {
                    identifier: feedbackId,
                    audioCue: this.processSoundLinks(childNode)
                    //feedbackContainer: feedbackContainer
                };
                return feedback;
            }
        }
    }

    return null;
};
