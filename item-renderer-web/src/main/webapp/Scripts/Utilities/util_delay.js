//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
// http://closure-library.googlecode.com/svn/trunk/closure/goog/docs/index.html

// A delay object which executes the listener after an interval
Util.Delay = function(listener, interval, scope)
{
    this._listener = listener;
    this._interval = interval || 0;
    this._scope = scope;
};

Util.Delay.prototype._timer = null;

Util.Delay.prototype.start = function(opt_interval)
{
    this.stop();
    this._timer = YAHOO.lang.later((opt_interval) ? opt_interval : this._interval, this, this._doAction);
};

Util.Delay.prototype.stop = function()
{
    if (this.isActive())
    {
        this._timer.cancel();
    }

    this._timer = null;
};

Util.Delay.prototype.fire = function()
{
    this.stop();
    this._doAction();
};

Util.Delay.prototype.fireIfActive = function()
{
    if (this.isActive())
    {
        this.fire();
    }
};

Util.Delay.prototype.isActive = function()
{
    return this._timer != null;
};

Util.Delay.prototype._doAction = function()
{
    this._timer = null;
    if (this._listener)
    {
        this._listener.call(this._scope);
    }
};