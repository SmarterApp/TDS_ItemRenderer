//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
﻿//***************** Graphing Calculator ****************************

/*

TDS  graphing calculator allows students to draw graphs of 4 functions at the same time. Also, 
students can adjust starting position of graphs  and see function value pairs  (x,y) from a table. 
We choose  HTML5 canvas to these graphs.  For year 2011, we will also support “Trace” function.
There are many parameters that control graph regions and other functionalities for graphing calculator.  
•	Canvas width and height: 280*280, or if defined differently from html
•	Xmin, Xmax, Ymin, ymax:  these are parameters that define the graph region and this region is 
    mapped to entire cavas
•	zoomScale: 1.2 and maxZoom = 8, minZoom = 0.12
•	initX: the starting x value of table that shows function value pair (x,y)
•	initXY = 5: total number of data shown each time in data table.
•	Xscale, Yscale: scaling of X,Y coordinates
•	Trace step size: distance of trace moving on x axis

*/
function GraphingCalc(config, parent)
{
    this.config = config;
    this.textCTX;
    this.parent = parent;
    this.trace = {flag: false, equationIndex: -1, offset: 0};
    this.lazyEvaluation = config.lazyEvaluation;
    
    this.viewDivIds = ['equations', 'graphwindow', 'datatableHolder', 'canvasHolder', 'grapherrorholder'];
    //graphing calc has four views that students can input equations, adjust parameters, check data value and draw graphs
    this.views = ['yequalview', 'windowview', 'tableview', 'graphview'];
    this.equationsIds = []; //'equa1', 'equa2', 'equa3', 'equa4'
    
    this.canvas_width = 280;
    this.canvas_height = this.canvas_width;
    this.heightAdjust = 0;
    
    this.initXY = 5;
    this.xMinDisplaySize = this.canvas_width/10;
    this.yMinDisplaySize = this.xMinDisplaySize;
    
    this.xminX= 0-this.initXY;
    this.xmaxX=this.initXY;
    this.yminY=0-this.initXY;
    this.ymaxY=this.initXY;    
    
    this.zoom=1;
    this.maxZoom=8;
    this.minZoom=0.12;
    this.zoomScale = 1.2;

    this.numDisplayData = 5;
    this.xPos;

    //radian/degree radio button value, default as 'degrees'
    this.radianOrDegree = 'degrees';

    this.textInputIds = []; //'equa1', 'equa2', 'equa3', 'equa4', 'xmin', 'xmax', 'ymin', 'ymax', 'initX'

    this.activeInputArea = undefined;
    
    this.init();
}

GraphingCalc.prototype.setFocus = function () {
    return;
};

GraphingCalc.prototype.setRadianOrDegree = function (rd) {
    this.radianOrDegree = rd;
};

GraphingCalc.prototype.getRadianOrDegree = function () {
    return this.radianOrDegree;
};

GraphingCalc.prototype.getInputArea = function()
{
    if (this.activeInputArea) return document.getElementById(this.activeInputArea);
    
    for (var i=0; i<this.viewDivIds.length; i++) {
        var elStyle = document.getElementById(this.viewDivIds[i]).style;
        if (elStyle.display == 'block') {
            if ((i==3) || (i==4)) return null;
            break;
        }
    }

    //must be focused area, do it later
    for (var i=0; i<this.textInputIds.length; i++) {
        if (document.getElementById(this.textInputIds[i]).hasFocus()) 
        {
            //var style = document.getElementById(this.textInputIds[i]).style;
            return document.getElementById(this.textInputIds[i]);
        }
    }
    return document.getElementById(this.textInputIds[0]);
}

GraphingCalc.prototype.setActiveInputArea = function(id) {
    this.activeInputArea = id;
}

GraphingCalc.prototype.focusGained = function(field, event) {
    if (typeof getWorkingCalcInstance == 'function') {
        getWorkingCalcInstance().setActiveInputArea(field.id);
    }
}

//do instant calculation for 'Window' tab inputs, about 'pi'
GraphingCalc.prototype.focusLost = function (field, event) {
    if (getTDSCalc().getFirstCharCode(field.value, 960) > -1) { //Pi
        field.value = getFixedResult(this.parent.evalExpression(field.value));
    }
}

GraphingCalc.prototype.reset = function() {
    this.clearInput('C');
    this.graphCalcReset();   
};

var graphingButtonMap = [];
graphingButtonMap.push ({id:'calczoomin', func: graphCalcZoom});
graphingButtonMap.push ({id:'calczoomout', func: graphCalcZoom});
graphingButtonMap.push({ id: 'toggleTrace', func: toggleTrace });
graphingButtonMap.push({ id: 'toggleScroll', func: toggleTrace });
graphingButtonMap.push ({id:'resetgraph', func: graphCalcResetGlobal});
graphingButtonMap.push ({id:'previous5', func: graphCalcSetDataStartingPos});
graphingButtonMap.push ({id:'next5', func: graphCalcSetDataStartingPos});
graphingButtonMap.push ({id:'applytb', func: graphCalcApplyInitX});
graphingButtonMap.push ({id:'up', func: graphCalcMoveAxis});
graphingButtonMap.push ({id:'down', func: graphCalcMoveAxis});
graphingButtonMap.push ({id:'left', func: graphCalcMoveAxis});
graphingButtonMap.push ({id:'right', func: graphCalcMoveAxis});

graphingButtonMap.push ({id:'yequalview', func: setGraphView});
graphingButtonMap.push ({id:'windowview', func: setGraphView});
graphingButtonMap.push ({id:'tableview', func: setGraphView});
graphingButtonMap.push ({id:'graphview', func: setGraphView});

function graphCalcResetGlobal()
{
    if (getWorkingCalcInstance() != null && typeof getWorkingCalcInstance().graphCalcReset == 'function')
        getWorkingCalcInstance().graphCalcReset();
}


GraphingCalc.prototype.clearInput = function(id)
{
    var inputarea = getWorkingCalcInstance().getInputArea();
    if (inputarea == null) return;
    if (id == 'delete')
    {    
        CaretPositionUtils.applyDeleteKeyPress(inputarea);
    }
    else if (id != 'backspace') {
        inputarea.value = '';
        if (id == 'C') {
            document.getElementById('memorystatus').value = '';
            document.getElementById('memorystatusStandard').value = '';
            memoryValue = '';
            var RCLBtn = document.getElementById("RCL");
            if (!YAHOO.util.Dom.hasClass(RCLBtn, 'disabled')) YAHOO.util.Dom.addClass(RCLBtn, 'disabled');
            
        }        
    }
    else {
        CaretPositionUtils.applyBackspaceKeyPress(inputarea);
    }
}

