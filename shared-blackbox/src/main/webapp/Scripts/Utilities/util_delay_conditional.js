//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
// http://closure-library.googlecode.com/svn/trunk/closure/goog/docs/class_goog_async_ConditionalDelay.html

// A ConditionalDelay object invokes the associated function after a specified interval delay and checks it's return value.
Util.ConditionalDelay = function(listener, scope)
{
    this._listener = listener;
    this._scope = scope;
    this._delay = new Util.Delay(this._onTick, 0 /*interval*/, this /*scope*/);

    this.onSuccess = new YAHOO.util.CustomEvent('onSuccess', this._scope, false, YAHOO.util.CustomEvent.FLAT);
    this.onFailure = new YAHOO.util.CustomEvent('onFailure', this._scope, false, YAHOO.util.CustomEvent.FLAT);
};

Util.ConditionalDelay.prototype._interval = 0;
Util.ConditionalDelay.prototype._runUntil = 0;
Util.ConditionalDelay.prototype._isDone = false;

// Starts the delay timer. The provided listener function will be called repeatedly after the specified interval until the function returns true.
Util.ConditionalDelay.prototype.start = function(interval, timeout)
{
    this.stop();
    this._isDone = false;

    timeout = timeout || 0;
    this._interval = Math.max(interval || 0, 0);
    this._runUntil = timeout < 0 ? -1 : (Util.Date.now() + timeout);
    this._delay.start(timeout < 0 ? this._interval : Math.min(this._interval, timeout));
};

Util.ConditionalDelay.prototype.stop = function()
{
    this._delay.stop();
};

Util.ConditionalDelay.prototype.isActive = function()
{
    return this._delay.isActive();
};

Util.ConditionalDelay.prototype.isDone = function()
{
    return this._isDone;
};

// A callback function for the underlying delay object. 
Util.ConditionalDelay.prototype._onTick = function()
{
    var successful = this._listener.call(this._scope);

    if (successful)
    {
        this._isDone = true;
        this.onSuccess.fire();
    }
    else
    {
        // Try to reschedule the task.
        if (this._runUntil < 0)
        {
            // No timeout.
            this._delay.start(this._interval);
        }
        else
        {
            var timeLeft = this._runUntil - Util.Date.now();

            if (timeLeft <= 0)
            {
                this.onFailure.fire();
            }
            else
            {
                this._delay.start(Math.min(this._interval, timeLeft));
            }
        }
    }
};