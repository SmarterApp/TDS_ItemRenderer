//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
﻿testServices('player', function (service, module) {

    //#region setup

    module('setup');

    test('isPlaying should return false', function (assert) {

        var ret = service.isPlaying();

        assert.ok(!ret);
    });

    //#endregion

    //#region createSound

    module('createSound');

    test('returns the unique id parameter', function (assert) {

        var id = createId(),
            url = 'Item_18_v4_sound1129581336036e054301d.ogg',
            returnedId;

        returnedId = service.createSoundFromSource(id, createSource(url));

        assert.strictEqual(returnedId, id);

        waitFor(200);
    });

    test('returns false if url has UNplayable file extension', function (assert) {

        var id = createId(),
            url = 'Item_18_v4_sound1129581336036e054301d.foo',
            returnedId, element, testFixture;

        returnedId = service.createSoundFromSource(id, createSource(url));

        assert.ok(!returnedId);

        waitFor(200);
    });

    test('returns false if id is reused', function (assert) {

        var id = createId(),
            url = 'Item_18_v4_sound1129581336036e054301d.ogg',
            returnedId;

        service.createSoundFromSource(id, createSource(url));
        returnedId = service.createSoundFromSource(id, createSource(url));

        assert.ok(!returnedId);
    });

    //#endregion

    //#region play

    module('play');

    test('returns false if sound has not been created', function (assert) {

        var id = createId(),
            ret;

        ret = service.play(id);

        assert.strictEqual(ret, false);
    });

    test('returns true if sound does not exist', function (assert) {

        var id = createId(),
            url = 'http404.ogg',
            ret;

        service.createSoundFromSource(id, createSource(url));

        ret = service.play(id);

        assert.strictEqual(ret, true);
    });

    test('returns true if sound exists', function (assert) {

        var id = createId(),
            url = 'Item_18_v4_sound1129581336036e054301d.ogg',
            ret;

        service.createSoundFromSource(id, createSource(url));

        ret = service.play(id);

        assert.strictEqual(ret, true);
    });

    //#endregion

    //#region stop

    module('stop');

    test('returns false if sound has not been created', function (assert) {

        var id = createId(),
            ret;

        ret = service.stop(id);

        assert.ok(!ret);
    });

    test('returns false if sound does not exist', function (assert) {

        var id = createId(),
            url = '',
            ret;

        service.createSoundFromSource(id, createSource(url));

        ret = service.stop(id);

        assert.ok(!ret);
    });

    test('returns true if sound is not playing', function (assert) {

        var id = createId(),
            url = 'Item_18_v4_sound1129581336036e054301d.ogg',
            ret;

        service.createSoundFromSource(id, createSource(url));

        ret = service.stop(id);

        assert.ok(ret);
    });

    test('returns true if sound was playing', function (assert) {

        var id = createId(),
            url = 'Item_18_v4_sound1129581336036e054301d.ogg',
            ret;

        service.createSoundFromSource(id, createSource(url));
        service.play(id);

        ret = service.stop(id);

        assert.ok(ret);
    });

    test('returns true if sound was paused', function (assert) {

        var id = createId(),
            url = 'Item_18_v4_sound1129581336036e054301d.ogg',
            ret;

        service.createSoundFromSource(id, createSource(url));
        service.play(id);
        service.pause(id);

        ret = service.stop(id);

        assert.ok(ret);
    });

    //#endregion

    //#region pause

    module('pause');

    test('returns false if sound has not been created', function (assert) {

        var id = createId(),
            ret;

        ret = service.pause(id);

        assert.ok(!ret);
    });

    test('returns false if sound does not exist', function (assert) {

        var id = createId(),
            url = '',
            ret;

        service.createSoundFromSource(id, createSource(url));

        ret = service.pause(id);

        assert.ok(!ret);
    });

    test('returns false if sound is not playing', function (assert) {

        var id = createId(),
            url = 'Item_18_v4_sound1129581336036e054301d.ogg',
            ret;

        service.createSoundFromSource(id, createSource(url));

        ret = service.pause(id);

        assert.ok(!ret);
    });

    test('returns true if sound was playing', function (assert) {

        var id = createId(),
            url = 'Item_18_v4_sound1129581336036e054301d.ogg',
            ret;

        service.createSoundFromSource(id, createSource(url));
        service.play(id);

        ret = service.pause(id);

        assert.ok(ret);
    });

    test('returns false if sound was stopped', function (assert) {

        var id = createId(),
            url = 'Item_18_v4_sound1129581336036e054301d.ogg',
            ret;

        service.createSoundFromSource(id, createSource(url));
        service.play(id);
        service.stop(id);

        ret = service.pause(id);

        assert.ok(!ret);
    });

    //#endregion

    //#region resume

    module('resume');

    test('returns false if sound has not been created', function (assert) {

        var id = createId(),
            ret;

        ret = service.resume(id);

        assert.ok(!ret);
    });

    test('returns false if sound does not exist', function (assert) {

        var id = createId(),
            url = '',
            ret;

        service.createSoundFromSource(id, createSource(url));

        ret = service.resume(id);

        assert.ok(!ret);

        waitFor(200);
    });

    test('returns true if sound is not playing', function (assert) {

        var id = createId(),
            url = 'Item_18_v4_sound1129581336036e054301d.ogg',
            ret;

        service.createSoundFromSource(id, createSource(url));

        ret = service.resume(id);

        assert.ok(ret);

        waitFor(200);
    });

    test('returns true if sound is playing', function (assert) {

        var id = createId(),
            url = 'Item_18_v4_sound1129581336036e054301d.ogg',
            ret;

        service.createSoundFromSource(id, createSource(url));
        service.play(id);

        ret = service.resume(id);

        assert.ok(ret);

        waitFor(200, service.onPlay);
    });

    test('returns true if sound is stopped', function (assert) {

        var id = createId(),
            url = 'Item_18_v4_sound1129581336036e054301d.ogg',
            ret;

        service.createSoundFromSource(id, createSource(url));
        service.play(id);
        service.stop(id);

        ret = service.resume(id);

        assert.ok(ret);

        waitFor(200, service.onPlay);
    });

    test('returns true if sound was paused', function (assert) {

        var id = createId(),
            url = 'Item_18_v4_sound1129581336036e054301d.ogg',
            ret;

        service.createSoundFromSource(id, createSource(url));
        service.play(id);
        service.pause(id);

        ret = service.resume(id);

        assert.ok(ret);

        waitFor(200, service.onPlay);
    });

    //#endregion

    //#region isPaused

    module('isPaused');

    // TODO: this function is currently not used, and it's semantics seem suspect - a better name would be isAnyPaused

    //#endregion

    //#region isPlaying

    module('isPlaying');

    // TODO: because we use a singleton, this function is difficule to isolate; it may fail if previous tests aren't properly torn down

    //#endregion

    //#region onBeforePlay

    module('onBeforePlay');

    test('fired', function (assert) {
        expect(1);

        var id = createId(),
            url = 'Item_18_v4_sound1129581336036e054301d.ogg',
            deferred = Q.defer();

        service.createSoundFromSource(id, createSource(url));
        service.onBeforePlay.subscribe(onBeforePlay);

        service.play(id);

        function onBeforePlay() {
            deferred.resolve();
        }

        waitFor(200, deferred, function () {
            assert.ok(true);
        }, function () {
            assert.ok(false);
        });
    });

    test('fired before onPlay', function (assert) {
        expect(1);

        var id = createId(),
            url = 'Item_18_v4_sound1129581336036e054301d.ogg',
            playExecuted = false,
            deferred = Q.defer();

        service.createSoundFromSource(id, createSource(url));
        service.onBeforePlay.subscribe(onBeforePlay);
        service.onPlay.subscribe(onPlay);

        service.play(id);

        function onBeforePlay() {
            deferred.resolve();
        }

        function onPlay() {
            deferred.reject();
        }

        waitFor(200, deferred, function () {
            assert.ok(true);
        }, function () {
            assert.ok(false);
        });
    });

    test('not fired after resume', function (assert) {
        expect(1);

        var id = createId(),
            url = 'Item_18_v4_sound1129581336036e054301d.ogg',
            deferred = Q.defer();

        service.createSoundFromSource(id, createSource(url));

        // asynchronous play will trigger onBeforePlay; only bind onBeforePlay after play has been called
        service.onPause.subscribe(function () {
            service.onBeforePlay.subscribe(onBeforePlay);
        });

        service.play(id);
        service.pause(id);

        service.resume(id);

        function onBeforePlay() {
            deferred.resolve();
        }

        // we want the timeout to occur, so our assertions succeed in the catch and fail in the then
        waitFor(200, deferred, function () {
            assert.ok(false);
        }, function () {
            assert.ok(true);
        });
    });

    test('recieves sound id as first argument', function (assert) {
        expect(1);

        var id = createId(),
            url = 'Item_18_v4_sound1129581336036e054301d.ogg',
            deferred = Q.defer();

        service.createSoundFromSource(id, createSource(url));
        service.onBeforePlay.subscribe(onBeforePlay);

        service.play(id);

        function onBeforePlay(soundId) {
            deferred.resolve(soundId);
        }

        waitFor(200, deferred, function (soundId) {
            assert.strictEqual(soundId, id);
        }, function () {
            assert.ok(false);
        });
    });

    //#endregion

    //#region onPlay

    module('onPlay');

    test('fired', function (assert) {
        expect(1);

        var id = createId(),
            url = 'Item_18_v4_sound1129581336036e054301d.ogg';

        service.createSoundFromSource(id, createSource(url));

        service.play(id);

        waitFor(200, service.onPlay, function () {
            assert.ok(true);
        }, function () {
            assert.ok(false);
        });
    });

    test('not fired after resume', function (assert) {
        expect(1);

        var id = createId(),
            url = 'Item_18_v4_sound1129581336036e054301d.ogg',
            deferred = Q.defer();

        service.createSoundFromSource(id, createSource(url));

        // to keep the initial play invocation from asynchronously triggering this callback, we will bind it only
        // after the audio has paused
        service.onPause.subscribe(function () {
            service.onPlay.subscribe(onPlay);
        });

        service.play(id);
        service.pause(id);

        service.resume(id);

        function onPlay() {
            deferred.resolve();
        }

        // we want the timeout to occur, so our assertions succeed in the catch and fail in the then
        waitFor(200, deferred, function () {
            assert.ok(false);
        }, function () {
            assert.ok(true);
        });
    });

    test('recieves sound id as first argument', function (assert) {
        expect(1);

        var id = createId(),
            url = 'Item_18_v4_sound1129581336036e054301d.ogg';

        service.createSoundFromSource(id, createSource(url));

        service.play(id);

        waitFor(200, service.onPlay, function (soundId) {
            assert.strictEqual(soundId, id);
        }, function () {
            assert.ok(false);
        });
    });

    //#endregion

    //#region onPause

    module('onPause');

    asyncTest('fired', function (assert) {
        expect(1);

        var id = createId(),
            url = 'Item_18_v4_sound1129581336036e054301d.ogg',
            executed = false;

        service.createSoundFromSource(id, createSource(url));
        service.onPause.subscribe(onPause);

        service.play(id);
        service.pause(id);

        // happy path
        function onPause() {
            executed = true;

            assert.ok(true);
            start();
        }

        // sad path
        setTimeout(function () {
            if (!executed) {
                assert.ok(false);
                start();
            }
        }, 200);
    });

    asyncTest('not fired if sound is not playing', function (assert) {
        expect(1);

        var id = createId(),
            url = 'Item_18_v4_sound1129581336036e054301d.ogg',
            executed = false;

        service.createSoundFromSource(id, createSource(url));
        service.onPause.subscribe(onPause);

        service.pause(id);

        // happy path
        setTimeout(function () {
            if (!executed) {
                assert.ok(true);
                start();
            }
        }, 200);

        // sad path
        function onPause() {
            executed = true;

            assert.ok(false);
            start();
        }
    });

    asyncTest('not fired after stop', function (assert) {
        expect(1);

        var id = createId(),
            url = 'Item_18_v4_sound1129581336036e054301d.ogg',
            executed = false;

        service.createSoundFromSource(id, createSource(url));
        service.onPause.subscribe(onPause);

        service.play(id);
        service.stop(id);

        // happy path
        function onPause() {
            executed = true;

            assert.ok(false);
            start();
        }

        // sad path
        setTimeout(function () {
            if (!executed) {
                assert.ok(true);
                start();
            }
        }, 200);
    });

    asyncTest('recieves sound id as first argument', function (assert) {
        expect(1);

        var id = createId(),
            url = 'Item_18_v4_sound1129581336036e054301d.ogg',
            executed = false;

        service.createSoundFromSource(id, createSource(url));
        service.onPause.subscribe(onPause);

        service.play(id);
        service.pause(id);

        // happy path
        function onPause(soundId) {
            executed = true;

            assert.strictEqual(soundId, id);
            start();
        }

        // sad path
        setTimeout(function () {
            if (!executed) {
                assert.ok(false);
                start();
            }
        }, 200);
    });

    //#endregion

    //#region onBeforeResume

    module('onBeforeResume');

    asyncTest('fired', function (assert) {
        expect(1);

        var id = createId(),
            url = 'Item_18_v4_sound1129581336036e054301d.ogg',
            executed = false;

        service.createSoundFromSource(id, createSource(url));
        service.onBeforeResume.subscribe(onBeforeResume);

        service.play(id);
        service.pause(id);
        service.resume(id);

        // happy path
        function onBeforeResume() {
            executed = true;

            assert.ok(true);
            start();
        }

        // sad path
        setTimeout(function () {
            if (!executed) {
                assert.ok(false);
                start();
            }
        }, 200);
    });

    asyncTest('fired before onResume', function (assert) {
        expect(1);

        var id = createId(),
            url = 'Item_18_v4_sound1129581336036e054301d.ogg',
            executed = false,
            resumeExecuted = false;

        service.createSoundFromSource(id, createSource(url));
        service.onBeforeResume.subscribe(onBeforeResume);
        service.onResume.subscribe(onResume);

        service.play(id);
        service.pause(id);
        service.resume(id);

        // happy path
        function onBeforeResume() {
            executed = true;

            assert.ok(!resumeExecuted);
            start();
        }

        function onResume() {
            resumeExecuted = true;
        }

        // sad path
        setTimeout(function () {
            if (!executed) {
                assert.ok(false);
                start();
            }
        }, 200);
    });

    asyncTest('not fired after play', function (assert) {
        expect(1);

        var id = createId(),
            url = 'Item_18_v4_sound1129581336036e054301d.ogg',
            executed = false;

        service.createSoundFromSource(id, createSource(url));
        service.onBeforeResume.subscribe(onBeforeResume);

        service.play(id);

        // happy path
        setTimeout(function () {
            if (!executed) {
                assert.ok(true);
                start();
            }
        }, 200);

        // sad path
        function onBeforeResume() {
            executed = true;

            assert.ok(false);
            start();
        }
    });

    asyncTest('recieves sound id as first argument', function (assert) {
        expect(1);

        var id = createId(),
            url = 'Item_18_v4_sound1129581336036e054301d.ogg',
            executed = false;

        service.createSoundFromSource(id, createSource(url));
        service.onBeforeResume.subscribe(onBeforeResume);

        service.play(id);
        service.pause(id);
        service.resume(id);

        // happy path
        function onBeforeResume(soundId) {
            executed = true;

            assert.strictEqual(soundId, id);
            start();
        }

        // sad path
        setTimeout(function () {
            if (!executed) {
                assert.ok(false);
                start();
            }
        }, 200);
    });

    //#endregion

    //#region onResume

    module('onResume');

    asyncTest('fired', function (assert) {
        expect(1);

        var id = createId(),
            url = 'Item_18_v4_sound1129581336036e054301d.ogg',
            executed = false;

        service.createSoundFromSource(id, createSource(url));
        service.onResume.subscribe(onResume);

        service.play(id);
        service.pause(id);
        service.resume(id);

        // happy path
        function onResume() {
            executed = true;

            assert.ok(true);
            start();
        }

        // sad path
        setTimeout(function () {
            if (!executed) {
                assert.ok(false);
                start();
            }
        }, 200);
    });

    asyncTest('not fired after play', function (assert) {
        expect(1);

        var id = createId(),
            url = 'Item_18_v4_sound1129581336036e054301d.ogg',
            executed = false;

        service.createSoundFromSource(id, createSource(url));
        service.onResume.subscribe(onResume);

        // happy path
        setTimeout(function () {
            if (!executed) {
                assert.ok(true);
                start();
            }
        }, 200);

        // sad path
        function onResume() {
            executed = true;

            assert.ok(false);
            start();
        }
    });

    asyncTest('recieves sound id as first argument', function (assert) {
        expect(1);

        var id = createId(),
            url = 'Item_18_v4_sound1129581336036e054301d.ogg',
            executed = false;

        service.createSoundFromSource(id, createSource(url));
        service.onResume.subscribe(onResume);

        service.play(id);
        service.pause(id);
        service.resume(id);

        // happy path
        function onResume(soundId) {
            executed = true;

            assert.strictEqual(soundId, id);
            start();
        }

        // sad path
        setTimeout(function () {
            if (!executed) {
                assert.ok(false);
                start();
            }
        }, 200);
    });

    //#endregion

    //#region onStop

    module('onStop');

    asyncTest('fired', function (assert) {
        expect(1);

        var id = createId(),
            url = 'Item_18_v4_sound1129581336036e054301d.ogg',
            executed = false;

        service.createSoundFromSource(id, createSource(url));
        service.onStop.subscribe(onStop);

        service.play(id);
        service.stop(id);

        // happy path
        function onStop() {
            executed = true;

            assert.ok(true);
            start();
        }

        // sad path
        setTimeout(function () {
            if (!executed) {
                assert.ok(false);
                start();
            }
        }, 200);
    });

    asyncTest('fired if sound was paused', function (assert) {
        expect(1);

        var id = createId(),
            url = 'Item_18_v4_sound1129581336036e054301d.ogg',
            executed = false;

        service.createSoundFromSource(id, createSource(url));
        service.onStop.subscribe(onStop);

        service.play(id);
        service.pause(id);

        service.stop(id);

        // happy path
        function onStop() {
            executed = true;

            assert.ok(true);
            start();
        }

        // sad path
        setTimeout(function () {
            if (!executed) {
                assert.ok(false);
                start();
            }
        }, 200);
    });

    asyncTest('not fired after pause', function (assert) {
        expect(1);

        var id = createId(),
            url = 'Item_18_v4_sound1129581336036e054301d.ogg',
            executed = false;

        service.createSoundFromSource(id, createSource(url));
        service.onStop.subscribe(onStop);

        service.play(id);
        service.pause(id);

        // happy path
        function onStop() {
            executed = true;

            assert.ok(false);
            start();
        }

        // sad path
        setTimeout(function () {
            if (!executed) {
                assert.ok(true);
                start();
            }
        }, 200);
    });

    asyncTest('recieves sound id as first argument', function (assert) {
        expect(1);

        var id = createId(),
            url = 'Item_18_v4_sound1129581336036e054301d.ogg',
            executed = false;

        service.createSoundFromSource(id, createSource(url));
        service.onStop.subscribe(onStop);

        service.play(id);
        service.stop(id);

        // happy path
        function onStop(soundId) {
            executed = true;

            assert.strictEqual(soundId, id);
            start();
        }

        // sad path
        setTimeout(function () {
            if (!executed) {
                assert.ok(false);
                start();
            }
        }, 200);
    });

    //#endregion

    //#region onFinish

    module('onFinish');

    asyncTest('fired', function (assert) {
        expect(1);

        var id = createId(),
            url = 'Item_18_v4_sound1129581336036e054301d.ogg',
            executed = false;

        service.createSoundFromSource(id, createSource(url));
        service.onFinish.subscribe(onFinish);

        service.play(id);

        // happy path
        function onFinish() {
            executed = true;

            assert.ok(true);
            start();
        }

        // sad path (test audio clip should be shorter than 5 seconds)
        setTimeout(function () {
            if (!executed) {
                assert.ok(false);
                start();
            }
        }, 5000);
    });

    asyncTest('not fired after pause', function (assert) {
        expect(1);

        var id = createId(),
            url = 'Item_18_v4_sound1129581336036e054301d.ogg',
            executed = false;

        service.createSoundFromSource(id, createSource(url));
        service.onFinish.subscribe(onFinish);

        service.play(id);
        service.pause(id);

        // happy path
        setTimeout(function () {
            if (!executed) {
                assert.ok(true);
                start();
            }
        }, 200);

        // sad path
        function onFinish() {
            executed = true;

            assert.ok(false);
            start();
        }
    });

    asyncTest('not fired after stop', function (assert) {
        expect(1);

        var id = createId(),
            url = 'Item_18_v4_sound1129581336036e054301d.ogg',
            executed = false;

        service.createSoundFromSource(id, createSource(url));
        service.onFinish.subscribe(onFinish);

        service.play(id);
        service.stop(id);

        // happy path
        setTimeout(function () {
            if (!executed) {
                assert.ok(true);
                start();
            }
        }, 200);

        // sad path
        function onFinish() {
            executed = true;

            assert.ok(false);
            start();
        }
    });

    asyncTest('recieves sound id as first argument', function (assert) {
        expect(1);

        var id = createId(),
            url = 'Item_18_v4_sound1129581336036e054301d.ogg',
            executed = false;

        service.createSoundFromSource(id, createSource(url));
        service.onFinish.subscribe(onFinish);

        service.play(id);

        // happy path
        function onFinish(soundId) {
            executed = true;

            assert.strictEqual(soundId, id);
            start();
        }

        // sad path (test audio clip should be shorter than 5 seconds)
        setTimeout(function () {
            if (!executed) {
                assert.ok(false);
                start();
            }
        }, 5000);
    });

    //#endregion

    //#region onIdle

    module('onIdle');

    asyncTest('fired after finish', function (assert) {
        expect(1);

        var id = createId(),
            url = 'Item_18_v4_sound1129581336036e054301d.ogg',
            executed = false;

        service.createSoundFromSource(id, createSource(url));
        service.onIdle.subscribe(onIdle);

        service.play(id);

        // happy path
        function onIdle() {
            executed = true;

            assert.ok(true);
            start();
        }

        // sad path (test audio clip should be shorter than 5 seconds)
        setTimeout(function () {
            if (!executed) {
                assert.ok(false);
                start();
            }
        }, 5000);
    });

    asyncTest('fired after stop', function (assert) {
        expect(1);

        var id = createId(),
            url = 'Item_18_v4_sound1129581336036e054301d.ogg',
            executed = false;

        service.createSoundFromSource(id, createSource(url));
        service.onIdle.subscribe(onIdle);

        service.play(id);
        service.stop(id);

        // happy path
        function onIdle() {
            executed = true;

            assert.ok(true);
            start();
        }

        // sad path
        setTimeout(function () {
            if (!executed) {
                assert.ok(false);
                start();
            }
        }, 200);
    });

    asyncTest('fired after stop if sound was paused', function (assert) {
        expect(1);

        var id = createId(),
            url = 'Item_18_v4_sound1129581336036e054301d.ogg',
            executed = false;

        service.createSoundFromSource(id, createSource(url));
        service.onIdle.subscribe(onIdle);

        service.play(id);
        service.pause(id);

        service.stop(id);

        // happy path
        function onIdle() {
            executed = true;

            assert.ok(true);
            start();
        }

        // sad path
        setTimeout(function () {
            if (!executed) {
                assert.ok(false);
                start();
            }
        }, 200);
    });

    asyncTest('not fired after pause', function (assert) {
        expect(1);

        var id = createId(),
            url = 'Item_18_v4_sound1129581336036e054301d.ogg',
            executed = false;

        service.createSoundFromSource(id, createSource(url));
        service.onIdle.subscribe(onIdle);

        service.play(id);
        service.pause(id);

        // happy path
        setTimeout(function () {
            if (!executed) {
                assert.ok(true);
                start();
            }
        }, 200);

        // sad path
        function onIdle() {
            executed = true;

            assert.ok(false);
            start();
        }
    });

    asyncTest('recieves sound id as first argument', function (assert) {
        expect(1);

        var id = createId(),
            url = 'Item_18_v4_sound1129581336036e054301d.ogg',
            executed = false;

        service.createSoundFromSource(id, createSource(url));
        service.onIdle.subscribe(onIdle);

        service.play(id);
        service.stop(id);

        // happy path
        function onIdle(soundId) {
            executed = true;

            assert.strictEqual(soundId, id);
            start();
        }

        // sad path
        setTimeout(function () {
            if (!executed) {
                assert.ok(false);
                start();
            }
        }, 200);
    });

    //#endregion

    //#region onFail

    module('onFail');

    asyncTest('fired when file not found', function (assert) {
        expect(1);

        var id = createId(),
            url = 'http404.ogg',
            executed = false;

        service.createSoundFromSource(id, createSource(url));
        service.onFail.subscribe(onFail);

        service.play(id);

        // happy path
        function onFail() {
            executed = true;

            assert.ok(true);
            start();
        }

        // sad path
        setTimeout(function () {
            if (!executed) {
                assert.ok(false);
                start();
            }
        }, 200);
    });

    asyncTest('fired when file is corrupt', function (assert) {
        expect(1);

        var id = createId(),
            url = 'invalid.ogg',
            executed = false;

        service.createSoundFromSource(id, createSource(url));
        service.onFail.subscribe(onFail);

        service.play(id);

        // happy path
        function onFail() {
            executed = true;

            assert.ok(true);
            start();
        }

        // sad path
        setTimeout(function () {
            if (!executed) {
                assert.ok(false);
                start();
            }
        }, 200);
    });

    asyncTest('recieves sound id as first argument', function (assert) {
        expect(1);

        var id = createId(),
            url = 'http404.ogg',
            executed = false;

        service.createSoundFromSource(id, createSource(url));
        service.onFail.subscribe(onFail);

        service.play(id);

        // happy path
        function onFail(soundId) {
            executed = true;

            assert.strictEqual(soundId, id);
            start();
        }

        // sad path
        setTimeout(function () {
            if (!executed) {
                assert.ok(false);
                start();
            }
        }, 200);
    });

    //#endregion
});