GraphingCalc.prototype.setTextInput = function()
{
    // test input for graphing comes from the expressions. But we do need to set the main text output to read only to show the X,Y coord during tracing    
    document.getElementById('textinput').setAttribute('readonly', 'readonly');
}

//init graphing calc
GraphingCalc.prototype.init = function(e)
{
    
    var equaNode = document.getElementById('equations');
    var inNodes = equaNode.getElementsByTagName('input');
    for (var i=0; i<inNodes.length; i++) {
        this.equationsIds.push(inNodes[i].getAttribute('id'));
        this.textInputIds.push(inNodes[i].getAttribute('id'));
    }

    this.textInputIds.push('xmin');
    this.textInputIds.push('xmax');
    this.textInputIds.push('xscale');
    this.textInputIds.push('ymin');
    this.textInputIds.push('ymax');
    this.textInputIds.push('yscale');
    this.textInputIds.push('initX');
    this.textInputIds.push('tracestepsize');
    
    for (var i=0; i<graphingButtonMap.length; i++) {
        var btn = document.getElementById(graphingButtonMap[i].id);
        if (btn) {
            if(btn.type != 'radio') btn.style.display = "block";
            YAHOO.util.Event.removeListener(btn, "click", graphingButtonMap[i].func);
            YAHOO.util.Event.addListener(btn, "click", graphingButtonMap[i].func);
        }
    }
    
    this.parent.textInputFocusInit(this.textInputIds);
    
    //set graphing calc to the first view, equation
    this.setGraphViewById(this.viewDivIds[0],this.views[0]);
}

GraphingCalc.prototype.setInitKeyboardElement = function() {
    this.parent.keyboardNav.curRegion = 'yequalview';
    this.parent.keyboardNav.RegionIndex = 7;
    this.parent.keyboardNav.curElement = 'equa1';
    var initialInput = document.getElementById('equa1');
    setTimeout(function() {
        FocusUtils.setCalcFocus(initialInput);
    }, 0); // in FF2.0, the onFocus() is triggered as soon as focus() is called (in the same stack frame) which we dont want to happen.
};

//Get tracestep size. Default is 4 or get from window parameter
GraphingCalc.prototype.getTraceStepSize = function()
{
    var defaultSize = 4;
    var stepSize = document.getElementById('tracestepsize').value;
    if (stepSize == '') return defaultSize;
    var size = defaultSize;
    try {
        size = getFixedResult(stepSize);
    } catch (ex) {
        size = defaultSize;
    }
    return size;
    
}

//Clear remaining focus visual indication (blue border)
GraphingCalc.prototype.clearFocus = function(divsMap) {
    clearFocus(divsMap);
};

/* Trace navigation. 
    left/right: moving trace to left or right with trace step size
    up/down: switch to a different function. 
*/
function TraceNavigation(direction) {

    if (!getWorkingCalcInstance().trace.flag) return false;
    var calc = getWorkingCalcInstance();
    /*
     * fix https: //bugz.airws.org/default.asp?35434#281009:
     * if Trace was not applied return false. else return true.
     */
    var ids = getNoneEmptyEquationIds();
    if (ids.length == 0)
        return false;
    switch (direction) {
        case 'left': 
            calc.trace.offset = getFixedResult(calc.trace.offset - calc.getTraceStepSize());
            break;
        case 'right':
            calc.trace.offset = getFixedResult(calc.trace.offset + calc.getTraceStepSize());
            break;
        case 'up': 
            if (ids.length > 0) {
                var curIndex = calc.trace.equationIndex;
                var found = false;
                for (var i=0; i<ids.length; i++)
                    if (ids[i] == curIndex) {
                        found = true;
                        break;
                    }
                if (!found) calc.trace.equationIndex = ids[0];
                else {
                    if (i!=0) calc.trace.equationIndex = ids[i-1];
                    else calc.trace.equationIndex = ids[ids.length-1];
                }
            }
            break;
        case 'down':
            if (ids.length > 0) {
                var curIndex = calc.trace.equationIndex;
                var found = false;
                for (var i=0; i<ids.length; i++)
                    if (ids[i] == curIndex) {
                        found = true;
                        break;
                    }
                if (!found) calc.trace.equationIndex = ids[0];
                else {
                    if (i!=ids.length-1) calc.trace.equationIndex = ids[i+1];
                    else calc.trace.equationIndex = ids[0];
                }
            }

            break;
            
    }
    calc.calc_draw_graph();
    
    function getNoneEmptyEquationIds()
    {
        var calc = getWorkingCalcInstance();
        var ids = [];
        for (var i=0; i<calc.equationsIds.length; i++)
        {
            if (document.getElementById(calc.equationsIds[i]).value != '') ids.push(i);
        }
        return ids;
    }

    return true;
}

//process arithmetic botton press
GraphingCalc.prototype.buttonPressProcess = function(e)
{
    var id;
    if (typeof(e) == 'object') 
    {
        var target = YAHOO.util.Event.getTarget(e);
        //preventing from click on the <sup> inside the <a>
        if (target.nodeName == 'SUP') {
            target = target.parentNode;
        }
        id = target.id;
    } else {
        if (applyFuncFromButtonMap(graphingButtonMap,e)) return;
        id = e;
    }
    
    if (id == 'sign') {
        getTDSCalc().flip_sign(e);
        return;
    }
    
    var element =  document.getElementById(id);
    var s = element.getAttribute('val');
    if ((s == null)||(this.getInputArea()==null)) return;

    var curInput = this.getInputArea();

    var new_contents = curInput.value;   
    if (new_contents.length < getMaxInputLen(curInput, s)) {
        // check fractional part length
        if (PreciseUtils.validatedInputFractionalPartLen(curInput, s)) {
            CaretPositionUtils.insertCharacter(curInput, s);
        }
    }

    // fix https://bugz.airws.org/default.asp?65824
    /*
     * the following bug fix was redone to account for touch tablets.   
    // Fix for https://bugz.airws.org/default.asp?22198
    //this.getInputArea().focus();
    */
    FocusUtils.setCalcFocus(this.getInputArea(), e);
    
}

GraphingCalc.prototype.resetTraceParams = function()
{
    this.trace.flag = false;
    this.trace.equationIndex = -1;
    this.trace.offset = 0;
}

//arithmetic calculation for data expression 
GraphingCalc.prototype.doCalculation = function(e)
{
    var currentInputArea = this.getInputArea();
    if (currentInputArea == null) return;
    var expression = currentInputArea.value;
    if (expression == '') return;
    if (expression.indexOf('x') == -1) currentInputArea.value = getFixedResult(this.parent.evalExpression(expression));

}

