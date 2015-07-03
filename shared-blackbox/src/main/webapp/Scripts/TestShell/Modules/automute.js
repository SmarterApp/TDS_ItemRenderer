//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
//Created to fulfill ticket 88056

(function (TS) {

    var Player = TDS.Audio.Player;

    function attemptPlay(){
        Player.onIdle.subscribe(doMute);
        Player.onFail.subscribe(doMute);
        Player.onPause.subscribe(doMute);
        
        if(Util.SecureBrowser.unmute()){
            TestShell.muted = false;
            Util.log('unmuting...');
        }
    }
    
    function engageAutomute() {
        Player.onPlay.subscribe(attemptPlay);
        Player.onResume.subscribe(attemptPlay);
        
        // Re-activate automute after changing the system volume setting
        if (Util.SecureBrowser.Events && Util.SecureBrowser.Events.onSetVolume) {
            Util.SecureBrowser.Events.onSetVolume.subscribe(function () {
                if (TestShell.muted) { //not currently playing audio prompt
                    doMute();
                }
            });
        }
        doMute();
        Util.log('Automute engaged');
    }

    function doMute(){
        Player.onIdle.unsubscribe(doMute);
        Player.onFail.unsubscribe(doMute);
        Player.onPause.unsubscribe(doMute);

        if(Util.SecureBrowser.mute()){
            TestShell.muted = true;
            Util.log('muting...');
        }
    }

    function load() {
        var accProps = TDS.getAccommodationProperties();
        if(accProps && accProps.isAutoMute()) {
            engageAutomute();
        }
    }

    TS.registerModule({
        name: 'automute',
        load: load
    });

    //DEBUG
    //TS.automute_start = engageAutomute;
})(TestShell);