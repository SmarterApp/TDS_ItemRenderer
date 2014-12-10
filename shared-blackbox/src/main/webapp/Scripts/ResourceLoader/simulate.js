// simulate a resource loader
ResourceLoader.Simulate = function()
{
    ResourceLoader.Simulate.superclass.constructor.call(this);
};

ResourceLoader.extend(ResourceLoader.Simulate);

ResourceLoader.Simulate.prototype.load = function()
{
    this.setStatus(ResourceLoader.Status.LOADING);
    this.setStatus(ResourceLoader.Status.COMPLETE);
};

// simulate a async resource loader
ResourceLoader.SimulateAsync = function()
{
    ResourceLoader.SimulateAsync.superclass.constructor.call(this);
};

ResourceLoader.extend(ResourceLoader.SimulateAsync);

ResourceLoader.SimulateAsync.prototype.load = function()
{
    this.setStatusAsync(ResourceLoader.Status.LOADING);
    this.setStatusAsync(ResourceLoader.Status.COMPLETE);
};

