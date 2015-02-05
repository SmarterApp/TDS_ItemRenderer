/*
This file is responsible for managing a collection of pages. A group returned from
the adaptive algorithm is considered a page. 
*/

// a container for holding groups
TestShell.PageManager = {};
TestShell.PageManager.Events = new Util.EventManager(TestShell.PageManager); // onShow, onHide
TestShell.PageManager._initializing = true;
TestShell.PageManager._pageList = []; // ordered list of pages
TestShell.PageManager._pageLookup = {}; // hash table of pages
TestShell.PageManager._current = null; // current page

// gets a list of all pages (optionally you can request only enabled)
TestShell.PageManager.getPages = function(isEnabled) {
    
    // check if filtering out disabled items
    if (isEnabled) {
        return Util.Array.filter(this._pageList, function(page) {
            return page.isEnabled();
        });
    }

    return this._pageList.slice(0);
};

// check if there are any pages at all
TestShell.PageManager.hasPages = function() {
    return (this._pageList.length > 0);
};

// gets a list of all actual test page groups (optionally you can request only enabled)
TestShell.PageManager.getGroups = function(isEnabled) {
    
    var pages = this.getPages(isEnabled);
    var groups = [];

    for (var i = 0; i < pages.length; i++) {
        var page = pages[i];

        if (page instanceof TestShell.PageGroup) {
            groups.push(page);
        }
    }

    return groups;
};

// set the current page
TestShell.PageManager.setCurrent = function(page) {
    
    // add page to history
    if (this._current != null) {
        TestShell.PageManager.History.push(this._current);
    }

    // set page as current
    Util.log('TestShell.PageManager.setCurrent: ' + (page == null ? 'NULL' : page.id));
    this._current = page;
};

// get the current page
TestShell.PageManager.getCurrent = function() {
    return this._current;
};

// get a page by its ID (e.x., "G-100-1")
TestShell.PageManager.get = function(id) {
    return this._pageLookup[id];
};

// get a response from one of the groups
TestShell.PageManager.getResponse = function(position) {
    var groups = this.getGroups();

    for (var i = 0; i < groups.length; i++) {
        var group = groups[i];
        var response = group.getResponse(position);
        if (response != null) {
            return response;
        }
    }

    return null;
};

TestShell.PageManager.getFirst = function(isEnabled) {
    var pages = this.getPages(isEnabled);
    return (pages.length > 0) ? pages[0] : null;
};

TestShell.PageManager.getFirstGroup = function(isEnabled) {
    var groups = this.getGroups(isEnabled);
    return (groups.length > 0) ? groups[0] : null;
};

TestShell.PageManager.getLast = function(isEnabled) {
    var pages = this.getPages(isEnabled);
    return (pages.length > 0) ? pages[pages.length - 1] : null;
};

TestShell.PageManager.getLastGroup = function(isEnabled) {
    var groups = this.getGroups(isEnabled);
    return (groups.length > 0) ? groups[groups.length - 1] : null;
};

/* NAVIGATION START 
   The following functions are used for navigation and only work on enabled pages:
*/

// Check if the current page is the first page.
TestShell.PageManager.isFirst = function() {
    var page = this.getCurrent();
    var firstPage = this.getFirst(true);
    return (page != null && firstPage != null && page == firstPage);
};

// Check if the current page is the last page.
TestShell.PageManager.isLast = function() {
    var page = this.getCurrent();
    var lastPage = this.getLast(true);
    return (page != null && lastPage != null && page == lastPage);
};

// Based on the current page get the previous page the user can go to.
TestShell.PageManager.getPrevious = function() {
    
    var page = this.getCurrent();
    if (page) {
        var pages = this.getPages(true);
        var idx = pages.indexOf(page);
        if (idx != -1) {
            return pages[idx - 1];
        }
    }

    return null;
};

// Based on the current page get the next page the user can go to.
TestShell.PageManager.getNext = function() {
    
    var page = this.getCurrent();
    if (page) {
        var pages = this.getPages(true);
        var idx = pages.indexOf(page);
        if (idx != -1) {
            return pages[idx + 1];
        }
    }

    return null;
};

