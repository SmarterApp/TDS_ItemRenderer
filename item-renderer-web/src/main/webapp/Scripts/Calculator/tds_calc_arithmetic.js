//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
// ******************** arithmetic calculator *************************
/*
Arithmetic calculator supports basic arithmetic operations such as multiplication, division etc 
and advanced functional calculation such as tan, cosine, factorial, power etc. 

There are two ways to perform arithmetic calculation due to different clients’ request. One is to 
calculate result immediately when an operator is pressed even though the entire expression is not 
finished yet, while the other will do calculation after entire expression has been completed. 
Current design allows us to simply set Arithmetic.lazyEvaluation  to false for the first case and true
for the second case.

*/
function ArithmeticCalc(config, parent)
{
    this.parent = parent;
    this.config = config;
    this.textInputIds = ['textinput'];
    this.inputarea = this.outputarea = document.getElementById('textinput');
    this.lazyEvaluation = config.lazyEvaluation;
    this.ANS;

    //radian/degree radio button value, default as 'degrees'
    this.radianOrDegree = 'degrees';
    
    //immediate evaluation flags
    this.immediateEvalFlag = {
        storedValue: '', //stored previous calculated value
        preOperator: '', //previous operator
        oprandContinueFlag: true, //flag that allows continue oprand input
        previousIsBiOp: false, //Is previous operator has two operands?
        inputClearFlag: false, //flag if to start a new input
        resultClearFlag: false //flag if to clear existed result and start a new input (for scientifc calculator only right now)
    };
    this.lazyInputClearFlag = true;
    this.init();
}

ArithmeticCalc.prototype.getInputArea = function() {
    return this.inputarea;
};

ArithmeticCalc.prototype.setFocus = function () {
    return;
};

ArithmeticCalc.prototype.reset = function() {
    this.clearInput('C');
    this.arithmeticCalcReset();
};

ArithmeticCalc.prototype.arithmeticCalcReset = function () {

    // reset radian/degree radio button when page hide
    this.radianOrDegree = 'degrees';
    resetRadianDegree(this.radianOrDegree);
};

ArithmeticCalc.prototype.setRadianOrDegree = function (rd) {
    this.radianOrDegree = rd;
};

ArithmeticCalc.prototype.getRadianOrDegree = function () {
    return this.radianOrDegree;
};

//clear text input when C, CE, or Backspace button pressed. ANS and memory need to be resset
ArithmeticCalc.prototype.clearInput = function(id) {
    var inputarea = this.getInputArea();
    if ((id == 'C') || (id == 'CE')) {
        inputarea.value = '';
        if (id == 'C') {
            this.resetImmEvalFlags();

            document.getElementById('memorystatus').value = '';
            document.getElementById('memorystatusStandard').value = '';
            memoryValue = '';

            var ANSBtn = document.getElementById("ANS");
            if (!YAHOO.util.Dom.hasClass(ANSBtn, 'disabled')) YAHOO.util.Dom.addClass(ANSBtn, 'disabled');
            ANSBtn.setAttribute('disabled', 'disabled');

            var RCLBtn = document.getElementById("RCL");
            if (!YAHOO.util.Dom.hasClass(RCLBtn, 'disabled')) YAHOO.util.Dom.addClass(RCLBtn, 'disabled');
            RCLBtn.setAttribute('disabled', 'disabled');

            this.ANS = null;
        }
    } else if (id == 'delete') {
        CaretPositionUtils.applyDeleteKeyPress(inputarea);
    } else {
        CaretPositionUtils.applyBackspaceKeyPress(inputarea);
    }

    // this clear input method may lead an empty input area, then there will be no need to replace input area value when new input behavior happens, so no reason to keep resultClearFlag as true.
    // bug: otherwise, it may cause negative-sign-input after calculation be replaced by following input values.
    if (inputarea.value == '' && this.immediateEvalFlag.resultClearFlag == true) {
        this.immediateEvalFlag.resultClearFlag = false;
    }

};


ArithmeticCalc.prototype.getOutputArea = function() {
    return this.outputarea;
};

//input area is reset when switching calc
ArithmeticCalc.prototype.setTextInput = function() {
    document.getElementById('textinput').setAttribute('style', 'display:block');
    if (!BrowserUtils.isTouchBrowser()) {
        document.getElementById('textinput').removeAttribute('readonly');
    }

};

var ArithButtonMaps = [];
ArithButtonMaps.push( {id: 'ANS', func: processANS});

