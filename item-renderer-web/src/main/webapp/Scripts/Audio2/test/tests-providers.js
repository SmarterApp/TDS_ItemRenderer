//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
﻿
// we have multiple sound providers, so we will run each test on each provider
// here is some glue code to plug each sound provider into the tests
(function (exports) {

    var providers = ['createjs', 'sm2'];

    function testServices(name, testService) {

        if (typeof testService !== 'function') {
            testService = name;
            name = '';
        }

        providers.map(function (serviceName) {
            return TDS.Audio.Player.getServices().get(serviceName);
        }).filter(function (service) {
            return service.isSupported();
        }).forEach(function (service) {

            function createModule(moduleName, lifetime) {
                module('(' + service.getName() + ') ' + name + '.' + moduleName, {
                    setup: function () {
                        setupService(service);

                        if (lifetime && typeof lifetime.setup === 'function') {
                            lifetime.setup.call(this);
                        }
                    },
                    teardown: function () {
                        if (lifetime && typeof lifetime.teardown === 'function') {
                            lifetime.teardown.call(this);
                        }

                        service.teardown();
                    }
                });
            }

            // initialize the service, run the tests, then clean up

            testService(service, createModule);
        });
    }

    function waitFor(timeout, event, then, fail) {

        var eventIsDeferred = event && Q.isPromise(event.promise),
            eventIsPromise = event && Q.isPromise(event);

        if (event && !event.subscribe && !eventIsDeferred && !eventIsPromise) {
            fail = then;
            then = event;
            event = undefined;
        }

        var deferred, promise;
        if (eventIsPromise) {
            promise = event;
        } else if (eventIsDeferred) {
            promise = event.promise;
        } else {
            deferred = Q.defer();
            promise = deferred.promise;
        }

        if (event && deferred) {
            event.subscribe(function (value) {
                deferred.resolve(value);
            });
        }

        promise.timeout(timeout).then(then || null, fail || null).finally(function () {
            QUnit.start();
        });

        QUnit.stop();
    }

    function createSource(url) {
        var m = /\w+\.(\w+)/.exec(url);
        return {
            url: url,
            type: m === null ? '' : ('audio/' + m[1])
        };
    }

    var createId = (function () {
        var id = 0;

        return function () {
            var str = id.toString();
            id++;
            return str;
        };
    })();

    function setupService(service, servicePriorities) {

        ContentManager.setBaseUrl('/blackbox/');

        // some providers have async initializations, so we need to suspend running the test until it is ready
        QUnit.stop();

        if (service.setup && !service.initialize) {
            service.setup(servicePriorities);
        } else if (service.initialize && !service.setup) {
            service.initialize();
        }

        service.onReady(function () {

            if (createjs && createjs.Sound) {
                // we want to enfoce the correct path at runtime but can't use the correct path during tests
                // therefore, we will mock the regular expression for the tests (dropping the query string parameter check)
                createjs.Sound.FILE_PATTERN = /()()()(\w+\.(\w+))()/;
            }

            QUnit.start();
        });
    }

    exports.testServices = testServices;
    exports.waitFor = waitFor;
    exports.createSource = createSource;
    exports.createId = createId;
    exports.setupService = setupService;

})(window);
