//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
﻿if (typeof TDS != 'object') TDS = {};

// TODO:
// - https://github.com/tcorral/Hermes.js

TDS.Diagnostics = (function (TDS) {

    var loggers = [];
    var sendCount = 0;
    var sendLimit = 10;
    var signatures = {};
    var debugMode = false;

    var Kit;
    if (typeof window.CrashKit == 'object') {
        Kit = window.CrashKit;
    } else if (typeof window.TraceKit == 'object') {
        Kit = window.TraceKit;
    }

    function setDebugMode(enabled) {
        debugMode = enabled;
    }

    // register a logger that returns a string
    function registerLogger(fn) {
        loggers.push(fn);
    }

    // report an exception
    function report(ex, rethrow) {
        if (Kit) {
            if (typeof ex == 'string') {
                try {
                    throw new Error(ex);
                } catch (ex2) {
                    ex = ex2;
                }
            }
            try {
                Kit.report(ex);
                return;
            } catch (ex) {
                // ignore
            }
        }

        // rethrow original error (default behavior)
        if (typeof rethrow != 'boolean' || rethrow) {
            throw ex;
        }
    };

    // listen on a window object for uncought exceptions (onerror)
    function addErrorHandler(win) {
        if (Kit) {
            Kit.report.addErrorHandler(win);
        }
    };
    
    function getUrl(name) {
        return TDS.baseUrl + 'Pages/API/Global.axd/' + name;
    }

    function sendRequest(url, callback, data) {
        YAHOO.util.Connect.asyncRequest('POST', url, callback, data);
    }

    // log a message and optional details to the server to the server
    function logServerError(message, details, completed) {

        if (!message) {
            return;
        }

        try {
            message = encodeURIComponent(message);
            details = details ? encodeURIComponent(details) : '';

            var callback = {
                timeout: 30000
            };

            if (typeof completed == 'function') {
                callback.success = completed.bind(null, true);
                callback.failure = completed.bind(null, false);
            }

            var url = getUrl('LogError');
            sendRequest(url, callback, 'message=' + message + '&details=' + details);
        } catch (ex) {
            Util.log('logError failed: ' + ex.message);
        }
    };

    // get the debug log messages
    function getServerDebugDetails() {
        var details = 'TDS LOGS: ' + Util.getDebugLog();
        details += '\n\n';
        return details;
    };

    // send javascript log dump to the server, leave message empty to ask the user with prompt
    function logServerDebug(message) {
        message = message || '';
        var sendLog = function (message, showID) {
            var details = getServerDebugDetails();
            logServerError('JAVASCRIPT LOG DUMP: ' + message, details, showID);
        };
        sendLog(message, false);
    };

    // get exception summary as a string
    function getExceptionSummary(stackInfo) {

        // get error message
        var message = 'JS EXCEPTION: \n "' + stackInfo.message + '"';

        // if mode is not failed then there should be stack info for us to parse
        if (stackInfo.mode != 'failed') {
            try {
                var urlPieces = stackInfo.stack[0].url.split('/');
                var urlFile = urlPieces[urlPieces.length - 1];

                // shorten scripthandler url
                if (urlFile) {

                    if (urlFile.toLowerCase().indexOf('scripthandler.axd') != -1) {
                        urlFile = 'scripthandler';
                    } else {
                        // remove querystring
                        urlFile = urlFile.split('?')[0];
                    }

                }

                message += ' on line ' + stackInfo.stack[0].line + ' of the file ' + urlFile;
            } catch (e) {
                message += ' [error parsing stack]';
            }
        }
        return message;
    }

    var DIVIDER = '#####';

    function appendDivider(sb) {
        sb.appendLine(DIVIDER);
    }

    // write out registered loggers
    function appendLoggers(sb) {
        loggers.forEach(function (fn) {
            try {
                var logStr = fn();
                if (logStr) {
                    sb.appendLine();
                    sb.appendLine(logStr);
                    sb.appendLine();
                    sb.appendLine(DIVIDER);
                }
            } catch (ex) {
            }
        });
    }

    // get exception details as a string 
    function getExceptionDetails(stackInfo) {

        var details = new Util.StringBuilder();

        // write out stack trace
        if (stackInfo.stack && stackInfo.stack.length > 0 && stackInfo.Name != "failed") {
            stackInfo.stack.forEach(function (frame) {
                details.appendFormat("FUNCTION: '{0}' {1} ({2})", frame.func, frame.url, frame.line);
                details.appendLine();
                details.appendLine("CONTEXT:");
                if (frame.context && frame.context.length > 0) {
                    var row = 0;
                    frame.context.forEach(function (code) {
                        if (typeof code == 'string') {
                            if (code.length > 80) { // only 80 chars
                                code = code.substring(0, 80);
                            }
                            if (!Util.String.endsWith(code, '\n')) {
                                code += '\n';
                            }
                        }
                        details.appendFormat("{0}: {1}", ++row, code);
                    });
                }
                details.appendLine();
            });
        }

        // add loggers info
        appendDivider(details);
        appendLoggers(details);

        return details.toString();
    }

    // exception handler for crashkit stack info
    function globalExceptionHandler(stackInfo) {

        // check if the stack info exists and it has an error message
        if (!stackInfo || !stackInfo.message) {
            return;
        }

        // check if we should show alert
        if (debugMode) {
            var summary = getExceptionSummary(stackInfo);
            try {
                TDS.Dialog.showAlert(summary);
            } catch (e) {
                alert(summary);
            }
        }

        // check if we have already sent this error message (we only want unique errors)
        var stackHash = Util.String.hashCode(stackInfo.message);
        if (signatures[stackHash]) {
            return;
        }

        // up global count and check if we under limit
        sendCount++;
        if (sendCount > sendLimit) {
            return;
        }

        // track exception signature
        signatures[stackHash] = true;

        // get details
        var serverMessage = 'JS EXCEPTION: ' + stackInfo.message;
        var serverDetails;
        try {
            serverDetails = getExceptionDetails(stackInfo);
        } catch (ex) {
            serverDetails = 'JS PARSING ERROR: ' + ex.message;
        }

        // send to server
        logServerError(serverMessage, serverDetails);
        console.warn(serverDetails);
    };

    // initialize logging
    if (Kit) {

        Kit.report.subscribe(globalExceptionHandler);

        // check if tracekit
        if (typeof window.TraceKit == 'object' && window.TraceKit === Kit) {

            // HACK: Add function 'addErrorHandler' to TraceKit so we don't have to modify source
            var traceKitWindowOnError = window.onerror;
            Kit.report.addErrorHandler = function (win) {
                if (win) {
                    win.onerror = traceKitWindowOnError;
                }
            }

            // 2 lines before, the offending line, 2 lines after
            TraceKit.linesOfContext = 5;
        }

    }

    // check if we should show exceptions
    $(document).ready(function() {
        setDebugMode(TDS.Debug.showExceptions);
    });

    return {
        report: report,
        addErrorHandler: addErrorHandler,
        logServerError: logServerError,
        logServerDebug: logServerDebug,
        showError: setDebugMode.bind(null, true),
        registerLogger: registerLogger,
        appendDivider: appendDivider,
        appendLoggers: appendLoggers
    };

})(TDS);

