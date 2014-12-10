// functions for dealing with appcache
// https://developer.mozilla.org/en/Using_Application_Cache

/*
UNCACHED
A special value that indicates that an application cache object is not fully initialized.
IDLE
The application cache is not currently in the process of being updated.
CHECKING
The manifest is being fetched and checked for updates.
DOWNLOADING
Resources are being downloaded to be added to the cache, due to a changed resource manifest.
UPDATEREADY
There is a new version of the application cache available.  There is a corresponding updateready event, 
which is fired instead of the cached event when a new update has been downloaded but not yet activated 
using the swapCache() method.
OBSOLETE
The application cache group is now obsolete.
*/

TDS.Cache = {};
TDS.Cache.id = null;
TDS.Cache.validate = false;

TDS.Cache._statusLookup = ['uncached', 'idle', 'checking', 'downloading', 'updateready', 'obsolete'];
TDS.Cache._eventLookup = ['cached', 'checking', 'downloading', 'error', 'noupdate', 'obsolete', 'progress', 'updateready'];

TDS.Cache._currentEvent = null;
TDS.Cache._count = 0; // how many files downloaded

// indicates we are shutting down the cache
TDS.Cache._shuttingDown = false;

// indicates the cache is shutdown
TDS.Cache._shutDown = false;

// onChange, onStop, onShutdown
TDS.Cache.Events = new Util.EventManager();

// get how many files have been cached
TDS.Cache.getCount = function() { return TDS.Cache._count; };

// check if the page has an offline manifest
TDS.Cache.hasManifest = function()
{
    return (document.getElementsByTagName('html')[0].getAttribute('manifest') != null);
};

// check if appcache API exists
TDS.Cache.isSupported = function()
{
    return (typeof(window.applicationCache) == 'object');
};

// checks if there is a manifest and the cache object exists
TDS.Cache.isAvailable = function()
{
    return (this.hasManifest() && this.isSupported());
};

// get the current appcache status name
TDS.Cache.getStatus = function()
{
    if (this.isAvailable())
    {
        try
        {
            return TDS.Cache._statusLookup[window.applicationCache.status];
        }
        catch (ex)
        {
            // "Component returned failure code: 0x8007000e (NS_ERROR_OUT_OF_MEMORY) 
            // [nsIDOMOfflineResourceList.status]"  nsresult: "0x8007000e (NS_ERROR_OUT_OF_MEMORY)" 
        }
    }

    return null;
};

// get the last appcache event fired
TDS.Cache.getEvent = function() { return TDS.Cache._currentEvent; };

// is the cache busy making http requests
TDS.Cache.isBusy = function()
{
    var status = this.getStatus();
    var event = this.getEvent();

    // check for downloading status
    if (['checking', 'downloading'].indexOf(status) > -1) return true;

    // check if uncached 
    if (status == 'uncached' && event != null)
    {
        // check for downloading event
        if (['checking', 'downloading', 'progress'].indexOf(event) > -1) return true;
    }

    return false;
};

// enable cache
TDS.Cache.enable = function()
{
    Mozilla.execPrivileged(function()
    {
        Mozilla.setPreference('browser.cache.offline.enable', true);
    });
};

// disable cache
TDS.Cache.disable = function()
{
    Mozilla.execPrivileged(function()
    {
        Mozilla.setPreference('browser.cache.offline.enable', false);
    });
};

// call this once on page load to start listening to app cache events
TDS.Cache.init = function()
{
    // before subscribing to events make sure manifest exists (or we might get exceptions)
    if (!this.isAvailable()) return false;

    // subscribe to cache events
    var cacheEvents = TDS.Cache._eventLookup;

    for (var i = 0; i < cacheEvents.length; i++)
    {
        try
        {
            window.applicationCache.addEventListener(cacheEvents[i], TDS.Cache._handler, false);
        }
        catch (ex)
        {
            // "Component returned failure code: 0x8007000e (NS_ERROR_OUT_OF_MEMORY)
            // [nsIDOMEventTarget.addEventListener]"  nsresult: "0x8007000e (NS_ERROR_OUT_OF_MEMORY)"
            return false;
        }
    }

    return true;
};

TDS.Cache._handler = function(evt)
{
    TDS.Cache._currentEvent = evt.type; // save event name
    if (evt.type == 'progress') TDS.Cache._count++; // up file count

    // fire event
    TDS.Cache.Events.fire('onChange', evt);

    // check if we shutting down 
    if (TDS.Cache._shuttingDown) TDS.Cache._tryToShutdown();
};

// shutdown the offline cache and then fire event
TDS.Cache.stop = function()
{
    if (TDS.Cache._shuttingDown) return;
    TDS.Cache._shuttingDown = true;
    
    TDS.Cache.Events.fire('onStop');
    
    // try to shutdown
    var success = TDS.Cache._tryToShutdown();
    
    // if we couldn't shutdown right now then disable cache
    if (!success)
    {
        TDS.Cache._shuttingDown = true;
        TDS.Cache.disable();
    }
};

// check if it is safe to shutdown and fire event if so
TDS.Cache._tryToShutdown = function()
{
    // check if shut down was already triggered
    if (TDS.Cache._shutDown) return false;

    // if the cache is busy then leave
    if (TDS.Cache.isAvailable() && TDS.Cache.isBusy()) return false;

    TDS.Cache._shutDown = true;

    // fire event to shutdown after a delay so cache can cooldown
    setTimeout(function()
    {
        TDS.Cache.enable();
        TDS.Cache.Events.fire('onShutdown');
    }, 5000);

    return true;
};

/*
TDS.Cache.Events.subscribe('onChange', function()
{
    var statusName = TDS.Cache.getStatus();
    var eventName = TDS.Cache.getEvent();

    var message = 'STATUS: ' + statusName + ' EVENT: ' + eventName;

    if (eventName == 'progress')
    {
        var cacheCount = TDS.Cache.getCount();
        message += ' (' + cacheCount + ')';
    }

    var spanOfflineCacheStatus = YUD.get('offlineCacheStatus');
    if (spanOfflineCacheStatus) spanOfflineCacheStatus.innerHTML = message;
});*/

// initialize the cache early
TDS.Cache.init();

/*********************************************************************/
// some HTTP cache stuff..

// check if the cache is obsolete
TDS.Cache.checkObsolete = function()
{
    var storageKey = 'tds.cache.id';
    var storedCacheId = Mozilla.getPreference(storageKey);
    
    // check if the last stored id has changed
    if (storedCacheId != TDS.Cache.id)
    {
        // check if valid current cache id
        if (YAHOO.lang.isString(TDS.Cache.id))
        {
			Util.log('checkObsolete: set=' + TDS.Cache.id);
			Mozilla.setPreference(storageKey, TDS.Cache.id);
        }

        // check if valid saved cache id
        if (YAHOO.lang.isString(storedCacheId))
        {
			Util.log('checkObsolete: clearCache');
			Util.SecureBrowser.clearCache();
        }
    }
};
