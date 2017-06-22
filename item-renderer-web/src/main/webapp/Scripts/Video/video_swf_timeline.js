//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
﻿// this wraps an AIR embed video with an API that uses the timeline
VideoManager.SWFTimeline = function(swf /*VideoManager.SWF*/)
{
    this._swf = swf;
    this._scrubberStartX = 17;
    this._scrubberDragArea = 306;
};

// get the main movie
VideoManager.SWFTimeline.prototype._getTimelineForMain = function() { return this._swf.getTimeline('/main'); };

// get the small scrubber icon
VideoManager.SWFTimeline.prototype._getTimelineForScrubber = function() { return this._swf.getTimeline('/main/scrubber_mc'); };

// get the playpause main control
VideoManager.SWFTimeline.prototype._getTimelineForPlayPause = function() { return this._swf.getTimeline('/main/playpause'); };

// get the small play icon
VideoManager.SWFTimeline.prototype._getTimelineForPlay = function() { return this._swf.getTimeline('/main/playpause/play_mc'); };

// get the small pause icon
VideoManager.SWFTimeline.prototype._getTimelineForPause = function() { return this._swf.getTimeline('/main/playpause/pause_mc'); };

VideoManager.SWFTimeline.prototype.isPlaying = function()
{
    // otherwise check timeline buttons...
    var play_mc = this._getTimelineForPlay();
    var pause_mc = this._getTimelineForPause();

    // if the play button is hidden and the pause is visible then we are playing
    return (!play_mc.getVisibility() && pause_mc.getVisibility());
};

VideoManager.SWFTimeline.prototype.reset = function()
{
    if (this.isPlaying()) return false;

    var main = this._getTimelineForMain();
    var scrubber_mc = this._getTimelineForScrubber();
    
    // set scrubber at the beginning
    scrubber_mc.setXPos(this._scrubberStartX);
    
    // goto first frame and play
    main.gotoFrame(0);

    return true;
};

VideoManager.SWFTimeline.prototype.play = function()
{
    if (this.isPlaying()) return false;

    // reset and play
    this.reset();

    //var main = this._getTimelineForMain();
    //main.play();

    return true;
};

VideoManager.SWFTimeline.prototype.stop = function()
{
    if (!this.isPlaying()) return false;

    var main = this._getTimelineForMain();
    var scrubber_mc = this._getTimelineForScrubber();

    // stop movie
    main.stop();

    // set scrubber past the end which ends the built in timer
    scrubber_mc.setXPos(this._scrubberDragArea + 1);

    // goto last frame
    var lastFrame = main.getTotalFrames();
    main.gotoFrame(lastFrame);

    return true;
};

VideoManager.SWFTimeline.prototype.debug = function()
{
    var mainTimeline = this._getTimelineForMain();
    var scrubberTimeline = this._getTimelineForScrubber();
    var playTimeline = this._getTimelineForPlay();
    var pauseTimeline = this._getTimelineForPause();

    console.log('play button visible: ' + playTimeline.getVisibility());
    console.log('pause button visible: ' + pauseTimeline.getVisibility());
};