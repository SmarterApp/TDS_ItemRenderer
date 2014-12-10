/* Init */

(function(CM) {

    var Renderer = CM.Renderer;

    function Page(pages, renderer, pageID, segmentID, layoutName) {

        Util.Assert.isInstanceOf(CM.Pages, pages);
        Util.Assert.isInstanceOf(Renderer, renderer);
        Util.Assert.isString(pageID);
        Util.Assert.isString(segmentID);
        Util.Assert.isString(layoutName);

        this.id = pageID;
        this.segmentID = segmentID;
        this.layout = layoutName; // layout name

        this._pages = pages; // parent pages collection
        this._renderer = renderer;
        this.soundCue = null;
        this.autoPlayQueue = TDS.Audio.Player.createQueue();

        this._container = null;
        this._doc = null;

        this._passage = null;
        this._items = [];
        this._itemHash = {};
        this._activeEntity = null; // the focused entity
        this._lastEntity = null; // last entity that was shown for this page
        
        this._enableScroll = true;

        // last used zoom factor for this page
        this.zoomFactor = 0;

        // plugins collection
        this.plugins = new CM.Plugins();

        Util.Event.Emitter(this);

        this.init();
    };

    // Get the pages collection that this page is part of.
    Page.prototype.getParent = function() {
        return this._pages;
    }

    // this gets called when the html has been rendered into the dom
    Page.prototype.onAvailable = function () {
        this.getEntities().forEach(function (entity) {
            var entityEl = entity.getElement();
            if (entityEl) {
                // hide html
                Renderer.hide(entityEl);
                // add mouse events
                ContentManager.addMouseEvents(entity, entityEl);
            } else {
                console.warn('On available can\'t hide entity element.', entity);
            }
        });
    }

    // this gets called when the html and resources are loaded
    Page.prototype.onLoaded = function () {
        this.getEntities().forEach(function (entity) {
            // add class if the content is empty
            if (!entity.getText()) {
                $(entity.getElement()).addClass('contentEmpty');
            }
        });
    }

    // this is called for each change of the renderer status
    Page.prototype.onStatusChange = function(status) {
        var funcName = 'on' + Util.String.capitalize(status);
        if (typeof this[funcName] == 'function') {
            this[funcName]();
        }
        this.fire(status);
        this.getEntities().forEach(function(entity) {
            entity.fire(status);
        });
    }

    Page.prototype.init = function() {
        // add renderer listeners
        var stateNames = Renderer.getStateNames();
        stateNames.forEach(function pageEvent(status) {
            this._renderer.once(status, this.onStatusChange.bind(this, status));
        }.bind(this));
    }

    Page.prototype.getRenderer = function() {
        return this._renderer;
    }
    
    // gets the container for the page, this is what we hide/show
    Page.prototype.getContainer = function () {
        return this._container;
    };

    // get pages document element
    Page.prototype.getDoc = function () {
        return document;
    };

    // get the pages current active components document
    Page.prototype.getActiveDoc = function () {

        // get current entity (item or passage)
        var activeEntity = this.getActiveEntity();

        if (activeEntity != null) {
            // get current component of entity
            var activeComponent = activeEntity.getActiveComponent();

            // check if component has a getDoc() function
            if (activeComponent != null && YAHOO.lang.isFunction(activeComponent.getDoc)) {
                return activeComponent.getDoc();
            }
        }

        return this.getDoc();
    };

    // get pages body element
    Page.prototype.getBody = function () {
        var doc = this.getDoc();
        return doc ? doc.body : null;
    };
    
    // get the pages current window
    Page.prototype.getWin = function () {
        var doc = this.getDoc();
        return doc ? (doc.parentWindow || doc.defaultView) : null;
    };

    // get the pages current active components window
    Page.prototype.getActiveWin = function () {
        // get current entity (item or passage)
        var activeEntity = this.getActiveEntity();

        if (activeEntity != null) {
            // get current component of entity
            var activeComponent = activeEntity.getActiveComponent();

            // check if component has a getWin() function
            if (activeComponent != null && YAHOO.lang.isFunction(activeComponent.getWin)) {
                return activeComponent.getWin();
            }
        }

        // return pages window
        return this.getWin();
    };

    // get the pages iframe container (<iframe> element) if there is one
    Page.prototype.getFrameElement = function () {
        var win = this.getWin();
        return win ? win.frameElement : null;
    };

    // get the container element for this page
    Page.prototype.getElement = function () {
        return document.getElementById('Page_' + this.id);
    };

    // get the compound element container
    Page.prototype.getCompoundElement = function () {

        var pageDoc = this.getDoc();
        var items = this.getItems();

        // we check if there is a compound container by looking for a div with 'compound_{firstPos}'
        if (pageDoc && items.length > 0) {
            var firstItem = items[0];
            return pageDoc.getElementById('compound_' + firstItem.position);
        }

        return null;
    };

    // get the first page header
    Page.prototype.getHeader = function () {
        var pageElement = this.getElement();
        var headers = pageElement.getElementsByTagName('h3');

        if (headers.length > 0) {
            return headers[0];
        }
        return null;
    };

    Page.prototype.getAccommodations = function () {
        return Accommodations.Manager.get(this.segmentID);
    };

    Page.prototype.getAccs = Page.prototype.getAccommodations;

    Page.prototype.getAccommodationProperties = function () {
        return Accommodations.Manager.getProperties(this.segmentID);
    };

    Page.prototype.getAccProps = Page.prototype.getAccommodationProperties;

    Page.prototype._fireBeforeZoom = function() {
        var level = this.getZoomFactor();
        return this.fire('beforeZoom', level);
    }

    Page.prototype._fireZoom = function () {
        var level = this.getZoomFactor();
        return this.fire('zoom', level);
    }

    Page.prototype.getZoom = function () {
        return CM.getZoom();
    };

    Page.prototype.getZoomFactor = function () {
        return CM.getZoomFactor();
    };

    Page.prototype.zoomIn = function () {
        var zoom = CM.getZoom();
        if (zoom && this._fireBeforeZoom() && zoom.zoomIn()) {
            this._fireZoom();
            return true;
        }
        return false;
    };

    Page.prototype.zoomOut = function () {
        var zoom = CM.getZoom();
        if (zoom && this._fireBeforeZoom() && zoom.zoomOut()) {
            this._fireZoom();
            return true;
        }
        return false;
    };

    // call this to refresh the zoom on the elements
    Page.prototype.updateElementsZoom = function () {
        var zoom = CM.getZoom();
        var factor = zoom.getFactor();
        if (zoom && factor != this.zoomFactor) {
            var pageEl = this.getElement();
            zoom.updateElements(pageEl);
        }
    };

    // set the passage from the frames its.passage object
    Page.prototype.setPassage = function (passage) {
        this._passage = passage;
    };

    // get the passage
    Page.prototype.getPassage = function (showing) {
        if (this._passage && showing && !this._passage.isShowing()) {
            // passage is not visible
            return null;
        }
        return this._passage;
    };

    // add a item from the frames its.items[] object
    Page.prototype.addItem = function (item) {
        this._items.push(item);
        this._itemHash[item.position] = item;
    };

    // get all the items on this page
    Page.prototype.getItems = function (showing) {
        if (showing) {
            return this._items.filter(function(item) {
                return item.isShowing();
            });
        } else {
            return this._items.slice(0);
        }
    };

    // get an item that matches this position
    Page.prototype.getItem = function (position) {
        return this._itemHash[position];
    };

    // get all items and passage in a single array
    Page.prototype.getEntities = function (showing) {
        var passage = this.getPassage(showing);
        var items = this.getItems(showing);
        if (passage) {
            return Util.Array.concat(passage, items);
        }
        return items;
    };

    // get the current focused entity
    Page.prototype.getActiveEntity = function () {
        return this._activeEntity;
    };

    // clears the current active entity
    Page.prototype.clearEntity = function () {

        var activeEntity = this.getActiveEntity();
        if (activeEntity == null) {
            return false;
        } // nothing active

        // clear active entity
        activeEntity.clearActive();
        return true;
    };

    // move to the previous entity
    Page.prototype.prevEntity = function () {
        var items = this.getItems(true);
        var currentEntity = this.getActiveEntity();

        // if there is nothing focused on or the focus is on the passage then return the first item
        if (currentEntity == null || currentEntity instanceof ContentPassage) {
            currentEntity = items[items.length - 1];
        } else {
            for (var i = 0; i < items.length; i++) {
                var item = items[i];

                if (currentEntity == item) {
                    currentEntity = items[i - 1] || this.getPassage(true) || items[items.length - 1];
                    break;
                }
            }
        }

        if (currentEntity) {
            currentEntity.setActive();
            return currentEntity;
        } else {
            return null;
        }
    };

    // move to the next entity
    Page.prototype.nextEntity = function () {
        var items = this.getItems(true);
        var currentEntity = this.getActiveEntity();

        // if there is nothing focused on or the focus is on the passage then return the first item
        if (currentEntity == null || currentEntity instanceof ContentPassage) {
            currentEntity = items[0];
        } else {
            for (var i = 0; i < items.length; i++) {
                var item = items[i];

                if (currentEntity == item) {
                    currentEntity = items[i + 1] || this.getPassage(true) || items[0];
                    break;
                }
            }
        }

        if (currentEntity) {
            currentEntity.setActive();
            return currentEntity;
        } else {
            return null;
        }
    };

    // Get a list of component and entity tuples
    Page.prototype.getComponents = function() {
        var lookup = []; // lookup previous components
        var mapping = []; // component/entity tuples
        var entities = this.getEntities(true);
        entities.forEach(function (entity) {
            var components = entity.getComponents(true);
            components.forEach(function (component) {
                // make sure we haven't already found this component
                if (lookup.indexOf(component) != -1) return;
                // add component
                lookup.push(component);
                mapping.push({
                    entity: entity,
                    component: component
                });
            });
        });
        return mapping;
    }

    Page.prototype.isShowing = function () {
        return (this == this._pages.getCurrent());
    };

    // Collapses the selected text to the start of the selection.
    // http://stackoverflow.com/questions/8513368/collapse-selection-to-start-of-selection-not-div
    Page.prototype.collapseSelection = function () {
        var pageDoc = this.getActiveDoc();
        var pageSelection = CM.getSelection(pageDoc);
        if (pageSelection && pageSelection.rangeCount > 0) {
            pageSelection.collapseToStart();
        }
    };

    // get all the contents images
    /*Page.prototype.getImages = function () {
        var frameDoc = this.getDoc();

        var images = [];

        for (var i = 0; i < frameDoc.images.length; i++) {
            var image = frameDoc.images[i];

            if (image.className == 'Image') {
                images.push(image);
            }
        }

        return images;
    };*/

    // get the element that should be used for scrolling this page up/down
    Page.prototype.getScrollableElement = function () {
        var pageElement = this.getElement();

        if (pageElement) {

            var entity = this.getActiveEntity();

            // writing (bug # 31730)
            if (this.layout == '12') {
                return Util.Dom.getElementByClassName('writeWrap', 'div', pageElement);
            }
            // passage
            else if (entity instanceof ContentPassage) {
                return entity.getElement();
            }
            // item
            else if (entity instanceof ContentItem) {
                return Util.Dom.getElementByClassName('theQuestions', 'div', pageElement);
            }
        }

        return null;
    };


    Page.prototype.enableScroll = function () {
        this._enableScroll = true;
    };

    Page.prototype.disableScroll = function () {
        this._enableScroll = false;
    };

    // scroll the page up/down/left/right
    Page.prototype.scroll = function (direction) {

        var el = this.getScrollableElement();
        if (el == null || !this._enableScroll) {
            return;
        }

        var scrollAmount = 25;

        switch (direction) {
            case 'Up':
                el.scrollTop -= scrollAmount;
                break;
            case 'Down':
                el.scrollTop += scrollAmount;
                break;
            case 'Left':
                el.scrollLeft -= scrollAmount;
                break;
            case 'Right':
                el.scrollLeft += scrollAmount;
                break;
        }
    };

    Page.prototype.toString = function() {
        return 'Page ' + this.id;
    };

    /******************************************************************************************/

    // Components


    /******************************************************************************************/

    // call this function to render the pages HTML
    Page.prototype.render = function () {
        if (!this._container) {
            this._container = this._renderer.render();
            return true;
        }
        return false;
    };

    Page.prototype.wait = function(eventName) {
        var deferred = Q.defer();
        this.once(eventName, function () {
            deferred.resolve();
        });
        return deferred.promise;
    }
    
    // hide the page
    Page.prototype.hide = function () {

        // check if page is already hidden
        if (!this.isShowing()) {
            return false;
        }

        // hide container element
        var containerEl = this.getContainer();

        if (containerEl) {
            this.fire('beforeHide');
            Renderer.hide(containerEl);
        } else {
            return false;
        }

        // clear focused page entity
        this.clearEntity();

        // clear current page object
        var currentPage = this._pages.getCurrent();
        if (currentPage == this) {
            this._pages.setCurrent(null);
        }

        // hide all entities
        this.getEntities().forEach(function (entity) {
            entity.hide();
        });

        // fire hide event
        this.fire('hide');

        // fire hide after event
        YAHOO.lang.later(1, this, function () {
            this.fire('afterHide');
        });

        return true;
    };

    // show the page (hides current page if one exists)
    Page.prototype.show = function () {

        // check if we are already showing this page
        if (this.isShowing()) {
            return false;
        }

        // show container element
        var containerEl = this.getContainer();
        if (containerEl == null) {
            return false; // did you render the page?
        }

        // fire before show event
        var cancelShow = this.fire('beforeShow');
        if (cancelShow === false) {
            return false;
        } // check if show is cancelled

        // hide current page
        var currentPage = this._pages.getCurrent();
        if (currentPage && currentPage != this) {
            currentPage.hide();
        }

        // show page html
        Renderer.show(containerEl);

        // set new page as current
        this._pages.setCurrent(this);

        // get plugins and entities
        var plugins = this.plugins.getAll();
        
        // check if any of the plugins override how we show entities
        var entities = Util.Array.findWhere(plugins, function(plugin) {
            return plugin.getEntitiesToShow();
        });

        // if no entities were found from plugins then use all of them
        if (!entities) {
            entities = this.getEntities();
        }

        // show entities
        entities.forEach(function (entity) {
            entity.show();
        });

        // check all plugins to see if they want to override what the active entity should be
        var activeEntity = Util.Array.findWhere(plugins, function(plugin) {
            return plugin.getEntityForFocus();
        });

        // figure out the best entity to make active
        if (!activeEntity) {
            if (this._lastEntity && this._lastEntity.isShowing()) {
                activeEntity = this._lastEntity;
            } else {
                var items = this.getItems(true);
                if (items.length > 0) {
                    activeEntity = items[0]; // first item
                } else {
                    var passage = this.getPassage(true);
                    if (passage) {
                        activeEntity = passage; // passage
                    }
                }
            }
        }

        // set entity as active (fires entity focus event)
        if (activeEntity) {
            activeEntity.setActive(null, true);
        }

        // fire show event
        this.fire('show');

        // fire after show event on a seperate thread
        YAHOO.lang.later(1, this, function () {
            this.fire('afterShow');
        });

        return true;
    };

    // Get the last known active entity.
    Page.prototype.getLastActive = function() {
        return this._lastEntity;
    };
    
    Page.prototype.dispose = function () {

        this.plugins.getAll().forEach(function(plugin) {
            plugin.dispose();
        });

        this.plugins.clear();

        if (this._passage) {
            this._passage.dispose();
            delete this._passage;
        }

        if (this._items) {
            this._items.forEach(function(item) {
                item.dispose();
            });
            Util.Array.clear(this._items);
        }

        this._pages = null;
        this.id = null;
        this.segmentID = null;
        this.layout = null;
        this.soundCue = null;
        this.autoPlayQueue = TDS.Audio.Player.createQueue();

        this._container = null;
        this._doc = null;

        this._passage = null;
        this._items = null;
        this._itemHash = null;
        this._html = null;
        this._activeEntity = null;
        this._zoom = null;
        this._lastEntity = null;

        // remove renderer listeners
        var stateNames = Renderer.getStateNames();
        stateNames.forEach(function pageEvent(status) {
            this._renderer.removeListener(status, this.onRendererStatus);
        }.bind(this));
        this._renderer = null;

        this.fire('dispose');
        this.removeAllListeners();
    };

    window.ContentPage = Page;

})(ContentManager);
