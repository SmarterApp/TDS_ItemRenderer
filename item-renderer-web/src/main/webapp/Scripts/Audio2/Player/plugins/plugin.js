//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
﻿(function (audio) {

    function PlayerPlugin() {
        this._publicApi = [];
    }

    Object.defineProperties(PlayerPlugin.prototype, {
        publicApi: {
            get: function () {
                return this._publicApi;
            },
            enumerable: true, configurable: false
        }
    });

    PlayerPlugin.prototype.expose = function (name, publicName) {
        this.publicApi.push({
            plugin: this,
            name: name,
            publicName: publicName || name,
            isFunction: typeof this[name] === 'function'
        });
    };

    PlayerPlugin.prototype.initialize = function (player) {
        this.player = player;
    };

    PlayerPlugin.prototype.player = null;

    PlayerPlugin.prototype.onSoundCreated = function (source) {
    };

    PlayerPlugin.prototype.parseSource = function (element, source) {
    };

    // exports

    audio.PlayerPlugin = PlayerPlugin;

})(TDS.Audio);
