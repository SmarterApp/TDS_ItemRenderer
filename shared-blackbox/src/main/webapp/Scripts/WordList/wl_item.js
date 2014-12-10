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
    this.TagSingleSpan = function (span) {
        
        // Add the tag to the span and add click/hover events.
        YUD.addClass(span, WordListItem.ClassNameString);
        var spanid = 'word-list-' + WordListItem.CTag;
        WordListItem.CTag++;
        YUD.setAttribute(span, 'id', spanid);

        // WordList.hoverClear = div.style.backgroundColor;
        YAHOO.util.Event.addListener(span, 'mouseenter', WordListItem.mouseOver, this);
        YAHOO.util.Event.addListener(span, 'mouseleave', WordListItem.mouseOut, this);
        YAHOO.util.Event.addListener(span, 'click', WordListItem.clickHandler, this);
        
        // Update the tabbing array
        myPageSpans[spanCount] = span;
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
        var dupSpans = [];
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
        WordListPanel.requestQ[itemKey] = [];
        // for every span or div in the new item...
        for (var i = 0; i < WordListItem.tagType.length; ++i) {
            divs = elements.getElementsByTagName(WordListItem.tagType[i]);
            for (var j = 0; divs != null && j < divs.length; ++j) {
                
                // See if the span has the word list attribute.
                div = divs[j];
                var index = YUD.getAttribute(div, WordListItem.attributeName);
                if (index != null) {
                    var key = baseKey + index.toString();
                    WordListPanel.requestQ[itemKey].push({ wl_item: this, span: div, key: key });
                    
                    if (!dupSpans[parseInt(index)]) {
                        var indexString = WordListPanel.indexHdr + "=" + index.toString();
                        if (WordListPanel.indices == "") WordListPanel.indices = indexString;
                        else WordListPanel.indices = WordListPanel.indices + '&' + indexString;
                        dupSpans[parseInt(index)] = true;
                    }
                }
            }
        }

        // If this is the first word list item, start the XHR process off.
        WordListPanel.sendRequest(this);
        WordListPanel.indices = '';
    });

    // Some key events allow the shortcuts, handle them. For now we use:
    // ctrl-x to tab between word list spans.  Last selected span is 
    // displayed as if it were clicked.  The tabbing is done in whichever
    // item has the focus.  esc dismisses the word list panel.  ctrl-x also
    // tabs between tabs in the panel itself.
    //
    // returns true if the key event was handled here.
    this.HandleKey = function (evt) {
        var isHandled = false;
        
        // key has been released - is a word list term selected
        if ((evt.type == 'keyup') && (!evt.ctrlKey)) {
            if (myPageZOrders != null) {
                zo = myPageZOrders;
                spans = myPageSpans;
                if (zo.current >= 0) {
                    var div = spans[zo.current];
                    var entry = { wl_item: this, span: div };

                    WordListPanel.processClick(entry,
                        this.getGroupHtml(div));
                    this.AddClassToGroup(div,
                        WordListItem.ClassNameString, WordListItem.ClassNameStringHover); 
                    // Don't reset the zo on each click, take up where we left off
                    // because some of these items have quite a few.
                    // zo.current = -1;
                    isHandled = true;
                }            
            }
        }
    
        if (evt.keyCode == 27) // esc, dismiss
        {
            if (WordListPanel.panel != null)
                WordListPanel.panel.hide();
            return isHandled;
        }
        
        if (!(evt.type == 'keydown'))
            return isHandled;
    
        if (!evt.ctrlKey) return;

        if (evt.keyCode != 88) // Ctrl-x
            return isHandled;

        // Indicate that this even was for us, so we stop propagation.
        isHandled = true;
        
        // If word list is displayed, use tab shortcutto tab between
        // tabs in the word list.
        if ((WordListPanel.panel != null)  && 
             (WordListPanel.panel.cfg.getProperty('visible') == true) &&
             (WordListPanel.tabView != null) &&
             (WordListPanel.tabCount > 0)) {
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
                spanGroupAttr = YUD.getAttribute(spans[zo.current],WordListItem.groupAttributeName);
                this.AddClassToGroup(
                    spans[zo.current],WordListItem.ClassNameString, WordListItem.ClassNameStringHover);
            }
            zo.current = zo.current + 1;
            // There might be multiple spans for the same word list, so advance the 
            // counter twice if we need to.
            while ((zo.current < zo.total) && 
                (YUD.getAttribute(spans[zo.current],WordListItem.groupAttributeName) == spanGroupAttr)) {
                zo.current = zo.current + 1;
            }
            if (zo.current == zo.total) {
                zo.current = -1;
                return isHandled;
            }
            this.AddClassToGroup(spans[zo.current],WordListItem.ClassNameStringHover, WordListItem.ClassNameString); 
            ContentManager.log("wordlist: focus span " + zo.current + " out of " + zo.total + " evt is " + evt.type);
        }
        return isHandled;
    };
    
    // For a span group, change the CSS based on whether it's selected, etc.
    this.AddClassToGroup = function(div, classToAdd, classToRemove) {
        var groupTag = YAHOO.util.Dom.getAttribute(div,WordListItem.groupAttributeName);
        for (var j = 0; j < myPageSpans.length; ++j) {
            if (YAHOO.util.Dom.getAttribute(myPageSpans[j],WordListItem.groupAttributeName) == groupTag) {
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

// Change class of span and other spans in gropu to hover
WordListItem.mouseOver = (function (event, wl) {
    var div = this;
    wl.AddClassToGroup(div,
        WordListItem.ClassNameStringHover, WordListItem.ClassNameString);
});

// Change class of span and other spans in gropu to normal
WordListItem.mouseOut = (function (event, wl) {
    var div = this;
    wl.AddClassToGroup(div, 
        WordListItem.ClassNameString, WordListItem.ClassNameStringHover);
});

// Use has clicked on one of the word list activated spans.  Get required information
// from the span/item and send it to the panel click handler.
WordListItem.clickHandler = (function(event, wl) {
    var div = this;
    var entry = { wl_item: wl, span: div };
    var headerText = wl.getGroupHtml(div);
    WordListPanel.processClick(entry, headerText);
});

