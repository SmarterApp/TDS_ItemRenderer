// REQUIRES: YUI, IO.js, SecureBrowser.Base.js

/*
The Desktop version of the secure browser built on top of the firefox platform.
*/

(function(SB) {

    function Firefox() {
        Firefox.superclass.constructor.call(this);
        this.runtime = null;
        this._ignoringBreachEvents = null; // Timer object in case we are temporarily not reacting to sb-breach-events.
    };

    YAHOO.lang.extend(Firefox, TDS.SecureBrowser.Base);

    Firefox.prototype.initialize = function() {
        try {
            if (typeof (Runtime) == 'function') {
                this.runtime = new Runtime();
            } else {
                var success = Mozilla.execPrivileged(function() {
                    var sbClass = Components.classes["@mozilla.org/securebrowser;1"];
                    if (sbClass) {
                        this.runtime = sbClass.createInstance(Components.interfaces.mozISecureBrowser);
                    }
                }.bind(this));
                if (!success) {
                    console.log('SB runtime component failed to load');
                }
            }

            // check if this was a SB and we got the runtime
            if (!this.runtime) {
                return;
            }

            // Listen for the security breach events
            this.enableSecurityBreachDetection();
        } catch (ex) {
        }
    };

    Firefox.prototype.dispose = function () {
        console.log('Disposing SB runtime...');
        if (this.runtime != null) {
            delete this.runtime;
            this.runtime = null;
        }
        // remove all listeners so as not to cause a memory leak
        this.disableSecurityBreachDetection();
    };

    Firefox.prototype._hasAPI = function() {
        return (typeof (SecureBrowser) != 'undefined');
    };

    Firefox.prototype._hasRuntime = function() {
        return (this.runtime != null);
    };

    Firefox.prototype.clearCache = function() {
        try {
            if (this._hasAPI()) {
                SecureBrowser.clearCache();
                return true;
            }
        } catch (ex) {
        }

        return false;
    };

    Firefox.prototype.clearCookies = function() {
        try {
            if (this._hasAPI()) {
                SecureBrowser.clearCookies();
                return true;
            }
        } catch (ex) {
        }

        return false;
    };

    Firefox.prototype.emptyClipBoard = function() {
        try {
            if (this._hasAPI()) {
                SecureBrowser.emptyClipBoard();
                return true;
            }
        } catch (ex) {
        }

        return false;
    };

    Firefox.prototype.getMACAddress = function() {
        var mac = null;

        try {
            if (this._hasRuntime()) {
                mac = this.runtime.getMACAddress();
                mac.toUpperCase();
            }
        } catch (e) {
        }

        return mac;
    };

    Firefox.prototype._getIPAddressList = function(bypassCache) {
        // check if has SB runtime
        if (!this._hasRuntime()) {
            return null;
        }
        if (!YAHOO.util.Lang.isBoolean(bypassCache)) {
            bypassCache = false;
        }

        var dnsService = Components.classes["@mozilla.org/network/dns-service;1"].getService(Components.interfaces.nsIDNSService);
        var record = dnsService.resolve(dnsService.myHostName, bypassCache);

        var addressList = [];

        while (record.hasMore()) {
            var address = record.getNextAddrAsString();
            addressList.push(address);
        }

        return addressList;
    };

    Firefox.prototype.getIPAddressList = function(bypassCache) {
        var addressList = null;

        try {
            addressList = this._getIPAddressList(bypassCache);
        } catch (ex) {
        }

        return addressList;
    };

    Firefox.prototype.getProcessList = function(allowDups) {
        var processList = [];

        if (this._hasRuntime()) {
            try {
                var processString = this.runtime.getRunningProcessList();
                processList = processString.split(',');
                // retrieve service list if available, and add to process list
                if (typeof (this.runtime.services) == "string") {
                    var serviceString = this.runtime.services;
                    if (!Util.String.isNullOrEmpty(serviceString)) {
                        // add the parent 'unavailable' for each service to be structually consistent with process list
                        var serviceList = serviceString.split(',');
                        serviceList = serviceList.map(function(service) {
                            return service + '|unavailable';
                        });
                        processList = processList.concat(serviceList);
                    }
                }
            } catch (e) {
            }
        }

        // clean any leading or trailing whitespace
        for (var i = 0; i < processList.length; i++) {
            processList[i] = YAHOO.lang.trim(processList[i]).toLowerCase();
        }

        // remove any duplicates
        processList = (allowDups === true) ? processList : Util.Array.unique(processList);

        return processList;
    };

    Firefox.prototype.fixFocus = function() {

        // We need to temporarily suspend listening for security breach events because the act of opening up hidden windows will trigger that
        // We will resume shortly afterwards
        var stopIgnoringBreachEvents = function() {
            this._ignoringBreachEvents = null;
            Util.log("Resuming breach detection");
        };
        if (this._ignoringBreachEvents) {
            clearTimeout(this._ignoringBreachEvents);
        }
        this._ignoringBreachEvents = setTimeout(stopIgnoringBreachEvents.bind(this), 1000);
        Util.log("Suspending breach detection");

        try {
            netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
            var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator);
            var w = wm.getMostRecentWindow("navigator:browser");
            var hiddenWindowRef = w.openDialog("chrome://bmakiosk/content/hiddenWindow.xul", "hidden", "alwaysLowered=yes,titlebar=no");
            setTimeout(function() {
                if (hiddenWindowRef != null) {
                    hiddenWindowRef.close();
                }

                hiddenWindowRef = null;
            }, 1);

            Util.log('SecureBrowser: Fixed focus success');
            return true;
        } catch (ex) {
            Util.log('SecureBrowser: Fixed focus failed - ' + ex);
        }

        return false;
    };

    Firefox.prototype.close = function() {

        // if the browser is Mac OS 10.8 or higher, re-enable screenshots
        if (Util.Browser.isMac() && (Util.Browser.getOSXVersion() >= 10.8) && (Util.Browser.getSecureVersion() <= 6.2)) {
            var screenshotsEnabled = Mozilla.enableScreenshots();

            // check if disabling screenshot is successful
            if (screenshotsEnabled) {
                Util.log('Screenshots are enabled.');
            } else {
                Util.log('Screenshots are not enabled.');
            }
        }
        
        // simulate page unload so that all the listeners can gracefully cleanup
        try {            
            window.dispatchEvent(new Event('beforeunload'));
        } catch(ex) {            
        }

        // We are putting this in a setTimeout so that listeners to the beforeunload event have a chance to clean up gracefully
        setTimeout(function() {
            try {
                SecureBrowser.CloseWindow();
            } catch(ex) {
            }
        }, 1000);

    };

    // Get the start time of when the app was launched
    Firefox.prototype.getAppStartTime = function() {
        // New SBs have a pref that is set at app launch
        try {
            var startTimePref = Mozilla.getPreference("bmakiosk.startup.timestamp");
            if (startTimePref != null) {
                return Date.parse(startTimePref);
            }
        } catch (e) {
        }

        // Plan B - see if set a session storage appStartTime item      
        if (window.sessionStorage.getItem("appStartTime") != null) {
            return Date.parse(window.sessionStorage.getItem("appStartTime"));
        }

        // OK - we don't know anymore
        return null;
    };

    // check if native system mute capabilities is supported on the system
    Firefox.prototype._hasNativeMute = function() {
        var winVer = Util.Browser.getWindowsNTVersion();
        return (winVer >= 6.0 && typeof this.runtime.systemMute == 'boolean');
    };

    // mute system audio
    Firefox.prototype.mute = function() {
        try {
            if (this._hasRuntime()) {
                if (this._hasNativeMute()) {
                    console.log('mute native');
                    this.runtime.systemMute = true;
                    return true;
                } else if (this.runtime.systemVolume != null) {
                    console.log('mute volume');
                    Util.Storage.set('tds-mutedVolume', this.runtime.systemVolume); // store the system volume, will be restored after unmute
                    this.runtime.systemVolume = 0;
                    return true;
                }
            }
        } catch (ex) {
            console.error(ex);
        }
        return false;
    };

    // unmute system audio
    Firefox.prototype.unmute = function() {
        try {
            if (this._hasRuntime()) {
                if (this._hasNativeMute()) { // muted natively?
                    console.log('unmute native');
                    this.runtime.systemMute = false;
                    return true;
                } else if (this.runtime.systemVolume === 0) { // muted volume?
                    var mutedVolume = Util.Storage.get('tds-mutedVolume');
                    if (mutedVolume) { // restore previous volume
                        console.log('unmute volume: ' + mutedVolume);
                        this.runtime.systemVolume = mutedVolume;
                        return true;
                    }
                }
            }
        } catch (ex) {
            console.error(ex);
        }
        return false;
    };

    // check if system audio is muted
    Firefox.prototype.isMuted = function() {
        try {
            if (this._hasRuntime()) {
                if (this._hasNativeMute()) {
                    return (this.runtime.systemMute === true); // muted natively?
                } else {
                    return (this.runtime.systemVolume === 0); // muted volume?
                }
            }
        } catch (ex) {
            console.error(ex);
        }
        return false;
    };

    // get system volume
    Firefox.prototype.getVolume = function(checkMute) {
        try {
            if (this._hasRuntime()) {
                if (checkMute && this.isMuted()) {
                    return 0; // muted
                } else {
                    return this.runtime.systemVolume * 10; // 0-10.. make into percentage
                }
            }
        } catch (ex) {
            console.error(ex);
        }
        return -1;
    };

    // set system volume
    Firefox.prototype.setVolume = function(percent, checkMute) {
        try {
            if (this._hasRuntime()) {
                // convert percentage to raw value and set
                var level = Math.round(percent / 10);
                console.log('set volume: ' + level);
                this.runtime.systemVolume = level;

                // if we are setting the volume then unmute
                if (checkMute && percent > 0 && this.isMuted()) {
                    this.unmute();
                }

                return true;
            }
        } catch (ex) {
            console.error(ex);
        }
        return false;
    };

    Firefox.prototype.enablePermissiveMode = function(enabled) {

        var changed = false;

        try {
            if (this._hasRuntime() &&
                typeof this.runtime.permissive == 'boolean') {
                this.runtime.permissive = enabled;
                changed = true;
            }
        } catch (ex) {
        }

        // check if something was changed
        if (changed && Util.Browser.isMac()) {

            var availWidth = screen.availWidth;
            var availHeight = screen.availHeight;

            /* 
            NOTE: On Mac when we turn on permissive mode the bar at the top appears.
            When this bar shows up it covers the top of the browser. If we get the 
            available height then it will take into account the bar. So we just need 
            to resize the window to have it fit properly. */
            Mozilla.resizeWindowTo(availWidth, availHeight);
        }

        return changed;
    };

    Firefox.prototype.enableChromeMode = function(enabled) {
        try {
            if (typeof SecureBrowser == 'object' &&
                typeof SecureBrowser.showChrome == 'function') {
                SecureBrowser.showChrome(enabled);
                return true;
            }
        } catch (ex) {
        }
        return false;
    };

    /*
    Register for SB events that indicate that some other app has forced itself on top of the SB. 
    This is treated as a security breach
    */
    Firefox.prototype.enableSecurityBreachDetection = function() {
        var self = this;
        var observer =
        {
            QueryInterface: function(iid) {
                if (iid.equals(Components.interfaces.nsISupports) ||
                    iid.equals(Components.interfaces.nsIObserver)) {
                    return this;
                }

                throw Components.results.NS_ERROR_NO_INTERFACE;
            },

            observe: function(subject, topic, data) {
                if (topic == "sb-security-breach" && !self._ignoringBreachEvents) {
                    Util.log('Security breach detected!');
                    var notification = { type: 'sb-security-breach', message: 'Event from SB' };
                    self.Events.onSecurityBreach.fire(notification);
                }
            }
        };

        try {
            netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
            var os = Components.classes["@mozilla.org/observer-service;1"].getService(Components.interfaces.nsIObserverService);
            os.addObserver(observer, "sb-security-breach", false);
            Util.log('Listening for sb-security-breach events');
        } catch (e) {
            Util.log(e.message);
        }
    };

    /*
    Unscribe all listeners that may have hooked into the SB for security breach events. 
    This is required to make sure that we dont leak memory
    */
    Firefox.prototype.disableSecurityBreachDetection = function() {
        try {
            netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
            var os = Components.classes["@mozilla.org/observer-service;1"].getService(Components.interfaces.nsIObserverService);
            var observers = os.enumerateObservers('sb-security-breach');
            while (observers.hasMoreElements()) {
                os.removeObserver(observers.getNext(), 'sb-security-breach');
            }
            Util.log('Removing all observers for sb-security-breach events');
        } catch (e) {
            Util.log(e.message);
        }
    };

    // parse a registry key value into JS value type
    function parseRegistryValue(wrk, value) {
        switch (wrk.getValueType(value)) {
            case wrk.TYPE_STRING:
                return wrk.readStringValue(value);
            case wrk.TYPE_BINARY:
                return wrk.readBinaryValue(value);
            case wrk.TYPE_INT:
                return wrk.readIntValue(value);
            case wrk.TYPE_INT64:
                return wrk.readInt64Value(value);
        }
        return null;
    }

    // read a registry key value
    // https://developer.mozilla.org/en-US/docs/Accessing_the_Windows_Registry_Using_XPCOM
    // http://stackoverflow.com/questions/62289/read-write-to-windows-registry-using-java
    function readRegistryValue(hkey, key, valueName) {
        var value = null;
        var regClass = Components.classes["@mozilla.org/windows-registry-key;1"];
        var registry = regClass.createInstance(Components.interfaces.nsIWindowsRegKey);
        registry.open(hkey, key, registry.ACCESS_READ);
        if (registry.hasValue(valueName)) {
            value = parseRegistryValue(registry, valueName);
        }
        registry.close();
        return value;
    }

    // get windows registry key in the native value type (string, binary, int or int64)
    Firefox.prototype.readRegistryValue = function (hkey, key, valueName) {
        var value = null;
        Mozilla.execPrivileged(function() {
            try {
                value = readRegistryValue(hkey, key, valueName);
            } catch (ex) {
                // If you try and open a key that doesn't exist we get:
                // "Component returned failure code: 0x80004005 (NS_ERROR_FAILURE) [nsIWindowsRegKey.open]"
            }
        });
        return value;
    };

    SB.Firefox = Firefox;

})(TDS.SecureBrowser);