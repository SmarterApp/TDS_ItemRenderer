//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
﻿/*
FLASH API: 
- http://kb2.adobe.com/cps/127/tn_12701.html (Flash OBJECT and EMBED tag attributes)
- http://web.archive.org/web/20090210140140/http://www.adobe.com/support/flash/publishexport/scriptingwithflash/scriptingwithflash_03.html (functions)
- http://web.archive.org/web/20090210205955/http://adobe.com/support/flash/publishexport/scriptingwithflash/scriptingwithflash_04.html (properties)
- http://www.viewpoint.com/dc/PropertiesandFunction.html
*/

/*
LINKS:
- http://blog.sebastian-martens.de/2010/05/preload-assets-with-javascript-load-complete-callback-for-single-assets-include-swfflash/
*/

if (typeof Util != 'object') var Util = {};

// standard API wrapper for SWF movies
Util.SWF = function(embed)
{
    // check if function exists
    this._recognizeMethod = function(objstr)
    {
        if (typeof (embed[objstr]) == "undefined") return false;
        else return true;
    };

    this.getTimeline = function(name)
    {
        return new Util.SWF.Timeline(embed, name);
    };

    this.getElement = function() { return embed; };

    /*
    Returns the value of the Flash variable specified by varName. 
    Returns null if the variable does not exist. The argument type is string.
    */
    this.getVariable = function(path) { return (embed.GetVariable(path)); };

    /*
    Returns true if the movie is currently playing.
    */
    this.isPlaying = function() { return (embed.IsPlaying()); };

    /*
    Returns the percent of the Flash Player movie that has streamed into the browser so far; possible values are from 0 to 100.
    */
    this.getPercentLoaded = function() { return (embed.PercentLoaded()); };

    /*
    Loads the movie identified by url to the layer specified by layerNumber. 
    The argument type is integer for layerNumber and string for url. 
    */
    this.loadMovie = function(layerNum, url) { return (embed.loadMovie(layerNum, url)); };

    /*
    Pans a zoomed-in movie to the coordinates specified by x and y. 
    Use mode to specify whether the values for x and y are pixels or a percent of the window. 
    When mode is 0, the coordinates are pixels; when mode is 1, the coordinates are percent of the window. 
    Pan does not pan beyond the boundaries of the zoomed-in movie. The argument type for all arguments is integer.
    */
    this.panPixels = function(hPx, vPx) { embed.Pan(hPx, vPx, 0); };
    this.panPercent = function(hP, vP) { embed.Pan(hP, vP, 1); };

    /*
    Sets the value of the Flash variable specified by variableName to the value specified by value. 
    The argument type for both arguments is string.
    */
    this.setVariable = function(path, value) { embed.setVariable(path, value); };

    /*
    Zooms in on a rectangular area of the movie. The units of the coordinates are in twips (1440 units per inch). 
    To calculate a rectangle in Flash, set the ruler units to Points and multiply the coordinates by 20 to get twips. 
    (There are 72 points per inch.) The argument type for all arguments is integer.
    */
    this.zoomRect = function(left, top, right, bottom) { embed.SetZoomRect(left, top, right, bottom); };

    /*
    Zooms the view by a relative scale factor specified by percent. 
    Zoom(50) doubles the size of the objects in the view. 
    Zoom(200) reduces the size of objects in the view by one half. 
    Zoom(0) resets the view to 100%.
    
    You cannot specify a reduction in the size of objects in the view when the current view is already 100%. 
    The argument type is integer.
    */
    this.zoom = function(percent) { embed.Zoom(percent); };
    this.zoomReset = function() { embed.Zoom(0); };

    /*
    Starts playing the movie.
    */
    this.play = function() { embed.Play(); };

    /*
    Goes to the first frame.
    */
    this.rewind = function() { embed.Rewind(); };

    /*
    Stops playing the movie.
    */
    this.stop = function() { embed.StopPlay(); };
};

