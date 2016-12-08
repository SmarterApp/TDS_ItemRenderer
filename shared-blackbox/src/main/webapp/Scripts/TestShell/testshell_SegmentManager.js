//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
﻿TestShell.Segment = function(id, position, label, isPermeable, entryApproval, exitApproval, itemReview, updatePermeable)
{
    this._id = id;
    this._position = position;
    this._label = label;
    this._isPermeable = isPermeable; // bool
    this._entryApproval = entryApproval; // TestShell.Segment.Approval
    this._exitApproval = exitApproval; // TestShell.Segment.Approval
    this._showItemReview = itemReview; // bool
    this._updatePermeable = YAHOO.lang.isNumber(updatePermeable) ? updatePermeable : isPermeable;

    // internal settings:
    this._requireEntryApproval = (entryApproval > TestShell.Segment.Approval.Never);
    this._requireExitApproval = (exitApproval > TestShell.Segment.Approval.Never);

    // are we currently inside this segment
    this._inside = false;
};

TestShell.Segment.Approval =
{
    Never: 0,
    Always: 1,
    FirstTime: 2 // require first time this sitting
};

// this function is called when you have successfully entered the segment
TestShell.Segment.prototype.enter = function()
{
    // mark segment as being inside
    this._inside = true;

    // remove entry requirement for now since we have entered
    this._requireEntryApproval = false;

    // enable exit approval if always required
    if (this._exitApproval == TestShell.Segment.Approval.Always)
    {
        this._requireExitApproval = true;
    }

    // restorePermOn fix: when student enters segment, set isPermeable = updatePermeable
    this._isPermeable = this._updatePermeable;

    // fire event
    TestShell.SegmentManager.Events.fire('onTransitionEnter', this);
};

// this function is called when you have successfully exited the segment
TestShell.Segment.prototype.exit = function()
{
    // mark segment as being outside
    this._inside = false;

    // remove exit requirement for now since we have exited
    this._requireExitApproval = false;
    
    // enable entry approval if always required
    if (this._entryApproval == TestShell.Segment.Approval.Always)
    {
        this._requireEntryApproval = true;
    }

    // fire event
    TestShell.SegmentManager.Events.fire('onTransitionExit', this);
};

TestShell.Segment.prototype.isInside = function() { return this._inside; };

TestShell.Segment.prototype.getId = function() { return this._id; };
TestShell.Segment.prototype.getPosition = function() { return this._position; };
TestShell.Segment.prototype.getLabel = function() { return this._label; };
TestShell.Segment.prototype.isPermeable = function() { return this._isPermeable > 0; };
TestShell.Segment.prototype.showItemReview = function() { return this._showItemReview; };

// get DOM safe ID for this segment
TestShell.Segment.prototype.getSafeId = function()
{
    // return segment as the group label
    var id = this.getId();
    id = id.replace( /\s+/g , ''); // remove white space
    id = id.replace( /[^A-Za-z0-9]+/gi , ''); // remove special characters
    return id;
};

// check if this segment requires entry approval before entering
TestShell.Segment.prototype.requireEntryApproval = function() { return this._requireEntryApproval; };

// check if this segment requires exit approval before leaving
TestShell.Segment.prototype.requireExitApproval = function() { return this._requireExitApproval; };

TestShell.Segment.prototype.toString = function() { return this._id; };

// get all the groups available so far for the segment
TestShell.Segment.prototype.getGroups = function()
{
    // get all groups for the test so far
    var testGroups = TestShell.PageManager.getGroups();

    return Util.Array.filter(testGroups, function(group)
    {
        return (this._id == group.segmentID);

    }, this);
};

// check if this segment has any groups
TestShell.Segment.prototype.hasGroups = function()
{
    return (this.getGroups().length > 0);
};

TestShell.Segment.prototype.getFirstGroup = function()
{
    var groups = this.getGroups();
    return (groups.length > 0) ? groups[0] : null;
};

TestShell.Segment.prototype.getLastGroup = function()
{
    var groups = this.getGroups();
    return (groups.length > 0) ? groups[groups.length - 1] : null;
};

