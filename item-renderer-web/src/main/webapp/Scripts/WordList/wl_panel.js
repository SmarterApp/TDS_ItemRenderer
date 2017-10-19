//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************

////////////// Word list Panel logic.  Handles the singleton word list panel tool.
// This class is all static methods/data for handling word list items in general.
function WordListPanel() {
}

//////////////// globals (class static)  /////////////////////////

// This is the attribute name in the query string
WordListPanel.queryName = "key";
WordListPanel.bankKeyHdr = "bankKey";
WordListPanel.itemKeyHdr = "itemKey";
WordListPanel.indexHdr = "index";
WordListPanel.AccType = "Word List";
WordListPanel.AccIllustrationType = "Illustration Glossary";
WordListPanel.AccNoAccs = "TDS_WL0";
WordListPanel.AccIllistrationAccs = "TDS_WL_Illustration";
WordListPanel.AccNoIllustrationAccs = "TDS_ILG0";
WordListPanel.AccShowIllustrationAccs = "TDS_ILG1";
WordListPanel.AccHdr = "TDS_ACCS";

// Arbitrary name of div that will contain the word list panel
WordListPanel.divId = "WordListTool";
WordListPanel.toolDiv = null; // singleton panel container div
WordListPanel.panel = null; // singleton word list panel
WordListPanel.resizer = null; // resizer for the panel
WordListPanel.generalPanelWidth = 320; // default size for tex glossaries
WordListPanel.minImageSize = 200;
WordListPanel.absoluteMinPanelWidth = 110; // if we so less than this the tab over extends the panel so don't go less than this
WordListPanel.zoomFactor = 1;
WordListPanel.tabView = null; // singleton panel content div
WordListPanel.tabCount = 0; // used for hotkey tabbing in WL pane
WordListPanel.tabCurrent = 0;

// Save word list yet-to-be-sent requests in a queue
WordListPanel.requestQ = {};
WordListPanel.tagQ = {};

// URL that we agree on with server
WordListPanel.xhrUrl = "Pages/API/WordList.axd";
// method name that we agree on with server, per AIR convention.
WordListPanel.xhrMethod = "resolve";

// This is the id of the content div in the word list pane.
WordListPanel.tabbedDivName = "word-list-list-div";

// Avoid doing deep fetch for this def, if we've already done it.
WordListPanel.contentWordCache = {};
WordListPanel.headerWordCache = {};
WordListPanel.message = {};

WordListPanel.getKeyFromQEntry = function(entry) {
    var keyIndex = YUD.getAttribute(entry.span, WordListItem.attributeName);
    var bankKey = entry.wl_item.wl_res.bankKey;
    var itemKey = entry.wl_item.wl_res.itemKey;
    return bankKey + '-' + itemKey + '-' + keyIndex;
};

/////////// Event handlers ///////////////////////////

// YUI Connection Manager callback response.  This happens when the POST response comes back.
WordListPanel.postCallback = {
    success: (function (resp) {
        // Parse the returned JSON structure, containing an array of objects
        var messages = YAHOO.lang.JSON.parse(resp.responseText);
        if (messages) {
            for (var i = 0; i < messages.length; ++i) {
                // Create HTML for WordList dialog
                var tabString = WordListPanel.RenderHtmlTabs(messages[i]);

                var key = messages[i].EntryKey;
                var itemKey = key.split('-')[1];

                //store the data so we don't have to fetch it again.
                WordListPanel.contentWordCache[key] = tabString;
                WordListPanel.message[key] = messages[i];
            }
            WordListPanel.ProcessTagQ(itemKey);
        } else {
            console.error('word list: server returned no word list words');
        }
    }),
    argument: []
};

WordListPanel.ProcessTagQ = function(itemKey) {
    // Tag the individual spans that returned WordList entries
    var itemTagQ = WordListPanel.tagQ[itemKey];
    if (itemTagQ == null) {
        console.log("word list: server returned empty response, returning.");
        return;
    }
    for (var i = itemTagQ.length - 1; i >= 0; --i) {
        var entry = itemTagQ[i];
        var cacheEntry = WordListPanel.message[entry.key];
        if (cacheEntry && cacheEntry.EntryFound) {
            entry.wl_item.TagSingleSpan(entry.span);
            itemTagQ.splice(i, 1);
        }
    }
};