ArithmeticCalc.prototype.init = function()
{
    //ANS button
    for (var i=0; i<ArithButtonMaps.length; i++) 
    {
        var btnObj = document.getElementById(ArithButtonMaps[i].id);
        if (btnObj) {
            YAHOO.util.Event.removeListener(btnObj, "click", ArithButtonMaps[i].func);
            YAHOO.util.Event.addListener(btnObj, "click", ArithButtonMaps[i].func);    
            
	    /*
	     * spacebar is selection.
            YAHOO.util.Event.addListener(btnObj, "keypress", function(){
                    var functionToCall = ArithButtonMaps[i].func;            
                    var objectToCall = btnObj;
                    var objectId = ArithButtonMaps[i].id;
    	         
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
    this.parent.textInputFocusInit(this.textInputIds);
  
}

//set init shortcut position
ArithmeticCalc.prototype.setInitKeyboardElement = function() {
    //set initial focus to textinput and init starting position of shortcut
    //document.getElementById('textinput').focus()
    var initialInput = document.getElementById('textinput');
    setTimeout(function() {
        FocusUtils.setCalcFocus(initialInput);
    }, 0); // in FF2.0, the onFocus() is triggered as soon as focus() is called (in the same stack frame) which we dont want to happen.    
    this.parent.keyboardNav.curRegion = 'calcControls';
    this.parent.keyboardNav.RegionIndex = 0;
    this.parent.keyboardNav.curElement = 'textinput';
};

// checks if something is a number
ArithmeticCalc.prototype.isNumber = function(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

//cache ANS
ArithmeticCalc.prototype.setANS = function(result) {
    if (this.isNumber(result))    // Make sure this is an answer and not some sort of error 
        this.ANS = result;      
}

//Clear remaining focus visual indication (blue border)
ArithmeticCalc.prototype.clearFocus = function (divsMap) {
    clearFocus(divsMap);
};

//ANS button process. 
function processANS(e)
{
    var calc = getWorkingCalcInstance();
    if (calc.ANS == null) return;
    
    if (calc.lazyEvaluation) {
        if (calc.lazyInputClearFlag) {
            calc.getInputArea().value = calc.ANS;
            calc.lazyInputClearFlag = false;
        } else calc.getInputArea().value += calc.ANS;
    } else {
    
//        if (calc.getInputArea().value == '') return;
//        if (calc.immediateEvalFlag.preOperator == '') return;
//        if (calc.immediateEvalFlag.previousIsBiOp == false) return;
//        
//        var value = calc.getInputArea().value;
//        rst = calc.evalArithmeticExpression('('+ value + ')' + 
//            calc.immediateEvalFlag.preOperator + '(' + calc.ANS + ')');
//        calc.getInputArea().value = rst;
//        
//        calc.immediateEvalFlag.preOperator = '';
//        calc.immediateEvalFlag.previousIsBiOp = false;
        
        calc.getInputArea().value = calc.ANS;
        
    }
}

//arithmetic calculation.
ArithmeticCalc.prototype.doCalculation = function() 
{
    if (this.lazyEvaluation) {
        var rst = this.evalArithmeticExpression(this.getInputArea().value.replace(/^\s*|\s*$/g, ''));
        var outputarea = this.getOutputArea();
        outputarea.value = rst;
        CaretPositionUtils.setCaretPosition(outputarea, outputarea.value.length);   //move caret to the end of the value string, so next input will starts there
        this.setANS(rst);
        this.lazyInputClearFlag = true;
        this.immediateEvalFlag.resultClearFlag = true;   //for scientifc/graphing, adding this flag to clear result when next input is number bug 112395
        //return rst;
    }
    else {
        var value = this.getInputArea().value;
        var rst = '';
        if ((value.length > 0) && (this.immediateEvalFlag.storedValue.length > 0) && (this.immediateEvalFlag.preOperator.length > 0)) {
            rst = this.evalArithmeticExpression('(' + this.immediateEvalFlag.storedValue + ')' + this.immediateEvalFlag.preOperator + '(' + value + ')');
            rst = rst.toString().replace('-', '\u2010');
            this.getInputArea().value = rst;
            if ((rst + '').indexOf('error') != -1) {
                this.immediateEvalFlag.inputClearFlag = true;
                this.resetImmEvalFlags();
            } else {
                this.setANS(rst);
                this.immediateEvalFlag.oprandContinueFlag = false;
                this.immediateEvalFlag.preOperator = '';
                this.immediateEvalFlag.previousIsBiOp = false;
            }
        }
    }
    var ANSBtn = document.getElementById("ANS");
    if (this.ANS != null) {
        if (YAHOO.util.Dom.hasClass(ANSBtn, 'disabled')) YAHOO.util.Dom.removeClass(ANSBtn, 'disabled');
        ANSBtn.removeAttribute('disabled');
    }
    else {
        if (!YAHOO.util.Dom.hasClass(ANSBtn, 'disabled')) YAHOO.util.Dom.addClass(ANSBtn, 'disabled');
        ANSBtn.setAttribute('disabled', 'disabled');
    }

    clearkeyFocus();
    CaretPositionUtils.preventOnscreenKB(this.getInputArea());

}

ArithmeticCalc.prototype.resetImmEvalFlags = function()
{
    this.immediateEvalFlag.storedValue = '';
    this.immediateEvalFlag.preOperator = '';
    this.immediateEvalFlag.oprandContinueFlag = true;
    this.immediateEvalFlag.previousIsBiOp = false;
}

//evaluate expression.
ArithmeticCalc.prototype.evalArithmeticExpression = function(expression)
{
    return this.parent.evalExpression(expression);
}

//process arithmetic botton press
ArithmeticCalc.prototype.buttonPressProcess = function(e)
{
    var id;
    var element;
    if (typeof(e) == 'object')
    {
        var target = YAHOO.util.Event.getTarget(e);
        //preventing from click on the <sup> inside the <a>
        if (target.nodeName == 'SUP') {
            target = target.parentNode;
        }

        element =  document.getElementById(target.id);
        id = target.id;
    } else {
        //e is id if not object
        if (applyFuncFromButtonMap(ArithButtonMaps, e)) return;
        element = document.getElementById(e);
        id = e;
    }
    
    if (id == 'sign') {
        getTDSCalc().flip_sign(e);
        return;
    }

    var s = element.getAttribute('val');
    if (s == null) 
    {
        //hack for firefox 2.0 on Mac OS.
        //On FFX2.0/MacOS10.3.9 the target is the span for the squareroot function.
        //so we will check about 2 parents up and see if there is a val attribute.
        var parent = element.parentNode;
        for (var counter1 = 1; parent != null && counter1 < 4; ++counter1)
        {
            s = parent.getAttribute('val');
            if (s != null)
                break;
            parent = parent.parentNode;
        }
        if (s == null)
            return;
    }
    var operator = element.getAttribute('op');
    var numOprands = element.getAttribute('numOprands');
    var onePos = element.getAttribute('onePos');
    /* 
     SB07132011: I did not want to add clearExistingInput flag to all buttons. In most cases e.g. those of 2 or 3, we will want to clear 
     the input field between calculations. However, in case of operators in the scientific mode we would want to continue the expression.
     That is why the default action is to clearExistingInput i.e. clearExistingInput = true. So in the clause below I check if a clearExistingInput
     attribute has not been specified - in which case it will be assumed to be trie - or if specified it is set to true.
     */
    var isClearExistingInputFlag = (element.getAttribute('clearExistingInput') == null || element.getAttribute('clearExistingInput') == "true");
    if (this.immediateEvalFlag.inputClearFlag) {
        this.getInputArea().value = '';
        this.immediateEvalFlag.inputClearFlag = false;
    }
    
    var new_contents;
    
    //differentiate lazyEvaluation
    if (this.lazyEvaluation) {
        //fix for https://bugz.airws.org/default.asp?22142#130827
        if (this.lazyInputClearFlag && isClearExistingInputFlag) {    
            // Fix for https://bugz.airws.org/default.asp?65828
            var inputarea = this.getInputArea();
            inputarea.value = s;
            
            var currentPosition = CaretPositionUtils.getCaretPosition(inputarea) + s.length;
            CaretPositionUtils.setCaretPosition(inputarea, currentPosition);
        } else {
            //new_contents = this.getInputArea().value + s;
            new_contents = this.getInputArea().value;
            if (new_contents.length < getMaxInputLen(this.getInputArea())) {

                //(button click) in Scientific, when input a number right after a 'result number', the result need to be replaced by the new input. bug 112395 
                if (this.immediateEvalFlag.resultClearFlag) {
                    this.immediateEvalFlag.resultClearFlag = false;
                    if(operator != 'true')  this.getInputArea().value = '';
                }
                CaretPositionUtils.insertCharacter(this.getInputArea(), s);
            }          
        }
        this.lazyInputClearFlag = false;

    } else {
        if (operator != 'true') { //this is operand
            if (this.immediateEvalFlag.oprandContinueFlag) {
                new_contents = this.getInputArea().value;
                if (new_contents.length < getMaxInputLen(this.getInputArea()))
                    CaretPositionUtils.insertCharacter(this.getInputArea(), s);
            }
            else {
                this.getInputArea().value = s;
                this.immediateEvalFlag.oprandContinueFlag = true;            
            }
            this.immediateEvalFlag.previousIsBiOp = false;
        }            
        else { // this is operator
            new_contents = this.processOperator(this.getInputArea(), s, numOprands, onePos);
            //once operator is pressed, always starts with new input
            this.immediateEvalFlag.oprandContinueFlag = false;
            this.getInputArea().value = new_contents;
        }
    }
    // fix https://bugz.airws.org/default.asp?65824
    /*
     * the following fix was redone to account for touch tablets.
    // Fix for https://bugz.airws.org/default.asp?22198
    //this.getInputArea().focus();
    */
    FocusUtils.setCalcFocus(this.getInputArea(), e);
    
}

//operator process for immediate evaluation
ArithmeticCalc.prototype.processOperator = function(inputarea, s, numOprands, onePos) 
{
        //numOprands: how many operands for this operator
        //onePos: is the operator located at the right or left side of operand (for one operand only)
    //this translate is pointless since the only scenario it happens is changing Nagative sign into Minus in Standard Calculator
    //var value = this.parent.translate_input(inputarea.value); 
    var value = inputarea.value;
        if (value.length == 0) return '';
        var rst='';

        if (numOprands == 1) {
            // * one operator, we 
            // * evaluate operator with text input value immediately
            // * update text input value,
            // * don't save any value and operator information, as if they are input manually
            this.immediateEvalFlag.previousIsBiOp = false;
            if (s=='%') {
                rst = handlePercentage(value);
                return rst;
            } else 
            if (s=='/') {
                rst = handleReciprocal(value);
                return rst;
            }
            var s2 = s.replace('(', '');
            if (onePos == 0) rst = this.evalArithmeticExpression(s2+'('+value+')');
            else rst = this.evalArithmeticExpression('('+value+')'+s2);
            return rst;
        } 
        else
        {
            if (numOprands == 2) 
            {
                //if there is storedValue and preOperator, evalue it and put it to the text input
                if (!this.immediateEvalFlag.previousIsBiOp && (this.immediateEvalFlag.storedValue.length>0) && (this.immediateEvalFlag.preOperator.length>0)) {
                    //eval it            
                    rst = this.evalArithmeticExpression('('+this.immediateEvalFlag.storedValue+')' + this.immediateEvalFlag.preOperator + '('+value + ')');
                    this.immediateEvalFlag.preOperator = s;
                    this.immediateEvalFlag.storedValue = rst + ''; 
                    this.immediateEvalFlag.previousIsBiOp = true;         
                    return rst;
                }
                if (this.immediateEvalFlag.previousIsBiOp) {
                    //press operators continuously, just change preOperator
                    this.immediateEvalFlag.preOperator = s;
                } else {
                    this.immediateEvalFlag.storedValue = value + '';
                    this.immediateEvalFlag.preOperator = s;
                }
                this.immediateEvalFlag.previousIsBiOp = true;
                return value;
            }
        }
        return '';
        
        //handle percentage button.
        function handlePercentage(value) 
        {
            var calc = getWorkingCalcInstance();
            if ( (calc.immediateEvalFlag.preOperator=='+') || (calc.immediateEvalFlag.preOperator=='-')|| 
                 (calc.immediateEvalFlag.preOperator=='*')|| (calc.immediateEvalFlag.preOperator=='/') )
            {
                //var rst = parseFloat(storedValue) + '*' + parseFloat(value)/100;
                if (calc.immediateEvalFlag.storedValue.length == 0) return '0';
                var rst = parseFloat(calc.immediateEvalFlag.storedValue) + '*' + parseFloat(value)/100;
                return calc.evalArithmeticExpression(rst);
            }
            return '0';
        }    
            
        function handleReciprocal(value) 
        {
            return 1/value;
        }        
        
}

