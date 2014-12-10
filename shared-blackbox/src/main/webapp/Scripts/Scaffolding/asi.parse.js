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
        this.asiContent = this.processNodes(stem, answers);
        
        // THis is a unique item type.  We assume for now that there is only one
        // correct answser that completes the question, and n-1 possible wrong answers.
        // Ideally this would be passed in the item format but for now ITS doesn't have a place
        // for it.
        this.minSelection = 1; 
        this.maxAttempts = (this.asiContent.choices.length) - 1;
        
        // Wipe out the entire div, because the renderer is going to re-render it
        // in the div.  This is pretty inefficient and eventually we should get rid of
        // it.
        answers.innerHTML = '';
    };
};

// Process the HTML. and render into the special format for alt-scaffolding.
AsiItem.Parse.prototype.processNodes = function (aStem, aAnswers) {

    aStem.audioCue = this.processSoundLinks(this.stem);
    var choiceAr = [];
    var feedbackAr = [];
    var choiceElems = aAnswers.getElementsByTagName('div');

    // server-side control puts some data attributes in the html to indicate
    // where the content and feedback elements are.  We go through and  
    // process the feedback elements first.
    for (var j = 0; j < choiceElems.length; ++j) {
        var choice = choiceElems[j];
        var id = YUD.getAttribute(choice, 'data-asi-identifier');
        if (id && id.length > 0) {
            var feedback = this.readFeedbackContent(choice, j);
            if (feedback) {
                feedbackAr[feedback.identifier] = feedback;
            }
        }
    }
    
    // Parse the item DOM a second time to get the information we need from the 
    // content.
    for (j = 0; j < choiceElems.length; ++j) {
        choice = choiceElems[j];
        id = YUD.getAttribute(choice, 'data-asi-identifier');
        if (id && id.length > 0)
        {
            var choiceContent = {
                identifier: id,
                complete: choice.getAttribute('data-asi-complete'),
                audioCue: this.processSoundLinks(choice),
                content: {
                    htmlContent: this.readChoiceContent(choice, j),
                    feedback: feedbackAr[id]
                }
            };
            
            // Ignore responses with no audio for this item type.
            if (choiceContent.audioCue != null)
                choiceAr.push(choiceContent);
        }
    }
    return {
        stem: this.stem,
        choices: choiceAr
    };
};


// Sound links are handled specially in this item.  We dont' just autoplay.  
// Remove the audio anchors, but preserve the address.  
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

// Parse the choice, similar to a multiple choice question.
AsiItem.Parse.prototype.readChoiceContent = function (choice, index) {
    // Read the content of a choice

    var choiceChildNodes = choice.childNodes;
    var htmlContent;
    var htmlContentString = '';

    for (var k = 0; k < choiceChildNodes.length; ++k) {
        if (choiceChildNodes[k].nodeType == 1) {
            var childNode = choiceChildNodes[k];
            var feedbackId = YUD.getAttribute(childNode, 'data-feedback-identifier');
            if (feedbackId && feedbackId.length > 0) {
                continue;
            }
            else {
                htmlContentString = htmlContentString + Util.Xml.serializeToString(choiceChildNodes[k]);
                //htmlContent = choiceChildNodes[k];
            }
        }
    }
    htmlContent = document.createElement('div');

    // Response span looks like this:
    // asi-4-response-0 where the last number is the index of the response
    // Renderer and interaction logic looks for this span by this name.        
    AsiItem.Html.setSpanId(htmlContent,this.mid, index);
        
    htmlContent.innerHTML = htmlContentString;
    return htmlContent;
};

// Feedback elements are contained within the content elements.  Parse those first
// and remove the audio, and store the identifier.
AsiItem.Parse.prototype.readFeedbackContent = function (choice, index) {
    var choiceChildNodes = choice.childNodes;
    var feedback = null;

    for (var k = 0; k < choiceChildNodes.length; ++k) {
        if (choiceChildNodes[k].nodeType == 1) {
            var childNode = choiceChildNodes[k];
            var feedbackId = YUD.getAttribute(childNode, 'data-feedback-identifier');
            if (feedbackId && feedbackId.length > 0) {
                feedback = this.getFeedback(childNode, feedbackId);
            }
        }
    }
    return feedback;
};

// We've found a feedback element.  Process it.
AsiItem.Parse.prototype.getFeedback = function (feedbackElement, identifier) {
    // fetch feedback
    var feedbackContainer = document.createElement('div');

    feedbackContainer.appendChild(feedbackElement);

    var feedback = {
        identifier: identifier,
        audioCue: this.processSoundLinks(feedbackElement),
        feedbackContainer: feedbackContainer
    };
    return feedback;
};

