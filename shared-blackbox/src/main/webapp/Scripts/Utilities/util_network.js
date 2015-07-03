//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
﻿Util.Network = {};

//Utility to allow us to run bandwidth measurement tests and report aggregate data
Util.Network.BandWidthTester = function (config) {
    // Configuration properties
    this.sizeOfRequestinBytes = (typeof config.requestSizeinKiloBytes == 'number') ? config.requestSizeinKiloBytes * 1024 : 1; // in Bytes
    this.iterCount = (typeof config.numIterations == 'number') ? config.numIterations : 1;
    this.callBack = (typeof config.callBack == 'function') ? config.callBack : null;
    this.url = (typeof config.url == 'string') ? config.url : 'Pages/API/Diagnostics.axd?size=' + this.sizeOfRequestinBytes;
    this.alternateGETPOST = (typeof config.alternateGETPOST == 'boolean') ? config.alternateGETPOST : false;
    this.latencyOffsetinms = (typeof config.latencyOffsetinms == 'number') ? config.latencyOffsetinms : 0;
    this.downloadurl = (typeof config.downloadurl == 'string') ? config.downloadurl : this.url;
    this.sizeOfDownloadRequestinBytes = this.sizeOfRequestinBytes;
    this.sizeOfUploadRequestinBytes = 1000000;  // use a fix size file for upload test
    this.uploadurl = (typeof config.uploadurl == 'string') ? config.uploadurl : 'Pages/API/Diagnostics.axd?size=' + this.sizeOfUploadRequestinBytes; ;
    this.generateUploadData = (typeof config.generateUploadData == 'boolean') ? config.generateUploadData : false;
    this.callBackScope = (typeof config.callBackScope == 'object') ? config.callBackScope : this;

    // Current State
    this._currentStartTime = undefined;
    this._currentMode = 'GET';
    this._currenData = null;

    // Data collections
    this._modeStats = []; // stats for each mode; # of iterations, # of success, average line speed per mode
    this._modeStats['GET'] = { iterations: 0, successful: 0, aveLineSpeed: 0, aveTransactionTime: 0, minDelay: -1, maxDelay: -1, minLineSpeed: -1, maxLineSpeed: -1, rawResults: [] };
    this._modeStats['POST'] = { iterations: 0, successful: 0, aveLineSpeed: 0, aveTransactionTime: 0, minDelay: -1, maxDelay: -1, minLineSpeed: -1, maxLineSpeed: -1, rawResults: [] };

    this._YUIcallBack = { success: this._success, failure: this._failure, cache: false, scope: this };
};

// Main function. Call this to run the BW tests
Util.Network.BandWidthTester.prototype.run = function ()
{
    //Lets see if we are done and can report the result or need to continue
    var statsData = this._modeStats[this._currentMode];
    if (statsData.iterations > this.iterCount) {
        if (this.callBack != null) 
            this.callBack.call(this.callBackScope, this._modeStats);
        return;
    }

    // Reuse data obtained through a GET or build up your dummy data if config says so
    if (this.generateUploadData || this._currenData == null) {
        var tmpArray = [];
        for (var i = 0; i < this.sizeOfUploadRequestinBytes; i++) tmpArray.push('a');  
        this._currenData = tmpArray.join("");
    }       

    // We should run a GET or a POST   
    this._currentStartTime = (new Date()).getTime();
    if (this._currentMode == 'GET') {
        YAHOO.util.Connect.asyncRequest('GET', this.downloadurl, this._YUIcallBack, null);
    } else {
        if (this._currenData != null && this._currenData.length >= this.sizeOfUploadRequestinBytes) {
            YAHOO.util.Connect.asyncRequest('POST', this.uploadurl, this._YUIcallBack, this._currenData);
        } else {
            this._checkPoint(-1);
        }
    }
};