// if this is true then all the groups so far for this segment have been completed
// NOTE: if the segment does not yet have any groups then this will also return true
TestShell.Segment.prototype.isCompleted = function()
{
    // get the segments groups
    var groups = this.getGroups();

    // check if every groups is completed
    return Util.Array.every(groups, function(group)
    {
        return group.isCompleted();
    });
};

// if this is true then this segment will not have anymore groups created for it
TestShell.Segment.prototype.isLengthMet = function()
{
    if (TestShell.testLengthMet) return true;

    // get the next segment
    var nextSegment = TestShell.SegmentManager.getByPosition(this._position);

    // check if the next segment exists and has any groups
    if (nextSegment)
    {
        return (nextSegment.hasGroups());
    }

    return false;
};

// if this is true then this group has had all its groups created and fully completed
TestShell.Segment.prototype.isFinished = function()
{
    return (this.isLengthMet() && this.isCompleted());
};

// if we are outside the segment and it is not permeable 
// and all groups are completed then consider it locked
TestShell.Segment.prototype.isLocked = function()
{
    return (!this.isInside() && !this.isPermeable() && this.isFinished());
};

TestShell.Segment.prototype.getAccommodations = function() {
    return Accommodations.Manager.get(this._id);
};

TestShell.Segment.prototype.getAccommodationProperties = function()
{
    return Accommodations.Manager.getProperties(this._id);
};

/*********************************************************************************************/

TestShell.SegmentManager =
{
    _segments: new Util.Structs.Map(),
    _segmentPositions: new Util.Structs.Map(),

    _currentSegment: null, // segment we are currently in
    _enteringSegment: null, // segment we are waiting to enter
    _exitingSegment: null, // segment we are waiting to leave

    _transitionState: null,
    _approvalState: null,
    
    // polling timer
    _pollTimer: null,

    // the last time we checked xhr for approval
    _checkApprovalTimestamp: null,
    
    // onTransitionEnter, onTransitionExit, onTransitionChange, onTransitionDenied, onTransitionCancelled, onApprovalChange
    Events: new Util.EventManager() 
};

// indicates what the current transition state is for going from one segment to another
TestShell.SegmentManager.TransitionState =
{
    Begin: 1,
    Exiting: 2,
    Entering: 3,
    End: 4
};

// indicates what the current xhr state for this segment
TestShell.SegmentManager.XhrState =
{
    None: 1, // not waiting for anything, whatever transition we are in is approved
    Request: 2, // requesting approval from the server (T_WaitForSegment)
    Waiting: 3, // idling until we can check the server again
    Checking: 4, // checking if approved from the server (T_GetStatus)
    Error: 5 // server threw an error
};

// when waiting on segment approval (ApprovalState not 'None') this is what the xhr will return as the status of the request
TestShell.SegmentManager.ApprovalStatus =
{
    Waiting: 0, // waiting on proctor
    Approved: 1, // approved by proctor
    Denied: 2, // denied by proctor
    Logout: 3 // stop approval and logout
};

// call this when first loading the page
TestShell.SegmentManager.init = function()
{
    var testInfo = TDS.Student.Storage.getTestInfo();
    var testSession = TDS.Student.Storage.getTestSession();
    var isGuestSession = (testSession && testSession.isGuest);
    var isReadOnly = TDS.isReadOnly; // TODO: Review if this still works
    var isDataEntry = TDS.isDataEntry;
    var isReviewing = (TestShell.Config.reviewPage > 0);

    // add all the tds segments
    Util.Array.each(testInfo.segments, function (segmentInfo) {

        // if read only mode is enabled then we should let user have access
        if (isReadOnly) {
            segmentInfo.isPermeable = 1;
            segmentInfo.updatePermeable = 1;
        }

        // NOTE: If proctorless test then don't require entry/exit approval (nobody to approve it)
        if (isReadOnly || isGuestSession || isDataEntry) {
            segmentInfo.entryApproval = 0;
            segmentInfo.exitApproval = 0;
        } else if (isReviewing) {
            // BUG #22642: Entry and Exit approvals are not needed from Test level review screen when approval = 2
            if (segmentInfo.entryApproval === 2) {
                segmentInfo.entryApproval = 0;
            }
            if (segmentInfo.exitApproval === 2) {
                segmentInfo.exitApproval = 0;
            }
        }

        // create segment from json
        var segment = new TestShell.Segment(
            segmentInfo.id, segmentInfo.position, segmentInfo.label, segmentInfo.isPermeable,
            segmentInfo.entryApproval, segmentInfo.exitApproval, segmentInfo.itemReview, segmentInfo.updatePermeable);

        // add segment
        this._segments.set(segmentInfo.id, segment);
        this._segmentPositions.set(segmentInfo.position, segment);

    }, this);

    // set current states
    this._transitionState = TestShell.SegmentManager.TransitionState.End;
    this._approvalState = TestShell.SegmentManager.XhrState.None;
    this._poll();
};

