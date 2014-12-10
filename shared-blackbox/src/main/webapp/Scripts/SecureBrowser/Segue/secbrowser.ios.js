if (typeof Segue != 'object') Segue = {};
if (typeof Segue.SecureBrowser != 'object') Segue.SecureBrowser = {};

Segue.SecureBrowser.iOS = function () {

    /********************** CODE FROM SEGUE   ********************/

    // iOS version of the secure browser API
    var secbrowser = {
        // This holds a local copy of our configuration variables in javascript.
        // @common
        _config: {},

        // This holds references to our event listeners
        // @common
        eventListeners: {},

        // This holds references to callback methods for all of our function calls
        // @common
        callbackHandlers: {},

        // This actionid is used to create a unique identifier for each event listener
        // and callback. to cancel an eventListener, you must use the actionid assigned.
        // @common
        actionid: Math.floor((Math.random() * 1000) + 1),

        // @common
        configready: function (config) {
            secbrowser._config = config;

            if (secbrowser.eventListeners['configReady']) {
                delete secbrowser.eventListeners['configReady'];
            }

            // FIX IN iOS: deviceReady listener doesn't exist by the time this is called
            secbrowser.fireEvent('deviceReady');
        },

        // This function gets run as soon as the dom is loaded.
        // This is where we'd run our initial lookups to populate the config
        domready: function () {
            // invokes a 'configReady' event.

            // Create iframe, call url, pass in aid, remove iframe...
            var iframe = document.createElement('iframe');
            iframe.setAttribute('src', 'apischeme://api/getConfig/');
            document.documentElement.appendChild(iframe);
            iframe.parentNode.removeChild(iframe);
            iframe = null;
        },

        // Add a listener
        // @common
        addListener: function (evt, handler) {
            // get a new actionid
            var aid = this.actionid++;

            // make sure the event exists in our eventListeners struct.
            if (!this.eventListeners[evt])
                this.eventListeners[evt] = {};

            // add the listener
            this.eventListeners[evt][evt + aid] = handler;

            // return the aid.  This is necessary for removeListener.
            return aid;
        },

        // Remove a listener, using the generated actionid
        // @common
        removeListener: function (evt, aid) {
            if (this.eventListeners[evt]) {
                if (this.eventListeners[evt][evt + aid]) {
                    delete this.eventListeners[evt][evt + aid];
                }
            }
        },

        // Going from native to javascript, fire the callback specified
        // @common
        fireCallback: function (aid, result) {
            if (this.callbackHandlers["callback" + aid]) {
                this.callbackHandlers["callback" + aid](result);
                delete this.callbackHandlers["callback" + aid];
            }
        },

        // Working on events...
        // @common
        fireEvent: function (evt, result) {
            if (this.eventListeners[evt]) {
                for (listener in this.eventListeners[evt]) {
                    this.eventListeners[evt][listener](result);
                }
            }
        },

        // isAndroid
        isAndroid: function () {
            return false;
        },

        // isIOS
        isIOS: function () {
            return true;
        },

        // Empty function on iOS platform since toasts don't exist
        toast: function (text) {

        },

        // Determines if Guided Access is enabled on the iPad
        isGuidedAccessEnabled: function (handler) {
            var aid = this.actionid++;
            this.callbackHandlers["callback" + aid] = handler;

            // Create iframe, call url, pass in aid, remove iframe...
            var iframe = document.createElement('iframe');
            iframe.setAttribute('src', 'apischeme://api/isGuidedAccessEnabled/' + aid);
            document.documentElement.appendChild(iframe);
            iframe.parentNode.removeChild(iframe);
            iframe = null;
        },

        // Gets the browser user agent
        getUserAgent: function () {
            return this._config.userAgent;
        },

        // Sets the browser user agent and reloads if reload == true
        setUserAgent: function (newUserAgent, reload) {
            if (!reload)
                reload = false;
            this._config.userAgent = newUserAgent;

            // Create iframe, call url, pass in aid, remove iframe...
            var iframe = document.createElement('iframe');
            iframe.setAttribute('src', 'apischeme://api/setUserAgent/' + newUserAgent + '/' + reload);
            document.documentElement.appendChild(iframe);
            iframe.parentNode.removeChild(iframe);
            iframe = null;
        },

        // Gets the URL of the webview
        getUrl: function () {
            return this._config.url;
        },

        // Sets the URL of the webview and reloads if reload == true
        setUrl: function (newUrl, reload) {
            if (!reload)
                reload = false;
            this._config.url = newUrl;

            // iOS: create iframe, call url, pass in aid, remove iframe...
            var iframe = document.createElement('iframe');
            iframe.setAttribute('src', 'apischeme://api/setUrl/' + encodeURIComponent(newUrl) + '/' + reload);
            document.documentElement.appendChild(iframe);
            iframe.parentNode.removeChild(iframe);
            iframe = null;
        },

        // Gets a JSON object containing a list of all processes running on the iPad
        getRunning: function (handler) {
            var aid = this.actionid++;
            this.callbackHandlers["callback" + aid] = handler;

            // iOS: create iframe, call url, pass in aid, remove iframe...
            var iframe = document.createElement('iframe');
            iframe.setAttribute('src', 'apischeme://api/getRunning/' + aid);
            document.documentElement.appendChild(iframe);
            iframe.parentNode.removeChild(iframe);
            iframe = null;
        },

        // Gets the volume level of the iPad
        getVolume: function (handler) {
            var aid = this.actionid++;
            this.callbackHandlers["callback" + aid] = handler;

            // Create iframe, call url, pass in aid, remove iframe...
            var iframe = document.createElement('iframe');
            iframe.setAttribute('src', 'apischeme://api/getVolume/' + aid);
            document.documentElement.appendChild(iframe);
            iframe.parentNode.removeChild(iframe);
            iframe = null;
        },


        // Sets the volume level of the iPad
        setVolume: function (volume) {
            // Create iframe, call url, pass in aid, remove iframe...
            var iframe = document.createElement('iframe');
            iframe.setAttribute('src', 'apischeme://api/setVolume/' + volume);
            document.documentElement.appendChild(iframe);
            iframe.parentNode.removeChild(iframe);
            iframe = null;
        },

        // Gets the shutdownUrl
        getShutdownUrl: function () {
            return this._config.shutdownUrl;
        },

        // Sets the shutdownUrl of the webview and reloads if reload == true
        setShutdownUrl: function (newUrl) {
            this._config.shutdownUrl = newUrl;

            // iOS: create iframe, call url, pass in aid, remove iframe...
            var iframe = document.createElement('iframe');
            iframe.setAttribute('src', 'apischeme://api/setShutdownUrl/' + encodeURIComponent(newUrl));
            document.documentElement.appendChild(iframe);
            iframe.parentNode.removeChild(iframe);
            iframe = null;
        },

        // Determines if the device has been jailbroken
        isJailbroken: function (handler) {
            var aid = this.actionid++;
            this.callbackHandlers["callback" + aid] = handler;

            // Create iframe, call url, pass in aid, remove iframe...
            var iframe = document.createElement('iframe');
            iframe.setAttribute('src', 'apischeme://api/isJailbroken/' + aid);
            document.documentElement.appendChild(iframe);
            iframe.parentNode.removeChild(iframe);
            iframe = null;
        },

        // Sets the test id
        setTestId: function (testid) {
            // iOS: create iframe, call url, pass in aid, remove iframe...
            var iframe = document.createElement('iframe');
            iframe.setAttribute('src', 'apischeme://api/setTestId/' + testid);
            document.documentElement.appendChild(iframe);
            iframe.parentNode.removeChild(iframe);
            iframe = null;
        },

        // Speaks selected text
        speak: function (text, handler) {
            var aid = this.actionid++;
            this.callbackHandlers["callback" + aid] = handler;

            // iOS code goes here
        }
    }

    secbrowser.addListener('configReady', secbrowser.configready);
    document.addEventListener('DOMContentLoaded', secbrowser.domready, false);

    /********************** CODE FROM SEGUE   ********************/
    window.secbrowser = secbrowser;

    this.getNativeBrowser = function () { return secbrowser; };
}
