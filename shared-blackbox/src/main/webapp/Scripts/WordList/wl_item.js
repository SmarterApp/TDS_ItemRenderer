/////////////// Word List Item Object
// A WordListItem handles the mechanics of tagging and navigating an item's word 
// list content.  Public methods allow for tagging of items for word list content and 
// also keyboard shortcuts.  Also the browser event handlers are in here.

//////////////// globals (class static)  /////////////////////////

// These are the tag types where we expect to find word lists.
WordListItem.tagType = ["div", "span"];

// This is the word list attribute in item HTML (HTML5 standard)
WordListItem.attributeName = "data-word-index";

// If multiple spans cover the same word/phrase, use this to correlate them
WordListItem.groupAttributeName = "data-wl-group";

// Classes used for custom mouse/hover behavior
WordListItem.ClassNameString = "TDS_WORD_LIST";
WordListItem.ClassNameStringHover = "TDS_WORD_LIST_HOVER";

WordListItem.CTag = 0; // CTAG for unique span ID
WordListItem.GTag = 0; // CTAG for grouped spans

////////// Constructor and internal logic. This object will be attached to an item.
function WordListItem () {
    // ctor
    
    //////////// Private data
    // spans that contain word list items.
    var myPageSpans = [];
    // tabbing information on the spans.
    var myPageZOrders = {
        current: -1,
        total: 0
    };

    var spanCount = 0;

    this.getSpanCount = function() { return spanCount;};

    //////////// Public Methods

    // We have fetched word list data for this span and this student, and 
    // there is some data for it so we will tag the span to be interactive and
    // pop up the word list when the student clicks on it.
    //
    // We now also (for WCAG) convert the <span> to an <a> (anchor) tag
    this.TagSingleSpan = function (span) {

        // Create new anchor with same inner HTML as the span
        var anchor = document.createElement('a');
        $(anchor).html($(span).html());

        // Copy attributes
        $.each(span.attributes, function(i, attrib) {
            $(anchor).attr(attrib.name, attrib.value);
        });

        // Add the attributes to the span and add click/hover events
        $(anchor).addClass(WordListItem.ClassNameString);
        var spanid = 'word-list-' + WordListItem.CTag;
        WordListItem.CTag++;
        $(anchor).attr('id', spanid);
        $(anchor).attr('tabindex', '0');
        $(anchor).attr('aria-label', 'lookup word');
        $(anchor).attr('role', 'button');

        YAHOO.util.Event.addListener(anchor, 'mouseenter', WordListItem.mouseOver, this);
        YAHOO.util.Event.addListener(anchor, 'mouseleave', WordListItem.mouseOut, this);
        YAHOO.util.Event.addListener(anchor, 'click', WordListItem.clickHandler, this);

        var accProps = Accommodations.Manager.getCurrentProps();
        if (accProps.isStreamlinedMode()) {
            YAHOO.util.Event.addListener(anchor, 'keyup', WordListItem.clickHandler, this);
        }

        // Replace the span with our newly created button in the DOM
        $(span).after(anchor);
        $(span).remove();
        
        // Update the tabbing array
        myPageSpans[spanCount] = anchor;
        ++spanCount;
        myPageZOrders.total = spanCount;
    };
    
    // The tagging format used by ITS is not the one that we want in the DOM, due to issues like
    // overlapping tags between TTS and word list.  So we resolve those tags here. Furthermore,
    // we queue spans so that if word list information resides on the server they can become 
    // clickable spans when the XHR calls come back.
    this.TagSpans = (function (elements) {
        //var elements = item.getElement();

        var spans = [];
        var tmpSpanCount = 0;

        // Before we can tag the spans for real, we need to retag the HTML
        // and resolve any cases of WL spans overlapping with other spans (like TTS).
        // This may cause some of the existing spans to become multiple spans.
        for (var i = 0; i < WordListItem.tagType.length; ++i) {
            var divs = elements.getElementsByTagName(WordListItem.tagType[i]);
            for (var j = 0; divs != null && j < divs.length; ++j) {
                // See if the span has the word list attribute.
                var div = divs[j];
                if (YUD.getAttribute(div, WordListItem.attributeName) != null) {
                    spans[tmpSpanCount] = div;
                    ++tmpSpanCount;
                }
            }
            for (j = 0; j < spans.length; ++j) {
                spans[j].setAttribute(WordListItem.groupAttributeName, "" + WordListItem.GTag);
                var fff = new Retagger(spans[j]);
                fff.Retag();
                WordListItem.GTag++;
            }
        }

        var itemKey = this.wl_res.itemKey;
        var baseKey = this.wl_res.bankKey + '-' + this.wl_res.itemKey + '-';
        WordListPanel.requestQ[itemKey] = {};
        if (!WordListPanel.tagQ[itemKey]) { // Init empty array
            WordListPanel.tagQ[itemKey] = [];
        }

        // for every span or div in the new item...
        var self = this;
        WordListItem.tagType.forEach(function(tagType) {
            divs = elements.getElementsByTagName(tagType);
            if (divs != null) {
                $.each(divs, function(i, div) {
                    var index = YUD.getAttribute(div, WordListItem.attributeName);
                    if (index != null) {
                        var key = baseKey + index.toString();

                        // Need to tag the span
                        WordListPanel.tagQ[itemKey].push({ wl_item: self, span: div, key: key });

                        // May need to lookup the word
                        if ((WordListPanel.requestQ[itemKey][key] == null) &&
                        (WordListPanel.contentWordCache[key] == null)) {
                            WordListPanel.requestQ[itemKey][key] = index;
                        }
                    }
                });
            }            
        });

        // If this is the first word list item, start the XHR process off.
        WordListPanel.sendRequest(this);
    });

    // Some key events allow for shortcuts so handle them. For now we use:
    // Ctrl-X to tab between word list spans when not in streamlined mode.
    // Last selected span is displayed as if it were clicked.  The tabbing
    // is done in whichever item has the focus.  esc dismisses the word
    // list panel. Ctrl-X also tabs between tabs in the panel itself.
    //
    // returns true if the key event was handled here.
    this.HandleKey = function (evt) {
        var isHandled = false;
        
        // key has been released - is a word list term selected
        if ((evt.type == 'keyup') && !evt.ctrlKey) {
            if (myPageZOrders != null) {
                zo = myPageZOrders;
                spans = myPageSpans;
                if (zo.current >= 0) {
                    var div = spans[zo.current];
                    var entry = { wl_item: this, span: div };

                    WordListPanel.processClick(entry, this.getGroupHtml(div));
                    this.AddClassToGroup(div, WordListItem.ClassNameString, WordListItem.ClassNameStringHover); 
                    // Don't reset the zo on each click, take up where we left off
                    // because some of these items have quite a few.
                    // zo.current = -1;
                    isHandled = true;
                }            
            }
        }

        if (evt.keyCode == 27) // esc, dismiss
        {
            if (WordListPanel.panel != null) {
                WordListPanel.panel.hide();
            }
            return isHandled;
        }
        
        if (evt.type != 'keydown') {
            return isHandled;
        }

        if (!evt.ctrlKey) { // Everything else we look at must be a Ctrl-key combo for a keydown event
            return isHandled;
        }

        if (evt.keyCode != 88) { // Ctrl-x
            return isHandled;
        }

        // Indicate that this even was for us, so we stop propagation.
        isHandled = true;
        
        // If word list is displayed, use tab shortcutto tab between
        // tabs in the word list.
        if ((WordListPanel.panel != null) && WordListPanel.IsVisible() &&
        (WordListPanel.tabView != null) && (WordListPanel.tabCount > 0)) {
            WordListPanel.tabCurrent = (WordListPanel.tabCurrent + 1) % WordListPanel.tabCount;
            WordListPanel.tabView.selectTab(WordListPanel.tabCurrent);
            return isHandled;
        }

        // ctrl-x, tab to the next word list span.  If the last one on the 
        // page, select none
        var spanGroupAttr = "";
        if (myPageZOrders != null) {
            var zo = myPageZOrders;
            var spans = myPageSpans;
            if (zo.current >= 0) {
                spanGroupAttr = YUD.getAttribute(spans[zo.current], WordListItem.groupAttributeName);
                this.AddClassToGroup(spans[zo.current], WordListItem.ClassNameString, WordListItem.ClassNameStringHover);
            }
            ++zo.current;
            // There might be multiple spans for the same word list, so advance the 
            // counter twice if we need to.
            while ((zo.current < zo.total) && (YUD.getAttribute(spans[zo.current], WordListItem.groupAttributeName) == spanGroupAttr)) {
                ++zo.current;
            }
            if (zo.current == zo.total) {
                zo.current = -1;
                return isHandled;
            }
            this.AddClassToGroup(spans[zo.current], WordListItem.ClassNameStringHover, WordListItem.ClassNameString); 
            ContentManager.log("wordlist: focus span " + zo.current + " out of " + zo.total + " evt is " + evt.type);
        }

        return isHandled;
    };
    
    // For a span group, change the CSS based on whether it's selected, etc.
    this.AddClassToGroup = function(div, classToAdd, classToRemove) {
        var groupTag = YAHOO.util.Dom.getAttribute(div,WordListItem.groupAttributeName);
        for (var j = 0; j < myPageSpans.length; ++j) {
            if (YAHOO.util.Dom.getAttribute(myPageSpans[j], WordListItem.groupAttributeName) == groupTag) {
                YAHOO.util.Dom.removeClass(myPageSpans[j], classToRemove);
                YAHOO.util.Dom.addClass(myPageSpans[j], classToAdd);
            }
        }
    };
    
    // For a span group, the actual text of the span is the superset of the inner HTML.
    // Collect the spans and construct that here.
    this.getGroupHtml = function(div) {
        var groupTag = YAHOO.util.Dom.getAttribute(div, WordListItem.groupAttributeName);
        var rv = "";
        for (var j = 0; j < myPageSpans.length; ++j) {
            if (YAHOO.util.Dom.getAttribute(myPageSpans[j], WordListItem.groupAttributeName) == groupTag) {
                rv = rv + myPageSpans[j].innerHTML;
            }
        }
        // return rv.replace(/\W/g, '');
        // fb-90639 - Replacing "non-word" characters removed spaces from phrases
        //            If rv is a DOM element and "non-word" characters are removed,
        //            YUI.Panel.setheader() can't correctly parse it
        return rv;
    };
};

///////////////// Event Handlers  ////////////////

// Change class of span and other spans in group to hover
WordListItem.mouseOver = (function (event, wl) {
    var div = this;
    wl.AddClassToGroup(div, WordListItem.ClassNameStringHover, WordListItem.ClassNameString);
});

// Change class of span and other spans in gropu to normal
WordListItem.mouseOut = (function (event, wl) {
    var div = this;
    wl.AddClassToGroup(div, WordListItem.ClassNameString, WordListItem.ClassNameStringHover);
});

// Use has clicked on one of the word list activated spans (where a click is either a mouse click
// or a press of the enter key/space bar when the word list item is focused in streamlined mode).
// When not in streamlined mode keyboard input is handled in the HandleKey function above.
// Get required information from the span/item and send it to the panel click handler.
WordListItem.clickHandler = (function (event, wl) {
    if (event.type == 'click' || (event.type == 'keyup' && (event.keyCode == 13 || event.keyCode == 32))) {
        var div = this;
        var entry = { wl_item: wl, span: div };
        var headerText = wl.getGroupHtml(div);
        WordListPanel.processClick(entry, headerText);
    }
});
