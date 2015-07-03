//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
// SUMMARY: This class is used for when a student is idle. It should open a dialog
// after a set period of minutes and ask the user to respond. If the user does not 
// respond after another set period of time it will pause the test. 

TDS.IdleTimer = (function(TDS) {

    return function(waitMins, respondSecs, funcNoResponse) {

        // message shown when idle
        this.message = ErrorCodes.get('IdleTimeout');
        this.isStarted = false;

        // timer instance for idle
        this.timerIdle = null;
        this.waitMins = waitMins;
        this.respondSecs = respondSecs;

        // Events: onTimeout, onResume
        this.Events = new Util.EventManager();

        this.getIdleMilliseconds = function() {
            return this.waitMins * 60 * 1000;
        };

        this.getRespondMilliseconds = function() {
            return this.respondSecs * 1000;
        };

        // start idle timer
        this.start = function() {
            Util.log('timeout: start');

            this.isStarted = true;
            this.reset();
        };

        // stop idle timer
        this.stop = function() {
            this.isStarted = false;
            this.cancel();
        };

        // reset timer, this only works if the timer is started
        this.reset = function () {

            // check to make sure timer is started first
            if (!this.isStarted) {
                return;
            }

            this.cancel();
            this.timerIdle = YAHOO.lang.later(this.getIdleMilliseconds(), this, this.openDialog);
        };

        // cancel idle timer
        this.cancel = function() {
            if (this.timerIdle != null) {
                this.timerIdle.cancel();
            }
        };

        // open the idle dialog and waits for the students response
        this.openDialog = function() {
            Util.log('timeout: openDialog');

            this.stop();

            // set timer to wait for response from user from dialog
            this.timerIdle = YAHOO.lang.later(this.getRespondMilliseconds(), this, this.dialogNoResponse);

            // open dialog
            var self = this;
            TDS.Dialog.showAlert(this.message, function () {
                self.cancel();
                self.start();
                self.Events.fire('onResume');
            }.bind(this));
        };

        // this gets called when there is no response to the idle dialog
        this.dialogNoResponse = function() {
            Util.log('timeout: dialogNoResponse');

            // execute callback
            if (typeof (funcNoResponse) == 'function') {
                funcNoResponse();
            }

            // fire event
            this.Events.fire('onTimeout');
        };

        // pass in a window object to assign listners
        this.addListeners = function(win) {
            YAHOO.util.Event.addListener(win, "keyup", this.reset, this, true);
            //YAHOO.util.Event.addListener(win, "keydown", this.reset, this, true);
            //YAHOO.util.Event.addListener(win, "keypress", this.reset, this, true);
            YAHOO.util.Event.addListener(win, 'mousedown', this.reset, this, true);
            //YAHOO.util.Event.addListener(win, 'mousemove', this.reset, this, true);
        };

        // assign listeners to current window (you will need to assign listener to iframe in seperate call)
        this.addListeners(window);

        // set minutes on the error message if possible
        if (this.message.indexOf('{0}') != -1) {
            this.message = this.message.replace('{0}', this.waitMins);
        }

        // set seconds on the error message if possible
        if (this.message.indexOf('{1}') != -1) {
            this.message = this.message.replace('{1}', this.respondSecs);
        }
    };

})(window.TDS);