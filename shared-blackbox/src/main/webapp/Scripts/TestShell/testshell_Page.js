//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
﻿/*
Abstract class for inheriting a test shell page from.
*/

TestShell.Page = function(id)
{
    this.id = id;
    this.zoom = null;
    this.navOption = null;
    this._visited = false;
};

TestShell.Page.prototype.isShowing = function()
{
    return (YUD.getStyle(this.container, 'display') == 'block');
};

TestShell.Page.prototype.show = function() { return true; };

TestShell.Page.prototype.hide = function() { return true; };

// if this returns true then we are currently on this page
TestShell.Page.prototype.isCurrent = function()
{
    return (this === TestShell.PageManager.getCurrent());
};

// If this is true then the user can see this page in the dropdown otherwise it is hidden.
TestShell.Page.prototype.isVisible = function() 
{
    // if we are currently on this page then it must be visible
    if (this.isCurrent()) return true;

    var pages = TestShell.PageManager.getPages();

    // check if all the pages before this page are completed
    for (var i = 0; i < pages.length; i++) {
        var page = pages[i];
        if (page == null) return false;
        if (this == page) return true;
        if (!page.isCompleted()) return false;
    }

    return false;
};

// If this is true then the user can go to this item otherwise it is not considered when pressing back/next.
// Also if this is false then the item looks disabled in the dropdown.
TestShell.Page.prototype.isEnabled = function() {
    if (this.isVisible() === false) { // if item isn't visible then it is disabled
        return false;
    } else {
        return true;
    }
};

// if this is true the page requires it to be visited even if optional
TestShell.Page.prototype.requiresVisit = function() {
    var segment = this.getSegment();
    if (segment) {
        var accProps = segment.getAccommodationProperties();
        return (accProps && accProps.requirePageVisit());
    }
    return false;
};

// set this page as explicitly being visited
TestShell.Page.prototype.setVisited = function() {
    this._visited = true;
};

// check if this page was set as being visited
TestShell.Page.prototype.isVisited = function() {

    // check if explicitly visited
    if (this._visited) return true;

    // check if implicitly visited by seeing if any pages after this one have been visited
    if (this.requiresVisit()) {
        var nextPages = this.getNextPages();
        for (var i = 0; i < nextPages.length; i++) {
            var page = nextPages[i];
            // check private property for if explicitly visited
            if (page._visited) {
                return true;
            }
        }
    }
    
    return false;
};

// Can we move next from this page?
TestShell.Page.prototype.isCompleted = function() {
    return true;
};

// get the label for the group.. return null if no group
TestShell.Page.prototype.getLabelGroup = function() {
    return null;
};

// get the label to show in the naivgation dropdown
TestShell.Page.prototype.getLabel = function() {
    return 'Page ' + this.id;
};

// check if this page has a label
TestShell.Page.prototype.hasLabel = function()
{
    var label = this.getLabel();
    return (label != null);
};

// get the label to show when the user tries to leave the page 
// but there is a task to perform or items required on the page
TestShell.Page.prototype.getUnansweredLabel = function () {
    // TODO: Implement this different in other page classes (e.x., PageReview)
    return ErrorCodes.get('NextUnanswered');
};

