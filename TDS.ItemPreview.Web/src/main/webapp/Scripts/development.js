function forceSnapping()
{
    // get current item
    var page = BlackboxWin.ContentManager.getCurrentPage();
    if (!page) return;

    var currentItem = page.getActiveEntity();

    if (currentItem && currentItem.grid2)
    {
        currentItem.grid2.question.options.snapToGrid = true;
        currentItem.grid2.ui.createGridLines(currentItem.grid2.question.options.gridSpacing);
    }
}

function showSnapPoints()
{
    // get current item
    var page = BlackboxWin.ContentManager.getCurrentPage();
    if (!page) return;

    var currentItem = page.getActiveEntity();
    
    // check if this is a grid item
    if (!currentItem || !currentItem.grid) return;

    var grid = currentItem.grid;
    
    var snapPoints = grid.question.getSnapPoints();

    for (var i = 0; i < snapPoints.length; i++)
    {
        var snapPoint = snapPoints[i];
        grid.ui.removeElement(snapPoint.getID());
        grid.ui.createSnapPoint(snapPoint.getID(), snapPoint.x, snapPoint.y, snapPoint.snapRadius);
    }

    if (snapPoints.length == 0) alert('No snappoints');
}

function showSelectedTTS(selected) {
    
    var TTS = BlackboxWin.TTSManager;
    var text = selected ? TTS.getSelectedText() :
                          TTS.getComponentText();

    text = YAHOO.lang.trim(text);

    if (text == null || text == '') {
        text = 'NO TTS';
    }

    if (typeof console == 'object') {
        console.log(text);
    } else {
        alert(text);
    }
}


/*
* Measurment Tools: Ruler and Protractor Tool Toggle Buttons
*/
function toggleRuler(event) {

    var page = BlackboxLoader.getWin().ContentManager.getCurrentPage();
    if (!page) return;
    if (!page.ruler) return;
    page.MT_toggleRuler(event, page);
}
function toggleProtractor(event) {

    var page = BlackboxLoader.getWin().ContentManager.getCurrentPage();
    if (!page) return;
    if (!page.protractor) return;
    page.MT_toggleProtractor(event, page);
}

/************************************************************/

function getScreenshot(element, type /* image/png, image/jpeg */)
{
    type = type || 'image/png';

    // about:config - 'signed.applets.codebase_principal_support' needs to equal true
    netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");

    var doc = element.ownerDocument;
    var win = doc.defaultView;

    // get element info
    var boundingBox = element.getClientRects()[0]; // element.getBoundingClientRect()
    var left = boundingBox.left + win.scrollX;
    var top = boundingBox.top + win.scrollY;
    var width = boundingBox.width;
    var height = boundingBox.height;

    // var w = content.innerWidth + content.scrollMaxX;
    // var h = content.innerHeight + content.scrollMaxY;
    // console.log('w/h: ' + width + '/' + height + ' boxLeft/top: ' + boundingBox.left + '/' + boundingBox.top + ' offsetLeft/Top: ' + element.offsetLeft + '/' + element.offsetTop + ' scrollMaxX/Y: ' + frame.scrollMaxX + '/' + frame.scrollMaxY);

    // create canvas
    var canvas = doc.createElement("canvas");
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    canvas.width = width;
    canvas.height = height;

    // take screenshot
    var ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, width, height);
    ctx.save();
    // ctx.scale(0.3, 0.3);
    ctx.drawWindow(win, left, top, width, height, "rgb(255,255,255)");
    ctx.restore();

    return canvas.toDataURL(type);
}

function openScreenshot()
{
    var page = BlackboxLoader.getContentManager().getCurrentPage();
    var pageDoc = page.getDoc();
    var pageElement = page.getElement();

    var entity = page.getActiveEntity();
    var entityElement = entity.getElement();

    // FIX: must set overflow on the questions <div> to 'inherit' for screenshot to work
    var divQuestions = pageDoc.getElementById('theQuestions');
    YAHOO.util.Dom.setStyle(divQuestions, 'overflow', 'inherit');

    // get screenshot
    var dataUrl = getScreenshot(entityElement);

    // FIX: set overflow back to 'auto'
    YAHOO.util.Dom.setStyle(divQuestions, 'overflow', 'auto');

    // open popup with image
    var popup = window.open('', 'name', 'width=600, height=500');
    var popupDoc = popup.document;
    popupDoc.write('<html><head><title>Screenshot</title></head>');
    popupDoc.write('<body>');
    popupDoc.write('<img src="' + dataUrl + '" />');
    popupDoc.write('</body></html>');
    popupDoc.close();
}

