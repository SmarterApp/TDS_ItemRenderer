//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
/*
API for storing and retrieving TDS data for taking a test.
*/

TDS.Student = TDS.Student || {};

(function(Student) {

    var PREFIX = 'TDS-Student-';
    var Storage = {};
    var Cache = {};

    var Events = new Util.EventManager();

    var set = function (name, obj) {
        var key = PREFIX + name;
        Util.Storage.set(key, obj);
        Cache[key] = obj;
        Events.fire(name, obj);
    };
    
    var get = function (name) {
        var key = PREFIX + name;
        return Cache[key] || Util.Storage.get(key);
    };

    Storage.setTestee = function (obj) {
        set('testee', obj);
    };

    Storage.getTestee = function () {
        return get('testee');
    };

    Storage.setTestSession = function (obj) {
        set('testSession', obj);
    };

    Storage.getTestSession = function () {
        return get('testSession');
    };

    Storage.setPassphrase = function (obj) {
        set('passphrase', obj);
    };

    Storage.getPassphrase = function () {
        return get('passphrase');
    };

    Storage.setAccList = function (accs) {

        var arr = [];

        $(accs).each(function (idx, acc) {

            // check if segment
            if (idx > 0) {

                // start with the test accs as the base
                var testAccs = accs[0].clone();
                testAccs.setId(acc.getId());
                testAccs.setPosition(acc.getPosition());
                testAccs.setLabel(acc.getLabel());

                // then we will replace any of the test accs types with the segment accs
                testAccs.replaceWith(acc);

                // now swap in the new accs
                acc = testAccs;
            }

            // convert to json
            arr.push(acc.exportJson());
        });

        set('acc', arr);
    };

    Storage.getAccJson = function () {
        return get('acc');
    };

    Storage.getAccList = function () {

        var arr = [];
        var accs = get('acc');
        
        Util.Array.each(accs, function (accJson) {
            var acc = new Accommodations();
            acc.importJson(accJson);
            arr.push(acc);
        });

        return arr;
    };

    // create a json version of AccLookup.cs array
    Storage.createAccLookups = function() {
        var accList = Storage.getAccList();
        return accList.map(function (acc) {
            var types = acc.getTypes();
            return {
                position: acc.getPosition(),
                id: acc.getId(),
                types: types.map(function (accType) {
                    var values = accType.getSelected();
                    var type = {};
                    type[accType.getName()] = values.map(function (accValue) {
                        return accValue.getCode();
                    });
                    return type;
                })
            };
        });
    };

    // serialize first set of accs into compatible string for AccLookup.cs deserialize() function
    Storage.serializeAccs = function () {
        var list = Storage.getAccList();
        if (list && list.length > 0) {
            var accs = list[0]; // get test accs
            var typeNames = accs.getTypes().map(function(type) {
                return type.getName();
            });
            var typeGroups = typeNames.map(function (typeName) {
                var type = accs.getType(typeName);
                var codes = type.getSelected().map(function (value) {
                    return value.getCode();
                });
                return typeName + ':' + codes.join(',');
            });
            return typeGroups.join(';');
        }
        return null;
    };

    // allows setting a type/code on default accommodations (mostly for debugging)
    Storage.setAccCode = function (name, code) {
        var accList = TDS.Student.Storage.getAccList();
        if (accList && accList.length) {
            var accs = accList[0];
            var accType = accs.createType(name);
            var accValue = accType.createValue(code);
            accValue.select();
            TDS.Student.Storage.setAccList(accList);
        }
    };
    
    Storage.setTestProperties = function (obj) {
        set('testProps', obj);
    };

    Storage.getTestProperties = function () {
        return get('testProps');
    };

    Storage.setOppInfo = function(obj) {
        set('oppInfo', obj);
    };

    Storage.getOppInfo = function () {
        return get('oppInfo');
    };

    Storage.createOppInstance = function () {

        var session = Storage.getTestSession();
        var oppInfo = Storage.getOppInfo();

        return {            
            oppKey: oppInfo.oppKey,
            browserKey: oppInfo.browserKey,
            sessionKey: session.key
        };
    };

    Storage.setTestInfo = function (obj) {
        set('testInfo', obj);
    };

    Storage.getTestInfo = function () {
        return get('testInfo');
    };

    Storage.setReturnUrl = function (url) {
        set('returnUrl', url);
    };

    Storage.getReturnUrl = function () {
        return get('returnUrl');
    };

    Storage.clear = function () {
        console.info('STORAGE CLEAR');
        Cache = {};
        var keys = Util.Storage.keys();
        keys.forEach(function(key) {
            if (Util.String.startsWith(key, PREFIX)) {
                Util.Storage.remove(key);
            }
        });
    };

    // PROXY Functions BEGIN
    Storage.setProctor = function (proctor) {
        set('proctor', proctor);
    };

    Storage.getProctor = function () {
        return get('proctor');
    };

    Storage.setPopupsEnabled = function (popupsEnabled) {
        set('popups-enabled', popupsEnabled);
    };

    Storage.getPopupsEnabled = function () {
        return get('popups-enabled');
    };
    // PROXY Function END

    Storage.Events = Events;
    Student.Storage = Storage;
    
    // for debugging purposes only
    function getObjects() {
        var keys = Util.Storage.keys();
        return keys.map(function (key) {
            if (Util.String.startsWith(key, PREFIX)) {
                key = key.replace(PREFIX, '');
                var value = get(key);
                if (value) {
                    return {
                        key: key,
                        value: value
                    }
                }
            }
        }).filter(function (obj) {
            return obj;
        });
    }

    /*function getDebug() {
        var sb = new Util.StringBuilder('SESSION STORAGE:');
        sb.appendLine();
        var objects = getObjects();
        objects.forEach(function (obj, idx) {
            if (idx > 0) {
                sb.appendLine();
            }
            sb.appendFormat('{0}={1}', obj.key, JSON.stringify(obj.value));
        });
        return sb.toString();
    }*/

    function getDebug() {

        var sb = new Util.StringBuilder('SESSION STORAGE:');
        sb.appendLine();

        var returnUrl = Storage.getReturnUrl();
        sb.appendFormat('returnUrl={0}', JSON.stringify(returnUrl));
        sb.appendLine();

        // testee
        var testee = Storage.getTestee();
        if (testee) {
            delete testee['attributes'];
        }
        sb.appendFormat('testee={0}', JSON.stringify(testee));
        sb.appendLine();

        // session
        var testSession = Storage.getTestSession();
        sb.appendFormat('testSession={0}', JSON.stringify(testSession));
        sb.appendLine();

        // test properties
        var testProps = Storage.getTestProperties();
        if (testProps) {
            delete testProps['requirements'];
        }
        sb.appendFormat('testProps={0}', JSON.stringify(testProps));
        sb.appendLine();

        // open opp info
        var oppInfo = Storage.getOppInfo();
        sb.appendFormat('oppInfo={0}', JSON.stringify(oppInfo));
        sb.appendLine();

        // start test info
        var testInfo = Storage.getTestInfo();
        if (testInfo) {
            delete testInfo['comments'];
        }
        sb.appendFormat('testInfo={0}', JSON.stringify(testInfo));
        sb.appendLine();

        // accommodations
        var accs = Storage.serializeAccs();
        sb.appendFormat('accs={0}', accs);

        return sb.toString();
    }

    // register logger for exceptions
    TDS.Diagnostics.registerLogger(function () {
        return getDebug();
    });

})(TDS.Student);

