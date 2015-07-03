//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
/*
Code for supporting manual prefetch.
*/

TestShell.Prefetch = (function (TS) {

    var RM = window.TestShell.ResponseManager;
    var PM = window.TestShell.PageManager;

    // create a hard coded item for triggering prefetch
    var item = new TS.Item(null);
    item.id = 'prefetch'; // TODO: For Summer 2015 read the item id in C#

    // ItemID property on the server will be "-123456789-987654321"
    item.bankKey = -123456789;
    item.itemKey = 987654321;

    // prefetch request count (gets changed on every request)
    item.position = 0;

    // allow manual prefetch (mostly for debugging)
    function setSupported() {
        TDS.Student.Storage.setAccCode('Prefetch Item Rules', 'TDS_PIR_Any');
    }

    // check if manual prefetch is supported
    function isSupported() {
        var accProps = Accommodations.Manager.getDefaultProps();
        return accProps.prefetchAnyItem();
    }

    // request manual prefetch 
    function request(count) {
        item.position = count || 1;
        RM.sendResponse(item);
    }

    // if a new group gets prefetched then remove any manual prefetch requests
    RM.Events.onGroups.subscribe(function () {
        if (isSupported()) {
            RM.removePendingResponse(item);
            RM.removeOutgoingResponse(item);
        }
    });

    // check if the test finished but we were waiting on prefetch
    RM.Events.onSuccess.subscribe(function (results) {
        // check if test length is met and we have no page being displayed
        // TODO: Should we look at non-prefetch students as well? not getting groups back while not on a page is bad
        if (isSupported() && TS.testLengthMet && results.groups.length == 0 && TS.PageManager.getCurrent() == null) {
            // check if the outgoing responses had a prefetch request
            var hadPrefetchRequest = Util.Array.find(results.updates, function (update) {
                return update.position == -1;
            }) != null;
            // if we were waiting on prefetch 
            if (hadPrefetchRequest) {
                var lastPage = TS.PageManager.getLast();
                TS.PageManager.setCurrent(lastPage);
                TS.Navigation.requestPage();
                TS.UI.showWarning(ErrorCodes.get('NextTestFinished'));
            }
        }
    });

    // get the current allowed prefetch item count
    function getCount() {
        var testInfo = TDS.Student.Storage.getTestInfo();
        if (testInfo) {
            return testInfo.prefetch;
        }
        return 0;
    }

    // get all the pages after the page passed in
    function getNextPages(page) {
        var pages = TestShell.PageManager.getPages();
        var pageIdx = pages.indexOf(page);
        var startIdx = pageIdx + 1;
        return pages.slice(startIdx);
    }
    
    // check if we can prefetch the content on the next page
    function check(page) {

        // if the test length is met then we can't do anything else
        if (TestShell.testLengthMet) {
            return;
        }

        // get the page to look ahead on
        page = page || PM.getCurrent();
        if (!page) {
            return;
        }

        // pages that we need to load content for
        var pagesToPrefetchContent = [];
        
        // get prefetch count 
        var prefetchRequired = getCount();

        // get all the pages after this one
        var nextPages = getNextPages(page);

        // check the next pages to see if we have enough items
        for (var i = 0; i < nextPages.length; i++) {

            var nextPage = nextPages[i];

            // check if the page has content to load
            if (nextPage instanceof TestShell.PageContent) {

                var prefetchMet = false;

                // check if the page is a group
                if (nextPage instanceof TestShell.PageGroup) {
                    // reduce the required items with the items on the next page
                    prefetchRequired -= nextPage.items.length;
                    // if we are under the prefetch required then prefetch is met
                    if (prefetchRequired <= 0) {
                        prefetchMet = true;
                    }
                }

                // make sure this page content is loaded (this includes cover pages)
                if (!TS.ContentLoader.isRequesting(nextPage)) {
                    var contentPage = nextPage.getContentPage();
                    if (!contentPage) {
                        pagesToPrefetchContent.push(nextPage);
                    }
                }

                // if prefetch is met then nothing left to do
                if (prefetchMet) {
                    break;
                }
            }
        }

        // check if we need to request any new items
        if (prefetchRequired > 0) {
            console.log('%cPrefetch Item Request: %s', 'background-color: #dfeff5', prefetchRequired);
            TS.Prefetch.request(prefetchRequired);
        }

        // check if we need to load any content
        if (pagesToPrefetchContent.length > 0) {
            var pageNums = pagesToPrefetchContent.map(function(page) {
                return page.pageNum || page.id;
            }).join(', ');
            console.log('%cPrefetch Page Content: %s', 'background-color: #dfeff5', pageNums);
            pagesToPrefetchContent.forEach(function (page) {
                page.requestContent();
            });
        }

    };

    // called when test shell is loaded
    function load() {
        // if manual prefetch is supported and prefetch count 
        // is higher than 0 then enable the new check algorithm 
        if (isSupported() && getCount() > 0) {
            // when we add a new group check if we should prefetch the next one
            RM.Events.onGroups.subscribe(function (groups) {
                check();
            });
            // when an item shows try and prefetch the next one
            PM.Events.subscribe('onShow', check);
        }
    }

    TS.registerModule({
        name: 'prefetch',
        load: load
    });

    // return a public api
    return {
        setSupported: setSupported,
        isSupported: isSupported,
        check: check,
        request: request
    };
})(window.TestShell);