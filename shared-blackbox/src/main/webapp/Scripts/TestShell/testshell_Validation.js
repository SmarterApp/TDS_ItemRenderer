// validation tasks for Util.TaskWorkflow class
(function (TS) {

    var Validation = {};

    // check if grid has loaded
    Validation.checkGrid = function (taskWorkflow) {
        var currentGroup = TS.PageManager.getCurrent();

        if (currentGroup && currentGroup.items) {
            // loop through each response to see if there are any grid items
            for (var i = 0; i < currentGroup.items.length; i++) {
                var item = currentGroup.items[i];
                var contentItem = item.getContentItem();

                // check if response is grid
                if (contentItem && contentItem.grid &&
                    contentItem.responseType.toLowerCase() == 'grid') {
                    // make sure grid is either done loading or an error occured
                    if (contentItem.grid.getState() != GridState.Loaded &&
                        contentItem.grid.getState() != GridState.Error) {
                        TS.Navigation.reset();
                        TS.UI.showWarning(Messages.get('TDSShellUIJS.Label.WaitForGridToLoad'));
                        taskWorkflow.cancel();
                    }
                }
            }

            // delay the student from hitting next/back a bunch of times
            if (currentGroup.iframe) {
                var visitTime = (new Date() - currentGroup.iframe.timestamps.showDate);
                if (visitTime < 500) { // delay for half second
                    TS.Navigation.reset();
                    taskWorkflow.cancel();
                }
            }
        }
    };

    Validation.checkAudioPlaying = function (taskWorkflow) {
        if (TDS.Audio.isActive()) {
            if (TS.Config.allowSkipAudio) {
                TDS.Audio.stopAll();
            } else {
                TS.Navigation.reset();
                TS.UI.showWarning(ErrorCodes.get('NavigateAudioPlaying'));
                taskWorkflow.cancel();
            }
        }
    };

    Validation.checkAudioRecording = function (taskWorkflow) {
        if (TDS.Audio.Recorder.isCapturing()) {
            TS.UI.showWarning(ErrorCodes.get('SaveRecordingInProgress'));
            taskWorkflow.cancel();
        }
    };

    // BUG 118416
    Validation.checkRecorderWarning = function (taskWorkflow) {
        if (TDS.Audio.Recorder.isCapturing()) {
            var handler = {
                yesLabel: 'Yes',
                noLabel: 'No',
                yes: function () {
                    //continue to pause
                    taskWorkflow.resume();
                },
                no: function () {
                    //abort the pause
                    taskWorkflow.cancel();
                }
            };
            var defaultMessage = 'Your voice is still recording, do you wish to pause and lose this recording?';
            var promptText = ErrorCodes.getAlt('SaveRecordingInProgressPrompt', defaultMessage);
            TS.UI.showWarningPrompt(promptText, handler);
            taskWorkflow.wait();
        }
    };

    // makes sure there are no dirty responses that cannot be implictly saved before performing task
    Validation.checkDirtyResponses = function (taskWorkflow) {

        var page = TS.PageManager.getCurrent();
        if (page == null || page.items == null) {
            return;
        }

        for (var i = 0; i < page.items.length; i++) {
            var item = page.items[i];

            // if this item doesn't allow implicit save and it is dirty then prompt the user they have unsaved work
            var saveOptions = item.getSaveOptions();
            if (!saveOptions.implicit && item.isDirty()) {
                TS.UI.showWarningPrompt('NavigateUnsaved',
                {
                    yes: function () {
                        item.undo();
                        taskWorkflow.resume();
                    },
                    no: function () {
                        TS.Navigation.reset();
                        taskWorkflow.cancel();
                    }
                });

                taskWorkflow.wait();
            }
        }
    };

    Validation.checkRecorderQuality = function (taskWorkflow) {

        var currentGroup = TS.PageManager.getCurrent();

        if (currentGroup == null || currentGroup.items == null || !currentGroup.items.length) {
            return;
        }

        // get the recorders for this group
        var recorders = currentGroup.items.map(function (item) {
            var contentItem = item.getContentItem();
            return TDS.Audio.Widget.getRecorder(contentItem.recorder);
        }).filter(function (recorder) {
            return !!recorder && recorder.dirty;
        });

        if (!recorders.length) {
            // no recorders with unsaved response for this group
            return;
        }

        var poorQuality = recorders.some(function (recorder) {
            return TDS.Audio.Recorder.retrieveQuality(recorder.id) !== 'GOOD';
        });

        if (poorQuality) {
            TS.UI.showWarningPrompt('SaveRecordingQuality', {
                yes: function () { taskWorkflow.resume(); },
                yesLabel: 'Global.Prompt.Button.KeepIt',
                no: function () { TS.Navigation.reset(); taskWorkflow.cancel(); },
                noLabel: 'Global.Prompt.Button.TryAgain'
            });

            taskWorkflow.wait();
        }
    };

    // check segment transition
    Validation.checkSegment = function (taskWorkflow, result, transition) {

        var fromGroup = transition.from;
        var toGroup = transition.to;

        // check if we are transitioning from one group to another
        if (fromGroup == null || toGroup == null) {
            return;
        }

        var fromSegment = fromGroup.getSegment();
        var toSegment = toGroup.getSegment();

        // check if we are moving from one segment to another
        if (fromSegment == toSegment) {
            return;
        }

        if (fromSegment && !fromSegment.isPermeable() && !fromSegment.isFinished()) {
            // if segment is not permeable and not finished then user cannot leave it
            TS.Navigation.reset();
            taskWorkflow.cancel();
            var msgImpermeableIncomplete = 'Segment is not permeable so all the questions must be completed before going to another segment.';
            msgImpermeableIncomplete = Messages.getAlt('TS.Segment.ImpermeableIncomplete', msgImpermeableIncomplete);
            TS.UI.showWarning(msgImpermeableIncomplete);
        } else if ((fromSegment && !fromSegment.isPermeable()) ||
                   (fromSegment && fromSegment.requireExitApproval()) ||
                   (toSegment && toSegment.requireEntryApproval())) {
            // check if we should show a warning about leaving the segment
            var msgLeaveWarning = 'You are leaving the current segment, are you sure you want to do this?';
            msgLeaveWarning = Messages.getAlt('TS.Segment.LeaveWarning', msgLeaveWarning);
            TS.UI.showWarningPrompt(msgLeaveWarning, {
                yes: function () { taskWorkflow.resume(); },
                yesLabel: 'Yes',
                no: function () {
                    TS.Navigation.reset();
                    taskWorkflow.cancel();
                },
                noLabel: 'No'
            });
            taskWorkflow.wait();
        }

    };

    // check if there are any optional unanswered questions and check with the user before leaving the page
    Validation.checkOptionalUnanswered = function (taskWorkflow) {

        // this doesn't apply to SIRVE
        if (TDS.isSIRVE) {
            return;
        }

        var page = TS.PageManager.getCurrent();
        if (page == null || page.items == null) {
            return;
        }

        // only check optional items if the # required is 0 (otherwise we would get warnings with writing)
        if (page.numRequired > 0) {
            return;
        }

        var optionalUnansweredResponses = [];

        for (var i = 0; i < page.items.length; i++) {
            var item = page.items[i];

            // check if answered
            if (item.isAnswered()) {
                continue;
            }

            // check if required
            if (!item.isRequired) {
                optionalUnansweredResponses.push(item);
            }
        }

        if (optionalUnansweredResponses.length > 0) {
            var messageKey = 'OptionalUnansweredResponses';
            var messageParam = optionalUnansweredResponses[0].position;
            var messageText = ErrorCodes.get(messageKey, messageParam);

            TS.UI.showErrorPrompt(messageText,
            {
                yes: function () { taskWorkflow.resume(); },
                yesLabel: Messages.get('Global.Label.Yes'),
                no: function () {
                    TS.Navigation.reset();
                    taskWorkflow.cancel();
                },
                noLabel: Messages.get('Global.Label.No')
            });

            taskWorkflow.wait();
        }

    };

    // simulator
    Validation.checkSimulatorPlaying = function (taskWorkflow, result, errorMessage) {

        var page = TS.PageManager.getCurrent();
        if (page == null || page.items == null) {
            return;
        }

        // get simulator item (always first)
        var item = page.items[0];
        var contentItem = item.getContentItem();

        // make sure item has a simulator
        if (contentItem == null || contentItem.simulator == null) {
            return;
        }

        if (contentItem.simulator.isPlaying()) {
            errorMessage = errorMessage || 'SimulatorPlaying';
            TS.UI.showWarning(ErrorCodes.get(errorMessage));
            taskWorkflow.cancel();
        }
    };

    // check if responses have all been responded to before pausing
    Validation.checkBlockPausing = function (taskWorkflow) {

        // get current page and check if it is 
        var page = TS.PageManager.getCurrent();
        if (page == null) {
            return;
        }

        // if block pausing is disabled then allow pausing
        var accs = TS.PageManager.getAccommodations(page);
        if (accs == null || !accs.createProps().blockPausing()) {
            return;
        }

        // if the pages the student has visited are completed then allow pausing
        if (TS.PageManager.isCompleted(true, true)) {
            return;
        }

        var validateStatus = function (status) {
            // check for status's that allow us to continue without warnings
            if (status == 5 /*paused*/) {
                taskWorkflow.resume();
            } else {
                // stop the user here they need to answer all visible questions
                TS.UI.showWarning(ErrorCodes.get('TS.Label.BlockPausing'));
                taskWorkflow.cancel();
            }
        };

        // check if the server is paused
        TS.xhrManager.getPauseStatus(validateStatus);
        taskWorkflow.wait();
    };

    // Check if this is a writing item and the item has not been checked.
    Validation.checkIfPromptSelected = function (taskWorkflow) {
        var page = TS.PageManager.getCurrent();

        if (page == null) {
            return;
        }

        // If the item is complete, then it must be checked.
        if (page.isCompleted()) {
            return;
        }

        var items = page.items;

        if (items == null || items.length < 1) { 
            return;
        }

        // Check that we have a prompt on this page. Only writing tests have selectable prompts
        var hasPrompt = items.some(function(item) {
            var contentItem = item.getContentItem();
            return contentItem != null && contentItem.responseType == "Prompt selection";
        });

        if (!hasPrompt) return;

        // Lets make sure that atleast 1 prompt is marked as being selected
        var promptSelected = items.some(function(item) {
            var contentItem = item.getContentItem();
            var writingWidgets = contentItem != null ? contentItem.widgets.get('writing') : [];
            return writingWidgets.some(function(widget) {
                return widget.unit != null && widget.unit.isSelected();
            });
        });

        if (promptSelected) return;
        
        // stop the user here they need to answer all visible questions
        TS.UI.showWarning(Messages.get('WritingNoPromptSelected'));
        taskWorkflow.cancel();
    };

    TS.Validation = Validation;

})(window.TestShell);