//xmin, ymin, xmax, ymax changes 
function graphCalcMoveAxis(e) {
    
    var id;
    if (typeof(e) == 'object') 
    {
        var target = YAHOO.util.Event.getTarget(e);    
        id = target.id;
    } else id = e;
    
    var size = 1;
    var traceAdjust = getWorkingCalcInstance().canvas_width/(getWorkingCalcInstance().getCanvasWindowRange('xmax') - getWorkingCalcInstance().getCanvasWindowRange('xmin'))

    // add trace control for trace toggle button
    var toggleTrace = document.getElementById('toggleTrace').checked;
    if (toggleTrace) {
        TraceNavigation(id);
        return;
    }
    
    switch (id) {
        case 'up':
            getWorkingCalcInstance().setCanvasWindowRange('ymin', getFixedResult(getWorkingCalcInstance().getCanvasWindowRange('ymin')+size));
            getWorkingCalcInstance().setCanvasWindowRange('ymax', getFixedResult(getWorkingCalcInstance().getCanvasWindowRange('ymax')+size));            
            break;
        case 'down':
            getWorkingCalcInstance().setCanvasWindowRange('ymin', getFixedResult(getWorkingCalcInstance().getCanvasWindowRange('ymin')-size));
            getWorkingCalcInstance().setCanvasWindowRange('ymax', getFixedResult(getWorkingCalcInstance().getCanvasWindowRange('ymax')-size));              
            break;
        case 'left':
            getWorkingCalcInstance().trace.offset += traceAdjust;
            getWorkingCalcInstance().setCanvasWindowRange('xmin', getFixedResult(getWorkingCalcInstance().getCanvasWindowRange('xmin')-size));
            getWorkingCalcInstance().setCanvasWindowRange('xmax', getFixedResult(getWorkingCalcInstance().getCanvasWindowRange('xmax')-size));
            break;
        case 'right':
            getWorkingCalcInstance().trace.offset -= traceAdjust;
            getWorkingCalcInstance().setCanvasWindowRange('xmin', getFixedResult(getWorkingCalcInstance().getCanvasWindowRange('xmin')+size));
            getWorkingCalcInstance().setCanvasWindowRange('xmax', getFixedResult(getWorkingCalcInstance().getCanvasWindowRange('xmax')+size));
            break;
    }
    getWorkingCalcInstance().calc_draw_graph();
}

//solve the float subtraction inaccurate issue
function getFixedResult(result) {
    if (result.toString().indexOf('.') > -1) {
        // toString() and parseFloat() to get rid of the trailing 0 for float number
        return parseFloat(parseFloat(result).toFixed(2).toString());
    }
    return parseInt(result);
}

//next or previous button pressed. show next 5 or previous 5 data
function graphCalcSetDataStartingPos(e)
{
    var id;
    if (typeof(e) == 'object') 
    {
        var target = YAHOO.util.Event.getTarget(e);
        id = target.id;
    } else {
        id = e;
    }
    if (id == 'previous5') getWorkingCalcInstance().xPos -= getWorkingCalcInstance().numDisplayData;
    else getWorkingCalcInstance().xPos += getWorkingCalcInstance().numDisplayData;
    getWorkingCalcInstance().showGraphingTable();
}

//Reset initX value
function graphCalcApplyInitX(e) {

    var value = getFixedResult(getTDSCalc().translate_negative(document.getElementById('initX').value)).toString();
    
    if (!isValidNumber(value)) {
        getWorkingCalcInstance().showErrorMessage('Invalid init X', 'initX');
        return;    
    }

    getWorkingCalcInstance().xPos = parseFloat(value);
    getWorkingCalcInstance().showGraphingTable();
}

//reset graphing calc parameters to default
GraphingCalc.prototype.graphCalcReset = function() {
    this.resetTraceParams();
    this.zoom = 1;

    // reset radian/degree radio button when page hide
    this.radianOrDegree = 'degrees';
    resetRadianDegree(this.radianOrDegree);

    this.setCanvasWindowRange('xmin', this.xminX);
    this.setCanvasWindowRange('xmax', this.xmaxX);
    this.setCanvasWindowRange('ymin', this.yminY);
    this.setCanvasWindowRange('ymax', this.ymaxY);

    document.getElementById('initX').value = this.xminX;
    //document.getElementById('zoomlevel').value = '1';
    document.getElementById('xscale').value = '1';
    document.getElementById('yscale').value = '1';
    document.getElementById('tracestepsize').value = '4';
    this.xPos = this.xminX;
    for (var i = 0; i < this.equationsIds.length; i++) {
        document.getElementById(this.equationsIds[i]).value = '';
        document.getElementById("equations-select-" + (i + 1)).selectedIndex = 0;
    }

    //Clear the text area used to show the coordinates for trace
    document.getElementById('textinput').value = '';

    this.graphing_Canvas_init();

    this.setGraphViewById(this.viewDivIds[0], null, this.views[0]);
};

//graphing zooming
function graphCalcZoom(e)
{
    var id;

    if (typeof(e) == 'object') 
    {
        var target = YAHOO.util.Event.getTarget(e);
        id = target.id;
    } else {
        id = e;
    }
    switch (id) {
        case 'calczoomin':
            if (getWorkingCalcInstance().zoom < getWorkingCalcInstance().maxZoom) {
                getWorkingCalcInstance().zoom *= getWorkingCalcInstance().zoomScale;
                //document.getElementById('zoomlevel').value = getWorkingCalcInstance().zoom;
            }
            break;
  
        case 'calczoomout':
            if (getWorkingCalcInstance().zoom > getWorkingCalcInstance().minZoom) {
                getWorkingCalcInstance().zoom /= getWorkingCalcInstance().zoomScale;
                //document.getElementById('zoomlevel').value = getWorkingCalcInstance().zoom;
            }
            break;
    }     
    getWorkingCalcInstance().calc_draw_graph();
}

//toggle trace 
function toggleTrace(e) {
    
    var curTarget;

    if (typeof (e) == "object") curTarget = e.target.value;
    else {
        curTarget = e;
        /*
        var browserInfo = BrowserDetect.browser;
        var eventTarget = document.getElementById(e);
        if(browserInfo == 'Chrome'||browserInfo == 'Safari') {
            YAHOO.util.Dom.setAttribute(eventTarget, 'checked', 'checked');
        }
        */
    }

    if (curTarget == 'toggleScroll') {
        getWorkingCalcInstance().resetTraceParams();
    } else {
        getWorkingCalcInstance().trace.flag = true;
        getTDSCalc().keyboardNav.curRegion = 'graphview';
        getTDSCalc().keyboardNav.curElement = 'toggleTrace';
        getTDSCalc().keyboardNav.RegionIndex = 2;
        //document.getElementById('toggleTrace').focus();
    }
    getWorkingCalcInstance().calc_draw_graph();
}

