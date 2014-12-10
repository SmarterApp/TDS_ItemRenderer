/*
This code is used to add pagination to item groups.
*/

(function (CM) {

    var CSS_WIDGET = 'multi-page'; // widget <ul> container
    var CSS_ITEMACTIVE = 'page-active'; // widget <li> when active
    var CSS_ITEMANSWERED = 'page-answered'; // widget <li> when answered

    // collection of pages we have paginated
    var paginatedPages = [];

    // get tab element for an item
    function getTabEl(item) {
        return document.getElementById('itemTab-' + item.position);
    }

    // create a single tab html for the widget
    function createTabEl(item) {
        var itemTabEl = document.createElement('li');
        itemTabEl.setAttribute('id', 'itemTab-' + item.position);
        var itemLinkEl = document.createElement('a');
        itemLinkEl.setAttribute('href', '#');
        itemLinkEl.setAttribute('tabindex', '0');
        var tabData = { item: item };
        $(itemLinkEl).on('click', tabData, onTabClick);
        $(itemLinkEl).text(item.position);
        itemTabEl.appendChild(itemLinkEl);
        return itemTabEl;
    }

    // create the widget html
    function createWidgetEl(items) {
        var containerEl = document.createElement('ul');
        containerEl.className = CSS_WIDGET;
        items.forEach(function(item) {
            var itemTabEl = createTabEl(item);
            containerEl.appendChild(itemTabEl);
        });
        return containerEl;
    }

    // this is fired when someone clicks on a tab
    function onTabClick(evt) {
        var item = evt.data.item;
        item.setActive();
    }

    // this is called when we want to update a tab to show if response has been updated
    function updateItemAnswered(item) {
        // set tab answer style
        var tabEl = getTabEl(item);
        var response = item.getResponse();
        if (response && response.isValid) {
            YUD.addClass(tabEl, CSS_ITEMANSWERED);
        } else {
            YUD.removeClass(tabEl, CSS_ITEMANSWERED);
        }
    }

    // check if a page can be paginated
    function allowPagination(page) {

        // check if accessibility shell
        if (ContentManager.isAccessibilityEnabled()) {
            return false;
        }

        // ignore compound layouts
        var compoundEl = page.getCompoundElement();
        if (compoundEl) {
            return false;
        }

        // make sure we have a passage and an item
        var passage = page.getPassage();
        var items = page.getItems();
        if (passage == null || items.length < 2) {
            return false;
        }

        // make sure pagination acc is enabled
        var accProps = page.getAccommodationProperties();
        if (accProps == null || !accProps.isPaginatedItemGroupsEnabled()) {
            return false;
        }

        return true;
    }

    // check if a page was already paginated
    /*function isPaginated(page) {
        return (paginatedPages.length > 0 &&
                paginatedPages.indexOf(page) != -1);
    }*/

    
    function match(page) {
        return allowPagination(page);
    }

    function Plugin_Paginate(page) {
        this.delay = true;
        this.lastTab = null;
    }

    CM.registerPagePlugin('pagination', Plugin_Paginate, match);

    // get the items that should be placed in the tab
    Plugin_Paginate.prototype.getTabableItems = function () {

        var page = this.page;
        var items = page.getItems();

        // HACK: if we are using simulator layout then get all items but the simulator
        // NOTE: PageLayout.cs RenderSingleMultiItems() for more info
        if (page.layout == '28' ||
            page.layout == '29') {
            items = items.filter(function (item) {
                return item.format.toUpperCase() != 'SIM';
            });
        }

        return items;
    }

    Plugin_Paginate.prototype.showItem = function (item) {

        // show item
        item.show();
        var tabEl = getTabEl(item);
        YUD.addClass(tabEl, CSS_ITEMACTIVE);

        // scroll back to top
        var scrollEl = this.page.getScrollableElement();
        if (scrollEl) {
            scrollEl.scrollTop = 0;
            scrollEl.scrollLeft = 0;
        }
    }

    Plugin_Paginate.prototype.hideItem = function (item) {
        item.hide();
        var tabEl = getTabEl(item);
        YUD.removeClass(tabEl, CSS_ITEMACTIVE);
        updateItemAnswered(item);
    }

    // figure out what item is showing or hiding based on the focus event
    Plugin_Paginate.prototype.onFocusItem = function(focusItem) {

        // check if focused item one that is paginated
        var tabableItems = this.getTabableItems();
        if (tabableItems.indexOf(focusItem) == -1) return;

        // show/hide items
        tabableItems.forEach(function (item) {
            if (item == focusItem) {
                this.showItem(item);
            } else {
                this.hideItem(item);
            }
        }.bind(this));
    };

    // Wait for the page "loaded" event before processing pagination or we get errors (delay=true)
    Plugin_Paginate.prototype.load = function () {

        var page = this.page;
        var tabableItems = this.getTabableItems(); // <-- tabable items

        // BUG: item.EBSR does not exist (Utah_PT: Reading 6-8)
        /*items.forEach(function (item) {
            updateItemAnswered(item);
        });*/

        // create widget
        var widgetEl = createWidgetEl(tabableItems);

        // add widget right before the first item <div class="itemContainer">
        $(page.getPassage().getElement()).parent().prepend(widgetEl);

        // listen for when each tabable item gets focus
        tabableItems.forEach(function (item) {
            item.on('focus', this.onFocusItem.bind(this, item));
        }.bind(this));
    }

    // start off by showing all the non-tabable items
    Plugin_Paginate.prototype.getEntitiesToShow = function() {
        var page = this.page;
        var entities = page.getEntities();
        var tabableItems = this.getTabableItems();
        return entities.filter(function (entity) {
            // check if passage is empty
            if (entity instanceof ContentPassage && entity.isEmpty()) {
                return false;
            }
            // only show this if it is not tabable
            return (tabableItems.indexOf(entity) == -1);
        });
    };

    // figure out the what the first tab to focus on should be (which will also show the item)
    Plugin_Paginate.prototype.getEntityForFocus = function () {
        var page = this.page;
        var tabableItems = this.getTabableItems();
        var lastActive = page.getLastActive();
        if (tabableItems.indexOf(lastActive) != -1) {
            return lastActive;
        } else {
            return tabableItems[0];
        }
    };
    
    function requestPage(direction, page, verify) {

        // check for pagination
        var pagination = page.plugins.get('pagination');
        if (!pagination) return true;

        // create iterator with tabable items
        var tabableItems = pagination.getTabableItems();
        var iterator = Util.Iterator(tabableItems, { limits: true, pit: true });
        var currentItem = Util.Array.find(tabableItems, function(item) {
            return item.isShowing();
        });
        iterator.jumpTo(currentItem);

        // set focus on next item
        var nextItem = (direction == 'next') ? iterator.next() : iterator.prev();
        if (nextItem) {
            if (verify) {
                // if we are just verifying then deny request
                return false;
            } else {
                // if we were able to go to the next item then deny request
                if (nextItem.setActive()) {
                    return false;
                }
            }
        }

        return true; // allow request
    }

    CM.on('requestNextPage', requestPage.bind(null, 'next'));
    CM.on('requestPreviousPage', requestPage.bind(null, 'back'));

})(ContentManager);