//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
﻿TDS = window.TDS || {};

(function (TDS) {

    var self = this;
    var dialog = null;
    var controls = [];

    // register a dialog control ({create, save, reset})
    function registerControl(control) {
        controls.push(control);
    };

    function getSupportedControls() {
        var supportedControls = [];
        controls.forEach(function (control) {
            if (typeof control.isSupported == 'function') {
                if (control.isSupported()) {
                    supportedControls.push(control);
                }
            } else {
                supportedControls.push(control);
            }
        });
        return supportedControls;
    }

    // render the dialog
    function renderDialog() {

        // check if already rendered
        if (dialog != null) return;

        var id = 'systemDialog';

        dialog = new YAHOO.widget.SimpleDialog(id, {
            width: '250px',
            fixedcenter: true,
            modal: true,
            visible: false,
            draggable: false,
            close: false,
            postmethod: 'none',
            usearia: true,
            role: 'dialog'
        });

        // BUTTONS:
        var saveLabel = Messages.getAlt('SystemDialog.Ok', 'Ok');
        var cancelLabel = Messages.getAlt('SystemDialog.Cancel', 'Cancel');

        var buttons = [
            { text: saveLabel, handler: { fn: onSave, scope: self }, isDefault: true },
            { text: cancelLabel, handler: { fn: onCancel, scope: self } }
        ];

        dialog.cfg.queueProperty('buttons', buttons);

        // ESCape key should cancel the dialog box
        var escKeyListener = new YAHOO.util.KeyListener(document,
            { keys: 27 },
            { fn: onCancel, scope: self, correctScope: true });
        dialog.cfg.queueProperty('keyListeners', escKeyListener);

        // events
        dialog.beforeShowEvent.subscribe(function() {
            // set dialog body to the right height
            dialog.fillHeight(dialog.body);
        });
        dialog.showEvent.subscribe(onShow, self, true);
        dialog.hideEvent.subscribe(onHide, self, true);

        // render
        var headerText = Messages.getAlt('SystemDialog.Header', 'System Settings');
        dialog.setHeader(headerText);
        dialog.render(document.body);

        // render controls
        renderControls();
    }
    
    // render the controls in the dialog
    function renderControls() {
        getSupportedControls().forEach(renderControl);
    }

    function renderControl(control) {

        // create control container
        var controlContainer = document.createElement('div');
        controlContainer.className = 'systemDialog-control';

        // create label
        if (typeof control.getLabel == 'function') {
            var labelEl = document.createElement('label');
            labelEl.innerHTML = control.getLabel();
            controlContainer.appendChild(labelEl);
        }

        // create control element
        var controlEl = control.create();
        if (controlEl) {
            controlContainer.appendChild(controlEl);
        }

        // create break
        var breakEl = document.createElement('br');
        YUD.setStyle(breakEl, 'clear', 'both');
        controlContainer.appendChild(breakEl);

        dialog.form.appendChild(controlContainer);

    }

    function onShow() {
        TDS.Dialog.onShow();
        getSupportedControls().forEach(function (control) {
            if (typeof control.show == 'function') {
                control.show();
            }
        });
    }

    function onHide() {
        TDS.Dialog.onHide();
        getSupportedControls().forEach(function (control) {
            if (typeof control.hide == 'function') {
                control.hide();
            }
        });
    }

    // save changes
    function onSave() {
        dialog.hide();
        getSupportedControls().forEach(function (control) {
            if (typeof control.save == 'function') {
                control.save();
            }
        });
    }

    // reset changes
    function onCancel() {
        dialog.hide();
        getSupportedControls().forEach(function (control) {
            if (typeof control.reset == 'function') {
                control.reset();
            }
        });
    }

    // check if any control in the
    function isSupported() {
        return getSupportedControls().length > 0;
    }

    function openDialog() {
        renderDialog(); // render dialog
        dialog.show(); // show dialog
    }

    TDS.SystemDialog = {};

    // show dialog
    TDS.SystemDialog.open = openDialog;

    // register a dialog control
    TDS.SystemDialog.register = registerControl;

    // check if a
    TDS.SystemDialog.isSupported = isSupported;

})(TDS);
