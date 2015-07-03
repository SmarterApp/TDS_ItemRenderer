//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
CaretPositionUtils = {
    getCaretPosition: function (ctrl) {
	    var caretPos = 0;	// IE Support
	    if (document.selection) {
	    ctrl.focus ();
		    var Sel = document.selection.createRange ();
		    Sel.moveStart ('character', -ctrl.value.length);
		    caretPos = Sel.text.length;
	    }
	    // Firefox support
	    else if (ctrl.selectionStart || ctrl.selectionStart == '0') {
            // iOS6 <textarea> support: it's returning 0 every time when calling textarea.selectionStart
	        if (BrowserUtils.isIOS() && BrowserUtils.getIOSVersion() < 7 && ctrl.nodeName.toLowerCase() == 'textarea') {
	            ctrl.select();  // select() will focus to the textare and select everything inside it
	        }
	        caretPos = ctrl.selectionStart;
	    }
	    return (caretPos);
    },

    setCaretPosition: function (ctrl, pos){
	    if(ctrl.setSelectionRange)
	    {
		    ctrl.focus();
		    ctrl.setSelectionRange(pos, pos);
		    CaretPositionUtils.preventOnscreenKB(ctrl);
	    }
	    else if (ctrl.createTextRange) {
		    var range = ctrl.createTextRange();
		    range.collapse(true);
		    range.moveEnd('character', pos);
		    range.moveStart('character', pos);
		    range.select();
	    }
    },

    applyDeleteKeyPress: function(inputarea)
    {
        var currentPosition = CaretPositionUtils.getCaretPosition(inputarea);
        var value = inputarea.value;
        if (value.length > 0 && currentPosition < value.length)
        {
            var newValue = "";
            if (currentPosition > 0)
                newValue = value.substring(0, currentPosition);
            if (currentPosition + 1 < value.length)        
                newValue = newValue + value.substring(currentPosition + 1);    
            inputarea.value = newValue;
            CaretPositionUtils.setCaretPosition(inputarea, currentPosition);
        }
    },
    
    applyBackspaceKeyPress: function(inputarea)
    {
        var currentPosition = CaretPositionUtils.getCaretPosition(inputarea);
        var value = inputarea.value;
        if (value.length > 0 && currentPosition > 0)
        {
            var newValue = "";
            if (currentPosition > 1)
                newValue = value.substring(0, currentPosition - 1);
            if (currentPosition + 1 <= value.length)
                newValue = newValue + value.substring(currentPosition);    
            inputarea.value = newValue;
            CaretPositionUtils.setCaretPosition(inputarea, currentPosition - 1);
        }
    },
    
    insertCharacter: function(inputarea, newChar)
    {
        var currentPosition = CaretPositionUtils.getCaretPosition(inputarea);
        var value = inputarea.value;

        // for mobile browsers, the input area is "readonly", so we do not actually need any INSERT other than attaching it to the end of current string
        if (value.length > 0 && currentPosition < value.length && !BrowserUtils.isTouchBrowser()) {
            var newValue = "";
            if (currentPosition > 0) {
                newValue = value.substring(0, currentPosition);
            }
            newValue = newValue + newChar;
            newValue = newValue + value.substring(currentPosition);    
            inputarea.value = newValue;
            CaretPositionUtils.setCaretPosition(inputarea, currentPosition + newChar.length);
        }
        else {
            inputarea.value = inputarea.value + newChar;
            CaretPositionUtils.setCaretPosition(inputarea, currentPosition + newChar.length);
        }
    },

    preventOnscreenKB: function (inputarea, e) {
        if (BrowserUtils.isTouchBrowser()) {
            var inputLen = inputarea.value.length;
            if (BrowserUtils.isAndroidNativeBrowser()) {
                // blur the input area, needed for native browser on lower version (lower than 4.4, SB based on)
                FocusUtils.setCalcFocus(inputarea, e);
            }  
            inputarea.setSelectionRange(inputLen, inputLen);    // set caret to the rear of input string
        }
    }
    
};

SanitizeUtils = {
    isSanitizeNegativeSet: function ()
    {
        return true;
    },
    
    sanitizeNegative: function (inputString)
    {
        if (!SanitizeUtils.isSanitizeNegativeSet())
            return inputString;
        if (inputString == null || inputString.length == 0)
            return "";
        inputString = inputString.replace(new RegExp('--', 'g'), '+');
        inputString = inputString.replace(new RegExp('\\+-', 'g'), '-');
        return inputString;
    }
};

/*
 */
BrowserUtils = {
    uaString: navigator.userAgent,
    isTouchBrowser: function() {
        /*
         * we just look for the ontouchstart object in window to figure out 
         * if the browser supports touch. in the future we may try to have a better
         * way of checking if the event is a touch event.
         */
        if ("ontouchstart" in window) return true;
        return false;
    },

    isChromeOS: function() {
        if (this.uaString.indexOf('CrOS') > -1) return true;
        return false;
    },
    
    isAndroid: function() {
        if (this.uaString.toLowerCase().indexOf('android') > -1) return true;
        return false;
    },

    isIOS: function() {
        if (this.getIOSVersion() > 0) return true;
        return false;
    },

    getIOSVersion: function() {
        return YAHOO.env.ua.ios;
    },

    getAndroidVersion: function () {
        var match = this.uaString.match(/Android\s([0-9\.]*)/);
        return match ? match[1] : false;
    },

    isAndroidNativeBrowser: function () {
        if (parseFloat(this.getAndroidVersion()) < 4.4) return true;
        return false;
    },

    isIE: function() {
        if (YAHOO.env.ua.ie > 0 || this.uaString.indexOf('Trident') > -1) return true;    // using Trident to detect IE 11, since the yahoo-dom-event.js in calculator is YUI 2, which could not detect IE 11
        return false;
    }
};

FocusUtils = {
    setCalcFocus: function (inputArea, e) {
        /*
        * if it is a touch tablet we do not want the keyboard to pop up everytime a button is pressed.
        */
        if (BrowserUtils.isTouchBrowser()) {
            inputArea.blur();
            // focus on button tapped
            if (e) {
                var eventTarget;
                if (typeof (e) == 'object') {
                    eventTarget = YAHOO.util.Event.getTarget(e);
                } else {
                    eventTarget = document.getElementById(e);
                }
                eventTarget.focus();
            }
        } else {
            if (inputArea) {
                // Fix for https://bugz.airws.org/default.asp?22198
                inputArea.focus();
            }
        }
    }
};

//fix precision issues limit 'l' after dot
PreciseUtils = {
    setResultPrecision: function (number, l) {
        return parseFloat(number.toFixed(l));        
    },

    /* check if the fractional part of the floating number is within the restriction length
     *@input: input field
     *@s: new input string
     */
    validatedInputFractionalPartLen: function (input, s) {

        // return true if there is no need to check fractionalPartLen, which means current calculator instance does not have config of that.
        if (!getWorkingCalcInstance().config.fractionalPartLen) {
            return true;
        }

        var value = input.value,
            curPos = CaretPositionUtils.getCaretPosition(input), // position of newly input
            decimalPos = value.indexOf('.'),        // position of decimal point, -1 means do not have to worry about it
            fpLen = getMaxFractionalPartLen(input); // pre-config maximum length for fractional part, null/undefined means not specified

        if (fpLen && decimalPos > -1) {             // maximum length of fractional part for this input field is specified and the current value is a float number 
            if (decimalPos < curPos && value.split('.')[1].length == fpLen) {   // input on the fractional part and current fractional part length equals to the maximum length of it
                return false;
            }
        } else if (fpLen && decimalPos == -1 && s == '.') {    // newly input value is decimal, check the length after it's position
            if (value.length - curPos > fpLen) {    // digits after decimal larger than maximum length
                return false;
            }
        }
        return true;
    }
};

/**event functions to stop bubbling and cancling click event
  *fixing: https://bugz.airws.org/default.asp?69024
  */
EventUtils = {
    
    stopPropagation: function (e) {
        if (e.stopPropagation) {
            e.stopPropagation();
        } else {
            e.cancelBubble = true;
        }
    },
    preventDefault: function (e) {
        if (e.preventDefault) {
            e.preventDefault();
        } else {
            e.returnValue = false;
        }
    }
};

/*
* returns an object with the parameter keys as attributes and their values as the attribute value.
*/
function getQueryStringParams(url) {

    var indexOfQuestion = url.indexOf("?");
    if (indexOfQuestion >= 0) {
        url = url.substr(indexOfQuestion + 1);
    }

    var urlParams = {};

    var keyValuePairs = url.split('&');
    for (var i = 0; i < keyValuePairs.length; ++i) {
        var tuple = keyValuePairs[i].split('=');
        var key = tuple[0];
        var value = unescape(tuple[1]);
        urlParams[key] = value;
    }
    return urlParams;
}  