// User has clicked on a span.  Search for the definition
WordListPanel.processClick = function (entry, headerText) {
    if ((WordListPanel.panel != null) && (WordListPanel.toolDiv != null)) {
        if (entry != null) {
            var cacheKey = WordListPanel.getKeyFromQEntry(entry);

            // Do we know this word?
            if (WordListPanel.contentWordCache[cacheKey] != null) {
                // It is possible that multiple words/phrases map to same
                // definition.  So update the header with that word/phrase.
                WordListPanel.headerWordCache[cacheKey] = headerText;

                WordListPanel.curWLItem = entry.wl_item;
                WordListPanel.setPanel(WordListPanel.headerWordCache[cacheKey], WordListPanel.contentWordCache[cacheKey]);
                WordListPanel.panel.mask.style.display = 'none';
            } else {
                ContentManager.log("WordList: errantly tagged span");
            }
        }
    }
};

/////////////////// Helper logic /////////////////////

// Unpack the item string and send the word list POST request
WordListPanel.sendRequest = function (wl_item) {
    var bankKey = wl_item.wl_res.bankKey;
    var itemKey = wl_item.wl_res.itemKey;

    // build the form post data
    var str = WordListPanel.bankKeyHdr + "=" + bankKey.toString() + "&" + WordListPanel.itemKeyHdr + "=" + itemKey.toString();

    // Build a URL query list of all word list values for this bank/item that we need
    var strValues = '';
    var requestQ = WordListPanel.requestQ[itemKey];
    $.each(requestQ, function (key, value) {
        strValues = strValues + '&index=' + value;
    });

    if (strValues == '') { // No words that we don�t already know? Then we're done.
        WordListPanel.ProcessTagQ(itemKey);
        return;
    }

    str = str + strValues;

    // get the selected WL accommodations
    var accommodationManager = Accommodations.Manager.getCurrent();
    var wlCodes = accommodationManager.getType(WordListPanel.AccType).getCodes(true);

    var ilgType = accommodationManager.getType(WordListPanel.AccIllustrationType);
    if (ilgType != null) {
        var ilgs = ilgType.getCodes(true);
        if (ilgs.length != 0 && ilgs[0] == WordListPanel.AccShowIllustrationAccs) {
            wlCodes.push(WordListPanel.AccIllistrationAccs);
        }
    }

    // build acc codes post
    for (var i = 0, ii = wlCodes.length; i < ii; i++) {
        var wlInner = wlCodes[i].split('&');
        for (var j = 0; j < wlInner.length; ++j) {
            str += "&" + WordListPanel.AccHdr + "=" + wlInner[j];
        }
    }

    var urlString = TDS.baseUrl + WordListPanel.xhrUrl + "/" + WordListPanel.xhrMethod;

    // This is a hack for ItemPreview and related tools, which is different from Student.
    // If WordListPanel.xhrUrl looks like a fully-qualified URL then use it alone, otherwise
    // construct the URL from baseUrl (Student app).
    if (/^http/.test(WordListPanel.xhrUrl)) {
        urlString = WordListPanel.xhrUrl + "/" + WordListPanel.xhrMethod;
    }

    YAHOO.util.Connect.asyncRequest('POST', urlString, WordListPanel.postCallback, str);

    // Display loading screen.
    // WordListPanel.setPanel(WordListPanel.headerWordCache[key], WordListPanel.LoadingPageString);
};

