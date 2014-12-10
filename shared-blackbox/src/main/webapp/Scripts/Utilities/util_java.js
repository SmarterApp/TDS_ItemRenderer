/* Java */

Util.Browser._getJREVersion = function(runApplet, codebase) {
    
    // check if plugin exists
    var plugin = (navigator.mimeTypes && navigator.mimeTypes["application/x-java-applet"]) ? navigator.mimeTypes["application/x-java-applet"].enabledPlugin : 0;
    if (!plugin) {
        return -2; // plugin disabled or not installed
    } 

    var version = 0;

    for (var i = 1; i < 7; i++) {
        if (navigator.mimeTypes["application/x-java-applet;version=1." + i]) {
            version = "1." + i;

            for (var j = 1; j < 4; j++) {
                if (navigator.mimeTypes["application/x-java-applet;version=1." + i + "." + j]) {
                    version = "1." + i + "." + j;
                }
            }
        }
    }

    // inject applet for detection?
    if (runApplet) {
        
        // function for injecting the applet and getting version
        var loadJREVersion = function() {
            var applet = document.getElementById('DetectPluginApplet');

            if (applet == null) {
                var container = document.createElement('div');
                container.style.visibility = "hidden";
                container.innerHTML = '<applet id="DetectPluginApplet" name="DetectPluginApplet" code="DetectPluginApplet.class" codebase="' + codebase + '"></applet>';

                try {
                    document.body.appendChild(container);
                } catch(ex) {
                    return false;
                }
            }

            applet = document.getElementById('DetectPluginApplet');
            if (applet == null) {
                return false;
            }

            try {
                version = applet.getJREVersion();
            } catch(ex) {
                return false;
            }

            return true;
        };

        // run function for getting applet version and if success then will assign to version variable
        var loaded = loadJREVersion();

        // if failed to load applet and this is windows then stop here
        if (!loaded && Util.Browser.isWindows()) {
            return -3;
        }
    }

    return parseFloat(version);
};

// -1 = general exception occured
// -2 = can't find java browser plugin
// -3 = could not load applets version (and is required)
Util.Browser.getJREVersion = function(runApplet, codebase) {
    codebase = codebase || '../Shared/Applets/Utilities/';

    try {
        return this._getJREVersion(runApplet, codebase);
    } catch(e) {
        return -1;
    }
};

// -1 = general exception occured
// -2 = can't find java browser plugin
// -3 = could not load applets version (and is required)
Util.Browser.getJREVersionAsync = function(callback) {
    
    var success = callback.success || function() {};
    var failure = callback.failure || function() {};
    var timeout = callback.timeout || 60000; // default to 60 seconds
    var codebase = callback.codebase || '../Shared/Applets/Utilities/';

    // check if java plugin exists
    var plugin = (navigator.mimeTypes && navigator.mimeTypes["application/x-java-applet"]) ? 
                  navigator.mimeTypes["application/x-java-applet"].enabledPlugin : 0;

    // if plugin does not even exist (which could also mean it is disabled) then were done
    if (!plugin) {
        failure(-2);
        return false;
    }

    // get the java version by searching the plugins
    var getPluginVersion = function() {
        var version = -1;

        for (var i = 1; i < 7; i++) {
            if (navigator.mimeTypes["application/x-java-applet;version=1." + i]) {
                version = "1." + i;

                for (var j = 1; j < 4; j++) {
                    if (navigator.mimeTypes["application/x-java-applet;version=1." + i + "." + j]) {
                        version = "1." + i + "." + j;
                    }
                }
            }
        }

        return parseFloat(version);
    };

    // get the java version by injecting a applet
    var getJREVersion = function() {
        
        var version = -1;
        var applet = document.getElementById('DetectPluginApplet');

        // load applet if it does not already exist
        if (applet == null) {
            var container = document.createElement('div');
            container.style.visibility = "hidden";
            container.innerHTML = '<applet id="DetectPluginApplet" name="DetectPluginApplet" code="DetectPluginApplet.class" codebase="' + codebase + '"></applet>';

            try {
                document.body.appendChild(container);
            } catch(ex) {
                return version;
            }
        }

        applet = document.getElementById('DetectPluginApplet');
        if (applet == null) {
            return version;
        }

        // try and call applet to get version
        try {
            version = applet.getJREVersion();
        } catch(ex) {
            return version;
        }

        return parseFloat(version);
    };

    var jreVersion = -1;

    // this function is used to determine if polling is successful
    var pollCondition = function() {
        jreVersion = getJREVersion();
        return (jreVersion > -1);
    };

    // call this when version was returned successfully
    var pollSuccess = function() {
        success({ applet: jreVersion, plugin: getPluginVersion() });
    };

    // call this to start polling for version
    var pollStart = function() {
        
        // create a conditional delay which waits for applet to be ready and return some positive value
        var conditionalDelay = new Util.ConditionalDelay(pollCondition);

        // applet ready..
        conditionalDelay.onSuccess.subscribe(function() {
            pollSuccess();
        });

        // applet fail..
        conditionalDelay.onFailure.subscribe(function() {
            failure(-3);
        });

        // delay config
        conditionalDelay.start(250, timeout);
    };

    // let the caller function finish before running any of the detection code (so if java locks up the UI while loading)
    setTimeout(function() {
        // before starting polling lets just see if we can get the version right away
        if (pollCondition()) {
            pollSuccess();
        } else {
            pollStart();
        }
    }, 0);

    return true;
};
