//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
(function(TS) {
    // TODO: move all TTS code into here.
    // hook up TTS progress dialog
    (function () {
        TTS.Manager.Events.onShowProgress.subscribe(function (text) {
            TestShell.UI.showLoading(text);
        });

        TTS.Manager.Events.onHideProgress.subscribe(function () {
            TestShell.UI.hideLoading();
        });

    })();


})(TestShell);