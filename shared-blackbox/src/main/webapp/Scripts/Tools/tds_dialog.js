TDS = window.TDS || {};

(function(TDS) {

    var CSS_SHOWING_PROGRESS = 'showingLoading';

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

    dialog.showEvent.subscribe(function() {
        YUD.addClass(document.body, 'showingDialog');
    });

    dialog.hideEvent.subscribe(function() {
        // top.focus(); ?
        YUD.removeClass(document.body, 'showingDialog');
    });

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
    }

    function showDialog(header, message, buttons) {
        showObj({
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

        showDialog(header, message, buttons);
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

    // set tab index on dialog
    fixTabIndex(dialog);
    
    /*
    SEARCH CODE: (^|[^\.])(showProgress|hideProgress|showSimpleDialog|showSimplePrompt|showSimpleAlert|showAlertWarning|_setTabIndexOnDialog)\(\S*\)

    Objects:
    progressDialog
    simpleDialog
    */

    // public dialog api
    TDS.Dialog = {
        showProgress: showProgress, // showProgress
        hideProgress: hideProgress, // hideProgress
        showObj: showObj,
        show: showDialog, // showSimpleDialog
        showPrompt: showPrompt, // showSimplePrompt
        showAlert: showAlert, // showSimpleAlert
        showWarning: showWarning, // showAlertWarning
        showInput: showInput,
        fixTabIndex: fixTabIndex // _setTabIndexOnDialog
    };

})(TDS);
