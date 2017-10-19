// *******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2017 American Institutes for Research

// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
// *******************************************************************************
// REQUIRES: YUI, IO.js, SecureBrowser.Base.js

/*
 * Unified API Version for SecureBrowser
 */

(function (SB) {

    function Unified() {};

    Unified.prototype.initialize = function() {};

    Unified.prototype.getRunTime = function () {
        return null;
    };

    Unified.prototype._hasAPI = function () {
        return (typeof (SecureBrowser) != 'undefined');
    };

    Unified.prototype.setCapability = function (property, enable) {
        try {
            if (this._hasAPI()
                && typeof SecureBrowser.security.setCapability === 'function') {

                function callback(jsonliteral) {
                }

                SecureBrowser.security.setCapability(property, enable, callback,
                    callback);
            }
        } catch (ex) {
            console.log('Exception occurred ' + ex.message);
        }
    };

    Unified.prototype.getCapability = function (property) {
        try {
            if (this._hasAPI()
                && typeof SecureBrowser.security.getCapability === 'function') {
                return SecureBrowser.security.getCapability(property);
            }
        } catch (ex) {
            console.log('Exception occurred ' + ex.message);
            return false;
        }
        return false;
    };

    Unified.prototype.getVolume = function () {
        return -1;
    };

    // Check if the environment is can be secured before testing
    Unified.prototype.canEnvironmentBeSecured = function () {
        return {'canSecure': true, 'messageKey': null};
    };

    Unified.prototype.isEnvironmentSecure = function () {
        try {
            if (this._hasAPI()
                && typeof SecureBrowser.security.isEnvironmentSecure === 'function') {
                var deferred = Util.Promise.defer();

                SecureBrowser.security.isEnvironmentSecure(function (state) {
                    deferred.resolve(state);
                });

                return deferred.promise;
            }
        } catch (ex) {
            console.log('Exception occurred ' + ex.message);
        }
    };

    // get list of blacklisted processes
    Unified.prototype.getForbiddenApps = function () {
        try {
            if (this._hasAPI()
                && typeof SecureBrowser.security.examineProcessList === 'function') {
                var deferred = Util.Promise.defer();

                // get currently running processes
                SecureBrowser.security.examineProcessList(TDS.Config.forbiddenApps.map(app => app.name), function (results /* []<string> */) {
                    // make sure forbidden apps list exists
                    if (typeof (TDS) != 'object' ||
                        typeof (TDS.Config) != 'object' ||
                        typeof (TDS.Config.forbiddenApps) != 'object' ||
                        (TDS.Config.forbiddenApps == null)) {
                        deferred.resolve([]);
                    }
                    deferred.resolve(results);
                });

                return deferred.promise;
            }
        } catch (ex) {
            console.log('Exception occurred ' + ex.message);
        }
    };

    Unified.prototype.lockDown = function (enable) {
        try {
            if (this._hasAPI()
                && typeof SecureBrowser.security.lockDown === 'function') {

                SecureBrowser.security.lockDown(enable,
                    function (currentLockDownState) {
                        console.log("lockDown successful. Current lock down state: " + currentLockDownState);
                    },
                    function (currentLockDownState) {
                        console.error("lockDown error. Current lock down state: " + currentLockDownState);
                    });
            }
        } catch (ex) {
            console.log('Exception occurred ' + ex.message);
        }
    };

    SB.Unified = Unified;

})(TDS.SecureBrowser);