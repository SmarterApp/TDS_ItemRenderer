if (typeof Summit != 'object') Summit = {};
if (typeof Summit.SecureBrowser != 'object') Summit.SecureBrowser = {};

Summit.SecureBrowser.Mobile = function () {

    /********************** CODE FROM SUMMIT   ********************/

    /**
     *  @namespace <b>Version 1.0</b><br>
     *  Author: Kenny Roethel <br>
     *  Mindgrub Technologies December 2012
     *  <hr>
     *
     *  The <code>AIRMobile</code> namespace provides a communication bridge between a web page and a native mobile application
     *  built against these apis.<br><br>
     *
     *  While you can access any function or property in the namespace, some care should be taken to ensure
     *  that api's intended for the native side are not called from the web side. For convenience in distinguishing
     *  between the two, functions intented to only be used by the native application are prefixed with
     *  <b><i>'ntv'</i></b>. Additionally, all properties of <code>AIRMobile.device</code> should be considered read-only, as these
     *  properties are set internally.<br><br>
     *
     *  <b>Usage:</b> Once the window is loaded, and the DOM 'load' event has fired, The <code>AIRMobile.initialize</code> function
     *  is automatically invoked. If the device that the page
     *  was loaded on supports the AIRMobile Javascript interface, it will respond by collecting
     *  the device information and passing it back via the <code>AIRMobile.ntvOnDeviceReady()</code> function.<br><br>
     *
     *  When the device info is received and set. A custom event (<code>AIRMobile.EVENT_DEVICE_READY</code>) is fired. You may subscribe
     *  to listen for this event and take appropriate action when it occurs.
     *  <br> From this point forward, the device properties can be accessed using <code>AIRMobile.device</code>.
     *  <br><br>
     *  eg.<br>
     *
     *  <code>AIRMobile.listen(AIRMobile.EVENT_DEVICE_READY, document, function(){ <br>
     *
     *      &nbsp;&nbsp;&nbsp;&nbsp;if(AIRMobile.device.guidedAccessEnabled == true)
     *      {<br>
     *          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;//Do Something<br>
     *      &nbsp;&nbsp;&nbsp;&nbsp;}<br>
     *      });
     *  </code>
     *  <br><br>
     *
     *  You may wish to receive a notification when other device configurations have changed. To accomplish this,
     *  use one of the defined events:
     *  <br><br>
     *
     *  <code>AIRMobile.listen(AIRMobile.EVENT_GUIDED_ACCESS_CHANGED, document, function(){ <br>
     *
     *      &nbsp;&nbsp;&nbsp;&nbsp;if(AIRMobile.device.guidedAccessEnabled == true)
     *      {<br>
     *          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;//Do Something<br>
     *      &nbsp;&nbsp;&nbsp;&nbsp;}<br>
     *      });
     *  </code><br><br>
     *  
     *  <b>Methods:</b>
     *  To send a request to the native application using the provided methods:
     *  <br><br>
     *  <code>AIRMobile.speakText("The text to speak", AIRMobile.UUID(), function(response){<br>
     *      &nbsp;&nbsp;&nbsp;&nbsp;if(repsonse.errorMessage){<br>
     *          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;//Handle the error<br>
     *      &nbsp;&nbsp;&nbsp;&nbsp;}<br>
     *      });
     *  </code>
     *  <br><br>
     *  In the above example, the code sends a request to the device asking it to speak back
     *  the provided text. A unique identifier is provided for the request, as well as a callback.
     *  Provided that the page has been loaded in the mobile application, the provided callback
     *  will be executed after the device has responded to the request. If the device
     *  does not support the particular request, the response parameter of the callback will contain
     *  an errorMessage, otherwise the device property of AIRMobile will have been updated accordingly
     *  and can be inspected.
     *  <hr><br>
     */
    var AIRMobile =
    {
        /** (Internal)Command to request the device record an audio sample.
         *  @constant */
        CMD_RECORD_AUDIO : "cmdRecordAudioSample",
        /** (Internal)Command to request the device initialize.
         *  @constant */
        CMD_INITIALIZE : "cmdInitialize",
        /** (Internal)Command to request the device fetch a list of its currently running processes.
         *  @constant */
        CMD_GET_PROCESSES : "cmdGetNativeProcesses",
        /** (Internal)Command to request the device check the status of guided access.
         *  @constant */
        CMD_CHECK_GUIDED_ACCESS : "cmdCheckGuidedAccess",
        /** (Internal)Command to request the device check the status of TTS.
         *  @constant */
        CMD_CHECK_TTS : "cmdCheckTTS",
        /** (Internal)Command to request the device log a javascript message(debugging purposes only).
         @constant */
        CMD_JAVASCRIPT_LOG : "cmdJavascriptLog",
        /** (Internal)Command to set the default url to load in the application.
         @constant */
        CMD_SET_DEFAULT_URL : "cmdSetDefaultURL",
        /** (Internal)Command to request the device orientation.
	     @constant */
	    CMD_CHECK_ORIENTATION : "cmdCheckOrientation",
	    /** (Internal)Command to request the device lock orientation.
	     @constant */
	    CMD_LOCK_ORIENTATION : "cmdLockOrientation",
	    /** (Internal)Command to request that the device speak a string of text
	     @constant */
	    CMD_SPEAK_TEXT : "cmdSpeakText",
	    /** (Internal)Command to request that the device stop speaking text
	     @constant */
	    CMD_STOP_SPEAKING : "cmdStopSpeaking",
	    /** (Internal)Command to request that the device report the status of speach playback
	     @constant */
	    CMD_CHECK_SPEAK_STATUS : "cmdCheckSpeakStatus",
	    /** (Internal)Command to request that the device exit the application. Currently android only.
         @constant */
        CMD_EXIT_APPLICATION : "cmdExitApplication",
        /** (Internal)Command to request that the mic mute status be changed. Currently android only.
         @constant */
        CMD_SET_MIC_MUTE : "cmdSetMicMuted",
    
        /** Event dispatched by the document when the connectivity status of the device has changed.
         @constant */
        EVENT_CONNECTIVITY_CHANGED : "airMobile_connectivity_changed",
        /** Event dispatched by the document when the native application changes the default url that is loaded on startup.
         @constant */
        EVENT_DEFAULT_URL_CHANGED : "airMobile_default_url_changed",
        /** Event dispatched by the document when
         @constant*/
        EVENT_DEVICE_READY : "airMobile_device_ready",
        /** Event dispatched by the document when the native application is entering the backgrounded.
         @constant */
        EVENT_ENTER_BACKGROUND : "airMobile_enter_background",
        /** Event dispatched by the document when the native application returns from being backgrounded.
         @constant */
        EVENT_RETURN_FROM_BACKGROUND : "airMobile_return_from_background",
        /** Event dispatched by the document when guided access is enabled/disabled on the device.
         @constant*/
        EVENT_GUIDED_ACCESS_CHANGED : "airMobile_guided_access_changed",
        /** Event dispatched by the document when a change in running processes is detected.
         @constant */
        EVENT_RUNNING_PROCESSES_CHANGED : "airMobile_running_process_changed",
        /** Event dispatched by the document when TTS is enabled/disabled on the device.
         @constant */
        EVENT_TTS_CHANGED : "airMobile_tts_changed",
        /** Event dispatched by the document when the device orientation changes.
	     @constant */
	    EVENT_ORIENTATION_CHANGED : "airMobile_orientation_changed",
	    /** Event dispatched by the document when the device keyboard has changed. At the time this even is fired, the device.keyboard
         * property will have been updated to reflect the new keyboard.
         @constant */
        EVENT_KEYBOARD_CHANGED : "airMobile_keyboard_changed",
        /** Event dispatched by the document when the device mic mute status has changed. At the time this event is fired, the device.micMuted
         *  property will have been updated to reflect the new status. Currently Android only.
         @constant */
        EVENT_MIC_MUTE_CHANGED : "airMobile_mic_mute_changed",
        /** Event dispatched by the document when the application has detected a samsung mini app running. Android only.
         @constant */
        EVENT_MINI_APP_DETECTED : "airMobile_mini_app_detected",
    
        /**
         *  @ignore @private Registered callbacks.
         */
        callbacks : {},
    
        /** @namespace Represents the current status of the device. Users should treat
         *  the properties of this object as read only. Additionally, some properties may
         *  only apply to one type of software, iPhone OS devices, and Android devices, when
         *  this occurs, it is indicated in the properties documentation. */
        device : {
        
            /** Status of the device. When true, the device has responded to
             *  the initialization request and the fields have been set with
             *  values reflecting it's state.
             *  @type Boolean
             */
            isReady : false,
        
            /** The AIRMobile version that the native application was built against.
             *  A negative value indicates the field is uninitialized or unknown.
             *  @type Number
             */
            apiVersion : -1.0,
        
            /** The intial url that the application loads when started.
             *  @type String
             */
            defaultURL : "Unknown",
        
            /** Jailbroken/Rooted Status. When true, the native application has
             *  detected that the device has been jailbroken or rooted. Note that
             *  the application may not be able to detect this under all circumstances.
             *  For instance, on iOS the device may check for the presence of a directory
             *  typically found on jailbroken devices. The absence of this directory
             *  does not mean the device is not jailbroken, only that we have not detected
             *  that it is jailbroken.
             *  @type boolean
             */
            rootAccess : false,
        
            /** The device model. A String representing the model of the hardware.
             *  eg. iPad, iPhone
             *  @type String
             */
            model : "Unknown",
        
            /** The name of the operating system running on the device.
             *  eg. iphone OS
             *  @type String
             */
            operatingSystem : "Unknown",
        
            /** The version of the operating system running on the device.
             *  @type String
             */
            operatingSystemVersion : "Unknown",
        
            /** The internet connectivity status of the device. <br>
             *  Possible values include: <ul>
             *  <li>'connected'</li>
             *  <li>'disconnected'</li>
             *  </ul>
             *  @type String
             */
            connectivityStatus : "Unknown",
        
            /** Status of Guided Access (iPhone OS ONLY). When true, guided access is
             *  enabled on the device. Otherwise, guided access is disabled.
             *  *Note: On android devices, this property will always be false, as android
             *  devices do not have a guided access mode.
             *  @type Boolean
             */
            guidedAccessEnabled : false,
        
            /** Status of Text-To-Speech on the device. *Note this refers to the state native accessibility framework for the device.
             *  On iOS, this corresponds to the "VoiceOver" accessibility option. On android this corresponds to the TalkBack accessibility
             *  setting.
             *  @type Boolean
             */
            textToSpeechEnabled : false,
        
		    /** Status of Text-To-Speech engine on the device. To receive notifications on status change
             *  use EVENT_TTS_CHANGED. This property refers to the capability the application has of speaking
             *  text passed via javascript. If the device is capable of handling these requests, its state will
             *  be either 'idle' or 'playing', otherwise, a status of 'unavailable' will be reported.
		     *	Possible values include: <ul>
		     *	<li>'idle' - A TTS engine is available for use, and is not currently playing audio</li>
		     *	<li>'playing' - A TTS engine is available for use, and is currently playing audio</li>
		     *  <li>'unavailable' - A TTS engine is not available on the device. </li>
		     *	@type String
		     */
            ttsEngineStatus : "unavailable",
		
            /** A list of running processes on the device.
             *  @type Array
             */
            runningProcesses : [],
        
            /** A list of installed packages on the device (Android ONLY)
             * @type Array
             */
            installedPackages : [],
        
		    /** The devices screen resolution.
		     * eg. "{width, height}"
		     */
		    screenResolution : "Unknown",
		
		    /** The devices current orientation.
		     *	Possible values include: <ul>
             *  <li>'portrait'</li>
             *  <li>'landscape'</li>
		     *	<li>'unknown'</li>
             *  </ul>
		     *	@type String
		     */
		    orientation : "Unknown",
		
		    /** The status of orientation lock.
		     *	Possible values include: <ul>
		     *	<li>'portrait'</li>
		     *	<li>'landscape'</li>
		     *	<li>'none'</li>
		     *	</ul>
		     *	@type String
		     */
		    lockedOrientation : "none",
		
            /** The keyboard that users device is configured to use.
             *  This property is currently unique to android as the user can swap out
             *  the keyboard. The included keyboard, which the user is required to switch
             *  to currently has the package name: 'com.air.mobilebrowser/.softkeyboard.SoftKeyboard'
             *  @type String
             */
            keyboard : "unknown",
        
            /** The status of the devices microphone. 
             @type Boolean */
            micMuted : false,
        
            /** Check if the device can currently take screenshots. For iphone OS,
             *  this returns true when guided access is disabled, false otherwise. On
             *  android, this function always returns false, this is because the native application
             *  blocks the standard mechanism for taking screenshots. Users should also inspect
             *  the installed applications property for android devices to ensure that the user
             *  does not have an application that directly accesses the screenbuffer installed.
             *  @return {Boolean} true if it has been detected that the device can currently take a sceenshot by standard means.
             */
            screenShotsEnabled : function()
            {
                var isIOS = this.operatingSystem.toLowerCase() == "iphone os";
                var isAndroid = !isIOS;
            
                if(isIOS)
                {
                    return this.guidedAccessEnabled ? false : true;
                }
                else if (isAndroid)
                {
                    return  false;
                }
                return true;
            },
        
            /** Check if the device supports a given feature.
             *  <br><br>*NOTE This does not indicate if the feature is enabled, only
             *  that we expect the device to support it.
             *  The result is based off of the operating system reported by the device,
             *  eg. iphone OS supports guided access mode, Android does not.<br><br>
             *
             *  Valid feature values:<br>
             *
             *  <ul>
             *  <li>'guided_access' - Guided Access Mode</li>
             *  <li>'text_to_speech' - Text To Speech (Accessibility Detection)</li>
             *  <li>'running_processes' - Running Processes</li>
             *  <li>'installed_packages' - Installed Packages</li>
             *  <li>'audio_recording' - Audio Recording</li>
             *  <li>'mic_mute' - Mice Muting</li>
             *  <li>'tts_engine' - Text To Speech (Speech Synthesis)</li>
             *  <li>'exit' - Exit the app via javascript
             *  </ul>
             *  @param {String} feature the feature to check for compatibility.
             *  @return {Boolean} true if the device supports the feature, false otherwise.
             */
            supportsFeature : function(_feature)
            {
                var isIOS = this.operatingSystem.toLowerCase() == "iphone os";
                var isAndroid = this.operatingSystem.toLowerCase() == "android";
            
                if(_feature == "guided_access") //Only ios
                {
                    return isIOS;
                }
                else if(_feature == "text_to_speech") //either 
                {
                    return isIOS || isAndroid;
                }
                else if(_feature == "running_processes") //either
                {
                    return isIOS || isAndroid;
                }
                else if(_feature == "installed_packages") //android
                {
                    return isAndroid;
                }
                else if(_feature == "mic_mute") //android
                {
                    return isAndroid;
                }
                else if(_feature == "tts_engine") //either
                {
                    return isAndroid || isIOS;
                }
                else if(_feature == "exit") //android
                {
                    return isAndroid;
                }
            
                return false;
            },
        
            /** Convenience function for printing the device info.
             *  @returns {String} a string in the form
             *  "Device: 'device_name', OS: 'os_name', Version: 'os_version', Jailbroken : 'yes_or_no', Resolution : {width, height}"
             */
            formattedDeviceInfo : function()
            {
                var isiOS = this.operatingSystem.toLowerCase() == "iphone os";
            
                return "Device: " + this.model +
                ", OS: " + this.operatingSystem +
                ", Version: " + this.operatingSystemVersion +
                (isiOS ?  ", Jailbroken: " : ", Rooted: ") + (this.rootAccess ? "Yes" : "No") +
			    ", Resolution: " + this.screenResolution;
            }
        
        },
    
        /** Request the status of guided access on the device (iOS only).
         *  Sends an asynchronous request to the device.
         *  @param {String} identifier a unique identifier or null to autogenerate one.
         *  @param {function} callback The callback to invoke when the device responds.
         *      The function should take a single parameter object that will contain a {Boolean}
         *      property called 'enabled'. Additionally, the original identifier will
         *      be provided via an 'identifier' property of the parameter.
         *
         *  @return {String} the unique identifier for the request.
         */
        checkGuidedAccessStatus : function (_identifier, _callback)
        {
            return this.sendCommand(this.CMD_CHECK_GUIDED_ACCESS, _identifier, _callback);
        },
    
        /** Request that the device update its list of running processes.
         *  Sends an asynchronous request to the device.
         *  @param {String} identifier a unique identifier or null to autogenerate one.
         *  @param {function} callback The callback to invoke when the device responds.
         *      The function should take a single parameter object that will contain an {Array}
         *      property called 'runningProcesses'. Additionally, the original identifier will
         *      be provided via an 'identifier' property of the parameter.
         *
         *  @return {String} the unique identifier for the request.
         */
        checkRunningProcesses : function (_identifier, _callback)
        {
            return this.sendCommand(this.CMD_GET_PROCESSES, _identifier, _callback);
        },
    
        /** Request that the device update its status for Text-To-Speech.
         *  Sends an asynchronous request to the device.
         *  @param {String} identifier a unique identifier or null to autogenerate one.
         *  @param {function} callback The callback to invoke when the device responds.
         *      The function should take a single parameter object that will contain a {Boolean}
         *      property called 'enabled', and a {String} property called ttsEngineStatus.
         *      The important distinction between these two is that the former corresponds to the
         *      platforms native accessibility framework. When enabled, the device will automatically
         *      provide voice feedback to the users interactions. The ttsEngineStatus corresponds to
         *      the applications speech synthesis engine, which is controllable via these apis.
         *      Additionally, the original identifier will
         *      be provided via an 'identifier' property of the parameter.
         *  @return {String} the unique identifier for the request.
         */
        checkTextToSpeechStatus : function (_identifier, _callback)
        {
            return this.sendCommand(this.CMD_CHECK_TTS, _identifier, _callback);
        },
    
	    /** Request to check the devices current orientation.
	     * Sends an asynchronous request to the device.
	     * @param {String} identifier a unique identifier or null to autogenerate one.
	     * @param {function} callback The callback to invoke when the device responds.
	     *		The function should take a single parameter object that will contain a {String}
	     *		property called 'orientation'. Additionally, the original identifier will
	     *		be provided via an 'identifier' property of the parameter.
	     *	@return {String} the unique identifier for the request.
	     */
	    checkOrientation : function (_identifier, _callback)
	    {
		    return this.sendCommand(this.CMD_CHECK_ORIENTATION, _identifier, _callback);
	    },
	
	    /** Request that the device lock its orientation. <br>
	     *	Note that requesting that the device lock its orientation will not necessarily change the orientation.
	     *	For example, if the user is holding the device in landscape, and a request is made
	     *	to lock the device in portait, the lock may not actually take effect until the device has
	     *	been rotated to portait.
	     *	<br>Eg.<br>
	     *	<code>AIRMobile.requestOrientationLock('landscape', AIRMobile.UUID(), function(_param){<br>
	     *
	     *		&nbsp;&nbsp;&nbsp;&nbsp;if(device.orientation != _param.lockedOrientation)
	     *		{<br>
	     *			&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;//Tell user to rotate the device before continuing<br>
	     *		&nbsp;&nbsp;&nbsp;&nbsp;}<br>
	     *		});
	     *	</code>
	     *	@param {String} orientation the orientation to lock the device in.
	     *	@param {String} identifier a unique identifier or null to autogenerate one.
	     *	@param {function} callback The callback to invoke when the device responds.
	     *		The function should take a single parameter object that will have the following properties:<br>
	     *
	     *	<ul>
	     *		<li><b>currentOrientation</b> The current orientation of the device</li>
	     *		<li><b>lockedOrientation</b> The locked orientation of the device</li>
         *	@return {String} the unique identifier for the request.
	     */
	    requestOrientationLock : function(_orientation, _identifier, _callback)
	    {
		    _identifier = _identifier == null ? this.UUID() : _identifier;
            this.callbacks[_identifier] = _callback;
        
            var params = {
                identifier : _identifier,
                orientation : _orientation
            };
        
            this.sendToApp(this.CMD_LOCK_ORIENTATION, JSON.stringify(params, null, true));
        
            return _identifier;
	    },
	
        /**
         *  Request that the device record an audio clip.
         *
         *  <br>Eg.<br>
         *  <code>AIRMobile.recordAudio(10, AIRMobile.UUID(), function(_param){ <br>
         *
         *      &nbsp;&nbsp;&nbsp;&nbsp;if(_param.data != null)
         *      {<br>
         *          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;//Do Something<br>
         *      &nbsp;&nbsp;&nbsp;&nbsp;}<br>
         *      });
         *  </code>
         *  @param clipLength The length of the audio clip to record (in seconds). Neither AIRMobile, or the
         *  native devices will limit the duration of the clip, however, it is recommended to use a reasonably
         *  short length such as < ~30 seconds since the audio data is also
         *  transfered via javascript.<br>
         *  @param identifier The unique identifier for the request.
         *  @param {function} callback The callback to invoke when complete.
         *  <br>The function should take a single parameter, an object which
         *  will have the following properties:<br>
         *
         *  <ul>
         *      <li><b>filename</b> (The filename from the device - includes file extension)</li>
         *      <li><b>data</b> (The base64 encoded audio data)</li>
         *      <li><b>identifier</b> (original identifier for the request that initialized the recording)</li>
         *      <li><b>cancelled</b> (true if user cancelled, false otherwise)</li>
         *      <li><b>error</b> (true if an error occured, false or not present otherwise)</li>
         *  </ul>
         *	@return {String} the unique identifier for the request.
         */
        recordAudio : function(_duration, _identifier, _callback)
        {
            _identifier = _identifier == null ? this.UUID() : _identifier;
        
            this.callbacks[_identifier] = _callback;
        
            var params = {
                identifier : _identifier,
                duration : _duration
            };
        
            this.sendToApp(this.CMD_RECORD_AUDIO, JSON.stringify(params, null, true));
        
            return _identifier;
        },
    
        /** Request that the device update its default url. <br><br>
         *  Caution* this change is persistant, once the application
         *  has been restarted, the new url that is set here will be used.
         *  @param {String} urlString the url to set on the device.
         *  @param {String} identifier a unique identifier for the request, or null to generate one.
         *  @param {function} callback the callback to register.
         *	@return {String} the unique identifier for the request.
         */
        setDefaultURL : function (_urlString, _identifier, _callback)
        {
            var params = null;
        
            if(_callback != null)
            {
                _identifier = _identifier == null ? this.UUID() : _identifier;
            
                this.callbacks[_identifier] = _callback;
            
                params = {
                    identifier : _identifier,
                    url : _urlString
                };
            }
            else
            {
                params = {
                    url : _urlString
                };
            }
        
            this.sendToApp(this.CMD_SET_DEFAULT_URL, JSON.stringify(params, null, true));
        
            return _identifier;
        },
	
        /** Request that the device speak a string of text.
         *  Before calling this function, you should first check to ensure that the device
         *  can can synthesize text by using the AIRMobile.device.ttsEngineStatus property.
         *  Upon receiving the message on device, the callback will be invoked reflecting the
         *  state of the engine (eg. 'playing'). When the device completes playback, an additional
         *  event will be fired (EVENT_TTS_CHANGED) and the device.ttsEngineStatus will be updated
         *  accordingly.
         *  @param {String} textToSpeak the text that is to be synthesized
         *  @param {String} identifier a unique identifier for the request, or null to generate one.
         *  @param {function} callback the callback to register.
         *	@return {String} the unique identifier for the request.
         */
	    speakText : function (_textToSpeak, _identifier, _callback)
	    {
            var params = null;
        
            if(_callback != null)
            {
                _identifier = _identifier == null ? this.UUID() : _identifier;
            
                this.callbacks[_identifier] = _callback;
            
                params = {
                    identifier : _identifier,
                    textToSpeak : _textToSpeak
                };
            }
        
            this.sendToApp(this.CMD_SPEAK_TEXT, JSON.stringify(params, null, true));
        
            return _identifier;
	    },
	
    
        /** Request that the device stop playback. Upon completion, the callback will be
         *  excecuted, and the EVENT_TTS_CHANGED event will be fired.
         *	@return {String} the unique identifier for the request.
         */
        stopSpeaking : function (_identifier, _callback)
        {
            return this.sendCommand(this.CMD_STOP_SPEAKING, _identifier, _callback);
        },
    
        /** Request that the device exit the native application.
         *  Note that the callback will be invoked in the case that the device
         *  does not support the command.
         *	@return {String} the unique identifier for the request.
         */
        exitApplication : function (_identifier, _callback)
        {
            return this.sendCommand(this.CMD_EXIT_APPLICATION, _identifier, _callback);
        },
    
        /** Request that the device mute the microphone. Upon completion, the device property
         *  will reflect the new state of the mic. **This method is for Android only**
         *  @param {Boolean} muted the value to set for the mic.
         *  @param {String} identifier a unique identifier for the request, or null to generate one.
         *  @param {function} callback the callback to register.
         *	@return {String} the unique identifier for the request.
         */
        setMicMute : function (_muted, _identifier, _callback)
        {
            var params = null;
        
            if(_callback != null)
            {
                _identifier = _identifier == null ? this.UUID() : _identifier;
            
                this.callbacks[_identifier] = _callback;
            
                params = {
                    identifier : _identifier,
                    muted : _muted
                };
            }
        
            this.sendToApp(this.CMD_SET_MIC_MUTE, JSON.stringify(params, null, true));

            return _identifier;
        },
    
        /** Called when the mic mute status changes on the device.
         *  
         *  @param Parameters JSON representation of the result.
         *  @config {Boolean} micMuted the new value for the mic mute status.
         *  @return {Boolean} the mute value
         */
        ntvOnMicMuteChanged : function (_parameters)
        {
            var results = JSON.parse(_parameters, null);
        
            var changed = false;
        
            if(this.device.micMuted != results.muted)
            {
                changed = true;
                this.device.micMuted = results.muted;
            }
        
            this.executeCallback(results);
        
            if(changed == true)
            {
                this.dispatchEvent(this.EVENT_MIC_MUTE_CHANGED);
            }
        
            return this.device.micMuted;
        },
    
        /** Called when recording on the device is complete.
         *
         *  @param Parameters JSON representation of the result.
         *  @config {String} data base64 encoded audio data.
         *  @config {String} filename the name of the file on the device (not unique).
         *  @config {String} identifier
         *  @config {Boolean} cancelled
         *  @return {String} 'Audio Received'
         */
        ntvOnRecordingComplete : function (_parameters)
        {
            var results = JSON.parse(_parameters, null);
        
            this.executeCallback(results);
        
            return "Audio Received";
        },
    
        /** Called when the device connectivity changes.
         *
         *  @param Parameters JSON representation of the result.
         *  @config {String} status the status of the device connectivity.
         */
        ntvOnConnectivityChanged : function(_parameters)
        {
            var results = JSON.parse(_parameters, null);
        
            if(results.status && results.status != this.device.connectivityStatus)
            {
                this.device.connectivityStatus = results.status;
                this.dispatchEvent(this.EVENT_CONNECTIVITY_CHANGED);
            }
        
            return this.device.connectivityStatus;
        },
    
        /** Called when the device is ready; in response to an 'cmdInitialize' request.
         *
         *  @param {String} Parameters JSON representation of the device info.
         *  @config {String} model
         *  @config {String} operatingSystem
         *  @config {Number} operatingSystemVersion
         *  @config {Number} apiVersion
         *  @config {Array{String}} runningProcesses
         *  @config {Array{String}} [installedPackages]
         *  @config {Boolean} textToSpeech
         *  @config {Boolean} guidedAccess
         *  @config {Boolean} rootAccess
         *  @config {String} connectivity
	     *	@config {String} screenResolution
	     *	@config {String} orientation
         *  @config {String} lockedOrientation
         *  @config {String} ttsEngineStatus
         *  @return {String} 'OK'
         */
        ntvOnDeviceReady : function (_parameters)
        {
            var results = JSON.parse(_parameters, null);
        
            this.device.isReady = true;
            this.device.apiVersion = results.apiVersion != null ? results.apiVersion : -1.0;
            this.device.model = results.model;
            this.device.operatingSystem = results.operatingSystem;
            this.device.operatingSystemVersion = results.operatingSystemVersion;
            this.device.runningProcesses = results.runningProcesses;
            this.device.installedPackages = results.installedPackages;
            this.device.rootAccess = results.rootAccess;
            this.device.connectivityStatus = results.connectivity;
            this.device.defaultURL = results.defaultURL;
            this.device.textToSpeechEnabled = results.textToSpeech;
            this.device.guidedAccessEnabled = results.guidedAccess;
		    this.device.screenResolution = results.screenResolution;
       	    this.device.orientation = results.orientation;
		    this.device.lockedOrientation = results.lockedOrientation;
		    this.device.ttsEngineStatus = results.ttsEngineStatus;
		    this.device.keyboard = results.keyboard;
            this.device.micMuted = results.muted;
        
            this.dispatchEvent(this.EVENT_DEVICE_READY);
        
            return "OK";
        },
    
	    /** Called in response to a request that is not supported by the device.
	     *	When received, the original callback is executed using a response object
	     *	containing an error message.
	     */
	    ntvOnRequestNotSupported : function (_parameters)
	    {
		    var response = JSON.parse(_parameters, null);
		
		    if(response.errorMessage == null)
		    {
			    response.errorMessage = "Platform does not support feature";
		    }
		
		    this.executeCallback(response);
	    },
	
        /** Called when GuidedAccess has changed in status, or in response to a request
         *  to check the status of GuidedAccess.
         *
         *  @param {String} Parameters JSON representation of the result
         *  @config {String} [identifier]
         *  @config {Boolean} enabled
         *  @return {Boolean} the status of guidedAccessEnabled
         */
        ntvOnGuidedAccessEnabled : function (_parameters)
        {
            var results = JSON.parse(_parameters, null);
        
            var changed = results.enabled != this.device.guidedAccessEnabled;
        
            this.device.guidedAccessEnabled = results.enabled;
        
            this.executeCallback(results);
        
            if(changed == true)
            {
                this.dispatchEvent(this.EVENT_GUIDED_ACCESS_CHANGED);
            }
        
            return this.device.guidedAccessEnabled;
        },
    
        /** Called when The native TextToSpeech engine is enabled on the device, or in response
         *  to a request to check the status of TextToSpeech.
	     *	@param Parameters JSON representation of the result
	     *	@config {Boolean} enabled (status of the accessibility)
	     *	@config {String} ttsEngineStatus ('unavailable', 'playing', 'idle')
         *  @return the status of textToSpeechEnabled.
         */
        ntvOnTextToSpeechEnabled : function (_parameters)
        {
            var results = JSON.parse(_parameters, null);
        
            var changed = this.device.textToSpeechEnabled != results.enabled;
        
		    if(changed == false)
		    {
			    changed = this.device.ttsEngineStatus != results.ttsEngineStatus;
		    }
		
            this.device.textToSpeechEnabled = results.enabled;
		
		    if(results.ttsEngineStatus != null)
		    {
			    this.device.ttsEngineStatus = results.ttsEngineStatus;
		    }
        
            this.executeCallback(results);
        
            if(changed == true)
            {
                this.dispatchEvent(this.EVENT_TTS_CHANGED);
            }
        
            return this.device.textToSpeechEnabled;
        },
    
        /** Called when the device has updated its list of running processes.
         *
         *  @param Parameters JSON respresentation of the result
         *  @config {String} [identifier]
         *  @config {Array{String}} runningProcesses
         *  @return {Boolean} true if there was a change, false if not.
         */
        ntvOnRunningProcessesUpdated : function (_parameters)
        {
            var results = JSON.parse(_parameters, null);
        
            var processes = results.runningProcesses;
        
            var added   = diffArr(processes, this.device.runningProcesses);
            var removed = diffArr(this.device.runningProcesses, processes);
        
            if(added.length > 0)
                console.log("Added " + added);
            if(removed.length > 0)
                console.log("Removed " + removed);
        
            this.device.runningProcesses = processes;
        
            this.executeCallback(results);
        
            if(added.length > 0 || removed.length > 0)
            {
                this.dispatchEvent(this.EVENT_RUNNING_PROCESSES_CHANGED);
            }
        
            return added.length > 0;
        },
    
        /** Called when the device is entering the backgrounded state.
         *  @return {String} 'OK'
         */
        ntvApplicationEnterBackground : function ()
        {
            this.dispatchEvent(this.EVENT_ENTER_BACKGROUND);
            return "OK";
        },
	
        /** Called when the device has returned from a backgrounded state.
         *  @return {String} 'OK'
         */
        ntvApplicationReturnFromBackground : function ()
        {
            this.dispatchEvent(this.EVENT_RETURN_FROM_BACKGROUND);
            return "OK";
        },
    
        /** Called when the application has updated its default url.
         *  @param {String} Parameters JSON representation of the result
         *  @config {String} url
         *  @config {String} [identifier]
         *  @return {String} the url that was set.
         */
        ntvOnSetDefaultURL : function(_parameters)
        {
            var results = JSON.parse(_parameters, null);
        
            var changed = false;
        
            if(results.url)
            {
                changed = results.url != AIRMobile.device.defaultURL;
                AIRMobile.device.defaultURL = results.url;
            }
        
            this.executeCallback(results);
        
            if(changed)
            {
                this.dispatchEvent(this.EVENT_DEFAULT_URL_CHANGED);
            }
        
            return this.device.defaultURL;
        },
    
        /** Called when the application detects a 'Samsung' mini app running
         *  on the device.
         *  @return {String} 'OK'
         */
        ntvMiniAppLaunched : function()
        {
            this.dispatchEvent(this.EVENT_MINI_APP_DETECTED);
            return "OK";
        },
    
	    /** Called when the application detects a change in the device orientation.
	     *  @param {String} Parameters JSON representation of the result
	     *	@config {String} orientation
	     *	@config {String} [identifier]
	     *	@return {String} the orientation that was set.
	     */
	    ntvOnOrientationChanged : function(_parameters)
	    {
		    var results = JSON.parse(_parameters, null);
		
		    var changed = false;
		
		    if(results.orientation)
		    {
			    changed = results.orientation != AIRMobile.device.orientation;
			    AIRMobile.device.orientation = results.orientation;
		    }
		
		    this.executeCallback(results);
		
		    if(changed)
		    {
			    this.dispatchEvent(this.EVENT_ORIENTATION_CHANGED);
		    }
		
		    return this.device.orientation;
	    },
	
	    /** Called when the application has updated its orientation lock.
	     *	@param {String} Parameters JSON representation of the result.
	     *	@config {String} orientation
	     *	@config {String} lockedOrientation
	     *	@return {String} the lock that was set.
	     */
	    ntvOnOrientationLockChanged : function(_parameters)
	    {
		    var results = JSON.parse(_parameters, null);
		
		    var orientationChanged = false;
		
		    if(results.lockedOrientation)
		    {
			    AIRMobile.device.lockedOrientation = results.lockedOrientation
		    }
		
		    if(results.orientation)
		    {
			    orientationChanged = results.orientation != AIRMobile.device.orientation;
			    AIRMobile.device.orientation = results.orientation;
		    }
		
		    this.executeCallback(results);
		
		    if(changed)
		    {
			    this.dispatchEvent(this.EVENT_ORIENTATION_CHANGED);
		    }
		
		    return this.device.lockedOrientation;
	    },
	
        /** Called when the application has detected the keyboard package has changed.
         *  @param {String} Parameters JSON representation of the result.
         *  @config {String} keyboard the keyboard package that the user switched to.
         */
        ntvOnKeyboardChanged : function (_parameters)
        {
            var results = JSON.parse(_parameters, null);
        
            if(results.keyboard)
            {
                this.device.keyboard = results.keyboard;
            }
        
            this.dispatchEvent(this.EVENT_KEYBOARD_CHANGED);
        
            return results.keyboard;
        },
    
        /** Dispatch an event using the document; with the given name.
         *
         *  @param eventName the name of the event to dispatch
         *  @return true if the event was dispatched, false if not.
         *  @private
         */
        dispatchEvent : function (_eventName)
        {
            var result = false;
        
            if(_eventName && _eventName.length > 0)
            {
                var event = document.createEvent("Event");
                event.initEvent(_eventName, true, true);
                document.dispatchEvent(event);
                result = true;
            }
        
            return result;
        },
    
        /** Executes the callback corresponding to the response object provided.
         *
         *  @param {Object} responseObject the parsed response object.
         *  @config {String} identifier the original request identifier.
         *  @return true if a callback was found, false if no callback was found.
         *  @private
         */
        executeCallback : function (_responseObject)
        {
            var callback = this.callbacks[_responseObject.identifier];
            var result = false;
        
            if(callback != null)
            {
                callback(_responseObject);
                delete this.callbacks[_responseObject.identifier];
                result = true;
            }
            else if(_responseObject.identifier != null)
            {
                console.warn("No callback for identifier: " +_responseObject.identifier);
            }
        
            return result;
        },
    
        /** Used internally to send a javascript log message to the device. Users should use
         *  <code>console.log()</code> or one of its varients, rather than this to log to the device.
         *  @param {object} parameters
         *  @config {string} type one of:
         *  <ul>
         *      <li>'info'</li>
         *      <li>'error'</li>
         *      <li>'warn'</li>
         *      <li>'debug'</>
         *  </ul>
         *  @config {string} message
         *  @private
         */
        log : function (_parameters)
        {
            this.sendToApp(this.CMD_JAVASCRIPT_LOG, _parameters);
        },
    
        /** Send a message to a native ios app via its url loading mechanism.
         *  The url that's loaded takes the form key:##airMobile_msgsnd##value, where key and value are parsed out of the url in the application. <br><br>
         *  Note* this mechanism will only work with the native counterpart of <code>AIRMobile</code>.
         *
         *  In our context, the <code>key</code> passed should be one of a known set of commands that the native
         *  application understands. Additionally, the <code>value</code> parameter should be in a format that the
         *  application expects and can understand.
         *  When applicable, the <code>value</code> parameter will typically be a JSON string with additional info about what the command should do.
         *
         *  @param {String} key the key to pass the application
         *  @param {String} value the value to pass for the key
         *  @private
         */
        sendToApp : function(_key, _value)
        {
            var iframe = document.createElement("IFRAME");
            iframe.setAttribute("src", _key + ":##airMobile_msgsnd##" + _value);
            document.documentElement.appendChild(iframe);
            iframe.parentNode.removeChild(iframe);
            iframe = null;
        },
    
        /** Send a command, with a callback and identifier, to the native application.
         *  <br><br>*This function is intended to be used internally by AIRMobile.
         *  @param {String} command the command to send
         *  @param {String} identifier a unique identifier for the request, or null to generate one.
         *  @param {Function} callback the callback to register
         *  @return {String} identifier the identifier used
         */
        sendCommand : function (_command, _identifier, _callback)
        {
            var params = null;
        
            if(_callback != null)
            {
                _identifier = _identifier == null ? this.UUID() : _identifier;
            
                this.callbacks[_identifier] = _callback;
            
                params = {
                    identifier : _identifier
                };
            }
        
            this.sendToApp(_command, JSON.stringify(params, null, true));
        
            return _identifier;
        },
    
        /** Utility function to generate a unique identifier. Users can call
         *  this to generate an identifier for request methods.
         *  @return {String} a unique string
         */
        UUID : function ()
        {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                                                                  var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
                                                                  return v.toString(16);
                                                                  });
        
        },
    
        /** Convenience function to add a listener to an event.
         *  Supports W3C and IE event mechanisms.
         *  @param {String} event the name of the event to listen for.
         *  @param {Object} element the element that will fire the event.
         *  @param {Function} function the function to call when the event fires.
         */
        listen : function (evnt, elem, func)
        {
            if (elem.addEventListener)  // W3C DOM
            {
                elem.addEventListener(evnt,func,false);
            }
            else if (elem.attachEvent)// IE DOM
            {
                return elem.attachEvent("on"+evnt, func);
            }
        },
    
        /** Request that the device initialize itself and report its status.
         *  This function is automatically invoked when the window's load event
         *  is fired. It is unneccessary to call this manually.<br><br>
         *  If the device is compatible, it will respond by making a corresponding
         *  call to <code>AIRMobile.ntvOnDeviceReady()</code>, at which point, the
         *  device info will be set up, and the <code>AIRMobile.EVENT_DEVICE_READY</code>
         *  event is fired on the document.
         */
        initialize : function ()
        {
            var params = {
                version : "1.0"
            };
        
            this.sendToApp(this.CMD_INITIALIZE, JSON.stringify(params, null, true));
        }
    }

    /* Listen for the window load event, when it is fired, initialize AIRMobile. */
    AIRMobile.listen("load", window, function(){ AIRMobile.initialize(); });


    /** Convenience for logging to the device.<br> <i>console.log("some string")</i> will print "info: some string" to the
     *  devices on screen debug console.<br><br>Make sure to remove console logs from production to avoid unnecessary
     *  back and forth with the device.
     */
    var console = {
        /** Log */
        log : function(log){
            setTimeout(function() {
                       AIRMobile.log(JSON.stringify({ type : "info", value : log }, null, true));
                       }, 100);
        },
        /** Log an Error */
        error : function(log){
            setTimeout(function() {
                       AIRMobile.log(JSON.stringify({ type : "error", value : log }, null, true));
                       }, 100);
        },
        /** Log a Warning */
        warn : function(log){
            setTimeout(function() {
                       AIRMobile.log(JSON.stringify({ type : "warn", value : log }, null, true));
                       }, 100);
        },
        /** Log a Debug Statement */
        debug : function(log){
            setTimeout(function() {
                       AIRMobile.log(JSON.stringify({ type : "debug", value : log }, null, true));
                       }, 100);
        },
        /** Log an Info Statement */
        info : function(log){
            setTimeout(function() {
                       AIRMobile.log(JSON.stringify({ type : "info", value : log }, null, true));
                       }, 100);
        }
    }

    /**
     *  Array addition for difference.
     *  @private
     *  @ignore
     */
    var diffArr = function(a, b) {
        return a.filter(function(i) {return !(b.indexOf(i) > -1);});
    };

    /********************** CODE FROM SUMMIT   ********************/
    window.AIRMobile = AIRMobile;

    this.getNativeBrowser = function () { return AIRMobile; };
}
