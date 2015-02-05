Sections.SoundCheck = function()
{
    Sections.SoundCheck.superclass.constructor.call(this, 'sectionSoundCheck');
};

YAHOO.lang.extend(Sections.SoundCheck, Sections.Base);

Sections.SoundCheck.prototype.init = function () {

    var Player = TDS.Audio.Player;
    var Recorder = TDS.Audio.Recorder;

    var soundCheck = this;
    var standalone = true;

    var cssDisabled = 'disabled';

    var accProps = TDS.getAccommodationProperties();

    var CheckState = {
        Audio: 0,
        Sources: 1,
        Recorder: 2,
        RecorderError: -2,
        Error: -1
    };

    var checkState;

    function gotoInstructions() {
        soundCheck.request('next');
    }

    function gotoLogin() {
        soundCheck.request('back');
    }

    function showError() {
        checkState = CheckState.Error;

        YUD.setStyle('checkSound', 'display', 'none');
        YUD.setStyle('checkRecorderSources', 'display', 'none');
        YUD.setStyle('checkRecorder', 'display', 'none');
        YUD.setStyle('checkRecorderError', 'display', 'none');
        YUD.setStyle('checkError', 'display', '');
    }

    function showRecorderError() {
        checkState = CheckState.RecorderError;

        YUD.setStyle('checkSound', 'display', 'none');
        YUD.setStyle('checkRecorderSources', 'display', 'none');
        YUD.setStyle('checkRecorder', 'display', 'none');
        YUD.setStyle('checkRecorderError', 'display', '');
        YUD.setStyle('checkError', 'display', 'none');
    }

    //#region Player

    var requiresAudio = accProps.hasSoundPlayCheck(),
        requiresRecorder = accProps.hasRecorderCheck(),
        requiresVolSlider = accProps.hasSoundPlayVolCheck(),
        audioPlayer = null;

    if (requiresAudio) {
        TDS.Audio.Player.setup();

        audioPlayer = YUD.get('audioPlayer');

        // prevent someone from clicking on hard coded link
        YUE.addListener(audioPlayer, 'click', function(evt) {
            YUE.stopEvent(evt);
        });

        //HACK FOR BUGG-102153
        //switch .ogg to .m4a if unsupported
        if (!Util.Browser.supportsAudioOGG()) {
            var str = YUD.getAttribute(audioPlayer, 'href');
            str = str.replace('.ogg', '.m4a');
            YUD.setAttribute(audioPlayer, 'href', str);

            str = YUD.getAttribute(audioPlayer, 'type');
            str = str.replace('ogg', 'm4a');
            YUD.setAttribute(audioPlayer, 'type', str);
        }

        // create player ui
        if (requiresRecorder) {
            // set timeout to fix audio recorder crackling on OS X
            $('#checkSound .audioControls').addClass('load_start');
            setTimeout(function () {
                $('#checkSound .audioControls').removeClass('load_start');
                TDS.Audio.Widget.createPlayer(audioPlayer);
            }, 1500);
        } else {
            TDS.Audio.Widget.createPlayer(audioPlayer);
        }

        Player.onIdle.subscribe(function () {
            YUD.removeClass('btnSoundYes', cssDisabled);
        });

        YUE.addListener('btnSoundYes', 'click', function () {
            if (YUD.hasClass('btnSoundYes', cssDisabled)) return;

            if (requiresRecorder) {
                showRecorderCheck();
            }
            else {
                // otherwise redirect to intructions
                gotoInstructions();
            }
        });

        YUE.addListener('btnSoundNo', 'click', function () {
            TDS.Audio.stopAll();

            var soundRetry = function () {
                YUE.removeListener('btnErrorRetry', 'click', soundRetry);
                showSoundCheck();
            };

            YUE.addListener('btnErrorRetry', 'click', soundRetry);

            showError();
        });


        // Show volume slider if it's enabled and we're in SB
        if (requiresVolSlider && Util.SecureBrowser.getVolume() >= 0) {

            $('.sliderWrap').css('display', 'block');

            // Volume Adjustment Slider
            var volumeSlider = YAHOO.widget.Slider.getHorizSlider(
                'SoundCheck_Adjust_Volume',
                'volumeSCThumb',
                0,
                200,
                20
            );

            // subscribe slider to slide event so we can update UI as slider is dragged
            volumeSlider.subscribe('change', function (position) {
                var value = Math.round(position / 20);
                document.getElementById('Volume_SCValue').innerHTML = value;
            });

            // subscribe slider to end event so we can apply change to the system volume
            volumeSlider.subscribe('slideEnd', function () {
                try {
                    var value = Math.round(volumeSlider.getValue() / 20); // Convert slider val (0-200) to volume (0-10)
                    Util.SecureBrowser.setVolume(value * 10);
                    document.getElementById('Volume_SCValue').innerHTML = value.toString(); // Update UI
                } catch (e) {
                    console.error('Sound Check Volume Slider Error: (value)', value, e);
                }
            });

            // Init slider to current System Volume
            var curVol = Util.SecureBrowser.getVolume();
            if (curVol < 0 || curVol > 100) { // Range check
                curVol = 0;
            }
            curVol = Math.round(curVol * 2); // Volume (0-100) to slider pos (0-200)
            volumeSlider.setValue(curVol, true); // true means skip animation
        }
    }

    function showSoundCheck() {
        checkState = CheckState.Audio;

        // remove playing fail style (BUG #16088)
        YUD.removeClass('audioPlayer', 'playing_fail');

        YUD.setStyle('checkSound', 'display', '');
        YUD.setStyle('checkRecorderSources', 'display', 'none');
        YUD.setStyle('checkRecorder', 'display', 'none');
        YUD.setStyle('checkRecorderError', 'display', 'none');
        YUD.setStyle('checkError', 'display', 'none');
    }

    //#endregion Player

    //#region Recorder

    var audioSourceSelect = null,
        audioSourceSelectPromise = null,
        audioRecorder = null,
        recorderSupported = false,
        audioSourceSelectController = null;

    if (requiresRecorder) {
        recorderSupported = TDS.Audio.Recorder.initialize();

        audioRecorder = YUD.get('audioRecorder');
        TDS.Audio.Widget.createRecorder(audioRecorder);

        Recorder.onPlayStop.subscribe(function () {
            YUD.removeClass('btnRecorderYes', cssDisabled);
        });

        audioSourceSelect = YUD.get('audioSourceSelect');

        audioSourceSelectController = TDS.Audio.Widget.createSourceSelect(audioSourceSelect, function (deviceId) {
            if (deviceId !== null) {
                YUD.removeClass('btnSourceSelected', cssDisabled);

                // set the selected device's id to be used for recording, and save it in session storage as well
                Recorder.setSource(deviceId);
                Recorder.saveSourceInSessionStorage(deviceId);
            } else {
                YUD.addClass('btnSourceSelected', cssDisabled);

                // clear the selected device's id to be used for recording, and remove it from session storage as well
                Recorder.setSource(null);
                Recorder.removeSourceFromSessionStorage();
            }
        });

        // we want to clear any saved device selection
        Recorder.removeSourceFromSessionStorage();

        YUE.addListener('btnNoSuitableSource', 'click', function sourceNo() {
            var sourcesRetry = function () {
                YUE.removeListener('btnErrorRetry', 'click', sourcesRetry);
                showSourcesCheck();
            };

            YUE.addListener('btnErrorRetry', 'click', sourcesRetry);

            audioSourceSelectController.hide();

            showError();
        });

        YUE.addListener('btnSourceSelected', 'click', function sourceYes() {
            if (YUD.hasClass('btnSourceSelected', cssDisabled)) return;

            audioSourceSelectController.hide();

            showRecorderCheck();
        });

        YUE.addListener('btnRecorderYes', 'click', function () {
            if (YUD.hasClass('btnRecorderYes', cssDisabled)) return;

            if (audioSourceSelectController) {
                audioSourceSelectController.dispose();
            }

            gotoInstructions();
        });

        YUE.addListener('btnRecorderProblem', 'click', function () {
            TDS.Audio.stopAll();

            Recorder.getSources(function (sources) {
                var retry = function () {
                    YUE.removeListener('btnRecorderRetry', 'click', retry);

                    showRecorderCheck();
                };

                YUE.addListener('btnRecorderRetry', 'click', retry);

                if (sources.length > 1) {

                    var sourceSelect = function () {
                        YUE.removeListener('btnSourceSelect', 'click', sourceSelect);

                        showSourcesCheck();
                    };

                    YUD.setStyle('btnSourceSelect', 'display', '');
                    YUE.addListener('btnSourceSelect', 'click', sourceSelect);

                } else {

                    // there are no other devices to try, no point in showing the device selection screen
                    YUD.setStyle('btnSourceSelect', 'display', 'none');

                }

                var recorderRetry = function () {
                    YUE.removeListener('btnErrorRetry', 'click', recorderRetry);
                    showRecorderCheck();
                };

                YUE.addListener('btnErrorRetry', 'click', recorderRetry);

                showRecorderError();
            });
        });
    }

    function showSourcesCheck() {
        checkState = CheckState.Sources;

        YUD.setStyle('checkSound', 'display', 'none');
        YUD.setStyle('checkRecorderSources', 'display', '');
        YUD.setStyle('checkRecorder', 'display', 'none');
        YUD.setStyle('checkRecorderError', 'display', 'none');
        YUD.setStyle('checkError', 'display', 'none');

        var sourcesSection = $('#checkRecorderSources'),
            sourcesPlaceholder = sourcesSection.find('.sources-placeholder'),
            sourcesError = sourcesSection.find('.sources-error'),
            sourcesContent = sourcesSection.find('.sources-content');

        sourcesPlaceholder.show();
        sourcesError.hide();
        sourcesContent.hide();

        if (audioSourceSelectPromise === null) {
            // we only want to build the device list once, more than that is a waste
            audioSourceSelectPromise = audioSourceSelectController.buildDeviceList();
        }

        audioSourceSelectPromise.then(function () {
            sourcesPlaceholder.hide();
            sourcesError.hide();
            sourcesContent.show();

            audioSourceSelectController.show();
        })
        .catch(function () {
            // no devices could be setup successfully
            sourcesPlaceholder.hide();
            sourcesError.show();
            sourcesContent.hide();
        });
    }

    function showRecorderCheck() {
        checkState = CheckState.Recorder;

        // BUG #16088: Record button remains disabled
        if (audioRecorder && YUD.hasClass(audioRecorder, 'recording_fail')) {
            audioRecorder.classNameEvent = 'recording_ready'; // BUG #16238: Another Mic icon displays
            audioRecorder.className = 'elicitedwrap recording_ready';
        }

        YUD.setStyle('checkSound', 'display', 'none');
        YUD.setStyle('checkRecorderSources', 'display', 'none');
        YUD.setStyle('checkRecorder', 'display', '');
        YUD.setStyle('checkRecorderError', 'display', 'none');
        YUD.setStyle('checkError', 'display', 'none');
    }

    //#endregion Recorder

    YUD.batch(YUD.getElementsByClassName('soundCheckLogout', 'span'), function(logoutEl) {
        YUE.on(logoutEl, 'click', gotoLogin);
    });

    // this gets called every time section is shown
    this.load = function ()
    {
        // set all audio sections as hidden
        YUD.setStyle('flashError', 'display', 'none');
        YUD.setStyle('javaError', 'display', 'none');
        YUD.setStyle('checkSound', 'display', 'none');
        YUD.setStyle('checkRecorder', 'display', 'none');

        // check if recorder is available
        if (requiresRecorder && !recorderSupported) {
            YUD.setStyle('soundCheckRecorderError', 'display', 'block');
            return;
        }

        if (requiresAudio)
        {
            // show check sound UI
            showSoundCheck();
        }
        else if (requiresRecorder)
        {
            // show check recorder UI
            showRecorderCheck();
        }
    };

};
