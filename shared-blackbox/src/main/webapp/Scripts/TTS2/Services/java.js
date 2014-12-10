// TTS service: Java applet is the provider

function TTSService_Applet()
{
    this.TTSApplet = null;               // Reference to the applet instance

    this.setApplet = function(applet) {
        this.TTSApplet = applet;

        this.TTSApplet.initialize(); // this initializes the applet to COM bridge. It is important to leave this here because if we dont, then all following calls to SAPI will fail
    };

    this.supportsVolumeControl = function () {
        return false;
    };

    this.supportsPitchControl = function () {
        return false;
    };

    this.supportsRateControl = function () {
        return false;
    };

    this.isSupported = function ()
    {
        // TODO : Need to check for Java here at some point. Right now, only checking for windows because the applet only runs on windows
        return (navigator.platform.indexOf("Windows") != -1 || navigator.platform.indexOf("Win32") != -1 || navigator.platform.indexOf("Win64") != -1)        
    };

    this.load = function()
    {
        if (!this.isSupported()) return false;

        AppletTTS.Manager.createFrame(window.javaFolder);  // inserts the applet into a hidden iframe to provide the backend service

        return true;
    };

    // get the SB status converted into a nice enum
    this.getStatus = function()
    {
        if (this.TTSApplet)
        {
            var currentStatus = this.TTSApplet.getStatus();
            if (currentStatus == 'Stopped') return TTS.Status.Stopped;
            else if (currentStatus == 'Playing') return TTS.Status.Playing;
            else if (currentStatus == 'Paused') return TTS.Status.Paused;
            else if (currentStatus == null || currentStatus == '') return TTS.Status.Unknown;
        }

        return TTS.Status.Uninitialized;
    };

    this.play = function(text)
    {
        if (!this.TTSApplet) return false;
        return this.TTSApplet.speak(text);        
    }

    this.pause = function()
    {
        return false;
    }

    this.resume = function()
    {
        return false;
    }

    this.stop = function()
    {
        if (!this.TTSApplet) return false;

        return this.TTSApplet.stopSpeaking();              
    }

    // get the current volume
    this.getVolume = function()
    {
        return 10;
    }

    this.setVolume = function(level)
    {       
        return true;
    }

    this.getVoices = function()
    {
        if (!this.TTSApplet) return null;

        // get voice string
        var voicesData = this.TTSApplet.getVoiceList();

        // make sure we got returned something
        if (voicesData == null || voicesData.length == 0) return [];

        // split voices and return array
        return voicesData.split(',');
    };

    // get the current system voice
    this.getVoice = function()
    {
        if (!this.TTSApplet) return null;
        return this.TTSApplet.getCurrentVoice();
    };

    this.setVoice = function(voice)
    {
        if (!this.TTSApplet) return null;
        return this.TTSApplet.setCurrentVoice(voice);
    };
}

AppletTTS.Manager = { };

AppletTTS.Manager.createFrame = function(codebase)
{
    var appletConfig =
    {
        id: 'AIRTTS',
        codebase: codebase + 'AIRTTS',
        code: 'air/org/tts/TTSApplet.class',
        archive: 'AIRTTSApplet.jar',
        callback: 'tdsFireTTSAppletEvent'
    };

    Util.Frame.injectApplet('appletTTSFrame', appletConfig);
};

/****************************************************************************************************************************/
//
// This function is called by the applet when it has loaded up and is ready for use. DO NOT CHANGE the name of this function
//
/****************************************************************************************************************************/
function tdsFireTTSAppletEvent(applet, event, data)
{
    event = event.toLowerCase();    

    if (event == 'loaded') // applet started
    {
        if (typeof (TTS.Manager._service.setApplet) == "function")
            TTS.Manager._service.setApplet(applet);  // set the reference to this applet

        TTS.Manager.Events.onServiceLoad.fire();    
    }
}