// Are there any TDS_WL configs in the accs cookie?  If not then
// don't bother to fetch any data we can't even display
WordListPanel.IsWordListEnabled = function () {

    var accs = Accommodations.Manager.getCurrent();
    var wlType = accs.getType(WordListPanel.AccType);
    var ilgType = accs.getType(WordListPanel.AccIllustrationType);

    var doesGlossaryExist = false;
    var doesIllustrationExist = false;

    // check if type exists
    if (wlType) {
        // check if values exist
        var wlValues = wlType.getSelected();
        if (wlValues.length != 0) {
            doesGlossaryExist = true; // set to true temporarily, unless the No Word List value is found

            // If one of the acc strings is 'no word list', don't enable word list.
            for (var i = 0; i < wlValues.length; ++i) {
                var codes = wlValues[i].getCodes();
                for (var j = 0; j < codes.length; ++j) {
                    if (codes[j] == WordListPanel.AccNoAccs) {
                        doesGlossaryExist = false;
                        break;
                    }
                }
            }
        }
    }

    if (ilgType) {
        // check if values exist
        var ilgValues = ilgType.getSelected();
        if (ilgValues.length != 0) {
            // see if the Illustration Glossary is turned on
            for (var i = 0; i < ilgValues.length; ++i) {
                var codes = ilgValues[i].getCodes();
                for (var j = 0; j < codes.length; ++j) {
                    if (codes[j] == WordListPanel.AccShowIllustrationAccs) {
                        doesIllustrationExist = true;
                        break;
                    }
                }
            }
        }

    }

    return doesGlossaryExist || doesIllustrationExist;
};

// Helper function to show the word view panel
// args: hd (header html) bd (body html)
WordListPanel.setPanel = function (hd, bd) {
    if ((WordListPanel.panel != null) && (WordListPanel.toolDiv != null)) {
        if (hd != null) {
            WordListPanel.panel.setHeader(hd);
        }
        WordListPanel.panel.setBody(bd);
        WordListPanel.panel.show();

        WordListPanel.tabView = new YAHOO.widget.TabView(WordListPanel.tabbedDivName);

        // Count # of tabs in word list panel
        WordListPanel.tabCount = 0;
        WordListPanel.absoluteMinPanelWidth = 24; // left and right padding of the panel as a whole
        while (WordListPanel.tabView.getTab(WordListPanel.tabCount) != null) {
            WordListPanel.absoluteMinPanelWidth += $(WordListPanel.tabView.getTab(WordListPanel.tabCount).get('element')).outerWidth(true);
            WordListPanel.tabCount++;
        }

        // clear out "remembered" panel sizes since this is starting fresh
        WordListPanel.determineDefaultPanelSizes();
        WordListPanel.initializeIllustration();

        WordListPanel.tabCurrent = 0; // Set currently selected tab index

        // Hook up an event to move the 'aria-title' attribute as different tabs
        //  are selected for WCAG
        WordListPanel.tabView.on("activeTabChange", function(event) {
            var curTab;
            var oTabEl;

            for (var i = 0; i < WordListPanel.tabCount; ++i) {
                curTab = WordListPanel.tabView.getTab(i);
                oTabEl = curTab.get("element");
                $(oTabEl).removeAttr('aria-title');
            }

            oTabEl = this.get("activeTab").get("element");
            $(oTabEl).attr('aria-title', 'Selected');

            WordListPanel.initializeResizing();
        });

        WordListPanel.initializeResizing();
        WordListPanel.fitPanelToIllustrationSize();
        WordListPanel.handlePanelOutsideWindow();

        setTimeout(function() {
            WordListPanel.postProcessAudioTags();
        }.bind(this), 1); //Panels can behave in a scary fashion
    }
};

WordListPanel.panelSizes = {};

WordListPanel.fitPanelToIllustrationSize = function() {
    var bd = WordListPanel.panel.body;
    try {
        if (!bd) return;

        var imgEls = YAHOO.util.Selector.query('img', bd) || [];

        if (imgEls.length == 1) {
            var img = $(imgEls[0]);

            var newWidth = img.width() + WordListPanel.getPanelExtraWidth();
            var newHeight = img.height() + WordListPanel.getPanelExtraHeight();

            newWidth = Math.max(newWidth, WordListPanel.absoluteMinPanelWidth);

            var panel = $('#' + WordListPanel.panel.id);
            var activeTabId = $(WordListPanel.tabView.get('activeTab').get('element')).find('a').attr('href');

            var size = WordListPanel.panelSizes[activeTabId] || {};
            size.width = newWidth;
            size.height = newHeight;
            size.baseWidth = size.width / WordListPanel.zoomFactor;
            size.baseHeight = size.height / WordListPanel.zoomFactor;

            WordListPanel.panelSizes[activeTabId] = size;

            panel.width(newWidth).height(newHeight);
            panel.attr('data-width', size.baseWidth); // newWidth);
            panel.attr('data-height', size.baseHeight); // newHeight);
        }
    } catch (e) {
        console.error("Error fitting panel to illustration.", e);
    }
};