// Attempt at FF 2 getClientRects replacement
function getCoords(element)
{
    var coords = { left: 0, top: 0, width: element.offsetWidth, height: element.offsetHeight };

    while (element)
    {
        coords.left += element.offsetLeft;
        coords.top += element.offsetTop;
        element = element.offsetParent;
    }

    return coords;
}

function save()
{
    var blackboxFrame = frames['blackbox'];
    var page = blackboxFrame.ContentManager.getCurrentPage();
    var item = page.getActiveEntity();

    // make sure the active entity is an item and not passage
    if (item instanceof blackboxFrame.ContentPassage) return;

    var response = item.getResponse();
    if (!response) return; // no response

    // save response to shell array
    var contentIndex = document.getElementById('ddlNavigation').value;

    if (contentIndex >= 0)
    {
        var content = contents[contentIndex];
        content.Items[0].response = response.value;

        if (item.grid2)
        {
            item.grid2.question.clearResponse();
            item.grid2.importexport.loadAnswer(response.value);
        }

        if (typeof console == 'object') console.log('SAVE: ' + response.value);
    }
};

/************************************************************/

// get the current item request for the active item
function getDropdownContentRequestItem(page, item) {

    var contentItems = page.getItems();
    var itemIdx = contentItems.indexOf(item);

    // check for matching content request item
    var contentRequest = ItemPreview.Navigation.getCurrentPage();

    if (contentRequest.items != null) {
        return contentRequest.items[itemIdx];
    }

    return null;
}

function openResponseDialog()
{
    // get blackbox doc
    if (BlackboxDoc == null)
    {
        alert('Blackbox document is not ready.');
        return;
    }

    // get current page
    var currentPage = ContentManager.getCurrentPage();
    
    if (currentPage == null)
    {
        alert('Not viewing a page.');
        return;
    }
    
    // get current item
    var currentItem = currentPage.getActiveEntity();

    if (currentItem == null)
    {
        alert('No active items.');
        return;
    }

    // check if passage
    if (currentItem instanceof BlackboxWin.ContentPassage)
    {
        alert('Cannot get a response for a passage.');
        return;
    }

    // check if item has response handler
    var responseHandler = ContentManager.getResponseHandler(currentItem.responseType);

    if (responseHandler == null)
    {
        alert('No response handler for this item type.');
        return;
    }
    
    // get the json request for this item
    var contentRequestItem = getDropdownContentRequestItem(currentPage, currentItem);
    
    if (contentRequestItem == null)
    {
        alert('No matching item request found.');
        return;
    }
    
    // create dialog container
    var container = BlackboxDoc.getElementById('dlgResponse');

    if (container == null)
    {
        container = BlackboxDoc.createElement('div');
        container.setAttribute('id', 'dlgResponse');
        BlackboxDoc.body.appendChild(container);
    }
    
    // create dialog
    var dialog = new YAHOO.widget.SimpleDialog(container,
    {
        width: '700px',
        height: '500px',
        fixedcenter: true,
        modal: true,
        visible: false,
        draggable: false,
        close: false
    });
    
    var loadResponse = function()
    {
        var txtResponse = BlackboxDoc.getElementById('txtResponse');
        var itemResponse = currentItem.getResponse();
        txtResponse.value = itemResponse.value;
    };

    var saveResponse = function()
    {
        var txtResponse = BlackboxDoc.getElementById('txtResponse');
        currentItem.setResponse(txtResponse.value);
        
        var itemResponse = currentItem.getResponse();
        contentRequestItem.response = itemResponse.value;

        this.hide();
    };

    var handleCancel = function()
    {
        this.hide();
    };

    // add dialog buttons
    dialog.cfg.queueProperty("buttons",
    [
        { text: 'Save', handler: saveResponse, isDefault: true },
        { text: 'Cancel', handler: handleCancel }
    ]);

    // right before the dialog is shown replace buttons label with i18n text
    dialog.beforeShowEvent.subscribe(function()
    {
        loadResponse();
    });

    dialog.hideEvent.subscribe(function() {
        setTimeout(function() {
            dialog.destroy();
        }, 0);
    });

    dialog.setHeader('Response');
    dialog.setBody('<textarea id="txtResponse" style="width:100%; height:100%"></textarea>');

    dialog.render();
    dialog.show();
}
