/*
Abstract class for inheriting test shell page that contains ITS content and managed by content manager.
*/

(function(TS, CM) {

    function PC(id) {
        PC.superclass.constructor.call(this, id);
        this._requestCount = 0;
    };

    YAHOO.lang.extend(PC, TestShell.Page);

    // The # of times we have tried to request this page.
    PC.prototype.getRequestCount = function() {
        return this._requestCount;
    };

    // Get the content manager page object for this page.
    // NOTE: this can return null if we never loaded content.
    PC.prototype.getContentPage = function() {
        return CM.getPage(this.id);
    };

    // Does this group have its content completely loaded.
    // NOTE: Doesn't take into account if it is currently loading.
    PC.prototype.hasContent = function () { // base
        var contentPage = this.getContentPage();
        return (contentPage != null &&
            contentPage.getRenderer().getState() == CM.Renderer.State.Loaded);
    };

    // Retrieve the content (xhr) and render html. 
    // If the content is already being requested then this will be ignored.
    PC.prototype.requestContent = function(reload) {

        // get current content page 
        var contentPage = this.getContentPage();
        var contentExists = (contentPage != null);

        // check if content page exists
        if (contentExists) {
            // if we are forcing reload then remove current page
            if (reload) {
                CM.removePage(contentPage);
            }
            // since we are not reloading and the page already exists nothing left to do
            else {
                return false;
            }
        }

        // request from the server this groups xml
        this._requestCount++;
        return TestShell.ContentLoader.request(this);
    };

    PC.prototype.show = function () { // base
        var contentPage = this.getContentPage();
        if (contentPage) {
            return contentPage.show();
        } else {
            return false;
        }
    };

    PC.prototype.hide = function () { // base
        var contentPage = this.getContentPage();
        if (contentPage) {
            return contentPage.hide();
        } else {
            return false;
        }
    };

    // get the page specific page title to show user
    PC.prototype.getPageTitle = function() {
        return 'Page ' + this.pageNum;
    };
    
    // get the text to read to the user when a page is shown
    PC.prototype.getScreenReaderText = function() {
        var text = 'Page ';
        text += this.pageNum;
        text += ' is ready. ';

        var contentPage = this.getContentPage();
        var itemCount = contentPage.getItems().length;

        if (contentPage.getPassage() != null) {
            text += '1 Passage and ';
        }

        text += itemCount + ' Question';
        if (itemCount > 1) {
            text += 's';
        }

        return text;
    };

    // load the sound cue (set play to true to load and then play it)
    PC.prototype.createSoundCue = function() {

        var Player = TDS.Audio.Player;
        var Widget = TDS.Audio.Widget;

        var contentPage = this.getContentPage();
        if (contentPage == null || contentPage.soundCue == null) {
            return false;
        }

        // get ID of sound cue
        var id = 'soundcue-' + contentPage.soundCue.bankKey + '-' + contentPage.soundCue.itemKey;
        contentPage.soundCue.id = id;

        // create the url
        var url = TestShell.getHandlersUrl('SoundCue.axd?bankKey=' + contentPage.soundCue.bankKey + '&itemKey=' + contentPage.soundCue.itemKey);
        // HACK: This is so createjs can parse url. But another problem is we can only load ogg with SoundCue handler.
        url += '&file=' + id + '.ogg';

        // look for existing audio widget
        var linkEl = YUD.get(id);

        if (linkEl == null) {
            // create sound cue element
            linkEl = HTML.A({
                id: id,
                href: url,
                type: 'audio/ogg',
                className: 'sound_cue',
                style: 'display:none;'
            });

            // add to page
            YUD.get('soundCues').appendChild(linkEl);

            // create widget
            Widget.createPlayer(linkEl);
        }

        // add to queue
        contentPage.autoPlayQueue.insert(id);

        return true;
    };

    // load the sound cue (set play to true to load and then play it)
    PC.prototype.showSoundCue = function() {
        var contentPage = this.getContentPage();
        if (contentPage == null || contentPage.soundCue == null) {
            return false;
        }

        // look for existing audio widget
        var element = YUD.get(contentPage.soundCue.id);
        if (element) {
            YUD.setStyle(element, 'display', 'block');
        }
        return true;
    };

    // load the sound cue (set play to true to load and then play it)
    PC.prototype.hideSoundCue = function() {
        // check if there is a sound cue
        var contentPage = this.getContentPage();
        if (contentPage == null || contentPage.soundCue == null) {
            return false;
        }

        // look for existing audio widget
        var element = YUD.get(contentPage.soundCue.id);
        if (element) {
            YUD.setStyle(element, 'display', 'none');
        }
        return true;
    };

    // get all the images on the page that had a problem loading
    PC.prototype.getMissingImages = function() {
        var missingImages = [];

        var contentPage = this.getContentPage();

        if (contentPage) {
            // get all images
            var images = contentPage.getImages();

            // filter images for ones that didn't load
            for (var i = 0; i < images.length; i++) {
                var image = images[i];
                if (image.state && image.state > 1) {
                    missingImages.push(image);
                }
            }
        }

        return missingImages;
    };

    TS.PageContent = PC;

})(window.TestShell, window.ContentManager);