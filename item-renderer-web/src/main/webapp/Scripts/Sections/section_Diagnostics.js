//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
﻿Sections.Diagnostics = function()
{
    Sections.Diagnostics.superclass.constructor.call(this, 'sectionDiagnostics');

    // return to previous page, the url is either given as a parameter in query string, or from referer from page header
    this.addClick('btnDiagLogin', function()
    {
        if (this.referUrl != null) {
            window.location = this.referUrl;
        } else if (document.referrer) {
            window.location = document.referrer;
        }
    });

    // JAVA sound check
    this.addClick('btnDiagELPA', function() {
    	 //do not allow navigating away from the speed test if one is already running.
    	 //we do not have the capability to stop a running speed test right now.
    	 if (this.isSpeedTestRunning())
    	 	return;
    	 this.request('elpa');
    });

    // TTS speech check
    this.addClick('btnDiagTTS', function() {
    	//do not allow navigating away from the speed test if one is already running.
    	//we do not have the capability to stop a running speed test right now.
    	if (this.isSpeedTestRunning())
    		return;
        this.request('tts');
    });
    
    // debug info
    this.addClick('lblDiagBrowserLabel', function() {
        YUD.setStyle('diagnosticsDebug', 'display', 'block');
    });

    this._userInput = null;
    this.client = 'air';
    this.referUrl = null;
    this.GlobalNetworkDiagnosticsTestInfo = null;
};

YAHOO.lang.extend(Sections.Diagnostics, Sections.Base);

Sections.Diagnostics.prototype.init = function () {
    // change the message on the button and any static labels    
    var message = Messages.getAlt('Diagnostics.Label.Initializing', "Initializing...");
    this.setDiagnosticsTestButtonText(message);

    this.setBrowserInfo();
    this.processQueryString();

    this.retrieveTestInfo();
};

Sections.Diagnostics.prototype.retrieveTestInfo = function () {
    var url = '../Config/networkdiagnosticstestinfo.js';
    var that = this;
    var callbackFunc = {
        success: function (o) {
            that.GlobalNetworkDiagnosticsTestInfo = JSON.parse(o.responseText);

            that.retrieveAccommodation();
        },
        failure: function (o) {
        }
    };
    var testInfoFileHandler = YUC.asyncRequest('GET', url, callbackFunc, null);
};

Sections.Diagnostics.prototype.retrieveAccommodation = function () {
    var url = '../Config/globalaccommodations.js';
    var that = this;

    var callbackFunc = {
        success: function (o) {
            GlobalAccommodations = JSON.parse(o.responseText);

            that.configClient();
            if (that.hasUserInputFields()) {
                that.setUserInputFields();
            }

            // this.setFlash();
            that.setDiagSpeedTestHandler(null);
        },
        failure: function (o) {
        }
    };
    var accommodationsFileHandler = YUC.asyncRequest('GET', url, callbackFunc, null);
}

Sections.Diagnostics.prototype.load = function ()
{
    //clear results from last set. 
    YUD.setStyle('downloadResultsLabel', 'display', 'none');
    YUD.setStyle('uploadResultsLabel', 'display', 'none');
    YUD.setStyle('bandwidthSummaryLabel', 'display', 'none');
    document.getElementById('downloadResults').innerHTML = '';
    document.getElementById('uploadResults').innerHTML = '';
    document.getElementById('bandwidthSummary').innerHTML = '';
    document.getElementById('bandwidthSummary').className = '';  
	
	//clear out test selection.
    var availableTests = YAHOO.util.Dom.get('availableTests');
	availableTests.selectedIndex = 0;
	//clear the typed in "number of students".
	YAHOO.util.Dom.get('numStudentsTesting').value = "";
};

Sections.Diagnostics.prototype.setDiagnosticsTestButtonText = function(text)
{
    var buttonSpan = YAHOO.util.Dom.get('btnDiagSpeedTest');
    var buttonTarget = buttonSpan.firstChild.firstChild;
    if (buttonTarget != null) {
        buttonTarget.innerHTML = text;
    }
};

