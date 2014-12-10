(function() {

    // patch jwplayer for page frame
    ContentManager.onPageEvent('available', function(page) {
        var pageWin = page.getWin();
        if (typeof pageWin.jwplayer == 'function') {
            VideoManager.patchJWPlayer(pageWin.jwplayer);
        }
    });

    // this event checks when page is ready and then converts all the flash links into embedded flash objects
    ContentManager.onPageEvent('available', function(page) {

        var pageEl = page.getElement();
        var pageWin = page.getWin();

        var pageLinks = pageEl.getElementsByTagName('a');

        YUD.batch(pageLinks, function(pageLink) {

            var animData = VideoManager.SWF.parseData(pageLink);

            // check if swf animation
            if (animData.flash) {
                // add video to loader with 3 min timeout and 2 retries
                var videoLoader = new ResourceLoader.Binary(pageLink.href, 180000, 2);

                // wait for SWF to load properly
                videoLoader.subscribe(ResourceLoader.Status.COMPLETE, function() {
                    // add swf to the html
                    VideoManager.SWF.embed(pageWin, pageLink);
                });

                page.addResourceLoader(videoLoader);
            }
            // check if jwplayer video format
            else if (VideoManager.canPlay(pageLink.href)) {
                
                var videoData = VideoManager.parseData(pageLink);

                // check if we should open this video in a dialog
                if (videoData.dialog) {
                    YUE.on(pageLink, 'click', VideoManager.openDialog, pageLink);
                } else {
                    VideoManager.embed(pageWin, pageLink,page.getZoomFactor());
                }
            }
        });

    });

    // on page show play flash movie
    ContentManager.onPageEvent('show', function(page) {
        VideoManager.SWF.forEach(page, function(swfAPI) {
            if (swfAPI.autoplay()) {
                swfAPI.play();
            }
        });
    });

    // on page hide stop flash movie
    ContentManager.onPageEvent('hide', function(page) {
        VideoManager.stop(page);
    });

    ContentManager.onPageEvent('zoom', function(page) {
        // if (item.grid) item.grid.ui.zoom(page.getZoomFactor());
        if (page.getWin().jwplayer) {
            var players = page.getWin().jwplayer.getPlayers();

            for (var i = 0; i < players.length; i++) {
                var player = players[i];

                // save original dimensions if not found
                if (!player.config.width) {
                    player.config.width = player.getWidth();
                }
                if (!player.config.height) {
                    player.config.height = player.getHeight();
                }

                // zoom player
                var zoomFactor = page.getZoomFactor();

                if ((player.config.width > 0) && (player.config.height > 0)) {
                    var zoomWidth = (player.config.width * zoomFactor);
                    var zoomHeight = (player.config.height * zoomFactor);
                    player.resize(zoomWidth, zoomHeight);
                }
            }
        }
    });

    // listen for when flash API is finished loading
    VideoManager.SWF.Events.subscribe('loaded', function(swfAPI) {
        var currentPage = ContentManager.getCurrentPage();
        if (currentPage == null) {
            return;
        }

        VideoManager.SWF.forEach(currentPage, function(pageSwfAPI) {
            // check if the SWF that loaded exists on the current page
            if (swfAPI == pageSwfAPI && swfAPI.autoplay()) {
                // autoplay the animation
                swfAPI.play();
            }
        });
    });

    // Listen for help tutorial to load
    ContentManager.Dialog.onLoad.subscribe(function(frame) {

        var frameWin = frame.getWindow();
        var frameDoc = frame.getDocument();

        if (Util.String.contains(frame.id, 'help')) {

            // look for all flash video links
            var flashLinks = YUD.getElementsByClassName('flashvideo', 'a', frameDoc);
            for (var i = 0; i < flashLinks.length; i++) {
                if (flashLinks[i].parentNode) {
                    VideoManager.SWF.embed(frameWin, flashLinks[i], true, true);
                }
            }
        }

    });

    // BUG #57378: Tutorials don't play when opening after the first time
    ContentManager.Dialog.onShow.subscribe(function(dialogFrame) {
        var dialogDoc = Util.Dom.getFrameContentDocument(dialogFrame);

        YUD.batch(dialogDoc.getElementsByTagName('embed'), function(embed) {
            if (typeof embed.Play == 'function') {
                embed.Play();
            }
        });
    });

    // BUG #57377: Tutorial doesn't stop playing when closed
    ContentManager.Dialog.onHide.subscribe(function(dialogFrame) {
        var dialogDoc = Util.Dom.getFrameContentDocument(dialogFrame);

        YUD.batch(dialogDoc.getElementsByTagName('embed'), function(embed) {
            if (typeof embed.Rewind == 'function') {
                embed.Rewind();
            }
        });
    });
    
    // BUG #52269: stop TTS when playing swf
    VideoManager.SWF.Events.subscribe('playing', function() {
        TTS.getInstance().stop();
    });

})();
