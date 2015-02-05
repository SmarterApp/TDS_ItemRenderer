window.TDS = window.TDS || {};

/*
SB JAWS FIX:
Basically, what you need to do is JAWS user settings, add to the confignames.ini a single line (after Firefox3=firefox) the line 
OaksSecureBrowser5.0=firefox
JAWS user setting is an option in the program list
*/

TDS.ARIA = (function() {

    var aria = {};

    function getStatus() {
        var statusEl = YUD.get('tdsStatus');
        if (!statusEl) {
            statusEl = document.createElement('div');
            statusEl.id = 'tdsStatus';
            statusEl.className = 'element-invisible';
            statusEl.setAttribute('role', 'status');
            statusEl.setAttribute('aria-live', 'assertive');
            $(document.body).prepend(statusEl);
        }
        return statusEl;
    }

    aria.setStatus = function (msg) {
        var statusEl = getStatus();
        $(statusEl).text(msg);
    };

    return aria;

})();

