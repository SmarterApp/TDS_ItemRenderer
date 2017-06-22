//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
/*
Used to setup the proxy app.
*/

(function (TS) {

    // reset idle timer
    TS.PageManager.Events.subscribe('onShow', function () {
        TS.idleTimer.waitMins = TS.Config.interfaceTimeout;
        TS.idleTimer.reset();
    });

    // when an iFrame is registered add key/mouse listeners to it for idle timer
    ContentManager.on('registerFrame', function (frame) {
        TS.idleTimer.addListeners(Util.Dom.getFrameContentDocument(frame));
    });

    // create idle timer (we will start this once a item finishes loading)
    function idleTimeout() {
        // send pause notice to server and whether it fails or succeeds redirect to login
        TS._pauseInternal(true, 'timeout', TS.Config.disableSaveWhenInactive);
    }

    function load() {
        // create idle timer and pass in timeout function
        TS.idleTimer = new TDS.IdleTimer(TS.Config.interfaceTimeout, TS.Config.interfaceTimeoutDialog, idleTimeout);
        // if someone says they are still here then ping the server
        TS.idleTimer.Events.on('onResume', function () {
            TS.xhrManager.ping();
        });
        // start idle timer
        TS.idleTimer.start();
    }

    TS.registerModule({
        name: 'idle',
        load: load
    });

})(TestShell);
