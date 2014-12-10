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
    }

    function hide() {
        $(SELECTOR_CONTAINER).addClass('alertClosed');
    }

    function toggle() {
        $(SELECTOR_CONTAINER).toggleClass('alertClosed');
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