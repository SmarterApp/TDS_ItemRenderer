//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
﻿(function(TS) {

    var modules = [];

    function registerModule(module) {
        modules.push(module);
    }

    function loadModules() {

        var names = [];

        modules.forEach(function (module) {
            names.push(module.name);
            if (typeof module.load == 'function') {
                module.load();
            }
        });

        // log module names
        console.log('TestShell Modules: ' + names.join(', '));
    };

    function unloadModules() {
        modules.forEach(function (module) {
            if (typeof module.unload == 'function') {
                module.unload();
            }
        });
    };

    TS.getModules = function() {
        return modules;
    };

    TS.registerModule = registerModule;
    TS.Events.subscribe('init', loadModules);
    YUE.on(window, 'beforeunload', unloadModules);

})(TestShell);