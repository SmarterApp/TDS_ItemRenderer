//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
﻿(function (window) {
    'use strict';

    var iframe = document.getElementById('xpcom');

    iframe.style.display = 'none';

    function loadIFrame() {
        iframe.removeEventListener('load', loadIFrame);
    }

    iframe.addEventListener('load', loadIFrame);

    window.xpcom = iframe.contentWindow;

})(window);
