//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
﻿// this module is the entry point for the Response Recovery feature
//  * it creates and configures the ResponseRecovery instance
//  * it registers the Response Recovery content plugin

TestShell.registerModule({
    name: 'responseRecovery',
    load: function () {
        // check if any of the segments have response recovery enabled
        var responseRecoveryEnabled = Accommodations.Manager.getAll().filter(function (accs) {
            var accProps = new Accommodations.Properties(accs);
            return accProps.hasResponseRecovery();
        }).length;

        var enabledFormats = TDS.getAppSetting('tds.responserecovery.enabledItemTypes');

        if (responseRecoveryEnabled && enabledFormats && enabledFormats.length > 0) {
            var responseRecovery = new TestShell.ResponseRecovery(
                TestShell.ResponseManager,
                TestShell.xhrManager,
                TDS.Student.Storage,
                typeof enabledFormats === 'string' ? enabledFormats.split(',') : []
            );

            TestShell.ResponseRecovery.Plugin.register(responseRecovery);
        }
    }
});