//GraphingCalc.prototype.resetGraphingKeyboardRegionDiv = function()
//{
//    for (var j=0; j<this.views.length; j++)
//    {
//        var regionDivs = getRegionDivsByMode(getCurCalcMode());
//        //if (CalcKeyboardRegionDivs['Graphing'][CalcKeyboardRegionDivs['Graphing'].length-1] == this.views[j]) 
//        if (regionDivs[regionDivs.length-1] == this.views[j]) 
//        {
//            regionDivs.pop();
//            break;
//        }
//    }
//}

//The shortcut region needs to be updated when a graphing view is changed
GraphingCalc.prototype.updateGraphViewRegion = function(newRegion) {
    var calcMode = CalcModeList['Graphing'];
    if (this.config.name == 'GraphingInv') {
        calcMode = CalcModeList['GraphingInv'];
    }
    var regionDivs = getRegionDivsByMode(calcMode);
    //for (var i=0; i<CalcKeyboardRegionDivs['Graphing'].length; i++)
    for (var i=0; i<regionDivs.length; i++)
    {
        for (var j=0; j<this.views.length; j++)
        {
            if (regionDivs[i] == this.views[j]) {
                regionDivs[i] = newRegion;
                return;
            }
        }
    }
    regionDivs.push(newRegion);
}

//function that sets graphing to a different view
function setGraphView(e) 
{
    var id;
    if (typeof(e) == 'object') 
    {
        var target = YAHOO.util.Event.getTarget(e);
        id = target.id;
    } else {
        id = e;
    }
    var j;      
    for (j=0; j<getWorkingCalcInstance().views.length; j++) {
        if (id == getWorkingCalcInstance().views[j]) break;
    }
    
    getWorkingCalcInstance().setGraphViewById(getWorkingCalcInstance().viewDivIds[j], id);
}

// update 'active' graphmode
GraphingCalc.prototype.setActiveGraphViewStyle = function(id)
{
	if (id == null) id = "yequalview";
	
  var graphModes = document.getElementById("graphmodes").getElementsByTagName("a");
  for (var i = 0; i < graphModes.length; i++)
  {
  	var btnGraphMode = graphModes[i];
  	if (btnGraphMode.id == id) {
  		YAHOO.util.Dom.addClass(btnGraphMode, "active");
  	}
  	else {
  		YAHOO.util.Dom.removeClass(btnGraphMode, "active");
  	}
  }
}

//function sets graphing to a different view by the id of the view
GraphingCalc.prototype.setGraphViewById = function(vid, id) {
    this.setActiveGraphViewStyle(id);
    this.cleanDataTable();
    for (var i = 0; i < this.viewDivIds.length; i++) {
        var elStyle = document.getElementById(this.viewDivIds[i]).style;
        elStyle.display = 'none';
    }
    document.getElementById(vid).style.display = 'block';

    //if (reachableElements.length>0) setGraphNavElements(el);
    if (vid == this.viewDivIds[0]) {
        document.getElementById(this.equationsIds[0]).focus();
        if (!document.getElementById(this.equationsIds[0]).hasFocus())
            document.getElementById(this.equationsIds[0]).focused = true;

    }
    if (vid == this.viewDivIds[1]) {
        document.getElementById('xmin').focus();
    }

    if (vid == this.viewDivIds[2]) {
        this.showGraphingTable();
        document.getElementById('initX').focus();

    }

    // this traceToggle line is to fix https://bugz.airws.org/default.asp?65651
    document.getElementById('graphControls').style.visibility = 'hidden';
    document.getElementById('traceToggle').style.visibility = 'hidden';
    
    if (vid == this.viewDivIds[3]) {
        if (this.calc_draw_graph()) {
            document.getElementById('graphControls').style.visibility = 'visible';
            document.getElementById('traceToggle').style.visibility = 'visible';
            
            // the following 3 lines fix https://bugz.airws.org/default.asp?65765
            document.getElementById("toggleTrace").checked = false;
            toggleTrace('toggleScroll');
            document.getElementById("toggleScroll").checked = true;
        }
        //this is the error div: do not allow inputfields to be modified.
        this.setActiveInputArea(null);
    }

    if (vid == this.viewDivIds[4]) {
        //this is the graph canvas div: do not allow inputfields to be modified.
        document.getElementById('graphControls').style.visibility = 'hidden';
        document.getElementById('traceToggle').style.visibility = 'hidden';
        this.setActiveInputArea(null);
    }

    //keyboard 
    if (id != null) {
        this.updateGraphViewRegion(id);
        this.parent.keyboardNav.curRegion = id;
        
        //define calcMode to support GraphingInv mode
        var calcMode = CalcModeList['Graphing'];
        if (this.config.name == 'GraphingInv') {
            calcMode = CalcModeList['GraphingInv'];
        }
        
        //calc.parent.keyboardNav.RegionIndex = CalcKeyboardRegionDivs['Graphing'].length-1;
        this.parent.keyboardNav.RegionIndex = getRegionDivsByMode(calcMode).length - 1;
        //alert ('default: ' + elementInRegion[CalcModeList['Graphing'] + '-'+id +'-default'].id);
        this.parent.keyboardNav.curElement = elementInRegion[calcMode + '-' + id + '-default'].id;
        document.getElementById(this.parent.keyboardNav.curElement).focus();
    }
};

