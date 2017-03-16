//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2016 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************

//SB-1506-Intelligent-Muting. This file was added to support muting passages only or items only.
(function (TS, CM) {

    // mark passage for JAWS 16 Braille Only
    var markPassageBrailleOnly = function (pageEl) {
        $(".thePassage", pageEl).attr("brailleonly", "true");
    };
    var markItemBrailleOnly = function (pageEl) {
        $(".theQuestions", pageEl).attr("brailleonly", "true");
    };
   

    function load() {       
        CM.onPageEvent('loaded', function(page){
            var accProps = page.getAccProps();
            var pageEl= page.getElement();

            if (accProps) {
                if (pageEl) {
                    if (accProps.isPassageMuted()) {
                        markPassageBrailleOnly(pageEl);
                    }
                    if (accProps.isItemMuted()) {
                        markItemBrailleOnly(pageEl);
                    }
               }
            }
       });
    }

    TS.registerModule({
        name: 'brailleonly',
        load: load
    });

})(TestShell, ContentManager);