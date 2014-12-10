/// <reference path="../../Libraries/YUI/yahoo/yahoo.js" />
/// <reference path="../util_event_custom.js" />
/// <reference path="../util_event_emitter.js" />

var CE = Util.Event.Custom;
var Emitter = Util.Event.Emitter;

module('Custom Event');

test('Firing event', function() {
    var ce = new CE();
    var fired = false;

    function onEvent() {
        fired = true;
    }

    ce.subscribe(onEvent);
    ce.fire();
    ok(fired, 'Event fired');

    fired = false;
    ce.unsubscribe(onEvent);
    ce.fire();
    ok(!fired, 'Event unsubscribed');

});

test('Firing once', function () {
    var ce = new CE(null, true /*fireOnce*/);
    var count = 0;

    function onEvent() {
        count++;
    }

    ce.subscribe(onEvent);
    ce.fire();
    ce.fire();
    equal(count, 1, 'Event only fired once');

    count = 0;
    ce = new CE(null);
    ce.subscribe(onEvent, null, true /*fireOnce*/);
    ce.fire();
    ce.fire();
    equal(count, 1, 'Subscriber removed itself');
});

test('Firing once and then subscribing', function () {

    var ce = new CE(null, true);
    var count = 0;

    function onEvent() {
        count++;
    }

    ce.fire();
    ce.subscribe(onEvent);

    equal(count, 1, 'Subscribe fired callback');
});

test('Firing arguments', function () {

    var ce = new CE();
    var args;

    function onEvent() {
        args = arguments;
    }
    
    ce.subscribe(onEvent);
    ce.fire();
    ok(args, 'Event was called');
    equal(args.length, 0, 'No arguments');

    args = null;
    ce.fire('Hello', 1);
    ok(args, 'Event was called again');
    equal(args.length, 2, 'Has arguments');
    equal(args[0], 'Hello', 'First argument is a string');
    equal(args[1], 1, 'Second argument is a number');
});

test('Scope', function () {

    var ce = new CE();
    equal(ce.scope, window);

    var globalScope = {};
    ce = new CE(globalScope);
    equal(ce.scope, globalScope);

    var currentScope = null;
    function onEvent() {
        currentScope = this;
    }

    ce.subscribe(onEvent);
    ce.fire();
    equal(currentScope, globalScope);
    ce.unsubscribe(onEvent);

    var scope = {};
    ce.subscribe(onEvent, scope);
    ce.fire();
    equal(currentScope, scope);

});

test('Cancelling', function() {

    var ce = new CE();

    var count = 0;
    ce.subscribe(function () {
        count++;
    });
    ce.subscribe(function () {
        count++;
        return false;
    });
    ce.subscribe(function () {
        count++;
    });
    var cancelled = ce.fire();
    ok(cancelled === false, 'Fire returned false');
    equal(count, 2, 'Third event listener did not execute');
    
});

test('Removing empty function', function() {
    var ce = new CE();
    var count = 0;
    ce.subscribe(function () {
        count++;
    });
    ok(ce.unsubscribe(null) === false, 'Unsubscribe returned false');
    ce.fire();
    equal(count, 1, 'Event still fired');
});

test('Unsubscribe in middle of events firing', function() {
    var ce = new CE();
    var count = 0;
    function callback1() {
        count++;
        ce.unsubscribe(callback2);
    }
    function callback2() {
        count++;
    }
    ce.subscribe(callback1);
    ce.subscribe(callback2);
    ce.fire();
    equal(count, 1, 'Subscriber callback2 should not be called while subscribers are firing.');
});

/////////////////////////////////////////////////////////////////

module('Event Provider');

test('Fired events', function () {

    var emitter = new Emitter();
    emitter.create('test1');
    ok(emitter.has('test1'));

    var fired = false;
    function onEvent() {
        fired = true;
    }

    emitter.on('test1', onEvent);
    emitter.fire('test1');
    ok(fired, 'Fired explicit event');
    fired = false;

    emitter.removeListener('test1', onEvent);
    emitter.fire('test1');
    ok(!fired, 'Removed explicit event');
    fired = false;

    emitter.on('test2', onEvent);
    emitter.fire('test2');
    ok(fired, 'Fired implicit event');

});

test('Scope', function () {

    var globalScope = {};
    var localScope = {};
    var emitter = new Emitter(globalScope);

    var currentScope = null;
    function onEvent() {
        currentScope = this;
    }

    emitter.on('test', onEvent);
    emitter.fire('test');
    equal(currentScope, globalScope, 'Setting global scope');
    emitter.removeListener('test');
    currentScope = null;

    emitter.on('test', onEvent, localScope);
    emitter.fire('test');
    equal(currentScope, localScope, 'Setting scope per subcriber');

});

test('Firing Once', function() {

    var count = 0;
    var emitter = new Emitter();
    emitter.once('test', function() {
        count++;
    });
    emitter.fire('test');
    emitter.fire('test');
    equal(count, 1, 'Listener only fired once');
});

test('Removing event that hasn\'t been fired', function () {

    var count = 0;
    function onEvent() {
        count++;
    }
    var emitter = new Emitter();
    emitter.on('test', onEvent);
    emitter.removeListener('test', onEvent);
    emitter.fire('test');
    equal(count, 0, 'No event fired');

    var emitter2 = new Emitter();
    emitter2.on('test', onEvent);
    emitter2.removeAllListeners();
    emitter2.fire('test');
    equal(count, 0, 'No event fired');
});

