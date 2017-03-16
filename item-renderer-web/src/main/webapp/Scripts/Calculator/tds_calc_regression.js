//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
﻿// ******************** Regression Calculator **************************
/*
Currently we support three types of regression models: 
•	Linear regression:  y = a + bx
•	Quadratic regression: y = a + bx + c x*x
•	Exponential regression: y= a* b^x (log linear model)
*   Power regression: y = a * x^b 
*/

//Bais functions for models
var BasisFuncs = {
    constant: function() { return 1;}, //constant
    x: function(x) { return x;},
    xsquare: function (x) { return x * x; },
    logX: function(x) { return Math.log(x); }
    //exp: function(x) { return Math.exp(x)}
}

//List of models and also the id of buttons
var modelList = ['Linear', 'Quadratic', 'Exponential', 'Power']; 
var RegressionModel = [];

/* configration of models
    basis: basis functions used for this model. type is array of functions. 
    presentation: how to present the result for each term. type is array of strings.
    convertY: how to convert data Y. type is function.
    convertResult:how to covert result. type is either a function or an array of functions. 
*/
RegressionModel['Linear'] = {
    basis:[BasisFuncs.x, BasisFuncs.constant], 
    presentation:'({0})x+({1})',
    convertY: null,
    convertResult:null
};
RegressionModel['Quadratic'] = {
    basis:[BasisFuncs.xsquare,BasisFuncs.x, BasisFuncs.constant], 
    presentation: '({0})x^2+({1})x+({2})', 
    convertY: null,
    convertResult:null  
};
//RegressionModel['Exponential'] = {basis:[BasisFuncs.exp, BasisFuncs.constant], presentation:['exp(x)', ''], connector:'+'}; //another model

//Log linear, this is the model TI uses
RegressionModel['Exponential'] = {
    basis:[BasisFuncs.constant, BasisFuncs.x], 
    presentation:'({0})*({1})^x', 
    convertY: function(x) {return Math.log(x)}, 
    convertResult: function(x) { return Math.exp(x)} 
}; 

//Power regression
RegressionModel['Power'] = {
    basis: [BasisFuncs.constant, BasisFuncs.logX],
    presentation: '({0})x^({1})',
    convertY: function (x) { return Math.log(x) },
    convertResult: [function (x) { return Math.exp(x); }, function(x) { return x; } ]
}; 


//main class for Regression
function RegressionCalc(config, parent)
{
    this.config = config;
    this.parent = parent;
    this.maxDataEntry = 50;
    this.textInputIds = [];
    this.dataLabelNames = ['X', 'Y1', 'Y2', 'Y3', 'Y4'];
    this.activeInputArea = undefined;

    this.outputarea = document.getElementById('textinput');
    this.init();
}

RegressionCalc.prototype.getOutputArea = function()
{
    return this.outputarea;
}

RegressionCalc.prototype.setFocus = function () {
    return;
};

RegressionCalc.prototype.getInputArea = function()
{

    if (this.activeInputArea) return document.getElementById(this.activeInputArea);
    //must be focused area, do it later
    for (var i = 0; i < this.textInputIds.length; i++)
    {
        if (document.getElementById(this.textInputIds[i]).hasFocus())
        {
            return document.getElementById(this.textInputIds[i]);
        }
    }
    return document.getElementById(this.textInputIds[0]);
}

RegressionCalc.prototype.setActiveInputArea = function(id)
{
    this.activeInputArea = id;
}

RegressionCalc.prototype.reset = function() {
    this.clearRegressionData();    
}

var RegButtonMap = [];
RegButtonMap.push({id:'Linear', func: doRegressionCalculation});
RegButtonMap.push({id:'Quadratic', func: doRegressionCalculation});
RegButtonMap.push({ id: 'Exponential', func: doRegressionCalculation });
RegButtonMap.push({ id: 'Power', func: doRegressionCalculation });
RegButtonMap.push({id:'regclearall', func: clearRegressDataInput});

//for buttons C, CE and backspace
RegressionCalc.prototype.clearInput = function (id)
{
    var inputarea = this.getInputArea();
    if (id == 'delete')
    {    
        CaretPositionUtils.applyDeleteKeyPress(inputarea);
    }
    else if (id != 'backspace') {
        inputarea.value = '';
    }
    else {
        CaretPositionUtils.applyBackspaceKeyPress(inputarea);
    }   
}

RegressionCalc.prototype.setTextInput = function()
{
    document.getElementById('textinput').setAttribute('style', 'display:block');
    document.getElementById('textinput').setAttribute('readonly', 'readonly');
    document.getElementById('textinput').value = '';
}