// get all the segments
TestShell.SegmentManager.getSegments = function()
{
    return this._segments.getValues();
};

// get a segment by ID
TestShell.SegmentManager.get = function(id)
{
    if (YAHOO.lang.isObject(id)) return id; // check if already a segment object
    return this._segments.get(id);
};

// get a segment by position
TestShell.SegmentManager.getByPosition = function(position)
{
    return this._segmentPositions.get(position);
};

// get the currently entered segment
TestShell.SegmentManager.getCurrent = function() { return this._currentSegment; };

TestShell.SegmentManager.getTransitionState = function() { return this._transitionState; };

TestShell.SegmentManager._setTransitionState = function(newState)
{
    // check if state has changed
    if (this._transitionState != newState)
    {
        // set new state and fire event
        this._transitionState = newState;
        this.Events.fire('onTransitionChange', newState);
    }
};

TestShell.SegmentManager.getXhrState = function() { return this._approvalState; };

TestShell.SegmentManager._setXhrState = function(newState)
{
    // check if state has changed
    if (this._approvalState != newState)
    {
        // set new state and fire event
        this._approvalState = newState;
        this.Events.fire('onApprovalChange', newState);
    }
};

TestShell.SegmentManager._getCheckApprovalTimestamp = function() { return this._checkApprovalTimestamp; };
TestShell.SegmentManager._setCheckApprovalTimestamp = function() { this._checkApprovalTimestamp = Util.Date.now(); };

// call this function when you want to enter into a new segment
TestShell.SegmentManager.transition = function(enterSegment)
{
    if (this.getTransitionState() != TestShell.SegmentManager.TransitionState.End) return false;

    // get segment to transition to
    enterSegment = this.get(enterSegment);

    // if no segment was found then just let user enter the group
    if (enterSegment == null) return true;

    // get current segment
    var currentSegment = this.getCurrent();

    // check if we are already in this segment
    if (currentSegment == enterSegment) return true;

    // begin transition
    this._setTransitionState(TestShell.SegmentManager.TransitionState.Begin);

    // set transition data
    this._currentSegment = null;
    this._exitingSegment = currentSegment;
    this._enteringSegment = enterSegment;

    // process transition
    this._process();

    // check if we are done with the transition already
    return (this.getTransitionState() == TestShell.SegmentManager.TransitionState.End);
};

// this gets called periodically to check for work to do
TestShell.SegmentManager._poll = function()
{
    if (this._pollTimer) this._pollTimer.cancel();

    // check for work...
    this._process();

    // start timer back up
    this._pollTimer = YAHOO.lang.later(500, this, this._poll);
};