//validation of data entries before drawing graph
GraphingCalc.prototype.validateGraphingData = function(table) 
{
    var error1 = "You have an error: ";
    var error2 = ". Please correct it or click reset button to start over";
    //xmin, max
    var minMaxIds = ['xmin', 'xmax', 'ymin', 'ymax'];
    for (var i=0; i<minMaxIds.length; i++) {
   
        if (!isValidNumber(document.getElementById(minMaxIds[i]).value)) {
            document.getElementById('errorcontent').innerHTML = error1 + "invalid Xmin/Xman/Ymin/Ymax" + error2;
            this.setGraphViewById('grapherrorholder');
            return false;
        }
    }

    var xmin = parseFloat(document.getElementById(minMaxIds[0]).value);
    var xmax = parseFloat(document.getElementById(minMaxIds[1]).value);
    var ymin = parseFloat(document.getElementById(minMaxIds[2]).value);
    var ymax = parseFloat(document.getElementById(minMaxIds[3]).value);
    
    if ((xmin >= xmax)||(ymin>=ymax)) {
        document.getElementById('errorcontent').innerHTML = error1 + "Xmax/Ymax is less than or equal to Xmin/Ymin" + error2;
        this.setGraphViewById('grapherrorholder');
        return false;    
    }
    
    //if ( (!isInteger(xmin+''))||(!isInteger(xmax+''))||(!isInteger(ymin+''))||(!isInteger(ymax+'')) ){
    //    document.getElementById('errorcontent').innerHTML = error1 + "Xmax/Ymax/Xmin/Ymin must be integer " + error2;
    //    this.setGraphViewById('grapherrorholder');
    //    return false;       
    //}
    
    var trace = parseFloat(document.getElementById('tracestepsize').value);
    var xscale = parseFloat(document.getElementById('xscale').value);
    var yscale = parseFloat(document.getElementById('yscale').value);

    if ( (!isValidNumber(trace+''))||(!isValidNumber(xscale+''))||(!isValidNumber(yscale+'')) ){
        document.getElementById('errorcontent').innerHTML = error1 + "Trace/Xscale/Yscale/Ymin must be a valid number " + error2;
        this.setGraphViewById('grapherrorholder');
        return false;       
    }  else {
        if ((xscale <=0) || (yscale <=0) || (trace <=0)) {
            document.getElementById('errorcontent').innerHTML = error1 + "Invalid Trace/Xscale/Yscale" + error2;
            this.setGraphViewById('grapherrorholder');
            return false;            
        }
    }  
    
    //initX
    if (!isValidNumber(document.getElementById('initX').value)) {
        if (table) {
            this.showErrorMessage('Invalid init X', 'initX');
        } else {
            document.getElementById('errorcontent').innerHTML = error1 + "invalid Init X" + error2;
            this.setGraphViewById('grapherrorholder');
        }
        return false;     
    }
    
    for (var i=0; i<this.equationsIds.length; i++) {
        var rst;
        var value = document.getElementById(this.equationsIds[i]).value;
        if (value.length > 0) {
            try {
                if (value.indexOf('x')==-1)
                    rst = this.parent.evalExpression(value);
                else {
                    // if the expression including variable 'x', skip the validation. fixing bug: https://bugz.airast.org/default.asp?85224#430710
                    return true;
                }
                if ((rst!=Infinity) && (rst != -Infinity) && (!isValidNumber('' + rst))) {
                    document.getElementById('errorcontent').innerHTML = error1 + "invalid Y" + (i+1) + " expression" + error2;
                    this.setGraphViewById('grapherrorholder');
                    return false;              
                }
            } catch (ex) {
                    document.getElementById('errorcontent').innerHTML = error1 + "invalid Y" + (i+1) + " expression" + error2;
                    this.setGraphViewById('grapherrorholder');
                    return false;               
            }
        }
    }
    
    return true;

}

    function isValidNumber(inpString) {
        var str = getTDSCalc().translate_negative(inpString) + '';
        var ePos = str.indexOf('e');
        if (ePos != -1) {
            var first = /^[-+]?\d+(\.\d+)?$/.test(str.substring(0,ePos));
            var second = /^[-+]?\d+(\.\d+)?$/.test(str.substring(ePos+1));
            return (first && second);
        }
        return /^[-+]?\d+(\.\d+)?$/.test(str);
    }
    
    function isInteger(val)
    {
        //alert(val.value);
        val = getTDSCalc().translate_negative(val);
        if(val==null)
        {
            return false;
        }
        if (val.length==0)
        {
            return false;
        }
        for (var i = 0; i < val.length; i++) 
        {
            var ch = val.charAt(i)
            if (i == 0 && ch == "-")
            {
                continue;
            }
            if (ch < "0" || ch > "9")
            {
                return false;
            }
        }
        return true;
    }    

//function that draws the graph
    GraphingCalc.prototype.calc_draw_graph = function()
    {
        // 'refresh' the canvasElement programmingly to solve the canvas refreshing issue on android 4.1 and lower version, aka, erase the old coordinate axis when re-draw
        var canvasElement = document.getElementById('canvas');
        if (BrowserUtils.isAndroid()) {
            canvasElement.setAttribute('style', 'display:none');
            canvasElement.setAttribute('style', 'display:block');
        }

        if (!this.validateGraphingData(false)) return false;
        var ctx = this.getCanvasCTX(true);
        ctx.clearRect(0, 0, this.canvas_width, this.canvas_height);

        this.graphing_Canvas_init();
        for (var i = 0; i < this.equationsIds.length; i++)
        {
            if (document.getElementById(this.equationsIds[i]).value.length > 0)
            {
                var selectNode = document.getElementById('equations-select-' + (i + 1));
                var op = selectNode.options[selectNode.selectedIndex].value;
                this.draw_graph(this.equationsIds[i], ctx, op);
                ctx.beginPath();
                ctx.closePath();
                if (this.trace.equationIndex < 0) this.trace.equationIndex = i;   //this is the first valid equation that we found to graph
            }
        }

        //Clear the text area used to show the coordinates for trace
        document.getElementById('textinput').value = '';

        //if trace is on, draw trace
        if (this.trace.flag) this.draw_Trace();

        // remove style from '#canvas', this works with the canvasElement.setAttribute() part at the beginning of this method
        if (BrowserUtils.isAndroid()) {
            canvasElement.removeAttribute('style');
        }

        return true;
    }

/* get value of range parameters
    which: xmin/ymin/xmax/ymax
*/
    GraphingCalc.prototype.getCanvasWindowRange = function(which) {
        return getFixedResult(document.getElementById(which).value);
    };

/* set a range parameter
    which: xmin/ymin/xmax/ymax
    value: integer
*/
GraphingCalc.prototype.setCanvasWindowRange =  function(which, value) 
{
    document.getElementById(which).value = value;
}

