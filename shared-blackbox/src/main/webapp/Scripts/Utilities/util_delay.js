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