// update the navigation dropdown label
TestShell.Page.prototype.updateNavigationLabel = function(refPage)
{
    // check if this page has a label
    if (!this.hasLabel()) return;

    var labelGroup = this.getLabelGroup(); // id/label object
    var labelText = this.getLabel(true); // text string
    
    // if there is no existing <option> then create one
    if (this.navOption == null)
    {
        var navDropdown = YUD.get('ddlNavigation');
        var navGroup = null;

        // first check if this option has a label
        if (YAHOO.lang.isObject(labelGroup))
        {
            var navGroups = navDropdown.getElementsByTagName('optgroup');

            // check for existing group label
            if (labelGroup.id)
            {
                // find option group by ID
                navGroup = document.getElementById(labelGroup.id);
            }
            else
            {
                // find option group by label
                navGroup = YAHOO.Array.filter(navGroups, function(existingNavGroup)
                {
                    return (labelGroup == existingNavGroup.label);
                });
            }

            // create new group label if none was found
            if (navGroup == null)
            {
                // create option group
                navGroup = HTML.OPTGROUP({ id: labelGroup.id, label: labelGroup.label });
                
                if (refPage) YUD.insertBefore(navGroup, refPage.navOption);
                else navDropdown.appendChild(navGroup);
            }
        }
        else
        {
            // use the dropdown itself as the grouping for options
            navGroup = navDropdown;
        }

        // create option
        this.navOption = HTML.OPTION({ value: this.id });
        
        if (refPage) {
            YUD.insertBefore(this.navOption, refPage.navOption);
        } else if (navGroup) {
            navGroup.appendChild(this.navOption);
        }
    }

    // set label for the <option>
    this.navOption.text = labelText;

    // check if <option> is enabled
    if (this.isEnabled())
    {
        this.navOption.disabled = false;
        YUD.removeClass(this.navOption, 'disabled');
    }
    else
    {
        this.navOption.disabled = true;
        YUD.addClass(this.navOption, 'disabled');
    }

    // check if <option> is visible
    if (this.isVisible())
    {
        YUD.setStyle(this.navOption, 'display', '');
        YUD.setStyle(this.navOption, 'visibility', '');
        YUD.removeClass(this.navOption, 'hidden');
    }
    else
    {
        YUD.setStyle(this.navOption, 'display', 'none');
        YUD.setStyle(this.navOption, 'visibility', 'hidden');
        YUD.addClass(this.navOption, 'hidden');
    }
};

// has the page loaded its content?
// TODO: This function should be changed to something like isReady() and remove the idea it is about content
TestShell.Page.prototype.hasContent = function()
{
    return true;
};

// request the pages content to load
TestShell.Page.prototype.requestContent = function (reload) { }; // abstract

// get the page title based on type of page (i.e. content, coverpage, review)
TestShell.Page.prototype.getPageTitle = function () { // abstract
    return '';
};

// get the text to put on the page when the page is done loading
TestShell.Page.prototype.getScreenReaderText = function()
{
    return 'Page is ready';
};

// get the segment for this page
TestShell.Page.prototype.getSegment = function() { return null; }; // abstract

// get the cover page for this page
TestShell.Page.prototype.getCoverPage = function() { return null; }; // abstract

// get the next page
TestShell.Page.prototype.getNext = function()
{
    var pages = TestShell.PageManager.getPages(true);
    var idx = pages.indexOf(this);
    return (idx != -1) ? pages[idx + 1] : null;
};

// get the previous page
TestShell.Page.prototype.getPrevious = function()
{
    var pages = TestShell.PageManager.getPages(true);
    var idx = pages.indexOf(this);
    return (idx != -1) ? pages[idx - 1] : null;
};

// get all the pages after this
TestShell.Page.prototype.getNextPages = function(enabled) {
    var pagesAfter = [];
    var pages = TestShell.PageManager.getPages(enabled);
    var idx = pages.indexOf(this);
    if (idx != -1) {
        for (var i = idx + 1; i < pages.length; i++) {
            pagesAfter.push(pages[i]);
        }
    }
    return pagesAfter;
};

// get all the pages before this
TestShell.Page.prototype.getPreviousPages = function(enabled) {
    var pagesBefore = [];
    var pages = TestShell.PageManager.getPages(enabled);
    var idx = pages.indexOf(this);
    if (idx != -1) {
        for (var i = 0; i < idx; i++) {
            pagesBefore.push(pages[i]);
        }
    }
    return pagesBefore;
};

TestShell.Page.prototype.toString = function() { return this.id; };

function getGroupIDs(groups) {
    return Util.Array.reduce(groups, '', function(text, group) {
        return text + ((text.length == 0) ? '' : ', ') + group.id;
    });
}

