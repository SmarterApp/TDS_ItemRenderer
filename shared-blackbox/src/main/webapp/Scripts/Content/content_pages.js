(function(CM) {

    var Renderer = CM.Renderer;

    // set the passage from the frames its.passage object
    function createPassage(page, itsPassage) {

        var passage = new ContentPassage(page, itsPassage.bankKey, itsPassage.itemKey, itsPassage.filePath);

        // store
        page.setPassage(passage);

        // content data
        passage.stemTTS = itsPassage.stemTTS;
        passage.printed = itsPassage.printed;

        // resources
        passage.resources = itsPassage.resources;
        passage.attachments = itsPassage.attachments;

        // copy xml specs
        passage.specs = itsPassage.specs;

        return passage;
    }

    // add a item from the frames its.items[] object
    function createItem(page, itsItem) {

        var item = new ContentItem(page, itsItem.bankKey, itsItem.itemKey, itsItem.filePath,
            itsItem.format, itsItem.responseType, itsItem.grade, itsItem.subject, itsItem.position);

        // set read only flag
        item.disabled = itsItem.disabled;

        // store item
        page.addItem(item);

        // TTS
        item.stemTTS = itsItem.stemTTS;
        item.illustrationTTS = itsItem.illustrationTTS;

        // render spec
        item.rendererSpec = itsItem.rendererSpec || null;

        // grid
        item.gridAnswerSpace = itsItem.gridAnswerSpace;

        // tutorial
        item.tutorial = itsItem.tutorial;

        // resources (should never be null)
        item.resources = itsItem.resources;
        item.attachments = itsItem.attachments;

        if (itsItem.resources) {
            item.gtr = itsItem.resources['guideToRevision']; // GTR
            item.coverPage = itsItem.resources['coverPage']; // cover sheet
        }

        // response
        item.value = itsItem.value;
        item.printed = itsItem.printed;

        // rubric (optional)
        item.rubric = itsItem.rubric;

        // qti
        if (itsItem.qti) {
            item.qti = itsItem.qti;
        }

        // copy xml specs
        item.specs = itsItem.specs;

        return item;
    }

    function createPage(pages, content) {

        Util.Assert.isObject(content);
        Util.Assert.isString(content.id);

        var pageID = content.id;
        var page = pages.get(pageID);
        if (page) {
            return page;
        }

        // create page object and assign internally to track
        var pagesEl = pages.getElement();
        var renderer = new Renderer(pagesEl, pageID, content.html);

        var eventQueue = [];

        // create page
        page = new ContentPage(pages, renderer, pageID, content.segmentID, content.layout);
        page.soundCue = content.soundCue || null; // TODO: Remove this
        eventQueue.push(pages.fire.bind(pages, 'pageCreated', page, content));
        pages._lookup.set(pageID, page);

        // create passage
        if (content.passage) {
            var passage = createPassage(page, content.passage);
            eventQueue.push(page.fire.bind(page, 'passageCreated', passage, content.passage));
        }

        // create items
        if (content.items) {
            content.items.forEach(function (itemContent) {
                var item = createItem(page, itemContent);
                eventQueue.push(page.fire.bind(page, 'itemCreated', item, itemContent));
            });
        }

        // fire the events once all the entities are created
        eventQueue.forEach(function (func) {
            func();
        });

        return page;
    }

    function Pages(id) {
        this._id = id; // <div> that contains all the page <div>'s
        this._currentPage = null; // the current page
        this._lookup = new Util.Structs.Map();
        Util.Event.Emitter(this);
    }

    // Call this function to create a collection of CcontentPage's based on content json
    Pages.prototype.create = function (content) {
        return createPage(this, content);
    };

    // get the wrapper elements for all the pages
    Pages.prototype.getElement = function() {
        return document.getElementById(this._id);
    }

    Pages.prototype.list = function () {
        return this._lookup.getValues();
    };

    // get a page by the ID of the iframe
    Pages.prototype.get = function (id) {
        return this._lookup.get(id);
    };

    Pages.prototype.setCurrent = function (page) {
        this._currentPage = page;
    };

    // get the page currently being viewed
    Pages.prototype.getCurrent = function () {
        return this._currentPage;
    };
    
    // go through all the pages and find an item that matches this position
    Pages.prototype.getItem = function (position) {

        var pages = this.list();

        for (var i = 0; i < pages.length; i++) {
            var page = pages[i];
            var item = page.getItem(position);
            if (item) {
                return item;
            }
        }

        return null;
    };
    
    // removes page
    Pages.prototype.remove = function (page) {

        // hide page if it is showing
        if (page.isShowing()) {
            page.hide();
        }

        // remove page from DOM
        Renderer.remove(page);

        // remove from hash
        this._lookup.remove(page.id);

        // dispose of page object
        page.dispose();
    };
    
    Pages.prototype.dispose = function() {
        var list = this.list();
        list.forEach(function(page) {
            page.dispose();
        });
        this._lookup.clear();
        this._currentPage = null;
        this.getElement().innerHTML = '';
        
        this.fire('dispose');
        this.removeAllListeners();
    }

    CM.Pages = Pages;

    // collection of the Pages objects created
    var list = [];

    // create a new pages collection
    CM.createPages = function (id) {
        var pages = new Pages(id);
        list.push(pages);
        pages.once('dipose', function() {
            Util.Array.remove(list, pages);
        });
        CM.fire('pagesCreated', pages);
        return pages;
    }

    // get all the pages collections created
    CM.getPages = function() {
        return list;
    }

    CM.createPassage = createPassage;
    CM.createItem = createItem;

})(ContentManager);