//example of an excellent calculator: http://www.calculateforfree.com/sci3.html
//TDS calculator main class
function TDS_Calc() 
{
    // custom event for when a calculator changes modes (eg from Scientific to Graphing)
    this.CalcModeChange = new YAHOO.util.CustomEvent("onCalcModeChange", this);
    
    //function lists that 
    this.FuncNames = ['sqrt', 'sin', 'asin', 'cos', 'acos', 'tan', 'atan', 'pow', 'fact', 'int', 'exp', 'log', 'ln', 'abs'];
    
    //This object stores current shortcut key position
    this.keyboardNav = {curRegion:'', RegionIndex:0, curElement:''};

    //get url query parameters.
    var urlQueryParams = getQueryStringParams(location.href);
    
    //Validate the input
    var errorCode = validateCalcList(getCalcList(urlQueryParams));
    if (errorCode != 1) {
        document.getElementById('calculatorwidget').setAttribute('style', 'display:none');    
        if (document.getElementById('errorDiv') != null) {                        
            document.getElementById('errorDiv').innerHTML = 'Error initializing calculator.Please notify your TA. [Message code: '+errorCode+'].';
            document.getElementById('errorDiv').setAttribute('style', 'display:block');
        }
        return;  // We have to abort. We dont know what calculator to show
    }
    // Show the calculator now on IE. IE does not like focus going to things that are not visible
    if (BrowserDetect.browser == 'Explorer') 
    {
        document.getElementById('calculatorwidget').setAttribute('style', 'display:block');
    }

    //add client style path
    addClientStyleToBody(urlQueryParams);

    //get calc configurations based on calc modes from query string
    this.calcConfigs = this.getCalcConfigs(getCalcList(urlQueryParams));
    //create calc for each config
    this.calcList = this.createCalcs(this.calcConfigs);
    
    //reference to currenting working calc instance
    this.workingCalc;

    //initialization of TDS calc
    this.init(); 
    
    /* calc should be ready to go;
    	 check for external listener
    */
    if (typeof parent.onCalcReady === "function")
    {
    	parent.onCalcReady(this);
    }
    
    //set the first calc mode in query string as current
    this.setCalc(this.calcList[0]);

    // Show the calculator now (for all other browsers)
    if (BrowserDetect.browser != 'Explorer') 
    {
        document.getElementById('calculatorwidget').setAttribute('style', 'display:block');
    }
    
    // return a list of calc modes from query string
    function getCalcList(urlQueryParams) 
    {     
        var calcs = [];
        if (urlQueryParams.mode) {
            var modes = urlQueryParams.mode.split(',');
            for (var i = 0; i < modes.length; i++) {
                calcs.push(modes[i]);
            }
        }
        return calcs;
    }

    function validateCalcList(calcs) {
        if (calcs.length == 0) return 10001;   // we must have atleast 1 more for the calculator
        for (var i = 0; i < calcs.length; i++) {
            if (CalcModeList[calcs[i]] != calcs[i]) return 10002; //we have received a mode that we dont know
        }
        return 1;
    }

    function addClientStyleToBody(urlQueryParams) {
        if (urlQueryParams.clientStylePath) {
            //add a class "client_<ClientStylePath>" to body.
            var clientStyleClass = "client_" + urlQueryParams.clientStylePath;
            YAHOO.util.Dom.addClass(document.body, clientStyleClass);
        }
    }
}



//get detailed configurations for each individual calc
TDS_Calc.prototype.getCalcConfigs =  function(calcList) 
{
    var configs = [];
    for (var i=0; i<calcList.length; i++) {
        var config = getCalcConfig(calcList[i]);
        if (config!= null) {
            configs.push(config); 
        }
    }
    return configs;
    
    function getCalcConfig(calc)
    {
        for (var i=0; i<CalcConfigBase.length; i++) {
            if (calc == CalcConfigBase[i].name) return CalcConfigBase[i];
        }
        return null;
    };
}

/* set a calc mode 
    calc: individual calc instance
*/
TDS_Calc.prototype.setCalc = function(calc)
{
		// pass in data to subscribed event (calc being switched from and calc being switched to)
		// this event is meant to pass data to external source (eg parent container if inside iframe)
		var oldCalc = (this.workingCalc) ? this.workingCalc : null;
		var newCalc = calc;
		this.CalcModeChange.fire(oldCalc, newCalc);
		
		//set cooresponding css class
    var headDiv = document.getElementById('calculatorwidget');
    for (var i=0; i<this.calcConfigs.length; i++) {
        if (YAHOO.util.Dom.hasClass(headDiv, this.calcConfigs[i].css)) YAHOO.util.Dom.removeClass(headDiv, this.calcConfigs[i].css); 
    }
    YAHOO.util.Dom.addClass(headDiv, calc.config.css);

    this.workingCalc = calc.instance; 
    this.workingCalc.setInitKeyboardElement();
    this.workingCalc.setFocus();

    //text input is shared, and need to be cleared when switching calc mode. 
    //Needs to be done here instead of init function, which is called only once.
    document.getElementById('textinput').value = '';
    if (this.workingCalc.setTextInput) this.workingCalc.setTextInput();
    
    // loop through and clear all .active styles
    // set (e.id).className to '.active'
    for (var i = 0; i < document.getElementById("calcSwitch").getElementsByTagName("a").length; i++)
    {
    	var calcBtn = document.getElementById("calcSwitch").getElementsByTagName("a")[i];
    	if (calcBtn.id.toLowerCase() == calc.config.displayName.toLowerCase()) {
    		YAHOO.util.Dom.addClass(calcBtn, "active");
    	}
    	else {
    		YAHOO.util.Dom.removeClass(calcBtn, "active");
    	}
    }
}


/* Instantiate individual calcs 
    configs: list of calc configs
*/
TDS_Calc.prototype.createCalcs = function(configs)
{
    // before creating calcs, set short cut regions elements
    for (var i=0; i<this.calcConfigs.length; i++)
    {
        this.calcConfigs[i].shortcutInitFunc(this.calcConfigs[i].name, this.calcConfigs[i].keyboardRegionDivs);
    }

    var calcList = [];
    for (var i=0; i<configs.length; i++)
    {
        //calcList.push({name:configs[i].name, config:configs[i], instance:this.createCalc(configs[i])});
        calcList.push({config:configs[i], instance:this.createCalc(configs[i])});
    }
    return calcList;
}

/* Instantiate an individual calc
    config: a calc config
*/
TDS_Calc.prototype.createCalc = function(config)
{
    switch (config.type) {
        case CalcType.arithmetic: 
            return (new ArithmeticCalc(config, this));
            break;
        case CalcType.graphing: 
            return (new GraphingCalc(config, this));
            break;                
        case CalcType.regression:
            return (new RegressionCalc(config, this));
            break;
        case CalcType.linearalgebra:
            return (new LinearalgebraCalc(config, this));
            break;                
    }
}

/* evaluate a given expression 
    expression: user friendly expression string
*/
TDS_Calc.prototype.evalExpression = function(expression)
{
	var mod_calc;
    if (expression) mod_calc = this.translate_input(expression);
    else return 'No expression';
	
	if (mod_calc == '') return 'Express Error';
	
    try{
	    var calc_result = eval(mod_calc);
		if (calc_result != undefined) {
		    if ((calc_result == Infinity)||(calc_result == -Infinity)||(calc_result+'' == 'NaN' )) return (ExpressErrorMsg);
		    calc_result = this.processE(calc_result);
		    return calc_result;
		}
	} catch(ex){
		return (ExpressErrorMsg);
	}
    return (ExpressErrorMsg);
}

//Process precision and "e" of the result 
TDS_Calc.prototype.processE = function(result) 
{
    var savedRst = result;
    try {
        var frst = parseFloat(result);
		result = parseFloat(frst.toFixed(10));
    } catch (e) {
        result = savedRst;
    }

    if (Math.abs(Math.round(result) - result) < 1e-8) result = Math.round(result);
    var rst = result + '';
    var pos = rst.indexOf('e');
    if (pos == -1) return result;
    
    try {
        var num = parseFloat(rst.substring(0,pos));
        var rt = Math.round(num * 1000)/1000 + rst.substring(pos);
    } catch (e) {
        return result;
    }
    return rt;
}

/* Eavaluate expression with variable x at x=xVal 
    expression: expression that contains variable x
    xVal: a x value
*/
TDS_Calc.prototype.evalVariableExpression = function(expression, xVal) 
{
    //because function "exp()" contains x, we need to change it before we replace x with xVal
    var ep = expression.replace(new RegExp('exp', 'g'), 'bbb');
    ep = this.translate_input(ep.replace(new RegExp('[x]', 'g'), '(' + xVal +')' )) + '';
    ep = ep.replace(new RegExp('bbb', 'g'), 'exp');
    var rst = this.evalExpression(ep);
    return rst;
}

/* This function translates user-friendly input to JS compatiable expression
    expStr: a user friendly expression string
*/

TDS_Calc.prototype.translate_input = function(expStr) 
{
    if ((expStr == null) || (expStr == '')) return '';
    var inputStr;
    
    if (expStr) inputStr = expStr.replace(/^\s*|\s*$/g,'');

    //convert sin-1 to asin, for inverse trigonometric function
    inputStr = this.translate_invtrig(inputStr);

    // convert \u2010 to the minus symbol
    inputStr = this.translate_negative(inputStr);
    
    inputStr = SanitizeUtils.sanitizeNegative(inputStr);
    
    //if there is a missing bracket, add at the end
    inputStr = this.addMissingBrackets(inputStr);
    //2^3 -> pow(2,3)
    inputStr = this.translate_pow(inputStr);
    //3! -> fact(3)
    inputStr = this.translate_fact(inputStr);
    //square root: sqrt(4)
    inputStr = this.translate_sqrt(inputStr);
    //π -> PI
    inputStr = this.translate_pi(inputStr);
    //add missing multiplier: 5(6+4)->5*(6+4), 5sin(2) -> 5*sin(2)
    inputStr = this.addMissingMultiplier(inputStr);
    //hand specail cases. For example, 0^0 is considered an error
    inputStr = this.otherInputErrors(inputStr);


    if (inputStr.indexOf('Error')!=-1) return ExpressErrorMsg;
    return inputStr;
}

// \u2010 is the smaller minus sign; to indicate 'negative'
/*
 * @param e: the event in the caller which caused this flip_sign call to be made. 
 */
