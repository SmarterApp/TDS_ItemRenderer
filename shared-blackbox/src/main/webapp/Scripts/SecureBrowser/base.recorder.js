/*
This is the base recorder API. This is used as a template
for abstracting away the different vendor implementations.
*/

(function(SB) {

    // list of events
    var Event = {        
        /** Event dispatched by the document when the recorder status changes to initialization.
	     *  @constant */
        DEVICE_INITIALIZING: "INITIALIZING",
	    
        /** Event dispatched by the document when the recorder status changes to ready
	     *  @constant */
        DEVICE_READY: "READY",
	    
        /** Event dispatched by the document when the recorder error occurs
	     *  @constant */
        DEVICE_ERROR: "ERROR",
	    
        /** Event indicating capture has started.
	     *  @constant */
        CAPTURE_START: "START",
	    
        /** Event indicating a progress event has occured (30kb audio captured etc).
	     *  @constant */
        CAPTURE_INPROGRESS: "INPROGRESS",
	    
        /** Event indicating capture has ended.<br>
	     *  The event contains the base 64 encoded data of the recording. This
	     *  event is fired as a MessageEvent where the message value contains a JSON string representing the recorded
	     *  data.<br><code>
	     *  {<br>
	     *  &nbsp   base64 : 'base_64_encoded_file',<br>
	     *  &nbsp   filename : 'filename.opus',<br>
	     *  &nbsp   qualityIndicator : 'good' //potential values 'good' 'poor' 'unknown'<br>
	     *  }
	     *  </br></coe>
	     *  @constant */
        CAPTURE_END: "END",
	    
        /** Event indicating audio playback has started.
	     *  @constant */
        PLAYBACK_START: "PLAYBACK_START",
	    
        /** Event indicating audio playback has ended.
	     *  @constant */
        PLAYBACK_END: "PLAYBACK_END",
	    
        /** Event indicating audio playback has paused.
	     *  @constant */
        PLAYBACK_PAUSED: "PLAYBACK_PAUSED",
	    
        /** Event indicating audio playback has resumed.
	     *  @constant */
        PLAYBACK_RESUMED: "PLAYBACK_RESUMED",
	    
        /** Event indicating audio playback has stopped.
	     *  @constant */
        PLAYBACK_STOPPED: "PLAYBACK_STOPPED",
	    
        /** Event indicating audio playback has errored.
	     *  @constant */
        PLAYBACK_ERROR: "PLAYBACK_ERROR",
	    
        /** Status indicating the device is initialized, but no recording is in progress.
	     *  @constant */
        STATUS_IDLE: "IDLE",
	    
        /** Status indicating the device is initialized and recording is in progress.
	     *  @constant */
        STATUS_ACTIVE: "ACTIVE",
	    
        /** Status indicating the device is currently initializing.
	     *  @constant */
        STATUS_INITIALIZING: "INITIALIZING",
	    
        /** Status indicating the device is encountered an error and a reinitialize is required.
	     *  @constant */
        STATUS_ERROR: "ERROR",
	    
        /** Status indicating the device is done recording and final book keeping and generation of
         encoded audio is in progress.
         *  @constant */
        STATUS_STOPPING: "STOPPING"
	    
        /** Status indicating that playback is not currently occuring.
	     *  @constant */
        // PLAYBACK_STATE_IDLE: "IDLE",
	    
	    /** Status indicating that playback is currently occuring.
	     *  @constant */
        // PLAYBACK_STATE_PLAYING: "PLAYING",
	    
	    /** Status indicating that playback is currently paused.
	     *  @constant */
        // PLAYBACK_STATE_PAUSED: "PAUSED"
    };

    // create the base recorder class
    var Recorder = function() {
    };

    Recorder.Event = Event;

    /** Request that the device initialize the audio recorder system.
	*  Sends an asynchronous request to the device. If an event listener
	*  is specified, the function will be registered for the following events:
	*  <ul>
	*  <li>INITIALIZING</li>
	*  <li>READY</li>
	*  <li>ERROR</li>
	*
	*  @param {function} eventHandler The event handler to register for
	*      correstponding events.
	*  @return {String} The unique identifier for the request which was
	*  sent to the device.
	*/
    Recorder.prototype.initialize = function(eventListener) {
    };
    
    /** Request the current status of the Recorder.
	*  @return {String} status The current status of the recorder. One of:
	*      <ul><li>unknown</li>
	*      <li>IDLE</li>
	*      <li>ACTIVE</li>
	*      <li>INITIALIZING</li>
	*      <li>STOPPING</li>
	*      <li>ERROR</li>
	*/
    Recorder.prototype.getStatus = function() {
        return 'UNKNOWN';
    };

    /** Request the devices' recording capabilities.
	*  @throws {Error} 'recorder not initialized'
	*  @return {Object} An object representing the recording capabilities.
	*  <code>
	*  <br>{<br>
	*  &nbsp   isAvailable : true,<br>
	*  &nbsp   supportedInputDevices : {<br>
	*  &nbsp&nbsp                      [   id : 0,<br>
	*  &nbsp&nbsp&nbsp                     channelCounts : 1,<br>
	*  &nbsp&nbsp&nbsp                     description : 'device name',<br>
	*  &nbsp&nbsp&nbsp                     sampleSizes : ['8','16'],<br>
	*  &nbsp&nbsp&nbsp                     sampleRates : ['48000','24000'],<br>
	*  &nbsp&nbsp&nbsp                     formats : ['opus','someCoolCodec']
	*  &nbsp&nbsp                      ]<br>
	*  &nbsp&nbsp                      }<br>
	*  }
	*  </code>
	*/
    Recorder.prototype.getCapabilities = function() {
        return null;
    };

    /*
    Returns the default record options for passing into startCapture.
    */
    Recorder.prototype.getDefaultOptions = function() {
        return {};
    };
    
    /** Request that the device begin capturing audio.
	 *  @throws {Error} an error indicating either that the
	 *  recorder is in an invalid state, or that an input option was
	 *  invalid for the specified device.
	 *  @param {Object} options the recorder options to use when recording
	 *  @config {String} captureDevice
	 *  @config {String} sampleRate
	 *  @config {String} channelCount
	 *  @config {String} sampleSize
	 *  @config {String} encodingFormat
	 *  @config {Boolean} qualityIndicator
	 *  @config {String} filename (optional)
	 *  @config {Object} progressFrequency an object containing properties for type and interval
	 *  type should be one of either "size" or "time", interval should be an integer corresponding to
	 *  kilobytes, or seconds, respectively.
	 *  @param {function} eventListener The event handler to register for corresponding events:
	 *  <ul>
	 *  <li>EVENT_START</li>
	 *  <li>EVENT_END</li>
	 *  <li>EVENT_INPROGRESS</li>
	 *  <li>EVENT_ERROR</li>
	 */
    Recorder.prototype.startCapture = function(options, eventListener) {

    };

    /** Request that the device stop audio capture.
	 *  @throws {Error} Recorder not recording
	 *  sent to the device.
	 */
    Recorder.prototype.stopCapture = function() {

    };

    /** Request that the device playback audio.
	 *  @param {Object} audioData object containing information on what audio to play
	 *  @config {String} type the type of audio info either 'filename' or 'filedata'
	 *  @config {String} data the data, this should either by the base64 encoded file, or the filename
	 *  @config {String} filename the filename (used to save the base64 data to disk)
	 *  Example
	 *  <code>
	 *  {
	 *      type : 'filename',
	 *      data : 'myfile.opus',
	 *      filename : 'myfile.opus'
	 *  }
	 *  </code>
	 *  @param {function} eventListener the handler to invoke when playback events are fired.
	 */
    Recorder.prototype.play = function(audioData, eventListener) {

    };

    /** Request that the device stop playing.
	 *	@throws {Error} Playback has not begun
	 */
    Recorder.prototype.stopPlay = function() {

    };

    /** Request that the device pause playback.
	 *	@throws {Error} Playback has not begun
	 */
    Recorder.prototype.pausePlay = function() {

    };

    /** Request that the device resume playback.
	 *	@throws {Error} Playback is not paused
	 */
    Recorder.prototype.resumePlay = function() {

    };

    Recorder.prototype.loadAudioFile = function(fileIdentifier, callback) {

    };

    Recorder.prototype.retrieveAudioFileList = function(fileIdentifier, callback) {

    };

    /** Request that the device retrieve an audio file.
	 *  @param {String} fileIdentifier
	 *  @param {Function} callback
	 *  @return {String}
	 */
    Recorder.prototype.retrieveAudioFile = function(fileIdentifier, callback) {

    };

    Recorder.prototype.clearAudioFileCache = function(callback) {

    };
    
    Recorder.prototype.getLogs = function() {
        return [];
    };

    SB.Base.Recorder = Recorder;

})(TDS.SecureBrowser);

// mikes code is here..
// TDS.SecureBrowser.Recorder.Events.DEVICE_INITIALIZING; // 'INITIALIZING'
