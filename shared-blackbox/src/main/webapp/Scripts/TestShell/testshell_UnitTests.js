//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
﻿TestShell.UnitTests = (function(TS) {

    var responders = {};

    function register(name, responder) {
        responders[name] = responder;
    }

    function answerItem(contentItem) {
        var widgetNames = contentItem.widgets.getNames();
        widgetNames.forEach(function(widgetName) {
            var responder = responders[widgetName];
            if (responder) {
                var widgets = contentItem.widgets.get(widgetName);
                widgets.forEach(function(widget) {
                    responder(contentItem, widget);
                });
            }
        });
    }

    function answerPage() {
        
        if (TDS.Audio.isActive()) {
            TDS.Audio.stopAll();
        }

        var page = TestShell.PageManager.getCurrent();
        if (!page || !page.hasContent()) return;

        page.items.forEach(function (item) {
            var contentItem = item.getContentItem();
            if (contentItem && contentItem.isShowing()) {
                try {
                    answerItem(contentItem);
                } catch (ex) {
                    console.error(ex);
                }
            }
        });

        YAHOO.util.UserAction.click('btnNext');

    }

    ///////////////////////////

    function generateChars(count) {
        count = count || 10;
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for (var i = 0; i < count; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    }

    function responderRandomChars(item, widget) {
        widget.setResponse(generateChars());
    }

    function setRandomSelections(list) {
        list.forEach(function (obj) {
            obj.deselect();
        });
        list = Util.Array.shuffle(list);
        list[0].select();
    }

    // Multiple Choice/Select
    register('mc', function (item, widget) {
        var options = widget._group.getOptions();
        setRandomSelections(options);
    });

    register('wordbuilder', responderRandomChars);
    register('plaintext', responderRandomChars);

    register('equationeditor', function (item, widget) {
        var eq = widget.eq;
        $('.keypad-item', eq.el).first().click();
    });

    register('select', function(item, widget) {
        var choices = widget.interaction.getChoices();
        setRandomSelections(choices);
    });

    register('matchitem', function(item, widget) {
        var mi = widget.matchItem;
        var inputs = mi.getComponentArray(); // <input> checkboxes

        // deselect all inputs
        inputs.forEach(function(input) {
            if (input.checked) {
                $(input).click(); // deselect
            }
        });

        // select a random input
        inputs = Util.Array.shuffle(inputs);
        $(inputs[0]).click();
    });

    register('ebsr', function(item, widget) {
        var interactions = widget.ebsr.getInteractions();
        interactions.forEach(function(interaction) {
            setRandomSelections(interaction.options._options);
        });
    });

    register('scaffolding', function(item, widget) {
        // TODO: Choose randomly
        widget.scaffolding.startInteraction('A B');
    });

    register('grid', function (item, widget) {

        var grid = widget.grid;
        var regions = grid.model.getRegions();
        var canvasImages = grid.model.getImages();
        var paletteImages = grid.model.getPaletteImages();

        // check if this has regions
        if (regions.length > 0) {
            // select first region
            regions[0].select();
            return;
        }

        // check if any preset canvas images
        if (canvasImages.length > 0) {
            // move a little bit
            canvasImages[0].moveLeft(5);
            return;
        }

        // add palette image if any
        if (paletteImages.length > 0) {
            grid.model.addImage(paletteImages[0].name, 50, 50);
        }

        // add point if the button is enabled
        if (grid.model.options.showButtons.indexOf('point') != -1) {
            grid.model.addPoint(10, 10);
        }
    });

    /*
    // TODO: This needs work.. Andrew?
    register('recorder', function(item, widget) {

        if (TDS.Audio.isActive()) return;

        var btnRecord = Util.Dom.getElementByClassName('btnRecord', 'a', itemContainer);

        // start recording
        YAHOO.util.UserAction.click(btnRecord);

        var forceRecording = function () {
            // "The recording is too soft."
            if (YUD.hasClass(document, 'showingDialog')) {
                var buttons = document.getElementsByTagName('button');

                Util.Array.each(buttons, function (button) {
                    var buttonText = Util.Dom.getTextContent(button);
                    Util.log(buttonText);

                    if (buttonText == 'Keep It') {
                        YAHOO.util.UserAction.click(button);
                    }
                });
            }

            // answer page again but this time the audio question should be skipped as its a valid response
            setTimeout(function () {
                TestShell.UnitTests.answerPage();
            }, 1000);
        }

        var saveRecording = function () {
            // manually save response
            YAHOO.util.UserAction.click('btnSave');
            setTimeout(forceRecording, 1000);
        }

        var stopRecording = function () {
            // stop recording
            YAHOO.util.UserAction.click(btnRecord);
            setTimeout(saveRecording, 1000);
        }

        setTimeout(stopRecording, 1000);

    });*/

    ///////////////////////

    function refreshPage() {
        TDS.unloader.disable();
        var pageNum = 0,
            itemNum = 0;
        var page = TestShell.PageManager.getCurrent();
        if (page) {
            pageNum = page.pageNum;
            page.items.forEach(function (item) {
                if (item.getContentItem().isActive()) {
                    itemNum = item.position;
                }
            });
        }
        TDS.redirectTestShell(pageNum, itemNum);
    }

    // add button for answering test
    TestShell.Events.subscribe('init', function () {

        TestShell.UI.addButtonControl({
            id: 'btnAnswerPage',
            label: 'Answer',
            fn: answerPage
        });

        TestShell.UI.addButtonControl({
            id: 'btnRefresh',
            label: 'Refresh',
            fn: refreshPage
        });

    });

})(window.TestShell);