TDS_Calc.prototype.flip_sign = function (e) {
    var inputarea = getWorkingCalcInstance().getInputArea();
    if (inputarea == null) return;
    
    var value = inputarea.value;
    if (value && (value.length > 0) && value != ExpressErrorMsg) {
        // make sure the only character isn't a negative symbol
        if (value == "\u2010") {
            inputarea.value = "";
            CaretPositionUtils.setCaretPosition(inputarea, 0);
            //now lets make a call to fix focus if this is a touch device.
            FocusUtils.setCalcFocus(inputarea, e);
            return;
        }

        var validSymbols = "(/*-+√^"; // valid symbols to append to are: ( / * - + √ ^

        // move backwards until we find either a negative symbol or a number
        // charAt will check in front of the caret position as we move backwards
        var cPos = CaretPositionUtils.getCaretPosition(inputarea);
        for (var i = (cPos > 0 ? cPos - 1 : cPos); i >= 0; i--) {
            var chr = value.charAt(i);
            if (chr) {

                if (i > 0) {

                    if (parseFloat(chr) == parseInt(chr)) continue;

                    // check if it's a valid symbol
                    if (validSymbols.indexOf(chr) != -1) {
                        var _lead, _trail;
                        if (i < value.length) {

                            // make sure next char isn't already a negative symbol
                            if (value.charAt(i + 1) == "\u2010") {
                                _lead = value.substring(0, i + 1);
                                _trail = value.substring(i + 2);
                                inputarea.value = _lead + _trail;
                            }
                            else {
                                _lead = value.substring(0, i + 1);
                                _trail = value.substring(i + 1);
                                inputarea.value = _lead + "\u2010" + _trail;
                            }
                            break;
                        }
                        else {
                            _lead = value.substring(0, i);
                            _trail = "";
                        }
                        inputarea.value = _lead + "\u2010" + _trail;
                        break;
                    }

                }
                else {
                    if (chr == "\u2010") {
                        inputarea.value = value.substring(1);
                    }
                    else {
                        /*
                        * we are looking at the very first character of the input area.
                        * if it is not a number e.g. ( or SQRT then putting the "-" before that symbol does
                        * not make sense. if on the other hand the very first character is a number then we do want 
                        * to have the "-" before it. right now we only need to be cognizant of 
                        * the characters in validSymbols above.
                        */
                        if (validSymbols.indexOf(chr) == -1)
                            inputarea.value = "\u2010" + value;
                        else
                            inputarea.value = value + "\u2010";
                    }
                    break;
                }

            }
        }
    }
    else {
        // nothing exists in the textbox; insert negative symbol
        inputarea.value = "\u2010";
    }

    CaretPositionUtils.setCaretPosition(inputarea, inputarea.value.length);
    //now lets make a call to fix focus if this is a touch device.
    FocusUtils.setCalcFocus(inputarea, e);
}

function getWorkingCalcInstance()
{
    if (typeof tdscalc != 'undefined' && tdscalc != null ) return tdscalc.workingCalc;
    return null;
}

function getTDSCalc()
{
    return tdscalc;
}

function resetTDSCalc() 
{
    var tdsCalc = getTDSCalc();
    if (tdsCalc != null && tdsCalc.calcList != null) {
        for (var i = 0; i < tdsCalc.calcList.length; i++) {
            var calcInstance = tdsCalc.calcList[i].instance;
            if (calcInstance != null && typeof calcInstance.reset == 'function') {
                calcInstance.reset();
            }
        }
        // If this is a multi-mode calculator, we need to set the mode back to the first calc in the list
        tdsCalc.setCalc(tdsCalc.calcList[0]);        
    }
}

var ExpressErrorMsg = 'Expression error';

var PI = Math.PI;

//we will assume anything less than this is essentially 0.
//to do: figure out this value.
var MINORDIFF = 0.00000001;
function exp(x){return Math.exp(x);}
function ln(x){return Math.log(x);}

function abs(x){return Math.abs(x);}
function log(x) { return Math.log(x) / Math.log(10); }
function pow(x,y){return Math.pow(x,y);}
function sqrt(x){return Math.sqrt(x);}
function fact(x){return factorial(x);}
function tan(x){

    var radiansX = get_RadiansValue(x);
    //we will need to check that this value should not be equal to k * PI + PI/2
    var absRadiansX = Math.abs(radiansX);
    absRadiansX = absRadiansX - PI/2;
    if (absRadiansX >= 0)
    {
        if (absRadiansX < MINORDIFF)
        {
            return NaN;
        }
        var k = absRadiansX / PI;
        if (k - Math.floor(k) < MINORDIFF)
            return NaN;
    }
    return Math.tan(radiansX);
}

function sin(x){return Math.sin(get_RadiansValue(x));}
function cos(x) { return Math.cos(get_RadiansValue(x)); }

//fixing https://bugz.airast.org/default.asp?85287#429925 adding arcsin arccos arctan

function asin(x) { return get_DegreesValue(Math.asin(x)); }
function acos(x) { return get_DegreesValue(Math.acos(x)); }
function atan(x) { return get_DegreesValue(Math.atan(x)); }

function factorial(n) {    
    if ((n < 0 || n > 100) || isNaN(n))  // this should catch cases like 1000!!
        return NaN; 
    var result = 1;
    for (var i = 2; i <= n; i++) {
        result *= i;
    }
    return result;
};


/*  convert value to Radian value
    v: value 
*/
function get_RadiansValue(v) {

    //graphing always use radians; removing for https://bugz.airast.org/default.asp?91322#473590
    //if (getCurCalcMode() == CalcModeList['Graphing'] || getCurCalcMode() == CalcModeList['GraphingInv']) return v;
    //already Radian, just return
    if (document.getElementById('radians').checked) return v;
    //convert degree to Radians
    return v*PI/180; 
    
}

/*  convert value to Degree value
    v: value 
*/
function get_DegreesValue(v) {
    
    //graphing always use radians; removing for https://bugz.airast.org/default.asp?91322#473590
    //if (getCurCalcMode() == CalcModeList['Graphing'] || getCurCalcMode() == CalcModeList['GraphingInv']) return v;
    //already Radian, just return
    if (document.getElementById('radians').checked) return v;
    //convert Radians to Degrees
    return v * 180 / PI;
    
}

function degreeRadianKeyPress(item, e)
{
    /*
     * I had written this code to handle up, down, left and right arrow key presses. but 
     * it did not seem to work and then I discovered that I was doing a mistake in handling the use case related
     * spacebar. 
     *
    if ("id" in item)
	{
        var id = item.id;
        var newid = null;
        if (id == 'degrees')
            newid = 'radians';
        else if (id == 'radians')
            newid = 'degrees';
        if (newid != null)
        {
            var toggleAngle = function(itemid)
            {
                
                var item = document.getElementById(itemid);
                if (item != null && "checked" in item)
                {
                    var isChecked = item.checked;
                    if (isChecked)
                        item.checked = false;
                    else
                        item.checked = true;
                }
            };
            
            if (e.which == 0)
            {
                if (e.keyCode == 32)
                {
                    //space bar and hence we would need to select new one or toggle existing.
                    toggleAngle('degrees');
                    toggleAngle('radians');
                    return false;
                }
                //
                ////left and right and up and down
	            //else if (((e.keyCode == 37)|| (e.keyCode == 39) || (e.keyCode == 39) || (e.keyCode == 40))) {
            	//    
	            //    return false; 
	            //}
                //
            }
	        if (e.keyCode) code = e.keyCode;
	        else if (e.which) {
	            code = e.which;
	        }
	    }
	}
    */
	return true;
}


// function that switch angle mode
function angle_mode(angleType) {
    document.getElementById("degrees").checked = false;
    document.getElementById("radians").checked = false;
    document.getElementById(angleType).checked = true;
    //angleType = type;
}

/* Initilization of focus of text input fields called by inidivual calc that pass inputIds
    inputIds: list of id of text input field. 
*/
TDS_Calc.prototype.textInputFocusInit = function(inputIds) {
    for (var i = 0; i < inputIds.length; i++) {
        var el = document.getElementById(inputIds[i]);
        if (el != null) {

            // if on touch devices, set all input area to readonly, to avoid on screen keyboard popup
            if (BrowserUtils.isTouchBrowser()) {
                el.setAttribute('readonly', 'readonly');

                // if there is a default value in the input, then move caret to the end of the value string
                var elength = el.value.length;
                if (elength != 0) {
                    el.setSelectionRange(elength, elength);
                }

                // when click on the 'readonly' inputs, blur it 
                YAHOO.util.Event.on(el, 'click', function () {
                    CaretPositionUtils.preventOnscreenKB(this);
                });
            }

            YAHOO.util.Event.on(el, 'keypress', function(e) {
                if (!CalcKeyPressProcess(this, e)) {
                    YAHOO.util.Event.stopEvent(e);
                }
            });

            //webkit browsers (chrome and safari) is listening to keydown event for backspace/delete key, bug:https://bugz.airast.org/default.asp?163435#938541
            if (YAHOO.env.ua.webkit) {
                YAHOO.util.Event.on(el, 'keydown', function (e) {
                    // for navi keyboard shortcut combination (see short.add()), allow the event listener
                    var code = e.keyCode;
                    if ((e.ctrlKey || e.shiftKey) && (code == 37 || code == 38 || code == 39 || code == 40)) {
                        return;
                    }
                    if (!CalcKeyPressProcess(this, e)) {
                        YAHOO.util.Event.stopEvent(e);
                    }
                });
            }

            //el.focusId = inputIds[i];
            el.focused = false;
            el.hasFocus = function() {
                return this.focused;
            };
            YAHOO.util.Event.on(inputIds[i], "focusin", function(e) {
                for (var j = 0; j < inputIds.length; j++)
                    document.getElementById(inputIds[j]).focused = false;
                this.focused = true;
                //setCurRegionElementById('input', this.focusId);
                var id = (e.target != null) ? e.target.id : e.srcElement.id;
                setCurRegionElementById('input', id);
            }, this, true);
        }
    }
}

//calc mode switch buttons for multi-mode calc
var SwitchButtonMap = [];
SwitchButtonMap.push({id: CalcModeList['Matrices'], func: switchCalc});
SwitchButtonMap.push({id: CalcModeList['Regression'], func: switchCalc});
SwitchButtonMap.push({ id: CalcModeList['Scientific'], func: switchCalc });
SwitchButtonMap.push({ id: CalcModeList['ScientificInv'], func: switchCalc });
SwitchButtonMap.push({ id: CalcModeList['Graphing'], func: switchCalc });
SwitchButtonMap.push({ id: CalcModeList['GraphingInv'], func: switchCalc });

//clear input buttons
var ClearInputButtonMap = [];
ClearInputButtonMap.push({id:'backspace', func: calcClearInput});
ClearInputButtonMap.push({id:'C', func: calcClearInput});
ClearInputButtonMap.push({id:'CE', func: calcClearInput});

