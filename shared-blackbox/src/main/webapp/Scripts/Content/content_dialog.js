//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
﻿// The content dialog is a window for loading content into. 
// We currently use this with tutorials and GTR.

(function(CM) {

    // currently showing dialog
    var currentFrame = null;

    var Dialog = {

        // the url of the iframe
        urlFrame: null,

        onBeforeShow: new Util.Event.Custom(), // onBeforeContentShow
        onShow: new Util.Event.Custom(), // onContentShow
        onBeforeHide: new Util.Event.Custom(), // onBeforeContentHide
        onHide: new Util.Event.Custom(), // onContentHide
        onLoad: new Util.Event.Custom() // onContentLoad
    };

    // update CSS and set focus on frame
    function update() {
        
        // check if frame is ready
        if (currentFrame == null || 
            currentFrame.loadState != 2) {
            return;
        }

        // copy test shell css to dialog content
        Util.Dom.copyCSSFrame(currentFrame);

        var frameWin = currentFrame.getWindow();

        if (frameWin) {
            setTimeout(function () { CM.focus(frameWin); }, 0);
        }
    }


    // load content dialog with "student help" content
    function load(id, bankKey, itemKey) {
        
        // check if resource already exists
        var frame = YUD.get(id);
        
        if (frame != null) {
            /*
            // reload animation frame
            if (typeof AnimationManager == 'object') {
                var frameDoc = frame.getDocument();
                if (frameDoc) {
                    var animFrames = AnimationManager.getHTML5Frames(frameDoc);
                    if (animFrames.length > 0) {
                        AnimationManager.reloadHTML5(animFrames[0]);
                    }
                }
            }
            */

            return frame;
        }

        // get url of tutorial
        if (Dialog.urlFrame == null) {
            throw new Error('There is no url defined for content dialog frame.');
        }

        // build DialogFrame.aspx url
        var accProps = Accommodations.Manager.getDefaultProps();
        var lang = accProps ? accProps.getLanguage() : 'ENU';
        var url = Dialog.urlFrame;
        url += '?language=' + lang;
        url += '&bankKey=' + bankKey;
        url += '&itemKey=' + itemKey;

        // get dialogs container
        var dialogsEl = YUD.get('dialogContentFrames');

        // if dialogs container does not exist create it
        if (dialogsEl == null) {
            dialogsEl = document.createElement('div');
            dialogsEl.id = 'dialogContentFrames';
            document.body.appendChild(dialogsEl);
        }

        frame = Util.Frame.create(id, dialogsEl);
        frame.load(url); // FLASH TEST: 'http://www.uza.lt/rightclick/'

        // when tutorial loads...
        frame.onLoaded.subscribe(function() {

            var frameWin = frame.getWindow();
            var frameDoc = frame.getDocument();

            // add keyboard handling
            if (typeof KeyManager == 'object') {
                KeyManager.attachListener(YAHOO.env.ua.gecko ? frameWin : frameDoc);
            }

            update();
            Dialog.onLoad.fire(frame);

            if (Util.Browser.isChromeOS()) {
                $(Util.Frame.getFrames(frame)).each(function () {
                    $(this).contents().on('contextmenu', function () {
                        return false;
                    });
                });
            }
        });

        return frame;
    }

    // show content dialog
    Dialog.show = function(id, bankKey, itemKey) {

        // make sure audio isn't playing
        if (TDS.Audio.isActive()) {
            if (window.TestShell) {
                TestShell.UI.showWarning(ErrorCodes.get('NavigateAudioPlaying'));
            }
            return;
        }

        // stop any TTS that is playing 
        if (TTS.getInstance().isPlaying()) {
            TTS.getInstance().stop();
        }
        
        // hide context menu
        CM.Menu.hide();

        // show tutorial frame
        var frame = load(id, bankKey, itemKey);
        Dialog.onBeforeShow.fire(frame);
        frame.show();

        YUD.addClass('dialogContent', 'enable');
        // YUD.addClass(TestShell.Frame.getBody(), TestShell.UI.CSS.dialogShowing);
        YUE.addListener('dialogContentClose', 'click', Dialog.hide);

        currentFrame = frame;
        update();
        Dialog.onShow.fire(frame);
    };

    // hide content dialog
    Dialog.hide = function() {

        if (currentFrame == null) return;

        Dialog.onBeforeHide.fire(currentFrame);
        currentFrame.hide();

        YUD.removeClass('dialogContent', 'enable');
        // YUD.removeClass(TestShell.Frame.getBody(), TestShell.UI.CSS.dialogShowing);
        YUE.purgeElement('dialogContentClose');

        Dialog.onHide.fire(currentFrame);
        currentFrame = null;
        Util.Dom.focusWindow(2); // (BUG #26524)
    };

    // are we showing the dialog right now?
    Dialog.isShowing = function() {
        return YUD.hasClass('dialogContent', 'enable');
    };

    // check if an element is contained in the current content frame
    Dialog.containsElement = function(el) {

        // make sure dialog is open and valid element passed in
        if (!currentFrame || !el || !el.ownerDocument) {
            return false;
        }

        var frameDoc = currentFrame.getDocument();
        return (frameDoc == el.ownerDocument);
    };
    
    Dialog.onLoad.subscribe(function(frame)
    {
        var frameWin = frame.getWindow();
        var frameDoc = frame.getDocument();

        // guide to revision
        if (frame.id.indexOf('gtr', 0) != -1)
        {
            var container = frameDoc.getElementById('pageLayout');

            YUE.delegate(container, 'click', function(ev, li, container) {
                YUD.toggleClass(li, 'checked');
            }, 'li');
        }

    });

    // expose externally
    CM.Dialog = Dialog;
    window.DialogContent = Dialog; // <-- deprecated

})(ContentManager);


/*************************************************************************************************/
// Content manager direct callbacks:

// item resource
function tdsItemResource(name, bankKey, itemKey)
{
    // hide any tools
    TDS.ToolManager.hideAll();
    
    if (ContentManager.Dialog.isShowing()) {
        ContentManager.Dialog.hide();
    } else {
        var id = name + '_' + bankKey + '_' + itemKey;
        ContentManager.Dialog.show(id, bankKey, itemKey);
    }
}