Sections.Diagnostics.prototype.configClient = function () {
    if (this.client == null) return;

    // set the network diagnostic test info, if this has been set properly, skip
    if (this.hasUserInputFields()) return;

    var currentClient = this.client;

    if (this.GlobalNetworkDiagnosticsTestInfo && this.GlobalNetworkDiagnosticsTestInfo.length > 0)
    {
        // browser global test info settings
        this.GlobalNetworkDiagnosticsTestInfo.forEach(function (clientTestInfo) {
            // find the testinfo that matches with the client
            if (clientTestInfo.client == currentClient) {
                TDS.Config.NetworkDiagnosticsTestInfo = clientTestInfo.testinfo;
            }
        });
    }

    // set the language from global accomodations info
    // if (TDS.globalAccommodations) return;

    if (GlobalAccommodations && GlobalAccommodations.length > 0) {
        GlobalAccommodations.forEach(function (accs) {
            // find the global accommodations info that matches with the client
            if (accs.client == currentClient) {
                if (accs.accs_global && (TDS.Config.accs_global == null)) {
                    TDS.Config.accs_global = accs.accs_global;
                    TDS.globalAccommodations.importJson(TDS.Config.accs_global);
                    TDS.globalAccommodations.selectDefaults();
                    // reapply global accomodations to document body css
                    TDS.globalAccommodations.applyCSS(document.body);
                }
            }
        });
    }
};

Sections.Diagnostics.prototype.setUserInputFields = function()
{
    if (!this.hasUserInputFields()) return;

    // User is going to provide input since we have a NetworkDiagnosticsTestInfo with info about available subjects and data rate for each subject
    
    // populate the subject selector drop down
    TDS.Config.NetworkDiagnosticsTestInfo.forEach(function(subjectInfo)
    {
        var option = HTML.OPTION({ 'value': subjectInfo.subject }, subjectInfo.subject);
        YAHOO.util.Dom.get('availableTests').appendChild(option);
    });
    
    // show the user input fields
    YAHOO.util.Dom.setAttribute('diagnosticsTestInput', 'style', 'display:block');
};

Sections.Diagnostics.prototype.setClient = function (clientName) {
    if (clientName && clientName != '') {
        this.client = clientName.toLowerCase();
    }
};

Sections.Diagnostics.prototype.setReferUrl = function (url) {
    if (url && url != '') {
        this.referUrl = url;
    }
};

Sections.Diagnostics.prototype.processQueryString = function() {
    var querystring = Util.QueryString.parse();
    this.setClient(querystring.c);
    this.setReferUrl(querystring.url);
};

Sections.Diagnostics.prototype.setFlash = function()
{
    var flashVer = Util.Browser.getFlashVersion();

    YUD.setStyle('flashversionloading', 'display', 'none'); // hide the loading message

    if (flashVer > 0)
    {
        document.getElementById('flashversion').innerHTML = flashVer;
    }
    else
    {
        document.getElementById('flashversion').innerHTML = Messages.getAlt('Diagnostics.Label.NoFlashFound','No Flash Plugin Detected');
    }
};

Sections.Diagnostics.prototype.setDiagSpeedTestHandler = function(version) {
	if (version && version.plugin >= 1.5) {
		//we need atleast version 1.5 as we use System.nanoTime which is available with version
		//1.5 and upwards.
		Util.Network.AppletBandWidthTester.init(this);
	} else {
		//use the javascript one.
		this.addClick('btnDiagSpeedTest', function() {
			YAHOO.util.Dom.setAttribute('btnDiagSpeedTest', 'disabled', 'true');
			this.setConnectionSpeed();
		});
		this.setDiagnosticsTestButtonText(Messages.getAlt('Diagnostics.Label.RunNetDiagTest','Run Network Diagnostics Tests'));
	}
};

Sections.Diagnostics.prototype.isSpeedTestRunning = function() {
	//if we have already disabled the button then dont allow another speed test to run.
	var disabledAttrib = YAHOO.util.Dom.get('btnDiagSpeedTest').getAttribute('disabled');
	if (disabledAttrib != null && "true" == disabledAttrib)
		return true;
	return false;
};

