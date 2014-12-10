/*
Used to setup the proxy app.
*/

(function (TS) {

    // reset idle timer
    TS.PageManager.Events.subscribe('onShow', function () {
        TS.idleTimer.waitMins = TS.Config.interfaceTimeout;
        TS.idleTimer.reset();
    });

    // create idle timer (we will start this once a item finishes loading)
    function idleTimeout() {
        // send pause notice to server and whether it fails or succeeds redirect to login
        TS._pauseInternal(true, 'timeout', TS.Config.disableSaveWhenInactive);
    }

    function load() {
        TS.idleTimer = new TDS.IdleTimer(TS.Config.interfaceTimeout, TS.Config.interfaceTimeoutDialog, idleTimeout);
        TS.idleTimer.start();
    }

    TS.registerModule({
        name: 'idle',
        load: load
    });

})(TestShell);