TestShell.PageManager.moveBack = function() {
    
    var backPage = this.getPrevious();
    if (backPage) {
        this.setCurrent(backPage);
        return true;
    }

    return false;
};

TestShell.PageManager.moveNext = function() {
    
    var nextPage = this.getNext();
    if (nextPage) {
        TestShell.PageManager.setCurrent(nextPage);
        return true;
    }

    return false;
};

/* NAVIGATION END */

// check if the page manager contains a page object
TestShell.PageManager.contains = function(page) {
    return (this._pageList.indexOf(page) != -1);
};

// add page to the end
TestShell.PageManager.addPage = function(newPage) {
    this._pageLookup[newPage.id] = newPage;
    this._pageList.push(newPage);
    newPage.updateNavigationLabel();
};

// insert a page before an existing page
TestShell.PageManager.insertPage = function(newPage, refPage) {
    this._pageLookup[newPage.id] = newPage;
    var refIdx = this._pageList.indexOf(refPage);
    Util.Array.insertAt(this._pageList, newPage, refIdx);
    newPage.updateNavigationLabel(refPage);
};

TestShell.PageManager._addGroup = function(group) {
    
    // get the last group we know about so far
    var lastGroup = this.getLastGroup();

    // check if the group we are about to add has a different segment than the last group added
    var segmentReview = null;

    if (lastGroup && lastGroup.getSegment() != null && lastGroup.getSegment() != group.getSegment()) {
        var segment = lastGroup.getSegment();

        // check if this segment allows item review screen
        if (segment.showItemReview()) {
            segmentReview = this.addReview(lastGroup.getSegment());
        }
    }

    // check to make sure group does not exist
    var foundExistingGroup = Util.Array.find(this.getGroups(), function(existingGroup) {
        return group.id == existingGroup.id;
    });

    // if the group already exists then skip it
    if (foundExistingGroup != null) {
        return;
    }

    // set if group was prefetched
    // group.prefetched = results.summary.prefetched;

    // add group to main collection
    this.addPage(group);

    // if we are initializing for the first time then check some special cases
    if (this._initializing) {
        // check if coming from review page
        if (TestShell.Config.reviewPage > 0) {
            // check if review page matches group
            if (TestShell.Config.reviewPage == group.pageNum) {
                this.setCurrent(group);
            }
        } else if (TestShell.Config.startPosition > 0) {
            // check if the start position is within this group
            if (group.getResponse(TestShell.Config.startPosition) != null) {
                this.setCurrent(group);
            }
        }
    }

    // The following rules determine what groups returned from XHR we should choose to show the student
    // when we have no current group set. The reasons we would not have a current group set are when
    // you are starting your test or if you pressed [Next] before prefetch occured (since this nulls out 
    // the current group while we are waiting).
    if (this.getCurrent() == null) {

        var useGroup = false;
        var groupInfo = group.getInfo();

        // If this is NOT the first time loading the test then this would be a new prefetched group. In this
        // case we want to just use whatever the first one returned is to show the student.
        if (!this._initializing) {
            useGroup = true;
        }

        // If an existing group is not completed then this is where the student most likely left off in the test.
        else if (!group.isCompleted()) {
            useGroup = true;
        }

        // If an existing group explicitly required no items and was considered completed (any response marked 
        // as IsRequired was answered) but the group itself still had unanswered questions left then we will use this 
        // group. The rationale here is we don't want to unintentionally skip unanswered questions for the student. 
        // This would happen if you paused your test on an optional group and then when you resume it will take you 
        // to the group after (since the optional group looked completed). A side effect of this however is when 
        // resuming a test you will go to the first optional group that has unanswered questions left (which could be 
        // in the middle of the test).
        else if (groupInfo.groupRequired == 0 && groupInfo.itemCount != groupInfo.itemsAnswered) {
            useGroup = true;
        }

        if (segmentReview != null) {
            this.setCurrent(segmentReview);
        } else if (useGroup) {
            this.setCurrent(group);
        }
    }

    // PREFETCH CONTENT: When getting back a group from XHR we need to make a decision on whether to preload
    // its content. If the group we are getting was directly because of prefetch then we should always load
    // its content. However if we are resuming a test then we need to be more careful and only load the content
    // for item groups that are not completed.
    // BUG: When first starting a test any optional pages are not prefetched with below logic.
    if (!this._initializing || !group.isCompleted()) {
        group.requestContent();
    }

    // check for duplicate items
    try {
        if (group.items) {
            var positions = group.items.map(function (item) {
                return item.position;
            });
            if (positions.length != Util.Array.unique(positions).length) {
                var error = 'Duplicate item positions: ' + positions.join(', ');
                TDS.Diagnostics.report(error, false);
            }
        }
    } catch (ex) {
        // Added this code 4-18-2014 for weekend deployment so protecting with try/catch.         
    }
};