// timeline API wrapper
Util.SWF.Timeline = function(embed, target)
{
    // property getters
    this.getXPos = function() { return (embed.TGetPropertyAsNumber(target, 0)); };
    this.getYPos = function() { return (embed.TGetPropertyAsNumber(target, 1)); };
    this.getXScale = function() { return (embed.TGetPropertyAsNumber(target, 2)); };
    this.getYScale = function() { return (embed.TGetPropertyAsNumber(target, 3)); };
    this.getNextFrame = function() { return (embed.TGetPropertyAsNumber(target, 4)); };
    this.getCurrentFrame = function() { return (embed.TGetPropertyAsNumber(target, 4) - 1); };
    this.getTotalFrames = function() { return (embed.TGetPropertyAsNumber(target, 5)); };
    this.getAlpha = function() { return (embed.TGetPropertyAsNumber(target, 6)); };
    this.getVisibility = function() { return (embed.TGetPropertyAsNumber(target, 7) === 1); };
    this.getWidth = function() { return (embed.TGetPropertyAsNumber(target, 8)); };
    this.getHeight = function() { return (embed.TGetPropertyAsNumber(target, 9)); };
    this.getRotation = function() { return (embed.TGetPropertyAsNumber(target, 10)); };
    this.getTarget = function() { return (embed.TGetProperty(target, 11)); };
    this.getFramesLoaded = function() { return (embed.TGetPropertyAsNumber(target, 12)); };
    this.getName = function() { return (embed.TGetProperty(target, 13)); };
    this.getDropTarget = function() { return (embed.TGetProperty(target, 14)); };
    this.getURL = function() { return (embed.TGetProperty(target, 15)); };
    this.getHighQuality = function() { return (embed.TGetProperty(target, 16)); };
    this.getFocusRect = function() { return (embed.TGetProperty(target, 17)); };
    this.getSoundBufTime = function() { return (embed.TGetProperty(target, 18)); };

    // property setters
    this.setXPos = function(value) { embed.TSetProperty(target, 0, value); };
    this.setYPos = function(value) { embed.TSetProperty(target, 1, value); };
    this.setXScale = function(value) { embed.TSetProperty(target, 2, value); };
    this.setYScale = function(value) { embed.TSetProperty(target, 3, value); };
    this.setAlpha = function(value) { embed.TSetProperty(target, 6, value); };
    this.setVisibility = function(value) { embed.TSetProperty(target, 7, ((value === true) ? 1 : 0)); };
    this.setRotation = function(value) { embed.TSetProperty(target, 10, value); };
    this.setName = function(value) { embed.TSetProperty(target, 13, value); };
    this.setHighQuality = function(value) { embed.TSetProperty(target, 16, value); };
    this.setFocusRect = function(value) { embed.TSetProperty(target, 17, value); };
    this.setSoundBufTime = function(value) { embed.TSetProperty(target, 18, value); };

    /*
    In the timeline specified by target, executes the action in the frame specified by frameNumber. 
    */
    this.callFrame = function(frame) { embed.TCallFrame(target, frame); };

    /*
    In the Timeline indicated by target, executes the action in the frame specified by the label frame label. 
    The argument type for both arguments is string.
    */
    this.callLabel = function(label) { embed.TCallLabel(target, label); };

    /*
    Returns the number of the current frame for the timeline specified by target. 
    The frame number returned is zero-based, meaning frame 1 of the Flash movie would be 0, frame 2 would be 1, and so on. 
    The argument type is string.
    */
    this.getCurrentFrame = function() { return (embed.TCurrentFrame(target)); };

    /*
    Returns the label of the current frame of the timeline specified by target. 
    If there is no current frame label, an empty string is returned. The argument type is string.
    */
    this.getCurrentLabel = function() { return (embed.TCurrentLabel(target)); };

    /*
    For the timeline indicated by target, goes to the frame number specified by frameNumber. 
    The argument type for target is string. The argument type for frameNumber is integer. 
    */
    this.gotoFrame = function(num) { embed.TGotoFrame(target, num); };

    /*
    For the timeline indicated by target, goes to the frame label specified by label. 
    The argument type for both arguments is string. 
    */
    this.gotoLabel = function(label) { embed.TGotoLabel(target, label); };

    /*
    Plays the timeline specified by target. The argument type is string. 
    */
    this.play = function() { embed.TPlay(target); };

    /*
    Stops the timeline specified by target. The argument type is string.
    */
    this.stop = function() { embed.TStopPlay(target); };

    // goto frame and start playing
    this.gotoAndPlay = function(frameNum)
    {
        this.gotoFrame(frameNum);
        this.play();
    };
};

// is flash ready
Util.SWF.prototype.isReady = function()
{
    if(!this._recognizeMethod("PercentLoaded")) return false;
    return (this.getPercentLoaded() > 0);
};

// is flash loaded
Util.SWF.prototype.isLoaded = function()
{
    if (!this.isReady()) return false;
    return (this.getPercentLoaded() == 100);
}