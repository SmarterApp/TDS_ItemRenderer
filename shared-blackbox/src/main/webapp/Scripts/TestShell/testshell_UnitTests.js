TestShell.UnitTests =
{
};

TestShell.UnitTests.takeTest = function()
{
    /*TestShell.PageManager.Events.subscribe('onShow', function(page)
    {
        
    });*/
};

TestShell.UnitTests.answerPage = function()
{
    if (TDS.Audio.isActive()) {
        TDS.Audio.stopAll();
    }

    var page = TestShell.PageManager.getCurrent();
    if (!page || !page.hasContent()) return;

    Util.Array.each(page.items, function(item)
    {
        // if (response.isValid) return; // already responded to
        var contentItem = item.getContentItem();
        var answered = TestShell.UnitTests.answerItem(contentItem);
    });

    YAHOO.util.UserAction.click('btnNext');
};

TestShell.UnitTests.answerItem = function(contentItem)
{
    // Util.dir(contentItem);

    var contentPage = contentItem.getPage();
    var contentDoc = contentPage.getDoc();
    var itemContainer = contentItem.getElement();

    // Item_OptionContainer_Response_MC_1_A
    if (contentItem.format == 'MC' || contentItem.format == 'MS')
    {
        var optionContainer = contentDoc.getElementById('Item_OptionContainer_Response_MC_' + contentItem.position + '_A');
        YAHOO.util.UserAction.click(optionContainer);

        return true;
    }

    if (contentItem.format == 'WB')
    {
        var textKeyboard = contentDoc.forms['contentForm']['textbox1_item_' + contentItem.itemKey];

        // get the first allowed character
        var spanKeyValue = Util.Dom.getElementByClassName('keyvalue', 'span', itemContainer);
        var keyText = Util.Dom.getTextContent(spanKeyValue);
        textKeyboard.value = keyText; // above stuff stopped working in later FF's
        return true;
    }

    if (contentItem.responseType == 'PlainText')
    {
        var textBox = contentDoc.forms['contentForm']['Item_Response_' + contentItem.position];
        
        if (textBox) {
            textBox.value = 'Test...';
        }
        
        return true;
    }
    
    // 
    if (contentItem.responseType == 'EquationEditor') {
        
        var btnEqNum = document.getElementById('Controls_Content_Row_EquationEditor_' + contentItem.position + '_0_0_btn_0');

        if (btnEqNum) {
            YAHOO.util.UserAction.click(btnEqNum);
        }
        
        return true;
    }
    
    if (contentItem.responseType == 'Grid') {

        var grid = contentItem.grid;

        var regions = grid.model.getRegions();
        var canvasImages = grid.model.getImages();
        var paletteImages = grid.model.getPaletteImages();

        // check if this has regions
        if (regions.length > 0)
        {
            // select first region
            regions[0].select();
            return true;
        }
        
        // check if any preset canvas images
        if (canvasImages.length > 0)
        {
            // move a little bit
            canvasImages[0].moveLeft(5);
            return true;
        }
        
        // add palette image if any
        if (paletteImages.length > 0) {
            grid.model.addImage(paletteImages[0].name, 50, 50);
        }
        
        // add point if the button is enabled
        if (grid.model.options.showButtons.indexOf('point') != -1) {
            grid.model.addPoint(10, 10);
        }

        return false;
    }

    if (contentItem.responseType == 'Microphone')
    {
        if (TDS.Audio.isActive()) return;

        var btnRecord = Util.Dom.getElementByClassName('btnRecord', 'a', itemContainer);

        // start recording
        YAHOO.util.UserAction.click(btnRecord);

        var forceRecording = function()
        {
            // "The recording is too soft."
            if (YUD.hasClass(document, 'showingDialog'))
            {
                var buttons = document.getElementsByTagName('button');

                Util.Array.each(buttons, function(button)
                {
                    var buttonText = Util.Dom.getTextContent(button);
                    Util.log(buttonText);

                    if (buttonText == 'Keep It')
                    {
                        YAHOO.util.UserAction.click(button);
                    }
                });
            }

            // answer page again but this time the audio question should be skipped as its a valid response
            setTimeout(function()
            {
                TestShell.UnitTests.answerPage();
            }, 1000);
        }

        var saveRecording = function()
        {
            // manually save response
            YAHOO.util.UserAction.click('btnSave');
            setTimeout(forceRecording, 1000);
        }

        var stopRecording = function()
        {
            // stop recording
            YAHOO.util.UserAction.click(btnRecord);
            setTimeout(saveRecording, 1000);
        }

        setTimeout(stopRecording, 1000);

        return false;
    }
    
    if (contentItem.responseType == 'HotText') {
        contentItem.interactions[0].getChoices()[0].select();
    }

    if (contentItem.responseType == 'MatchItem') {
        var row1 = contentItem.MatchItem.getRow(0);
        var col1 = contentItem.MatchItem.getColumn(0);
        
        YAHOO.util.UserAction.click(row1.element);
        YAHOO.util.UserAction.click(col1.element);
    }

    return false;
};

// add button for answering test
TestShell.Events.subscribe('init', function() {

    TestShell.UI.addButtonControl({
        id: 'btnAnswerPage',
        label: 'Answer',
        fn: TestShell.UnitTests.answerPage
    });

    TestShell.UI.addButtonControl({
        id: 'btnRefresh',
        label: 'Refresh',
        fn: function() {
            var pageNum = TestShell.PageManager.getCurrent().pageNum;
            TDS.redirectTestShell(pageNum);
        }
    });

});