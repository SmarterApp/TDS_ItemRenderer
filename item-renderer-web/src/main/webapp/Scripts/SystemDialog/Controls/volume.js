//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
﻿// create volume control
(function (SD) {

    /*
    SB volume code
    */

    function isSystemVolumeSupported() {
        return Util.SecureBrowser.getVolume() >= 0;
    }

    // get the current system volume info
    function getSystemVolumeInfo() {

        // Range is 0-100
        var curVol = Util.SecureBrowser.getVolume();
        console.log('getSystemVolume: ' + curVol);

        // Convert to 0-10
        if (curVol > 0) {
            curVol = Math.round(curVol / 10);
        }

        return {
            min: 0,
            max: 10,
            current: curVol
        };
    }

    // set the system volume.
    function setSystemVolume(level) {
        level = level * 10;
        Util.SecureBrowser.setVolume(level);
    }

    /*
    Slider control
    */

    var slider = null;

    function create() {
        var systemVolumeInfo = getSystemVolumeInfo();
        if (systemVolumeInfo) {
            slider = Util.Slider.create('systemVolume', systemVolumeInfo.min, systemVolumeInfo.max);
            return slider.getEl();
        }
    }

    // called when showing control
    function show() {
        var systemVolumeInfo = getSystemVolumeInfo();
        slider.setValue(systemVolumeInfo.current);
    }

    // called when hiding control
    function hide() {
        
    }

    // called when saving dialog settings
    function save() {
        var level = slider.getValue();
        setSystemVolume(level);
    }

    // called when cancel dialog and need to reset values
    function reset() {
        
    }

    function getLabel() {
        return Messages.getAlt('SystemDialog.Label.Volume', 'Volume');
    }

    SD.register({
        create: create,
        show: show,
        hide: hide,
        save: save,
        reset: reset,
        getLabel: getLabel,
        isSupported: isSystemVolumeSupported
    });

})(TDS.SystemDialog);
