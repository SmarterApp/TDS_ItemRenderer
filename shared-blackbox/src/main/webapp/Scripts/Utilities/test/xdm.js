/// <reference path="../util_xdm.js" />

var XDM = Util.XDM;

XDM.init();
XDM.suppressException = true; // prevent global exception

QUnit.config.reorder = false;

QUnit.testDone(function () {
    XDM.removeListeners();
});

asyncTest('Return object from listener', function () {

    // SERVER
    XDM.addListener('test', function (str, num) {
        equal(str, 'ping', 'received ping');
        equal(num, 100, 'received number');
        return {
            name: 'pong',
            num: 200
        };
    });

    // CLIENT
    XDM().post('test', 'ping', 100).then(function(obj) {
        equal(obj.name, 'pong', 'received return value');
        equal(obj.num, 200, 'received return value');
        start();
    });
});

asyncTest('Return promise from listener', function() {

    // SERVER
    XDM.addListener('test', function () {
        var defered = $.Deferred();
        setTimeout(function() {
            defered.resolve(200);
        }, 0);
        return defered;
    });

    // CLIENT
    XDM().post('test', 'ping').then(function (num) {
        equal(num, 200, 'received return value');
        start();
    });

});

asyncTest('Throw exception from listener', function() {

    // SERVER
    XDM.addListener('test', function () {
        throw new Error('test');
    });

    // CLIENT
    XDM().post('test', 'ping').fail(function (error) {
        equal(error.message, 'test', 'Sent the error back');
        start();
    });

});

asyncTest('Return rejected promise from listener', function () {

    // SERVER
    XDM.addListener('test', function () {
        var defered = $.Deferred();
        setTimeout(function () {
            try {
                throw new Error('test');
            } catch (ex) {
                defered.reject(ex);
            }
        }, 0);
        return defered;
    });

    // CLIENT
    XDM().post('test', 'ping').fail(function (error) {
        equal(error.message, 'test', 'Sent the error back');
        start();
    });

});