// Private Method: Called at each step to record data collected upto that point and determine next step
Util.Network.BandWidthTester.prototype._checkPoint = function(lineSpeed, transactionTime) {
    var statsData = this._modeStats[this._currentMode];
    statsData.iterations++;
    if (lineSpeed > 0) {
        statsData.successful++;
        // caclculate the average speed and transaction time
        statsData.aveLineSpeed = (statsData.aveLineSpeed * (statsData.iterations - 1) + lineSpeed) / statsData.iterations;
        statsData.aveTransactionTime = (statsData.aveTransactionTime * (statsData.iterations - 1) + transactionTime) / statsData.iterations;
        if (statsData.minLineSpeed < 0 || statsData.minLineSpeed > lineSpeed) statsData.minLineSpeed = lineSpeed;
        if (statsData.maxLineSpeed < 0 || statsData.maxLineSpeed < lineSpeed) statsData.maxLineSpeed = lineSpeed;

        if (typeof transactionTime == 'number') {
            if (statsData.minDelay < 0 || statsData.minDelay > transactionTime) statsData.minDelay = transactionTime;
            if (statsData.maxDelay < 0 || statsData.maxDelay < transactionTime) statsData.maxDelay = transactionTime;
        }
    }
    statsData.rawResults.push(lineSpeed);

    // Now to figure out what to do next.
    // switch mode if we have reached our max for that mode or if we should be alternating modes
    if (this.alternateGETPOST || (statsData.iterations > this.iterCount)) {
        this._currentMode = (this._currentMode == 'GET') ? 'POST' : 'GET';
    }

    //Lets see if we are done and can report the result or need to continue
    statsData = this._modeStats[this._currentMode];
    if (statsData.iterations >= this.iterCount) {
        if (this.callBack && typeof this.callBack == 'function') this.callBack.call(this.callBackScope, this._modeStats);
    } else {
        this.run();
    }
};

// YUI connect callbacks
Util.Network.BandWidthTester.prototype._success = function (o) {
    var endtime = (new Date()).getTime();
    var millitime = (endtime - this._currentStartTime) + this.latencyOffsetinms;
    var downloadtimeinSecs = millitime / 1000;
    var linespeed = 0;
    if (this._currentMode == 'GET') {
        linespeed = this.sizeOfDownloadRequestinBytes / 1000 / downloadtimeinSecs; // We are reporting in KiloByte per second. We divide by 1000 and not 1024
    } else if (this._currentMode == 'POST') {
        linespeed = this.sizeOfUploadRequestinBytes / 1000 / downloadtimeinSecs;
    }
    if (!this.generateUploadData) this._currenData = o.responseText;
    this._checkPoint(linespeed, millitime);
};
// YUI connect callbacks
Util.Network.BandWidthTester.prototype._failure = function(o) 
{
    this._checkPoint(-1);
};


Util.Network.CapacityCalculator = function(config)
{
    this._veryLow = .999;
    this._moderate = .85;
    this._high = .6;
    this._risk = 'Unknown';  //Unknown, VeryLow, Moderate, High, NearCertain
    this._probability = 0.0;
    this._recommendedNumber = -1;

};

Util.Network.CapacityCalculator.prototype.GetRisk = function()
{
    return this._risk;
};

Util.Network.CapacityCalculator.prototype.GetRecommendedStudentCount = function()
{
    return this._recommendedNumber;
};

Util.Network.CapacityCalculator.prototype.ProbabilityWithinCapacity = function(goodput, itemsize, students, responseTime)
{
    var maxItems = this._MaxItemsPerSecond(goodput, itemsize);
    this._probability = this._ProbabilityWithinCapacity_1(students, responseTime, maxItems);
    this._risk = this._CalculateRisk(students);

    switch (this._risk)
    {
    case 'High':
    case 'NearCertain':
        this._recommendedNumber = this._RecommendNumber(students, responseTime, maxItems);
        break;
    }
    return this._probability;
};

Util.Network.CapacityCalculator.prototype._MaxItemsPerSecond = function(goodput, itemSize)
{
    return goodput * 1000 / itemSize;
};

Util.Network.CapacityCalculator.prototype._ProbabilityWithinCapacity_1 = function(students, responseTime, maxItems)
{
    var probability=0.0;
    var max1 = Math.floor(maxItems);
    if (max1 > 0) probability = this._ProbabilityWithinCapacityPerSecond_1(students, responseTime, max1);
    else probability = this._ProbabilityBelowEquilibrium(students, responseTime, maxItems);
    return probability;
};

Util.Network.CapacityCalculator.prototype._ProbabilityWithinCapacityPerSecond_1 = function(students, respTime, maxItems)
{
   return Util.Statistics.poisson(maxItems, students / respTime);
};

Util.Network.CapacityCalculator.prototype._ProbabilityBelowEquilibrium = function(students, responseTime, maxItems)
{
    var equilibriumTime = 1.0 / maxItems;
    var meanResponses = equilibriumTime * students / responseTime;
    return Util.Statistics.poisson(1, meanResponses);
};


Util.Network.CapacityCalculator.prototype._CalculateRisk = function(students)
{
    if (this._probability == -1) this._risk = 'Unknown';
    if (students == 1) this._risk = 'Moderate';
    else if (this._probability < this._high) this._risk = 'NearCertain';
    else if (this._probability < this._moderate) this._risk = 'High';
    else if (this._probability < this._veryLow) this._risk = 'Moderate';
    else this._risk = 'VeryLow';

    return this._risk;
};

