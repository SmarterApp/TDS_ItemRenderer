var VideoManager = {};

// use this to parse video data attributes into an object
VideoManager.parseData = function(link)
{
    if (link == null) return null;

    // helper for getting attribute
    var getAttrib = function(name) {
        return YUD.getAttribute(link, 'data-' + name) || 
               YUD.getAttribute(link, name);
    };

    // check if autoplay is enabled (disabled by default)
    var autoplay = getAttrib('autoplay');
    autoplay = (autoplay) ? (autoplay.toLowerCase() == 'true') : false;

    // check if opening in dialog is enabled (disabled by default)
    var dialog = getAttrib('dialog');
    dialog = (dialog) ? (dialog.toLowerCase() == 'true') : false;

    // check if video controls are enabled (enabled by default)
    var controls = getAttrib('controls');
    controls = (controls) ? (controls.toLowerCase() == 'true') : true;

    return {
        autoplay: autoplay,
        dialog: dialog,
        controls: controls,
        url: YUD.getAttribute(link, 'href'),
        type: YUD.getAttribute(link, 'type'),
        width: (getAttrib('width') * 1),
        height: (getAttrib('height') * 1)
    };
};

VideoManager.canPlay = function(url)
{
    if (typeof jwplayer != 'function') return false;

    // check if there is any url
    if (!jwplayer.utils.exists(url)) return false;

    // get file extension
    var extension = jwplayer.utils.extension(url);
    if (!jwplayer.utils.exists(extension)) return false;
    if (extension == 'm4a') return false; // jwplayer thinks this is video?

    // check if we can play
    var extPlayers = jwplayer.utils.extensionmap[extension];
    if (!jwplayer.utils.exists(extPlayers)) return false;
    
    return (Util.String.startsWith(extPlayers.html5, 'video') || 
            Util.String.startsWith(extPlayers.flash, 'video'));
};

// change a anchor tag into a full video player
VideoManager.embed = function(pageWin, linkVideo,zoomFactor)
{
    if (typeof pageWin.jwplayer != 'function') return false;

    // create unique ID
    var id = YUD.generateId().replace('yui', 'video');
    linkVideo.setAttribute('id', id);
    
    var flashPath = ContentManager.resolveBaseUrl('Scripts/Libraries/jwplayer/player.swf');
    var skinPath = ContentManager.resolveBaseUrl('Scripts/Libraries/jwplayer/skins/simple/simple.zip');
    var videoData = VideoManager.parseData(linkVideo);

    // create jwplayer config
    var config = {
        provider: 'video',
        autostart: videoData.autoplay,
        fullscreen: false,
        skin: skinPath
    };
    
    // check if should enable video controls
    if (!videoData.controls) {
        config['controlbar.position'] = 'none';
    }
    
    // check for dimensions
    if (videoData.width > 0 && videoData.height > 0) {
        // the content sets the dimensions
        config.width = videoData.width;
        config.height = videoData.height;
    } else {
        // use defaults
        config.width = 400;
        config.height = 226;
    }
    
    // NOTE: You have to create array using the frame window (https://bugzilla.mozilla.org/show_bug.cgi?id=548862)
    var createAnArray = function() {
        return (typeof pageWin.createAnArray == 'function') ? pageWin.createAnArray() : [];
    };

    // set levels
    config.levels = createAnArray();
    config.levels.push({ file: videoData.url, type: videoData.type });

    // set modes
    config.modes = createAnArray();
    config.modes.push({ type: 'html5' });
    config.modes.push({ type: 'flash', src: flashPath });
    
    // clear logo and context menu entries
    config.logo = {
        file: '',
        link: ''
    };
    config.abouttext = '';
    config.aboutlink = '';

    // embed player
    var player = pageWin.jwplayer(linkVideo).setup(config);

    // Bug 123148: New dialogs don't reflect the current zoom
    // level, although zooming does work once the dialogs are open.
    if (zoomFactor) {
        var zoomWidth = config.width * zoomFactor;
        var zoomHeight = config.height * zoomFactor;
        player.resize(zoomWidth, zoomHeight);
    }

    return player;
};