WordListPanel.savePanelSize = function() {
    var panel = $('#' + WordListPanel.panel.id);
    var activeTabId = $(WordListPanel.tabView.get('activeTab').get('element')).find('a').attr('href');

    var size = WordListPanel.panelSizes[activeTabId] || {};

    size.width = panel.width();
    size.height = panel.height();
    size.baseWidth = size.width / WordListPanel.zoomFactor;
    size.baseHeight = size.height / WordListPanel.zoomFactor;

    WordListPanel.panelSizes[activeTabId] = size;

    // keep width and height in sync with data-width and data-height
    panel.attr('data-width', size.baseWidth); // panel.width());
    panel.attr('data-height', size.baseHeight); // panel.height());
};

WordListPanel.determineDefaultPanelSizes = function() {
    // reset
    WordListPanel.panelSizes = {};

    // get each tab content div
    var contentDivs = $(WordListPanel.panel.body).find('div.yui-content > div');

    for (var i=0; i < contentDivs.length; i++) {
        var width = WordListPanel.generalPanelWidth * WordListPanel.zoomFactor; // default width for a standard text glossary
        var height = ''; // no specific height for a standard text glossary

        // is this an illustration glossary content area
        var img = $(contentDivs[i]).find('img');

        if (img.length == 1) {
            width = (img.width() + WordListPanel.getPanelExtraWidth());
            height = (img.height() + WordListPanel.getPanelExtraHeight());
        }

        width = Math.max(WordListPanel.absoluteMinPanelWidth, width);

        // the # is because that is what the href has which we use for the lookup later on
        WordListPanel.panelSizes['#' + contentDivs[i].id] = {
            width: width,
            height: height,
            baseWidth: width / WordListPanel.zoomFactor,
            baseHeight: height == '' ? '' : height / WordListPanel.zoomFactor
        }
    }
};

// calculates the additional panel pixels that need to be added on top of the image height
WordListPanel.getPanelExtraHeight = function() {
    var height = 0;
    var panel = $('#' + WordListPanel.panel.id);

    // header bar height
    height += panel.find('.hd').outerHeight(true);

    // tab height
    height += panel.find('.bd ul.yui-nav').outerHeight(true);

    // padding of the body div
    height += panel.find('.bd').innerHeight() - panel.find('.bd').height();

    // padding of the content div
    height += panel.find('.bd .yui-content').innerHeight() - panel.find('.bd .yui-content').height();

    // extra space for resize handle
    height += 6;

    return height; // 91
};

// calculates the additional panel pixels that need to be added on top of the image width
WordListPanel.getPanelExtraWidth = function() {
    return 40 * WordListPanel.zoomFactor;
};

// check to see if the panel flows outside the browser window
//  if so then the user might not be able to access the close and resize buttons
//  this will move the window to try to fit and if it can't then resize it smaller to fit
WordListPanel.handlePanelOutsideWindow = function() {
    var panel = $('#' + WordListPanel.panel.id + "_c"); // hacky
    var moveLeft = 0;
    var moveTop = 0;

    var widthGap = window.innerWidth - (panel.offset().left + panel.outerWidth());
    if (widthGap < 5) {
        // move to the left so it fits on the screen
        moveLeft = widthGap - 10;
    }

    var heightGap = window.innerHeight - (panel.offset().top + panel.outerHeight());
    if (heightGap < 5) {
        // move up so it fits on the screen
        moveTop = heightGap - 10;
    }


    if (moveLeft != 0 || moveTop != 0) {
        var newLeft = panel.position().left + moveLeft;
        var newTop = panel.position().top + moveTop;
        var shrinkHeightToFit = false;
        var shrinkWidthToFit = false;

        if (newLeft < 0) {
            newLeft = 0;
            shrinkWidthToFit = true;
        }
        if (newTop < 0) {
            newTop = 0;
            shrinkHeightToFit = true;
        }

        // move to new position
        panel.css({
            left: newLeft + 'px',
            top: newTop + 'px'
        });

        // even after moving, the panel doesn't fit on the screen so we must shrink it
        if (shrinkWidthToFit || shrinkHeightToFit) {
            var newWidth = 0;
            var newHeight = 0;

            if (shrinkWidthToFit) {
                // width is greater than height
                newWidth = window.innerWidth - 10;
                newHeight = newWidth / WordListPanel.illustrationRatio;
            } else {
                newHeight = window.innerHeight - 10;
                newWidth = newHeight * WordListPanel.illustrationRatio;
            }

            WordListPanel.resizeIllustration(newWidth - WordListPanel.getPanelExtraWidth(), newHeight - WordListPanel.getPanelExtraHeight());
        }
    }

};

