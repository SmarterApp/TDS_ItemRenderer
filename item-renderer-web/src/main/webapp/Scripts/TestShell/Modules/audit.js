//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
﻿/*
* Module to monitor latencies and tool usage
*/

(function (TS, CM, TTSMgr) {

    // A synthetic clock used for audit logging
    function Timer() {
        this.RESOLUTION = 100; // resolution of our clock in ms
        this._ticks = 0;        
        this._timerInst = null;       
        this.start = function () {
            var tick = function () {
                this._ticks++;
            };
            this._timerInst = setInterval(tick.bind(this), this.RESOLUTION);
        };
        this.stop = function() {
            clearInterval(this.timerInst);
        };
        this.timeStamp = function() {
            return this._ticks * this.RESOLUTION;
        };
    }
    
    function load() {

        // Start our synthetic clock
        TS.Audit.SynthClock = new Timer();
        TS.Audit.SynthClock.start();

        /****************************************************************************************/
        // The event subscriptions below are used to audit the different components of the test shell

        //TS.ContentLoader._xhrManager.Events.subscribe('onRequest', function (request) {
        //    TS.Audit.logAuditEvent(new TS.Audit.Event(request.getId(), 'content-requested'));
        //});

        //TS.ContentLoader._xhrManager.Events.subscribe('onSuccess', function (request) {
        //    TS.Audit.logAuditEvent(new TS.Audit.Event(request.getId(), 'content-received'));
        //});

        //TS.ContentLoader._xhrManager.Events.subscribe('onFailure', function (request) {
        //    TS.Audit.logAuditEvent(new TS.Audit.Event(request.getId(), 'content-failed'));
        //});      

        CM.onPageEvent('init', function (contentPage) {
            TS.Audit.logAuditEvent(new TS.Audit.Event(contentPage.id, 'content-init', contentPage));
        });

        CM.onPageEvent('rendering', function (contentPage) {
            TS.Audit.logAuditEvent(new TS.Audit.Event(contentPage.id, 'content-rendering', contentPage));
        });

        CM.onPageEvent('rendered', function (contentPage) {
            TS.Audit.logAuditEvent(new TS.Audit.Event(contentPage.id, 'content-rendered', contentPage));
        });

        CM.onPageEvent('available', function (contentPage) {
            TS.Audit.logAuditEvent(new TS.Audit.Event(contentPage.id, 'content-available', contentPage));
        });

        CM.onPageEvent('loaded', function (contentPage) {
            TS.Audit.logAuditEvent(new TS.Audit.Event(contentPage.id, 'content-loaded', contentPage));
        });

        CM.onPageEvent('show', function (contentPage) {
            TS.Audit.logAuditEvent(new TS.Audit.Event(contentPage.id, 'page-show', contentPage));
        });

        CM.onPageEvent('hide', function (contentPage) {
            TS.Audit.logAuditEvent(new TS.Audit.Event(contentPage.id, 'page-hide', contentPage));
        });

        TS.Navigation.on('requested', function(testShellPage) {
            TS.Audit.logAuditEvent(new TS.Audit.Event(testShellPage.id, 'page-requested', testShellPage));
        });
        
        /****************************************************************************************/
        // Record accommodation tool usage

        TTSMgr.Events.onStatusChange.subscribe(function (currentStatus) {
            // we are only interested in playing event
            if (currentStatus != TTSStatus.Playing) {
                return;
            }

            // get content manager page
            var currentPage = CM.getCurrentPage();
            if (currentPage == null) {
                return;
            }

            // get current entity (item or passage)
            var currentEntity = currentPage.getActiveEntity();

            if (currentEntity instanceof ContentPassage) {
                TS.Audit.logAuditEvent(new TS.Audit.ToolUsageEvent(currentPage.id, currentPage, 'TTS', 'TDS_TTS_Stim'));
            } else if (currentEntity instanceof ContentItem) {
                TS.Audit.logAuditEvent(new TS.Audit.ToolUsageEvent(currentPage.id, currentPage, 'TTS', 'TDS_TTS_Item'));
            }
        });

        // Timer task to get audit info every two ticks (about two minutes)
        TS.xhrTimer.register(2, function(api) {
        /*    var auditData = TS.Audit.recordsToReport();
            if (auditData && auditData.length > 0) {
                var obj = TS.Audit.toObject(auditData);
                api.add('audit', obj).then(function () {
                    // mark these records as successfully submitted
                    TS.Audit.markAsReported(auditData);
                }, function () {
                    // don't mark as reported and hope that next time it saves
                    console.warn('Error saving audit logs');
                });
            }*/
        });

    }
    
    function unload() {
        if (TS.Audit.SynthClock) {
            TS.Audit.SynthClock.stop();
        }
    }

    TS.registerModule({
        name: 'audit',
        load: load,
        unload: unload 
    });
        
})(TestShell, ContentManager, TTSManager);