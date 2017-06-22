//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
﻿/*
This module is used to listen for security breaches in the secure browser.
*/

(function (TS, MSG) {

    function load() {

        // make sure the event exists
        if (!Util.SecureBrowser.Events ||
            !Util.SecureBrowser.Events.onSecurityBreach) return;

        // listen for secutiry breach event if the acc is enabled
        var accProps = TDS.getAccommodationProperties();
        if (accProps && accProps.isSecurityBreachDetectionEnabled()) {
            Util.SecureBrowser.Events.onSecurityBreach.subscribe(function (evt) {
                if (TS.isUnloading) return;  // if the test shell is unloading and we have a breach ignore this since we are in the process of leaving the test shell anyways
                var errorMsg = MSG.getAlt('TestShell.Alert.EnvironmentInsecure', 'Environment is not secure. Your test will be paused.');
                TS.UI.showAlert('Error', errorMsg, function () {
                    TS._pauseInternal(true, 'Environment Security (breach event)', TestShell.Config.disableSaveWhenEnvironmentCompromised);
                });
            });
        }
    }

    TS.registerModule({
        name: 'securitybreach',
        load: load
    });

})(TestShell, Messages);
