/*
This is AIR's API for Summit's SB desktop API. The API that
they implemented is a dll that is installed in Firefox plugins.
To activate the plugin you need to add it to the document in an 
<embed> tag.

// https://bugz.airast.org/kiln/Code/TDS-Student-Labs/Secure-Browser/AudioRecorderFirefox
*/

(function (SB) {

    var logs = [];

    function addLog(msg) {
        var log = {
            timestamp: new Date(),
            message: msg
        };
        logs.push(log);
    }

    // TODO: This API needs to work exactly like the mobile version.

    var Event = SB.Base.Recorder.Event;
    var api = null; // the <embed> that holds the recorder api
    var currentListener = null;
    var currentFile = null;

    // create the audio plugin element
    /*
    function create() {
        var embed = document.createElement('embed');
        embed.setAttribute('id', 'recorder');
        embed.setAttribute('type', 'application/airaudio');
        embed.setAttribute('style', 'display: block; width: 0px; height: 0px;');
        document.body.appendChild(embed);
        return embed;
    }
    */

    // check if Mac SB PPC machine
    function isPPC() {
        return (Util.Browser.getSecureVersion() >= 5.6 && 
                Util.Browser.getSecureVersion() <= 5.9);
    }

    // this is observer service for PPC (for all other platforms it will be null)
    var observerService = null;

    // take a DOM event and map it to known event type
    function getEventType(type) {
        switch (type) {
            case 'AUDIOERROR': return Event.DEVICE_ERROR;
            case 'PLAYSTART': return Event.PLAYBACK_START;
            case 'PLAYSTOP': return Event.PLAYBACK_STOPPED;
            case 'PLAYPAUSED': return Event.PLAYBACK_PAUSED;
            case 'PLAYRESUMED': return Event.PLAYBACK_RESUMED;
            default: return type;
        }
    }

    function getAudioFileList() {
        var listValue = Util.Storage.get('recorder-list');
        if (listValue) {
            return listValue;
        } else {
            return [];
        }
    }

    /*
    Get the file audio data:
    {
    base64: "4Pna+dD52/nl+e/5y/nT+fr.../++/8D/wv/R/9v/xP+8/67/",
    filename: "2d30fc8c-dfd6-49b9-b2d9-81b640fcf560.raw",
    qualityIndicator: "POOR"
    }
    */
    function getAudioFile(filename) {
        return Util.Storage.get('recorder-data-' + filename);
    }

    function setAudioFile(fileIdentifier, obj) {

        // save file list
        var list = getAudioFileList();
        list.push(fileIdentifier);
        Util.Storage.set('recorder-list', list);

        // fix data to include filename (this makes it more like mobile)
        if (!Util.String.contains(obj.data, '"filename"')) {
            obj.data = obj.data.replace('"qualityIndicator"', '"filename" : "' + fileIdentifier + '",\n"qualityIndicator"');
        }

        // remove newlines
        obj.data = obj.data.replace(/\n/g, '');

        // save raw data string (it is a json stringified, so when we do a storage.get() then it will be returned as an object)
        // bug 113308: Recording (e.g. ELPA sound check) broken in tds2
        Util.Storage.setString('recorder-data-' + fileIdentifier, obj.data);
    }

    var recordTimer = null; // the YUI timer obj

    // call this to start record timer
    function startRecordTimer(duration /*seconds*/) {
        recordTimer = YAHOO.lang.later(duration * 1000, this, checkRecordTimer);
    }

    // call this to cancel the record timer
    function stopRecordTimer() {
        if (recordTimer) {
            recordTimer.cancel();
            recordTimer = null;
        }
    }
    
    // this is record timer callback
    function checkRecordTimer() {

        // delete timer
        recordTimer = null;
        
        // NOTE: Can't use 'recording' boolean it doesn't work for some reason. 
        // Seems like when the recorder freezes during a manual stop it messes things up?
        if (api.getStatus() == 'ACTIVE') {
            api.stopCapture();
        }
    }

    // process the event
    function processEvent(evt) {

        // log
        if (evt.type == 'AUDIOERROR') {
            var status = api.getStatus();
            addLog('Error: \'' + evt.detail + '\' (' + status + ')');
            if (status == 'ERRORSTAT') {
                console.error('SB Recorder Error: \'' + evt.detail + '\'');
            } else {
                console.warn('SB Recorder Warn: \'' + evt.detail + '\'');
                return; // ignore audio error which is just informational
            }
        } else if (evt.type != 'INPROGRESS') {
            console.log('SB Recorder Event: \'' + evt.type + '\'');
            addLog('Event: \'' + evt.type + '\'');
        }

        // get just the info we need and release reference to DOM event
        var obj = {
            type: getEventType(evt.type),
            data: (evt.detail || null)
        };

        // call current listener
        if (typeof currentListener == 'function') {
            (function (eventListener) {
                setTimeout(function () {
                    eventListener(obj);
                }, 0);
            })(currentListener);
        }

        // check if recording has stopped
        if (obj.type == 'END') { // done capturing audio
            stopRecordTimer();
            setAudioFile(currentFile, obj);
        }
    }

    var eventNames = [
        'INITIALIZING', 'READY', 'AUDIOERROR',
        'START', 'INPROGRESS', 'END',
        'PLAYSTART', 'PLAYSTOP', 'PLAYPAUSED', 'PLAYRESUMED'
    ];

    // this is for PPC to capture the observer notificaitons
    var AudioRecorderObserver = {
        observe: function (subject, topic, data) {
            var obj = { type: topic };
            if (topic == "END") {
                obj = { type: topic, data: "", detail: data };
            }
            processEvent(obj);
        }
    };

    function addListeners(doc) {
        // ppc uses a different method for capturing events
        if (isPPC()) {
            for (var i = 0; i < eventNames.length; i++) {
                observerService.addObserver(AudioRecorderObserver, eventNames[i], false);
            }
        } else {
            for (var i = 0; i < eventNames.length; i++) {
                YUE.addListener(doc, eventNames[i], processEvent, this, true);
            }
        }
    }

    function removeListeners(doc) {
        // ppc uses a different method for removing events
        if (isPPC()) {
            for (var i = 0; i < eventNames.length; i++) {
                observerService.removeObserver(AudioRecorderObserver, eventNames[i]);
            }
        } else {
            for (var i = 0; i < eventNames.length; i++) {
                YUE.removeListener(doc, eventNames[i], processEvent, this, true);
            }
        }
    }
    
    function createAPI() {

        addLog('API: Creating');

        var embed = Util.Frame.injectEmbed('recorderFrame', 'application/airaudio');

        // this is used directly by the PPC browser
        if (isPPC()) {
            var embedDoc = Util.Dom.getOwnerDocument(embed);
            var embedWin = Util.Dom.getWindow(embedDoc);
            var embedComponents = embedWin.Components;
            observerService = embedComponents.classes["@mozilla.org/observer-service;1"].getService(embedComponents.interfaces.nsIObserverService);
            embedWin.AudioRecorderObserverService = observerService;
        }
        
        addListeners(Util.Dom.getOwnerDocument(embed));

        addLog('API: Created');

        return embed;
    }

    function removeAPI() {
        
        addLog('API: Removing');
        
        try {
            api.clean();
        } catch(ex) {
            // ignore errors
            console.error(ex);
        }
        
        var apiDoc = Util.Dom.getOwnerDocument(api);
        var apiWin = Util.Dom.getWindow(apiDoc);
        removeListeners(apiDoc);
        Util.Dom.removeNode(api);
        if (apiWin.frameElement) {
            Util.Dom.removeNode(apiWin.frameElement);
        }

        api = null;
        
        addLog('API: Removed');
    }
    
    /***********************************************************************/
    
    function Recorder() {
        Recorder.superclass.constructor.call(this);
    }

    YAHOO.lang.extend(Recorder, TDS.SecureBrowser.Base.Recorder);
    
    Recorder.prototype.getNative = function() {
        return api;
    };

    Recorder.prototype.dispose = function() {
        removeAPI();
    };

    Recorder.prototype.getLogs = function () {
        return logs;
    };

    Recorder.prototype.initialize = function (eventListener) {

        var delay = 0;
        
        // try to cleanup 
        if (api) {

            delay = 500;

            try {
                var status = api.getStatus();
                if (status == 'ACTIVE') {
                    api.stopCapture();
                } else if (status == 'PLAYING') {
                    api.stopPlay();
                }
            } catch(ex) {
                console.error(ex);
            }
        }

        // set listener
        currentListener = eventListener;

        // NOTE: If we run this code inside window.onload it fails randomly. 
        // The setTimeout() makes sure we schedule after onload.
        setTimeout(function () {

            // if the api already exists remove it
            if (api) {
                removeAPI();
            }

            // init the api
            setTimeout(function () {
                addLog('API: Initialize');
                api = createAPI();
                if (api && api.initialize) {
                    api.initialize();
                } else {
                    console.error('Could not call initialize on the recorder API.');
                }
            }, delay);

        }, delay);

    };

    Recorder.prototype.getCapabilities = function () {
        var str = api.getCapabilities();
        if (str && str.length > 0) {
            addLog('API: Capabilities: ' + str);
            return JSON.parse(str);
        } else {
            return null;
        }
    };

    Recorder.prototype.getStatus = function () {
        return api.getStatus();
    };

    Recorder.prototype.startCapture = function (options, eventListener) {

        // set current listener
        currentListener = eventListener;

        // save filename 
        if (options.filename) {
            currentFile = options.filename;
        } else {
            currentFile = Util.String.getUUID() + '.' + options.encodingFormat.toLowerCase();
        }

        // fix capture limit
        // MOBILE: duration and/or size
        // DESKTOP: type [size, time] and limit
        if (options.captureLimit) {
            if (options.captureLimit.size) {
                options.captureLimit.type = 'size';
                options.captureLimit.limit = options.captureLimit.size;
            }
            else if (options.captureLimit.duration) {
                options.captureLimit.type = 'time';
                options.captureLimit.limit = 99999; // we use our own record timer
            }
        }

        // parameter requires a string not a json object
        var optionsStr = JSON.stringify(options);
        addLog('Action: Start Capture \'' + currentFile + '\' (' + optionsStr + ')');

        // start capture
        api.startCapture(optionsStr, eventListener); // <-- eventListener doesn't work but has to be included
        
        // start record timer
        if (options.captureLimit && options.captureLimit.duration > 0) {
            startRecordTimer(options.captureLimit.duration);
        }
    };

    Recorder.prototype.stopCapture = function () {
        addLog('Action: Stop Capture');
        api.stopCapture();
    };

    Recorder.prototype.play = function (audioData, eventListener) {
        /*
        {
        type: 'filedata',
        data: playbackData,
        filename: AIRAudioData.filename
        }
        */

        // set current listener
        currentListener = eventListener;

        // the api does not support filename's directly do we need to load the base64
        if (audioData.type == 'filename') {
            var audioFile = getAudioFile(audioData.filename);
            if (audioFile == null) {
                throw new Error('Could not find audio file: ' + audioData.filename);
            }
            audioData.data = audioFile.base64;
        }

        addLog('Action: Play \'' + audioData.filename + '\'');
        api.play(JSON.stringify(audioData));
    };

    Recorder.prototype.stopPlay = function () {
        addLog('Action: Stop Play');
        api.stopPlay();
    };

    Recorder.prototype.pausePlay = function () {
        addLog('Action: Pause Play');
        api.pausePlay();
    };

    Recorder.prototype.resumePlay = function () {
        addLog('Action: Resume Play');
        api.resumePlay();
    };

    Recorder.prototype.loadAudioFile = function (fileIdentifier, base64, eventListener) {

        // create object that looks like what comes from the recorder
        var obj = {
            data: '{ "base64": "' + base64 + '" }'
        };
        setAudioFile(fileIdentifier, obj);

        if (eventListener) {
            setTimeout(function () {
                eventListener();
            }, 0);
        }
    };

    Recorder.prototype.retrieveAudioFileList = function (eventListener) {
        var list = getAudioFileList();
        if (eventListener) {
            setTimeout(function () {
                eventListener(list);
            }, 0);
        } else {
            return list;
        }
        return true;
    };

    Recorder.prototype.retrieveAudioFile = function (fileIdentifier, eventListener) {
        var data = getAudioFile(fileIdentifier);
        if (eventListener) {
            setTimeout(function () {
                eventListener(data);
            }, 0);
        } else {
            return data;
        }
        return true;
    };

    Recorder.prototype.clearAudioFileCache = function (eventListener) {

        // clear each entry
        var list = getAudioFileList();
        for (var i = 0; i < list.length; i++) {
            Util.Storage.remove('recorder-data-' + list[i]);
        }

        // clear list
        Util.Storage.remove('recorder-list');

        if (eventListener) {
            setTimeout(function () {
                eventListener();
            }, 0);
        }
    };

    // public api
    SB.Firefox.Recorder = Recorder;

    // clean the recorder before leaving
    YUE.on(window, 'beforeunload', function () {
        if(api && typeof api.clean == 'function') {
            //bug 92464
            if(Util.Browser.isMacPPC()) {
                var audioStatus = api.getStatus();
                if(audioStatus=="ACTIVE") {
                    api.stopCapture();

                    var audioList = getAudioFileList();
                    var lastFileId = audioList.pop();
                    if(lastFileId) {
                        var audioData = {
                            type: 'filename',
                            filename: lastFileId
                        };
                        Recorder.prototype.play(audioData);
                        Recorder.prototype.stopPlay();
                    }
                }
            }
            
            api.clean();
        }
    });

})(TDS.SecureBrowser);