TestShell.PageManager.addGroups = function(groups) {
    
    // add each group
    Util.Array.each(groups, this._addGroup, this);

    // check if this is the first time loading this page
    if (this._initializing) {
        // set the current group to the last one the student saw
        if (this.getCurrent() == null) {
            this.setCurrent(groups[groups.length - 1]);
        }

        this._initializing = false;
    } else {
        // if there is no current group then set to the first new group received
        if (this.getCurrent() == null) {
            this.setCurrent(groups[0]);
        }
    }

    // if this is the last group of the test and the segment has a review screen then add it
    if (TestShell.testLengthMet) {
        // get the last group we know about so far
        var lastGroup = this.getLastGroup();
        var lastSegment = lastGroup.getSegment();

        if (lastSegment && lastSegment.showItemReview()) {
            this.addReview(lastGroup.getSegment());
        }
    }

    // check if one of the groups we received should be shown
    TestShell.Navigation.requestPage();
};

// add a review page
TestShell.PageManager.addReview = function(segment) {
    var pageReview = new TestShell.PageReview(segment);
    this.addPage(pageReview);
    return pageReview;
};

// clear the current page
TestShell.PageManager.clearCurrent = function() {
    TestShell.PageManager.setCurrent(null);
};

// swap out the current page for another one
TestShell.PageManager.swapCurrent = function(coverPage) {
    
    // HACK: we must remove the current page from the history since we never actually went to it
    // (accommodations won't be applied to the test shell otherwise)
    TestShell.PageManager.clearCurrent();
    TestShell.PageManager.History.pop();

    // set cover page as the current page
    TestShell.PageManager.setCurrent(coverPage);
    TestShell.Navigation.requestPage();
};

// Are all the groups that we have got so far completed.
// NOTE: You can also filter for only enabled (visible) groups.
// NOTE: You can also filter for only visited groups.
TestShell.PageManager.isCompleted = function(onlyEnabled, onlyVisited) {
    
    var groups = this.getGroups(onlyEnabled);

    // look for group that is not completed
    var notCompletedGroup = Util.Array.find(groups, function(group) {
        // if only visited is true then skip groups that the student hasn't seen
        if (onlyVisited && !group.isVisited()) {
            return false;
        }

        // check if the group is completed
        return (!group.isCompleted());
    });

    return (notCompletedGroup == null);
};

/**********************************************************************************/

TestShell.PageManager.History = new Util.Structs.Stack();

/**********************************************************************************/

// subscribe to any new groups that are coming back from the response manager xhr calls
TestShell.ResponseManager.Events.onGroups.subscribe(function(groups) {
    TestShell.PageManager.addGroups(groups);
});

