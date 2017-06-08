//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
﻿Sections.TestApproval = function()
{
    Sections.TestApproval.superclass.constructor.call(this, 'sectionTestApproval');

    this._timer = null;

    this.Controls =
    {
        btnCancelApproval: YUD.get('btnCancelApproval')
    };

    this.addClick(this.Controls.btnCancelApproval, this.cancel);
};

YAHOO.lang.extend(Sections.TestApproval, Sections.Base);

Sections.TestApproval.Status =
{
    waiting: 0,
    approved: 1,
    denied: 2,
    logout: 3
};

Sections.TestApproval.prototype.setMessage = function(header, message)
{
    YUD.get('lblApprovalHeader').innerHTML = header;
    YUD.get('lblApprovalMessage').innerHTML = message;
};

Sections.TestApproval.prototype.cancel = function()
{
    // cancel any xhr requests
    TDS.Student.API.cancelCheckApproval();

    // stop any polling
    if (this._timer)
    {
        this._timer.cancel();
        this._timer = null;
    }
    
    // logout user and skip verify dialog
    this.request('logout', true);
};

Sections.TestApproval.prototype.load = function ()
{
    /*
    var header = 'Waiting for TA approval...';
    var message = 'Please wait while the Test Administrator edits the settings for your test session. This may take a few minutes...';
    this.setMessage(header, message);
    */
};

Sections.TestApproval.prototype.enter = function () {

    var Store = TDS.Student.Storage;
    var oppInstance = Store.createOppInstance();
    var testSession = Store.getTestSession();
    var testProps = Store.getTestProperties();

    // default polling duration 
    var pollDuration = 5000;

    // check for approval after a specific duration 
    var pollForApproval = function(duration) {
        this.timer = YAHOO.lang.later(duration, this, checkForApproval);
    }.bind(this);

    // check the server for approval
    var checkForApproval = function() {
        TDS.Student.API.checkApproval(oppInstance, testSession.id, testProps.key).then(function (approval) {
            // check if approved/denied
            switch (approval.status) {
                case Sections.TestApproval.Status.approved: {
                    this.approved(approval); return;
                }
                case Sections.TestApproval.Status.denied: {
                    this.denied(approval); return;
                }
                case Sections.TestApproval.Status.logout: {
                    this.logout(); return;
                }
            }
            // continue polling for approval
            pollForApproval(pollDuration);
        }.bind(this));
    };

    // begin polling for approval
    pollForApproval(1);
};

// this is called automatically when the test is approved
Sections.TestApproval.prototype.approved = function(approval)
{
    LoginShell.setTestAccommodations(approval.segmentsAccommodations);
    
    // go to verify 
    this.request('next', approval);
};

Sections.TestApproval.prototype.denied = function(approval)
{
    var self = this;

    // build denied message
    var deniedMessage = Messages.get('Approval.Label.TADenied');
    
    if (approval.comment != null && approval.comment.length > 0) {
        deniedMessage += ": " + approval.comment;
    }

    // show message
    TDS.Dialog.showAlert(deniedMessage, function() {
        self.logout();
    });
};

Sections.TestApproval.prototype.logout = function()
{
    // logout user and skip verify dialog
    this.request('logout', true);
};

