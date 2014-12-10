var TSA = TestShell.Audit;
var TNAV = TestShell.Navigation;
var CM = ContentManager;

testDone(function () {
    TSA._teardown();
});

test('Check Page Load Record Creation', function () {    
    TSA.logAuditEvent(new TSA.Event(123, 'content-init', contentPage));
    TSA.logAuditEvent(new TSA.Event(123, 'content-loaded', contentPage));
    ok(TSA._completedRecords.length == 1, 'Page load created');
});

test('Check Page Visit Record Creation', function () {    
    TSA.logAuditEvent(new TSA.Event(123, 'page-requested', contentPage));
    TSA.logAuditEvent(new TSA.Event(123, 'page-show', contentPage));
    TSA.logAuditEvent(new TSA.Event(123, 'page-hide', contentPage));
    ok(TSA._completedRecords.length == 1, 'Page visit created');
});

test('Check Tool Usage', function () {   
    TSA.logAuditEvent(new TSA.Event(123, 'page-requested', contentPage));
    TSA.logAuditEvent(new TSA.Event(123, 'page-show', contentPage));
    TSA.logAuditEvent(new TSA.ToolUsageEvent(123, contentPage, 'TTS', 'TDS_TTS_Item'));
    TSA.logAuditEvent(new TSA.ToolUsageEvent(123, contentPage, 'TTS', 'TDS_TTS_Item'));
    TSA.logAuditEvent(new TSA.ToolUsageEvent(123, contentPage, 'TTS', 'TDS_TTS_Item'));
    TSA.logAuditEvent(new TSA.ToolUsageEvent(123, contentPage, 'TTS', 'TDS_TTS_Stim'));
    TSA.logAuditEvent(new TSA.Event(123, 'page-hide', contentPage));
    ok(TSA._completedRecords.length == 1, 'Page visit created');
    ok(TSA._completedRecords[0].toolsUsed.length == 2, '2 tool usages recorded');

    var toolUsage_TTS_Stim = Util.Array.find(TSA._completedRecords[0].toolsUsed, function (record, index, list) {
        return (record.accCode == 'TDS_TTS_Stim');
    });
    ok(toolUsage_TTS_Stim != null && toolUsage_TTS_Stim.count == 1, '1 TTS_Stim usage recorded');
    
    var toolUsage_TTS_Item = Util.Array.find(TSA._completedRecords[0].toolsUsed, function (record, index, list) {
        return (record.accCode == 'TDS_TTS_Item');
    });
    ok(toolUsage_TTS_Item != null && toolUsage_TTS_Item.count == 3, '3 TTS_Item usage recorded');
});

test('Check Tool Usage Aggregation', function () {
    TSA.logAuditEvent(new TSA.Event(123, 'page-requested', contentPage));
    TSA.logAuditEvent(new TSA.Event(123, 'page-show', contentPage));
    TSA.logAuditEvent(new TSA.ToolUsageEvent(123, contentPage, 'TTS', 'TDS_TTS_Item'));
    TSA.logAuditEvent(new TSA.ToolUsageEvent(123, contentPage, 'TTS', 'TDS_TTS_Item'));
    TSA.logAuditEvent(new TSA.ToolUsageEvent(123, contentPage, 'TTS', 'TDS_TTS_Item'));
    TSA.logAuditEvent(new TSA.ToolUsageEvent(123, contentPage, 'TTS', 'TDS_TTS_Stim'));
    TSA.logAuditEvent(new TSA.Event(123, 'page-hide', contentPage));
    TSA.logAuditEvent(new TSA.Event(123, 'page-requested', contentPage));
    TSA.logAuditEvent(new TSA.Event(123, 'page-show', contentPage));
    TSA.logAuditEvent(new TSA.ToolUsageEvent(123, contentPage, 'TTS', 'TDS_TTS_Item'));
    TSA.logAuditEvent(new TSA.ToolUsageEvent(123, contentPage, 'TTS', 'TDS_TTS_Item'));
    TSA.logAuditEvent(new TSA.ToolUsageEvent(123, contentPage, 'TTS', 'TDS_TTS_Item'));
    TSA.logAuditEvent(new TSA.ToolUsageEvent(123, contentPage, 'TTS', 'TDS_TTS_Stim'));
    TSA.logAuditEvent(new TSA.Event(123, 'page-hide', contentPage));
    ok(TSA._completedRecords.length == 1, 'Page visit created');
    ok(TSA._completedRecords[0].visitCount == 2, 'Page visit count check');
    ok(TSA._completedRecords[0].toolsUsed.length == 2, '2 tool usages recorded');

    var toolUsage_TTS_Stim = Util.Array.find(TSA._completedRecords[0].toolsUsed, function (record, index, list) {
        return (record.accCode == 'TDS_TTS_Stim');
    });
    ok(toolUsage_TTS_Stim != null && toolUsage_TTS_Stim.count == 2, '2 TTS_Stim usage recorded');

    var toolUsage_TTS_Item = Util.Array.find(TSA._completedRecords[0].toolsUsed, function (record, index, list) {
        return (record.accCode == 'TDS_TTS_Item');
    });
    ok(toolUsage_TTS_Item != null && toolUsage_TTS_Item.count == 6, '6 TTS_Item usage recorded');
});