Sections.Diagnostics.prototype.setAppletSpeedTestClickHandler = function() {
	YAHOO.util.Dom.get('btnDiagSpeedTest').removeAttribute('disabled');
	//use the applet.
	this.addClick('btnDiagSpeedTest', function() {
		this.appletTestConnectionSpeed();
	});
	this.setDiagnosticsTestButtonText(Messages.getAlt('Diagnostics.Label.RunNetDiagTest', 'Run Network Diagnostics Tests'));
};

Sections.Diagnostics.prototype.appletTestConnectionSpeed = function() {
	
	//if we have already disabled the button then dont allow another speed test to run.
	if (this.isSpeedTestRunning())
		return;
	
	YAHOO.util.Dom.setAttribute('btnDiagSpeedTest', 'disabled', 'true');
	
	if (this.hasUserInputFields() && !this.validateUserInput())
    {
        // user input is not good. Error messages would have already popped up. Nothing further to do here.
        YAHOO.util.Dom.get('btnDiagSpeedTest').removeAttribute('disabled');        
        return;
    }
	
	document.getElementById('downloadResults').innerHTML = '';
    document.getElementById('uploadResults').innerHTML = '';
    document.getElementById('bandwidthSummary').innerHTML = '';
    document.getElementById('bandwidthSummary').className = '';


    document.getElementById('downloadResults').innerHTML = 'Testing Connection Speed <span class="loadingAnimation"></span>';

    	
	var successCallback	= function(downloadMeasurements, uploadMeasurements) {
		var runStats = [];

		var convertFrom_bps_To_KBps = function(bpsValue) {
			return bpsValue / (1000 * 8);
		};
        /*
         * getAmortizedAverageTransferThroughput was causing issues on FF 3.5 on OS X
         * 
		runStats['GET'] = { aveLineSpeed : convertFrom_bps_To_KBps(downloadMeasurements.getAmortizedAverageTransferThroughput())};
		runStats['POST'] = { aveLineSpeed : convertFrom_bps_To_KBps(uploadMeasurements.getAmortizedAverageTransferThroughput())};
		*/
		runStats['GET'] = { aveLineSpeed : convertFrom_bps_To_KBps(downloadMeasurements)};
		runStats['POST'] = { aveLineSpeed : convertFrom_bps_To_KBps(uploadMeasurements)};
		
		this.NetworkDiagnosticsTestCallbackHdlr(runStats);
	};
	
	var failureCallback = function(failureCode, failureDetails) {
		var runStats = [];

	    runStats['GET'] = { aveLineSpeed : -1};
		runStats['POST'] = { maxLineSpeed : -1};
		this.NetworkDiagnosticsTestCallbackHdlr(runStats);
	};
	
    var speedTestConfig = {applicationURL: TDS.baseUrl, 
    	debugMode: true, bufferSize: 4096, 
    	numberOfSimultaneousConnections: 2, 
    	owner: this, 
    	onSuccessCallbackFn: successCallback, 
    	onFailureCallbackFn: failureCallback, 
    	transactionId: 1 /* we need a way to track this but this may be inconsequential.*/  };
	var speedTesterApplet = Util.Network.AppletBandWidthTester.run(speedTestConfig);

};

