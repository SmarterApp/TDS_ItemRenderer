//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
﻿/* This code deals with AIR created animations. */

/*
TUTORIALS API:
- doPause();
- doPlay();
- doRestart();
- doMute();
- doUnmute();
*/

/*
ANIMATION API:

Internal:
- JSPlay();
- JSPause();
- JSStop();
- JSRewind();
- getStatus(); [playing, stopped, paused, notstarted]

External:
- animationStatusChange(status)
- checkAutoPlay(); [return false to stop autoplay]
*/

// this wraps an AIR embed video with an API that uses custom functions
VideoManager.SWF = function(embed, data)
{
    this._embed = embed; // SWF container (<embed>)
    this._data = data; // original link data
    this._ready = false;
};

// use this to parse animation data attributes into an object
VideoManager.SWF.parseData = function(link)
{
    if (link == null) return null;

    // helper for getting attribute
    var getAttrib = function(name) {
        return YUD.getAttribute(link, 'data-' + name) || 
               YUD.getAttribute(link, name);
    };

    var width = (getAttrib('width') * 1);
    var height = (getAttrib('height') * 1);

    // check if autoplay is enabled (disabled by default)
    var autoplay = getAttrib('autoplay');
    autoplay = (autoplay) ? (autoplay.toLowerCase() == 'true') : false;

    // check if the animation can be played with html5 tech (disabled by default)
    var html5 = getAttrib('anim-html5');
    html5 = (html5) ? (html5.toLowerCase() == 'true') : false;

    // check if the animation can be played with Flash (disabled by default)
    var flash = getAttrib('anim-flash');
    flash = (flash) ? (flash.toLowerCase() == 'true') : YUD.hasClass(link, 'flashvideo');

    // check if the animation shell should be used (enabled by default if Flash is enabled)
    var shell = getAttrib('anim-shell');
    
    if (shell) {
        shell = (shell.toLowerCase() == 'true');
    } else {
        // figure out a good default..
        if (html5) {
            // if HTML5 is enabled then disable Flash shell (can't export Flash to HTML5 using this shell)
            shell = false;
        } else if (flash) {
            // if Flash is enabled then let's assume Flash shell is required (since that was what people agreed on)
            shell = true;
        } else {
            // if HTML5 and Flash are disabled then ignore shell
            shell = false;
        }
    }

    return {
        url: YUD.getAttribute(link, 'href'),
        type: YUD.getAttribute(link, 'type'),
        width: width,
        height: height,
        autoplay: autoplay,
        shell: shell,
        html5: html5,
        flash: flash
    };
};

VideoManager.SWF.prototype.getElement = function() { return this._embed; };

// check if this video has autoplay enabled
VideoManager.SWF.prototype.autoplay = function() { return this._data.autoplay; };

// is this video ready to start being used
VideoManager.SWF.prototype.isReady = function() { return this._ready; };

// get the current status of the video
VideoManager.SWF.prototype.getStatus = function()
{
    if (!YAHOO.lang.isFunction(this._embed.getStatus))
    {
        return 'uninitialized';
    }

    var status = this._embed.getStatus();

    // fix legacy SWF
    if (status == 'notstarted') status = 'initialized';

    return status;
};

VideoManager.SWF.prototype.isLoaded = function()
{
    // check if we already marked this as ready 
    if (this.isReady()) return true;
    return (this.getStatus() != 'uninitialized');
};

// call this function when we think the SWF is ready and loaded
VideoManager.SWF.prototype.setReady = function() { this._ready = true; };

VideoManager.SWF.prototype.isPlaying = function()
{
    // check if the SWF itself says it is playing 
    // (NOTE: this seems to return true for AIR animations even though they are not)
    // if (this._embed.IsPlaying()) return true;
    return (this.getStatus() == 'playing');
};

VideoManager.SWF.prototype.play = function()
{
    if (!this.isReady()) return false;
    if (this.isPlaying()) return false;

    if (YAHOO.lang.isFunction(this._embed.JSPlay))
    {
        this._embed.JSPlay();
        return true;
    }

    return false;
};

VideoManager.SWF.prototype.stop = function()
{
    if (!this.isReady()) return false;
    if (!this.isPlaying()) return false;

    if (YAHOO.lang.isFunction(this._embed.JSStop))
    {
        this._embed.JSStop();
        return true;
    }
    
    return false;
};