test('Check Page Visit Aggregation', function () {    
    TSA.logAuditEvent(new TSA.Event(123, 'page-requested', contentPage));        
    TSA.logAuditEvent(new TSA.Event(123, 'page-show', contentPage));        
    TSA.logAuditEvent(new TSA.Event(123, 'page-hide', contentPage));
    TSA.logAuditEvent(new TSA.Event(123, 'page-requested', contentPage));
    TSA.logAuditEvent(new TSA.Event(123, 'page-show', contentPage));
    TSA.logAuditEvent(new TSA.Event(123, 'page-hide', contentPage));
    TSA.logAuditEvent(new TSA.Event(123, 'page-requested', contentPage));
    TSA.logAuditEvent(new TSA.Event(123, 'page-show', contentPage));
    TSA.logAuditEvent(new TSA.Event(123, 'page-hide', contentPage));
    TSA.logAuditEvent(new TSA.Event(123, 'page-requested', contentPage));        
    TSA.logAuditEvent(new TSA.Event(123, 'page-show', contentPage));        
    TSA.logAuditEvent(new TSA.Event(123, 'page-hide', contentPage));
    ok(TSA._completedRecords.length == 1, 'Page visit created');
    ok(TSA._completedRecords[0].visitCount == 4, 'Page visit count correct');        
});



test('Check Page Load Failures', function () {    
    TSA.logAuditEvent(new TSA.Event(123, 'page-requested', contentPage));
    TSA.logAuditEvent(new TSA.Event(123, 'content-requested', contentPage));
    TSA.logAuditEvent(new TSA.Event(123, 'content-failed', contentPage));
    TSA.logAuditEvent(new TSA.Event(123, 'content-requested', contentPage));
    TSA.logAuditEvent(new TSA.Event(123, 'content-failed', contentPage));
    TSA.logAuditEvent(new TSA.Event(123, 'content-requested', contentPage));
    TSA.logAuditEvent(new TSA.Event(123, 'content-init', contentPage));
    TSA.logAuditEvent(new TSA.Event(123, 'content-rendering', contentPage));
    TSA.logAuditEvent(new TSA.Event(123, 'content-rendered', contentPage));
    TSA.logAuditEvent(new TSA.Event(123, 'content-available', contentPage));
    TSA.logAuditEvent(new TSA.Event(123, 'content-loaded', contentPage));    
    ok(TSA._completedRecords.length == 1, 'Page Load created');
    ok(TSA._completedRecords[0].loadAttempts == 1, 'Page load INCORRECTLY shows load attempts as 1');

});


test('Check Page Load Aggregation', function () {    
    TSA.logAuditEvent(new TSA.Event(123, 'page-requested', contentPage));
    TSA.logAuditEvent(new TSA.Event(123, 'content-init', contentPage));
    TSA.logAuditEvent(new TSA.Event(123, 'content-init', contentPage));
    TSA.logAuditEvent(new TSA.Event(123, 'content-rendering', contentPage));
    TSA.logAuditEvent(new TSA.Event(123, 'content-rendering', contentPage));
    TSA.logAuditEvent(new TSA.Event(123, 'content-rendered', contentPage));
    TSA.logAuditEvent(new TSA.Event(123, 'content-rendered', contentPage));
    TSA.logAuditEvent(new TSA.Event(123, 'content-available', contentPage));
    TSA.logAuditEvent(new TSA.Event(123, 'content-available', contentPage));
    TSA.logAuditEvent(new TSA.Event(123, 'content-loaded', contentPage));
    TSA.logAuditEvent(new TSA.Event(123, 'content-loaded', contentPage));
    ok(TSA._completedRecords.length == 1, '1 Page Load created');
    ok(TSA._completedRecords[0].loadAttempts == 2, 'Page load correctly shows load attempts as 2');
});