Sections.Diagnostics.prototype.setConnectionSpeed = function()
{
    YUD.setStyle('downloadResultsLabel', 'display', 'none');
    YUD.setStyle('uploadResultsLabel', 'display', 'none');
    YUD.setStyle('bandwidthSummaryLabel', 'display', 'none');
    document.getElementById('downloadResults').innerHTML = '';
    document.getElementById('uploadResults').innerHTML = '';
    document.getElementById('bandwidthSummary').innerHTML = '';
    document.getElementById('bandwidthSummary').className = '';
    this._userInput = null;

    if (this.hasUserInputFields() && !this.validateUserInput())
    {
        // user input is not good. Error messages would have already popped up. Nothing further to do here.
        YAHOO.util.Dom.get('btnDiagSpeedTest').removeAttribute('disabled');        
        return;
    }

    document.getElementById('downloadResults').innerHTML = 'Testing Connection Speed <span class="loadingAnimation"></span>';

    // content files to download for measuring bandwidth
    var downloadFiles = [];
    downloadFiles.push({ url: 'SpeedTest/256k.jpg', size: 262144 });
    downloadFiles.push({ url: 'SpeedTest/512k.jpg', size: 524288 });
    downloadFiles.push({ url: 'SpeedTest/1M.jpg', size: 1048576 });
    downloadFiles.push({ url: 'SpeedTest/2M.jpg', size: 2097152 });
    downloadFiles.push({ url: 'SpeedTest/4M.jpg', size: 4194304 });
    downloadFiles.push({ url: 'SpeedTest/8M.jpg', size: 8388608 });
    downloadFiles.push({ url: 'SpeedTest/16M.jpg', size: 16777216 });
    downloadFiles.push({ url: 'SpeedTest/32M.jpg', size: 33554432 });
    downloadFiles.push({ url: 'SpeedTest/64M.jpg', size: 67108864 });
    downloadFiles.push({ url: 'SpeedTest/128M.jpg', size: 134217728 });
    downloadFiles.push({ url: 'SpeedTest/256M.jpg', size: 268435456 });

    var callBackHndlr = this.NetworkDiagnosticsTestCallbackHdlr;
    var scopeObj = this;
    var fileIndex = 0;
    // We use an adaptive approach to determine the most appropriate file for measuring download bandwidth. This approach tries to download
    // multiple files of various sizes, starting with the smallest file, and then using larger files until the download time exceeds a predefined
    // threshold. The download bandwidth is calculated based on the results from the last file download.
    var pingConfig = { numIterations: 1, downloadurl: TDS.resolveBaseUrl(downloadFiles[fileIndex].url), alternateGETPOST: false, callBack:
        function (pingStats) {
            // check average download time, if less than 4 seconds, and there is still a larger file to use, try a larger file
            if ((pingStats['GET'].aveTransactionTime < 4000) && (fileIndex < (downloadFiles.length - 1))) {
                if (fileIndex < (downloadFiles.length - 1)) fileIndex++;
                pingConfig.downloadurl = TDS.resolveBaseUrl(downloadFiles[fileIndex].url);
                (new Util.Network.BandWidthTester(pingConfig)).run();
            } else {
                // test the file for calculating the real bandwidth
                // var latencyOffset = pingStats['GET'].minDelay > 0 ? pingStats['GET'].minDelay * -1 : 0;
                if (fileIndex < (downloadFiles.length - 1)) fileIndex++;
                var bwConfig = { numIterations: 1,
                    requestSizeinKiloBytes: downloadFiles[fileIndex].size / 1024,
                    downloadurl: TDS.resolveBaseUrl(downloadFiles[fileIndex].url),
                    generateUploadData: true,
                    alternateGETPOST: true,
                    latencyOffsetinms: 0,
                    callBack: callBackHndlr,
                    callBackScope: scopeObj
                };
                (new Util.Network.BandWidthTester(bwConfig)).run();
            }
        }
    };
    (new Util.Network.BandWidthTester(pingConfig)).run();
};

Sections.Diagnostics.prototype.hasUserInputFields = function()
{
    return (typeof TDS == 'object' && typeof TDS.Config == 'object' && typeof TDS.Config.NetworkDiagnosticsTestInfo == 'object' && TDS.Config.NetworkDiagnosticsTestInfo.length > 0);
    // always return true
    // return true;
};