// this is the main function for checking for and processing transitions
TestShell.SegmentManager._process = function()
{
    // if transition state is ended then nothing left to do
    if (this.getTransitionState() == TestShell.SegmentManager.TransitionState.End) return;

    // check if we in process of requesting or checking for approval from the server
    if (this.getXhrState() == TestShell.SegmentManager.XhrState.Request ||
        this.getXhrState() == TestShell.SegmentManager.XhrState.Checking) return;

    // make sure we are not trying to send responses
    if ((TestShell.ResponseManager.getPendingResponses().length > 0 ||
        TestShell.ResponseManager.getOutgoingResponses().length > 0)
        && TestShell.SegmentManager.getXhrState() != TestShell.SegmentManager.XhrState.Waiting
        && TestShell.SegmentManager.getXhrState() != TestShell.SegmentManager.XhrState.None) return;

    // make sure we are not trying to load any content
    if (TestShell.ContentLoader._xhrManager.getOutstandingCount() > 0) return;

    // check if we are waiting in the middle of a polling cycle for approval 
    if (this.getXhrState() == TestShell.SegmentManager.XhrState.Waiting)
    {
        var checkTimestamp = this._getCheckApprovalTimestamp();
        var currentTimestamp = Util.Date.now();
        var poll = (currentTimestamp - checkTimestamp);

        // TODO: Add poll duration to web.config
        if (poll > 5000) // poll every 5 seconds
        {
            this._checkApproval();
        }

        return;
    }

    // begin exit transition
    if (this.getXhrState() == TestShell.SegmentManager.XhrState.None &&
        this.getTransitionState() == TestShell.SegmentManager.TransitionState.Begin)
    {
        if (this._exitingSegment)
        {
            this._requestExit(this._exitingSegment);
        }
    }

    // end exit transition and begin entry transition
    if (this.getXhrState() == TestShell.SegmentManager.XhrState.None &&
        (this.getTransitionState() == TestShell.SegmentManager.TransitionState.Begin ||
         this.getTransitionState() == TestShell.SegmentManager.TransitionState.Exiting))
    {
        if (this._exitingSegment)
        {
            this._exitingSegment.exit();
            this._exitingSegment = null;
        }

        this._requestEntry(this._enteringSegment);
    }

    // end entry transition
    if (this.getXhrState() == TestShell.SegmentManager.XhrState.None &&
        this.getTransitionState() == TestShell.SegmentManager.TransitionState.Entering)
    {
        if (this._enteringSegment)
        {
            this._enteringSegment.enter();
            this._currentSegment = this._enteringSegment;
            this._enteringSegment = null;
        }

        this._setTransitionState(TestShell.SegmentManager.TransitionState.End);
        TestShell.Navigation.requestPage();
    }
};

// call the server (if required) to request exit approval
TestShell.SegmentManager._requestExit = function(segment)
{
    this._setTransitionState(TestShell.SegmentManager.TransitionState.Exiting);

    if (segment.requireExitApproval())
    {
        this._setXhrState(TestShell.SegmentManager.XhrState.Request);

        var request = { position: segment.getPosition(), approval: 'exit' };

        TestShell.xhrManager.waitForSegmentApproval(request, function(obj)
        {
            // set approval state as waiting
            TestShell.SegmentManager._setCheckApprovalTimestamp();
            TestShell.SegmentManager._setXhrState(TestShell.SegmentManager.XhrState.Waiting);
        });

        return;
    }
};

// call the server (if required) to request entry approval
TestShell.SegmentManager._requestEntry = function(segment)
{
    this._setTransitionState(TestShell.SegmentManager.TransitionState.Entering);

    if (segment.requireEntryApproval())
    {
        this._setXhrState(TestShell.SegmentManager.XhrState.Request);

        var request = { position: segment.getPosition(), approval: 'entry' };

        TestShell.xhrManager.waitForSegmentApproval(request, function(obj)
        {
            TestShell.SegmentManager._setCheckApprovalTimestamp();
            TestShell.SegmentManager._setXhrState(TestShell.SegmentManager.XhrState.Waiting);
        });

        return;
    }
};

// call the server to see if approval has been granted
TestShell.SegmentManager._checkApproval = function()
{
    this._setXhrState(TestShell.SegmentManager.XhrState.Request);

    // send request to server to check for approval
    TestShell.xhrManager.checkForSegmentApproval(function(approval)
    {
        TestShell.SegmentManager._setCheckApprovalTimestamp();

        if (approval == null) 
        {
            // if there is no approval data returned we got an error
            TestShell.SegmentManager._setXhrState(TestShell.SegmentManager.XhrState.Error);            
        }
        else if (approval.status == TestShell.SegmentManager.ApprovalStatus.Denied)
        {
            // segment got denied
            TestShell.SegmentManager.deniedApproval(approval);
        }
        else if (approval.status == TestShell.SegmentManager.ApprovalStatus.Approved)
        {
            // segment got approved
            TestShell.SegmentManager._setXhrState(TestShell.SegmentManager.XhrState.None);
        }
        else
        {
            // continue waiting for segment approval
            TestShell.SegmentManager._setXhrState(TestShell.SegmentManager.XhrState.Waiting);
        }
    });
};