/****************************************************************************/

// used to embed simple flash swf videos into html
VideoManager.SWF.collection = new Util.Structs.Map();

VideoManager.SWF.Status =
{
    LOADING: 'loading',
    LOADED: 'loaded',
    PLAYING: 'playing',
    PAUSED: 'paused',
    STOPPED: 'stopped'
};

VideoManager.SWF.Events = new Util.EventManager();

// handler the raw ExternalCall from SWF
VideoManager.SWF._animationStatusChange = function()
{
    var data = [];

    // fix the arguments 
    if (arguments.length == 1)
    {
        // legacy SWF's with no ID
        data.push(null); // id
        data.push(arguments[0]); // status
    }
    else if (arguments.length == 2)
    {
        // newer SWF's with ID
        data.push(arguments[0]); // id
        data.push(arguments[1]); // status
    }

    // if there is any data then process the status change
    if (data.length == 0) return;

    // fix legacy SWF status
    if (data[1] == 'notstarted') data[1] = 'initialized';

    // fix the scope and delay execution to fix SB
    YAHOO.lang.later(0, VideoManager.SWF, VideoManager.SWF.processStatusChange, data);
};

// this
VideoManager.SWF.processStatusChange = function(id, status)
{
    // TODO: figure out the actual swfAPI based on ID passed in

    // check when SWF animation is ready
    if (status == 'initialized')
    {
        var apis = VideoManager.SWF.collection.getValues();

        for (var i = 0; i < apis.length; i++)
        {
            var swfAPI = apis[i];

            // make sure this SWF was never set as being ready and it is considered loaded
            if (!swfAPI.isReady() && swfAPI.isLoaded())
            {
                // set swf as ready and fire event
                swfAPI.setReady();
                VideoManager.SWF.Events.fire(VideoManager.SWF.Status.LOADED, swfAPI);
            }
        }
    }

    // check when SWF animation has started playing 
    if (status == 'playing')
    {
        VideoManager.SWF.Events.fire(VideoManager.SWF.Status.PLAYING, null);
    }

    // check when SWF animation has stopped playing 
    if (status == 'stopped')
    {
        VideoManager.SWF.Events.fire(VideoManager.SWF.Status.STOPPED, null);
    }
};

// change a anchor tag into a flash widget
VideoManager.SWF.embed = function(win, linkVideo, overrideAutoplay, disableShell)
{
    // add external functions required by AIR flash animations
    if (!YAHOO.lang.isFunction(win.animationStatusChange))
    {
        win.animationStatusChange = VideoManager.SWF._animationStatusChange;
        win.checkAutoPlay = function() { return false; };
    }

    // var id = 'tutorial';
    var id = 'Animation-' + YAHOO.util.Dom.generateId();

    // get video data from url
    var animData = VideoManager.SWF.parseData(linkVideo);

    // if autoplay was not specified then get it from link
    if (YAHOO.lang.isBoolean(overrideAutoplay)) animData.autoplay = overrideAutoplay;

    // create swf container
    var linkDoc = Util.Dom.getOwnerDocument(linkVideo);
    var divVideo = linkDoc.createElement('div');
    YUD.addClass(divVideo, 'AnimationContainer');

    // set swf dimensions
    YUD.setStyle(divVideo, 'width', animData.width + 'px');
    YUD.setStyle(divVideo, 'height', animData.height + 'px');

    // create swf embed html
    divVideo.innerHTML = this.createHtml(id, animData, disableShell);

    // attach new container to dom
    YUD.insertAfter(divVideo, linkVideo);

    // remove original link
    var parentNode = linkVideo.parentNode;
    if (parentNode) {
        parentNode.removeChild(linkVideo);
    }

    // get swf container
    var children = YUD.getChildren(divVideo);
    var embed = (children && children.length > 0) ? children[0] : null;

    // prevent right click
    VideoManager.SWF.stopRightClick(embed);

    // create SWF API and add to collection
    var swfAPI = new VideoManager.SWF(embed, animData);
    VideoManager.SWF.collection.set(id, swfAPI);
    VideoManager.SWF.Events.fire(VideoManager.SWF.Status.LOADING, swfAPI);

    return swfAPI;
};