/* draw a graph
    inputElm: id of text field of the function expression
    ctx: canvas handle
    equality: = < > 
*/
GraphingCalc.prototype.draw_graph = function (inputElm, ctx, equality) {

    // keep original ^ style expression for power operation, because the translate_pow works with ^, but not pow()
    var funcTxt = this.keepPowerExp(document.getElementById(inputElm).value);

    if (funcTxt &&(funcTxt.length>0))
    {
        ctx.fillStyle = "rgba(1000, 0, 0, 0.5)";
        var prevY, xLeft, xRight;

        // using a = -1 and this.canvas + 1 instead of a = 0 and this.canvas to allow the border of shading area out of the view box 
        // and left only the expression graph line inside the view box
        for (var a = -1; a <= this.canvas_width + 1; a++)
        {
            var y;
            try {
                y = this.getFuncYbyCanvasX(a, funcTxt); //eval("x=xmin+xinc*a;" + funcTxt);
                if((y)&&(y!=Infinity)&&(y!=(-Infinity)))
                {
                    // record the left boundary of x value
                    if (!(prevY) && prevY != 0) {
                        xLeft = a;
                    }
                    var canvasY = this.getCanvasYbyFuncY(y);
                    if ((a == 0)) {
                        ctx.moveTo(a, canvasY); // this.canvas_height-(y-ymin)/yinc);
                    } else {
                        ctx.lineTo(a, canvasY); //this.canvas_height-(y-ymin)/yinc);
                    }
                    prevY = y;
                }else if ((!(y) && y!=0) && (prevY)) {
                    // record the right boundary of x value
                    xRight = a;
                    prevY = y;
                }                
            } catch (ex) {
                this.showErrorMessage(ExpressErrorMsg, inputElm);
                break;
            }
        }
        var yLeft = this.getFuncYbyCanvasX(xLeft || 0, funcTxt);
        
        /*
            (xLeft || 0,0)                                       (xRight || canvas_width, 0)
			             ------------------------------------------------
			            |                      |                         |
			            |                      |                         |
			            |                      |                         |
			            |                      |      (xRight, yRight)   |
			            |                      |    /                    |
			            |                      |   /                     |
			            |                      |  /                      |
			            |                      | /                       |
			            |                      |/                        |
			            |                      /                         |
			            |---------------------/+-------------------------|
			            |                    / |                         |
			            |                   /  |                         |
			            |                  /   |                         |
			            |                 /    |                         |
			            |                /     |                         |
			            |   (xLeft, yLeft)     |                         |
			            |                      |                         |
			            |                      |                         |
			            |                      |                         |
			            |                      |                         |
			             ------------------------------------------------
            (xLeft || 0, canvas_height)	                          (xRight || canvas_width, canvas_height)
         */

        //add shading for inequality, using '+1' '-1' to adjust the border of the shading area, or it will show up in the viewable area and confuse users
        var fillStyle = "rgba(0, 0, 2, 0.1)";
        if (equality == '>') {
            ctx.lineTo((xRight + 1) || (this.canvas_width + 1), -1);
            ctx.lineTo(xLeft || 0, -1);
            ctx.lineTo(xLeft || -1, yLeft);
            ctx.fillStyle = fillStyle;
            ctx.fill();
        } else if (equality == '<') {
            var canvasHeight = this.canvas_height;
            ctx.lineTo((xRight + 1) || (this.canvas_width + 1), canvasHeight + 1);
            ctx.lineTo(xLeft || 0, canvasHeight + 1);
            ctx.lineTo(xLeft || -1, yLeft);
            ctx.fillStyle = fillStyle;
            ctx.fill();            
        }

        // for ">" or "<" expression, use dashed line
        if (equality == '>' || equality == '<') {
            if (ctx.setLineDash) {
                ctx.setLineDash([2, 2]);
                ctx.stroke();
            } else {    // for those browsers/devices do NOT support setLineDash(), re-drawing the expression graph line with dashed line.
                for (var p = 0; p < this.canvas_width; p++) {
                    var yCanvas = this.getCanvasYbyFuncY(this.getFuncYbyCanvasX(p, funcTxt));   //graph-dot y-coordination based on the current x-coordination
                    if (p % 2 == 0) {
                        ctx.beginPath();
                        ctx.moveTo(p, yCanvas);
                    } else {
                        ctx.lineTo(p, yCanvas);
                        ctx.stroke();
                        ctx.closePath();
                    }
                }
            }
            
        } else {
            if(ctx.setLineDash)   ctx.setLineDash([0, 0]);  // restore the line to solid for "="
            ctx.stroke();
        }
        
    }
};


//draw trace
GraphingCalc.prototype.draw_Trace = function()
{
    if (this.trace.equationIndex < 0) return;  // There are no graphs plotted. Nothing to trace

    // keep original ^ style expression for power operation, because the translate_pow works with ^, but not pow()
    var func = this.keepPowerExp(document.getElementById(this.equationsIds[this.trace.equationIndex]).value);

    if (func == '') return;

    var canvasX = this.canvas_width / 2 + this.trace.offset;
    var funcY = this.getFuncYbyCanvasX(canvasX, func);
    var canvasY = this.getCanvasYbyFuncY(funcY);

    var ctx = this.getCanvasCTX(false);
    var size = 8;


    //show coordinates
    var funcX = this.getFuncXbyCanvasX(canvasX, func);
    var coorStr = 'X=' + roundingTracXYFraction(funcX) + ' , Y' + (this.trace.equationIndex + 1) + '=' + roundingTracXYFraction(funcY);
    document.getElementById('textinput').value = coorStr;
    if (this.markWithinRegion(canvasX, canvasY))
    {
        ctx.fillStyle = 'blue';
        ctx.fillRect(canvasX - size / 2, canvasY - size / 2, size, size);
    } else
    {
        //if trace is out of canvas range, then show a red square and coordinates at the previous trace point
        iterationCount = 1;
        var inRegionOffset = 0;
        while (!this.markWithinRegion(canvasX, canvasY) && iterationCount < 1000)  // we use 1000 here to prevent any sort of looping forever scenarios
        {
            if (this.trace.offset < 0)
            {
                inRegionOffset = this.trace.offset + (this.getTraceStepSize() * iterationCount);
            } else
            {
                inRegionOffset = this.trace.offset - (this.getTraceStepSize() * iterationCount);
            }
            canvasX = this.canvas_width / 2 + inRegionOffset;
            funcY = this.getFuncYbyCanvasX(canvasX, func);
            canvasY = this.getCanvasYbyFuncY(funcY);
            iterationCount++;
        }
        if (this.markWithinRegion(canvasX, canvasY))
        {
            ctx.fillStyle = 'red';
            ctx.fillRect(canvasX - size / 2, canvasY - size / 2, size, size);
        } else
        {
            // Here we are at a point where the user has clicked so far out that we are unable to find the last usable point 
            ctx.fillStyle = 'red';
            ctx.fillRect(this.canvas_width / 2, this.canvas_height - 9, size, size);
        }
    }
    function roundingTracXYFraction(realNum)
    {
        return (Math.round(realNum * 100) / 100);
    }

}
/* calcuate function y coordinate, given a canvas x and function
    canvasX: x coordinate of canvas
    func: function
*/
GraphingCalc.prototype.getFuncYbyCanvasX = function(canvasX, func) {
    var xval = this.getFuncXbyCanvasX(canvasX, func);

    // for ^ operation, we do the translate_pow here with the xval number to avoid Javascript returning NaN for negative number like Math.pow((-4), (1/3))
    if (func.indexOf('^') > -1) {
        return this.parent.evalVariableExpression(func, xval);
    }

    // for others we do not need to use evalVariableExpression, or the eval will be very slow.
    return eval('x=' + xval + ';' + func);
};

