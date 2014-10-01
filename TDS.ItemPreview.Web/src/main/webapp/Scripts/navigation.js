/*
 * This code is used to support the development page that hosts the blackbox
 */

ItemPreview.Navigation = { };

ItemPreview.Navigation._currentIter = null;

// get the iterator used for navigation
ItemPreview.Navigation.getIterator = function() { return this._currentIter; };

// gets the current page
ItemPreview.Navigation.getCurrentPage = function()
{
    return this._currentIter.current();
};

// call this function when you want to show the current config page set in the iterator
ItemPreview.Navigation.showCurrentPage = function()
{
    var configPage = this.getCurrentPage();
    if (configPage == null) return false;

    // show/hide buttons
    Blackbox.enableButton('btnBack', !this.isFirstPage());
    Blackbox.enableButton('btnNext', !this.isLastPage());

    // set dropdown
    var ddlNavigation = document.getElementById('ddlNavigation');
    if (ddlNavigation != null) ddlNavigation.value = configPage.id;
   
    // set page options
    configPage.layoutName = ItemPreview.getCustomLayoutName();

    // load page
    ItemPreview.Navigation.savePageId(configPage);
    Blackbox.loadContent(configPage);
    return true;
};

ItemPreview.Navigation.reloadPage = function() {
    var configPage = this.getCurrentPage();
    Blackbox.loadContent(configPage, true);
}

// get a config page by id string
ItemPreview.Navigation.getPageById = function(pageId)
{
    var config = ItemPreview.getConfig();

    for (var i = 0; i < config.pages.length; i++) 
    {
        var configPage = config.pages[i];
        if (configPage.id == pageId) return configPage;
    }

    return null;
};

// go to a specific config page object
ItemPreview.Navigation.goToPage = function(configPage)
{
    // check if already viewing page
    if (configPage == null) return false;
    if (configPage == this.getCurrentPage()) return false;

    // jump to page
    return this._currentIter.jumpTo(configPage) ? this.showCurrentPage() : false;
};

// go to a specific config page id
ItemPreview.Navigation.goToPageId = function(pageId)
{
    return this.goToPage(this.getPageById(pageId));
};

// try and go to the saved page in the cookie
ItemPreview.Navigation.goToSavedPage = function()
{
    var savedPageId = ItemPreview.Navigation.getSavedPageId();
    return (savedPageId && ItemPreview.Navigation.goToPageId(savedPageId));
};

ItemPreview.Navigation.goToFirstPage = function()
{
    return this._currentIter.reset() ? this.showCurrentPage() : false;
};

ItemPreview.Navigation.goToLastPage = function()
{
    return this._currentIter.end() ? this.showCurrentPage() : false;
};

ItemPreview.Navigation.goToNextPage = function()
{
    return this._currentIter.next() ? this.showCurrentPage() : false;
};

ItemPreview.Navigation.goToPreviousPage = function()
{
    return this._currentIter.prev() ? this.showCurrentPage() : false;
};

ItemPreview.Navigation.isFirstPage = function()
{
    var currentConfig = ItemPreview.getConfig();
    return (currentConfig.pages[0] == this.getCurrentPage());
};

ItemPreview.Navigation.isLastPage = function()
{
    var currentConfig = ItemPreview.getConfig();
    return (currentConfig.pages[currentConfig.pages.length - 1] == this.getCurrentPage());
};

/*******************************************************/

ItemPreview.Navigation.savePageId = function(configPage)
{
    YAHOO.util.Cookie.set('page', configPage.id);
};

ItemPreview.Navigation.getSavedPageId = function()
{
    return YAHOO.util.Cookie.get('page');
};

ItemPreview.Navigation.bindEvents = function()
{
    var btnNextEl = BlackboxDoc.getElementById('btnNext');
    YAHOO.util.Event.on(btnNextEl, 'click', ItemPreview.Navigation.goToNextPage, ItemPreview.Navigation, true);

    var btnPrevEl = BlackboxDoc.getElementById('btnBack');
    YAHOO.util.Event.on(btnPrevEl, 'click', ItemPreview.Navigation.goToPreviousPage, ItemPreview.Navigation, true);
    
    var ddlNavigation = document.getElementById('ddlNavigation');
    YAHOO.util.Event.on(ddlNavigation, 'change', function(evt)
    {
        var configPage = ItemPreview.Navigation.getPageById(ddlNavigation.value);
        ItemPreview.Navigation.goToPage(configPage);
    });

};