test('Check Page Visit Aggregation Timings', function (assert) {
    
    var pageRequested = function () {
        var deferred = new $.Deferred();
        setTimeout(function () {
            TSA.logAuditEvent(new TSA.Event(123, 'page-requested', contentPage));
            deferred.resolve();
        }, 1000);
        return deferred.promise();        
    };        

    var pageShow = function () {
        var deferred = new $.Deferred();
        setTimeout(function () {
            TSA.logAuditEvent(new TSA.Event(123, 'page-show', contentPage));
            deferred.resolve();
        }, 1000);
        return deferred.promise();
    };

    var pageHide = function () {
        var deferred = new $.Deferred();
        setTimeout(function () {
            TSA.logAuditEvent(new TSA.Event(123, 'page-hide', contentPage));
            deferred.resolve();
        }, 1000);
        return deferred.promise();
    };
    
    var checkResults = function () {
        ok(TSA._completedRecords.length == 1, '1 Page Visit created');
        ok(TSA._completedRecords[0].visitCount == 2, 'Page visit count is correct');
        ok(TSA._completedRecords[0].requestTime >= 2000, 'Page request time is correct (' + TSA._completedRecords[0].requestTime+')');
        ok(TSA._completedRecords[0].visitTime >= 2000, 'Page visit time is correct (' + TSA._completedRecords[0].visitTime+')');
    };

    assert.will(pageRequested().then(pageShow).then(pageHide).then(pageRequested).then(pageShow).then(pageHide).then(checkResults));        
});

test('Check Synthetic clock', function (assert) {
    expect(4);

    var timeStamps = [];

    var logTimeStamp = function () {
        var deferred = new $.Deferred();
        setTimeout(function () {
            timeStamps.push(TSA.SynthClock.timeStamp());
            deferred.resolve();
        }, TSA.SynthClock.RESOLUTION+5);
        return deferred.promise();
    };

    var checkResults = function () {
        for (var i = 0; i < timeStamps.length - 1; i++) {
            var diff = timeStamps[i + 1] - timeStamps[i];
            ok(diff == TSA.SynthClock.RESOLUTION, "Timestamp diff " + diff);
        }
    };

    assert.will(logTimeStamp().then(logTimeStamp).then(logTimeStamp).then(logTimeStamp).then(checkResults));

});

test('Check FF36 Serialization Hack', function () {
    TSA.logAuditEvent(new TSA.Event(123, 'content-init', contentPage));
    TSA.logAuditEvent(new TSA.Event(123, 'content-loaded', contentPage));
    TSA.logAuditEvent(new TSA.Event(123, 'content-init', contentPage));
    TSA.logAuditEvent(new TSA.Event(123, 'content-loaded', contentPage));
    
    TSA.logAuditEvent(new TSA.Event(123, 'page-requested', contentPage));
    TSA.logAuditEvent(new TSA.Event(123, 'page-show', contentPage));
    TSA.logAuditEvent(new TSA.Event(123, 'page-hide', contentPage));
    TSA.logAuditEvent(new TSA.Event(123, 'page-requested', contentPage));
    TSA.logAuditEvent(new TSA.Event(123, 'page-show', contentPage));
    TSA.logAuditEvent(new TSA.Event(123, 'page-hide', contentPage));
    TSA.logAuditEvent(new TSA.Event(123, 'page-requested', contentPage));
    TSA.logAuditEvent(new TSA.Event(123, 'page-show', contentPage));
    TSA.logAuditEvent(new TSA.Event(123, 'page-hide', contentPage));
    TSA.logAuditEvent(new TSA.Event(123, 'page-requested', contentPage));
    TSA.logAuditEvent(new TSA.Event(123, 'page-show', contentPage));
    TSA.logAuditEvent(new TSA.Event(123, 'page-hide', contentPage));

    ok(TSA._completedRecords.length == 2, '1 page load and 1 page visit created');
    ok(TSA._completedRecords[0].loadAttempts == 2, 'Page load attempts correct');
    ok(TSA._completedRecords[1].visitCount == 4, 'Page visit count correct');
    
    var auditData = TSA.recordsToReport();
    var realJSON = TSA.serializeToJSON(auditData);

    // hijack the Util.browser function to fake FF3.6
    var realFunction = Util.Browser.getFirefoxVersion;
    Util.Browser.getFirefoxVersion = function () { return 3.6; }

    var ff36JSON = TSA.serializeToJSON(auditData);

    ok(realJSON == ff36JSON, 'FF36 hack produces the same serialized output');

});

test('Check TestShell and CM event listeners', function () {

    TNAV.fire('requested', contentPage);
    CM.pageEvents.fire('show', contentPage);
    CM.pageEvents.fire('hide', contentPage);

    ok(TSA._completedRecords.length == 1, '1 page visit created');

});


