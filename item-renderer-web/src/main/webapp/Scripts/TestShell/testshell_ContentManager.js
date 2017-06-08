//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
﻿/*
This file is used to hook up the test shell to the content manager. It should contain all the event
subscriptions.
*/

// right when the content is rendered add test shell css
ContentManager.onPageEvent('Rendered', function(contentPage)
{
    // get content doc
    var contentDoc = contentPage.getDoc();
    if (contentDoc == null) return;

    // get content body
    var contentBody = contentDoc.body;

    // make sure body isn't same as test shells
    if (document.body != contentBody)
    {
        // apply test shell's css
        contentBody.className = TestShell.UI.defaultBodyCSS;
        YUD.removeClass(contentBody, 'showingLoading'); // don't need this
        
        // subscribe to content window onerror
        var contentWin = contentPage.getWin();
        TDS.Diagnostics.addErrorHandler(contentWin);
    }
});

// set no tabindex for the first header 
// (REVIEW: do we still need this code? I think it only for early accessibility)
ContentManager.onItemEvent('available', function(contentPage, item)
{
    var pageHeader = contentPage.getHeader();
    if (pageHeader) pageHeader.setAttribute('tabindex', '-1');
});

// when the html content has finished loading then setup the page
ContentManager.onPageEvent('loaded', function(contentPage)
{
    var group = TestShell.PageManager.get(contentPage.id);
    var pageWin = contentPage.getWin();
    var pageDoc = contentPage.getDoc();

    // create sound cue if needed
    group.createSoundCue();

    // check if the pages window object is different than the current window
    if (window != pageWin) {
        
        // add keyboard handling
        KeyManager.attachListener((YAHOO.env.ua.gecko) ? pageWin : pageDoc);

        // add listener for frame clicks/keyboard for idle timer
        TestShell.idleTimer.addListeners(pageWin);
    }

    // show the iframe if we are waiting for it
    TestShell.Navigation.requestPage();
});

// log any missing html images
ContentManager.onPageEvent('loaded', function(contentPage)
{
    // get missing image files
    var contentRenderer = contentPage.getRenderer();
    var missingImages = [];
    missingImages.push(contentRenderer.getImagesFailed());
    missingImages.push(contentRenderer.getImagesAborted());
    missingImages = Util.Array.flatten(missingImages);

    var missingFiles = [];

    for (var i = 0; i < missingImages.length; i++)
    {
        var image = missingImages[i];

        var imageFile = image.src.split('/').pop().split('file=').pop();
        imageFile = '\'' + imageFile + '\'';

        missingFiles.push(imageFile);
    }

    if (missingFiles.length > 0)
    {
        TDS.Diagnostics.logServerError('CONTENT ' + contentPage.id + ': Missing Images - ' + missingFiles.join(', '));
    }
});

// WCAG: add required tag to items
ContentManager.onItemEvent('loaded', function (contentPage, contentItem) {
    var page = TestShell.PageManager.get(contentPage.id);
    if (page instanceof TestShell.PageGroup) {
        var item = page.getResponse(contentItem.position);
        if (item) {
            var msg;
            if (item.isRequired || page.items.length == page.numRequired) {
                msg = Messages.getAlt('TDSContentJS.Label.QuestionRequired', 'Required: Question Number');
            } else {
                msg = Messages.getAlt('TDSContentJS.Label.QuestionOptional', 'Question Number');
            }
            contentItem.setQuestionHeader(msg);
        }
    }
});