RegressionCalc.prototype.focusGained = function(field, event)
{
    if (typeof getWorkingCalcInstance == 'function')
    {
        //bugs https://bugz.airws.org/default.asp?25876
        //https://bugz.airws.org/default.asp?25873
        
        if (this.textInputIds != null && this.textInputIds.length > 0)
        {
            //we will check if field.id is an element which 
            var found = false;
            for (var counter1 = 0; counter1 < this.textInputIds.length; ++counter1)
            {
                if (this.textInputIds[counter1] == field.id)
                {
                    found = true;
                    break;
                }
            }
            if (found)        
                getWorkingCalcInstance().setActiveInputArea(field.id);
            else
            {
                //set to the first element in the array.
                getWorkingCalcInstance().setActiveInputArea(this.textInputIds[0])
            }
        }
        /*
         * fix: https://bugz.airws.org/default.asp?35452#319793
         */
        if (field.id.match('reg-[X|Y]([0-9]*)-1$')) {
            document.getElementById('yNumb').scrollTop = -50;
        }
    }
}

RegressionCalc.prototype._addEventHandlers = function(id)
{
    /** HACK **/
    //TODO: Replace with YUI listeners
    document.getElementById(id).setAttribute('onfocus', 'return CalcFocusGained(this, event)');
    /** HACK **/
}

RegressionCalc.prototype.init = function()
{
    for (var i = 0; i < this.dataLabelNames.length; i++)
    {
        for (var j = 0; j < this.maxDataEntry; j++)
        {
            var id = 'reg-' + this.dataLabelNames[i] + '-' + (j + 1);
            this._addEventHandlers(id);
            this.textInputIds.push(id);
        }
    }

    //buttons
    for (var i = 0; i < RegButtonMap.length; i++)
    {
        var btnObj = document.getElementById(RegButtonMap[i].id);
        if (btnObj)
        {
            YAHOO.util.Event.removeListener(btnObj, "click", RegButtonMap[i].func);
            YAHOO.util.Event.addListener(btnObj, "click", RegButtonMap[i].func);
        }
    }

    // init text focus
    this.parent.textInputFocusInit(this.textInputIds);

}

//set init shortcut element
RegressionCalc.prototype.setInitKeyboardElement = function() {
    //init shortcut focused input
    //document.getElementById('reg-X-1').focus();
    var initialInput = document.getElementById('reg-X-1');
    setTimeout(function() {
        FocusUtils.setCalcFocus(initialInput);
    }, 0); // in FF2.0, the onFocus() is triggered as soon as focus() is called (in the same stack frame) which we dont want to happen.
    this.parent.keyboardNav.curRegion = 'yNumb';
    this.parent.keyboardNav.RegionIndex = getRegionDivsByMode(CalcModeList['Regression']).length - 1; //CalcKeyboardRegionDivs['Regression'].length-1;
    this.parent.keyboardNav.curElement = 'reg-X-1';

};

/* get data from data input fields and return as a vector
    xy: x or Y1, Y2, Y3, Y4
*/
RegressionCalc.prototype.getData = function(xy)
{
    var data = [];
    for (var i=0; i<this.maxDataEntry; i++) 
    {
        var id = 'reg-' + xy + '-' + (i+1);
        var value = document.getElementById(id).value;
        if (value == '') break;
        var expRst = this.parent.evalExpression(value);
        if ((expRst+'').indexOf('error')!=-1) return 'Input Data error';
        data.push(expRst);
    }
    return $V(data);
}

//clear all data input fields
function clearRegressDataInput()
{
    var calc = getWorkingCalcInstance();
    if (calc != null && typeof calc.clearRegressionData == 'function')
        calc.clearRegressionData();
}

RegressionCalc.prototype.clearRegressionData = function() {
    for (var i = 0; i < this.dataLabelNames.length; i++) {
        for (var j = 0; j < this.maxDataEntry; j++) {
            var idName = 'reg-' + this.dataLabelNames[i] + '-' + (j + 1);
            document.getElementById(idName).value = '';
        }
    }
    this.setActiveRegressionButton(null);
    this.getOutputArea().value = '';
};

//process arithmetic botton press
RegressionCalc.prototype.buttonPressProcess = function(e)
{
    var id;
    if (typeof(e) == 'object') {
        var target = YAHOO.util.Event.getTarget(e);
        id = target.id;
    } else {
        id = e;
        if (applyFuncFromButtonMap(RegButtonMap, id)) return;
    }

    if (id == 'sign') {
        getTDSCalc().flip_sign(e);
        return;
    }

    var s = document.getElementById(id).getAttribute('val');
    if (s == null) return;
    
    var new_contents = this.getInputArea().value;   
    if (new_contents.length < getMaxInputLen(this.getInputArea())) 
        CaretPositionUtils.insertCharacter(this.getInputArea(), s);    
    
    // fix https://bugz.airws.org/default.asp?65824
    FocusUtils.setCalcFocus(this.getInputArea(), e);
}

//arithmetic calculation for data expression 
RegressionCalc.prototype.doCalculation = function() 
{
    var expression = this.getInputArea().value;
    if (expression == '') return;
    var rst = this.parent.evalExpression(expression) + '';
    if (rst.indexOf('error')!= -1) this.getInputArea().value = 'Error';
    else this.getInputArea().value = rst;
}

//Clear remaining focus visual indication (blue border)
RegressionCalc.prototype.clearFocus = function (divsMap) {
    clearFocus(divsMap);
};

