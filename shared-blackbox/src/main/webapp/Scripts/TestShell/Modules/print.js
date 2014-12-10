/*
Code used for printing items and passages.
*/

(function(TS) {

    function createCallback() {

        var callback = {
            success: function (xhrObj) {
                if (TS.Config.requestInterfaceTimeout > 0) {
                    TS.idleTimer.waitMins = TS.Config.requestInterfaceTimeout;
                    TS.idleTimer.reset();
                }
            },

            failure: function (xhrObj) {
                TS.UI.showError(Messages.get('TDSShellUIJS.Label.PrintRequestFailed'));
            },

            timeout: 30000
        };

        return callback;
    };
    
    // get accommodations string used for request parameters
    function getAccsStr() {
        var contentPage = ContentManager.getCurrentPage();
        var accProps = contentPage.getAccommodationProperties();

        // get acc codes
        var printSize = contentPage.getZoom().getCSS(); // print size
        var fontType = accProps.getFontType();
        var fontSize = accProps.getFontSize();

        var params = [];
        params.push('Print Size:' + printSize);
        params.push('Font Type:' + fontType);
        params.push('Font Size:' + fontSize);
        return params.join(';');
    };
    
    function getXhrUrl() {
        var urlBuilder = [];
        urlBuilder.push(TDS.baseUrl);
        urlBuilder.push('Pages/API/TestShell.axd/');
        return urlBuilder.join('');
    };

    // call when passage printing has completed
    function onPassagePrinted(page) {

        console.log('TestShell: onPassagePrinted page=' + page.pageNum);

        // make sure this is the accessible layout
        var contentPage = page.getContentPage();
        if (contentPage.layout != 'WAI') return;

        var pagePassage = contentPage.getPassage();
        var passageElement = pagePassage.getElement();

        // try and get item status
        var status = Util.Dom.getElementByClassName('status', 'div', passageElement);

        // create item status if it doesn't exist
        if (status == null) {
            // create status div and unordered list
            status = HTML.DIV({ className: 'status' });

            // add aria
            status.setAttribute('role', 'status');
            status.setAttribute('aria-atomic', 'false');
            status.setAttribute('aria-relevant', 'additions text');
            status.setAttribute('aria-live', 'assertive');

            // add status div right after the passage element div
            YUD.insertBefore(status, YUD.getFirstChild(passageElement));
        }

        // add status message to list
        // status.appendChild(HTML.DIV(null, 'Print request submitted'));
        status.innerHTML = 'Print request submitted';
    };

    // call when item printing has completed
    function onItemPrinted(page, position) {

        console.log('TestShell: onItemPrinted position=' + position);

        // get item
        var item = page.getResponse(position);
        if (!item) return;

        // get item content
        var contentItem = item.getContentItem();
        if (!contentItem) return;

        // get print plugin
        var printPlugin = contentItem.plugins.get('item.print');
        if (!printPlugin || !printPlugin.element) return;

        YUD.addClass(printPlugin.element, 'printSubmitted');
        // set delay on writing label so this doesn't get spoken when clicking on link
        setTimeout(function () {
            printPlugin.element.setAttribute('aria-label', 'This question has been submitted for printing.');
        }, 0);
    };

    // main function for printing
    function print(type, position) {
        
        // create base url
        var url = getXhrUrl() + 'print?';

        // get current page group
        var page = TS.PageManager.getCurrent();

        // create url parameters
        var urlParams = [];
        urlParams.push('type=' + type);
        urlParams.push('page=' + page.pageNum);
        urlParams.push('pageKey=' + page.pageKey);

        if (position > 0) {
            urlParams.push('position=' + position);
        }

        // get request params (accs and other)
        urlParams.push('params=' + getAccsStr());

        // set braille info
        var contentPage = page.getContentPage();
        var accProps = contentPage.getAccommodationProperties();
        urlParams.push('brailleEnabled=' + accProps.hasBraille());
        urlParams.push('brailleType=' + (accProps.getBrailleType() || ''));

        url += urlParams.join('&');

        YUC.asyncRequest('POST', url, createCallback());
        TS.UI.showAlert(
            Messages.get('TDSShellUIJS.Label.Notice'),
            Messages.get('Print'));

        if (type == 'item') {
            onItemPrinted(page, position);
        } else if (type == 'passage') {
            onPassagePrinted(page);
        } else if (type == 'page') {
            
        }

    }

    function printPage() {
        print('page');
    }

    // print the current passage
    function printPassage() {
        print('passage');
    };

    // print item position
    function printItem(position) {

        // dig all the way into the item and see if it is a compound layout
        var item = TS.PageManager.getResponse(position);
        if (item) {
            var contentItem = item.getContentItem();
            if (contentItem) {
                var contentPage = contentItem.getPage();
                if (contentPage) {
                    var compoundEl = contentPage.getCompoundElement();
                    if (compoundEl) {
                        printPage();
                        return;
                    }
                }
            }
        }

        print('item', position);
    };

    // item print
    window.tdsItemPrint = function(position) {
        var response = TS.PageManager.getResponse(position);
        if (response.isDirty()) {
            TS.UI.showAlert(
                Messages.get('TDSShellObjectsJS.Label.Warning'),
                Messages.get('TDSShellObjectsJS.Label.SaveBeforePrint'));
        } else {
            printItem(position);
        }
    };

    // passage print (TODO: get rid of this)
    window.tdsPassagePrint = function() {
        printPassage();
    };

    window.tdsPagePrint = function() {
        printPage();
    };

    // passage/page print
    function load() {
        TS.UI.addClick('btnPrint', function () { 
            printPassage();
        });
        TS.UI.addClick('btnPagePrint', function () {
            printPage();
        });
    }

    TS.registerModule({
        name: 'print',
        load: load
    });

    // for auto emboss we need to call item complete so it can add aria label to the print link
    ContentManager.onItemEvent('available', function (contentPage, item) {
        var page = TS.PageManager.get(contentPage.id);
        if (page instanceof TS.PageGroup && item.printed) {
            onItemPrinted(page, item.position);
        }
    });

    // for auto emboss we need to call passage complete so it can add status to the page
    ContentManager.onPassageEvent('available', function (contentPage, passage) {
        var page = TS.PageManager.get(contentPage.id);
        if (page instanceof TS.PageGroup && passage.printed) {
            onPassagePrinted(page);
        }
    });

})(TestShell);