// log any missing grid images
ContentManager.onItemEvent('loaded', function(contentPage, item)
{
    // check if grid item
    if (item.grid == null) return;

    // function for getting grid images
    var getGridImages = function()
    {
        var images = [];

        // get all background images
        images = images.concat(item.grid.question.getBackgroundImages());

        // get all pallete images
        images = images.concat(item.grid.question.getPaletteImages());

        // get all hotspot images (only in grid v2)
        if (YAHOO.lang.isFunction(item.grid.question.getRegionsImages))
        {
            // get all regions images
            images = images.concat(item.grid.question.getRegionsImages());
        }

        return images;
    };

    // function for getting grid images that didn't load
    var getMissingImages = function()
    {
        var images = getGridImages();
        var missingImages = [];

        // filter images by ones that have invalid width/height
        for (var i = 0; i < images.length; i++)
        {
            var gridImage = images[i];
            if (gridImage == null) continue;
            var isValidImage = (gridImage.width > 0 && gridImage.height > 0);
            if (!isValidImage) missingImages.push(gridImage);
        }

        return missingImages;
    };

    // log images that didn't load
    var logMissingImages = function(message, missingImages)
    {
        var missingFiles = [];

        // parse out the image file names from the image url
        if (YAHOO.lang.isArray(missingImages))
        {
            for (var i = 0; i < missingImages.length; i++)
            {
                var image = missingImages[i];
                if (image == null) continue;
                
                var imageUrl = null;

                // get url of grid model object
                if (image.url) imageUrl = image.url;
                // get url of DOM <img>
                else if (image.src) imageUrl = image.src;
                // get url of SVG <image>
                else if (image.href) imageUrl = image.getAttribute('xlink:href');

                // make sure there is a url
                if (imageUrl == null) continue;

                // split file
                if (imageUrl.indexOf('file=') != -1)
                {
                    imageUrl = imageUrl.split('file=')[1];
                }

                imageUrl = '"' + imageUrl + '"';

                if (missingFiles.indexOf(imageUrl) == -1)
                {
                    missingFiles.push(imageUrl);
                }
            }
        }

        // log missing image file names
        if (missingFiles.length > 0)
        {
            var serverError = 'GRID I-' + item.bankKey + '-' + item.itemKey + ': ' + message + ' - ' + missingFiles.join(', ');
            TDS.Diagnostics.logServerError(serverError);
        }
    };

    // state changes
    item.grid.subscribe('onStateChange', function(gridEvt)
    {
        // check if grid is loaded
        if (gridEvt.state == GridState.Loaded)
        {
            // check for missing images
            var imageErrors = getMissingImages();

            if (imageErrors.length > 0)
            {
                var errorData = { message: 'Error with dimensions of images', values: imageErrors };
                item.grid._setState(GridState.Error, errorData);
            }
            else if (YAHOO.lang.isFunction(item.grid.validate))
            {
                // validate the grids data
                item.grid.validate();
            }
        }
        // check if grid error
        else if (gridEvt.state == GridState.Error)
        {
            // check if we should log
            if (gridEvt.data)
            {
                logMissingImages(gridEvt.data.message, gridEvt.data.values);
            }

            // check if this item is currently being viewed and if it is show error message
            var currentGroup = TestShell.PageManager.getCurrent();

            if (currentGroup != null)
            {
                var currentContentPage = currentGroup.getContentPage();

                if (currentContentPage != null && currentContentPage == item.getPage())
                {
                    // show error dialog
                    TestShell.UI.showContentError();
                }
            }
        }
    });
});

// Listen for key events in HTML editor and reset idle timer
// TODO: Fix code below so it works with CKEditor
/*
ContentManager.onItemEvent('ready', function(contentPage, item)
{
    if (!item.editor) return;
    
    var editorWin = item.editor._getWindow();
    var editorDoc = item.editor._getDoc();
    
    // add keyboard handling
    KeyManager.attachListener((YAHOO.env.ua.gecko) ? editorWin : editorDoc);

    // hookup timeout to editor window
    if (item.editor)
    {
        TestShell.idleTimer.addListeners(editorWin);
    }
});
*/

// check if page has everything required to show it
ContentManager.onPageEvent('beforeShow', function(contentPage) {

    // check if any of the pages passage or items had errors
    var entities = contentPage.getEntities();
    var errors = Util.Array.mapFlatten(entities, function (entity) {
        return entity.getErrors();
    });
    if (errors.length > 0) {
        // show error and don't allow them to retry (since most likely a JS error)
        TestShell.UI.showContentError(true);
        TDS.Diagnostics.report(errors[0].ex);
        return false;
    }

    // check if any html content images failed to load
    var contentRenderer = contentPage.getRenderer();
    if (contentRenderer.getImagesFailed().length > 0 ||
        contentRenderer.getImagesAborted().length > 0)
    {
        // show error and they have to log out
        TestShell.UI.showContentError();
        return false;
    }

    var resourceLoaders = contentRenderer.getResourceLoaders();
    
    // check if any resource loaders failed
    if (resourceLoaders.hasLoaders() && 
        resourceLoaders.getStatus() != ResourceLoader.Status.COMPLETE)
    {
        // show error and they have to log out
        TestShell.UI.showContentError();
        return false;
    }

    // check if any missing grid images
    var items = contentPage.getItems();

    for (var i = 0; i < items.length; i++)
    {
        var item = items[i];

        // check if grid
        if (item.grid)
        {
            // check if grid error occured
            if (item.grid.getState() == GridState.Error)
            {
                // show error and they have to log out
                TestShell.UI.showContentError();
                return false;
            }
        }
    }
    
    // WCAG Requirement - Update page title
    var page = TestShell.PageManager.get(contentPage.id);

    var title = Messages.getAlt(TestShell.UI.PageTitle, "Student: Test");
    var text = page.getPageTitle();
    if (text) {
        title = title + ', ' + text;
    }
    document.title = title;

    return true;

}, true);  // <-- allow cancellable

// listen for when page content is shown (contentmanager) and refire event from the PageManager
ContentManager.onPageEvent('show', function(contentPage)
{
    // fire the test shell version of the onShow event
    var page = TestShell.PageManager.get(contentPage.id);
    if (page) {
        TestShell.PageManager.Events.fire('onShow', page);
    }
});

ContentManager.onPageEvent('beforeHide', function(contentPage)
{
    // BUG #15249: Context/Global menu remains opened when navigating to other pages using keyboard shortcuts
    ContentManager.Menu.hide(); // context menu
});