WordListPanel.getActiveTabPanelSize = function() {
    var activeTabId = $(WordListPanel.tabView.get('activeTab').get('element')).find('a').attr('href');
    return WordListPanel.panelSizes[activeTabId];
};

WordListPanel.initializeResizing = function() {
    var activePanelSize = WordListPanel.getActiveTabPanelSize();

    if (activePanelSize) {
        var panel = $('#' + WordListPanel.panel.id);
        panel.width(activePanelSize.width).height(activePanelSize.height);
        panel.attr('data-width', activePanelSize.width);

        if (activePanelSize.height) {
            panel.attr('data-height', activePanelSize.height);
        } else {
            panel.attr('data-height', panel.height());
        }
    } else {
        WordListPanel.savePanelSize();
    }

    var tabContent = $(WordListPanel.tabView.get('activeTab').get('content'));
    if (tabContent.find('img').length == 1) {
        var resizeConfig = {
            handles: ['br'],
            ratio: true,
            status: false
        };

        if (WordListPanel.illustrationRatio > 1) {
            resizeConfig.minWidth = Math.max(WordListPanel.minImageSize + WordListPanel.getPanelExtraWidth(), WordListPanel.absoluteMinPanelWidth);
        }
        else {
            resizeConfig.minHeight = WordListPanel.minImageSize + WordListPanel.getPanelExtraHeight();
            resizeConfig.minWidth = WordListPanel.absoluteMinPanelWidth;
        }

        WordListPanel.resizer = new YAHOO.util.Resize(WordListPanel.panel.id, resizeConfig);

        WordListPanel.resizer.on('resize', function(args) {
            WordListPanel.resizeHelper(args.width, args.height, this, true);
        }, WordListPanel.panel, true);

        // Setup startResize handler, to constrain the resize width/height
        // if the constraintoviewport configuration property is enabled.
        WordListPanel.resizer.on('startResize', function(args) {

            if (this.cfg.getProperty("constraintoviewport")) {
                var D = YAHOO.util.Dom;

                var clientRegion = D.getClientRegion();
                var elRegion = D.getRegion(this.element);

                WordListPanel.resizer.set("maxWidth", clientRegion.right - elRegion.left - YAHOO.widget.Overlay.VIEWPORT_OFFSET);
                WordListPanel.resizer.set("maxHeight", clientRegion.bottom - elRegion.top - YAHOO.widget.Overlay.VIEWPORT_OFFSET);
            } else {
                WordListPanel.resizer.set("maxWidth", null);
                WordListPanel.resizer.set("maxHeight", null);
            }
        }, WordListPanel.panel, true);
    } else if (WordListPanel.resizer != null) {
        WordListPanel.resizer.destroy();
    }


};

WordListPanel.doZoomResize = function() {
    if (!WordListPanel.IsVisible()) return;

    var activePanelSize = WordListPanel.getActiveTabPanelSize();

    WordListPanel.resizeHelper(activePanelSize.width, activePanelSize.height, WordListPanel.panel, false);
};

WordListPanel.resizeHelper = function(w, h, panel, isResize) {
    WordListPanel.resizeIllustration(w - WordListPanel.getPanelExtraWidth(), h - WordListPanel.getPanelExtraHeight());

    panel.cfg.setProperty("height", h + "px");

    if (isResize)
        WordListPanel.savePanelSize();
};

