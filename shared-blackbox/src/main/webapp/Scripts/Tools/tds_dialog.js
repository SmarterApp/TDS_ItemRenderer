//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
﻿TDS = window.TDS || {};

(function(TDS) {

    var CSS_SHOWING_PROGRESS = 'showingLoading';
    var CSS_SHOWING_DIALOG = 'showingDialog';
    
    // code to run when we show a dialog
    function onShowDialog() {
        YUD.addClass(document.body, CSS_SHOWING_DIALOG);
        TDS.ARIA.hideContent();
    }

    // code to run when we hide a dialog
    function onHideDialog() {
        YUD.removeClass(document.body, CSS_SHOWING_DIALOG);
        TDS.ARIA.showContent();
    }

    var progressDialog = new YAHOO.widget.Panel("yuiProgressDialog", {
        width: '240px',
        fixedcenter: true,
        close: false,
        draggable: false,
        modal: true,
        visible: false
    });

    progressDialog.showEvent.subscribe(function() {
        YUD.addClass(document.body, CSS_SHOWING_PROGRESS);
    });

    progressDialog.hideEvent.subscribe(function() {
        YUD.removeClass(document.body, CSS_SHOWING_PROGRESS);
    });

    function setProgressMessage(html) {
        if (html) {
            html = html + '<br/>';
        } else {
            html = '';
        }
        progressDialog.setBody(html); // + '<br/><img src="../shared/images/loadingAnimation.gif" />'
    }

    function showProgress(message) {
        progressDialog.setHeader(Messages.get('Global.Label.PleaseWait'));
        progressDialog.render(document.body);
        progressDialog.show();
        progressDialog.cfg.setProperty('zindex', 1004); // BUG: 33828
        setProgressMessage(message);
    }

    function hideProgress() {
        progressDialog.hide();
    }

    var dialog = new YAHOO.widget.SimpleDialog('yuiSimpleDialog', {
        width: '250px',
        fixedcenter: true,
        modal: true,
        visible: false,
        draggable: false,
        close: false,
        postmethod: 'none',
        usearia: true,
        role: 'dialog' // 'alertdialog'
        // labelledby: 'testby'
        // describedby: 'testby'
    });

    dialog.showEvent.subscribe(onShowDialog);
    dialog.hideEvent.subscribe(onHideDialog);

    // { header: '', buttons: [], text: '' }
    // { header: '', buttons: [], bodyHtml: '', formHtml: '' }
    function showObj(obj) {
        
        hideProgress();

        // if there are no buttons then add default button for closing
        var buttons;
        if (YAHOO.lang.isArray(obj.buttons)) {
            buttons = obj.buttons;
        } else {
            buttons = [{ text: 'Global.Label.OK', handler: function() {
                this.hide();
            }}];
        }

        // process buttons
        buttons.forEach(function (button) {
            if (button.text) {
                button.text = Messages.getAlt(button.text, button.altText);
            }
        });

        // get header
        var header;
        if (obj.header) {
            header = Messages.get(obj.header);
        } else {
            header = '';
        }

        // get body
        var html;
        if (obj.text) {
            // try and get i18n
            if (obj.altText) {
                html = Messages.getAlt(obj.text, obj.altText);
            } else {
                html = Messages.get(obj.text);
            }
            // parse template
            if (html.indexOf('#') != -1) {
                html = Messages.parse(html);
            }
        } else if (obj.bodyHtml) {
            html = obj.bodyHtml;
        } else {
            html = '';
        }

        dialog.cfg.queueProperty('buttons', buttons);
        dialog.setHeader(header);
        dialog.setBody(html);

        // set form data (do this after internal registerForm which is triggered by setBody)
        if (obj.formHtml) {
            dialog.form.innerHTML = obj.formHtml;
            if (obj.formHandler) {
                YUE.on(dialog.form, 'submit', obj.formHandler);
            }
        }

        dialog.render(document.body);
        dialog.show();
        dialog.cfg.setProperty('zindex', 1005); // BUG #33828

        return dialog;
    }

    function showDialog(header, message, buttons) {
        return showObj({
            text: message,
            header: header,
            buttons: buttons
        });
    }
    
    function showPrompt(message, funcYes, funcNo) {

        var header = 'Global.Label.Warning';

        var handleYes = function() {
            this.hide();
            if (YAHOO.lang.isFunction(funcYes)) {
                funcYes();
            }
        };

        var handleNo = function() {
            this.hide();
            if (YAHOO.lang.isFunction(funcNo)) {
                funcNo();
            }
        };

        // No, Yes
        var buttons = [
            { text: 'Global.Label.No', handler: handleNo, isDefault: true },
            { text: 'Global.Label.Yes', handler: handleYes }
        ];

        return showDialog(header, message, buttons);
    }

    // internal function
    function _showAlert(message, funcOk) {
        
        var handleOk = function() {
            this.hide();
            if (YAHOO.lang.isFunction(funcOk)) {
                funcOk();
            }
        };

        var buttons = [
            { text: 'Global.Label.OK', handler: handleOk }
        ];

        showDialog('Global.Label.Warning', message, buttons);
    }

    function showAlert(message, funcOk) {
        _showAlert(message, funcOk);
    }

    function showWarning(message, funcOk) {
        _showAlert(message, funcOk);
    }

    function showInput(message, cb) {

        var getDialogInput = function() {
            return Util.Dom.getElementByClassName('tds-dialogInput', 'input', dialog.form);
        };

        // set buttons
        var handleOk = function () {
            dialog.hide();
            if (YAHOO.lang.isFunction(cb)) {
                var dialogInput = getDialogInput();
                if (dialogInput) {
                    cb(dialogInput.value);
                }
            }
        };

        var handleCancel = function () {
            dialog.hide();
        };

        var buttons = [
            { text: 'Global.Label.Cancel', altText: 'Cancel', handler: handleCancel, isDefault: true },
            { text: 'Global.Label.Ok', altText: 'Ok', handler: handleOk }
        ];

        var bodyHtml = '<span class="tds-dialogMessage">' + message + '</span>';
        var formHtml = '<input class="tds-dialogInput" type="text"></input>';

        // show dialog
        showObj({
            header: '&nbsp;',
            bodyHtml: bodyHtml,
            formHtml: formHtml,
            formHandler: handleOk,
            buttons: buttons,
        });

        // set focus on input
        var dialogInput = getDialogInput();
        if (dialogInput) {
            setTimeout(function() {
                dialogInput.focus();
            }, 0);
        }
    }

    // call this function on a YUI dialog so the tab index is always set properly
    function fixTabIndex(dialog) {
        
        // WARNING: Don't change the order or type of events they are currently set to work best with YUI
        dialog.beforeShowEvent.subscribe(function() {
            this.setFirstLastFocusable();
            // var focusableElements = dialog.getFocusableElements();

            for (var i = 0; i < dialog.focusableElements.length; i++) {
                var focusableElement = dialog.focusableElements[i];
                focusableElement.setAttribute('tabindex', 0);
            }
        });

        dialog.showEvent.subscribe(function() {
            dialog.focusDefaultButton();
        });

        // set aria label
        dialog.beforeShowEvent.subscribe(function() {
            var usearia = dialog.cfg.getProperty('usearia');

            // add describedby pointing to the body
            if (usearia) {
                // NOTE: you must leave 'labelledby' pointing to the header as well
                var id = dialog.body.id || YUD.generateId(dialog.body);
                dialog.cfg.setProperty('describedby', id);
            }
        });
    }

    // fixes the first and last tabbable elements
    function fixTabLoop(dialog, fixFormElements) {
        // YUI Dialog focus method are using firstFormElement instead of firstElement to redirect focus
        dialog.setFirstLastFocusable();  //reset the tab order since we adjusted the close button location
        dialog.setTabLoop(dialog.firstElement, dialog.lastElement);

        // reset first/lastFormElement since Dialog.focusFirst/Last will use them instead of first/lastElement.
        if (fixFormElements) {
            dialog.firstFormElement = dialog.firstElement;
            dialog.lastFormElement = dialog.lastElement;
        }

        // in Firefox, it deals with tabbing in a different way that when iframe gain the focus, it will focus on where it left last time.
        // so for Firefox, if the focus goes by pass the close button, which is <a>, into iframe, we blur the iframe existing focus first.
        if (Util.Browser.isFirefox()) {
            var dialogEl = $(dialog.innerElement),
                closeBtn = dialogEl.find('a').get(0);
            if (closeBtn) {
                $(closeBtn).on('focus', function(e) {
                    var frameEl = dialogEl.find('iframe').get(0);
                    if (frameEl) {
                        var frameDoc = Util.Dom.getFrameContentDocument(frameEl);
                        if (frameDoc && frameDoc.activeElement) {
                            Util.Dom.blur(frameDoc.activeElement);
                        }
                    }
                });
            }
        }
    }

    function isAccessible() {
        var accProps = Accommodations.Manager.getCurrentProps();
        return accProps && accProps.isStreamlinedMode();
    }
    
    // set tab index on dialog
    fixTabIndex(dialog);
    
    // public dialog api
    TDS.Dialog = {
        showProgress: showProgress,
        hideProgress: hideProgress,
        showObj: showObj,
        show: showDialog,
        showPrompt: showPrompt,
        showAlert: showAlert,
        showWarning: showWarning,
        showInput: showInput,
        fixTabIndex: fixTabIndex,
        fixTabLoop: fixTabLoop,
        isAccessible: isAccessible,
        onShow: onShowDialog,
        onHide: onHideDialog
    };

})(TDS);
