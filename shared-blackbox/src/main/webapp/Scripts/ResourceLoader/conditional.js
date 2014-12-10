/*
Requires:
- \Scripts\Utilities\util_event.js
*/

ResourceLoader.Conditional = function(listener, interval, timeout)
{
    ResourceLoader.Conditional.superclass.constructor.call(this);
    this._conditionalDelay = new Util.ConditionalDelay(listener, this);
    this._interval = interval;
    this._timeout = timeout;
};

ResourceLoader.extend(ResourceLoader.Conditional);

ResourceLoader.Conditional.prototype.load = function()
{
    this.setStatus(ResourceLoader.Status.LOADING);

    this._conditionalDelay.onSuccess.subscribe(function()
    {
        this.setStatus(ResourceLoader.Status.COMPLETE);
    });

    this._conditionalDelay.onFailure.subscribe(function()
    {
        this.setStatus(ResourceLoader.Status.ERROR);
    });

    this._conditionalDelay.start(this._interval, this._timeout);
};

