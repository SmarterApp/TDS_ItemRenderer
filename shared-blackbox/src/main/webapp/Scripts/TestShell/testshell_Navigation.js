(function(TS, CM) {

    var UI = TS.UI;
    var Validation = TS.Validation;
    var PM = TS.PageManager;
    var SegmentManager = TS.SegmentManager;
    var Navigation = {};

    Util.Event.Emitter(Navigation);

    var State = {
        Initializing: 'init', // default state when starting test
        Change: 'change', // used when directly going to a page from the dropdown
        Back: 'back', // used when going back
        Next: 'next', // used when gong next
        Viewing: 'view' // viewing a page and not in a state transition
    };

    Navigation._currentState = State.Initializing;

    // get the current state
    Navigation.getState = function () { return this._currentState; };

    // set the current state
    Navigation.setState = function (state) { this._currentState = state; };

    // get the validation workflow used for navigation
    Navigation.createWorkflow = function (fromGroup, toGroup) {
        var taskWorkflow = new Util.TaskWorkflow();
        taskWorkflow.add(Validation.checkAudioPlaying);
        taskWorkflow.add(Validation.checkGrid);
        taskWorkflow.add(Validation.checkDirtyResponses);
        taskWorkflow.add(Validation.checkAudioRecording);
        taskWorkflow.add(Validation.checkRecorderQuality);
        taskWorkflow.add(Validation.checkIfPromptSelected);
        taskWorkflow.add(Validation.checkSimulatorPlaying, 'SimulatorPlayingWhileNavigating');

        // segment transition
        var transition = { from: fromGroup, to: toGroup };
        taskWorkflow.add(Validation.checkSegment, transition);

        // check optional
        var currentPage = PM.getCurrent();
        if (currentPage) {
            var accs = PM.getAccommodations(currentPage);
            if (accs && accs.createProps().checkOptionalUnanswered()) {
                // BUG #59138: before checking optional unanswered commit any unsaved work
                taskWorkflow.add(TS.save, TS, true);
                taskWorkflow.add(Validation.checkOptionalUnanswered);
            }
        }

        return taskWorkflow;
    };

    // moves to the currently selected page in the dropdown
    Navigation.change = function () {
        var currentPage = PM.getCurrent();
        var selectedPage = PM.get(UI.Nodes.ddlNavigation.value);
        var taskWorkflow = Navigation.createWorkflow(currentPage, selectedPage);
        taskWorkflow.start(this._changeInternal, this);
    };

    // call this function when a change is made to the page dropdown
    Navigation._changeInternal = function () {

        // save current page
        TS.save();

        // get selected group
        var groupID = UI.Nodes.ddlNavigation.value;
        var selectedGroup = PM.get(groupID);

        // make sure the group were going to is visible
        if (!selectedGroup.isVisible()) {
            this.update();
            this.reset();

            UI.showWarning(ErrorCodes.get('NextUnanswered'));
            Util.log('TS.changePage (FAIL: not visible): ' + selectedGroup.id);
            return;
        } else {
            Util.log('TS.changePage: ' + selectedGroup.id);
        }

        Navigation.setState(State.Change);

        // hide current group
        var currentPage = PM.getCurrent();
        if (currentPage) {
            currentPage.hide();
        }

        // set the selected group to be current and request it
        PM.setCurrent(selectedGroup);
        this.requestPage();
    };

    // moves to the previous page
    Navigation.back = function () {

        // this is for pagination
        if (!CM.requestPreviousPage()) {
            UI.updateControls();
            return;
        }

        var currentPage = PM.getCurrent();
        var previousPage = PM.getPrevious();
        var taskWorkflow = Navigation.createWorkflow(currentPage, previousPage);
        taskWorkflow.start(this._backInternal, this);
    };

    // moves to the previous page
    Navigation._backInternal = function () {
        // cannot go back we are on first page
        if (PM.isFirst()) {
            Util.log('TS.backPage: You are currently on the first page cannot move back.');
            return;
        }

        // save current page
        TS.save();

        // get the group before the current one
        var currentPage = PM.getCurrent();
        var previousPage = PM.getPrevious();

        Util.log('TS.backPage: ' + (previousPage ? previousPage.id : 'none') + ' (current: ' + (currentPage ? currentPage.id : 'none') + ')');

        Navigation.setState(State.Back);

        // hide current group
        if (currentPage) {
            currentPage.hide();
        }

        // set the selected group to be current and request it
        PM.setCurrent(previousPage);
        this.requestPage();
    };

    // moves to the next page
    Navigation.next = function () {

        // this is for pagination
        if (!CM.requestNextPage()) {
            UI.updateControls();
            return;
        }

        var currentPage = PM.getCurrent();

        // HACK: mark segment review page as confirmed when moving next
        if (currentPage instanceof TS.PageReview) {
            currentPage.setConfirmed();
        }

        var nextGroup = PM.getNext();

        var taskWorkflow = Navigation.createWorkflow(currentPage, nextGroup);
        taskWorkflow.start(this._nextInternal, this);
    };

    // moves to the next page
    Navigation._nextInternal = function () {

        // save current page
        TS.save();

        var currentPage = PM.getCurrent();

        // cannot go to next page if the current page has not been completed
        if (currentPage && !currentPage.isCompleted()) {
            UI.showWarning(ErrorCodes.get('NextUnanswered'));
            return;
        }

        // cannot go to next page if we are on the last page and it has not been completed
        if (PM.isLast() && TS.testLengthMet) {
            // if we are not show item scores then show warning
            if (!TDS.showItemScores) {
                UI.showWarning(ErrorCodes.get('NextTestFinished'));
            }
            return;
        }

        // get the next group (could be null if we haven't got it from the server yet)
        var nextGroup = PM.getNext();

        Util.log('TS.nextPage: ' + (nextGroup ? nextGroup.id : 'waiting') + ' (current: ' + (currentPage ? currentPage.id : 'none') + ')');

        Navigation.setState(State.Next);

        // hide current group
        if (currentPage) {
            currentPage.hide();
        }

        // <------ BUG: sometimes another thread executes right here if java is doing something...

        // set the selected group to be current and request it
        PM.setCurrent(nextGroup);
        this.requestPage();
    };

    // the current page we are requesting
    Navigation._lastRequestedGroup = null;

    // Try and show the current group. If the current group is NULL then it will wait for it to be loaded from XHR request.
    Navigation.requestPage = function () {

        var currentPage = PM.getCurrent();

        // if there is no current group then assume we are still waiting on XHR to return it
        if (!currentPage) {
            Util.log('UI.requestPage (no group)');
            UI.showLoading(Messages.getAlt('UI.WaitNextPage', 'Waiting for the next page.'));
            return;
        }

        // check if new page is being requested
        if (Navigation._lastRequestedGroup != currentPage) {
            Navigation._lastRequestedGroup = currentPage;            
            // Notify interested listeners that a page change has been requested
            Navigation.fire('requested', currentPage);            
        }

        // make sure the page you are trying to show has content
        if (!currentPage.hasContent()) {
            Util.log('UI.requestPage: ' + currentPage.id + ' (no iframe)');

            UI.showLoading(Messages.getAlt('UI.LoadingContent', 'Loading the page content.'));
            currentPage.requestContent();
            return;
        }

        // if we are already displaying this page then nothing left to do
        if (currentPage.isShowing()) {
            Util.log('UI.requestPage: ' + currentPage.id + ' (already viewing)');
            return;
        }

        // get page segment
        var currentSegment = currentPage.getSegment();

        // request entry into the page segment
        if (!SegmentManager.transition(currentSegment)) {
            // if transition() returns false then we need to wait for segment approval
            UI.showLoading(Messages.getAlt('UI.WaitSegmentApproval', 'Waiting for segment approval.'));
            return;
        }

        // show group content frame 
        // NOTE: if someone returns false from beforeShow event then they can cancel this
        if (currentPage.show() === false) {
            Util.log('UI.requestPage: ' + currentPage.id + ' (cancelled)');
            return;
        }

        Util.log('UI.requestPage: ' + currentPage.id + ' (viewing)');

        // if the show was successful then set the state to viewing
        Navigation.setState(State.Viewing);

        // mark page as being visited
        currentPage.setVisited();

        // update buttons
        UI.updateControls();

        // select this groups dropdown entry
        if (currentPage.navOption != null) {
            currentPage.navOption.selected = true;
        }

        // if the load screen is showing then hide it
        UI.hideLoading();
    };

    // reset whatever is currently clicked on the navigation to what the current group is
    Navigation.reset = function () {
        var currentPage = PM.getCurrent();
        if (currentPage != null && currentPage.navOption != null) {
            currentPage.navOption.selected = true;
        }
    };

    // update dropdown with anything that has changed
    Navigation.update = function () {
        Util.Array.each(PM.getPages(), function (page) {
            page.updateNavigationLabel();
        });
    };

    // hides the current page
    Navigation.hidePage = function () {
        var currentPage = PM.getCurrent();
        if (currentPage != null) {
            currentPage.hide();
        }
    };

    // goes back to the previous page you visited in history
    /*Nav.previous = function()
    {
        // get previously visited page from history
        var previousPage = PageManager.History.pop();
    
        if (previousPage)
        {
            UI.Nodes.ddlNavigation.value = previousPage.id;
            this._changeInternal();
        }
    };*/

    // exports
    Navigation.State = State;
    TS.Navigation = Navigation;

})(window.TestShell, window.ContentManager);

