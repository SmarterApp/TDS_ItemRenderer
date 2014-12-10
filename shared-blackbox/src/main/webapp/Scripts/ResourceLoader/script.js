// script loader that uses YUI GET
ResourceLoader.Script = function(url /*array*/, win, timeout)
{
    ResourceLoader.Script.superclass.constructor.call(this);
    this._url = url;
    this._win = win;
    this._timeout = timeout || 0;
    this._id = null; // YUI transaction ID for outgoing scripts request
};

ResourceLoader.extend(ResourceLoader.Script);

ResourceLoader.Script.prototype.load = function()
{
    this.setStatus(ResourceLoader.Status.LOADING);

    var loader = this;

    // create config
    // NOTE: To catch error 404 (missing script) on Firefox set a timeout (onload does not fire)
    var config =
    {
        onSuccess: function() { this.setStatus(ResourceLoader.Status.COMPLETE); },
        onFailure: function() { this.setStatus(ResourceLoader.Status.ERROR); },
        onTimeout: function() { this.setStatus(ResourceLoader.Status.ABORT); },
        scope: loader
    };

    // set window
    if (this._win != null) config.win = this._win;

    // set timeout if any
    if (this._timeout > 0) config.timeout = this._timeout;

    this._id = YAHOO.util.Get.script(this._url, config);
};

ResourceLoader.Script.prototype.abort = function()
{
    YAHOO.util.Get.abort(this._id);
};