VideoManager.SWF.createHtml = function(id, animData, disableShell)
{
    // set flash window mode [window (default), opaque, transparent]
    var wmode;

    // check if Mac FF 2.0
    if (Util.Browser.isMac() && Util.Browser.getFirefoxVersion() == 2)
    {
        // BUG 16097: Mac 10.x-FF2|Tutorials page is not loading everything
        wmode = 'window';
    }
    else
    {
        // opaque is what helps prevent right clicking
        wmode = 'opaque';
    }

    // create flash object
    var embedBuilder = [];
    embedBuilder.push('<embed');
    embedBuilder.push('id="' + id + '"');
    embedBuilder.push('type="application/x-shockwave-flash"');
    
    // check if the animation shell is disabled
    if (disableShell || !animData.shell)
    {
        // NOTE: tutorials do not support the animation shell
        embedBuilder.push('src="' + animData.url + '"');
    }
    else
    {
        var shellPath = ContentManager.resolveBaseUrl('Scripts/Video/AnimationShell.swf');
        var animPath = encodeURIComponent(animData.url);
        var vars = 'animID=' + id + '&animURL=' + animPath;
        embedBuilder.push('src="' + shellPath + '"');
        embedBuilder.push('flashvars="' + vars + '"');
    }

    embedBuilder.push('width="100%"');
    embedBuilder.push('height="100%"');
    embedBuilder.push('play="' + animData.autoplay + '"'); // autoplay
    embedBuilder.push('loop="false"');
    embedBuilder.push('menu="false"');
    embedBuilder.push('allowscriptaccess="always"');
    embedBuilder.push('allowfullscreen="false"');
    embedBuilder.push('quality="autohigh"');
    embedBuilder.push('wmode="' + wmode + '"');
    embedBuilder.push('></embed>');
    
    return embedBuilder.join(' ');
};

// iterate over all the SWF animations on a page
VideoManager.SWF.forEach = function(page, fn) // executePlugins
{
    // get the available pages embedded flash objects
    var pageEl = page.getElement();
    var pageEmbeds = pageEl.getElementsByTagName('embed');
    
    for (var i = 0; i < pageEmbeds.length; i++)
    {
        // get api
        var embed = pageEmbeds[i];
        var swfAPI = VideoManager.SWF.collection.get(embed.id);
        
        if (swfAPI != null)
        {
            // execute function
            try { fn(swfAPI); }
            catch (ex) { Util.log('SWF ERROR: ' + ex); }
        }
    }
};

// stop any currently playing flash
VideoManager.SWF.stopPlaying = function()
{
    var page = ContentManager.getCurrentPage();
    if (page == null) return;

    VideoManager.SWF.forEach(page, function(api)
    {
        if (api.isPlaying()) api.stop();
    });
};

/****************************************************************************/

// modified version of this: http://code.google.com/p/custom-context-menu/
VideoManager.SWF.stopRightClick = function(embed)
{
    var flashDoc = Util.Dom.getOwnerDocument(embed);
    var flashWin = (flashDoc.parentWindow || flashDoc.defaultView);

    if (flashWin.addEventListener)
    {
        flashWin.addEventListener('mousedown', VideoManager.SWF._onGeckoMouse, true);
    }
    else
    {
        embed.onmouseup = function() { embed.releaseCapture(); };
        // document.oncontextmenu = function() { if (window.event.srcElement.id == RightClick.FlashObjectID) { return false; } else { RightClick.Cache = "nan"; } }
        // embed.onmousedown = RightClick.onIEMouse;
    }
};

VideoManager.SWF._onGeckoMouse = function(evt)
{
    var target = YUE.getTarget(evt);

    // if the target is flash and not left click then stop event
    if (target && target.type == 'application/x-shockwave-flash' && evt.button != 0)
    {
        VideoManager.SWF._killEvents(evt);
    }
};

VideoManager.SWF._killEvents = function(evt)
{
    if (evt) 
    {
	    if (evt.stopPropagation) evt.stopPropagation();
		if (evt.preventDefault) evt.preventDefault();
		if (evt.preventCapture) evt.preventCapture();
   		if (evt.preventBubble) evt.preventBubble();
	}
};
