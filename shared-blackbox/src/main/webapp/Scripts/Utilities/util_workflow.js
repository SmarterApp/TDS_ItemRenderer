//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
﻿// REQUIRES: util_array.js

/*
Functions on each activity:
- approval(): someone requests a workflow and this approves it
    + return 0 to deny entering
    + return 1 to approve entering
    + return 2 to delay approval until user calls approve()
- init(): only get called only the first time you are entering the activity
- load(): gets fired every time you are about to enter activity (good time to load data)
    + return nothing or false to proceed
    + return true to wait for load to finish (user will need to call ready() )
- enter(): gets fired when you enter activity
- leave(): gets fired when you leave activity
*/

// REVIEW THIS: https://github.com/fschaefer/Stately.js

Util.Workflow = function()
{
    this._activities = new Util.Structs.Map();
    this._transitions = new Util.Structs.Map();
    this._activeActivity = null; // current activity
    this._transitionActivity = null; // transitioning activity (used for validation of workflow)

    // events (onRequest, onApprove, onReady, onLeave, onEnter)
    this.Events = new Util.EventManager();
};

Util.Workflow.Approval = 
{
    Denied: 0,
    Approved: 1,
    Pending: 2
};

Util.Workflow.prototype._isActivity = function(activity)
{
    return (activity && (activity instanceof Util.Workflow.Activity));
};

Util.Workflow.prototype.getActivity = function(id)
{
    if (this._isActivity(id)) return id;
    return this._activities.get(id);
};

Util.Workflow.prototype.addActivity = function(activity)
{
    // check if adding an activity object
    if (!this._isActivity(activity))
    {
        throw "expected activity object but was " + typeof (to);
    }

    var self = this;

    // listen for event to begin transition
    activity.Events.subscribe('onRequest', function(action, data)
    {
        try
        {
            self._requestTransition(activity, action, data);
        }
        catch (ex)
        {
            TDS.Diagnostics.report(ex);
        }
    });

    // listen for event to finish transition
    activity.Events.subscribe('onReady', function(data)
    {
        try
        {
            self._finishTransition(activity, data);
        }
        catch (ex)
        {
            TDS.Diagnostics.report(ex);
        }
    });

    var id = activity.getId();
    this._activities.set(id, activity);
};

Util.Workflow.prototype.getTransition = function(from, action)
{
    var id = from + '_' + action;
    return this._transitions.get(id);
};

Util.Workflow.prototype.addTransition = function(from, action, to)
{
    var id = from + '_' + action;
    this._transitions.set(id, { from: from, to: to });
};

// begin transition
Util.Workflow.prototype._requestTransition = function(fromActivity, action, data)
{
    fromActivity = this.getActivity(fromActivity);

    // find transition
    var transition = this.getTransition(fromActivity, action);

    if (transition)
    {
        // get transition activity
        var toActivity = transition.to;

        if (YAHOO.lang.isFunction(toActivity))
        {
            toActivity = toActivity(data);
        }

        toActivity = this.getActivity(toActivity);

        if (toActivity)
        {
            if (YAHOO.lang.isFunction(toActivity.requestApproval))
            {
                this._approveTransition(toActivity, data);
            }
            else
            {
                this._beginTransition(toActivity, data);
            }
        }
    }
};

// approve transition
Util.Workflow.prototype._approveTransition = function(activity, data)
{
    // clean approval action
    activity._approvedAction = null;
    
    // start off by assuming we are approved
    var activityApproval = Util.Workflow.Approval.Approved;

    // call activity to see if we have approval
    var requestApproval = activity.requestApproval(data);
        
    // check if valid approval was returned
    if (YAHOO.lang.isNumber(requestApproval))
    {
        // set approval
        activityApproval = requestApproval;    
    }

    // if we are approved then just begin transaction
    if (activityApproval == Util.Workflow.Approval.Approved)
    {
        this._beginTransition(activity, data);
    }
    else if (activityApproval == Util.Workflow.Approval.Pending)
    {
        // bind the begin transition function to the approval action for this activity
        activity._approvedAction = Util.bind(this._beginTransition, this, activity, data);
    }
};

// begin transition
Util.Workflow.prototype._beginTransition = function(activity, data)
{
    if (this._activeActivity == activity)
    {
        throw 'cannot transition to activity (' + activity + ') because it is already active';
    }

    if (this._transitionActivity != null)
    {
        throw 'cannot begin transition activity (' + activity + ') because there is a current one (' + this._transitionActivity + ') in progress';
    }

    // set current transitioning activity
    this._transitionActivity = activity;

    this.Events.fire('onRequest', activity);

    // check if this activity has been visited
    if (!activity.hasVisited())
    {
        // run one time activity init
        if (YAHOO.lang.isFunction(activity.init)) activity.init();
        activity.markVisited();
    }

    var wait = false;

    // check if there is a load function
    if (YAHOO.lang.isFunction(activity.load)) wait = activity.load(data);

    // if the load function returned true then we need to wait for it to finish
    if (wait !== true) this._finishTransition(activity);
};