/*
 * behaves exactly as the c# string.format routine.
 */
function getPresentationString(params, presentationString) {
 
        if (params == null) return presentationString;

        for (var i = 0, l = params.length; i < l; ++i)
        {
            var reg = new RegExp("\\{" + i + "\\}", "g");
            presentationString = presentationString.replace(reg, '' + params[i]);
        }

        return presentationString;

}

//main function that perform regression
function doRegressionCalculation(e)
{
    var id;
    var calc = getWorkingCalcInstance();
    
    if (typeof(e) == 'object')
    {
        var target = YAHOO.util.Event.getTarget(e);
        calc.setActiveRegressionButton(target.id);
        id = target.id;
    } else
    {
        calc.setActiveRegressionButton(e);
        id = e;
    }
  
    var model= RegressionModel[id];
    
    var X = calc.getData('X');
    if (typeof(X)!='object') {
        calc.getOutputArea().value = 'Invalid data in X';
        return;
    }
    if (model.basis.length > X.elements.length) {
        calc.getOutputArea().value = 'Insufficient Data';
        return;
    }
    calc.getOutputArea().value = '';
    for (var j=1; j< calc.dataLabelNames.length; j++)
    {
        var Y = calc.getData(calc.dataLabelNames[j]);
        if (typeof(Y)!='object') {
            calc.getOutputArea().value = 'Invalid data in '+ calc.dataLabelNames[j];
            return;
        }
        if (Y.elements.length == 0) continue;
        
        try {
            var rst = calc.doRegression(model, X, Y);
            
            var isInappropriateData = false;
            for (var i=0; i<rst.elements.length; i++) {
                var parameter = calc.parent.processE(rst.elements[i]);
                if ((parameter+'' == 'NaN')||(parameter+'' == 'Infinity')) {
                    isInappropriateData = true;
                    break;
                }
                rst.elements[i] = parameter;
            }

            var str = '';
            if (isInappropriateData)
                str = 'Inappropriate data';
            else        
                str = getPresentationString(rst.elements, model.presentation);
            calc.getOutputArea().value += calc.dataLabelNames[j] + '=' + str + '\n'; //rst.elements + '';
        } catch (ex) {
            calc.getOutputArea().value += calc.dataLabelNames[j] + '= input data error\n';
        }
    }    
}

RegressionCalc.prototype.setActiveRegressionButton = function (modelId)
{    
    for (var i = 0; i < modelList.length; i++)
    {
        var modelNode = document.getElementById(modelList[i]);
        if (YAHOO.util.Dom.hasClass(modelNode, 'active')) YAHOO.util.Dom.removeClass(modelNode, 'active');
    }
    if (modelId != null)
    {
        var activeCurNode = document.getElementById(modelId);
        if (activeCurNode) YAHOO.util.Dom.addClass(activeCurNode, 'active');
    }
}

/* Actual regression calculation
    model: model object
    vX: vector X data
    vY: vector Y data
*/
RegressionCalc.prototype.doRegression = function (model, vX, vY) {
    //construct design matrix
    var dM = [];
    for (var i = 0; i < vX.elements.length; i++) {
        var dV = [];
        for (var j = 0; j < model.basis.length; j++) {
            dV.push(model.basis[j](vX.e(i + 1)));
        }
        dM.push(dV);
    }

    //check vY needs to be converted. Applies only to exponential model 
    if (model.convertY != null) {
        for (var i = 0; i < vY.elements.length; i++)
            vY.elements[i] = model.convertY(vY.elements[i]);
    }

    //calcuation results:
    var dMatrix = new $M(dM);
    if (dMatrix.determinant() == 0) throw "Singular matrix";
    var gramT = dMatrix.transpose().multiply(dMatrix);
    var MM = gramT.inverse().multiply(dMatrix.transpose());
    var rst = MM.multiply(vY);

    //check if result needs to be converted. Applies only to exponential model
    if (model.convertResult != null) {

        /*
        * convertResult may be just a function or an array of functions.
        * if a convertResult function has been defined then apply it to elements in the result set.
        * else if convertResult is an array of functions then apply according to the index positions.
        */
        if (model.convertResult instanceof Function) {
            for (var i = 0; i < rst.elements.length; i++)
                rst.elements[i] = model.convertResult(rst.elements[i]);
        }
        else if (model.convertResult instanceof Array) {
            /*
            * each element of convertResult is an array and needs to have as many elements as the result set.
            */
            for (var i = 0; i < rst.elements.length; i++)
                rst.elements[i] = model.convertResult[i](rst.elements[i]);
        }
    }

    //fix https://bugz.airws.org/default.asp?58590
    if (typeof rst.elements != 'undefined') {
        for (var i = 0; i < rst.elements.length; i++) {
            rst.elements[i] = PreciseUtils.setResultPrecision(rst.elements[i], 2);
        }
    } else {
        /*
         * this case should never happen. 
        rst = PreciseUtils.setResultPrecision(rst, 2);
        */
        throw new Error("Illegal operation in regression: expected Matrix, got " + typeof(rst));
    }

    return rst;
}