//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
/*
Test shell notifications.
*/

TDS.Shell.Notification = (function() {

    var SELECTOR_CONTAINER = '.alertBar';
    var SELECTOR_DISMISS = '.alertBar .alertDismiss';
    var SELECTOR_CONTENT = '.alertBar .alertContent';
    var SELECTOR_ENTRIES = '.alertBar .alertContent li';

    function activate() {
        $(SELECTOR_CONTAINER).addClass('alertActive');
    }

    function disable() {
        $(SELECTOR_CONTAINER).removeClass('alertActive');
    }

    function show() {
        $(SELECTOR_CONTAINER).removeClass('alertClosed');
        $(SELECTOR_DISMISS).attr('aria-expanded', 'true');
    }

    function hide() {
        $(SELECTOR_CONTAINER).addClass('alertClosed');
        $(SELECTOR_DISMISS).attr('aria-expanded', 'false');
    }

    function toggle() {
        $(SELECTOR_CONTAINER).toggleClass('alertClosed');
        $(SELECTOR_DISMISS).attr('aria-expanded', function (index, value) {
            return !value || value === 'false' ? 'true' : 'false';
        });
    }

    function remove(numToShow) {
        $(SELECTOR_ENTRIES).slice(numToShow).remove();
    }

    var isInit = false;

    function init() {
        if (isInit) return;
        $(SELECTOR_DISMISS).click(function (evt) {
            YUE.stopEvent(evt);
            toggle();
        }).keyup(function (evt) {
            if (evt.which === 32) {
                toggle();
            }
        });
        isInit = true;
    }

    function add(text) {
        init();
        activate();
        show();
        $(SELECTOR_CONTENT).prepend('<li>' + text + '</li>');
        remove(3);
    }

    // export api
    return {
        add: add
    };

})();