/* clear text input. Delegated to individual calc that actually does the work 
    e: click event or id using keyboard
*/
function calcClearInput(e) {
    var id;
    if (typeof(e) == 'object') 
    {
        var target = YAHOO.util.Event.getTarget(e);
        id = target.id;
    } else id = e;
    getWorkingCalcInstance().clearInput(id);
}

/*
* remove all remaining 'focused' class name to fix https://bugz.airast.org/default.asp?90253#465256
* divRegion: array with all keyboard shortcut 'blocks'
*/
function clearFocus(divRegion) {
    for (var i = 0; i < divRegion.length; i++) {
        var divObj = document.getElementById(divRegion[i]);
        if (YAHOO.util.Dom.hasClass(divObj, 'focused')) YAHOO.util.Dom.removeClass(divObj, 'focused');
    }
}


/* switch calc mode for multi-mode calc
    e: mouse click event or id if using keyboard
*/

function switchCalc(e)
{   
    var id;
    if (typeof(e) == 'object')
    {
        var target = YAHOO.util.Event.getTarget(e);
        id = target.id;
    } else id = e;
    var calc,
        workingCalc = getTDSCalc().workingCalc;

    //if current calculator instance do have a radianOrDegree value(graphing, scientific), record the current value for future restore use.
    if (workingCalc.radianOrDegree) {
         workingCalc.setRadianOrDegree(getRadioButtonValue());
     }

    switch (id)
    {
        case CalcModeList['Matrices']:
            calc = getCalcByType(CalcType.linearalgebra);
            break;
        case CalcModeList['Regression']:
            calc = getCalcByType(CalcType.regression);
            break;
        case CalcModeList['Graphing']:
            calc = getCalcByType(CalcType.graphing);
            break;
        case CalcModeList['GraphingInv']:
            calc = getCalcByType(CalcType.graphing);
            break;
        case CalcModeList['ScientificInv']:
            calc = getCalcByType(CalcType.arithmetic);
            break;
        default:
            calc = getCalcByType(CalcType.arithmetic);
            break;

    }
    if(getWorkingCalcInstance() != calc.instance)
    {
	    getTDSCalc().setCalc(calc);
    }

    var newWorkingCalc = getTDSCalc().workingCalc;
    //reset the radio button of radian/degree according to the value carried with working calculator instance
    if (typeof newWorkingCalc.getRadianOrDegree === 'function') resetRadianDegree(newWorkingCalc.getRadianOrDegree());

    //clear remaining 'focused' class name
    clearFocus(calc.config.keyboardRegionDivs);

    function getCalcByType(type)
    {
        for (var i=0; i<getTDSCalc().calcList.length; i++)
        {
            if (type == getTDSCalc().calcList[i].config.type) return getTDSCalc().calcList[i];
        }
        return null;
    }

    //get current radio button value of radian/degree
    function getRadioButtonValue() {
        if (document.getElementById('radians').checked) {
            return 'radians';
        } else {
            return 'degrees';
        }
    }
}

//reset the radio button of radian/degree according to the value carried with working calculator instance
function resetRadianDegree(checkedId) {
    if (checkedId == 'radians') {
        document.getElementById('degrees').checked = false;
        document.getElementById('radians').checked = true;
    } else {
        document.getElementById('radians').checked = false;
        document.getElementById('degrees').checked = true;
    }
}
// initialization of TDS calc

TDS_Calc.prototype.init = function()
{

    //add switch button for all calcs in multi-mode tds calc
    if (this.calcList.length > 1) {
        var btnSwitchDiv = document.getElementById('calcSwitch');
        var switchList = [];
        for (var i=0; i<this.calcList.length; i++) {
            var btn = document.createElement('a');
            btn.setAttribute('href', '#');
            var id = this.calcList[i].config.name;
            switchList.push(id);
            btn.setAttribute('id', id);
            YAHOO.util.Event.addListener(btn, "click", switchCalc); 
            btn.appendChild(document.createTextNode(this.calcList[i].config.displayName));
            btnSwitchDiv.appendChild(btn);
          
        }
            
        //add calcSwith region for shortcut for each mode   
        for (var i=0; i<switchList.length; i++)
        {
            // add calcSwithch region for each calc
            getRegionDivsByMode(switchList[i]).push('calcSwitch');
            
            //build a doubly linked list for multi-mode switchers
            for (var j=0; j<switchList.length; j++)
            {
                var rightCalc;
                if (j==switchList.length-1) rightCalc = null;
                else rightCalc = switchList[j+1];

                var leftCalc;
                if (j==0) leftCalc = null;
                else leftCalc = switchList[j-1];
                var elId = CalcModeList[switchList[i]] + '-calcSwitch-' + switchList[j];
                
                if (j==0) elementInRegion[CalcModeList[switchList[i]] + '-calcSwitch-default'] = {id:id,up:null,down:null,left:leftCalc,right:rightCalc};
                elementInRegion[elId] = {id:id,up:null,down:null,left:leftCalc,right:rightCalc};
            }
        }

        //adding a class to communicate number of modes passed in
        YAHOO.util.Dom.addClass(document.getElementById("calculatorwidget"), 'modes'+this.calcList.length);
        
    }

    //add click function for buttons
    for (var i=0; i<ButtonAttributeMap.length; i++) {
        var btnObj = document.getElementById(ButtonAttributeMap[i].id);
        if (btnObj) {
            YAHOO.util.Event.removeListener(btnObj, "click", ButtonAttributeMap[i].func);
            YAHOO.util.Event.addListener(btnObj, "click", ButtonAttributeMap[i].func);
            /*
             * spacebar is selection and not enter    
            YAHOO.util.Event.addListener(btnObj, "keypress", function(){
                    var functionToCall = ButtonAttributeMap[i].func;            
                    var objectToCall = btnObj;
                    var objectId = ButtonAttributeMap[i].id;
    	         
                    return function (e){
                        var keycode;
	                    if (window.event) keycode = window.event.keyCode;
	                    else if (e) keycode = e.keyCode;
	                    else return true;

	                    if (keycode == 13)
	                    {
	                        if (objectId != 'equals')
                                functionToCall(e, btnObj);
                            if (e.stopPropagation) {
						        e.stopPropagation();
						        e.preventDefault();
					        }     
   		                    return false;
   	                    }
	                    else
	                        return true;
                    }
                }()
            );
            */     
            btnObj.setAttribute('val',ButtonAttributeMap[i].val);     
            btnObj.setAttribute('op',ButtonAttributeMap[i].op);
            btnObj.setAttribute('numOprands',ButtonAttributeMap[i].numOprands);
            btnObj.setAttribute('onePos',ButtonAttributeMap[i].onePos);
            if('clearExistingInput' in  ButtonAttributeMap[i])
                btnObj.setAttribute('clearExistingInput',ButtonAttributeMap[i].clearExistingInput);
        }
    }
    
    for (var i=0; i<ClearInputButtonMap.length; i++)
    {
        var btnObj = document.getElementById(ClearInputButtonMap[i].id);
        if (btnObj) {
            YAHOO.util.Event.removeListener(btnObj, "click", ClearInputButtonMap[i].func);
            YAHOO.util.Event.addListener(btnObj, "click", ClearInputButtonMap[i].func);    
            /*
             * spacebar is selection and not enter.
            YAHOO.util.Event.addListener(btnObj, "keypress", function(){
                    var functionToCall = ClearInputButtonMap[i].func;            
                    var objectToCall = btnObj;
                    var objectId = ClearInputButtonMap[i].id;
    	         
                    return function (e){
                        var keycode;
	                    if (window.event) keycode = window.event.keyCode;
	                    else if (e) keycode = e.keyCode;
	                    else return true;

	                    if (keycode == 13)
	                    {
                            functionToCall(e, btnObj);
                            if (e.stopPropagation) {
						        e.stopPropagation();
						        e.preventDefault();
					        }
   		                    return false;
   	                    }
	                    else
	                        return true;
                    }
                }()
            );     
            */
            
        }    
    }
    
    // add keyboard short keys
    shortcut.add("ctrl+shift+right", function() { return keyboardTab('forward'); });
    shortcut.add("ctrl+shift+left", function() { return keyboardTab('back'); });
    shortcut.add("enter", function(e) { return keyboardEnter(e); });
    shortcut.add("space", function(e) { return keyboardSpace(e); });

    shortcut.add("shift+left", function() { return keyboardArrowKey('left'); });
    shortcut.add("shift+right", function() { return keyboardArrowKey('right'); });
    shortcut.add("shift+up", function() { return keyboardArrowKey('up'); });
    shortcut.add("shift+down", function () { return keyboardArrowKey('down'); });
    
}