// Set up the word list pane.  Should only be done once.
WordListPanel.InitializePane = function() {

    // This next line fixes a bug in YUI2 where active tab
    // has a title attribute which generates a tooltip
    YAHOO.widget.Tab.prototype.ACTIVE_TITLE = '';

    var toolDiv = document.getElementById("tools");
    if (toolDiv != null) {
        WordListPanel.toolDiv = document.createElement("div");
        YUD.addClass(WordListPanel.toolDiv, "yui-dialog focused");
        YUD.setAttribute(WordListPanel.toolDiv, 'id', WordListPanel.divId);

        // Add style sheet link
        var clink = document.createElement("link");
        YUD.setAttribute(clink, 'type', 'text/css');
        YUD.setAttribute(clink, 'rel', 'stylesheet');
        YUD.setAttribute(clink, 'media', 'screen');
        YUD.setAttribute(clink, 'href', ContentManager.resolveBaseUrl('Scripts/Libraries/yahoo/yui2/build/tabview/assets/skins/sam/tabview.css'));
        WordListPanel.toolDiv.appendChild(clink);

        toolDiv.appendChild(WordListPanel.toolDiv);

        WordListPanel.panel = new YAHOO.widget.Panel("wordListPanel", {
            width: "600px",
            zindex: 1004,
            visible: false,
            constraintoviewport: true,
            modal: true,
            autofillheight: "body" });
    }

    WordListPanel.panel.render(WordListPanel.toolDiv);

    // Generate and add a keyup event handler in streamlined mode so we can close (or hide) the panel
    //  by pressing space/enter when on the panel's closer in the title bar
    var accProps = Accommodations.Manager.getCurrentProps();
    if (accProps.isStreamlinedMode()) {

        var closeBtn = $(WordListPanel.toolDiv).find('.container-close');
        closeBtn.keyup(function (evt) {
            if (WordListPanel.panel != null) {
                if (evt.which == 13 || evt.which == 32) {
                    WordListPanel.panel.hide();
                    evt.preventDefault();
                }
            }
        });
    }

    WordListPanel.panel.subscribe('hide', function () {
        if (WordListPanel.curWLItem) {
            WordListPanel.curWLItem.ClearSelectedWord();
            WordListPanel.curWLItem = null;
        }
    });
};

// From parsed JSON POST response, construct the YUI Tab formats with the response.
WordListPanel.RenderHtmlTabs = function (messages) {
    var entries = messages.Entries;
     //Orders tabs in the word list panel
     if (entries.length > 1) {
        var tabOrder = {'illustration': 0, 'glossary': 1}
        const tabOrderLen = tabOrder.size+ 1;        
        entries.sort(function(a, b){
            var aIndex = tabOrder[a.wlType] || tabOrderLen
            var bIndex = tabOrder[b.wlType] || tabOrderLen;
            return aIndex - bIndex;
        });
    }

    var tabString = "<div id=\"" + WordListPanel.tabbedDivName + "\" class=\"yui-navset\"> \r\n";
    tabString = tabString + "<ul class=\"yui-nav\">\r\n";
    var contentString = " <div class=\"yui-content\">\r\n";
    var i;
    for (i = 0; i < entries.length; ++i) {
        tabString = tabString + "<li";
        if (i == 0) {
            tabString = tabString + " class=\"selected\" aria-title=\"Selected\"";
        }
        tabString = tabString + "> <a href=\"#word-list-" + i.toString();

        // Try to find wl in i18n
        var wlTypeTranslation = Messages.get('TDS.WordList.' + entries[i].wlType);
        tabString = tabString + "\">" + wlTypeTranslation + "</a></li>\r\n";
        contentString = contentString + "<div id=\"word-list-" + i.toString() + "\"><p>" + entries[i].wlContent + "</p></div>";
    }
    tabString = tabString + "</ul>";
    tabString = tabString + contentString + "</div>";
    return tabString;
};