// call this to stop all video and animations from playing
VideoManager.stop = function(page)
{
    // stop all animations
    VideoManager.SWF.forEach(page, function(swfAPI)
    {
        swfAPI.stop();
    });

    var pageWin = page.getWin();

    // stop all video
    if (YAHOO.lang.isFunction(pageWin.jwplayer))
    {
        var players = pageWin.jwplayer.getPlayers();

        // check all players on this page if they are playing and stop them
        for (var i = 0; i < players.length; i++)
        {
            var player = players[i];
            // NOTE: There are issues on Android with freezing if you stop instead of pause here.
            if (player.getState() == 'PLAYING') player.pause(); 
        }
    }
};

// this opens a dialog
VideoManager.openDialog = function(ev, pageLink,zoomFactor)
{
    TDS.ToolManager.hideAll();

    var id = 'video-' + Util.String.hashCode(pageLink.href);
    var videoDialog = TDS.ToolManager.get(id);

    // create ASL dialog
    if (videoDialog == null)
    {
        var header = pageLink.title || '';
        videoDialog = TDS.ToolManager.createPanel(id, 'video', header);
        videoDialog.body.innerHTML = ''; // clear contents

        // add link into dialog
        var aslLink = pageLink.cloneNode(true);
        videoDialog.body.appendChild(aslLink);

        // make link video player
        var videoPlayer = VideoManager.embed(window, aslLink, zoomFactor);

        videoDialog.showEvent.subscribe(function()
        {
            videoPlayer.play();
        });

        videoDialog.hideEvent.subscribe(function()
        {
            videoPlayer.stop();
        });

        // add custom resize function for dialog
        videoDialog.refresh = function()
        {
            // set dialog to the size of the video
            var width = videoPlayer.getWidth();
            var height = videoPlayer.getHeight();

            if (width > 0 && height > 0)
            {
                // add header height
                height += videoDialog.header.offsetHeight;

                // add body padding height
                height += (YUD.getStyle(videoDialog.body, 'padding-top').replace('px', '') * 1);
                height += (YUD.getStyle(videoDialog.body, 'padding-bottom').replace('px', '') * 1);

                // add body padding width
                width += (YUD.getStyle(videoDialog.body, 'padding-left').replace('px', '') * 1);
                width += (YUD.getStyle(videoDialog.body, 'padding-right').replace('px', '') * 1);

                videoDialog.cfg.setProperty('width', width + 'px');
                videoDialog.cfg.setProperty('height', height + 'px');

                //Util.log('Video Dialog: w=' + width + ' h=' + height);
            }
        };

        // when the video is ready resize dialog to match
        videoPlayer.onReady(function()
        {
            videoDialog.refresh();
            TDS.ToolManager.bottomLeft(videoDialog);
        });

    }

    videoDialog.show();
};

/******************************************************************/

// patch jwplayer issues
VideoManager.patchJWPlayer = function(player)
{
    // fix outerHTML
    if (player.__tds_fixedOuterHTML !== true)
    {
        player.utils.setOuterHTML = Util.Dom.setOuterHTML;
        player.__tds_fixedOuterHTML = true;
    }
    
    // fix file ext parsing to work with resource handler
    if (player.__tds_fixedExt !== true)
    {
        // create new version that works with our resource handler
        player.utils.extension = function(path)
        {
	        if (!path) { return ""; }
	        path = path.substring(path.lastIndexOf("/") + 1, path.length);
            var pathPieces = path.split("?");
            path = pathPieces[0];
    
            if (pathPieces.length > 1)
            {
                var querystring = Util.QueryString.parse(pathPieces[1]);
                if (querystring.file != null) path = querystring.file;    
            }
    
	        if (path.lastIndexOf('.') > -1) {
		        return path.substr(path.lastIndexOf('.') + 1, path.length).toLowerCase();
	        }

	        return null;
        };

        player.__tds_fixedExt = true;
    }
};

// patch jwplayer for current document
(function()
{
    if (typeof window.jwplayer == 'function')
    {
        VideoManager.patchJWPlayer(window.jwplayer);
    }
})();