Util.Network.CapacityCalculator.prototype._RecommendNumber = function(students, responseTime, maxItems)
{
    var recommendation = students;
    var step = Math.ceil(.25 * students);
    var direction = -1;
    var lastRecommendation = students;

    var p = this._ProbabilityWithinCapacity_1(students, responseTime, maxItems);

    var dir = direction;
    while ((p > this._veryLow) || (p < this._moderate))
    {
        if (dir != direction) step = Math.max(1, Math.round(.5 * step));
        students = Math.max(1, students + dir * step);

        p = this._ProbabilityWithinCapacity_1(students, responseTime, maxItems);
        if (p > this._veryLow) dir = 1;
        else if (p < this._moderate) dir = -1;

    }
    this._recommendedNumber = students;
    return this._recommendedNumber;
};

Util.Network.AppletBandWidthTester = {
	bandwidthTestApplet: null,
	sectionDiagnosticsObject: null,
	currentRunConfig: null,
	/*
	 * callback needs to be an object as follows:
	 *{ owner: context, onSuccessCallbackFn: successCallBack, onFailureCallbackFn: failureCallBack, transactionId: uniqueNumber} 
	 */
	run: function(testConfig) {
	
		Util.Network.AppletBandWidthTester.bandwidthTestApplet.setDebugMode(testConfig.debugMode);
	    Util.Network.AppletBandWidthTester.bandwidthTestApplet.setPacketSize(testConfig.bufferSize);
        Util.Network.AppletBandWidthTester.bandwidthTestApplet.setTotalNumberOfSimultaneousConnections(testConfig.numberOfSimultaneousConnections);
        
        Util.Network.AppletBandWidthTester.currentRunConfig = testConfig;
		var wereTestsStarted = Util.Network.AppletBandWidthTester.bandwidthTestApplet.asynchronousNetworkAction(1, testConfig.applicationURL);
		
		if (!wereTestsStarted) {
		    //for whatever reason the tests could not be started.
		    var callbackFn = Util.Network.AppletBandWidthTester.currentRunConfig.onFailureCallbackFn;
			var callbackContext = Util.Network.AppletBandWidthTester.currentRunConfig.owner;
	    	callbackFn.call(callbackContext, 'TESTS_ALREADYRUNNING', "Bandwidth tests already running.");
		}
		return wereTestsStarted;
	}
};

/*
 * callback needs to be an object as follows:
 * { owner: context, ownerCallbackFn: onInitializedCallback}
 *  
 */
Util.Network.AppletBandWidthTester.init = function(diagnosticsSectionObject) {
	/*
     * we will insert the applet into the page.
     */
    var appletConfig =
    {
        id: 'BandwidthTestApplet',
        codebase: window.javaFolder + 'AIRBandwidthTester/',
        code: 'air/org/AIRBandwidthTest/NetworkApplet.class',
        archive: 'AIRBandwidthTestApplet.jar',
        callback: 'bandwidthTestAppletEventHandler'
    };

	Util.Network.AppletBandWidthTester.sectionDiagnosticsObject = diagnosticsSectionObject;
    Util.Frame.injectApplet('BandwidthTestApplet', appletConfig);
	return true;
};

/*
 * start: bandwidth test applet callback functions.
 */
function bandwidthTestAppletEventHandler(bandwidthTestApplet, event, data) {
	if (event == 'BandwidthTestAppletInited') {
		if (bandwidthTestApplet == null) return false;
		Util.Network.AppletBandWidthTester.bandwidthTestApplet = bandwidthTestApplet;
		Util.Network.AppletBandWidthTester.sectionDiagnosticsObject.setAppletSpeedTestClickHandler();
	}
	else if (event == 'AppletSpeedTestMeasurementsReady') {
		/* 
		 * the call NetworkTime.getAmortizedAverageTransferThroughput was causing issues on FF 3.5 on OS X
		 *
		var networkStatistics = Util.Network.AppletBandWidthTester.bandwidthTestApplet.getLastSetOfFullMeasurements();
        var downloadMeasurements = networkStatistics[0];
        var uploadMeasurements = networkStatistics[1];
        */
        var downloadMeasurements =  parseFloat(data[0]);
        var uploadMeasurements = parseFloat(data[1]);

        		
        var callbackFn = Util.Network.AppletBandWidthTester.currentRunConfig.onSuccessCallbackFn;
	    var callbackContext = Util.Network.AppletBandWidthTester.currentRunConfig.owner;
	        		
        callbackFn.call(callbackContext, downloadMeasurements, uploadMeasurements);
	}
};

/*
 * end: bandwidth test applet callback functions.
 */
        