// listen for when page content is hidden (contentmanager) and refire event from the PageManager
ContentManager.onPageEvent('hide', function(contentPage)
{
    // fire the test shell version of the onHide event
    var page = TestShell.PageManager.get(contentPage.id);
    if (page) {
        TestShell.PageManager.Events.fire('onHide', page);
    }
});

// hide content dialog when menu key is pressed
ContentManager.onEntityEvent('menushow', function(contentPage, entity, menu, evt)
{
    // check if tutorial is showing don't show context menu
    if (ContentManager.Dialog.isShowing()) {
        menu.cancel = true; // cancel menu
    }
});

// this is fired when the page is completed and cannot be responded to anymore
ContentManager.onPageEvent('completed', function(contentPage) {
    // go to the next page
    TestShell.Navigation.next();
});

// item focus save code
(function(CM, TS) {

    // save when changing item focus in content manager
    function onEntityFocus(contentPage, currentEntity, previousEntity) {
        // when previousEntity is not null and it is an item then
        // we just came from an item and we should try and save it
        if (TS.Config.saveOnFocusChange && previousEntity instanceof ContentItem) {
            var previousItem = TS.PageManager.getItem(previousEntity);
            if (previousItem) {
                TS.save(TS.SaveRequest.FocusChange, [previousItem]);
            }
        }
    }
    
    CM.onEntityEvent('focus', onEntityFocus);

})(window.ContentManager, window.TestShell);

// hook up spell check code
(function(window) {

    // check for spellcheck
    if (!window.SpellCheck) return;

    var SpellXhr = window.SpellCheck.XHR;

    // show/hide spell check progress screen
    SpellXhr.onRequest.subscribe(function() {
        TestShell.UI.showLoading('');
    });

    SpellXhr.onComplete.subscribe(function() {
        TestShell.UI.hideLoading();
    });    

})(window);

/*************************************************************************************************/

ContentManager.Dialog.onShow.subscribe(function() 
{
    YUD.addClass(document.body, TestShell.UI.CSS.dialogShowing);
});

ContentManager.Dialog.onHide.subscribe(function() 
{
    YUD.removeClass(document.body, TestShell.UI.CSS.dialogShowing);
});

/*************************************************************************************************/
// Content manager direct callbacks:

function tdsUpdateItemResponse(position, value)
{
    var response = TestShell.PageManager.getResponse(position);
    response.setValue(value);

    Util.log('tdsUpdateItemResponse: ' + position + ' - \'' + response.value + '\' (' + response.sequence + ')');

    TestShell.ResponseManager.sendResponse(response);
}

function tdsUpdateItemMark(position, marked)
{
    var response = TestShell.PageManager.getResponse(position);
    response.mark = marked;

    // update dropdown
    TestShell.UI.updateControls();
    
    // show loading screen
    TestShell.UI.showLoading('');
    
    // send xhr
    var markData = { position: position, mark: marked };
    TestShell.xhrManager.markForReview(markData);
}

// remove item response
function tdsRemoveResponse(position)
{
    var itemResponse = TestShell.PageManager.getResponse(position);
    if (itemResponse == null) return;

    // check if this response is being saved
    if (TestShell.ResponseManager.getPendingResponses().indexOf(itemResponse) != -1 ||
        TestShell.ResponseManager.getOutgoingResponses().indexOf(itemResponse) != -1)
    {
        // show a message telling student to wait for response to save
        var resetWaitMsg = Messages.get('TestShell.Label.RemoveResponseWait');
        TDS.Dialog.showAlert(resetWaitMsg);
        return;
    }

    var itemData = {
        position: itemResponse.position,
        itemID: itemResponse.id,
        pageKey: itemResponse.page.pageKey
    };

    var resetResponse = function()
    {
        // call server to remove response
        TestShell.xhrManager.removeResponse(itemData, function(data, reply) {
            // check if remove was successful
            if (reply != null && reply.replyCode === 0)
            {
                // show progress
                TestShell.UI.showLoading(Messages.getAlt('UI.ReloadingContent', 'Reloading the page content.'));
                // reset response data
                itemResponse.reset();
                // reload content
                itemResponse.page.requestContent(true);
            }
        });
    };
    
    // show warning and then reset
    var resetMsg = Messages.get('TestShell.Label.RemoveResponseWarning');
    TDS.Dialog.showPrompt(resetMsg, resetResponse);
}

/*******************************************************************************/
/* FLASH HACKS */
/*******************************************************************************/

// stop flash from playing when opening tutorials
TestShell.Events.subscribe('init', function()
{
    ContentManager.Dialog.onShow.subscribe(function()
    {
        VideoManager.SWF.stopPlaying();
    });
});

// stop flash from playing when TTS starts playing
TTS.Manager.Events.onStatusChange.subscribe(function(currentStatus)
{
    if (currentStatus == TTS.Status.Playing)
    {
        VideoManager.SWF.stopPlaying();
    }
});
