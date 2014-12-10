// load a required dependency and when it is complete then load the collection
ResourceLoader.Dependency = function(parentLoader, childLoader)
{
    ResourceLoader.Dependency.superclass.constructor.call(this);
    this._parentLoader = parentLoader;
    this._childLoader = childLoader;
};

ResourceLoader.extend(ResourceLoader.Dependency);

ResourceLoader.Dependency.prototype.load = function()
{
    this.setStatus(ResourceLoader.Status.LOADING);

    // helper function for mapping event from one loader to another
    var eventMapper = function(fromLoader, toLoader, status)
    {
        fromLoader.subscribe(status, function() { toLoader.setStatus(status); }, toLoader);
    };

    // map error/abort from the parent loader to this loader
    eventMapper(this._parentLoader, this, ResourceLoader.Status.ERROR);
    eventMapper(this._parentLoader, this, ResourceLoader.Status.ABORT);

    // if the parent loader completes then trigger the child loader
    this._parentLoader.subscribe(ResourceLoader.Status.COMPLETE, function()
    {
        this._childLoader.load();
    }, this);

    // map all events from child loader to this loader
    eventMapper(this._childLoader, this, ResourceLoader.Status.ERROR);
    eventMapper(this._childLoader, this, ResourceLoader.Status.ABORT);
    eventMapper(this._childLoader, this, ResourceLoader.Status.COMPLETE);

    // begin loading parent
    this._parentLoader.load();
};

