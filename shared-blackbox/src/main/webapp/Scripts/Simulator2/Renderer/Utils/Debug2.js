/****************************************
 * Debug Class Specification
 * Superclass: none 
 * NameSpace: Simulator.Utils
 ****************************************/
Simulator.Utils.Debug = function (sim) {
    
    var Count = 0;
    var debugOn = false;
    var prevSetting = false;
    var dLevel = 'SimWarning';
    var stackLevel = 2;

    var eventMgr = function () { return sim.getEventManager(); }
    var util = function() { return sim.getUtils(); };

    // Produces a time stamped debug statement
    this.tdebug = function (source, str1, appendCount, appendTime, str2) {
        if (typeof console != 'object') return;
        else if (debugOn) {
            var buff = [];
            if (source) {
                if(util().isFireFox()) {
                    var line = callerLine((new Error).stack.split("\n")[stackLevel]);
                    buff.push(source + ' line ' + line + ': ');
                }
                else buff.push(source + ': ');
            }
            buff.push(str1);
            if (appendCount) buff.push(Count++);
            if (appendTime) buff.push(getTime());
            if (str2) buff.push(str2);
            console.log(buff.join(' '));
        }
    };

    // Debug statement output conditioned on value of debugOn
    this.debug = function (source, str, obj, trace) {
        if (typeof console != 'object') return;
        var buff = [];
        if (debugOn) {
            if (source) {
                if(util().isFireFox()) {
                    var line = callerLine((new Error).stack.split("\n")[stackLevel]);
                    buff.push(source + ' line ' + line + ': ');
                }
                else buff.push(source + ': ');
            }
            buff.push(str);
            if (obj) buff.push(' = '); buff.push(obj); buff.push('\n\n');
            console.log(buff.join(''));
            if (trace == 'trace') {
                console.log('--- Program stack trace: ---\n');
                printStackTrace();
                console.log('\n--- End of program stack trace ---\n\n');
            }
        }
    };

    // Debug statement unconditionally displayed
    this.debugf = function (source, str, obj, trace) {
        if (typeof console != 'object') return;

        var buff = [];
        if (source) {
            if(util().isFireFox()) {
                var line = callerLine((new Error).stack.split("\n")[stackLevel]);
                buff.push(source + ' line ' + line + ': ');
            }
            else buff.push(source + ': ');
        }
        buff.push(str);
        if (obj) buff.push(' = '); buff.push(obj); buff.push('\n\n');
        console.log(buff.join(''));
        if (trace == 'trace') {
            console.log('--- Program stack trace: ---\n');
            printStackTrace();
            console.log('\n--- End of program stack trace ---\n\n');
        }
    };

    var iDest = 'console';

    this.setIDest = function (dest) {
        iDest = dest;
    };

    // Debug output destination dependent on iDest variable
    this.iDebug = function (source, str, obj, force) {
        if (typeof console != 'object') return;

        if (debugOn || force) {
            var buff = [];
            if (source) {
                if(util().isFireFox()) {
                    var line = callerLine((new Error).stack.split("\n")[stackLevel]);
                    buff.push(source + ' line ' + line + ': ');
                }
            }
            buff.push(str);
            if (obj) buff.push(' = '); buff.push(obj); buff.push('\n\n');
            if (iDest == 'screen') Simulator.showAlert('',buff.join(''));
            else console.log(buff.join(''));
        }
    };
    
    this.writeToConsole = function(str) {
        console.log(str);
    };


    this.inspectArray = function (source, name, theArray, doNotIinspectObjects, embedded, force) {
        if (typeof console != 'object') return;

        var buff = [];
        var sep = '\n\n';
        if (debugOn || force) {
            if (source) {
                if(util().isFireFox()) {
                    var line = callerLine((new Error).stack.split("\n")[stackLevel]);
                    buff.push(source + ' line ' + line + ': ');
                }
                else buff.push(source + ': ');
            }
            buff.push('Inspecting '); buff.push(name); buff.push(sep);
            if (theArray.length == 0) {    // could be an associative array
                for (var p in theArray) {
                    buff.push(name); buff.push('['); buff.push(p); buff.push('] = '); 
                    if(theArray[p].getSourceName) { buff.push(theArray[p].getSourceName()); buff.push(sep);}
                    else if(theArray[p].getName) { buff.push(theArray[p].getName()); buff.push(sep);}
                    else {buff.push(String(theArray[p])); buff.push(sep);}
                    if(!doNotIinspectObjects) if (theArray[p].inspect != undefined) buff.push(theArray[p].inspect(true));
                }
            } else {
                for (var i = 0; i < theArray.length; i++) {
                    buff.push(name); buff.push('['); buff.push(i); buff.push('] = '); 
                    if(theArray[i].getSourceName) {
                        buff.push(theArray[i].getSourceName()); buff.push(' ');
                    }
                    if(theArray[i].getName) {
                        buff.push(theArray[i].getName()); buff.push(sep);
                    }
                    else {
                        buff.push(theArray[i]); buff.push(sep);
                    }
                    buff.push('Inspecting '); buff.push(typeof theArray[i]); buff.push(sep);
                    if(!doNotIinspectObjects) if (theArray[i].inspect != undefined) buff.push(theArray[i].inspect(true));
                }
            }
            buff.push('End of inspection of '); buff.push(name); buff.push(sep);
            console.log(buff.join(''));
        }
    };

    // Sets the value of 'debugOn' which determines if a debug statement is displayed
    this.setDebug = function (flag) {
        prevSetting = debugOn;
        if(flag === 'on' || flag === true) debugOn = true;
        else debugOn = false;
    };

    this.setErrorReportLevel = function (level) {
        // levels are 'SimWarning', Sim'Error', and 'SimFatalError' and indicate the least serious level reported
        dLevel = (level == 'SimWarning' || level == 'SimError' || level == 'SimFatalError') ? level : 'SimError';
    };

    this.debugIsOn = function () {
        return debugOn;
    };

    this.resetDebug = function () {
        debugOn = prevSetting;
    };

    this.logWarning = function (source, str, notify, trace) {
        var trace = 'noTrace';  // default is to not display stack trace on warning
        if (trace) trace = 'trace';
        logMsg = true;
        if (dLevel == 'SimWarning') this.debugf(source, 'Warning: ' + str /*+ '. Browser: ' + getBrowserInfo(['name']), null, trace*/);  // Warning are not shown if dLevel == 'SimError' or 'SimFatalError'
        logMsg = false;
        if (notify) Simulator.showAlertWarning(str);
    };

    this.logError = function (source, str, notify, noTrace) {
        var noTrace = 'trace';  // default is to display stack trace on error
        if (noTrace) trace = 'noTrace';
        logMsg = true;
        if (dLevel != 'SimFatalError') this.debugf(source, '**** ERROR: ' + str /*+ '. Browser: ' + getBrowserInfo(['name']), null, trace*/);  // If dLevel == 'SimError' or 'SimWarning' we show the error
        logMsg = false;
        if (notify) Simulator.showAlert('**** ERROR: ' + str);
    };

    this.logFatalError = function (source, str) {
        logMsg = true;
        this.debugf(source, '!!!!!! FATAL ERROR: ' + str /*+ '. Browser: ' + getBrowserInfo(['name', 'major version', 'platform'], ', ') + ' !!!!!!', null, 'trace'*/);  // fatal errors are always shown and traced
        logMsg = false;
        eventMgr().postEvent(new Simulator.Event(this, 'info', 'fatalErrorOccurred', str));
        Simulator.showAlert('Fatal Error',str);
        //throw new Exception('Fatal Eror: Execution Terminating');
    };


    function AssertException(message) {
        this.message = message;
        AssertException.prototype.toString = function () {
            return 'AssertException: ' + this.message;
        };
    }

    this.assert = function (exp, message) {
        if (!exp) {
            throw new AssertException(message);
        }
    };

    function printStackTrace() {
        if (isFireFox()) console.trace();
        else if (isChrome()) {
            var obj = {};
            Error.captureStackTrace(obj, getStackTrace);
            console.log(obj);
        }
        else if (isInternetExplorer());
        else if (isSafari());
        else if (isOpera());
        else console.log('Unknown browser: ' + getBrowserInfo(['name']));
    }

    function callerLine(str) {
        var index = str.lastIndexOf(':');
        return str.substr(index + 1);
    };

};