/* main function for arrow shortcut key
    direction: up/down/left/right
*/
function keyboardArrowKey(direction)
{
    
    var calc = getTDSCalc(); 
        
    var calcMode = getCurCalcMode();
    var region = calc.keyboardNav.curRegion;
    var curElement = calc.keyboardNav.curElement;
    var elName = calcMode+'-'+region+'-'+curElement;

    if (region == 'yNumb') {
        //special case for regression input fields
        regressionInputNav(region, curElement, direction);
        return false;
    }
    if (region == 'matrixArea') {
        //special case for matrices input fields
        matricesInputNav(region, curElement, direction);
        return false;
    }    
    
    // fix the shortcut (Shift+Arrow) conflict issue, now the on-screen arrows move the trace point.
    function applyFocusStyle(elId) {
        if(curElement == 'toggleScroll' || curElement == 'toggleTrace') {
            var blurElement = document.getElementById(curElement).parentNode;

            YAHOO.util.Dom.removeClass(blurElement, 'focus');
        }
        if (elId == 'toggleScroll' || elId == 'toggleTrace') {
            var focusElement = document.getElementById(elId).parentNode;
            
            YAHOO.util.Dom.setAttribute(focusElement, 'class', 'focus');
        }
    }

    //all other cases
    try {
    
        switch (direction) {
            case 'left':
                var leftId = elementInRegion[elName].left;
                if ((leftId != null) && !disabledANSRCL(leftId)) {
                    document.getElementById(leftId).focus();
                    calc.keyboardNav.curElement = leftId;
                }
                applyFocusStyle(leftId);
                break;

            case 'right':
                var rightId = elementInRegion[elName].right;
                if ((rightId != null) && !disabledANSRCL(rightId))
                {
                    document.getElementById(rightId).focus();
                    calc.keyboardNav.curElement = rightId;
                }
                applyFocusStyle(rightId);
                break;
                
            case 'up':
                var upId = elementInRegion[elName].up;
                if ((upId != null)&& !disabledANSRCL(upId))
                {
                    PreProcessSelectEnter(direction, upId);
                    document.getElementById(upId).focus();
                    calc.keyboardNav.curElement = upId;
                }
                applyFocusStyle(upId);
                break;      
            case 'down':
                var downId = elementInRegion[elName].down;
                if ((downId != null)&& !disabledANSRCL(downId))
                {
                    PreProcessSelectEnter(direction, downId);
                    document.getElementById(downId).focus();
                    
                    calc.keyboardNav.curElement = downId;
                }
                applyFocusStyle(downId);
                break;                  
        }
    } catch (ex) {
        return false;
    }
    
    //disabled ANS
    function disabledANSRCL(id)
    {
        if ((id == 'ANS')||(id == 'RCL')) {
            if (document.getElementById(id).getAttribute('disabled') !=null) return true;
        }  
        return false;
    
    }
    
    // Specail handing of shourtcut arrow keys for Graphing. Using arrow key 'up', 'down' on FF will also
    // change the dropdown select value if get focused, which is undesired. This is a temp solution that we change index value to 
    // counter the unexpected change of dropdown value.
    function PreProcessSelectEnter(direction, id)
    {
        
        if ((BrowserDetect.browser == 'Firefox') || (BrowserDetect.browser == 'Mozilla')){
            if (id.indexOf('equations-select') == -1) return;
            var selObj = document.getElementById(id);
            var len = selObj.options.length;
            
            switch (direction)
            {
                case 'up':
                    //if (selObj.selectedIndex < len -1) {
                    selObj.selectedIndex += 1; 
 
                    break;
                case 'down':
                    selObj.selectedIndex -= 1;
                    break;
            }
        }
    }
    
    /* matrix input fields navigation
        region: shortcut region 
        curElement: id of current focused element
        direction: 
    */
    function matricesInputNav(region, curElement, direction)
    {
        //M1-1-1 and M1-numberRows
        var coods = curElement.split('-');
        var matrix = coods[0];
        var row = parseInt(coods[1]);
        var col = parseInt(coods[2]);
        
        if (curElement.indexOf('number') != -1) {
            //here are select drop downs
            switch (direction)
            {
                case 'left':
                    if (curElement == matrix + '-numberRows') {
                        var newId = matrix + '-1-1';
                        document.getElementById(newId).focus();
                        getTDSCalc().keyboardNav.curElement = newId;    
                    } else {
                        var newId = matrix + '-numberRows';
                        document.getElementById(newId).focus();
                        getTDSCalc().keyboardNav.curElement = newId;                        
                    }
                    break;
                    
                case 'right':
                    if (curElement == matrix + '-numberRows') {
                        //go to M?-1-1
                        var newId = matrix + '-numberCols';
                        document.getElementById(newId).focus();
                        getTDSCalc().keyboardNav.curElement = newId;    
                    } else {
                        var newId = matrix + '-1-1';
                        document.getElementById(newId).focus();
                        getTDSCalc().keyboardNav.curElement = newId;                        
                    }                
                
                    break;
            }
            return false;
        }
        
        var seNode = document.getElementById(matrix+'-numberRows');
        var dim1Size = seNode.selectedIndex+1;
        
        seNode = document.getElementById(matrix+'-numberCols');
        var dim2Size = seNode.selectedIndex+1;        
        
        var newId = matrix + '-' + row + '-' + col;
        
        switch (direction)
        {
            case 'left':
                col = col - 1;
          
                if (col <=0 ) return false;
                break;
                
            case 'right':
                col = col +1;
                if (col > dim2Size) return false;
                newId = matrix + '-' + row + '-' + col;
                break;
                
            case 'up':
                row = row - 1;
                if (row < 0) return false;
                break;
                
            case 'down':
                row = row + 1;
                if (row > dim1Size) return false;
        }
        newId = matrix + '-' + row + '-' + col;;
        
        if(document.getElementById(newId) != null)
            document.getElementById(newId).focus();
            
        getTDSCalc().keyboardNav.curElement = newId;        
        
    }
    
    /* Regression input fields navigation
        region: shortcut region 
        curElement: id of current focused element
        direction: 
    */
    function regressionInputNav(region, curElement, direction)
    {
        //parse curElement 'reg-X-1'
        //getWorkingCalcInstance().dataLabelNames
        var coods = curElement.split('-');
        var colLb = coods[1];
        var row = parseInt(coods[2]);

        switch (direction)
        {
            case 'left':
                var i=0;
                for (i=0; i<getWorkingCalcInstance().dataLabelNames.length; i++)
                    if (colLb == getWorkingCalcInstance().dataLabelNames[i]) break;
                if (i==0) return false;
                colLb = getWorkingCalcInstance().dataLabelNames[i-1];
                
                break;
            case 'right':
                var i=0;
                for (i=0; i<getWorkingCalcInstance().dataLabelNames.length; i++)
                    if (colLb == getWorkingCalcInstance().dataLabelNames[i]) break;
                if (i== getWorkingCalcInstance().dataLabelNames.length-1) return false;
                colLb = getWorkingCalcInstance().dataLabelNames[i+1];
                
                break;
            case 'up':
                row = row-1;
                if (row < 1) return false;
                break;
            case 'down':
                row = row+1;
                if (row > getWorkingCalcInstance().maxDataEntry) return false;
                break;
        }  
        var newId = 'reg-' + colLb+ '-' + row;
        document.getElementById(newId).focus();
        getTDSCalc().keyboardNav.curElement = newId;
     }
    
    return false;
}

//Enter key that invoke arithmetic calculation
function keyboardEnter(e)
{
    if (typeof(e) == 'object')
    {
        var keycode;
    	if (e) keycode = e.which;
	    else return false;

	    if (keycode == 13)
        {
            var target = YAHOO.util.Event.getTarget(e);
            element =  document.getElementById(target.id);
            id = target.id;
            if (id == 'ANS' || id == 'equals')
            {
                //only if the enter is on a target e.g. =, Ans or Results
                getWorkingCalcInstance().doCalculation();
                return false;
            }
        }
    }
    return false;
}

//space key trigger a button press
function keyboardSpace(e)
{
    var id = getTDSCalc().keyboardNav.curElement;

    // getting event target, for all browsers (including IE 6-8)
    function getEventTarget(evt) {
        if (e.target) return evt.target;
        else if (e.srcElement) return evt.srcElement;
        return {};
    }

    if (getEventTarget(e).type == 'radio') return true;

    //if a button pressed is a non arithmetic button, then just invoke corresponding function.
    if (applyFuncFromButtonMap(ClearInputButtonMap, id)) return false;
    if (applyFuncFromButtonMap(ButtonAttributeMap, id)) return false;
    if (applyFuncFromButtonMap(SwitchButtonMap,id)) return false;
    
    //for arithmetic buttons such as '3', '+', go to individual calc and process it.
    getWorkingCalcInstance().buttonPressProcess(id);
    return false;
}

// if button belongs to specified group, invoke the function, otherwise, go to next level
function applyFuncFromButtonMap(map, id)
{
    for (var i=0; i<map.length; i++)
    {
        if (id == map[i].id) {
            map[i].func(id);
            //document.getElementById(id).focus();
            return true;
        }
    }
    return false;
}

//shortcut tab or shift-tab key navigation: switching region forward
function keyboardTab(direction) {
    
    // fixing https://bugz.airast.org/default.asp?35436#430451, if focus is on <select> elemnt, remove the focus first to avoid shortcut conflict
    if (getTDSCalc().keyboardNav.curRegion == 'numberRows' || getTDSCalc().keyboardNav.curRegion == 'numberColumns') {
        document.getElementById(getTDSCalc().keyboardNav.curElement).blur();
    }

    var divRegion = getRegionDivsByMode(getCurCalcMode()); 
    if (direction == 'forward')
    {
        getTDSCalc().keyboardNav.RegionIndex++;
        if (getTDSCalc().keyboardNav.RegionIndex > divRegion.length -1) getTDSCalc().keyboardNav.RegionIndex = 0;

    } else {
        getTDSCalc().keyboardNav.RegionIndex--;
        if (getTDSCalc().keyboardNav.RegionIndex < 0) getTDSCalc().keyboardNav.RegionIndex = divRegion.length-1;    
    }

    //update focus class
    var divObj;
    for (var i=0; i<divRegion.length; i++) //remove all focused class
    {
        divObj = document.getElementById(divRegion[i]);
        if (YAHOO.util.Dom.hasClass(divObj, 'focused')) YAHOO.util.Dom.removeClass(divObj, 'focused');
    }
    divObj = document.getElementById(divRegion[getTDSCalc().keyboardNav.RegionIndex]);
    YAHOO.util.Dom.addClass(divObj, 'focused');
    
    //set new focused element at new regions
    
    //special case for matrices
    if (divRegion[getTDSCalc().keyboardNav.RegionIndex] == 'matrixArea') {
        keyboardEnterMatrixArea('matrixArea');
        return false;
    }
    
    //sepcail handling for result and clear
    if ( (divRegion[getTDSCalc().keyboardNav.RegionIndex] == 'matrixResult') ||
         (divRegion[getTDSCalc().keyboardNav.RegionIndex] == 'matrixClear'))
    {
        keyboardEnterMatrixResultClear(divRegion[getTDSCalc().keyboardNav.RegionIndex]);
        return false;
    }
    
    //special handling for matrix row and col
    if ((divRegion[getTDSCalc().keyboardNav.RegionIndex] == 'numberRows') ||
        (divRegion[getTDSCalc().keyboardNav.RegionIndex] == 'numberCols')) 
    {
        //set 
        var selId = getWorkingCalcInstance().curMatrix + '-' + divRegion[getTDSCalc().keyboardNav.RegionIndex];
        // fixing https://bugz.airast.org/default.asp?35436#430451, delaying focus to avoid <select> element shortcut conflict
        setTimeout(function () { document.getElementById(selId).focus(); }, 100);
        getTDSCalc().keyboardNav.curRegion = divRegion[getTDSCalc().keyboardNav.RegionIndex];
        getTDSCalc().keyboardNav.curElement = selId;        
        return false;
    }
    // end of special cases
    
    //all other cases, just set to the default element of the new region
    var name = getCurCalcMode()+'-'+divRegion[getTDSCalc().keyboardNav.RegionIndex]+'-default';
    var defaultId = elementInRegion[name].id;
    document.getElementById(defaultId).focus();
    getTDSCalc().keyboardNav.curRegion = divRegion[getTDSCalc().keyboardNav.RegionIndex];
    getTDSCalc().keyboardNav.curElement = defaultId;
    
    //enter into input field of matrices  
    function keyboardEnterMatrixArea(curRegion)
    {
        //get current matrix and set the first element M1-1-1
        //matrix-M1
        var i=0;
        for (i=0; i< getWorkingCalcInstance().matrixIds.length; i++)
        {
            if (document.getElementById('matrix-' + getWorkingCalcInstance().matrixIds[i]).style.display == 'block') break;
        }
        
        var id = getWorkingCalcInstance().matrixIds[i] + '-1-1';
        document.getElementById(id).focus();
        getTDSCalc().keyboardNav.curRegion = curRegion;
        getTDSCalc().keyboardNav.curElement = id;        
    }
    
    function keyboardEnterMatrixResultClear(curRegion)
    {
        var i=0;
        for (i=0; i< getWorkingCalcInstance().matrixIds.length; i++)
        {
            if (document.getElementById('matrix-' + getWorkingCalcInstance().matrixIds[i]).style.display == 'block') break;
        }        
        var id = getWorkingCalcInstance().matrixIds[i] + '-Result';
        if (curRegion.indexOf('Clear') != -1) id = getWorkingCalcInstance().matrixIds[i] + '-Clear';
        document.getElementById(id).focus();
        getTDSCalc().keyboardNav.curRegion = curRegion;
        getTDSCalc().keyboardNav.curElement = id;             
    }
    
    return false;
}


