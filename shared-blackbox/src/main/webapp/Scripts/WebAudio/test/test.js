//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
﻿(function () {
    var player, recorder;

    var initBtn = document.getElementById('initBtn'),
        statusLabel = document.getElementById('statusLabel');

    initBtn.addEventListener('click', function (event) {
        initBtn.disabled = true;
        webAudio.init({
			workerFactory: {
				create: function (scriptUrl) {
					return new Worker(scriptUrl);
				}
			},
            encodingWorkerUrl: '../encoding/worker.webaudio.bootstrap.js'
        });

        statusLabel.innerHTML = webAudio.getStatus('<br />');

        if (webAudio.isReady()) {
            useDefaultBtn.disabled = false;
            selectDeviceBtn.disabled = false;
        }
    });

    xpcom.addEventListener('load', function () {
        if (xpcom.enabled) {
            prepareCaptureForXPCom();
            preparePlaybackForXPCom();
        } else {
            prepareCaptureForHTML5();
            preparePlaybackForHTML5();
        }
    });

    //#region Device selection

    var devicesDiv = document.getElementById('devices'),
        useDefaultBtn = document.getElementById('useDefaultBtn'),
        selectDeviceBtn = document.getElementById('selectDeviceBtn'),
        devicesBtns, currentInstance, volumeAnalyser;

    useDefaultBtn.addEventListener('click', function (event) {
        initializeServices(null);

        useDefaultBtn.disabled = true;
        selectDeviceBtn.disabled = true;
    });

    selectDeviceBtn.addEventListener('click', function (event) {
        try {
            webAudio.RecorderSource.getAudioSources(function (sources) {
                promptForDeviceSelection(sources);
            });

            useDefaultBtn.disabled = true;
            selectDeviceBtn.disabled = true;
        } catch (error) {
            console.log(error);
        }
    });

    function initializeServices(source) {
        setCaptureStatus('ready');
        player = new webAudio.Player();
        player.ontrackend = function (track) {
            trackEnded(track);
        };

        recorder = new webAudio.Recorder({ source: source, streamingEncoderFormat: webAudio.encoding.format.opus });

        recorder.onbeforestop = function () {
            // pad with silence so that the old SB6.X recorder doesn't cut off the end of the recording
            recorder.encoder.appendSilence(1.0);
        };

        recorder.oncomplete = function (buffer) {
            base64encode(buffer);
            setCaptureStatus('ready');
        };

        recorder.onerror = function (error) {
            setCaptureStatus('encoding error', error);
        };

        startCaptureBtn.disabled = false;
        loadFileBtn.disabled = false;
        loadFileName.disabled = false;
        loadBtn.disabled = false;
    }

    function stopTestDevice(instance) {

        if (!instance) {
            return;
        }

        var source = instance.source;

        source.getStreamContainer(function (streamContainer) {
            streamContainer.streamSourceNode.disconnect();
            streamContainer.stream.enabled = false;
            instance.volumeAnalyser.disconnect();

            instance.volume = 0;
        }, function (error) {
            console.log(error);
        });
    }

    function testDevice(instance) {
        stopTestDevice(currentInstance);

        if (currentInstance === instance) {
            currentInstance = null;
            return;
        }

        currentInstance = instance;

        var source = instance.source;

        source.getStreamContainer(function (streamContainer) {
            var node = streamContainer.streamSourceNode;

            streamContainer.stream.enabled = true;

            instance.volumeAnalyser = webAudio.context.createVolumeAnalyser(node.channelCount);
            instance.volumeAnalyser.onvolumeprocess = function (averageVolume) {
                instance.volume = averageVolume;
            };

            node.connect(instance.volumeAnalyser.head);

        }, function (error) {
            console.log('error');
        });
    }

    function useDevice(instance) {
        initializeServices(instance.source);

        devicesBtns.forEach(function (btn) {
            btn.disabled = true;
        });
    }

    function createDeviceOption(source) {
        var element = document.createElement('div'),
            label = document.createElement('span'),
            test = document.createElement('button'),
            acquire = document.createElement('button'),

            width = 100,
            height = 16,
            canvas = document.createElement('canvas'),
            ctx = canvas.getContext('2d'),
            gradient = ctx.createLinearGradient(0, 0, width, height);

        canvas.width = width;
        canvas.height = height;

        gradient.addColorStop(0, '#000000');
        gradient.addColorStop(0.33, '#ff0000');
        gradient.addColorStop(0.66, '#ffff00');
        gradient.addColorStop(1, '#ffffff');

        var instance = {};

        Object.defineProperties(instance, {
            element: { value: element },
            source: { value: source },
            volume: {
                get: function () { return volume; },
                set: function (value) {
                    volume = value;

                    ctx.clearRect(0, 0, width, height);
                    ctx.fillStyle = gradient;
                    ctx.fillRect(0, 0, width * value, height);
                }
            }
        });

        instance.element.classList.add('device');

        label.textContent = source.label;

        test.textContent = 'Test';
        test.addEventListener('click', function (event) {
            testDevice(instance);
        });

        acquire.textContent = 'Use';
        acquire.addEventListener('click', function (event) {
            useDevice(instance);
        });

        element.appendChild(test);
        element.appendChild(acquire);
        element.appendChild(canvas);
        element.appendChild(label);

        return instance;
    }

    function promptForDeviceSelection(sources) {
        try {
            sources.forEach(function (source) {
                var instance = createDeviceOption(source);

                devicesDiv.appendChild(instance.element);
            });

            devicesBtns = [].slice.call(document.querySelectorAll('.device button'));
        } catch (error) {
            console.log(error);
        }
    }

    //#endregion

    //#region Capture

    var startCaptureBtn = document.getElementById('startCaptureBtn'),
        endCaptureBtn = document.getElementById('endCaptureBtn'),
        captureStatus = document.getElementById('captureStatus'),
        captureDetails = document.getElementById('captureDetails'),
        outputText = document.getElementById('outputText'),
        fileName = document.getElementById('fileName'),
        saveBtn = document.getElementById('saveBtn'),
        captureTimeout;

    function setCaptureStatus(status, details) {
        captureStatus.textContent = status || '';
        captureDetails.textContent = details || '';
    }

    function base64encode(buffer) {
        var bytes = new Uint8Array(buffer),
            base64 = base64js.fromByteArray(bytes);

        outputText.value = base64;

        startCaptureBtn.disabled = false;
        saveBtn.disabled = false;
        loadAudioBtn.disabled = false;

        return;

        //function complete(buffer, format) {
        //    var bytes = new Uint8Array(buffer),
        //        base64 = base64js.fromByteArray(bytes);

        //    outputText.value = base64;

        //    startCaptureBtn.disabled = false;
        //    saveBtn.disabled = false;
        //    loadAudioBtn.disabled = false;

        //    setCaptureStatus('ready');
        //}

        //function error(error) {
        //    setCaptureStatus('encoding error', error);
        //}

        //// encode the track as ogg-opus, then put the base64-encoded version into the text box
        //webAudio.encoding.encode(track, webAudio.encoding.format.opus, complete, error);
    }

    startCaptureBtn.addEventListener('click', function (event) {
        startCaptureBtn.disabled = true;
        startPlaybackBtn.disabled = true;

        outputText.value = '';
        saveBtn.disabled = true;

        captureStatus.textContent = 'acquiring capture device';

        recorder.startRecording(function () {
            endCaptureBtn.disabled = false;

            setCaptureStatus('recording');

            captureTimeout = setTimeout(function () {
                endCapture();
                alert('time limit of 4 minutes exceeded, stopping recording');
            }, 1000 * 60 * 4);

        }, function (error) {
            startCaptureBtn.disabled = false;
            endCaptureBtn.disabled = true;
            startPlaybackBtn.disabled = !trackLoaded;

            setCaptureStatus('error starting capture', error);
        }, function (error) {
            startCaptureBtn.disabled = true;
            endCaptureBtn.disabled = true;
            startPlaybackBtn.disabled = !trackLoaded;

            setCaptureStatus('error acquiring capture device', error)
        });
    });

    function endCapture() {
        clearTimeout(captureTimeout);

        startCaptureBtn.disabled = false;
        endCaptureBtn.disabled = true;
        startPlaybackBtn.disabled = !trackLoaded;

        setCaptureStatus('encoding audio');
        recorder.stopRecording();
    }

    endCaptureBtn.addEventListener('click', function (event) {
        endCapture();
    });

    function prepareCaptureForXPCom() {
        fileName.style.display = '';
        saveBtn.addEventListener('click', function () {
            // retrieve the file directory and name from the text box for file saver
            var outputFileName = fileName.value;
            if ((outputFileName == null) || (outputFileName == '')) {
                alert("empty output file name");
                return;
            }

            // retrieve audio recording data
            var outputAudioData = outputText.value;
            if ((outputAudioData == null) || (outputAudioData == '')) {
                alert("no audio data to save");
                return;
            }

            try {
                xpcom.FileIO.writeToFile(outputAudioData, outputFileName);
            } catch (e) {
                alert("Error saving audio data to file. Message: " + e.message + '\n' + e.stack);
            }

            alert('file has been saved');
        });
    }

    function prepareCaptureForHTML5() {
        fileName.style.display = 'none';
        saveBtn.addEventListener('click', function () {
            var blob = new Blob([outputText.value], { type: 'text/plain' }),
                url = URL.createObjectURL(blob),
                link = window.document.createElement('a'),
                click = document.createEvent("MouseEvents");

            link.href = url;
            link.download = 'audio_test.txt';
            click.initMouseEvent("click", true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
            link.dispatchEvent(click);
        });
    }

    //#endregion

    //#region Playback

    var loadFileBtn = document.getElementById('loadFileBtn'),
        loadFileName = document.getElementById('loadFileName'),
        loadBtn = document.getElementById('loadBtn'),
        inputText = document.getElementById('inputText'),
        audioSource = document.getElementById('audioSource'),
        loadAudioBtn = document.getElementById('loadAudioBtn'),
        startPlaybackBtn = document.getElementById('startPlaybackBtn'),
        stopPlaybackBtn = document.getElementById('stopPlaybackBtn'),
        pausePlaybackBtn = document.getElementById('pausePlaybackBtn'),
        resumePlaybackBtn = document.getElementById('resumePlaybackBtn'),
        playbackStatus = document.getElementById('playbackStatus'),
        soundQuality = document.getElementById('soundQuality');

    var disabledWhilePlaying = [loadFileBtn, loadFileName, loadBtn, loadAudioBtn, startPlaybackBtn, resumePlaybackBtn, startCaptureBtn],
        disabledWhilePaused = [loadFileBtn, loadFileName, loadBtn, loadAudioBtn, startPlaybackBtn, stopPlaybackBtn, pausePlaybackBtn],
        disabledWhileStopped = [stopPlaybackBtn, pausePlaybackBtn, resumePlaybackBtn],
        all = [loadFileBtn, loadFileName, loadBtn, loadAudioBtn, startPlaybackBtn, stopPlaybackBtn, pausePlaybackBtn, resumePlaybackBtn, startCaptureBtn],
        trackLoaded = false;

    function trackEnded(track) {
        enable(all);
        disable(disabledWhileStopped);

        playbackStatus.textContent = 'playback ended';
    }

    function disable(elements) {
        elements.forEach(function (e) {
            e.disabled = true;
        });
    }

    function enable(elements) {
        elements.forEach(function (e) {
            e.disabled = false;
        });
    }

    function preparePlaybackForXPCom() {
        loadFileBtn.style.display = 'none';
        loadFileName.style.display = '';
        loadBtn.style.display = '';

        loadBtn.addEventListener('click', function (event) {
            // retrieve the file directory and name from the text box for file loader
            var inputFileName = loadFileName.value;
            if ((inputFileName == null) || (inputFileName == '')) {
                alert("empty file name");
                return;
            }

            try {
                var audioData = xpcom.FileIO.readFromFile(inputFileName);
                if (audioData === null) {
                    alert("Error: file does not exist!");
                    return;
                } else {
                    // read file data
                    // output the data to the input text box
                    inputText.value = audioData;

                    loadAudioBtn.disabled = false;
                }
            } catch (e) {
                alert("Error reading the file. Message: " + e.message);
            }
        });
    }

    function preparePlaybackForHTML5() {
        loadFileBtn.style.display = '';
        loadFileName.style.display = 'none';
        loadBtn.style.display = 'none';

        loadFileBtn.accept = '.txt';
        loadFileBtn.addEventListener('change', function (event) {
            var reader = new FileReader();

            reader.addEventListener('loadend', function (text) {
                inputText.value = reader.result;
                loadAudioBtn.disabled = false;
            });

            reader.readAsText(loadFileBtn.files[0]);
        });
    }

    loadAudioBtn.addEventListener('click', function (event) {
        var input;

        switch (audioSource.value) {
            case "Import":
                input = inputText.value
                break;

            case "LastRecording":
                input = outputText.value;
                break;
        }

        if (!input) {
            playbackStatus.textContent = 'no input data';
            return;
        }

        try {
            var bytes = base64js.toByteArray(input);
        } catch (error) {
            playbackStatus.textContent = 'invalid input data';
            return;
        }

        webAudio.Track.fromArrayBuffer(bytes.buffer, webAudio.context, webAudio.encoding.format.opus, function (track) {
            if (track === null) {
                playbackStatus.textContent = 'invalid track audio data';
                return;
            }

            player.playlist.removeAllTracks();
            player.playlist.addTracks(track);

            playbackStatus.textContent = 'track loaded';

            startPlaybackBtn.disabled = false;
            trackLoaded = true;

            var pcm = track.toPCM(),
                voiceActivityDetector = new webAudio.VoiceActivityDetector(pcm.sampleRate);

            // should really downmix to mono, but for the purposes of this test page we should already have mono audio
            voiceActivityDetector.processData(pcm.channelData[0], true);

            soundQuality.textContent = voiceActivityDetector.getQuality();

        }, function (error) {
            playbackStatus.textContent = 'invalid track audio data';
        });
    });

    startPlaybackBtn.addEventListener('click', function (event) {
        player.play();

        enable(all);
        disable(disabledWhilePlaying);

        playbackStatus.textContent = 'playback started';
    });

    stopPlaybackBtn.addEventListener('click', function (event) {
        player.stop();

        enable(all);
        disable(disabledWhileStopped);

        playbackStatus.textContent = 'playback stopped';
    });

    pausePlaybackBtn.addEventListener('click', function (event) {
        player.pause();

        enable(all);
        disable(disabledWhilePaused);

        playbackStatus.textContent = 'playback paused';
    });

    resumePlaybackBtn.addEventListener('click', function (event) {
        player.play();

        enable(all);
        disable(disabledWhilePlaying);

        playbackStatus.textContent = 'playback resumed';
    });

    //#endregion
})();
