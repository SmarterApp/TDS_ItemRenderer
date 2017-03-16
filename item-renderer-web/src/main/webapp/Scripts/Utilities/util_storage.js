//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
﻿//Requires: yahoo-dom-event.js, cookie.js, swf.js, storage.js

/*
Ideas:
- https://github.com/marcuswestin/store.js/
- https://github.com/justindeguzman/locstor/blob/master/locstor.js
- https://github.com/nbubna/store
*/

(function(Util) {

    function serialize(value) {
        return JSON.stringify(value);
    }

    function deserialize(value) {
        if (typeof value != 'string') {
            return undefined;
        }
        try {
            return JSON.parse(value);
        } catch (ex) {
            return value || undefined;
        }
    }

    // 'api' is a DOM storage compatible API (https://developer.mozilla.org/en-US/docs/Web/Guide/API/DOM/Storage)
    var Storage = function(api) {
        this._api = api;
    };

    // Number of items in storage
    Storage.prototype.length = function () {
        return this._api.length;
    };

    // Removes key from storage
    Storage.prototype.remove = function (key) {
        this._api.removeItem(key);
    };

    // set the raw value without json stringify it
    Storage.prototype.setString = function (key, value) {
        this._api.setItem(key, value);
    };

    // Stores a value for a key.
    Storage.prototype.set = function (key, value) {
        if (value === undefined) {
            this.remove(key);
        } else {
            this.setString(key, serialize(value));
        }
    };

    // get the raw value without json parsing it
    Storage.prototype.getString = function (key) {
        try {
            return this._api.getItem(key);
        } catch (ex) {
            return undefined;
        }
    };

    // Returns value for key if available. Otherwise returns undefined.
    Storage.prototype.get = function (key) {

        // get json string
        var json = this.getString(key);

        // check for any data
        if (json === undefined || json === null) {
            return undefined;
        }

        // parse json data
        try {
            return deserialize(json);
        } catch (ex) {
            throw new Error('Invalid data for the key "' + key + '"');
        }
    };

    // Returns key for the index. If the index does not exist then null.
    Storage.prototype._key = function(index) {
        return this._api.key(index);
    };

    // Get all the keys in storage
    Storage.prototype.keys = function(filter) {
        var keys = [];
        var i = 0, len = this.length();
        for (; i < len; i++) {
            var key = this._key(i);
            if (key && (typeof filter != 'function' || filter(key))) {
                keys.push(key);
            }
        }
        return keys;
    };

    // Clears all items that are stored
    Storage.prototype.clear = function() {
        if (this._api.clear) {
            this._api.clear();
        } else {
            var keys = this.keys();
            keys.forEach(function(key) {
                this.remove(key);
            }.bind(this));
        }
    };
    
    // create HTML5 sessionStorage
    Util.Storage = new Storage(sessionStorage);

})(Util);