TestShell.SegmentManager.deniedApproval = function(approval)
{
    // stop xhr from polling
    TestShell.SegmentManager._setXhrState(TestShell.SegmentManager.XhrState.Error);

    // build denied message
    var deniedMessage;
    if (approval.comment != null && approval.comment.length > 0) {
        deniedMessage = approval.comment;
    } else {
        deniedMessage = Messages.get('TestShell.Segment.Denied');
    }

    // show message
    TDS.Dialog.showAlert(deniedMessage, function() {
        TestShell.redirectLogin();
    });
};

// check the permeability of a segment and lock all item pages if required
TestShell.SegmentManager.checkPermeability = function(segment)
{
    if (segment.isLocked());
    {
        var groups = segment.getGroups();

        Util.Array.each(groups, function(group)
        {
            group.updateNavigationLabel();
        });
    }
};

// this is so when leaving segments we can disable all the pages in the dropdown if it is not permeable
TestShell.SegmentManager.Events.subscribe('onTransitionExit', function(segment)
{
    TestShell.SegmentManager.checkPermeability(segment);

    // if we are already exiting another segment cancel that request
    if (TestShell.xhrManager.inProgress('exitSegment'))
    {
        TestShell.xhrManager.abort('exitSegment');
    }

    // tell server we exited segment
    var request = { position: segment.getPosition() };
    TestShell.xhrManager.exitSegment(request, function(obj) {});
});

/*********************************************************************************************/
/* DEBUG CODE */

TestShell.SegmentManager.getTransitionName = function(state)
{
    switch (state)
    {
        case TestShell.SegmentManager.TransitionState.Begin: return 'begin';
        case TestShell.SegmentManager.TransitionState.Exiting: return 'exiting';
        case TestShell.SegmentManager.TransitionState.Entering: return 'entering';
        case TestShell.SegmentManager.TransitionState.End: return 'end';
    }

    return null;
};

TestShell.SegmentManager.getApprovalName = function(state)
{
    switch (state)
    {
        case TestShell.SegmentManager.XhrState.None: return 'none';
        case TestShell.SegmentManager.XhrState.Request: return 'request';
        case TestShell.SegmentManager.XhrState.Waiting: return 'waiting';
        case TestShell.SegmentManager.XhrState.Checking: return 'checking';
    }

    return null;
};

TestShell.SegmentManager.Events.subscribe('onTransitionChange', function(state)
{
    var stateName = TestShell.SegmentManager.getTransitionName(state);
    Util.log('SEGMENT TRANSITION: ' + stateName);
});

TestShell.SegmentManager.Events.subscribe('onApprovalChange', function(state)
{
    var stateName = TestShell.SegmentManager.getApprovalName(state);
    Util.log('SEGMENT APPROVAL: ' + stateName);
});

TestShell.SegmentManager.getDebug = function()
{
    var segments = TestShell.SegmentManager.getSegments();
    var debugSegments = [];

    var getApprovalFormatted = function(approval)
    {
        switch (approval)
        {
            case TestShell.Segment.Approval.Never: return 'never';
            case TestShell.Segment.Approval.Always: return 'always';
            case TestShell.Segment.Approval.FirstTime: return 'first';
        }

        return null;
    };

    Util.Array.each(segments, function(segment)
    {
        var debugSegment =
        {
            'id': segment.getId(),
            'position': segment.getPosition(),
            'current': (TestShell.SegmentManager._currentSegment == segment),
            'entering': (TestShell.SegmentManager._enteringSegment == segment),
            'exiting': (TestShell.SegmentManager._exitingSegment == segment),

            'item review': segment.showItemReview(),
            'permeable': segment.isPermeable(),
            'entry approval': getApprovalFormatted(segment._entryApproval),
            'entry required': segment.requireEntryApproval(),
            'exit approval': getApprovalFormatted(segment._exitApproval),
            'exit required': segment.requireExitApproval(),

            'groups': segment.hasGroups(),
            'completed': segment.isCompleted(),
            'length met': segment.isLengthMet(),
            'finished': segment.isFinished(),
            'locked': segment.isLocked(),
            'inside': segment.isInside()
        };

        debugSegments.push(debugSegment);
    });

    return debugSegments;
};

TestShell.SegmentManager.writeDebug = function() 
{
    var debugSegments = TestShell.SegmentManager.getDebug();
    console.table(debugSegments);
};