//TDS_Calc.prototype.setKeyboardTracePosByMouseClick = function(id)
//{

//    var regionDivs = getRegionDivsByMode(getCurCalcMode());
//    for (var i=0; i<regionDivs.length; i++)
//    {
//        var inId = getCurCalcMode() + '-' + regionDivs[i] + '-' + id;
//        if (elementInRegion[inId] != null) 
//        {
//            this.keyboardNav.curRegion = regionDivs[i];
//            this.keyboardNav.curElement = id;
//            this.keyboardNav.RegionIndex = i;
//            break;
//        }
//    }
//}

/* Get position of left oprand from current index of special operator such as ^ and ! For example, 4*(2+3)^2
    str: substring of expression until special character ^ or ! 4*(2+3)
*/

TDS_Calc.prototype.getLeftOperandPos = function(str) 
{
    if (str.length == 0) return -1;
    if (str.charAt(str.length-1)==')') {
        var cnt = 1;
        for (var i=str.length-2; i>=0; i--) {
            if (str.charAt(i) == ')') {cnt++;}
            else 
            if (str.charAt(i) == '(') {
                cnt--;
                if (cnt == 0) {
                    var rst = str.substring(i+1, str.length-1);
                    var pos = this.getLeftFuncPos(str, i);
                    //alert ('pos=' + pos);
                    return pos;
                }
            }
        }
    } else 
    if ((str.charAt(str.length-1)=='x')|| (str.charCodeAt(str.length-1)==960)){
        return str.length-1;
    } else 
    if (str.charAt(str.length-1)=='.') {
        return -1;
    } else     
    {
        var digitPattern = /^[0-9]|\./;
        //alert ('letter: ' + digitPattern.test(str));
        var numflag = false;
        var nonNumflag = false;
        for (var i = str.length-1; i>=0; i--) {
            if (digitPattern.test(str.charAt(i))) {
                numflag = true;
            } else {
                nonNumflag = true;
                break;
            }
        }
        if (numflag) {
            if (nonNumflag) return i+1;
            return 0;
        }
    }
    return -1;
}

/* Get position of right oprand from current index . 
    str: substring of expression from special character such as ^
*/
TDS_Calc.prototype.getRightOperandPos = function(str) 
{
    //alert ('righ str: ' + str);
    if (str.charAt(0)=='(') {
        var cnt = 1;
        for (var i=1; i<str.length;i++) {
            if (str.charAt(i) == '(') {cnt++;}
            else 
            if (str.charAt(i) == ')') {
                cnt--;
                if (cnt == 0) {
                    var rst = str.substring(1, i);
                    //alert ('right rst: ' + rst);
                    return i;
                }
            }
        }
    } else 
    if ((str.charAt(0)=='x')||(str.charCodeAt(0)==960 ) ){
        return 1;
    } else
    if (str.charAt(0)=='-') {
        var pos = this.getRightPositiveNumPos(str.substring(1));
        if (pos>0) return pos+1;
    }
    
    //check last
    var pos = this.getRightFuncPos(str, 0);
    if (pos>0) return pos;

    pos = this.getRightPositiveNumPos(str);
    if (pos>0) return pos;
    
    return -1;
}

//get the position of left function from index
TDS_Calc.prototype.getLeftFuncPos = function(str, index) 
{
    for (var i=0; i<this.FuncNames.length; i++) {
        if (this.FuncNames[i].length <= index+1) {
            if (str.substring(index-this.FuncNames[i].length, index) == this.FuncNames[i]) return index-this.FuncNames[i].length;
        }
    }
    return index;
}

//get the position of right function ends from index
TDS_Calc.prototype.getRightFuncPos = function(str, index) 
{
    for (var i=0; i<this.FuncNames.length; i++) {
        if (this.FuncNames[i].length < str.length) {
            if (str.substring(0, this.FuncNames[i].length+1) == (this.FuncNames[i]+'(') ) {
                var cnt = 1;
                for (var j=this.FuncNames[i].length+1; j<str.length; j++) {
                    if (str.charAt(j) == '(') cnt++;
                    else if (str.charAt(j) == ')') {
                        cnt--;
                        if (cnt == 0) {
                            return j;
                        }
                    }
                }
                return -1;
            }
        }
    }
    return -1;
}

TDS_Calc.prototype.getRightPositiveNumPos = function(str) 
{
    //check num   
    var digitPattern = /^[0-9]|\./;
    var numflag = false;
    var nonNumflag = false;
    for (var i = 0; i<str.length; i++) {
        if (digitPattern.test(str.charAt(i))) {
            numflag = true;
        } else {
            nonNumflag = true;
            break;
        }
    }
    if (numflag) {
        if (nonNumflag) return i;
        return str.length;
    }  
    return -1;
}

//we consider 0^0 as an error and this function detects if there is 0^0
TDS_Calc.prototype.checkPow00 = function(inputStr) 
{
    var pos = inputStr.indexOf('pow');
    if (pos == -1) return false;
    var rightOprandPos = this.getRightOperandPos(inputStr.substring(pos + 3));
    if (rightOprandPos == -1) return true; //shouldn't happen
    var leftP = 0; 
    var rightP = 0;
    
    var start = pos + 4;
    for (var i=0; i<rightOprandPos; i++) {
        if (inputStr.charAt(i+start) == '(') leftP++;
        if (inputStr.charAt(i+start) == ')') rightP++;
        if ((leftP == rightP) && (inputStr.charAt(i+start) == ',')) {
            var leftExpression = inputStr.substring(start,start+i);
            var rightExpression = inputStr.substring(start+i+1, rightOprandPos+start-1);
            if ( (leftExpression.indexOf('x')==-1) && ( rightExpression.indexOf('x')==-1)
                 &&((this.evalExpression(leftExpression)+'') == '0') && ((this.evalExpression(rightExpression)+'') == '0')) return true;
            break;
        }
    }
    var nextStr = inputStr.substring(pos+3);
    return this.checkPow00(nextStr);
}

//this function translate inverse trigonometric functions from -1 to arc
TDS_Calc.prototype.translate_invtrig = function(inputStr) {
    inputStr = inputStr.replace('sin^-1', 'asin');
    inputStr = inputStr.replace('cos^-1', 'acos');
    inputStr = inputStr.replace('tan^-1', 'atan');
    return inputStr;
};

// this function translates the negative symbol unicode (\u2010) to a minus symbol
TDS_Calc.prototype.translate_negative = function(inputStr)
{
	return inputStr.replace(/[\u2010]/g, '-');
}

//this function translate sqrt root unicode to 'sqrt()'
TDS_Calc.prototype.translate_sqrt = function(inputStr) 
{
    var pos = this.getFirstCharCode(inputStr, 8730); //sqrt
    while (pos!=-1) {
        var rightOpPos = this.getRightOperandPos(inputStr.substring(pos+1));
        if (rightOpPos == -1) return 'Sqrt Error';
        rightOpPos += pos;
        if (rightOpPos<=inputStr.length-1) {
            var str1 = '';
            if (pos >0) str1 =inputStr.substring(0,pos);
            var str2 = "";
            if (rightOpPos < inputStr.length -1) 
                str2 = inputStr.substring(rightOpPos+1);
            var opStr2 = inputStr.substring(pos+1, rightOpPos+1);
            inputStr = str1 + 'sqrt(' + opStr2 + ')' + str2;
            //alert ('new inputStr: ' + inputStr);
        } else {
            return 'Sqrt Error';
        }
        pos = this.getFirstCharCode(inputStr, 8730);
    }
    //if (inputStr.indexOf('sqrt()')!=-1) return 'Sqrt Error';
    return inputStr;
}

//this function translate pi unicode to 'PI'
TDS_Calc.prototype.translate_pi = function(inputStr) 
{

    var pos = this.getFirstCharCode(inputStr, 960); //Pi
    while (pos!=-1) {
        inputStr = inputStr.substring(0,pos) + '(' + PI + ')' + inputStr.substring(pos+1);
        pos = this.getFirstCharCode(inputStr, 960); //Pi
    }

    return inputStr;
}  

