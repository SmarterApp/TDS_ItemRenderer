//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
﻿TestShell.CoverPages = 
{
    _collection: new Util.Structs.Map()    
};

TestShell.CoverPages.add = function(coverPage)
{
    this._collection.set(coverPage.id, coverPage);
};

TestShell.CoverPages.list = function()
{
    return this._collection.getValues();
};

TestShell.CoverPages.contains = function(id)
{
    return this._collection.containsKey(id);
};

TestShell.CoverPages.get = function(id)
{
    return this._collection.get(id);
};

/******************************************************************/

// check if the content page that was just finished initializing has a cover page
// NOTE: we need to use 'rendering' event because in 'init' items aren't ready
ContentManager.onPageEvent('rendering', function(contentPage)
{
    // get the test shell page group
    var page = TestShell.PageManager.get(contentPage.id);
    if (!(page instanceof TestShell.PageGroup)) return;

    // get cover page info for the page
    var cpInfo = page.getCoverPageInfo();
    if (cpInfo == null) return;

    // check if cover pages is explicitly disabled (by default Jeremy/Jon want it enabled)
    var accs = Accommodations.Manager.getDefault();
    var accType = accs.getType('Cover Pages');
    if (accType && accType.isSelected('TDS_CP0')) {
        return;
    }

    // check if we have already created the cover page
    var coverPage = TestShell.CoverPages.get(cpInfo.id);

    // create cover page
    if (coverPage == null)
    {
        // TODO: add preloading of cover pages
        coverPage = new TestShell.PageResource(cpInfo.bankKey, cpInfo.itemKey, contentPage.segmentID);
        coverPage.getPageTitle = function() { //set page title to generic "Cover Page", since no pageNum assigned by ITS
            return "Cover Page";
        };
        
        TestShell.CoverPages.add(coverPage); // add to collection
    }

    // NOTE: we can't insert the cover pages into page manager 
    // here because we won't know if we also need to switch to 
    // them due to how the user was performing navigation
    // (we can do this better in 'beforeShow')
});

// right before showing a page check if we need to instead show a cover page
ContentManager.onPageEvent('beforeShow', function(contentPage)
{
    // get the page and make sure it is only a PageGroup
    var currentPage = TestShell.PageManager.get(contentPage.id);
    if (!(currentPage instanceof TestShell.PageGroup)) return true;

    // get the cover page
    var currentCoverPage = currentPage.getCoverPage();
    if (currentCoverPage == null) return true;

    // check if the page manager already knows about the cover page
    if (TestShell.PageManager.contains(currentCoverPage)) return true;

    // check the different use cases to see if we should inject cover page
    var navState = TestShell.Navigation.getState();

    // if we are on the first page then always add cover page
    if (currentPage == TestShell.PageManager.getFirst())
    {
        TestShell.PageManager.insertPage(currentCoverPage, currentPage);
    }

    // CASE 1: When loading the test shell if the page has never 
    // been visited and we are not reviewing then go back one
    if (navState == TestShell.Navigation.State.Initializing)
    {
        var isReviewing = (TestShell.Config.reviewPage > 0);

        // check if we can move backwards
        if (!isReviewing && currentPage.getPrevious() != null && !currentPage.isVisited())
        {
            // move back one page (which will either be a cover page or last responded page)
            TestShell.Navigation._backInternal();
            
            // remove the fact we moved backwards from history 
            // (kind of hacky way of fixing accommodations not getting set)
            TestShell.PageManager.History.pop();

            // cancel showing current page (since we are now going to show cover page)
            return false; 
        }
    }

    // CASE 2: Student clicked on the next button
    if (navState == TestShell.Navigation.State.Next)
    {
        var previousPage = currentPage.getPrevious();
        var previousCoverPage = previousPage.getCoverPage();

        // check if the previous page does not have a cover page or it is different than the current page
        if (previousCoverPage == null ||
            previousCoverPage != currentCoverPage)
        {
            TestShell.PageManager.insertPage(currentCoverPage, currentPage);
            TestShell.PageManager.swapCurrent(currentCoverPage);

            // cancel showing current page (since we are now going to show cover page)
            return false;
        }
    }

    // CASE 3: Student clicked on the back button
    if (navState == TestShell.Navigation.State.Back)
    {
        var nextPage = currentPage.getNext();
        var nextCoverPage = nextPage.getCoverPage();

        // check if the next page has a cover page and it is different than the current page
        if (nextCoverPage != null &&
            nextCoverPage != currentCoverPage)
        {
            TestShell.PageManager.insertPage(nextCoverPage, nextPage);
            TestShell.PageManager.swapCurrent(nextCoverPage);

            // cancel showing current page (since we are now going to show cover page)
            return false;
        }
    }

    return true;

}, true);