TestShell.PageManager.getAccommodations = function(page) {
    
    if (page == null) {
        return null;
    }

    // check if page is content
    if (page instanceof TestShell.PageContent) {
        // get content manager page
        var contentPage = page.getContentPage();
        if (contentPage) {
            return contentPage.getAccommodations();
        }
    } else {
        // get page segment
        var pageSegment = (typeof(page.getSegment) == 'function') ? page.getSegment() : null;
        if (pageSegment) {
            return Accommodations.Manager.get(pageSegment.getId());
        }
    }

    // get default
    return Accommodations.Manager.getCurrent();
};

TestShell.PageManager.updateAccommodations = function(currentPage) {
    // get the previous page we visited
    var previousPage = TestShell.PageManager.History.peek();

    var currentAccs = TestShell.PageManager.getAccommodations(currentPage);
    var previousAccs = TestShell.PageManager.getAccommodations(previousPage);

    // check if accommodations have changed
    if (currentAccs == previousAccs) {
        return;
    }

    // remove and set accommodations
    Accommodations.Manager.updateCSS(document.body, currentAccs.getId());
};

// Listen for when page group is shown (testshell).
// NOTE: This is fired in a timer within content manager.
TestShell.PageManager.Events.subscribe('onShow', function(page) {
    
    // start auto save
    TestShell.autoSaveStart();

    // update page accommodations css
    TestShell.PageManager.updateAccommodations(page);

    // get navigation div (classic = 'foot', modern = 'navigation)
    var navEl = YUD.get('foot') || YUD.get('navigation');
    var isPageContent = (page instanceof TestShell.PageContent);

    // check if navigation exists
    if (navEl) {
        // remove existing footer class (clear on show instead of hide.. bug #24422)
        navEl.className = '';

        // set if real content page (otherwise it is something like segment review)
        YUD.addClass(navEl, isPageContent ? 'Content_Yes' : 'Content_No');
    }

    // check if page is content
    if (isPageContent) {

        var contentPage = page.getContentPage();

        if (contentPage) {

            // show sound cue and play start audio queue
            page.showSoundCue();
            contentPage.autoPlayQueue.start();

            // set footer class
            if (navEl) {

                // add layout (TODO: can we remove this?)
                YUD.addClass(navEl, 'Layout_' + contentPage.layout);
                
                // check if passage is available
                var contentPassage = contentPage.getPassage();
                if (contentPassage && !contentPassage.isEmpty()) {
                    YUD.addClass(navEl, 'Passage_Yes');
                } else {
                    YUD.addClass(navEl, 'Passage_No');
                }
            }
        }
    }

    // show save button?
    TestShell.UI.showSave(page);

    // show/hide the dropdown navigation
    var navContainer = YUD.get('navigationContainer');

    if (navContainer != null) {
        if (page.hasLabel()) {
            YUD.setStyle(navContainer, 'display', 'block');
        } else {
            YUD.setStyle(navContainer, 'display', 'none');
        }
    }

    // NOTE: the show event might have a focus event, so this needs to be last
    setTimeout(function() {
        // if this is a content page and ARIA is enabled then focus on the content div
        if (isPageContent && ContentManager.enableARIA) {
            // set text to speak for JAWS
            var screenReaderText = page.getScreenReaderText();
            if (screenReaderText) {
                TDS.ARIA.setStatus(screenReaderText);
            }
        } else {
            // BUG #22684: Focus stays on NEXT button
            var contentPage = ContentManager.getCurrentPage();
            if (contentPage) {
                Util.Dom.focus(contentPage.getWin());
            }

            // fixes shortcuts not working after moving to a new page in Mac OS X
            // NOTE: Can sometimes throw exception: "Component returned failure code: 0x80004005 (NS_ERROR_FAILURE) [nsIDOMWindowInternal.focus]"
            if (Util.Browser.isMac()) {
                // BUG #33714: if you focus on window in SB for linux then textboxes can't get focus
                Util.Dom.focus(top);
            }
        }

    }, 1);
});

// listen for when page group is hidden (testshell)
TestShell.PageManager.Events.subscribe('onHide', function(page) {
    // check if page is content
    if (page instanceof TestShell.PageContent) {
        // hide sound cue icon
        page.hideSoundCue();
    }
});