WordListPanel.illustrationWidth = null;
WordListPanel.illustrationHeight = null;
WordListPanel.illustrationRatio = 1; // > 1 means width is bigger than height
WordListPanel.initializeIllustration = function() {
    var bd = WordListPanel.panel.body;
    try {
        if (!bd) return;

        var imgEls = YAHOO.util.Selector.query('img', bd) || [];

        if (imgEls.length == 1) {
            var img = $(imgEls[0]);

            // set image size based on zoom factor the first time
            WordListPanel.illustrationWidth = img.width();
            WordListPanel.illustrationHeight = img.height();
            WordListPanel.illustrationRatio = WordListPanel.illustrationWidth / WordListPanel.illustrationHeight;

            WordListPanel.resizeIllustration(WordListPanel.illustrationWidth * WordListPanel.zoomFactor, WordListPanel.illustrationHeight * WordListPanel.zoomFactor);

            return true;
        }
    } catch (e) {
        console.error("Error initializing the illustration (error, dom).", e, bd);
    }

    return false;
};

WordListPanel.resizeIllustration = function(w, h) {
    var bd = WordListPanel.panel.body;
    try {
        if (!bd) return;

        var imgEls = YAHOO.util.Selector.query('img', bd) || [];

        if (imgEls.length == 1) {
            var img = $(imgEls[0]);

            img.attr('width', w);
            img.attr('height', h);
            img.attr('data-width', w);
            img.attr('data-height', h);
        }
    } catch (e) {
        console.error("Error resizing the illustration (error, dom).", e, bd);
    }
};

/**
 *  We must support the creation of audio elements in word panels, this requires us to
 *  process things into sound manager sounds for certain browser types.
 */
WordListPanel.postProcessAudioTags = function () {
    if (!window.TDS || !window.TDS.Audio || !window.TDS.Audio.Widget) {
        return;
    }

    var bd = WordListPanel.panel.body;
    try {
        if (!bd) {
            return;
        }

        // Url resolver puts the encoded path in the anchor tags.
        var audioEls = YAHOO.util.Selector.query('a', bd) || [];

        for (var i = 0; i < audioEls.length; ++i) {
            var span = audioEls[i];
            if (span && span.href) {
                var href = span.href;

                // Is this an audio span?
                // Bug 132322: use indexOf instead of contains for x-browser compatibilty
                if (href.indexOf('.ogg') != -1 || (href.indexOf('.m4a') != -1)) {

                    // give it some stylin'
                    YUD.addClass(span, 'sound_repeat');

                    // Url decoder expects stuff to go inside html so we need to unHTML encode the href:
                    href = href.replace(/&amp;/gmi, '&');
                    span.href = href;

                    // Now we have a valid href in an anchor span.  So replace the anchor with an audio span
                    // This handles things like show/hide audio widget.
                    TDS.Audio.Widget.createPlayer(span);
                }
            }
        }
    } catch (e) {
        console.error("Error creating players in the word list panel (error, dom).", e, bd);
    }
};

// Returns whether the word list panel is currently displaying on screen
WordListPanel.IsVisible = function() {
    if (WordListPanel.panel) {
        return WordListPanel.panel.cfg.getProperty('visible');
    }

    return false;
};

// Removes all items from the content word cache so the same item can be reloaded with a different glossary
WordListPanel.clearCache = function() {
    WordListPanel.contentWordCache = {};
    WordListPanel.headerWordCache = {};
    WordListPanel.message = {};
};

// content manager events
(function(CM) {

    if (!CM) return;

    // when zooming a page we are on update elements
    CM.onPageEvent('zoom', function (page, level) {
        console.log('zoom event level', level);
        if(WordListPanel.IsWordListEnabled()){
            WordListPanel.zoomFactor = level;
            for (var key in WordListPanel.panelSizes) {
                var val = WordListPanel.panelSizes[key];
                WordListPanel.panelSizes[key].width = val.baseWidth * level;
                WordListPanel.panelSizes[key].height = val.baseHeight == '' ? '' : val.baseHeight * level;
            }

            WordListPanel.doZoomResize();
            WordListPanel.handlePanelOutsideWindow();
        }
    });

})(window.ContentManager);
