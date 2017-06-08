//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
/*
End-of-test survey dialog.
This uses parsley library for validating the form.
    - Github: https://github.com/guillaumepotier/Parsley.js/
    - Homepage: http://parsleyjs.org/
    - Example: http://parsleyjs.org/doc/examples/simple.html
    - Config: http://parsleyjs.org/doc/annotated-source/defaults.html
*/

Sections.TestReview.Survey = (function () {

    var dialog = null;

    // check if survey accommodation is enabled
    function isSupported() {
        var accs = Accommodations.Manager.getDefault();
        return accs.findCode('Test Survey', 'TDS_TestSurvey1', true) != null;
    }

    // remove YUI dialog config
    function removeConfig(name) {
        delete dialog.cfg.config[name];
        var eventIdx = Util.Array.findIndex(dialog.cfg.eventQueue, function (params) {
            return (params && params[0] == name);
        });
        if (eventIdx >= 0) {
            Util.Array.removeAt(dialog.cfg.eventQueue, eventIdx);
        }
    }

    // set parsley errors
    function processMessages(i18n, rootKey) {
        Util.Object.keys(i18n).forEach(function (prop) {
            var key = rootKey + '.' + prop;
            if (typeof i18n[prop] == 'string') {
                i18n[prop] = Messages.getAlt(key, i18n[prop]);
            } else if (typeof i18n[prop] == 'object') {
                processMessages(i18n[prop], key);
            }
        });
    }

    // create the survey dialog
    function create() {

        // check if dialog is already created
        if (dialog) {
            return;
        }

        dialog = new YAHOO.widget.Dialog('dialogTestSurvey', {
            visible: false,
            draggable: false,
            modal: true,
            constraintoviewport: true,
            close: false,
            fixedcenter: true,
            zindex: 999,
            postmethod: 'none',
            autofillheight: false
        });

        // allows esc to work on all platforms
        TDS.ToolManager._overlayManager.register(dialog);

        // BUTTONS:
        var buttons = [
            { text: Messages.get('Cancel'), handler: { fn: cancel, scope: this } },
            { text: Messages.get('Submit'), handler: { fn: submit, scope: this }, isDefault: true }
        ];

        dialog.cfg.queueProperty("buttons", buttons);

        // add css
        dialog.showEvent.subscribe(onShow);
        dialog.hideEvent.subscribe(onHide);

        // set dimensions
        dialog.beforeShowEvent.subscribe(function () {
            dialog.cfg.setProperty('width', YUD.getStyle(dialog.innerElement, 'width'));
            dialog.cfg.setProperty('height', YUD.getStyle(dialog.innerElement, 'height'));
        });

        // these are called when rendered and creates the form
        removeConfig('postdata');
        removeConfig('postmethod');

        // this is called when setting the body and updates the form
        dialog.changeBodyEvent.unsubscribeAll();

        // render dialog html
        dialog.render('sectionTestReview');

        // set header
        var header = Messages.getAlt('TestSurvey.header', 'Survey');
        dialog.setHeader(header);

        // create form
        var contents = Messages.getAlt('TestSurvey.body', '');
        dialog.setBody(contents);

        var $form = getForm();
        if ($form) {
            // prevent user from hitting enter and submitting the form
            $form.submit(function (evt) {
                evt.preventDefault();
                return false;
            });
            // set dialog form
            var formEl = $form.get(0);
            if (formEl) {
                dialog.form = formEl;
            }
        }

        // add wcag
        TDS.Dialog.fixTabIndex(dialog);
        TDS.Dialog.fixTabLoop(dialog, true);

        // set parsley messages
        processMessages(ParsleyConfig.i18n.en, 'TestSurvey.validation');
    }

    function onHide() {
        TDS.Dialog.onHide();
    }

    function onShow() {
        TDS.Dialog.onShow();
    }

    function cancel() {
        dialog.hide();
    }

    function submit() {
        if (validate()) {
            api.fire('submit');
            dialog.hide();
        }
    }

    function show() {
        create();
        dialog.show();
    }

    // get the form element
    function getForm() {
        if (dialog && dialog.body) {
            return $('form', dialog.body);
        }
        return null;
    }

    function validate() {
        var $form = getForm();
        if ($form) {
            // validate form
            var parsed = getForm().parsley({
                uiEnabled: true
            });
            if (parsed && parsed.validate) {
                return parsed.validate();
            }
        }
        // could not parse form element so don't let the user through
        return false;
    }

    function getData() {
        var $form = getForm();
        if ($form && $form.length) {
            return $form.serialize();
        }
        return null;
    }

    var api = {
        getDialog: function() {
            return dialog;
        },
        isSupported: isSupported,
        show: show,
        validate: validate,
        getData: getData
    }

    Util.Event.Emitter(api);

    // DEBUG:
    /*
    $(document).ready(function () {
        setTimeout(function() {
            Messages.set('TestSurvey.body', '<p>This is a survey.</p><form><p><label for="optin">Opt-in:</label><input type="radio" name="optin" value="yes" required>Yes</input><input type="radio" name="optin" value="no">No</input></p></form>');
        }, 5);
    });
    */

    return api;

})();