// finish transition
Util.Workflow.prototype._finishTransition = function(activity, data)
{
    if (this._transitionActivity == null)
    {
        // NOTE: check if forgot to return true from the init function of the activity and was performing an async operation
        throw 'cannot finalize transition activity (' + activity + ') because it is not in progress';
    }

    this.Events.fire('onReady', activity, data);

    var previousActivity = null;

    if (this._activeActivity)
    {
        this.Events.fire('onLeave', this._activeActivity);

        if (YAHOO.lang.isFunction(this._activeActivity.leave))
        {
            this._activeActivity.leave();
        }

        previousActivity = this._activeActivity;
    }

    this._activeActivity = activity;

    this.Events.fire('onEnter', this._activeActivity, data);

    if (YAHOO.lang.isFunction(this._activeActivity.enter))
    {
        this._activeActivity.enter(data);
    }

    this._transitionActivity = null;
};

Util.Workflow.prototype.start = function(id)
{
    var activity = this.getActivity(id);
    
    try
    {
        this._beginTransition(activity);
    }
    catch (ex)
    {
        TDS.Diagnostics.report(ex);
    }
};

/*****************************************************************************/

// Util.EventManager

Util.Workflow.Activity = function(id)
{
    // check if ID is valid
    if (!YAHOO.lang.isString(id)) throw new Error('Activity must have a valid ID');

    this.Events = new Util.EventManager(this);

    // call this function to request transition to another activity
    this.request = function(action, data /*opt*/)
    {
        this.Events.fire('onRequest', action, data);
    };

    // call this function to request approval to this activity
    this.requestApproved = function()
    {
        // call the approval action if it exists
        if (YAHOO.lang.isFunction(this._approvedAction)) this._approvedAction();
    };

    // call this function to signal this activity is loaded
    this.ready = function(data)
    {
        this.Events.fire('onReady', data);
    };

    this.getId = function() { return id; };
    this.toString = function() { return this.getId(); };

    this._visited = false;

    // mark this activity as being visited
    this.markVisited = function() { this._visited = true; };

    // has this activity been visited before
    this.hasVisited = function() { return this._visited; };
};

// extends a class to be an activity
Util.Workflow.extendActivity = function(activityClass)
{
    YAHOO.lang.extend(activityClass, Util.Workflow.Activity);
};

/*****************************************************************************/

/*

var Activity1 = function()
{
    Activity1.superclass.constructor.call(this, 'activity1');

    this.enter = function()
    {
        YAHOO.lang.later(0, this, this.request, 'next');
    }
}

Util.Workflow.extendActivity(Activity1);

var Activity2 = function()
{
    Activity2.superclass.constructor.call(this, 'activity2');

    this.enter = function()
    {
        YAHOO.lang.later(0, this, this.request, 'next');
    }
}

Util.Workflow.extendActivity(Activity2);

var Activity3 = function()
{
    Activity3.superclass.constructor.call(this, 'activity3');

    this.init = function()
    {
        YAHOO.lang.later(1000, this, this.ready);
        return true;
    }

    this.enter = function()
    {
        YAHOO.lang.later(0, this, function()
        {
            this.request('next', { value: 1 })
        });
    }
}

Util.Workflow.extendActivity(Activity3);

var Activity4 = function()
{
    Activity4.superclass.constructor.call(this, 'activity4');

    this.enter = function()
    {
        YAHOO.lang.later(0, this, this.request, 'next');
    }
}

Util.Workflow.extendActivity(Activity4);

var Activity5 = function()
{
    Activity5.superclass.constructor.call(this, 'activity5');

    this.enter = function()
    {
        //YAHOO.lang.later(0, this, this.request, 'next');
    }
}

Util.Workflow.extendActivity(Activity5);

// create workflow
var workflow = new Util.Workflow();

// listen for workflow events
workflow.Events.subscribe('onRequest', function(activity) { Util.log('Activity Transition Request: ' + activity); });
workflow.Events.subscribe('onReady', function(activity) { Util.log('Activity Transition Ready: ' + activity); });
workflow.Events.subscribe('onLeave', function(activity) { Util.log('Activity Leave: ' + activity); });
workflow.Events.subscribe('onEnter', function(activity) { Util.log('Activity Enter: ' + activity); });

// create activities
workflow.addActivity(new Activity1());
workflow.addActivity(new Activity2());
workflow.addActivity(new Activity3());
workflow.addActivity(new Activity4());
workflow.addActivity(new Activity5());

// define workflow actions
workflow.addTransition('activity1', 'next', 'activity2');
workflow.addTransition('activity2', 'next', 'activity3');
workflow.addTransition('activity3', 'next', function(data)
{
    Util.dir(data);
    return 'activity4';
});
workflow.addTransition('activity4', 'next', 'activity5');

// enter workflow
workflow.start('activity1');

*/

/*

// UNIT TEST: For approval function

var Activity1 = function()
{
    Activity1.superclass.constructor.call(this, 'activity1');

    this.enter = function()
    {
        console.log('ENTERED ACTIVITY 1');
        YAHOO.lang.later(0, this, this.request, 'next');
    };
};

Util.Workflow.extendActivity(Activity1);

var Activity2 = function()
{
    Activity2.superclass.constructor.call(this, 'activity2');

    this.approval = function()
    {
        YAHOO.lang.later(1000, this, this.approve);
        return Util.Workflow.Approval.Pending;
    };

    this.enter = function()
    {
        console.log('ENTERED ACTIVITY 2');
    };
};

Util.Workflow.extendActivity(Activity2);


var workflow = new Util.Workflow();
workflow.addActivity(new Activity1());
workflow.addActivity(new Activity2());
workflow.addTransition('activity1', 'next', 'activity2');
workflow.start('activity1');
*/