//this function does all other error checkings such as 0^0
TDS_Calc.prototype.otherInputErrors = function(inputStr) 
{
    // check if we have 0^0: pow(0,0)
    if ( (inputStr.indexOf('+-')!=-1) || (inputStr.indexOf('-+')!=-1) ) return 'Error';
    if (this.checkPow00(inputStr)) return '0^0 Error';
    return inputStr;
}
 
    
//We add missing ')' at the end of the expression
TDS_Calc.prototype.addMissingBrackets = function(str) 
{
    var inputStr = str;
    var left = 0, right = 0;
    for (var i=0; i<str.length; i++) {
        if (str.charAt(i) == '(') left++;
        if (str.charAt(i) == ')') right++;
    }
    if (left > right) 
        for (var j=0; j<left - right; j++) inputStr += ')';
    return inputStr;
}  

//This function add missing multipliers. example 3sin(5) ->3*sin(5)
TDS_Calc.prototype.addMissingMultiplier = function(str) 
{
    var inputStr = str;

    if (inputStr.match(/[\*\(+-\/][*]/g)) return ExpressErrorMsg;   
    inputStr = inputStr.replace(new RegExp('[e][x][p]', 'g'), 'bbb');
    if(inputStr != ExpressErrorMsg) inputStr = inputStr.replace(new RegExp('[x]', 'g'), '(x)');
    inputStr = inputStr.replace(new RegExp('[b][b][b]', 'g'), 'exp');  
   
    //add * for functions
    var oldInput = inputStr;
    for (var i = 0; i < this.FuncNames.length; i++) {
        inputStr = inputStr.replace(new RegExp(this.FuncNames[i], 'g'), '*' + this.FuncNames[i]);
        inputStr = inputStr.replace(new RegExp('[*][*]', 'g'), '*');
        inputStr = inputStr.replace(new RegExp('[(][*]', 'g'), '(');
        inputStr = inputStr.replace(new RegExp('[+][*]', 'g'), '+');
        inputStr = inputStr.replace(new RegExp('[-][*]', 'g'), '-');
        inputStr = inputStr.replace(new RegExp('[/][*]', 'g'), '/');
        inputStr = inputStr.replace(new RegExp('[.][*]', 'g'), '.');
    }
    if (inputStr.charAt(0) == '*') {
        if (oldInput == inputStr) return 'Error'; 
        else inputStr = inputStr.substring(1);
    }
    //adding missing multiplier for brackets
    inputStr = inputStr.replace(new RegExp('[)][(]', 'g'), ')*(');
    
    var digits = ['0','1','2','3','4','5','6','7','8','9', '.'];
    for (var i=0; i< digits.length; i++) {
        inputStr = inputStr.replace(new RegExp('[' + digits[i] + '][(]', 'g'), digits[i]+'*(');
        inputStr = inputStr.replace(new RegExp('[)]' + '['+ digits[i] + ']', 'g'), ')*' + digits[i]);
    }

    inputStr = inputStr.replace(new RegExp('[a][*][s][i][n]', 'g'), 'asin');
    inputStr = inputStr.replace(new RegExp('[a][*][c][o][s]', 'g'), 'acos');
    inputStr = inputStr.replace(new RegExp('[a][*][t][a][n]', 'g'), 'atan');

    return inputStr;
}
   
//Translate ^ to pow()
TDS_Calc.prototype.translate_pow = function(inputStr) 
{
    var pos = inputStr.indexOf('^');
    while (pos!=-1) {
        var leftOpPos = this.getLeftOperandPos(inputStr.substring(0,pos));
        if (leftOpPos == -1) return 'Pow Error';
        var rightOpPos = this.getRightOperandPos(inputStr.substring(pos+1));
        if (rightOpPos == -1) return 'Pow Error';
        rightOpPos += pos;
        //update inputStr
        if ((leftOpPos>=0) && (rightOpPos<=inputStr.length-1)) {
            var str1 = '';
            if (leftOpPos >0) str1 =inputStr.substring(0,leftOpPos);
            var str2 = "";
            if (rightOpPos < inputStr.length -1) 
                str2 = inputStr.substring(rightOpPos+1);
            var opStr1 = inputStr.substring(leftOpPos,pos);
            var opStr2 = inputStr.substring(pos + 1, rightOpPos + 1);

            /*
             * For negative numbers, JavaScript does not support cubic root and higher level root extraction calculation
             * So when opStr1 is negative number, and opStr2 (exponent) is not an integer, and the denominator of opStr2 (exponent) is not an even number, say (-8)^(1/3)
             * The code will calculate it like this pow(Math.abs(-8), (1/3)), and add the +/- sign in front of the result according to the parity of molecular and denominator of the exponent
             * Since the denominator of opStr2 (exponent) number is odd only (otherwise, the root would be illegal, because of the negative power base number)
             * For those opStr2 (exponent) number whose molecular is odd, the final result would be negative as the opStr1 number
             * For those opStr2 (exponent) number whose molecular is even, the final result would be positive 
             */

            // For now, due to the complexity we only support a/b format fraction as an exponent
            if (opStr2.indexOf('/') > -1) {                     // opStr2 is fraction
                var molecular = opStr2.split('/')[0].replace(new RegExp('[()]', 'g'), ''),
                    denominator = opStr2.split('/')[1].replace(new RegExp('[()]', 'g'), '');

                if (this.evalExpression(opStr1) < 0 &&          // opStr1 is negative
                    Number(molecular) &&                        // opStr2 molecular is a number
                    Number(denominator) &&                      // opStr2 denominator is a number
                    denominator % 2 != 0) {                     // opStr2's denominator is odd

                    var sign = '';

                    opStr1 = 'Math.abs(' + opStr1 + ')';

                    if (opStr2.split('/')[0].replace(new RegExp('[()]', 'g'), '') % 2 != 0) { // if the molecular of power number is odd, then the final result would be negative as opStr1
                        sign = '-';
                    }

                    inputStr = str1 + sign + 'pow(' + opStr1 + ',' + opStr2 + ')' + str2;

                } else {
                    inputStr = str1 + 'pow(' + opStr1 + ',' + opStr2 + ')' + str2;
                }
            } else {
                inputStr = str1 + 'pow(' + opStr1 + ',' + opStr2 + ')' + str2;
            }

            
            //alert ('new inputStr: ' + inputStr);
        } else {
            //showErrorMessage("pow error");
            return 'Pow Error';
        }
        pos = inputStr.indexOf('^');
    }
    return inputStr;
}

//translate 5! to fact(5)
TDS_Calc.prototype.translate_fact = function(inputStr) 
{
    pos = inputStr.indexOf('!');
    while (pos!=-1) {
        var leftOpPos = this.getLeftOperandPos(inputStr.substring(0,pos));
        if (leftOpPos>=0) {
            var str1 = '';
            if (leftOpPos >0) str1 =inputStr.substring(0,leftOpPos);
            var str2 = '';
            if (pos < inputStr.length-1) str2 = inputStr.substring(pos+1);
            var opStr1 = inputStr.substring(leftOpPos,pos);
            inputStr = str1 + 'fact(' + opStr1 + ')' + str2;
        } else { 
            return 'Factorial Error';
        }
        pos = inputStr.indexOf('!');    
    } 
    return inputStr;
}  

/* return the position of the first occurance of a code
    inputStr: expression string
    code: unicode
*/
TDS_Calc.prototype.getFirstCharCode = function(inputStr, code) 
{
    for (var i=0; i<inputStr.length; i++) {
       if (inputStr.charCodeAt(i) == code) return i;
    }
    return -1;
}

var focuskeys = [
    {id: 'plus', symbol: '+'},
    {id: 'minus', symbol: '-'},
    {id: 'multiply', symbol: '*'},
    {id: 'divide', symbol: '/'}
];


// adding this function to handle enter key (code:13) press on touch brwoser, which don't have onkeypress key, with onkeyup event.
function CalcReturnKeyPressProcess(myfield, e) {
    if ((BrowserUtils.isTouchBrowser() || BrowserUtils.isChromeOS()) && e.keyCode == 13) {
        CalcKeyPressProcess(myfield, e);
        return false;
    } else return false;
};

function CalcKeyPressProcess(myfield, e) {
    
    var curClass = document.getElementById("calculatorwidget");
    if (YAHOO.util.Dom.hasClass(curClass, 'regressions') && (myfield.id == 'textinput')) return false;
  
    var code;
	if (!e) var e = window.event;
	
	//this is for FF. IE and Chrone does not come here on keypress
    /*
    **We are now handling the delete key press.
    if ((e.keyCode == 46) && (e.which == 0)) return false; // this is delete key
    */
    if ((e.keyCode == 45) && (e.which == 0)) return false; // this is insert key
    if ((e.keyCode == 40) && (e.which == 0)) return false; // up and down arrow keys
	if ((e.keyCode == 38) && (e.which == 0)) return false; 
	//left and right
	if ((e.keyCode == 37) && (e.which == 0)) {
	    var currentPos = CaretPositionUtils.getCaretPosition(myfield);
	    if (currentPos > 0)
	        CaretPositionUtils.setCaretPosition(myfield, currentPos - 1);
	    return false; 
	}
	if ((e.keyCode == 39) && (e.which == 0)) {
	    var currentPos = CaretPositionUtils.getCaretPosition(myfield);
	    if ('value' in myfield)
	    {
	        var currentValue = myfield.value;
	        if (currentValue != null && currentPos < currentValue.length)
	        {
	            CaretPositionUtils.setCaretPosition(myfield, currentPos + 1);
	        }
	    }
	    return false; 
	}
	if (e.keyCode) code = e.keyCode;
	else if (e.which) {
	    code = e.which;
	}
	
    //enter is 13, doCalcuation
	if (code == 13) {
	    getWorkingCalcInstance().doCalculation();
	    return false;
	}
	
	if (code == 8) {
	    getWorkingCalcInstance().clearInput('backspace');
	    return false;
	}

	if (code == 46 && e.keyCode == 46 && e.which == 0) {
        // 46 is keycode for delete, 46 is which for '.'
	    getWorkingCalcInstance().clearInput('delete');
	    return false;
	}
	
	var character = String.fromCharCode(code);
	var allowed = false;
    var allowedType = '[0-9]|[.]|[\b]';
  
	if ((getCurCalcMode() == CalcModeList['Basic']) || (getCurCalcMode() == CalcModeList['Standard']) || (getCurCalcMode() == CalcModeList['StandardMem'])) {
	    //Basic or Standard
        clearkeyFocus();
        allowed = character.match(new RegExp(allowedType, "g")); 

        if (allowed) {
            var calc = getWorkingCalcInstance();
            if ((calc.immediateEvalFlag.inputClearFlag)&&(myfield.id == 'textinput')) document.getElementById(myfield.id).value = '';

            var new_contents = '';
            if (calc.immediateEvalFlag.oprandContinueFlag) {
                new_contents = document.getElementById(myfield.id).value;
                if (new_contents.length < getMaxInputLen(myfield)) {
                    CaretPositionUtils.insertCharacter(myfield, character);
                }
            }
            else 
            {
                new_contents = character;
                calc.immediateEvalFlag.oprandContinueFlag = true;            
                document.getElementById(myfield.id).value = new_contents;
            }
            calc.immediateEvalFlag.previousIsBiOp = false;
            calc.immediateEvalFlag.inputClearFlag = false;
        }
        
        basicFunctionKeyProcess(character);
	    return false;

    } else {
	    if (getCurCalcMode() == CalcModeList['Graphing'] || getCurCalcMode() == CalcModeList['GraphingInv']) allowedType += '|[x]'; //Graphing add x
	    if (getCurCalcMode() == CalcModeList['Graphing'] ||
	        getCurCalcMode() == CalcModeList['Scientific'] ||
	        getCurCalcMode() == CalcModeList['GraphingInv'] ||
	        getCurCalcMode() == CalcModeList['ScientificInv']) allowedType += '|[!]';
        if (getCurCalcMode() == CalcModeList['Regression']) {  //Regression mode
            //allowedType += '|[+-]|[*]|[/]';   // See bug 22637
            allowed = character.match(new RegExp(allowedType, "g")); 
        }
        else {
            allowedType += '|[()+-]|[*]|[/]';
            allowed = character.match(new RegExp(allowedType, "g")); 
            if (character == '^') allowed = true;
        }
        
        if (allowed) {
            new_contents = document.getElementById(myfield.id).value;
            if (new_contents.length < getMaxInputLen(myfield, character) &&
                PreciseUtils.validatedInputFractionalPartLen(myfield, character)) { // check fractional part length restriction if necessary
                var workingCalc = getWorkingCalcInstance();
                //(key input) in Scientific, when input a number right after a 'result number', the result need to be replaced by the new input. bug 112395 
                if (workingCalc.immediateEvalFlag && workingCalc.immediateEvalFlag.resultClearFlag && myfield.id == 'textinput') {
                    getWorkingCalcInstance().immediateEvalFlag.resultClearFlag = false;
                    if (character.match(new RegExp("[0-9]", "g"))) {
                        document.getElementById(myfield.id).value = '';
                    }
                }
                return true;
            }
            else return false;
        }
        return false;
    }

    //this function is to enbable focus on one of + - * / operator, if students type them in main text 
    //input field so that students knows an operator is pressed.
    //It applies only to Basic and Standard calcs that do not show the entire expression
    function basicFunctionKeyProcess(ch)
    {
        var found = false;
        var i;
        for (i=0; i<focuskeys.length; i++)
        {
            if (focuskeys[i].symbol == ch) {
                found = true;
                break;
            }
        }
        
        if (found) {
            clearkeyFocus();
            var thisBtn = document.getElementById(focuskeys[i].id);
            if (thisBtn!=null) YAHOO.util.Dom.addClass(thisBtn, 'focused');     
            //call button pressed
            buttonPressed(focuskeys[i].id);

        } else return;
    }
}

function CalcFocusGained(element, event)
{
    if (getWorkingCalcInstance() != null && typeof getWorkingCalcInstance().focusGained == 'function')
    {
        getWorkingCalcInstance().focusGained(element, event);
    }
    
}

function CalcFocusLost(element, event) {
    if (getWorkingCalcInstance() != null && typeof getWorkingCalcInstance().focusLost == 'function') {
        getWorkingCalcInstance().focusLost(element, event);
    }

}


//This function clears the set focus when typing operators in text field for basic and standard calcs
function clearkeyFocus()
{
    //remove all focus
    for (var i=0; i<focuskeys.length; i++) {
        var btn = document.getElementById(focuskeys[i].id);
        if (YAHOO.util.Dom.hasClass(btn, 'focused')) YAHOO.util.Dom.removeClass(btn, 'focused');
    }
}

//function that get current calculator mode
function getCurCalcMode()
{
//    var calc = getWorkingCalcInstance();
//    return calc.config.name;

    var curClass = document.getElementById("calculatorwidget");
    for (var i=0; i< CalcConfigBase.length; i++) {
        if (YAHOO.util.Dom.hasClass(curClass, CalcConfigBase[i].css)) {
            if (!YAHOO.util.Dom.hasClass(curClass, CalcConfigBase[i].css + ' inv')) {
                return CalcConfigBase[i].name;
            }
        }
    }
    return null;
}

/* Call this function if you would like to limit the length of an input field. The maxLen is specified in
   calc config with exception of graphing, which has multiple text input fields
   inputField: object of the input field
   character: value of the newly input character
   
*/
function getMaxInputLen(inputField, character) {
    
    if (inputField == null) {
        return 0;
    }
    
    var textinputId = inputField.id;

    var lens = getWorkingCalcInstance().config.textInputLen;

    for (var i = 0; i < lens.length; i++) {
        if (lens[i].id == 'Any') return lens[i].len;
        if (textinputId == lens[i].id) {

            //fixing: https://bugz.airast.org/default.asp?30591#430705
            var inputId = inputField.id;
            
            // Graphing - Window - x or y max or min value, and value is negtive, then one extra digit is allowed
            if ((inputId == 'xmin' || inputId == 'xmax' || inputId == 'ymin' || inputId == 'ymax') && inputField.value.length == lens[i].len) { //specify the condition to check only the last allowed digit
                
                var firstCharCode = inputField.value.charCodeAt(0);
                var caretPos = CaretPositionUtils.getCaretPosition(inputField);
                // only allowed 7 digits when the value is negative, or the input is '-'(plus/minus:8208 or negative:45) at the very beginning of the string fixing:https://bugz.airast.org/default.asp?85283#507402
                if (firstCharCode == 8208 || firstCharCode == 45 || (caretPos == 0 && (character.charCodeAt(0) == 8208 || character.charCodeAt(0) == 45))) {
                    return lens[i].len + 1;
                }
            } else {
                return lens[i].len;
            }
        }
    }
    return 0;
}

/*
 * get the maximum length allowed for the fractional part (after decimal point)
 * @inputField
 */
function getMaxFractionalPartLen(inputField) {
    if (inputField == null) {
        return 0;
    }

    var inputId = inputField.id;
    var lens = getWorkingCalcInstance().config.fractionalPartLen;

    return lens[inputId];
}

//brower detection utility function
var BrowserDetect = {
	init: function () {
		this.browser = this.searchString(this.dataBrowser) || "An unknown browser";
		this.version = this.searchVersion(navigator.userAgent)
			|| this.searchVersion(navigator.appVersion)
			|| "an unknown version";
		this.OS = this.searchString(this.dataOS) || "an unknown OS";
	},
	searchString: function (data) {
		for (var i=0;i<data.length;i++)	{
			var dataString = data[i].string;
			var dataProp = data[i].prop;
			this.versionSearchString = data[i].versionSearch || data[i].identity;
			if (dataString) {
				if (dataString.indexOf(data[i].subString) != -1)
					return data[i].identity;
			}
			else if (dataProp)
				return data[i].identity;
		}
	},
	searchVersion: function (dataString) {
		var index = dataString.indexOf(this.versionSearchString);
		if (index == -1) return;
		return parseFloat(dataString.substring(index+this.versionSearchString.length+1));
	},
	dataBrowser: [
		{
			string: navigator.userAgent,
			subString: "Chrome",
			identity: "Chrome"
		},
		{ 	string: navigator.userAgent,
			subString: "OmniWeb",
			versionSearch: "OmniWeb/",
			identity: "OmniWeb"
		},
		{
			string: navigator.vendor,
			subString: "Apple",
			identity: "Safari",
			versionSearch: "Version"
		},
		{
			prop: window.opera,
			identity: "Opera"
		},
		{
			string: navigator.vendor,
			subString: "iCab",
			identity: "iCab"
		},
		{
			string: navigator.vendor,
			subString: "KDE",
			identity: "Konqueror"
		},
		{
			string: navigator.userAgent,
			subString: "Firefox",
			identity: "Firefox"
		},
		{
			string: navigator.vendor,
			subString: "Camino",
			identity: "Camino"
		},
		{		// for newer Netscapes (6+)
			string: navigator.userAgent,
			subString: "Netscape",
			identity: "Netscape"
		},
		{
			string: navigator.userAgent,
			subString: "MSIE",
			identity: "Explorer",
			versionSearch: "MSIE"
		},
		{
			string: navigator.userAgent,
			subString: "Gecko",
			identity: "Mozilla",
			versionSearch: "rv"
		},
		{ 		// for older Netscapes (4-)
			string: navigator.userAgent,
			subString: "Mozilla",
			identity: "Netscape",
			versionSearch: "Mozilla"
		}
	],
	dataOS : [
		{
			string: navigator.platform,
			subString: "Win",
			identity: "Windows"
		},
		{
			string: navigator.platform,
			subString: "Mac",
			identity: "Mac"
		},
		{
			   string: navigator.userAgent,
			   subString: "iPhone",
			   identity: "iPhone/iPod"
	    },
		{
			string: navigator.platform,
			subString: "Linux",
			identity: "Linux"
		}
	]

};
BrowserDetect.init();