Sections.Diagnostics.prototype.validateUserInput = function()
{
    // hide any prior validation errors
    YAHOO.util.Dom.setAttribute('chooseTestError', 'style', 'display:none');
    YAHOO.util.Dom.setAttribute('chooseStudentCountError', 'style', 'display:none');
    this._userInput = null;

    var isValid = true;

    var selectedTest = YAHOO.util.Dom.get('availableTests').value;
    if (selectedTest == "")
    {
        // No selected Test available
        YAHOO.util.Dom.setAttribute('chooseTestError', 'style', 'display:block');
        isValid = false;
    }

    var numStudents = YAHOO.util.Dom.get('numStudentsTesting').value;
    if (!YAHOO.lang.isNumber(parseInt(numStudents)) || parseInt(numStudents) <= 0)
    {
        // Not a valid number of students
        YAHOO.util.Dom.setAttribute('chooseStudentCountError', 'style', 'display:block');
        isValid = false;
    }

    if (isValid)
    {
        var testInfo = null;
        TDS.Config.NetworkDiagnosticsTestInfo.forEach(function (subjectInfo)
        {
            if (subjectInfo.subject == selectedTest)
            {
                testInfo = subjectInfo;
            }
        });
        if (testInfo)
        {
            this._userInput = { 'selectedTest': selectedTest, 'numStudentsToTest': parseInt(numStudents), 'testInfo': testInfo };
        }
    }

    return isValid;
};


Sections.Diagnostics.prototype.NetworkDiagnosticsTestCallbackHdlr = function(runStats)
{
    var defaultDisclaimer = ' (Please note: The throughput estimates include the encryption/decryption overhead for data transfer. Throughput estimates change as the network conditions change and can vary from run to run.)';
    var disclaimer = Messages.getAlt('Diagnostics.Label.Disclaimer', defaultDisclaimer);

    // Download Results
    var downloadResults = runStats['GET'];    
    if (downloadResults.aveLineSpeed > 0)
    {
        // maxLineSpeed is in KBps - multiply by 8 to get Kbps and divide by 1000 (not 1024) to get Mbps
        var downloadLineSpeedinMbps = ((downloadResults.aveLineSpeed * 8) / 1000).toFixed(3);
        YUD.setStyle('downloadResultsLabel', 'display', 'block');
        document.getElementById('downloadResults').innerHTML = downloadLineSpeedinMbps + ' Mbps download.';
    }
    else
    {
        // All our download tests failed. No useful data collected
        document.getElementById('downloadResults').innerHTML = 'Error running throughput tests...';
        YAHOO.util.Dom.get('btnDiagSpeedTest').removeAttribute('disabled');
        return;
    }

    // Upload Results
    var uploadResults = runStats['POST'];   
	//this probably was intended to be aveLineSpeed
    if (uploadResults.aveLineSpeed > 0)
    {
        // maxLineSpeed is in KBps - multiply by 8 to get Kbps and divide by 1000 (not 1024) to get Mbps
        var uploadLineSpeedinMbps = ((uploadResults.aveLineSpeed * 8) / 1000).toFixed(3);
        YUD.setStyle('uploadResultsLabel', 'display', 'block');
        document.getElementById('uploadResults').innerHTML = uploadLineSpeedinMbps + ' Mbps upload.';
    }
    else
    {
        document.getElementById('uploadResults').innerHTML = 'Error running upload tests...';
    }

    var downloadLineSpeedinKbps = downloadResults.aveLineSpeed * 8; //aveLineSpeed is measured in KBps

    var message = '';
    var messageClass = '';
    /*
     * if line speed is less than one then the ProbabilityWithinCapacity does not converge
     * and goes into an indefinite loop.
     */
    if (this._userInput != null && downloadResults.aveLineSpeed > 1)
    {
        var testingCapacityCalculator = new Util.Network.CapacityCalculator();
        var itemSize = (this._userInput.testInfo != null) ? this._userInput.testInfo.itemsize : 80;
        var responseTime = (this._userInput.testInfo != null) ? this._userInput.testInfo.responsetime : 30;
        var probability = testingCapacityCalculator.ProbabilityWithinCapacity(downloadLineSpeedinKbps / 1000, itemSize, this._userInput.numStudentsToTest, responseTime);

        var risk = testingCapacityCalculator.GetRisk();
        var recommendedCount = testingCapacityCalculator.GetRecommendedStudentCount();
        message = this._getMessage(risk, recommendedCount);

        if (risk == 'High' || risk == 'NearCertain')
        {
            messageClass = "speedBad";
        }
        else if (risk == 'Moderate')
        {
            messageClass = "speedOK";
        }
        else if (risk == 'VeryLow')
        {
            messageClass = "speedGreat";
        }
        
        YUD.setStyle('bandwidthSummaryLabel', 'display', 'block');
        document.getElementById('bandwidthSummary').innerHTML = message + disclaimer;
        document.getElementById('bandwidthSummary').className = messageClass;
    }
    
    YAHOO.util.Dom.get('btnDiagSpeedTest').removeAttribute('disabled');
};

