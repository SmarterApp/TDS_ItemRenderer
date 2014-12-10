/*
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

    // A poller that periodically sends the accummulated (and completed) audit logs to the server
    function AuditLogPoller () {
        this.timer = null;
        
        this.start = function (interval) {
            var instance = this;
            var poll = function() {
                var auditData = TS.Audit.recordsToReport();
                if (auditData == null || auditData.length == 0) { // No data to report
                    instance.timerInst = setTimeout(poll, interval * 1000);
                    return;     
                }
                // send Data to server
                TestShell.xhrManager.logAuditTrail(TS.Audit.serializeToJSON(auditData))
                    .then(function () {
                        TS.Audit.markAsReported(auditData);
                    })   // mark these records as successfully submitted                           
                    .finally(function() {
                        instance.timerInst = setTimeout(poll, interval * 1000);
                    });  // reschedule next poll. Note: not using setInterval to prevent overruns);
            };
            this.timerInst = setTimeout(poll, interval*1000);
        };
        
        this.cancel = function() {
            clearInterval(this.timerInst);
        };
    };
 
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

        // Periodically poll for completed audit records and send it back to the server
        TS.Audit.Poller = new AuditLogPoller();
        TS.Audit.Poller.start(TS.Config.auditTimerInterval);
    }
    
    function unload() {
        // stop the poller, stop the timer
        if (TS.Audit.Poller) TS.Audit.Poller.cancel();
        if (TS.Audit.SynthClock) TS.Audit.SynthClock.stop();
    }

    TS.registerModule({
        name: 'audit',
        load: load,
        unload: unload 
    });
        
})(TestShell, ContentManager, TTSManager);