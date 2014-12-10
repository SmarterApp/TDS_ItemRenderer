/*
Requires:
- \Scripts\Utilities\util_event.js
*/

/*
Included loaders:
• Image - Wait for an HTML image to load (in DOM or new). 
• Script - Add a new javascript file and wait for it to load.
• XHR - Make a AJAX request and wait for data to be returned. 
• Conditional - A function will be called repeatedly after the specified interval until the function returns true.
• Collection - Wait for a collection of loaders to complete.
• Dependency - Wait for a required loader to complete and then load a collection.
*/

// abstract class for creating loaders
var ResourceLoader = function()
{
    this._status = ResourceLoader.Status.NEW;

    // create events
	this._events = new YAHOO.util.EventProvider();

	for (var key in ResourceLoader.Status)
	{
	    this._events.createEvent(ResourceLoader.Status[key], { scope: this });
	}
};

ResourceLoader.Status = 
{
	NEW: 'NEW',
	LOADING: 'LOADING',
	COMPLETE: 'COMPLETE',
	ERROR: 'ERROR',
	ABORT: 'ABORT' // stopped manually or timed out
};

ResourceLoader.extend = function(subclass)
{
    YAHOO.lang.extend(subclass, ResourceLoader);
};

ResourceLoader.prototype.getStatus = function() { return this._status; };

ResourceLoader.prototype.setStatus = function(status)
{
    this._status = status;
    this._events.fireEvent(status);
};

ResourceLoader.prototype.setStatusAsync = function(status)
{
    YAHOO.lang.later(0, this, this.setStatus, status);
};

// subscribe to a status
ResourceLoader.prototype.subscribe = function(status, callback, overrideContext)
{
	this._events.subscribe(status, callback, null, overrideContext || this);
};

ResourceLoader.prototype.load = function() {};
ResourceLoader.prototype.abort = function() {};
