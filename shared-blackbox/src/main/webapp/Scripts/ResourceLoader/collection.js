// a collection of loaders
ResourceLoader.Collection = function()
{
    ResourceLoader.Collection.superclass.constructor.call(this);
    this._loaders = [];
};

ResourceLoader.extend(ResourceLoader.Collection);

// check if there is any loaders
ResourceLoader.Collection.prototype.hasLoaders = function() { return this._loaders.length > 0; };

// get the resource loaders for this collections
ResourceLoader.Collection.prototype.getLoaders = function() { return this._loaders; };

// add a loader to the collection
ResourceLoader.Collection.prototype.add = function(loader)
{
    if (!(loader instanceof ResourceLoader))
    {
        throw new Error('You can only add a loader instance to a loader collection.');
    }

    this._loaders.push(loader);
};

// begin loading all the loaders
ResourceLoader.Collection.prototype.load = function()
{
    this.setStatus(ResourceLoader.Status.LOADING);

    // add listeners to loaders and begin loading
    for (var i = 0; i < this._loaders.length; i++)
    {
        var loader = this._loaders[i];
        loader.subscribe(ResourceLoader.Status.COMPLETE, this._checkFinished, this);
        loader.subscribe(ResourceLoader.Status.ERROR, this._checkFinished, this);
        loader.subscribe(ResourceLoader.Status.ABORT, this._checkFinished, this);
        loader.load();
    }

    // make sure we're not hanging around waiting for loaders that already finished loading
    this._checkFinished();
};

// check if all the loaders are done loading
ResourceLoader.Collection.prototype._checkFinished = function()
{
    var completed = 0;

    for (var i = 0; i < this._loaders.length; i++)
    {
        var status = this._loaders[i].getStatus();

        // check if in a busy state
        if (status == ResourceLoader.Status.NEW ||
            status == ResourceLoader.Status.LOADING)
        {
            return;
        }
        
        // check if successfully completed
        if (status == ResourceLoader.Status.COMPLETE)
        {
            completed++;
        }
    }
    
    // if the # of loaders is equal to the # of 
    // completed loads then everything was successful
    if (this._loaders.length == completed)
    {
        this.setStatusAsync(ResourceLoader.Status.COMPLETE);
    }
    else
    {
        this.setStatusAsync(ResourceLoader.Status.ERROR);
    }
};