/* get function x coordinate, given a canvas X and function
    canvasX: x coordinate of canvas
    func: function
*/
GraphingCalc.prototype.getFuncXbyCanvasX = function(canvasX, func)
{
    //graphing = true;
    var xmin=this.getCanvasWindowRange('xmin')/this.zoom;
    var xmax=this.getCanvasWindowRange('xmax')/this.zoom;

    var xinc=(xmax-xmin)/this.canvas_width;
    //return (xmin+xinc*canvasX)*this.getScale('X');
    return xmin + xinc * canvasX;
}

/* get canvas Y coordinate, given a function Y
    funcY: y coordinate of a function
*/
GraphingCalc.prototype.getCanvasYbyFuncY = function(funcY)
{
    var ymin=this.getCanvasWindowRange('ymin')/this.zoom;
    var ymax=this.getCanvasWindowRange('ymax')/this.zoom;
    var yinc=(ymax-ymin)/this.canvas_height;

    //return (this.canvas_height-(funcY / this.getScale('Y')-ymin)/yinc);
    return (this.canvas_height - (funcY - ymin) / yinc);
}

/* get scaling parameter
    xy: X or Y
*/
GraphingCalc.prototype.getScale =  function(xy)
{
    if (xy == 'X') return parseFloat(document.getElementById('xscale').value);
    if (xy == 'Y') return parseFloat(document.getElementById('yscale').value);
}

// calculate xInterval and yInterval
GraphingCalc.prototype.getInterval = function(step, minDisplaySize)
{
    var interval;

    //if step length larger than minDisplaySize, devide it until size match
    if (step >= this.minDisplaySize) {
        var i = 1;
        while (true) {
            if ((step / i) <= minDisplaySize) break;
            i++;
        }
        interval = Math.round(step / i);
    } 
    
    //if step length smaller than minDisplaySize, multiple it until size match
    else {
        var i = 1;
        while (true) {
            if (step * i >= minDisplaySize) break;
            i++;
        }
        interval = step * i;
    }
    
    return interval;
}

// init canvas and mark axis
GraphingCalc.prototype.graphing_Canvas_init = function()
{
    // data window is specified by xmin, xmax, ymin, ymax. It maps to Cavas with width and height
    // CanvasX = (DataX - xmin) / xinc

    var xmin=this.getCanvasWindowRange('xmin')/this.zoom;
    var xmax=this.getCanvasWindowRange('xmax')/this.zoom;
    var ymin=this.getCanvasWindowRange('ymin')/this.zoom;
    var ymax=this.getCanvasWindowRange('ymax')/this.zoom;

   
    var ctx = this.getCanvasCTX(true);
    
    ctx.clearRect(0,0,this.canvas_width,this.canvas_height); 
    var xinc=(xmax-xmin)/this.canvas_width;
    var yinc=(ymax-ymin)/this.canvas_height;    
    
    //draw X,Y axis
    ctx.fillStyle = "rgba(100, 0, 0, 1)";
    ctx.fillRect (0, this.canvas_height-(0-ymin)/yinc-1, this.canvas_width,3);
    ctx.fillRect ((0-xmin)/xinc-1,0,3, this.canvas_height); 
    
    var xOrigin = (0-xmin)/xinc;
    var yOrigin = this.canvas_height-(0-ymin)/yinc;
    
    //the real step size 1 equals to Canvas size in stepX, stepY
    var stepX = 1/xinc;
    var stepY = 1/yinc;    

    var loopSize = 1000;
    
    //get appropriate mark distance in xInterval and yInterval. These are canvas distance
    var xInterval, yInterval;
    //var zoomInflag = true;

    var xScale = this.getScale('X');
    var yScale = this.getScale('Y');

    /**
        while scale!=1, 
        the 'step' in 'getInterval()', which will compare with minDisplaySize (= canvasWidth/10) 
        to depends interval of axises, actually should be 'step * scale'
    */
    stepX = stepX * xScale;
    stepY = stepY * yScale;

    xInterval = this.getInterval(stepX, this.xMinDisplaySize);
    
    if (stepX == stepY) yInterval = xInterval;
    else {
        yInterval = this.getInterval(stepY, this.xMinDisplaySize);
    }
    
    ctx.fillStyle = "rgba(50, 0, 1, 1)";    
    var k=0;
    //lets draw the coordinates on the x-axis.
    for (var i=xOrigin; i>(0-loopSize); i=i-xInterval) {
        ctx.fillRect(i, this.canvas_height-(0-ymin)/yinc-4, 1, 8);
        var mark = this.getAxisMark('X', i,xOrigin,stepX);
        if (mark == '0') continue;
        k++;
        if (k%2 == 0)
            this.markAxis(ctx, mark, i-5, yOrigin+12);
        else 
            this.markAxis(ctx, mark, i-5, yOrigin-6);
    }
    k=0;
    for (var i=xOrigin; i<loopSize; i=i+xInterval) {
        ctx.fillRect(i, this.canvas_height-(0-ymin)/yinc-4, 1, 8);
        var mark = this.getAxisMark('X', i,xOrigin,stepX);
        if (mark == '0') continue;
        k++;
        if (k%2 == 0)
            this.markAxis(ctx, mark, i+2, yOrigin+12); 
        else 
            this.markAxis(ctx, mark, i+2, yOrigin-6); 
    }
    //lets draw the coordinates on the y-axis.
    for (var j=yOrigin; j<loopSize; j=j+yInterval) {
        ctx.fillRect((0-xmin)/xinc-4, j, 8, 1);
        var mark = this.getAxisMark('Y', j,yOrigin,stepY);
        mark = 0-mark;
        if (mark != '0') this.markAxis(ctx, mark, xOrigin+3, j+5);
    }    
    for (var j=yOrigin; j>(0-loopSize); j=j-yInterval) {
        ctx.fillRect((0-xmin)/xinc-4, j, 8, 1);
        var mark = this.getAxisMark('Y', j,yOrigin,stepY);
        mark = 0-mark;
        //if (!((yInterval < originYLimit) && ((j-yOrigin)/yInterval == -1)))
        if (mark != '0') this.markAxis(ctx, mark, xOrigin+3, j);
    } 
}