[['createjs', 'sm2'], ['sm2', 'createjs']].forEach(function (servicePriorities) {
    //#region createSoundFromElement + <a>

    module('(' + servicePriorities[0] + ') createSoundFromElement + <a>', {
        setup: function () {
            setupService(TDS.Audio.Player, servicePriorities);
        },
        teardown: function () {
            TDS.Audio.Player.teardown();
        }
    });

    test('returns false if element does not exist', function (assert) {

        var id = createId(),
            returnedId, element, testFixture;

        returnedId = TDS.Audio.Player.createSoundFromElement(id);

        assert.ok(!returnedId);
    });

    test('returns false if <a> does not have href', function (assert) {

        var id = createId(),
            returnedId, element, testFixture;

        testFixture = document.getElementById('qunit-fixture');
        testFixture.innerHTML = '<a id="' + id + '"></a>';

        returnedId = TDS.Audio.Player.createSoundFromElement(id);

        assert.ok(!returnedId);
    });

    test('returns false if <a> href has an UNplayable file extension and no type', function (assert) {

        var id = createId(),
            url = 'Item_18_v4_sound1129581336036e054301d.foo',
            returnedId, element, testFixture;

        testFixture = document.getElementById('qunit-fixture');
        testFixture.innerHTML = '<a id="' + id + '" href="' + url + '"></a>';

        returnedId = TDS.Audio.Player.createSoundFromElement(id);

        assert.ok(!returnedId);
    });

    test('returns false if <a> href has an UNplayable file extension and UNplayable type', function (assert) {

        var id = createId(),
            url = 'Item_18_v4_sound1129581336036e054301d.foo',
            type = 'audio/foo',
            returnedId, element, testFixture;

        testFixture = document.getElementById('qunit-fixture');
        testFixture.innerHTML = '<a id="' + id + '" href="' + url + '" type="' + type + '"></a>';

        returnedId = TDS.Audio.Player.createSoundFromElement(id);

        assert.ok(!returnedId);
    });

    test('returns unique id paramter if <a> href has a playable file extension', function (assert) {

        var id = createId(),
            url = 'Item_18_v4_sound1129581336036e054301d.ogg',
            returnedId, element, testFixture;

        testFixture = document.getElementById('qunit-fixture');
        testFixture.innerHTML = '<a id="' + id + '" href="' + url + '"></a>';

        returnedId = TDS.Audio.Player.createSoundFromElement(id);

        assert.strictEqual(returnedId, id);
    });

    test('returns unique id paramter if <a> href has an UNplayable file extension and playable type', function (assert) {

        var id = createId(),
            url = 'Item_18_v4_sound1129581336036e054301d.ogv',
            type = 'audio/ogg',
            returnedId, element, testFixture;

        testFixture = document.getElementById('qunit-fixture');
        testFixture.innerHTML = '<a id="' + id + '" href="' + url + '" type="' + type + '"></a>';

        returnedId = TDS.Audio.Player.createSoundFromElement(id);

        assert.strictEqual(returnedId, id);
    });

    test('returns false if id is reused', function (assert) {

        var id = createId(),
            url = 'Item_18_v4_sound1129581336036e054301d.ogg',
            returnedId, element, testFixture;

        testFixture = document.getElementById('qunit-fixture');
        testFixture.innerHTML = '<a id="' + id + '" href="' + url + '"></a>';

        returnedId = TDS.Audio.Player.createSoundFromElement(id);
        returnedId = TDS.Audio.Player.createSoundFromElement(id);

        assert.ok(!returnedId);
    });

    asyncTest('returns unique id if url is reused with different id', function (assert) {

        var id1 = createId(),
            id2 = createId(),
            url = 'Item_18_v4_sound1129581336036e054301d.ogg',
            element, testFixture;

        testFixture = document.getElementById('qunit-fixture');
        testFixture.innerHTML = '<a id="' + id1 + '" href="' + url + '"></a>' +
                                '<a id="' + id2 + '" href="' + url + '"></a>';

        TDS.Audio.Player.createSoundFromElement(id1);
        TDS.Audio.Player.onPlay.subscribe(createSecondSound);

        TDS.Audio.Player.play(id1);

        function createSecondSound() {
            TDS.Audio.Player.onPlay.unsubscribe(createSecondSound);

            var returnedId = TDS.Audio.Player.createSoundFromElement(id2);
            assert.strictEqual(returnedId, id2);

            clearTimeout(timeout);
            QUnit.start();
        }

        var timeout = setTimeout(function () {
            assert.ok(false);
            QUnit.start();
        }, 200);
    });

    asyncTest('original sound plays if url is reused with different id', function (assert) {

        var id1 = createId(),
            id2 = createId(),
            url = 'Item_18_v4_sound1129581336036e054301d.ogg',
            element, testFixture;

        testFixture = document.getElementById('qunit-fixture');
        testFixture.innerHTML = '<a id="' + id1 + '" href="' + url + '"></a>' +
                                '<a id="' + id2 + '" href="' + url + '"></a>';

        TDS.Audio.Player.createSoundFromElement(id1);
        TDS.Audio.Player.onPlay.subscribe(createSecondSound);

        TDS.Audio.Player.play(id1);

        function createSecondSound() {
            TDS.Audio.Player.onPlay.unsubscribe(createSecondSound);

            TDS.Audio.Player.createSoundFromElement(id2);
            TDS.Audio.Player.onPlay.subscribe(playFirstSong);

            TDS.Audio.Player.play(id2);
        }

        function playFirstSong() {
            TDS.Audio.Player.onPlay.unsubscribe(playFirstSong);

            TDS.Audio.Player.onPlay.subscribe(firstSongPlayed);

            TDS.Audio.Player.play(id2);
        }

        function firstSongPlayed() {
            assert.ok(true);

            clearTimeout(timeout);
            QUnit.start();
        }

        var timeout = setTimeout(function () {
            assert.ok(false);
            QUnit.start();
        }, 500);
    });

    asyncTest('second sound plays if url is reused with different id', function (assert) {

        var id1 = createId(),
            id2 = createId(),
            url = 'Item_18_v4_sound1129581336036e054301d.ogg',
            element, testFixture;

        testFixture = document.getElementById('qunit-fixture');
        testFixture.innerHTML = '<a id="' + id1 + '" href="' + url + '"></a>' +
                                '<a id="' + id2 + '" href="' + url + '"></a>';

        TDS.Audio.Player.createSoundFromElement(id1);
        TDS.Audio.Player.onPlay.subscribe(createSecondSound);

        TDS.Audio.Player.play(id1);

        function createSecondSound() {
            TDS.Audio.Player.onPlay.unsubscribe(createSecondSound);

            TDS.Audio.Player.createSoundFromElement(id2);
            TDS.Audio.Player.onPlay.subscribe(secondSongPlayed);

            TDS.Audio.Player.play(id2);
        }

        function secondSongPlayed() {
            assert.ok(true);

            clearTimeout(timeout);
            QUnit.start();
        }

        var timeout = setTimeout(function () {
            assert.ok(false);
            QUnit.start();
        }, 500);
    });

    //#endregion

    //#region createSoundFromElement + <audio>

    module('createSoundFromElement + <audio>');

    //#endregion
});