Sections.Diagnostics.prototype._getMessage = function(risk, recommendedCount)
{
    recommendedCount = [recommendedCount]; // message get requires params to be array

    switch (risk)
    {
        case 'Unknown':
            return Messages.get('Diagnostics.Label.RiskUnknown', recommendedCount);
        case 'NearCertain':
            return Messages.get('Diagnostics.Label.RiskNearCertain', recommendedCount);
        case 'High':
            return Messages.get('Diagnostics.Label.RiskHigh', recommendedCount);
        case 'Moderate':
            return Messages.get('Diagnostics.Label.RiskModerate', recommendedCount);
        case 'VeryLow':
            return Messages.get('Diagnostics.Label.RiskVeryLow', recommendedCount);
    }
    return "";
};

// write preferences
Sections.Diagnostics.prototype.showPreferences = function()
{
    var preferenceDiv = YUD.getElementsByClassName('browserPreferences')[0];
    var preferenceRows = [];

    var addPreference = function(name)
    {
        var value = Mozilla.getPreference(name);
        var preferenceRow = '<p>' + name + ': <strong>' + value + '</strong></p>';
        preferenceRows.push(preferenceRow);
    };

    // add preferences of interest..
    var privileges = Mozilla.execPrivileged(function()
    {
        addPreference('signed.applets.codebase_principal_support');
        addPreference('accessibility.tabfocus');
        addPreference('accessibility.browsewithcaret');

        addPreference('network.http.max-connections');
        addPreference('network.http.max-connections-per-server');
        addPreference('network.http.max-persistent-connections-per-server');
        addPreference('network.http.pipelining');
        addPreference('network.http.pipelining.maxrequests');

        addPreference('network.dns.disableIPv6');
        addPreference('network.dns.CacheEntries');
        addPreference('network.dns.CacheExpiration');
    });

    // build html
    if (privileges)
    {
        preferenceDiv.innerHTML = '<span class="nugget">' + preferenceRows.join('') + '</span>';
    }
    else
    {
        // error
        preferenceDiv.innerHTML = '<p><span class="nugget">Error getting preferences: <strong>' + Mozilla._lastException + '</strong></span></p>';
    }

    // show html
    preferenceDiv.style.display = 'block';
};

Sections.Diagnostics.prototype.setBrowserInfo = function()
{
    if (TDS.BrowserInfo == null) return;

    // visible info
    YUD.get('lblDiagOSLabel').innerHTML = TDS.BrowserInfo.osLabel;
    YUD.get('lblDiagBrowserLabel').innerHTML = TDS.BrowserInfo.label;
    YUD.get('lblDiagBrowserSecure').innerHTML = TDS.BrowserInfo.isSecure;

    // hidden info
    YUD.get('lblDiagUAEl').innerHTML = TDS.BrowserInfo.userAgent;
    YUD.get('lblDiagOSName').innerHTML = TDS.BrowserInfo.osName;
    YUD.get('lblDiagOSVer').innerHTML = TDS.BrowserInfo.osVersion;
    YUD.get('lblDiagArch').innerHTML = TDS.BrowserInfo.architecture;
    YUD.get('lblDiagBrowserName').innerHTML = TDS.BrowserInfo.name;
    YUD.get('lblDiagBrowserVer').innerHTML = TDS.BrowserInfo.version;
};
