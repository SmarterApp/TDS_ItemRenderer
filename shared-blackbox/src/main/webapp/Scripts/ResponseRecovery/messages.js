//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
﻿TestShell.ResponseRecovery.messages = (function () {
    var messages = {}

    function add(name, key, value) {
        Object.defineProperty(messages, name, {
            get: function () {
                return Messages.getAlt(key, value);
            }
        });
    }

    add('dialogSubmit', 'Submit', 'Submit');
    add('dialogCancel', 'Cancel', 'Cancel');

    add('dialogMenuHeader',   'responserecovery.menuHeader',       'Saved Drafts');
    add('dialogSessionLabel', 'responserecovery.menuSessionLabel', 'Sitting {index}{label}');
    add('dialogVersionLabel', 'responserecovery.menuVersionLabel', 'Version {sequence} - {count} characters');

    add('sessionLabel',        'responserecovery.sessionLabel',        ' ({month}/{day}/{year})');
    add('sessionLabelCurrent', 'responserecovery.sessionLabelCurrent', ' (Now)');

    add('toolText',    'responserecovery.toolText',    'Response Recovery');
    add('loadFailure', 'responseRecovery.loadFailure', 'Failed to load response history.  Close the Response Recovery tool and re-open it to try again.');
    add('noHistory',   'responseRecovery.noHistory',   'It appears that you do not have no other versions of your response to restore.');

    add('saveMessage', 'responserecovery.saveMessage', 'Saving response');

    add('previewPlaceholder', 'responserecovery.previewPlaceholder', '');

    return messages;
})();