/* get appropriate string of mark string
    xy: X/Y
    ind: distance from origin in terms of number of intervals 
    Origin: origin value
    step: stepX/stepY
*/
GraphingCalc.prototype.getAxisMark = function(xy, ind, Origin, step) 
{

        var scale = this.getScale('X');
        if (xy == 'Y') scale = this.getScale('Y');
        
        //times scale to get correct mark number
        var mark = (ind-Origin) * scale / step;
        var str  = mark + '';

        var index = str.indexOf('.');
        if (index!=-1) {
            if (str.charAt(index+1)!=0) {
                //mark = str.substring(0, index) + '.' + str.substring(index+1,index+3);
                mark = Math.round(str*100)/100;     // using str instead of trimed mark to keep it accurate
            }
            else 
                mark = str.substring(0, index);
        } else {
            mark = Math.round(mark);
        }
        return mark;
}

//write mark on axis
GraphingCalc.prototype.markAxis = function(ctx, mark, x, y)
{
    if (!this.markWithinRegion(x, y)) return;

    if ((BrowserDetect.browser == 'Firefox') || (BrowserDetect.browser == 'Mozilla'))
    {
        // Firefox 1-3
        if (((BrowserDetect.version + '').charAt(0) == '3') || ((BrowserDetect.version + '').charAt(0) == '2') || ((BrowserDetect.version + '').charAt(0) == '1'))
        {
            this.drawString(mark, x, y);
        }
        // Firefox 7 or greater
        else if (BrowserDetect.version >= 7 || (BrowserDetect.version + '').charAt(0) == 'a')
        {
            ctx.fillText(mark, x, y);
        }
        // Firefox 4-6
        else
        {
            ctx.translate(x, y);
            ctx.mozDrawText(mark);
            ctx.translate(0 - x, 0 - y);
        }
    }
    else if (BrowserDetect.browser == 'Explorer')
    {
        this.drawString(mark, x, y);
    }
    else
    {
        ctx.fillText(mark, x, y);
    }
};

GraphingCalc.prototype.drawString = function(mark, x,y) 
{
    this.textCTX.stringStyle.fontSize = 10;
    this.textCTX.drawString(x+1+'px',y-5+'px', mark);
}

// check if x,y is out of range
GraphingCalc.prototype.markWithinRegion = function(x,y) 
{
    if ((x<this.canvas_width) && (x>0) && (y<this.canvas_height) && (y>0)) return true;
    return false;
}   

//clear cavnas
GraphingCalc.prototype.calc_Clear_Graph = function()
{
    var ctx = this.getCanvasCTX(true);
    
    ctx.clearRect(0,0,canvas_width,canvas_height);
    ctx.beginPath();
    ctx.closePath();  
    this.graphing_Canvas_init();
}

//get canvas handle
GraphingCalc.prototype.getCanvasCTX = function(clearText) 
{
    var canvas = document.getElementById("canvas");
    var ctx = canvas.getContext("2d");
    
    if (this.textCTX == null) {
        var ctxController = new TextCanvas(document.getElementById('canvas-container'), 'ctncanvas');
        ctxController.setDimensions(this.canvas_width, this.canvas_height);
        this.textCTX = ctxController.getContext('2d'); 
    }
    if(clearText == true)
        this.textCTX.clear();
    return ctx;
}

GraphingCalc.prototype.showErrorMessage =  function(msg, inputarea) 
{
    if (!inputarea) inputarea = 'textinput';
    document.getElementById(inputarea).value = msg;
    inputClearFlag = true;
}

//create data tables
GraphingCalc.prototype.showGraphingTable = function(clean) 
{
    if (!this.validateGraphingData(true)) return;
    if (this.xPos==null) this.xPos = parseInt(this.getCanvasWindowRange('xmin'));

    this.cleanDataTable();
    var tableDiv = document.getElementById('datatable');
    var thead = document.createElement('thead');
    tableDiv.appendChild(thead);
    var headerTR = document.createElement('tr');
    var headerTHX = document.createElement('th');
    var headerX = document.createTextNode('X');
    headerTHX.appendChild(headerX);
    headerTR.appendChild(headerTHX);
    thead.appendChild(headerTR);
    
    for (var i=0; i<this.equationsIds.length; i++) {
        var equaTH = document.createElement('th');
        var equaTx = document.createTextNode('Y' + (i+1));
        equaTH.appendChild(equaTx);
        headerTR.appendChild(equaTH);
    }

    try {
        var thisXPos = getFixedResult(this.xPos);
        var tbody = document.createElement('tbody');
        tableDiv.appendChild(tbody);
        
        for (var i=0; i<this.numDisplayData; i++) {
            var eachRow = document.createElement('tr');
            var tdX = document.createElement('td');
            var tTx = document.createTextNode(thisXPos);
            tdX.appendChild(tTx);
            eachRow.appendChild(tdX);

            for (var j=0; j<this.equationsIds.length; j++) {
                var equaTD = document.createElement('td');
                var val = '';

                // keep original ^ style expression for power operation, because the translate_pow works with ^, but not pow()
                var func = this.keepPowerExp(document.getElementById(this.equationsIds[j]).value);
                if (func.length > 0) val = getFixedResult(this.parent.evalVariableExpression(func, thisXPos)) + '';
                if (val.indexOf('error') != -1) val = 'error';
                if (val == 'NaN') val = 'error';
                if (val.length > 10) val = val.substring(0,10);
                var equaTx = document.createTextNode(val);
                equaTD.appendChild(equaTx);
                eachRow.appendChild(equaTD);
            }
            tbody.appendChild(eachRow);
          
            thisXPos = getFixedResult(thisXPos + 1);
        }
   
    } catch (ex) {
        this.cleanDataTable();
    }
}

//clear data table
GraphingCalc.prototype.cleanDataTable = function() {
    var tableDiv = document.getElementById('datatable');
    while (tableDiv.hasChildNodes()) {
        tableDiv.removeChild(tableDiv.childNodes[0]);
    }
    return;
};

// for operation like (x)^(1/3), when we need to get different result for different x value, don't do the translate_input until we've got a fixed x value, because Javascript returns NaN for expression like Math.pow((-4), (1/3)).
// so we are using (-4)^(1/3) to do translate_input, aka translate_pow to get the actual value instead of NaN
GraphingCalc.prototype.keepPowerExp = function(exp) {
    if (exp.length > 0 && exp.indexOf('^') > -1) {
        return exp;
    } else {
        return this.parent.translate_input(exp);
    }
};
