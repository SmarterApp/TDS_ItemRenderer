(function (module) {

    //#region createQueue

    module('createQueue');

    test('returns empty queue when no ids passed to constructor', function (assert) {
        var queue = TDS.Audio.Player.createQueue();

        assert.ok(queue);

        var started = queue.start();

        assert.ok(!started);

        waitFor(200);
    });

    test('returns non-empty queue object when ids passed to constructor', function (assert) {
        var id = createId(),
            url = 'Item_18_v4_sound1129581336036e054301d.ogg',
            queue;

        // create the sound, add it to a new queue, and attempt to play it; start will return true if the sound started playing

        TDS.Audio.Player.createSoundFromSource(id, createSource(url));
        queue = TDS.Audio.Player.createQueue([id]);

        var started = queue.start();

        assert.ok(started);

        waitFor(200, TDS.Audio.Player.onPlay);
    });

    //#endregion

    //#region start

    module('start');

    test('returns false if no sounds are in queue', function (assert) {
        var queue = TDS.Audio.Player.createQueue();

        var started = queue.start();

        assert.ok(!started);

        waitFor(200, TDS.Audio.Player.onPlay);
    });

    test('returns false if only sound id in queue is invalid', function (assert) {
        var queue = TDS.Audio.Player.createQueue(['invalid']);

        var started = queue.start();

        assert.ok(!started);

        waitFor(200, TDS.Audio.Player.onPlay);
    });

    test('returns true if sound in queue', function (assert) {
        var id = createId(),
            url = 'Item_18_v4_sound1129581336036e054301d.ogg',
            queue;

        TDS.Audio.Player.createSoundFromSource(id, createSource(url));
        queue = TDS.Audio.Player.createQueue([id]);

        var started = queue.start();

        assert.ok(started);

        waitFor(200, TDS.Audio.Player.onPlay);
    });

    test('player.onPlay called for sound', function (assert) {
        expect(1);

        var id = createId(),
            url = 'Item_18_v4_sound1129581336036e054301d.ogg',
            queue;

        TDS.Audio.Player.createSoundFromSource(id, createSource(url));
        queue = TDS.Audio.Player.createQueue([id]);

        queue.start();

        waitFor(200, TDS.Audio.Player.onPlay, function () {
            assert.ok(true);
        }, function () {
            assert.ok(false);
        });
    });

    test('plays each sound in the queue', function (assert) {
        var id1 = createId(),
            id2 = createId(),
            url = 'Item_18_v4_sound1129581336036e054301d.ogg',
            deferred1 = Q.defer(), deferred2 = Q.defer(),
            promise = Q.all([deferred1.promise, deferred2.promise]),
            queue;

        TDS.Audio.Player.createSoundFromSource(id1, createSource(url));
        TDS.Audio.Player.createSoundFromSource(id2, createSource(url));
        TDS.Audio.Player.onPlay.subscribe(onPlay);
        queue = TDS.Audio.Player.createQueue([id1, id2]);  // queue the same sound twice

        queue.start();

        function onPlay(soundId) {
            if (soundId === id1) {
                deferred1.resolve();
            }
            if (soundId === id2) {
                deferred2.resolve();
            }
        }

        waitFor(5000, promise, function (indices) {
            assert.ok(true);
        }, function () {
            assert.ok(false);
        });
    });

    test('plays each sound in the queue in order', function (assert) {
        var id1 = createId(),
            id2 = createId(),
            url = 'Item_18_v4_sound1129581336036e054301d.ogg',
            deferred1 = Q.defer(), deferred2 = Q.defer(),
            promise = Q.all([deferred1.promise, deferred2.promise]),
            index = 0,
            queue;

        TDS.Audio.Player.createSoundFromSource(id1, createSource(url));
        TDS.Audio.Player.createSoundFromSource(id2, createSource(url));
        TDS.Audio.Player.onPlay.subscribe(onPlay);
        queue = TDS.Audio.Player.createQueue([id1, id2]);  // queue the same sound twice

        queue.start();

        function onPlay(soundId) {
            if (soundId === id1) {
                deferred1.resolve(index);
            }
            if (soundId === id2) {
                deferred2.resolve(index);
            }
            ++index;
        }

        waitFor(5000, promise, function (indices) {
            assert.strictEqual(indices[0], 0);
            assert.strictEqual(indices[1], 1);
        }, function () {
            assert.ok(false);
        });
    });

    test('if current sound is stopped via player, does not play the next sound', function (assert) {
        expect(1);

        var id1 = createId(),
            id2 = createId(),
            url = 'Item_18_v4_sound1129581336036e054301d.ogg',
            deferred1 = Q.defer(), deferred2 = Q.defer(),
            promise = Q.all([deferred1.promise, deferred2.promise]),
            queue;

        TDS.Audio.Player.createSoundFromSource(id1, createSource(url));
        TDS.Audio.Player.createSoundFromSource(id2, createSource(url));
        TDS.Audio.Player.onPlay.subscribe(onPlay);
        queue = TDS.Audio.Player.createQueue([id1, id2]);

        queue.start();

        function onPlay(soundId) {
            if (soundId === id1) {
                // when the first sound starts playing, stop the player immediately
                deferred1.resolve();
                TDS.Audio.Player.stop(id1);
            }
            if (soundId === id2) {
                deferred2.resolve();
            }
        }

        // we want the timeout to occur, so our assertions succeed in the catch and fail in the then
        waitFor(2000, promise, function () {
            assert.ok(false);
        }, function () {
            assert.ok(true);
        });
    });

    //#endregion

    //#region isStarted

    module('isStarted');

    test('returns false if sounds have not been started', function (assert) {
        var id = createId(),
            url = 'Item_18_v4_sound1129581336036e054301d.ogg',
            queue;

        TDS.Audio.Player.createSoundFromSource(id, createSource(url));
        queue = TDS.Audio.Player.createQueue([id]);

        var started = queue.isStarted();

        assert.ok(!started);

        waitFor(200);
    });

    test('returns true if sounds have started', function (assert) {
        var id = createId(),
            url = 'Item_18_v4_sound1129581336036e054301d.ogg',
            queue;

        TDS.Audio.Player.createSoundFromSource(id, createSource(url));
        queue = TDS.Audio.Player.createQueue([id]);

        queue.start();
        var started = queue.isStarted();

        assert.strictEqual(started, true);

        waitFor(200);
    });

    test('returns false after delay if sounds have started, then stopped', function (assert) {
        var id = createId(),
            url = 'Item_18_v4_sound1129581336036e054301d.ogg',
            queue;

        TDS.Audio.Player.createSoundFromSource(id, createSource(url));
        queue = TDS.Audio.Player.createQueue([id]);

        queue.start();
        queue.stop();

        var promise = Q.delay(150).then(function () {
            return queue.isStarted();
        });

        waitFor(200, promise, function (isStarted) {
            assert.strictEqual(isStarted, false);
        }, function () {
            assert.ok(false);
        });
    });

    //#endregion

    //#region stop

    module('stop');

    test('stops playing current sound', function (assert) {
        expect(1);

        var id = createId(),
            url = 'Item_18_v4_sound1129581336036e054301d.ogg',
            queue;

        TDS.Audio.Player.createSoundFromSource(id, createSource(url));
        queue = TDS.Audio.Player.createQueue([id]);

        queue.start();
        queue.stop();

        waitFor(200, TDS.Audio.Player.onStop, function (soundId) {
            assert.strictEqual(soundId, id);
        }, function () {
            assert.ok(false);
        });
    });

    test('does not play the next sound', function (assert) {
        expect(1);

        var id1 = createId(),
            id2 = createId(),
            url = 'Item_18_v4_sound1129581336036e054301d.ogg',
            deferred1 = Q.defer(), deferred2 = Q.defer(),
            promise = Q.all([deferred1.promise, deferred2.promise]),
            queue;

        TDS.Audio.Player.createSoundFromSource(id1, createSource(url));
        TDS.Audio.Player.createSoundFromSource(id2, createSource(url));
        TDS.Audio.Player.onPlay.subscribe(onPlay);
        queue = TDS.Audio.Player.createQueue([id1, id2]);

        queue.start();
        queue.stop();

        // only the first deferred could resolve
        function onPlay(soundId) {
            if (soundId === id1) {
                deferred1.resolve();
            }
            if (soundId === id2) {
                deferred2.resolve();
            }
        }

        // we want the timeout to occur, so our assertions succeed in the catch and fail in the then
        waitFor(2000, promise, function () {
            assert.ok(false);
        }, function () {
            assert.ok(true);
        });
    });

    test('does not stop the player if queue has not been started', function (assert) {
        expect(1);

        var id = createId(),
            url = 'Item_18_v4_sound1129581336036e054301d.ogg',
            queue, executed = false;

        TDS.Audio.Player.createSoundFromSource(id, createSource(url));
        queue = TDS.Audio.Player.createQueue([id]);

        // stop without starting; event should not be triggered
        queue.stop();

        // we want the timeout to occur, so our assertions succeed in the catch and fail in the then
        waitFor(200, TDS.Audio.Player.onStop, function () {
            assert.ok(false);
        }, function () {
            assert.ok(true);
        });
    });

    //#endregion

    //#region insert

    module('insert');

    test('adds sound to empty queue', function (assert) {
        expect(1);

        var id = createId(),
            url = 'Item_18_v4_sound1129581336036e054301d.ogg',
            queue;

        TDS.Audio.Player.createSoundFromSource(id, createSource(url));
        queue = TDS.Audio.Player.createQueue();

        queue.insert(id);

        queue.start();

        waitFor(200, TDS.Audio.Player.onPlay, function () {
            assert.ok(true);
        }, function () {
            assert.ok(false);
        });
    });

    test('no pos argument inserts the sound as the first sound', function (assert) {
        var id1 = createId(),
            id2 = createId(),
            url = 'Item_18_v4_sound1129581336036e054301d.ogg',
            deferred1 = Q.defer(), deferred2 = Q.defer(),
            promise = Q.all([deferred1.promise, deferred2.promise]),
            index = 0,
            queue;

        TDS.Audio.Player.createSoundFromSource(id1, createSource(url));
        TDS.Audio.Player.createSoundFromSource(id2, createSource(url));
        TDS.Audio.Player.onPlay.subscribe(onPlay);
        queue = TDS.Audio.Player.createQueue([id1]);

        queue.insert(id2);

        queue.start();

        function onPlay(soundId) {
            if (soundId === id1) {
                deferred1.resolve(index);
            }
            if (soundId === id2) {
                deferred2.resolve(index);
            }
            ++index;
        }

        waitFor(5000, promise, function (indices) {
            assert.strictEqual(indices[0], 1);  // sound1 should be second
            assert.strictEqual(indices[1], 0);  // sound2 should be first
        }, function () {
            assert.ok(false);
        });
    });

    test('sound should be played according to the pos argument', function (assert) {
        var id1 = createId(),
            id2 = createId(),
            url = 'Item_18_v4_sound1129581336036e054301d.ogg',
            deferred1 = Q.defer(), deferred2 = Q.defer(),
            promise = Q.all([deferred1.promise, deferred2.promise]),
            index = 0,
            queue;

        TDS.Audio.Player.createSoundFromSource(id1, createSource(url));
        TDS.Audio.Player.createSoundFromSource(id2, createSource(url));
        TDS.Audio.Player.onPlay.subscribe(onPlay);
        queue = TDS.Audio.Player.createQueue([id1]);

        queue.insert(id2, 1);

        queue.start();

        function onPlay(soundId) {
            if (soundId === id1) {
                deferred1.resolve(index);
            }
            if (soundId === id2) {
                deferred2.resolve(index);
            }
            ++index;
        }

        waitFor(5000, promise, function (indices) {
            assert.strictEqual(indices[0], 0);
            assert.strictEqual(indices[1], 1);
        }, function () {
            assert.ok(false);
        });
    });

    //#endregion

    //#region append

    module('append');

    test('adds sound to empty queue', function (assert) {
        expect(1);

        var id = createId(),
            url = 'Item_18_v4_sound1129581336036e054301d.ogg',
            queue, executed = false;

        TDS.Audio.Player.createSoundFromSource(id, createSource(url));
        queue = TDS.Audio.Player.createQueue();

        queue.insert(id);

        queue.start();

        waitFor(200, TDS.Audio.Player.onPlay, function () {
            assert.ok(true);
        }, function () {
            assert.ok(false);
        });
    });

    test('adds sound to end of queue', function (assert) {
        var id1 = createId(),
            id2 = createId(),
            url = 'Item_18_v4_sound1129581336036e054301d.ogg',
            deferred1 = Q.defer(), deferred2 = Q.defer(),
            promise = Q.all([deferred1.promise, deferred2.promise]),
            index = 0,
            queue;

        TDS.Audio.Player.createSoundFromSource(id1, createSource(url));
        TDS.Audio.Player.createSoundFromSource(id2, createSource(url));
        TDS.Audio.Player.onPlay.subscribe(onPlay);
        queue = TDS.Audio.Player.createQueue([id1]);

        queue.append(id2);

        queue.start();

        function onPlay(soundId) {
            if (soundId === id1) {
                deferred1.resolve(index);
            }
            if (soundId === id2) {
                deferred2.resolve(index);
            }
            ++index;
        }

        waitFor(5000, promise, function (indices) {
            assert.strictEqual(indices[0], 0);
            assert.strictEqual(indices[1], 1);
        }, function () {
            assert.ok(false);
        });
    });

    //#endregion

    //#region remove

    module('remove');

    test('sound not played after removed', function (assert) {
        expect(1);

        var id = createId(),
            url = 'Item_18_v4_sound1129581336036e054301d.ogg',
            queue, executed = false;

        TDS.Audio.Player.createSoundFromSource(id, createSource(url));
        queue = TDS.Audio.Player.createQueue([id]);

        queue.remove(id);

        queue.start();

        // we want the timeout to occur, so our assertions succeed in the catch and fail in the then
        waitFor(200, TDS.Audio.Player.onPlay, function () {
            assert.ok(false);
        }, function () {
            assert.ok(true);
        });
    });

    //#endregion

    //#region clear

    module('clear');

    test('sound not played', function (assert) {
        expect(1);

        var id = createId(),
            url = 'Item_18_v4_sound1129581336036e054301d.ogg',
            queue, executed = false;

        TDS.Audio.Player.createSoundFromSource(id, createSource(url));
        queue = TDS.Audio.Player.createQueue([id]);

        queue.clear();

        queue.start();

        // we want the timeout to occur, so our assertions succeed in the catch and fail in the then
        waitFor(200, TDS.Audio.Player.onPlay, function () {
            assert.ok(false);
        }, function () {
            assert.ok(true);
        });
    });

    test('sounds not played', function (assert) {
        expect(1);

        var id1 = createId(),
            id2 = createId(),
            url = 'Item_18_v4_sound1129581336036e054301d.ogg',
            queue, executed = false;

        TDS.Audio.Player.createSoundFromSource(id1, createSource(url));
        TDS.Audio.Player.createSoundFromSource(id2, createSource(url));
        queue = TDS.Audio.Player.createQueue([id1, id2]);

        queue.clear();

        queue.start();

        // we want the timeout to occur, so our assertions succeed in the catch and fail in the then
        waitFor(2000, TDS.Audio.Player.onPlay, function () {
            assert.ok(false);
        }, function () {
            assert.ok(true);
        });
    });

    //#endregion

    //#region dispose

    module('dispose');

    test('all sounds cleared', function (assert) {
        expect(1);

        var id1 = createId(),
            id2 = createId(),
            url = 'Item_18_v4_sound1129581336036e054301d.ogg',
            deferred = Q.defer(),
            queue;

        TDS.Audio.Player.createSoundFromSource(id1, createSource(url));
        TDS.Audio.Player.createSoundFromSource(id2, createSource(url));
        queue = TDS.Audio.Player.createQueue([id1, id2]);

        queue.dispose();

        queue.start();

        // we want the timeout to occur, so our assertions succeed in the catch and fail in the then
        waitFor(200, TDS.Audio.Player.onPlay, function () {
            assert.ok(false);
        }, function () {
            assert.ok(true);
        });
    });

    test('onStart unsubscribed', function (assert) {
        expect(1);

        var id = createId(),
            url = 'Item_18_v4_sound1129581336036e054301d.ogg',
            deferred = Q.defer(),
            queue;

        TDS.Audio.Player.createSoundFromSource(id, createSource(url));
        queue = TDS.Audio.Player.createQueue();

        // subscribe to the event, then dispose to unsubscribe
        queue.onStart.subscribe(onStart);
        queue.dispose();

        // add a sound and play it
        queue.append(id);
        queue.start();

        function onStart(soundId) {
            deferred.resolve();
        }

        // we want the timeout to occur, so our assertions succeed in the catch and fail in the then
        waitFor(200, deferred, function () {
            assert.ok(false);
        }, function () {
            assert.ok(true);
        });
    });

    test('onStop unsubscribed', function (assert) {
        expect(1);

        var id = createId(),
            url = 'Item_18_v4_sound1129581336036e054301d.ogg',
            deferred = Q.defer(),
            queue;

        TDS.Audio.Player.createSoundFromSource(id, createSource(url));
        queue = TDS.Audio.Player.createQueue();

        // subscribe to the event, then dispose to unsubscribe
        queue.onStop.subscribe(onStop);
        queue.dispose();

        // add a sound and play it
        queue.append(id);
        queue.start();
        queue.stop();

        function onStop(soundId) {
            deferred.resolve();
        }

        // we want the timeout to occur, so our assertions succeed in the catch and fail in the then
        waitFor(200, deferred, function () {
            assert.ok(false);
        }, function () {
            assert.ok(true);
        });
    });

    //#endregion

    //#region onStart

    module('onStart');

    test('fired', function (assert) {
        expect(1);

        var id = createId(),
            url = 'Item_18_v4_sound1129581336036e054301d.ogg',
            deferred = Q.defer(),
            queue;

        TDS.Audio.Player.createSoundFromSource(id, createSource(url));
        queue = TDS.Audio.Player.createQueue([id]);

        // the event is fired as soon as start is called, so we bind to it first
        queue.onStart.subscribe(function () {
            deferred.resolve();
        });

        queue.start();
        queue.stop();

        waitFor(200, deferred, function () {
            assert.ok(true);
        }, function () {
            assert.ok(false);
        });
    });

    test('recieves queue as first argument', function (assert) {
        expect(1);

        var id = createId(),
            url = 'Item_18_v4_sound1129581336036e054301d.ogg',
            deferred = Q.defer(),
            queue;

        TDS.Audio.Player.createSoundFromSource(id, createSource(url));
        queue = TDS.Audio.Player.createQueue([id]);

        // the event is fired as soon as start is called, so we bind to it first
        queue.onStart.subscribe(function (q) {
            deferred.resolve(q);
        });

        queue.start();
        queue.stop();

        waitFor(200, deferred, function (q) {
            assert.strictEqual(queue, q);
        }, function () {
            assert.ok(false);
        });
    });

    //#endregion

    //#region onStop

    module('onStop');

    test('fired', function (assert) {
        expect(1);

        var id = createId(),
            url = 'Item_18_v4_sound1129581336036e054301d.ogg',
            queue;

        TDS.Audio.Player.createSoundFromSource(id, createSource(url));
        queue = TDS.Audio.Player.createQueue([id]);

        queue.start();
        queue.stop();

        waitFor(200, queue.onStop, function () {
            assert.ok(true);
        }, function () {
            assert.ok(false);
        });
    });

    test('recieves queue as first argument', function (assert) {
        expect(1);

        var id = createId(),
            url = 'Item_18_v4_sound1129581336036e054301d.ogg',
            queue;

        TDS.Audio.Player.createSoundFromSource(id, createSource(url));
        queue = TDS.Audio.Player.createQueue([id]);

        queue.start();
        queue.stop();

        waitFor(200, queue.onStop, function (q) {
            assert.strictEqual(queue, q);
        }, function () {
            assert.ok(false);
        });
    });

    //#endregion
})(function (name) {
    module('Queue.' + name, {
        setup: function () {
            setupService(TDS.Audio.Player);
        },
        teardown: function () {
            TDS.Audio.Player.teardown();
        }
    });
});
