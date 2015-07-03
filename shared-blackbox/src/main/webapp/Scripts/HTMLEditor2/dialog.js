//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************

CKEDITOR.on('template', function (e) {

    var data = e.data;

    if (data.name == 'dialog') {
        // This replaces the original CKEditor dialog template that uses <table> tags with <div> tags for WCAG.
        // The original template can be found here:
        //   http://docs.ckeditor.com/source/plugin78.html
        // by searching for the variable 'templateSource' and has also been copied/commented out below.
        /*
        var templateSource = '<div class="cke_reset_all {editorId} {editorDialogClass} {hidpi}' +
            '" dir="{langDir}"' +
            ' lang="{langCode}"' +
            ' role="dialog"' +
            ' aria-labelledby="cke_dialog_title_{id}"' +
            '>' +
            '<table class="cke_dialog ' + CKEDITOR.env.cssClass + ' cke_{langDir}"' +
                ' style="position:absolute" role="presentation">' +
                '<tr><td role="presentation">' +
                '<div class="cke_dialog_body" role="presentation">' +
                    '<div id="cke_dialog_title_{id}" class="cke_dialog_title" role="presentation"></div>' +
                    '<a id="cke_dialog_close_button_{id}" class="cke_dialog_close_button" href="javascript:void(0)" title="{closeTitle}" role="button"><span class="cke_label">X</span></a>' +
                    '<div id="cke_dialog_tabs_{id}" class="cke_dialog_tabs" role="tablist"></div>' +
                    '<table class="cke_dialog_contents" role="presentation">' +
                    '<tr>' +
                        '<td id="cke_dialog_contents_{id}" class="cke_dialog_contents_body" role="presentation"></td>' +
                    '</tr>' +
                    '<tr>' +
                        '<td id="cke_dialog_footer_{id}" class="cke_dialog_footer" role="presentation"></td>' +
                    '</tr>' +
                    '</table>' +
                '</div>' +
                '</td></tr>' +
            '</table>' +
            '</div>';
        */

        data.source = '<div class="cke_reset_all {editorId} {editorDialogClass} {hidpi} overridetest" dir="{langDir}" lang="{langCode}" role="dialog" aria-labelledby="cke_dialog_title_{id}">' +
            '<div class="cke_dialog ' + CKEDITOR.env.cssClass + ' cke_{langDir}">' +
                '<div><div><div>' +
                '<div class="cke_dialog_body">' +
                    '<div id="cke_dialog_title_{id}" class="cke_dialog_title"></div>' +
                    '<a id="cke_dialog_close_button_{id}" class="cke_dialog_close_button" href="javascript:void(0)" title="{closeTitle}" role="button"><span class="cke_label">X</span></a>' +
                    '<div id="cke_dialog_tabs_{id}" class="cke_dialog_tabs" role="tablist"></div>' +
                    '<div class="cke_dialog_contents">' +
                        '<div>' +
                            '<div>' +
                                '<div id="cke_dialog_contents_{id}" class="cke_dialog_contents_body"></div>' +
                            '</div>' +
                            '<div>' +
                                '<div id="cke_dialog_footer_{id}" class="cke_dialog_footer"></div>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
                '</div></div></div>' +
            '</div>' +
            '</div>';
    }
});
